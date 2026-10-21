'use strict';

// Response-body failures occur after execution may have started; retry identity
// must survive those failures just as it survives a rejected fetch.
const test = require('node:test');
const assert = require('node:assert/strict');
const { HttpClient } = require('../src/core/httpClient');
const { makeOperation } = require('../src/core/routeHelper');

test('lost response bodies retain the operation key for an explicit retry', async () => {
  const calls = [];
  const http = new HttpClient({ baseUrl: 'https://example.test', fetchImpl: async (url, init) => {
    calls.push(init);
    return { ok: true, status: 200, text: async () => {
      if (calls.length === 1) throw new Error('response body lost');
      return '{}';
    } };
  } });
  const first = await http.post('items', { body: { name: 'test' } });
  assert.equal(first.isError, true);
  assert.ok(first.idempotencyKey);
  await http.post('items', { body: { name: 'test' }, idempotencyKey: first.idempotencyKey });
  assert.equal(calls[0].headers['Idempotency-Key'], calls[1].headers['Idempotency-Key']);
});

test('metered GET and POST requests have one unique key and preserve route/body/auth', async () => {
  const calls = [];
  const http = new HttpClient({ baseUrl: 'https://example.test', tokenStore: { getToken: () => 'test-token' },
    fetchImpl: async (url, init) => { calls.push({url, init}); return { ok: true, status: 200, text: async () => '{}' }; } });
  const get = await http.get('items', { query: { limit: 2 } });
  const post = await http.post('items', { body: { name: 'test' } });
  assert.notEqual(get.idempotencyKey, post.idempotencyKey);
  for (const {init} of calls) {
    const headers = new Headers(init.headers);
    const key = headers.get('Idempotency-Key');
    assert.match(key, /^[!-~]{8,128}$/);
    assert.equal(key.includes(','), false);
    assert.equal(headers.get('Authorization'), 'Bearer test-token');
  }
  assert.equal(calls[0].url, 'https://example.test/items?limit=2');
  assert.equal(calls[1].init.body, '{"name":"test"}');
});

test('failed operation exposes its key and generated operations preserve it on explicit retry', async () => {
  const calls = [];
  const http = new HttpClient({ baseUrl: 'https://example.test', fetchImpl: async (url, init) => {
    calls.push(init);
    if (calls.length === 1) throw new Error('response lost');
    return { ok: true, status: 200, text: async () => '{}' };
  } });
  const operation = makeOperation(http, 'items', 'POST', '{id}');
  const first = await operation({ id: 'a', name: 'test' });
  assert.equal(first.isError, true);
  await operation({ id: 'a', name: 'test' }, { idempotencyKey: first.idempotencyKey });
  assert.equal(calls[0].headers['Idempotency-Key'], calls[1].headers['Idempotency-Key']);
  assert.equal(calls[0].body, calls[1].body);
  assert.equal(calls[1].body, '{"name":"test"}');
});

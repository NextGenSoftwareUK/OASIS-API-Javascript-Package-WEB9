'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { Web9Client } = require('../index.js');

test('health() calls GET /health without a token', async () => {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init });
    return { ok: true, status: 200, text: async () => JSON.stringify({ status: 'healthy' }) };
  };
  const client = new Web9Client({ baseUrl: 'https://example.test', persistSession: false, fetchImpl });
  client.setToken('jwt-abc');

  const res = await client.health();

  assert.equal(calls[0].url, 'https://example.test/health');
  assert.equal(calls[0].init.method, 'GET');
  assert.equal(calls[0].init.headers.Authorization, undefined);
  assert.equal(res.isError, false);
  assert.equal(res.result.status, 'healthy');
});

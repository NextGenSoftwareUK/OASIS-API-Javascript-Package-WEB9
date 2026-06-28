'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { Web9Client } = require('../index.js');

function fakeFetch(responses) {
  const calls = [];
  const impl = async (url, init) => {
    calls.push({ url, init });
    const match = responses.find((r) => url.includes(r.match));
    const body = match ? match.body : { isError: false, result: {} };
    return {
      ok: match ? match.ok !== false : true,
      status: match?.status || 200,
      text: async () => JSON.stringify(body)
    };
  };
  impl.calls = calls;
  return impl;
}

test('setToken attaches Bearer header to subsequent requests', async () => {
  const fetchImpl = fakeFetch([{ match: 'v1/singularity/status', body: { isError: false, result: { healthy: true } } }]);
  const web9 = new Web9Client({ baseUrl: 'https://example.test', persistSession: false, fetchImpl });

  web9.setToken('jwt-abc');
  const res = await web9.singularity.getUnifiedStatus();

  const call = fetchImpl.calls[0];
  assert.equal(call.init.headers.Authorization, 'Bearer jwt-abc');
  assert.equal(call.url, 'https://example.test/v1/singularity/status');
  assert.equal(call.init.method, 'GET');
  assert.equal(res.isError, false);
});

test('singularity module is attached to the client', () => {
  const web9 = new Web9Client({ baseUrl: 'https://example.test', persistSession: false, fetchImpl: fakeFetch([]) });
  assert.ok(web9.singularity, 'expected web9.singularity to be attached');
});

test('setBaseUrl updates the underlying http client', async () => {
  const fetchImpl = fakeFetch([{ match: 'v1/singularity/status', body: { isError: false, result: {} } }]);
  const web9 = new Web9Client({ baseUrl: 'https://example.test', persistSession: false, fetchImpl });

  web9.setBaseUrl('https://other.test');
  await web9.singularity.getUnifiedStatus();

  assert.equal(fetchImpl.calls[0].url, 'https://other.test/v1/singularity/status');
});

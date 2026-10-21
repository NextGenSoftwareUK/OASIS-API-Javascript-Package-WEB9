'use strict';

const DEFAULT_BASE_URL = 'https://api.web9.oasisomniverse.one';

function buildQueryString(query) {
  const entries = Object.entries(query || {}).filter(([, v]) => v !== undefined && v !== null);
  if (!entries.length) return '';
  const params = new URLSearchParams();
  for (const [key, value] of entries) {
    params.set(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
  }
  return `?${params.toString()}`;
}

/**
 * Thin isomorphic HTTP client around the global fetch API (Node 18+, all modern browsers).
 * Every WEB9 Singularity API call ultimately goes through `request()` below - there are no mocked
 * or stubbed responses anywhere in this SDK.
 */
class HttpClient {
  constructor({ baseUrl = DEFAULT_BASE_URL, tokenStore, fetchImpl = globalThis.fetch } = {}) {
    if (!fetchImpl) {
      throw new Error(
        'No global fetch implementation found. Use Node 18+, a modern browser, or pass { fetchImpl } explicitly.'
      );
    }
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.tokenStore = tokenStore;
    this._customFetch = fetchImpl !== globalThis.fetch ? fetchImpl : null;
  }

  setBaseUrl(baseUrl) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  /**
   * @param {string} verb GET | POST | PUT | DELETE
   * @param {string} path e.g. "v1/complete"
   * @param {object} [options]
   * @param {object} [options.query] query string params (GET/DELETE)
   * @param {object} [options.body] JSON body (POST/PUT/DELETE)
   * @param {boolean} [options.auth] attach Authorization: Bearer <token> (default true)
   * @param {string} [options.token] override token for this single request
   */
  async request(verb, path, { query, body, auth = true, token, idempotencyKey } = {}) {
    const url = `${this.baseUrl}/${path.replace(/^\/+/, '')}${buildQueryString(query)}`;
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      // A caller can retain this non-secret operation identifier for a retry.
      // Timestamp + randomness also supports Node 18 without global Web Crypto.
      'Idempotency-Key': idempotencyKey ?? (globalThis.crypto?.randomUUID
        ? globalThis.crypto.randomUUID()
        : `sdk-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`)
    };

    const bearer = token || (auth ? this.tokenStore?.getToken() : null);
    if (bearer) headers.Authorization = `Bearer ${bearer}`;

    const init = { method: verb, headers };
    if (body !== undefined && verb !== 'GET') init.body = JSON.stringify(body);

    let res;
    try {
      res = await (this._customFetch ? this._customFetch(url, init) : globalThis.fetch(url, init));
    } catch (err) {
      return { isError: true, message: `Network error calling ${url}: ${err.message}`, exception: err, idempotencyKey: headers['Idempotency-Key'] };
    }

    let text;
    try {
      text = await res.text();
    } catch (err) {
      // Headers may arrive after the server has executed the operation even
      // when its response body is lost. Preserve the operation identity.
      return { isError: true, message: `Response body error calling ${url}: ${err.message}`,
        exception: err, statusCode: res.status, idempotencyKey: headers['Idempotency-Key'] };
    }
    let json;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }

    if (!res.ok) {
      const message =
        json?.result?.message || json?.message || json?.title || `Request failed with status ${res.status}`;
      return { isError: true, message, statusCode: res.status, raw: json, idempotencyKey: headers['Idempotency-Key'] };
    }

    // OASIS responses are typically { isError, message, result: { isError, message, result: <payload> } }.
    // We surface the innermost payload as `.result` while keeping the full envelope available as `.raw`.
    const inner = json?.result !== undefined ? json.result : json;
    const payload = inner?.result !== undefined ? inner.result : inner;

    return {
      isError: Boolean(inner?.isError || json?.isError),
      message: inner?.message || json?.message || null,
      result: payload,
      raw: json,
      statusCode: res.status,
      idempotencyKey: headers['Idempotency-Key']
    };
  }

  get(path, options) {
    return this.request('GET', path, options);
  }

  post(path, options) {
    return this.request('POST', path, options);
  }

  put(path, options) {
    return this.request('PUT', path, options);
  }

  delete(path, options) {
    return this.request('DELETE', path, options);
  }
}

module.exports = { HttpClient, DEFAULT_BASE_URL };

'use strict';

const { HttpClient, DEFAULT_BASE_URL } = require('./core/httpClient');
const { TokenStore } = require('./core/tokenStore');
const { attachGeneratedModules } = require('./modules/index');

/**
 * Main SDK entry point. Works in Node 18+ and any modern browser.
 *
 *   const { Web9Client } = require('web9-oasis-singularity-api');
 *   const web9 = new Web9Client({ baseUrl: 'https://api.web9.oasisomniverse.one' });
 *   web9.setToken(jwtToken); // reuse a WEB4 OASIS JWT - WEB9 has no auth of its own
 *   const status = await web9.singularity.getUnifiedStatus();
 *
 * The Singularity Layer controller is reachable as `web9.singularity` -
 * a single live unified status probe across WEB4-WEB8. Generated methods
 * take a single args object; remaining keys become the query string
 * (GET/DELETE) or JSON body (POST/PUT).
 */
class Web9Client {
  constructor({ baseUrl = DEFAULT_BASE_URL, persistSession, fetchImpl } = {}) {
    this.tokenStore = new TokenStore({ persist: persistSession });
    this.http = new HttpClient({ baseUrl, tokenStore: this.tokenStore, fetchImpl });

    attachGeneratedModules(this, this.http);
  }

  setBaseUrl(baseUrl) {
    this.http.setBaseUrl(baseUrl);
  }

  /**
   * WEB9 is an internal aggregation layer sitting behind the same OASIS
   * identity as WEB4-WEB8 - it has no avatar/auth endpoints of its own.
   * Reuse a JWT you already obtained from the WEB4 OASIS API (or your own
   * backend) here.
   */
  setToken(jwtToken, sessionExtras = {}) {
    this.tokenStore.setSession({ ...sessionExtras, jwtToken });
  }
}

module.exports = { Web9Client, HttpClient, TokenStore, DEFAULT_BASE_URL };
module.exports.default = Web9Client;

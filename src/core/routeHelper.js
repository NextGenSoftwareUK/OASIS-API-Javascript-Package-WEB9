'use strict';

const TOKEN_PATTERN = /\{(\w+)(?::\w+)?\}/g;

/**
 * Resolves a route template like "get-by-id/{id}" against an args object,
 * substituting path tokens and returning the resolved path plus whatever
 * args were *not* consumed as path tokens (these become the query/body).
 */
function resolveRoute(routeTemplate, args = {}) {
  const consumed = new Set();
  const path = routeTemplate.replace(TOKEN_PATTERN, (match, name) => {
    const key = Object.keys(args).find((k) => k.toLowerCase() === name.toLowerCase());
    consumed.add(key);
    const value = key !== undefined ? args[key] : undefined;
    if (value === undefined) {
      throw new Error(`Missing required route parameter "${name}" for route "${routeTemplate}"`);
    }
    return encodeURIComponent(value);
  });

  const rest = {};
  for (const [key, value] of Object.entries(args)) {
    if (!consumed.has(key)) rest[key] = value;
  }

  return { path, rest };
}

function takeKey(obj, name) {
  const matchKey = Object.keys(obj).find((k) => k.toLowerCase() === name.toLowerCase());
  if (matchKey === undefined) return { found: false, value: undefined };
  const value = obj[matchKey];
  delete obj[matchKey];
  return { found: true, value };
}

/**
 * Builds a bound method for a single WEB9 endpoint operation.
 * @param {import('./httpClient').HttpClient} http
 * @param {string} routePrefix e.g. "api/avatar"
 * @param {string} verb GET | POST | PUT | DELETE
 * @param {string} route route template relative to routePrefix, e.g. "get-by-id/{id}"
 * @param {object} [opts]
 * @param {string[]} [opts.query] arg names that ASP.NET binds from the query
 *   string on this action regardless of HTTP verb (e.g. `[FromQuery]` flags
 *   mixed into an otherwise-body-bound POST/PUT action). Always sent as query.
 * @param {string} [opts.bodyParam] when the action's entire request body is a
 *   single `[FromBody]` parameter (primitive or object), the JSON body is
 *   that arg's value directly rather than the leftover-args object wrapped
 *   around it.
 */
function makeOperation(http, routePrefix, verb, route, opts = {}) {
  const declaredQueryKeys = opts.query || [];
  const bodyParam = opts.bodyParam;

  return async function operation(args = {}) {
    const { path, rest } = resolveRoute(route, args);
    const fullPath = path ? `${routePrefix}/${path}` : routePrefix;

    const query = {};
    for (const key of declaredQueryKeys) {
      const { found, value } = takeKey(rest, key);
      if (found) query[key] = value;
    }

    let body;
    if (bodyParam) {
      const { found, value } = takeKey(rest, bodyParam);
      if (found) body = value;
      // Any args left over that we don't recognize still get sent (as query)
      // rather than silently dropped.
      Object.assign(query, rest);
    } else if (verb === 'GET' || verb === 'DELETE') {
      Object.assign(query, rest);
    } else {
      body = Object.keys(rest).length ? rest : undefined;
    }

    const hasQuery = Object.keys(query).length > 0;
    return http.request(verb, fullPath, { query: hasQuery ? query : undefined, body });
  };
}

module.exports = { resolveRoute, makeOperation };

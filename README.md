# @oasisomniverse/web9-api

Isomorphic (Node 18+ and browser) JavaScript/TypeScript-friendly client for the
**WEB9 OASIS Singularity API** - one unified, live status view aggregated
across every other OASIS layer (WEB4-WEB8), built on the OASIS2 WEB9 WebAPI.
"The network observing itself."

Zero dependencies. Wraps the global `fetch`. Works the same in Node and the
browser.

## Installation

```bash
npm install @oasisomniverse/web9-api
```

## Quick start

```js
const { Web9Client } = require('@oasisomniverse/web9-api');
// or: import { Web9Client } from '@oasisomniverse/web9-api';

const web9 = new Web9Client({ baseUrl: 'https://api.web9.oasisomniverse.one' });

const { isError, message, result } = await web9.singularity.getUnifiedStatus();
if (isError) throw new Error(message);
console.log(result); // unified status across WEB4-WEB8
```

Every response has the shape:

```ts
interface OASISResponse<T = any> {
  isError: boolean;
  message: string | null;
  result: T;
  raw: any;
  statusCode: number;
}
```

## Auth

WEB9 is an internal aggregation layer that sits behind the same OASIS avatar
identity as WEB4-WEB8 - it has no avatar/login endpoints of its own. Reuse a
JWT you've already obtained elsewhere (e.g. from `web4-oasis-api`'s
`client.auth.login()`):

```js
web9.setToken(jwtToken);
```

## Module reference

1 module, 1 operation. Full reference lives in [`docs/`](./docs/README.md).

| Client property | Route prefix | Operations |
| --- | --- | --- |
| `web9.singularity` | `v1/singularity` | 1 |

## Regenerating

The generated module, type declarations and docs are produced from
`endpoints.json` (extracted from the WEB9 WebAPI controller source):

```bash
npm run generate   # src/modules/*.js + src/modules/index.js
npm run types      # src/modules/*.d.ts + index.d.ts + src/core/types.d.ts
npm run docs       # docs/README.md + docs/modules/*.md
```

## Testing

```bash
npm test
```

## License

MIT

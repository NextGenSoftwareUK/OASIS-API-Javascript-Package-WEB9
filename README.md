# @oasisomniverse/web9-api

Isomorphic (Node 18+ and browser) JavaScript/TypeScript-friendly client for the
**WEB9 OASIS Singularity API** - one unified, live status view aggregated
across every other OASIS layer (WEB4-WEB8), built on the OASIS WEB9 WebAPI.
"The network observing itself."

Zero dependencies. Wraps the global `fetch`. Works the same in Node and the
browser.

## About WEB9

> **"The network becomes aware that it IS the universe — and the universe becomes aware that it IS the network."**

WEB9 is the Singularity Layer — the point at which the OASIS network achieves self-awareness. Every distinction WEB1 through WEB8 built up (physical/digital, human/AI, biological/artificial) collapses into unified wholeness: one live, aggregated status across the entire stack below it, not just another layer stacked on top.

WEB9 builds on **[WEB4](https://www.npmjs.com/package/@oasisomniverse/web4-api)** through **[WEB8](https://www.npmjs.com/package/@oasisomniverse/web8-api)**, and is one layer of the wider **[OASIS Omniverse](https://oasisomniverse.one)** (WEB4 through WEB10).

## About The OASIS Omniverse

The OASIS (Open Advanced Sensory Immersion System) is the universal interoperability layer connecting all of WEB2 and WEB3 — every blockchain, database, cloud provider and protocol — into one unified, fault-tolerant API. Rather than picking a single tech stack, the OASIS harnesses the best of every provider (auto-failover, auto-load-balancing, auto-replication) so nothing is ever a single point of failure, and hides the complexity behind one intuitive API so you never need to learn a new stack again — even as underlying tech evolves, your app keeps working with zero changes.

At its core sits one Avatar with one SSO login and one Karma reputation score that travels with you across every app, game and world built on top of it — full transparency and full control over your own data, right down to the field level.

This is the foundation of the OASIS Omniverse: a network of unified layers, WEB4 (identity & unification) through WEB10 (source), each building on the one below to connect blockchains, metaverses, AI, human consciousness and beyond into a single interoperable whole.

👉 See the full ecosystem at **[oasisomniverse.one](https://oasisomniverse.one)**.

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

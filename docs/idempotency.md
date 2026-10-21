# Request identity and retries

The HTTP client sends exactly one `Idempotency-Key` for each request. WEB5–WEB10 metered operations require this header. Ordinary reads can ignore it. Keys identify work; they are not credentials.

The returned key is retained on HTTP errors, fetch failures, and failures while reading the response body. A lost body does not prove the server failed to execute the operation.

For an explicit retry, retain the key returned with the first result and pass it as the generated operation's second argument:

```js
const first = await client.someModule.someOperation(args);
// Only retry/reconcile the same operation, with identical arguments and identity.
const retry = await client.someModule.someOperation(args, {
  idempotencyKey: first.idempotencyKey
});
```

The low-level client accepts the same option:

```js
await client.http.post(path, { body, idempotencyKey: operationKey });
```

The SDK does not automatically replay failed provider requests. A pending/previously executed operation can return status or a conflict rather than replaying its original business response. After a timeout or settlement-pending response, keep the key and inspect the operation/resource status; using a fresh key asks for new work and can incur another charge. Existing one-argument operation calls continue to work.

# Singularity — `web9.singularity`

Source controller: [`SingularityController.cs`](https://github.com/NextGenSoftwareUK/OASIS/blob/main/WEB9/NextGenSoftware.OASIS.Web9.WebAPI/Controllers/SingularityController.cs)
Route prefix: `v1/singularity`
1 operation(s).

Every method takes a single args object: any key matching a `{token}` in the route is substituted into the URL; everything else becomes the query string (GET/DELETE) or JSON body (POST/PUT). Every call resolves to the standard OASIS envelope:

```ts
{
  isError: boolean;
  isWarning: boolean;
  message: string;
  errorCode?: string;
  result: T; // see each endpoint's Response section below
}
```

## Operations

### `getUnifiedStatus`

Probes WEB4-WEB8 in parallel and returns one unified status report - "the network observing itself".

**GET** `v1/singularity/status`

**Request**

No request body.

**Response**

Standard `OASISResult` envelope (see top of this page) with:

`result` type: `UnifiedStatusReport`

| Field | Type |
| --- | --- |
| `Layers` | `List<LayerStatus>` |
| `AllLayersHealthy` | `bool` |
| `HealthyLayerCount` | `int` |
| `TotalLayerCount` | `int` |
| `GeneratedUtc` | `DateTime` |

**Example**

```js
const { isError, message, result } = await web9.singularity.getUnifiedStatus({});
if (isError) throw new Error(message);
console.log(result);
```

Example response:

```json
{
  "isError": false,
  "message": "",
  "result": { "Layers": [{ "LayerName": "example string", "BaseUrl": "example string", "IsReachable": true, "ResponseTimeMs": 1.0, "Metrics": { "<string>": "example string" }, "Error": "example string", "CheckedUtc": "2026-01-01T00:00:00Z" }], "AllLayersHealthy": true, "HealthyLayerCount": 1, "TotalLayerCount": 1, "GeneratedUtc": "2026-01-01T00:00:00Z" }
}
```


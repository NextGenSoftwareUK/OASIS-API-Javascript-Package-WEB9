# Singularity — `web9.singularity`

Source controller: [`SingularityController.cs`](https://github.com/NextGenSoftwareUK/OASIS2/blob/main/WEB9/NextGenSoftware.OASIS.Web9.WebAPI/Controllers/SingularityController.cs)
Route prefix: `v1/singularity`
1 operation(s).

All methods are generated 1:1 from the controller's real `[Http*]` routes (see
[Conventions](../README.md#calling-any-endpoint)). They take a single args
object: any key matching a `{token}` in the route is substituted into the
URL; everything else becomes the query string (GET/DELETE) or JSON body
(POST/PUT).

## Methods

| Method | HTTP | Route | Route params | Query params | Body |
| --- | --- | --- | --- | --- | --- |
| `getUnifiedStatus` | GET | `v1/singularity/status` | – | – | – |

## Example

```js
const web9 = new Web9Client({ baseUrl: '...' });
web9.setToken(jwtToken); // reuse a WEB4 JWT

const { isError, message, result } = await web9.singularity.getUnifiedStatus({});
if (isError) throw new Error(message);
console.log(result);
```

# Usage

1. Import the class `Diplodocus`.
1. Create an instance.
1. Call the method `handler(request: Request)`.

```ts
// server.ts
import { Diplodocus } from "https://pax.deno.dev/kawarimidoll/deno-diplodocus";

const diplodocus = new Diplodocus();

const listener = Deno.listen({ port: 8080 });
const { hostname, port } = listener.addr;
console.log(`HTTP server listening on http://${hostname}:${port}`);

async function handleConn(conn: Deno.Conn) {
  const httpConn = Deno.serveHttp(conn);
  for await (const e of httpConn) {
    e.respondWith(diplodocus.handler(e.request));
  }
}

for await (const conn of listener) {
  handleConn(conn);
}
```

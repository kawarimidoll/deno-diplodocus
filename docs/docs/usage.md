# Usage

1. Import the class `Diplodocus`.
1. Create an instance.
1. Call the method `handler(request: Request)`.

```ts
// server.ts
import { Diplodocus } from "https://deno.land/x/diplodocus/mod.ts";

const diplodocus = new Diplodocus();

const port = 8080;
const listener = Deno.listen({ port });
console.log(`HTTP server listening on http://localhost:${port}`);

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

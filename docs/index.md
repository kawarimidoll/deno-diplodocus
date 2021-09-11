---
toc: false
---

# Diplodocus

Diplodocus is Static Assets Serving System for
[Deno Deploy](https://deno.com/deploy).

"Diplodocus" sounds like "Deploy docs" a little...?

- Serve the assets on the GitHub repository
- Parse the Markdown files to HTML pages

[View source on GitHub](https://github.com/kawarimidoll/deno-diplodocus)

## Quick start

```ts
import { Diplodocus } from "https://pax.deno.dev/kawarimidoll/diplodocus";

const diplodocus = new Diplodocus();

const listener = Deno.listen({ port: 8080 });
if (!Deno.env.get("DENO_DEPLOYMENT_ID")) {
  const { hostname, port } = listener.addr;
  console.log(`HTTP server listening on http://${hostname}:${port}`);
}

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

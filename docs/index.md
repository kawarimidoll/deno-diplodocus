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

Create `docs` directly.

```sh
├── docs/
│  ├── about.md
│  ├── index.md
│  └── pages/
│     ├── 01.md
│     ├── 02.md
│     └── 03.md
└── server.ts
```

Add links in `index.md`.

```md
# index
- [about](/about)
- [page 01](/page/01)
- [page 02](/page/02)
- [page 03](/page/03)
```

Create `server.ts` like this.

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

Run `server.ts` and access to the local server.

```sh
$ deplyctl run ./server.ts
$ # deno run --allow-net --allow-read --no-check ./server.ts
```

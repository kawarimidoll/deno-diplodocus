---
toc: false
---

# Diplodocus

Diplodocus is Static Assets Serving System for
[Deno Deploy](https://deno.com/deploy).

"Diplodocus" sounds like "Deploy docs" a little...?

- Serve the assets on the GitHub repository
- Parse the Markdown files to HTML pages

## Quick start

Create `docs` directly and some markdown pages.

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
import { Diplodocus } from "https://deno.land/x/diplodocus/mod.ts";

const diplodocus = await Diplodocus.load();

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

Run `server.ts` and access to the local server. You can use `deno run` or
[deployctl](https://github.com/denoland/deployctl).

```sh
$ deno run --allow-net --allow-read ./server.ts
$ # deplyctl run ./server.ts
```

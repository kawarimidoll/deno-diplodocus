/// <reference path="./_deploy.d.ts" />

import { Diplodocus } from "./mod.ts";

const diplodocus = await Diplodocus.load("./diplodocus.json");

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

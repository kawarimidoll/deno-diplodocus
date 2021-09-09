/// <reference path="./_deploy.d.ts" />

const listener = Deno.listen({ port: 8080 });
if (!Deno.env.get("DENO_DEPLOYMENT_ID")) {
  const { hostname, port } = listener.addr;
  console.log(`HTTP server listening on http://${hostname}:${port}`);
}

async function handleConn(conn: Deno.Conn) {
  const httpConn = Deno.serveHttp(conn);
  for await (const e of httpConn) {
    e.respondWith(handler(e.request, conn));
  }
}

async function handler(request: Request, conn: Deno.Conn) {
  const { href, origin, host, pathname, hash, search } = new URL(request.url);
  console.log({ href, origin, host, pathname, hash, search });

  const readme = await Deno.readTextFile("./README.md");

  return new Response(readme, {
    headers: {
      "x-localaddr": `${conn.localAddr.hostname}:${conn.localAddr.port}`,
      "x-remoteaddr": `${conn.remoteAddr.hostname}:${conn.remoteAddr.port}`,
    },
  });
}

for await (const conn of listener) {
  handleConn(conn);
}

/// <reference path="./_deploy.d.ts" />

import { Marked } from "./deps.ts";

const MIME_TYPES: Record<string, string> = {
  avif: "image/avif",
  css: "text/css",
  gif: "image/gif",
  gz: "application/gzip",
  htm: "text/html",
  html: "text/html",
  yml: "text/yaml",
  yaml: "text/yaml",
  ico: "image/x-icon",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  js: "application/javascript",
  xml: "application/xml",
  toml: "application/toml",
  json: "application/json",
  jsx: "text/jsx",
  map: "application/json",
  md: "text/markdown",
  mjs: "application/javascript",
  png: "image/png",
  apng: "image/apng",
  bmp: "image/bmp",
  svg: "image/svg+xml",
  ts: "text/typescript",
  tsx: "text/tsx",
  txt: "text/plain",
  wasm: "application/wasm",
  webp: "image/webp",
};

const sourceDir = "docs";

const listener = Deno.listen({ port: 8080 });
if (!Deno.env.get("DENO_DEPLOYMENT_ID")) {
  const { hostname, port } = listener.addr;
  console.log(`HTTP server listening on http://${hostname}:${port}`);
}

async function handleConn(conn: Deno.Conn) {
  const httpConn = Deno.serveHttp(conn);
  for await (const e of httpConn) {
    e.respondWith(handler(e.request));
  }
}

async function handler(request: Request) {
  const url = new URL(request.url);
  const { href, origin, host, hash, search } = url;
  let { pathname } = url;

  console.log({ href, origin, host, pathname, hash, search });

  if (pathname === "/") {
    pathname += "index.md";
  } else if (pathname.endsWith("/")) {
    return new Response("302: Found", {
      status: 302,
      headers: { location: pathname.replace(/\/$/, "") },
    });
  }

  let ext = pathname.includes(".") ? pathname.split(".").at(-1) : "";
  if (!ext) {
    pathname += ".md";
    ext = "md";
  }

  let mimeType = MIME_TYPES[ext];

  console.log({ pathname, ext, mimeType });
  if (!mimeType) {
    return new Response("400: Bad request.", { status: 400 });
  }

  const filePath = `${sourceDir}${pathname}`;
  console.log({ pathname, ext, filePath });

  try {
    let data: BodyInit = await Deno.readFile(filePath);

    if (ext === "md") {
      data = Marked.parse(new TextDecoder().decode(data)).content;
      mimeType = MIME_TYPES.html;
    }

    return new Response(data, {
      headers: { "content-type": mimeType },
    });
  } catch (error) {
    console.error(error);

    const subject = `${error}`.split(":")[0];
    if (subject === "NotFound") {
      return new Response("404: Not found", { status: 404 });
    }

    return new Response("500: Internal server error", { status: 500 });
  }
}

for await (const conn of listener) {
  handleConn(conn);
}

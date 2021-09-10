/// <reference path="./_deploy.d.ts" />

import { httpStatusText, lookupMimeType, Marked } from "./deps.ts";

function genResponseArgs(
  status: number,
  init?: ResponseInit,
): [BodyInit, ResponseInit] {
  const statusText = `${httpStatusText(status)}`;
  return [`${status}: ${statusText}`, { ...(init || {}), status, statusText }];
}

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

async function readData(filePath: string, parseMd = false): Promise<BodyInit> {
  try {
    const data = await Deno.readFile(filePath);

    if (filePath.endsWith(".md") && parseMd) {
      return Marked.parse(new TextDecoder().decode(data)).content;
    }

    return data;
  } catch (error) {
    const subject = `${error}`.split(":")[0];

    if (subject === "NotFound" && filePath.endsWith(".html")) {
      return readData(filePath.replace("html", "md"), true);
    }

    // in other cases, throw error transparency
    throw error;
  }
}

async function handler(request: Request) {
  const url = new URL(request.url);
  const { href, origin, host, hash, search } = url;
  let { pathname } = url;

  console.log({ href, origin, host, pathname, hash, search });

  if (pathname === "/") {
    pathname += "index";
  } else if (pathname.endsWith("/")) {
    return new Response(
      ...genResponseArgs(302, {
        headers: { location: pathname.slice(0, -1) },
      }),
    );
  }

  const tailPath = pathname.split("/").at(-1) || "";
  let ext = tailPath.includes(".") ? tailPath.split(".").at(-1) : "";

  if (!ext) {
    pathname += ".html";
    ext = "html";
  }

  const mimeType = lookupMimeType(ext);
  const filePath = `${sourceDir}${pathname}`;

  console.log({ pathname, ext, mimeType, filePath });

  if (!mimeType) {
    return new Response(...genResponseArgs(400));
  }

  try {
    const data = await readData(filePath);

    return new Response(data, {
      headers: { "content-type": mimeType },
    });
  } catch (error) {
    console.error(error);

    const subject = `${error}`.split(":")[0];
    if (subject === "NotFound") {
      return new Response(...genResponseArgs(404));
    }

    return new Response(...genResponseArgs(500));
  }
}

for await (const conn of listener) {
  handleConn(conn);
}

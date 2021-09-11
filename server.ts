/// <reference path="./_deploy.d.ts" />
import {
  httpStatusText,
  lookupMimeType,
  Marked,
  Renderer,
  tag as h,
} from "./deps.ts";

class MyRenderer extends Renderer {
  declare options;

  heading(text: string, level: number) {
    const id = String(text).trim().toLocaleLowerCase().replace(/\s+/g, "-");
    return `<h${level} id="${id}">${text}</h${level}>`;
  }
}

Marked.setOptions({
  renderer: new MyRenderer(),
});

function genResponseArgs(
  status: number,
  init?: ResponseInit,
): [BodyInit, ResponseInit] {
  const statusText = `${httpStatusText(status)}`;
  return [`${status}: ${statusText}`, { ...(init || {}), status, statusText }];
}

const defaultConfig = {
  sourceDir: "docs",
  siteName: "diplodocus",
  navLinks: [] as Array<NavLink>,
  listPages: [] as Array<ListPage>,
};
type NavLink = {
  title: string;
  path?: string;
  items?: Array<NavLink>;
};
type ListPage = {
  title: string;
  path: string;
  items: Array<PageLink>;
};
type PageLink = {
  title: string;
  path: string;
};
type PageMeta = {
  prev?: PageLink;
  next?: PageLink;
  date?: string;
  tag?: Array<string>;
};

type Config = typeof defaultConfig;
type UserConfig = Partial<Config>;

async function getConfig(path: string): Promise<Config> {
  let userConfig: UserConfig = {};
  try {
    userConfig = JSON.parse(await Deno.readTextFile(path)) as UserConfig;
  } catch (error) {
    console.warn("getConfig failed");
    console.warn(error);
  }
  return { ...defaultConfig, ...userConfig };
}

const {
  sourceDir,
  siteName,
  navLinks,
  listPages,
} = await getConfig("./diplodocus.json");

function genNavbar(links: Array<NavLink>): string {
  return h(
    "ul",
    ...links.map(({ path, title, items }) =>
      items
        ? h("li", h("span", title), genNavbar(items))
        : h("li", h("a", { href: path || "#" }, title))
    ),
  );
}

const storedPages: Record<string, string> = {};
type Neighbors = {
  prev?: PageLink;
  next?: PageLink;
};
const pageNeighbors: Record<string, Neighbors> = {};
listPages.forEach(({ title, path, items }) => {
  // generate list pages
  storedPages[`${sourceDir}${path}.md`] = "# " + title + "\n" +
    items.map(({ title, path }) => `- [${title}](${path})`).join("\n");

  items.forEach(({ path }, idx) => {
    const filePath = `${sourceDir}${path}.md`;

    pageNeighbors[filePath] = {};

    if (items[idx - 1]) {
      pageNeighbors[filePath].prev = items[idx - 1];
    }
    if (items[idx + 1]) {
      pageNeighbors[filePath].next = items[idx + 1];
    }
  });
});

console.log({ listPages, storedPages, pageNeighbors });

function prismJs(path: string) {
  return `https://cdn.jsdelivr.net/npm/prismjs@1.24.1/${path}`;
}
function renderPage(content: string, _meta: PageMeta): string {
  return "<!DOCTYPE html>" +
    h(
      "html",
      h(
        "head",
        h("meta", { charset: "UTF-8" }),
        h("title", siteName),
        h("meta", {
          name: "viewport",
          content: "width=device-width,initial-scale=1.0,minimum-scale=1.0",
        }),
        h("link", {
          rel: "icon",
          // type: "image/png",
          href: "https://twemoji.maxcdn.com/v/13.1.0/72x72/1f4e6.png",
        }),
        h("link", {
          rel: "stylesheet",
          href: "https://cdn.jsdelivr.net/npm/holiday.css@0.9.8",
        }),
        h("link", {
          rel: "stylesheet",
          href: prismJs("themes/prism-tomorrow.css"),
          integrity: "sha256-0dkohC9ZEupqWbq0hS5cVR4QQXJ+mp6N2oJyuks6gt0=",
          crossorigin: "anonymous",
        }),
      ),
      h(
        "body",
        h(
          "header",
          h("h1", { id: "site-name" }, h("a", { href: "/" }, siteName)),
          h("div", "this is description"),
        ),
        h("nav", { id: "header-nav" }, genNavbar(navLinks)),
        h("main", content),
        h(
          "footer",
          "Powered by ",
          h(
            "a",
            { href: "https://github.com/kawarimidoll/deno-diplodocus" },
            "diplodocus",
          ),
        ),
        h("script", {
          src: prismJs("components/prism-core.min.js"),
          integrity: "sha256-dz05jjFU9qYuMvQQlE6iWDtNAnEsmu6uMb1vWhKdkEM=",
          crossorigin: "anonymous",
          defer: "defer",
        }),
        h("script", {
          src: prismJs("plugins/autoloader/prism-autoloader.min.js"),
          integrity: "sha256-sttoa+EIAvFFfeeIkmPn8ypyOOb6no2sZ2NbxtBXgqU=",
          crossorigin: "anonymous",
          defer: "defer",
        }),
      ),
    );
}

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
  console.log({ filePath, parseMd });
  const storedPage = storedPages[filePath];
  if (storedPage) {
    const { content, meta } = Marked.parse(storedPage);
    console.log({ meta });
    return renderPage(content, meta);
  }

  try {
    const data = await Deno.readFile(filePath);

    if (filePath.endsWith(".md") && parseMd) {
      let md = new TextDecoder().decode(data);
      const neighbors = pageNeighbors[filePath];
      if (neighbors?.prev) {
        md += "\n" + `- [${neighbors.prev.title}](${neighbors.prev.path})`;
      }
      if (neighbors?.next) {
        md += "\n" + `- [${neighbors.next.title}](${neighbors.next.path})`;
      }
      const { content, meta } = Marked.parse(md);
      console.log({ meta });

      return renderPage(content, meta);
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

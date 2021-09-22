import { tag as h } from "./deps.ts";
import { Marked } from "./marked.ts";
import { Config, NavLink, PageMeta } from "./mod.ts";
import { aTag, getH1, toTitle } from "./util.ts";

export function genNavbar(links: Array<NavLink>): string {
  return h(
    "ul",
    ...links.map(({ path, title, items }) => {
      path ||= "#";
      title ||= toTitle(path);

      return items
        ? h("li", h("span", title), genNavbar(items))
        : h("li", aTag({ href: path }, title));
    }),
  );
}

export function prismJs(path: string, integrity: string) {
  let tagName = "link";
  const cdnHost = "https://cdn.jsdelivr.net/npm/prismjs@1.24.1/";
  const attr: Record<string, string | boolean> = {
    crossorigin: "anonymous",
    integrity,
  };
  if (path.endsWith("css")) {
    attr.rel = "stylesheet";
    attr.href = `${cdnHost}${path}`;
  } else {
    tagName = "script";
    attr.src = `${cdnHost}${path}`;
    attr.defer = true;
  }

  return h(tagName, attr);
}

export function renderPage(
  {
    content,
    pageMeta,
    siteMeta,
    pageUrl,
  }: {
    content: string;
    pageMeta: PageMeta;
    siteMeta: Config;
    pageUrl: string;
  },
): string {
  const {
    lang,
    siteName,
    description,
    navLinks,
    favicon,
    image,
    twitter,
    removeDefaultStyles,
    bottomHead,
    bottomBody,
    tocLevels,
    prev,
    next,
    title,
  } = { ...siteMeta, ...pageMeta };

  let tocMd = "";
  const levels = tocLevels.join("").replace(/[^1-6]/g, "");

  if (levels) {
    const regex = new RegExp(
      `<h([${levels}]) [^>]*id="([^"]+)"[^>]*>(.*?)<\/h[${levels}]>`,
      "g",
    );
    let minLevel = 6;

    tocMd = (content.match(regex) || []).map((matched) => {
      const [levelStr, id] = (matched.replace(regex, "$1 $2") || "").split(" ");
      const level = Number(levelStr);
      if (level < minLevel) {
        minLevel = level;
      }
      const text = matched.replace(/<[^>]*>/g, "");
      return `${"  ".repeat(level)}- [${text}](#${id})`;
    }).map((str) => str.slice(minLevel * 2)).join("\n");
  }
  const tocHtml = Marked.parse(tocMd).content;
  console.log({ tocMd, pageMeta, tocHtml });

  const viewport = "width=device-width,initial-scale=1.0,minimum-scale=1.0";

  const pageTitle = title || getH1(content);
  const htmlTitle = pageTitle && pageTitle != siteName
    ? pageTitle + " | " + siteName
    : siteName;
  const style = "#table-of-contents{margin:2rem;margin-bottom:0;}" +
    "#neighbors{display:flex;margin-bottom:1rem}" +
    "#neighbors>#prev,#neighbors>#next{display:block;width:50%}" +
    "#neighbors>#next{margin-left:auto}" +
    "#neighbors>#prev::before{content:'« '}#neighbors>#next::after{content:' »'}" +
    ".feather{width:.8rem;height:.8rem;stroke:var(--text-color);stroke-width:2;" +
    "stroke-linecap:round;stroke-linejoin:round;fill:none;" +
    "display:inline-block;margin:0 .05rem 0 .15rem;vertical-align:-.1em;}";
  const isRoot = /^https?:\/\/[^\/]+\/?$/.test(pageUrl);
  const pageType = isRoot ? "website" : "article";

  return "<!DOCTYPE html>" +
    h(
      "html",
      { lang },
      h(
        "head",
        h("meta", { charset: "UTF-8" }),
        h("title", htmlTitle),
        h("meta", { name: "viewport", content: viewport }),
        h("meta", { name: "description", content: description }),
        h("link", { rel: "icon", href: favicon }),
        h("meta", { property: "og:url", content: pageUrl }),
        h("meta", { property: "og:type", content: pageType }),
        h("meta", { property: "og:title", content: htmlTitle }),
        h("meta", { property: "og:description", content: description }),
        h("meta", { property: "og:site_name", content: siteName }),
        h("meta", { property: "og:image", content: image }),
        h("meta", { name: "twitter:card", content: "summary" }),
        h("meta", { name: "twitter:site", content: twitter }),
        removeDefaultStyles ? "" : h("link", {
          rel: "stylesheet",
          href: "https://cdn.jsdelivr.net/npm/holiday.css@0.9.8",
        }) + prismJs(
          "themes/prism-tomorrow.css",
          "sha256-0dkohC9ZEupqWbq0hS5cVR4QQXJ+mp6N2oJyuks6gt0=",
        ) + h("style", style),
        bottomHead || "",
      ),
      h(
        "body",
        h("header", h("h1", aTag({ href: "/" }, siteName))),
        h("nav", { id: "header-nav" }, genNavbar(navLinks)),
        tocHtml
          ? h(
            "details",
            { id: "table-of-contents" },
            h("summary", "Table of contents"),
            tocHtml,
          )
          : "",
        h("main", content),
        h(
          "footer",
          h(
            "div",
            { id: "neighbors" },
            prev ? aTag({ id: "prev", href: prev.path }, prev.title) : "",
            next ? aTag({ id: "next", href: next.path }, next.title) : "",
          ),
          h(
            "div",
            "Powered by ",
            aTag(
              { href: "https://github.com/kawarimidoll/deno-diplodocus" },
              "diplodocus",
            ),
          ),
        ),
        removeDefaultStyles ? "" : prismJs(
          "components/prism-core.min.js",
          "sha256-dz05jjFU9qYuMvQQlE6iWDtNAnEsmu6uMb1vWhKdkEM=",
        ) + prismJs(
          "plugins/autoloader/prism-autoloader.min.js",
          "sha256-sttoa+EIAvFFfeeIkmPn8ypyOOb6no2sZ2NbxtBXgqU=",
        ),
        bottomBody || "",
      ),
    );
}

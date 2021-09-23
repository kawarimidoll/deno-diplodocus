import { httpStatusText, tag as h } from "./deps.ts";

export function toTitle(str: string): string {
  str = str.replace(/\/|-|_/g, " ").trim();
  const [first, ...rest] = [...str.toLowerCase()];
  return [first.toUpperCase(), ...rest].join("");
}

export function getH1(content: string) {
  const h1 = content.match(/<h1[^>]*>(.*?)<\/h1>/)?.at(1) || "";
  return h1.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function aTag(
  attributes: Record<string, string | number | boolean>,
  ...children: string[]
) {
  const { href } = attributes;
  if (typeof href !== "string") {
    throw new Error("href must be a string");
  }
  if (/^https?:\/\//.test(href)) {
    attributes.target = "_blank";
    attributes.rel = "noopener noreferrer";

    // external-link icon by feather icons
    // https://github.com/feathericons/feather#svg-sprite
    children.push(
      h(
        "svg",
        {
          xmlns: "http://www.w3.org/2000/svg",
          viewBox: "0 0 24 24",
          class: "feather",
        },
        h("path", {
          d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",
        }),
        h("polyline", { points: "15 3 21 3 21 9" }),
        h("line", { x1: "10", y1: "14", x2: "21", y2: "3" }),
      ),
    );
  } else if (!href.startsWith("/") && !href.startsWith("#")) {
    attributes.href = "/" + href;
  }
  return h("a", attributes, ...children);
}

export function genResponseArgs(
  status: number,
  init?: ResponseInit,
): [BodyInit, ResponseInit] {
  const statusText = `${httpStatusText(status)}`;
  return [`${status}: ${statusText}`, { ...(init || {}), status, statusText }];
}

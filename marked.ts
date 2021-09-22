import { Marked, Renderer, tag as h } from "./deps.ts";
import { aTag } from "./util.ts";

// https://github.com/ts-stack/markdown/blob/5b6145bf713b928b510770df8ee57d3d48d36b9c/projects/markdown/src/renderer.ts
class MyRenderer extends Renderer {
  heading(text: string, level: number) {
    const id = String(text)
      .replace(/^(<.+?>)+/, "")
      .replace(/(<[^>]+>)+$/, "")
      .replace(/\s+|(<[^>]*>)+/g, "-")
      .trim().toLocaleLowerCase();
    return h(`h${level}`, { id }, text);
  }

  link(href: string, title: string, text: string): string {
    return aTag({ href, title: title || false }, text);
  }

  image(src: string, title: string, alt: string): string {
    const loading = "lazy";
    return h("figure", h("img", { src, alt, title: title || false, loading }));
  }

  text(text: string): string {
    return /^https?:\/\//.test(text) ? aTag({ href: text }, text) : text;
  }
}

Marked.setOptions({ renderer: new MyRenderer() });

export { Marked };

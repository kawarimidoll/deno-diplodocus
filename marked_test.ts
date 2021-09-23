import { assertEquals } from "./deps.ts";
import { Marked } from "./marked.ts";

Deno.test("[Marked] header", () => {
  assertEquals(
    Marked.parse("# header 1").content,
    `<h1 id="header-1">header 1</h1>`,
  );
});

Deno.test("[Marked] image", () => {
  assertEquals(
    Marked.parse("![image](image.png)").content,
    `<p><figure><img src="image.png" alt="image" loading="lazy"></figure></p>` +
      "\n",
  );
});

Deno.test("[Marked] external link", () => {
  assertEquals(
    Marked.parse("[GitHub](https://github.com)").content,
    `<p><a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="feather"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg></a></p>` +
      "\n",
  );
});

Deno.test("[Marked] normal text", () => {
  assertEquals(
    Marked.parse("github.com").content,
    `<p>github.com</p>` + "\n",
  );
});

Deno.test("[Marked] auto link", () => {
  assertEquals(
    Marked.parse("https://github.com").content,
    `<p><a href="https://github.com" target="_blank" rel="noopener noreferrer">https://github.com<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="feather"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg></a></p>` +
      "\n",
  );
  assertEquals(
    Marked.parse("http://www.example.com").content,
    `<p><a href="http://www.example.com" target="_blank" rel="noopener noreferrer">http://www.example.com<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="feather"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg></a></p>` +
      "\n",
  );
});

Deno.test("[Marked] ignore auto link", () => {
  assertEquals(
    Marked.parse("`https://github.com`").content,
    `<p><code>https://github.com</code></p>` + "\n",
  );
});

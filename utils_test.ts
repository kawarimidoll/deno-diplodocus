import { assertEquals, assertThrows } from "./deps.ts";
import { aTag, genResponseArgs, getH1, toTitle } from "./utils.ts";

Deno.test("[aTag] throws error", () => {
  assertThrows(
    () => {
      aTag({ href: 1 }, "Posts");
    },
    Error,
    "href must be a string",
  );
});

Deno.test("[aTag] internal link", () => {
  assertEquals(
    aTag({ href: "/about" }, "About"),
    `<a href="/about">About</a>`,
  );
  assertEquals(
    aTag({ href: "posts" }, "Posts"),
    `<a href="/posts">Posts</a>`,
  );
  assertEquals(
    aTag({ href: "#ex" }, "Examples"),
    `<a href="#ex">Examples</a>`,
  );
});

Deno.test("[aTag] external link", () => {
  assertEquals(
    aTag({ href: "https://github.com" }, "GitHub"),
    `<a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="feather"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg></a>`,
  );
});

Deno.test("[getH1] get h1 tag", () => {
  assertEquals(
    getH1("<body><h1>header 1 </h1><h2>header 2</h2></body>"),
    "header 1",
  );
  assertEquals(
    getH1(`<body><h1><span id="h1">header</span> 1</h1><p>text</p></body>`),
    "header 1",
  );
});

Deno.test("[getH1] blank", () => {
  assertEquals(
    getH1("<body><h2>header 2</h2></body>"),
    "",
  );
  assertEquals(
    getH1(""),
    "",
  );
});

Deno.test("[toTitle] turn into a title", () => {
  assertEquals(
    toTitle("this-is-title"),
    "This is title",
  );
  assertEquals(
    toTitle("/path/to/the_file"),
    "Path to the file",
  );
});

Deno.test("[getH1] get h1 tag", () => {
  assertEquals(
    getH1("<body><h1>header 1</h1><h2>header 2</h2><h1>3rd</h1></body>"),
    "header 1",
  );
  assertEquals(
    getH1(
      `<body><h1><span id="h1">header</span> 1</h1><h1>header 2</h1></body>`,
    ),
    "header 1",
  );
});

Deno.test("[genResponseArgs] generate response arguments", () => {
  assertEquals(
    genResponseArgs(404),
    [`404: Not Found`, { status: 404, statusText: "Not Found" }],
  );
  assertEquals(
    genResponseArgs(302, { headers: { location: "https://github.com" } }),
    [`302: Moved Temporarily`, {
      headers: { location: "https://github.com" },
      status: 302,
      statusText: "Moved Temporarily",
    }],
  );
});

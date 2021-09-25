// deno-lint-ignore-file no-explicit-any
import { assert, assertEquals } from "./deps.ts";
import { defaultConfig, Diplodocus } from "./mod.ts";

// https://scrapbox.io/nwtgck/配列をfor-await-ofが使えるAsyncIterableに変換する_-_JavaScript%2FTypeScript
function arrayToAsyncIterable<T>(arr: readonly T[]): AsyncIterable<T> {
  return {
    async *[Symbol.asyncIterator]() {
      yield* arr;
    },
  };
}

function filesToReadDirResponse(files: string[]): AsyncIterable<Deno.DirEntry> {
  const dirEntries = files.map((name) => ({
    name,
    isFile: true,
    isDirectory: false,
    isSymlink: false,
  }));
  return arrayToAsyncIterable(dirEntries);
}

const originalReadDir = Deno.readDir;
const originalReadTextFile = Deno.readTextFile;

Deno.test("[Diplodocus] load json", async () => {
  Deno.readDir = (..._: unknown[]) =>
    filesToReadDirResponse(["server.ts", "diplodocus.json"]);
  Deno.readTextFile = (..._: unknown[]): Promise<string> =>
    new Promise((resolve) => {
      resolve(`{ "siteName": "mod_test" }`);
    });

  const d = await Diplodocus.load() as any;
  assert(d);
  assertEquals(
    d.siteMeta,
    { ...defaultConfig, siteName: "mod_test" },
  );
  assertEquals(d.storedPages, {});
  assertEquals(d.storedMeta, {});

  Deno.readDir = originalReadDir;
  Deno.readTextFile = originalReadTextFile;
});

Deno.test("[Diplodocus] load yaml", async () => {
  Deno.readDir = (..._: unknown[]) =>
    filesToReadDirResponse(["server.ts", "diplodocus.yaml", "diplodocus.json"]);
  Deno.readTextFile = (..._: unknown[]): Promise<string> =>
    new Promise((resolve) => {
      resolve("siteName: mod_test");
    });

  const d = await Diplodocus.load() as any;
  assert(d);
  assertEquals(
    d.siteMeta,
    { ...defaultConfig, siteName: "mod_test" },
  );
  assertEquals(d.storedPages, {});
  assertEquals(d.storedMeta, {});

  Deno.readDir = originalReadDir;
  Deno.readTextFile = originalReadTextFile;
});

Deno.test("[Diplodocus] collectList", async () => {
  Deno.readDir = (..._: unknown[]) =>
    filesToReadDirResponse(["01.md", "image.png", "03.md", "02.md"]);
  Deno.readTextFile = (...args: unknown[]): Promise<string> => {
    let content = "";
    if (typeof args[0] === "string") {
      const path = args[0];
      if (path.endsWith("01.md")) {
        content = "# page 1";
      } else if (path.endsWith("02.md")) {
        content = "# page 2";
      } else if (path.endsWith("03.md")) {
        content = "# page 3";
      }
    }

    return new Promise((resolve) => {
      resolve(content);
    });
  };

  const d = new (Diplodocus as any)();
  assert(d);
  assertEquals(
    await d.collectList("pages"),
    [
      { path: "pages/01", title: "page 1" },
      { path: "pages/02", title: "page 2" },
      { path: "pages/03", title: "page 3" },
    ],
  );
  Deno.readDir = originalReadDir;
  Deno.readTextFile = originalReadTextFile;
});

Deno.test("[Diplodocus] handler", async () => {
  const text = "ok";

  const d = new (Diplodocus as any)();
  d.readData = (..._: unknown[]): Promise<BodyInit> => {
    return new Promise((resolve) => {
      resolve(text);
    });
  };

  assert(d);

  let response = await d.handler(new Request("http://host.com"));
  assert(response);
  assertEquals(response.ok, true);
  assertEquals(response.status, 200);
  assertEquals(response.headers.get("content-type"), "text/html");
  assertEquals(await response.text(), text);

  response = await d.handler(new Request("http://host.com/page"));
  assert(response);
  assertEquals(response.ok, true);
  assertEquals(response.status, 200);
  assertEquals(response.headers.get("content-type"), "text/html");
  assertEquals(await response.text(), text);

  response = await d.handler(new Request("http://host.com/page.md"));
  assert(response);
  assertEquals(response.ok, true);
  assertEquals(response.status, 200);
  assertEquals(response.headers.get("content-type"), "text/markdown");
  assertEquals(await response.text(), text);

  response = await d.handler(new Request("http://host.com/redirects/"));
  assert(response);
  assertEquals(response.ok, false);
  assertEquals(response.status, 302);

  d.readData = (..._: unknown[]): Promise<BodyInit> => {
    return new Promise((_, reject) => {
      reject("NotFound: file not found");
    });
  };
  response = await d.handler(new Request("http://host.com/not_exists"));
  assert(response);
  assertEquals(response.ok, false);
  assertEquals(response.status, 404);
});

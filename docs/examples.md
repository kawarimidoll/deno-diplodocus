# Examples

Here is some examples.

## Auto link

URL in the markdown file automatically turns into a link like this:
https://deno.land

If you want to not link to the URL, use code syntax: `https://deno.land`

## Show image

Image is automatically centered.

```markdown
<!-- markdown -->
![image](kawarimiku_v4x.png)
```

![image](kawarimiku_v4x.png)

## Syntax highlighting

Syntax highlighting is available by [Prism](https://prismjs.com/).

```js
// js
console.log("Hello world!");
```

```shell
# shell
echo 'Hello world!'
```

## Raw HTML

Raw HTML in markdown is valid.

```markdown
<!-- markdown -->
<details>
<summary>Click to open</summary>
Hello world!
</details>
```

<details>
<summary>Click to open</summary>
Hello world!
</details>

import MarkdownIt from "markdown-it";
// @ts-ignore
import mdKatex from "markdown-it-katex";
import prism from "markdown-it-prism";
import mdKbd from "markdown-it-kbd";

export const md = MarkdownIt({
  linkify: true,
  breaks: true,
})
  .use(mdKatex)
  .use(prism)
  .use(mdKbd);

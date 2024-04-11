import baidu from "./baidu";
import chatglm from "./chatglm";
import google from "./google";
import openai from "./openai";
import openrouter from "./openrouter";
import qwen from "./qwen";
import groq from "./groq";
import moonshot from "./moonshot";
import mistral from "./mistral";
import claude from "./claude";
import minimaxi from "./minimaxi";
import togetherai from "./togetherai";
import lingyi from "./lingyi";

export default {
  openai,
  openrouter,
  google,
  baidu,
  chatglm,
  groq,
  moonshot,
  qwen,
  mistral,
  claude,
  togetherai,
  lingyi,
  minimaxi,
};

export const COST_MAP = [
  baidu,
  chatglm,
  google,
  openai,
  openrouter,
  groq,
  moonshot,
  qwen,
  mistral,
  claude,
  togetherai,
  lingyi,
  minimaxi,
]
  .map((p) => p.models)
  .flat()
  .reduce(
    (c, m) => {
      c[m.value] = { input: m.input, output: m.output };
      return c;
    },
    {} as Record<string, { input: number; output: number }>
  );

export const COST_DOLLAR = [
  "openai",
  "openrouter",
  "google",
  "groq",
  "mistral",
  "claude",
];

export const PROVIDER_LIST = [
  { value: "openai", label: openai.name },
  { value: "openrouter", label: openrouter.name },
  { value: "google", label: google.name },
  { value: "groq", label: groq.name },
  { value: "moonshot", label: moonshot.name },
  { value: "claude", label: claude.name },
  { value: "mistral", label: mistral.name },
  { value: "chatglm", label: chatglm.name },
  { value: "qwen", label: qwen.name },
  { value: "minimaxi", label: minimaxi.name },
  { value: "togetherai", label: togetherai.name },
  { value: "lingyi", label: lingyi.name },
  { value: "baidu", label: baidu.name },
];

export const APIKeys = {
  openai: "",
  openrouter: "",
  google: "",
  chatglm: "",
  baidu: "",
  qwen: "",
  groq: "",
  moonshot: "",
  mistral: "",
  claude: "",
  minimaxi: "",
  togetherai: "",
  lingyi: "",
  // replicate: {
  //   apikey: '',
  // },
};

export type IProvider = keyof typeof APIKeys;

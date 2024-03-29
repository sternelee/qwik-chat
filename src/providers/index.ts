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
  // replicate: {
  //   apikey: '',
  // },
};

export type IProvider = keyof typeof APIKeys;

import baidu from "./baidu";
import zhipu from "./chatglm";
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
import atomLlama from "./atom-llama";

const workersAI = {
  icon: "i-simple-icons:cloudflare",
  name: "cloudflare AI",
  href: "https://dash.cloudflare.com/profile/api-tokens",
  defaultModel: "llama-2-7b-chat-int8",
  placeholder: "API Key",
  models: [
    {
      label: "llama-2-7b-chat-int8",
      value: "llama-2-7b-chat-int8",
      input: 0,
      output: 0,
    },
    {
      label: "llama-2-7b-chat-fp16",
      value: "llama-2-7b-chat-fp16",
      input: 0,
      output: 0,
    },
    {
      label: "falcon-7b-instruct",
      value: "falcon-7b-instruct",
      input: 0,
      output: 0,
    },
    {
      label: "neural-chat-7b-v3-1-awq",
      value: "neural-chat-7b-v3-1-awq",
      input: 0,
      output: 0,
    },
  ],
};

export default {
  openai,
  openrouter,
  google,
  baidu,
  zhipu,
  groq,
  moonshot,
  qwen,
  "mistral-ai": mistral,
  claude,
  "together-ai": togetherai,
  lingyi,
  minimaxi,
  "workers-ai": workersAI,
  "atom-llama": atomLlama,
};

export const COST_MAP = [
  baidu,
  zhipu,
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
  atomLlama,
  workersAI,
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

export const APIKeys = {
  openai: "",
  openrouter: "",
  google: "",
  // baidu: "",
  // qwen: "",
  groq: "",
  moonshot: "",
  "mistral-ai": "",
  claude: "",
  zhipu: "",
  "together-ai": "",
  lingyi: "",
  "workers-ai": "",
  "atom-llama": "",
};

export const PROVIDER_LIST = Object.keys(APIKeys);

export type IProvider = keyof typeof APIKeys;

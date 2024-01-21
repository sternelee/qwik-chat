import baidu from "./baidu";
import chatglm from "./chatglm";
import google from "./google";
import openai from "./openai";
import openrouter from "./openrouter";
import qwen from "./qwen";

export default {
  openai,
  openrouter,
  google,
  baidu,
  chatglm,
  qwen,
};

export const COST_MAP = [baidu, chatglm, google, openai, openrouter, qwen]
  .map((p) => p.models)
  .flat()
  .reduce(
    (c, m) => {
      c[m.value] = { input: m.input, output: m.output };
      return c
    },
    {} as Record<string, { input: number; output: number }>
  );

export const COST_DOLLAR = ['openai', 'openrouter', 'google']


export const PROVIDER_LIST = [
  { value: "openai", label: openai.name },
  { value: "openrouter", label: openrouter.name },
  { value: "google", label: google.name },
  { value: "baidu", label: baidu.name },
  { value: "chatglm", label: chatglm.name },
  { value: "qwen", label: qwen.name },
];

export const APIKeys = {
  openai: "",
  openrouter: "",
  google: "",
  chatglm: "",
  baidu: "",
  qwen: "",
  // replicate: {
  //   apikey: '',
  // },
};

export type IProvider = keyof typeof APIKeys;

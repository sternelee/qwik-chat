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

export const PROVIDER_LIST = [
  { value: "openai", label: openai.name },
  { value: "openrouter", label: openrouter.name },
  { value: "google", label: google.name },
  { value: "baidu", label: baidu.name },
  { value: "chatglm", label: chatglm.name },
  { value: "qwen", label: qwen.name }
];

export const APIKeys = {
  openai: "",
  openrouter: "",
  google: "",
  chatglm: "",
  baidu: "",
  qwen: ""
  // replicate: {
  //   apikey: '',
  // },
};

export type IProvider = keyof typeof APIKeys;

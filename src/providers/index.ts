import baidu from "./baidu";
import chatglm from "./chatglm";
import google from "./google";
import openai from "./openai";
import openrouter from "./openrouter";

export default {
  openai,
  openrouter,
  google,
  baidu,
  chatglm,
};

export const PROVIDER_LIST = [
  { value: "openai", label: "OpenAI" },
  { value: "openrouter", label: "OpenRouter" },
  { value: "google", label: "Google" },
  { value: "baidu", label: "文心一言" },
  { value: "chatglm", label: "智谱AI" },
];

export const APIKeys = {
  openai: "",
  openrouter: "",
  google: "",
  chatglm: "",
  baidu: "",
  // replicate: {
  //   apikey: '',
  // },
};

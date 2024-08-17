import openai from "./openai";
import openrouter from "./openrouter";
import google from "./google";
import claude from "./claude";
import groq from "./groq";
import mistralAi from "./mistral-ai";
import togetherAi from "./together-ai";
import moonshot from "./moonshot";
import lingyi from "./lingyi";
import zhipu from "./zhipu";
import workersAi from "./workers-ai";
import deepseek from "./deepseek";
import coze from "./coze";
import atomLlama from "./atom-llama";
import cohere from "./cohere";
import siliconflow from "./siliconflow";

export const APIKeys = {
  openai: "",
  openrouter: "",
  google: "",
  // baidu: "",
  // qwen: "",
  groq: "",
  moonshot: "",
  zhipu: "",
  deepseek: "",
  siliconflow: "",
  "atom-llama": "",
  "together-ai": "",
  "mistral-ai": "",
  cohere: "",
  claude: "",
  lingyi: "",
  "workers-ai": "",
  // coze: "",
};

export const PROVIDER_LIST = Object.keys(APIKeys);
export type IProvider = keyof typeof APIKeys;

export default {
  openai,
  openrouter,
  google,
  claude,
  groq,
  "mistral-ai": mistralAi,
  "together-ai": togetherAi,
  moonshot,
  lingyi,
  zhipu,
  siliconflow,
  "workers-ai": workersAi,
  "atom-llama": atomLlama,
  deepseek,
  coze,
  cohere,
};

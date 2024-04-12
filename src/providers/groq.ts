import { parseData } from "./util"

const baseUrl = "https://api.groq.com/openai";

const fetchChat = async (
  body: any,
  env: any = {},
  signal: AbortSignal | undefined
) => {
  let { key, password, ...rest } = body;
  if (password && password === env.PASSWORD) {
    key = env.GROQ_KEY;
  }
  return await fetch(`${baseUrl}/v1/chat/completions`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    signal,
    method: "POST",
    body: JSON.stringify(rest),
  });
};

export default {
  icon: "i-simple-icons-akaunting",
  name: "Groq",
  href: "https://console.groq.com/keys",
  baseUrl,
  defaultModel: "mixtral-8x7b-32768",
  models: [
    {
      value: "mixtral-8x7b-32768",
      label: "Mixtral-8x7b",
      input: 0,
      output: 0,
    },
    {
      value: "llama2-70b-4096",
      label: "LLaMA2-70b",
      input: 0,
      output: 0,
    },
    {
      value: "gemma-7b-it",
      label: "Gemma-7b-it",
      input: 0,
      output: 0,
    },
  ],
  placeholder: "API Key",
  parseData,
  fetchChat,
};

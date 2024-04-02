import type { ParsedEvent } from "eventsource-parser";

const baseUrl = "https://api.together.xyz";

const fetchChat = async (
  body: any,
  env: any = {},
  signal: AbortSignal | undefined,
) => {
  let { key, password, ...rest } = body;
  if (password && password === env.PASSWORD) {
    key = env.TOGETHER_KEY;
  }
  return await fetch(`${baseUrl}/v1/chat/completions`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      "HTTP-Referer": "https://qwik-chat.leeapp.cn",
      "X-Title": "Qwik Chat",
    },
    signal,
    method: "POST",
    body: JSON.stringify(rest),
  });
};

const parseData = (event: ParsedEvent) => {
  const data = event.data;
  if (data === "[DONE]") {
    return [true, null];
  }
  const json = JSON.parse(data);
  return [false, json.choices[0].delta?.content];
};

export default {
  icon: "i-simple-icons-gotomeeting",
  name: "TogetherAI",
  href: "https://api.together.xyz/settings/api-keys",
  baseUrl,
  defaultModel: "deepseek-ai/deepseek-coder-33b-instruct",
  models: [
    {
      value: "togethercomputer/Llama-2-7B-32K-Instruct",
      label: "LLaMA-2-7B-32K-Instruct (7B)",
      input: 0,
      output: 0,
    },
    {
      value: "togethercomputer/StripedHyena-Nous-7B",
      label: "StripedHyena Nous (7B)",
      input: 0,
      output: 0,
    },
    {
      value: "togethercomputer/RedPajama-INCITE-7B-Chat",
      label: "RedPajama-INCITE Chat (7B)",
      input: 0,
      output: 0,
    },
    {
      value: "deepseek-ai/deepseek-coder-33b-instruct",
      label: "Deepseek Coder Instruct (33B)",
      input: 0,
      output: 0,
    },
    {
      value: "Phind/Phind-CodeLlama-34B-v2",
      label: "Phind Code LLaMA v2 (34B)",
      input: 0,
      output: 0,
    },
    {
      value: "google/gemma-2b-it",
      label: "Gemma Instruct (2B)",
      input: 0,
      output: 0,
    },
    {
      value: "meta-llama/Llama-2-13b-chat-hf",
      label: "LLaMA-2 Chat (13B)",
      input: 0,
      output: 0,
    },
    {
      value: "zero-one-ai/Yi-34B-Chat",
      label: "01-ai Yi Chat (34B)",
      input: 0,
      output: 0,
    },
    {
      value: "mistralai/Mixtral-8x7B-Instruct-v0.1",
      label: "Mixtral-8x7B Instruct (46.7B)",
      input: 0,
      output: 0,
    },
    {
      value: "NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO",
      label: "Nous Hermes 2 - Mixtral 8x7B-DPO (46.7B)",
      input: 0,
      output: 0,
    },
    {
      value: "NousResearch/Nous-Hermes-2-Yi-34B",
      label: "Nous Hermes-2 Yi (34B)",
      input: 0,
      output: 0,
    },
    {
      value: "Qwen/Qwen1.5-7B-Chat",
      label: "Qwen 1.5 Chat (7B)",
      input: 0,
      output: 0,
    },
    {
      value: "Qwen/Qwen1.5-14B-Chat",
      label: "Qwen 1.5 Chat (14B)",
      input: 0,
      output: 0,
    },
    {
      value: "Qwen/Qwen1.5-72B-Chat",
      label: "Qwen 1.5 Chat (72B)",
      input: 0,
      output: 0,
    },
  ],
  placeholder: "API Key",
  parseData,
  fetchChat,
};

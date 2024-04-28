import { parseStream, fetchStream } from "./util";

const baseUrl = "https://api.atomecho.cn";

const fetchChat = async (
  body: any,
  env: any = {},
  signal: AbortSignal | undefined
) => {
  let { key, password, ...rest } = body;
  if (password && password === env.PASSWORD) {
    key = env.ATOM_LLAMA_KEY;
  }
  return await fetchStream(
    `${baseUrl}/v1/chat/completions`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      signal,
      method: "POST",
      body: JSON.stringify(rest),
    },
    parseStream
  );
};

export default {
  icon: "i-simple-icons-openai",
  name: "Atom LLama",
  href: "https://llama.family/docs/secret",
  baseUrl,
  defaultModel: "Atom-13B-Chat",
  models: [
    {
      label: "Atom-13B-Chat",
      value: "Atom-13B-Chat",
      input: 0,
      output: 0,
    },
    {
      label: "Atom-7B-Chat",
      value: "Atom-7B-Chat",
      input: 0,
      output: 0,
    },
    {
      label: "Atom-1B-Chat",
      value: "Atom-1B-Chat",
      input: 0,
      output: 0,
    },
    {
      label: "Llama3-Chinese-8B-Instruct",
      value: "Llama3-Chinese-8B-Instruct",
      input: 0,
      output: 0,
    },
  ],
  placeholder: "API Key",
  fetchChat,
};

import Models from "~/openrouter.json";
import type { ChatMessage } from "~/types";
import { parseStream, fetchStream } from "./util";

const baseUrl = "https://openrouter.ai/api";

const fetchChat = async (
  body: any,
  env: any = {},
  signal: AbortSignal | undefined
) => {
  let { key, password, ...rest } = body;
  if (password && password === env.PASSWORD) {
    key = env.OPENROUTER_KEY;
  }
  rest.messages = rest.messages.map((m: ChatMessage) => {
    if (m.images) {
      return {
        role: m.role,
        content: [
          { type: "text", text: m.content },
          {
            type: "image_url",
            image_url: {
              url: m.images[0],
              detail: "auto",
            },
          },
        ],
      };
    }
    return m;
  });
  return fetchStream(
    `${baseUrl}/v1/chat/completions`,
    {
      headers: {
        "Content-Type": "application/json",
        "HTTP-Referer": "https://qwik-chat.leeapp.cn/",
        Authorization: `Bearer ${key}`,
      },
      signal,
      method: "POST",
      body: JSON.stringify(rest),
    },
    parseStream
  );
};

const fetchModels = async (body: any = {}, env: any = {}) => {
  const { key, password } = body;
  const APIKey =
    password && password === env.PASSWORD && env.OPENAI_KEY
      ? env.OPENAI_KEY
      : key;
  return fetch(`${baseUrl}/v1/models`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${APIKey}`,
    },
  });
};

export default {
  icon: "i-simple-icons-alwaysdata",
  name: "OpenRouter",
  href: "https://openrouter.ai/keys",
  baseUrl,
  defaultModel: "openai/gpt-3.5-turbo",
  models: Models.data.map((m) => ({
    value: m.id,
    label: `${m.name}${m.pricing.prompt === "0" ? "[free]" : ""}`,
    input: Number(m.pricing.prompt),
    output: Number(m.pricing.completion),
  })),
  placeholder: "API Key",
  fetchChat,
  fetchModels,
};

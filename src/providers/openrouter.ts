import type { ParsedEvent } from "eventsource-parser";
import Models from "~/openrouter.json";
import type { ChatMessage } from "~/types";

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
  return await fetch(`${baseUrl}/v1/chat/completions`, {
    headers: {
      "Content-Type": "application/json",
      "HTTP-Referer": "https://qwik-chat.leeapp.cn/",
      Authorization: `Bearer ${key}`,
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
  parseData,
  fetchChat,
};

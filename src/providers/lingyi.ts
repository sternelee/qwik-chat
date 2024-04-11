import type { ParsedEvent } from "eventsource-parser";
import type { ChatMessage } from "~/types";

const baseUrl = "https://api.lingyiwanwu.com";

const fetchChat = async (
  body: any,
  env: any = {},
  signal: AbortSignal | undefined
) => {
  let { key, password, ...rest } = body;
  if (password && password === env.PASSWORD) {
    key = env.ZEROONE_KEY;
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
  icon: "i-simple-icons-goldenline",
  name: " 零一AI",
  href: "https://platform.lingyiwanwu.com/apikeys",
  baseUrl,
  defaultModel: "yi-34b-chat-0205",
  models: [
    {
      value: "yi-34b-chat-0205",
      label: "YI 34B Chat",
      input: 0,
      output: 0,
    },
    {
      value: "YI 34B Chat 200k",
      label: "yi-34b-chat-200k",
      input: 0,
      output: 0,
    },
    {
      value: "yi-vl-plus",
      label: "YI Vision Plus",
      input: 0,
      output: 0,
    },
  ],
  placeholder: "API Key",
  parseData,
  fetchChat,
};

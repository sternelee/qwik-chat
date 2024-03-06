import type { ParsedEvent } from "eventsource-parser";
import type { ChatMessage } from "~/types";

const baseUrl = "https://api.openai.com";

const fetchChat = async (
  body: any,
  env: any = {},
  signal: AbortSignal | undefined
) => {
  const { key, password, ...rest } = body;
  const APIKey =
    password && password === env.PASSWORD && env.OPENAI_KEY
      ? env.OPENAI_KEY
      : key;
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
      Authorization: `Bearer ${APIKey}`,
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
  icon: "i-simple-icons-openai",
  name: "OpenAI",
  href: "https://platform.openai.com/",
  baseUrl,
  defaultModel: "gpt-3.5-turbo-1106",
  models: [
    {
      label: "GPT-3.5 Turbo 16K",
      value: "gpt-3.5-turbo-1106",
      input: 0.001,
      output: 0.002,
    },
    // {
    //   label: "GPT-3.5 Turbo 4K",
    //   value: "gpt-3.5-turbo-instruct",
    //   input: 0.0015,
    //   output: 0.002,
    // },
    {
      label: "GPT-4 Turbo",
      value: "gpt-4-1106-preview",
      input: 0.01,
      output: 0.03,
    },
    {
      label: "GPT-4 Turbo Vision",
      value: "gpt-4-1106-vision-preview",
      input: 0.01,
      output: 0.03,
    },
    {
      label: "GPT-4",
      value: "gpt-4",
      input: 0.03,
      output: 0.06,
    },
    {
      label: "GPT-4-32K",
      value: "gpt-4-32k",
      input: 0.03,
      output: 0.06,
    },
  ],
  placeholder: "API Key",
  parseData,
  fetchChat,
};

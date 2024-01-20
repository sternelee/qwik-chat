import type { ParsedEvent } from "eventsource-parser";
import type { ChatMessage } from "~/types";

const baseUrl = "https://api.openai.com";

const fetchChat = async (body: any) => {
  const { key, password, ...rest } = body;
  const APIKey =
    password && password === process.env.PASSWORD && process.env.OPENAI_KEY
      ? process.env.OPENAI_KEY
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
  defaultModel: "gpt-3.5-turbo-0613",
  models: [
    // { value: "gpt-3.5-turbo-0301", label: "gpt-3.5-turbo-0301" },
    {
      value: "gpt-3.5-turbo-0613",
      label: "gpt-3.5-turbo-0613",
      input: 0.0015,
      output: 0.002,
    },
    // { value: "gpt-3.5-turbo-1106", label: "gpt-3.5-turbo-1106" },
    // { value: "gpt-3.5-turbo-16k", label: "gpt-3.5-turbo-16k" },
    {
      value: "gpt-3.5-turbo-16k-0613",
      label: "gpt-3.5-turbo-16k-0613",
      input: 0.003,
      output: 0.004,
    },
    // { value: "gpt-3.5-turbo", label: "gpt-3.5-turbo" },
    // { value: "gpt-4", label: "gpt-4" },
    // { value: "gpt-4-0314", label: "gpt-4-0314" },
    { value: "gpt-4-0613", label: "gpt-4-0613", input: 0.03, output: 0.06 },
    // { value: "gpt-4-1106-preview", label: "gpt-4-1106-preview" },
    { value: "gpt-4-vision-preview", label: "gpt-4-vision-preview", input: 0.03, output: 0.06 },
    // { value: "gpt-4-32k", label: "gpt-4-32k" },
    // { value: "gpt-4-32k-0314", label: "gpt-4-32k-0314" },
    {
      value: "gpt-4-32k-0613",
      label: "gpt-4-32k-0613",
      input: 0.06,
      output: 0.12,
    },
  ],
  placeholder: "API Key",
  parseData,
  fetchChat,
};

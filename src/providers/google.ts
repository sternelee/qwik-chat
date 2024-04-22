import type { ChatMessage } from "~/types";
import { fetchStream } from "./util";

const baseUrl = "https://generativelanguage.googleapis.com";

const fetchChat = async (
  body: any,
  env: any = {},
  signal: AbortSignal | undefined
) => {
  const { key, password, model, messages } = body;
  const APIKey =
    password && password === env.PASSWORD && env.GOOGLE_KEY
      ? env.GOOGLE_KEY
      : key;
  const contents = parseMessageList(messages);
  return await fetchStream(
    `${baseUrl}/v1beta/models/${model}:streamGenerateContent?key=${APIKey}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      signal,
      method: "POST",
      body: JSON.stringify({ contents }),
    },
    parseStream
  );
};

const parseMessageList = (rawList: ChatMessage[]) => {
  interface GoogleGeminiMessage {
    role: "user" | "model";
    parts:
      | [{ text: string }]
      | [
          { text: string },
          {
            inline_data: {
              mime_type: "image/jpeg";
              data: string;
            };
          },
        ];
  }

  if (rawList.length === 0) return [];

  const parsedList: GoogleGeminiMessage[] = [];
  // if first message is system message, insert an empty message after it
  if (rawList[0].role === "system") {
    // @ts-ignore
    parsedList.push({ role: "user", parts: [{ text: rawList[0].content }] });
    parsedList.push({ role: "model", parts: [{ text: "OK." }] });
  }
  // covert other messages
  const roleDict = {
    user: "user",
    assistant: "model",
  } as const;
  // TODO: 转成 https://ai.google.dev/tutorials/rest_quickstart
  for (const message of rawList) {
    if (message.role === "system") continue;
    parsedList.push({
      // @ts-ignore
      role: roleDict[message.role],
      parts: message.images
        ? [
            { text: message.content },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: btoa(message.images[0]),
              },
            },
          ]
        : [{ text: message.content }],
    });
  }
  return parsedList;
};

const parseStream = (data: string) => {
  try {
    const json = JSON.parse(data);
    return [
      json.candidates[0].finishReason === "STOP",
      json.candidates[0].content.parts[0].text,
      false,
    ];
  } catch (e) {
    return [false, null, e];
  }
};

export default {
  icon: "i-carbon:logo-google", // @unocss-include
  name: "Google",
  href: "https://makersuite.google.com/app/apikey",
  baseUrl,
  defaultModel: "gemini-pro",
  models: [
    { value: "gemini-pro", label: "Gemini-Pro", input: 0, output: 0 },
    {
      value: "gemini-1.5-pro-latest",
      label: "Gemini-Pro-1.5",
      input: 0,
      output: 0,
    },
    {
      value: "gemini-pro-vision",
      label: "Gemini-Pro-Vision",
      input: 0,
      output: 0,
    },
  ],
  placeholder: "API Key",
  fetchChat,
};

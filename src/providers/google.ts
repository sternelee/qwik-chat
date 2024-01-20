import type { ParsedEvent } from "eventsource-parser";
import type { ChatMessage } from "~/types";

const baseUrl = "https://generativelanguage.googleapis.com";

const fetchChat = async (body: any) => {
  const { key, password, model, messages } = body;
  const APIKey =
    password && password === process.env.PASSWORD && process.env.GOOGLE_KEY
      ? process.env.GOOGLE_KEY
      : key;
  const contents = parseMessageList(messages);
  console.log(contents);
  return await fetch(
    `${baseUrl}/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${APIKey}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ contents }),
    }
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

const parseData = (event: ParsedEvent) => {
  const data = event.data;
  const json = JSON.parse(data);
  return [
    json.candidates[0].finishReason === "STOP",
    json.candidates[0].content.parts[0].text,
  ];
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
      value: "gemini-pro-vision",
      label: "Gemini-Pro-Vision",
      input: 0,
      output: 0,
    },
  ],
  placeholder: "API Key",
  parseData,
  fetchChat,
};

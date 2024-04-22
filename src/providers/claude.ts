import type { ChatMessage } from "~/types";
import { fetchStream } from "./util";

const baseUrl = "https://api.anthropic.com";

const fetchChat = async (
  body: any,
  env: any = {},
  signal: AbortSignal | undefined
) => {
  let { key, password, messages, ...rest } = body;
  if (password && password === env.PASSWORD) {
    key = env.CLAUDE_KEY;
  }
  const prompt = messages.map((m: ChatMessage) =>
    m.role === "system"
      ? m.content
      : m.role === "user"
        ? `\n\nHuman: ${m.content}`
        : `\n\nAssistant: ${m.content}`
  );
  rest.prompt = `${prompt.join("")}\n\nAssistant:`;
  rest.max_tokens_to_sample = 4096;
  return await fetchStream(
    `${baseUrl}/v1/complete`,
    {
      headers: {
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
        "x-api-key": `${key}`,
      },
      signal,
      method: "POST",
      body: JSON.stringify(rest),
    },
    parseStream
  );
};

const parseStream = (data: string) => {
  try {
    const json = JSON.parse(data);
    if (json.stop_reason) {
      return [true, null, null];
    }
    if (json.error) {
      return [false, null, json.error];
    }
    return [false, json.completion, null];
  } catch (e) {
    return [false, null, e];
  }
};

export default {
  icon: "i-simple-icons-anilist",
  name: "Claude",
  href: "https://console.anthropic.com/settings/keys",
  baseUrl,
  defaultModel: "claude-2.1",
  models: [
    {
      value: "claude-2.1",
      label: "claude-2.1",
      input: 0,
      output: 0,
    },
    {
      value: "claude-2.0",
      label: "claude-2.0",
      input: 0,
      output: 0,
    },
    {
      value: "claude-3-opus-20240229",
      label: "Claude 3 Opus",
      input: 0,
      output: 0,
    },
    {
      value: "claude-3-sonnet-20240229",
      label: "Claude 3 Sonnet",
      input: 0,
      output: 0,
    },
  ],
  placeholder: "API Key",
  parseStream,
  fetchChat,
};

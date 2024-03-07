import type { ParsedEvent } from "eventsource-parser";
import type { ChatMessage } from "~/types";

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
  return await fetch(`${baseUrl}/v1/complete`, {
    headers: {
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01",
      "x-api-key": `${key}`,
    },
    signal,
    method: "POST",
    body: JSON.stringify(rest),
  });
};

const parseData = (event: ParsedEvent) => {
  const json = JSON.parse(event.data);
  if (json.stop_reason) {
    return [true, null];
  }
  if (json.error) {
    return [false, json.error];
  }
  return [false, json.completion];
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
  parseData,
  fetchChat,
};

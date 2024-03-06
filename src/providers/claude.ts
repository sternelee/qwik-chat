import type { ParsedEvent } from "eventsource-parser";

const baseUrl = "https://api.anthropic.com";

const fetchChat = async (body: any) => {
  let { key, password, ...rest } = body;
  if (password && password === process.env.PASSWORD) {
    key = process.env.CLAUDE_KEY;
  }
  return await fetch(`${baseUrl}/v1/complete`, {
    headers: {
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01",
      "x-api-key": `${key}`,
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
  icon: "i-simple-icons-akaunting",
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
  ],
  placeholder: "API Key",
  parseData,
  fetchChat,
};

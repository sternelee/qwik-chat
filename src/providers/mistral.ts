import type { ParsedEvent } from "eventsource-parser";

const baseUrl = "https://api.mistral.ai";

const fetchChat = async (body: any) => {
  let { key, password, ...rest } = body;
  if (password && password === process.env.PASSWORD) {
    key = process.env.MISTRAL_KEY;
  }
  return await fetch(`${baseUrl}/v1/chat/completions`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
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
  icon: "i-simple-icons-metasploit",
  name: "Mistral",
  href: "https://console.mistral.ai/api-keys/",
  baseUrl,
  defaultModel: "mistral-medium-latest",
  models: [
    {
      value: "mistral-medium-latest",
      label: "mistral-medium-latest",
      input: 0,
      output: 0,
    },
    {
      value: "mistral-large-latest",
      label: "mistral-large-latest",
      input: 0,
      output: 0,
    },
    {
      value: "mistral-small-latest",
      label: "mistral-small-latest",
      input: 0,
      output: 0,
    },
  ],
  placeholder: "API Key",
  parseData,
  fetchChat,
};

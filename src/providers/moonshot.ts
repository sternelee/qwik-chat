import type { ParsedEvent } from "eventsource-parser";

const baseUrl = "https://api.moonshot.cn";

const fetchChat = async (body: any) => {
  let { key, password, ...rest } = body;
  if (password && password === process.env.PASSWORD) {
    key = process.env.MOONSHOT_KEY;
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
  icon: "i-simple-icons-akaunting",
  name: "MoonShot",
  href: "https://platform.moonshot.cn/console/api-keys",
  baseUrl,
  defaultModel: "moonshot-v1-8k",
  models: [
    {
      value: "moonshot-v1-8k",
      label: "moonshot-v1-8k",
      input: 0.012,
      output: 0.012,
    },
    {
      value: "moonshot-v1-32k",
      label: "moonshot-v1-32k",
      input: 0.024,
      output: 0.024,
    },
    {
      value: "moonshot-v1-128k",
      label: "moonshot-v1-128k",
      input: 0.06,
      output: 0.06,
    },
  ],
  placeholder: "API Key",
  parseData,
  fetchChat,
};

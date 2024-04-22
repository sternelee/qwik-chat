import { parseStream, fetchStream } from "./util";

const baseUrl = "https://api.moonshot.cn";

const fetchChat = async (
  body: any,
  env: any = {},
  signal: AbortSignal | undefined
) => {
  let { key, password, ...rest } = body;
  if (password && password === env.PASSWORD) {
    key = env.MOONSHOT_KEY;
  }
  return await fetchStream(
    `${baseUrl}/v1/chat/completions`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      signal,
      method: "POST",
      body: JSON.stringify(rest),
    },
    parseStream
  );
};

export default {
  icon: "i-simple-icons-icomoon",
  name: "MoonShot",
  href: "https://platform.moonshot.cn/console/api-keys",
  baseUrl,
  defaultModel: "moonshot-v1",
  models: [
    {
      value: "moonshot-v1",
      label: "Moonshot-Kimi",
      input: 0.012,
      output: 0.012,
    },
    {
      value: "moonshot-v1-8k",
      label: "Moonshot-v1-8k",
      input: 0.012,
      output: 0.012,
    },
    {
      value: "moonshot-v1-32k",
      label: "Moonshot-v1-32k",
      input: 0.024,
      output: 0.024,
    },
    {
      value: "moonshot-v1-128k",
      label: "Moonshot-v1-128k",
      input: 0.06,
      output: 0.06,
    },
  ],
  placeholder: "API Key",
  fetchChat,
};

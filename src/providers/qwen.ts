import type { ChatMessage } from "~/types";
import { fetchStream } from "./util";

const baseUrl =
  "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation";

const fetchChat = async (
  body: any,
  env: any = {},
  signal: AbortSignal | undefined
) => {
  let { key, password, model, messages, ...parameters } = body;
  if (password && password === env.PASSWORD) {
    key = env.ALI_KEY;
  }
  messages = messages.map((m: ChatMessage) => {
    if (m.images) {
      return {
        role: m.role,
        content: [
          { text: m.content },
          {
            image: m.images[0],
          },
        ],
      };
    }
    return m;
  });
  return fetchStream(
    baseUrl,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
        "X-DashScope-SSE": "enable",
      },
      signal,
      method: "POST",
      body: JSON.stringify({
        model,
        input: {
          messages,
        },
        parameters,
      }),
    },
    parseStream
  );
};

const parseStream = (data: string) => {
  try {
    const json = JSON.parse(data);
    if (json.output.finish_reason === "stop") {
      return [true, null, null];
    }
    return [false, json.output.text, null];
  } catch (e) {
    return [false, null, e];
  }
};

export default {
  icon: "i-carbon-application-virtual",
  name: "通义千问",
  href: "https://help.aliyun.com/zh/dashscope/developer-reference/activate-dashscope-and-create-an-api-key",
  baseUrl,
  defaultModel: "qwen-turbo",
  models: [
    { label: "Qwen-turbo", value: "qwen-turbo", input: 0.008, output: 0.008 },
    { label: "Qwen-plus", value: "qwen-plus", input: 0.02, output: 0.02 },
    { label: "Qwen-VL", value: "qwen-vl-plus", input: 0.02, output: 0.02 },
  ],
  placeholder: "API Key",
  fetchChat,
};

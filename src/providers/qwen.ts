import type { ParsedEvent } from "eventsource-parser";

const baseUrl =
  "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation";

const fetchChat = async (body: any) => {
  let { key, password, model, messages, ...parameters } = body;
  if (password && password === process.env.PASSWORD) {
    key = process.env.ALI_KEY;
  }
  return await fetch(baseUrl, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      "X-DashScope-SSE": "enable",
    },
    method: "POST",
    body: JSON.stringify({
      model,
      input: {
        messages,
      },
      parameters,
    }),
  });
};

const parseData = (event: ParsedEvent) => {
  const data = event.data;
  const json = JSON.parse(data);
  if (data === "[DONE]") {
    return [true, null];
  }
  return [false, json.choices[0].delta?.content];
};

export default {
  icon: "i-carbon-application-virtual",
  name: "通义千问",
  href: "https://help.aliyun.com/zh/dashscope/developer-reference/activate-dashscope-and-create-an-api-key",
  baseUrl,
  defaultModel: "qwen-turbo",
  models: [{ label: "qwen-turbo", value: "qwen-turbo" }],
  parseData,
  fetchChat,
};

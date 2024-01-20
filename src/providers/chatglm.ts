import { SignJWT } from "jose";
import type { ParsedEvent } from "eventsource-parser";
import type { ChatMessage } from "~/types";

const baseUrl = "https://open.bigmodel.cn/api/paas/v4/chat/completions";

const cache = new Map();

const fetchChat = async (body: any) => {
  let { key, password, ...rest } = body;
  const APIKey =
    password && password === process.env.PASSWORD && process.env.CHATGLM_KEY
      ? process.env.CHATGLM_KEY
      : key;
  const [id, secret] = APIKey.split(".");
  let token = "";
  const cacheToken = cache.get(id);
  if (cacheToken) {
    if (cacheToken.exp <= Date.now()) {
      cache.delete(id);
    } else {
      token = cacheToken.token;
    }
  }
  if (!token) {
    const timestamp = Date.now();
    const exp = timestamp + 3600 * 1000;
    token = await new SignJWT({
      api_key: id,
      exp,
      timestamp,
    })
      .setProtectedHeader({ alg: "HS256", sign_type: "SIGN" })
      .sign(new TextEncoder().encode(secret));
    cache.set(id, {
      token,
      exp,
    });
  }
  rest.messages = rest.messages.map((m: ChatMessage) => {
    if (m.images) {
      return {
        role: m.role,
        content: [
          { type: "text", text: m.content },
          {
            type: "image_url",
            image_url: {
              url: m.images[0],
            },
          },
        ],
      };
    }
    return m;
  });
  return await fetch(baseUrl, {
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
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
  icon: "i-carbon-navaid-ndb",
  name: "智谱AI",
  href: "https://open.bigmodel.cn/usercenter/apikeys",
  baseUrl,
  defaultModel: "glm-3-turbo",
  models: [
    {
      label: "GLM-3-Turbo",
      value: "glm-3-turbo",
      input: 0.005,
      output: 0.005,
    },
    {
      label: "GLM-4",
      value: "glm-4",
      input: 0.1,
      output: 0.1,
    },
    {
      label: "GLM-4-V",
      value: "glm-4v",
      input: 0.1,
      output: 0.1,
    },
  ],
  parseData,
  fetchChat,
};

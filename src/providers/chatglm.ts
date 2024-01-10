import { SignJWT } from "jose";

const baseUrl = "https://open.bigmodel.cn/api/paas";

const cache = new Map();

export const fetchChat = async (body: any) => {
  let { key, password, model, messages, ...rest } = body;
  if (password && password === process.env.PASSWORD) {
    key = process.env.CHATGLM_KEY;
  }
  const [id, secret] = key.split(".");
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
  return await fetch(`${baseUrl}/v3/model-api/${model}/sse-invoke`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    method: "POST",
    body: JSON.stringify({
      prompt: messages,
      ...rest,
    }),
  });
};

export default {
  icon: "i-carbon-navaid-ndb",
  name: "智谱AI",
  href: "https://open.bigmodel.cn/usercenter/apikeys",
  baseUrl,
  defaultModel: "chatglm_turbo",
  models: [
    {
      label: "ChatGLM-Turbo",
      value: "chatglm_turbo",
    },
  ],
  fetchChat,
};

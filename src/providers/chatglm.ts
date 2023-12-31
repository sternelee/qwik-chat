import { SignJWT } from "jose";

const baseUrl = "https://open.bigmodel.cn/api/paas";

export const fetchChat = async (body: any) => {
  const { key, model, ...rest } = body;
  const [id, secret] = key.split(".");
  const timestamp = Date.now();
  // TODO: token可缓存
  const token = await new SignJWT({
    api_key: id,
    exp: timestamp + 3600 * 1000,
    timestamp,
  })
    .setProtectedHeader({ alg: "HS256", sign_type: "SIGN" })
    .sign(new TextEncoder().encode(secret));
  return await fetch(`${baseUrl}/v3/model-api/${model}/sse-invoke`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    method: "POST",
    body: JSON.stringify(rest),
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
      input: 0.005,
      output: 0.005,
    },
  ],
  fetchChat,
};

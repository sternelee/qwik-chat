import { fetchStream } from "./util";
import type { ChatMessage } from "~/types";

const baseUrl = "https://api.minimax.chat/v1/text/chatcompletion_pro";

const fetchChat = async (
  body: any,
  env: any = {},
  signal: AbortSignal | undefined
) => {
  let { key, password, messages, ...rest } = body;
  const APIKey =
    password && password === env.PASSWORD && env.MINIMAXI_KEY
      ? env.MINIMAXI_KEY
      : key;
  const [groupId, token] = APIKey.split(":");
  rest.bot_setting = [
    {
      bot_name: "MM智能助理",
      content:
        "MM智能助理是一款由MiniMax自研的，没有调用其他产品的接口的大型语言模型。MiniMax是一家中国科技公司，一直致力于进行大模型相关的研究。",
    },
  ];
  rest.reply_constraints = {
    sender_type: "BOT",
    sender_name: "MM智能助理",
  };
  rest.messages = messages.map((m: ChatMessage) => ({
    sender_type: m.role === "user" ? "USER" : "BOT",
    sender_name: "小李",
    text: m.content,
  }));
  return await fetchStream(
    `${baseUrl}?GroupId=${groupId}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      signal,
      method: "POST",
      body: JSON.stringify(rest),
    },
    parseStream
  );
};

const parseStream = (data: string) => {
  try {
    const json = JSON.parse(data);
    if (json.usage) {
      return [true, null, null];
    }
    const text = json.choices[0].messages[0].text;
    return [false, text, null];
  } catch (e) {
    return [false, null, e];
  }
};

export default {
  icon: "i-carbon-navaid-ndb",
  name: " 海螺问问",
  href: "https://www.minimaxi.com/user-center/basic-information/interface-key",
  baseUrl,
  defaultModel: "abab5.5-chat",
  models: [
    {
      label: "abab6-chat",
      value: "abab6-chat",
      input: 0.1,
      output: 0.1,
    },
    {
      label: "abab5.5-chat",
      value: "abab5.5-chat",
      input: 0.015,
      output: 0.015,
    },
    {
      label: "abab5.5s-chat",
      value: "abab5.5s-chat",
      input: 0.005,
      output: 0.005,
    },
  ],
  placeholder: "GroupId:api_key",
  parseStream,
  fetchChat,
};

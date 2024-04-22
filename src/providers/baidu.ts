import type { ParsedEvent } from "eventsource-parser";

const baseUrl = "https://aip.baidubce.com/rpc/2.0/ai_custom";

const fetchChat = async (
  body: any,
  env: any = {},
  signal: AbortSignal | undefined
) => {
  const { key, password, model, ...rest } = body;
  const APIKey =
    password && password === env.PASSWORD && env.BAIDU_KEY
      ? process.env.BAIDU_KEY
      : key;
  return await fetch(
    `${baseUrl}/v1/wenxinworkshop/chat/${model}?access_token=${APIKey}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      signal,
      method: "POST",
      body: JSON.stringify(rest),
    }
  );
};

const fetchImage = async (body: any, env: any = {}) => {
  const { key, password, model, ...rest } = body;
  const APIKey =
    password && password === env.PASSWORD && env.BAIDU_KEY
      ? env.BAIDU_KEY
      : key;
  return await fetch(
    `${baseUrl}/v1/wenxinworkshop/text2image/${model}?access_token=${APIKey}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(rest),
    }
  );
};

export default {
  icon: "i-simple-icons-baidu",
  name: "文心一言",
  href: "https://cloud.baidu.com/doc/WENXINWORKSHOP/s/yloieb01t",
  baseUrl,
  defaultModel: "completions_pro",
  models: [
    {
      label: "ERNIE-Bot 4.0",
      value: "completions_pro",
      input: 0.12,
      output: 0.12,
    },
    {
      label: "ERNIE-Bot-8K",
      value: "ernie_bot_8k",
      input: 0.24,
      output: 0.048,
    },
    { label: "ERNIE-Bot", value: "completions", input: 0.012, output: 0.008 },
    {
      label: "ERNIE-Bot-turbo",
      value: "eb-instant",
      input: 0.008,
      output: 0.008,
    },
    // {
    //   label: "Qianfan-BLOOMZ-7B-compressed",
    //   value: "qianfan_bloomz_7b_compressed",
    // },
    // {
    //   label: "Qianfan-Chinese-Llama-2-7B",
    //   value: "qianfan_chinese_llama_2_7b",
    // },
    // {
    //   label: "Qianfan-Chinese-Llama-2-13B",
    //   value: "qianfan_chinese_llama_2_13b",
    // },
    // { label: "ChatLaw", value: "chatlaw" },
    // { label: "XuanYuan-70B-Chat-4bit", value: "xuanyuan_70b_chat" },
    // { label: "Llama-2-7b-chat", value: "llama_2_7b" },
    // { label: "Llama-2-13b-chat", value: "llama_2_13b" },
    // { label: "Llama-2-70b-chat", value: "llama_2_70b" },
  ],
  placeholder: "access_token",
  fetchChat,
  fetchImage,
};

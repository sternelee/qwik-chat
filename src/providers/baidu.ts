const baseUrl = "https://aip.baidubce.com/rpc/2.0/ai_custom";

export const fetchChat = async (body: any) => {
  const { key, model, ...rest } = body;
  return await fetch(
    `${baseUrl}/v1/wenxinworkshop/chat/${model}?access_token=${key}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(rest),
    },
  );
};

export const fetchImage = async (body: any) => {
  const { key, model, messages, ...rest } = body;
  return await fetch(
    `${baseUrl}/v1/wenxinworkshop/text2image/${model}?access_token=${key}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(rest),
    },
  );
};

export default {
  icon: "i-simple-icons-baidu",
  name: "文心一言",
  href: "https://cloud.baidu.com/doc/WENXINWORKSHOP/s/yloieb01t",
  baseUrl,
  defaultModel: "completions_pro",
  models: [
    { label: "ERNIE-Bot 4.0", value: "completions_pro" },
    { label: "ERNIE-Bot-8K", value: "ernie_bot_8k" },
    { label: "ERNIE-Bot", value: "completions" },
    { label: "ERNIE-Bot-turbo", value: "eb-instant" },
    {
      label: "Qianfan-BLOOMZ-7B-compressed",
      value: "qianfan_bloomz_7b_compressed",
    },
    {
      label: "Qianfan-Chinese-Llama-2-7B",
      value: "qianfan_chinese_llama_2_7b",
    },
    {
      label: "Qianfan-Chinese-Llama-2-13B",
      value: "qianfan_chinese_llama_2_13b",
    },
    { label: "ChatLaw", value: "chatlaw" },
    // { label: "XuanYuan-70B-Chat-4bit", value: "xuanyuan_70b_chat" },
    // { label: "Llama-2-7b-chat", value: "llama_2_7b" },
    // { label: "Llama-2-13b-chat", value: "llama_2_13b" },
    // { label: "Llama-2-70b-chat", value: "llama_2_70b" },
  ],
  fetchChat,
  fetchImage,
};

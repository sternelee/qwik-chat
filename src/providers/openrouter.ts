const baseUrl = "https://openrouter.ai/api";
import Models from "~/openrouter.json";

export const fetchChat = async (body: any) => {
  const { key, ...rest } = body;
  return await fetch(`${baseUrl}/v1/chat/completions`, {
    headers: {
      "Content-Type": "application/json",
      "HTTP-Referer": "https://qwik-chat.leeapp.cn/",
      Authorization: `Bearer ${key}`,
    },
    method: "POST",
    body: JSON.stringify(rest),
  });
};

export default {
  icon: "i-simple-icons-alwaysdata",
  name: "OpenRouter",
  href: "https://openrouter.ai/keys",
  baseUrl,
  defaultModel: "openrouter/auto",
  models: Models.data.map((m) => ({
    value: m.id,
    label: `${m.name}${m.pricing.prompt === "0" ? "[free]" : ""}`,
    input: Number(m.pricing.prompt),
    output: Number(m.pricing.completion),
  })),
  fetchChat,
};

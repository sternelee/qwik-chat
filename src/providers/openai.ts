const baseUrl = "https://api.openai.com";

export const fetchChat = async (body: any) => {
  let { key, password, ...rest } = body;
  if (password && password === process.env.PASSWORD) {
    key = process.env.OPENAI_KEY;
  }
  return await fetch(`${baseUrl}/v1/chat/completions`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    method: "POST",
    body: JSON.stringify(rest),
  });
};

export default {
  icon: "i-simple-icons-openai",
  name: "OpenAI",
  href: "https://platform.openai.com/",
  baseUrl,
  defaultModel: "gpt-3.5-turbo-0613",
  models: [
    // { value: "gpt-3.5-turbo-0301", label: "gpt-3.5-turbo-0301" },
    { value: "gpt-3.5-turbo-0613", label: "gpt-3.5-turbo-0613" },
    // { value: "gpt-3.5-turbo-1106", label: "gpt-3.5-turbo-1106" },
    // { value: "gpt-3.5-turbo-16k", label: "gpt-3.5-turbo-16k" },
    { value: "gpt-3.5-turbo-16k-0613", label: "gpt-3.5-turbo-16k-0613" },
    // { value: "gpt-3.5-turbo", label: "gpt-3.5-turbo" },
    // { value: "gpt-4", label: "gpt-4" },
    // { value: "gpt-4-0314", label: "gpt-4-0314" },
    { value: "gpt-4-0613", label: "gpt-4-0613" },
    // { value: "gpt-4-1106-preview", label: "gpt-4-1106-preview" },
    // { value: "gpt-4-vision-preview", label: "gpt-4-vision-preview" },
    // { value: "gpt-4-32k", label: "gpt-4-32k" },
    // { value: "gpt-4-32k-0314", label: "gpt-4-32k-0314" },
    { value: "gpt-4-32k-0613", label: "gpt-4-32k-0613" },
  ],
  fetchChat,
};

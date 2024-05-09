export default {
  icon: "i-simple-icons:cloudflare",
  name: "cloudflare AI",
  href: "https://dash.cloudflare.com/profile/api-tokens",
  defaultModel: "llama-2-7b-chat-int8",
  placeholder: "API Key",
  models: [
    {
      label: "llama-2-7b-chat-int8",
      value: "llama-2-7b-chat-int8",
      input: 0,
      output: 0,
    },
    {
      label: "llama-2-7b-chat-fp16",
      value: "llama-2-7b-chat-fp16",
      input: 0,
      output: 0,
    },
    {
      label: "falcon-7b-instruct",
      value: "falcon-7b-instruct",
      input: 0,
      output: 0,
    },
    {
      label: "neural-chat-7b-v3-1-awq",
      value: "neural-chat-7b-v3-1-awq",
      input: 0,
      output: 0,
    },
  ],
};

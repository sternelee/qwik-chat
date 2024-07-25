export default {
  icon: "i-simple-icons-deepnote",
  name: "DeepSeek",
  href: "https://platform.deepseek.com/api_keys",
  defaultModel: "deepseek-chat",
  models: [
    {
      value: "deepseek-chat",
      label: "chat",
      input: 0.0001,
      output: 0.0002,
      context_length: 32000,
    },
    {
      value: "deepseek-coder",
      label: "coder",
      input: 0.0001,
      output: 0.0002,
      context_length: 16000,
    },
  ],
  placeholder: "API Key",
};

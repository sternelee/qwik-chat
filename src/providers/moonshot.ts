export default {
  icon: "i-simple-icons-icomoon",
  name: "月之暗面",
  href: "https://platform.moonshot.cn/console/api-keys",
  defaultModel: "moonshot-v1-8k",
  models: [
    {
      value: "moonshot-v1-8k",
      label: "moonshot-v1-8k",
      input: 0.012,
      output: 0.012,
      context_length: 8000,
    },
    {
      value: "moonshot-v1-32k",
      label: "moonshot-v1-32k",
      input: 0.024,
      output: 0.024,
      context_length: 32000,
    },
    {
      value: "moonshot-v1-128k",
      label: "moonshot-v1-128k",
      input: 0.06,
      output: 0.06,
      context_length: 128000,
    },
  ],
  placeholder: "API Key",
};

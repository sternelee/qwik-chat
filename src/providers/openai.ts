export default {
  icon: "i-simple-icons-openai",
  name: "OpenAI",
  href: "https://platform.openai.com/",
  defaultModel: "gpt-3.5-turbo-1106",
  models: [
    {
      label: "GPT-3.5 Turbo 16K",
      value: "gpt-3.5-turbo-1106",
      input: 0.001,
      output: 0.002,
    },
    {
      label: "GPT-4 Turbo",
      value: "gpt-4-1106-preview",
      input: 0.01,
      output: 0.03,
    },
    {
      label: "GPT-4 Turbo Vision",
      value: "gpt-4-1106-vision-preview",
      input: 0.01,
      output: 0.03,
    },
    {
      label: "GPT-4-32K",
      value: "gpt-4-32k",
      input: 0.03,
      output: 0.06,
    },
  ],
  placeholder: "API Key",
};

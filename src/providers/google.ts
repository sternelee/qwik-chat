export default {
  icon: "i-carbon:logo-google", // @unocss-include
  name: "Google",
  href: "https://makersuite.google.com/app/apikey",
  defaultModel: "gemini-pro",
  models: [
    { value: "gemini-pro", label: "Gemini-Pro", input: 0, output: 0 },
    {
      value: "gemini-1.5-pro-latest",
      label: "Gemini-Pro-1.5",
      input: 0,
      output: 0,
    },
    {
      value: "gemini-pro-vision",
      label: "Gemini-Pro-Vision",
      input: 0,
      output: 0,
    },
  ],
  placeholder: "API Key",
};

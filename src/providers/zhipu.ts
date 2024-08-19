export default {
  icon: "i-carbon-navaid-ndb",
  name: "智谱清言",
  href: "https://open.bigmodel.cn/usercenter/apikeys",
  defaultModel: "glm-3-turbo",
  placeholder: "API Key",
  models: [
    {
      label: "GLM-4-0520",
      value: "glm-4-0520",
      input: 0.01,
      output: 0.01,
      context_length: 128000,
    },
    {
      label: "GLM-4-Long",
      value: "glm-4-long",
      input: 0.001,
      output: 0.001,
      context_length: 1000000,
    },
    {
      label: "GLM-4-Air",
      value: "glm-4-air",
      input: 0.001,
      output: 0.001,
      context_length: 128000,
    },
    {
      label: "GLM-4-Flash",
      value: "glm-4-flash",
      input: 0.0001,
      output: 0.0001,
      context_length: 128000,
    },
  ],
};

import Models from './siliconflow.json';

export default {
  icon: "i-simple-icons-openai",
  name: "硅基流动",
  href: "https://cloud.siliconflow.cn/account/ak",
  defaultModel: "deepseek-ai/DeepSeek-V2-Chat",
  models: Models.data.map(m => ({ label: m.id, value: m.id, input: 0, output: 0, context_length: 32000 })),
  placeholder: "API Key",
};
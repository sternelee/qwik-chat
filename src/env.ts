import Models from "./openrouter.json";

// eslint-disable-next-line @typescript-eslint/naming-convention
const MAX_INPUTS: any = {};
Models.data.forEach((v) => {
  MAX_INPUTS[v.id] = v.context_length;
});

/**
 * 用于创建 .env.example 文件，不要直接填写敏感信息。
 * 以 CLIENT_ 开头的变量会暴露给前端
 */
export const defaultEnv = {
  CLIENT_GLOBAL_SETTINGS: {
    password: "",
    requestWithBackend: true,
    enterToSend: true,
  },
  CLIENT_SESSION_SETTINGS: {
    title: "",
    saveSession: true,
    APITemperature: 0.6,
    APITopP: 1,
    continuousDialogue: false,
    model: "gpt-3.5-turbo-1106",
  },
  CLIENT_DEFAULT_MESSAGE: `
- 点击每条消息前的头像，可以锁定对话，作为角色设定。[查看更多使用技巧](https://github.com/sternelee/qwik-chat#使用技巧)。
- 现在支持多个对话，打开对话设置，点击新建对话。在输入框里输入 [[/]][[/]] 或者 [[空格]][[空格]] 可以切换对话，搜索历史消息。
- [[Shift]] + [[Enter]] 换行。开头输入 [[/]] 或者 [[空格]] 搜索 Prompt 预设。[[↑]] 可编辑最近一次提问。点击顶部名称滚动到顶部，点击输入框滚动到底部。
`,
  CLIENT_MAX_INPUT_TOKENS: MAX_INPUTS as Record<string, number>,
  TIMEOUT: 30000,
};

export type SessionSettings = typeof defaultEnv.CLIENT_SESSION_SETTINGS;

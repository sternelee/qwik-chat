import { createContextId, type QRL } from "@builder.io/qwik";
import type { Fzf } from "fzf";
import { APIKeys } from "~/providers";
import type { ChatMessage, Model, Option, SimpleModel } from "~/types";
import { defaultEnv } from "./env";
import Models from "./openrouter.json";

export const defaultMessage: ChatMessage = {
  role: "assistant",
  content: import.meta.env.CLIENT_DEFAULT_MESSAGE || defaultEnv.CLIENT_DEFAULT_MESSAGE,
  type: "default",
};

export const models = {
  "gpt-3.5": {
    "4k": "gpt-3.5-turbo-0613",
    "16k": "gpt-3.5-turbo-16k-0613",
  },
  "gpt-4": {
    "8k": "gpt-4-0613",
    "32k": "gpt-4-32k-0613",
  },
} satisfies {
    [k in SimpleModel]: {
      [k: string]: Model;
    };
  };

const modelCostMap = {
  "gpt-3.5-turbo-0613": {
    input: 0.0015,
    output: 0.002,
  },
  "gpt-3.5-turbo-16k-0613": {
    input: 0.003,
    output: 0.004,
  },
  "gpt-4-0613": {
    input: 0.03,
    output: 0.06,
  },
  "gpt-4-32k-0613": {
    input: 0.06,
    output: 0.12,
  },
  "gemini-pro": {
    input: 0,
    output: 0,
  },
  chatglm_turbo: {
    input: 0,
    output: 0,
  },
  completions_pro: {
    input: 0.008,
    output: 0.008,
  },
  ernie_bot_8k: {
    input: 0.008,
    output: 0.008,
  },
  completions: {
    input: 0.008,
    output: 0.008,
  },
  "eb-instant": {
    input: 0.008,
    output: 0.008,
  },
  qianfan_bloomz_7b_compressed: {
    input: 0.008,
    output: 0.008,
  },
  qianfan_chinese_llama_2_7b: {
    input: 0.008,
    output: 0.008,
  },
  chatlaw: {
    input: 0.008,
    output: 0.008,
  },
} satisfies {
    [key in Model]: {
      input: number;
      output: number;
    };
  };

Models.data.forEach((v) => {
  // @ts-ignore
  modelCostMap[v.id] = {
    input: v.pricing.prompt,
    output: v.pricing.completion,
  };
});

export type ImgStatusUnion = "normal" | "loading" | "success" | "error";
export const imgIcons: Record<ImgStatusUnion, string> = {
  success: "i-carbon:status-resolved dark:text-yellow text-yellow-6",
  normal: "i-carbon:image",
  loading: "i-ri:loader-2-line animate-spin",
  error: "i-carbon:warning-alt text-red-6 dark:text-red",
};

export type FakeRoleUnion = "system" | "assistant" | "user" | "normal";
export const roleIcons: Record<FakeRoleUnion, string> = {
  system: "i-ri:robot-2-fill bg-gradient-to-r from-yellow-300 to-red-700 ",
  assistant: "i-ri:android-fill bg-gradient-to-r from-yellow-300 to-red-700 ",
  normal: "i-ri:user-3-line",
  user: "i-ri:user-3-fill bg-gradient-to-r from-red-300 to-blue-700 ",
};
export const FZFData = {
  promptOptions: [] as Option[],
  fzfPrompts: undefined as Fzf<Option[]> | undefined,
  sessionOptions: [] as Option[],
  fzfSessions: undefined as Fzf<Option[]> | undefined,
};

export function countTokensDollar(
  tokens: number,
  model: Model,
  io: "input" | "output",
) {
  const tk = tokens / 1000;
  // @ts-ignore
  return modelCostMap[model][io] * tk;
}

export let globalSettings = {
  APIKeys,
  enterToSend: true,
  requestWithBackend: true,
};
let _ = import.meta.env.CLIENT_GLOBAL_APIKeys;
if (_) {
  try {
    globalSettings = {
      ...globalSettings,
      ...JSON.parse(_),
    };
  } catch (e) {
    console.error("Error parsing CLIENT_GLOBAL_APIKeys:", e);
  }
}

export type IProvider = keyof typeof APIKeys;

export let sessionSettings = {
  ...defaultEnv.CLIENT_SESSION_SETTINGS,
  provider: "openai" as IProvider,
};
_ = import.meta.env.CLIENT_SESSION_APIKeys;
if (_) {
  try {
    sessionSettings = {
      ...sessionSettings,
      ...JSON.parse(_),
    };
  } catch (e) {
    console.error("Error parsing CLIENT_SESSION_APIKeys:", e);
  }
}

export let maxInputTokens = defaultEnv.CLIENT_MAX_INPUT_TOKENS;
_ = import.meta.env.CLIENT_MAX_INPUT_TOKENS;
if (_) {
  try {
    if (Number.isNaN(+_)) {
      maxInputTokens = {
        ...maxInputTokens,
        ...JSON.parse(_),
      };
    }
  } catch (e) {
    console.error("Error parsing CLIENT_MAX_INPUT_TOKENS:", e);
  }
}

export interface IStore {
  sessionId: string;
  globalSettings: typeof globalSettings;
  sessionSettings: typeof sessionSettings;
  inputContent: string;
  inputImage: string;
  messageList: ChatMessage[];
  currentAssistantMessage: string;
  contextToken: number;
  validContent: string;
  currentMessageToken: number;
  inputContentToken: number;
  loading: boolean;
  showSetting: "none" | "global" | "session";
  success: false | "markdown" | "link";
  genImg: ImgStatusUnion;
  fakeRole: FakeRoleUnion;
  clearSessionConfirm: boolean;
  deleteSessionConfirm: boolean;
  inputBoxHeight: number;
  // controller: AbortController | undefined;
  remainingToken$: QRL<(this: IStore) => number>;
  remainingToken: number;
  validContext: ChatMessage[];
  fetchGPT: QRL<(this: IStore, messages: ChatMessage[]) => void>;
  sendMessage: QRL<
    (this: IStore, content?: string, fakeRole?: FakeRoleUnion) => void
  >;
  stopStreamFetch: QRL<(this: IStore) => void>;
  archiveCurrentMessage: QRL<(this: IStore) => void>;
  loadSession: QRL<(this: IStore, sessionId: string) => void>;
}

export const StoreContext = createContextId<IStore>("globalStore");
// 3em
export const defaultInputBoxHeight = 48;

export const shownTokens = (token: number) => {
  if (token > 1000) return (token / 1000).toFixed(1) + "k";
  else return token;
};

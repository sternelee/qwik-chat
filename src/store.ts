import { createContextId, type QRL, type NoSerialize } from "@builder.io/qwik";
import type { Fzf } from "fzf";
import { COST_MAP, APIKeys, type IProvider } from "~/providers";
import type { ChatMessage, Model, Option } from "~/types";
import { defaultEnv } from "./env";

export const defaultMessage: ChatMessage = {
  role: "assistant",
  content:
    import.meta.env.CLIENT_DEFAULT_MESSAGE || defaultEnv.CLIENT_DEFAULT_MESSAGE,
  type: "default",
};

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
  io: "input" | "output"
) {
  const tk = tokens / 1000;
  // @ts-ignore
  return COST_MAP[model][io] * tk;
}

export let globalSettings = {
  APIKeys,
  enterToSend: true,
  requestWithBackend: true,
  password: "",
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

export interface IChatStore {
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
  controller: NoSerialize<AbortController | undefined>;
  remainingToken$: QRL<(this: IChatStore) => number>;
  remainingToken: number;
  validContext: ChatMessage[];
  fetchGPT: QRL<(this: IChatStore, messages: ChatMessage[]) => void>;
  sendMessage: QRL<
    (this: IChatStore, content?: string, fakeRole?: FakeRoleUnion) => void
  >;
  stopStreamFetch: QRL<(this: IChatStore) => void>;
  archiveCurrentMessage: QRL<(this: IChatStore) => void>;
  loadSession: QRL<(this: IChatStore, sessionId: string) => void>;
}

export const ChatContext = createContextId<IChatStore>("chatContext");
// 3em
export const defaultInputBoxHeight = 48;

export const shownTokens = (token: number) => {
  if (token > 1000) return (token / 1000).toFixed(1) + "k";
  else return token;
};

export const SUPPORT_VISION = ['gpt-4-vision-preview', 'openai/gpt-4-vision-preview', 'google/gemini-pro-vision', 'gemini-pro-vision', 'glm-4v', 'yi-vl-plus']

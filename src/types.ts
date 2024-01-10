import type { defaultEnv } from "./env";
import { type SessionSettings } from "./env";
import { type IProvider } from "~/store"

export const enum LocalStorageKey {
  GLOBAL_SETTINGS = "gpt-global-APIKeys",
  THEME = "gpt-theme",
  PREFIX_SESSION = "gpt-session-",
}

export interface ChatMessage {
  role: Role;
  content: string;
  type?: "default" | "locked" | "temporary";
  images?: string[]
}

export type Role = "system" | "user" | "assistant" | "error";
export type SimpleModel = "gpt-3.5" | "gpt-4";
export type Model = string;
// | "gpt-3.5-turbo-0613"
// | "gpt-3.5-turbo-16k-0613"
// | "gpt-4-0613"
// | "gpt-4-32k-0613"

export interface Prompt {
  desc: string;
  detail: string;
}

export type Session = typeof defaultEnv.CLIENT_SESSION_SETTINGS & {
  id: string;
  lastVisit: number;
  messages: ChatMessage[];
  settings: SessionSettings;
  provider: IProvider;
}

export interface Option {
  desc: string;
  title: string;
  positions?: Set<number>;
  extra?: any;
}

interface UserMessageContentPartText {
  text: string;
  type: "text";
}
interface UserMessageContentPartImage {
  image_url: {
    detail?: "auto" | "low" | "high";
    url: string;
  };
  type: "image_url";
}

export type UserMessageContentPart =
  | UserMessageContentPartText
  | UserMessageContentPartImage;
export interface OpenAIFunctionCall {
  arguments: string;
  name: string;
}
export type LLMRoleType = "user" | "system" | "assistant" | "function";
export interface OpenAIChatMessage {
  /**
   * @title 内容
   * @description 消息内容
   */
  content: string | UserMessageContentPart[];

  function_call?: OpenAIFunctionCall;
  name?: string;
  /**
   * 角色
   * @description 消息发送者的角色
   */
  role: LLMRoleType;
}

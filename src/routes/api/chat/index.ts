import type { RequestHandler } from "@builder.io/qwik-city";
import ProviderMap, { type IProvider } from "~/providers";

export const onPost: RequestHandler = async ({ parseBody, send, env }) => {
  const body = (await parseBody()) as any;
  const { provider, ...rest } = body as {
    provider: IProvider;
    [prop: string]: any;
  };
  const fetchChat = ProviderMap[provider].fetchChat;
  const envMap = {
    CF_KEY: env.get("CF_KEY"),
    GOOGLE_KEY: env.get("GOOGLE_KEY"),
    BAIDU_KEY: env.get("BAIDU_KEY"),
    CHATGLM_KEY: env.get("CHATGLM_KEY"),
    OPENROUTER_KEY: env.get("OPENROUTER_KEY"),
    OPENAI_KEY: env.get("OPENAI_KEY"),
    PASSWORD: env.get("PASSWORD"),
    CLAUDE_KEY: env.get("CLAUDE_KEY"),
    MOONSHOT_KEY: env.get("MOONSHOT_KEY"),
    GROQ_KEY: env.get("GROQ_KEY"),
    MISTRAL_KEY: env.get("MISTRAL_KEY"),
  };
  const response = await fetchChat(rest, envMap);
  send(response);
};

import type { RequestHandler } from "@builder.io/qwik-city";
import ProviderMap, { type IProvider } from "~/providers";

export const onPost: RequestHandler = async ({ parseBody, send, env }) => {
  const body = (await parseBody()) as any;
  const { provider, ...rest } = body as {
    provider: IProvider;
    [prop: string]: any;
  };
  const fetchChat = ProviderMap[provider].fetchChat;
  const response = await fetchChat(rest, env);
  send(response);
};

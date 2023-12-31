import type { RequestHandler } from "@builder.io/qwik-city";
import ProviderMap from "~/providers";
import type { IProvider } from "~/store";

export const onPost: RequestHandler = async ({ parseBody, send }) => {
  const body = (await parseBody()) as any;
  console.log(body);
  const { provider, ...rest } = body as {
    provider: IProvider;
    [prop: string]: any;
  };
  const fetchChat = ProviderMap[provider].fetchChat;
  const response = await fetchChat(rest);
  send(response);
};

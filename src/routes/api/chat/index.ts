import type { RequestHandler } from "@builder.io/qwik-city";
import { fetchChat, type IFetchChatBody } from "~/providers/util";

export const onPost: RequestHandler = async ({
  parseBody,
  send,
  env,
  signal,
}) => {
  const body = (await parseBody()) as IFetchChatBody;
  let key = body.key;
  const password = body.password;
  if (password && env.get("PASSWORD") === password) {
    // 没有传key时才校验管理密码
    key = (process.env[body.provider.toUpperCase() + "_KEY"] || "").replaceAll(
      "-",
      "_"
    );
  }

  const response = await fetchChat({
    ...body,
    key,
    signal,
  });
  send(response);
};

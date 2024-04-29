import type { RequestHandler } from "@builder.io/qwik-city";
import type { ParsedEvent, ReconnectInterval } from "eventsource-parser";
import { createParser } from "eventsource-parser";
import { SignJWT } from "jose";
import { type IProvider } from "~/providers";
import type { ChatMessage } from "~/types";

const cache = new Map();
const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const onPost: RequestHandler = async ({
  parseBody,
  send,
  env,
  signal,
  getWritableStream,
}) => {
  const body = (await parseBody()) as any;
  const { provider, password, model, messages, temperature, ...rest } =
    body as {
      provider: IProvider;
      messages: ChatMessage[];
      [prop: string]: any;
    };
  let key = body.key || "";
  if (password && env.get("PASSWORD") === password) {
    // 没有传key时才校验管理密码
    // @ts-ignore
    key = (env.get[provider.toUpperCase() + "_API"] || "").replaceAll("-", "_");
  }
  if (!body.messages?.length) {
    throw new Error("没有输入任何文字。");
  }

  if (provider === "zhipu") {
    const [id, secret] = key.split(".");
    let token = "";
    const cacheToken = cache.get(id);
    if (cacheToken) {
      if (cacheToken.exp <= Date.now()) {
        cache.delete(id);
      } else {
        token = cacheToken.token;
      }
    }
    if (!token) {
      const timestamp = Date.now();
      const exp = timestamp + 3600 * 1000;
      token = await new SignJWT({
        api_key: id,
        exp,
        timestamp,
      })
        .setProtectedHeader({ alg: "HS256", sign_type: "SIGN" })
        .sign(new TextEncoder().encode(secret));
      cache.set(id, {
        token,
        exp,
      });
    }
    key = token;
  }

  const headers: { [key: string]: string } = {
    "Content-Type": "application/json",
    "HTTP-Referer": "https://chat.leeapp.cn/",
    "x-portkey-provider": provider,
    Authorization: `Bearer ${key}`,
  };

  if (provider === "workers-ai") {
    headers["x-portkey-workers-ai-account-id"] = env.get("CF_ID") || "";
  }
  const writableStream = getWritableStream();
  const writer = writableStream.getWriter();
  try {
    const response = await fetch(
      "https://ai-gateway.leechat.app/v1/chat/completions",
      {
        headers,
        method: "POST",
        signal,
        body: JSON.stringify({
          model,
          messages: messages.map((k) => ({ role: k.role, content: k.content })),
          temperature,
          stream: true,
          ...rest,
        }),
      }
    );

    const stream = new ReadableStream({
      async start(controller) {
        const streamParser = (event: ParsedEvent | ReconnectInterval) => {
          if (event.type === "event") {
            const data = event.data;
            if (data === "[DONE]") {
              controller.close();
              return;
            }
            try {
              const json = JSON.parse(data);
              const text = json.choices[0].delta?.content;
              const queue = encoder.encode(text);
              controller.enqueue(queue);
            } catch (e) {
              controller.error(e);
            }
          }
        };
        const parser = createParser(streamParser);
        for await (const chunk of response.body as any) {
          parser.feed(decoder.decode(chunk));
        }
      },
    });
    send(new Response(stream));
  } catch (err: any) {
    send(500, {
      error: {
        message: err.message,
      },
    });
  }
};

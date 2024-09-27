import type { ParsedEvent, ReconnectInterval } from "eventsource-parser";
import { createParser } from "eventsource-parser";
import type { ChatMessage, Model } from "~/types";
import { type IProvider } from "~/providers";

const cache = new Map();

export const parseData = (event: ParsedEvent) => {
  const data = event.data;
  if (data === "[DONE]") {
    return [true, null];
  }
  const json = JSON.parse(data);
  return [false, json.choices[0].delta?.content];
};

export interface IFetchChatBody {
  messages?: ChatMessage[];
  key?: string;
  temperature: number;
  password?: string;
  model: Model;
  provider: IProvider;
  signal: AbortSignal;
}

export async function fetchChat(body: IFetchChatBody) {
  const { messages, temperature, model, provider, signal } = body;
  let key = body.key || "";

  if (!messages?.length) {
    throw new Error("没有输入任何文字。");
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const headers: { [key: string]: string } = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${key}`,
  };

  if (provider === "workers-ai") {
    headers["x-portkey-workers-ai-account-id"] = process.env.CF_ID || "";
  }

  const abortController = new AbortController();
  try {
    const rawRes = await fetch("https://ai.leeapp.dev/v1/chat/completions", {
      headers,
      method: "POST",
      signal: abortController.signal,
      body: JSON.stringify({
        model: `${provider}#${model}`,
        messages: messages.map((k) => ({ role: k.role, content: k.content })),
        temperature,
        stream: true,
      }),
    }).catch((err: { message: any }) => {
      return new Response(
        JSON.stringify({
          error: {
            message: err.message,
          },
        }),
        { status: 500 }
      );
    });
    if (signal.aborted) {
      abortController.abort();
    }

    if (!rawRes.ok) {
      return new Response(rawRes.body, {
        status: rawRes.status,
        statusText: rawRes.statusText,
      });
    }

    const readableStream = new ReadableStream({
      async start(controller) {
        // callback
        const onParse = (event: ParsedEvent | ReconnectInterval) => {
          if (event.type === "event") {
            const data = event.data;
            controller.enqueue(encoder.encode(data));
          }
        };

        // optimistic error handling
        if (rawRes.status !== 200) {
          const data = {
            status: rawRes.status,
            statusText: rawRes.statusText,
            body: await rawRes.text(),
          };
          console.log(
            `Error: recieved non-200 status code, ${JSON.stringify(data)}`
          );
          controller.close();
          return;
        }

        // stream response (SSE) from OpenAI may be fragmented into multiple chunks
        // this ensures we properly read chunks and invoke an event for each SSE event stream
        const parser = createParser(onParse);
        // https://web.dev/streams/#asynchronous-iteration
        for await (const chunk of rawRes.body as any) {
          parser.feed(decoder.decode(chunk));
        }
      },
    });

    let counter = 0;
    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        const data = decoder.decode(chunk);
        // https://beta.openai.com/docs/api-reference/completions/create#completions/create-stream
        if (data === "[DONE]") {
          controller.terminate();
          return;
        }
        try {
          const json = JSON.parse(data);
          const text = json.choices[0].delta?.content || "";
          if (counter < 2 && (text.match(/\n/) || []).length) {
            // this is a prefix character (i.e., "\n\n"), do nothing
            return;
          }
          // stream transformed JSON resposne as SSE
          // const payload = { text: text };
          // https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#event_stream_format
          controller.enqueue(
            // encoder.encode(`data: ${JSON.stringify(payload)}\n\n`),
            encoder.encode(text)
          );
          counter++;
        } catch (e) {
          // maybe parse error
          controller.error(e);
        }
      },
    });

    return new Response(readableStream.pipeThrough(transformStream));
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: {
          message: err.message,
        },
      }),
      { status: 400 }
    );
  }
}

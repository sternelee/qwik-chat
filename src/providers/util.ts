import type { ParsedEvent, ReconnectInterval } from "eventsource-parser";
import { createParser } from "eventsource-parser";

export const parseData = (event: ParsedEvent) => {
  const data = event.data;
  if (data === "[DONE]") {
    return [true, null];
  }
  const json = JSON.parse(data);
  return [false, json.choices[0].delta?.content];
};

export const fetchStream = async (body: any) => {
  const { url, ...rest } = body;
  const rawRes = await fetch(url, rest).catch((err: { message: any }) => {
    return new Response(
      JSON.stringify({
        error: {
          message: err.message,
        },
      }),
      { status: 500 }
    );
  });
  if (!rawRes.ok) {
    return new Response(rawRes.body, {
      status: rawRes.status,
      statusText: rawRes.statusText,
    });
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
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
      for await (const chunk of rawRes.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  return new Response(stream);
};

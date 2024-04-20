import type { ParsedEvent, ReconnectInterval } from "eventsource-parser";
import { createParser } from "eventsource-parser";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const parseStream = (data: string) => {
  if (data === "[DONE]") {
    return [true, null, null];
  }
  try {
    const json = JSON.parse(data);
    const text = json.choices[0].delta?.content;
    return [false, text, null];
  } catch (e) {
    return [false, null, e];
  }
};

export const fetchStream = async (
  input: RequestInfo | URL,
  init: RequestInit | undefined = undefined,
  parseData: typeof parseStream
) => {
  const rawRes = await fetch(input, init).catch((err: { message: any }) => {
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

  const stream = new ReadableStream({
    async start(controller) {
      const streamParser = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === "event") {
          const data = event.data;
          const [done, text, err] = parseData(data);
          if (done) {
            controller.close();
            return;
          }
          if (err) {
            controller.error(err);
          }
          const queue = encoder.encode(text);
          controller.enqueue(queue);
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

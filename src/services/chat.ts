import { server$ } from "@builder.io/qwik-city";
import type { ParsedEvent, ReconnectInterval } from "eventsource-parser";
import { createParser } from "eventsource-parser";
import ProviderMap from "~/providers";
import type { IProvider } from "~/store";
import type { ChatMessage } from "~/types";

export const chat = server$(async function* ({
  provider,
  key,
  messages,
  temperature,
  model,
  password,
  signal,
}: {
  provider: IProvider;
  key: string;
  messages: ChatMessage[];
  temperature: number;
  model: string;
  password: string;
  signal: AbortSignal;
}) {
  const fetchChat = ProviderMap[provider].fetchChat;
  const response = await fetchChat({
    key,
    messages,
    temperature,
    signal,
    model,
    password,
    stream: true,
  });
  if (!response.ok) {
    const json = await response.json();
    yield JSON.stringify(json);
    return;
  }
  const { writable, readable } = new TransformStream<string, string>();
  const decoder = new TextDecoder();
  const transformReader = writable.getWriter();

  const streamParser = (event: ParsedEvent | ReconnectInterval) => {
    if (event.type === "event") {
      const data = event.data;
      if (data === "[DONE]") {
        writable.close();
        return;
      }
      if (provider === "chatglm" && event.event === "finish") {
        writable.close();
        return;
      }
      try {
        let char = "";
        if (provider === "chatglm") {
          char = data;
        } else {
          const json = JSON.parse(data);
          if (provider === "google") {
            char = json.candidates[0].content.parts[0].text;
            if (json.candidates[0].finishReason === "STOP") {
              writable.close();
              return;
            }
          } else {
            if (provider === "baidu" && json.is_end) {
              writable.close();
              return;
            }
            char =
              provider === "baidu"
                ? json.result
                : json.choices[0].delta?.content;
          }
        }
        if (char) {
          console.log(11, char);
          transformReader.write(char);
        }
      } catch (e) {
        console.log(e);
      }
    }
  };

  // 原始数据流交给 eventsource-parser 处理
  const parser = createParser(streamParser);
  const rb = response.body as ReadableStream;
  const originReader = rb.getReader();
  try {
    while (!this.signal.aborted) {
      const { done, value } = await originReader.read();
      if (done) return;
      parser.feed(decoder.decode(value));
    }
  } catch (err) {
    console.log(err);
  }

  // 处理后的数据流返回前端
  const reader = readable.getReader();
  try {
    while (!this.signal.aborted) {
      const { done, value } = await reader.read();
      console.log(22, value);
      if (done) return;
      yield value;
    }
  } finally {
    reader.releaseLock();
  }
});

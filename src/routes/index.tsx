import {
  $,
  component$,
  useComputed$,
  useContextProvider,
  useSignal,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import { type DocumentHead } from "@builder.io/qwik-city";
import type { ParsedEvent, ReconnectInterval } from "eventsource-parser";
import { createParser } from "eventsource-parser";
import InputBox from "~/components/chat/InputBox";
import MessageItem from "~/components/chat/MessageItem";
import ThemeToggle from "~/components/chat/ThemeToggle";
import ProviderMap from "~/providers";
import {
  countTokensDollar,
  defaultInputBoxHeight,
  defaultMessage,
  FZFData,
  globalSettings,
  type IStore,
  maxInputTokens,
  sessionSettings,
  shownTokens,
  StoreContext,
} from "~/store";
import { LocalStorageKey } from "~/types";
import type { ChatMessage, Model } from "~/types";
import { scrollToBottom } from "~/utils";
import { fetchAllSessions, getSession, setSession } from "~/utils/storage";

export default component$(() => {
  const containerWidth = useSignal("init");
  const store = useStore<IStore>({
    sessionId: "index",
    globalSettings,
    sessionSettings,
    inputContent: "",
    inputImage: "",
    messageList: [] as ChatMessage[],
    currentAssistantMessage: "",
    contextToken: 0,
    validContent: "",
    currentMessageToken: 0,
    inputContentToken: 0,
    loading: false,
    showSetting: "none",
    success: false,
    genImg: "normal",
    fakeRole: "normal",
    clearSessionConfirm: false,
    deleteSessionConfirm: false,
    inputBoxHeight: defaultInputBoxHeight,
    remainingToken: 0,
    remainingToken$: $(function(this) {
      this.remainingToken = (maxInputTokens[this.sessionSettings.model] || 8192)
        - this.contextToken
        - this.inputContentToken;
      return this.remainingToken;
    }),
    validContext: [],
    archiveCurrentMessage: $(function() {
      if (this.currentAssistantMessage) {
        // window.abortController = undefined;
        this.messageList = this.messageList.map((k) => ({
          ...k,
          type: k.type === "temporary" ? "default" : k.type,
        }));
        this.currentAssistantMessage = "";
        this.currentMessageToken = 0;
        this.loading = false;
      }
      this.validContent = this.validContext.map((k) => k.content).join("\n");
    }),
    fetchGPT: $(async function(this, messages) {
      const provider = this.sessionSettings.provider;
      // window.abortController = new AbortController();
      let response: Response;
      if (this.globalSettings.requestWithBackend) {
        // 后端请求
        response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          // signal: window.abortController.signal,
          body: JSON.stringify({
            provider,
            key: this.globalSettings.APIKeys[this.sessionSettings.provider]
              || undefined,
            messages,
            temperature: this.sessionSettings.APITemperature,
            model: this.sessionSettings.model,
            stream: true,
          }),
        });
      } else {
        // 前端请求
        const fetchChat = ProviderMap[provider].fetchChat;
        response = await fetchChat({
          key: this.globalSettings.APIKeys[this.sessionSettings.provider]
            || undefined,
          messages,
          temperature: this.sessionSettings.APITemperature,
          // signal: window.abortController.signal,
          model: this.sessionSettings.model,
          stream: true,
        });
      }
      if (!response.ok) {
        this.loading = false;
        const json = await response.json();
        this.messageList = [
          ...this.messageList,
          { role: "error", content: JSON.stringify(json) },
        ];
        return;
      }
      const decoder = new TextDecoder();
      const streamParser = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === "event") {
          const data = event.data;
          if (data === "[DONE]") {
            this.loading = false;
            return;
          }
          if (provider === "chatglm" && event.event === "finish") {
            this.loading = false;
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
                  this.loading = false;
                }
              } else {
                if (provider === "baidu" && json.is_end) {
                  this.loading = false;
                  return;
                }
                char = provider === "baidu"
                  ? json.result
                  : json.choices[0].delta?.content;
              }
            }
            if (char) {
              if (this.currentAssistantMessage) {
                this.messageList = this.messageList.map((k) => {
                  if (k.type === "temporary") {
                    return { ...k, content: k.content + char };
                  }
                  return k;
                });
              } else {
                this.messageList = [
                  ...this.messageList,
                  {
                    role: "assistant",
                    content: char,
                    type: "temporary",
                  },
                ];
              }
              this.currentAssistantMessage += char;
              // batch(() => {
              // });
            }
          } catch (e) {
            console.log(e);
            this.loading = false;
          }
        }
      };
      const parser = createParser(streamParser);
      const rb = response.body as ReadableStream;
      const reader = rb.getReader();
      let done = false;
      while (!done) {
        const { done: isDone, value } = await reader.read();
        if (isDone) {
          done = true;
          return;
        }
        parser.feed(decoder.decode(value));
      }
    }),
    stopStreamFetch: $(function(this) {
      // if (window.abortController) {
      //   window.abortController.abort();
      // }
      this.archiveCurrentMessage();
    }),
    sendMessage: $(async function(this, content, fakeRole) {
      const inputValue = content ?? this.inputContent;
      if (!inputValue) return;
      this.inputContent = "";
      if (fakeRole === "system") {
        // TODO: 更换 system
        this.messageList = [
          {
            role: "system",
            content: inputValue,
          },
        ];
      } else if (fakeRole === "assistant") {
        this.fakeRole = "normal";
        if (
          this.messageList.at(-1)?.role !== "user"
          && this.messageList.at(-2)?.role === "user"
        ) {
          this.messageList[this.messageList.length - 1] = {
            role: "assistant",
            content: inputValue,
          };
        } else if (this.messageList.at(-1)?.role === "user") {
          this.messageList = [
            ...this.messageList,
            {
              role: "assistant",
              content: inputValue,
            },
          ];
        } else {
          this.messageList = [
            ...this.messageList,
            {
              role: "user",
              content: inputValue,
            },
          ];
        }
      } else if (fakeRole === "user") {
        this.fakeRole = "normal";
        this.messageList = [
          ...this.messageList,
          {
            role: "user",
            content: inputValue,
          },
        ];
      } else {
        try {
          const content = this.inputImage
            ? [
              {
                type: "image_url",
                image_url: {
                  url: this.inputImage,
                  detail: "low",
                },
              },
              {
                type: "text",
                text: inputValue,
              },
            ]
            : inputValue;
          this.messageList = [
            ...this.messageList,
            {
              role: "user",
              content: inputValue,
            },
          ];
          const remainingToken = await this.remainingToken$();
          if (remainingToken < 0) {
            throw new Error(
              this.sessionSettings.continuousDialogue
                ? "本次对话过长，请清除之前部分对话或者缩短当前提问。"
                : "当前提问太长了，请缩短。",
            );
          }
          this.loading = true;
          this.inputImage = "";
          // 在关闭连续对话时，有效上下文只包含了锁定的对话。
          this.validContext = this.sessionSettings.continuousDialogue
            ? this.messageList.filter(
              (k, i, _) =>
                (["assistant", "system"].includes(k.role)
                  && k.type !== "temporary"
                  && _[i - 1]?.role === "user")
                || (k.role === "user"
                  && _[i + 1]?.role !== "error"
                  && _[i + 1]?.type !== "temporary"),
            )
            : this.messageList.filter(
              (k) => k.role === "system" || k.type === "locked",
            );
          await this.fetchGPT(
            // @ts-ignore
            this.sessionSettings.continuousDialogue
              ? this.validContext
              : [
                ...this.validContext,
                {
                  role: "user",
                  content,
                },
              ],
          );
        } catch (error: any) {
          this.loading = false;
          // window.abortController = undefined;
          if (!error.message.includes("abort")) {
            this.messageList = [
              ...this.messageList,
              {
                role: "error",
                content: error.message.replace(/(sk-\w{5})\w+/g, "$1"),
              },
            ];
          }
        }
      }
      this.archiveCurrentMessage();
    }),
    loadSession: $(async function(this, sessionId: string) {
      this.sessionId = sessionId;
      try {
        const globalSettings = localStorage.getItem(
          LocalStorageKey.GLOBAL_SETTINGS,
        );
        const session = getSession(sessionId);
        if (globalSettings) {
          const parsed = JSON.parse(globalSettings);
          this.globalSettings = parsed;
        }
        if (session) {
          const { settings, messages } = session;
          if (settings) {
            this.sessionSettings = { ...this.sessionSettings, ...settings };
          }
          if (messages) {
            if (this.sessionSettings.saveSession) {
              this.messageList = messages;
            } else {
              this.messageList = messages.filter((m) => m.type === "locked");
            }
          }
        }
      } catch {
        console.log("Localstorage parse error");
      }

      const { Fzf } = await import("fzf");
      setTimeout(() => {
        const seesions = fetchAllSessions();
        FZFData.sessionOptions = seesions
          .sort((m, n) => n.lastVisit - m.lastVisit)
          .filter((k) => k.id !== this.sessionId && k.id !== "index")
          .map((k) => ({
            title: k.settings.title,
            desc: k.messages.map((k) => k.content).join("\n"),
            extra: {
              id: k.id,
            },
          }));
        if (sessionId !== "index") {
          FZFData.sessionOptions.unshift({
            title: "回到主对话",
            desc: "其实点击顶部 Logo 也可以直接回到主对话。"
                + seesions
                  .find((k) => k.id === "index")
                  ?.messages.map((k) => k.content)
                  .join("\n") ?? "",
            extra: {
              id: "index",
            },
          });
        }
        FZFData.fzfSessions = new Fzf(FZFData.sessionOptions, {
          selector: (k) => `${k.title}\n${k.desc}`,
        });
      }, 500);
    }),
  });

  useContextProvider(StoreContext, store);

  useVisibleTask$(() => {
    const json = localStorage.getItem("gpt-APIKeys");
    if (json) {
      try {
        store.globalSettings = JSON.parse(json);
      } catch (e) {
        console.log(e);
      }
    }
    const sessionId = new URLSearchParams(location.search).get("session") || "index";
    store.loadSession(sessionId);
  });

  // const provider$ = useComputed$(() => ProviderMap[store.sessionSettings.provider])
  // const defaultMessage$ = useComputed$(() => {
  //   return {
  //     ...defaultMessage,
  //     content: `Powered by ${store.sessionSettings.provider}\n ${defaultMessage.content}`,
  //   };
  // });

  const countContextToken = (contextToken: number, model: Model) => {
    return countTokensDollar(contextToken, model, "input");
  };

  const countContextTokensDollar = (
    contextToken: number,
    inputContentToken: number,
    model: Model,
  ) => {
    const c1 = countTokensDollar(contextToken, model, "input");
    const c2 = countTokensDollar(inputContentToken, model, "input");
    return (c1 + c2).toFixed(4);
  };

  useVisibleTask$(({ track }) => {
    track(() => store.messageList.length);
    scrollToBottom();
    if (store.messageList.length === 0) return;
    setSession(store.sessionId, {
      id: store.sessionId,
      lastVisit: Date.now(),
      ...store.sessionSettings,
      messages: store.sessionSettings.saveSession
        ? store.messageList
        : store.messageList.filter((m) => m.type === "locked"),
      settings: store.sessionSettings,
    });
  });

  useVisibleTask$(({ track }) => {
    track(() => store.currentAssistantMessage);
    scrollToBottom();
  });

  return (
    <main class="mt-4">
      <div class="flex items-center px-2em">
        <div class="flex-1 flex items-center dark:prose-invert dark:text-slate">
          {store.sessionSettings.title && (
            <>
              <a
                href={ProviderMap[store.sessionSettings.provider].href}
                target="_blank"
                class={{
                  "inline-block text-8 mr-4": true,
                  [ProviderMap[store.sessionSettings.provider].icon]: true,
                }}
              >
              </a>
              <span
                class="font-extrabold text-slate-7 cursor-pointer dark:text-slate"
                onClick$={() => store.loadSession("index")}
              >
                {store.sessionSettings.title}
              </span>
            </>
          )}
          {!store.sessionSettings.title && (
            <>
              <a
                href={ProviderMap[store.sessionSettings.provider].href}
                target="_blank"
                class={{
                  "inline-block text-8": true,
                  [ProviderMap[store.sessionSettings.provider].icon]: true,
                }}
              >
              </a>
              <a
                href={ProviderMap[store.sessionSettings.provider].href}
                target="_blank"
                class="font-extrabold ml-4"
              >
                {ProviderMap[store.sessionSettings.provider].name} Chat
              </a>
            </>
          )}
        </div>
        <ThemeToggle />
      </div>
      <div
        class="px-1em"
        style={{ "margin-bottom": `calc(6em + ${defaultInputBoxHeight}px)` }}
      >
        <div class="px-1em">
          {!store.messageList.length && <MessageItem hiddenAction={true} message={defaultMessage} />}
          {store.messageList.map((message, index) => (
            <MessageItem
              message={message}
              hiddenAction={store.loading || message.type === "temporary"}
              key={index}
              index={index}
            />
          ))}
        </div>
        {!store.loading
          && (store.contextToken || store.inputContentToken) > 0 && (
          <div class="flex items-center px-1em text-0.8em">
            <hr class="flex-1 border-slate/40" />
            {store.inputContentToken > 0 && (
              <span class="mx-1 text-slate/40">
                {`有效上下文 + 提问 Tokens : ${
                  shownTokens(
                    store.contextToken + store.inputContentToken,
                  )
                }(`}
                <span
                  class={{
                    "text-red-500": store.remainingToken < 0,
                  }}
                >
                  {shownTokens(store.remainingToken)}
                </span>
                {`)/$${
                  countContextTokensDollar(
                    store.contextToken,
                    store.inputContentToken,
                    store.sessionSettings.model,
                  )
                }`}
              </span>
            )}
            {store.inputContentToken === 0 && (
              <span class="mx-1 text-slate/40">
                {`有效上下文 Tokens : ${
                  shownTokens(
                    store.contextToken,
                  )
                }/$${
                  countContextToken(
                    store.contextToken,
                    store.sessionSettings.model,
                  )
                }`}
              </span>
            )}
            <hr class="flex-1  border-slate/30" />
          </div>
        )}
      </div>
      <InputBox width={containerWidth.value} />
    </main>
  );
});

export const head: DocumentHead = {
  title: "Chat",
  meta: [
    {
      name: "description",
      content: "lee chat",
    },
  ],
};

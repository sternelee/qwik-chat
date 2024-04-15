import {
  $,
  component$,
  useContextProvider,
  useStore,
  useVisibleTask$,
  noSerialize,
} from "@builder.io/qwik";
import { type DocumentHead, routeLoader$ } from "@builder.io/qwik-city";
import type { ParsedEvent, ReconnectInterval } from "eventsource-parser";
import { createParser } from "eventsource-parser";
import Chat from "~/components/chat";
import ProviderMap from "~/providers";
import {
  defaultInputBoxHeight,
  FZFData,
  globalSettings,
  type IChatStore,
  maxInputTokens,
  sessionSettings,
  ChatContext,
} from "~/store";
import { LocalStorageKey } from "~/types";
import type { ChatMessage } from "~/types";
import { scrollToBottom } from "~/utils";
import { fetchAllSessions, getSession, setSession } from "~/utils/storage";
import { useAuthSession } from "~/routes/plugin@auth";

// export const useChatStore = routeLoader$(async (requestEvent) => {
//   const res = await fetch(`/api/storage`);
//   return await res.json();
// });

export default component$(() => {
  const session = useAuthSession();
  console.log("user:", JSON.stringify(session.value));
  const store = useStore<IChatStore>({
    sessionId: "index",
    globalSettings,
    sessionSettings,
    inputContent: "",
    inputImage: "",
    controller: undefined,
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
    remainingToken$: $(function (this) {
      this.remainingToken =
        (maxInputTokens[this.sessionSettings.model] || 8192) -
        this.contextToken -
        this.inputContentToken;
      return this.remainingToken;
    }),
    validContext: [],
    archiveCurrentMessage: $(function () {
      if (this.currentAssistantMessage) {
        this.controller = undefined;
        this.messageList = this.messageList.map((k: ChatMessage) => ({
          ...k,
          type: k.type === "temporary" ? "default" : k.type,
        }));
        this.currentAssistantMessage = "";
        this.currentMessageToken = 0;
        this.loading = false;
      }
      this.validContent = this.validContext.map((k) => k.content).join("\n");
    }),
    fetchGPT: $(async function (this, messages) {
      const provider = this.sessionSettings.provider;
      let response: Response;
      this.controller = noSerialize(new AbortController());
      if (this.globalSettings.requestWithBackend) {
        // 后端请求
        response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          signal: this.controller?.signal,
          body: JSON.stringify({
            provider,
            password: this.globalSettings.password,
            key: this.globalSettings.APIKeys[provider] || undefined,
            messages,
            temperature: this.sessionSettings.APITemperature,
            model: this.sessionSettings.model,
            stream: true,
          }),
        });
      } else {
        // 前端请求
        const fetchChat = ProviderMap[provider].fetchChat;
        response = await fetchChat(
          {
            key: this.globalSettings.APIKeys[provider] || undefined,
            messages,
            temperature: this.sessionSettings.APITemperature,
            model: this.sessionSettings.model,
            stream: true,
          },
          {},
          this.controller?.signal,
        );
      }

      if (!response.ok) {
        this.loading = false;
        const json = await response.json();
        this.messageList = [
          ...this.messageList,
          {
            role: "error",
            content: JSON.stringify(json),
          },
        ];
        return;
      }
      const decoder = new TextDecoder();
      const streamParser = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === "event") {
          try {
            const [done, char] = ProviderMap[provider].parseData(event);
            if (done) {
              this.loading = false;
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
                    provider: this.sessionSettings.provider,
                    model: this.sessionSettings.model,
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
    stopStreamFetch: $(function () {
      if (this.controller) this.controller.abort();
      this.loading = false;
      this.archiveCurrentMessage();
    }),
    sendMessage: $(async function (this, content, fakeRole) {
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
          this.messageList.at(-1)?.role !== "user" &&
          this.messageList.at(-2)?.role === "user"
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
          const currentMessage: ChatMessage = this.inputImage
            ? {
                role: "user",
                content: inputValue,
                images: [this.inputImage],
                provider: this.sessionSettings.provider,
                model: this.sessionSettings.model,
              }
            : {
                role: "user",
                content: inputValue,
                provider: this.sessionSettings.provider,
                model: this.sessionSettings.model,
              };
          this.messageList = [...this.messageList, currentMessage];
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
                  (["assistant", "system"].includes(k.role) &&
                    k.type !== "temporary" &&
                    _[i - 1]?.role === "user") ||
                  (k.role === "user" &&
                    _[i + 1]?.role !== "error" &&
                    _[i + 1]?.type !== "temporary"),
              )
            : this.messageList.filter(
                (k) => k.role === "system" || k.type === "locked",
              );
          const messages = (
            this.sessionSettings.continuousDialogue
              ? this.validContext
              : [...this.validContext, currentMessage]
          ).map((v) => {
            if (v.images) {
              return {
                role: v.role,
                content: v.content,
                images: v.images,
              };
            }
            return {
              role: v.role,
              content: v.content,
            };
          });
          await this.fetchGPT(messages);
        } catch (error: any) {
          this.loading = false;
          this.controller = undefined;
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
    loadSession: $(async function (this, sessionId: string) {
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
            setTimeout(() => scrollToBottom(), 1000);
          }
        }
      } catch {
        console.log("localStorage parse error");
      }

      const { Fzf } = await import("fzf");
      setTimeout(() => {
        const sessions = fetchAllSessions();
        FZFData.sessionOptions = sessions
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
            desc:
              "其实点击顶部 Logo 也可以直接回到主对话。" +
                sessions
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

  useContextProvider(ChatContext, store);

  useVisibleTask$(() => {
    const json = localStorage.getItem("gpt-APIKeys");
    if (json) {
      try {
        store.globalSettings = JSON.parse(json);
      } catch (e) {
        console.log(e);
      }
    }
    const sessionId =
      new URLSearchParams(location.search).get("session") || "index";
    store.loadSession(sessionId);
  });

  useVisibleTask$(({ track }) => {
    track(() => store.messageList.length);
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

  return <Chat user={session.value?.user} />;
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

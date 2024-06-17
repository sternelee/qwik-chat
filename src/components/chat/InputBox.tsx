import {
  $,
  component$,
  useComputed$,
  useContext,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import {
  SUPPORT_VISION,
  countTokensDollar,
  defaultInputBoxHeight,
  FZFData,
  shownTokens,
  ChatContext,
} from "~/store";
import type { Option } from "~/types";
import { blobToBase64, isMobile, scrollToBottom } from "~/utils";
import { countTokens } from "~/utils/tokens";
import SettingAction from "./SettingAction";
import SlashSelector from "./SlashSelector";

export default component$<{
  width: string;
}>(({ width }) => {
  const navigator = useNavigate();
  const store = useContext(ChatContext);
  const candidateOptions = useSignal<Option[]>([]);
  const compositionEnd = useSignal(true);
  const inputRef = useSignal<HTMLTextAreaElement | undefined>();
  const currentModel = useComputed$(() => store.sessionSettings.model);

  const currentMessageToken$ = useComputed$(() =>
    countTokensDollar(store.currentMessageToken, currentModel.value, "output")
  );

  useVisibleTask$(async () => {
    const { Fzf } = await import("fzf");
    import("~/utils/parse").then(({ parsePrompts }) => {
      FZFData.promptOptions = parsePrompts().map(
        (k) => ({ title: k.desc, desc: k.detail }) as Option
      );
      FZFData.fzfPrompts = new Fzf(FZFData.promptOptions, {
        selector: (k) => `${k.title}\n${k.desc}`,
      });
    });
    inputRef.value?.focus();
    document.addEventListener("paste", async (ev) => {
      // 支持图片的 model
      if (
        SUPPORT_VISION.includes(currentModel.value) &&
        !store.sessionSettings.continuousDialogue
      ) {
        return;
      }
      const items = ev.clipboardData && ev.clipboardData.items;
      let file = null;
      if (items && items.length) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf("image") !== -1) {
            file = items[i].getAsFile();
            break;
          }
        }
      }
      if (file) {
        const img = await blobToBase64(file);
        console.log(img);
        store.inputImage = img;
      }
    });
  });

  useVisibleTask$(async ({ track }) => {
    // const { countTokensInWorker } = await import("~/wokers");

    track(() => store.inputContent);
    track(() => store.validContent);
    track(() => store.currentAssistantMessage);

    // countTokensInWorker(store.inputContent).then((res) => {
    //   store.inputContentToken = res;
    // });
    // countTokensInWorker(store.validContent).then((res) => {
    //   store.contextToken = res;
    // });
    // countTokensInWorker(store.currentAssistantMessage).then((res) => {
    //   store.currentMessageToken = res;
    // });
    store.inputContentToken = countTokens(store.inputContent);
    store.contextToken = countTokens(store.validContent);
    store.currentMessageToken = countTokens(store.currentAssistantMessage);
  });

  useVisibleTask$(({ track }) => {
    track(() => store.loading);
    if (!isMobile() && !store.loading) inputRef.value?.focus();
  });

  const setSuitableHeight = $(async () => {
    const scrollHeight = inputRef.value?.scrollHeight;
    if (scrollHeight) {
      const inputBoxHeight =
        scrollHeight > window.innerHeight / 2
          ? window.innerHeight / 2
          : scrollHeight;
      store.inputBoxHeight = Math.max(inputBoxHeight, defaultInputBoxHeight);
    }
  });

  useVisibleTask$(({ track }) => {
    track(() => store.inputContent);
    if (store.inputContent) {
      if (store.inputContent === "") {
        candidateOptions.value = [];
      } else {
        setSuitableHeight();
      }
    } else {
      store.inputBoxHeight = defaultInputBoxHeight;
    }
  });

  const selectOption = $((option?: Option) => {
    if (option) {
      if (option.extra?.id) {
        if (option.extra?.id === "index") window.location.href = "/";
        else {
          navigator("/?session=" + option.extra.id);
          store.loadSession(option.extra.id);
          store.inputContent = "";
        }
      } else {
        store.inputContent = option.desc;
      }
    }
    candidateOptions.value = [];
    setSuitableHeight();
  });

  const searchOptions = $((value: string) => {
    if (/^\s{2,}$|^\/{2,}$/.test(value)) {
      return (candidateOptions.value = FZFData.sessionOptions);
    }
    if (value === "/" || value === " ") {
      return (candidateOptions.value = FZFData.promptOptions);
    }

    const sessionQuery = value.replace(
      /^\s{2,}(.*)\s*$|^\/{2,}(.*)\s*$/,
      "$1$2"
    );
    const promptQuery = value.replace(/^\s(.*)\s*$|^\/(.*)\s*$/, "$1$2");
    if (sessionQuery !== value) {
      candidateOptions.value = FZFData.fzfSessions!.find(sessionQuery).map(
        (k) => ({
          ...k.item,
          positions: k.positions,
        })
      );
    } else if (promptQuery !== value) {
      candidateOptions.value = FZFData.fzfPrompts!.find(promptQuery).map(
        (k) => ({
          ...k.item,
          positions: k.positions,
        })
      );
    }
  });

  const handleInput = $(() => {
    // 重新设置高度，让输入框可以自适应高度，-1 是为了标记不是初始状态
    store.inputBoxHeight = defaultInputBoxHeight;
    if (!compositionEnd.value) return;
    const value = inputRef.value?.value;
    if (value) {
      store.inputContent = value;
      searchOptions(value);
    } else {
      store.inputContent = "";
      candidateOptions.value = [];
    }
  });

  return (
    <div
      class="pb-2em px-2em fixed bottom-0 z-100"
      style={{
        width: width === "init" ? "100%" : width,
        background: "hsl(var(--b1) / var(--un-bg-opacity, 1))",
      }}
    >
      <div
        style={{
          transition: "opacity 1s ease-in-out",
          opacity: width === "init" ? 100 : 100,
        }}
      >
        {store.loading && (
          <div
            class="animate-gradient-border cursor-pointer dark:bg-#292B31/90 bg-#E7EBF0/80 h-3em flex items-center justify-center"
            onClick$={() => store.stopStreamFetch()}
          >
            <span class="dark:text-slate text-slate-7">
              AI 正在思考 / {shownTokens(store.currentMessageToken)} /
              {currentMessageToken$.value.toFixed(4)}
            </span>
          </div>
        )}
        {!store.loading && !candidateOptions.value.length && <SettingAction />}
        {!store.loading && (
          <>
            <SlashSelector
              options={candidateOptions.value}
              select={selectOption}
            ></SlashSelector>
            <div class="flex items-end relative">
              {store.inputImage && (
                <img
                  src={store.inputImage}
                  onClick$={() => {
                    store.inputImage = "";
                  }}
                  width={store.inputBoxHeight}
                  height={store.inputBoxHeight}
                  style={{
                    "margin-right": "6px",
                  }}
                />
              )}
              <textarea
                ref={inputRef}
                placeholder="与 ta 对话吧"
                autocomplete="off"
                value={store.inputContent}
                autoCapitalize="off"
                autoFocus={false}
                wrap="hard"
                spellcheck={false}
                class={{
                  "textarea textarea-bordered self-end p-3 pr-2.2em resize-none w-full":
                    true,
                  "rounded-t": candidateOptions.value.length === 0,
                  "rounded-b": true,
                }}
                style={{
                  height: store.inputBoxHeight + "px",
                }}
                onClick$={() => scrollToBottom()}
                onInput$={[handleInput, setSuitableHeight]}
                onCompositionstart$={$(() => {
                  compositionEnd.value = false;
                })}
                onCompositionEnd$={[
                  $(() => {
                    compositionEnd.value = true;
                  }),
                  handleInput,
                ]}
                onKeyDown$={$((e: any) => {
                  if (e.isComposing) return;
                  if (candidateOptions.value.length) {
                    if (
                      e.key === "ArrowUp" ||
                      e.key === "ArrowDown" ||
                      e.keyCode === 13
                    ) {
                      e.preventDefault();
                    }
                  } else if (e.keyCode === 13) {
                    if (!e.shiftKey && store.globalSettings.enterToSend) {
                      e.preventDefault();
                      store.sendMessage(undefined, store.fakeRole);
                    }
                  } else if (e.key === "ArrowUp") {
                    const userMessages = store.messageList
                      .filter((k) => k.role === "user")
                      .map((k) => k.content);
                    const content = userMessages.at(-1);
                    if (content && !store.inputContent) {
                      e.preventDefault();
                      store.inputContent = content;
                    }
                  }
                })}
              />
              {store.inputContent && (
                <div
                  class={{
                    "absolute flex text-1em items-center": true,
                    "right-2.5em bottom-1em":
                      store.inputBoxHeight <= defaultInputBoxHeight,
                    "right-0.8em top-0.8em":
                      store.inputBoxHeight > defaultInputBoxHeight,
                  }}
                >
                  <button
                    class="i-carbon:add-filled rotate-45 text-slate-7 dark:text-slate text-op-20! hover:text-op-60!"
                    onClick$={() => {
                      store.inputContent = "";
                      inputRef.value?.focus();
                    }}
                  />
                </div>
              )}
              <div class="absolute right-0.5em bottom-0.8em flex items-center">
                <button
                  title="发送"
                  onClick$={() => store.sendMessage(undefined, store.fakeRole)}
                  class="i-carbon:send-filled text-1.5em text-slate-7 dark:text-slate text-op-80! hover:text-op-100!"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
});

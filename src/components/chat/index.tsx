import {
  useSignal,
  component$,
  useContext,
  useComputed$,
} from "@builder.io/qwik";
import ThemeToggle from "~/components/chat/ThemeToggle";
import MessageItem from "~/components/chat/MessageItem";
import InputBox from "~/components/chat/InputBox";
import ProviderMap from "~/providers";
import type { Model } from "~/types";
import {
  countTokensDollar,
  defaultInputBoxHeight,
  shownTokens,
  ChatContext,
  defaultMessage,
} from "~/store";
import { scrollToBottom } from "~/utils";
import { useAuthSignin, useAuthSignout } from "~/routes/plugin@auth";

interface IChatProps {
  user:
    | {
        name?: string | null | undefined;
        email?: string | null | undefined;
        image?: string | null | undefined;
      }
    | undefined;
}

export default component$<IChatProps>(({ user }) => {
  const avatar = useComputed$(() => user?.image);
  const signIn = useAuthSignin();
  const signOut = useAuthSignout();
  const store = useContext(ChatContext);
  const containerWidth = useSignal("init");

  const countContextTokensDollar = (
    contextToken: number,
    inputContentToken: number,
    model: Model
  ) => {
    const c1 = countTokensDollar(contextToken, model, "input");
    const c2 = countTokensDollar(inputContentToken, model, "input");
    return (c1 + c2).toFixed(4);
  };

  const countContextToken = (contextToken: number, model: Model) => {
    return countTokensDollar(contextToken, model, "input");
  };

  const defaultMessage$ = useComputed$(() => {
    return {
      ...defaultMessage,
      content: `💡请自行填写 APIKey，点击👉 [去申请](${
        ProviderMap[store.sessionSettings.provider].href
      })\n ${defaultMessage.content}`,
    };
  });

  return (
    <main class="mt-4">
      <div
        class="flex items-center px-2em sticky top-0 z-1"
        style="background-color: var(--c-bg);"
      >
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
              ></a>
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
              ></a>
              <span
                onClick$={() => scrollToBottom(0)}
                class="flash-logo cursor-pointer text-5 font-bold ml-4"
              >
                {ProviderMap[store.sessionSettings.provider].name} Chat
              </span>
            </>
          )}
        </div>
        <ThemeToggle />
        {avatar.value ? (
          <div class="relative group cursor-pointer">
            <img
              src={avatar.value}
              class="rounded-full"
              width={24}
              height={24}
            />
            <ul class="absolute pt-2 bg-slate-100 hidden group-hover:block">
              <li
                onClick$={() =>
                  signOut.submit({
                    callbackUrl: "https://qwik-chat.leeapp.cn",
                  })
                }
              >
                <i class="absolute block i-carbon:logout text-2xl" />
              </li>
            </ul>
          </div>
        ) : (
          <div class="relative group cursor-pointer">
            <i class="block i-carbon:login text-2xl" />
            <ul class="absolute pt-2 bg-slate-100 hidden group-hover:block">
              <li
                onClick$={() =>
                  signIn.submit({
                    providerId: "github",
                    options: { callbackUrl: "https://qwik-chat.leeapp.cn" },
                  })
                }
              >
                <i class="block i-carbon:logo-github text-2xl" />
              </li>
              <li
                class="mt-1"
                onClick$={() =>
                  signIn.submit({
                    providerId: "google",
                    options: { callbackUrl: "https://qwik-chat.leeapp.cn" },
                  })
                }
              >
                <i class="block i-carbon:logo-google text-2xl" />
              </li>
            </ul>
          </div>
        )}
      </div>
      <div
        id="message-container"
        class="px-1em mt-4"
        style={{ "margin-bottom": `calc(6em + ${defaultInputBoxHeight}px)` }}
      >
        <div id="message-container-img" class="px-1em">
          {!store.messageList.length && (
            <MessageItem hiddenAction={true} message={defaultMessage$.value} />
          )}
          {store.messageList.map((message, index) => (
            <MessageItem
              message={message}
              hiddenAction={store.loading || message.type === "temporary"}
              key={index}
              index={index}
            />
          ))}
        </div>
        {!store.loading &&
          (store.contextToken || store.inputContentToken) > 0 && (
            <div class="flex items-center px-1em text-0.8em">
              <hr class="flex-1 border-slate/40" />
              {store.inputContentToken > 0 && (
                <span class="mx-1 text-slate/40">
                  {`有效上下文 + 提问 Tokens : ${shownTokens(
                    store.contextToken + store.inputContentToken
                  )}(`}
                  <span
                    class={{
                      "text-red-500": store.remainingToken < 0,
                    }}
                  >
                    {shownTokens(store.remainingToken)}
                  </span>
                  {`)/${countContextTokensDollar(
                    store.contextToken,
                    store.inputContentToken,
                    store.sessionSettings.model
                  )}`}
                </span>
              )}
              {store.inputContentToken === 0 && (
                <span class="mx-1 text-slate/40">
                  {`有效上下文 Tokens : ${shownTokens(
                    store.contextToken
                  )}/$${countContextToken(
                    store.contextToken,
                    store.sessionSettings.model
                  )}`}
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

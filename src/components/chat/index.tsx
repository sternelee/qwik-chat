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
import { useAuthSignin } from "~/routes/plugin@auth";

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
          <img src={avatar.value} class="rounded-full" width={24} height={24} />
        ) : (
          <i
            class="cursor-pointer"
            onClick$={() =>
              signIn.submit({
                providerId: "github",
                options: { callbackUrl: "https://qwik-chat.leeapp.cn" },
              })
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                fill-rule="evenodd"
                d="M11.999 1C5.926 1 1 5.925 1 12c0 4.86 3.152 8.983 7.523 10.437c.55.102.75-.238.75-.53c0-.26-.009-.952-.014-1.87c-3.06.664-3.706-1.475-3.706-1.475c-.5-1.27-1.221-1.61-1.221-1.61c-.999-.681.075-.668.075-.668c1.105.078 1.685 1.134 1.685 1.134c.981 1.68 2.575 1.195 3.202.914c.1-.71.384-1.195.698-1.47c-2.442-.278-5.01-1.222-5.01-5.437c0-1.2.428-2.183 1.132-2.952c-.114-.278-.491-1.397.108-2.91c0 0 .923-.297 3.025 1.127A10.536 10.536 0 0 1 12 6.32a10.49 10.49 0 0 1 2.754.37c2.1-1.424 3.022-1.128 3.022-1.128c.6 1.514.223 2.633.11 2.911c.705.769 1.13 1.751 1.13 2.952c0 4.226-2.572 5.156-5.022 5.428c.395.34.747 1.01.747 2.037c0 1.47-.014 2.657-.014 3.017c0 .295.199.637.756.53C19.851 20.979 23 16.859 23 12c0-6.075-4.926-11-11.001-11"
              />
            </svg>
          </i>
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

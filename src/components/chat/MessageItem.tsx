import {
  $,
  component$,
  useContext,
  useSignal,
  useComputed$,
} from "@builder.io/qwik";
import { useThrottle, useCopyCode } from "~/hooks";
import { ChatContext } from "~/store";
import type { ChatMessage } from "~/types";
import { copyToClipboard, throttle } from "~/utils";
import MessageAction from "./MessageAction";
import { md } from "~/markdown-it";

interface Props {
  message: ChatMessage;
  hiddenAction: boolean;
  index?: number;
}

export default component$<Props>((props) => {
  const renderedMarkdown = useSignal("");
  const store = useContext(ChatContext);
  const roleClass = {
    error: "bg-gradient-to-r from-red-400 to-red-700",
    system: "bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300",
    user: "bg-gradient-to-r from-red-300 to-blue-700 ",
    assistant: "bg-gradient-to-r from-yellow-300 to-red-700 ",
  };
  useCopyCode();
  const copy = $(() => {
    copyToClipboard(props.message.content);
  });

  const edit = $(() => {
    store.inputContent = props.message.content;
  });

  const del = $(() => {
    store.messageList =
      store.messageList[props.index!].role === "user"
        ? store.messageList.filter(
          (_, i) =>
            !(
              i === props.index ||
              (i === props.index! + 1 && _.role !== "user")
            ),
        )
        : store.messageList.filter((_, i) => i !== props.index);
  });

  const reAnswer = $(() => {
    let question = "";
    if (store.messageList[props.index!].role === "user") {
      question = store.messageList[props.index!].content;
      store.messageList = store.messageList.filter(
        (_, i) =>
          !(i === props.index || (i === props.index! + 1 && _.role !== "user")),
      );
    } else {
      question = store.messageList[props.index! - 1].content;
      store.messageList = store.messageList.filter(
        (_, i) => !(i === props.index || i === props.index! - 1),
      );
    }
    store.sendMessage(question);
  });

  const lockMessage = $(() => {
    if (props.index === undefined) return;
    if (store.messageList[props.index].role === "user") {
      store.messageList = store.messageList.map((k, i) => {
        if (
          i === props.index ||
          (i === props.index! + 1 && k.role === "assistant")
        ) {
          return { ...k, type: k.type === "locked" ? undefined : "locked" };
        }
        return k;
      });
    } else {
      store.messageList = store.messageList.map((k, i) => {
        if (i === props.index! - 1 || i === props.index) {
          return { ...k, type: k.type === "locked" ? undefined : "locked" };
        }
        return k;
      });
    }
  });

  const msgContent = useComputed$(() => {
    return (
      (props.message.images || []).map((v) => `![](${v})`) +
      props.message.content
    );
  });

  useThrottle(
    msgContent,
    50,
    $((content: string) => {
      renderedMarkdown.value = md.render(content);
    }),
  );

  return (
    <slot>
      {renderedMarkdown.value && (
        <div
          style={{
            transition: "all 0.3s",
          }}
          class={{
            "group flex gap-3 px-4 mx--4 rounded-lg transition-colors animated animated-fade-in animated-faster sm:hover:bg-slate/6 dark:sm:hover:bg-slate/5 relative message-item":
              true,
            temporary: props.message.type === "temporary",
          }}
        >
          <div
            class={`shadow-slate-5 shadow-sm dark:shadow-none shrink-0 w-7 h-7 mt-4 rounded-full op-80 flex items-center justify-center cursor-pointer ${roleClass[props.message.role]
              } ${props.message.type === "temporary" ? "animate-spin" : ""}`}
            onClick$={lockMessage}
          >
            {props.message.type === "locked" && (
              <div class="i-carbon:locked text-white" />
            )}
          </div>
          <div
            class="message prose prose-slate break-all dark:prose-invert dark:text-slate break-words overflow-hidden"
            style="max-width:100%"
            dangerouslySetInnerHTML={renderedMarkdown.value}
          />
          {!props.hiddenAction && (
            <MessageAction
              del={del}
              copy={copy}
              edit={edit}
              reAnswer={reAnswer}
              role={props.message.role}
            />
          )}
        </div>
      )}
    </slot>
  );
});

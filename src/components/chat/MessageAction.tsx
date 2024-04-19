import { $, component$, useSignal } from "@builder.io/qwik";
import type { Role } from "~/types";
import { ActionItem } from "~/components/chat/SettingAction";

interface Props {
  role: Role;
  edit: () => void;
  del: () => void;
  copy: () => void;
  reAnswer: () => void;
}

export default component$<Props>(({ role, edit, del, copy, reAnswer }) => {
  const copied = useSignal(false);
  const copiedCb = $(() => {
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 1000);
  });
  return (
    <div
      class="flex absolute items-center justify-between <sm:top--4 <sm:right-0 top-2 right-2 text-sm group-hover:opacity-100 group-focus:opacity-100 opacity-0 rounded"
      style={{
        background: "hsl(var(--b1) / var(--un-bg-opacity, 1))",
      }}
    >
      {role === "assistant" && (
        <ActionItem
          label="复制"
          onClick={[copy, copiedCb]}
          icon={copied.value ? "i-un:copied" : "i-un:copy"}
        />
      )}
      {role === "user" && (
        <ActionItem label="编辑" onClick={edit} icon={"i-carbon:edit"} />
      )}
      <ActionItem label="重新回答" onClick={reAnswer} icon={"i-carbon:reset"} />
      <ActionItem label="删除" onClick={del} icon={"i-carbon:trash-can"} />
    </div>
  );
});

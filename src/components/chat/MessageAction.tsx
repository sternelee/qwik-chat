import { $, component$, useSignal } from "@builder.io/qwik";
import type { Role } from "~/types";

interface Props {
  role: Role;
  edit: () => void;
  del: () => void;
  copy: () => void;
  reAnswer: () => void;
}

export default component$<Props>(({ role, edit, del, copy, reAnswer }) => {
  const copied = useSignal(false);
  return (
    <div class="flex absolute items-center justify-between <sm:top--4 <sm:right-0 top-2 right-2 text-sm text-slate-7 dark:text-slate group-hover:opacity-100 group-focus:opacity-100 opacity-0 dark:bg-#292B32 bg-#E7EBF0 rounded">
      {role === "assistant" && (
        <ActionItem
          label="复制"
          onClick={[
            copy(),
            $(() => {
              copied.value = true;
              setTimeout(() => {
                copied.value = false;
              }, 1000);
            }),
          ]}
          icon={copied.value ? "i-un:copied" : "i-un:copy"}
        />
      )}
      {role === "user" && <ActionItem label="编辑" onClick={edit} icon={"i-carbon:edit"} />}
      <ActionItem label="重新回答" onClick={reAnswer} icon={"i-carbon:reset"} />
      <ActionItem label="删除" onClick={del} icon={"i-carbon:trash-can"} />
    </div>
  );
});

const ActionItem = component$<{
  onClick: any;
  icon: string;
  label?: string;
}>((props) => {
  return (
    <div
      class="flex items-center cursor-pointer p-2 hover:bg-slate/10 rounded text-1.2em"
      onClick$={props.onClick}
      // @ts-ignore
      tooltip={props.label}
      position="top"
    >
      <button class={props.icon} title={props.label} />
    </div>
  );
});

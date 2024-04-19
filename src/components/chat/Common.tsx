import { component$ } from "@builder.io/qwik";

interface ISwitchProp {
  checked: boolean;
  onChange?: (e: any) => void;
  class?: string;
}
export const Switch = component$<ISwitchProp>((props) => {
  return (
    <label class="relative inline-flex items-center cursor-pointer ml-1">
      <input
        type="checkbox"
        checked={props.checked}
        class="toggle toggle-sm"
        onChange$={props.onChange}
      />
    </label>
  );
});

interface ISelector {
  onChange?: (e: any) => void;
  options: { value: string; label: string }[];
  value: string;
  class?: string;
}
export const Selector = component$<ISelector>((props) => {
  return (
    <select
      name="model"
      class={`w-full bg-slate bg-op-15 rounded-sm appearance-none accent-slate text-center focus:(bg-op-20 ring-0 outline-none) ${
        props.class ?? ""
      }`}
      value={props.value}
      onChange$={props.onChange}
    >
      {props.options.map((option) => (
        <option value={option.value} key={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
});

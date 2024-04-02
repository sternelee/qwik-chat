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
        class={`sr-only peer ${props.class}`}
        onChange$={props.onChange}
      />
      <div class="w-9 h-5 bg-slate bg-op-15 peer-focus:outline-none peer-focus:ring-0  rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate" />
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
      class={`w-full bg-slate bg-op-15 rounded-sm appearance-none accent-slate text-center focus:(bg-op-20 ring-0 outline-none) ${props.class ?? ""
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

import { $, component$, type QRL, useOnWindow, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import type { Option } from "~/types";

const DefaultHeight = 350;

export default component$<{
  options: Option[];
  select: QRL<(k?: Option) => void>;
}>((props) => {
  const containerRef = useSignal<HTMLUListElement>();
  const hoverIndex = useSignal(0);
  const maxHeight = useSignal(DefaultHeight);

  useOnWindow(
    "keydown",
    $((event) => {
      const e = event as unknown as KeyboardEvent;
      if (e.key === "ArrowDown") {
        hoverIndex.value += 1;
      } else if (e.key === "ArrowUp") {
        hoverIndex.value -= 1;
      } else if (e.keyCode === 13) {
        props.select(props.options[hoverIndex.value]);
      } else if (e.key === "Escape") {
        props.select();
      }
    }),
  );

  useVisibleTask$(({ track }) => {
    track(() => hoverIndex.value);
    if (hoverIndex.value < 0) {
      hoverIndex.value = 0;
    } else if (hoverIndex.value && hoverIndex.value >= props.options.length) {
      hoverIndex.value = props.options.length - 1;
    }
  });

  useVisibleTask$(({ track }) => {
    track(() => props.options);
    if (containerRef.value && props.options.length) {
      maxHeight.value = containerRef.value.clientHeight > window.innerHeight - 130
        ? window.innerHeight - 130
        : DefaultHeight;
    }
  });

  return (
    <>
      {props.options.length > 0 && (
        <ul
          ref={containerRef!}
          class="bg-slate bg-op-20 dark:text-slate text-slate-7 overflow-y-auto rounded-t"
          style={{
            "max-height": maxHeight.value + "px",
          }}
        >
          {props.options.map((item, i) => (
            <Item
              key={i}
              option={item}
              select={props.select}
              hover={hoverIndex.value === i}
            />
          ))}
        </ul>
      )}
    </>
  );
});

const Item = component$<{
  option: Option;
  select: QRL<(k?: Option) => void>;
  hover: boolean;
}>((props) => {
  const ref = useSignal<HTMLLIElement>();

  useVisibleTask$(({ track }) => {
    track(() => props.hover);
    if (props.hover) {
      ref.value?.focus();
      ref.value?.scrollIntoView({ block: "center" });
    }
  });

  let TitleComponent: any = props.option.title;
  let DescComponent: any = props.option.desc;
  if (props.option.positions?.size) {
    const titleLen = props.option.title.length;
    const titleRange = [0, titleLen - 1];
    const descRange = [titleLen + 1, props.option.desc.length - 1];
    const { titleIndexs, descIndexs } = Array.from(props.option.positions)
      .sort((m, n) => m - n)
      .reduce(
        (acc, cur) => {
          if (cur >= titleRange[0] && cur <= titleRange[1]) {
            acc.titleIndexs.push(cur);
          } else if (cur >= descRange[0] && cur <= descRange[1]) {
            acc.descIndexs.push(cur - titleLen - 1);
          }
          return acc;
        },
        {
          titleIndexs: [] as number[],
          descIndexs: [] as number[],
        },
      );
    if (titleIndexs.length) {
      TitleComponent = props.option.title.split("").map((c, i) => {
        if (titleIndexs.includes(i)) {
          return (
            <b key={i} class="dark:text-slate-2 text-black">
              {c}
            </b>
          );
        }
        return c;
      });
    }
    if (descIndexs.length) {
      DescComponent = props.option.desc.split("").map((c, i) => {
        if (descIndexs.includes(i)) {
          return (
            <b key={i} class="dark:text-slate-2 text-black">
              {c}
            </b>
          );
        } else if (
          descIndexs[0] - 5 < i
          && descIndexs[descIndexs.length - 1] + 100 > i
        ) {
          return c;
        }
      });
    }
  }
  return (
    <li
      ref={ref!}
      class={{
        "hover:bg-slate hover:bg-op-20 py-1 px-3": true,
        "bg-slate": props.hover,
        "bg-op-20": props.hover,
      }}
      onClick$={() => props.select(props.option)}
    >
      <p class="truncate">{TitleComponent}</p>
      <p class="text-0.5em truncate">{DescComponent}</p>
    </li>
  );
});

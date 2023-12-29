import { $, type PropFunction, type Signal, useOnWindow, useSignal, useTask$ } from "@builder.io/qwik";
import { copyToClipboard } from "~/utils";

export function useDebounce<T>(
  signal: Signal,
  milliSeconds: number,
  fn?: PropFunction<(value: T) => void>,
) {
  // create the debounced Signal
  const debouncedSig = useSignal("");

  useTask$(({ track, cleanup }) => {
    // track the signal
    track(() => signal.value);

    // start timeout
    const debounced = setTimeout(async () => {
      // 1. invoke the function
      await fn!(signal.value);
      // 2. update the debouncedSig signal
      debouncedSig.value = signal.value;
    }, milliSeconds);

    // clean setTimeout each time the tracked signal changes
    cleanup(() => clearTimeout(debounced));
  });

  // Return the debouncedSig
  return debouncedSig;
}

export function throttle (callback: Function, wait: number) {
  let isThrottled = false,
    timeoutId: any,
    lastArgs: any[];
  const throttled = (...args: any[]) => {
    lastArgs = args;
    if (isThrottled) return;
    isThrottled = true;
    timeoutId = setTimeout(() => {
      callback(...lastArgs);
      isThrottled = false;
    }, wait);
  };
  const clear = () => {
    clearTimeout(timeoutId);
    isThrottled = false;
  };
  return Object.assign(throttled, { clear });
  // return throttled
}

export function useThrottle<T>(
  signal: Signal,
  milliSeconds: number,
  fn?: PropFunction<(value: T) => void>,
) {
  const throttleSig = useSignal("");
  const lastTime = useSignal(0);
  useTask$(({ track, cleanup }) => {
    track(() => signal.value);
    const currentTime = Date.now();
    const throttled = setTimeout(async () => {
      await fn!(signal.value);
      throttleSig.value = signal.value;
    }, milliSeconds);
    if (currentTime >= lastTime.value + milliSeconds) {
      clearTimeout(throttled)
      fn!(signal.value);
      lastTime.value = currentTime;
      throttleSig.value = signal.value;
    }

    cleanup(() => clearTimeout(throttled));
  });
  return throttleSig;
}

export function useCopyCode() {
  const timeoutIdMap: Map<HTMLElement, NodeJS.Timeout> = new Map();
  useOnWindow(
    "click",
    $((e) => {
      const el = e.target as HTMLElement;
      if (el.matches(".copy")) {
        const parent = el.parentElement;
        const sibling = el.nextElementSibling as HTMLPreElement | null;
        if (!parent || !sibling) {
          return;
        }
        const text = sibling.innerText;
        copyToClipboard(text.trim()).then(() => {
          el.classList.add("copied");
          clearTimeout(timeoutIdMap.get(el));
          const timeoutId = setTimeout(() => {
            el.classList.remove("copied");
            el.blur();
            timeoutIdMap.delete(el);
          }, 2000);
          timeoutIdMap.set(el, timeoutId);
        });
      }
    }),
  );
}

export type Setter<in out T> = {
  <U extends T>(
    ...args: undefined extends T ? [] : [value: (prev: T) => U]
  ): undefined extends T ? undefined : U;
  <U extends T>(value: (prev: T) => U): U;
  <U extends T>(value: Exclude<U, Function>): U;
  <U extends T>(value: Exclude<U, Function> | ((prev: T) => U)): U;
};

export type Accessor<T> = () => T;

export function observerEl(options: {
  target: HTMLElement;
  root?: HTMLElement | null;
  threshold?: number;
  show: () => any;
}) {
  const { target, root = null, threshold = 0.01, show = () => null } = options;
  const io = new window.IntersectionObserver(
    (entries) => {
      if (entries[0].intersectionRatio >= threshold) {
        show();
      }
    },
    { threshold: [threshold], root },
  );
  io.observe(target);
  // onCleanup(() => io.disconnect())
}

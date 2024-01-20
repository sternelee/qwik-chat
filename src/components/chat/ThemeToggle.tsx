import { $, component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { LocalStorageKey } from "~/types";

export default component$(() => {
  const isDark = useSignal(false);
  const isAppearanceTransition = useSignal(false);

  const toggle = $((flag: boolean) => {
    document.documentElement.classList.toggle("dark", flag);
    document
      ?.querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", flag ? "#16161a" : "#f6f8fa");
  });

  useVisibleTask$(() => {
    isAppearanceTransition.value =
      // @ts-expect-error: Transition API
      document.startViewTransition &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    const theme = localStorage.getItem(LocalStorageKey.THEME);
    isDark.value = theme ? theme === "dark" : prefersDark;
    toggle(isDark.value);
  });
  const handleToggleTheme = $((event: MouseEvent) => {
    localStorage.setItem(
      LocalStorageKey.THEME,
      !isDark.value ? "dark" : "light"
    );
    if (!isAppearanceTransition.value || !event) {
      isDark.value = !isDark.value;
      toggle(isDark.value);
    } else {
      const x = event.clientX;
      const y = event.clientY;
      const endRadius = Math.hypot(
        Math.max(x, innerWidth - x),
        Math.max(y, innerHeight - y)
      );
      const transition = document
        // @ts-expect-error: Transition API
        .startViewTransition(async () => {
          isDark.value = !isDark.value;
          toggle(isDark.value);
        });

      transition.ready.then(() => {
        const clipPath = [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ];
        document.documentElement.animate(
          {
            clipPath: isDark.value ? [...clipPath].reverse() : clipPath,
          },
          {
            duration: 300,
            easing: "ease-in",
            pseudoElement: isDark.value
              ? "::view-transition-old(root)"
              : "::view-transition-new(root)",
          }
        );
      });
    }
  });

  return (
    <button
      id="theme-toggle"
      class="flex items-center justify-center w-10 h-10 rounded-md border transition-colors border-0 hover:animate-rubber-band ml-auto mr-2"
      onClick$={handleToggleTheme}
    >
      <svg width="20px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path
          class="dark:fill-transparent fill-black"
          fill-rule="evenodd"
          d="M12 17.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zm0 1.5a7 7 0 1 0 0-14 7 7 0 0 0 0 14zm12-7a.8.8 0 0 1-.8.8h-2.4a.8.8 0 0 1 0-1.6h2.4a.8.8 0 0 1 .8.8zM4 12a.8.8 0 0 1-.8.8H.8a.8.8 0 0 1 0-1.6h2.5a.8.8 0 0 1 .8.8zm16.5-8.5a.8.8 0 0 1 0 1l-1.8 1.8a.8.8 0 0 1-1-1l1.7-1.8a.8.8 0 0 1 1 0zM6.3 17.7a.8.8 0 0 1 0 1l-1.7 1.8a.8.8 0 1 1-1-1l1.7-1.8a.8.8 0 0 1 1 0zM12 0a.8.8 0 0 1 .8.8v2.5a.8.8 0 0 1-1.6 0V.8A.8.8 0 0 1 12 0zm0 20a.8.8 0 0 1 .8.8v2.4a.8.8 0 0 1-1.6 0v-2.4a.8.8 0 0 1 .8-.8zM3.5 3.5a.8.8 0 0 1 1 0l1.8 1.8a.8.8 0 1 1-1 1L3.5 4.6a.8.8 0 0 1 0-1zm14.2 14.2a.8.8 0 0 1 1 0l1.8 1.7a.8.8 0 0 1-1 1l-1.8-1.7a.8.8 0 0 1 0-1z"
        ></path>
        <path
          class="fill-transparent dark:fill-gray"
          fill-rule="evenodd"
          d="M16.5 6A10.5 10.5 0 0 1 4.7 16.4 8.5 8.5 0 1 0 16.4 4.7l.1 1.3zm-1.7-2a9 9 0 0 1 .2 2 9 9 0 0 1-11 8.8 9.4 9.4 0 0 1-.8-.3c-.4 0-.8.3-.7.7a10 10 0 0 0 .3.8 10 10 0 0 0 9.2 6 10 10 0 0 0 4-19.2 9.7 9.7 0 0 0-.9-.3c-.3-.1-.7.3-.6.7a9 9 0 0 1 .3.8z"
        ></path>
      </svg>
    </button>
  );
});

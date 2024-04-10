import { $, component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { LocalStorageKey } from "~/types";

const themes = [
  "light",
  "dark",
  "cupcake",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "halloween",
  "garden",
  "forest",
  "aqua",
  "black",
  "luxury",
  "dracula",
  "cmyk",
  "autumn",
  "business",
  "acid",
  "night",
  "coffee",
  "winter",
];

const ThemeButton = component$<{ name: string; theme: string; onClick: any }>(
  ({ name, theme, onClick }) => {
    return (
      <button
        class="outline-base-content text-start outline-offset-4"
        data-set-theme={name}
        onClick$={onClick}
      >
        <span
          data-theme={name}
          class="bg-base-100 rounded-btn text-base-content block w-full cursor-pointer font-sans"
        >
          <span class="grid grid-cols-5 grid-rows-3">
            <span class="col-span-5 row-span-3 row-start-1 flex items-center gap-2 px-4 py-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                class={{
                  "h-3 w-3 shrink-0": true,
                  invisible: theme !== name,
                }}
              >
                <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"></path>
              </svg>
              <span class="flex-grow text-sm">{name}</span>
              <span class="flex h-full shrink-0 flex-wrap gap-1">
                <span class="bg-primary rounded-badge w-2"></span>
                <span class="bg-secondary rounded-badge w-2"></span>
                <span class="bg-accent rounded-badge w-2"></span>
                <span class="bg-neutral rounded-badge w-2"></span>
              </span>
            </span>
          </span>
        </span>
      </button>
    );
  }
);

export default component$(() => {
  const theme = useSignal("light");
  const isAppearanceTransition = useSignal(false);

  const toggle = $((t: string) => {
    document.documentElement.setAttribute("data-theme", t);
  });

  useVisibleTask$(() => {
    isAppearanceTransition.value =
      // @ts-expect-error: Transition API
      document.startViewTransition &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    const t =
      localStorage.getItem(LocalStorageKey.THEME) ||
      (prefersDark ? "dark" : "light");
    toggle(t);
  });
  const handleToggleTheme = $((t: string, event: MouseEvent) => {
    theme.value = t;

    localStorage.setItem(LocalStorageKey.THEME, t);
    if (!isAppearanceTransition.value || !event) {
      toggle(t);
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
          toggle(t);
        });

      transition.ready.then(() => {
        const clipPath = [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ];
        document.documentElement.animate(
          {
            clipPath: clipPath,
          },
          {
            duration: 300,
            easing: "ease-in",
            pseudoElement: "::view-transition-new(root)",
          }
        );
      });
    }
  });

  return (
    <div title="Change Theme" class="dropdown dropdown-end">
      <div role="button" tabIndex={0} class="btn btn-ghost">
        <svg
          width="20"
          height="20"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          class="h-5 w-5 stroke-current md:hidden"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
          ></path>
        </svg>
        <span class="hidden font-normal md:inline">Theme</span>
        <svg
          width="12px"
          height="12px"
          class="h-2 w-2 fill-current opacity-60 sm:inline-block"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 2048 2048"
        >
          <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
        </svg>
      </div>
      <div
        tabIndex={0}
        class="dropdown-content bg-base-200 text-base-content rounded-box top-px h-[28.6rem] max-h-[calc(100vh-10rem)] w-56 overflow-y-auto border border-white/5 shadow-2xl outline outline-1 outline-black/5 mt-14"
      >
        <div class="grid grid-cols-1 gap-3 p-3">
          {themes.map((t) => (
            <ThemeButton
              key={t}
              name={t}
              theme={theme.value}
              onClick={$((event: MouseEvent) => {
                handleToggleTheme(t, event);
              })}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

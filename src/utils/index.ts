import { throttle } from "lodash";
export * from "./storage";

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function copyToClipboard(text: string) {
  if (!text) return;
  try {
    return await navigator.clipboard.writeText(text);
  } catch {
    const element = document.createElement("textarea");
    const previouslyFocusedElement = document.activeElement;

    element.value = text;

    // Prevent keyboard from showing on mobile
    element.setAttribute("readonly", "");

    element.style.contain = "strict";
    element.style.position = "absolute";
    element.style.left = "-9999px";
    element.style.fontSize = "12pt"; // Prevent zooming on iOS

    const selection = document.getSelection();
    const originalRange = selection
      ? selection.rangeCount > 0 && selection.getRangeAt(0)
      : null;

    document.body.appendChild(element);
    element.select();

    // Explicit selection workaround for iOS
    element.selectionStart = 0;
    element.selectionEnd = text.length;

    document.execCommand("copy");
    document.body.removeChild(element);

    if (originalRange) {
      selection!.removeAllRanges(); // originalRange can't be truthy when selection is falsy
      selection!.addRange(originalRange);
    }

    // Get the focus back on the previously focused element, if any
    if (previouslyFocusedElement) {
      (previouslyFocusedElement as HTMLElement).focus();
    }
  }
}

export function isMobile() {
  return /Mobi|Android|iPhone/i.test(navigator.userAgent);
}

export function dateFormat(date: Date, fmt = "YYYY-mm-dd HH:MM") {
  let ret;
  const opt = {
    "Y+": date.getFullYear().toString(),
    "m+": (date.getMonth() + 1).toString(),
    "d+": date.getDate().toString(),
    "H+": date.getHours().toString(),
    "M+": date.getMinutes().toString(),
    "S+": date.getSeconds().toString(), // second
  };
  Object.entries(opt).forEach(([k, v]) => {
    ret = new RegExp("(" + k + ")").exec(fmt);
    if (ret) {
      fmt = fmt.replace(
        ret[1],
        ret[1].length == 1 ? v : v.padStart(ret[1].length, "0")
      );
    }
  });
  return fmt;
}

export function splitKeys(keys: string) {
  return keys
    .trim()
    .split(/\s*[\|\n]\s*/)
    .filter((k) => /sk-\w{48}/.test(k));
}

export function randomKey(keys: string[]) {
  return keys.length ? keys[Math.floor(Math.random() * keys.length)] : "";
}

// export const throttle = <R, A extends any[]>(
//   fn: (...args: A) => R,
//   delay: number
// ): [(...args: A) => R | undefined, () => void] => {
//   let wait = false;
//   let timeout: any;
//   let cancelled = false;
//   return [
//     (...args: A) => {
//       if (cancelled) return undefined;
//       if (wait) return undefined;
//       const val = fn(...args);
//       wait = true;
//       timeout = setTimeout(() => {
//         wait = false;
//       }, delay);
//       return val;
//     },
//     () => {
//       cancelled = true;
//       clearTimeout(timeout);
//     },
//   ];
// };

export const scrollToBottom = throttle((top = document.body.scrollHeight) => {
  window.scrollTo({
    top,
    behavior: "smooth",
  });
}, 250);

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: (RequestInit & { timeout?: number }) | undefined
) {
  const { timeout = 500 } = init ?? {};

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const response = await fetch(input, {
    ...init,
    signal: controller.signal,
  });
  clearTimeout(id);
  return response;
}

export function generateId() {
  const chars =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export function isEmoji(character: string) {
  const regex = new RegExp(
    "[\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}]",
    "u"
  );
  return regex.test(character);
}

export function blobToBase64(blob: File): Promise<string> {
  return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

export function splitEmoji(text: string) {
  const [icon, title] = text
    .split(
      /^([\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}])\s*(.+)$/u
    )
    .filter(Boolean);
  if (title)
    return {
      icon,
      title,
    };
  return {
    icon: undefined,
    title: icon,
  };
}

export const debounce = (func: Function, delay: number) => {
  let timer: number | null = null;
  return (...args: any[]) => {
    timer && clearTimeout(timer);
    // @ts-ignore
    timer = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

export const getFormattedTimestamp = () => {
  const currentDate = new Date();

  const year = String(currentDate.getFullYear()).slice(-2);
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");
  const hours = String(currentDate.getHours()).padStart(2, "0");
  const minutes = String(currentDate.getMinutes()).padStart(2, "0");
  const seconds = String(currentDate.getSeconds()).padStart(2, "0");

  const fileName = `${year}${month}${day}-${hours}${minutes}${seconds}.md`;

  return fileName;
};

export const createPilePath = (basePath: string) => {
  const date = new Date();
  const month = date.toLocaleString("default", { month: "short" });
  const year = date.getFullYear().toString();
  return [year, month, basePath].join("-");
};

export const getFilePathForNewPost = (
  basePath: string,
  timestamp = new Date()
) => {
  const date = new Date();
  const month = date.toLocaleString("default", { month: "short" });
  const year = date.getFullYear().toString();
  const fileName = getFormattedTimestamp();
  return [basePath, year, month, fileName].join("-");
};

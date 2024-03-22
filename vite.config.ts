import { qwikCity } from "@builder.io/qwik-city/vite";
import { qwikVite } from "@builder.io/qwik/optimizer";
import { presetIcons, presetTypography, presetUno, transformerDirectives, transformerVariantGroup } from "unocss";
import { presetExtra } from 'unocss-preset-extra';
import unocss from "unocss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(() => {
  return {
    plugins: [
      unocss({
        // fix qwik preview no work
        // https://github.com/unocss/unocss/issues/3367
        content: {
          pipeline: {
            include: [
              /\.([jt]sx?|mdx?)($|\?)/,
            ],
          },
        },
        mergeSelectors: false,
        transformers: [transformerDirectives(), transformerVariantGroup()],
        presets: [
          presetUno(),
          presetTypography({
            cssExtend: {
              ":not(pre) > code::before,:not(pre) > code::after": {
                content: "",
              },
            },
          }),
          presetIcons(),
          presetExtra()
        ],
        shortcuts: {
          "input-box":
            "max-w-150px ml-1em px-1 text-slate-7 dark:text-slate rounded-sm bg-slate bg-op-15 focus:(bg-op-20 ring-0 outline-none)",
        },
      }),
      qwikCity(),
      qwikVite(),
      tsconfigPaths(),
    ],
    preview: {
      headers: {
        "Cache-Control": "public, max-age=600",
      },
    },
    optimizeDeps: {
      include: [ "@auth/core" ]
    }
  };
});

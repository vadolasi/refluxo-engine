import DefaultTheme from "vitepress/theme"
import "@catppuccin/vitepress/theme/mocha/blue.css"
import type { Theme } from "vitepress"
// @ts-expect-error: module not typed
import CopyOrDownloadAsMarkdownButtons from "vitepress-plugin-llms/vitepress-components/CopyOrDownloadAsMarkdownButtons.vue"

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component(
      "CopyOrDownloadAsMarkdownButtons",
      CopyOrDownloadAsMarkdownButtons
    )
  }
} satisfies Theme

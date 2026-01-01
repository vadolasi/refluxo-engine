import DefaultTheme from "vitepress/theme"
import "@catppuccin/vitepress/theme/mocha/blue.css"
import type { Theme } from "vitepress"
import CopyOrDownloadAsMarkdownButtons from "vitepress-plugin-llms/vitepress-components/CopyOrDownloadAsMarkdownButtons.vue"
import Layout from "./Layout.vue"

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component(
      "CopyOrDownloadAsMarkdownButtons",
      CopyOrDownloadAsMarkdownButtons
    )
  }
} satisfies Theme

import { defineConfig } from "vitepress"
import llmstxt, { copyOrDownloadAsMarkdownButtons } from "vitepress-plugin-llms"
import { withMermaid } from "vitepress-plugin-mermaid"
import typedocSidebar from "../docs/en/api/typedoc-sidebar.json"

// https://vitepress.dev/reference/site-config
export default withMermaid(
  defineConfig({
    srcDir: "docs",

    title: "Refluxo",
    description: "Stateless Workflow Engine",

    markdown: {
      theme: {
        light: "catppuccin-latte",
        dark: "catppuccin-mocha"
      },
      config(md) {
        md.use(copyOrDownloadAsMarkdownButtons)
      }
    },

    locales: {
      root: {
        label: "English",
        lang: "en",
        link: "/en/",
        themeConfig: {
          socialLinks: [
            {
              icon: "github",
              link: "https://github.com/vadolasi/refluxo-engine"
            }
          ],
          nav: [
            { text: "Home", link: "/en/" },
            {
              text: "Documentation",
              items: [
                { text: "Introduction", link: "/en/introduction" },
                { text: "Core Concepts", link: "/en/concepts/engine" },
                { text: "Guides", link: "/en/guides/getting-started" },
                { text: "Deployment", link: "/en/deployment/state-management" },
                { text: "Cookbook", link: "/en/cookbook/content-approval" }
              ]
            },
            { text: "API Reference", link: "/en/api/" },
            {
              text: "LLMs",
              items: [
                { text: "llms.txt", link: "/llms.txt" },
                { text: "llms-full.txt", link: "/llms-full.txt" }
              ]
            }
          ],
          sidebar: {
            "/": [
              { text: "Introduction", link: "/en/introduction" },
              {
                text: "Core Concepts",
                items: [
                  { text: "The Engine", link: "/en/concepts/engine" },
                  { text: "Workflow", link: "/en/concepts/workflow" },
                  { text: "Snapshot", link: "/en/concepts/snapshot" },
                  { text: "Context", link: "/en/concepts/context" },
                  { text: "Expressions", link: "/en/concepts/expressions" },
                  { text: "Use Cases", link: "/en/concepts/use-cases" }
                ]
              },
              {
                text: "Guides",
                items: [
                  {
                    text: "Getting Started",
                    link: "/en/guides/getting-started"
                  },
                  { text: "Custom Nodes", link: "/en/guides/custom-nodes" },
                  { text: "Conditionals", link: "/en/guides/conditionals" },
                  { text: "Handling Loops", link: "/en/guides/loops" },
                  {
                    text: "Handling Secrets",
                    link: "/en/guides/handling-secrets"
                  },
                  {
                    text: "Error Handling",
                    link: "/en/guides/error-handling"
                  },
                  {
                    text: "External Events & Pausing",
                    link: "/en/guides/external-events"
                  },
                  {
                    text: "Dynamic Schemas",
                    link: "/en/guiconceptsdes/dynamic-schemas"
                  }
                ]
              },
              {
                text: "Deployment",
                items: [
                  {
                    text: "State Management",
                    link: "/en/deployment/state-management"
                  },
                  {
                    text: "Serverless Patterns",
                    link: "/en/deployment/serverless"
                  },
                  { text: "Security", link: "/en/deployment/security" }
                ]
              },
              {
                text: "Cookbook",
                items: [
                  {
                    text: "Content Approval Workflow",
                    link: "/en/cookbook/content-approval"
                  },
                  {
                    text: "API Data Aggregation",
                    link: "/en/cookbook/api-aggregation"
                  }
                ]
              }
            ],
            "/en/api/": [{ text: "API Reference", items: typedocSidebar }]
          }
        }
      },
      pt: {
        label: "Português",
        lang: "pt-BR",
        link: "/pt/",
        themeConfig: {
          outline: {
            label: "Nesta página"
          },
          docFooter: {
            prev: "Página anterior",
            next: "Próxima página"
          },
          socialLinks: [
            {
              icon: "github",
              link: "https://github.com/vadolasi/refluxo-engine"
            }
          ],
          nav: [
            { text: "Início", link: "/pt/" },
            {
              text: "Documentação",
              items: [
                { text: "Introdução", link: "/pt/introduction" },
                { text: "Conceitos Fundamentais", link: "/pt/concepts/engine" },
                { text: "Guias Práticos", link: "/pt/guides/getting-started" },
                { text: "Deployment", link: "/pt/deployment/state-management" },
                {
                  text: "Receitas (Cookbook)",
                  link: "/pt/cookbook/content-approval"
                }
              ]
            },
            { text: "Referência da API", link: "/en/api/" },
            {
              text: "LLMs",
              items: [
                { text: "llms.txt", link: "/llms.txt" },
                { text: "llms-full.txt", link: "/llms-full.txt" }
              ]
            }
          ],
          sidebar: {
            "/pt/": [
              { text: "Introdução", link: "/pt/introduction" },
              {
                text: "Conceitos Fundamentais",
                items: [
                  { text: "O Motor", link: "/pt/concepts/engine" },
                  { text: "Workflow", link: "/pt/concepts/workflow" },
                  { text: "Snapshot", link: "/pt/concepts/snapshot" },
                  { text: "Contexto", link: "/pt/concepts/context" },
                  { text: "Expressões", link: "/pt/concepts/expressions" },
                  { text: "Casos de Uso", link: "/pt/concepts/use-cases" }
                ]
              },
              {
                text: "Guias Práticos",
                items: [
                  {
                    text: "Primeiros Passos",
                    link: "/pt/guides/getting-started"
                  },
                  { text: "Nós Customizados", link: "/pt/guides/custom-nodes" },
                  { text: "Condicionais", link: "/pt/guides/conditionals" },
                  { text: "Lidando com Loops", link: "/pt/guides/loops" },
                  {
                    text: "Tratamento de Erros",
                    link: "/pt/guides/error-handling"
                  },
                  {
                    text: "Eventos Externos e Pausas",
                    link: "/pt/guides/external-events"
                  },
                  {
                    text: "Schemas Dinâmicos",
                    link: "/pt/guides/dynamic-schemas"
                  }
                ]
              },
              {
                text: "Deployment",
                items: [
                  {
                    text: "Gerenciamento de Estado",
                    link: "/pt/deployment/state-management"
                  },
                  {
                    text: "Padrões Serverless",
                    link: "/pt/deployment/serverless"
                  },
                  { text: "Segurança", link: "/pt/deployment/security" }
                ]
              },
              {
                text: "Receitas (Cookbook)",
                items: [
                  {
                    text: "Workflow de Aprovação de Conteúdo",
                    link: "/pt/cookbook/content-approval"
                  },
                  {
                    text: "Agregação de Dados de APIs",
                    link: "/pt/cookbook/api-aggregation"
                  }
                ]
              }
            ],
            "/en/api/": [{ text: "API Reference", items: typedocSidebar }]
          }
        }
      }
    },

    vite: {
      plugins: [
        llmstxt({
          workDir: "en",
          domain: "https://refluxo-engine.vitor036daniel.workers.dev"
        })
      ]
    },

    sitemap: {
      hostname: "https://refluxo-engine.vitor036daniel.workers.dev"
    },

    cleanUrls: true
  })
)

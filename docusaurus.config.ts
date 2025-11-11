import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Справочный центр Хекслета',
  tagline: 'Ответы на частые вопросы и инструкции для студентов',
  favicon: 'img/favicon.ico',

  plugins: [
    [
      require.resolve("@cmfcmf/docusaurus-search-local"),
      {
        indexDocs: true,
        indexDocSidebarParentCategories: 2,
        includeParentCategoriesInPageTitle: false,
        indexBlog: false,
        indexPages: false,
        language: ["ru", "en"],
        style: undefined,
        maxSearchResults: 10,

        // lunr.js-specific settings
        lunr: {
          tokenizerSeparator: /[\s\-.,!?:;()]+/, // чуть более "мягкое" разделение слов
          b: 0.6, // лёгкое снижение нормализации по длине, чтобы длинные статьи не терялись
          k1: 1.2, // чуток усиливаем вклад совпадений редких терминов
          titleBoost: 6, // совпадения в заголовках по-прежнему самые важные
          contentBoost: 1.8, // усиливаем вклад основного текста статьи
          tagsBoost: 3, // снижаем вклад тегов, чтобы они не перегружали выдачу
          parentCategoriesBoost: 1.5, // навигационные категории влияют мягче
        }
      }
    ],
  ],

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://hexlet.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'hexlet', // Usually your GitHub org/user name.
  projectName: 'hexlet.github.io', // Usually your repo name.

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'ru',
    locales: ['ru'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebar.ts',
          routeBasePath: '/',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/hexlet/hexlet.github.io/blob/main',
        },
        blog: false,
        theme: {
          // customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    // image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Хекслет',
      logo: {
        alt: 'Логотип Хекслета',
        src: 'img/hexlet-logo-white-rus.png',
      },
      items: [
        // {
        //   type: 'docSidebar',
        //   sidebarId: 'tutorialSidebar',
        //   position: 'left',
        //   label: 'Документация',
        // },
        {
          href: 'https://t.me/hexletcommunity',
          label: 'Сообщество',
          position: 'left',
        },
        {
          href: 'https://t.me/hexlet_help_bot',
          label: 'Написать (ТГ)',
          position: 'left',
        },
        {
          href: 'https://github.com/Hexlet/hexlet.github.io/discussions',
          label: 'Предложить улучшение',
          position: 'left',
        },
        {
          href: 'https://ru.hexlet.io',
          label: 'Платформа',
          position: 'right',
        },
        {
          href: 'https://github.com/hexlet/hexlet.github.io',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Решения',
          items: [
            {
              label: 'Компаниям',
              to: 'https://b2b.hexlet.io/',
            },
            {
              label: 'Хекслет Карьера',
              to: 'https://career.hexlet.io/',
            },
          ],
        },
        {
          title: 'Сообщество',
          items: [
            {
              label: 'VK',
              href: 'https://vk.com/hexlet',
            },
            {
              label: 'Телеграм-канал',
              href: 'https://t.me/hexlet_ru',
            },
            {
              label: 'YouTube-канал',
              href: 'https://www.youtube.com/@HexletUniversity',
            },
          ],
        },
        {
          title: 'Поддержка',
          items: [
            {
              label: 'Центр поддержки',
              href: 'https://help.hexlet.io',
            },
            {
              href: 'https://t.me/hexlet_help_bot',
              label: 'Поддержка в ТГ',
            },
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} Хекслет.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;

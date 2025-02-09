import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';
import dotenv from 'dotenv';
import type { LocaleObject } from '@nuxtjs/i18n';

// environment
dotenv.config({ path: './.env.production', override: true });
if (process.env.NODE_ENV === 'development') {
  dotenv.config({ path: './.env.development', override: true });
}
dotenv.config({ path: './.env', override: true });

const {
  // general
  NUXT_PUBLIC_SITE_URL,
  // api
  API_URL,
  API_TIMEOUT,
  // google
  GOOGLE_TAG_ID,
  GOOGLE_CLIENT_ID,
  // adsense
  GOOGLE_ADSENSE_TEST_MODE,
  GOOGLE_ADSENSE_ID,
  // discord
  DISCORD_INVITE_LINK,
  DISCORD_BOT_NAME
} = process.env;

const localesMetadata: LocaleObject[] = [
  { name: 'English', code: 'en', iso: 'en', isCatchallLocale: true },
  { name: 'Indonesia', code: 'id', iso: 'id' },
  { name: '日本語', code: 'ja', iso: 'ja' },
  { name: '한국어', code: 'ko', iso: 'ko' },
  { name: 'ภาษาไทย', code: 'th', iso: 'th', rtl: true },
  { name: 'Türkçe', code: 'tr', iso: 'tr' },
  { name: 'Tiếng Việt', code: 'vi', iso: 'vi' },
  { name: 'Ukrainian', code: 'uk', iso: 'uk' },
  { name: '中文(简体)', code: 'zh', iso: 'zh' }
];

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  $development: {
    // ssr: false,
    // debug: true,
    // devtools: {
    //   enabled: true
    // }
  },

  modules: [
    // 3rd
    'nuxt-jsonld',
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/sitemap',
    'nuxt-schema-org',
    '@nuxtjs/robots',
    '@nuxtjs/device',
    // performance
    '@nuxtjs/fontaine',
    // dev
    '@nuxt/eslint'
  ],

  routeRules: {
    '/': {
      prerender: true
    },
    '/characters': {
      prerender: true
    },
    '/characters/**': {
      prerender: true
    },
    '/echoes': {
      prerender: true
    },
    '/echoes/**': {
      prerender: true
    },
    '/items': {
      prerender: true
    },
    '/items/**': {
      prerender: true
    },
    '/weapons': {
      prerender: true
    },
    '/weapons/**': {
      prerender: true
    },
    '/trophies': {
      prerender: true
    },
    '/trophies/**': {
      prerender: true
    },
    '/settings': {
      robots: false
    },
    '/convene-history/import': {
      robots: false
    },
    '/license': {
      robots: false
    },
    '/donation': {
      robots: false
    },
    '/guides/editor': {
      robots: false
    },
    '/guides/rss': {
      proxy: '/api/rss/guides'
    },
    // TODO: remove soon
    '/echos': {
      robots: false
    },
    '/echos/**': {
      robots: false,
      redirect: '/echoes/**'
    }
  },

  sitemap: {
    autoLastmod: true,
    exclude: [
      '/settings',
      '/convene-history/import',
      '/privacy-policy',
      '/license',
      '/donation'
    ],
    sources: [
      '/api/__sitemap__/characters',
      '/api/__sitemap__/echoes',
      '/api/__sitemap__/items',
      '/api/__sitemap__/trophies',
      '/api/__sitemap__/weapons'
    ]
  },

  css: ['~/assets/main.css', '~/assets/main.scss', '~/assets/tiptap.scss'],

  features: {
    inlineStyles: false
  },

  site: {
    url: NUXT_PUBLIC_SITE_URL
  },

  sourcemap: {
    server: false,
    client: true
  },

  telemetry: false,

  components: ['./components'],

  imports: {
    dirs: ['./composables', './components']
  },

  i18n: {
    vueI18n: './i18n/i18n.config.ts',
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: {
      useCookie: true,
      redirectOn: 'root'
    },
    locales: localesMetadata
  },

  pinia: {
    storesDirs: ['./composables/**']
  },

  vueuse: { ssrHandlers: true },

  vite: {
    esbuild: {
      legalComments: 'none'
    },
    resolve: {
      extensions: ['.mjs', '.js', '.ts', '.json']
    },
    vue: {
      template: {
        transformAssetUrls
      }
    },
    build: {
      cssCodeSplit: false,
      rollupOptions: {
        output: {
          experimentalMinChunkSize: 250 * 1024,
          manualChunks: (id) => {
            if (id.includes('resources/characters')) {
              return 'resources-characters';
            } else if (id.includes('resources/echoes')) {
              return 'resources-echoes';
            } else if (id.includes('resources/items')) {
              return 'resources-items';
            } else if (id.includes('resources/weapons')) {
              return 'resources-weapons';
            } else if (id.includes('resources')) {
              return 'resources-other';
            }
          }
        }
      },
      terserOptions: {
        format: {
          comments: false
        }
      }
    },
    plugins: [
      vuetify({
        autoImport: true
      })
    ]
  },

  nitro: {
    prerender: {
      routes: ['/sitemap.xml'],
      concurrency: 25
    }
  },

  build: {
    transpile: ['vuetify']
  },

  hooks: {
    'nitro:build:before': (nitro) => {
      if (['bun', 'node-server'].includes(nitro.options.preset)) {
        nitro.options.prerender.crawlLinks = true;
      }
    }
  },

  appConfig: {
    buildNumber: Date.now()
  },

  // environments
  runtimeConfig: {
    public: {
      // general
      SITE_URL: NUXT_PUBLIC_SITE_URL,
      APP_NAME: 'WutheringWaves.app',
      APP_REPO: 'https://github.com/trongtindev/wutheringwaves-app',
      // api
      API_URL,
      API_TIMEOUT: parseInt(API_TIMEOUT!),
      // google
      GOOGLE_TAG_ID,
      GOOGLE_CLIENT_ID,
      // Adsense
      GOOGLE_ADSENSE_ID,
      GOOGLE_ADSENSE_TEST_MODE: GOOGLE_ADSENSE_TEST_MODE === 'true',
      // discord
      DISCORD_INVITE_LINK,
      DISCORD_BOT_NAME
    }
  },

  experimental: {
    viewTransition: true
  },

  compatibilityDate: '2024-07-05'
});

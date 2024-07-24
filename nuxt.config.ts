import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';
import dotenv from 'dotenv';
import { startMerge } from './i18n.utils';
import { localesMetadata } from './utils/metadata';
import { updateModified } from './runtime/update-modified';

// environment
dotenv.config({ path: './.env.production', override: true });
if (process.env.NODE_ENV === 'development') {
  dotenv.config({ path: './.env.development', override: true });
}
dotenv.config({ path: './.env', override: true });

const {
  // general
  NUXT_PUBLIC_SITE_URL,
  NUXT_PUBLIC_API_URL,
  NUXT_PUBLIC_APP_VERSION,
  // google
  GOOGLE_CLIENT_ID,
  // adsense
  GOOGLE_ADSENSE_TEST_MODE,
  GOOGLE_ADSENSE_ID,
  // sentry
  NUXT_PUBLIC_SENTRY_DEBUG,
  NUXT_PUBLIC_SENTRY_DNS
} = process.env;

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  $development: {
    // debug: true,
    gtag: {
      enabled: false
    }
  },

  modules: [
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
    'nuxt-gtag',
    // dev
    '@nuxt/eslint'
  ],

  routeRules: {
    '/': {
      prerender: true
    },
    '/**': {
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
    '/guides/create': {
      robots: false,
      prerender: false
    },
    '/guides/rss': {
      proxy: '/api/rss/guides'
    },
    '/characters/rss': {
      proxy: '/api/rss/characters'
    },
    // TODO: remove soon
    '/echos/**': {
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

  css: ['~/assets/main.scss', '~/assets/tiptap.scss'],

  features: {
    inlineStyles: false
  },

  nitro: {
    prerender: {
      routes: ['/sitemap.xml']
    },
    serverAssets: [
      {
        baseName: 'resources',
        dir: './resources'
      }
    ]
  },

  site: {
    url: NUXT_PUBLIC_SITE_URL
  },

  sourcemap: {
    server: false,
    client: true
  },

  devtools: { enabled: false },

  telemetry: false,

  components: ['./components'],

  imports: {
    dirs: ['./composables', './components']
  },

  // modules config
  i18n: {
    vueI18n: './i18n.config.ts',
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: {
      useCookie: true,
      redirectOn: 'root'
    },
    locales: localesMetadata,
    experimental: {
      localeDetector: './i18n.detector.ts'
    }
  },

  pinia: {
    storesDirs: ['./composables/**']
  },

  vueuse: { ssrHandlers: true },

  vite: {
    vue: {
      template: {
        transformAssetUrls
      }
    },
    build: {
      cssCodeSplit: false,
      rollupOptions: {
        output: {
          experimentalMinChunkSize: 250 * 1024
        }
      }
    },
    plugins: [
      vuetify({
        autoImport: true
      })
    ]
  },

  build: {
    transpile: ['vuetify']
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
      APP_DISCORD: 'https://discord.gg/MxxYyUJEfT',
      APP_VERSION: NUXT_PUBLIC_APP_VERSION,
      // api
      API_URL: NUXT_PUBLIC_API_URL,
      API_TIMEOUT: 15000,
      // sentry
      SENTRY_DNS: NUXT_PUBLIC_SENTRY_DNS,
      SENTRY_DEBUG: NUXT_PUBLIC_SENTRY_DEBUG == 'true',
      // google
      GOOGLE_CLIENT_ID: GOOGLE_CLIENT_ID,
      // Adsense
      GOOGLE_ADSENSE_ID: GOOGLE_ADSENSE_ID,
      GOOGLE_ADSENSE_TEST_MODE: GOOGLE_ADSENSE_TEST_MODE === 'true'
    }
  },

  experimental: {
    viewTransition: true
  },

  hooks: {
    'builder:watch': async (e, path) => {
      if (e != 'change') return;

      // update locales
      if (path.startsWith('locales/en')) {
        await startMerge(
          localesMetadata.filter((e) => e.code != 'en').map((e) => e.code)
        );
      }

      // update resources
      if (path.startsWith('resources')) {
        if (
          path.startsWith('resources/characters') &&
          !path.endsWith('characters.json')
        ) {
          await updateModified('characters');
        } else if (
          path.startsWith('resources/echoes') &&
          !path.endsWith('echoes.json')
        ) {
          await updateModified('echoes');
        } else if (
          path.startsWith('resources/items') &&
          !path.endsWith('items.json')
        ) {
          await updateModified('items');
        } else if (
          path.startsWith('resources/weapons') &&
          !path.endsWith('weapons.json')
        ) {
          await updateModified('weapons');
        }
      }
    }
  },

  compatibilityDate: '2024-07-05'
});

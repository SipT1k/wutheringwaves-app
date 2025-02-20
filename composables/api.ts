import axios, { AxiosError } from 'axios';
import axiosRetry from 'axios-retry';

declare module 'axios' {
  interface AxiosRequestConfig {
    handleError?: boolean;
  }
}

const useApiFactory = () => {
  // uses
  const i18n = useI18n();
  const auth = useAuth();
  const route = useRoute();
  const dialog = useDialog();
  const runtimeConfig = useRuntimeConfig();

  // config
  const { API_URL, API_TIMEOUT } = runtimeConfig.public;

  const instance = axios.create({
    baseURL: API_URL,
    timeout: API_TIMEOUT,
    headers: {
      'Content-Type': 'application/json'
    }
  });
  if (!import.meta.dev) axiosRetry(instance);

  instance.interceptors.request.use(async (config) => {
    if (import.meta.client && auth.isLoggedIn) {
      if (
        config.url &&
        !config.url.startsWith('auth') &&
        (!config.url.startsWith('http') || config.url.startsWith(API_URL))
      ) {
        const forceRefreshToken =
          typeof route.query.forceRefreshToken != 'undefined';
        const accessToken = await auth.getAccessToken(forceRefreshToken);
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }

    return config;
  });

  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      if (error instanceof AxiosError && error.response) {
        if (error.response.status == 401) {
          console.debug('api', 'refreshing token...');
          const accessToken = await auth.getAccessToken(true);
          error.response.config.headers.Authorization = `Bearer ${accessToken}`;

          console.debug('api', 'retrying request...');
          return getInstance()(error.response.config);
        }

        if (error.config && error.config.handleError) {
          const message = (() => {
            if (error.response) {
              const message: string | string[] = error.response.data.message;
              return typeof message === 'string'
                ? message
                : message.join('<br/>');
            }
            return;
          })();
          dialog.show({
            title: i18n.t('common.error'),
            content: message
          });
        }
      }

      throw error;
    }
  );

  const getInstance = () => instance;

  // exports
  return { instance, getInstance };
};

export const useApi = defineStore('useApi', () =>
  useApiFactory().getInstance()
);

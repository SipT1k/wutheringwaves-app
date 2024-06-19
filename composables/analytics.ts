import { defineStore } from 'pinia';
import { logEvent as firebaseLogEvent } from 'firebase/analytics';

export const useAnalytics = defineStore('useAnalytics', () => {
  // uses
  const firebase = useFirebase();

  // states
  const optOut = useCookie<boolean>('analytics.optOut');

  // functions
  const initialize = () => {
    if (import.meta.server) {
      throw new Error('Cannot initialize analytics on server-side!');
    }
  };

  const logEvent = (event: string, params: { [Key: string]: any }) => {
    if (import.meta.dev) return;
    if (firebase.analytics) {
      firebaseLogEvent(firebase.analytics, event, params);
    }
  };

  // watch
  // watch(
  //   () => optOut,
  //   (value) => {}
  // );

  // exports
  return { optOut, initialize, logEvent };
});

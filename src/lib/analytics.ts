import posthog from "posthog-js";

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;

export function initAnalytics() {
  if (!POSTHOG_KEY) return;
  const init = () => {
    posthog.init(POSTHOG_KEY, {
      api_host: "https://app.posthog.com",
      autocapture: true,
    });
  };
  if ("requestIdleCallback" in window) {
    requestIdleCallback(init);
  } else {
    setTimeout(init, 1);
  }
}

export const analytics = {
  trackPage(pageName: string) {
    posthog.capture("$pageview", { pageName });
  },

  trackEvent(event: string, props?: Record<string, unknown>) {
    posthog.capture(event, props);
  },

  identifyUser(uid: string, email?: string) {
    posthog.identify(uid, email ? { email } : undefined);
  },
};

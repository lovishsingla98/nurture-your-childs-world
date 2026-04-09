import type posthogLib from "posthog-js";

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;

let posthog: typeof posthogLib | null = null;

export function initAnalytics() {
  if (!POSTHOG_KEY) return;

  const init = () => {
    import("posthog-js").then((mod) => {
      posthog = mod.default;
      posthog.init(POSTHOG_KEY, {
        api_host: "https://app.posthog.com",
        autocapture: true,
      });
    });
  };

  if ("requestIdleCallback" in window) {
    requestIdleCallback(init);
  } else {
    setTimeout(init, 2000);
  }
}

export const analytics = {
  trackPage(pageName: string) {
    posthog?.capture("$pageview", { pageName });
  },

  trackEvent(event: string, props?: Record<string, unknown>) {
    posthog?.capture(event, props);
  },

  identifyUser(uid: string, email?: string) {
    posthog?.identify(uid, email ? { email } : undefined);
  },
};

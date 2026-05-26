import { analytics } from "@/lib/analytics";

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.cortiqlabs.nurture";
const BADGE_SRC = "/images/google-play-badge.svg";

const AppBanner = () => {
  return (
    <div className="sticky top-0 z-[60] w-full bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] shadow-sm">
      <div className="flex items-center justify-center gap-2 py-2 px-4 sm:gap-3">
        <span className="shrink-0 text-sm sm:text-base" role="img" aria-label="rocket">
          🚀
        </span>

        <p className="text-xs font-bold text-white whitespace-nowrap sm:text-sm tracking-wide">
          <span className="sm:hidden">Nurture is on Android!</span>
          <span className="hidden sm:inline">
            Nurture is now on Android! AI-powered learning for your child, ages 3–12.
          </span>
        </p>

        <a
          href={PLAY_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => analytics.trackEvent("playstore_banner_clicked")}
          className="shrink-0 flex items-center"
        >
          <img
            src={BADGE_SRC}
            alt="Get it on Google Play"
            className="h-6 sm:h-7.5 w-auto"
            width="100"
            height="30"
          />
        </a>
      </div>
    </div>
  );
};

export default AppBanner;

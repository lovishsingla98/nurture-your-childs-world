const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.cortiqlabs.nurture";
const BADGE_SRC =
  "https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg";

const AppBanner = () => {
  return (
    <div className="sticky top-0 z-[60] w-full bg-gradient-to-r from-[#7C3AED] to-[#6D28D9]">
      <div className="flex items-center justify-center gap-2 py-6 px-4 sm:gap-3">
        <span className="shrink-0 text-xl" role="img" aria-label="rocket">
          🚀
        </span>

        <p className="text-base font-semibold text-white whitespace-nowrap sm:text-lg">
          <span className="sm:hidden">Nurture is on Android!</span>
          <span className="hidden sm:inline">
            Nurture is now on Android! AI-powered learning for your child, ages
            3–12.
          </span>
        </p>

        <a
          href={PLAY_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0"
        >
          <img
            src={BADGE_SRC}
            alt="Get it on Google Play"
            className="h-auto w-[120px] sm:w-[160px]"
          />
        </a>
      </div>
    </div>
  );
};

export default AppBanner;

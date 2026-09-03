import React, { useState, useEffect } from 'react';
import { analytics } from '@/lib/analytics';
import { toast } from 'sonner';
import { Smartphone, Check, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.cortiqlabs.nurture";
const BADGE_SRC = "/images/google-play-badge.svg";

interface DesktopAppBannerProps {
  className?: string;
}

export const DesktopAppBanner: React.FC<DesktopAppBannerProps> = ({ className = "" }) => {
  const [requestedIphone, setRequestedIphone] = useState<boolean>(() => {
    return localStorage.getItem('nurture_iphone_requested') === 'true';
  });

  const handlePlayStoreClick = () => {
    analytics.trackEvent("playstore_app_banner_clicked", {
      location: "dashboard_empty_space_banner",
      timestamp: new Date().toISOString()
    });
  };

  const handleIphoneRequest = () => {
    if (requestedIphone) {
      toast.info("Your iPhone request has already been recorded! We'll notify you as soon as Nurture launches on iOS.");
      return;
    }

    analytics.trackEvent("request_iphone_clicked", {
      location: "dashboard_empty_space_banner",
      timestamp: new Date().toISOString()
    });

    setRequestedIphone(true);
    localStorage.setItem('nurture_iphone_requested', 'true');
    toast.success("Thank you! Your request for Nurture on iPhone has been registered.");
  };

  return (
    <div className={`bg-white/90 backdrop-blur-md border border-[#D5DFD0] rounded-3xl p-5 shadow-xl max-w-xs transition-all duration-300 ${className}`}>
      {/* Header Pill */}
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EAF0E6] text-[#2D6A4F] text-[9px] font-extrabold uppercase tracking-wider mb-3">
        <Sparkles className="w-3 h-3 text-[#2D6A4F]" />
        <span>Better Experience</span>
      </div>

      {/* Main Headline */}
      <h3 className="text-sm font-extrabold text-[#18211A] leading-snug mb-1.5">
        Nurture is better in the App! 📱
      </h3>

      <p className="text-[10.5px] text-[#607060] leading-relaxed font-semibold mb-4">
        Get daily push reminders, offline concept reading, audio bedtime stories, and smoother progress tracking on Android.
      </p>

      {/* Action 1: Google Play Store Logo Link */}
      <div className="space-y-2.5">
        <a
          href={PLAY_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handlePlayStoreClick}
          className="group block w-full bg-[#18211A] hover:bg-[#2D6A4F] text-white rounded-2xl p-2.5 transition-all shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src={BADGE_SRC}
                alt="Get it on Google Play"
                className="h-7 w-auto object-contain"
              />
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-white/70 group-hover:translate-x-1 transition-transform" />
          </div>
        </a>

        {/* Action 2: Request for iPhone Button */}
        <Button
          onClick={handleIphoneRequest}
          variant="outline"
          className={`w-full rounded-2xl py-2.5 text-[10px] font-extrabold transition-all border-[#D5DFD0] ${
            requestedIphone
              ? 'bg-[#EAF0E6] text-[#2D6A4F] border-[#2D6A4F]/30'
              : 'bg-white hover:bg-slate-50 text-[#18211A]'
          }`}
        >
          {requestedIphone ? (
            <span className="flex items-center justify-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#2D6A4F]" />
              iPhone Request Submitted
            </span>
          ) : (
            <span className="flex items-center justify-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-[#607060]" />
              Request for iPhone (iOS)
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};

export default DesktopAppBanner;

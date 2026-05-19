import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Flame, RefreshCw } from 'lucide-react';

interface MobileSimulatorLayoutProps {
  title: string;
  subtitle?: string;
  backUrl: string;
  children: React.ReactNode;
  onRefresh?: () => void;
  headerRight?: React.ReactNode;
  hideHeader?: boolean;
}

const MobileSimulatorLayout: React.FC<MobileSimulatorLayoutProps> = ({
  title,
  subtitle,
  backUrl,
  children,
  onRefresh,
  headerRight,
  hideHeader = false,
}) => {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-screen bg-[#DCE8D7] flex flex-col items-center justify-center overflow-hidden p-0 sm:py-3 select-none text-[#18211A]">
      {/* Centered Device Simulator */}
      <div className="h-full max-h-[730px] w-full max-w-[365px] bg-[#F5F7F2] sm:rounded-[36px] sm:border-[8px] sm:border-slate-900 sm:shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col relative overflow-hidden aspect-[9/19.2]">

        {/* Device Status Bar Mockup */}
        <div className="hidden sm:flex items-center justify-between px-5 pt-2.5 pb-1 text-[10px] font-extrabold text-slate-800/80 z-30 select-none tracking-tight flex-none">
          <span>9:41</span>
          <div className="flex items-center gap-1">
            <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
            <span className="w-3 h-2 bg-slate-800/80 rounded-sm flex items-center justify-center text-[6px] text-white font-extrabold">5G</span>
            <span className="w-3.5 h-1.5 border border-slate-800/80 rounded-sm" />
          </div>
        </div>

        {/* Sticky Header with Back Button */}
        {!hideHeader && (
          <div className="flex items-center gap-2 px-3 py-2.5 bg-white/90 backdrop-blur-md border-b border-[#D5DFD0] z-20 flex-none">
            <button
              onClick={() => navigate(backUrl)}
              className="p-1.5 rounded-full hover:bg-[#EAF0E6] transition-colors flex-none"
            >
              <ArrowLeft className="w-4 h-4 text-[#18211A]" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-extrabold text-[#18211A] tracking-tight leading-none truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="text-[8px] font-semibold text-[#607060] leading-none mt-0.5 truncate">
                  {subtitle}
                </p>
              )}
            </div>
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="p-1.5 rounded-full hover:bg-[#EAF0E6] transition-colors flex-none"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#607060]" />
              </button>
            )}
            {headerRight}
          </div>
        )}

        {/* Scrollable Phone Screen Viewport */}
        <div className="flex-1 overflow-y-auto px-3.5 pt-3 pb-6 scrollbar-none">
          {children}
        </div>

        {/* Device Home Indicator mockup */}
        <div className="hidden sm:block absolute bottom-1.5 left-0 right-0 z-30 text-center flex-none">
          <div className="w-20 h-1 bg-slate-950/80 rounded-full mx-auto" />
        </div>
      </div>
    </div>
  );
};

export default MobileSimulatorLayout;

import { lazy, Suspense, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { getCanonicalUrl } from "@/lib/seo";
import AppBanner from "@/components/AppBanner";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Sparkles,
  Brain,
  Baby,
  Stars,
  ShieldCheck,
  Check,
  X,
  Flame,
  ArrowRight,
  MessageSquare,
  BookOpen,
  Activity,
  Compass,
  Calendar,
  Award,
  Play,
  Heart,
  TrendingUp,
  Gift,
  Clock
} from "lucide-react";
import ParallaxEffect from "@/components/3d/ParallaxEffect";
import ScrollReveal from "@/components/3d/ScrollReveal";
import FloatingScene3D from "@/components/3d/FloatingScene3D";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { analytics } from "@/lib/analytics";

// Lazy-load below-fold components to unblock LCP hero paint
const FeatureSlides = lazy(() => import("@/components/sections/FeatureSlides"));
const WaitlistForm = lazy(() => import("@/components/forms/WaitlistForm"));
const FeedbackForm = lazy(() => import("@/components/forms/FeedbackForm"));

const Index = () => {
  const canonical = getCanonicalUrl("/");
  const { signInWithGoogle, loading, user } = useAuth();
  const navigate = useNavigate();
  const [pricingPeriod, setPricingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [scrollY, setScrollY] = useState(0);
  const [pricingStruck] = useState(true);
  const pricingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleJoinNow = async () => {
    // Track CTA click
    analytics.trackEvent("waitlist_clicked");
    try {
      await signInWithGoogle();
      toast.success("Successfully signed in with Google!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.code === "auth/popup-closed-by-user") {
        toast.error("Login cancelled. Please try again.");
      } else if (error.code === "auth/popup-blocked") {
        toast.error("Popup blocked. Please allow popups for this site.");
      } else {
        toast.error("Failed to sign in. Please try again.");
      }
    }
  };

  const productLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Nurture",
    applicationCategory: "EducationApplication",
    operatingSystem: "Android, iOS, Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    creator: { "@type": "Organization", name: "Cortiq Labs" }
  };

  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Cortiq Labs",
    url: canonical,
  };

  return (
    <div className="bg-[#FAFBF9] text-[#18211A] min-h-screen font-sans selection:bg-[#2D6A4F]/20 selection:text-[#2D6A4F] relative">
      <FloatingScene3D />
      <Helmet>
        <title>Nurture – AI Parenting Co‑pilot | Cortiq Labs</title>
        <meta name="description" content="Get personalized activities, stories, and guidance for your child every day. Replaced guess-work with developmental benchmarks." />
        <link rel="canonical" href={canonical} />
        <script type="application/ld+json">{JSON.stringify(productLd)}</script>
        <script type="application/ld+json">{JSON.stringify(orgLd)}</script>
      </Helmet>

      <main id="main-content" className="overflow-x-hidden">
        {/* SECTION 1: HERO */}
        <section className="relative pt-0 pb-16 sm:pb-24 lg:pb-32 bg-[#FAFBF9]/40">
          <AppBanner />
          <Header />

          <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
            <div className="grid gap-12 lg:grid-cols-12 items-center py-10 sm:py-16 lg:py-24">

              {/* Hero Copy */}
              <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2D6A4F]/10 text-[#2D6A4F] text-xs font-bold uppercase tracking-wider">
                  <Stars className="w-3.5 h-3.5" />
                  Your Parenting Co-pilot
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-[1.1] tracking-tight text-[#18211A]">
                  Get personalized <span className="text-[#2D6A4F]">activities</span>, <span className="text-[#6C5B7B]">stories</span>, and <span className="text-[#355C7D]">guidance</span> for your child every day.
                </h1>

                <p className="text-base sm:text-lg md:text-xl text-[#4A5D4E] font-semibold max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  Discover your child's true hidden potential and guide them through every step with Nurture.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button
                    size="lg"
                    onClick={handleJoinNow}
                    disabled={loading}
                    className="bg-[#2D6A4F] hover:bg-[#1F513C] text-white font-extrabold px-8 py-4 text-base sm:text-lg rounded-full shadow-lg shadow-[#2D6A4F]/20 hover:shadow-xl hover:shadow-[#2D6A4F]/30 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
                  >
                    {loading ? "Signing in..." : "Start Free"}
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-[#D5DFD0] hover:bg-[#EAF0E6] text-[#2D6A4F] font-extrabold px-8 py-4 text-base sm:text-lg rounded-full w-full sm:w-auto transition-all"
                  >
                    <a href="#product">
                      <Play className="w-4 h-4 mr-2 text-[#2D6A4F] fill-current" />
                      Watch Demo
                    </a>
                  </Button>
                </div>

                <div className="text-xs sm:text-sm text-[#607060] font-semibold flex items-center justify-center lg:justify-start gap-4">
                  <span>👶 Ages 3–12</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  <span>🔒 Privacy First & Safe</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  <span>✨ Instantly Setup</span>
                </div>
              </div>

              {/* Visual Mockups - Side-by-side & layered interactive mock cards visible immediately */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
                <ParallaxEffect intensity={0.03} className="w-full max-w-md lg:max-w-full">
                  <div className="relative space-y-4 w-full">

                    {/* Mock Card 1: Today's Activity */}
                    <div
                      style={{
                        transform: `perspective(1000px) translateY(${scrollY * -0.04}px) rotateX(${scrollY * 0.025}deg) rotateY(${scrollY * -0.015}deg) rotate(-2deg)`,
                        transition: 'transform 0.1s ease-out',
                        willChange: 'transform',
                        transformStyle: 'preserve-3d'
                      }}
                      className="bg-white rounded-2xl p-6 sm:p-8 border border-[#D5DFD0] shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:rotate-0 transition-all duration-300"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-[#EAF0E6] text-[#2D6A4F]">
                            <Activity className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <span className="text-[10px] text-[#607060] font-bold uppercase tracking-wider block">Today's Activity</span>
                            <h4 className="text-xs font-black text-[#18211A] leading-tight">Cardboard Constellation Project</h4>
                          </div>
                        </div>
                        <span className="text-[9px] font-bold bg-[#EAF0E6] text-[#2D6A4F] px-2 py-0.5 rounded-full">15 mins</span>
                      </div>
                      <p className="text-[10px] text-[#4A5D4E] leading-relaxed mb-3">
                        Create a flashlight constellation projector using clean recycled boxes to spark interest in astronomy.
                      </p>
                      <div className="flex justify-between items-center text-[9px] font-bold text-[#607060]">
                        <span>🚀 Target: Curiosity & Logic</span>
                        <div className="flex items-center gap-1 text-[#2D6A4F]">
                          <Check className="w-3.5 h-3.5" /> Complete
                        </div>
                      </div>
                    </div>

                    {/* Mock Card 2: Tonight's Bedtime Story */}
                    <div
                      style={{
                        transform: `perspective(1000px) translateY(${scrollY * -0.02}px) rotateX(${scrollY * -0.02}deg) rotateY(${scrollY * 0.02}deg) rotate(1deg) translateX(12px)`,
                        transition: 'transform 0.1s ease-out',
                        willChange: 'transform',
                        transformStyle: 'preserve-3d'
                      }}
                      className="bg-[#FAF7FD] rounded-2xl p-6 sm:p-8 border border-[#E8DDF3] shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:rotate-0 transition-all duration-300"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-[#F3EBFC] text-[#7B4FA8]">
                            <BookOpen className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <span className="text-[10px] text-[#8C76A3] font-bold uppercase tracking-wider block">Tonight's Bedtime Story</span>
                            <h4 className="text-xs font-black text-[#4B3C5B] leading-tight">Leo's First Day at School</h4>
                          </div>
                        </div>
                        <span className="text-[9px] font-bold bg-[#F3EBFC] text-[#7B4FA8] px-2 py-0.5 rounded-full">Courage</span>
                      </div>
                      <p className="text-[10px] text-[#6E5C7D] leading-relaxed mb-3">
                        Leo the lion was scared his mane looked different. Follow his journey learning the beauty of unique differences.
                      </p>
                      <div className="flex justify-between items-center text-[9px] font-bold text-[#8C76A3]">
                        <span>💬 Reflection Checkpoints: Ready</span>
                        <span className="text-[#7B4FA8] hover:underline cursor-pointer">Open story →</span>
                      </div>
                    </div>

                    {/* Mock Card 3: Parent Growth Radar */}
                    <div
                      style={{
                        transform: `perspective(1000px) translateY(${scrollY * -0.06}px) rotateX(${scrollY * 0.03}deg) rotateY(${scrollY * -0.035}deg) rotate(-1deg) translateX(-12px)`,
                        transition: 'transform 0.1s ease-out',
                        willChange: 'transform',
                        transformStyle: 'preserve-3d'
                      }}
                      className="bg-white rounded-2xl p-6 border border-[#D5DFD0] shadow-[0_12px_40px_rgba(0,0,0,0.06)] hover:rotate-0 transition-all duration-300 max-w-[280px] mx-auto lg:ml-6"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 rounded-md bg-amber-50 text-amber-600">
                          <Award className="w-4 h-4" />
                        </div>
                        <span className="text-[9px] text-[#607060] font-black uppercase tracking-wider">Weekly Insights</span>
                      </div>
                      <div className="space-y-1.5">
                        <div>
                          <div className="flex justify-between text-[9px] font-bold mb-0.5">
                            <span>Logic & Coding Potential</span>
                            <span className="text-[#2D6A4F]">92%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                            <div className="bg-[#2D6A4F] h-full rounded-full" style={{ width: '92%' }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-[9px] font-bold mb-0.5">
                            <span>Creativity</span>
                            <span className="text-[#7B4FA8]">85%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                            <div className="bg-[#7B4FA8] h-full rounded-full" style={{ width: '85%' }} />
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </ParallaxEffect>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION 2: PAIN (Problem Statement) */}
        <section className="py-16 sm:py-24 bg-[#FAFBF9]/40 border-y border-[#EAF0E6] overflow-hidden">
          <ScrollReveal animation="3d-lift">
            <div className="container px-4 sm:px-6 lg:px-8 mx-auto max-w-4xl">
              <div className="text-center space-y-4 mb-12">
                <h2 className="text-3xl sm:text-4xl font-black text-[#18211A] tracking-tight">
                  Parenting shouldn't feel like guessing.
                </h2>
                <p className="text-base text-[#607060] font-bold max-w-xl mx-auto">
                  Every parent wants to support their child's development, but modern life presents hard questions every single day.
                </p>
              </div>

              <div className="bg-[#FAFBF9] border border-[#D5DFD0] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                <span className="text-xs uppercase font-extrabold tracking-wider text-[#607060] block text-center sm:text-left">
                  Parents often wonder:
                </span>

                <div className="grid gap-4 sm:grid-cols-2 text-sm sm:text-base font-semibold text-[#18211A]">
                  {[
                    "What activity should my child do today?",
                    "How can I reduce screen time?",
                    "What skills should I focus on?",
                    "Is my child developing the right strengths?",
                    "Am I doing enough as a parent?"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#EAF0E6] shadow-2xs">
                      <div className="w-5 h-5 rounded-full bg-[#EAF0E6] text-[#2D6A4F] flex items-center justify-center font-bold text-xs shrink-0">
                        ✓
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-[#D5DFD0]/60 text-center">
                  <p className="text-base sm:text-lg font-black text-[#2D6A4F]">
                    Nurture helps answer those questions every single day.
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* SECTION 3: HOW IT WORKS */}
        <section id="how-it-works" className="py-16 sm:py-24 bg-white/40 border-b border-[#EAF0E6] overflow-hidden">
          <ScrollReveal animation="3d-lift" delay={50}>
            <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
              <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                <h2 className="text-3xl sm:text-4xl font-black text-[#18211A] tracking-tight">
                  How Nurture Works
                </h2>
                <p className="text-sm sm:text-base text-[#607060] font-semibold max-w-xl mx-auto">
                  No complex manuals or rigid routines. We align with your schedule and your child's personality effortlessly.
                </p>
              </div>

              <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    step: "1",
                    title: "Tell us about your child",
                    desc: "Complete a simple 2-minute onboarding about their age, current interests, personality, and values.",
                    color: "bg-[#2D6A4F]"
                  },
                  {
                    step: "2",
                    title: "Understand their strengths",
                    desc: "Nurture continuously tracks milestones, learning rates, and curiosity profiles from interactive daily completions.",
                    color: "bg-[#7B4FA8]"
                  },
                  {
                    step: "3",
                    title: "Personalized daily guidance",
                    desc: "Get one highly focused daily activity, custom moral moral bedtime stories, and conversational questions.",
                    color: "bg-[#355C7D]"
                  },
                  {
                    step: "4",
                    title: "Watch growth over time",
                    desc: "Visualize developmental trends across five major dimensions like Creativity, Logic, and Empathy.",
                    color: "bg-[#C06C84]"
                  }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white border border-[#D5DFD0] rounded-2xl p-6 shadow-xs relative hover:border-[#2D6A4F]/40 transition-all group">
                    <div className={`w-8 h-8 rounded-full ${item.color} text-white flex items-center justify-center font-extrabold text-sm mb-4 group-hover:scale-110 transition-transform`}>
                      {item.step}
                    </div>
                    <h3 className="text-lg font-black text-[#18211A] mb-2 leading-tight">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#607060] leading-relaxed font-medium">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* SECTION 4: THE ACTUAL PRODUCT */}
        <section id="product" className="py-16 sm:py-24 bg-[#FAFBF9]/40 border-t border-[#EAF0E6] overflow-hidden">
          <ScrollReveal animation="3d-lift">
            <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
              <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                <h2 className="text-3xl sm:text-4xl font-black text-[#18211A] tracking-tight">
                  Everything your child needs in one place
                </h2>
                <p className="text-sm sm:text-base text-[#607060] font-semibold max-w-xl mx-auto">
                  Stop jumping between dozens of uncoordinated apps. We centralize premium guidance, play, and tools for modern parents.
                </p>
              </div>

              <div className="grid gap-8 lg:grid-cols-3">

                {/* Product Card 1: Daily Activities */}
                <div className="bg-[#FAFBF9] border border-[#D5DFD0] rounded-3xl p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-all">
                  <div className="space-y-4">
                    <div className="w-10 h-10 rounded-2xl bg-[#EAF0E6] text-[#2D6A4F] flex items-center justify-center font-black">
                      ⚽
                    </div>
                    <h3 className="text-xl font-black text-[#18211A]">Daily Activities</h3>
                    <p className="text-xs text-[#607060] leading-relaxed font-semibold">
                      One meaningful off-screen activity every single day designed to spark real-world creation, critical thinking, and bonding.
                    </p>
                  </div>

                  {/* Visual Interface Component inside card */}
                  <div className="bg-white rounded-2xl p-4 border border-[#EAF0E6] mt-6 shadow-2xs space-y-2">
                    <span className="text-[8px] font-black uppercase text-[#2D6A4F] bg-[#EAF0E6] px-1.5 py-0.5 rounded-full inline-block">Today's Prompt</span>
                    <p className="text-[10px] font-bold text-[#18211A]">"Construct a DIY sundial to teach light and shadows."</p>
                    <div className="w-full bg-[#FAFBF9] rounded-lg p-2 flex justify-between items-center text-[8px] font-black text-[#607060]">
                      <span>🎒 Category: Science & Outdoors</span>
                      <span className="text-[#2D6A4F]">15 min play</span>
                    </div>
                  </div>
                </div>

                {/* Product Card 2: Personalized Bedtime Stories */}
                <div className="bg-[#FAFBF9] border border-[#D5DFD0] rounded-3xl p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-all">
                  <div className="space-y-4">
                    <div className="w-10 h-10 rounded-2xl bg-[#F3EBFC] text-[#7B4FA8] flex items-center justify-center font-black">
                      📖
                    </div>
                    <h3 className="text-xl font-black text-[#18211A]">Moral Stories Studio</h3>
                    <p className="text-xs text-[#607060] leading-relaxed font-semibold">
                      Stories generated and built specifically around the core moral values (e.g. Courage, Honesty) and real life behavioral challenges you want to teach.
                    </p>
                  </div>

                  {/* Visual Interface Component inside card */}
                  <div className="bg-white rounded-2xl p-4 border border-[#E8DDF3] mt-6 shadow-2xs space-y-2">
                    <div className="flex gap-1">
                      <span className="text-[8px] font-black bg-[#F3EBFC] text-[#7B4FA8] px-1.5 py-0.5 rounded-full">Honesty</span>
                      <span className="text-[8px] font-black bg-[#FAF7FD] text-[#8C76A3] px-1.5 py-0.5 rounded-full">Sharing Toys</span>
                    </div>
                    <p className="text-[10px] font-bold text-[#4B3C5B]">"Leo the Lion learns why sharing his special toys makes everyone happy."</p>
                    <div className="w-full bg-[#FAF7FD] rounded-lg p-2 text-center text-[8px] font-black text-[#7B4FA8]">
                      ✨ Click to read bedtime moral story
                    </div>
                  </div>
                </div>

                {/* Product Card 3: Parent Growth Insights */}
                <div className="bg-[#FAFBF9] border border-[#D5DFD0] rounded-3xl p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-all">
                  <div className="space-y-4">
                    <div className="w-10 h-10 rounded-2xl bg-[#E6EEF5] text-[#355C7D] flex items-center justify-center font-black">
                      📊
                    </div>
                    <h3 className="text-xl font-black text-[#18211A]">Progress Insights</h3>
                    <p className="text-xs text-[#607060] leading-relaxed font-semibold">
                      Understand your child's emerging strengths and consistency with dynamically updating radar maps across multiple developmental spectrums.
                    </p>
                  </div>

                  {/* Visual Interface Component inside card */}
                  <div className="bg-white rounded-2xl p-4 border border-[#D5DFD0] mt-6 shadow-2xs space-y-1.5">
                    <span className="text-[8px] font-black uppercase text-[#355C7D] block mb-1">Growth Index</span>
                    <div className="flex justify-between text-[9px] font-bold">
                      <span>Creativity</span>
                      <span className="text-[#355C7D]">88%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                      <div className="bg-[#355C7D] h-full rounded-full" style={{ width: '88%' }} />
                    </div>
                    <div className="flex justify-between text-[9px] font-bold pt-1">
                      <span>Logic & Reasoning</span>
                      <span className="text-[#2D6A4F]">95%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                      <div className="bg-[#2D6A4F] h-full rounded-full" style={{ width: '95%' }} />
                    </div>
                  </div>
                </div>

                {/* Product Card 4: Career Pathways */}
                <div className="bg-[#FAFBF9] border border-[#D5DFD0] rounded-3xl p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-all lg:col-span-1.5">
                  <div className="space-y-4">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
                      🚀
                    </div>
                    <h3 className="text-xl font-black text-[#18211A]">Career Roadmaps</h3>
                    <p className="text-xs text-[#607060] leading-relaxed font-semibold">
                      See how today's active play interests (like building and questioning) naturally transition into actual professional opportunities.
                    </p>
                  </div>

                  {/* Visual Interface Component inside card */}
                  <div className="bg-white rounded-2xl p-4 border border-amber-100 mt-6 shadow-2xs space-y-2">
                    <span className="text-[8px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full inline-block">Active Pathway</span>
                    <p className="text-[10px] font-bold text-slate-800">"Future Software Architect / Engineer"</p>
                    <p className="text-[8px] text-slate-500 font-bold">Skills required: Logic, Spatial Reasoning, Focus</p>
                  </div>
                </div>

                {/* Product Card 5: AI Parenting Coach */}
                <div className="bg-[#FAFBF9] border border-[#D5DFD0] rounded-3xl p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-all lg:col-span-1.5">
                  <div className="space-y-4">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
                      💬
                    </div>
                    <h3 className="text-xl font-black text-[#18211A]">Parent AI Co-pilot</h3>
                    <p className="text-xs text-[#607060] leading-relaxed font-semibold">
                      Get support for any parenting query, dilemma, or behavioral milestone whenever you need it from our dedicated AI parenting co-pilot.
                    </p>
                  </div>

                  {/* Visual Interface Component inside card */}
                  <div className="bg-white rounded-2xl p-4 border border-emerald-100 mt-6 shadow-2xs space-y-2">
                    <div className="bg-slate-50 p-2 rounded-xl text-[8px] font-bold text-[#607060]">
                      "How do I help my child build empathy with classmates?"
                    </div>
                    <div className="bg-[#EAF0E6] p-2 rounded-xl text-[8px] font-bold text-[#2D6A4F] ml-2">
                      "Encourage peer activities and follow up with tonight's Bedtime Story on Kindness!"
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* SECTION 5: RESULTS (Testimonials) */}
        <section id="testimonials" className="py-16 sm:py-24 bg-white/40 border-t border-[#EAF0E6] overflow-hidden">
          <ScrollReveal animation="3d-tilt-left">
            <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
              <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                <span className="text-xs uppercase font-extrabold tracking-wider text-[#2D6A4F]">Real Impact</span>
                <h2 className="text-3xl sm:text-4xl font-black text-[#18211A] tracking-tight">
                  What Parents Are Saying
                </h2>
                <p className="text-sm sm:text-base text-[#607060] font-semibold max-w-xl mx-auto">
                  Hear from early families who have integrated Nurture into their daily schedules.
                </p>
              </div>

              <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
                {[
                  {
                    quote: "My daughter now asks for her Nurture activity before watching YouTube.",
                    author: "Priya S.",
                    role: "Mom of 6-year-old",
                    avatar: "👩‍🍼"
                  },
                  {
                    quote: "I finally know what to do with my child every day. Simple, fast, and structured.",
                    author: "David L.",
                    role: "Father of 4-year-old",
                    avatar: "👨‍🍼"
                  },
                  {
                    quote: "The personalized moral stories are our favorite bedtime routine. She loves seeing her name in them!",
                    author: "Aisha M.",
                    role: "Mom of 8-year-old",
                    avatar: "👩‍💼"
                  }
                ].map((item, idx) => (
                  <Card key={idx} className="glass-card border border-[#D5DFD0] shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between bg-white">
                    <CardContent className="pt-6 space-y-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex gap-0.5 text-amber-500 mb-4">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className="text-sm">★</span>
                          ))}
                        </div>
                        <p className="text-sm sm:text-base text-[#18211A] font-semibold leading-relaxed">
                          “{item.quote}”
                        </p>
                      </div>

                      <div className="flex items-center gap-3 pt-4 border-t border-[#EAF0E6] mt-4">
                        <div className="w-9 h-9 rounded-full bg-[#EAF0E6] flex items-center justify-center text-lg shrink-0">
                          {item.avatar}
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-[#18211A]">{item.author}</h4>
                          <p className="text-[10px] text-[#607060] font-bold">{item.role}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* SECTION 6: WHY NURTURE IS DIFFERENT (Comparison Grid) */}
        <section className="py-16 sm:py-24 bg-[#FAFBF9]/40 border-y border-[#EAF0E6] overflow-hidden">
          <ScrollReveal animation="scale-up">
            <div className="container px-4 sm:px-6 lg:px-8 mx-auto max-w-4xl">
              <div className="text-center space-y-4 mb-16">
                <h2 className="text-3xl sm:text-4xl font-black text-[#18211A] tracking-tight">
                  Why Nurture is Different
                </h2>
                <p className="text-sm text-[#607060] font-bold max-w-lg mx-auto">
                  A simple breakdown of how Nurture elevates parenting compared to generic apps.
                </p>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-[#D5DFD0] shadow-2xs">
                <table className="w-full border-collapse bg-white/80 backdrop-blur-xs text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-[#FAFBF9]/80 border-b border-[#D5DFD0] text-[#18211A] font-black uppercase text-[10px] tracking-wider">
                      <th className="p-4 sm:p-5">Feature</th>
                      <th className="p-4 sm:p-5 text-center text-[#607060]">Generic Apps</th>
                      <th className="p-4 sm:p-5 text-center text-[#2D6A4F]">Nurture</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAF0E6] font-semibold text-[#18211A]">
                    {[
                      { label: "Personalized Daily Plans", generic: "Sometimes", nurture: "Yes" },
                      { label: "Daily Physical Activities", generic: "Limited", nurture: "Yes" },
                      { label: "Custom Moral Bedtime Stories", generic: "No", nurture: "Yes" },
                      { label: "Child Strengths Insights", generic: "No", nurture: "Yes" },
                      { label: "Future Career Roadmaps", generic: "No", nurture: "Yes" },
                      { label: "AI Parenting Co-pilot Support", generic: "No", nurture: "Yes" }
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#FAFBF9]/50 transition-all">
                        <td className="p-4 sm:p-5 font-black text-[#18211A]">{row.label}</td>
                        <td className="p-4 sm:p-5 text-center text-slate-500 font-bold">{row.generic}</td>
                        <td className="p-4 sm:p-5 text-center text-[#2D6A4F] font-black bg-[#2D6A4F]/5">
                          <span className="inline-flex items-center gap-1 text-[#2D6A4F]">
                            <Check className="w-4 h-4" /> {row.nurture}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* SECTION 7: PRICING (SaaS Grid) */}
        <section id="pricing" ref={pricingRef} className="py-16 sm:py-24 bg-white/40 overflow-hidden relative min-h-[600px] flex items-center justify-center">

          {/* Dynamic bold red marker strike-through line across the center of pricing */}
          <div
            className={`absolute top-[48%] left-[5%] right-[5%] h-4 bg-red-600 rounded-full z-20 origin-left transition-all duration-1000 ease-in-out pointer-events-none ${pricingStruck ? 'scale-x-100 rotate-[-5deg] opacity-90' : 'scale-x-0 rotate-[-5deg] opacity-0'}`}
            style={{ transformOrigin: 'left center' }}
          />

          <ScrollReveal animation="3d-lift">
            <div className={`container px-4 sm:px-6 lg:px-8 mx-auto max-w-5xl transition-all duration-700 ease-in-out ${pricingStruck ? 'blur-[16px] pointer-events-none opacity-30 select-none scale-[0.98]' : ''}`}>
              <div className="text-center space-y-4 mb-12">
                <span className="text-xs uppercase font-extrabold tracking-wider text-[#2D6A4F]">Pricing Plans</span>
                <h2 className="text-3xl sm:text-4xl font-black text-[#18211A] tracking-tight">
                  Simple, Transparent Pricing
                </h2>
                <p className="text-sm text-[#607060] font-bold max-w-md mx-auto">
                  No hidden setup fees or locked levels. Choose a plan that matches your family's dynamic growth goals.
                </p>

                {/* Billing Cycle Switch */}
                <div className="inline-flex items-center gap-2 p-1 bg-[#EAF0E6] rounded-full border border-[#D5DFD0] mt-4">
                  <button
                    onClick={() => setPricingPeriod('monthly')}
                    className={`px-4 py-1.5 rounded-full text-xs font-black transition-all ${pricingPeriod === 'monthly' ? 'bg-[#2D6A4F] text-white shadow-xs' : 'text-[#2D6A4F]'}`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setPricingPeriod('yearly')}
                    className={`px-4 py-1.5 rounded-full text-xs font-black transition-all ${pricingPeriod === 'yearly' ? 'bg-[#2D6A4F] text-white shadow-xs' : 'text-[#2D6A4F]'}`}
                  >
                    Yearly (Save 20%)
                  </button>
                </div>
              </div>

              <div className="grid gap-6 sm:gap-8 lg:grid-cols-3 items-stretch">

                {/* Plan 1: Free */}
                <div className="bg-white border border-[#D5DFD0] rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:border-[#D5DFD0]/80 transition-all">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-black text-[#18211A]">Free</h3>
                      <p className="text-xs text-[#607060] mt-1 font-semibold">Basic child progress trial.</p>
                    </div>

                    <div className="flex items-baseline text-[#18211A] font-black">
                      <span className="text-4xl">$0</span>
                      <span className="text-xs text-[#607060] ml-1">/forever</span>
                    </div>

                    <ul className="space-y-3.5 text-xs text-[#4A5D4E] font-bold">
                      <li className="flex items-center gap-2">
                        <Check className="w-4.5 h-4.5 text-[#2D6A4F] shrink-0" />
                        <span>1 Child Profile</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4.5 h-4.5 text-[#2D6A4F] shrink-0" />
                        <span>Basic daily play activities</span>
                      </li>
                      <li className="flex items-center gap-2 text-slate-400">
                        <X className="w-4.5 h-4.5 shrink-0" />
                        <span>No custom bedtime stories</span>
                      </li>
                      <li className="flex items-center gap-2 text-slate-400">
                        <X className="w-4.5 h-4.5 shrink-0" />
                        <span>No skill growth radars</span>
                      </li>
                    </ul>
                  </div>

                  <Button
                    onClick={handleJoinNow}
                    className="mt-8 border border-[#D5DFD0] hover:bg-[#EAF0E6] text-[#2D6A4F] bg-white font-extrabold w-full py-3 rounded-full cursor-pointer transition-all"
                  >
                    Start Free
                  </Button>
                </div>

                {/* Plan 2: Premium (Best Value) */}
                <div className="bg-white border-2 border-[#2D6A4F] rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-md relative hover:shadow-lg transition-all scale-102">
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#2D6A4F] text-white text-[10px] font-black tracking-wider uppercase px-4.5 py-1 rounded-full shadow-xs">
                    ★ Best Value ★
                  </div>

                  <div className="space-y-6 mt-2">
                    <div>
                      <h3 className="text-lg font-black text-[#18211A]">Premium</h3>
                      <p className="text-xs text-[#607060] mt-1 font-semibold">Everything parents need daily.</p>
                    </div>

                    <div className="flex items-baseline text-[#18211A] font-black">
                      <span className="text-4xl">
                        {pricingPeriod === 'monthly' ? '$29' : '$19'}
                      </span>
                      <span className="text-xs text-[#607060] ml-1">/month</span>
                    </div>

                    <ul className="space-y-3.5 text-xs text-[#4A5D4E] font-bold">
                      <li className="flex items-center gap-2">
                        <Check className="w-4.5 h-4.5 text-[#2D6A4F] shrink-0" />
                        <span>1 Child Profile</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4.5 h-4.5 text-[#2D6A4F] shrink-0" />
                        <span>Unlimited daily personalized play</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4.5 h-4.5 text-[#2D6A4F] shrink-0" />
                        <span>Custom Bedtime Moral Stories</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4.5 h-4.5 text-[#2D6A4F] shrink-0" />
                        <span>Full Skill Growth Radars</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4.5 h-4.5 text-[#2D6A4F] shrink-0" />
                        <span>AI Career Pathways guidance</span>
                      </li>
                    </ul>
                  </div>

                  <Button
                    onClick={handleJoinNow}
                    className="mt-8 bg-[#2D6A4F] hover:bg-[#1F513C] text-white font-extrabold w-full py-3 rounded-full cursor-pointer shadow-sm hover:shadow transition-all"
                  >
                    Start Free Trial
                  </Button>
                </div>

                {/* Plan 3: Family */}
                <div className="bg-white border border-[#D5DFD0] rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:border-[#D5DFD0]/80 transition-all">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-black text-[#18211A]">Family</h3>
                      <p className="text-xs text-[#607060] mt-1 font-semibold">Perfect for multiple children.</p>
                    </div>

                    <div className="flex items-baseline text-[#18211A] font-black">
                      <span className="text-4xl">
                        {pricingPeriod === 'monthly' ? '$49' : '$39'}
                      </span>
                      <span className="text-xs text-[#607060] ml-1">/month</span>
                    </div>

                    <ul className="space-y-3.5 text-xs text-[#4A5D4E] font-bold">
                      <li className="flex items-center gap-2">
                        <Check className="w-4.5 h-4.5 text-[#2D6A4F] shrink-0" />
                        <span>Up to 3 Child Profiles</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4.5 h-4.5 text-[#2D6A4F] shrink-0" />
                        <span>All Premium benefits unlocked</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4.5 h-4.5 text-[#2D6A4F] shrink-0" />
                        <span>Shared parenting radar reports</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4.5 h-4.5 text-[#2D6A4F] shrink-0" />
                        <span>Priority AI co-pilot responses</span>
                      </li>
                    </ul>
                  </div>

                  <Button
                    onClick={handleJoinNow}
                    className="mt-8 border border-[#D5DFD0] hover:bg-[#EAF0E6] text-[#2D6A4F] bg-white font-extrabold w-full py-3 rounded-full cursor-pointer transition-all"
                  >
                    Start Family Plan
                  </Button>
                </div>

              </div>
            </div>
          </ScrollReveal>

          {/* Gorgeous early bird 100% discount overlay popup */}
          <div
            className={`absolute inset-0 flex items-center justify-center p-4 z-30 transition-all duration-700 ${pricingStruck ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}
          >
            <div className="bg-[#18211A]/95 text-white p-8 sm:p-10 rounded-3xl border border-amber-400/40 max-w-lg w-full text-center shadow-[0_20px_50px_rgba(45,106,79,0.35)] space-y-6 relative overflow-hidden backdrop-blur-md">
              {/* Decorative gold background glow */}
              <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-[#2D6A4F]/20 blur-3xl pointer-events-none" />

              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-black uppercase tracking-wider animate-bounce">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Early Bird Discount
              </div>

              <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                Get Nurture <span className="text-amber-400 underline decoration-wavy">100% Free</span> Today!
              </h3>

              <p className="text-sm text-slate-300 font-semibold leading-relaxed">
                We have struck out our pricing plans. Sign up today and get complete early access to all premium activities, bedtime moral stories, and parenting co-pilots for <span className="text-white font-extrabold">$0</span>.
              </p>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5 text-left">
                  <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Offer status</p>
                    <p className="text-xs font-bold text-white">Active Just Today</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-left">
                  <Gift className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Early Benefit</p>
                    <p className="text-xs font-bold text-emerald-400">100% Free Access</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleJoinNow}
                className="w-full py-4 bg-amber-400 hover:bg-amber-300 text-[#18211A] hover:scale-102 font-black rounded-full shadow-lg hover:shadow-xl cursor-pointer transition-all duration-300 text-base"
              >
                Claim Free Early Bird Access
              </Button>

              <p className="text-[10px] text-slate-400 font-medium">
                No credit card required. Instantly setup in 2 minutes.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 8: SAFETY & PRIVACY */}
        <section className="container px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16 md:mt-20 mx-auto max-w-4xl pb-16 overflow-hidden">
          <ScrollReveal animation="scale-up">
            <Card className="glass-card border border-[#D5DFD0] shadow-2xs bg-white rounded-3xl overflow-hidden p-2 sm:p-4">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-[#18211A] font-black">
                  <ShieldCheck aria-hidden="true" className="text-[#2D6A4F] w-6 h-6" /> Privacy first
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs sm:text-sm text-[#607060] leading-relaxed font-semibold">
                Nurture prioritizes your family's privacy with secure database encryption at rest, industry-standard TLS encryption in transit, and strict minimal data collection protocols to keep your child's journey safe.
              </CardContent>
            </Card>
          </ScrollReveal>
        </section>

        {/* SECTION 9: FEEDBACK */}
        <section className="container px-4 sm:px-6 lg:px-8 mx-auto max-w-4xl pb-20 overflow-hidden">
          <ScrollReveal animation="3d-lift">
            <div id="feedback" className="bg-[#FAFBF9] border border-[#D5DFD0] rounded-3xl p-6 sm:p-8 space-y-4">
              <h2 className="text-xl sm:text-2xl font-black text-[#18211A] mb-1">Have feedback or ideas?</h2>
              <p className="text-xs sm:text-sm text-[#607060] font-semibold mb-4">
                We are constantly refining Nurture's development indices to help parents. Let us know how we can make this more valuable for your family.
              </p>
              <Suspense fallback={null}><FeedbackForm /></Suspense>
            </div>
          </ScrollReveal>
        </section>
        
        <Footer />
      </main>
    </div>
  );
};

export default Index;

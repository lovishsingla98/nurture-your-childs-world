import { Helmet } from "react-helmet-async";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import WaitlistForm from "@/components/forms/WaitlistForm";
import FeedbackForm from "@/components/forms/FeedbackForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FeatureSlides from "@/components/sections/FeatureSlides";
import { Sparkles, Brain, Baby, ChartNoAxesGantt, Stars, ShieldCheck } from "lucide-react";
import childParentRobotHero from "@/assets/features/child-parent-robot-hero.png";
import ParallaxEffect from "@/components/3d/ParallaxEffect";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Index = () => {
  const canonical = typeof window !== 'undefined' ? window.location.href : 'https://nurture.cortiq.labs';
  const { signInWithGoogle, loading } = useAuth();

  const handleJoinNow = async () => {
    // Track CTA click
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "cta_click", { event_category: "engagement", event_label: "join_now_hero" });
    }
    try {
      await signInWithGoogle();
      toast.success("Successfully signed in with Google!");
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
    <div>
      <Helmet>
        <title>Nurture – AI Parenting Co‑pilot | Cortiq Labs</title>
        <meta name="description" content="Nurture is an AI co‑pilot for modern parenting. Personalized tasks, insights, and stories for ages 3–12." />
        <link rel="canonical" href={canonical} />
        <script type="application/ld+json">{JSON.stringify(productLd)}</script>
        <script type="application/ld+json">{JSON.stringify(orgLd)}</script>
      </Helmet>

      <main>
        {/* Hero */}
        <section className="hero-veil pt-0">
          <Header />
          <div className="container px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-2 items-center py-8 sm:py-12 md:py-16 lg:py-20">
              <div className="space-y-4 sm:space-y-6 depth-layer-2 text-center lg:text-left">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  AI Co-pilot for Modern Parenting — Personalized daily activities for ages 3–12
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground max-w-prose mx-auto lg:mx-0">
                  Daily activities, gentle guidance, and meaningful insights — personalized by LLMs and designed with child psychology at the core.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  <Button 
                    size="lg" 
                    onClick={handleJoinNow} 
                    disabled={loading} 
                    className="bg-gradient-to-r from-purple-600 to-green-500 hover:from-purple-700 hover:to-green-600 text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
                  >
                    {loading ? "Signing in..." : "Join Now"}
                  </Button>
                  <Button asChild size="lg" variant="soft" className="w-full sm:w-auto">
                    <a href="#features">Explore Features</a>
                  </Button>
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">Ages 3–12 • Built with privacy and safety first</div>
              </div>
              <div className="flex justify-center depth-layer-3 order-first lg:order-last">
                <ParallaxEffect intensity={0.05} className="w-full max-w-md lg:max-w-full">
                  <div className="relative w-full hero-image-3d" style={{ background: 'transparent' }}>
                    <img 
                      src={childParentRobotHero}
                      alt="Child and parent with AI robot co-pilot learning together" 
                      className="w-full h-auto" 
                      loading="lazy"
                      style={{ background: 'transparent' }}
                    />
                  </div>
                </ParallaxEffect>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="container px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16 md:mt-20">
          <div className="text-center mb-8 sm:mb-10 depth-layer-1">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">What makes Nurture different</h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">Emotionally intelligent, LLM‑powered guidance for parents and delightful learning for kids.</p>
          </div>
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[{
              icon: <Sparkles className="text-primary icon-3d" />, title: "Daily Dynamic Plans", desc: "Fresh, tailored activities every day — no scripts, only personalization."
            },{
              icon: <Brain className="text-primary icon-3d" />, title: "Parent Insights", desc: "Clarity without overwhelm: strengths map, curiosity tracker, gentle tips."
            },{
              icon: <Baby className="text-primary icon-3d" />, title: "Kid‑Friendly Fun", desc: "Whimsical UI, story‑led prompts, soft encouragement — never judgment."
            }].map((f, i) => (
              <Card key={i} className="glass-card depth-layer-2">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">{f.icon}{f.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm sm:text-base text-muted-foreground">{f.desc}</CardContent>
              </Card>
            ))}
          </div>
        </section>

        <FeatureSlides />

        {/* Testimonials */}
        <section id="testimonials" className="container px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16 md:mt-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-10">What early parents say</h2>
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {["It feels like a gentle coach in my pocket.", "My 6‑year‑old asks for today’s task — huge win!", "Finally, insights that make sense without guilt."]
              .map((t, i) => (
                <Card key={i} className="glass-card depth-layer-2">
                  <CardContent className="pt-4 sm:pt-6">
                    <p className="text-base">“{t}”</p>
                    <p className="text-xs text-muted-foreground mt-3">— Parent {i+1}</p>
                  </CardContent>
                </Card>
            ))}
          </div>
        </section>

        {/* Safety */}
        <section className="container px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16 md:mt-20">
          <Card className="glass-card depth-layer-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <ShieldCheck className="text-primary icon-3d" /> Privacy first
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm sm:text-base text-muted-foreground">
              Nurture follows strict data minimization and parental consent. Prompts use anonymization by default. Learn more in our upcoming whitepaper.
            </CardContent>
          </Card>
        </section>

        {/* Waitlist & Feedback */}
        <section id="waitlist" className="container px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16 md:mt-20">
          <div className="grid gap-8 sm:gap-10 lg:grid-cols-2">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2">Join the beta waitlist</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">Be first to try Nurture and help shape the future of AI‑supported parenting.</p>
              <WaitlistForm />
            </div>
            <div id="feedback">
              <h3 className="text-xl sm:text-2xl font-bold mb-2">Have feedback or ideas?</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">Tell us what would make Nurture truly valuable for your family.</p>
              <FeedbackForm />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16 md:mt-20 text-center">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">Parenting, supported — not replaced.</h3>
          <p className="text-sm sm:text-base text-muted-foreground mb-6">Join thousands of parents discovering joyful, personalized learning.</p>
          <Button asChild size="lg" variant="hero" className="w-full sm:w-auto">
            <a href="#waitlist">Get Early Access</a>
          </Button>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;

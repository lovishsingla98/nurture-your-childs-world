import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AuthButtons } from "@/components/auth/AuthWrapper";
import { useAuth } from "@/contexts/AuthContext";
import MobileMenu from "./MobileMenu";

const Header = () => {
  const { user } = useAuth();

  return (
    <header className="w-full py-3 sm:py-4 md:py-6 bg-transparent">
      <div className="container px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4">
        <Link to="/home" className="flex items-center gap-2 sm:gap-3" aria-label="Nurture home">
          <img src="/Nurture_Logo.png" alt="Nurture logo" className="h-8 w-8 sm:h-9 sm:w-9" loading="lazy" />
          <div className="flex flex-col leading-tight">
            <span className="text-base sm:text-lg font-semibold">Nurture</span>
            <span className="text-xs text-muted-foreground">by Cortiq Labs</span>
          </div>
        </Link>
        <nav className="hidden lg:flex items-center gap-4 xl:gap-6 text-sm">
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#parents" className="hover:text-primary transition-colors">Parents</a>
          <a href="#kids" className="hover:text-primary transition-colors">Kids</a>
          <a href="#testimonials" className="hover:text-primary transition-colors">Testimonials</a>
          <a href="#faq" className="hover:text-primary transition-colors">FAQ</a>
        </nav>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button asChild variant="soft" size="sm" className="hidden sm:flex text-xs sm:text-sm">
            <a href="#feedback">Give Feedback</a>
          </Button>
          <Button asChild variant="hero" size="sm" className="text-xs sm:text-sm px-2 sm:px-3">
            <a href="#waitlist">Join Waitlist</a>
          </Button>
          {user && (
            <Button asChild variant="outline" size="sm" className="text-xs sm:text-sm">
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          )}
          <AuthButtons />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;

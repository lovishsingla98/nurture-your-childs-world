import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AuthButtons } from "@/components/auth/AuthWrapper";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const { user } = useAuth();

  return (
    <header className="w-full py-4 md:py-6 bg-transparent">
      <div className="container flex items-center justify-between gap-4">
        <Link to="#" className="flex items-center gap-3" aria-label="Nurture home">
          <img src="/Nurture_Logo.png" alt="Nurture logo" className="h-9 w-9" loading="lazy" />
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-semibold">Nurture</span>
            <span className="text-xs text-muted-foreground">by Cortiq Labs</span>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#parents" className="hover:text-primary transition-colors">Parents</a>
          <a href="#kids" className="hover:text-primary transition-colors">Kids</a>
          <a href="#testimonials" className="hover:text-primary transition-colors">Testimonials</a>
          <a href="#faq" className="hover:text-primary transition-colors">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="soft" size="sm">
            <a href="#feedback">Give Feedback</a>
          </Button>
          <Button asChild variant="hero" size="sm">
            <a href="#waitlist">Join Waitlist</a>
          </Button>
          {user && (
            <Button asChild variant="outline" size="sm">
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          )}
          <AuthButtons />
        </div>
      </div>
    </header>
  );
};

export default Header;

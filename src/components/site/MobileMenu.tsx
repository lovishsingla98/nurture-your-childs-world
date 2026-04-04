import { useState } from "react";
import { Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AuthButtons } from "@/components/auth/AuthWrapper";

interface MobileMenuProps {
  user?: { displayName?: string | null; email?: string | null } | null;
}

const MobileMenu = ({ user }: MobileMenuProps) => {
  const [open, setOpen] = useState(false);

  const navItems = [
    { href: "#features", label: "Features" },
    { href: "#testimonials", label: "Testimonials" },
    { href: "/blog", label: "Blog", isRoute: true },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="p-1">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[280px] sm:w-[350px]">
        <div className="flex flex-col space-y-4 mt-6">
          {navItems.map((item) =>
            item.isRoute ? (
              <Link
                key={item.href}
                to={item.href}
                className="text-lg font-medium hover:text-primary transition-colors py-2"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.href}
                href={item.href}
                className="text-lg font-medium hover:text-primary transition-colors py-2"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            )
          )}
          <div className="pt-4 border-t space-y-3">
            <Button asChild variant="soft" className="w-full">
              <a href="#feedback" onClick={() => setOpen(false)}>
                Feedback
              </a>
            </Button>
            <Button asChild variant="hero" className="w-full">
              <a href="#waitlist" onClick={() => setOpen(false)}>
                Join Waitlist
              </a>
            </Button>
            {user && (
              <Button asChild variant="outline" className="w-full">
                <Link to="/dashboard" onClick={() => setOpen(false)}>
                  Dashboard
                </Link>
              </Button>
            )}
            <div className="flex justify-center">
              <AuthButtons />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;

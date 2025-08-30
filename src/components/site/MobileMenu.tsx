import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const MobileMenu = () => {
  const [open, setOpen] = useState(false);

  const navItems = [
    { href: "#features", label: "Features" },
    { href: "#parents", label: "Parents" },
    { href: "#kids", label: "Kids" },
    { href: "#testimonials", label: "Testimonials" },
    { href: "#faq", label: "FAQ" },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="lg:hidden p-1">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[280px] sm:w-[350px]">
        <div className="flex flex-col space-y-4 mt-6">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-lg font-medium hover:text-primary transition-colors py-2"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <div className="pt-4 border-t space-y-3">
            <Button asChild variant="soft" className="w-full">
              <a href="#feedback" onClick={() => setOpen(false)}>
                Give Feedback
              </a>
            </Button>
            <Button asChild variant="hero" className="w-full">
              <a href="#waitlist" onClick={() => setOpen(false)}>
                Join Waitlist
              </a>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
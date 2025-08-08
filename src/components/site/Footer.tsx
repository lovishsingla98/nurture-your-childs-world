import { Mail, MessageCircle } from "lucide-react";

const Footer = () => {
  return (
    <footer className="mt-24 border-t">
      <div className="container py-10 grid gap-8 md:grid-cols-3">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <img src="/CortiqLabs.png" alt="Cortiq Labs logo" className="h-8 w-8" loading="lazy" />
            <div className="font-semibold">Cortiq Labs</div>
          </div>
          <p className="text-sm text-muted-foreground">Building human-centered AI for families.</p>
        </div>
        <div>
          <h4 className="font-medium mb-3">Company</h4>
          <ul className="text-sm space-y-2 text-muted-foreground">
            <li><a href="#features" className="hover:text-foreground">Features</a></li>
            <li><a href="#waitlist" className="hover:text-foreground">Waitlist</a></li>
            <li><a href="#feedback" className="hover:text-foreground">Feedback</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium mb-3">Connect</h4>
          <div className="flex items-center gap-4 text-muted-foreground">
            <a href="mailto:cortiqlabs@gmail.com" aria-label="Email" className="hover:text-foreground"><Mail size={18} /></a>
            <a href="https://wa.me/919148361554" aria-label="WhatsApp" className="hover:text-foreground"><MessageCircle size={18} /></a>
          </div>
        </div>
      </div>
      <div className="border-t py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Cortiq Labs — All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;

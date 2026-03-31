import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { UserMenu } from "@/components/auth/UserMenu";
import { FileText, MessageSquare, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/blog", label: "Posts", icon: FileText },
  { href: "/admin/comments", label: "Comments", icon: MessageSquare },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Admin header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to site
            </Link>
            <span className="text-sm font-semibold">Admin</span>
          </div>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <Button
                key={item.href}
                asChild
                variant="ghost"
                size="sm"
                className={cn(
                  location.pathname.startsWith(item.href) &&
                    "bg-muted text-foreground"
                )}
              >
                <Link to={item.href}>
                  <item.icon className="mr-1.5 h-4 w-4" />
                  {item.label}
                </Link>
              </Button>
            ))}
          </nav>
          <UserMenu />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container py-6">{children}</main>
    </div>
  );
}

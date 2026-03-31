import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { LogIn } from "lucide-react";

export function LoginButton() {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    setLoading(true);
    try {
      await signIn();
    } catch {
      // User closed popup or other error — silently ignore
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleSignIn} disabled={loading}>
      <LogIn className="mr-1.5 h-4 w-4" />
      {loading ? "Signing in…" : "Sign in"}
    </Button>
  );
}

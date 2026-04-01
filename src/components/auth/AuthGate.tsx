import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

interface AuthGateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthGate({ open, onOpenChange }: AuthGateProps) {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignIn() {
    setLoading(true);
    setError("");
    try {
      await signIn();
      onOpenChange(false);
    } catch {
      setError("Sign-in was cancelled. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join the conversation</DialogTitle>
          <DialogDescription>
            Sign in with your Google account to leave a comment. It only takes a
            second.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 pt-2">
          <Button onClick={handleSignIn} disabled={loading} className="w-full">
            {loading ? "Signing in…" : "Continue with Google"}
          </Button>
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

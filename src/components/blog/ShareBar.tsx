import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link2, Check, Share2 } from "lucide-react";

interface ShareBarProps {
  url: string;
  title: string;
}

export function ShareBar({ url, title }: ShareBarProps) {
  const [copied, setCopied] = useState(false);
  const canonicalUrl = `${window.location.origin}${url}`;

  async function copyLink() {
    await navigator.clipboard.writeText(canonicalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareWhatsApp() {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${title} — ${canonicalUrl}`)}`,
      "_blank"
    );
  }

  function shareNative() {
    if (navigator.share) {
      navigator.share({ title, url: canonicalUrl });
    } else {
      // Fallback: copy for Instagram caption
      navigator.clipboard.writeText(`${title}\n\n${canonicalUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="flex items-center gap-2 border-t border-b py-4 my-8">
      <span className="text-sm font-medium text-muted-foreground mr-2">Share</span>
      <Button variant="outline" size="sm" onClick={copyLink}>
        {copied ? (
          <>
            <Check className="mr-1 h-4 w-4" /> Copied!
          </>
        ) : (
          <>
            <Link2 className="mr-1 h-4 w-4" /> Copy link
          </>
        )}
      </Button>
      <Button variant="outline" size="sm" onClick={shareWhatsApp}>
        WhatsApp
      </Button>
      <Button variant="outline" size="sm" onClick={shareNative}>
        <Share2 className="mr-1 h-4 w-4" /> Share
      </Button>
    </div>
  );
}

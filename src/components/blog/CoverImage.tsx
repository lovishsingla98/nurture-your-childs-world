import { useState } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface CoverImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: number;
}

export function CoverImage({
  src,
  alt,
  className,
  aspectRatio = 16 / 9,
}: CoverImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <AspectRatio ratio={aspectRatio} className={cn("overflow-hidden rounded-t-lg", className)}>
        <div className="flex h-full w-full items-center justify-center bg-muted">
          <span className="text-sm font-medium text-muted-foreground">
            {alt || "Blog Post"}
          </span>
        </div>
      </AspectRatio>
    );
  }

  return (
    <AspectRatio ratio={aspectRatio} className={cn("overflow-hidden rounded-t-lg", className)}>
      {!loaded && <Skeleton className="absolute inset-0 h-full w-full" />}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        width={960}
        height={540}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0"
        )}
      />
    </AspectRatio>
  );
}

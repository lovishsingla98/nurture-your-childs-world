import { useSearchParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

/**
 * Shows active search/category filters as dismissible chips.
 */
export function BlogFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q");
  const category = searchParams.get("category");

  if (!query && !category) return null;

  function removeFilter(key: string) {
    const params = new URLSearchParams(searchParams);
    params.delete(key);
    params.delete("page");
    setSearchParams(params);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">Active filters:</span>
      {category && (
        <Badge variant="secondary" className="gap-1 pr-1">
          {category}
          <button
            onClick={() => removeFilter("category")}
            className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
      {query && (
        <Badge variant="secondary" className="gap-1 pr-1">
          &quot;{query}&quot;
          <button
            onClick={() => removeFilter("q")}
            className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
    </div>
  );
}

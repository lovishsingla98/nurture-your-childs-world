import { useSearchParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { CategoryCount } from "@/types/blog";

interface CategoryFilterProps {
  categories: CategoryCount[];
  isLoading?: boolean;
}

export function CategoryFilter({ categories, isLoading }: CategoryFilterProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "";

  function selectCategory(category: string) {
    const params = new URLSearchParams(searchParams);
    if (category) {
      params.set("category", category);
    } else {
      params.delete("category");
    }
    params.delete("page"); // reset to page 1 on filter change
    setSearchParams(params);
  }

  if (isLoading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full" />
        ))}
      </div>
    );
  }

  if (categories.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={() => selectCategory("")}>
        <Badge
          variant={!activeCategory ? "default" : "outline"}
          className={cn(
            "cursor-pointer px-3 py-1 text-sm transition-colors",
            !activeCategory && "ring-2 ring-primary/20"
          )}
        >
          All
        </Badge>
      </button>
      {categories.map((cat) => (
        <button key={cat.name} onClick={() => selectCategory(cat.name)}>
          <Badge
            variant={activeCategory === cat.name ? "default" : "outline"}
            className={cn(
              "cursor-pointer px-3 py-1 text-sm transition-colors",
              activeCategory === cat.name && "ring-2 ring-primary/20"
            )}
          >
            {cat.name} ({cat.count})
          </Badge>
        </button>
      ))}
    </div>
  );
}

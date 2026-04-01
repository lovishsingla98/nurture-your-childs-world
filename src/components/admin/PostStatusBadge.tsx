import { Badge } from "@/components/ui/badge";
import type { PostStatus } from "@/types/blog";

const statusConfig: Record<PostStatus, { label: string; className: string }> = {
  published: {
    label: "Published",
    className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  },
  draft: {
    label: "Draft",
    className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  },
  scheduled: {
    label: "Scheduled",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  },
};

export function PostStatusBadge({ status }: { status: PostStatus }) {
  const config = statusConfig[status] || statusConfig.draft;
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}

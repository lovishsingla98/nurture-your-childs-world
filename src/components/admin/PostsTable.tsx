import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PostStatusBadge } from "./PostStatusBadge";
import { PostActions } from "./PostActions";
import { formatDate } from "@/lib/blog-queries";
import { Search } from "lucide-react";
import type { Post, PostStatus } from "@/types/blog";

interface PostsTableProps {
  posts: Post[];
  isLoading?: boolean;
}

const statusFilters: { value: PostStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "scheduled", label: "Scheduled" },
];

export function PostsTable({ posts, isLoading }: PostsTableProps) {
  const [statusFilter, setStatusFilter] = useState<PostStatus | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = posts.filter((post) => {
    if (statusFilter !== "all" && post.status !== statusFilter) return false;
    if (search && !post.title.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex gap-1.5">
          {statusFilters.map((f) => (
            <button key={f.value} onClick={() => setStatusFilter(f.value)}>
              <Badge
                variant={statusFilter === f.value ? "default" : "outline"}
                className="cursor-pointer"
              >
                {f.label}
              </Badge>
            </button>
          ))}
        </div>
        <div className="relative ml-auto w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts…"
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[45%]">Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Comments</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No posts found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <Link
                      to={`/admin/blog/${post.id}/edit`}
                      className="font-medium hover:text-primary transition-colors line-clamp-1"
                    >
                      {post.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <PostStatusBadge status={post.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {post.categories?.[0] || "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatDate(post.publishedAt || post.createdAt)}
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {post.commentCount || 0}
                  </TableCell>
                  <TableCell>
                    <PostActions post={post} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

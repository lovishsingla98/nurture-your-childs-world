import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  hideComment,
  unhideComment,
  adminDeleteComment,
  banUser,
} from "@/lib/comment-mutations";
import { toast } from "sonner";
import { Eye, EyeOff, Trash2, Ban, ExternalLink } from "lucide-react";
import type { Comment, CommentStatus } from "@/types/blog";

type FilterTab = "all" | "active" | "hidden" | "flagged";

const tabs: { value: FilterTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "hidden", label: "Hidden" },
  { value: "flagged", label: "Flagged" },
];

async function fetchAllComments(): Promise<Comment[]> {
  const db = await getFirebaseDb();
  const postsSnap = await getDocs(collection(db, "posts"));
  const allComments: Comment[] = [];

  for (const postDoc of postsSnap.docs) {
    const commentsSnap = await getDocs(
      collection(db, "posts", postDoc.id, "comments")
    );
    commentsSnap.docs.forEach((d) => {
      allComments.push({ id: d.id, ...d.data() } as Comment);
    });
  }

  // Sort by createdAt descending
  return allComments.sort(
    (a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)
  );
}

export function CommentModerationTable() {
  const [filter, setFilter] = useState<FilterTab>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data: comments = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-comments"],
    queryFn: fetchAllComments,
    staleTime: 30_000,
  });

  const filtered = comments.filter((c) => {
    if (filter === "all") return true;
    return c.status === filter;
  });

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((c) => c.id)));
    }
  }

  async function bulkHide() {
    for (const id of selected) {
      const comment = comments.find((c) => c.id === id);
      if (comment) await hideComment(comment.postId, id);
    }
    toast.success(`${selected.size} comment(s) hidden`);
    setSelected(new Set());
    refetch();
  }

  async function bulkDelete() {
    for (const id of selected) {
      const comment = comments.find((c) => c.id === id);
      if (comment) await adminDeleteComment(comment.postId, id);
    }
    toast.success(`${selected.size} comment(s) deleted`);
    setSelected(new Set());
    refetch();
  }

  const statusBadge = (status: CommentStatus) => {
    const config: Record<CommentStatus, { label: string; className: string }> = {
      active: { label: "Active", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
      hidden: { label: "Hidden", className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" },
      flagged: { label: "Flagged", className: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" },
      deleted: { label: "Deleted", className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
    };
    const c = config[status] || config.active;
    return <Badge variant="outline" className={c.className}>{c.label}</Badge>;
  };

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
      {/* Filter tabs */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1.5">
          {tabs.map((t) => (
            <button key={t.value} onClick={() => { setFilter(t.value); setSelected(new Set()); }}>
              <Badge
                variant={filter === t.value ? "default" : "outline"}
                className="cursor-pointer"
              >
                {t.label}
                {t.value !== "all" && (
                  <span className="ml-1">
                    ({comments.filter((c) => c.status === t.value).length})
                  </span>
                )}
              </Badge>
            </button>
          ))}
        </div>

        {/* Bulk actions */}
        {selected.size > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-muted-foreground">
              {selected.size} selected
            </span>
            <Button variant="outline" size="sm" onClick={bulkHide}>
              <EyeOff className="mr-1.5 h-3.5 w-3.5" />
              Hide
            </Button>
            <Button variant="destructive" size="sm" onClick={bulkDelete}>
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={filtered.length > 0 && selected.size === filtered.length}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Author</TableHead>
              <TableHead className="w-[40%]">Comment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No comments found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((comment) => (
                <TableRow key={comment.id}>
                  <TableCell>
                    <Checkbox
                      checked={selected.has(comment.id)}
                      onCheckedChange={() => toggleSelect(comment.id)}
                    />
                  </TableCell>
                  <TableCell className="text-sm">{comment.authorName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground truncate max-w-[300px]">
                    {comment.body?.slice(0, 100) || "[deleted]"}
                  </TableCell>
                  <TableCell>{statusBadge(comment.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {comment.createdAt?.toDate?.().toLocaleDateString() || "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        title={comment.status === "hidden" ? "Unhide" : "Hide"}
                        onClick={async () => {
                          if (comment.status === "hidden") {
                            await unhideComment(comment.postId, comment.id);
                          } else {
                            await hideComment(comment.postId, comment.id);
                          }
                          refetch();
                        }}
                      >
                        {comment.status === "hidden" ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-destructive"
                        title="Delete"
                        onClick={async () => {
                          await adminDeleteComment(comment.postId, comment.id);
                          refetch();
                          toast.success("Comment deleted");
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-destructive"
                        title="Ban user"
                        onClick={async () => {
                          if (window.confirm(`Ban ${comment.authorName}?`)) {
                            await banUser(comment.authorId);
                            toast.success("User banned");
                          }
                        }}
                      >
                        <Ban className="h-3.5 w-3.5" />
                      </Button>
                    </div>
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

import { useParams, Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PostForm } from "@/components/admin/PostForm";
import { useAdminPost } from "@/hooks/use-admin-posts";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

export default function AdminBlogEdit() {
  const { id } = useParams<{ id: string }>();
  const { data: post, isLoading } = useAdminPost(id ?? "");

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </AdminLayout>
    );
  }

  if (!post) {
    return (
      <AdminLayout>
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold mb-2">Post not found</h2>
          <Link
            to="/admin/blog"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to posts
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <Link
          to="/admin/blog"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to posts
        </Link>
        <h1 className="text-2xl font-bold">Edit Post</h1>
      </div>
      <PostForm post={post} mode="edit" />
    </AdminLayout>
  );
}

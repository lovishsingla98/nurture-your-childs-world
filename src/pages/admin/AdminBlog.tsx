import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PostsTable } from "@/components/admin/PostsTable";
import { Button } from "@/components/ui/button";
import { useAdminPosts } from "@/hooks/use-admin-posts";
import { Plus } from "lucide-react";

export default function AdminBlog() {
  const { data: posts, isLoading } = useAdminPosts();

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Posts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your blog posts
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/blog/new">
            <Plus className="mr-1.5 h-4 w-4" />
            New Post
          </Link>
        </Button>
      </div>
      <PostsTable posts={posts ?? []} isLoading={isLoading} />
    </AdminLayout>
  );
}

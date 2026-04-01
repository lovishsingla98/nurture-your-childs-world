import { AdminLayout } from "@/components/admin/AdminLayout";
import { PostForm } from "@/components/admin/PostForm";

export default function AdminBlogNew() {
  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">New Post</h1>
      </div>
      <PostForm mode="create" />
    </AdminLayout>
  );
}

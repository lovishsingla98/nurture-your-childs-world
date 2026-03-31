import { AdminLayout } from "@/components/admin/AdminLayout";
import { CommentModerationTable } from "@/components/admin/CommentModerationTable";

export default function AdminComments() {
  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Comment Moderation</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review and moderate comments across all posts
        </p>
      </div>
      <CommentModerationTable />
    </AdminLayout>
  );
}

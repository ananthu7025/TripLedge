import { db } from "@/db";
import { blogs } from "@/db/schema";
import { desc } from "drizzle-orm";
import { requireAuth } from "@/lib/utils/session";
import { BlogsClient } from "@/components/Blogs/BlogsClient";

export const metadata = {
  title: "Blogs - Trip Ledge",
  description: "Company updates and blog posts",
};

export default async function BlogsPage() {
  await requireAuth();

  const allBlogs = await db.query.blogs.findMany({
    orderBy: [desc(blogs.createdAt)],
    with: {
      author: {
        columns: { id: true, fullName: true, avatarUrl: true },
      },
    },
  });

  return <BlogsClient initialBlogs={allBlogs as any} />;
}

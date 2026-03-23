import { db } from "@/db";
import { blogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/utils/session";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarDays, User } from "lucide-react";
import { ROUTES } from "@/app/utils/constants";

export default async function BlogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAuth();
  const { id } = await params;

  const blog = await db.query.blogs.findFirst({
    where: eq(blogs.id, id),
    with: {
      author: {
        columns: { id: true, fullName: true, avatarUrl: true },
      },
    },
  });

  if (!blog) notFound();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back */}
      <Link
        href={ROUTES.BLOGS}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Blogs
      </Link>

      {/* Cover image */}
      {blog.imageUrl && (
        <div className="w-full h-72 rounded-xl overflow-hidden border border-border">
          <img src={blog.imageUrl} alt={blog.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Content card */}
      <div className="rounded-xl border bg-card shadow-sm p-8 space-y-6">
        <h1 className="text-3xl font-black text-foreground leading-tight">{blog.title}</h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground border-b border-border pb-6">
          <span className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
              {blog.author.fullName[0].toUpperCase()}
            </div>
            <User className="h-3.5 w-3.5" />
            {blog.author.fullName}
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            {new Date(blog.createdAt).toLocaleDateString(undefined, {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>

        {/* Body */}
        <div className="prose prose-sm max-w-none text-foreground/90 leading-relaxed whitespace-pre-wrap">
          {blog.content}
        </div>
      </div>
    </div>
  );
}

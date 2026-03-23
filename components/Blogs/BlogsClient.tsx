"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/app/utils/api-client";
import { useToast } from "@/lib/utils/useToast";
import { useMutation } from "@/app/utils/hooks/useApi";
import { API_ENDPOINTS, ROUTES } from "@/app/utils/constants";
import { Plus, Trash2, Eye, ImagePlus, X, Loader2 } from "lucide-react";

interface Author {
  id: string;
  fullName: string;
  avatarUrl: string | null;
}

interface Blog {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  authorId: string;
  createdAt: string;
  author: Author;
}

interface Props {
  initialBlogs: Blog[];
}

export function BlogsClient({ initialBlogs }: Props) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const refresh = () => startTransition(() => router.refresh());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const deleteMutation = useMutation();

  const handleDelete = async (id: string) => {
    const ok = await deleteMutation.mutate(() => api.delete(`${API_ENDPOINTS.BLOGS}/${id}`));
    if (ok) {
      toast({ message: "Blog deleted", variant: "success" });
      setDeletingId(null);
      refresh();
    } else {
      toast({ message: deleteMutation.error ?? "Delete failed", variant: "error" });
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Blogs</h1>
          <p className="text-sm text-muted-foreground">Company updates and announcements</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-medium h-10 px-4 hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" /> New Post
        </button>
      </div>

      {/* Grid */}
      {initialBlogs.length === 0 ? (
        <div className="rounded-xl border bg-card p-16 flex flex-col items-center gap-3 text-center">
          <ImagePlus className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No posts yet. Create the first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {initialBlogs.map((blog) => (
            <div key={blog.id} className="rounded-xl border bg-card shadow-sm flex flex-col overflow-hidden hover:shadow-md transition-shadow">
              {blog.imageUrl ? (
                <img src={blog.imageUrl} alt={blog.title} className="w-full h-44 object-cover" />
              ) : (
                <div className="w-full h-44 bg-muted flex items-center justify-center">
                  <ImagePlus className="h-8 w-8 text-muted-foreground/30" />
                </div>
              )}
              <div className="p-4 flex flex-col gap-2 flex-1">
                <h2 className="text-base font-bold text-foreground line-clamp-2 leading-snug">{blog.title}</h2>
                <p className="text-sm text-muted-foreground line-clamp-3 flex-1">{blog.content}</p>
                <div className="flex items-center justify-between pt-2 border-t border-border mt-auto">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {blog.author.fullName[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground leading-none">{blog.author.fullName}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {new Date(blog.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Link
                      href={`${ROUTES.BLOGS}/${blog.id}`}
                      className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-muted transition-colors"
                    >
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </Link>
                    <button
                      onClick={() => setDeletingId(blog.id)}
                      className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <CreateBlogModal
          onClose={() => setIsModalOpen(false)}
          onCreated={() => { setIsModalOpen(false); refresh(); }}
        />
      )}

      {/* Delete Confirm */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-foreground mb-2">Delete Blog?</h3>
            <p className="text-sm text-muted-foreground mb-6">This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 text-sm font-medium rounded-md border border-border hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                disabled={deleteMutation.isLoading}
                className="px-4 py-2 text-sm font-medium rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50"
              >
                {deleteMutation.isLoading ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Create Blog Modal ────────────────────────────────────────────────────────

function CreateBlogModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const submitMutation = useMutation();

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(API_ENDPOINTS.UPLOAD_IMAGE, { method: "POST", body: formData });
      const data = await res.json();
      if (data.imageUrl) {
        setImageUrl(data.imageUrl);
      } else {
        toast({ message: "Image upload failed", variant: "error" });
        setPreviewUrl(null);
      }
    } catch {
      toast({ message: "Image upload failed", variant: "error" });
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const ok = await submitMutation.mutate(() =>
      api.post(API_ENDPOINTS.BLOGS, { title, content, imageUrl })
    );
    if (ok) {
      toast({ message: "Blog published!", variant: "success" });
      onCreated();
    } else {
      toast({ message: submitMutation.error ?? "Failed to publish", variant: "error" });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">New Blog Post</h2>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6 overflow-y-auto flex-1">
          {/* Image upload */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Cover Image</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="relative w-full h-44 rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer overflow-hidden flex items-center justify-center bg-muted/30"
            >
              {previewUrl ? (
                <>
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  {uploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <ImagePlus className="h-8 w-8" />
                  <span className="text-sm">Click to upload image</span>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Title <span className="text-destructive">*</span></label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter blog title…"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Content <span className="text-destructive">*</span></label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your blog content…"
              rows={6}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-2 border-t border-border">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md border border-border hover:bg-muted transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitMutation.isLoading || uploading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {submitMutation.isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Publishing…</> : "Publish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

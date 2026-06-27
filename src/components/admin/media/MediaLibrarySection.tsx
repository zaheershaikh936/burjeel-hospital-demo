"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ImageOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { MediaUpload } from "./MediaUpload";
import { MediaLibraryCard } from "./MediaLibraryCard";
import { useMediaLibrary, useAddMediaFile, useDeleteMediaFile } from "@/hooks/useMediaLibrary";

export function MediaLibrarySection() {
  const { files, isLoading } = useMediaLibrary();
  const addFile = useAddMediaFile();
  const deleteFile = useDeleteMediaFile();

  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleUpload(
    uploaded: { url: string; storagePath: string; fileName: string; mimeType: string }[]
  ) {
    const results = await Promise.allSettled(
      uploaded.map((f) =>
        addFile.mutateAsync({
          type: f.mimeType.startsWith("image/") ? "image" : "video",
          url: f.url,
          storagePath: f.storagePath,
          fileName: f.fileName,
          mimeType: f.mimeType,
          createdAt: Date.now(),
        })
      )
    );

    const ok = results.filter((r) => r.status === "fulfilled").length;
    const fail = results.length - ok;
    if (ok) toast.success(`${ok} file${ok > 1 ? "s" : ""} added to library`);
    if (fail) toast.error(`${fail} file(s) could not be saved`);
  }

  async function handleDelete(fileId: string) {
    const file = files.find((f) => f.id === fileId);
    if (!file) return;

    setDeletingId(fileId);
    try {
      await fetch("/api/media/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storagePath: file.storagePath }),
      });
      await deleteFile.mutateAsync(fileId);
      toast.success("File deleted");
    } catch {
      toast.error("Failed to delete file");
    } finally {
      setDeletingId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-36 w-full rounded-xl" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="aspect-video rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <MediaUpload onUpload={handleUpload} disabled={addFile.isPending} />

      {files.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-muted-foreground gap-3">
          <ImageOff className="w-10 h-10 opacity-25" />
          <p className="text-sm font-medium">No media uploaded yet</p>
          <p className="text-xs">Upload images or videos above to build your library</p>
        </div>
      ) : (
        <div>
          <p className="text-xs text-muted-foreground mb-3">
            {files.length} file{files.length !== 1 ? "s" : ""} in library
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {files.map((file) => (
              <MediaLibraryCard
                key={file.id}
                file={file}
                onDelete={() => handleDelete(file.id)}
                isDeleting={deletingId === file.id}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

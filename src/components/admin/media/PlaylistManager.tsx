"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { ListVideo, Loader2 } from "lucide-react";
import { MediaUpload } from "./MediaUpload";
import { MediaPreviewCard } from "./MediaPreviewCard";
import {
  usePlaylist,
  useAddPlaylistItem,
  useUpdatePlaylistItem,
  useDeletePlaylistItem,
  useReorderPlaylist,
} from "@/hooks/usePlaylist";
import { Skeleton } from "@/components/ui/skeleton";
import type { PlaylistItem } from "@/types";

export function PlaylistManager() {
  const { items, isLoading } = usePlaylist();
  const addItem = useAddPlaylistItem();
  const updateItem = useUpdatePlaylistItem();
  const deleteItem = useDeletePlaylistItem();
  const reorder = useReorderPlaylist();

  // Local reorder state while dragging
  const [localItems, setLocalItems] = useState<PlaylistItem[] | null>(null);
  const dragIndexRef = useRef<number | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const displayItems = localItems ?? items;

  async function handleUpload(
    files: { url: string; storagePath: string; fileName: string; mimeType: string }[]
  ) {
    const nextOrder = displayItems.length
      ? Math.max(...displayItems.map((i) => i.order)) + 1
      : 1;

    const results = await Promise.allSettled(
      files.map((f, idx) =>
        addItem.mutateAsync({
          type: f.mimeType.startsWith("image/") ? "image" : "video",
          url: f.url,
          storagePath: f.storagePath,
          fileName: f.fileName,
          mimeType: f.mimeType,
          order: nextOrder + idx,
          imageDuration: f.mimeType.startsWith("image/") ? 5 : undefined,
          playbackSpeed: f.mimeType.startsWith("video/") ? 1 : undefined,
          transition: "fade",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })
      )
    );

    const failed = results.filter((r) => r.status === "rejected").length;
    if (failed) toast.error(`${failed} file(s) could not be added`);
    else
      toast.success(
        `${files.length} file${files.length > 1 ? "s" : ""} added to playlist`
      );
  }

  async function handleDelete(item: PlaylistItem) {
    try {
      await fetch("/api/media/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storagePath: item.storagePath }),
      });
      await deleteItem.mutateAsync(item.id);
      toast.success("Removed from playlist");
    } catch {
      toast.error("Failed to remove item");
    }
  }

  async function handleUpdate(
    id: string,
    data: Partial<Omit<PlaylistItem, "id">>
  ) {
    try {
      await updateItem.mutateAsync({ id, data });
    } catch {
      toast.error("Failed to save settings");
    }
  }

  // ── Drag-and-drop ──────────────────────────────────────────────────────────
  function handleDragStart(index: number, id: string) {
    dragIndexRef.current = index;
    setDraggingId(id);
    setLocalItems(items);
  }

  function handleDragOver(e: React.DragEvent, toIndex: number) {
    e.preventDefault();
    const fromIndex = dragIndexRef.current;
    if (fromIndex === null || fromIndex === toIndex) return;
    const next = [...(localItems ?? items)];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    dragIndexRef.current = toIndex;
    setLocalItems(next);
  }

  async function handleDragEnd() {
    setDraggingId(null);
    dragIndexRef.current = null;
    if (!localItems) return;
    try {
      await reorder.mutateAsync(
        localItems.map((item, i) => ({ id: item.id, order: i + 1 }))
      );
    } catch {
      toast.error("Failed to save order");
    } finally {
      setLocalItems(null);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-36 w-full rounded-xl" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-video rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <MediaUpload onUpload={handleUpload} disabled={addItem.isPending} />

      {displayItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
          <ListVideo className="w-10 h-10 opacity-25" />
          <p className="text-sm font-medium">Playlist is empty</p>
          <p className="text-xs">Upload images or videos above to get started</p>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {displayItems.length} item{displayItems.length !== 1 ? "s" : ""}
              &nbsp;·&nbsp; drag to reorder
            </p>
            {reorder.isPending && (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayItems.map((item, index) => (
              <MediaPreviewCard
                key={item.id}
                item={item}
                index={index}
                isDragging={draggingId === item.id}
                onUpdate={(data) => handleUpdate(item.id, data)}
                onDelete={() => handleDelete(item)}
                onDragStart={() => handleDragStart(index, item.id)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

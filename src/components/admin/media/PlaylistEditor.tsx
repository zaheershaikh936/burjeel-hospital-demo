"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  GripVertical,
  X,
  Settings,
  ChevronUp,
  Save,
  ImageOff,
  ListVideo,
  Loader2,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useCreatePlaylist, useSavePlaylistItems } from "@/hooks/usePlaylists";
import type { MediaFile, Playlist, PlaylistItem, TransitionEffect } from "@/types";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface DraftItem extends MediaFile {
  transition: TransitionEffect;
  imageDuration?: number;
  playbackSpeed?: number;
}

const TRANSITIONS: { value: TransitionEffect; label: string }[] = [
  { value: "none", label: "None" },
  { value: "fade", label: "Fade" },
  { value: "slide", label: "Slide" },
];

const SPEEDS = [
  { value: "0.5", label: "0.5×" },
  { value: "1", label: "1× (Normal)" },
  { value: "1.25", label: "1.25×" },
  { value: "1.5", label: "1.5×" },
  { value: "2", label: "2×" },
];

export function playlistItemToDraft(item: PlaylistItem, files: MediaFile[]): DraftItem {
  const lib = files.find((f) => f.storagePath === item.storagePath);
  return {
    id: lib?.id ?? item.id,
    type: item.type,
    url: item.url,
    storagePath: item.storagePath,
    fileName: item.fileName,
    mimeType: item.mimeType,
    createdAt: item.createdAt,
    transition: item.transition ?? "fade",
    imageDuration: item.imageDuration,
    playbackSpeed: item.playbackSpeed,
  };
}

// ── Picker card ───────────────────────────────────────────────────────────────
export function PickerCard({
  file,
  order,
  onToggle,
}: {
  file: MediaFile;
  order: number | null;
  onToggle: () => void;
}) {
  const selected = order !== null;
  return (
    <button
      onClick={onToggle}
      className={cn(
        "relative aspect-video rounded-lg overflow-hidden border-2 transition-all duration-150 focus:outline-none w-full",
        selected
          ? "border-primary ring-1 ring-primary shadow-md"
          : "border-border hover:border-primary/50"
      )}
    >
      {file.type === "image" ? (
        <Image src={file.url} alt={file.fileName} fill className="object-cover" unoptimized />
      ) : (
        <video src={file.url} className="w-full h-full object-cover" preload="metadata" muted playsInline />
      )}
      <div className={cn("absolute inset-0 transition-colors", selected ? "bg-black/35" : "bg-black/10")} />
      {selected && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground shadow-lg">
            {order}
          </span>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 px-1 py-0.5 bg-linear-to-t from-black/70 to-transparent">
        <p className="text-[9px] text-white truncate leading-tight">{file.fileName}</p>
      </div>
    </button>
  );
}

// ── Draft row ─────────────────────────────────────────────────────────────────
export function DraftRow({
  item, index, isDragging, onUpdate, onRemove, onDragStart, onDragOver, onDragEnd,
}: {
  item: DraftItem; index: number; isDragging: boolean;
  onUpdate: (d: Partial<DraftItem>) => void; onRemove: () => void;
  onDragStart: () => void; onDragOver: (e: React.DragEvent) => void; onDragEnd: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div
      draggable onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd}
      className={cn(
        "bg-white border border-border rounded-xl overflow-hidden transition-all select-none",
        isDragging ? "shadow-2xl scale-[1.01] opacity-75" : "shadow-sm hover:shadow-md"
      )}
    >
      <div className="flex items-center gap-2.5 px-3 py-2">
        <div className="flex items-center gap-1 shrink-0">
          <GripVertical className="w-4 h-4 text-muted-foreground/40 cursor-grab active:cursor-grabbing" />
          <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
            {index + 1}
          </span>
        </div>
        <div className="relative w-14 h-8 rounded overflow-hidden bg-black shrink-0">
          {item.type === "image" ? (
            <Image src={item.url} alt={item.fileName} fill className="object-cover" unoptimized />
          ) : (
            <video src={item.url} className="w-full h-full object-cover" preload="metadata" muted playsInline />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate">{item.fileName}</p>
          <p className="text-[10px] text-muted-foreground">
            {item.type === "image"
              ? `${item.imageDuration ?? 5}s · ${item.transition}`
              : `${item.playbackSpeed ?? 1}× · ${item.transition}`}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setOpen((v) => !v)}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
          >
            {open
              ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
              : <Settings className="w-3.5 h-3.5 text-muted-foreground" />}
          </button>
          <button
            onClick={onRemove}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border px-4 pb-3 pt-2 grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Transition</Label>
            <Select value={item.transition} onValueChange={(v) => onUpdate({ transition: v as TransitionEffect })}>
              <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {TRANSITIONS.map((t) => (
                  <SelectItem key={t.value} value={t.value} className="text-xs">{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {item.type === "image" && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-[11px] text-muted-foreground">Duration</Label>
                <span className="text-[11px] font-mono">{item.imageDuration ?? 5}s</span>
              </div>
              <input
                type="range" min={1} max={60} step={1} value={item.imageDuration ?? 5}
                onChange={(e) => onUpdate({ imageDuration: Number(e.target.value) })}
                className="w-full accent-primary h-1.5 cursor-pointer"
              />
            </div>
          )}
          {item.type === "video" && (
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Speed</Label>
              <Select value={String(item.playbackSpeed ?? 1)} onValueChange={(v) => onUpdate({ playbackSpeed: Number(v) })}>
                <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SPEEDS.map((s) => (
                    <SelectItem key={s.value} value={s.value} className="text-xs">{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Playlist editor (reusable) ────────────────────────────────────────────────
interface PlaylistEditorProps {
  playlist?: Playlist | null;
  files: MediaFile[];
  onSaved?: () => void;
  onCancel?: () => void;
}

export function PlaylistEditor({ playlist, files, onSaved, onCancel }: PlaylistEditorProps) {
  const saveItems = useSavePlaylistItems();
  const createPlaylist = useCreatePlaylist();

  const [name, setName] = useState(playlist?.name ?? "");
  const [roomDisplayDuration, setRoomDisplayDuration] = useState(playlist?.roomDisplayDuration ?? 10);
  const [draft, setDraft] = useState<DraftItem[]>(() =>
    playlist ? playlist.items.map((i) => playlistItemToDraft(i, files)) : []
  );
  const dragIndexRef = useRef<number | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const draftPaths = new Set(draft.map((d) => d.storagePath));

  function toggleFile(file: MediaFile) {
    if (draftPaths.has(file.storagePath)) {
      setDraft(draft.filter((d) => d.storagePath !== file.storagePath));
    } else {
      setDraft([...draft, {
        ...file,
        transition: "fade",
        imageDuration: file.type === "image" ? 5 : undefined,
        playbackSpeed: file.type === "video" ? 1 : undefined,
      }]);
    }
  }

  function updateItem(storagePath: string, data: Partial<DraftItem>) {
    setDraft(draft.map((d) => (d.storagePath === storagePath ? { ...d, ...data } : d)));
  }

  function removeItem(storagePath: string) {
    setDraft(draft.filter((d) => d.storagePath !== storagePath));
  }

  function handleDragStart(index: number, id: string) {
    dragIndexRef.current = index;
    setDraggingId(id);
  }

  function handleDragOver(e: React.DragEvent, toIndex: number) {
    e.preventDefault();
    const from = dragIndexRef.current;
    if (from === null || from === toIndex) return;
    const next = [...draft];
    const [moved] = next.splice(from, 1);
    next.splice(toIndex, 0, moved);
    dragIndexRef.current = toIndex;
    setDraft(next);
  }

  function handleDragEnd() {
    setDraggingId(null);
    dragIndexRef.current = null;
  }

  async function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) { toast.error("Enter a playlist name"); return; }

    const items: Omit<PlaylistItem, "id">[] = draft.map((item, i) => {
      const base = {
        type: item.type,
        url: item.url,
        storagePath: item.storagePath,
        fileName: item.fileName,
        mimeType: item.mimeType,
        order: i + 1,
        transition: item.transition ?? "fade",
        createdAt: item.createdAt,
        updatedAt: Date.now(),
      };
      // Only include the field relevant to the media type — avoids undefined in Firebase
      if (item.type === "image") return { ...base, imageDuration: item.imageDuration ?? 5 };
      return { ...base, playbackSpeed: item.playbackSpeed ?? 1 };
    });

    try {
      if (playlist) {
        await saveItems.mutateAsync({ id: playlist.id, items });
        const { playlistsService } = await import("@/services/playlists.service");
        if (trimmed !== playlist.name) await playlistsService.rename(playlist.id, trimmed);
        if (roomDisplayDuration !== playlist.roomDisplayDuration) {
          await playlistsService.setDuration(playlist.id, roomDisplayDuration);
        }
        toast.success("Playlist updated");
      } else {
        const id = await createPlaylist.mutateAsync(trimmed);
        await saveItems.mutateAsync({ id, items });
        const { playlistsService } = await import("@/services/playlists.service");
        await playlistsService.setDuration(id, roomDisplayDuration);
        toast.success(`"${trimmed}" created`);
        setName("");
        setRoomDisplayDuration(10);
        setDraft([]);
      }
      onSaved?.();
    } catch (err) {
      console.error("Playlist save error:", err);
      toast.error("Failed to save playlist");
    }
  }

  const saving = saveItems.isPending || createPlaylist.isPending;

  return (
    <div className="space-y-5">
      {/* Name */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Playlist Name
        </Label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Morning Lobby"
          className="w-full h-9 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      {/* Room display duration */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Room Display Duration
          </Label>
          <span className="text-xs font-mono font-semibold tabular-nums">
            {roomDisplayDuration}s
          </span>
        </div>
        <input
          type="range"
          min={5}
          max={120}
          step={5}
          value={roomDisplayDuration}
          onChange={(e) => setRoomDisplayDuration(Number(e.target.value))}
          className="w-full accent-primary h-1.5 cursor-pointer"
        />
        <p className="text-[11px] text-muted-foreground">
          How long the room UI shows before the playlist starts (and between loops)
        </p>
      </div>

      {/* Media picker */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Select Media
          <span className="ml-1 font-normal normal-case tracking-normal text-muted-foreground/70">
            — click to add / deselect
          </span>
        </p>
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 border-2 border-dashed border-border rounded-xl text-muted-foreground">
            <ImageOff className="w-6 h-6 opacity-25" />
            <p className="text-xs">No media yet — upload files on the left</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {files.map((file) => {
              const idx = draft.findIndex((d) => d.storagePath === file.storagePath);
              return (
                <PickerCard
                  key={file.id}
                  file={file}
                  order={idx >= 0 ? idx + 1 : null}
                  onToggle={() => toggleFile(file)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Draft order */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Playlist Order
            {draft.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold normal-case tracking-normal">
                {draft.length}
              </span>
            )}
          </p>
          {draft.length > 0 && (
            <button
              onClick={() => setDraft([])}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>

        {draft.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-6 border-2 border-dashed border-border rounded-xl text-muted-foreground">
            <ListVideo className="w-5 h-5 opacity-25" />
            <p className="text-xs">Select media above</p>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-64 overflow-y-auto pr-0.5">
            {draft.map((item, index) => (
              <DraftRow
                key={item.storagePath}
                item={item}
                index={index}
                isDragging={draggingId === item.id}
                onUpdate={(d) => updateItem(item.storagePath, d)}
                onRemove={() => removeItem(item.storagePath)}
                onDragStart={() => handleDragStart(index, item.id)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
              />
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-border">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} disabled={saving} className="flex-1">
            Cancel
          </Button>
        )}
        <Button onClick={handleSave} disabled={saving} className="flex-1 gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {playlist ? "Update Playlist" : "Save Playlist"}
        </Button>
      </div>
    </div>
  );
}

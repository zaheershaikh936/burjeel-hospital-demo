"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Pencil,
  ListVideo,
  Loader2,
  X,
  ChevronDown,
  ChevronUp,
  DoorOpen,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { usePlaylists, useDeletePlaylist, useSetPlaylistRooms } from "@/hooks/usePlaylists";
import { useRooms } from "@/hooks/useRooms";
import { useMediaLibrary } from "@/hooks/useMediaLibrary";
import { PlaylistEditor } from "./PlaylistEditor";
import type { Playlist, Room } from "@/types";

// ── Room assignment panel ─────────────────────────────────────────────────────
function RoomAssignPanel({
  playlist,
  rooms,
}: {
  playlist: Playlist;
  rooms: Room[];
}) {
  const setRooms = useSetPlaylistRooms();
  const [selected, setSelected] = useState<Set<string>>(
    new Set(playlist.roomIds)
  );
  const [saving, setSaving] = useState(false);
  const allSelected = rooms.length > 0 && rooms.every((r) => selected.has(r.id));
  const isDirty =
    selected.size !== playlist.roomIds.length ||
    [...selected].some((id) => !playlist.roomIds.includes(id));

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(rooms.map((r) => r.id)));
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await setRooms.mutateAsync({ id: playlist.id, roomIds: [...selected] });
      toast.success("Room assignment saved");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (rooms.length === 0) {
    return (
      <p className="text-xs text-muted-foreground py-2">
        No rooms configured yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {/* Select All toggle */}
      <label className="flex items-center gap-2.5 cursor-pointer select-none group">
        <input
          type="checkbox"
          checked={allSelected}
          onChange={toggleAll}
          className="w-3.5 h-3.5 accent-primary cursor-pointer"
        />
        <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
          Select All Rooms
        </span>
      </label>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Room list */}
      <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-0.5">
        {rooms.map((room) => (
          <label
            key={room.id}
            className={cn(
              "relative flex flex-col items-center justify-center rounded-md border cursor-pointer select-none transition-all text-center p-1 gap-0.5 shrink-0",
              selected.has(room.id)
                ? "border-primary bg-primary/10 shadow-sm"
                : "border-border hover:border-primary/40 hover:bg-muted/40"
            )}
            style={{ width: "5rem", height: "5rem" }}
          >
            <input
              type="checkbox"
              checked={selected.has(room.id)}
              onChange={() => toggle(room.id)}
              className="sr-only"
            />
            {selected.has(room.id) && (
              <div className="absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-primary flex items-center justify-center">
                <svg viewBox="0 0 10 10" className="w-1.5 h-1.5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 5l2.5 2.5L8 3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
            <p className={cn(
              "text-[11px] font-bold leading-none",
              selected.has(room.id) ? "text-primary" : "text-foreground"
            )}>
              {room.roomNumber}
            </p>
            {room.roomName && room.roomName !== room.roomNumber && (
              <p className="text-[9px] text-muted-foreground leading-tight line-clamp-1 w-full">
                {room.roomName}
              </p>
            )}
          </label>
        ))}
      </div>

      {/* Save */}
      <div className="flex items-center justify-between pt-1">
        <p className="text-[11px] text-muted-foreground">
          {selected.size === 0
            ? "No rooms selected"
            : `${selected.size} room${selected.size !== 1 ? "s" : ""} selected`}
        </p>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={saving || !isDirty}
          className="h-7 gap-1.5 text-xs"
        >
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
          Save
        </Button>
      </div>
    </div>
  );
}

// ── Playlist row card ─────────────────────────────────────────────────────────
function PlaylistCard({
  playlist,
  rooms,
  onEdit,
  onDelete,
  deleting,
}: {
  playlist: Playlist;
  rooms: Room[];
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  const [roomsOpen, setRoomsOpen] = useState(false);

  const assignedRooms = rooms.filter((r) => playlist.roomIds.includes(r.id));

  return (
    <div
      className={cn(
        "rounded-xl border bg-white overflow-hidden transition-all",
        assignedRooms.length > 0 ? "border-primary/30 shadow-sm" : "border-border hover:shadow-sm"
      )}
    >
      {/* Main row */}
      <div className="flex items-center gap-4 px-4 py-3.5">
        {/* Status dot */}
        <div
          className={cn(
            "w-2.5 h-2.5 rounded-full shrink-0 transition-colors",
            assignedRooms.length > 0 ? "bg-primary" : "bg-muted-foreground/20"
          )}
        />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{playlist.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {playlist.items.length} item{playlist.items.length !== 1 ? "s" : ""}
            {assignedRooms.length > 0 ? (
              <span className="ml-1.5 text-primary font-medium">
                · {assignedRooms.map((r) => r.roomNumber).join(", ")}
              </span>
            ) : (
              <span className="ml-1 opacity-60">· not assigned to any room</span>
            )}
          </p>
        </div>

        {/* Thumbnails */}
        {playlist.items.length > 0 && (
          <div className="hidden sm:flex items-center gap-1 shrink-0">
            {playlist.items.slice(0, 4).map((item) => (
              <div key={item.id} className="relative w-10 h-6 rounded overflow-hidden bg-black">
                {item.type === "image" ? (
                  <Image src={item.url} alt={item.fileName} fill className="object-cover" unoptimized />
                ) : (
                  <video src={item.url} className="w-full h-full object-cover" preload="metadata" muted playsInline />
                )}
              </div>
            ))}
            {playlist.items.length > 4 && (
              <span className="text-xs text-muted-foreground">+{playlist.items.length - 4}</span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setRoomsOpen((v) => !v)}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors border",
              roomsOpen
                ? "border-primary/40 bg-primary/5 text-primary"
                : "border-border hover:bg-muted"
            )}
          >
            <DoorOpen className="w-3 h-3" />
            Rooms
            {roomsOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <button
            onClick={onEdit}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-muted transition-colors border border-border"
          >
            <Pencil className="w-3 h-3" /> Edit
          </button>

          <button
            onClick={onDelete}
            disabled={deleting}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 hover:text-red-500 border border-border transition-colors"
          >
            {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Room assignment panel */}
      {roomsOpen && (
        <div className="border-t border-border px-4 py-3 bg-muted/20">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Assign to Rooms — playlist plays when the room is vacant
          </p>
          <RoomAssignPanel playlist={playlist} rooms={rooms} />
        </div>
      )}
    </div>
  );
}

// ── Main section ──────────────────────────────────────────────────────────────
export function PlaylistSection() {
  const { playlists, isLoading: playlistsLoading } = usePlaylists();
  const { files } = useMediaLibrary();
  const { rooms, isLoading: roomsLoading } = useRooms();
  const deletePlaylist = useDeletePlaylist();

  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(pl: Playlist) {
    setDeletingId(pl.id);
    try {
      await deletePlaylist.mutateAsync(pl.id);
      toast.success(`"${pl.name}" deleted`);
      if (editing === pl.id) setEditing(null);
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeletingId(null);
    }
  }

  if (playlistsLoading || roomsLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  const editingPlaylist =
    editing && editing !== "new"
      ? (playlists.find((p) => p.id === editing) ?? null)
      : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {playlists.length > 0
            ? `${playlists.length} playlist${playlists.length !== 1 ? "s" : ""} · click "Rooms" on a playlist to assign it to rooms`
            : "No playlists yet"}
        </p>
        {editing === null ? (
          <Button onClick={() => setEditing("new")} variant="outline" size="sm" className="gap-1.5">
            <Plus className="w-3.5 h-3.5" /> New Playlist
          </Button>
        ) : (
          <button
            onClick={() => setEditing(null)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Close editor
          </button>
        )}
      </div>

      {/* Inline editor */}
      {editing !== null && (
        <div className="border border-border rounded-2xl overflow-hidden bg-white shadow-sm">
          <div className="px-5 py-3.5 border-b border-border bg-muted/30">
            <p className="text-sm font-semibold">
              {editing === "new" ? "New Playlist" : `Edit — ${editingPlaylist?.name ?? ""}`}
            </p>
          </div>
          <div className="p-5">
            <PlaylistEditor
              playlist={editingPlaylist}
              files={files}
              onSaved={() => setEditing(null)}
              onCancel={() => setEditing(null)}
            />
          </div>
        </div>
      )}

      {/* Playlist list */}
      {playlists.length === 0 && editing === null ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground border-2 border-dashed border-border rounded-xl">
          <ListVideo className="w-10 h-10 opacity-20" />
          <p className="text-sm font-medium">No playlists yet</p>
          <p className="text-xs">Create your first playlist to show media on room displays</p>
          <Button onClick={() => setEditing("new")} size="sm" className="mt-1 gap-1.5">
            <Plus className="w-3.5 h-3.5" /> New Playlist
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {playlists.map((pl) => (
            <PlaylistCard
              key={pl.id}
              playlist={pl}
              rooms={rooms}
              onEdit={() => setEditing(pl.id)}
              onDelete={() => handleDelete(pl)}
              deleting={deletingId === pl.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

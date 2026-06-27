"use client";

import { useState } from "react";
import Image from "next/image";
import { GripVertical, Trash2, Settings, ChevronDown, ChevronUp } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { PlaylistItem, TransitionEffect } from "@/types";

interface MediaPreviewCardProps {
  item: PlaylistItem;
  index: number;
  isDragging: boolean;
  onUpdate: (data: Partial<Omit<PlaylistItem, "id">>) => void;
  onDelete: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

const TRANSITIONS: { value: TransitionEffect; label: string }[] = [
  { value: "none", label: "None" },
  { value: "fade", label: "Fade" },
  { value: "slide", label: "Slide" },
];

const SPEEDS = [
  { value: "0.5", label: "0.5×" },
  { value: "1", label: "1× — Normal" },
  { value: "1.25", label: "1.25×" },
  { value: "1.5", label: "1.5×" },
  { value: "2", label: "2×" },
];

export function MediaPreviewCard({
  item,
  index,
  isDragging,
  onUpdate,
  onDelete,
  onDragStart,
  onDragOver,
  onDragEnd,
}: MediaPreviewCardProps) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      className={cn(
        "bg-white border border-border rounded-xl overflow-hidden transition-all duration-150 select-none",
        isDragging ? "shadow-2xl rotate-1 scale-[1.03] opacity-80 z-50" : "shadow-sm hover:shadow-md"
      )}
    >
      {/* Preview area */}
      <div className="relative bg-black" style={{ aspectRatio: "16/9" }}>
        {item.type === "image" ? (
          <Image
            src={item.url}
            alt={item.fileName}
            fill
            className="object-contain"
            unoptimized
          />
        ) : (
          <video
            src={item.url}
            className="w-full h-full object-contain"
            preload="metadata"
            muted
            playsInline
          />
        )}

        {/* Order badge */}
        <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center">
          <span className="text-white text-[10px] font-bold">{index + 1}</span>
        </div>

        {/* Type badge */}
        <div
          className={cn(
            "absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase",
            item.type === "image"
              ? "bg-blue-500/90 text-white"
              : "bg-purple-600/90 text-white"
          )}
        >
          {item.type === "image" ? "IMG" : "VID"}
        </div>

        {/* Drag handle */}
        <div className="absolute bottom-2 left-2 p-0.5 rounded bg-black/50 cursor-grab active:cursor-grabbing">
          <GripVertical className="w-3.5 h-3.5 text-white" />
        </div>
      </div>

      {/* Footer row */}
      <div className="flex items-center gap-1.5 px-2.5 py-2">
        <p className="text-xs font-medium truncate flex-1 text-foreground">{item.fileName}</p>
        <button
          onClick={() => setShowSettings((v) => !v)}
          className="w-6 h-6 rounded flex items-center justify-center hover:bg-muted transition-colors shrink-0"
          title="Settings"
        >
          {showSettings ? (
            <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
          ) : (
            <Settings className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </button>
        <button
          onClick={onDelete}
          className="w-6 h-6 rounded flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors shrink-0"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Collapsible settings */}
      {showSettings && (
        <div className="border-t border-border px-3 pb-3 pt-2.5 space-y-3">
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Transition</Label>
            <Select
              value={item.transition ?? "fade"}
              onValueChange={(v) => onUpdate({ transition: v as TransitionEffect })}
            >
              <SelectTrigger className="h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRANSITIONS.map((t) => (
                  <SelectItem key={t.value} value={t.value} className="text-xs">
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {item.type === "image" && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-[11px] text-muted-foreground">Display Duration</Label>
                <span className="text-[11px] font-mono tabular-nums text-foreground">
                  {item.imageDuration ?? 5}s
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={60}
                step={1}
                value={item.imageDuration ?? 5}
                onChange={(e) => onUpdate({ imageDuration: Number(e.target.value) })}
                className="w-full accent-primary h-1.5 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>1s</span>
                <span>60s</span>
              </div>
            </div>
          )}

          {item.type === "video" && (
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Playback Speed</Label>
              <Select
                value={String(item.playbackSpeed ?? 1)}
                onValueChange={(v) => onUpdate({ playbackSpeed: Number(v) })}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SPEEDS.map((s) => (
                    <SelectItem key={s.value} value={s.value} className="text-xs">
                      {s.label}
                    </SelectItem>
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

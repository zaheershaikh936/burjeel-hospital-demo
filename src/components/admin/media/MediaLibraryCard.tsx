"use client";

import Image from "next/image";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MediaFile } from "@/types";

interface MediaLibraryCardProps {
  file: MediaFile;
  onDelete: () => void;
  isDeleting?: boolean;
}

export function MediaLibraryCard({ file, onDelete, isDeleting }: MediaLibraryCardProps) {
  return (
    <div className="group relative bg-white border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-150">
      {/* 16:9 preview */}
      <div className="relative bg-black" style={{ aspectRatio: "16/9" }}>
        {file.type === "image" ? (
          <Image src={file.url} alt={file.fileName} fill className="object-contain" unoptimized />
        ) : (
          <video src={file.url} className="w-full h-full object-contain" preload="metadata" muted playsInline />
        )}

        {/* Type badge */}
        <div
          className={cn(
            "absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase",
            file.type === "image" ? "bg-blue-500/90 text-white" : "bg-purple-600/90 text-white"
          )}
        >
          {file.type === "image" ? "IMG" : "VID"}
        </div>

        {/* Delete on hover */}
        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/50 hover:bg-red-600/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-150 text-white"
          title="Delete from library"
        >
          {isDeleting ? (
            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Trash2 className="w-3 h-3" />
          )}
        </button>
      </div>

      {/* Filename */}
      <div className="px-2.5 py-2">
        <p className="text-xs font-medium truncate text-foreground" title={file.fileName}>
          {file.fileName}
        </p>
      </div>
    </div>
  );
}

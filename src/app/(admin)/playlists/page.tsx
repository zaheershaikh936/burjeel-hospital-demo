"use client";

import { ListVideo } from "lucide-react";
import { PlaylistSection } from "@/components/admin/media/PlaylistSection";

export default function PlaylistsPage() {
  return (
    <div className="w-full space-y-4">
      <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <ListVideo className="w-4 h-4 text-muted-foreground" />
            Playlists
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Create, edit, or delete playlists · activate one to show it on room displays
          </p>
        </div>
        <div className="p-5">
          <PlaylistSection />
        </div>
      </div>
    </div>
  );
}

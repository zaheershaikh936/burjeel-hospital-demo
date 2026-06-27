"use client";

import { Images, ListVideo } from "lucide-react";
import { MediaLibrarySection } from "@/components/admin/media/MediaLibrarySection";
import { PlaylistEditor } from "@/components/admin/media/PlaylistEditor";
import { useMediaLibrary } from "@/hooks/useMediaLibrary";

export default function MediaPage() {
  const { files } = useMediaLibrary();

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* Left — Upload & library */}
        <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Images className="w-4 h-4 text-muted-foreground" />
              Media Library
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              JPG, PNG, WebP, MP4 · hover a file to delete it
            </p>
          </div>
          <div className="p-5">
            <MediaLibrarySection />
          </div>
        </div>

        {/* Right — Create playlist */}
        <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <ListVideo className="w-4 h-4 text-muted-foreground" />
              Create Playlist
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Name your playlist, select media, arrange the order, then save
            </p>
          </div>
          <div className="p-5">
            <PlaylistEditor files={files} />
          </div>
        </div>

      </div>
    </div>
  );
}

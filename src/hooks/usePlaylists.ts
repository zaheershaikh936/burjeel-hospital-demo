"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { playlistsService } from "@/services/playlists.service";
import type { Playlist, PlaylistItem } from "@/types";

export function usePlaylists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsub = playlistsService.subscribe((data) => {
      setPlaylists(data);
      setIsLoading(false);
    });
    return unsub;
  }, []);

  return { playlists, isLoading };
}

export function useRoomPlaylist(roomId: string) {
  const { playlists, isLoading } = usePlaylists();
  const playlist = playlists.find((p) => p.roomIds.includes(roomId));
  return { playlist, items: playlist?.items ?? [], isLoading };
}

export function useCreatePlaylist() {
  return useMutation({
    mutationFn: (name: string) => playlistsService.create(name),
  });
}

export function useRenamePlaylist() {
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      playlistsService.rename(id, name),
  });
}

export function useDeletePlaylist() {
  return useMutation({
    mutationFn: (id: string) => playlistsService.delete(id),
  });
}

export function useSavePlaylistItems() {
  return useMutation({
    mutationFn: ({ id, items }: { id: string; items: Omit<PlaylistItem, "id">[] }) =>
      playlistsService.setItems(id, items),
  });
}

export function useSetPlaylistRooms() {
  return useMutation({
    mutationFn: ({ id, roomIds }: { id: string; roomIds: string[] }) =>
      playlistsService.setRooms(id, roomIds),
  });
}

export function useSetPlaylistDuration() {
  return useMutation({
    mutationFn: ({ id, seconds }: { id: string; seconds: number }) =>
      playlistsService.setDuration(id, seconds),
  });
}

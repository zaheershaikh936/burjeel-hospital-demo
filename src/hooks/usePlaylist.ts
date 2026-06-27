"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { playlistService } from "@/services/playlist.service";
import { QUERY_KEYS } from "@/constants";
import type { PlaylistItem } from "@/types";

export function usePlaylist() {
  const [items, setItems] = useState<PlaylistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = playlistService.subscribe((data) => {
      setItems(data);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  return { items, isLoading };
}

export function useAddPlaylistItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (item: Omit<PlaylistItem, "id">) => playlistService.add(item),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PLAYLIST }),
  });
}

export function useUpdatePlaylistItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<PlaylistItem, "id">> }) =>
      playlistService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PLAYLIST }),
  });
}

export function useDeletePlaylistItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => playlistService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PLAYLIST }),
  });
}

export function useReorderPlaylist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (items: { id: string; order: number }[]) => playlistService.reorder(items),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PLAYLIST }),
  });
}

export function useReplacePlaylist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (items: Omit<PlaylistItem, "id">[]) => playlistService.replace(items),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PLAYLIST }),
  });
}

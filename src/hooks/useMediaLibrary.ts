"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mediaLibraryService } from "@/services/mediaLibrary.service";
import { QUERY_KEYS } from "@/constants";
import type { MediaFile } from "@/types";

export function useMediaLibrary() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = mediaLibraryService.subscribe((data) => {
      setFiles(data);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  return { files, isLoading };
}

export function useAddMediaFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: Omit<MediaFile, "id">) => mediaLibraryService.add(file),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.MEDIA_LIBRARY }),
  });
}

export function useDeleteMediaFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mediaLibraryService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.MEDIA_LIBRARY }),
  });
}

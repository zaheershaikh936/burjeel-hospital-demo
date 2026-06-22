"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { brandingService, DEFAULT_BRANDING } from "@/services/branding.service";
import { QUERY_KEYS } from "@/constants";
import type { Branding } from "@/types";

export function useBranding() {
  const [branding, setBranding] = useState<Branding>(DEFAULT_BRANDING);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = brandingService.subscribe(
      (data) => {
        setBranding(data);
        setIsLoading(false);
      },
      () => {
        // On Firestore error, fall back to defaults so the page renders
        setIsLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  return { branding, isLoading };
}

export function useUpdateBranding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Branding>) => brandingService.update(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BRANDING }),
  });
}

export function useUploadLogo() {
  return useMutation({
    mutationFn: (file: File) => brandingService.uploadLogo(file),
  });
}

"use client";

import { useEffect, useState } from "react";
import { auditService } from "@/services/audit.service";
import type { AuditLog } from "@/types";

export function useAuditLogs(limitCount = 100) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auditService.subscribe(
      (data) => {
        setLogs(data);
        setIsLoading(false);
      },
      limitCount,
      () => {
        // On Firestore error, stop loading so the empty state renders
        setIsLoading(false);
      }
    );
    return unsubscribe;
  }, [limitCount]);

  return { logs, isLoading };
}

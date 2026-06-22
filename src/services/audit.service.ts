import { ref, push, get, onValue, query, orderByChild, limitToLast, type Unsubscribe } from "firebase/database";
import { database } from "@/lib/firebase/config";
import { COLLECTIONS } from "@/constants";
import type { AuditLog, RoomStatus, PatientGender, AuditSource } from "@/types";

interface CreateAuditParams {
  roomId: string;
  roomNumber?: string;
  roomName?: string;
  previousStatus: RoomStatus | null;
  newStatus: RoomStatus | null;
  previousGender: PatientGender;
  newGender: PatientGender;
  source: AuditSource;
}

export const auditService = {
  async create(params: CreateAuditParams): Promise<void> {
    await push(ref(database, COLLECTIONS.AUDIT_LOGS), {
      ...params,
      timestamp: Date.now(),
    });
  },

  async getAll(limitCount = 100): Promise<AuditLog[]> {
    const q = query(
      ref(database, COLLECTIONS.AUDIT_LOGS),
      orderByChild("timestamp"),
      limitToLast(limitCount)
    );
    const snap = await get(q);
    if (!snap.exists()) return [];
    const logs: AuditLog[] = [];
    snap.forEach((child) => {
      if (child.key) logs.push({ id: child.key, ...child.val() } as AuditLog);
    });
    return logs.reverse();
  },

  subscribe(
    callback: (logs: AuditLog[]) => void,
    limitCount = 100,
    onError?: (err: Error) => void
  ): Unsubscribe {
    const q = query(
      ref(database, COLLECTIONS.AUDIT_LOGS),
      orderByChild("timestamp"),
      limitToLast(limitCount)
    );
    return onValue(
      q,
      (snap) => {
        if (!snap.exists()) {
          callback([]);
          return;
        }
        const logs: AuditLog[] = [];
        snap.forEach((child) => {
          if (child.key) logs.push({ id: child.key, ...child.val() } as AuditLog);
        });
        callback(logs.reverse());
      },
      (err) => {
        console.error("[auditService] subscribe error:", err.message);
        onError?.(err);
        callback([]);
      }
    );
  },
};

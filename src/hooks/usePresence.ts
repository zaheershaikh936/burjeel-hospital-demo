import { useEffect, useState } from "react";
import { presenceService, type PresenceData } from "@/services/presence.service";

export function useRegisterPresence(roomId: string) {
  useEffect(() => {
    let cleanup: (() => Promise<void>) | undefined;
    presenceService.register(roomId).then((fn) => { cleanup = fn; });
    return () => { cleanup?.(); };
  }, [roomId]);
}

export function useAllPresence() {
  const [presence, setPresence] = useState<Record<string, PresenceData>>({});
  useEffect(() => presenceService.subscribeAll(setPresence), []);
  return presence;
}

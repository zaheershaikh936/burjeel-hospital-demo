import {
  ref,
  push,
  set,
  remove,
  update,
  onValue,
  get,
  type Unsubscribe,
} from "firebase/database";
import { database } from "@/lib/firebase/config";
import { COLLECTIONS } from "@/constants";
import type { Playlist, PlaylistItem } from "@/types";

const ROOT = COLLECTIONS.PLAYLISTS;

function rootRef() {
  return ref(database, ROOT);
}
function playlistRef(id: string) {
  return ref(database, `${ROOT}/${id}`);
}
function itemsRef(id: string) {
  return ref(database, `${ROOT}/${id}/items`);
}

function parsePlaylist(key: string, val: Record<string, unknown>): Playlist {
  const items: PlaylistItem[] = [];
  const rawItems = val.items as Record<string, unknown> | undefined;
  if (rawItems) {
    Object.entries(rawItems).forEach(([k, v]) => {
      items.push({ id: k, ...(v as Omit<PlaylistItem, "id">) });
    });
    items.sort((a, b) => a.order - b.order);
  }
  const rawRoomIds = val.roomIds as Record<string, boolean> | undefined;
  const roomIds = rawRoomIds
    ? Object.entries(rawRoomIds).filter(([, v]) => v).map(([k]) => k)
    : [];
  return {
    id: key,
    name: val.name as string,
    roomIds,
    roomDisplayDuration: (val.roomDisplayDuration as number) ?? 10,
    createdAt: val.createdAt as number,
    updatedAt: val.updatedAt as number,
    items,
  };
}

export const playlistsService = {
  async create(name: string): Promise<string> {
    const newRef = push(rootRef());
    await set(newRef, {
      name,
      roomDisplayDuration: 10,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return newRef.key!;
  },

  async rename(id: string, name: string): Promise<void> {
    await update(playlistRef(id), { name, updatedAt: Date.now() });
  },

  async delete(id: string): Promise<void> {
    await remove(playlistRef(id));
  },

  async setItems(id: string, items: Omit<PlaylistItem, "id">[]): Promise<void> {
    // Strip undefined — Firebase RTDB rejects undefined values
    const clean = (obj: object) =>
      Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

    const data =
      items.length === 0
        ? null
        : Object.fromEntries(
            items.map((item) => [push(itemsRef(id)).key!, clean(item)])
          );
    await set(itemsRef(id), data);
    await update(playlistRef(id), { updatedAt: Date.now() });
  },

  async setDuration(id: string, seconds: number): Promise<void> {
    await update(playlistRef(id), { roomDisplayDuration: seconds, updatedAt: Date.now() });
  },

  async setRooms(id: string, roomIds: string[]): Promise<void> {
    const data =
      roomIds.length > 0
        ? Object.fromEntries(roomIds.map((rid) => [rid, true]))
        : null;
    await update(playlistRef(id), { roomIds: data, updatedAt: Date.now() });
  },

  subscribe(callback: (playlists: Playlist[]) => void): Unsubscribe {
    return onValue(rootRef(), (snap) => {
      if (!snap.exists()) {
        callback([]);
        return;
      }
      const list: Playlist[] = [];
      snap.forEach((child) => {
        list.push(parsePlaylist(child.key!, child.val()));
      });
      list.sort((a, b) => b.createdAt - a.createdAt);
      callback(list);
    });
  },
};

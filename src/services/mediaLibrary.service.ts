import {
  ref,
  push,
  set,
  remove,
  onValue,
  type Unsubscribe,
} from "firebase/database";
import { database } from "@/lib/firebase/config";
import { COLLECTIONS } from "@/constants";
import type { MediaFile } from "@/types";

function libraryRef() {
  return ref(database, COLLECTIONS.MEDIA_LIBRARY);
}

function fileRef(id: string) {
  return ref(database, `${COLLECTIONS.MEDIA_LIBRARY}/${id}`);
}

export const mediaLibraryService = {
  async add(file: Omit<MediaFile, "id">): Promise<string> {
    const newRef = push(libraryRef());
    await set(newRef, file);
    return newRef.key!;
  },

  async delete(id: string): Promise<void> {
    await remove(fileRef(id));
  },

  subscribe(callback: (files: MediaFile[]) => void): Unsubscribe {
    return onValue(libraryRef(), (snap) => {
      if (!snap.exists()) {
        callback([]);
        return;
      }
      const files: MediaFile[] = [];
      snap.forEach((child) => {
        files.push({ id: child.key!, ...child.val() } as MediaFile);
      });
      // Newest first
      callback(files.sort((a, b) => b.createdAt - a.createdAt));
    });
  },
};

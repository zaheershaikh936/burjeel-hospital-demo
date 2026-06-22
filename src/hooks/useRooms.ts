"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { roomService } from "@/services/room.service";
import { auditService } from "@/services/audit.service";
import { QUERY_KEYS } from "@/constants";
import type { Room, RoomFormData, RoomStatus, PatientGender } from "@/types";

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = roomService.subscribe(
      (data) => {
        setRooms(data);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setIsLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  return { rooms, isLoading, error };
}

export function useRoom(id: string) {
  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    const unsubscribe = roomService.subscribeToRoom(
      id,
      (data) => {
        setRoom(data);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setIsLoading(false);
      }
    );
    return unsubscribe;
  }, [id]);

  return { room, isLoading, error };
}

export function useRoomById(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.ROOM(id),
    queryFn: () => roomService.getById(id),
    enabled: !!id,
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RoomFormData) => roomService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ROOMS }),
  });
}

export function useUpdateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RoomFormData> }) =>
      roomService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ROOMS }),
  });
}

export function useUpdateRoomStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      room,
      status,
      gender,
      source,
    }: {
      room: Room;
      status: RoomStatus;
      gender: PatientGender;
      source: "admin" | "tablet";
    }) => {
      await roomService.updateStatus(room.id, status, gender);
      await auditService.create({
        roomId: room.id,
        roomNumber: room.roomNumber,
        roomName: room.roomName,
        previousStatus: room.status,
        newStatus: status,
        previousGender: room.gender,
        newGender: status === "vacant" ? null : gender,
        source,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ROOMS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUDIT_LOGS });
    },
  });
}

export function useDeleteRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => roomService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ROOMS }),
  });
}

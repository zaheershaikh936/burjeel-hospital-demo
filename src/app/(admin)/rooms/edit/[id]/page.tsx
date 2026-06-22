"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RoomForm } from "@/components/admin/RoomForm";
import { useRoom, useUpdateRoom } from "@/hooks/useRooms";
import { auditService } from "@/services/audit.service";
import type { RoomFormData } from "@/types";

export default function EditRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { room, isLoading } = useRoom(id);
  const updateRoom = useUpdateRoom();

  async function handleSubmit(data: RoomFormData) {
    if (!room) return;
    try {
      await updateRoom.mutateAsync({ id, data });
      await auditService.create({
        roomId: id,
        roomNumber: data.roomNumber,
        roomName: data.roomName,
        previousStatus: room.status,
        newStatus: data.status,
        previousGender: room.gender,
        newGender: data.gender,
        source: "admin",
      });
      toast.success("Room updated successfully");
      router.push("/rooms");
    } catch {
      toast.error("Failed to update room");
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/rooms">
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-lg font-semibold">Edit Room</h2>
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Loading..." : `Room ${room?.roomNumber} — ${room?.roomName}`}
          </p>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Room Details</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : !room ? (
            <p className="text-sm text-muted-foreground text-center py-8">Room not found.</p>
          ) : (
            <RoomForm
              defaultValues={room}
              onSubmit={handleSubmit}
              isSubmitting={updateRoom.isPending}
              submitLabel="Save Changes"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

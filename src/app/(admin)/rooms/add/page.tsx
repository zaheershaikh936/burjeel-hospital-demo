"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RoomForm } from "@/components/admin/RoomForm";
import { useCreateRoom } from "@/hooks/useRooms";
import { auditService } from "@/services/audit.service";
import type { RoomFormData } from "@/types";

export default function AddRoomPage() {
  const router = useRouter();
  const createRoom = useCreateRoom();

  async function handleSubmit(data: RoomFormData) {
    try {
      const id = await createRoom.mutateAsync(data);
      await auditService.create({
        roomId: id,
        roomNumber: data.roomNumber,
        roomName: data.roomName,
        previousStatus: null,
        newStatus: data.status,
        previousGender: null,
        newGender: data.gender,
        source: "admin",
      });
      toast.success("Room created successfully");
      router.push("/rooms");
    } catch {
      toast.error("Failed to create room");
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
          <h2 className="text-lg font-semibold">Add New Room</h2>
          <p className="text-sm text-muted-foreground">Fill in the room details below</p>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Room Details</CardTitle>
        </CardHeader>
        <CardContent>
          <RoomForm
            onSubmit={handleSubmit}
            isSubmitting={createRoom.isPending}
            submitLabel="Create Room"
          />
        </CardContent>
      </Card>
    </div>
  );
}

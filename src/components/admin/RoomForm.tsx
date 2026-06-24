"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEPARTMENTS } from "@/constants";
import { useAuth } from "@/context/AuthContext";
import type { Room, RoomFormData } from "@/types";

const roomSchema = z.object({
  roomNumber: z.string().min(1, "Room number is required"),
  roomName: z.string().min(1, "Room name is required"),
  department: z.string().optional(),
  status: z.enum(["occupied", "vacant"]),
  gender: z.enum(["male", "female"]).nullable(),
  roomType: z.enum(["output_screen_1", "output_screen_2"]).optional(),
});

interface RoomFormProps {
  defaultValues?: Partial<Room>;
  onSubmit: (data: RoomFormData) => Promise<void>;
  isSubmitting: boolean;
  submitLabel?: string;
}

export function RoomForm({ defaultValues, onSubmit, isSubmitting, submitLabel = "Save" }: RoomFormProps) {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "super_admin";
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      roomNumber: defaultValues?.roomNumber ?? "",
      roomName: defaultValues?.roomName ?? "",
      department: defaultValues?.department ?? "",
      status: defaultValues?.status ?? "vacant",
      gender: defaultValues?.gender ?? null,
      roomType: defaultValues?.roomType ?? undefined,
    },
  });

  const status = watch("status");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="roomNumber">Room Number *</Label>
          <Input id="roomNumber" placeholder="e.g. 501" {...register("roomNumber")} />
          {errors.roomNumber && (
            <p className="text-xs text-destructive">{errors.roomNumber.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="roomName">Room Name *</Label>
          <Input id="roomName" placeholder="e.g. Suite A" {...register("roomName")} />
          {errors.roomName && (
            <p className="text-xs text-destructive">{errors.roomName.message}</p>
          )}
        </div>
      </div>

      {isSuperAdmin && (
        <div className="space-y-1.5">
          <Label>Department *</Label>
          <Select
            defaultValue={defaultValues?.department}
            onValueChange={(v) => { if (v) setValue("department", v); }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {DEPARTMENTS.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.department && (
            <p className="text-xs text-destructive">{errors.department.message}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Output screen</Label>
          <Select
            defaultValue={defaultValues?.roomType}
            onValueChange={(v) => setValue("roomType", v as "output_screen_1" | "output_screen_2")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select output screen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="output_screen_1">Output screen 1</SelectItem>
              <SelectItem value="output_screen_2">Output screen 2</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Status *</Label>
          <Select
            defaultValue={defaultValues?.status ?? "vacant"}
            onValueChange={(v) => {
              setValue("status", v as "occupied" | "vacant");
              if (v === "vacant") setValue("gender", null);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vacant">Vacant</SelectItem>
              <SelectItem value="occupied">Occupied</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {status === "occupied" && (
        <div className="space-y-1.5">
          <Label>Patient Gender</Label>
          <Select
            defaultValue={defaultValues?.gender ?? undefined}
            onValueChange={(v) => setValue("gender", v as "male" | "female")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting} className="min-w-24">
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
}

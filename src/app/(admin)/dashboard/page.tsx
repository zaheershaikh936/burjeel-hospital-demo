"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BedDouble,
  BedSingle,
  Users,
  UserCheck,
  UserX,
  Plus,
  ArrowRight,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { GenderBadge } from "@/components/shared/GenderBadge";
import { useRooms } from "@/hooks/useRooms";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import { formatTimestamp } from "@/utils";
import type { DashboardStats } from "@/types";

const CARD_VARIANTS = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.3 } }),
};

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  index,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  index: number;
}) {
  return (
    <motion.div custom={index} variants={CARD_VARIANTS} initial="hidden" animate="visible">
      <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">{title}</p>
              <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { rooms, isLoading } = useRooms();
  const { logs, isLoading: logsLoading } = useAuditLogs(10);

  const stats: DashboardStats = useMemo(() => {
    return {
      total: rooms.length,
      occupied: rooms.filter((r) => r.status === "occupied").length,
      vacant: rooms.filter((r) => r.status === "vacant").length,
      male: rooms.filter((r) => r.gender === "male").length,
      female: rooms.filter((r) => r.gender === "female").length,
    };
  }, [rooms]);

  const STAT_CARDS = [
    { title: "Total Rooms", value: stats.total, icon: BedDouble, color: "bg-slate-500" },
    { title: "Occupied", value: stats.occupied, icon: UserCheck, color: "bg-red-500" },
    { title: "Vacant", value: stats.vacant, icon: UserX, color: "bg-green-500" },
    { title: "Male Patients", value: stats.male, icon: Users, color: "bg-blue-500" },
    { title: "Female Patients", value: stats.female, icon: BedSingle, color: "bg-pink-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <Skeleton className="h-4 w-24 mb-3" />
                  <Skeleton className="h-8 w-12" />
                </CardContent>
              </Card>
            ))
          : STAT_CARDS.map((card, i) => <StatCard key={card.title} {...card} index={i} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Rooms */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Activity className="w-4 h-4 text-muted-foreground" />
                Recent Rooms
              </CardTitle>
              <Link href="/rooms">
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                  View all <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="pt-0">
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                  ))}
                </div>
              ) : rooms.length === 0 ? (
                <div className="text-center py-10">
                  <BedDouble className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No rooms yet</p>
                  <Link href="/rooms/add">
                    <Button size="sm" className="mt-3">
                      <Plus className="w-4 h-4 mr-1" /> Add Room
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {rooms.slice(0, 6).map((room) => (
                    <div
                      key={room.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center">
                          <span className="text-xs font-bold text-foreground">{room.roomNumber}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{room.roomName}</p>
                          <p className="text-xs text-muted-foreground">{room.department}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={room.status} />
                        <GenderBadge gender={room.gender} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions + Recent Logs */}
        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <Link href="/rooms/add" className="block">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Plus className="w-4 h-4" /> Add New Room
                </Button>
              </Link>
              <Link href="/branding" className="block">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Activity className="w-4 h-4" /> Update Branding
                </Button>
              </Link>
              <Link href="/audit" className="block">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <BedDouble className="w-4 h-4" /> View Audit Logs
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
              <Link href="/audit">
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                  All <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="pt-0">
              {logsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full rounded-lg" />
                  ))}
                </div>
              ) : logs.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No activity yet</p>
              ) : (
                <div className="space-y-2">
                  {logs.slice(0, 5).map((log) => (
                    <div key={log.id} className="p-2 rounded-lg bg-muted/40">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-foreground truncate">
                          Room {log.roomNumber ?? log.roomId}
                        </span>
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {log.source}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <StatusBadge status={log.newStatus ?? "vacant"} className="text-[10px] py-0" />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {formatTimestamp(log.timestamp)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

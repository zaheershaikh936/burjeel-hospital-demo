"use client";

import { useState } from "react";
import { Search, ClipboardList, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { GenderBadge } from "@/components/shared/GenderBadge";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import { formatTimestamp } from "@/utils";

export default function AuditPage() {
  const { logs, isLoading } = useAuditLogs(200);
  const [search, setSearch] = useState("");

  const filtered = logs.filter((log) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      log.roomNumber?.toLowerCase().includes(q) ||
      log.roomName?.toLowerCase().includes(q) ||
      log.source.toLowerCase().includes(q) ||
      log.newStatus?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by room, status, source..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {isLoading ? "" : `${filtered.length} log${filtered.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="px-0 pb-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="pl-4">
                    <div className="flex items-center gap-1">
                      Timestamp <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Prev Status</TableHead>
                  <TableHead>New Status</TableHead>
                  <TableHead>Prev Gender</TableHead>
                  <TableHead>New Gender</TableHead>
                  <TableHead className="pr-4">Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((__, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-14">
                      <ClipboardList className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No audit logs found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((log) => (
                    <TableRow key={log.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="pl-4 text-xs text-muted-foreground whitespace-nowrap">
                        {formatTimestamp(log.timestamp)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-mono font-semibold text-sm">{log.roomNumber ?? log.roomId}</p>
                          {log.roomName && (
                            <p className="text-xs text-muted-foreground">{log.roomName}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.previousStatus ? (
                          <StatusBadge status={log.previousStatus} />
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {log.newStatus ? (
                          <StatusBadge status={log.newStatus} />
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <GenderBadge gender={log.previousGender} />
                      </TableCell>
                      <TableCell>
                        <GenderBadge gender={log.newGender} />
                      </TableCell>
                      <TableCell className="pr-4">
                        <Badge
                          variant="outline"
                          className={
                            log.source === "admin"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : "bg-orange-50 text-orange-700 border-orange-200"
                          }
                        >
                          {log.source}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const CARD_VARIANTS = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.3 } }),
};

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  index: number;
}

export function StatCard({ title, value, icon: Icon, color, index }: StatCardProps) {
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

export function StatCardSkeleton() {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-5">
        <Skeleton className="h-4 w-24 mb-3" />
        <Skeleton className="h-8 w-12" />
      </CardContent>
    </Card>
  );
}

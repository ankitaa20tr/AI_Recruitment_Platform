"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  delay?: number;
}

export function StatCard({ title, value, icon: Icon, color, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="group relative overflow-hidden transition-colors hover:border-line-strong">
        <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-accent/10 blur-2xl transition-opacity group-hover:opacity-100 opacity-60" />
        <CardContent className="relative p-5">
          <div className="flex items-start justify-between">
            <p className="label">{title}</p>
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
              <Icon className="h-[18px] w-[18px] text-white" />
            </div>
          </div>
          <p className="num mt-3 text-3xl font-semibold text-fg">{value}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

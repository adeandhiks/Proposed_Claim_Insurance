'use client';

import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { ClaimStats } from '@/types/claim';

interface StatsCardsProps {
  stats: ClaimStats | undefined;
  isLoading: boolean;
}

const statsConfig = [
  {
    key: 'total' as const,
    title: 'Total Claim',
    icon: FileText,
    gradient: 'from-blue-500 to-blue-600',
    bgGlow: 'bg-blue-500/10',
  },
  {
    key: 'approved' as const,
    title: 'Disetujui',
    icon: CheckCircle2,
    gradient: 'from-emerald-500 to-emerald-600',
    bgGlow: 'bg-emerald-500/10',
  },
  {
    key: 'rejected' as const,
    title: 'Ditolak',
    icon: XCircle,
    gradient: 'from-red-500 to-red-600',
    bgGlow: 'bg-red-500/10',
  },
  {
    key: 'pending' as const,
    title: 'Pending',
    icon: Clock,
    gradient: 'from-amber-500 to-amber-600',
    bgGlow: 'bg-amber-500/10',
  },
];

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsConfig.map((config) => (
        <Card
          key={config.key}
          className="relative overflow-hidden border-0 shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
        >
          <div className={`absolute inset-0 ${config.bgGlow} opacity-50`} />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {config.title}
            </CardTitle>
            <div
              className={`flex size-9 items-center justify-center rounded-lg bg-gradient-to-br ${config.gradient} text-white shadow-sm`}
            >
              <config.icon className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold tracking-tight">
                {stats?.[config.key] ?? 0}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

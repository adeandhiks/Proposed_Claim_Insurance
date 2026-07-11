'use client';

import { StatsCards } from '@/components/dashboard/stats-cards';
import { ClaimsTable } from '@/components/dashboard/claims-table';
import { useClaims, useClaimStats } from '@/hooks/use-claims';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FilePlus } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: claims, isLoading: claimsLoading } = useClaims();
  const { data: stats, isLoading: statsLoading } = useClaimStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Pantau status claim asuransi Anda
          </p>
        </div>
        <Button
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md"
          nativeButton={false}
          render={<Link href="/claims/new" />}
        >
          <FilePlus className="mr-2 size-4" />
          Ajukan Claim
        </Button>
      </div>

      <StatsCards stats={stats} isLoading={statsLoading} />

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Claim</CardTitle>
        </CardHeader>
        <CardContent>
          <ClaimsTable claims={claims} isLoading={claimsLoading} />
        </CardContent>
      </Card>
    </div>
  );
}

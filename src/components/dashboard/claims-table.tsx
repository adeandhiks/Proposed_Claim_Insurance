'use client';

import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ClaimStatusBadge } from '@/components/claims/claim-status-badge';
import { formatCurrency } from '@/utils/ocr-parser';
import type { Claim } from '@/types/claim';

interface ClaimsTableProps {
  claims: Claim[] | undefined;
  isLoading: boolean;
}

export function ClaimsTable({ claims, isLoading }: ClaimsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!claims || claims.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <svg
            className="size-8 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold">Belum ada claim</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Mulai ajukan claim pertama Anda
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Tanggal</TableHead>
            <TableHead>Rumah Sakit</TableHead>
            <TableHead>Diagnosa</TableHead>
            <TableHead className="text-right">Total Tagihan</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {claims.map((claim) => (
            <TableRow
              key={claim.id}
              className="cursor-pointer transition-colors"
            >
              <TableCell className="font-medium">
                <Link href={`/claims/${claim.id}`} className="hover:underline">
                  {claim.created_at
                    ? new Date(claim.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '-'}
                </Link>
              </TableCell>
              <TableCell>{claim.hospital_name || '-'}</TableCell>
              <TableCell>{claim.diagnosis || '-'}</TableCell>
              <TableCell className="text-right font-mono">
                {claim.total_bill ? formatCurrency(claim.total_bill) : '-'}
              </TableCell>
              <TableCell>
                <ClaimStatusBadge status={claim.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

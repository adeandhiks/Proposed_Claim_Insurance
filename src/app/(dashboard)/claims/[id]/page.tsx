'use client';

import { use } from 'react';
import { ArrowLeft, FileText, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ClaimStatusBadge } from '@/components/claims/claim-status-badge';
import { useClaim } from '@/hooks/use-claims';
import { formatCurrency } from '@/utils/ocr-parser';
import Link from 'next/link';

export default function ClaimDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: claim, isLoading } = useClaim(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <h2 className="text-xl font-semibold">Claim tidak ditemukan</h2>
        <Button className="mt-4" nativeButton={false} render={<Link href="/dashboard" />}>
          Kembali ke Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" nativeButton={false} render={<Link href="/dashboard" />}>
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Detail Claim</h1>
          <p className="text-muted-foreground">
            {new Date(claim.created_at).toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <ClaimStatusBadge status={claim.status} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Claim Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="size-4" />
              Informasi Claim
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow label="Nama Pasien" value={claim.patient_name} />
            <InfoRow label="Rumah Sakit" value={claim.hospital_name} />
            <InfoRow
              label="Tanggal"
              value={
                claim.claim_date
                  ? new Date(claim.claim_date).toLocaleDateString('id-ID')
                  : null
              }
            />
            <InfoRow label="Diagnosa" value={claim.diagnosis} />
            <InfoRow
              label="Total Tagihan"
              value={
                claim.total_bill
                  ? formatCurrency(claim.total_bill)
                  : null
              }
            />
            <InfoRow
              label="Confidence OCR"
              value={
                claim.ocr_confidence
                  ? `${(claim.ocr_confidence * 100).toFixed(1)}%`
                  : null
              }
            />
          </CardContent>
        </Card>

        {/* AI Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Brain className="size-4" />
              Hasil Analisis AI
            </CardTitle>
          </CardHeader>
          <CardContent>
            {claim.ai_result ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm leading-relaxed">
                    {claim.ai_reason || 'Tidak ada penjelasan.'}
                  </p>
                </div>
                {claim.ai_result && typeof claim.ai_result === 'object' && (
                  <InfoRow
                    label="Confidence AI"
                    value={`${(
                      ((claim.ai_result as { confidence?: number })
                        .confidence || 0) * 100
                    ).toFixed(1)}%`}
                  />
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Brain className="size-8 text-muted-foreground mb-2 animate-pulse" />
                <p className="text-sm text-muted-foreground">
                  {claim.status === 'AI_ANALYZING'
                    ? 'Sedang dianalisis oleh AI...'
                    : 'Belum dianalisis'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* OCR Raw Text */}
      {claim.ocr_text && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Teks OCR</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm font-mono leading-relaxed">
              {claim.ocr_text}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm font-medium text-right">{value || '-'}</span>
    </div>
  );
}

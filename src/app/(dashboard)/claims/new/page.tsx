'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UploadStep } from '@/components/claims/upload-step';
import { OcrProcessing } from '@/components/claims/ocr-processing';
import { OcrResult } from '@/components/claims/ocr-result';
import { OcrFailed } from '@/components/claims/ocr-failed';
import { useOcr } from '@/hooks/use-ocr';
import { useUploadDocument, useSubmitClaim, useAnalyzeClaim } from '@/features/claims/queries';
import type { ParsedOcrData } from '@/types/ocr';
import { toast } from 'sonner';
import Link from 'next/link';

type Step = 'upload' | 'processing' | 'result' | 'failed';

export default function NewClaimPage() {
  const [step, setStep] = useState<Step>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const router = useRouter();

  const { progress, result, processImage, reset } = useOcr();
  const uploadMutation = useUploadDocument();
  const submitMutation = useSubmitClaim();
  const analyzeMutation = useAnalyzeClaim();

  const handleFileSelected = async (file: File) => {
    setSelectedFile(file);
    setStep('processing');

    const ocrResult = await processImage(file);

    if (ocrResult.success && ocrResult.parsedData) {
      setStep('result');
    } else {
      setStep('failed');
    }
  };

  const handleRetry = () => {
    reset();
    setSelectedFile(null);
    setStep('upload');
  };

  const handleSubmitClaim = async (data: ParsedOcrData) => {
    if (!selectedFile || !result) return;

    try {
      // Step 1: Upload document to Supabase Storage
      toast.info('📤 Mengupload dokumen...');
      const uploadResult = await uploadMutation.mutateAsync(selectedFile);

      if (!uploadResult.imageUrl) {
        toast.error('❌ Gagal mengupload dokumen. Silakan coba lagi.');
        return;
      }

      // Step 2: Save claim to database
      toast.info('💾 Menyimpan data claim...');
      const claimResult = await submitMutation.mutateAsync({
        claimData: {
          patient_name: data.patient_name,
          hospital_name: data.hospital_name,
          claim_date: data.claim_date,
          diagnosis: data.diagnosis,
          total_bill: data.total_bill,
        },
        ocrText: result.text,
        ocrConfidence: result.confidence,
        imageUrl: uploadResult.imageUrl,
      });

      if (!claimResult.claim) {
        toast.error('❌ Gagal menyimpan claim. Silakan coba lagi.');
        return;
      }

      toast.success('✅ Claim berhasil diajukan!');

      // Step 3: Trigger AI analysis with loading notification
      const claimId = String(claimResult.claim.id);
      toast.promise(
        analyzeMutation.mutateAsync(claimId),
        {
          loading: '🤖 AI sedang menganalisis claim Anda... (dapat memakan waktu hingga 30 detik)',
          success: '✅ Analisis AI selesai! Lihat hasilnya di Dashboard.',
          error: '⚠️ Analisis AI gagal. Claim akan ditinjau manual.',
        }
      );

      // Navigate to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Submit error:', error);
      const message = error instanceof Error ? error.message : '';

      if (message.includes('duplikat') || message.includes('sama')) {
        toast.error('🚫 Claim Duplikat Terdeteksi', {
          description: 'Dokumen dengan data pasien, rumah sakit, tanggal, diagnosa, dan tagihan yang sama sudah pernah diajukan sebelumnya. Silakan periksa di Dashboard.',
          duration: 8000,
        });
      } else if (message.includes('login')) {
        toast.error('🔒 Sesi Berakhir', {
          description: 'Silakan login kembali untuk melanjutkan.',
          duration: 5000,
        });
        router.push('/login');
      } else {
        toast.error('❌ Gagal Mengajukan Claim', {
          description: message || 'Terjadi kesalahan. Silakan coba lagi nanti.',
          duration: 5000,
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" nativeButton={false} render={<Link href="/dashboard" />}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ajukan Claim</h1>
          <p className="text-muted-foreground">
            Upload dokumen claim asuransi Anda
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        {['Upload', 'OCR', 'Review'].map((label, idx) => {
          const stepMap: Record<Step, number> = {
            upload: 0,
            processing: 1,
            result: 2,
            failed: 1,
          };
          const currentStep = stepMap[step];
          const isActive = idx <= currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`flex size-8 items-center justify-center rounded-full text-xs font-medium transition-all ${
                  isCurrent
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                    : isActive
                      ? 'bg-blue-500/20 text-blue-500'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {idx + 1}
              </div>
              <span
                className={`text-sm ${
                  isActive ? 'text-foreground font-medium' : 'text-muted-foreground'
                }`}
              >
                {label}
              </span>
              {idx < 2 && (
                <div
                  className={`h-px w-8 ${
                    isActive ? 'bg-blue-500' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      {step === 'upload' && <UploadStep onFileSelected={handleFileSelected} />}
      {step === 'processing' && <OcrProcessing progress={progress} />}
      {step === 'result' && result?.parsedData && (
        <OcrResult
          data={result.parsedData}
          rawText={result.text}
          confidence={result.confidence}
          onSubmit={handleSubmitClaim}
          isSubmitting={
            uploadMutation.isPending || submitMutation.isPending
          }
        />
      )}
      {step === 'failed' && (
        <OcrFailed
          missingFields={result?.missingFields || ['Dokumen tidak terbaca']}
          onRetry={handleRetry}
        />
      )}
    </div>
  );
}

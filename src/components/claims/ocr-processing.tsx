'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { OcrProgress } from '@/types/ocr';

interface OcrProcessingProps {
  progress: OcrProgress;
}

export function OcrProcessing({ progress }: OcrProcessingProps) {
  return (
    <Card className="border-blue-500/20 bg-blue-500/5">
      <CardContent className="flex flex-col items-center justify-center py-16">
        {/* Animated scanner effect */}
        <div className="relative mb-8">
          <div className="size-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <svg
              className="size-10 text-white animate-pulse"
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
          {/* Scanning line animation */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-white/60 to-transparent animate-[scan_2s_ease-in-out_infinite]" />
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-2">
          {progress.status || 'Sedang membaca dokumen...'}
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Mohon tunggu, proses ini membutuhkan beberapa saat
        </p>

        <div className="w-full max-w-xs space-y-2">
          <Progress value={progress.progress} className="h-2" />
          <p className="text-center text-xs text-muted-foreground">
            {progress.progress}%
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

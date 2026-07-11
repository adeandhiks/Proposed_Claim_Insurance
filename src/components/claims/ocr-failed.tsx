'use client';

import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface OcrFailedProps {
  missingFields: string[];
  onRetry: () => void;
}

export function OcrFailed({ missingFields, onRetry }: OcrFailedProps) {
  return (
    <div className="space-y-4">
      <Alert className="border-red-500/30 bg-red-500/10">
        <AlertTriangle className="size-4 text-red-500" />
        <AlertDescription className="text-red-700 dark:text-red-400">
          Dokumen tidak dapat dibaca dengan lengkap. Silakan upload ulang
          dokumen dengan kualitas yang lebih baik.
        </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="py-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-red-500/10">
              <AlertTriangle className="size-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Field yang tidak ditemukan:
            </h3>
            <ul className="mb-6 space-y-1">
              {missingFields.map((field) => (
                <li
                  key={field}
                  className="text-sm text-muted-foreground flex items-center gap-2"
                >
                  <span className="size-1.5 rounded-full bg-red-500" />
                  {field}
                </li>
              ))}
            </ul>
            <Button
              onClick={onRetry}
              variant="outline"
              className="border-red-500/30 text-red-600 hover:bg-red-500/10"
            >
              <RotateCcw className="mr-2 size-4" />
              Upload Ulang
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

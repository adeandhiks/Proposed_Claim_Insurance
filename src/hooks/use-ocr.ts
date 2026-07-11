'use client';

import { useState, useCallback } from 'react';
import { TesseractOcrProvider } from '@/services/ocr/tesseract-provider';
import type { OcrResult, OcrProgress } from '@/types/ocr';

export function useOcr() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<OcrProgress>({
    status: '',
    progress: 0,
  });
  const [result, setResult] = useState<OcrResult | null>(null);

  const processImage = useCallback(async (file: File) => {
    setIsProcessing(true);
    setProgress({ status: 'Memulai proses OCR...', progress: 0 });
    setResult(null);

    try {
      const ocr = new TesseractOcrProvider();
      const ocrResult = await ocr.processImage(file, (p) => {
        setProgress(p);
      });
      setResult(ocrResult);
      return ocrResult;
    } catch (error) {
      console.error('OCR Hook Error:', error);
      const errorResult: OcrResult = {
        success: false,
        text: '',
        confidence: 0,
        parsedData: null,
        missingFields: ['Gagal memproses dokumen'],
      };
      setResult(errorResult);
      return errorResult;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsProcessing(false);
    setProgress({ status: '', progress: 0 });
    setResult(null);
  }, []);

  return {
    isProcessing,
    progress,
    result,
    processImage,
    reset,
  };
}

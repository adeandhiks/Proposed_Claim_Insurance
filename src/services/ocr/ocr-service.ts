import type { OcrResult, OcrProgress } from '@/types/ocr';

/**
 * OCR Service Interface.
 * Implement this interface to swap OCR providers
 * (e.g., Tesseract.js, Google Vision API, OpenAI Vision).
 */
export interface IOcrService {
  processImage(
    file: File,
    onProgress?: (progress: OcrProgress) => void
  ): Promise<OcrResult>;
}

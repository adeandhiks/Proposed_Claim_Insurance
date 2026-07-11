import Tesseract from 'tesseract.js';
import type { IOcrService } from './ocr-service';
import type { OcrResult, OcrProgress } from '@/types/ocr';
import { parseOcrText } from '@/utils/ocr-parser';

export class TesseractOcrProvider implements IOcrService {
  async processImage(
    file: File,
    onProgress?: (progress: OcrProgress) => void
  ): Promise<OcrResult> {
    try {
      const result = await Tesseract.recognize(file, 'ind+eng', {
        logger: (m) => {
          if (m.status && onProgress) {
            const statusMap: Record<string, string> = {
              'loading tesseract core': 'Memuat engine OCR...',
              'initializing tesseract': 'Menginisialisasi OCR...',
              'loading language traineddata': 'Memuat data bahasa...',
              'initializing api': 'Menyiapkan API...',
              'recognizing text': 'Sedang membaca dokumen...',
            };
            onProgress({
              status: statusMap[m.status] || m.status,
              progress: Math.round((m.progress || 0) * 100),
            });
          }
        },
      });

      const rawText = result.data.text;
      const confidence = result.data.confidence / 100;

      if (!rawText || rawText.trim().length < 10) {
        return {
          success: false,
          text: rawText,
          confidence,
          parsedData: null,
          missingFields: ['Dokumen tidak terbaca'],
        };
      }

      const parsed = parseOcrText(rawText);

      return {
        success: parsed.missingFields.length === 0,
        text: rawText,
        confidence,
        parsedData: parsed.data,
        missingFields: parsed.missingFields,
      };
    } catch (error) {
      console.error('OCR Error:', error);
      return {
        success: false,
        text: '',
        confidence: 0,
        parsedData: null,
        missingFields: ['Gagal memproses dokumen'],
      };
    }
  }
}

// Singleton instance
export const tesseractOcr = new TesseractOcrProvider();

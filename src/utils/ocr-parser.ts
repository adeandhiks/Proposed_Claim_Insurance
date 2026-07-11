import type { ParsedOcrData } from '@/types/ocr';

/**
 * Parses raw OCR text to extract structured claim data.
 * Uses regex patterns to find required fields from Indonesian medical documents.
 */
export function parseOcrText(text: string): {
  data: ParsedOcrData;
  missingFields: string[];
} {
  const missingFields: string[] = [];

  // Extract hospital name - usually appears at the top of the document
  const hospitalPatterns = [
    /(?:rumah\s*sakit|rs\.?|hospital)\s*[:\-]?\s*(.+)/i,
    /^([A-Z][A-Za-z\s]+(?:Hospital|Klinik|RS))/m,
    /^((?:RS|Rumah Sakit|Klinik|RSUD|RSU)\s*.+)$/m,
  ];
  let hospital_name = '';
  for (const pattern of hospitalPatterns) {
    const match = text.match(pattern);
    if (match) {
      hospital_name = match[1]?.trim() || match[0]?.trim() || '';
      break;
    }
  }
  // Fallback: try first non-empty line as hospital name
  if (!hospital_name) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length > 0 && !lines[0].toLowerCase().includes('tanggal') && !lines[0].toLowerCase().includes('nama')) {
      hospital_name = lines[0];
    }
  }
  if (!hospital_name) missingFields.push('Nama Rumah Sakit');

  // Extract date
  const datePatterns = [
    // "Tanggal: 12 Februari 2026" or "Tanggal Keluar : 12 Februari 2026"
    /(?:tanggal)(?:\s*(?:keluar|masuk|perawatan))?\s*[:\-]?\s*(\d{1,2}\s+(?:Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)\s+\d{4})/i,
    // "Tanggal: 12-02-2026" or "Tgl: 12/02/2026"
    /(?:tanggal|tgl|date)\s*[:\-]?\s*(\d{1,2}[\-\/\.\s]\d{1,2}[\-\/\.\s]\d{2,4})/i,
    // Standalone Indonesian date "12 Februari 2026"
    /(\d{1,2}\s+(?:Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)\s+\d{4})/i,
    // Numeric date with separators
    /(\d{1,2}[\-\/]\d{1,2}[\-\/]\d{2,4})/,
  ];
  let claim_date = '';
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      claim_date = normalizeDate(match[1]?.trim() || match[0]?.trim() || '');
      break;
    }
  }
  if (!claim_date) missingFields.push('Tanggal');

  // Extract patient name
  const namePatterns = [
    /(?:nama\s*pasien|nama\s*patient|patient\s*name)\s*[:\-]?\s*([A-Za-z\s.]+?)\s*(?:tanggal|tgl|no\.?\s*(?:rekam|rm|mr)|\d{2}[\-\/]|$)/i,
    /(?:nama\s*pasien|nama\s*patient|patient\s*name|nama)\s*[:\-]?\s*(.+)/i,
  ];
  let patient_name = '';
  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match) {
      patient_name = match[1]?.trim() || '';
      // Clean up: remove trailing numbers, colons, or medical record numbers
      patient_name = patient_name.replace(/[:\d]+$/, '').trim();
      if (patient_name.length > 2) break;
    }
  }
  if (!patient_name) missingFields.push('Nama Pasien');

  // Extract diagnosis
  const diagnosisPatterns = [
    /(?:diagnos[ae]|diagnosis)\s*[:\-]?\s*(.+)/i,
    /(?:penyakit|keluhan)\s*[:\-]?\s*(.+)/i,
  ];
  let diagnosis = '';
  for (const pattern of diagnosisPatterns) {
    const match = text.match(pattern);
    if (match) {
      diagnosis = match[1]?.trim() || '';
      break;
    }
  }
  if (!diagnosis) missingFields.push('Diagnosa');

  // Extract total bill
  const billPatterns = [
    /(?:total\s*(?:tagihan|biaya|pembayaran|bill)|jumlah\s*(?:tagihan|biaya|bayar)|grand\s*total)\s*[:\-]?\s*(?:Rp\.?\s*)?([\d.,]+)/i,
    /(?:Rp\.?\s*)([\d.,]+)\s*(?:,-)?/i,
  ];
  let total_bill = 0;
  for (const pattern of billPatterns) {
    const match = text.match(pattern);
    if (match) {
      const rawAmount = match[1]?.replace(/[.,]/g, '') || '0';
      total_bill = parseInt(rawAmount, 10);
      if (total_bill > 0) break;
    }
  }
  if (total_bill <= 0) missingFields.push('Total Tagihan');

  return {
    data: {
      patient_name,
      hospital_name,
      claim_date,
      diagnosis,
      total_bill,
    },
    missingFields,
  };
}

/**
 * Normalize various date formats to YYYY-MM-DD
 */
function normalizeDate(dateStr: string): string {
  // Handle DD-MM-YYYY or DD/MM/YYYY
  const dmy = dateStr.match(/(\d{1,2})[\-\/\.\s](\d{1,2})[\-\/\.\s](\d{2,4})/);
  if (dmy) {
    const day = dmy[1].padStart(2, '0');
    const month = dmy[2].padStart(2, '0');
    let year = dmy[3];
    if (year.length === 2) {
      year = parseInt(year) > 50 ? `19${year}` : `20${year}`;
    }
    return `${year}-${month}-${day}`;
  }

  // Handle Indonesian month names
  const months: Record<string, string> = {
    januari: '01', februari: '02', maret: '03', april: '04',
    mei: '05', juni: '06', juli: '07', agustus: '08',
    september: '09', oktober: '10', november: '11', desember: '12',
  };
  const indoDate = dateStr.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/i);
  if (indoDate) {
    const day = indoDate[1].padStart(2, '0');
    const monthName = indoDate[2].toLowerCase();
    const year = indoDate[3];
    const month = months[monthName];
    if (month) return `${year}-${month}-${day}`;
  }

  return dateStr;
}

/**
 * Format currency to Indonesian Rupiah format
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export interface OcrResult {
  success: boolean;
  text: string;
  confidence: number;
  parsedData: ParsedOcrData | null;
  missingFields: string[];
}

export interface ParsedOcrData {
  patient_name: string;
  hospital_name: string;
  claim_date: string;
  diagnosis: string;
  total_bill: number;
}

export interface OcrProgress {
  status: string;
  progress: number;
}

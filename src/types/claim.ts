export enum ClaimStatus {
  PROCESSING = 'PROCESSING',
  OCR_SUCCESS = 'OCR_SUCCESS',
  OCR_FAILED = 'OCR_FAILED',
  AI_ANALYZING = 'AI_ANALYZING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  NEED_REVIEW = 'NEED_REVIEW',
}

export interface ClaimData {
  patient_name: string;
  hospital_name: string;
  claim_date: string;
  diagnosis: string;
  total_bill: number;
}

export interface AiAnalysisResult {
  status: 'APPROVED' | 'REJECTED' | 'NEED_REVIEW';
  confidence: number;
  reason: string;
}

export interface Claim {
  id: string;
  user_id: string;
  image_url: string;
  patient_name: string | null;
  hospital_name: string | null;
  claim_date: string | null;
  diagnosis: string | null;
  total_bill: number;
  ocr_text: string | null;
  ocr_confidence: number | null;
  ai_result: AiAnalysisResult | null;
  ai_reason: string | null;
  status: ClaimStatus;
  created_at: string;
  updated_at: string;
}

export interface ClaimStats {
  total: number;
  approved: number;
  rejected: number;
  pending: number;
}

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type ClaimStatusDb =
  | 'PROCESSING'
  | 'OCR_SUCCESS'
  | 'OCR_FAILED'
  | 'AI_ANALYZING'
  | 'APPROVED'
  | 'REJECTED'
  | 'NEED_REVIEW';

export interface Database {
  public: {
    Tables: {
      claims: {
        Row: {
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
          ai_result: Json | null;
          ai_reason: string | null;
          status: ClaimStatusDb;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          image_url: string;
          patient_name?: string | null;
          hospital_name?: string | null;
          claim_date?: string | null;
          diagnosis?: string | null;
          total_bill?: number;
          ocr_text?: string | null;
          ocr_confidence?: number | null;
          ai_result?: Json | null;
          ai_reason?: string | null;
          status?: ClaimStatusDb;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          image_url?: string;
          patient_name?: string | null;
          hospital_name?: string | null;
          claim_date?: string | null;
          diagnosis?: string | null;
          total_bill?: number;
          ocr_text?: string | null;
          ocr_confidence?: number | null;
          ai_result?: Json | null;
          ai_reason?: string | null;
          status?: ClaimStatusDb;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}

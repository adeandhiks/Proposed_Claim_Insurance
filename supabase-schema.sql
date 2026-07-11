-- ============================================
-- AI Insurance Claim System - Database Schema
-- ============================================

-- Enum type for claim status
CREATE TYPE claim_status AS ENUM (
  'PROCESSING',
  'OCR_SUCCESS',
  'OCR_FAILED',
  'AI_ANALYZING',
  'APPROVED',
  'REJECTED',
  'NEED_REVIEW'
);

-- Claims table
CREATE TABLE IF NOT EXISTS claims (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  patient_name TEXT,
  hospital_name TEXT,
  claim_date DATE,
  diagnosis TEXT,
  total_bill DECIMAL(15,2) DEFAULT 0,
  ocr_text TEXT,
  ocr_confidence DECIMAL(5,4),
  ai_result JSONB,
  ai_reason TEXT,
  status claim_status DEFAULT 'PROCESSING',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_claims_user_id ON claims(user_id);
CREATE INDEX idx_claims_status ON claims(status);
CREATE INDEX idx_claims_created_at ON claims(created_at DESC);

-- Enable Row Level Security
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Nasabah can only access their own claims
CREATE POLICY "Users can view own claims"
  ON claims FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own claims"
  ON claims FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own claims"
  ON claims FOR UPDATE
  USING (auth.uid() = user_id);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER claims_updated_at
  BEFORE UPDATE ON claims
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Storage Bucket for Claim Documents
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('claim-documents', 'claim-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
CREATE POLICY "Users can upload claim documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'claim-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own claim documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'claim-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

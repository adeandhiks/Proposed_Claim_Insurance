import type { ClaimData, AiAnalysisResult } from '@/types/claim';

interface RuleResult {
  passed: boolean;
  status?: 'REJECTED';
  reason?: string;
}

/**
 * Rule-based pre-check before sending to AI.
 * Returns REJECTED immediately if basic rules fail.
 * Returns passed=true if all rules pass (should proceed to AI).
 */
export function evaluateRules(data: ClaimData): RuleResult {
  // Rule 1: Diagnosa must not be empty
  if (!data.diagnosis || data.diagnosis.trim().length === 0) {
    return {
      passed: false,
      status: 'REJECTED',
      reason: 'Diagnosa tidak ditemukan pada dokumen.',
    };
  }

  // Rule 2: Total bill must be greater than 0
  if (!data.total_bill || data.total_bill <= 0) {
    return {
      passed: false,
      status: 'REJECTED',
      reason: 'Total tagihan tidak valid atau bernilai 0.',
    };
  }

  // Rule 3: Date must be valid
  if (!data.claim_date || data.claim_date.trim().length === 0) {
    return {
      passed: false,
      status: 'REJECTED',
      reason: 'Tanggal claim tidak valid.',
    };
  }

  // Rule 4: Patient name must exist
  if (!data.patient_name || data.patient_name.trim().length === 0) {
    return {
      passed: false,
      status: 'REJECTED',
      reason: 'Nama pasien tidak ditemukan.',
    };
  }

  // Rule 5: Hospital name must exist
  if (!data.hospital_name || data.hospital_name.trim().length === 0) {
    return {
      passed: false,
      status: 'REJECTED',
      reason: 'Nama rumah sakit tidak ditemukan.',
    };
  }

  // Rule 6: Date must not be in the future
  const claimDate = new Date(data.claim_date);
  const today = new Date();
  if (claimDate > today) {
    return {
      passed: false,
      status: 'REJECTED',
      reason: 'Tanggal claim tidak boleh di masa depan.',
    };
  }

  // All rules passed
  return { passed: true };
}

/**
 * Apply rule engine result as AiAnalysisResult for rejected claims
 */
export function ruleResultToAiResult(ruleResult: RuleResult): AiAnalysisResult {
  return {
    status: ruleResult.status || 'REJECTED',
    confidence: 1.0,
    reason: ruleResult.reason || 'Ditolak oleh validasi otomatis.',
  };
}

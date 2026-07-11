'use server';

import { createClient } from '@/lib/supabase/server';
import type { ClaimData, AiAnalysisResult } from '@/types/claim';
import type { ClaimStatusDb } from '@/types/database';
import { evaluateRules, ruleResultToAiResult } from '@/utils/rule-engine';

export async function uploadClaimDocument(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Anda harus login terlebih dahulu' };
  }

  const file = formData.get('file') as File;
  if (!file) {
    return { error: 'File tidak ditemukan' };
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('claim-documents')
    .upload(fileName, file);

  if (uploadError) {
    console.error('Upload error:', uploadError);
    return { error: 'Gagal mengupload dokumen: ' + uploadError.message };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('claim-documents').getPublicUrl(fileName);

  return { imageUrl: publicUrl, fileName };
}

export async function submitClaim(
  claimData: ClaimData,
  ocrText: string,
  ocrConfidence: number,
  imageUrl: string
): Promise<{ error: string; claim?: never } | { error?: never; claim: Record<string, unknown> }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Anda harus login terlebih dahulu' };
  }

  // Check for duplicate claim (same patient, hospital, date, diagnosis, amount)
  const { data: existing } = await supabase
    .from('claims')
    .select('id')
    .eq('user_id', user.id)
    .eq('patient_name', claimData.patient_name)
    .eq('hospital_name', claimData.hospital_name)
    .eq('claim_date', claimData.claim_date)
    .eq('diagnosis', claimData.diagnosis)
    .eq('total_bill', claimData.total_bill)
    .limit(1);

  if (existing && existing.length > 0) {
    return {
      error: 'Claim dengan data yang sama sudah pernah diajukan. Tidak dapat mengajukan claim duplikat.',
    };
  }

  const { data, error } = await supabase
    .from('claims')
    .insert({
      user_id: user.id,
      image_url: imageUrl,
      patient_name: claimData.patient_name,
      hospital_name: claimData.hospital_name,
      claim_date: claimData.claim_date,
      diagnosis: claimData.diagnosis,
      total_bill: claimData.total_bill,
      ocr_text: ocrText,
      ocr_confidence: ocrConfidence,
      status: 'PROCESSING' as ClaimStatusDb,
    })
    .select()
    .single();

  if (error) {
    console.error('Insert error:', error);
    return { error: 'Gagal menyimpan claim: ' + error.message };
  }

  return { claim: data };
}

export async function analyzeClaimWithAI(claimId: string) {
  const supabase = await createClient();

  // Fetch the claim
  const { data: claim, error: fetchError } = await supabase
    .from('claims')
    .select('*')
    .eq('id', claimId)
    .single();

  if (fetchError || !claim) {
    return { error: 'Claim tidak ditemukan' };
  }

  // Update status to AI_ANALYZING
  await supabase
    .from('claims')
    .update({ status: 'AI_ANALYZING' as ClaimStatusDb })
    .eq('id', claimId);

  const claimData: ClaimData = {
    patient_name: claim.patient_name || '',
    hospital_name: claim.hospital_name || '',
    claim_date: claim.claim_date || '',
    diagnosis: claim.diagnosis || '',
    total_bill: Number(claim.total_bill) || 0,
  };

  // Step 1: Rule engine pre-check
  const ruleResult = evaluateRules(claimData);

  let aiResult: AiAnalysisResult;

  if (!ruleResult.passed) {
    // Rule engine rejected the claim
    aiResult = ruleResultToAiResult(ruleResult);
  } else {
    // Step 2: Call AI directly
    try {
      const { OpenAIProvider } = await import('@/services/ai/openai-provider');
      const aiProvider = new OpenAIProvider();
      aiResult = await aiProvider.analyzeClaim(claimData, claim.ocr_text || '');
    } catch (error) {
      console.error('AI Analysis Error:', error);
      aiResult = {
        status: 'NEED_REVIEW',
        confidence: 0,
        reason: `Analisis AI gagal: ${error instanceof Error ? error.message : 'Unknown error'}. Claim memerlukan review manual.`,
      };
    }
  }

  // Step 3: Update claim with AI result
  const finalStatus: ClaimStatusDb =
    aiResult.status === 'APPROVED'
      ? 'APPROVED'
      : aiResult.status === 'REJECTED'
        ? 'REJECTED'
        : 'NEED_REVIEW';

  const { error: updateError } = await supabase
    .from('claims')
    .update({
      ai_result: aiResult as unknown as import('@/types/database').Json,
      ai_reason: aiResult.reason,
      status: finalStatus,
    })
    .eq('id', claimId);

  if (updateError) {
    console.error('Update error:', updateError);
    return { error: 'Gagal mengupdate hasil analisis' };
  }

  return { result: aiResult };
}

import type { IAiService } from './ai-service';
import type { ClaimData, AiAnalysisResult } from '@/types/claim';

export class OpenAIProvider implements IAiService {
  private baseURL: string;
  private apiKey: string;
  private model: string;

  constructor() {
    this.baseURL = process.env.AI_API_BASE_URL || 'https://api.openai.com/v1';
    this.apiKey = process.env.AI_API_KEY || '';
    this.model = process.env.AI_MODEL || 'gpt-4o';
  }

  async analyzeClaim(
    claimData: ClaimData,
    ocrText: string
  ): Promise<AiAnalysisResult> {
    try {
      const prompt = `Evaluasi claim asuransi kesehatan berikut dan jawab HANYA dalam format JSON (tanpa markdown, tanpa penjelasan lain):

Data Claim:
- Nama Pasien: ${claimData.patient_name}
- Rumah Sakit: ${claimData.hospital_name}
- Tanggal: ${claimData.claim_date}
- Diagnosa: ${claimData.diagnosis}
- Total Tagihan: Rp${claimData.total_bill.toLocaleString('id-ID')}

Teks OCR: ${ocrText.substring(0, 500)}

Kriteria: APPROVED jika data valid dan wajar. REJECTED jika ada ketidaksesuaian. NEED_REVIEW jika >Rp10.000.000 atau perlu verifikasi.

Jawab HANYA JSON ini: {"status":"APPROVED atau REJECTED atau NEED_REVIEW","confidence":0.0-1.0,"reason":"penjelasan dalam Bahasa Indonesia"}`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 55000);

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        signal: controller.signal,
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.3,
          max_tokens: 1000,
        }),
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('[AI Provider] Response received, finish_reason:', data.choices?.[0]?.finish_reason);

      const message = data.choices?.[0]?.message;
      // Try content first, then reasoning fields (for step/reasoning models)
      const content = message?.content || message?.reasoning_content || message?.reasoning || '';

      console.log('[AI Provider] Content length:', content.length);
      console.log('[AI Provider] Content preview:', content.substring(0, 200));

      if (!content) {
        console.error('[AI Provider] Empty response. Full data:', JSON.stringify(data).substring(0, 500));
        throw new Error('AI tidak mengembalikan respons');
      }

      // Parse JSON from response (handle markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*?\}/);
      if (!jsonMatch) {
        throw new Error(`AI tidak mengembalikan format JSON. Response: ${content.substring(0, 200)}`);
      }

      const result = JSON.parse(jsonMatch[0]) as AiAnalysisResult;

      // Validate the result structure
      if (!['APPROVED', 'REJECTED', 'NEED_REVIEW'].includes(result.status)) {
        throw new Error('Status AI tidak valid: ' + result.status);
      }

      return {
        status: result.status,
        confidence: Math.min(1, Math.max(0, result.confidence || 0.5)),
        reason: result.reason || 'Tidak ada penjelasan.',
      };
    } catch (error) {
      console.error('[AI Provider] Error:', error);
      throw error;
    }
  }
}

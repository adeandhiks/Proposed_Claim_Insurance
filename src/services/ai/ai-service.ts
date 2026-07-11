import type { ClaimData, AiAnalysisResult } from '@/types/claim';

/**
 * AI Analysis Service Interface.
 * Implement this interface to swap AI providers
 * (e.g., OpenAI, Anthropic, Google Gemini, local models).
 */
export interface IAiService {
  analyzeClaim(
    claimData: ClaimData,
    ocrText: string
  ): Promise<AiAnalysisResult>;
}

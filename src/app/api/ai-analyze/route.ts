import { NextRequest, NextResponse } from 'next/server';
import { OpenAIProvider } from '@/services/ai/openai-provider';
import type { ClaimData } from '@/types/claim';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { claimData, ocrText } = body as {
      claimData: ClaimData;
      ocrText: string;
    };

    if (!claimData || !ocrText) {
      return NextResponse.json(
        { error: 'Data claim dan teks OCR diperlukan' },
        { status: 400 }
      );
    }

    const aiProvider = new OpenAIProvider();
    const result = await aiProvider.analyzeClaim(claimData, ocrText);

    return NextResponse.json(result);
  } catch (error) {
    console.error('AI Analyze API Error:', error);
    return NextResponse.json(
      {
        status: 'NEED_REVIEW',
        confidence: 0,
        reason: 'Terjadi kesalahan saat analisis AI. Claim memerlukan review manual.',
      },
      { status: 200 }
    );
  }
}

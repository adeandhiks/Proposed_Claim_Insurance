import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  uploadClaimDocument,
  submitClaim,
  analyzeClaimWithAI,
} from './actions';
import type { ClaimData } from '@/types/claim';
import { toast } from 'sonner';

export function useUploadDocument() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const result = await uploadClaimDocument(formData);
      if (result.error) throw new Error(result.error);
      return result;
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal mengupload dokumen');
    },
  });
}

export function useSubmitClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      claimData,
      ocrText,
      ocrConfidence,
      imageUrl,
    }: {
      claimData: ClaimData;
      ocrText: string;
      ocrConfidence: number;
      imageUrl: string;
    }) => {
      const result = await submitClaim(
        claimData,
        ocrText,
        ocrConfidence,
        imageUrl
      );
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      queryClient.invalidateQueries({ queryKey: ['claim-stats'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menyimpan claim');
    },
  });
}

export function useAnalyzeClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (claimId: string) => {
      const result = await analyzeClaimWithAI(claimId);
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      queryClient.invalidateQueries({ queryKey: ['claim-stats'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menganalisis claim');
    },
  });
}

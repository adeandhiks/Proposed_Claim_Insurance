'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { Claim, ClaimStats, ClaimStatus } from '@/types/claim';

export function useClaims() {
  const supabase = createClient();

  return useQuery<Claim[]>({
    queryKey: ['claims'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('claims')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as unknown as Claim[]) || [];
    },
  });
}

export function useClaimStats() {
  const supabase = createClient();

  return useQuery<ClaimStats>({
    queryKey: ['claim-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('claims')
        .select('status');

      if (error) throw error;

      const claims = (data || []) as { status: ClaimStatus }[];
      return {
        total: claims.length,
        approved: claims.filter((c) => c.status === 'APPROVED').length,
        rejected: claims.filter((c) => c.status === 'REJECTED').length,
        pending: claims.filter(
          (c) =>
            c.status !== 'APPROVED' &&
            c.status !== 'REJECTED'
        ).length,
      };
    },
  });
}

export function useClaim(id: string) {
  const supabase = createClient();

  return useQuery<Claim>({
    queryKey: ['claim', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('claims')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as unknown as Claim;
    },
    enabled: !!id,
  });
}

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'AI Insurance Claim System';

export const MAX_FILE_SIZE = Number(process.env.NEXT_PUBLIC_MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

export const CLAIM_STATUS_CONFIG = {
  PROCESSING: {
    label: 'Diproses',
    color: 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
    dotColor: 'bg-blue-500',
  },
  OCR_SUCCESS: {
    label: 'OCR Berhasil',
    color: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
    dotColor: 'bg-emerald-500',
  },
  OCR_FAILED: {
    label: 'OCR Gagal',
    color: 'bg-red-500/15 text-red-700 dark:text-red-400',
    dotColor: 'bg-red-500',
  },
  AI_ANALYZING: {
    label: 'Analisis AI',
    color: 'bg-purple-500/15 text-purple-700 dark:text-purple-400',
    dotColor: 'bg-purple-500',
  },
  APPROVED: {
    label: 'Disetujui',
    color: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
    dotColor: 'bg-emerald-500',
  },
  REJECTED: {
    label: 'Ditolak',
    color: 'bg-red-500/15 text-red-700 dark:text-red-400',
    dotColor: 'bg-red-500',
  },
  NEED_REVIEW: {
    label: 'Perlu Review',
    color: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
    dotColor: 'bg-amber-500',
  },
} as const;

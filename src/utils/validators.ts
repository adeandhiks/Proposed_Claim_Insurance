import { z } from 'zod';
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from '@/lib/constants';

export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const claimFormSchema = z.object({
  patient_name: z.string().min(1, 'Nama pasien wajib diisi'),
  hospital_name: z.string().min(1, 'Nama rumah sakit wajib diisi'),
  claim_date: z.string().min(1, 'Tanggal wajib diisi'),
  diagnosis: z.string().min(1, 'Diagnosa wajib diisi'),
  total_bill: z.coerce.number().positive('Total tagihan harus lebih dari 0'),
});

export type ClaimFormData = z.infer<typeof claimFormSchema>;

export const fileSchema = z.object({
  file: z
    .instanceof(File, { message: 'File wajib diupload' })
    .refine((file) => file.size <= MAX_FILE_SIZE, 'Ukuran file maksimal 10MB')
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      'Format file harus JPG, JPEG, atau PNG'
    ),
});

export type FileFormData = z.infer<typeof fileSchema>;

'use client';

import { useState } from 'react';
import { CheckCircle2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { ParsedOcrData } from '@/types/ocr';
import { formatCurrency } from '@/utils/ocr-parser';

interface OcrResultProps {
  data: ParsedOcrData;
  rawText: string;
  confidence: number;
  onSubmit: (data: ParsedOcrData) => void;
  isSubmitting: boolean;
}

export function OcrResult({
  data,
  rawText,
  confidence,
  onSubmit,
  isSubmitting,
}: OcrResultProps) {
  const [formData, setFormData] = useState<ParsedOcrData>(data);

  const handleChange = (field: keyof ParsedOcrData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="space-y-4">
      <Alert className="border-emerald-500/30 bg-emerald-500/10">
        <CheckCircle2 className="size-4 text-emerald-500" />
        <AlertDescription className="text-emerald-700 dark:text-emerald-400">
          Dokumen berhasil dibaca. Silakan periksa dan simpan untuk mengajukan
          claim.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2">
        {/* OCR Extracted Data Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Data Hasil OCR</CardTitle>
            <p className="text-xs text-muted-foreground">
              Confidence: {(confidence * 100).toFixed(1)}% — Anda dapat
              memperbaiki data di bawah ini
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patient_name">Nama Pasien</Label>
                <Input
                  id="patient_name"
                  value={formData.patient_name}
                  onChange={(e) =>
                    handleChange('patient_name', e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hospital_name">Rumah Sakit</Label>
                <Input
                  id="hospital_name"
                  value={formData.hospital_name}
                  onChange={(e) =>
                    handleChange('hospital_name', e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="claim_date">Tanggal</Label>
                <Input
                  id="claim_date"
                  type="date"
                  value={formData.claim_date}
                  onChange={(e) =>
                    handleChange('claim_date', e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="diagnosis">Diagnosa</Label>
                <Input
                  id="diagnosis"
                  value={formData.diagnosis}
                  onChange={(e) =>
                    handleChange('diagnosis', e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="total_bill">Total Tagihan (Rp)</Label>
                <Input
                  id="total_bill"
                  type="number"
                  value={formData.total_bill}
                  onChange={(e) =>
                    handleChange('total_bill', Number(e.target.value))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(formData.total_bill)}
                </p>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md"
              >
                <Save className="mr-2 size-4" />
                {isSubmitting ? 'Menyimpan...' : 'Simpan & Ajukan Claim'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Raw OCR Text */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Teks OCR Asli</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm font-mono leading-relaxed max-h-[400px] overflow-y-auto">
              {rawText}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

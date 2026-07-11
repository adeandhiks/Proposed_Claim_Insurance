'use client';

import { useCallback, useState } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from '@/lib/constants';
import { toast } from 'sonner';

interface UploadStepProps {
  onFileSelected: (file: File) => void;
}

export function UploadStep({ onFileSelected }: UploadStepProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const validateAndSetFile = useCallback(
    (file: File) => {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast.error('Format file harus JPG, JPEG, atau PNG');
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error('Ukuran file maksimal 10MB');
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) validateAndSetFile(file);
    },
    [validateAndSetFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) validateAndSetFile(file);
    },
    [validateAndSetFile]
  );

  const clearFile = () => {
    setSelectedFile(null);
    setPreview(null);
  };

  const handleSubmit = () => {
    if (selectedFile) {
      onFileSelected(selectedFile);
    }
  };

  return (
    <div className="space-y-6">
      {!preview ? (
        <Card
          className={`border-2 border-dashed transition-all duration-300 ${
            isDragging
              ? 'border-blue-500 bg-blue-500/5 scale-[1.02]'
              : 'border-muted-foreground/25 hover:border-blue-500/50 hover:bg-muted/50'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div
              className={`mb-4 flex size-16 items-center justify-center rounded-full transition-colors ${
                isDragging ? 'bg-blue-500/20' : 'bg-muted'
              }`}
            >
              <Upload
                className={`size-8 transition-colors ${
                  isDragging ? 'text-blue-500' : 'text-muted-foreground'
                }`}
              />
            </div>
            <h3 className="text-lg font-semibold mb-1">
              Drag & Drop dokumen di sini
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              atau klik untuk memilih file
            </p>
            <label>
              <input
                type="file"
                className="hidden"
                accept=".jpg,.jpeg,.png"
                onChange={handleFileInput}
              />
              <Button variant="outline" className="cursor-pointer" nativeButton={false} render={<span />}>
                <ImageIcon className="mr-2 size-4" />
                Pilih File
              </Button>
            </label>
            <p className="mt-4 text-xs text-muted-foreground">
              Format: JPG, JPEG, PNG • Maks. 10MB
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="relative">
              <img
                src={preview}
                alt="Preview dokumen"
                className="w-full max-h-[400px] object-contain bg-muted/50"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-3 right-3 size-8 rounded-full shadow-lg"
                onClick={clearFile}
              >
                <X className="size-4" />
              </Button>
            </div>
            <div className="p-4 flex items-center justify-between border-t">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10">
                  <ImageIcon className="size-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium truncate max-w-[200px]">
                    {selectedFile?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedFile && (selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                onClick={handleSubmit}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md"
              >
                Proses Dokumen
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

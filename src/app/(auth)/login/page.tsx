'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const supabase = createClient();

      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast.success('Registrasi berhasil! Silakan cek email untuk verifikasi.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success('Login berhasil!');
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Terjadi kesalahan'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-2xl shadow-blue-500/10 bg-card/80 backdrop-blur-xl">
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25">
          <Shield className="size-7 text-white" />
        </div>
        <div>
          <CardTitle className="text-2xl font-bold">
            AI Insurance Claim
          </CardTitle>
          <CardDescription className="mt-1">
            {isSignUp
              ? 'Buat akun baru untuk mengajukan claim'
              : 'Masuk ke akun Anda'}
          </CardDescription>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="h-11"
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md"
          >
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            {isSignUp ? 'Daftar' : 'Masuk'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full text-sm text-muted-foreground"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp
              ? 'Sudah punya akun? Masuk'
              : 'Belum punya akun? Daftar'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

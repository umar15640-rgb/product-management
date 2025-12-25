'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { LuArrowRight } from 'react-icons/lu';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.full_name.trim()) {
      setError('Full name is required');
      setLoading(false);
      return;
    }
    if (!formData.email.includes('@')) {
      setError('Invalid email address');
      setLoading(false);
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      setError('Phone number must be at least 10 digits');
      setLoading(false);
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Signup failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.user.id);
      document.cookie = `token=${data.token}; path=/; max-age=604800`;
      
      if (data.isExistingUser) {
        const storesRes = await fetch('/api/stores', {
          headers: { 'Authorization': `Bearer ${data.token}` }
        });
        const storesData = await storesRes.json();
        
        if (storesData.stores && storesData.stores.length > 0) {
          router.push('/dashboard');
        } else {
          router.push('/setup-store');
        }
      } else {
        router.push('/setup-store');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-neutral-900">Create Account</h1>
          <p className="mt-2 text-neutral-600">Start your journey with us</p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                  {error}
                </div>
              )}
              
              <Input
                label="Full Name"
                placeholder="John Doe"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
              <Input
                label="Email"
                type="email"
                placeholder="john@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <Input
                label="Phone"
                placeholder="+1 234 567 8900"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />

              <Button type="submit" className="w-full h-11" loading={loading}>
                <span>Get Started</span>
                <LuArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <p className="text-center text-sm text-neutral-600">
          Already have an account?{' '}
          <Link href="/login" className="text-primary-600 font-semibold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}

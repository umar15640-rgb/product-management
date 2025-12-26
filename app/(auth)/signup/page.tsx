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
    phone_country_code: '+91',
    phone: '',
    password: '',
    store_name: '',
    store_address: '',
    store_phone_country_code: '+91',
    store_phone: '',
    serial_prefix: 'PRD',
    serial_suffix: '',
    whatsapp_enabled: true,
    whatsapp_number: '',
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
    const fullPhone = `${formData.phone_country_code}${formData.phone}`;
    if (!formData.phone.trim() || formData.phone.length < 10) {
      setError('Phone number must be at least 10 digits');
      setLoading(false);
      return;
    }
    
    const fullStorePhone = formData.store_phone ? `${formData.store_phone_country_code}${formData.store_phone}` : '';
    const fullWhatsappNumber = formData.whatsapp_enabled && formData.whatsapp_number 
      ? `${formData.store_phone_country_code}${formData.whatsapp_number}` 
      : (formData.whatsapp_enabled ? fullStorePhone : '');
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          phone: fullPhone,
          store_phone: fullStorePhone || undefined,
          whatsapp_number: fullWhatsappNumber || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Signup failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.user.id);
      if (data.store?.id) {
        localStorage.setItem('currentStoreId', data.store.id);
      }
      document.cookie = `token=${data.token}; path=/; max-age=604800`;
      
      router.push('/dashboard');
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
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Phone <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  <select
                    className="w-32 px-3 py-2.5 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:border-primary-500"
                    value={formData.phone_country_code}
                    onChange={(e) => setFormData({ ...formData, phone_country_code: e.target.value })}
                  >
                    <option value="+91">🇮🇳 +91 (India)</option>
                    <option value="+1">🇺🇸 +1 (USA)</option>
                    <option value="+44">🇬🇧 +44 (UK)</option>
                    <option value="+86">🇨🇳 +86 (China)</option>
                    <option value="+971">🇦🇪 +971 (UAE)</option>
                    <option value="+65">🇸🇬 +65 (Singapore)</option>
                    <option value="+61">🇦🇺 +61 (Australia)</option>
                    <option value="+33">🇫🇷 +33 (France)</option>
                    <option value="+49">🇩🇪 +49 (Germany)</option>
                    <option value="+81">🇯🇵 +81 (Japan)</option>
                  </select>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                    className="flex-1 px-4 py-2.5 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    required
                  />
                </div>
              </div>
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <div className="pt-2 border-t border-neutral-200">
                <p className="text-sm font-semibold text-neutral-700 mb-3">Store Information</p>
                <Input
                  label="Store Name"
                  placeholder="Your Store Name"
                  value={formData.store_name}
                  onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                  required
                />
                <Input
                  label="Store Address (Optional)"
                  placeholder="City, Country"
                  value={formData.store_address}
                  onChange={(e) => setFormData({ ...formData, store_address: e.target.value })}
                />
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Store Phone (Optional)</label>
                  <div className="flex gap-2">
                    <select
                      className="w-32 px-3 py-2.5 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:border-primary-500"
                      value={formData.store_phone_country_code}
                      onChange={(e) => setFormData({ ...formData, store_phone_country_code: e.target.value })}
                    >
                      <option value="+91">🇮🇳 +91 (India)</option>
                      <option value="+1">🇺🇸 +1 (USA)</option>
                      <option value="+44">🇬🇧 +44 (UK)</option>
                      <option value="+86">🇨🇳 +86 (China)</option>
                      <option value="+971">🇦🇪 +971 (UAE)</option>
                      <option value="+65">🇸🇬 +65 (Singapore)</option>
                      <option value="+61">🇦🇺 +61 (Australia)</option>
                      <option value="+33">🇫🇷 +33 (France)</option>
                      <option value="+49">🇩🇪 +49 (Germany)</option>
                      <option value="+81">🇯🇵 +81 (Japan)</option>
                    </select>
                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={formData.store_phone}
                      onChange={(e) => setFormData({ ...formData, store_phone: e.target.value.replace(/\D/g, '') })}
                      className="flex-1 px-4 py-2.5 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Serial Prefix"
                    placeholder="PRD"
                    value={formData.serial_prefix}
                    onChange={(e) => setFormData({ ...formData, serial_prefix: e.target.value.toUpperCase() })}
                    maxLength={4}
                    required
                  />
                  <Input
                    label="Serial Suffix (Optional)"
                    placeholder="2024"
                    value={formData.serial_suffix}
                    onChange={(e) => setFormData({ ...formData, serial_suffix: e.target.value.toUpperCase() })}
                    maxLength={10}
                  />
                </div>
                <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                  <input
                    type="checkbox"
                    id="whatsapp_enabled"
                    checked={formData.whatsapp_enabled}
                    onChange={(e) => setFormData({ ...formData, whatsapp_enabled: e.target.checked })}
                    className="h-4 w-4 rounded border-neutral-300 text-primary-600"
                  />
                  <label htmlFor="whatsapp_enabled" className="text-sm font-medium text-neutral-700">
                    Enable WhatsApp Integration
                  </label>
                </div>
                {formData.whatsapp_enabled && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">WhatsApp Number</label>
                    <div className="flex gap-2">
                      <select
                        className="w-32 px-3 py-2.5 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:border-primary-500"
                        value={formData.store_phone_country_code}
                        onChange={(e) => setFormData({ ...formData, store_phone_country_code: e.target.value })}
                      >
                        <option value="+91">🇮🇳 +91 (India)</option>
                        <option value="+1">🇺🇸 +1 (USA)</option>
                        <option value="+44">🇬🇧 +44 (UK)</option>
                        <option value="+86">🇨🇳 +86 (China)</option>
                        <option value="+971">🇦🇪 +971 (UAE)</option>
                        <option value="+65">🇸🇬 +65 (Singapore)</option>
                        <option value="+61">🇦🇺 +61 (Australia)</option>
                        <option value="+33">🇫🇷 +33 (France)</option>
                        <option value="+49">🇩🇪 +49 (Germany)</option>
                        <option value="+81">🇯🇵 +81 (Japan)</option>
                      </select>
                      <input
                        type="tel"
                        placeholder="9876543210"
                        value={formData.whatsapp_number}
                        onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value.replace(/\D/g, '') })}
                        className="flex-1 px-4 py-2.5 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                      />
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">Leave empty to use store phone number</p>
                  </div>
                )}
              </div>

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

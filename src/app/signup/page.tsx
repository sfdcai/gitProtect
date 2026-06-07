'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Mail, Lock, User, Github, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { github_username: githubUsername },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // Upsert profile with github username
      await supabase.from('profiles').upsert({
        id: data.user.id,
        github_username: githubUsername || null,
      });
    }

    setSuccess(true);
    setLoading(false);
  };

  const handleGithubSignup = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#0a0b14' }}>
        <div className="glass-card p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>
            <CheckCircle size={28} style={{ color: '#22c55e' }} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
          <p className="text-sm" style={{ color: '#8892b0' }}>We sent a confirmation link to <strong className="text-white">{email}</strong>. Click it to activate your account.</p>
          <Link href="/login" className="btn-primary inline-block mt-6 px-8 py-3 rounded-xl">Back to Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12" style={{ background: '#0a0b14' }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10" style={{ background: 'radial-gradient(ellipse, #4f63ff, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4f63ff, #6366f1)' }}>
              <Shield size={20} className="text-white" />
            </div>
            <span className="font-bold text-xl text-white">GitProtect</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="mt-1 text-sm" style={{ color: '#8892b0' }}>Start monitoring for free — no credit card required</p>
        </div>

        <div className="glass-card p-8">
          <button
            id="btn-github-signup"
            onClick={handleGithubSignup}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-semibold text-sm mb-6 transition-all border hover:border-gray-500"
            style={{ background: '#161928', borderColor: '#1e2235', color: '#e8eaf6' }}
          >
            <Github size={18} />
            Sign up with GitHub
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px" style={{ background: '#1e2235' }} />
            <span className="text-xs" style={{ color: '#4a5280' }}>or with email</span>
            <div className="flex-1 h-px" style={{ background: '#1e2235' }} />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg mb-4 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#8892b0' }}>GitHub Username <span className="opacity-50">(optional)</span></label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#4a5280' }} />
                <input id="input-github-username" type="text" value={githubUsername} onChange={(e) => setGithubUsername(e.target.value)} placeholder="octocat" className="input-field pl-9" />
              </div>
              <p className="mt-1 text-xs" style={{ color: '#4a5280' }}>We&apos;ll auto-scan all your public repos</p>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#8892b0' }}>Email address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#4a5280' }} />
                <input id="input-signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" className="input-field pl-9" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#8892b0' }}>Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#4a5280' }} />
                <input id="input-signup-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Min. 8 characters" minLength={8} className="input-field pl-9 pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#4a5280' }}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button id="btn-email-signup" type="submit" disabled={loading} className="btn-primary w-full py-3 rounded-xl mt-2">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-6" style={{ color: '#8892b0' }}>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold hover:text-white transition-colors" style={{ color: '#818cf8' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

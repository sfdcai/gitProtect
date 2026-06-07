'use client';

import { useState, useEffect } from 'react';
import { User, Github, Save, Bell, AlertCircle, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [githubUsername, setGithubUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(data);
      setGithubUsername(data?.github_username ?? '');
      setLoading(false);
    })();
  }, [supabase]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      github_username: githubUsername || null,
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Profile saved successfully.' });
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm mt-1" style={{ color: '#8892b0' }}>Manage your account and monitoring preferences</p>
      </div>

      {/* Profile */}
      <div className="glass-card p-6">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2"><User size={16} /> Profile</h2>

        {loading ? (
          <div className="space-y-3">
            <div className="h-10 rounded-lg shimmer" />
            <div className="h-10 rounded-lg shimmer" />
          </div>
        ) : (
          <>
            {message && (
              <div
                className="flex items-center gap-2 p-3 rounded-lg mb-4 text-sm"
                style={{
                  background: message.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                  border: `1px solid ${message.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                  color: message.type === 'success' ? '#22c55e' : '#ef4444',
                }}
              >
                {message.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                {message.text}
              </div>
            )}
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#8892b0' }}>GitHub Username</label>
                <div className="relative">
                  <Github size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#4a5280' }} />
                  <input
                    id="input-settings-github"
                    type="text"
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                    placeholder="octocat"
                    className="input-field pl-9"
                  />
                </div>
                <p className="mt-1 text-xs" style={{ color: '#4a5280' }}>
                  We'll automatically discover and monitor all your public repositories
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#8892b0' }}>Subscription Plan</label>
                <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: '#0a0b14', border: '1px solid #1e2235' }}>
                  <span className="badge badge-success">Free</span>
                  <span className="text-sm" style={{ color: '#8892b0' }}>Public repositories — unlimited scans</span>
                </div>
              </div>

              <button id="btn-save-settings" type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </>
        )}
      </div>

      {/* Notifications */}
      <div className="glass-card p-6">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2"><Bell size={16} /> Notifications</h2>
        <div className="space-y-3">
          {[
            { label: 'Email alerts on critical findings', enabled: true },
            { label: 'Weekly scan summary digest', enabled: true },
            { label: 'Slack webhook notifications', enabled: false, comingSoon: true },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between p-3 rounded-lg" style={{ background: '#0a0b14', border: '1px solid #1e2235' }}>
              <span className="text-sm text-white">{item.label}</span>
              <div className="flex items-center gap-2">
                {item.comingSoon && <span className="badge badge-pending">Soon</span>}
                <div
                  className="w-10 h-5 rounded-full relative transition-all cursor-pointer"
                  style={{ background: item.enabled && !item.comingSoon ? '#4f63ff' : '#1e2235', opacity: item.comingSoon ? 0.5 : 1 }}
                >
                  <div
                    className="w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all"
                    style={{ left: item.enabled && !item.comingSoon ? '1.375rem' : '0.125rem' }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="p-6 rounded-2xl" style={{ border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)' }}>
        <h2 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#ef4444' }}>Danger Zone</h2>
        <p className="text-sm mb-4" style={{ color: '#8892b0' }}>Permanently delete your account and all associated data.</p>
        <button
          id="btn-delete-account"
          className="text-sm px-4 py-2 rounded-lg font-semibold transition-all border"
          style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.4)', background: 'transparent' }}
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}

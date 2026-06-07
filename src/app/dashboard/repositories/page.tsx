'use client';

import { useState, useEffect } from 'react';
import { GitBranch, Plus, Trash2, ScanLine, Lock, ExternalLink, AlertCircle, RefreshCw, Crown } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { ScanTarget } from '@/lib/types';

export default function RepositoriesPage() {
  const [targets, setTargets] = useState<ScanTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [scanning, setScanning] = useState<string | null>(null);
  const [newUrl, setNewUrl] = useState('');
  const [newName, setNewName] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const supabase = createClient();

  const fetchTargets = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('scan_targets').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setTargets(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchTargets(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setError(null);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('scan_targets').insert({
      user_id: user.id,
      repo_name: newName || newUrl.split('/').slice(-2).join('/'),
      url: newUrl,
      is_private: false,
    });

    if (error) {
      setError(error.message);
    } else {
      setNewUrl('');
      setNewName('');
      fetchTargets();
    }
    setAdding(false);
  };

  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUsername) return;
    setImporting(true);
    setError(null);
    setSuccess(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const res = await fetch(`https://api.github.com/users/${githubUsername}/repos?type=public&per_page=100`);
      if (!res.ok) throw new Error('Could not fetch repositories for this username');
      
      const repos = await res.json();
      if (repos.length === 0) throw new Error('No public repositories found');

      const existingUrls = new Set(targets.map((t) => t.url.toLowerCase()));
      
      const toInsert = repos
        .filter((r: any) => !r.fork && !existingUrls.has(r.html_url.toLowerCase()))
        .map((r: any) => ({
          user_id: user.id,
          repo_name: r.full_name,
          url: r.html_url,
          is_private: false,
        }));

      if (toInsert.length === 0) {
        setSuccess('All public repositories are already being monitored!');
        setImporting(false);
        return;
      }

      const { error: dbError } = await supabase.from('scan_targets').insert(toInsert);
      if (dbError) throw dbError;

      setSuccess(`Successfully imported ${toInsert.length} repositories!`);
      setGithubUsername('');
      fetchTargets();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from('scan_targets').delete().eq('id', id);
    setTargets(targets.filter((t) => t.id !== id));
  };

  const handleScan = async (target: ScanTarget) => {
    setScanning(target.id);
    const { error } = await supabase.from('scan_jobs').insert({
      target_id: target.id,
      status: 'pending',
      progress_percentage: 0,
    });
    if (error) setError(error.message);
    setScanning(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Repositories</h1>
          <p className="text-sm mt-1" style={{ color: '#8892b0' }}>Add public repositories to monitor for secrets</p>
        </div>
        <button onClick={fetchTargets} className="p-2 rounded-lg transition-colors" style={{ color: '#4a5280' }} title="Refresh">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Add form */}
      <div className="glass-card p-6">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2"><Plus size={16} /> Add Public Repository</h2>
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg mb-4 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
          <input
            id="input-repo-url"
            type="url"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            required
            placeholder="https://github.com/username/repository"
            className="input-field flex-1"
          />
          <input
            id="input-repo-name"
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Display name (optional)"
            className="input-field w-full sm:w-48"
          />
          <button id="btn-add-repo" type="submit" disabled={adding} className="btn-primary whitespace-nowrap">
            {adding ? 'Adding...' : 'Add Repository'}
          </button>
        </form>
        
        <div className="flex items-center gap-4 my-4">
          <div className="flex-1 h-px" style={{ background: '#1e2235' }} />
          <span className="text-xs" style={{ color: '#4a5280' }}>OR</span>
          <div className="flex-1 h-px" style={{ background: '#1e2235' }} />
        </div>

        <form onSubmit={handleBulkImport} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={githubUsername}
            onChange={(e) => setGithubUsername(e.target.value)}
            required
            placeholder="GitHub Username to import all public repos"
            className="input-field flex-1"
          />
          <button type="submit" disabled={importing} className="btn-secondary whitespace-nowrap">
            {importing ? 'Importing...' : 'Sync All Public Repos'}
          </button>
        </form>
        
        {success && (
          <div className="mt-4 flex items-center gap-2 p-3 rounded-lg text-sm" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' }}>
            <AlertCircle size={14} /> {success}
          </div>
        )}
      </div>

      {/* Private repo upsell */}
      <div className="p-4 rounded-xl flex items-center gap-4" style={{ background: 'rgba(79,99,255,0.08)', border: '1px solid rgba(79,99,255,0.25)' }}>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(79,99,255,0.15)' }}>
          <Crown size={18} style={{ color: '#818cf8' }} />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-white text-sm">Want to scan private repositories?</div>
          <div className="text-xs mt-0.5" style={{ color: '#8892b0' }}>Upgrade to Pro — coming soon. Join the waitlist to be notified.</div>
        </div>
        <button className="btn-secondary text-sm flex items-center gap-1 opacity-60 cursor-not-allowed" disabled>
          <Lock size={14} /> Coming Soon
        </button>
      </div>

      {/* Repo list */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: '#1e2235' }}>
          <span className="font-semibold text-white">Monitored Repositories</span>
          <span className="text-xs" style={{ color: '#4a5280' }}>{targets.length} repos</span>
        </div>
        {loading ? (
          <div className="p-6 space-y-3">
            {[1,2,3].map((i) => <div key={i} className="h-16 rounded-xl shimmer" />)}
          </div>
        ) : targets.length === 0 ? (
          <div className="text-center py-16">
            <GitBranch size={40} className="mx-auto mb-3 opacity-20" style={{ color: '#8892b0' }} />
            <p className="text-sm" style={{ color: '#4a5280' }}>No repositories added yet</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: '#1e2235' }}>
            {targets.map((target) => (
              <div key={target.id} className="px-6 py-4 flex items-center justify-between hover:bg-white hover:bg-opacity-5 transition-colors">
                <div className="flex items-center gap-3">
                  <GitBranch size={16} style={{ color: '#4a5280' }} />
                  <div>
                    <div className="font-medium text-white text-sm">{target.repo_name}</div>
                    <a href={target.url} target="_blank" rel="noopener noreferrer" className="text-xs flex items-center gap-1 hover:text-brand-400 transition-colors" style={{ color: '#4a5280' }}>
                      {target.url} <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    id={`btn-scan-${target.id}`}
                    onClick={() => handleScan(target)}
                    disabled={scanning === target.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border"
                    style={{ background: 'rgba(79,99,255,0.1)', borderColor: 'rgba(79,99,255,0.3)', color: '#818cf8' }}
                  >
                    <ScanLine size={13} />
                    {scanning === target.id ? 'Queuing...' : 'Scan Now'}
                  </button>
                  <button
                    id={`btn-delete-${target.id}`}
                    onClick={() => handleDelete(target.id)}
                    className="p-1.5 rounded-lg transition-colors hover:text-red-400"
                    style={{ color: '#4a5280' }}
                    title="Remove repository"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { ScanLine, GitBranch, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { ScanJob, ScanTarget } from '@/lib/types';

export default function ScansPage() {
  const [jobs, setJobs] = useState<(ScanJob & { scan_targets: ScanTarget })[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('scan_jobs')
      .select('*, scan_targets!inner(repo_name, url, user_id)')
      .eq('scan_targets.user_id', user.id)
      .order('started_at', { ascending: false, nullsFirst: false });

    setJobs((data as (ScanJob & { scan_targets: ScanTarget })[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchJobs();

    // Realtime subscription for live status updates
    const channel = supabase
      .channel('scan_jobs_changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'scan_jobs' }, () => {
        fetchJobs();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchJobs, supabase]);

  const statusIcon = (status: string) => {
    if (status === 'completed') return <CheckCircle size={16} style={{ color: '#22c55e' }} />;
    if (status === 'failed') return <XCircle size={16} style={{ color: '#ef4444' }} />;
    if (['pending', 'cloning', 'scanning'].includes(status)) return <div className="w-4 h-4 rounded-full border-2 border-t-transparent border-blue-400 animate-spin" />;
    return <Clock size={16} style={{ color: '#4a5280' }} />;
  };

  const statusClass = (status: string) => {
    if (status === 'completed') return 'badge-success';
    if (status === 'failed') return 'badge-critical';
    return 'badge-pending';
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  };

  const duration = (job: ScanJob) => {
    if (!job.started_at || !job.completed_at) return '—';
    const ms = new Date(job.completed_at).getTime() - new Date(job.started_at).getTime();
    const s = Math.floor(ms / 1000);
    if (s < 60) return `${s}s`;
    return `${Math.floor(s / 60)}m ${s % 60}s`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Scan History</h1>
          <p className="text-sm mt-1" style={{ color: '#8892b0' }}>All past and ongoing scan jobs</p>
        </div>
        <button onClick={fetchJobs} className="p-2 rounded-lg transition-colors" style={{ color: '#4a5280' }} title="Refresh">
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b" style={{ borderColor: '#1e2235' }}>
          <span className="font-semibold text-white">{jobs.length} scan job{jobs.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-xl shimmer" />)}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16">
            <ScanLine size={40} className="mx-auto mb-3 opacity-20" style={{ color: '#8892b0' }} />
            <p className="text-sm" style={{ color: '#4a5280' }}>No scan jobs yet. Add a repository and click "Scan Now".</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: '#1e2235' }}>
            {jobs.map((job) => (
              <div key={job.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white hover:bg-opacity-5 transition-colors">
                <div className="flex items-center gap-3">
                  {statusIcon(job.status)}
                  <div>
                    <div className="font-medium text-white text-sm flex items-center gap-2">
                      <GitBranch size={13} style={{ color: '#4a5280' }} />
                      {job.scan_targets?.repo_name ?? 'Unknown'}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: '#4a5280' }}>
                      Started: {formatDate(job.started_at)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:gap-6">
                  {/* Progress bar for active jobs */}
                  {['pending', 'cloning', 'scanning'].includes(job.status) && (
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-1.5 rounded-full overflow-hidden" style={{ background: '#1e2235' }}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${job.progress_percentage}%`, background: 'linear-gradient(90deg, #4f63ff, #a78bfa)' }}
                        />
                      </div>
                      <span className="text-xs" style={{ color: '#8892b0' }}>{job.progress_percentage}%</span>
                    </div>
                  )}

                  <div className="text-xs text-right" style={{ color: '#4a5280' }}>
                    <div>Duration: {duration(job)}</div>
                  </div>

                  <span className={`badge ${statusClass(job.status)}`}>{job.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

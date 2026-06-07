import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Shield, GitBranch, AlertTriangle, CheckCircle, Clock, Plus, ArrowRight, ExternalLink } from 'lucide-react';
import { ScanJob, SecretFinding, ScanTarget } from '@/lib/types';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: targets }, { data: recentJobs }, { data: criticalFindings }] = await Promise.all([
    supabase.from('scan_targets').select('*').eq('user_id', user!.id),
    supabase
      .from('scan_jobs')
      .select('*, scan_targets!inner(repo_name, user_id)')
      .eq('scan_targets.user_id', user!.id)
      .order('started_at', { ascending: false })
      .limit(5),
    supabase
      .from('secret_findings')
      .select('*, scan_jobs!inner(id, scan_targets!inner(user_id, repo_name, url))')
      .eq('scan_jobs.scan_targets.user_id', user!.id)
      .eq('is_false_positive', false)
      .in('severity', ['critical', 'high'])
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  const totalRepos = targets?.length ?? 0;
  const totalFindings = criticalFindings?.length ?? 0;
  const activeJobs = recentJobs?.filter((j: ScanJob) => ['pending', 'cloning', 'scanning'].includes(j.status)).length ?? 0;
  const completedJobs = recentJobs?.filter((j: ScanJob) => j.status === 'completed').length ?? 0;

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'badge-pending',
      cloning: 'badge-pending',
      scanning: 'badge-pending',
      completed: 'badge-success',
      failed: 'badge-critical',
    };
    return map[status] ?? 'badge-medium';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: '#8892b0' }}>Overview of your monitored repositories</p>
        </div>
        <Link href="/dashboard/repositories" className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Repository
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Monitored Repos', value: totalRepos, icon: <GitBranch size={20} style={{ color: '#4f63ff' }} />, color: '#4f63ff' },
          { label: 'Active Scans', value: activeJobs, icon: <Clock size={20} style={{ color: '#f59e0b' }} />, color: '#f59e0b' },
          { label: 'Critical Findings', value: totalFindings, icon: <AlertTriangle size={20} style={{ color: '#ef4444' }} />, color: '#ef4444' },
          { label: 'Scans Completed', value: completedJobs, icon: <CheckCircle size={20} style={{ color: '#22c55e' }} />, color: '#22c55e' },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-5 hover-glow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}18`, border: `1px solid ${stat.color}30` }}>
                {stat.icon}
              </div>
            </div>
            <div className="text-3xl font-black text-white">{stat.value}</div>
            <div className="text-xs mt-1" style={{ color: '#8892b0' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Scans */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-white">Recent Scans</h2>
            <Link href="/dashboard/scans" className="text-xs flex items-center gap-1 hover:text-white transition-colors" style={{ color: '#818cf8' }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {recentJobs && recentJobs.length > 0 ? (
              recentJobs.map((job: ScanJob & { scan_targets: ScanTarget }) => (
                <div key={job.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1e2235' }}>
                  <div className="flex items-center gap-3">
                    <GitBranch size={14} style={{ color: '#4a5280' }} />
                    <span className="text-sm font-medium text-white">{job.scan_targets?.repo_name ?? 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {['pending', 'cloning', 'scanning'].includes(job.status) && (
                      <div className="w-2 h-2 rounded-full scanning-pulse" style={{ background: '#f59e0b' }} />
                    )}
                    <span className={`badge ${statusBadge(job.status)}`}>{job.status}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Shield size={32} className="mx-auto mb-2 opacity-20" style={{ color: '#8892b0' }} />
                <p className="text-sm" style={{ color: '#4a5280' }}>No scans yet. Add a repository to get started.</p>
              </div>
            )}
          </div>
        </div>

        {/* Critical Findings */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-white">Critical Findings</h2>
            <Link href="/dashboard/findings" className="text-xs flex items-center gap-1 hover:text-white transition-colors" style={{ color: '#818cf8' }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {criticalFindings && criticalFindings.length > 0 ? (
              criticalFindings.map((finding: SecretFinding) => {
                const target = (finding.scan_jobs as any)?.scan_targets;
                const fileUrl = target?.url ? `${target.url}/blob/${finding.commit_hash || 'main'}/${finding.file_path}#L${finding.line_number}` : '#';
                
                return (
                  <div key={finding.id} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1e2235' }}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`badge badge-${finding.severity}`}>{finding.severity}</span>
                          <span className="text-xs font-medium text-white">{finding.secret_type}</span>
                        </div>
                        <a 
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-mono hover:text-white transition-colors flex items-center gap-1" 
                          style={{ color: '#818cf8' }}
                        >
                          {finding.file_path}:{finding.line_number}
                          <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <CheckCircle size={32} className="mx-auto mb-2" style={{ color: '#22c55e', opacity: 0.5 }} />
                <p className="text-sm" style={{ color: '#4a5280' }}>No critical findings. Your repos look clean!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

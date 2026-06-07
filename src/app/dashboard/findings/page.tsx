'use client';

import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Search, Filter, Eye, EyeOff, CheckCircle, RefreshCw } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { SecretFinding, Severity } from '@/lib/types';

const SEVERITY_OPTIONS: Severity[] = ['critical', 'high', 'medium', 'low'];

export default function FindingsPage() {
  const [findings, setFindings] = useState<SecretFinding[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<Severity | 'all'>('all');
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const supabase = createClient();

  const fetchFindings = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let query = supabase
      .from('secret_findings')
      .select(`
        *,
        scan_jobs!inner(
          id,
          scan_targets!inner(user_id, repo_name)
        )
      `)
      .eq('scan_jobs.scan_targets.user_id', user.id)
      .eq('is_false_positive', false)
      .order('created_at', { ascending: false });

    if (severityFilter !== 'all') {
      query = query.eq('severity', severityFilter);
    }

    const { data } = await query;
    setFindings(data ?? []);
    setLoading(false);
  }, [severityFilter, supabase]);

  useEffect(() => { fetchFindings(); }, [fetchFindings]);

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const markFalsePositive = async (id: string) => {
    await supabase.from('secret_findings').update({ is_false_positive: true }).eq('id', id);
    setFindings(findings.filter((f) => f.id !== id));
  };

  const filtered = findings.filter((f) =>
    f.secret_type.toLowerCase().includes(search.toLowerCase()) ||
    f.file_path.toLowerCase().includes(search.toLowerCase())
  );

  const severityColors: Record<string, string> = {
    critical: '#ef4444',
    high: '#f59e0b',
    medium: '#818cf8',
    low: '#22c55e',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Findings</h1>
          <p className="text-sm mt-1" style={{ color: '#8892b0' }}>
            All detected secrets and credentials across your repositories
          </p>
        </div>
        <button onClick={fetchFindings} className="p-2 rounded-lg transition-colors" style={{ color: '#4a5280' }} title="Refresh">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#4a5280' }} />
          <input
            id="input-findings-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by secret type or file path..."
            className="input-field pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} style={{ color: '#4a5280' }} />
          <select
            id="select-severity-filter"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as Severity | 'all')}
            className="input-field w-auto pr-8"
            style={{ width: 'auto' }}
          >
            <option value="all">All Severities</option>
            {SEVERITY_OPTIONS.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary badges */}
      <div className="flex flex-wrap gap-2">
        {SEVERITY_OPTIONS.map((sev) => {
          const count = findings.filter((f) => f.severity === sev).length;
          return (
            <button
              key={sev}
              onClick={() => setSeverityFilter(severityFilter === sev ? 'all' : sev)}
              className={`badge badge-${sev} cursor-pointer`}
              style={{ opacity: severityFilter !== 'all' && severityFilter !== sev ? 0.4 : 1 }}
            >
              {count} {sev}
            </button>
          );
        })}
      </div>

      {/* Findings table */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b" style={{ borderColor: '#1e2235' }}>
          <span className="font-semibold text-white">{filtered.length} finding{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-20 rounded-xl shimmer" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <CheckCircle size={40} className="mx-auto mb-3" style={{ color: '#22c55e', opacity: 0.4 }} />
            <p className="text-sm" style={{ color: '#4a5280' }}>No findings match your current filters</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: '#1e2235' }}>
            {filtered.map((finding) => {
              const isRevealed = revealedIds.has(finding.id);
              const repoName = (finding.scan_jobs as any)?.scan_targets?.repo_name ?? 'Unknown Repo';
              return (
                <div key={finding.id} className="px-6 py-4 hover:bg-white hover:bg-opacity-5 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`badge badge-${finding.severity}`}>{finding.severity}</span>
                        <span className="font-semibold text-sm text-white">{finding.secret_type}</span>
                        <span className="text-xs" style={{ color: '#4a5280' }}>in {repoName}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <code className="text-xs px-2 py-0.5 rounded" style={{ background: '#0a0b14', color: '#8892b0', fontFamily: 'JetBrains Mono, monospace' }}>
                          {finding.file_path}:{finding.line_number}
                        </code>
                      </div>
                      <div className="flex items-center gap-2">
                        <code
                          className="text-xs px-3 py-1.5 rounded-lg flex-1 truncate"
                          style={{
                            background: '#0a0b14',
                            color: isRevealed ? severityColors[finding.severity] : '#4a5280',
                            fontFamily: 'JetBrains Mono, monospace',
                            border: `1px solid ${isRevealed ? severityColors[finding.severity] + '40' : '#1e2235'}`,
                          }}
                        >
                          {isRevealed ? finding.masked_secret : '•'.repeat(Math.min(finding.masked_secret.length, 32))}
                        </code>
                        <button
                          id={`btn-reveal-${finding.id}`}
                          onClick={() => toggleReveal(finding.id)}
                          className="p-1.5 rounded-lg transition-colors flex-shrink-0"
                          style={{ color: '#4a5280' }}
                          title={isRevealed ? 'Hide' : 'Reveal'}
                        >
                          {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                      {finding.commit_author && (
                        <p className="text-xs mt-1.5" style={{ color: '#4a5280' }}>
                          by {finding.commit_author}
                          {finding.commit_hash && ` · ${finding.commit_hash.slice(0, 7)}`}
                        </p>
                      )}
                    </div>
                    <button
                      id={`btn-fp-${finding.id}`}
                      onClick={() => markFalsePositive(finding.id)}
                      className="flex-shrink-0 flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-all border"
                      style={{ color: '#4a5280', borderColor: '#1e2235' }}
                      title="Mark as false positive"
                    >
                      <CheckCircle size={12} /> False Positive
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

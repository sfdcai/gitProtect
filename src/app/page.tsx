import Link from 'next/link';
import {
  Shield,
  Search,
  Bell,
  Zap,
  Lock,
  GitBranch,
  CheckCircle,
  ArrowRight,
  Github,
  Eye,
  AlertTriangle,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: '#0a0b14' }}>
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b" style={{ background: 'rgba(10,11,20,0.85)', backdropFilter: 'blur(20px)', borderColor: '#1e2235' }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4f63ff, #6366f1)' }}>
              <Shield size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg text-white">GitProtect</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm hover:text-white transition-colors" style={{ color: '#8892b0' }}>Features</a>
            <a href="#pricing" className="text-sm hover:text-white transition-colors" style={{ color: '#8892b0' }}>Pricing</a>
            <a href="https://github.com" className="text-sm hover:text-white transition-colors flex items-center gap-1" style={{ color: '#8892b0' }}><Github size={14} /> GitHub</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium px-4 py-2 rounded-lg transition-colors hover:text-white" style={{ color: '#8892b0' }}>Sign In</Link>
            <Link href="/signup" className="btn-primary text-sm">Get Started Free</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Background glow orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-20" style={{ background: 'radial-gradient(ellipse, #4f63ff, transparent 70%)', filter: 'blur(60px)' }} />
          <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full opacity-10" style={{ background: 'radial-gradient(ellipse, #a78bfa, transparent 70%)', filter: 'blur(40px)' }} />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-8 border" style={{ background: 'rgba(79,99,255,0.1)', borderColor: 'rgba(79,99,255,0.3)', color: '#818cf8' }}>
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Now scanning public repos — it&apos;s free
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight text-white">
            Protect Your Code.<br />
            <span className="gradient-text">Detect Leaked Secrets.</span>
          </h1>

          <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed" style={{ color: '#8892b0' }}>
            GitProtect scans your public GitHub repositories for accidentally committed API keys, passwords,
            and credentials — before attackers find them first.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/signup" className="btn-primary text-base px-8 py-3 flex items-center gap-2 rounded-xl">
              Start Scanning Free <ArrowRight size={16} />
            </Link>
            <Link href="/login" className="btn-secondary text-base px-8 py-3 rounded-xl flex items-center gap-2">
              <Github size={16} /> Sign in with GitHub
            </Link>
          </div>

          {/* Mock terminal */}
          <div className="mt-16 mx-auto max-w-3xl rounded-2xl overflow-hidden border text-left" style={{ background: '#10121f', borderColor: '#1e2235' }}>
            <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: '#1e2235', background: '#161928' }}>
              <div className="w-3 h-3 rounded-full bg-red-500 opacity-80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-80" />
              <div className="w-3 h-3 rounded-full bg-green-500 opacity-80" />
              <span className="ml-3 text-xs" style={{ color: '#4a5280', fontFamily: 'monospace' }}>gitprotect — scan output</span>
            </div>
            <div className="p-6 font-mono text-sm space-y-2">
              <div style={{ color: '#4a5280' }}>$ gitprotect scan octocat/Hello-World</div>
              <div style={{ color: '#22c55e' }}>✓ Cloned repository (342 commits)</div>
              <div style={{ color: '#22c55e' }}>✓ Analyzing commit history...</div>
              <div style={{ color: '#f59e0b' }}>⚠ Found 2 potential secrets:</div>
              <div className="pl-4 space-y-1">
                <div style={{ color: '#ef4444' }}>✗ [CRITICAL] AWS_ACCESS_KEY_ID — src/config.js:14</div>
                <div style={{ color: '#f59e0b' }}>! [HIGH] Generic API Key — .env.backup:3</div>
              </div>
              <div style={{ color: '#818cf8' }}>→ Report saved · Notifications sent</div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-12 border-y" style={{ borderColor: '#1e2235', background: 'rgba(16,18,31,0.5)' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { value: '10,000+', label: 'Repositories Scanned' },
              { value: '500K+', label: 'Secrets Detected' },
              { value: '99.9%', label: 'Uptime SLA' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-4xl font-black mb-1 gradient-text">{stat.value}</div>
                <div className="text-sm" style={{ color: '#8892b0' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Everything you need to stay secure</h2>
            <p className="text-lg" style={{ color: '#8892b0' }}>Enterprise-grade scanning, available to every developer for free.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <GitBranch size={24} style={{ color: '#4f63ff' }} />,
                title: 'Deep Git History Scan',
                desc: 'Scans every commit in your repository history, not just the latest state. Finds secrets that were committed and then deleted.',
              },
              {
                icon: <Bell size={24} style={{ color: '#22c55e' }} />,
                title: 'Real-Time Alerts',
                desc: 'Get instant email alerts when a new secret is detected in your monitored repositories. Never miss a leaked credential.',
              },
              {
                icon: <Zap size={24} style={{ color: '#f59e0b' }} />,
                title: 'Zero Config Setup',
                desc: 'Just enter your GitHub username. GitProtect automatically discovers and monitors all your public repositories.',
              },
              {
                icon: <Eye size={24} style={{ color: '#a78bfa' }} />,
                title: '100+ Secret Patterns',
                desc: 'Detects AWS keys, Stripe tokens, GitHub PATs, Slack webhooks, database URLs, private keys, and many more.',
              },
              {
                icon: <Search size={24} style={{ color: '#06b6d4' }} />,
                title: 'Entropy Analysis',
                desc: 'Identifies high-entropy strings that look like generated secrets, even if they do not match a known pattern.',
              },
              {
                icon: <Lock size={24} style={{ color: '#ec4899' }} />,
                title: 'Private Repo Support',
                desc: 'Coming soon — upgrade to Pro for full private repository monitoring with GitHub OAuth secure access.',
                comingSoon: true,
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="glass-card p-6 hover-glow relative overflow-hidden"
              >
                {feature.comingSoon && (
                  <div className="absolute top-4 right-4">
                    <span className="badge badge-pending">Coming Soon</span>
                  </div>
                )}
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1e2235' }}>
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#8892b0' }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Simple, transparent pricing</h2>
            <p style={{ color: '#8892b0' }}>Start for free, upgrade when you need more.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Free */}
            <div className="glass-card p-8 relative">
              <div className="mb-6">
                <div className="text-sm font-semibold mb-1" style={{ color: '#8892b0' }}>FREE</div>
                <div className="text-5xl font-black text-white">$0<span className="text-lg font-normal text-gray-500">/mo</span></div>
                <p className="mt-2 text-sm" style={{ color: '#8892b0' }}>For individual developers and open source maintainers</p>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Unlimited public repository scans',
                  'Full commit history analysis',
                  'Email alerts on findings',
                  '100+ secret pattern rules',
                  'Dashboard & reports',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm" style={{ color: '#e8eaf6' }}>
                    <CheckCircle size={16} style={{ color: '#22c55e', flexShrink: 0 }} />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="btn-primary w-full text-center block py-3 rounded-xl">Get Started Free</Link>
            </div>

            {/* Pro */}
            <div className="relative p-8 rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(79,99,255,0.15), rgba(99,102,241,0.1))', border: '1px solid rgba(79,99,255,0.4)' }}>
              <div className="absolute top-4 right-4">
                <span className="badge badge-pending">Coming Soon</span>
              </div>
              <div className="mb-6">
                <div className="text-sm font-semibold mb-1" style={{ color: '#818cf8' }}>PRO</div>
                <div className="text-3xl font-black text-white mt-4 mb-2">Coming Soon</div>
                <p className="mt-2 text-sm" style={{ color: '#8892b0' }}>For teams that need private repo protection</p>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Everything in Free',
                  'Private repository scanning',
                  'GitHub OAuth secure access',
                  'Slack & webhook notifications',
                  'CI/CD pipeline integration',
                  'Priority support',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm" style={{ color: '#e8eaf6' }}>
                    <CheckCircle size={16} style={{ color: '#818cf8', flexShrink: 0 }} />
                    {item}
                  </li>
                ))}
              </ul>
              <button disabled className="w-full py-3 rounded-xl font-semibold text-sm opacity-50 cursor-not-allowed" style={{ background: 'rgba(79,99,255,0.3)', color: '#818cf8' }}>Coming Soon</button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t py-12 px-6" style={{ borderColor: '#1e2235' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4f63ff, #6366f1)' }}>
              <Shield size={14} className="text-white" />
            </div>
            <span className="font-bold text-white">GitProtect</span>
          </div>
          <p className="text-sm" style={{ color: '#4a5280' }}>© {new Date().getFullYear()} GitProtect. Built for developers, by developers.</p>
          <div className="flex gap-6">
            <a href="#" className="text-sm hover:text-white transition-colors" style={{ color: '#4a5280' }}>Privacy</a>
            <a href="#" className="text-sm hover:text-white transition-colors" style={{ color: '#4a5280' }}>Terms</a>
            <a href="#" className="text-sm hover:text-white transition-colors" style={{ color: '#4a5280' }}>GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

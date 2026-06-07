'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Shield, LayoutDashboard, GitBranch, AlertTriangle, Settings, LogOut, ScanLine } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/lib/types';

interface DashboardNavProps {
  user: User;
  profile: Profile | null;
}

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/repositories', label: 'Repositories', icon: GitBranch },
  { href: '/dashboard/scans', label: 'Scans', icon: ScanLine },
  { href: '/dashboard/findings', label: 'Findings', icon: AlertTriangle },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function DashboardNav({ user, profile }: DashboardNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const initials = (user.email?.[0] ?? '?').toUpperCase();

  return (
    <nav className="border-b" style={{ background: 'rgba(10,11,20,0.95)', backdropFilter: 'blur(20px)', borderColor: '#1e2235', position: 'sticky', top: 0, zIndex: 50 }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4f63ff, #6366f1)' }}>
                <Shield size={14} className="text-white" />
              </div>
              <span className="font-bold text-white text-sm">GitProtect</span>
            </Link>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                    style={{
                      color: isActive ? '#818cf8' : '#8892b0',
                      background: isActive ? 'rgba(79,99,255,0.1)' : 'transparent',
                    }}
                  >
                    <Icon size={14} />
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User menu */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <div className="text-xs font-medium text-white">{profile?.github_username ?? user.email}</div>
              <div className="text-xs" style={{ color: '#4a5280' }}>Free Plan</div>
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg, #4f63ff, #6366f1)' }}>
              {initials}
            </div>
            <button
              id="btn-signout"
              onClick={handleSignOut}
              className="p-2 rounded-lg transition-colors hover:text-white"
              style={{ color: '#4a5280' }}
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

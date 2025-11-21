// src/pages/Settings.tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { useTheme } from '../hooks/useTheme';
import {
  User,
  Bell,
  Shield,
  Palette,
  CreditCard,
  LogOut,
  Sun,
  Moon,
  Monitor,
  Check,
  Mail,
  AtSign,
  KeyRound,
} from 'lucide-react';

const navItems = [
  { name: 'Account', icon: User },
  { name: 'Notifications', icon: Bell },
  { name: 'Privacy & Safety', icon: Shield },
  { name: 'Appearance', icon: Palette },
  { name: 'Billing', icon: CreditCard },
];

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('Account');

  const { data: user } = useQuery({
    queryKey: ['/auth/user-info'],
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-6 lg:px-8 lg:py-12">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 lg:mb-8">Settings</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* RESPONSIVE NAVIGATION 
              - Mobile: Horizontal Scroll 
              - Desktop: Vertical Sidebar 
          */}
          <div className="lg:col-span-3">
            <nav className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 lg:border-0 rounded-2xl p-2 lg:p-3 sticky top-20 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible no-scrollbar z-10">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.name)}
                  className={`flex-shrink-0 lg:w-full flex items-center gap-3 px-4 lg:px-5 py-2.5 lg:py-3.5 rounded-xl font-medium transition-all whitespace-nowrap text-sm lg:text-base ${
                    activeTab === item.name
                      ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20'
                      : 'text-gray-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <item.icon className="w-4 h-4 lg:w-5 lg:h-5" />
                  {item.name}
                </button>
              ))}

              <div className="w-px h-6 bg-slate-800 lg:w-full lg:h-px lg:my-2 mx-2 lg:mx-0 flex-shrink-0" />

              <button
                onClick={async () => {
                  await fetch('/auth/logout', { method: 'POST' });
                  localStorage.removeItem('token');
                  window.location.href = '/login';
                }}
                className="flex-shrink-0 lg:w-full flex items-center gap-3 px-4 lg:px-5 py-2.5 lg:py-3.5 rounded-xl text-red-500 hover:bg-red-500/10 transition text-sm lg:text-base whitespace-nowrap"
              >
                <LogOut className="w-4 h-4 lg:w-5 lg:h-5" />
                Log Out
              </button>
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9">
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-5 sm:p-8 lg:p-10 min-h-[500px]">
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeTab === 'Account' && <AccountTab user={user} />}
                {activeTab === 'Notifications' && <ComingSoonTab title="Notifications" icon={Bell} />}
                {activeTab === 'Privacy & Safety' && <ComingSoonTab title="Privacy & Safety" icon={Shield} />}
                {activeTab === 'Appearance' && <AppearanceTab theme={theme} setTheme={setTheme} />}
                {activeTab === 'Billing' && <ComingSoonTab title="Billing" icon={CreditCard} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Account Tab ─────────────────────────────────────────────────────
function AccountTab({ user }: { user: any }) {
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const submitPassword = async () => {
    if (newPass !== confirmPass) return alert('Passwords do not match');
    if (newPass.length < 8) return alert('Password must be at least 8 characters');

    setIsLoading(true);
    try {
        const res = await fetch('/update/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword: oldPass, newPassword: newPass }),
        });

        if (res.ok) {
        alert('Password changed successfully ✓');
        setOldPass('');
        setNewPass('');
        setConfirmPass('');
        } else {
        alert('Failed to change password');
        }
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-white">Account Settings</h2>
        <span className="px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 text-xs font-medium border border-teal-500/20">
            Verified
        </span>
      </div>

      <div className="grid gap-6 p-6 bg-slate-950/50 rounded-xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
            <Mail className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Email Address</p>
            <p className="text-base sm:text-lg font-medium text-white">{user?.email || '—'}</p>
          </div>
        </div>

        <div className="h-px bg-slate-800 w-full" />

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
            <AtSign className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Username</p>
            <p className="text-base sm:text-lg font-medium text-white">@{user?.username || '—'}</p>
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <KeyRound className="w-5 h-5 text-teal-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Change Password</h3>
        </div>

        <div className="space-y-4 max-w-md">
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Current Password</label>
            <input
                type="password"
                value={oldPass}
                onChange={(e) => setOldPass(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition text-sm"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label className="text-sm text-gray-400 mb-1.5 block">New Password</label>
                <input
                    type="password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition text-sm"
                />
            </div>
            <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Confirm Password</label>
                <input
                    type="password"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition text-sm"
                />
            </div>
          </div>

          <button
            onClick={submitPassword}
            disabled={isLoading}
            className="w-full bg-teal-600 hover:bg-teal-500 text-white font-medium py-3.5 rounded-xl transition mt-4 shadow-lg shadow-teal-900/20 flex items-center justify-center"
          >
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Coming Soon ───────────────────────────────────────────────────────
function ComingSoonTab({ title, icon: Icon }: { title: string, icon: any }) {
  return (
    <div className="h-full flex flex-col items-center justify-center py-20 text-center">
      <div className="bg-slate-800/50 border border-dashed border-slate-700 rounded-3xl w-24 h-24 flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-gray-600" />
      </div>
      <h3 className="text-2xl font-semibold mb-2 text-white">{title}</h3>
      <p className="text-gray-500 max-w-xs mx-auto">
        This section is currently under development. Check back in future updates!
      </p>
    </div>
  );
}

// ── Appearance ────────────────────────────────────────────────────────
function AppearanceTab({ theme, setTheme }: { theme: 'light' | 'dark' | 'system'; setTheme: (t: 'light' | 'dark' | 'system') => void }) {
  const themes = [
    { value: 'light' as const, icon: Sun, label: 'Light Mode' },
    { value: 'dark' as const, icon: Moon, label: 'Dark Mode' },
    { value: 'system' as const, icon: Monitor, label: 'System Default' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Appearance</h2>
        <p className="text-gray-400">Customize how TradePro looks on your device.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {themes.map(({ value, icon: Icon, label }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={`relative group p-6 rounded-2xl border-2 text-left transition-all duration-200 ${
              theme === value
                ? 'border-teal-500 bg-teal-900/10'
                : 'border-slate-800 hover:border-slate-700 bg-slate-950/50'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${
                theme === value ? 'bg-teal-500 text-white' : 'bg-slate-800 text-gray-400 group-hover:text-white'
            }`}>
                <Icon className="w-5 h-5" />
            </div>
            
            <p className={`font-medium ${theme === value ? 'text-white' : 'text-gray-300'}`}>{label}</p>
            
            {theme === value && (
              <div className="absolute top-4 right-4 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
                <Check className="w-3.5 h-3.5 text-white" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
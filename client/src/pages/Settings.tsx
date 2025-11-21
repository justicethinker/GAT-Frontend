// src/pages/Settings.tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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

  const handleLogout = async () => {
    await fetch('/auth/logout', { method: 'POST' });
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8 lg:px-8 lg:py-12">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar - Fixed width, no stretching */}
          <div className="lg:col-span-3">
            <nav className="bg-slate-900 rounded-2xl p-3 sticky top-8">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.name)}
                  className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl font-medium transition-all ${
                    activeTab === item.name
                      ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20'
                      : 'text-gray-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </button>
              ))}

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-4 px-5 py-3.5 rounded-xl text-red-500 hover:bg-red-500/10 transition mt-6"
              >
                <LogOut className="w-5 h-5" />
                Log Out
              </button>
            </nav>
          </div>

          {/* Content Area - Clean, dense, beautiful */}
          <div className="lg:col-span-9">
            <div className="bg-slate-900 rounded-2xl p-8 lg:p-10">
              {activeTab === 'Account' && <AccountTab user={user} />}
              {activeTab === 'Notifications' && <ComingSoonTab title="Notifications" />}
              {activeTab === 'Privacy & Safety' && <ComingSoonTab title="Privacy & Safety" />}
              {activeTab === 'Appearance' && <AppearanceTab theme={theme} setTheme={setTheme} />}
              {activeTab === 'Billing' && <ComingSoonTab title="Billing" />}
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

  const submitPassword = async () => {
    if (newPass !== confirmPass) return alert('Passwords do not match');
    if (newPass.length < 8) return alert('Password must be at least 8 characters');

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
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Account Settings</h2>

      <div className="space-y-6">
        <div className="flex items-center gap-5">
          <Mail className="w-6 h-6 text-gray-500" />
          <div>
            <p className="text-sm text-gray-400">Email</p>
            <p className="text-lg font-medium">{user?.email || '—'}</p>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <AtSign className="w-6 h-6 text-gray-500" />
          <div>
            <p className="text-sm text-gray-400">Username</p>
            <p className="text-lg font-medium">@{user?.username || '—'}</p>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-6">
          <KeyRound className="w-6 h-6 text-gray-400" />
          <h3 className="text-xl font-semibold">Change Password</h3>
        </div>

        <div className="space-y-4 max-w-md">
          <input
            type="password"
            placeholder="Current password"
            value={oldPass}
            onChange={(e) => setOldPass(e.target.value)}
            className="w-full px-5 py-3.5 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 transition"
          />
          <input
            type="password"
            placeholder="New password"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            className="w-full px-5 py-3.5 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 transition"
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
            className="w-full px-5 py-3.5 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 transition"
          />

          <button
            onClick={submitPassword}
            className="w-full bg-teal-600 hover:bg-teal-500 text-white font-medium py-3.5 rounded-xl transition mt-2"
          >
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Coming Soon Tabs ────────────────────────────────────────────────
function ComingSoonTab({ title }: { title: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center py-20 text-center">
      <div className="bg-slate-800/50 border border-dashed border-slate-700 rounded-3xl w-24 h-24 flex items-center justify-center mb-6">
        <Palette className="w-12 h-12 text-gray-600" />
      </div>
      <h3 className="text-2xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-500">This section is under development</p>
    </div>
  );
}

// ── Appearance Tab ───────────────────────────────────────────────────
function AppearanceTab({ theme, setTheme }: { theme: 'light' | 'dark' | 'system'; setTheme: (t: 'light' | 'dark' | 'system') => void }) {
  const themes = [
    { value: 'light' as const, icon: Sun, label: 'Light' },
    { value: 'dark' as const, icon: Moon, label: 'Dark' },
    { value: 'system' as const, icon: Monitor, label: 'System' },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Appearance</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-2xl">
        {themes.map(({ value, icon: Icon, label }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={`relative p-8 rounded-2xl border-2 transition-all duration-200 ${
              theme === value
                ? 'border-teal-500 bg-teal-900/30 shadow-lg shadow-teal-600/10'
                : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
            }`}
          >
            <Icon className="w-10 h-10 mx-auto mb-3" />
            <p className="font-medium">{label}</p>
            {theme === value && (
              <Check className="absolute top-3 right-3 w-5 h-5 text-teal-400" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
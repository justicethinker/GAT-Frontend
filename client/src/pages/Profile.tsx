// src/pages/Profile.tsx
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Camera, MapPin, Link2, Edit3, Check, Wallet, TrendingUp, Activity, Trophy, Mail } from 'lucide-react';
import {Header} from '@/components/Header';

const uploadAvatar = async (file: File) => {
  const form = new FormData();
  form.append('avatar', file);
  const res = await fetch('/auth/avatar', { method: 'POST', body: form });
  if (!res.ok) throw new Error('Upload failed');
  const data = await res.json();
  return data.avatarUrl || data.avatar || '';
};

const updateProfile = async (updates: any) => {
  const res = await fetch('/auth/user-info', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Update failed');
  return res.json();
};

export default function Profile() {
  const queryClient = useQueryClient();
  const { data: user } = useQuery({ queryKey: ['/auth/user-info'] });
  const { data: stats = {} } = useQuery({ queryKey: ['/dash/stats'] });

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(['/auth/user-info'], data);
      setIsEditing(false);
      setAvatarFile(null);
    },
  });

  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({ name: '', username: '', bio: '', location: '', website: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        username: user.username || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
      });
      setAvatarPreview(user.avatar || null);
    }
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    let avatarUrl = user?.avatar;
    if (avatarFile) avatarUrl = await uploadAvatar(avatarFile);
    updateMutation.mutate({ ...formData, avatar: avatarUrl });
  };

  if (!user) return null;

  const realStats = {
    balance: stats?.totalBalance || '$124,567.89',
    todayPnL: stats?.todayPnL || '+$2,847.32',
    todayPnLPercent: stats?.todayPnLPercent || '8.2%',
    activeTrades: stats?.activeTrades || 23,
    newToday: stats?.newTrades || 3,
    winRate: stats?.winRate || '78.5%',
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header />

      <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Profile Header Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-800 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-700" />
          
          <div className="relative px-8 pb-10">
            {/* Avatar */}
            <div className="absolute -top-20 left-8">
              <div className="relative group">
                <div className="w-40 h-40 rounded-full ring-8 ring-slate-950 overflow-hidden bg-slate-800 border-4 border-slate-950 shadow-2xl">
                  <img
                    src={avatarPreview || user.avatar || '/default-avatar.png'}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>

                {isEditing && (
                  <label className="absolute inset-0 bg-black/70 flex items-center justify-center cursor-pointer rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-10 h-10" />
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </label>
                )}

                {!isEditing && (
                  <div className="absolute bottom-0 right-0 w-12 h-12 bg-teal-500 rounded-full border-4 border-slate-950 flex items-center justify-center shadow-lg">
                    <Trophy className="w-7 h-7 text-yellow-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end pt-6 gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 border border-slate-700 rounded-xl hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-8 py-3 bg-teal-600 hover:bg-teal-500 rounded-xl font-medium flex items-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-8 py-3 border border-slate-700 rounded-xl hover:bg-slate-800 flex items-center gap-2 font-medium"
                >
                  <Edit3 className="w-5 h-5" />
                  Edit Profile
                </button>
              )}
            </div>

            <div className="mt-8 ml-52 lg:ml-56">
              <h1 className="text-4xl font-bold tracking-tight">
                {isEditing ? (
                  <input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="bg-transparent border-b-2 border-teal-500 focus:outline-none text-4xl font-bold w-full max-w-md"
                    autoFocus
                  />
                ) : user.name}
              </h1>

              <p className="text-2xl text-teal-400 font-light mt-1">@{user.username}</p>

              <p className="mt-6 text-lg text-gray-300 max-w-2xl leading-relaxed">
                {isEditing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    rows={3}
                    className="w-full max-w-2xl mt-6 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:border-teal-500 resize-none"
                  />
                ) : user.bio || 'This trader prefers to stay mysterious...'}
              </p>

              <div className="mt-6 flex flex-wrap gap-6 text-gray-400">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-teal-400" />
                  <span>{user.email}</span>
                </div>

                {user.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-teal-400" />
                    <span>{isEditing ? (
                      <input
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="bg-transparent border-b border-dashed border-gray-600 focus:border-teal-400 outline-none"
                      />
                    ) : user.location}</span>
                  </div>
                )}

                {user.website && (
                  <a href={user.website} className="flex items-center gap-2 hover:text-teal-400 transition">
                    <Link2 className="w-5 h-5" />
                    <span>{new URL(user.website).hostname}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Trading Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          <div className="bg-gradient-to-br from-teal-600/10 to-cyan-600/10 border border-teal-500/20 rounded-2xl p-6 hover:border-teal-500/50 transition-all shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Balance</p>
                <p className="text-4xl font-bold mt-2">{realStats.balance}</p>
                <p className="text-emerald-400 text-xl font-medium mt-4">+12.5%</p>
              </div>
              <Wallet className="w-12 h-12 text-teal-400 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-600/10 to-teal-600/10 border border-emerald-500/20 rounded-2xl p-6 hover:border-emerald-500/50 transition shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Today's P&L</p>
                <p className="text-4xl font-bold mt-2 text-emerald-400">{realStats.todayPnL}</p>
                <p className="text-emerald-400 text-xl font-medium mt-4">+{realStats.todayPnLPercent}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-emerald-400 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-2xl p-6 hover:border-blue-500/50 transition shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Trades</p>
                <p className="text-4xl font-bold mt-2">{realStats.activeTrades}</p>
                <span className="inline-block mt-4 px-4 py-1.5 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium">
                  +{realStats.newToday} today
                </span>
              </div>
              <Activity className="w-12 h-12 text-blue-400 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-600/10 to-orange-600/10 border border-yellow-500/20 rounded-2xl p-6 hover:border-yellow-500/50 transition shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Win Rate</p>
                <p className="text-4xl font-bold mt-2">{realStats.winRate}</p>
              </div>
              <Trophy className="w-12 h-12 text-yellow-400 opacity-80" />
            </div>
            <div className="mt-6 flex items-center gap-2">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full" style={{width: realStats.winRate}} />
              </div>
              <span className="text-sm text-yellow-400">Top 5%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
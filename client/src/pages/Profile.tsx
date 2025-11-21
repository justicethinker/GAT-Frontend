// src/pages/Profile.tsx
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Camera, MapPin, Link2, Edit3, Check, Wallet, TrendingUp, Activity, Trophy, Mail } from 'lucide-react';
import { Header } from '@/components/Header';

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

  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', username: '', bio: '', location: '', website: '' });

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(['/auth/user-info'], data);
      setIsEditing(false);
      setAvatarFile(null);
    },
  });

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

      <div className="w-full max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        
        {/* Profile Header Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-800 overflow-hidden mb-12">
          
          {/* Banner */}
          <div className="h-32 sm:h-48 bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-700" />
          
          <div className="relative px-4 pb-10 sm:px-8">
            
            {/* Avatar - Centered on Mobile, Left on Desktop */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 sm:-top-20 sm:left-8 sm:translate-x-0 z-10">
              <div className="relative group">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full ring-8 ring-slate-950 overflow-hidden bg-slate-800 border-4 border-slate-950 shadow-2xl">
                  <img
                    src={avatarPreview || user.avatar || '/default-avatar.png'}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>

                {isEditing && (
                  <label className="absolute inset-0 bg-black/70 flex items-center justify-center cursor-pointer rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <Camera className="w-8 h-8 sm:w-10 sm:h-10" />
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </label>
                )}

                {!isEditing && (
                  <div className="absolute bottom-0 right-0 w-10 h-10 sm:w-12 sm:h-12 bg-teal-500 rounded-full border-4 border-slate-950 flex items-center justify-center shadow-lg">
                    <Trophy className="w-5 h-5 sm:w-7 sm:h-7 text-yellow-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons - Pushed down on mobile to clear avatar */}
            <div className="flex justify-center sm:justify-end pt-20 sm:pt-6 gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base border border-slate-700 rounded-xl hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                    className="px-6 py-2 sm:px-8 sm:py-3 text-sm sm:text-base bg-teal-600 hover:bg-teal-500 rounded-xl font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                    {updateMutation.isPending ? 'Saving...' : 'Save'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2 sm:px-8 sm:py-3 text-sm sm:text-base border border-slate-700 rounded-xl hover:bg-slate-800 flex items-center gap-2 font-medium transition-colors"
                >
                  <Edit3 className="w-4 h-4 sm:w-5 sm:h-5" />
                  Edit Profile
                </button>
              )}
            </div>

            {/* Profile Info */}
            <div className="mt-6 sm:mt-8 sm:ml-52 lg:ml-56 text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                {isEditing ? (
                  <input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="bg-transparent border-b-2 border-teal-500 focus:outline-none text-center sm:text-left w-full max-w-[300px] sm:max-w-md"
                    autoFocus
                    placeholder="Your Name"
                  />
                ) : (
                  user.name || 'User'
                )}
              </h1>

              <p className="text-xl sm:text-2xl text-teal-400 font-light mt-1">@{user.username || 'username'}</p>

              <div className="mt-6 text-base sm:text-lg text-gray-300 max-w-2xl leading-relaxed mx-auto sm:mx-0">
                {isEditing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    rows={3}
                    placeholder="Tell us about yourself..."
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:border-teal-500 resize-none outline-none"
                  />
                ) : (
                  <p>{user.bio || 'This trader prefers to stay mysterious...'}</p>
                )}
              </div>

              <div className="mt-6 flex flex-wrap justify-center sm:justify-start gap-4 sm:gap-6 text-gray-400 text-sm sm:text-base">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />
                  <span className="truncate max-w-[200px]">{user.email}</span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />
                  <span>
                    {isEditing ? (
                      <input
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="bg-transparent border-b border-dashed border-gray-600 focus:border-teal-400 outline-none w-32"
                        placeholder="Location"
                      />
                    ) : (
                      user.location || 'Unknown'
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                    <Link2 className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />
                    {isEditing ? (
                         <input
                         value={formData.website}
                         onChange={(e) => setFormData({...formData, website: e.target.value})}
                         className="bg-transparent border-b border-dashed border-gray-600 focus:border-teal-400 outline-none w-48"
                         placeholder="https://example.com"
                       />
                    ) : (
                        user.website ? (
                            <a href={user.website} target="_blank" rel="noopener noreferrer" className="hover:text-teal-400 transition truncate max-w-[200px]">
                                {user.website.replace(/^https?:\/\//, '')}
                            </a>
                        ) : 'No website'
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trading Stats Grid - Single column on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          <div className="bg-gradient-to-br from-teal-600/10 to-cyan-600/10 border border-teal-500/20 rounded-2xl p-5 sm:p-6 hover:border-teal-500/50 transition-all shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs sm:text-sm">Total Balance</p>
                <p className="text-2xl sm:text-4xl font-bold mt-1 sm:mt-2">{realStats.balance}</p>
                <p className="text-emerald-400 text-base sm:text-xl font-medium mt-2 sm:mt-4">+12.5%</p>
              </div>
              <Wallet className="w-10 h-10 sm:w-12 sm:h-12 text-teal-400 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-600/10 to-teal-600/10 border border-emerald-500/20 rounded-2xl p-5 sm:p-6 hover:border-emerald-500/50 transition shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs sm:text-sm">Today's P&L</p>
                <p className="text-2xl sm:text-4xl font-bold mt-1 sm:mt-2 text-emerald-400">{realStats.todayPnL}</p>
                <p className="text-emerald-400 text-base sm:text-xl font-medium mt-2 sm:mt-4">+{realStats.todayPnLPercent}</p>
              </div>
              <TrendingUp className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-400 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-2xl p-5 sm:p-6 hover:border-blue-500/50 transition shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs sm:text-sm">Active Trades</p>
                <p className="text-2xl sm:text-4xl font-bold mt-1 sm:mt-2">{realStats.activeTrades}</p>
                <span className="inline-block mt-2 sm:mt-4 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs sm:text-sm font-medium">
                  +{realStats.newToday} today
                </span>
              </div>
              <Activity className="w-10 h-10 sm:w-12 sm:h-12 text-blue-400 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-600/10 to-orange-600/10 border border-yellow-500/20 rounded-2xl p-5 sm:p-6 hover:border-yellow-500/50 transition shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs sm:text-sm">Win Rate</p>
                <p className="text-2xl sm:text-4xl font-bold mt-1 sm:mt-2">{realStats.winRate}</p>
              </div>
              <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-400 opacity-80" />
            </div>
            <div className="mt-4 sm:mt-6 flex items-center gap-2">
              <div className="w-full bg-gray-700 rounded-full h-1.5 sm:h-2">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-1.5 sm:h-2 rounded-full" style={{width: realStats.winRate}} />
              </div>
              <span className="text-xs sm:text-sm text-yellow-400 whitespace-nowrap">Top 5%</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
// src/pages/Profile.tsx
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Camera, MapPin, Link2, Edit3, Check, Wallet, TrendingUp, Activity, Trophy } from 'lucide-react';

interface User {
  name: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
}

const uploadAvatar = async (file: File): Promise<string> => {
  const form = new FormData();
  form.append('avatar', file);
  const res = await fetch('/auth/avatar', { method: 'POST', body: form });
  if (!res.ok) throw new Error('Upload failed');
  const data = await res.json();
  return data.avatarUrl || data.avatar;
};

const updateProfile = async (updates: Partial<User> & { avatar?: string }) => {
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
  const { data: user, isLoading } = useQuery({ queryKey: ['/auth/user-info'] });

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

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    bio: '',
    location: '',
    website: '',
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Header Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-800 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-700" />
          
          <div className="relative px-8 pb-10">
            {/* Avatar */}
            <div className="absolute -top-20 left-8">
              <div className="relative group">
                <div className="w-40 h-40 rounded-full ring-8 ring-slate-950 overflow-hidden bg-slate-800">
                  <img
                    src={avatarPreview || user.avatar || '/default-avatar.png'}
                    alt="Profile"
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
                  <div className="absolute bottom-0 right-0 w-12 h-12 bg-teal-500 rounded-full border-4 border-slate-950 flex items-center justify-center">
                    <Trophy className="w-7 h-7" />
                  </div>
                )}
              </div>
            </div>

            {/* Top Right Buttons */}
            <div className="flex justify-end pt-6 gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setAvatarFile(null);
                      setAvatarPreview(user.avatar || null);
                      setFormData({
                        name: user.name || '',
                        username: user.username || '',
                        bio: user.bio || '',
                        location: user.location || '',
                        website: user.website || '',
                      });
                    }}
                    className="px-6 py-3 border border-slate-700 rounded-xl hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                    className="px-8 py-3 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 rounded-xl font-medium flex items-center gap-2 transition"
                  >
                    <Check className="w-5 h-5" />
                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-8 py-3 border border-slate-700 rounded-xl hover:bg-slate-800 flex items-center gap-3 font-medium transition"
                >
                  <Edit3 className="w-5 h-5" />
                  Edit Profile
                </button>
              )}
            </div>

            {/* User Info */}
            <div className="mt-8 ml-52 lg:ml-56">
              <h1 className="text-4xl font-bold tracking-tight">
                {isEditing ? (
                  <input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-transparent border-b-2 border-teal-500 focus:outline-none text-4xl font-bold w-full max-w-md"
                    autoFocus
                  />
                ) : (
                  user.name
                )}
              </h1>

              <p className="text-2xl text-teal-400 font-light mt-1">@{isEditing ? formData.username : user.username}</p>

              {isEditing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                  className="w-full max-w-2xl mt-6 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 resize-none"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="mt-6 text-lg text-gray-300 max-w-2xl leading-relaxed">
                  {user.bio || 'This trader prefers to stay mysterious...'}
                </p>
              )}

              <div className="flex flex-wrap gap-6 mt-6 text-gray-400">
                {user.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-teal-400" />
                    <span>{isEditing ? (
                      <input
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="bg-transparent border-b border-dashed border-gray-600 focus:border-teal-400 outline-none"
                      />
                    ) : user.location}</span>
                  </div>
                )}
                {user.website && (
                  <a href={user.website} target="_blank" className="flex items-center gap-2 hover:text-teal-400 transition">
                    <Link2 className="w-5 h-5" />
                    <span>{isEditing ? (
                      <input
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        className="bg-transparent border-b border-dashed border-gray-600 focus:border-teal-400 outline-none"
                      />
                    ) : new URL(user.website).hostname}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Trading Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
          <div className="bg-gradient-to-br from-teal-600/10 to-cyan-600/10 backdrop-blur-md border border-teal-500/20 rounded-2xl p-6 hover:border-teal-500/50 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Balance</p>
                <p className="text-3xl font-bold mt-2">$124,567.89</p>
              </div>
              <Wallet className="w-12 h-12 text-teal-400 opacity-80" />
            </div>
            <p className="text-emerald-400 text-lg font-medium mt-4">+12.5%</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-600/10 to-teal-600/10 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-6 hover:border-emerald-500/50 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Today's P&L</p>
                <p className="text-3xl font-bold mt-2">+$2,847.32</p>
              </div>
              <TrendingUp className="w-12 h-12 text-emerald-400 opacity-80" />
            </div>
            <p className="text-emerald-400 text-lg font-medium mt-4">+8.2%</p>
          </div>

          <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 backdrop-blur-md border border-blue-500/20 rounded-2xl p-6 hover:border-blue-500/50 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Trades</p>
                <p className="text-3xl font-bold mt-2">23</p>
              </div>
              <Activity className="w-12 h-12 text-blue-400 opacity-80" />
            </div>
            <span className="inline-block mt-4 px-4 py-1.5 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium">+3 today</span>
          </div>

          <div className="bg-gradient-to-br from-yellow-600/10 to-orange-600/10 backdrop-blur-md border border-yellow-500/20 rounded-2xl p-6 hover:border-yellow-500/50 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Win Rate</p>
                <p className="text-3xl font-bold mt-2">78.5%</p>
              </div>
              <Trophy className="w-12 h-12 text-yellow-400 opacity-80" />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full w-[78.5%]" />
              </div>
              <span className="text-sm text-yellow-400">Top 5%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
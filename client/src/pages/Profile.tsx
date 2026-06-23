import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Camera, MapPin, Link2, Edit3, Check, X, 
  Wallet, TrendingUp, Activity, Trophy, Mail, Loader2 
} from 'lucide-react';
import { Header } from '@/components/Header';
import { buildUrl } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";

// --- TYPES ---
interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  bio: string;
  location: string;
  website: string;
  avatar: string;
  // Trading stats from backend
  balance_arb?: number;
  balance_forex?: number;
  balance_fut?: number;
  total_pl?: number;
  win_rate?: number;
  active_trades?: number;
}

// --- SCHEMA ---
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  location: z.string().optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  bio: z.string().max(160, "Bio must be less than 160 characters").optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// --- FETCHERS ---
const authenticatedFetcher = async <T,>(context: { queryKey: readonly unknown[] }): Promise<T> => {
  const [path] = context.queryKey as string[];
  const token = sessionStorage.getItem("token");
  const res = await fetch(buildUrl(path), {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
  });
  if (!res.ok) throw new Error("Failed to fetch data");
  return res.json() as T;
};

// --- COMPONENTS ---

const StatCard = ({ label, value, subValue, icon: Icon, colorClass }: any) => (
  <div className={cn(
    "relative overflow-hidden rounded-xl p-6 border transition-all duration-300 shadow-md hover:shadow-lg group bg-card border-border hover:border-primary/45",
    colorClass
  )}>
    <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary/5 -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-300 pointer-events-none" />
    <div className="flex justify-between items-start z-10 relative">
      <div>
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider font-grotesk">{label}</p>
        <h3 className="text-3xl font-bold text-white mt-2 font-grotesk leading-none">{value}</h3>
        {subValue && <div className="mt-2 font-sans">{subValue}</div>}
      </div>
      <div className="p-3 bg-primary/10 rounded-xl border border-primary/20 group-hover:scale-110 transition-transform text-primary">
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </div>
);

const ProfileSkeleton = () => (
  <div className="w-full max-w-6xl mx-auto px-4 py-8 animate-pulse">
    <div className="h-48 bg-secondary/40 rounded-t-3xl w-full mb-20 relative">
        <div className="absolute -bottom-16 left-8 w-32 h-32 bg-secondary/60 rounded-full border-4 border-background"></div>
    </div>
    <div className="space-y-4 max-w-lg mx-auto text-center mt-20">
      <div className="h-8 w-48 bg-secondary/50 rounded mx-auto" />
      <div className="h-4 w-32 bg-secondary/40 rounded mx-auto" />
    </div>
  </div>
);

export default function Profile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const { data: user, isLoading: isUserLoading } = useQuery<UserProfile>({
    queryKey: ['/auth/user-info'],
    queryFn: authenticatedFetcher,
  });

  // Calculate stats from user data
  const stats = user ? {
    totalBalance: `$${((user.balance_arb || 0) + (user.balance_forex || 0) + (user.balance_fut || 0)).toLocaleString()}`,
    todayPnL: user.total_pl ? (user.total_pl >= 0 ? `+$${user.total_pl.toFixed(2)}` : `-$${Math.abs(user.total_pl).toFixed(2)}`) : '$0.00',
    todayPnLPercent: '0%', // This might need to be calculated differently
    activeTrades: user.active_trades || 0,
    newTrades: 0, // This might not be available
    winRate: user.win_rate ? `${(user.win_rate * 100).toFixed(0)}%` : '0%',
    winRateValue: user.win_rate ? user.win_rate * 100 : 0
  } : null;

  // 2. Form Setup
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '', bio: '', location: '', website: '' }
  });

  // 3. Sync Form
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
      });
    }
  }, [user, reset]);

  // 4. Mutations
  const mutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      const token = sessionStorage.getItem("token");
      
      // 1. Upload Avatar if changed
      let avatarUrl = user?.avatar;
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        const uploadRes = await fetch(buildUrl('/auth/avatar'), { 
            method: 'POST', 
            headers: { Authorization: `Bearer ${token}` },
            body: formData 
        });
        if (uploadRes.ok) {
            const data = await uploadRes.json();
            avatarUrl = data.avatarUrl;
        }
      }

      // 2. Update Profile Data
      const res = await fetch(buildUrl('/auth/user-info'), {
        method: 'PATCH',
        headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ...values, avatar: avatarUrl }),
      });
      
      if (!res.ok) throw new Error('Failed to update profile');
      return res.json();
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['/auth/user-info'], updatedUser);
      setIsEditing(false);
      setAvatarFile(null);
      toast({ title: "Success", description: "Profile updated successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
    }
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const onCancel = () => {
    setIsEditing(false);
    setAvatarFile(null);
    setAvatarPreview(null);
    reset();
  };

  if (isUserLoading) return <div className="min-h-screen bg-background"><Header /><ProfileSkeleton /></div>;
  if (!user) return <div className="min-h-screen bg-background flex items-center justify-center text-red-400">Error loading profile.</div>;

  const displayStats = stats || {
    totalBalance: '$0.00', todayPnL: '$0.00', todayPnLPercent: '0%', 
    activeTrades: 0, newTrades: 0, winRate: '0%', winRateValue: 0
  };

  return (
    <div className="min-h-screen bg-background text-white font-sans selection:bg-primary/30">
      <Header />

      <div className="w-full max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        
        {/* Profile Card */}
        <div className="relative bg-card border border-border rounded-xl overflow-hidden shadow-2xl mb-12 group/card">
          
          {/* Banner */}
          <div className="h-40 sm:h-52 w-full bg-gradient-to-r from-primary/20 via-card to-primary/5 relative overflow-hidden">
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />
             <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent pointer-events-none" />
          </div>

          <div className="px-6 pb-8 sm:px-10">
            <div className="flex flex-col sm:flex-row items-start">
              
              {/* Avatar Section */}
              <div className="relative -mt-20 mb-6 sm:mb-0 sm:mr-8 flex-shrink-0 z-10 mx-auto sm:mx-0">
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-card bg-secondary shadow-xl overflow-hidden group/avatar">
                  <img
                    src={avatarPreview || user.avatar || 'https://github.com/shadcn.png'}
                    alt={user.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                  />
                  
                  {isEditing && (
                    <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200">
                      <Camera className="w-8 h-8 text-white mb-1" />
                      <span className="text-xs font-semibold text-white">Change</span>
                      <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              {/* Profile Info / Form */}
              <div className="flex-1 w-full pt-4">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  
                  <div className="w-full">
                    {isEditing ? (
                      <form id="profile-form" onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4 max-w-md">
                        <div>
                          <input
                            {...register('name')}
                            className={cn("w-full bg-secondary/40 border rounded-xl px-4 py-2.5 text-lg font-bold text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/30 outline-none transition-all font-grotesk", errors.name ? "border-red-500" : "border-border/80")}
                            placeholder="Display Name"
                          />
                          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
                        </div>
                        
                        <div>
                          <textarea
                            {...register('bio')}
                            rows={3}
                            className={cn("w-full bg-secondary/40 border rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/30 outline-none transition-all resize-none", errors.bio ? "border-red-500" : "border-border/80")}
                            placeholder="Tell us about your trading strategy..."
                          />
                          {errors.bio && <p className="text-red-400 text-xs mt-1">{errors.bio.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                           <input {...register('location')} className="bg-secondary/40 border border-border/80 rounded-xl px-4 py-2 text-sm text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/30 outline-none" placeholder="Location" />
                           <input {...register('website')} className="bg-secondary/40 border border-border/80 rounded-xl px-4 py-2 text-sm text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/30 outline-none" placeholder="Website URL" />
                        </div>
                      </form>
                    ) : (
                      <div className="text-center sm:text-left">
                        <h1 className="text-3xl font-bold text-white font-grotesk">{user.name || 'User'}</h1>
                        <p className="text-primary font-semibold text-lg font-grotesk">@{user.username || 'trader'}</p>
                        <p className="mt-4 text-slate-350 leading-relaxed max-w-2xl mx-auto sm:mx-0">
                          {user.bio || "No bio provided."}
                        </p>
                        
                        <div className="mt-6 flex flex-wrap items-center justify-center sm:justify-start gap-y-2 gap-x-6 text-sm text-slate-400">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-primary" />
                            <span>{user.email}</span>
                          </div>
                          {user.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-primary" />
                              <span>{user.location}</span>
                            </div>
                          )}
                          {user.website && (
                            <div className="flex items-center gap-2">
                              <Link2 className="w-4 h-4 text-primary" />
                              <a href={user.website} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors underline decoration-border underline-offset-4">
                                {user.website.replace(/^https?:\/\//, '')}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 w-full sm:w-auto justify-center sm:justify-end">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={onCancel}
                          disabled={mutation.isPending}
                          className="px-4 py-2 rounded-xl border border-border hover:bg-secondary/50 text-slate-300 transition-colors flex items-center gap-2 text-sm font-semibold font-grotesk"
                        >
                          <X className="w-4 h-4" /> Cancel
                        </button>
                        <button
                          type="submit"
                          form="profile-form"
                          disabled={mutation.isPending}
                          className="px-6 py-2 rounded-xl bg-primary hover:bg-primary/90 text-background shadow-lg transition-all flex items-center gap-2 text-sm font-bold disabled:opacity-70 disabled:cursor-not-allowed font-grotesk"
                        >
                          {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                          Save Changes
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-5 py-2.5 rounded-xl bg-secondary border border-border text-white hover:bg-secondary/80 transition-all flex items-center gap-2 text-sm font-semibold group font-grotesk"
                      >
                        <Edit3 className="w-4 h-4 text-primary group-hover:text-primary" />
                        Edit Profile
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Balance"
            value={displayStats.totalBalance}
            icon={Wallet}
            colorClass="border-primary/25 from-primary/10 to-transparent"
            subValue={<span className="text-primary text-sm font-semibold font-grotesk glow-text">+12.5% vs last month</span>}
          />
          
          <StatCard
            label="Today's P&L"
            value={displayStats.todayPnL}
            icon={TrendingUp}
            colorClass="border-primary/25 from-primary/10 to-transparent"
            subValue={<span className="text-primary text-sm font-semibold font-grotesk glow-text">+{displayStats.todayPnLPercent}</span>}
          />

          <StatCard
            label="Active Trades"
            value={displayStats.activeTrades}
            icon={Activity}
            colorClass="border-primary/25 from-primary/10 to-transparent"
            subValue={
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 font-grotesk">
                +{displayStats.newTrades} new
              </span>
            }
          />

          <StatCard
            label="Win Rate"
            value={displayStats.winRate}
            icon={Trophy}
            colorClass="border-primary/25 from-primary/10 to-transparent"
            subValue={
              <div className="w-full bg-secondary/50 h-1.5 rounded-full mt-2 overflow-hidden border border-border/30">
                <div 
                  className="bg-primary h-full rounded-full glow-primary" 
                  style={{ width: `${displayStats.winRateValue}%` }} 
                />
              </div>
            }
          />
        </div>

      </div>
    </div>
  );
}
import React, { useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { KycStatus, UserRole, MerchantSubscription, AuthUser } from '../types';
import { updateUserProfile, uploadAvatarImage } from '../lib/supabaseClient';
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  Sun,
  Moon,
  Globe,
  Coins,
  Sparkles,
  Mail,
  Phone,
  Store,
  ArrowRight,
  LogOut,
  Lock,
  Check,
  ChevronRight,
  Shield,
  User,
  Key,
  Crown,
  LogIn,
  Wallet,
  Edit3,
  Camera,
  X,
  AlertCircle,
  CheckCircle2,
  Layers,
  Award,
  UploadCloud,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';

interface UserProfileViewProps {
  onOpenSettings: (tab?: 'appearance' | 'language' | 'currency' | 'account' | 'security') => void;
  onOpenKycModal?: () => void;
  kycStatus?: KycStatus;
  userRole?: UserRole;
  onNavigateToSellerStudio?: () => void;
  merchantSubscription?: MerchantSubscription;
  authUser?: AuthUser | null;
  onOpenAuthModal?: (mode?: 'signin' | 'signup') => void;
  onLogout?: () => void;
  onUpdateUserProfile?: (updated: { fullName?: string; phone?: string; avatarUrl?: string }) => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  onOpenSettings,
  onOpenKycModal,
  kycStatus = 'NOT_SUBMITTED',
  userRole = 'BUYER',
  onNavigateToSellerStudio,
  merchantSubscription,
  authUser,
  onOpenAuthModal,
  onLogout,
  onUpdateUserProfile,
}) => {
  const { t, language, setLanguage, currency, setCurrency, isMM } = useLanguage();
  const { theme, setTheme, actualTheme } = useTheme();
  
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggedOutNotice, setLoggedOutNotice] = useState(false);

  // Edit Profile Modal State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editFullName, setEditFullName] = useState(authUser?.fullName || '');
  const [editPhone, setEditPhone] = useState(authUser?.phone || '');
  const [editAvatarUrl, setEditAvatarUrl] = useState(authUser?.avatarUrl || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [editFeedback, setEditFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync edit form with authUser when opened
  const handleOpenEditModal = () => {
    setEditFullName(authUser?.fullName || '');
    setEditPhone(authUser?.phone || '');
    setEditAvatarUrl(authUser?.avatarUrl || '');
    setEditFeedback(null);
    setIsUploadingImage(false);
    setUploadProgressText('');
    setIsEditProfileOpen(true);
  };

  // Handle direct file upload to Supabase Storage 'avatars' bucket
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !authUser) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setEditFeedback({
        type: 'error',
        message: isMM ? 'ကျေးဇူးပြု၍ ဓာတ်ပုံဖိုင် (JPG/PNG/WEBP) ကိုသာ ရွေးချယ်ပါ' : 'Please select a valid image file (JPG, PNG, WEBP).',
      });
      return;
    }

    // Validate max file size (e.g. 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setEditFeedback({
        type: 'error',
        message: isMM ? 'ဓာတ်ပုံဖိုင်ဆိုဒ်သည် 5MB ထက် မကျော်ရပါ' : 'Image file size must not exceed 5MB.',
      });
      return;
    }

    setIsUploadingImage(true);
    setUploadProgressText(isMM ? 'ပုံတင်နေပါသည်...' : 'Uploading image to storage...');
    setEditFeedback(null);

    try {
      const result = await uploadAvatarImage(authUser.id, file);
      if (result.success && result.publicUrl) {
        setEditAvatarUrl(result.publicUrl);
        setEditFeedback({
          type: 'success',
          message: isMM ? 'ပုံတင်ပြီးပါပြီ! သိမ်းဆည်းရန် Save နှိပ်ပါ' : 'Photo uploaded successfully! Click Save to confirm.',
        });
      } else {
        setEditFeedback({
          type: 'error',
          message: result.error || (isMM ? 'ဓာတ်ပုံတင်ခြင်း မအောင်မြင်ပါ' : 'Failed to upload image.'),
        });
      }
    } catch (err: any) {
      setEditFeedback({
        type: 'error',
        message: err?.message || (isMM ? 'ဓာတ်ပုံတင်ရာတွင် ချို့ယွင်းချက်ဖြစ်ပေါ်ပါသည်' : 'Error uploading image.'),
      });
    } finally {
      setIsUploadingImage(false);
      setUploadProgressText('');
      // Reset input value so same file can be reselected if desired
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) return;

    if (!editFullName.trim()) {
      setEditFeedback({
        type: 'error',
        message: isMM ? 'အမည်ရင်း ထည့်သွင်းပေးပါ' : 'Please enter your full name',
      });
      return;
    }

    setIsSavingProfile(true);
    setEditFeedback(null);

    try {
      const cleanAvatar = editAvatarUrl.trim() || undefined;
      const cleanName = editFullName.trim();
      const cleanPhone = editPhone.trim();

      await updateUserProfile(authUser.id, {
        fullName: cleanName,
        phone: cleanPhone,
        avatarUrl: cleanAvatar,
      });

      if (onUpdateUserProfile) {
        onUpdateUserProfile({
          fullName: cleanName,
          phone: cleanPhone,
          avatarUrl: cleanAvatar,
        });
      }

      setEditFeedback({
        type: 'success',
        message: isMM ? 'ပရိုဖိုင် အချက်အလက်များကို အောင်မြင်စွာ ပြင်ဆင်ပြီးပါပြီ' : 'Profile updated successfully!',
      });

      setTimeout(() => {
        setIsEditProfileOpen(false);
      }, 1000);
    } catch (err: any) {
      setEditFeedback({
        type: 'error',
        message: err?.message || (isMM ? 'ပြင်ဆင်မှု မအောင်မြင်ပါ' : 'Failed to update profile'),
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    if (onLogout) {
      onLogout();
    }
    setLoggedOutNotice(true);
    setTimeout(() => {
      setLoggedOutNotice(false);
    }, 3000);
  };

  const displayName = authUser?.fullName || (isMM ? 'အကောင့်ဖွင့်ပြီးစ Gamer' : 'New Gamer');
  const displayUsername = authUser?.username || 'gamer';
  const displayEmail = authUser?.email || '-';
  const displayPhone = authUser?.phone || (isMM ? 'မထည့်ရသေးပါ' : 'Not set');
  const initialLetter = (authUser?.fullName || authUser?.username || 'G').charAt(0).toUpperCase();
  
  // Resolved KYC Status
  const activeKyc = authUser?.kycStatus || kycStatus;
  
  // Strict 3-Level Progression Calculation:
  // Level 1: UNVERIFIED (Default for all newly registered accounts)
  // Level 2: VERIFIED (Strictly when activeKyc === 'VERIFIED')
  // Level 3: PRO MERCHANT (Strictly when activeKyc === 'VERIFIED' AND (isProMerchant || subscription active))
  const isLevel2Verified = activeKyc === 'VERIFIED';
  const isLevel3ProMerchant = isLevel2Verified && Boolean(authUser?.isProMerchant || merchantSubscription?.isActive);
  
  const userLevel = isLevel3ProMerchant ? 3 : isLevel2Verified ? 2 : 1;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-200">
      {/* Logged out notice toast */}
      {loggedOutNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-between animate-in slide-in-from-top">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{isMM ? 'အကောင့်မှ အောင်မြင်စွာ ထွက်ပြီးပါပြီ။' : 'Logged out successfully.'}</span>
          </div>
          <button onClick={() => setLoggedOutNotice(false)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. USER HEADER & LEVEL PROGRESSION CARD                 */}
      {/* ======================================================== */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-cyan-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Avatar & User Details */}
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative group">
              {authUser?.avatarUrl ? (
                <img
                  src={authUser.avatarUrl}
                  alt="Profile Avatar"
                  className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl object-cover border-2 border-cyan-500 shadow-md shadow-cyan-500/20"
                />
              ) : (
                <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-gradient-to-br from-cyan-600 via-blue-700 to-indigo-800 text-white font-black text-2xl sm:text-3xl flex items-center justify-center border-2 border-cyan-400/50 shadow-md shadow-cyan-500/20 select-none">
                  {initialLetter}
                </div>
              )}
              
              {isLevel2Verified && (
                <div
                  className="absolute -bottom-1.5 -right-1.5 p-1 bg-emerald-500 text-slate-950 rounded-full ring-2 ring-white dark:ring-slate-900 shadow-sm"
                  title="Level 2 KYC Verified"
                >
                  <ShieldCheck className="w-4 h-4 stroke-[3]" />
                </div>
              )}

              {/* Quick edit avatar button */}
              {authUser && (
                <button
                  type="button"
                  onClick={handleOpenEditModal}
                  className="absolute inset-0 rounded-2xl bg-black/40 text-white opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer"
                  title={isMM ? 'ပရိုဖိုင်ပုံ ပြင်မည်' : 'Change Photo'}
                >
                  <Camera className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {displayUsername}
                </h1>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {displayName}
                </span>

                {/* Edit Profile Button */}
                {authUser && (
                  <button
                    type="button"
                    onClick={handleOpenEditModal}
                    className="p-1 px-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-bold transition flex items-center gap-1 cursor-pointer border border-cyan-500/20"
                    title={isMM ? 'ပရိုဖိုင် အချက်အလက်များ ပြင်ဆင်မည်' : 'Edit Profile'}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isMM ? 'ပြင်မည်' : 'Edit'}</span>
                  </button>
                )}
              </div>

              {/* Contact Info */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                  <span className="truncate max-w-[200px] sm:max-w-none">{displayEmail}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{displayPhone}</span>
                </div>
              </div>

              {/* 3-Level Hierarchy Visual Badge */}
              <div className="pt-1 flex items-center gap-2 flex-wrap">
                {userLevel === 3 ? (
                  <span className="px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md shadow-amber-500/20 font-mono tracking-tight">
                    <Crown className="w-3.5 h-3.5 fill-slate-950" />
                    <span>LEVEL 3: PRO MERCHANT</span>
                  </span>
                ) : userLevel === 2 ? (
                  <span className="px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-black flex items-center gap-1.5 font-mono tracking-tight">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>LEVEL 2: VERIFIED SELLER</span>
                  </span>
                ) : activeKyc === 'PENDING' ? (
                  <button
                    type="button"
                    onClick={() => onOpenKycModal && onOpenKycModal()}
                    className="px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-black flex items-center gap-1.5 font-mono cursor-pointer hover:bg-amber-500/25 transition"
                    title={isMM ? 'စိစစ်ဆဲ အခြေအနေ ကြည့်ရန် နှိပ်ပါ' : 'Click to view review status'}
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                    <span>LEVEL 1: ⏳ KYC စိစစ်ဆဲ (PENDING)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onOpenKycModal && onOpenKycModal()}
                    className="px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-700 dark:text-amber-300 text-xs font-black flex items-center gap-1.5 font-mono cursor-pointer transition active:scale-95 shadow-sm"
                    title={isMM ? 'KYC လျှောက်ထားရန် နှိပ်ပါ' : 'Click to Apply for KYC'}
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                    <span>LEVEL 1: {isMM ? 'KYC လျှောက်ထားရန်' : 'Apply for KYC'}</span>
                    <Sparkles className="w-3 h-3 text-amber-500" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Action on Header (KYC Trigger) */}
          <div className="shrink-0 self-start md:self-center w-full sm:w-auto">
            {userLevel >= 2 ? (
              <div className="px-4 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>{isMM ? 'KYC စိစစ်အတည်ပြုပြီး' : 'KYC Approved'}</span>
              </div>
            ) : activeKyc === 'PENDING' ? (
              <div className="px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center justify-center gap-2">
                <Clock className="w-4 h-4 text-amber-500 animate-spin" />
                <span>{isMM ? 'စိစစ်ဆဲ (Admin Review)' : 'Pending Review'}</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onOpenKycModal && onOpenKycModal()}
                className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/25 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>{isMM ? 'KYC လျှောက်ထားမည် (Level 2)' : 'Apply for KYC (Level 2)'}</span>
                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. USER LEVEL PROGRESSION EXPLANATION CARD              */}
      {/* ======================================================== */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500">
              <Layers className="w-4 h-4" />
            </div>
            <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
              {isMM ? 'GameZay အသုံးပြုသူ အဆင့်ဆင့် (Progression Levels)' : 'User Level Progression'}
            </h2>
          </div>
          <span className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 font-mono">
            Level {userLevel} / 3
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Level 1 Card */}
          <div
            className={`p-4 rounded-2xl border transition ${
              userLevel === 1
                ? 'bg-amber-500/5 border-amber-500/40 ring-1 ring-amber-500/30'
                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-slate-900 dark:text-white">
                Level 1: UNVERIFIED
              </span>
              {userLevel === 1 && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500">
                  CURRENT
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              {isMM
                ? 'အကောင့်သစ်များအတွက် ပုံသေအဆင့်။ စျေးကွက်ကြည့်ရှုခြင်းနှင့် အကောင့်ဝယ်ယူခြင်းများ ပြုလုပ်နိုင်သည်။'
                : 'Default for new accounts. Browse listings, inspect accounts, and buy securely.'}
            </p>
          </div>

          {/* Level 2 Card */}
          <div
            className={`p-4 rounded-2xl border transition ${
              userLevel === 2
                ? 'bg-emerald-500/5 border-emerald-500/40 ring-1 ring-emerald-500/30'
                : userLevel > 2
                ? 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 opacity-90'
                : 'bg-slate-50/50 dark:bg-slate-950/50 border-slate-200/50 dark:border-slate-800/50 opacity-70'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Level 2: VERIFIED</span>
              </span>
              {userLevel === 2 && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500">
                  CURRENT
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              {isMM
                ? 'KYC မှတ်ပုံတင်စိစစ်ပြီးပါက Seller Studio နှင့် အရောင်းတင်ခြင်းများ အလိုအလျောက် ပွင့်မည်။'
                : 'Unlocks Seller Studio and listing creation upon Admin KYC verification.'}
            </p>
          </div>

          {/* Level 3 Card */}
          <div
            className={`p-4 rounded-2xl border transition ${
              userLevel === 3
                ? 'bg-amber-500/10 border-amber-500/50 ring-1 ring-amber-500/40'
                : 'bg-slate-50/50 dark:bg-slate-950/50 border-slate-200/50 dark:border-slate-800/50 opacity-70'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>Level 3: PRO MERCHANT</span>
              </span>
              {userLevel === 3 && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-mono">
                  CURRENT
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              {isMM
                ? 'ရောင်းချမှု ၁၀ ခုပြည့်ပြီး သီးသန့် Pro Merchant လျှောက်ထားသူများအတွက် အထူး badge နှင့် bump quota ရရှိမည်။'
                : 'Verified sellers with 10+ completed orders. Unlocks gold badge & auto-bump features.'}
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. SELLER STUDIO ENTRY BANNER                            */}
      {/* ======================================================== */}
      {isLevel2Verified ? (
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-7 shadow-lg relative overflow-hidden group">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-emerald-500/5 blur-2xl pointer-events-none" />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Store className="w-5 h-5" />
                </div>
                <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <span>{t('profile.sellerStudioBanner.header')}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-mono">
                    UNLOCKED
                  </span>
                </h2>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t('profile.sellerStudioBanner.description')}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigateToSellerStudio && onNavigateToSellerStudio()}
              className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/30 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 group-hover:shadow-emerald-500/50 shrink-0"
            >
              <span>{t('profile.sellerStudioBanner.cta')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <Lock className="w-5 h-5" />
                </div>
                <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <span>{isMM ? 'Seller Studio သော့ခတ်ထားပါသည်' : 'Seller Studio Locked'}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                    KYC REQUIRED
                  </span>
                </h2>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {activeKyc === 'PENDING'
                  ? isMM
                    ? 'သင်၏ KYC မှတ်ပုံတင်စိစစ်မှုကို အက်ဒမင်မှ စစ်ဆေးနေဆဲဖြစ်ပါသည်။ စိစစ်အတည်ပြုပြီးပါက Seller Studio ပွင့်သွားမည်ဖြစ်ပါသည်။'
                    : 'Your KYC submission is pending admin verification. Seller Studio will be automatically unlocked once approved.'
                  : isMM
                  ? 'ဂိမ်းအကောင့်များ တင်ရောင်းရန်နှင့် Seller Studio အသုံးပြုရန်အတွက် KYC မှတ်ပုံတင် စိစစ်ပေးရန် လိုအပ်ပါသည်။'
                  : 'Seller Studio is locked. Complete KYC verification to become a verified seller and unlock sales tools.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onOpenKycModal && onOpenKycModal()}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 shrink-0"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{activeKyc === 'PENDING' ? (isMM ? 'စိစစ်ဆဲ အခြေအနေ' : 'Check Status') : (isMM ? 'KYC လျှောက်ထားမည်' : 'Complete KYC')}</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. SETTINGS & LOGOUT SECTION                             */}
      {/* ======================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
            {t('profile.settingsTitle')}
          </h3>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/80 shadow-sm">
          {/* Language Switch */}
          <div className="p-4 sm:p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-500">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  {t('profile.language')}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {language === 'mm' ? 'မြန်မာဘာသာ (Unicode)' : 'English (International)'}
                </p>
              </div>
            </div>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setLanguage('mm')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  language === 'mm'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                🇲🇲 MM
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  language === 'en'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                🇺🇸 EN
              </button>
            </div>
          </div>

          {/* Theme Switch */}
          <div className="p-4 sm:p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-500">
                {actualTheme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  {t('profile.theme')}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {actualTheme === 'dark' ? (isMM ? 'အမှောင်ပုံစံ (Dark)' : 'Dark Theme') : (isMM ? 'အလင်းပုံစံ (Light)' : 'Light Theme')}
                </p>
              </div>
            </div>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  actualTheme === 'light'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Light</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  actualTheme === 'dark'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dark</span>
              </button>
            </div>
          </div>

          {/* Account Logout Action */}
          {authUser && (
            <div className="p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-500">
                  <LogOut className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400">
                    {isMM ? 'အကောင့်မှ ထွက်မည်' : 'Sign Out Account'}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {authUser.email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                className="px-4 py-2 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs border border-rose-500/20 transition cursor-pointer"
              >
                {isMM ? 'ထွက်မည်' : 'Sign Out'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. EDIT PROFILE MODAL                                    */}
      {/* ======================================================== */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border-b border-slate-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {isMM ? 'ပရိုဖိုင် အချက်အလက်များ ပြင်ဆင်မည်' : 'Edit User Profile'}
                  </h3>
                  <p className="text-xs text-cyan-200/80">
                    {isMM ? 'အမည်ရင်း၊ ဖုန်းနံပါတ်နှင့် ပရိုဖိုင်ပုံ ပြင်ဆင်ပါ' : 'Update your name, contact phone, and avatar'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveProfile} className="p-5 sm:p-6 space-y-4">
              {editFeedback && (
                <div
                  className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2.5 ${
                    editFeedback.type === 'success'
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                      : 'bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {editFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{editFeedback.message}</span>
                </div>
              )}

              {/* Avatar Preview & Direct File Upload Section */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-4">
                  <div className="relative shrink-0">
                    {editAvatarUrl.trim() ? (
                      <img
                        src={editAvatarUrl.trim()}
                        alt="Avatar Preview"
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-500 shadow-sm"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-600 to-indigo-700 text-white font-black text-2xl flex items-center justify-center border-2 border-cyan-400 select-none shadow-sm">
                        {(editFullName || authUser?.fullName || 'G').charAt(0).toUpperCase()}
                      </div>
                    )}
                    {isUploadingImage && (
                      <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center text-cyan-400">
                        <Loader2 className="w-6 h-6 animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-cyan-500" />
                      <span>{isMM ? 'ပရိုဖိုင်ဓာတ်ပုံ တင်ရန် (Supabase Storage)' : 'Profile Photo (Direct File Upload)'}</span>
                    </span>

                    {/* Hidden Native File Input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                      id="avatar-file-upload"
                      disabled={isUploadingImage || isSavingProfile}
                    />

                    <div className="flex items-center gap-2 flex-wrap pt-0.5">
                      {/* Upload Button */}
                      <button
                        type="button"
                        disabled={isUploadingImage || isSavingProfile}
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-slate-950 text-xs font-black transition flex items-center gap-1.5 shadow-sm shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
                      >
                        {isUploadingImage ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>{isMM ? 'တင်နေသည်...' : 'Uploading...'}</span>
                          </>
                        ) : (
                          <>
                            <UploadCloud className="w-3.5 h-3.5" />
                            <span>{isMM ? 'ဖိုင်ရွေးပြီး တင်မည်' : 'Choose Photo to Upload'}</span>
                          </>
                        )}
                      </button>

                      {/* Reset to Letter Avatar */}
                      {editAvatarUrl.trim() && (
                        <button
                          type="button"
                          disabled={isUploadingImage}
                          onClick={() => setEditAvatarUrl('')}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer"
                        >
                          {isMM ? 'အက္ခရာပုံစံ ပြန်ထားမည်' : 'Use Letter Avatar'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {uploadProgressText && (
                  <p className="text-[11px] text-cyan-600 dark:text-cyan-400 font-medium flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>{uploadProgressText}</span>
                  </p>
                )}
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  {isMM
                    ? 'JPG, PNG, သို့မဟုတ် WEBP ဖိုင်များကို လက်ခံပါသည်။ (အများဆုံး 5MB)'
                    : 'Supports JPG, PNG, or WEBP images (Max 5MB). Uploads directly to Supabase storage bucket.'}
                </p>
              </div>

              {/* Full Name input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-cyan-500" />
                  <span>{isMM ? 'အမည်ရင်း (Full Name)' : 'Full Name'} *</span>
                </label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  placeholder="Ko Kyaw Zayar"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>

              {/* Phone input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{isMM ? 'ဖုန်းနံပါတ် (Contact Phone)' : 'Contact Phone Number'}</span>
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="09450012345"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition font-mono"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                >
                  {isMM ? 'မလုပ်တော့ပါ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-6 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-slate-950 font-black text-xs shadow-md shadow-cyan-500/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSavingProfile ? (
                    <span className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>{isMM ? 'သိမ်းဆည်းနေသည်...' : 'Saving...'}</span>
                    </span>
                  ) : (
                    <span>{isMM ? 'ပြင်ဆင်မှု သိမ်းမည်' : 'Save Changes'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. LOGOUT CONFIRMATION MODAL                             */}
      {/* ======================================================== */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {isMM ? 'အကောင့်မှ ထွက်မှာ သေချာပါသလား?' : 'Sign out of GameZay?'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isMM ? 'ထွက်ပြီးပါက Login ပြန်ဝင်ရန် လိုအပ်မည်ဖြစ်ပါသည်။' : 'You will need to sign in again to access your escrow dashboard.'}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
              >
                {isMM ? 'မထွက်ပါ' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition cursor-pointer"
              >
                {isMM ? 'သေချာသည်' : 'Sign Out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

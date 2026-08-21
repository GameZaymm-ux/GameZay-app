import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { KycStatus, UserRole, MerchantSubscription, AuthUser } from '../types';
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
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  onOpenSettings,
  onOpenKycModal,
  kycStatus = 'VERIFIED',
  userRole = 'BUYER',
  onNavigateToSellerStudio,
  merchantSubscription,
  authUser,
  onOpenAuthModal,
  onLogout,
}) => {
  const { t, language, setLanguage, currency, setCurrency, isMM } = useLanguage();
  const { theme, setTheme, actualTheme } = useTheme();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggedOutNotice, setLoggedOutNotice] = useState(false);

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

  const displayName = authUser?.fullName || 'Ko Min Thant';
  const displayUsername = authUser?.username || 'KyawZin_Gamer99';
  const displayEmail = authUser?.email || 'gamezaymm@gmail.com';
  const displayPhone = authUser?.phone || '+95 9 450 012 345';
  const displayAvatar = authUser?.avatarUrl || 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=300&auto=format&fit=crop&q=80';
  const activeKyc = authUser?.kycStatus || kycStatus;

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

      {/* Guest Mode Banner if not logged in */}
      {!authUser && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-cyan-500/15 via-teal-500/10 to-emerald-500/15 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-500 flex items-center justify-center shrink-0">
              <LogIn className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {isMM ? 'GameZay.MM အကောင့်ဖြင့် ဝင်ရောက်ပါ' : 'Sign in to GameZay.MM'}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {isMM ? 'Escrow အရောင်းအဝယ်များနှင့် အကောင့်မှတ်တမ်းများကို သိမ်းဆည်းရန်' : 'Save your verified orders, wallets, and escrow ratings'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onOpenAuthModal && onOpenAuthModal('signin')}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-md shadow-cyan-500/20 transition cursor-pointer"
            >
              {isMM ? 'အကောင့်ဝင်မည်' : 'Sign In'}
            </button>
            <button
              onClick={() => onOpenAuthModal && onOpenAuthModal('signup')}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition cursor-pointer"
            >
              {isMM ? 'အကောင့်သစ်ဖွင့်မည်' : 'Sign Up'}
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. USER HEADER                                           */}
      {/* ======================================================== */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-cyan-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Avatar & User Details */}
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative">
              <img
                src={displayAvatar}
                alt="Profile Avatar"
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-cyan-500 shadow-md shadow-cyan-500/20"
              />
              {activeKyc === 'VERIFIED' && (
                <div
                  className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 text-slate-950 rounded-full ring-2 ring-white dark:ring-slate-900 shadow-sm"
                  title="KYC Verified"
                >
                  <ShieldCheck className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {displayUsername}
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 font-mono">
                  {displayName}
                </span>
                {merchantSubscription?.isActive && (
                  <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 text-[10px] font-black flex items-center gap-1 shadow-sm font-mono">
                    <Crown className="w-3 h-3 fill-slate-950" />
                    <span>PRO MERCHANT</span>
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-cyan-500" />
                  <span>{displayEmail}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{displayPhone}</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400">
                {t('profile.memberSince')}: <strong className="text-slate-700 dark:text-slate-300">August 2024</strong>
              </div>
            </div>
          </div>

          {/* KYC Status Badge or Apply Button */}
          <div className="shrink-0 self-start sm:self-center">
            {activeKyc === 'VERIFIED' ? (
              <div className="px-3.5 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-2 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>{isMM ? '✓ KYC အတည်ပြုပြီး' : '✓ Verified'}</span>
              </div>
            ) : activeKyc === 'PENDING' ? (
              <div className="px-3.5 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center gap-2 shadow-sm">
                <Clock className="w-4 h-4 text-amber-500 animate-spin" />
                <span>{isMM ? '⏳ KYC စိစစ်ဆဲ' : '⏳ KYC Under Review'}</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onOpenKycModal && onOpenKycModal()}
                className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>{t('profile.unverifiedBadge')}</span>
                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              </button>
            )}
          </div>
        </div>
      </div>


      {/* ======================================================== */}
      {/* 2. SELLER STUDIO ENTRY BANNER                            */}
      {/* ======================================================== */}
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
                  {t('profile.sellerStudioBanner.badge')}
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

      {/* ======================================================== */}
      {/* 3. SETTINGS SECTION                                      */}
      {/* ======================================================== */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                {t('profile.settingsSection.title')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('profile.subtitle')}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          {/* 3.1 Language Selection */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-cyan-500">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-900 dark:text-white">
                  {t('profile.settingsSection.languageTitle')}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t('profile.settingsSection.languageDesc')}
                </div>
              </div>
            </div>

            <div className="inline-flex rounded-xl bg-slate-200 dark:bg-slate-800 p-1 border border-slate-300 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  language === 'en'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm font-black'
                    : 'text-slate-600 dark:text-slate-300 hover:text-white'
                }`}
              >
                English (ENG)
              </button>
              <button
                type="button"
                onClick={() => setLanguage('mm')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  language === 'mm'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm font-black'
                    : 'text-slate-600 dark:text-slate-300 hover:text-white'
                }`}
              >
                မြန်မာစာ (MM)
              </button>
            </div>
          </div>

          {/* 3.2 Theme Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-amber-400">
                {actualTheme === 'dark' ? <Moon className="w-4 h-4 text-cyan-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
              </div>
              <div>
                <div className="font-bold text-slate-900 dark:text-white">
                  {t('profile.settingsSection.themeTitle')}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t('profile.settingsSection.themeDesc')}
                </div>
              </div>
            </div>

            <div className="inline-flex rounded-xl bg-slate-200 dark:bg-slate-800 p-1 border border-slate-300 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  actualTheme === 'light'
                    ? 'bg-amber-400 text-slate-950 shadow-sm font-black'
                    : 'text-slate-600 dark:text-slate-300 hover:text-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>{isMM ? 'Light မုဒ်' : 'Light'}</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  actualTheme === 'dark'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm font-black'
                    : 'text-slate-600 dark:text-slate-300 hover:text-white'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>{isMM ? 'Dark မုဒ်' : 'Dark'}</span>
              </button>
            </div>
          </div>

          {/* 3.3 Currency Selection */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-emerald-400">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-900 dark:text-white">
                  {t('profile.settingsSection.currencyTitle')}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t('profile.settingsSection.currencyDesc')}
                </div>
              </div>
            </div>

            <div className="inline-flex rounded-xl bg-slate-200 dark:bg-slate-800 p-1 border border-slate-300 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setCurrency('MMK')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  currency === 'MMK'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm font-black'
                    : 'text-slate-600 dark:text-slate-300 hover:text-white'
                }`}
              >
                🇲🇲 MMK (ကျပ်)
              </button>
              <button
                type="button"
                onClick={() => setCurrency('THB')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  currency === 'THB'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm font-black'
                    : 'text-slate-600 dark:text-slate-300 hover:text-white'
                }`}
              >
                🇹🇭 THB (ဘတ်)
              </button>
            </div>
          </div>

          {/* 3.4 Security Settings Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-purple-400">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>{t('profile.settingsSection.securityTitle')}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-500">
                    2FA Active
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t('profile.settingsSection.securityDesc')}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenSettings('security')}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <Key className="w-3.5 h-3.5 text-cyan-500" />
              <span>{t('profile.settingsSection.openSecurityBtn')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. LOG OUT BUTTON                                        */}
      {/* ======================================================== */}
      <div className="pt-2">
        {showLogoutConfirm ? (
          <div className="p-5 rounded-3xl bg-rose-500/10 border border-rose-500/30 space-y-3 animate-in fade-in">
            <p className="text-xs font-bold text-rose-500 dark:text-rose-400 text-center">
              {t('profile.logoutConfirm')}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                {isMM ? 'မထွက်ပါ' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-lg shadow-rose-600/30 transition cursor-pointer"
              >
                {isMM ? 'သေချာသည်၊ ထွက်မည်' : 'Yes, Log Out'}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('profile.logout')}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default UserProfileView;

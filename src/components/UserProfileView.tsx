import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { AccountListing, EscrowOrder, KycStatus, UserRole } from '../types';
import {
  User,
  Settings as SettingsIcon,
  ShieldCheck,
  ShieldAlert,
  Wallet,
  TrendingUp,
  Clock,
  ArrowUpRight,
  PlusCircle,
  Package,
  Layers,
  ChevronRight,
  Sun,
  Moon,
  Globe,
  Coins,
  FileCheck2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

interface UserProfileViewProps {
  onOpenSettings: (tab?: 'appearance' | 'language' | 'currency' | 'account' | 'security') => void;
  onOpenSellModal: () => void;
  onOpenKycModal?: () => void;
  kycStatus?: KycStatus;
  userRole?: UserRole;
  userListings: AccountListing[];
  userOrders: EscrowOrder[];
  onSelectOrder: (orderId: string) => void;
  onInspectListing: (listing: AccountListing) => void;
  onNavigateToSellerStudio?: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  onOpenSettings,
  onOpenSellModal,
  onOpenKycModal,
  kycStatus = 'UNSUBMITTED',
  userRole = 'BUYER',
  userListings,
  userOrders,
  onSelectOrder,
  onInspectListing,
  onNavigateToSellerStudio,
}) => {
  const {
    t,
    language,
    setLanguage,
    currency,
    setCurrency,
    exchangeRate,
    formatMMK,
    formatTHB,
    formatPrice,
    convertMMKtoTHB,
    isMM,
  } = useLanguage();
  const { theme, setTheme, actualTheme } = useTheme();

  const [activeSubTab, setActiveSubTab] = useState<'listings' | 'escrow'>('listings');

  const totalEarned = userOrders
    .filter((o) => o.status === 'COMPLETED')
    .reduce((acc, curr) => acc + curr.amountMMK, 1450000);

  const pendingEscrow = userOrders
    .filter((o) => o.status !== 'COMPLETED' && o.status !== 'REFUNDED')
    .reduce((acc, curr) => acc + curr.amountMMK, 380000);

  return (
    <div className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* KYC Status Alert Banner */}
      {kycStatus === 'PENDING' && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border-2 border-amber-300 dark:border-amber-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200">
                {isMM ? 'KYC စိစစ်ဆဲ ဖြစ်ပါသည် (KYC Pending Review)' : 'KYC Verification Under Review'}
              </h4>
              <p className="text-[11px] text-amber-700 dark:text-amber-400">
                {isMM
                  ? 'အက်ဒမင်မှ သင်၏ မှတ်ပုံတင်အထောက်အထားကို စစ်ဆေးနေပါသည်။ ၂-၄ နာရီအတွင်း အတည်ပြုပေးပါမည်။'
                  : 'Our compliance officers are verifying your ID document. Review completes within 2-4 hours.'}
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-xl bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 text-xs font-bold font-mono self-start sm:self-auto">
            PENDING
          </span>
        </div>
      )}

      {kycStatus === 'UNSUBMITTED' && userRole === 'BUYER' && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/80 via-blue-950/80 to-slate-900 border border-cyan-500/40 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-cyan-300">
                {isMM ? 'အရောင်းတင်ရန် KYC စိစစ်မှု လိုအပ်ပါသည်' : 'Upgrade to Verified Seller (KYC Required)'}
              </h4>
              <p className="text-[11px] text-slate-300">
                {isMM
                  ? 'လုံခြုံစိတ်ချရသော ဂိမ်းအကောင့်အရောင်းအဝယ်အတွက် မှတ်ပုံတင်အတည်ပြုပြီး Seller Studio ဖွင့်လှစ်ပါ'
                  : 'Submit your NRC or Passport to unlock Seller Studio, list game accounts, and receive wallet payouts.'}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenKycModal}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-black text-xs shadow-md hover:scale-105 transition cursor-pointer self-start sm:self-auto"
          >
            {isMM ? 'KYC စတင်မည်' : 'Verify ID (KYC)'}
          </button>
        </div>
      )}

      {/* Profile Overview Banner Card */}
      <div className="w-full bg-white dark:bg-slate-900/90 rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          {/* User Info */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative shrink-0">
              <img
                src="https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80"
                alt="Profile"
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-cyan-500 shadow-lg shadow-cyan-500/20"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] text-white font-bold">
                ✓
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  KyawZin_Gamer99
                </h2>
                {kycStatus === 'VERIFIED' || userRole === 'SELLER' || userRole === 'ADMIN' ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-300 dark:border-emerald-500/40 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{isMM ? 'အတည်ပြုပြီး ရောင်းသူ' : 'Verified Seller'}</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-300 dark:border-slate-700 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{isMM ? 'ဝယ်သူ အဆင့်' : 'Buyer Level'}</span>
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 font-medium">
                <span>ID: #GZ-89210</span>
                <span>•</span>
                <span>{t('profile.memberSince')} Oct 2024</span>
                <span>•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">⚡ 99.8% Trust Score</span>
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                <span className="text-slate-600 dark:text-slate-300">
                  ⭐ <strong className="text-slate-900 dark:text-white">4.95 / 5.0</strong>
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-600 dark:text-slate-300">
                  📦 <strong className="text-slate-900 dark:text-white">128</strong> {t('profile.tradesCompleted')}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-600 dark:text-slate-300">
                  🛡️ <strong className="text-emerald-600 dark:text-emerald-400">0.0%</strong> {t('profile.disputeRate')}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {onNavigateToSellerStudio && (
              <button
                onClick={onNavigateToSellerStudio}
                className="flex-1 md:flex-none px-4 py-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-xs border border-amber-300 dark:border-amber-700/60 transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Package className="w-4 h-4" />
                <span>{isMM ? 'ရောင်းသူ စတူဒီယို' : 'Seller Studio'}</span>
              </button>
            )}

            <button
              onClick={() => onOpenSettings()}
              className="flex-1 md:flex-none px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs border border-slate-200 dark:border-slate-700 transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <SettingsIcon className="w-4 h-4 text-cyan-500" />
              <span>{t('profile.settingsBtn')}</span>
            </button>

            <button
              onClick={onOpenSellModal}
              className="flex-1 md:flex-none px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/25 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('nav.sellAccount')}</span>
            </button>
          </div>
        </div>

        {/* Quick Preference Bar (Language, Theme & Currency Toggles) */}
        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Quick Currency Toggle */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-cyan-500" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {isMM ? 'ငွေကြေး:' : 'Currency:'}
              </span>
            </div>
            <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-800 p-0.5 rounded-xl text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setCurrency('MMK')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  currency === 'MMK'
                    ? 'bg-cyan-500 text-slate-950 shadow'
                    : 'text-slate-600 dark:text-slate-400 hover:text-white'
                }`}
              >
                MMK
              </button>
              <button
                type="button"
                onClick={() => setCurrency('THB')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  currency === 'THB'
                    ? 'bg-cyan-500 text-slate-950 shadow'
                    : 'text-slate-600 dark:text-slate-400 hover:text-white'
                }`}
              >
                THB (฿)
              </button>
            </div>
          </div>

          {/* Quick Language Toggle */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {isMM ? 'ဘာသာစကား:' : 'Language:'}
              </span>
            </div>
            <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-800 p-0.5 rounded-xl text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  language === 'en'
                    ? 'bg-cyan-500 text-slate-950 shadow'
                    : 'text-slate-600 dark:text-slate-400 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('mm')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  language === 'mm'
                    ? 'bg-cyan-500 text-slate-950 shadow'
                    : 'text-slate-600 dark:text-slate-400 hover:text-white'
                }`}
              >
                မြန်မာ
              </button>
            </div>
          </div>

          {/* Quick Theme Toggle */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {actualTheme === 'dark' ? (
                <Moon className="w-4 h-4 text-purple-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {isMM ? 'အပြင်အဆင်:' : 'Theme:'}
              </span>
            </div>
            <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-800 p-0.5 rounded-xl text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  theme === 'dark'
                    ? 'bg-cyan-500 text-slate-950 shadow'
                    : 'text-slate-600 dark:text-slate-400 hover:text-white'
                }`}
              >
                Dark
              </button>
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  theme === 'light'
                    ? 'bg-cyan-500 text-slate-950 shadow'
                    : 'text-slate-600 dark:text-slate-400 hover:text-white'
                }`}
              >
                Light
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Financial & Trade Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Earned */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-2">
            <span>{isMM ? 'ရရှိပြီး ဝင်ငွေစုစုပေါင်း' : 'Total Earnings'}</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {formatPrice(totalEarned)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            {currency === 'THB'
              ? `≈ ${formatMMK(totalEarned)}`
              : `≈ ${formatTHB(convertMMKtoTHB(totalEarned))}`}
          </p>
        </div>

        {/* Pending In Escrow */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-2">
            <span>{isMM ? 'Escrow တွင် လော့ခ်ချထားငွေ' : 'Active In Escrow'}</span>
            <Clock className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400 font-mono">
            {formatPrice(pendingEscrow)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {isMM ? 'စစ်ဆေးရေးပြီးပါက ထုတ်ယူနိုင်ပါသည်' : 'Under 24h buyer inspection'}
          </p>
        </div>

        {/* Daily Exchange Rate Pill */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-5 border border-cyan-500/30 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-cyan-300 text-xs">
            <span className="font-bold">{isMM ? 'နေ့စဥ် ငွေလဲနှုန်း' : 'Daily Exchange Rate'}</span>
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-black text-white font-mono my-1">
            1 THB (฿) = {exchangeRate} MMK
          </div>
          <p className="text-[10px] text-slate-400">
            {isMM
              ? 'ထိုင်းဘဏ်/PromptPay ဖြင့် တိုက်ရိုက်တွက်ချက်ထားပါသည်'
              : 'Auto applied on THB checkout & payouts'}
          </p>
        </div>
      </div>

      {/* Tabs for My Active Listings and Escrow Orders */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button
            onClick={() => setActiveSubTab('listings')}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeSubTab === 'listings'
                ? 'bg-cyan-500 text-slate-950 shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {isMM ? 'ကျွန်ုပ်၏ အရောင်းစာရင်းများ' : 'My Listings'} ({userListings.length})
          </button>

          <button
            onClick={() => setActiveSubTab('escrow')}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeSubTab === 'escrow'
                ? 'bg-cyan-500 text-slate-950 shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {isMM ? 'Escrow အမှာစာ မှတ်တမ်း' : 'Escrow Orders'} ({userOrders.length})
          </button>
        </div>

        {/* Sub-tab 1: User Listings */}
        {activeSubTab === 'listings' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {userListings.map((listing) => (
              <div
                key={listing.id}
                onClick={() => onInspectListing(listing)}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-cyan-500/50 transition cursor-pointer flex flex-col justify-between group"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={listing.imageUrls[0]}
                    alt={listing.title}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0 group-hover:scale-105 transition"
                  />
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {listing.gameType}
                    </span>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                      {listing.title}
                    </h5>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="font-black text-cyan-600 dark:text-cyan-400 font-mono">
                    {formatPrice(listing.priceMMK)}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {listing.views} views
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sub-tab 2: User Orders */}
        {activeSubTab === 'escrow' && (
          <div className="space-y-3">
            {userOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => onSelectOrder(order.id)}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-cyan-500/50 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={order.listing.imageUrls[0]}
                    alt={order.listing.title}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <div className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                      {order.orderNumber}
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {order.listing.title}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 text-xs">
                  <div className="font-black font-mono text-slate-900 dark:text-white">
                    {formatPrice(order.amountMMK)}
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold ${
                      order.status === 'COMPLETED'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : order.status === 'DISPUTED'
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                        : 'bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

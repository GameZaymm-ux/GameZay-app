import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { KycStatus, UserRole, AuthUser } from '../types';
import {
  ShieldCheck,
  Gamepad2,
  PlusCircle,
  ShoppingBag,
  ShieldAlert,
  Database,
  Search,
  User,
  Zap,
  Sparkles,
  Layers,
  Sun,
  Moon,
  Settings as SettingsIcon,
  Wallet,
  Bell,
  MessageCircle,
  Home,
  Globe,
  LogIn,
  LogOut,
  Crown,
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'home' | 'marketplace' | 'orders' | 'sell' | 'admin' | 'seller' | 'schema' | 'profile';
  setCurrentTab: (tab: 'home' | 'marketplace' | 'orders' | 'sell' | 'admin' | 'seller' | 'schema' | 'profile') => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  openSellModal: () => void;
  onOpenSettings: () => void;
  onOpenNotifications?: () => void;
  unreadNotificationsCount?: number;
  ordersCount: number;
  authUser?: AuthUser | null;
  onOpenAuthModal?: (mode?: 'signin' | 'signup') => void;
  onSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  userRole,
  setUserRole,
  searchQuery,
  setSearchQuery,
  openSellModal,
  onOpenSettings,
  onOpenNotifications,
  unreadNotificationsCount = 3,
  ordersCount,
  authUser,
  onOpenAuthModal,
  onSignOut,
}) => {

  const { t, isMM, language, toggleLanguage, currency, setCurrency } = useLanguage();
  const { actualTheme, toggleTheme } = useTheme();

  const toggleCurrency = () => {
    setCurrency(currency === 'MMK' ? 'THB' : 'MMK');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-2xl transition-colors duration-200">
      {/* Top Banner Bar for Myanmar Gamers & Global Quick Switchers */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 px-3.5 sm:px-4 py-1 text-xs text-slate-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Live Escrow Status Marquee */}
          <div className="flex items-center gap-2 truncate">
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-300 font-medium truncate text-[11px] sm:text-xs">
              {isMM
                ? '⚡ KPay, WavePay, AyaPay နှင့် USDT ဖြင့် ၂၄ နာရီ Escrow အာမခံ အရောင်းအဝယ်ပြုလုပ်နိုင်ပါသည်'
                : '⚡ Live 24/7 Escrow Protection via KPay, WavePay, AyaPay & USDT'}
            </span>
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Quick Role Switch Simulator */}
            <div className="hidden md:inline-flex rounded-lg bg-slate-900 p-0.5 border border-slate-800 text-[11px]">
              {(['BUYER', 'SELLER', 'ADMIN'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setUserRole(r);
                    if (r === 'ADMIN') setCurrentTab('admin');
                    if (r === 'SELLER') setCurrentTab('seller');
                  }}
                  className={`px-2 py-0.5 rounded-md font-medium transition ${
                    userRole === r
                      ? 'bg-cyan-500 text-slate-950 shadow font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {r === 'BUYER' ? (isMM ? 'ဝယ်သူ' : 'Buyer') : r === 'SELLER' ? (isMM ? 'ရောင်းသူ' : 'Seller') : (isMM ? 'အက်ဒမင်' : 'Admin')}
                </button>
              ))}
            </div>

            {/* Language Switcher Pill */}
            <button
              onClick={toggleLanguage}
              className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[11px] border border-slate-700 transition flex items-center gap-1 cursor-pointer"
              title="Toggle Myanmar / English"
            >
              <Globe className="w-3 h-3 text-cyan-400" />
              <span>{language === 'mm' ? 'မြန်မာ' : 'ENG'}</span>
            </button>

            {/* Currency Toggle Pill */}
            <button
              onClick={toggleCurrency}
              className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-mono font-bold text-[11px] border border-emerald-500/30 transition flex items-center gap-1 cursor-pointer"
              title="Toggle MMK / THB Currency"
            >
              <span>{currency === 'MMK' ? '🇲🇲 MMK' : '🇹🇭 THB'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-amber-300 dark:text-cyan-300 transition cursor-pointer"
              title={`Switch to ${actualTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle Theme"
            >
              {actualTheme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          
          {/* Left: Brand Logo */}
          <div
            onClick={() => setCurrentTab('home')}
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-emerald-500 p-0.5 shadow-md shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-base sm:text-xl font-black tracking-tight text-slate-900 dark:text-white group-hover:text-cyan-500 transition">
                  GameZay<span className="text-cyan-500">.MM</span>
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
                  ESCROW
                </span>
              </div>
              <span className="hidden lg:block text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">
                {isMM ? 'မြန်မာ့အကောင်းဆုံး ဂိမ်းအကောင့်စျေးကွက်' : 'Verified Game Account Marketplace'}
              </span>
            </div>
          </div>

          {/* Center Search Bar (Navigates to marketplace on typing/focus) */}
          <div className="hidden md:flex flex-1 max-w-sm lg:max-w-md mx-2">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => {
                  if (currentTab === 'home') setCurrentTab('marketplace');
                }}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (currentTab !== 'marketplace') setCurrentTab('marketplace');
                }}
                placeholder={t('nav.searchPlaceholder')}
                className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right Navigation Controls & Action Icons */}
          <nav className="flex items-center gap-1 sm:gap-1.5">
            
            {/* 1. Home Tab (Desktop) */}
            <button
              type="button"
              onClick={() => setCurrentTab('home')}
              className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                currentTab === 'home'
                  ? 'bg-slate-100 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>{isMM ? 'ပင်မစာမျက်နှာ' : 'Home'}</span>
            </button>

            {/* 2. Marketplace Tab (Desktop) */}
            <button
              type="button"
              onClick={() => setCurrentTab('marketplace')}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                currentTab === 'marketplace'
                  ? 'bg-slate-100 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{t('nav.marketplace')}</span>
            </button>

            {/* 3. Escrow Orders Tab */}
            <button
              type="button"
              onClick={() => setCurrentTab('orders')}
              className={`relative hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                currentTab === 'orders'
                  ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>{t('nav.orders')}</span>
              {ordersCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-emerald-500 text-slate-950 font-mono">
                  {ordersCount}
                </span>
              )}
            </button>

            {/* 4. Seller Studio / Buyer Mode Switcher */}
            {currentTab === 'seller' ? (
              <button
                type="button"
                onClick={() => setCurrentTab('home')}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition transform active:scale-95 cursor-pointer"
                title={t('sellerStudio.switchToBuyer')}
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">{t('sellerStudio.switchToBuyer')}</span>
                <span className="sm:hidden">{isMM ? 'ဝယ်သူမုဒ်' : 'Buyer'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setUserRole('SELLER');
                  setCurrentTab('seller');
                }}
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-500 hover:bg-emerald-500/10 transition cursor-pointer"
              >
                <Zap className="w-4 h-4 text-emerald-500" />
                <span>{t('sellerStudio.title')}</span>
              </button>
            )}

            {/* 5. TOP RIGHT: Notification Bell (With Active Unread Badge) */}
            <button
              type="button"
              onClick={() => {
                if (onOpenNotifications) {
                  onOpenNotifications();
                }
              }}
              className="relative p-2 sm:p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition cursor-pointer"
              title={isMM ? 'အသိပေးချက်များ' : 'Notifications'}
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white font-mono font-bold text-[9px] flex items-center justify-center ring-2 ring-white dark:ring-slate-950 animate-pulse">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* 6. TOP RIGHT: Quick Chat / Orders Shortcut */}
            <button
              type="button"
              onClick={() => setCurrentTab('orders')}
              className="p-2 sm:p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition cursor-pointer"
              title={isMM ? 'Escrow စကားပြောခန်း' : 'Escrow Live Chat'}
              aria-label="Chat"
            >
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-500" />
            </button>

            {/* 7. TOP RIGHT: Auth State (Sign In Button vs User Avatar & Dropdown) */}
            {authUser ? (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentTab('profile')}
                  className={`p-1 sm:p-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                    currentTab === 'profile'
                      ? 'ring-2 ring-cyan-500 bg-cyan-500/10'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                  title={`${authUser.fullName} (${authUser.username})`}
                >
                  <div className="relative">
                    <img
                      src={authUser.avatarUrl || "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80"}
                      alt="user"
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-cyan-400"
                    />
                    {authUser.kycStatus === 'VERIFIED' && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border border-slate-950 flex items-center justify-center text-[7px] text-slate-950 font-black">
                        ✓
                      </span>
                    )}
                  </div>
                  <span className="hidden xl:inline-block text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[100px] truncate">
                    {authUser.username || authUser.fullName}
                  </span>
                </button>

                {onSignOut && (
                  <button
                    type="button"
                    onClick={onSignOut}
                    className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                    title={isMM ? 'အကောင့်မှထွက်ရန်' : 'Sign Out'}
                    aria-label="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onOpenAuthModal && onOpenAuthModal('signin')}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 transition cursor-pointer shadow-sm"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">{isMM ? 'အကောင့်ဝင်ရန်' : 'Sign In'}</span>
                <span className="sm:hidden">{isMM ? 'ဝင်ရန်' : 'Login'}</span>
              </button>
            )}

            {/* 8. TOP RIGHT: Settings Quick Icon */}
            <button
              type="button"
              onClick={onOpenSettings}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition cursor-pointer"
              title="Settings"
              aria-label="Settings"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>

            {/* 9. TOP RIGHT: Sell Account Primary CTA */}
            <button
              type="button"
              onClick={openSellModal}
              className="hidden sm:flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 shadow-md shadow-cyan-500/25 transition transform active:scale-95 cursor-pointer shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('nav.sellAccount')}</span>
            </button>

          </nav>
        </div>
      </div>
    </header>
  );
};

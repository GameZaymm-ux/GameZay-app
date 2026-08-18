import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { UserRole } from '../types';
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
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'marketplace' | 'orders' | 'sell' | 'admin' | 'seller' | 'schema' | 'profile';
  setCurrentTab: (tab: 'marketplace' | 'orders' | 'sell' | 'admin' | 'seller' | 'schema' | 'profile') => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  openSellModal: () => void;
  onOpenSettings: () => void;
  ordersCount: number;
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
  ordersCount,
}) => {
  const { t, isMM, currency, setCurrency } = useLanguage();
  const { actualTheme, toggleTheme } = useTheme();

  const toggleCurrency = () => {
    setCurrency(currency === 'MMK' ? 'THB' : 'MMK');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-950/85 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-2xl transition-colors duration-200">
      {/* Top Notification Bar for Myanmar Gamers */}
      <div className="bg-gradient-to-r from-cyan-900/40 via-slate-900 to-emerald-900/40 dark:from-cyan-950 dark:via-slate-900 dark:to-emerald-950 border-b border-cyan-900/30 px-3.5 sm:px-4 py-1.5 text-xs text-slate-200 dark:text-slate-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
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

          {/* Quick Role Switch Simulator & Theme Button */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:inline-flex rounded-lg bg-slate-900 p-0.5 border border-slate-800 text-[11px]">
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

            {/* Quick Currency Toggle Pill */}
            <button
              onClick={toggleCurrency}
              className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-mono font-bold text-[11px] border border-emerald-500/30 transition flex items-center gap-1 cursor-pointer"
              title="Toggle MMK / THB Currency"
            >
              <span>{currency === 'MMK' ? '🇲🇲 MMK' : '🇹🇭 THB'}</span>
            </button>

            {/* Quick Dark/Light Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-amber-300 dark:text-cyan-300 transition cursor-pointer"
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
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-4">
          {/* Logo */}
          <div
            onClick={() => setCurrentTab('marketplace')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group shrink-0"
          >
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-emerald-500 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white group-hover:text-cyan-500 dark:group-hover:text-cyan-300 transition">
                  GameZay<span className="text-cyan-500 dark:text-cyan-400">.MM</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
                  {isMM ? 'ဂိမ်းစျေး' : 'ESCROW'}
                </span>
              </div>
              <span className="hidden sm:block text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">
                {isMM ? 'မြန်မာ့အကောင်းဆုံး ဂိမ်းအကောင့်စျေးကွက်' : 'Verified Game Account Marketplace'}
              </span>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('nav.searchPlaceholder')}
                className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
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

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {/* Marketplace Tab */}
            <button
              onClick={() => setCurrentTab('marketplace')}
              className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                currentTab === 'marketplace'
                  ? 'bg-slate-100 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>{t('nav.marketplace')}</span>
            </button>

            {/* Escrow Orders Tab */}
            <button
              onClick={() => setCurrentTab('orders')}
              className={`relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                currentTab === 'orders'
                  ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="hidden sm:inline">{t('nav.orders')}</span>
              {ordersCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-emerald-500 text-slate-950">
                  {ordersCount}
                </span>
              )}
            </button>

            {/* Seller Studio Tab */}
            {(userRole === 'SELLER' || userRole === 'ADMIN') && (
              <button
                onClick={() => setCurrentTab('seller')}
                className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                  currentTab === 'seller'
                    ? 'bg-slate-100 dark:bg-slate-800 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                <Zap className="w-4 h-4 text-amber-500" />
                <span>{t('nav.sellerDashboard')}</span>
              </button>
            )}

            {/* Admin Desk Tab */}
            {userRole === 'ADMIN' && (
              <button
                onClick={() => setCurrentTab('admin')}
                className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                  currentTab === 'admin'
                    ? 'bg-slate-100 dark:bg-slate-800 text-rose-600 dark:text-rose-400 border border-rose-500/30 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <span>{t('nav.adminPanel')}</span>
              </button>
            )}

            {/* Prisma Schema Viewer Tab */}
            <button
              onClick={() => setCurrentTab('schema')}
              className={`hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                currentTab === 'schema'
                  ? 'bg-slate-100 dark:bg-slate-800 text-purple-600 dark:text-purple-400 border border-purple-500/30 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
              title="View & Export Prisma PostgreSQL Schema"
            >
              <Database className="w-4 h-4" />
              <span>{t('nav.schemaViewer')}</span>
            </button>

            {/* User Profile & Settings Quick Action */}
            <button
              onClick={() => setCurrentTab('profile')}
              className={`flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                currentTab === 'profile'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
              title="User Profile & Dashboard"
            >
              <img
                src="https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80"
                alt="user"
                className="w-6 h-6 rounded-full object-cover border border-cyan-400"
              />
              <span className="hidden xl:inline">Profile</span>
            </button>

            {/* Settings Quick Icon */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition"
              title="Settings (Theme & Language)"
              aria-label="Settings"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>

            {/* Sell Account CTA Button */}
            <button
              onClick={openSellModal}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition transform active:scale-95 cursor-pointer shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">{t('nav.sellAccount')}</span>
              <span className="sm:hidden">{t('mobileNav.sell')}</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

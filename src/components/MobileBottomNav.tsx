import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { UserRole, KycStatus } from '../types';
import { SellerTabType } from './SellerDashboard';
import {
  Home,
  ShoppingBag,
  Plus,
  ReceiptText,
  User,
  ShieldCheck,
  LayoutDashboard,
  Package,
  Wallet,
  Sparkles,
  ArrowLeftRight,
} from 'lucide-react';

interface MobileBottomNavProps {
  currentTab: 'home' | 'marketplace' | 'orders' | 'sell' | 'admin' | 'seller' | 'schema' | 'profile';
  setCurrentTab: (tab: 'home' | 'marketplace' | 'orders' | 'sell' | 'admin' | 'seller' | 'schema' | 'profile') => void;
  openSellModal: () => void;
  activeOrdersCount: number;
  kycStatus?: KycStatus;
  userRole?: UserRole;
  onOpenKycModal?: () => void;
  sellerTab?: SellerTabType;
  onSellerTabChange?: (tab: SellerTabType) => void;
  onSwitchToBuyerMode?: () => void;
  pendingSalesCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  setCurrentTab,
  openSellModal,
  activeOrdersCount,
  kycStatus = 'UNSUBMITTED',
  userRole = 'BUYER',
  onOpenKycModal,
  sellerTab = 'overview',
  onSellerTabChange,
  onSwitchToBuyerMode,
  pendingSalesCount = 0,
}) => {
  const { t, isMM } = useLanguage();

  const handleSellClick = () => {
    if (userRole !== 'ADMIN' && userRole !== 'SELLER' && kycStatus !== 'VERIFIED') {
      if (onOpenKycModal) {
        onOpenKycModal();
      } else {
        openSellModal();
      }
    } else {
      openSellModal();
    }
  };

  // -------------------------------------------------------------
  // DEDICATED SELLER BOTTOM NAVIGATION (When in Seller Studio)
  // -------------------------------------------------------------
  if (currentTab === 'seller') {
    return (
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-emerald-500/30 px-1 py-1 shadow-[0_-8px_25px_-3px_rgba(16,185,129,0.25)] transition-colors duration-200 safe-area-inset-bottom">
        <div className="flex items-center justify-around max-w-md mx-auto relative">
          
          {/* Tab 1: Overview (Dashboard Icon) */}
          <button
            type="button"
            onClick={() => onSellerTabChange && onSellerTabChange('overview')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all duration-200 min-w-[56px] min-h-[48px] cursor-pointer ${
              sellerTab === 'overview'
                ? 'text-emerald-400 font-black scale-105'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <div className="relative">
              <LayoutDashboard className={`w-5 h-5 mb-0.5 transition-transform ${sellerTab === 'overview' ? 'scale-110 stroke-[2.5]' : ''}`} />
              {sellerTab === 'overview' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </div>
            <span className="text-[10px] tracking-tight">{t('sellerStudio.nav.overview')}</span>
          </button>

          {/* Tab 2: Listings (Package/Box Icon) */}
          <button
            type="button"
            onClick={() => onSellerTabChange && onSellerTabChange('listings')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all duration-200 min-w-[56px] min-h-[48px] cursor-pointer ${
              sellerTab === 'listings'
                ? 'text-emerald-400 font-black scale-105'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <div className="relative">
              <Package className={`w-5 h-5 mb-0.5 transition-transform ${sellerTab === 'listings' ? 'scale-110 stroke-[2.5]' : ''}`} />
              {sellerTab === 'listings' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </div>
            <span className="text-[10px] tracking-tight">{t('sellerStudio.nav.listings')}</span>
          </button>

          {/* Tab 3: + Sell (Highlighted Center Floating Action Button) */}
          <button
            type="button"
            onClick={openSellModal}
            className="relative -top-3 p-3.5 rounded-full bg-gradient-to-tr from-emerald-400 via-teal-400 to-cyan-400 text-slate-950 shadow-lg shadow-emerald-500/40 hover:scale-110 active:scale-90 transition-all duration-200 border-2 border-slate-950 flex items-center justify-center cursor-pointer group"
            aria-label="Post New Listing"
          >
            <Plus className="w-6 h-6 stroke-[3] group-hover:rotate-90 transition-transform duration-200" />
          </button>

          {/* Tab 4: Sales (Receipt/Orders Icon) */}
          <button
            type="button"
            onClick={() => onSellerTabChange && onSellerTabChange('sales')}
            className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all duration-200 min-w-[56px] min-h-[48px] cursor-pointer ${
              sellerTab === 'sales'
                ? 'text-emerald-400 font-black scale-105'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <div className="relative">
              <ReceiptText className={`w-5 h-5 mb-0.5 transition-transform ${sellerTab === 'sales' ? 'scale-110 stroke-[2.5]' : ''}`} />
              {pendingSalesCount > 0 && (
                <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-mono font-bold text-[9px] flex items-center justify-center ring-2 ring-slate-950 animate-pulse">
                  {pendingSalesCount}
                </span>
              )}
              {sellerTab === 'sales' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </div>
            <span className="text-[10px] tracking-tight">{t('sellerStudio.nav.sales')}</span>
          </button>

          {/* Tab 5: Wallet (Wallet Icon) */}
          <button
            type="button"
            onClick={() => onSellerTabChange && onSellerTabChange('wallet')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all duration-200 min-w-[56px] min-h-[48px] cursor-pointer ${
              sellerTab === 'wallet'
                ? 'text-emerald-400 font-black scale-105'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <div className="relative">
              <Wallet className={`w-5 h-5 mb-0.5 transition-transform ${sellerTab === 'wallet' ? 'scale-110 stroke-[2.5]' : ''}`} />
              {sellerTab === 'wallet' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </div>
            <span className="text-[10px] tracking-tight">{t('sellerStudio.nav.wallet')}</span>
          </button>

        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STANDARD BUYER BOTTOM NAVIGATION
  // -------------------------------------------------------------
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800/90 px-1 py-1 shadow-[0_-8px_20px_-3px_rgba(0,0,0,0.15)] dark:shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.6)] transition-colors duration-200 safe-area-inset-bottom">
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        
        {/* 1. Home Tab (Home Icon) */}
        <button
          type="button"
          onClick={() => setCurrentTab('home')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all duration-200 min-w-[56px] min-h-[48px] cursor-pointer ${
            currentTab === 'home'
              ? 'text-cyan-600 dark:text-cyan-400 font-bold scale-105'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Home className={`w-5 h-5 mb-0.5 transition-transform ${currentTab === 'home' ? 'scale-110 stroke-[2.5]' : ''}`} />
            {currentTab === 'home' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-500" />
            )}
          </div>
          <span className="text-[10px] tracking-tight">{isMM ? 'ပင်မ' : 'Home'}</span>
        </button>

        {/* 2. Market Tab (ShoppingBag Icon) */}
        <button
          type="button"
          onClick={() => setCurrentTab('marketplace')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all duration-200 min-w-[56px] min-h-[48px] cursor-pointer ${
            currentTab === 'marketplace'
              ? 'text-cyan-600 dark:text-cyan-400 font-bold scale-105'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <ShoppingBag className={`w-5 h-5 mb-0.5 transition-transform ${currentTab === 'marketplace' ? 'scale-110 stroke-[2.5]' : ''}`} />
            {currentTab === 'marketplace' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-500" />
            )}
          </div>
          <span className="text-[10px] tracking-tight">{isMM ? 'စျေးကွက်' : 'Market'}</span>
        </button>

        {/* 3. Sell / "+" (Centered Highlighted Action Button) */}
        <button
          type="button"
          onClick={handleSellClick}
          className="relative -top-3 p-3 rounded-full bg-gradient-to-tr from-cyan-500 via-teal-500 to-emerald-500 text-slate-950 shadow-lg shadow-cyan-500/40 hover:scale-110 active:scale-90 transition-all duration-200 border-2 border-white dark:border-slate-950 flex items-center justify-center cursor-pointer group"
          aria-label="Sell Account / Post Listing"
        >
          <Plus className="w-6 h-6 stroke-[3] group-hover:rotate-90 transition-transform duration-200" />
        </button>

        {/* 4. Orders Tab (Receipt / Clipboard Icon) */}
        <button
          type="button"
          onClick={() => setCurrentTab('orders')}
          className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all duration-200 min-w-[56px] min-h-[48px] cursor-pointer ${
            currentTab === 'orders'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <ReceiptText className={`w-5 h-5 mb-0.5 transition-transform ${currentTab === 'orders' ? 'scale-110 stroke-[2.5]' : ''}`} />
            {activeOrdersCount > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 font-mono font-bold text-[9px] flex items-center justify-center ring-2 ring-white dark:ring-slate-950 animate-pulse">
                {activeOrdersCount}
              </span>
            )}
            {currentTab === 'orders' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-500" />
            )}
          </div>
          <span className="text-[10px] tracking-tight">{isMM ? 'အမှာစာများ' : 'Orders'}</span>
        </button>

        {/* 5. Profile Tab (User Icon) */}
        <button
          type="button"
          onClick={() => setCurrentTab('profile')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all duration-200 min-w-[56px] min-h-[48px] cursor-pointer ${
            currentTab === 'profile'
              ? 'text-purple-600 dark:text-purple-400 font-bold scale-105'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <User className={`w-5 h-5 mb-0.5 transition-transform ${currentTab === 'profile' ? 'scale-110 stroke-[2.5]' : ''}`} />
            {currentTab === 'profile' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-purple-500" />
            )}
          </div>
          <span className="text-[10px] tracking-tight">{isMM ? 'ပရိုဖိုင်' : 'Profile'}</span>
        </button>

      </div>
    </div>
  );
};

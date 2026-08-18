import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { UserRole, KycStatus } from '../types';
import {
  Layers,
  LayoutDashboard,
  Plus,
  MessageSquareText,
  User,
  ShieldCheck,
} from 'lucide-react';

interface MobileBottomNavProps {
  currentTab: 'marketplace' | 'orders' | 'sell' | 'admin' | 'seller' | 'schema' | 'profile';
  setCurrentTab: (tab: 'marketplace' | 'orders' | 'sell' | 'admin' | 'seller' | 'schema' | 'profile') => void;
  openSellModal: () => void;
  activeOrdersCount: number;
  kycStatus?: KycStatus;
  userRole?: UserRole;
  onOpenKycModal?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  setCurrentTab,
  openSellModal,
  activeOrdersCount,
  kycStatus = 'UNSUBMITTED',
  userRole = 'BUYER',
  onOpenKycModal,
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

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800/90 px-2 py-1 shadow-[0_-8px_20px_-3px_rgba(0,0,0,0.15)] dark:shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.5)] transition-colors duration-200">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Tab 1: Market (စျေးကွက်) */}
        <button
          onClick={() => setCurrentTab('marketplace')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-200 min-w-[54px] min-h-[48px] ${
            currentTab === 'marketplace'
              ? 'text-cyan-600 dark:text-cyan-400 font-bold scale-105'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Layers className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">{isMM ? 'စျေးကွက်' : 'Market'}</span>
        </button>

        {/* Tab 2: Seller Studio (စတူဒီယို) */}
        <button
          onClick={() => setCurrentTab('seller')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-200 min-w-[54px] min-h-[48px] ${
            currentTab === 'seller'
              ? 'text-amber-500 dark:text-amber-400 font-bold scale-105'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">{isMM ? 'စတူဒီယို' : 'Studio'}</span>
        </button>

        {/* Tab 3: Sell Account (+) [Center Action] */}
        <button
          onClick={handleSellClick}
          className="relative -top-2.5 p-3 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-600 to-emerald-500 text-slate-950 shadow-lg shadow-cyan-500/40 hover:scale-110 active:scale-95 transition-all duration-200 border-2 border-white dark:border-slate-950 flex items-center justify-center cursor-pointer"
          aria-label="Sell Account"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>

        {/* Tab 4: Notifications / Orders / Chat (အကြောင်းကြားစာ) */}
        <button
          onClick={() => setCurrentTab('orders')}
          className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-200 min-w-[54px] min-h-[48px] ${
            currentTab === 'orders'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <MessageSquareText className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">{isMM ? 'အမှာစာ/ချက်' : 'Orders'}</span>
          {activeOrdersCount > 0 && (
            <span className="absolute top-1 right-2 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 font-mono font-bold text-[9px] flex items-center justify-center ring-2 ring-white dark:ring-slate-950 animate-pulse">
              {activeOrdersCount}
            </span>
          )}
        </button>

        {/* Tab 5: Profile (ပရိုဖိုင်) */}
        <button
          onClick={() => setCurrentTab('profile')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-200 min-w-[54px] min-h-[48px] ${
            currentTab === 'profile'
              ? 'text-cyan-600 dark:text-cyan-400 font-bold scale-105'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">{isMM ? 'ပရိုဖိုင်' : 'Profile'}</span>
        </button>
      </div>
    </div>
  );
};

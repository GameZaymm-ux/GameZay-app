import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { GameType } from '../types';
import {
  ShieldCheck,
  Lock,
  Zap,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface HeroSectionProps {
  selectedGame?: GameType | 'all';
  setSelectedGame?: (game: GameType | 'all') => void;
  openSellModal?: () => void;
  scrollToMarketplace?: () => void;
  onExploreAccounts?: () => void;
  onSellAccount?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  selectedGame,
  setSelectedGame,
  openSellModal,
  scrollToMarketplace,
  onExploreAccounts,
  onSellAccount,
}) => {
  const { t, isMM } = useLanguage();

  const handleExplore = () => {
    if (onExploreAccounts) {
      onExploreAccounts();
    } else if (scrollToMarketplace) {
      scrollToMarketplace();
    } else {
      const el = document.getElementById('marketplace-listings');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSell = () => {
    if (onSellAccount) {
      onSellAccount();
    } else if (openSellModal) {
      openSellModal();
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-8 pb-12 border-b border-slate-800">
      {/* Background Decorative Glow Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-20 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[600px] h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}
      />

      <div className="relative w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        {/* Main Hero Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Left Column: Heading, Value Props & CTAs */}
          <div className="col-span-1 md:col-span-7 text-center md:text-left space-y-5 sm:space-y-6">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-cyan-950/80 to-emerald-950/80 border border-cyan-500/30 shadow-lg text-xs font-semibold text-cyan-300">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-spin-slow" />
              <span>{t('hero.badge')}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              {t('hero.title')}{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-emerald-300 to-amber-300 bg-clip-text text-transparent drop-shadow-sm block sm:inline">
                {t('hero.highlight')}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base lg:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto md:mx-0">
              {t('hero.subtitle')}
            </p>

            {/* Myanmar Local Payment Pills */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
                {isMM ? 'ငွေပေးချေနည်းများ:' : 'Payments:'}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-blue-950/80 border border-blue-500/40 text-[11px] font-bold text-blue-300 flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                KBZPay
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-amber-950/80 border border-amber-500/40 text-[11px] font-bold text-amber-300 flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                WaveMoney
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-rose-950/80 border border-rose-500/40 text-[11px] font-bold text-rose-300 flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                AyaPay
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-indigo-950/80 border border-indigo-500/40 text-[11px] font-bold text-indigo-300 flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                CB Pay
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-[11px] font-bold text-emerald-300 flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                USDT (TRC20)
              </span>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 sm:gap-4 pt-2">
              <button
                onClick={handleExplore}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span>{t('hero.exploreBtn')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleSell}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-white font-bold text-sm tracking-wide transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>{t('hero.sellBtn')}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Escrow Mechanism Card */}
          <div className="col-span-1 md:col-span-5 w-full">
            <div className="relative rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-cyan-500/30 p-4 sm:p-6 shadow-2xl backdrop-blur-xl w-full">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40">
                    <ShieldCheck className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">
                      {t('hero.guaranteeTitle')}
                    </h2>
                    <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {isMM ? '၁၀၀% ငွေပြန်အမ်း အာမခံ' : '100% Money-Back Escrow Policy'}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-mono font-bold px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  v2.4
                </span>
              </div>

              {/* 4-Step Flowchart */}
              <div className="py-4 space-y-3">
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-slate-200">
                      {isMM ? 'ဝယ်သူ KPay / WavePay ဖြင့် ငွေလွှဲ' : 'Buyer deposits to Escrow'}
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      {isMM ? 'ငွေပမာဏကို GameZay Platform က လုံခြုံစွာ ထိန်းသိမ်းထားပါသည်' : 'Funds are locked securely in GameZay escrow vault'}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-slate-200">
                      {isMM ? 'ရောင်းသူထံမှ အကောင့်ရယူခြင်း' : 'Credential Handoff & Inspection'}
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      {isMM ? 'Login အချက်အလက်များကို ဝှက်စာဖြေပြီး ဝယ်သူထံ ချက်ချင်း ပို့ပေးပါသည်' : 'Encrypted login & 2FA codes are decrypted for the buyer'}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-slate-200">
                      {isMM ? '၂၄ နာရီ စစ်ဆေးခွင့်နှင့် အာမခံ' : '24-Hour Buyer Warranty'}
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      {isMM ? 'အကောင့်ဝင်စစ်ဆေးပြီး စကားဝှက်နှင့် ဖုန်းနံပါတ် အသစ်ချိတ်ဆက်ပါ' : 'Verify squad/skins, bind recovery email & test login'}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/40 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    4
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-slate-200">
                      {isMM ? 'ဝယ်သူ အတည်ပြုပြီးမှ ရောင်းသူထံ ငွေထုတ်ပေး' : 'Payment Released to Seller'}
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      {isMM ? 'နှစ်ဖက်လုံး စိတ်ကျေနပ်မှုရရှိကာ လိမ်လည်မှုမှ ၁၀၀% ကာကွယ်ထားပါသည်' : 'Auto payout to Seller KPay / Wave wallet on confirmation'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Guarantee Note */}
              <div className="pt-2 text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t('hero.guaranteeDesc')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Marketplace Statistics Banner */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-slate-800/80">
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 text-center">
            <div className="text-2xl sm:text-3xl font-black text-cyan-400">
              {t('hero.statVolume')}
            </div>
            <div className="text-xs text-slate-400 font-medium mt-1">
              {t('hero.statVolumeLabel')}
            </div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 text-center">
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">
              {t('hero.statAccounts')}
            </div>
            <div className="text-xs text-slate-400 font-medium mt-1">
              {t('hero.statAccountsLabel')}
            </div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 text-center">
            <div className="text-2xl sm:text-3xl font-black text-amber-400">
              {t('hero.statSellers')}
            </div>
            <div className="text-xs text-slate-400 font-medium mt-1">
              {t('hero.statSellersLabel')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { AccountListing, GameType } from '../types';
import { ListingCard } from './ListingCard';
import {
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Lock,
  UserCheck,
  CheckCircle2,
  Gamepad2,
  ChevronRight,
  Flame,
  Star,
  Shield,
  Layers,
  ArrowUpRight,
  PlusCircle,
  HelpCircle,
} from 'lucide-react';

interface HomePageViewProps {
  listings: AccountListing[];
  onSelectGame: (game: GameType | 'all') => void;
  onNavigateToMarketplace: (game?: GameType | 'all') => void;
  onOpenSellModal: () => void;
  onInspectListing: (listing: AccountListing) => void;
  onBuyListing: (listing: AccountListing) => void;
}

export const HomePageView: React.FC<HomePageViewProps> = ({
  listings,
  onSelectGame,
  onNavigateToMarketplace,
  onOpenSellModal,
  onInspectListing,
  onBuyListing,
}) => {
  const { t, isMM } = useLanguage();

  const [activeBannerSlide, setActiveBannerSlide] = useState(0);

  // Top featured / trending listings
  const trendingListings = listings.slice(0, 6);

  const gameCategories: { id: GameType | 'all'; name: string; nameMM: string; icon: string; count: number; bg: string }[] = [
    { id: 'mlbb', name: 'Mobile Legends', nameMM: 'မိုဘိုင်းလဲဂျန်း', icon: '⚔️', count: listings.filter(l => l.gameType === 'mlbb').length, bg: 'from-amber-500/20 to-orange-500/10' },
    { id: 'efootball', name: 'eFootball 2026', nameMM: 'အီးဖူဘော', icon: '⚽', count: listings.filter(l => l.gameType === 'efootball').length, bg: 'from-blue-500/20 to-cyan-500/10' },
    { id: 'pubg', name: 'PUBG Mobile', nameMM: 'ပတ်ဘ်ဂျီ', icon: '🎯', count: listings.filter(l => l.gameType === 'pubg').length, bg: 'from-orange-500/20 to-rose-500/10' },
    { id: 'coc', name: 'Clash of Clans', nameMM: 'စီအိုစီ', icon: '🏰', count: listings.filter(l => l.gameType === 'coc').length, bg: 'from-yellow-500/20 to-amber-500/10' },
    { id: 'freefire', name: 'Free Fire', nameMM: 'ဖရီးဖိုင်းယား', icon: '🔥', count: listings.filter(l => l.gameType === 'freefire').length, bg: 'from-rose-500/20 to-red-500/10' },
    { id: 'genshin', name: 'Genshin Impact', nameMM: 'ဂျန်ရှင်း', icon: '✨', count: listings.filter(l => l.gameType === 'genshin').length, bg: 'from-purple-500/20 to-indigo-500/10' },
  ];

  const topSellers = [
    {
      name: 'Ko Thura (eFootball Pro MM)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      trades: 428,
      rating: 5.0,
      badge: 'Level 3 Pro Seller',
      verified: true,
      gameFocus: 'eFootball / Konami',
    },
    {
      name: 'May Myat Noe (MM Store)',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      trades: 310,
      rating: 4.98,
      badge: 'Mythic Collector',
      verified: true,
      gameFocus: 'MLBB / Moonton Clean',
    },
    {
      name: 'Min Khant (FF King)',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      trades: 142,
      rating: 4.96,
      badge: 'OG Skins Specialist',
      verified: true,
      gameFocus: 'Free Fire / PUBG',
    },
    {
      name: 'Ei Shwe Zin (Genshin MM)',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      trades: 210,
      rating: 5.0,
      badge: 'Whale Accounts',
      verified: true,
      gameFocus: 'Genshin / Hoyoverse',
    },
  ];

  const bannerSlides = [
    {
      badge: '100% Escrow Protection',
      title: isMM ? 'မြန်မာနိုင်ငံ၏ စိတ်အချရဆုံး ဂိမ်းအကောင့် ရောင်းဝယ်ရေး' : 'Myanmar’s #1 Escrow Game Marketplace',
      desc: isMM
        ? 'ဝယ်သူ အကောင့်စစ်ဆေး အတည်ပြုပြီးမှသာ ရောင်းသူထံသို့ ငွေထုတ်ပေးသည့် လုံခြုံစိတ်ချရသော စနစ်'
        : 'Funds locked in the Escrow vault until the buyer logs in and confirms credentials. 24h inspection guarantee.',
      btnText: isMM ? 'စျေးကွက်ထဲ ရှာဖွေမည်' : 'Explore Marketplace',
      bgGradient: 'from-cyan-950 via-slate-900 to-emerald-950',
      borderColor: 'border-cyan-500/40',
      tagColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    },
    {
      badge: 'Fast Seller Payouts',
      title: isMM ? 'ဂိမ်းအကောင့်များ အခမဲ့တင်ရောင်းပြီး အမြန်ဆုံး ငွေထုတ်ယူပါ' : 'Sell Your Account & Get Instant KPay Payouts',
      desc: isMM
        ? 'KYC အတည်ပြုထားသော ရောင်းသူများအတွက် ဝန်ဆောင်ခ သက်သာပြီး KPay, WavePay, USDT ဖြင့် မိနစ်ပိုင်းအတွင်း ငွေထုတ်ပေးပါသည်'
        : 'Zero listing fee. Over 2,000+ active buyers waiting for MLBB, eFootball, and PUBG accounts daily.',
      btnText: isMM ? 'အကောင့် အခမဲ့တင်ရောင်းမည်' : 'Post an Account',
      bgGradient: 'from-amber-950 via-slate-900 to-purple-950',
      borderColor: 'border-amber-500/40',
      tagColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
  ];

  return (
    <div className="space-y-8 sm:space-y-12 pb-12 animate-in fade-in duration-200">
      {/* 1. HERO PROMOTIONAL BANNER */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-6 pb-8 border-b border-slate-200 dark:border-slate-800">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
          <div className={`p-6 sm:p-10 rounded-3xl bg-gradient-to-r ${bannerSlides[activeBannerSlide].bgGradient} border ${bannerSlides[activeBannerSlide].borderColor} shadow-2xl space-y-5 sm:space-y-6 relative overflow-hidden transition-all duration-300`}>
            
            {/* Background badge icon */}
            <div className="absolute -right-8 -bottom-8 opacity-10 text-white pointer-events-none">
              <Gamepad2 className="w-64 h-64" />
            </div>

            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border flex items-center gap-1.5 ${bannerSlides[activeBannerSlide].tagColor}`}>
                <Sparkles className="w-3.5 h-3.5" />
                <span>{bannerSlides[activeBannerSlide].badge}</span>
              </span>

              {/* Slider Dots */}
              <div className="flex items-center gap-1.5">
                {bannerSlides.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveBannerSlide(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                      activeBannerSlide === idx ? 'bg-cyan-400 w-6' : 'bg-slate-700 hover:bg-slate-500'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="max-w-3xl space-y-3">
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
                {bannerSlides[activeBannerSlide].title}
              </h1>
              <p className="text-xs sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                {bannerSlides[activeBannerSlide].desc}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (activeBannerSlide === 1) {
                    onOpenSellModal();
                  } else {
                    onNavigateToMarketplace('all');
                  }
                }}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-cyan-500/25 transition active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <span>{bannerSlides[activeBannerSlide].btnText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onOpenSellModal}
                className="px-5 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm border border-slate-700 transition flex items-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-cyan-400" />
                <span>{isMM ? 'အကောင့်တင်ရောင်းမည်' : 'Post Listing'}</span>
              </button>
            </div>

            {/* Payment Trust Badges */}
            <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-300">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {isMM ? 'ငွေလွှဲနည်းလမ်းများ:' : 'Protected Payments:'}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-blue-950/80 border border-blue-500/40 text-[11px] font-bold text-blue-300">
                KBZPay
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-amber-950/80 border border-amber-500/40 text-[11px] font-bold text-amber-300">
                WaveMoney
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-[11px] font-bold text-emerald-300">
                USDT TRC20
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-[11px] font-bold text-cyan-300">
                🇹🇭 PromptPay
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. QUICK GAME CATEGORY SHORTCUTS */}
      <section className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-cyan-500" />
            <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white">
              {isMM ? 'ဂိမ်းအမျိုးအစားများ' : 'Game Categories'}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigateToMarketplace('all')}
            className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{isMM ? 'အားလုံးကြည့်ရန်' : 'View All'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
          {gameCategories.map((g) => (
            <div
              key={g.id}
              onClick={() => onNavigateToMarketplace(g.id)}
              className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-500 hover:shadow-lg hover:shadow-cyan-500/10 transition-all cursor-pointer group text-center space-y-2 active:scale-95"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl mx-auto group-hover:scale-110 transition-transform shadow-sm">
                {g.icon}
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                  {isMM ? g.nameMM : g.name}
                </h3>
                <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono font-medium block">
                  {g.count} {isMM ? 'အကောင့်ရှိ' : 'listings'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. TRENDING & FEATURED ACCOUNTS */}
      <section className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white">
              {isMM ? 'လူကြိုက်များသော ဂိမ်းအကောင့်များ' : 'Trending & Hot Deals'}
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold border border-amber-500/30">
              Hot Picks
            </span>
          </div>

          <button
            type="button"
            onClick={() => onNavigateToMarketplace('all')}
            className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{isMM ? 'စျေးကွက်သို့ သွားမည်' : 'Explore Full Market'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 2-col Mobile / 3-col Desktop Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-2.5 sm:gap-4 lg:gap-5">
          {trendingListings.map((item) => (
            <ListingCard
              key={item.id}
              listing={item}
              onInspect={onInspectListing}
              onBuy={onBuyListing}
            />
          ))}
        </div>

        {/* Big Explore Marketplace CTA Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-cyan-500/10 via-emerald-500/10 to-teal-500/10 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
              {isMM ? 'အခြား ဂိမ်းအကောင့်ပေါင်းများစွာကို စစ်ထုတ်ရှာဖွေလိုပါသလား?' : 'Looking for more specific ranks or skin sets?'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {isMM ? 'စျေးနှုန်း၊ Rank၊ စကင်းအရေအတွက် နှင့် ဆာဗာအလိုက် စိတ်ကြိုက်စစ်ထုတ်ရှာဖွေနိုင်ပါသည်' : 'Search by exact hero, price range, Division, or binding status in our full Marketplace.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigateToMarketplace('all')}
            className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/20 transition active:scale-95 flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            <span>{isMM ? 'စျေးကွက် အပြည့်အစုံ ကြည့်မည်' : 'Open Marketplace'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 4. TOP VERIFIED SELLERS SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-500" />
            <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white">
              {isMM ? 'ထိပ်တန်း ယုံကြည်စိတ်ချရသော ရောင်းသူများ' : 'Top Verified Sellers'}
            </h2>
          </div>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
            ✓ 100% KYC Verified
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {topSellers.map((seller, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm hover:border-cyan-500/40 transition"
            >
              <div className="flex items-center gap-3">
                <img
                  src={seller.avatar}
                  alt={seller.name}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-sm shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                      {seller.name}
                    </h4>
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    {seller.badge}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{seller.rating.toFixed(1)}</span>
                  <span className="text-slate-400 font-normal">({seller.trades})</span>
                </div>
                <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-mono">
                  {seller.gameFocus}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. GAMEZAY 3-STEP ESCROW SAFETY VAULT */}
      <section className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{isMM ? 'GameZay အလယ်လူ အာမခံစနစ်' : 'GameZay 100% Escrow Guarantee'}</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-white">
              {isMM ? 'လိမ်လည်မှု ကင်းဝေးစွာ မည်သို့ ဝယ်ယူရမည်နည်း?' : 'How Does Zero-Scam Escrow Work?'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              {isMM
                ? 'GameZay အလယ်လူစနစ်သည် ဝယ်သူနှင့် ရောင်းသူ နှစ်ဦးစလုံးအတွက် စိတ်ချလုံခြုံမှု အပြည့်ပေးပါသည်'
                : 'Every single transaction is safeguarded in 3 transparent steps with live admin supervision.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 pt-2">
            {/* Step 1 */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 font-black text-base flex items-center justify-center border border-cyan-500/20">
                1
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                {isMM ? 'ငွေကို Escrow Vault သို့ လွှဲမည်' : '1. Buyer Deposits to Escrow'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isMM
                  ? 'ဝယ်သူသည် KPay, WavePay သို့မဟုတ် USDT ဖြင့် GameZay Vault သို့ ငွေလွှဲပြီး ထိန်းသိမ်းထားပါသည်'
                  : 'Buyer pays through KBZPay, WaveMoney, or USDT. Funds are locked securely in GameZay Vault.'}
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 font-black text-base flex items-center justify-center border border-amber-500/20">
                2
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                {isMM ? 'ရောင်းသူက အကောင့်အချက်အလက် လွှဲပေးမည်' : '2. Seller Hands Over Account'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isMM
                  ? 'ရောင်းသူသည် Login ID၊ Password နှင့် OTP ကို လုံခြုံသော Escrow Chat တွင် တိုက်ရိုက် ပေးပို့ပါသည်'
                  : 'Seller provides verified login credentials, 2FA codes, and original email binding access.'}
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 font-black text-base flex items-center justify-center border border-emerald-500/20">
                3
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                {isMM ? '၂၄ နာရီ စစ်ဆေးပြီးမှ ငွေထုတ်ပေးမည်' : '3. 24h Inspection & Release'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isMM
                  ? 'ဝယ်သူက အကောင့်ကို စိတ်ကြိုက်စစ်ဆေးပြီး အတည်ပြုမှသာ ရောင်းသူထံသို့ ငွေထုတ်ပေးပါသည်'
                  : 'Buyer confirms game skins and rank. Only after buyer approval are funds released to the seller.'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

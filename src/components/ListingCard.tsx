import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { AccountListing, EfootballAttributes, MLBBAttributes, PUBGAttributes, COCAttributes } from '../types';
import {
  ShieldCheck,
  Zap,
  Star,
  Eye,
  CheckCircle,
  Sparkles,
  Lock,
  ArrowUpRight,
  Shield,
  Coins,
  Crown,
} from 'lucide-react';

interface ListingCardProps {
  listing: AccountListing;
  onInspect: (listing: AccountListing) => void;
  onBuy: (listing: AccountListing) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  onInspect,
  onBuy,
}) => {
  const { t, formatMMK, formatTHB, formatPrice, formatDualPrice, isMM } = useLanguage();

  const dualPrice = formatDualPrice(listing.priceMMK);

  const getGameBadge = () => {
    switch (listing.gameType) {
      case 'efootball':
        return { label: 'eFootball', color: 'bg-blue-600 text-white', icon: '⚽' };
      case 'mlbb':
        return { label: 'MLBB', color: 'bg-amber-600 text-white', icon: '⚔️' };
      case 'pubg':
        return { label: 'PUBG Mobile', color: 'bg-orange-600 text-white', icon: '🎯' };
      case 'coc':
        return { label: 'Clash of Clans', color: 'bg-yellow-600 text-white', icon: '🏰' };
      case 'freefire':
        return { label: 'Free Fire', color: 'bg-rose-600 text-white', icon: '🔥' };
      case 'genshin':
        return { label: 'Genshin', color: 'bg-purple-600 text-white', icon: '✨' };
      default:
        return { label: 'Game', color: 'bg-slate-700 text-white', icon: '🎮' };
    }
  };

  const badge = getGameBadge();

  // Render game-specific feature tags (compact for 2-column mobile and multi-column desktop)
  const renderSpecPills = () => {
    if (!listing?.attributes) return null;

    if (listing.gameType === 'efootball') {
      const attrs = listing.attributes as EfootballAttributes;
      return (
        <div className="flex flex-wrap gap-1 mt-1.5 sm:mt-2">
          {attrs?.squadRating !== undefined && (
            <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-300 text-[10px] sm:text-[11px] font-bold">
              ⚡ {attrs.squadRating} OVR
            </span>
          )}
          {attrs?.epicCount !== undefined && (
            <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-300 text-[10px] sm:text-[11px] font-bold">
              🌟 {attrs.epicCount} Epics
            </span>
          )}
          {attrs?.coins !== undefined && attrs.coins > 0 && (
            <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 text-[10px] sm:text-[11px] font-bold flex items-center gap-0.5">
              🪙 {attrs.coins.toLocaleString()}
            </span>
          )}
          {attrs?.division !== undefined && (
            <span className="hidden sm:inline-block px-1.5 sm:px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] sm:text-[11px]">
              🏆 Div {attrs.division}
            </span>
          )}
        </div>
      );
    }

    if (listing.gameType === 'mlbb') {
      const attrs = listing.attributes as MLBBAttributes;
      return (
        <div className="flex flex-wrap gap-1 mt-1.5 sm:mt-2">
          {attrs?.currentRank && (
            <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 text-[10px] sm:text-[11px] font-bold truncate max-w-[120px]">
              👑 {attrs.currentRank}
            </span>
          )}
          {attrs?.winRate !== undefined && (
            <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[10px] sm:text-[11px] font-bold">
              🎯 {attrs.winRate}% WR
            </span>
          )}
          {attrs?.collectorSkins !== undefined && (
            <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-300 text-[10px] sm:text-[11px]">
              ✨ {attrs.collectorSkins} Skins
            </span>
          )}
        </div>
      );
    }

    if (listing.gameType === 'pubg') {
      const attrs = listing.attributes as PUBGAttributes;
      const glacierStr = attrs?.glacierLevel ? String(attrs.glacierLevel).split(' ')[0] : 'Max';
      return (
        <div className="flex flex-wrap gap-1 mt-1.5 sm:mt-2">
          <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-cyan-50 dark:bg-cyan-950/80 border border-cyan-200 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-[10px] sm:text-[11px] font-bold truncate max-w-[120px]">
            ❄️ {glacierStr}
          </span>
          {attrs?.level !== undefined && (
            <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-orange-50 dark:bg-orange-950/80 border border-orange-200 dark:border-orange-500/30 text-orange-700 dark:text-orange-300 text-[10px] sm:text-[11px] font-bold">
              🎖️ Lvl {attrs.level}
            </span>
          )}
          {attrs?.mythicFashion !== undefined && (
            <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-[10px] sm:text-[11px]">
              🦹 {attrs.mythicFashion} Myth
            </span>
          )}
        </div>
      );
    }

    if (listing.gameType === 'coc') {
      const attrs = listing.attributes as COCAttributes;
      return (
        <div className="flex flex-wrap gap-1 mt-1.5 sm:mt-2">
          {attrs?.townHall !== undefined && (
            <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-yellow-50 dark:bg-yellow-950/80 border border-yellow-200 dark:border-yellow-500/30 text-yellow-800 dark:text-yellow-300 text-[10px] sm:text-[11px] font-bold">
              🏰 TH {attrs.townHall}
            </span>
          )}
          <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-[10px] sm:text-[11px] font-bold">
            👑 K{attrs?.kingLevel ?? 0}/Q{attrs?.queenLevel ?? 0}
          </span>
          {attrs?.gems !== undefined && (
            <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[10px] sm:text-[11px]">
              💎 {Number(attrs.gems).toLocaleString()}
            </span>
          )}
        </div>
      );
    }

    if (listing.gameType === 'freefire') {
      const attrs = (listing.attributes || {}) as Record<string, any>;
      return (
        <div className="flex flex-wrap gap-1 mt-1.5 sm:mt-2">
          <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-[10px] sm:text-[11px] font-bold">
            🔥 {attrs.rank || 'Master'}
          </span>
          <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 text-[10px] sm:text-[11px] font-bold">
            🎖️ Lvl {attrs.level || 78}
          </span>
          <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-300 text-[10px] sm:text-[11px]">
            ✨ {attrs.evoGunsMax || 4} Evo Max
          </span>
        </div>
      );
    }

    if (listing.gameType === 'genshin') {
      const attrs = (listing.attributes || {}) as Record<string, any>;
      return (
        <div className="flex flex-wrap gap-1 mt-1.5 sm:mt-2">
          <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-300 text-[10px] sm:text-[11px] font-bold">
            ✨ AR {attrs.adventureRank || 60}
          </span>
          <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-cyan-50 dark:bg-cyan-950/80 border border-cyan-200 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-[10px] sm:text-[11px] font-bold">
            🌟 {attrs.fiveStarChars || 38} 5-Star
          </span>
          <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 text-[10px] sm:text-[11px]">
            💎 {attrs.primogems ? Number(attrs.primogems).toLocaleString() : '24k'}
          </span>
        </div>
      );
    }

    return null;
  };

  const isPro = Boolean(listing.isProMerchant || listing.seller?.isProMerchant);

  return (
    <div
      className={`group relative w-full rounded-2xl bg-white dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-900 border transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col overflow-hidden active:scale-[0.99] ${
        isPro
          ? 'border-amber-400/50 dark:border-amber-500/40 hover:border-amber-400 shadow-amber-500/5 hover:shadow-amber-500/15 ring-1 ring-amber-500/20'
          : 'border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 hover:shadow-cyan-500/10'
      }`}
    >
      {/* 1. Consistent Image Container (aspect-[4/3] ratio for all screen sizes) */}
      <div
        onClick={() => onInspect(listing)}
        className="relative aspect-[4/3] w-full overflow-hidden cursor-pointer bg-slate-950 select-none"
      >
        <img
          src={listing.bannerUrl}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient Overlays */}
        <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-slate-950/80 via-slate-950/30 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent pointer-events-none" />

        {/* Top-Left: Game Category Badge */}
        <div className="absolute top-2 sm:top-2.5 left-2 sm:left-2.5 flex items-center gap-1 z-10">
          <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-black flex items-center gap-1 shadow-lg ${badge.color}`}>
            <span>{badge.icon}</span>
            <span>{badge.label}</span>
          </span>
        </div>

        {/* Top-Right: Golden PRO MERCHANT Badge or Escrow Shield */}
        <div className="absolute top-2 sm:top-2.5 right-2 sm:right-2.5 z-10 flex items-center gap-1">
          {isPro && (
            <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 text-[9px] sm:text-[10px] font-black flex items-center gap-1 shadow-lg shadow-amber-500/30 tracking-tight animate-in fade-in">
              <Crown className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-slate-950" />
              <span>PRO</span>
            </span>
          )}
          <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg bg-slate-950/85 border border-cyan-500/40 text-cyan-300 text-[9px] sm:text-[11px] font-bold flex items-center gap-1 backdrop-blur-md shadow-lg">
            <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400" />
            <span>Escrow</span>
          </span>
        </div>

        {/* Bottom Badges: Instant Delivery & View Count */}
        <div className="absolute bottom-2 inset-x-2 sm:inset-x-2.5 flex items-center justify-between z-10">
          <div>
            {listing.instantDelivery ? (
              <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-emerald-950/85 border border-emerald-500/40 text-emerald-300 text-[9px] sm:text-[10px] font-bold flex items-center gap-0.5 sm:gap-1 backdrop-blur-md">
                <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400 shrink-0" />
                <span className="hidden xs:inline">{t('card.instantDelivery')}</span>
                <span className="xs:hidden">Instant</span>
              </span>
            ) : (
              <span />
            )}
          </div>

          <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-300 bg-slate-950/85 px-1.5 sm:px-2 py-0.5 rounded-md backdrop-blur-sm border border-white/10 font-mono">
            <Eye className="w-3 h-3 text-slate-400 shrink-0" />
            <span>{listing.views}</span>
          </div>
        </div>
      </div>

      {/* 2. Card Content Body */}
      <div className="p-2.5 sm:p-3.5 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3">
        <div>
          {/* Account Title (Clean 2-line clamp with uniform height) */}
          <h3
            onClick={() => onInspect(listing)}
            className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors line-clamp-2 cursor-pointer leading-tight sm:leading-snug min-h-[2rem] sm:min-h-[2.5rem]"
            title={listing.title}
          >
            {listing.title}
          </h3>

          {/* Top Key Spec Highlights */}
          {renderSpecPills()}

          {/* Binding Security Status */}
          <div className="mt-1.5 sm:mt-2 flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
            <Lock className="w-3 h-3 text-emerald-500 shrink-0" />
            <span className="truncate">{listing.bindingStatus}</span>
          </div>
        </div>

        {/* 3. Card Footer: Seller Info & Dual Price & CTA */}
        <div className="pt-2 sm:pt-2.5 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
          {/* Seller Line */}
          <div className="flex items-center justify-between text-[10px] sm:text-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="relative shrink-0">
                <img
                  src={listing.seller?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                  alt={listing.seller?.name || 'Seller'}
                  className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full object-cover border ${
                    isPro
                      ? 'border-amber-400 ring-1 ring-amber-400/50'
                      : 'border-slate-300 dark:border-slate-700'
                  }`}
                />
                {isPro && (
                  <Crown className="w-2.5 h-2.5 absolute -top-1 -right-1 text-amber-500 fill-amber-400" />
                )}
              </div>
              <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[80px] sm:max-w-[110px]">
                {listing.seller?.name || 'Verified Seller'}
              </span>
              {isPro ? (
                <span
                  title="PRO MERCHANT"
                  className="px-1 py-0.2 rounded bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[9px] font-black font-mono shrink-0 flex items-center gap-0.5"
                >
                  <Crown className="w-2.5 h-2.5 fill-amber-400" />
                  <span>PRO</span>
                </span>
              ) : listing.isVerifiedSeller ? (
                <span title={t('card.verifiedSeller')}>
                  <CheckCircle className="w-3 h-3 text-cyan-500 shrink-0" />
                </span>
              ) : null}
            </div>

            <div className="flex items-center gap-0.5 sm:gap-1 text-amber-500 font-bold text-[10px] sm:text-[11px] shrink-0 font-mono">
              <Star className="w-3 h-3 fill-amber-400" />
              <span>{typeof listing.seller?.rating === 'number' ? listing.seller.rating.toFixed(1) : '5.0'}</span>
            </div>
          </div>

          {/* Price & Action Buttons */}
          <div className="flex items-end justify-between gap-1.5 pt-0.5">
            {/* Dual Currency Price */}
            <div className="min-w-0">
              <div className="text-xs sm:text-base font-black text-slate-900 dark:text-white font-mono leading-none truncate">
                {dualPrice.primary}
              </div>
              <div className="text-[9px] sm:text-[11px] text-cyan-600 dark:text-cyan-400 font-mono font-medium mt-0.5 truncate">
                {dualPrice.secondary}
              </div>
            </div>

            {/* Quick Actions (Inspect & Buy) */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => onInspect(listing)}
                className="p-1.5 sm:px-2 sm:py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer active:scale-90"
                title={t('card.viewDetails')}
                aria-label="Inspect Account"
              >
                <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              <button
                type="button"
                onClick={() => onBuy(listing)}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 text-[11px] sm:text-xs font-black shadow-md shadow-cyan-500/20 transition active:scale-95 flex items-center gap-1 cursor-pointer"
              >
                <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span className="hidden sm:inline">{t('card.buyNow')}</span>
                <span className="sm:hidden">Buy</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

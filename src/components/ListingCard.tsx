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
  const { t, formatMMK, formatTHB, formatPrice, formatDualPrice, currency, isMM } = useLanguage();

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
      default:
        return { label: 'Game', color: 'bg-slate-700 text-white', icon: '🎮' };
    }
  };

  const badge = getGameBadge();

  // Render game-specific feature tags
  const renderSpecPills = () => {
    if (listing.gameType === 'efootball') {
      const attrs = listing.attributes as EfootballAttributes;
      return (
        <div className="flex flex-wrap gap-1.5 mt-2">
          <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-300 text-[11px] font-bold">
            ⚡ {attrs.squadRating} OVR
          </span>
          <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-300 text-[11px] font-bold">
            🌟 {attrs.epicCount} Epics
          </span>
          {attrs.coins !== undefined && (
            <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 text-[11px] font-bold flex items-center gap-1">
              🪙 {attrs.coins.toLocaleString()} Coins
            </span>
          )}
          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px]">
            🏆 Div {attrs.division}
          </span>
        </div>
      );
    }

    if (listing.gameType === 'mlbb') {
      const attrs = listing.attributes as MLBBAttributes;
      return (
        <div className="flex flex-wrap gap-1.5 mt-2">
          <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 text-[11px] font-bold">
            👑 {attrs.currentRank}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
            🎯 {attrs.winRate}% WR
          </span>
          <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-300 text-[11px]">
            ✨ {attrs.collectorSkins} Collector
          </span>
        </div>
      );
    }

    if (listing.gameType === 'pubg') {
      const attrs = listing.attributes as PUBGAttributes;
      return (
        <div className="flex flex-wrap gap-1.5 mt-2">
          <span className="px-2 py-0.5 rounded-md bg-cyan-50 dark:bg-cyan-950/80 border border-cyan-200 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-[11px] font-bold">
            ❄️ {attrs.glacierLevel.split(' ')[0]} Max
          </span>
          <span className="px-2 py-0.5 rounded-md bg-orange-50 dark:bg-orange-950/80 border border-orange-200 dark:border-orange-500/30 text-orange-700 dark:text-orange-300 text-[11px] font-bold">
            🎖️ Lvl {attrs.level}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-[11px]">
            🦹 {attrs.mythicFashion} Mythics
          </span>
        </div>
      );
    }

    if (listing.gameType === 'coc') {
      const attrs = listing.attributes as COCAttributes;
      return (
        <div className="flex flex-wrap gap-1.5 mt-2">
          <span className="px-2 py-0.5 rounded-md bg-yellow-50 dark:bg-yellow-950/80 border border-yellow-200 dark:border-yellow-500/30 text-yellow-800 dark:text-yellow-300 text-[11px] font-bold">
            🏰 TH {attrs.townHall} Max
          </span>
          <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold">
            👑 K{attrs.kingLevel} / Q{attrs.queenLevel}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[11px]">
            💎 {attrs.gems} Gems
          </span>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="group relative w-full rounded-2xl bg-white dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 transition-all duration-300 shadow-md dark:shadow-xl hover:shadow-cyan-500/10 flex flex-col overflow-hidden">
      {/* Image Banner Container */}
      <div
        onClick={() => onInspect(listing)}
        className="relative h-48 w-full overflow-hidden cursor-pointer bg-slate-950"
      >
        <img
          src={listing.bannerUrl}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg ${badge.color}`}>
            <span>{badge.icon}</span>
            <span>{badge.label}</span>
          </span>

          {listing.instantDelivery && (
            <span className="px-2 py-1 rounded-lg bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold flex items-center gap-1 backdrop-blur-md">
              <Zap className="w-3 h-3 text-emerald-400" />
              <span>{t('card.instantDelivery')}</span>
            </span>
          )}
        </div>

        {/* Escrow Guarantee Pill */}
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 rounded-lg bg-slate-950/85 border border-cyan-500/40 text-cyan-300 text-[11px] font-bold flex items-center gap-1 backdrop-blur-md shadow-lg">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Escrow</span>
          </span>
        </div>

        {/* View Count Badge */}
        <div className="absolute bottom-2.5 right-3 flex items-center gap-1 text-[11px] text-slate-300 bg-slate-950/80 px-2 py-0.5 rounded-md backdrop-blur-sm">
          <Eye className="w-3 h-3 text-slate-400" />
          <span>{listing.views}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <h3
            onClick={() => onInspect(listing)}
            className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition line-clamp-2 cursor-pointer leading-snug"
          >
            {listing.title}
          </h3>

          {/* Dynamic spec tags */}
          {renderSpecPills()}

          {/* Binding status */}
          <div className="mt-2.5 flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
            <Lock className="w-3 h-3 text-emerald-500 shrink-0" />
            <span className="truncate">{listing.bindingStatus}</span>
          </div>
        </div>

        {/* Card Footer: Seller & Price & CTAs */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          {/* Seller Row */}
          <div className="flex items-center justify-between mb-3 text-xs">
            <div className="flex items-center gap-2">
              <img
                src={listing.seller.avatar}
                alt={listing.seller.name}
                className="w-5 h-5 rounded-full object-cover border border-slate-300 dark:border-slate-700"
              />
              <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[120px]">
                {listing.seller.name}
              </span>
              {listing.isVerifiedSeller && (
                <CheckCircle className="w-3.5 h-3.5 text-cyan-500 shrink-0" title={t('card.verifiedSeller')} />
              )}
            </div>

            <div className="flex items-center gap-1 text-amber-500 font-bold text-[11px]">
              <Star className="w-3 h-3 fill-amber-400" />
              <span>{listing.seller.rating.toFixed(1)}</span>
              <span className="text-slate-400 font-normal">({listing.seller.tradesCompleted})</span>
            </div>
          </div>

          {/* Price & Action Row */}
          <div className="flex items-end justify-between gap-2">
            <div>
              <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-none font-mono">
                {dualPrice.primary}
              </div>
              <div className="text-[11px] text-cyan-600 dark:text-cyan-400 font-medium mt-0.5 font-mono">
                {dualPrice.secondary}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onInspect(listing)}
                className="px-2.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition cursor-pointer"
                title={t('card.viewDetails')}
              >
                <ArrowUpRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onBuy(listing)}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 text-xs font-black shadow-md shadow-cyan-500/20 transition active:scale-95 flex items-center gap-1 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{t('card.buyNow')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { GameType } from '../types';
import { X, CheckCircle2, SlidersHorizontal, ArrowUpDown, RotateCcw, Crown } from 'lucide-react';

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGame: GameType | 'all';
  setSelectedGame: (game: GameType | 'all') => void;
  verifiedOnly: boolean;
  setVerifiedOnly: (val: boolean) => void;
  proMerchantsOnly?: boolean;
  setProMerchantsOnly?: (val: boolean) => void;
  sortBy: 'newest' | 'price_low' | 'price_high' | 'popular';
  setSortBy: (sort: 'newest' | 'price_low' | 'price_high' | 'popular') => void;
  minPrice: number | '';
  setMinPrice: (val: number | '') => void;
  maxPrice: number | '';
  setMaxPrice: (val: number | '') => void;
  totalResults: number;
}

export const MobileFilterDrawer: React.FC<MobileFilterDrawerProps> = ({
  isOpen,
  onClose,
  selectedGame,
  setSelectedGame,
  verifiedOnly,
  setVerifiedOnly,
  proMerchantsOnly = false,
  setProMerchantsOnly,
  sortBy,
  setSortBy,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  totalResults,
}) => {
  const { t, isMM } = useLanguage();

  if (!isOpen) return null;

  const handleReset = () => {
    setSelectedGame('all');
    setVerifiedOnly(false);
    if (setProMerchantsOnly) setProMerchantsOnly(false);
    setSortBy('newest');
    setMinPrice('');
    setMaxPrice('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border-t border-slate-700 rounded-t-3xl shadow-2xl p-6 space-y-5 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
        {/* Swipe Pill Handle */}
        <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto -mt-2 mb-2" />

        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">{t('mobileFilter.title')}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Game Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {t('mobileFilter.selectGame')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'all', label: 'All Games', icon: '🎮' },
              { id: 'efootball', label: 'eFootball 2025', icon: '⚽' },
              { id: 'mlbb', label: 'Mobile Legends', icon: '⚔️' },
              { id: 'pubg', label: 'PUBG Mobile', icon: '🎯' },
              { id: 'coc', label: 'Clash of Clans', icon: '🏰' },
            ].map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedGame(g.id as any)}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition ${
                  selectedGame === g.id
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow'
                    : 'bg-slate-950 text-slate-300 border-slate-800'
                }`}
              >
                <span>{g.icon}</span>
                <span className="truncate">{g.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Price Range (MMK) */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {t('mobileFilter.priceRange')}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] text-slate-400 block mb-1">
                {t('mobileFilter.minPrice')}
              </span>
              <input
                type="number"
                placeholder="0"
                value={minPrice}
                onChange={(e) =>
                  setMinPrice(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block mb-1">
                {t('mobileFilter.maxPrice')}
              </span>
              <input
                type="number"
                placeholder="2,000,000"
                value={maxPrice}
                onChange={(e) =>
                  setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>
          </div>
        </div>

        {/* 3. Verified Sellers Only Toggle */}
        <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white">
              {t('mobileFilter.verifiedOnly')}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition duration-300 ${
              verifiedOnly ? 'bg-cyan-500 justify-end' : 'bg-slate-800 justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md" />
          </button>
        </div>

        {/* 3b. Pro Merchants Only Toggle */}
        {setProMerchantsOnly && (
          <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-amber-500/10 via-slate-950 to-slate-950 rounded-2xl border border-amber-500/30">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-xs font-black text-amber-300">
                {t('filters.proMerchantsOnly')}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setProMerchantsOnly(!proMerchantsOnly)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition duration-300 ${
                proMerchantsOnly ? 'bg-gradient-to-r from-amber-500 to-yellow-400 justify-end' : 'bg-slate-800 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-slate-950 shadow-md" />
            </button>
          </div>
        )}

        {/* 4. Sort Order */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {t('mobileFilter.sortBy')}
          </label>
          <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-transparent text-xs text-white font-semibold focus:outline-none"
            >
              <option value="newest" className="bg-slate-900 text-white">
                {t('filters.sortNewest')}
              </option>
              <option value="price_low" className="bg-slate-900 text-white">
                {t('filters.sortPriceLow')}
              </option>
              <option value="price_high" className="bg-slate-900 text-white">
                {t('filters.sortPriceHigh')}
              </option>
              <option value="popular" className="bg-slate-900 text-white">
                {t('filters.sortPopular')}
              </option>
            </select>
          </div>
        </div>

        {/* CTAs: Apply & Reset */}
        <div className="pt-3 flex items-center gap-3 border-t border-slate-800">
          <button
            onClick={handleReset}
            className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t('mobileFilter.reset')}</span>
          </button>

          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/25 transition active:scale-95 text-center"
          >
            {t('mobileFilter.apply')} ({totalResults})
          </button>
        </div>
      </div>
    </div>
  );
};

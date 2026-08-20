import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { AccountListing } from '../types';
import {
  Crown,
  Sparkles,
  Star,
  ShieldCheck,
  CheckCircle,
  Clock,
  ArrowRight,
  Zap,
  Flame,
  Award,
  ChevronRight,
  Info,
  X,
} from 'lucide-react';

interface RecommendedMerchantsCarouselProps {
  listings: AccountListing[];
  onSelectMerchant: (merchantName: string) => void;
  selectedMerchantFilter?: string | null;
  onClearMerchantFilter?: () => void;
}

export const RecommendedMerchantsCarousel: React.FC<RecommendedMerchantsCarouselProps> = ({
  listings = [],
  onSelectMerchant,
  selectedMerchantFilter,
  onClearMerchantFilter,
}) => {
  const { t, isMM } = useLanguage();
  const [isPerksModalOpen, setIsPerksModalOpen] = useState(false);

  // Extract unique Pro Merchants from listings
  const proMerchants = React.useMemo(() => {
    const merchantMap = new Map<
      string,
      {
        id: string;
        name: string;
        avatar: string;
        tradesCompleted: number;
        rating: number;
        responseMinutes: number;
        sampleListing?: AccountListing;
        totalListings: number;
      }
    >();

    listings.forEach((item) => {
      if (item.isProMerchant || item.seller?.isProMerchant) {
        const sellerId = item.seller.id || item.seller.name;
        if (!merchantMap.has(sellerId)) {
          merchantMap.set(sellerId, {
            id: sellerId,
            name: item.seller.name,
            avatar: item.seller.avatar,
            tradesCompleted: item.seller.tradesCompleted || 100,
            rating: item.seller.rating || 4.9,
            responseMinutes: item.seller.responseMinutes || 3,
            sampleListing: item,
            totalListings: 1,
          });
        } else {
          const entry = merchantMap.get(sellerId)!;
          entry.totalListings += 1;
        }
      }
    });

    return Array.from(merchantMap.values());
  }, [listings]);

  if (proMerchants.length === 0) return null;

  return (
    <div className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-1">
      {/* Header Line */}
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20">
            <Crown className="w-4 h-4 fill-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                <span>{t('recommendedMerchants.title')}</span>
                <span className="hidden xs:inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[10px] font-mono font-black">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>PRO VERIFIED</span>
                </span>
              </h2>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-md hidden sm:block">
              {t('recommendedMerchants.subtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {selectedMerchantFilter && (
            <button
              type="button"
              onClick={onClearMerchantFilter}
              className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center gap-1 cursor-pointer"
            >
              <span>{isMM ? 'အားလုံးပြမည်' : 'Show All'}</span>
              <X className="w-3 h-3" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsPerksModalOpen(true)}
            className="text-[11px] text-slate-600 dark:text-slate-400 hover:text-amber-500 font-bold flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/30 transition cursor-pointer active:scale-95"
            title="Learn about Pro Merchant Perks"
          >
            <Info className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">{isMM ? 'အကျိုးခံစားခွင့်များ' : 'Perks Info'}</span>
          </button>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 pt-0.5 scroll-smooth">
        {proMerchants.map((merchant) => {
          const isSelected = selectedMerchantFilter === merchant.name;

          return (
            <div
              key={merchant.id}
              onClick={() => {
                if (isSelected && onClearMerchantFilter) {
                  onClearMerchantFilter();
                } else {
                  onSelectMerchant(merchant.name);
                }
              }}
              className={`group relative shrink-0 w-64 sm:w-72 rounded-2xl p-3.5 border transition-all duration-300 cursor-pointer shadow-sm hover:shadow-lg active:scale-[0.98] ${
                isSelected
                  ? 'bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-900 border-amber-400 ring-2 ring-amber-400/50 shadow-amber-500/20'
                  : 'bg-white dark:bg-slate-900/95 border-amber-400/30 dark:border-amber-500/20 hover:border-amber-400/60 hover:shadow-amber-500/10'
              }`}
            >
              {/* Gold Ambient Shimmer on Top */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 rounded-t-2xl opacity-80" />

              <div className="flex items-start gap-3">
                {/* Avatar with Golden Halo Ring */}
                <div className="relative shrink-0">
                  <img
                    src={merchant.avatar}
                    alt={merchant.name}
                    className="w-11 h-11 rounded-2xl object-cover border-2 border-amber-400 ring-2 ring-amber-500/30 shadow-md"
                  />
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 shadow">
                    <Crown className="w-3 h-3 fill-slate-950" />
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                      {merchant.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-0.5 text-amber-500 font-bold font-mono">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{merchant.rating.toFixed(1)}</span>
                    </span>
                    <span>•</span>
                    <span className="font-mono font-medium">
                      {merchant.tradesCompleted}+ {t('recommendedMerchants.tradesCompleted')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span className="flex items-center gap-0.5">
                      <Zap className="w-2.5 h-2.5 text-emerald-500" />
                      <span>⚡ {merchant.responseMinutes}m reply</span>
                    </span>
                    <span className="text-slate-400 dark:text-slate-600">•</span>
                    <span className="text-cyan-600 dark:text-cyan-400">
                      {merchant.totalListings} {isMM ? 'ကောင့်' : 'items'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sample Listing Preview Strip */}
              {merchant.sampleListing && (
                <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-600 dark:text-slate-300 font-medium truncate max-w-[170px]">
                    {merchant.sampleListing.title}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-amber-500 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pro Merchant Perks Modal */}
      {isPerksModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-amber-400/40 rounded-3xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
                  <Crown className="w-4 h-4 fill-slate-950" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    {t('proMerchant.perksHeading')}
                  </h3>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold font-mono">
                    PRO MERCHANT GUARANTEE
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPerksModalOpen(false)}
                className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                <div className="font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                  <span>{t('proMerchant.perk1Title')}</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t('proMerchant.perk1Desc')}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 space-y-1">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>{t('proMerchant.perk2Title')}</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t('proMerchant.perk2Desc')}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 space-y-1">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>{t('proMerchant.perk3Title')}</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t('proMerchant.perk3Desc')}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 space-y-1">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>{t('proMerchant.perk4Title')}</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t('proMerchant.perk4Desc')}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 space-y-1">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>{t('proMerchant.perk5Title')}</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t('proMerchant.perk5Desc')}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsPerksModalOpen(false)}
              className="w-full py-2.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black transition cursor-pointer"
            >
              {isMM ? 'နားလည်ပါပြီ' : 'Got it'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

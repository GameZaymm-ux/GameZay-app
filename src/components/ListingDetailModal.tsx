import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  AccountListing,
  EfootballAttributes,
  MLBBAttributes,
  PUBGAttributes,
  COCAttributes,
} from '../types';
import {
  X,
  ShieldCheck,
  Zap,
  Lock,
  Clock,
  UserCheck,
  Phone,
  Eye,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Award,
  AlertTriangle,
  Flame,
  ArrowRight,
  Gamepad2,
} from 'lucide-react';

interface ListingDetailModalProps {
  listing: AccountListing;
  onClose: () => void;
  onProceedToBuy: (listing: AccountListing) => void;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  listing,
  onClose,
  onProceedToBuy,
}) => {
  const { t, formatMMK, formatTHB, formatPrice, formatDualPrice, currency, isMM } = useLanguage();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const dualPrice = formatDualPrice(listing.priceMMK);

  const images = listing.imageUrls.length > 0 ? listing.imageUrls : [listing.bannerUrl];

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl min-h-screen sm:min-h-0 bg-white dark:bg-slate-900 border-0 sm:border border-slate-200 dark:border-slate-800 sm:rounded-3xl shadow-2xl overflow-hidden my-0 sm:my-8 flex flex-col justify-between transition-colors duration-200">
        <div>
          {/* Header Bar */}
          <div className="sticky top-0 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                {listing.gameType}
              </span>
              {listing.isVerifiedSeller && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-500/30">
                  <UserCheck className="w-3.5 h-3.5" />
                  {t('card.verifiedSeller')}
                </span>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body Container */}
          <div className="p-4 sm:p-6 space-y-6 pb-28 sm:pb-8">
            {/* Gallery Section with Touch Navigation */}
            <div className="space-y-3">
              <div className="relative w-full h-56 sm:h-84 rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 group shadow-inner">
                <img
                  src={images[activeImageIndex]}
                  alt={listing.title}
                  className="w-full h-full object-cover transition-transform duration-500"
                />

                {/* Left/Right Arrows for Touch / Desktop */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/70 text-white hover:bg-slate-900 transition backdrop-blur-md"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/70 text-white hover:bg-slate-900 transition backdrop-blur-md"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-xs font-bold text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-lg">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{t('card.escrowProtected')}</span>
                </div>

                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-slate-950/80 text-[11px] text-slate-300 font-mono backdrop-blur-md">
                  {activeImageIndex + 1} / {images.length}
                </div>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-20 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition cursor-pointer ${
                        activeImageIndex === idx
                          ? 'border-cyan-500 shadow-md shadow-cyan-500/30 scale-95'
                          : 'border-slate-300 dark:border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="thumb" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Price Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="space-y-1">
                <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
                  {listing.title}
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>ID: <strong className="font-mono text-cyan-600 dark:text-cyan-400">#{listing.id}</strong></span>
                  <span>•</span>
                  <span>{listing.views} {t('card.views')}</span>
                  <span>•</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{t('detail.warranty')}</span>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Escrow Protected Price</div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {dualPrice.primary}
                </div>
                <div className="text-xs text-cyan-600 dark:text-cyan-400 font-mono">
                  {dualPrice.secondary}
                </div>
              </div>
            </div>

            {/* Escrow Guarantee Box */}
            <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/60 flex items-start gap-3.5">
              <ShieldCheck className="w-6 h-6 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-cyan-900 dark:text-cyan-200">
                  {t('detail.escrowBadge')}
                </h4>
                <p className="text-xs text-cyan-800 dark:text-cyan-300/80 leading-relaxed">
                  {t('detail.escrowDesc')}
                </p>
              </div>
            </div>

            {/* Game-Specific Polymorphic Attribute Badges */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Gamepad2 className="w-4 h-4 text-cyan-500" />
                <span>{t('detail.accountSpecs')}</span>
              </h3>

              {/* eFootball Badges */}
              {listing.gameType === 'efootball' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{t('attributes.efootball.division')}</div>
                    <div className="text-sm font-bold text-cyan-600 dark:text-cyan-400 font-mono">
                      Div {(listing.attributes as EfootballAttributes).division}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{t('attributes.efootball.squadRating')}</div>
                    <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      {(listing.attributes as EfootballAttributes).squadRating} OVR
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{t('attributes.efootball.epicCount')}</div>
                    <div className="text-sm font-bold text-amber-600 dark:text-amber-400 font-mono">
                      {(listing.attributes as EfootballAttributes).epicCount} Epics
                    </div>
                  </div>
                </div>
              )}

              {/* MLBB Badges */}
              {listing.gameType === 'mlbb' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{t('attributes.mlbb.currentRank')}</div>
                    <div className="text-sm font-bold text-cyan-600 dark:text-cyan-400 font-mono truncate">
                      {(listing.attributes as MLBBAttributes).currentRank}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{t('attributes.mlbb.winRate')}</div>
                    <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      {(listing.attributes as MLBBAttributes).winRate}%
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{t('attributes.mlbb.collectorSkins')}</div>
                    <div className="text-sm font-bold text-amber-600 dark:text-amber-400 font-mono">
                      {(listing.attributes as MLBBAttributes).collectorSkins} Collector
                    </div>
                  </div>
                </div>
              )}

              {/* PUBG Badges */}
              {listing.gameType === 'pubg' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{t('attributes.pubg.tier')}</div>
                    <div className="text-sm font-bold text-cyan-600 dark:text-cyan-400 font-mono">
                      {(listing.attributes as PUBGAttributes).tier}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{t('attributes.pubg.glacierWeapon')}</div>
                    <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono truncate">
                      {(listing.attributes as PUBGAttributes).glacierLevel}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{t('attributes.pubg.mythicFashion')}</div>
                    <div className="text-sm font-bold text-amber-600 dark:text-amber-400 font-mono">
                      {(listing.attributes as PUBGAttributes).mythicFashion} Mythics
                    </div>
                  </div>
                </div>
              )}

              {/* COC Badges */}
              {listing.gameType === 'coc' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{t('attributes.coc.townHall')}</div>
                    <div className="text-sm font-bold text-cyan-600 dark:text-cyan-400 font-mono">
                      TH {(listing.attributes as COCAttributes).townHall}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Heroes (K/Q/W/RC)</div>
                    <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      {(listing.attributes as COCAttributes).kingLevel}/{(listing.attributes as COCAttributes).queenLevel}/{(listing.attributes as COCAttributes).wardenLevel}/{(listing.attributes as COCAttributes).champLevel}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{t('attributes.coc.gems')}</div>
                    <div className="text-sm font-bold text-amber-600 dark:text-amber-400 font-mono">
                      {(listing.attributes as COCAttributes).gems} Gems
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Account Description & Binding Info
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80">
                {listing.description}
              </p>
            </div>

            {/* Seller Information Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={listing.seller.avatar}
                  alt={listing.seller.name}
                  className="w-12 h-12 rounded-xl object-cover border border-cyan-500/40"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {listing.seller.name}
                    </h4>
                    {listing.isVerifiedSeller && (
                      <CheckCircle className="w-3.5 h-3.5 text-cyan-500" />
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>⭐ {listing.seller.rating} / 5.0</span>
                    <span>•</span>
                    <span>{listing.seller.tradesCompleted} Trades Completed</span>
                  </div>
                </div>
              </div>

              <div className="text-left sm:text-right text-xs text-slate-500 dark:text-slate-400">
                <div>Member since {listing.seller.joinedDate}</div>
                <div className="text-emerald-600 dark:text-emerald-400 font-semibold">Replies in ~{listing.seller.responseMinutes} mins</div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Mobile/Desktop Buy CTA Bottom Bar */}
        <div className="sticky sm:static bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between gap-4 shadow-2xl">
          <div className="sm:hidden">
            <div className="text-[10px] text-slate-500 dark:text-slate-400">Total Price</div>
            <div className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {dualPrice.primary}
            </div>
            <div className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono">
              {dualPrice.secondary}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="hidden sm:block px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              {isMM ? 'ပိတ်မည်' : 'Close'}
            </button>

            <button
              onClick={() => onProceedToBuy(listing)}
              className="flex-1 sm:flex-none px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-emerald-500 to-teal-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-cyan-500/30 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>{t('detail.buyButton')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

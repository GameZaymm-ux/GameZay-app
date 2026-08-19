import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  ArrowLeft,
  ShieldCheck,
  Zap,
  Lock,
  Clock,
  UserCheck,
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
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Check,
  Share2,
  Shield,
  Smartphone,
  Mail,
  Layers,
  HelpCircle,
  BadgeCheck,
  MessageCircle,
  Flag,
  Copy,
  Info,
  PhoneCall,
  CheckCheck,
  Image as ImageIcon,
  FileText,
  Table,
} from 'lucide-react';

interface ListingDetailModalProps {
  listing: AccountListing;
  onClose: () => void;
  onProceedToBuy: (listing: AccountListing) => void;
  onContactSeller?: (listing: AccountListing) => void;
}

interface ScreenshotItem {
  url: string;
  title: string;
  category: string;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  listing,
  onClose,
  onProceedToBuy,
  onContactSeller,
}) => {
  const { t, formatMMK, formatTHB, formatPrice, formatDualPrice, currency, isMM } = useLanguage();

  // Mobile Tab State ('photos' = Photos & Highlights, 'details' = Details & Seller)
  const [mobileTab, setMobileTab] = useState<'photos' | 'details'>('photos');

  // Carousel & Image Gallery State
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Lightbox Modal state
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [zoomScale, setZoomScale] = useState(1);

  // Toast / Feedback State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSellerContactModalOpen, setIsSellerContactModalOpen] = useState(false);

  // Scroll container reference for smooth tab resets
  const contentScrollRef = useRef<HTMLDivElement>(null);

  // Touch Swipe tracking for mobile carousel
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const dualPrice = formatDualPrice(listing.priceMMK);

  // Switch tab with smooth scroll reset
  const handleTabChange = (tab: 'photos' | 'details') => {
    setMobileTab(tab);
    if (contentScrollRef.current) {
      contentScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Show temporary toast feedback
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Build a rich set of screenshots with categories for game inspect experience
  const screenshots: ScreenshotItem[] = useMemo(() => {
    const rawImages = listing.imageUrls && listing.imageUrls.length > 0 ? listing.imageUrls : [listing.bannerUrl];
    
    // Category mapping based on game type
    const getCategoryTitles = (game: string) => {
      switch (game) {
        case 'efootball':
          return [
            { title: 'Main Squad & Manager Synergy', category: 'Squad 104+ OVR' },
            { title: 'Epics & Big Time Showcase', category: '18 Epics' },
            { title: 'Division 1 Match Record', category: 'Rank Proof' },
            { title: 'Konami ID First-Hand Bind', category: 'Security' },
            { title: 'Substitutes & Reserve Bench', category: 'Bench' },
            { title: 'Trainer Points & Contracts', category: 'Items' },
          ];
        case 'mlbb':
          return [
            { title: 'Mythical Immortal Profile & Stats', category: 'Profile Stats' },
            { title: 'Collector & Legend Skins Roster', category: 'Skin Vault' },
            { title: 'Emblems & Win Rate Breakdown', category: 'Emblems Lvl 60' },
            { title: 'All Moonton Unbind Clean Proof', category: 'Binding Safe' },
            { title: 'KOF & Prime Special Skins', category: 'Limited Skins' },
            { title: 'Ranked Match History Graph', category: 'Recent Matches' },
          ];
        case 'pubg':
          return [
            { title: 'Ace Dominator Profile & Tier', category: 'Tier & KD' },
            { title: 'M416 Glacier & Gun Lab Upgrades', category: 'Glacier Max' },
            { title: 'Mythic Fashion & Outfits', category: 'Inventory' },
            { title: 'Clean Social Accounts Binding', category: 'Clean Link' },
            { title: 'Vehicle Skins & Garage', category: 'Vehicles' },
          ];
        case 'coc':
          return [
            { title: 'Town Hall 16 Max Base Layout', category: 'TH16 Base' },
            { title: 'Heroes & Equipment Max Levels', category: 'Max Heroes' },
            { title: 'Supercell ID & Free Name Change', category: 'Clean ID' },
            { title: 'Builder Base Level 10 Layout', category: 'Builder Base' },
          ];
        default:
          return [
            { title: 'Account Overview', category: 'Overview' },
            { title: 'Items & Roster', category: 'Inventory' },
            { title: 'Security & Binding Proof', category: 'Verification' },
            { title: 'Stats & Achievements', category: 'Stats' },
          ];
      }
    };

    const categories = getCategoryTitles(listing.gameType);

    // Fallback sample screenshots if fewer images provided
    const fallbackUrls = [
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=1000&auto=format&fit=crop&q=80',
    ];

    const result: ScreenshotItem[] = [];
    const targetCount = Math.max(rawImages.length, categories.length);

    for (let i = 0; i < targetCount; i++) {
      const url = rawImages[i] || fallbackUrls[i % fallbackUrls.length];
      const meta = categories[i] || { title: `Screenshot Proof #${i + 1}`, category: `Proof ${i + 1}` };
      result.push({
        url,
        title: meta.title,
        category: meta.category,
      });
    }

    return result;
  }, [listing]);

  // Lock body scroll while modal is open & listen to Escape key
  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isLightboxOpen) {
          setIsLightboxOpen(false);
        } else if (isReportModalOpen) {
          setIsReportModalOpen(false);
        } else if (isSellerContactModalOpen) {
          setIsSellerContactModalOpen(false);
        } else {
          onClose();
        }
      }
      if (isLightboxOpen) {
        if (e.key === 'ArrowRight') {
          setLightboxIndex((prev) => (prev + 1) % screenshots.length);
        } else if (e.key === 'ArrowLeft') {
          setLightboxIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLightboxOpen, isReportModalOpen, isSellerContactModalOpen, onClose, screenshots.length]);

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % screenshots.length);
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length);
  };

  // Touch Swipe Handlers for mobile gallery
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 45;
    const isRightSwipe = distance < -45;

    if (isLeftSwipe) {
      handleNextImage();
    } else if (isRightSwipe) {
      handlePrevImage();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Lightbox touch handlers
  const handleLightboxTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleLightboxTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleLightboxTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) {
      setLightboxIndex((prev) => (prev + 1) % screenshots.length);
    } else if (distance < -50) {
      setLightboxIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length);
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleOpenLightbox = (index: number) => {
    setLightboxIndex(index);
    setZoomScale(1);
    setIsLightboxOpen(true);
  };

  // Share action
  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareText = `Check out this verified ${listing.gameType.toUpperCase()} account on GameZay: ${listing.title}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing.title,
          text: shareText,
          url: shareUrl,
        });
        showToast(isMM ? 'လင့်ခ် မျှဝေပြီးပါပြီ' : 'Listing shared!');
      } catch (err) {
        await navigator.clipboard.writeText(shareUrl);
        showToast(isMM ? 'အကောင့်လင့်ခ် ကူးယူပြီးပါပြီ (Clipboard)' : 'Account link copied to clipboard!');
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      showToast(isMM ? 'အကောင့်လင့်ခ် ကူးယူပြီးပါပြီ (Clipboard)' : 'Account link copied to clipboard!');
    }
  };

  // Game specific binding data
  const bindingItems = useMemo(() => {
    switch (listing.gameType) {
      case 'mlbb':
        return [
          { name: 'Moonton ID', status: 'Clean / Unlinked', safe: true, detail: 'Ready for buyer email bind' },
          { name: 'Google Play', status: 'All Unlinked', safe: true, detail: 'Clean secondary transfer' },
          { name: 'Facebook', status: 'Clean / Disconnected', safe: true, detail: 'No 3rd party binding' },
          { name: 'TikTok / VK', status: 'Never Linked', safe: true, detail: 'Clean social slot' },
        ];
      case 'efootball':
        return [
          { name: 'Konami ID', status: 'First-Hand Clean', safe: true, detail: 'Original owner email transfer' },
          { name: 'Google Play / Apple ID', status: 'Unlinked', safe: true, detail: 'Clean device connection' },
          { name: 'Recovery Phone', status: 'Removed (0 Binds)', safe: true, detail: '2FA ready for buyer' },
          { name: 'Secondary Login', status: 'Clean / Zero Links', safe: true, detail: 'Instant handover ready' },
        ];
      case 'pubg':
        return [
          { name: 'Twitter / X', status: 'Clean / Primary Link', safe: true, detail: 'Direct login handover' },
          { name: 'Email Bind', status: 'Changeable', safe: true, detail: '7-day link change ready' },
          { name: 'Facebook', status: 'Unlinked', safe: true, detail: 'Free 2nd slot for buyer' },
          { name: 'Phone Number', status: 'Unlinked', safe: true, detail: 'Add your own 2FA' },
        ];
      case 'coc':
        return [
          { name: 'Supercell ID', status: 'Clean First-Hand', safe: true, detail: 'Instant email change ready' },
          { name: 'Free Name Change', status: 'Available (0 Gems)', safe: true, detail: 'Customize account name' },
          { name: 'Google Play', status: 'Unlinked', safe: true, detail: 'Clean authentication' },
          { name: 'Game Center', status: 'Clean', safe: true, detail: 'iOS & Android supported' },
        ];
      default:
        return [
          { name: 'Primary Login', status: 'Verified Clean', safe: true, detail: 'Original ownership' },
          { name: 'Email Binding', status: 'Changeable', safe: true, detail: 'Immediate transfer' },
          { name: 'Social Binds', status: 'Unlinked', safe: true, detail: 'Zero 3rd party binds' },
          { name: 'Two-Factor (2FA)', status: 'Clean', safe: true, detail: 'Configured for buyer' },
        ];
    }
  }, [listing.gameType]);

  // Game specific detailed table rows for Tab 2
  const detailedSpecsList = useMemo(() => {
    switch (listing.gameType) {
      case 'efootball': {
        const attr = listing.attributes as EfootballAttributes;
        return [
          { label: 'Current Division', value: `Division ${attr.division}` },
          { label: 'Team Squad Rating', value: `${attr.squadRating} OVR` },
          { label: 'Epic Booster Count', value: `${attr.epicCount} Epics` },
          { label: 'Platform Server', value: 'Mobile (Android/iOS)' },
          { label: 'Konami ID Link', value: 'First-Hand (Changeable)' },
          { label: 'Handover Method', value: 'Direct Konami Credentials' },
        ];
      }
      case 'mlbb': {
        const attr = listing.attributes as MLBBAttributes;
        return [
          { label: 'Current Rank', value: attr.currentRank },
          { label: 'Ranked Win Rate', value: `${attr.winRate}%` },
          { label: 'Collector & Legend Skins', value: `${attr.collectorSkins} Skins` },
          { label: 'Emblem Sets', value: 'Max Level 60' },
          { label: 'All Unbind Status', value: 'Clean & Verified' },
          { label: 'Server Region', value: 'Southeast Asia' },
        ];
      }
      case 'pubg': {
        const attr = listing.attributes as PUBGAttributes;
        return [
          { label: 'Tier / Rank', value: attr.tier },
          { label: 'Glacier Lab Weapon', value: attr.glacierLevel },
          { label: 'Mythic Fashion Outfits', value: `${attr.mythicFashion} Mythics` },
          { label: 'Server', value: 'Asia Server' },
          { label: 'Social Binding', value: 'Twitter/X (Primary Clean)' },
          { label: 'Handover Type', value: 'Full Social Account Transfer' },
        ];
      }
      case 'coc': {
        const attr = listing.attributes as COCAttributes;
        return [
          { label: 'Town Hall Level', value: `TH ${attr.townHall} Max` },
          { label: 'Barbarian King Level', value: `Level ${attr.kingLevel}` },
          { label: 'Archer Queen Level', value: `Level ${attr.queenLevel}` },
          { label: 'Grand Warden Level', value: `Level ${attr.wardenLevel}` },
          { label: 'Stored Gems', value: `${attr.gems.toLocaleString()} Gems` },
          { label: 'Free Name Change', value: 'Available in Settings' },
        ];
      }
      default:
        return [
          { label: 'Game Type', value: listing.gameType.toUpperCase() },
          { label: 'Security Status', value: '100% Escrow Protected' },
          { label: 'Inspection Period', value: '24 Hours Window' },
        ];
    }
  }, [listing]);

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col justify-start lg:justify-center p-0 lg:p-6 animate-in fade-in duration-200"
    >
      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-70 px-4 py-2.5 rounded-2xl bg-slate-900 text-white font-bold text-xs shadow-2xl border border-cyan-500/40 flex items-center gap-2 animate-in slide-in-from-top-4">
          <CheckCheck className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container: Full viewport height flex column on mobile, rounded modal on PC */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-7xl h-[100dvh] lg:h-auto lg:max-h-[92vh] bg-slate-50 dark:bg-slate-900 border-0 lg:border border-slate-200 dark:border-slate-800 lg:rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-colors duration-200 my-0 lg:my-auto"
      >
        {/* 1. Responsive Top Navigation Header Bar (Fixed / Shrink-0) */}
        <div className="shrink-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-4 py-3 sm:px-6 sm:py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
          {/* Left Nav: Back Button with Title & Badges */}
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
            <button
              type="button"
              onClick={onClose}
              className="p-2 sm:px-3.5 sm:py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-cyan-500/10 hover:text-cyan-600 dark:hover:text-cyan-400 transition cursor-pointer flex items-center gap-1.5 font-bold text-xs shrink-0 active:scale-95"
              aria-label="Back to Marketplace"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">
                {isMM ? 'စျေးကွက်သို့ ပြန်သွားမည်' : 'Back to Marketplace'}
              </span>
            </button>

            <div className="flex items-center gap-2 truncate">
              <span className="px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 flex items-center gap-1 shrink-0">
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>{listing.gameType}</span>
              </span>

              <span className="hidden md:inline-block text-xs font-mono text-slate-400 truncate">
                ID: #{listing.id}
              </span>

              {listing.isVerifiedSeller && (
                <span className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-500/30 shrink-0">
                  <UserCheck className="w-3 h-3" />
                  <span>{t('card.verifiedSeller')}</span>
                </span>
              )}
            </div>
          </div>

          {/* Right Nav Action Controls: Share, Report, Close */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Share Button */}
            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer active:scale-90"
              title="Share Account Link"
              aria-label="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Report Button */}
            <button
              type="button"
              onClick={() => setIsReportModalOpen(true)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-500 hover:bg-amber-500/10 transition cursor-pointer active:scale-90"
              title="Report this Listing"
              aria-label="Report"
            >
              <Flag className="w-4 h-4" />
            </button>

            {/* Obvious Close 'X' button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-600 transition cursor-pointer active:scale-90"
              title="Close"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Mobile Two-Tab Switcher Navigation (Fixed / Shrink-0) */}
        <div className="lg:hidden shrink-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 shadow-sm">
          {/* TAB 1: Photos & Highlights */}
          <button
            type="button"
            onClick={() => handleTabChange('photos')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
              mobileTab === 'photos'
                ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-md shadow-cyan-500/30 font-black'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>{isMM ? 'အကောင့်ပုံများ' : 'Photos & Highlights'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950/20 dark:bg-white/20">
              {screenshots.length}
            </span>
          </button>

          {/* TAB 2: Details & Seller */}
          <button
            type="button"
            onClick={() => handleTabChange('details')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
              mobileTab === 'details'
                ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-md shadow-cyan-500/30 font-black'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{isMM ? 'အသေးစိတ်ချက်များ' : 'Details & Seller'}</span>
          </button>
        </div>

        {/* 3. Main Dedicated Scrollable Body Container (overflow-y-auto with smooth touch scroll and bottom clearance) */}
        <div
          ref={contentScrollRef}
          className="flex-1 overflow-y-auto overscroll-contain custom-scrollbar [webkit-overflow-scrolling:touch] p-4 sm:p-6 lg:p-8 pb-32 sm:pb-36 lg:pb-12"
        >
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">
            
            {/* ================= LEFT COLUMN (PC: Media Gallery, Proofs & Description; Mobile: Content driven by Tab 1 / Tab 2) ================= */}
            <div className="lg:col-span-7 space-y-6">

              {/* ========================================================= */}
              {/* --- TAB 1 (MOBILE) OR DESKTOP: MEDIA CAROUSEL & PREVIEWS --- */}
              {/* ========================================================= */}
              <div className={`${mobileTab === 'photos' ? 'block' : 'hidden lg:block'} space-y-4`}>
                {/* Main Image Carousel */}
                <div
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  className="relative w-full h-64 sm:h-80 md:h-96 rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 group shadow-lg select-none"
                >
                  <img
                    src={screenshots[activeImageIndex].url}
                    alt={screenshots[activeImageIndex].title}
                    onClick={() => handleOpenLightbox(activeImageIndex)}
                    className="w-full h-full object-cover transition-all duration-300 cursor-zoom-in group-hover:scale-[1.02]"
                  />

                  {/* Gradient Overlays for readable tags */}
                  <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

                  {/* Top-Left Category Tag */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[11px] font-bold text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 shadow-lg">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{screenshots[activeImageIndex].category}</span>
                    </span>
                  </div>

                  {/* Top-Right Inspect Fullscreen Icon Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenLightbox(activeImageIndex)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/80 hover:bg-slate-900 text-white backdrop-blur-md border border-white/20 shadow-lg transition active:scale-90 cursor-pointer"
                    title="Open Fullscreen Lightbox"
                  >
                    <ZoomIn className="w-4 h-4 text-cyan-400" />
                  </button>

                  {/* Left/Right Arrow Navigation */}
                  {screenshots.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={handlePrevImage}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white transition backdrop-blur-md border border-white/10 shadow-xl cursor-pointer active:scale-90"
                        aria-label="Previous screenshot"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNextImage}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white transition backdrop-blur-md border border-white/10 shadow-xl cursor-pointer active:scale-90"
                        aria-label="Next screenshot"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}

                  {/* Bottom Bar: Image Title & Counter Pill */}
                  <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-white text-xs">
                    <span className="font-bold text-slate-200 drop-shadow truncate max-w-[70%]">
                      {screenshots[activeImageIndex].title}
                    </span>
                    <div className="px-2.5 py-1 rounded-lg bg-slate-950/80 text-[11px] text-cyan-300 font-mono backdrop-blur-md border border-cyan-500/30">
                      {activeImageIndex + 1} / {screenshots.length}
                    </div>
                  </div>
                </div>

                {/* Horizontal Scrollable Thumbnails Carousel */}
                {screenshots.length > 1 && (
                  <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar scroll-smooth">
                    {screenshots.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative w-20 sm:w-24 h-14 sm:h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                          activeImageIndex === idx
                            ? 'border-cyan-500 ring-2 ring-cyan-500/40 scale-105 shadow-md shadow-cyan-500/30'
                            : 'border-slate-300 dark:border-slate-800 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                        <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] font-bold text-white text-center py-0.5 truncate px-1">
                          {item.category}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ========================================================= */}
              {/* --- TAB 1 (MOBILE): TITLE & PRICE BANNER + KEY STATS --- */}
              {/* ========================================================= */}
              {mobileTab === 'photos' && (
                <div className="lg:hidden space-y-4">
                  {/* Title & Warranty Header */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/20">
                        ✓ {t('detail.warranty')}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                        <Eye className="w-3.5 h-3.5 text-cyan-500" />
                        <span>{listing.views} {t('card.views')}</span>
                      </span>
                    </div>

                    <h2 className="text-lg font-black text-slate-900 dark:text-white leading-snug">
                      {listing.title}
                    </h2>
                  </div>

                  {/* Escrow Dual Price Banner */}
                  <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
                    <div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                        {isMM ? 'Escrow စုစုပေါင်း စျေးနှုန်း' : 'Escrow Protected Price'}
                      </div>
                      <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                        {dualPrice.primary}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-cyan-600 dark:text-cyan-400 font-mono font-bold">
                        {dualPrice.secondary}
                      </div>
                      <span className="inline-block text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 mt-0.5">
                        100% Escrow Locked
                      </span>
                    </div>
                  </div>

                  {/* Key Stats Grid (3 Compact Visual Cards) */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Gamepad2 className="w-4 h-4 text-cyan-500" />
                      <span>{isMM ? 'အဓိက ဂိမ်းအချက်အလက်များ' : 'Key Highlights'}</span>
                    </h3>

                    {/* eFootball 3 Key Cards */}
                    {listing.gameType === 'efootball' && (
                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">{t('attributes.efootball.division')}</div>
                          <div className="text-xs sm:text-sm font-bold text-cyan-600 dark:text-cyan-400 font-mono mt-0.5">
                            Div {(listing.attributes as EfootballAttributes).division}
                          </div>
                        </div>
                        <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">{t('attributes.efootball.squadRating')}</div>
                          <div className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                            {(listing.attributes as EfootballAttributes).squadRating} OVR
                          </div>
                        </div>
                        <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">{t('attributes.efootball.epicCount')}</div>
                          <div className="text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 font-mono mt-0.5">
                            {(listing.attributes as EfootballAttributes).epicCount} Epics
                          </div>
                        </div>
                      </div>
                    )}

                    {/* MLBB 3 Key Cards */}
                    {listing.gameType === 'mlbb' && (
                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">{t('attributes.mlbb.currentRank')}</div>
                          <div className="text-xs font-bold text-cyan-600 dark:text-cyan-400 font-mono mt-0.5 truncate">
                            {(listing.attributes as MLBBAttributes).currentRank}
                          </div>
                        </div>
                        <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">{t('attributes.mlbb.winRate')}</div>
                          <div className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                            {(listing.attributes as MLBBAttributes).winRate}%
                          </div>
                        </div>
                        <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">{t('attributes.mlbb.collectorSkins')}</div>
                          <div className="text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 font-mono mt-0.5">
                            {(listing.attributes as MLBBAttributes).collectorSkins} Skins
                          </div>
                        </div>
                      </div>
                    )}

                    {/* PUBG 3 Key Cards */}
                    {listing.gameType === 'pubg' && (
                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">{t('attributes.pubg.tier')}</div>
                          <div className="text-xs sm:text-sm font-bold text-cyan-600 dark:text-cyan-400 font-mono mt-0.5">
                            {(listing.attributes as PUBGAttributes).tier}
                          </div>
                        </div>
                        <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">{t('attributes.pubg.glacierWeapon')}</div>
                          <div className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 truncate">
                            {(listing.attributes as PUBGAttributes).glacierLevel}
                          </div>
                        </div>
                        <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">{t('attributes.pubg.mythicFashion')}</div>
                          <div className="text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 font-mono mt-0.5">
                            {(listing.attributes as PUBGAttributes).mythicFashion} Mythics
                          </div>
                        </div>
                      </div>
                    )}

                    {/* COC 3 Key Cards */}
                    {listing.gameType === 'coc' && (
                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">{t('attributes.coc.townHall')}</div>
                          <div className="text-xs sm:text-sm font-bold text-cyan-600 dark:text-cyan-400 font-mono mt-0.5">
                            TH {(listing.attributes as COCAttributes).townHall}
                          </div>
                        </div>
                        <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">Heroes</div>
                          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 truncate">
                            K{(listing.attributes as COCAttributes).kingLevel}/Q{(listing.attributes as COCAttributes).queenLevel}
                          </div>
                        </div>
                        <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">{t('attributes.coc.gems')}</div>
                          <div className="text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 font-mono mt-0.5">
                            {(listing.attributes as COCAttributes).gems} Gems
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* --- DESKTOP ONLY: HIGH-RES PROOF GALLERY GRID --- */}
              {/* ========================================================= */}
              <div className="hidden lg:block space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-cyan-500" />
                    <span>{isMM ? 'သက်သေပြ ဓာတ်ပုံမှတ်တမ်းများ (High-Res Proofs)' : 'High-Resolution Proof Gallery'}</span>
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {screenshots.length} Screenshots
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {screenshots.map((s, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleOpenLightbox(idx)}
                      className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-md cursor-pointer hover:border-cyan-500 transition-all hover:scale-[1.02]"
                    >
                      <img src={s.url} alt={s.title} className="w-full h-full object-cover group-hover:opacity-90 transition" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-80 group-hover:opacity-90 transition" />
                      
                      {/* Zoom Icon */}
                      <div className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-950/70 text-cyan-400 opacity-0 group-hover:opacity-100 transition shadow">
                        <ZoomIn className="w-3.5 h-3.5" />
                      </div>

                      <div className="absolute bottom-2 inset-x-2">
                        <span className="text-[10px] font-bold text-cyan-300 block truncate">
                          {s.title}
                        </span>
                        <span className="text-[9px] text-slate-300 font-mono">
                          {s.category}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ========================================================= */}
              {/* --- TAB 2 (MOBILE) OR DESKTOP: FULL ACCOUNT DESCRIPTION --- */}
              {/* ========================================================= */}
              <div className={`${mobileTab === 'details' ? 'block' : 'hidden lg:block'} space-y-4`}>
                {/* Full Account Description Card */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-cyan-500" />
                    <span>{isMM ? 'အကောင့် အပြည့်အစုံ ဖော်ပြချက်' : 'Full Account Description'}</span>
                  </h3>
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-2 shadow-sm">
                    <p className="whitespace-pre-line">{listing.description}</p>
                    {listing.credentialPreview?.notes && (
                      <div className="pt-2.5 mt-2.5 border-t border-slate-200 dark:border-slate-800 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        ✓ {listing.credentialPreview.notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Account Specifications Table Breakdown */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Table className="w-4 h-4 text-cyan-500" />
                    <span>{isMM ? 'ဂိမ်းအချက်အလက် ဇယား (Detailed Specs)' : 'Account Specifications Table'}</span>
                  </h3>
                  <div className="rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                      {detailedSpecsList.map((row, idx) => (
                        <div key={idx} className="p-3 sm:px-4 flex items-center justify-between text-xs">
                          <span className="text-slate-500 dark:text-slate-400 font-medium">
                            {row.label}
                          </span>
                          <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                            {row.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Escrow 3-Tier Security Vault Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-teal-500/10 border border-emerald-500/30 dark:border-emerald-500/20 space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-200">
                        {isMM ? 'GameZay အလယ်လူ (Escrow) အာမခံစနစ်' : 'GameZay Escrow 100% Protection Vault'}
                      </h4>
                      <p className="text-[11px] text-emerald-800 dark:text-emerald-300/80">
                        {isMM ? 'ဝယ်သူအကောင့်စစ်ဆေးပြီး အတည်ပြုချိန် ၂၄ နာရီအထိ ရောင်းသူထံသို့ ငွေထုတ်မပေးဘဲ ထိန်းသိမ်းထားပါသည်။' : 'Funds stay securely locked in the vault until the buyer logs in and confirms all credentials within 24 hours.'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-emerald-500/20 text-[10px] sm:text-[11px] text-emerald-900 dark:text-emerald-300">
                    <div className="flex items-center gap-1 font-semibold">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{isMM ? 'ငွေကြေးအာမခံ' : 'Money-Back'}</span>
                    </div>
                    <div className="flex items-center gap-1 font-semibold">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{isMM ? '၂၄ နာရီစစ်ဆေးခွင့်' : '24h Inspection'}</span>
                    </div>
                    <div className="flex items-center gap-1 font-semibold">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{isMM ? 'အလယ်လူစစ်ဆေးမှု' : 'Admin Live Help'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ================= RIGHT COLUMN (PC Desktop Sidebar, Mobile in Tab 2) ================= */}
            <div className="lg:col-span-5 space-y-6 mt-6 lg:mt-0">
              
              {/* ========================================================= */}
              {/* --- 1. DESKTOP ONLY: Header Title & Price Card with Buy Action --- */}
              {/* ========================================================= */}
              <div className="hidden lg:block p-5 rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                    {listing.gameType}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-cyan-500" />
                    <span>{listing.views} {t('card.views')}</span>
                  </span>
                </div>

                <h1 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                  {listing.title}
                </h1>

                {/* Desktop Price Block */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      {isMM ? 'Escrow စုစုပေါင်းတန်ဖိုး' : 'Escrow Total Price'}
                    </div>
                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                      {dualPrice.primary}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-cyan-600 dark:text-cyan-400 font-mono font-bold">
                      {dualPrice.secondary}
                    </div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                      ✓ {t('detail.warranty')}
                    </span>
                  </div>
                </div>

                {/* Desktop Buy Button */}
                <div className="pt-2 flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={() => onProceedToBuy(listing)}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-emerald-500 to-teal-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-sm shadow-xl shadow-cyan-500/25 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShieldCheck className="w-5 h-5" />
                    <span>{t('detail.buyButton')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsSellerContactModalOpen(true)}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-800"
                  >
                    <MessageCircle className="w-4 h-4 text-cyan-500" />
                    <span>{isMM ? 'ရောင်းသူနှင့် တိုက်ရိုက် စကားပြောရန်' : 'Message / Chat with Seller'}</span>
                  </button>
                </div>
              </div>

              {/* ========================================================= */}
              {/* --- 2. ACCOUNT BINDING SECURITY STATUS (Mobile Tab 2 or Desktop) --- */}
              {/* ========================================================= */}
              <div className={`${mobileTab === 'details' ? 'block' : 'hidden lg:block'} space-y-3`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>{isMM ? 'ချိတ်ဆက်မှု လုံခြုံရေး အခြေအနေ' : 'Account Binding Security'}</span>
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60">
                    {isMM ? '၁၀၀% စိတ်ချရ' : 'Verified Clean'}
                  </span>
                </div>

                <div className="space-y-2">
                  {bindingItems.map((bind, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shadow-sm"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {bind.name}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {bind.detail}
                          </div>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-600/40 shrink-0">
                        {bind.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ========================================================= */}
              {/* --- 3. VERIFIED SELLER PROFILE CARD (Mobile Tab 2 or Desktop) --- */}
              {/* ========================================================= */}
              <div className={`${mobileTab === 'details' ? 'block' : 'hidden lg:block'} p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3.5 shadow-sm`}>
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {isMM ? 'ရောင်းသူ အချက်အလက်' : 'Verified Seller Profile'}
                  </h4>
                  {listing.isVerifiedSeller && (
                    <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                      <BadgeCheck className="w-3.5 h-3.5" />
                      <span>KYC Verified</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3.5">
                  <img
                    src={listing.seller.avatar}
                    alt={listing.seller.name}
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-cyan-500/40 shadow-sm shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h5 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {listing.seller.name}
                      </h5>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5 flex-wrap">
                      <span>⭐ {listing.seller.rating} / 5.0</span>
                      <span>•</span>
                      <span>{listing.seller.tradesCompleted} {isMM ? 'အကောင့်ရောင်းပြီး' : 'Trades'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div>Member: <strong className="text-slate-700 dark:text-slate-300">{listing.seller.joinedDate}</strong></div>
                  <div className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    Replies ~{listing.seller.responseMinutes}m
                  </div>
                </div>

                {/* Direct Contact / Chat Action */}
                <button
                  type="button"
                  onClick={() => setIsSellerContactModalOpen(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer border border-slate-200 dark:border-slate-800 active:scale-98"
                >
                  <MessageCircle className="w-4 h-4 text-cyan-500" />
                  <span>{isMM ? 'ရောင်းသူထံ မက်ဆေ့ခ်ျ ပို့မည်' : 'Message Seller'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Fixed Bottom Sticky Action Bar (Shrink-0 / Safe Area Protected across all tabs) */}
        <div className="shrink-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 p-3.5 sm:p-4 pb-[calc(0.85rem+env(safe-area-inset-bottom,0px))] sm:pb-4 shadow-2xl flex items-center justify-between gap-3">
          {/* Left Price Display (MMK + Converted THB) */}
          <div className="shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                {isMM ? 'စုစုပေါင်း' : 'Total'}
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                Escrow Safe
              </span>
            </div>
            <div className="text-base sm:text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono leading-tight mt-0.5">
              {dualPrice.primary}
            </div>
            <div className="text-[11px] text-cyan-600 dark:text-cyan-400 font-mono leading-none">
              {dualPrice.secondary}
            </div>
          </div>

          {/* Right Action CTA Buttons: Secondary Chat + Primary Buy via Escrow */}
          <div className="flex items-center justify-end gap-2 sm:gap-3 flex-1 sm:flex-none">
            {/* Secondary Chat Action */}
            <button
              type="button"
              onClick={() => setIsSellerContactModalOpen(true)}
              className="p-3 sm:px-4 sm:py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer active:scale-95 border border-slate-200 dark:border-slate-700"
              title="Chat with Seller"
            >
              <MessageCircle className="w-4 h-4 text-cyan-500" />
              <span className="hidden sm:inline">{isMM ? 'ရောင်းသူနှင့် စကားပြောမည်' : 'Chat'}</span>
            </button>

            {/* Primary Buy via Escrow Button */}
            <button
              type="button"
              onClick={() => onProceedToBuy(listing)}
              className="flex-1 sm:flex-none px-4 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-emerald-500 to-teal-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-xs sm:text-sm tracking-wide shadow-xl shadow-cyan-500/25 transition-all duration-200 active:scale-95 flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              <span className="truncate">{t('detail.buyButton')}</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. Full-Screen Lightbox View with Zoom, Pinch, and Swipe Navigation */}
      {isLightboxOpen && (
        <div
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-60 bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-3 sm:p-6 animate-in fade-in duration-150 select-none"
        >
          {/* Lightbox Top Control Bar */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-between text-white z-20 pb-3 border-b border-white/10"
          >
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-white/10 text-xs font-mono font-bold text-cyan-300 border border-white/10">
                {lightboxIndex + 1} / {screenshots.length}
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-200 truncate max-w-[180px] sm:max-w-md">
                {screenshots[lightboxIndex].title}
              </span>
            </div>

            {/* Zoom Controls & Close */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setZoomScale((prev) => Math.max(1, prev - 0.5))}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition active:scale-90"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setZoomScale(1)}
                className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono font-bold text-white transition active:scale-90"
                title="Reset Zoom"
              >
                {Math.round(zoomScale * 100)}%
              </button>

              <button
                type="button"
                onClick={() => setZoomScale((prev) => Math.min(2.5, prev + 0.5))}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition active:scale-90"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="p-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white transition active:scale-90 ml-2"
                title="Close Fullscreen"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Lightbox Center Image Viewport with Touch-Swipe */}
          <div
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleLightboxTouchStart}
            onTouchMove={handleLightboxTouchMove}
            onTouchEnd={handleLightboxTouchEnd}
            className="relative flex-1 flex items-center justify-center overflow-hidden my-auto"
          >
            <img
              src={screenshots[lightboxIndex].url}
              alt={screenshots[lightboxIndex].title}
              style={{ transform: `scale(${zoomScale})` }}
              onDoubleClick={() => setZoomScale((prev) => (prev > 1 ? 1 : 2))}
              className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl transition-transform duration-200 cursor-zoom-in"
            />

            {/* Left/Right Floating Navigation */}
            {screenshots.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setLightboxIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length)}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 shadow-2xl transition active:scale-90 cursor-pointer"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  type="button"
                  onClick={() => setLightboxIndex((prev) => (prev + 1) % screenshots.length)}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 shadow-2xl transition active:scale-90 cursor-pointer"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Lightbox Bottom Thumbnail Row */}
          {screenshots.length > 1 && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center gap-2 overflow-x-auto pt-3 border-t border-white/10 no-scrollbar"
            >
              {screenshots.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setLightboxIndex(idx);
                    setZoomScale(1);
                  }}
                  className={`w-16 h-12 rounded-xl overflow-hidden border-2 shrink-0 transition cursor-pointer ${
                    lightboxIndex === idx
                      ? 'border-cyan-400 scale-105 shadow-lg shadow-cyan-400/40 ring-2 ring-cyan-400/50'
                      : 'border-white/20 opacity-50 hover:opacity-100'
                  }`}
                >
                  <img src={s.url} alt={s.title} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. Direct Seller Contact / Messaging Modal Sheet */}
      {isSellerContactModalOpen && (
        <div
          onClick={() => setIsSellerContactModalOpen(false)}
          className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-cyan-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isMM ? 'ရောင်းသူနှင့် ဆက်သွယ်ရန်' : 'Contact Seller'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSellerContactModalOpen(false)}
                className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <img
                src={listing.seller.avatar}
                alt={listing.seller.name}
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  {listing.seller.name}
                </h4>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400">
                  {listing.seller.phone} (Viber / Telegram)
                </div>
                <div className="text-[10px] text-slate-400">
                  Average reply time: ~{listing.seller.responseMinutes} mins
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/30 text-[11px] text-amber-800 dark:text-amber-300">
              ⚠️ <strong>{isMM ? 'သတိပေးချက်' : 'Safety Warning'}</strong>: {isMM ? 'အပြင်တွင် တိုက်ရိုက်ငွေလွှဲခြင်း မပြုလုပ်ပါနှင့်။ GameZay Escrow စနစ်ဖြင့်သာ ငွေလွှဲပါက အပြည့်အဝ အာမခံပေးပါသည်။' : 'Never make direct payments outside GameZay. Always use the Escrow purchase button to ensure 100% money-back guarantee.'}
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(listing.seller.phone);
                  showToast(isMM ? 'ဖုန်းနံပါတ် ကူးယူပြီးပါပြီ' : 'Seller phone number copied!');
                  setIsSellerContactModalOpen(false);
                }}
                className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
              >
                <Copy className="w-4 h-4" />
                <span>{isMM ? 'ရောင်းသူ ဖုန်းနံပါတ် ကူးယူမည်' : 'Copy Seller Phone Number'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsSellerContactModalOpen(false);
                  onProceedToBuy(listing);
                }}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isMM ? 'တိုက်ရိုက် Escrow ဖြင့် ဝယ်မည်' : 'Proceed via Escrow Instead'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Report Listing Modal */}
      {isReportModalOpen && (
        <div
          onClick={() => setIsReportModalOpen(false)}
          className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Flag className="w-5 h-5 text-rose-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isMM ? 'အကောင့်အား အစီရင်ခံစာတင်ရန်' : 'Report Listing'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              {isMM ? 'ဤအကောင့်တွင် မမှန်ကန်သော အချက်အလက်များ သို့မဟုတ် လိမ်လည်မှုသံသယရှိပါက အက်ဒမင်ထံ တိုင်ကြားနိုင်ပါသည်။' : 'Select the reason you believe this listing violates GameZay trust guidelines:'}
            </p>

            <div className="space-y-2">
              {[
                isMM ? 'မှားယွင်းသော ဂိမ်းအချက်အလက် / စကင်းအရေအတွက်' : 'Inaccurate Game Attributes / Fake Rank',
                isMM ? 'အကောင့်ပိုင်ရှင် မဟုတ်ခြင်း / ခိုးယူထားသောအကောင့်' : 'Not original owner / Stolen Account',
                isMM ? 'ချိတ်ဆက်မှု မရှင်းလင်းခြင်း (Gmail / 3rd party တွဲလျက်)' : 'Unclean or 3rd Party Linked Account',
                isMM ? 'စျေးနှုန်းမမှန်ကန်ခြင်း / လိမ်လည်ရန် ရည်ရွယ်ချက်' : 'Suspicious Pricing or Phishing attempt',
              ].map((reason, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setIsReportModalOpen(false);
                    showToast(isMM ? 'အစီရင်ခံစာ ပေးပို့ပြီးပါပြီ။ Admin က စစ်ဆေးပါမည်။' : 'Report submitted to GameZay Trust & Safety!');
                  }}
                  className="w-full p-3 text-left rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-rose-500/10 hover:border-rose-500/30 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition cursor-pointer"
                >
                  🚩 {reason}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

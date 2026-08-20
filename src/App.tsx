/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { GameCategoryTabs } from './components/GameCategoryTabs';
import { ListingCard } from './components/ListingCard';
import { ListingDetailModal } from './components/ListingDetailModal';
import { EscrowCheckoutModal } from './components/EscrowCheckoutModal';
import { EscrowOrderTracker } from './components/EscrowOrderTracker';
import { SellAccountModal } from './components/SellAccountModal';
import { AdminDashboard } from './components/AdminDashboard';
import { SellerDashboard } from './components/SellerDashboard';
import { PrismaSchemaViewer } from './components/PrismaSchemaViewer';
import { HomePageView } from './components/HomePageView';
import { NotificationsModal } from './components/NotificationsModal';
import { UserProfileView } from './components/UserProfileView';
import { SettingsModal } from './components/SettingsModal';
import { KycVerificationModal } from './components/KycVerificationModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MobileFilterDrawer } from './components/MobileFilterDrawer';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { Footer } from './components/Footer';
import { INITIAL_LISTINGS, INITIAL_ORDERS, INITIAL_PAYOUTS, INITIAL_KYC_SUBMISSIONS } from './data/mockData';
import {
  AccountListing,
  ChatMessage,
  DisputeInfo,
  EscrowOrder,
  EscrowStatus,
  GameType,
  KycStatus,
  KycSubmission,
  SellerPayoutRequest,
  UserRole,
} from './types';
import {
  Filter,
  ArrowUpDown,
  CheckCircle2,
  Search,
  Sparkles,
  Zap,
  SlidersHorizontal,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  ChevronDown,
} from 'lucide-react';

function MainApp() {
  const { t, formatMMK, isMM } = useLanguage();
  const { actualTheme } = useTheme();

  // Navigation & Role State
  const [currentTab, setCurrentTab] = useState<
    'home' | 'marketplace' | 'orders' | 'sell' | 'admin' | 'seller' | 'schema' | 'profile'
  >('home');
  const [userRole, setUserRole] = useState<UserRole>('BUYER');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Listings & Filter State
  const [listings, setListings] = useState<AccountListing[]>(INITIAL_LISTINGS);
  const [selectedGame, setSelectedGame] = useState<GameType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high' | 'popular'>('newest');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');

  // Mobile Drawer & Collapsible Top-Filter State
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isTopFilterExpanded, setIsTopFilterExpanded] = useState(false);

  // Escrow Orders & Payouts State
  const [orders, setOrders] = useState<EscrowOrder[]>(INITIAL_ORDERS);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(orders[0]?.id || null);
  const [payouts, setPayouts] = useState<SellerPayoutRequest[]>(INITIAL_PAYOUTS);

  // KYC Verification State
  const [kycStatus, setKycStatus] = useState<KycStatus>('VERIFIED');
  const [kycSubmissions, setKycSubmissions] = useState<KycSubmission[]>(INITIAL_KYC_SUBMISSIONS);
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);

  // Modals State
  const [inspectListing, setInspectListing] = useState<AccountListing | null>(null);
  const [buyListing, setBuyListing] = useState<AccountListing | null>(null);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Game counts calculation
  const gameCounts = useMemo(() => {
    const counts: Record<GameType | 'all', number> = {
      all: listings.length,
      efootball: 0,
      mlbb: 0,
      pubg: 0,
      coc: 0,
      freefire: 0,
      genshin: 0,
    };
    listings.forEach((item) => {
      if (counts[item.gameType] !== undefined) {
        counts[item.gameType]++;
      }
    });
    return counts;
  }, [listings]);

  // Filtered and Sorted Listings
  const filteredListings = useMemo(() => {
    return listings
      .filter((item) => {
        // Game category filter
        if (selectedGame !== 'all' && item.gameType !== selectedGame) {
          return false;
        }

        // Verified seller filter
        if (verifiedOnly && !item.isVerifiedSeller) {
          return false;
        }

        // Price range filter (MMK)
        if (minPrice !== '' && item.priceMMK < minPrice) {
          return false;
        }
        if (maxPrice !== '' && item.priceMMK > maxPrice) {
          return false;
        }

        // Search Query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchGame = item.gameType.toLowerCase().includes(q);
          const matchDesc = item.description.toLowerCase().includes(q);
          const matchSeller = item.seller.name.toLowerCase().includes(q);

          // Deep search in dynamic attributes
          const matchAttrs = Object.values(item.attributes).some((val) => {
            if (typeof val === 'string') return val.toLowerCase().includes(q);
            if (Array.isArray(val)) return val.some((v) => String(v).toLowerCase().includes(q));
            return false;
          });

          return matchTitle || matchGame || matchDesc || matchSeller || matchAttrs;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'price_low') {
          return a.priceMMK - b.priceMMK;
        }
        if (sortBy === 'price_high') {
          return b.priceMMK - a.priceMMK;
        }
        if (sortBy === 'popular') {
          return b.views - a.views;
        }
        return 0;
      });
  }, [listings, selectedGame, verifiedOnly, minPrice, maxPrice, searchQuery, sortBy]);

  // Handlers for Escrow & Order updates
  const handleOrderCreated = (newOrder: EscrowOrder) => {
    setOrders([newOrder, ...orders]);
    setSelectedOrderId(newOrder.id);
    setCurrentTab('orders');

    // Update listing status
    setListings((prev) =>
      prev.map((item) =>
        item.id === newOrder.listingId ? { ...item, status: 'IN_ESCROW' as const } : item
      )
    );
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: EscrowStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    // If completed, add payout request
    if (newStatus === 'COMPLETED') {
      const order = orders.find((o) => o.id === orderId);
      if (order) {
        const newPayout: SellerPayoutRequest = {
          id: `pay-${Date.now()}`,
          orderNumber: order.orderNumber,
          sellerName: order.sellerName,
          amountMMK: order.amountMMK,
          walletMethod: order.paymentMethod.includes('USDT') ? 'USDT_TRC20' : 'KBZ_PAY',
          walletNumber: '09450012345',
          walletAccountName: order.sellerName,
          status: 'PENDING',
          requestedAt: new Date().toISOString(),
        };
        setPayouts((prev) => [newPayout, ...prev]);
      }
    }
  };

  const handleOpenDispute = (
    orderId: string,
    reason: string,
    description: string,
    proofUrls?: string[]
  ) => {
    const disputeMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      orderId,
      senderRole: 'BUYER',
      senderName: 'Buyer (Claimant)',
      text: `🚨 DISPUTE FILED: "${reason}". Details: "${description}". Escrow funds frozen for admin review.`,
      attachmentUrl: proofUrls && proofUrls.length > 0 ? proofUrls[0] : undefined,
      attachmentType: 'PROOF',
      createdAt: new Date().toISOString(),
    };

    const adminNoticeMsg: ChatMessage = {
      id: `msg-${Date.now() + 1}`,
      orderId,
      senderRole: 'ADMIN',
      senderName: 'GameZay Resolution Officer',
      text:
        '🛡️ Escrow Dispute Notice: Escrow funds are locked. Both Buyer & Seller must provide unedited screenshots/screen-recording proof in this chat room. Admin will review within 2 hours.',
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const currentMsgs = o.chatMessages || [];
          return {
            ...o,
            status: 'DISPUTED' as const,
            disputeInfo: {
              reason,
              description,
              filedAt: new Date().toISOString(),
              status: 'OPEN',
              proofUrls: proofUrls || [],
            },
            chatMessages: [...currentMsgs, disputeMsg, adminNoticeMsg],
          };
        }
        return o;
      })
    );
  };

  const handleSendMessage = (
    orderId: string,
    message: Omit<ChatMessage, 'id' | 'createdAt' | 'orderId'>
  ) => {
    const newMsg: ChatMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      orderId,
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const currentMsgs = o.chatMessages || [];
          return {
            ...o,
            chatMessages: [...currentMsgs, newMsg],
          };
        }
        return o;
      })
    );
  };

  const handleAdminRefundBuyer = (orderId: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    const amountStr = targetOrder ? targetOrder.amountMMK.toLocaleString() : '';

    const resolutionMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      orderId,
      senderRole: 'ADMIN',
      senderName: 'Dispute Resolution Team',
      text: `⚖️ ADMIN VERDICT: Buyer's claim verified. Full refund of ${amountStr} MMK has been processed to Buyer's wallet. Case closed.`,
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const currentMsgs = o.chatMessages || [];
          return {
            ...o,
            status: 'REFUNDED' as const,
            disputeInfo: o.disputeInfo
              ? { ...o.disputeInfo, status: 'RESOLVED_REFUND' as const }
              : undefined,
            chatMessages: [...currentMsgs, resolutionMsg],
          };
        }
        return o;
      })
    );
  };

  const handleAdminReleaseToSeller = (orderId: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    const amountStr = targetOrder ? targetOrder.amountMMK.toLocaleString() : '';

    const resolutionMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      orderId,
      senderRole: 'ADMIN',
      senderName: 'Dispute Resolution Team',
      text: `⚖️ ADMIN VERDICT: Account credentials & integrity verified valid. Escrow funds (${amountStr} MMK) released to Seller's payout queue. Case closed.`,
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const currentMsgs = o.chatMessages || [];
          return {
            ...o,
            status: 'COMPLETED' as const,
            disputeInfo: o.disputeInfo
              ? { ...o.disputeInfo, status: 'RESOLVED_RELEASE' as const }
              : undefined,
            chatMessages: [...currentMsgs, resolutionMsg],
          };
        }
        return o;
      })
    );

    // Trigger seller payout
    if (targetOrder) {
      const newPayout: SellerPayoutRequest = {
        id: `pay-${Date.now()}`,
        orderNumber: targetOrder.orderNumber,
        sellerName: targetOrder.sellerName,
        amountMMK: targetOrder.amountMMK,
        walletMethod: targetOrder.paymentMethod.includes('USDT') ? 'USDT_TRC20' : 'KBZ_PAY',
        walletNumber: '09450012345',
        walletAccountName: targetOrder.sellerName,
        status: 'PENDING',
        requestedAt: new Date().toISOString(),
      };
      setPayouts((prev) => [newPayout, ...prev]);
    }
  };

  const handleAdminRequestMoreProof = (orderId: string) => {
    const noticeMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      orderId,
      senderRole: 'ADMIN',
      senderName: 'Dispute Resolution Officer',
      text:
        '🔍 ADMIN NOTICE: Both parties are requested to submit unedited screen recording or login attempts with timestamps within 12 hours for case evaluation.',
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const currentMsgs = o.chatMessages || [];
          return {
            ...o,
            chatMessages: [...currentMsgs, noticeMsg],
          };
        }
        return o;
      })
    );
  };

  const handleApprovePaymentSlip = (orderId: string) => {
    handleUpdateOrderStatus(orderId, 'ESCROW_LOCKED');
  };

  const handleRejectPaymentSlip = (orderId: string) => {
    handleUpdateOrderStatus(orderId, 'PENDING_PAYMENT_PROOF');
  };

  const handleApprovePayout = (payoutId: string) => {
    setPayouts((prev) =>
      prev.map((p) => (p.id === payoutId ? { ...p, status: 'PAID' as const } : p))
    );
  };

  const handleRequestSellerPayout = (payout: SellerPayoutRequest) => {
    setPayouts((prev) => [payout, ...prev]);
  };

  const handleUpdateListing = (listingId: string, updatedFields: Partial<AccountListing>) => {
    setListings((prev) =>
      prev.map((item) => (item.id === listingId ? { ...item, ...updatedFields } : item))
    );
  };

  const handleDeleteListing = (listingId: string) => {
    setListings((prev) => prev.filter((item) => item.id !== listingId));
  };

  const handleKycSubmit = (submission: KycSubmission) => {
    setKycSubmissions((prev) => [submission, ...prev]);
    setKycStatus('PENDING');
  };

  const handleApproveKyc = (submissionId: string) => {
    setKycSubmissions((prev) =>
      prev.map((k) => (k.id === submissionId ? { ...k, status: 'VERIFIED' as const } : k))
    );
    setKycStatus('VERIFIED');
    setUserRole('SELLER');
  };

  const handleRejectKyc = (submissionId: string, reason: string) => {
    setKycSubmissions((prev) =>
      prev.map((k) => (k.id === submissionId ? { ...k, status: 'REJECTED' as const } : k))
    );
    setKycStatus('REJECTED');
  };

  const handleListingCreated = (newListing: AccountListing) => {
    setListings([newListing, ...listings]);
    setSelectedGame(newListing.gameType);
    setCurrentTab('marketplace');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* PWA Install Banner */}
      <PWAInstallBanner />

      {/* Main Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        userRole={userRole}
        setUserRole={setUserRole}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        openSellModal={() => setIsSellModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        unreadNotificationsCount={3}
        ordersCount={orders.filter((o) => o.status !== 'COMPLETED').length}
      />

      {/* Main Body Content */}
      <div className="flex-1 pb-32 sm:pb-28 md:pb-16 overflow-y-auto">
        {/* View 1: Home Page */}
        {currentTab === 'home' && (
          <HomePageView
            listings={listings}
            onSelectGame={(game) => {
              setSelectedGame(game);
              setCurrentTab('marketplace');
            }}
            onNavigateToMarketplace={(game) => {
              if (game) setSelectedGame(game);
              setCurrentTab('marketplace');
            }}
            onOpenSellModal={() => setIsSellModalOpen(true)}
            onInspectListing={(item) => setInspectListing(item)}
            onBuyListing={(item) => setBuyListing(item)}
          />
        )}

        {/* View 2: Marketplace Page */}
        {currentTab === 'marketplace' && (
          <main className="space-y-4 sm:space-y-6">
            {/* Sticky Game Category Selection */}
            <GameCategoryTabs
              selectedGame={selectedGame}
              onSelectGame={setSelectedGame}
              gameCounts={gameCounts}
            />

            {/* Marketplace Listings Section */}
            <section
              id="marketplace-listings"
              className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 space-y-4"
            >
              {/* Header Title & Active Status */}
              <div className="flex items-center justify-between pb-1">
                <div>
                  <h1 className="text-base sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{isMM ? 'ဂိမ်းအကောင့် စျေးကွက်' : 'Verified Accounts Marketplace'}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-mono font-bold">
                      {filteredListings.length}
                    </span>
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                    {isMM
                      ? 'ဝယ်ယူသူ စိတ်ကြိုက်စစ်ဆေးနိုင်သော ၂၄ နာရီ Escrow အာမခံ အကောင့်များ'
                      : 'Browse game accounts with 100% Escrow buyer protection and verified credentials.'}
                  </p>
                </div>

                {/* Quick reset filters button if filtered */}
                {(selectedGame !== 'all' || verifiedOnly || minPrice !== '' || maxPrice !== '' || searchQuery) && (
                  <button
                    onClick={() => {
                      setSelectedGame('all');
                      setVerifiedOnly(false);
                      setMinPrice('');
                      setMaxPrice('');
                      setSearchQuery('');
                    }}
                    className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer bg-cyan-500/10 px-3 py-1.5 rounded-xl border border-cyan-500/20"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{t('filters.clearAll')}</span>
                  </button>
                )}
              </div>
              {/* Collapsible Mobile Top Filter Bar */}
              <div className="block md:hidden bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {filteredListings.length} {t('filters.resultsFound')}
                    </span>
                    {(verifiedOnly || minPrice !== '' || maxPrice !== '') && (
                      <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Toggle Top Filter Expand */}
                    <button
                      onClick={() => setIsTopFilterExpanded(!isTopFilterExpanded)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 active:scale-95 transition"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-500" />
                      <span>{isTopFilterExpanded ? (isMM ? 'ပိတ်မည်' : 'Hide') : (isMM ? 'စစ်ထုတ်ရန်' : 'Quick Filters')}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          isTopFilterExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Open Mobile Drawer */}
                    <button
                      onClick={() => setIsFilterDrawerOpen(true)}
                      className="p-1.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20"
                      aria-label="Open filter drawer"
                    >
                      <Filter className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Top Filter Controls on Mobile */}
                {isTopFilterExpanded && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">
                          {t('mobileFilter.minPrice')}
                        </label>
                        <input
                          type="number"
                          placeholder="Min MMK"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : '')}
                          className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">
                          {t('mobileFilter.maxPrice')}
                        </label>
                        <input
                          type="number"
                          placeholder="Max MMK"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
                          className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          checked={verifiedOnly}
                          onChange={(e) => setVerifiedOnly(e.target.checked)}
                          className="rounded text-cyan-500 focus:ring-cyan-500 bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-slate-700"
                        />
                        <span>{t('mobileFilter.verifiedOnly')}</span>
                      </label>

                      {(verifiedOnly || minPrice !== '' || maxPrice !== '' || searchQuery) && (
                        <button
                          onClick={() => {
                            setVerifiedOnly(false);
                            setMinPrice('');
                            setMaxPrice('');
                            setSearchQuery('');
                          }}
                          className="text-[11px] text-rose-500 dark:text-rose-400 font-medium flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>{t('mobileFilter.reset')}</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Main Responsive Grid Layout (100% full-width on mobile, 12-cols on desktop) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full">
                {/* Desktop Expanded Sidebar Filters (col-span-1 md:col-span-4 lg:col-span-3) */}
                <div className="hidden md:block md:col-span-4 lg:col-span-3 space-y-4">
                  <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-6 shadow-sm sticky top-24 transition-colors">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-cyan-500" />
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          {t('filters.filterBy')}
                        </h3>
                      </div>
                      {(selectedGame !== 'all' || verifiedOnly || minPrice !== '' || maxPrice !== '' || searchQuery) && (
                        <button
                          onClick={() => {
                            setSelectedGame('all');
                            setVerifiedOnly(false);
                            setMinPrice('');
                            setMaxPrice('');
                            setSearchQuery('');
                          }}
                          className="text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>{t('filters.clearAll')}</span>
                        </button>
                      )}
                    </div>

                    {/* Sort Order */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <ArrowUpDown className="w-3.5 h-3.5 text-cyan-500" />
                        <span>{t('filters.sortBy')}</span>
                      </label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
                      >
                        <option value="newest">{t('filters.sortNewest')}</option>
                        <option value="price_low">{t('filters.sortPriceLow')}</option>
                        <option value="price_high">{t('filters.sortPriceHigh')}</option>
                        <option value="popular">{t('filters.sortPopular')}</option>
                      </select>
                    </div>

                    {/* Price Range (MMK) */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        {t('filters.priceRange')}
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          placeholder="Min (ကျပ်)"
                          value={minPrice}
                          onChange={(e) =>
                            setMinPrice(e.target.value ? Number(e.target.value) : '')
                          }
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 font-mono"
                        />
                        <input
                          type="number"
                          placeholder="Max (ကျပ်)"
                          value={maxPrice}
                          onChange={(e) =>
                            setMaxPrice(e.target.value ? Number(e.target.value) : '')
                          }
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 font-mono"
                        />
                      </div>
                    </div>

                    {/* Verified Sellers Toggle */}
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:text-slate-900 dark:hover:text-white transition">
                        <input
                          type="checkbox"
                          checked={verifiedOnly}
                          onChange={(e) => setVerifiedOnly(e.target.checked)}
                          className="rounded text-cyan-500 focus:ring-cyan-500 bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-slate-700"
                        />
                        <span>{t('filters.verifiedSellersOnly')}</span>
                      </label>
                    </div>

                    {/* Escrow Guarantee Badge */}
                    <div className="p-3.5 rounded-2xl bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800/40 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400 font-bold">
                        <ShieldCheck className="w-4 h-4" />
                        <span>100% Escrow Shield</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                        {isMM
                          ? 'ဝယ်ယူသူ စိတ်ကြိုက်စစ်ဆေးပြီးမှသာ ရောင်းသူထံ ငွေလွှဲပေးပါသည်'
                          : 'Zero scam platform. Funds released only after credential check.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Main Listings Grid (col-span-1 md:col-span-8 lg:col-span-9) */}
                <div className="col-span-1 md:col-span-8 lg:col-span-9 w-full">
                  {filteredListings.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 sm:p-16 text-center space-y-3 w-full shadow-sm">
                      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                        <Search className="w-6 h-6" />
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {isMM ? 'ကိုက်ညီသော အကောင့် ရှာမတွေ့ပါ' : 'No Accounts Found'}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                        {isMM
                          ? 'ရှာဖွေမှုစကားလုံး သို့မဟုတ် စစ်ထုတ်မှုများကို ပြန်လည်ချိန်ညှိပါ'
                          : 'Try resetting the filters or searching for other game titles.'}
                      </p>
                      <button
                        onClick={() => {
                          setSelectedGame('all');
                          setSearchQuery('');
                          setVerifiedOnly(false);
                          setMinPrice('');
                          setMaxPrice('');
                        }}
                        className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-900 dark:text-white transition"
                      >
                        {t('filters.clearAll')}
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-4.5 w-full">
                      {filteredListings.map((listing) => (
                        <ListingCard
                          key={listing.id}
                          listing={listing}
                          onInspect={(item) => setInspectListing(item)}
                          onBuy={(item) => setBuyListing(item)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </main>
        )}

        {/* View 2: Escrow Room / My Orders */}
        {currentTab === 'orders' && (
          <EscrowOrderTracker
            orders={orders}
            selectedOrderId={selectedOrderId}
            setSelectedOrderId={setSelectedOrderId}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onOpenDispute={handleOpenDispute}
            onSendMessage={handleSendMessage}
            currentRole={userRole}
          />
        )}

        {/* View 3: Seller Dashboard */}
        {currentTab === 'seller' && (
          <SellerDashboard
            listings={listings}
            orders={orders}
            payouts={payouts}
            onOpenSellModal={() => setIsSellModalOpen(true)}
            onRequestPayout={handleRequestSellerPayout}
            onUpdateListing={handleUpdateListing}
            onDeleteListing={handleDeleteListing}
            kycStatus={kycStatus}
            onOpenKycModal={() => setIsKycModalOpen(true)}
            userRole={userRole}
          />
        )}

        {/* View 4: Admin Desk */}
        {currentTab === 'admin' && (
          <AdminDashboard
            orders={orders}
            payouts={payouts}
            kycSubmissions={kycSubmissions}
            onApproveKyc={handleApproveKyc}
            onRejectKyc={handleRejectKyc}
            onApprovePaymentSlip={handleApprovePaymentSlip}
            onRejectPaymentSlip={handleRejectPaymentSlip}
            onApprovePayout={handleApprovePayout}
            onAdminRefundBuyer={handleAdminRefundBuyer}
            onAdminReleaseToSeller={handleAdminReleaseToSeller}
            onAdminRequestMoreProof={handleAdminRequestMoreProof}
            onSendMessage={handleSendMessage}
          />
        )}

        {/* View 5: Prisma PostgreSQL Schema Viewer */}
        {currentTab === 'schema' && <PrismaSchemaViewer />}

        {/* View 6: User Profile & Settings Dashboard */}
        {currentTab === 'profile' && (
          <UserProfileView
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenSellModal={() => setIsSellModalOpen(true)}
            onOpenKycModal={() => setIsKycModalOpen(true)}
            kycStatus={kycStatus}
            userRole={userRole}
            onNavigateToSellerStudio={() => setCurrentTab('seller')}
            userListings={listings.filter((l) => l.seller.name.includes('Kyaw') || l.seller.name.includes('You') || l.id === 'ef-01')}
            userOrders={orders}
            onSelectOrder={(orderId) => {
              setSelectedOrderId(orderId);
              setCurrentTab('orders');
            }}
            onInspectListing={(listing) => setInspectListing(listing)}
          />
        )}
      </div>

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Navigation Bar (5 Primary Touch Destinations: Home, Market, Sell, Orders, Profile) */}
      <MobileBottomNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        openSellModal={() => setIsSellModalOpen(true)}
        activeOrdersCount={orders.filter((o) => o.status !== 'COMPLETED').length}
        kycStatus={kycStatus}
        userRole={userRole}
        onOpenKycModal={() => setIsKycModalOpen(true)}
      />

      {/* Notifications Drawer / Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNavigateTab={(tab, orderId) => {
          setCurrentTab(tab as any);
          if (orderId) setSelectedOrderId(orderId);
        }}
      />

      {/* Mobile Filter Bottom Sheet Drawer */}
      <MobileFilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        selectedGame={selectedGame}
        setSelectedGame={setSelectedGame}
        verifiedOnly={verifiedOnly}
        setVerifiedOnly={setVerifiedOnly}
        sortBy={sortBy}
        setSortBy={setSortBy}
        minPrice={minPrice}
        setMinPrice={setMinPrice}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        totalResults={filteredListings.length}
      />

      {/* Inspect Listing Details Modal */}
      {inspectListing && (
        <ListingDetailModal
          listing={inspectListing}
          onClose={() => setInspectListing(null)}
          onProceedToBuy={(item) => {
            setInspectListing(null);
            setBuyListing(item);
          }}
        />
      )}

      {/* Escrow Buy Modal with Myanmar Payment Methods */}
      {buyListing && (
        <EscrowCheckoutModal
          listing={buyListing}
          onClose={() => setBuyListing(null)}
          onOrderCreated={handleOrderCreated}
        />
      )}

      {/* Sell Account Listing Wizard */}
      <SellAccountModal
        isOpen={isSellModalOpen}
        onClose={() => setIsSellModalOpen(false)}
        onListingCreated={handleListingCreated}
      />

      {/* User Settings & Preferences Modal (Theme, Language, Account & Security) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* KYC Seller Identity Verification Modal */}
      <KycVerificationModal
        isOpen={isKycModalOpen}
        onClose={() => setIsKycModalOpen(false)}
        onSubmit={handleKycSubmit}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <MainApp />
      </LanguageProvider>
    </ThemeProvider>
  );
}

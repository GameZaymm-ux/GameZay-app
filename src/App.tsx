/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
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
import { SellerDashboard, SellerTabType } from './components/SellerDashboard';
import { PrismaSchemaViewer } from './components/PrismaSchemaViewer';
import { HomePageView } from './components/HomePageView';
import { RecommendedMerchantsCarousel } from './components/RecommendedMerchantsCarousel';
import { NotificationsModal } from './components/NotificationsModal';
import { UserProfileView } from './components/UserProfileView';
import { SettingsModal } from './components/SettingsModal';
import { AuthModal } from './components/AuthModal';
import { KycVerificationModal } from './components/KycVerificationModal';
import { KycRequiredModal, KycPendingModal } from './components/KycGateModals';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MobileFilterDrawer } from './components/MobileFilterDrawer';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { INITIAL_LISTINGS, INITIAL_ORDERS, INITIAL_PAYOUTS, INITIAL_KYC_SUBMISSIONS } from './data/mockData';
import {
  fetchLiveListings,
  fetchLiveOrders,
  fetchLiveProfile,
  createLiveListing,
  signOutFromSupabase,
  isSupabaseConfigured,
  supabase,
} from './lib/supabaseClient';
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
  MerchantSubscription,
  AuthUser,
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
  Crown,
  Rocket,
} from 'lucide-react';

function MainApp() {
  const { t, formatMMK, isMM } = useLanguage();
  const { actualTheme } = useTheme();

  // Navigation & Role State
  const [currentTab, setCurrentTab] = useState<
    'home' | 'marketplace' | 'orders' | 'sell' | 'admin' | 'seller' | 'schema' | 'profile'
  >('home');
  const [userRole, setUserRole] = useState<UserRole>('BUYER');
  const [sellerTab, setSellerTab] = useState<SellerTabType>('overview');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Listings & Filter State
  const [listings, setListings] = useState<AccountListing[]>(INITIAL_LISTINGS);
  const [selectedGame, setSelectedGame] = useState<GameType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high' | 'popular'>('newest');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [proMerchantsOnly, setProMerchantsOnly] = useState(false);
  const [selectedMerchantFilter, setSelectedMerchantFilter] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');

  // Pro Merchant Subscription State
  const [merchantSubscription, setMerchantSubscription] = useState<MerchantSubscription>({
    isActive: true,
    plan: 'PRO_MONTHLY',
    subscribedAt: '2026-08-01T00:00:00Z',
    expiresAt: '2026-09-20T00:00:00Z',
    bumpQuotaRemaining: 18,
    bumpQuotaTotal: 20,
    monthlyFeeMMK: 25000,
    autoRenew: true,
  });

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
  const [isKycRequiredModalOpen, setIsKycRequiredModalOpen] = useState(false);
  const [isKycPendingModalOpen, setIsKycPendingModalOpen] = useState(false);

  // Modals State
  const [inspectListing, setInspectListing] = useState<AccountListing | null>(null);
  const [buyListing, setBuyListing] = useState<AccountListing | null>(null);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [savedListingIds, setSavedListingIds] = useState<string[]>(['ef-02', 'ml-01', 'pubg-01']);

  // Authentication & User Profile State
  const [authUser, setAuthUser] = useState<AuthUser | null>({
    id: 'current-user-1',
    email: 'gamezaymm@gmail.com',
    fullName: 'Ko Min Thant',
    username: 'KyawZin_Gamer99',
    phone: '+95 9 450 012 345',
    avatarUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=300&auto=format&fit=crop&q=80',
    kycStatus: 'VERIFIED',
    isProMerchant: true,
    role: 'BUYER',
    balanceMMK: 850000,
    heldInEscrowMMK: 320000,
    sellerRating: 4.95,
    totalRatings: 38,
    createdAt: '2024-08-01T00:00:00Z',
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  // Fetch live Supabase data on mount with full SSR / fallback protection
  useEffect(() => {
    let isMounted = true;

    async function loadSupabaseData() {
      try {
        const [liveListings, liveOrders, liveProfile] = await Promise.all([
          fetchLiveListings(),
          fetchLiveOrders(),
          fetchLiveProfile('current-user-1'),
        ]);

        if (isMounted) {
          if (liveListings && liveListings.length > 0) {
            setListings(liveListings);
          }
          if (liveOrders && liveOrders.length > 0) {
            setOrders(liveOrders);
          }
          if (liveProfile) {
            if (liveProfile.kycStatus) {
              setKycStatus(liveProfile.kycStatus);
            }
            if (liveProfile.subscription) {
              setMerchantSubscription(liveProfile.subscription);
            }
            setAuthUser((prev) =>
              prev
                ? {
                    ...prev,
                    fullName: liveProfile.name || prev.fullName,
                    username: liveProfile.username || prev.username,
                    phone: liveProfile.phone || prev.phone,
                    kycStatus: liveProfile.kycStatus || prev.kycStatus,
                    balanceMMK: liveProfile.balanceMMK ?? prev.balanceMMK,
                    heldInEscrowMMK: liveProfile.heldInEscrowMMK ?? prev.heldInEscrowMMK,
                  }
                : null
            );
          }
        }
      } catch (err) {
        console.warn('Supabase initial fetch gracefully defaulted:', err);
      }
    }

    loadSupabaseData();

    // Listen to Supabase Auth State Changes
    let authSubscription: any = null;
    try {
      if (supabase && typeof window !== 'undefined') {
        const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (!isMounted) return;
          if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
            const user = session.user;
            const profile = await fetchLiveProfile(user.id);
            if (isMounted) {
              setAuthUser({
                id: user.id,
                email: user.email || '',
                fullName: user.user_metadata?.full_name || profile.name || 'Gamer',
                username: user.user_metadata?.username || profile.username || 'KyawZin_MM',
                phone: user.user_metadata?.phone || profile.phone || '09798889901',
                avatarUrl: user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=300&auto=format&fit=crop&q=80',
                kycStatus: profile.kycStatus || 'VERIFIED',
                isProMerchant: profile.isProMerchant ?? true,
                role: userRole,
                balanceMMK: profile.balanceMMK ?? 850000,
                heldInEscrowMMK: profile.heldInEscrowMMK ?? 320000,
                sellerRating: profile.sellerRating ?? 4.95,
                totalRatings: profile.totalRatings ?? 38,
              });
              if (profile.kycStatus) setKycStatus(profile.kycStatus);
              if (profile.subscription) setMerchantSubscription(profile.subscription);
            }
          } else if (event === 'SIGNED_OUT') {
            if (isMounted) setAuthUser(null);
          }
        });
        authSubscription = listener?.subscription;
      }
    } catch (authErr) {
      console.warn('Supabase auth state listener fallback notice:', authErr);
    }

    // Setup Supabase Realtime channel if available
    let channel: any = null;
    try {
      if (supabase && typeof window !== 'undefined') {
        channel = supabase
          .channel('public:listings')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'listings' }, () => {
            fetchLiveListings().then((updated) => {
              if (isMounted && updated?.length) setListings(updated);
            });
          })
          .subscribe();
      }
    } catch {
      // ignore realtime connection error
    }

    return () => {
      isMounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
      if (channel && supabase) {
        supabase.removeChannel(channel).catch(() => {});
      }
    };
  }, [userRole]);

  // Auth Handler functions
  const handleOpenAuthModal = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = async (userData: {
    id: string;
    email: string;
    fullName: string;
    username: string;
    phone?: string;
  }) => {
    try {
      const profile = await fetchLiveProfile(userData.id);
      setAuthUser({
        id: userData.id,
        email: userData.email,
        fullName: userData.fullName || profile.name,
        username: userData.username || profile.username || userData.email.split('@')[0],
        phone: userData.phone || profile.phone || '09798889901',
        avatarUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=300&auto=format&fit=crop&q=80',
        kycStatus: profile.kycStatus || 'VERIFIED',
        isProMerchant: profile.isProMerchant ?? true,
        role: userRole,
        balanceMMK: profile.balanceMMK ?? 850000,
        heldInEscrowMMK: profile.heldInEscrowMMK ?? 320000,
        sellerRating: profile.sellerRating ?? 4.95,
        totalRatings: profile.totalRatings ?? 38,
      });
      if (profile.kycStatus) setKycStatus(profile.kycStatus);
    } catch {
      setAuthUser({
        id: userData.id,
        email: userData.email,
        fullName: userData.fullName,
        username: userData.username,
        phone: userData.phone || '09798889901',
        avatarUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=300&auto=format&fit=crop&q=80',
        kycStatus: 'VERIFIED',
        isProMerchant: true,
        role: userRole,
        balanceMMK: 850000,
        heldInEscrowMMK: 320000,
        sellerRating: 4.95,
        totalRatings: 38,
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutFromSupabase();
    } catch {}
    setAuthUser(null);
  };


  // KYC Gate Check Handler for Selling Accounts (+ Button)
  const handleOpenSellModal = () => {
    if (kycStatus === 'VERIFIED') {
      setIsSellModalOpen(true);
    } else if (kycStatus === 'PENDING') {
      setIsKycPendingModalOpen(true);
    } else {
      setIsKycRequiredModalOpen(true);
    }
  };

  const handleToggleSaveListing = (listingId: string) => {
    setSavedListingIds((prev) =>
      prev.includes(listingId) ? prev.filter((id) => id !== listingId) : [...prev, listingId]
    );
  };

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

  // Filtered and Sorted Listings with Pro Merchant Boost Architecture
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

        // Pro Merchants Only filter
        if (proMerchantsOnly && !item.isProMerchant && !item.seller?.isProMerchant) {
          return false;
        }

        // Selected Merchant from Recommended Carousel
        if (selectedMerchantFilter && item.seller?.name !== selectedMerchantFilter) {
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
          const matchTitle = (item.title || '').toLowerCase().includes(q);
          const matchGame = (item.gameType || '').toLowerCase().includes(q);
          const matchDesc = (item.description || '').toLowerCase().includes(q);
          const matchSeller = (item.seller?.name || '').toLowerCase().includes(q);

          // Deep search in dynamic attributes
          const matchAttrs = Object.values(item.attributes || {}).some((val) => {
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
          // Priority Boost: Bumped timestamps and Pro Merchant status prioritize listings to top
          const aBump = a.bumpedAt ? new Date(a.bumpedAt).getTime() : 0;
          const bBump = b.bumpedAt ? new Date(b.bumpedAt).getTime() : 0;
          if (aBump !== bBump) return bBump - aBump;

          const aPro = a.isProMerchant || a.seller?.isProMerchant ? 1 : 0;
          const bPro = b.isProMerchant || b.seller?.isProMerchant ? 1 : 0;
          if (aPro !== bPro) return bPro - aPro;

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
  }, [
    listings,
    selectedGame,
    verifiedOnly,
    proMerchantsOnly,
    selectedMerchantFilter,
    minPrice,
    maxPrice,
    searchQuery,
    sortBy,
  ]);

  // Pro Merchant Bump and Subscription Handlers
  const handleBumpListing = (listingId: string) => {
    const now = new Date().toISOString();
    setListings((prev) =>
      prev.map((item) =>
        item.id === listingId
          ? {
              ...item,
              bumpedAt: now,
              isProMerchant: true,
              seller: { ...item.seller, isProMerchant: true, merchantBadge: 'PRO_MERCHANT' },
            }
          : item
      )
    );
    setMerchantSubscription((prev) => ({
      ...prev,
      bumpQuotaRemaining: Math.max(0, prev.bumpQuotaRemaining - 1),
    }));
  };

  const handleSubscribeMerchant = () => {
    setMerchantSubscription({
      isActive: true,
      plan: 'PRO_MONTHLY',
      subscribedAt: new Date().toISOString(),
      expiresAt: '2026-09-20T00:00:00Z',
      bumpQuotaRemaining: 20,
      bumpQuotaTotal: 20,
      monthlyFeeMMK: 25000,
      autoRenew: true,
    });
  };

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
              filedBy: userRole === 'SELLER' ? 'SELLER' : 'BUYER',
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

  const handleDeliverCredentials = (
    orderId: string,
    credentials: NonNullable<EscrowOrder['credentials']>
  ) => {
    const deliverMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      orderId,
      senderRole: 'SELLER',
      senderName: 'Seller (Game Owner)',
      text: `🔑 CREDENTIALS DISPATCHED: Game login credentials have been submitted into the secure Escrow vault for Buyer inspection. (Auth: ${credentials.authType || 'Direct Handover'})`,
      attachmentType: 'CREDENTIAL',
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const currentMsgs = o.chatMessages || [];
          return {
            ...o,
            status: 'CREDENTIALS_DISPATCHED' as const,
            credentials,
            inspectionDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            chatMessages: [...currentMsgs, deliverMsg],
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
    setListings((prev) => [newListing, ...prev]);
    setSelectedGame(newListing.gameType);
    setCurrentTab('marketplace');

    // Asynchronously sync with Supabase if available
    try {
      createLiveListing(newListing).catch((err) => {
        console.warn('Background Supabase listing sync gracefully skipped:', err);
      });
    } catch {
      // ignore
    }
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
        openSellModal={handleOpenSellModal}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        unreadNotificationsCount={3}
        ordersCount={orders.filter((o) => o.status !== 'COMPLETED').length}
        authUser={authUser}
        onOpenAuthModal={handleOpenAuthModal}
        onSignOut={handleSignOut}
      />


      {/* Main Body Content */}
      <div className={`flex-1 overflow-y-auto ${currentTab === 'home' ? 'pb-20 sm:pb-16 md:pb-8' : 'pb-20 sm:pb-16 md:pb-6'}`}>
        {/* View 1: Home Page (Includes Marketing, Featured Sections & Footer) */}
        {currentTab === 'home' && (
          <ErrorBoundary
            fallbackTitle="Home Page Error"
            fallbackMessage="An error occurred while displaying the home page."
            onReset={() => setCurrentTab('home')}
          >
            <div className="flex flex-col min-h-full">
              <div className="flex-1">
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
                  onOpenSellModal={handleOpenSellModal}
                  onInspectListing={(item) => setInspectListing(item)}
                  onBuyListing={(item) => setBuyListing(item)}
                />
              </div>
              {/* Global Promotional, SEO & Support Footer strictly on Home Tab */}
              <Footer />
            </div>
          </ErrorBoundary>
        )}

        {/* View 2: Marketplace Page (Strictly Pure Functional Listing Grid) */}
        {currentTab === 'marketplace' && (
          <ErrorBoundary
            fallbackTitle="Marketplace Error"
            fallbackMessage="An error occurred while loading marketplace listings."
            onReset={() => {
              setSelectedGame('all');
              setCurrentTab('marketplace');
            }}
          >
            <main className="space-y-4 sm:space-y-6">
              {/* Sticky Game Category Selection */}
              <GameCategoryTabs
                selectedGame={selectedGame}
                onSelectGame={setSelectedGame}
                gameCounts={gameCounts}
              />

              {/* Recommended Pro Merchants Carousel Header Section */}
              <RecommendedMerchantsCarousel
                listings={listings}
                selectedMerchantFilter={selectedMerchantFilter}
                onSelectMerchant={(merchantName) => {
                  setSelectedMerchantFilter(
                    selectedMerchantFilter === merchantName ? null : merchantName
                  );
                }}
                onClearMerchantFilter={() => setSelectedMerchantFilter(null)}
              />

              {/* Marketplace Listings Section */}
              <section
                id="marketplace-listings"
                className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 space-y-4"
              >
                {/* Header Title & Active Status */}
                <div className="flex items-center justify-between pb-1 flex-wrap gap-2">
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

                  {/* Active Selected Merchant filter chip */}
                  {selectedMerchantFilter && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold animate-in fade-in">
                      <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                      <span>{selectedMerchantFilter}</span>
                      <button
                        onClick={() => setSelectedMerchantFilter(null)}
                        className="ml-1 hover:text-rose-500 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {/* Quick reset filters button if filtered */}
                  {(selectedGame !== 'all' ||
                    verifiedOnly ||
                    proMerchantsOnly ||
                    selectedMerchantFilter ||
                    minPrice !== '' ||
                    maxPrice !== '' ||
                    searchQuery) && (
                    <button
                      onClick={() => {
                        setSelectedGame('all');
                        setVerifiedOnly(false);
                        setProMerchantsOnly(false);
                        setSelectedMerchantFilter(null);
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
                      {(verifiedOnly || proMerchantsOnly || minPrice !== '' || maxPrice !== '') && (
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

                      <div className="flex flex-col gap-2 pt-1">
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                            <input
                              type="checkbox"
                              checked={verifiedOnly}
                              onChange={(e) => setVerifiedOnly(e.target.checked)}
                              className="rounded text-cyan-500 focus:ring-cyan-500 bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-slate-700"
                            />
                            <span>{t('mobileFilter.verifiedOnly')}</span>
                          </label>

                          <label className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-bold cursor-pointer">
                            <input
                              type="checkbox"
                              checked={proMerchantsOnly}
                              onChange={(e) => setProMerchantsOnly(e.target.checked)}
                              className="rounded text-amber-500 focus:ring-amber-500 bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-slate-700"
                            />
                            <Crown className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{t('filters.proMerchantsOnly')}</span>
                          </label>
                        </div>

                        {(verifiedOnly || proMerchantsOnly || minPrice !== '' || maxPrice !== '' || searchQuery) && (
                          <button
                            onClick={() => {
                              setVerifiedOnly(false);
                              setProMerchantsOnly(false);
                              setSelectedMerchantFilter(null);
                              setMinPrice('');
                              setMaxPrice('');
                              setSearchQuery('');
                            }}
                            className="text-[11px] text-rose-500 dark:text-rose-400 font-medium flex items-center gap-1 self-end"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
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
                        {(selectedGame !== 'all' ||
                          verifiedOnly ||
                          proMerchantsOnly ||
                          selectedMerchantFilter ||
                          minPrice !== '' ||
                          maxPrice !== '' ||
                          searchQuery) && (
                          <button
                            onClick={() => {
                              setSelectedGame('all');
                              setVerifiedOnly(false);
                              setProMerchantsOnly(false);
                              setSelectedMerchantFilter(null);
                              setMinPrice('');
                              setMaxPrice('');
                              setSearchQuery('');
                            }}
                            className="text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
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

                      {/* Verified & Pro Merchant Toggles */}
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
                        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:text-slate-900 dark:hover:text-white transition">
                          <input
                            type="checkbox"
                            checked={verifiedOnly}
                            onChange={(e) => setVerifiedOnly(e.target.checked)}
                            className="rounded text-cyan-500 focus:ring-cyan-500 bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-slate-700"
                          />
                          <span>{t('filters.verifiedSellersOnly')}</span>
                        </label>

                        <label className="flex items-center gap-2 text-xs font-black text-amber-700 dark:text-amber-400 cursor-pointer hover:text-amber-600 transition">
                          <input
                            type="checkbox"
                            checked={proMerchantsOnly}
                            onChange={(e) => setProMerchantsOnly(e.target.checked)}
                            className="rounded text-amber-500 focus:ring-amber-500 bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-slate-700"
                          />
                          <Crown className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                          <span>{t('filters.proMerchantsOnly')}</span>
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
          </ErrorBoundary>
        )}

        {/* View 2: Escrow Room / My Orders */}
        {currentTab === 'orders' && (
          <ErrorBoundary
            fallbackTitle="Escrow Tracker Error"
            fallbackMessage="An error occurred in the Escrow order room."
            onReset={() => {
              setSelectedOrderId(null);
              setCurrentTab('home');
            }}
          >
            <EscrowOrderTracker
              orders={orders}
              selectedOrderId={selectedOrderId}
              setSelectedOrderId={setSelectedOrderId}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onOpenDispute={handleOpenDispute}
              onSendMessage={handleSendMessage}
              currentRole={userRole}
            />
          </ErrorBoundary>
        )}

        {/* View 3: Seller Dashboard */}
        {currentTab === 'seller' && (
          <ErrorBoundary
            fallbackTitle="Seller Studio Error"
            fallbackMessage="An error occurred inside Seller Studio."
            onReset={() => {
              setSellerTab('overview');
              setCurrentTab('seller');
            }}
          >
            <SellerDashboard
              listings={listings}
              orders={orders}
              payouts={payouts}
              onOpenSellModal={handleOpenSellModal}
              onRequestPayout={handleRequestSellerPayout}
              onUpdateListing={handleUpdateListing}
              onDeleteListing={handleDeleteListing}
              onDeliverCredentials={handleDeliverCredentials}
              onSendMessage={handleSendMessage}
              onOpenDispute={handleOpenDispute}
              kycStatus={kycStatus}
              onOpenKycModal={() => setIsKycModalOpen(true)}
              userRole={userRole}
              activeSellerTab={sellerTab}
              setActiveSellerTab={setSellerTab}
              onSwitchToBuyerMode={() => setCurrentTab('home')}
              onSelectOrder={(orderId) => {
                setSelectedOrderId(orderId);
                setCurrentTab('orders');
              }}
              merchantSubscription={merchantSubscription}
              onSubscribeMerchant={handleSubscribeMerchant}
              onBumpListing={handleBumpListing}
            />
          </ErrorBoundary>
        )}

        {/* View 4: Admin Desk */}
        {currentTab === 'admin' && (
          <ErrorBoundary
            fallbackTitle="Admin Portal Error"
            fallbackMessage="An error occurred in Admin Dashboard."
            onReset={() => setCurrentTab('home')}
          >
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
          </ErrorBoundary>
        )}

        {/* View 5: Prisma PostgreSQL Schema Viewer */}
        {currentTab === 'schema' && (
          <ErrorBoundary
            fallbackTitle="Schema Viewer Error"
            fallbackMessage="An error occurred while loading Prisma schema."
            onReset={() => setCurrentTab('home')}
          >
            <PrismaSchemaViewer />
          </ErrorBoundary>
        )}

        {/* View 6: User Profile & Settings Dashboard */}
        {currentTab === 'profile' && (
          <ErrorBoundary
            fallbackTitle="User Profile Error"
            fallbackMessage="An error occurred while loading User Profile."
            onReset={() => setCurrentTab('home')}
          >
            <UserProfileView
              onOpenSettings={(tab) => setIsSettingsOpen(true)}
              onOpenKycModal={() => setIsKycModalOpen(true)}
              kycStatus={kycStatus}
              userRole={userRole}
              onNavigateToSellerStudio={() => setCurrentTab('seller')}
              merchantSubscription={merchantSubscription}
              authUser={authUser}
              onOpenAuthModal={handleOpenAuthModal}
              onLogout={handleSignOut}
            />

          </ErrorBoundary>
        )}
      </div>

      {/* Mobile Bottom Navigation Bar (5 Primary Touch Destinations) */}
      <MobileBottomNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        openSellModal={handleOpenSellModal}
        activeOrdersCount={orders.filter((o) => o.status !== 'COMPLETED').length}
        kycStatus={kycStatus}
        userRole={userRole}
        onOpenKycModal={() => setIsKycModalOpen(true)}
        sellerTab={sellerTab}
        onSellerTabChange={setSellerTab}
        onSwitchToBuyerMode={() => setCurrentTab('home')}
        pendingSalesCount={orders.filter((o) => ['PAYMENT_VERIFYING', 'ESCROW_LOCKED', 'CREDENTIALS_DISPATCHED', 'CREDENTIALS_DELIVERED', 'INSPECTION_PERIOD', 'DISPUTED'].includes(o.status)).length}
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
        proMerchantsOnly={proMerchantsOnly}
        setProMerchantsOnly={setProMerchantsOnly}
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
        onSubmitKyc={handleKycSubmit}
      />

      {/* KYC Gate Alert Modals for Listing Accounts */}
      <KycRequiredModal
        isOpen={isKycRequiredModalOpen}
        onClose={() => setIsKycRequiredModalOpen(false)}
        onApplyNow={() => {
          setIsKycRequiredModalOpen(false);
          setIsKycModalOpen(true);
        }}
      />

      <KycPendingModal
        isOpen={isKycPendingModalOpen}
        onClose={() => setIsKycPendingModalOpen(false)}
      />

      {/* Supabase Authentication Modal (Sign In / Sign Up) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}


export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <MainApp />
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  AccountListing,
  EscrowOrder,
  EscrowStatus,
  KycStatus,
  PaymentMethodCode,
  SellerPayoutRequest,
  UserRole,
  ChatMessage,
} from '../types';
import {
  Wallet,
  TrendingUp,
  Package,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Sparkles,
  Edit3,
  Trash2,
  Check,
  X,
  Coins,
  ShieldCheck,
  DollarSign,
  AlertTriangle,
  Building,
  CreditCard,
  LayoutDashboard,
  ReceiptText,
  ShoppingBag,
  ArrowLeftRight,
  Search,
  Filter,
  ShieldAlert,
  MessageSquare,
  Key,
  ExternalLink,
  ChevronRight,
  CheckCircle,
  Eye,
  AlertOctagon,
  Copy,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { EditListingModal } from './EditListingModal';
import { SellerEscrowRoom } from './SellerEscrowRoom';

export type SellerTabType = 'overview' | 'listings' | 'sell' | 'sales' | 'wallet';

interface SellerDashboardProps {
  listings: AccountListing[];
  orders: EscrowOrder[];
  payouts: SellerPayoutRequest[];
  onOpenSellModal: () => void;
  onRequestPayout: (payout: SellerPayoutRequest) => void;
  onUpdateListing?: (listingId: string, updatedFields: Partial<AccountListing>) => void;
  onDeleteListing?: (listingId: string) => void;
  onDeliverCredentials?: (
    orderId: string,
    credentials: NonNullable<EscrowOrder['credentials']>
  ) => void;
  onSendMessage?: (
    orderId: string,
    message: Omit<ChatMessage, 'id' | 'createdAt' | 'orderId'>
  ) => void;
  onOpenDispute?: (
    orderId: string,
    reason: string,
    description: string,
    proofUrls?: string[]
  ) => void;
  kycStatus?: KycStatus;
  onOpenKycModal?: () => void;
  userRole?: UserRole;
  activeSellerTab?: SellerTabType;
  setActiveSellerTab?: (tab: SellerTabType) => void;
  onSwitchToBuyerMode?: () => void;
  onSelectOrder?: (orderId: string) => void;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({
  listings = [],
  orders = [],
  payouts = [],
  onOpenSellModal,
  onRequestPayout,
  onUpdateListing,
  onDeleteListing,
  onDeliverCredentials,
  onSendMessage,
  onOpenDispute,
  kycStatus = 'VERIFIED',
  onOpenKycModal,
  userRole = 'SELLER',
  activeSellerTab: controlledTab,
  setActiveSellerTab: setControlledTab,
  onSwitchToBuyerMode,
  onSelectOrder,
}) => {
  const {
    t,
    currency,
    formatMMK,
    formatTHB,
    formatPrice,
    exchangeRate,
    convertMMKtoTHB,
    isMM,
  } = useLanguage();

  // Internal tab state if not controlled externally
  const [internalTab, setInternalTab] = useState<SellerTabType>('overview');
  const activeTab = controlledTab || internalTab || 'overview';
  const setTab = (tab: SellerTabType) => {
    if (tab === 'sell') {
      if (onOpenSellModal) onOpenSellModal();
      return;
    }
    if (setControlledTab) {
      setControlledTab(tab);
    } else {
      setInternalTab(tab);
    }
  };

  // Dedicated Seller Escrow Room Active Order State (Keeps seller within Seller Studio context)
  const [selectedSellerOrderId, setSelectedSellerOrderId] = useState<string | null>(null);

  // Safe Arrays
  const safeListings = useMemo(() => (Array.isArray(listings) ? listings : []), [listings]);
  const safeOrders = useMemo(() => (Array.isArray(orders) ? orders : []), [orders]);
  const safePayouts = useMemo(() => (Array.isArray(payouts) ? payouts : []), [payouts]);

  // Financial Metrics Calculation
  const totalEarnings = useMemo(() => {
    return safeOrders
      .filter((o) => o?.status === 'COMPLETED')
      .reduce((acc, curr) => acc + (curr?.amountMMK || 0), 1450000);
  }, [safeOrders]);

  const pendingEscrow = useMemo(() => {
    return safeOrders
      .filter((o) =>
        o?.status &&
        [
          'PAYMENT_VERIFYING',
          'ESCROW_LOCKED',
          'CREDENTIALS_DISPATCHED',
          'CREDENTIALS_DELIVERED',
          'INSPECTION_PERIOD',
          'DISPUTED',
        ].includes(o.status)
      )
      .reduce((acc, curr) => acc + (curr?.amountMMK || 0), 380000);
  }, [safeOrders]);

  const paidOutAmount = useMemo(() => {
    return safePayouts
      .filter((p) => p?.status === 'PAID')
      .reduce((acc, curr) => acc + (curr?.amountMMK || 0), 950000);
  }, [safePayouts]);

  const availableBalanceMMK = Math.max(0, totalEarnings - paidOutAmount);

  // Sub-filter tabs state for Listings & Sales
  const [listingFilter, setListingFilter] = useState<'ALL' | 'AVAILABLE' | 'IN_ESCROW' | 'SOLD'>('ALL');
  const [listingSearch, setListingSearch] = useState('');

  const [salesMainTab, setSalesMainTab] = useState<'ongoing' | 'fulfilled'>('ongoing');
  const [salesSubFilter, setSalesSubFilter] = useState<string>('all');

  // Withdrawal Form State
  const [payoutAmount, setPayoutAmount] = useState<number | ''>('');
  const [payoutMethod, setPayoutMethod] = useState<PaymentMethodCode>('KBZ_PAY');
  const [walletPhone, setWalletPhone] = useState('09450012345');
  const [walletHolder, setWalletHolder] = useState('U Kyaw Seller');
  const [payoutSuccess, setPayoutSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  // Comprehensive Edit Modal State
  const [editingListing, setEditingListing] = useState<AccountListing | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Action Required Alerts detection
  const awaitingCredentialsOrders = useMemo(() => {
    return safeOrders.filter((o) => o?.status && ['ESCROW_LOCKED', 'PAYMENT_VERIFYING'].includes(o.status));
  }, [safeOrders]);

  const activeDisputeOrders = useMemo(() => {
    return safeOrders.filter((o) => o?.status === 'DISPUTED');
  }, [safeOrders]);

  const ongoingSalesCount = useMemo(() => {
    return safeOrders.filter((o) =>
      o?.status &&
      [
        'PAYMENT_VERIFYING',
        'ESCROW_LOCKED',
        'CREDENTIALS_DISPATCHED',
        'CREDENTIALS_DELIVERED',
        'INSPECTION_PERIOD',
        'DISPUTED',
      ].includes(o.status)
    ).length;
  }, [safeOrders]);

  // Filtered Listings
  const filteredListings = useMemo(() => {
    return safeListings.filter((item) => {
      if (!item) return false;
      if (listingFilter !== 'ALL' && item.status !== listingFilter) return false;
      if (listingSearch.trim()) {
        const q = listingSearch.toLowerCase();
        return (
          (item.title || '').toLowerCase().includes(q) ||
          (item.gameType || '').toLowerCase().includes(q) ||
          String(item.priceMMK || '').includes(q)
        );
      }
      return true;
    });
  }, [safeListings, listingFilter, listingSearch]);

  // Filtered Sales Orders
  const filteredSalesOrders = useMemo(() => {
    return safeOrders.filter((order) => {
      if (!order) return false;
      const isOngoing = [
        'PENDING_PAYMENT_PROOF',
        'PAYMENT_VERIFYING',
        'ESCROW_LOCKED',
        'CREDENTIALS_DISPATCHED',
        'CREDENTIALS_DELIVERED',
        'INSPECTION_PERIOD',
        'DISPUTED',
      ].includes(order.status);
      const isFulfilled = ['COMPLETED', 'REFUNDED', 'CANCELLED'].includes(order.status);

      if (salesMainTab === 'ongoing' && !isOngoing) return false;
      if (salesMainTab === 'fulfilled' && !isFulfilled) return false;

      if (salesSubFilter !== 'all') {
        if (salesSubFilter === 'creds' && !['ESCROW_LOCKED', 'PAYMENT_VERIFYING'].includes(order.status))
          return false;
        if (
          salesSubFilter === 'inspection' &&
          !['CREDENTIALS_DISPATCHED', 'CREDENTIALS_DELIVERED', 'INSPECTION_PERIOD'].includes(order.status)
        )
          return false;
        if (salesSubFilter === 'dispute' && order.status !== 'DISPUTED') return false;
        if (salesSubFilter === 'completed' && order.status !== 'COMPLETED') return false;
        if (salesSubFilter === 'refunded' && order.status !== 'REFUNDED') return false;
        if (salesSubFilter === 'cancelled' && order.status !== 'CANCELLED') return false;
      }

      return true;
    });
  }, [safeOrders, salesMainTab, salesSubFilter]);

  // Handlers for Edit Modal
  const handleOpenEditModal = (listing: AccountListing) => {
    setEditingListing(listing);
    setIsEditModalOpen(true);
  };

  const handleSaveListing = (listingId: string, updatedFields: Partial<AccountListing>) => {
    if (onUpdateListing) {
      onUpdateListing(listingId, updatedFields);
    }
  };

  // Handler for Opening Dedicated Seller Escrow Room
  const handleOpenSellerEscrowRoom = (orderId: string) => {
    setSelectedSellerOrderId(orderId);
    setTab('sales');
  };

  // Handlers for Payout Form
  const handleMaxAmount = () => {
    setPayoutAmount(availableBalanceMMK);
  };

  const handleRequestPayout = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const amount = Number(payoutAmount);
    if (!amount || amount < 10000) {
      setFormError(isMM ? 'အနည်းဆုံး ငွေထုတ်ပမာဏမှာ ၁၀,၀၀၀ ကျပ် ဖြစ်ပါသည်' : 'Minimum withdrawal amount is 10,000 MMK');
      return;
    }

    if (amount > availableBalanceMMK) {
      setFormError(isMM ? 'ထုတ်ယူနိုင်သော လက်ကျန်ငွေထက် ပိုမိုနေပါသည်' : 'Amount exceeds available balance');
      return;
    }

    if (!walletPhone.trim() || !walletHolder.trim()) {
      setFormError(isMM ? 'ကျေးဇူးပြု၍ အကောင့်အချက်အလက် အပြည့်အစုံ ဖြည့်သွင်းပါ' : 'Please fill in all wallet details');
      return;
    }

    const newPayout: SellerPayoutRequest = {
      id: `payout-${Date.now()}`,
      orderNumber: `PO-${Math.floor(100000 + Math.random() * 900000)}`,
      sellerName: walletHolder,
      amountMMK: amount,
      walletMethod: payoutMethod,
      walletNumber: walletPhone,
      walletAccountName: walletHolder,
      status: 'PENDING',
      requestedAt: new Date().toISOString(),
    };

    onRequestPayout(newPayout);
    setPayoutSuccess(true);
    setPayoutAmount('');

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    setTimeout(() => {
      setPayoutSuccess(false);
    }, 6000);
  };

  // Active Order for Seller Escrow Room
  const activeSelectedOrder = useMemo(() => {
    if (!selectedSellerOrderId) return null;
    return orders.find((o) => o.id === selectedSellerOrderId) || null;
  }, [orders, selectedSellerOrderId]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5 pb-24 md:pb-12">
      {/* ------------------------------------------------------------ */}
      {/* 1. OVERVIEW TAB: Condensed Hero Banner + Tabs                */}
      {/* ------------------------------------------------------------ */}
      {activeTab === 'overview' ? (
        <div className="space-y-4">
          {/* Condensed Overview Hero Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-800 text-white shadow-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-black tracking-wide">
                  <Sparkles className="w-3 h-3" />
                  <span>{t('sellerStudio.sellerBadge')}</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-mono">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>KYC: {kycStatus}</span>
                </span>
              </div>

              <h1 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
                <span>{t('sellerStudio.title')}</span>
              </h1>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                {t('sellerStudio.subtitle')}
              </p>
            </div>

            {/* Action Buttons: Switch to Buyer & + Sell */}
            <div className="flex items-center gap-2 self-start md:self-center flex-wrap">
              {onSwitchToBuyerMode && (
                <button
                  type="button"
                  onClick={onSwitchToBuyerMode}
                  className="px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t('sellerStudio.switchToBuyer')}</span>
                </button>
              )}

              <button
                type="button"
                onClick={onOpenSellModal}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black shadow-md shadow-emerald-500/20 transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{t('sellerStudio.listings.postNew')}</span>
              </button>
            </div>
          </div>

          {/* Desktop Horizontal 4-Tab Navigation Bar */}
          <div className="hidden sm:flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            {[
              { id: 'overview' as const, label: t('sellerStudio.nav.overview'), icon: LayoutDashboard },
              { id: 'listings' as const, label: t('sellerStudio.nav.listings'), icon: Package, badge: listings.length },
              { id: 'sales' as const, label: t('sellerStudio.nav.sales'), icon: ReceiptText, badge: ongoingSalesCount },
              { id: 'wallet' as const, label: t('sellerStudio.nav.wallet'), icon: Wallet },
            ].map((tabItem) => {
              const Icon = tabItem.icon;
              const isActive = activeTab === tabItem.id;
              return (
                <button
                  type="button"
                  key={tabItem.id}
                  onClick={() => setTab(tabItem.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 shadow-md font-black shadow-emerald-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tabItem.label}</span>
                  {tabItem.badge !== undefined && tabItem.badge > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                        isActive ? 'bg-slate-950 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {tabItem.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* ------------------------------------------------------------ */
        /* 2. SECONDARY TABS: Compact Single-Row Navigation & Actions  */
        /* ------------------------------------------------------------ */
        <div className="space-y-2">
          {/* Desktop Compact Top Bar (Tabs + Switcher + Post Button) */}
          <div className="hidden sm:flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-1.5 flex-1">
              {[
                { id: 'overview' as const, label: t('sellerStudio.nav.overview'), icon: LayoutDashboard },
                { id: 'listings' as const, label: t('sellerStudio.nav.listings'), icon: Package, badge: listings.length },
                { id: 'sales' as const, label: t('sellerStudio.nav.sales'), icon: ReceiptText, badge: ongoingSalesCount },
                { id: 'wallet' as const, label: t('sellerStudio.nav.wallet'), icon: Wallet },
              ].map((tabItem) => {
                const Icon = tabItem.icon;
                const isActive = activeTab === tabItem.id;
                return (
                  <button
                    type="button"
                    key={tabItem.id}
                    onClick={() => setTab(tabItem.id)}
                    className={`flex items-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      isActive
                        ? 'bg-emerald-500 text-slate-950 shadow-sm font-black shadow-emerald-500/20'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tabItem.label}</span>
                    {tabItem.badge !== undefined && tabItem.badge > 0 && (
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                          isActive ? 'bg-slate-950 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {tabItem.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Compact Switch to Buyer & Post Listing Buttons */}
            <div className="flex items-center gap-2 pr-1">
              {onSwitchToBuyerMode && (
                <button
                  type="button"
                  onClick={onSwitchToBuyerMode}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                  title={t('sellerStudio.switchToBuyer')}
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{t('sellerStudio.switchToBuyer')}</span>
                </button>
              )}

              <button
                type="button"
                onClick={onOpenSellModal}
                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{t('sellerStudio.listings.postNew')}</span>
              </button>
            </div>
          </div>

          {/* Mobile Sleek Sub-Header for Secondary Tabs */}
          <div className="sm:hidden flex items-center justify-between gap-2 bg-white dark:bg-slate-900 px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-900 dark:text-white">
                {activeTab === 'listings' && t('sellerStudio.nav.listings')}
                {activeTab === 'sales' && t('sellerStudio.nav.sales')}
                {activeTab === 'wallet' && t('sellerStudio.nav.wallet')}
              </span>
              {activeTab === 'listings' && (
                <span className="px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-mono font-bold">
                  {listings.length}
                </span>
              )}
              {activeTab === 'sales' && ongoingSalesCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-500 text-[10px] font-mono font-bold">
                  {ongoingSalesCount}
                </span>
              )}
            </div>

            {onSwitchToBuyerMode && (
              <button
                type="button"
                onClick={onSwitchToBuyerMode}
                className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold flex items-center gap-1 active:scale-95 cursor-pointer"
              >
                <ShoppingBag className="w-3 h-3 text-emerald-500" />
                <span>{t('sellerStudio.switchToBuyer')}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 1: OVERVIEW DASHBOARD                                */}
      {/* ======================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Action Required Priority Alerts */}
          {(awaitingCredentialsOrders.length > 0 || activeDisputeOrders.length > 0) && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>{t('sellerStudio.overview.actionAlerts')}</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Alert 1: Credentials Needed */}
                {awaitingCredentialsOrders.length > 0 && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start justify-between gap-3 animate-in fade-in">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500 shrink-0 mt-0.5">
                        <Key className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white">
                          {t('sellerStudio.overview.alertCredentialsNeeded')} ({awaitingCredentialsOrders.length})
                        </h4>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                          {t('sellerStudio.overview.alertCredentialsDesc')}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenSellerEscrowRoom(awaitingCredentialsOrders[0].id)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow transition shrink-0 cursor-pointer"
                    >
                      {t('sellerStudio.sales.dispatchCreds')}
                    </button>
                  </div>
                )}

                {/* Alert 2: Active Dispute */}
                {activeDisputeOrders.length > 0 && (
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start justify-between gap-3 animate-in fade-in">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-rose-500/20 text-rose-500 shrink-0 mt-0.5">
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white">
                          {t('sellerStudio.overview.alertDispute')} ({activeDisputeOrders.length})
                        </h4>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                          {t('sellerStudio.overview.alertDisputeDesc')}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenSellerEscrowRoom(activeDisputeOrders[0].id)}
                      className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-black shadow transition shrink-0 cursor-pointer"
                    >
                      {t('sellerStudio.sales.checkDispute')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Earnings & Escrow Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {/* Card 1: Available Wallet Balance with direct Withdraw Button */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
                <span className="font-semibold">{t('sellerStudio.overview.availableBalance')}</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <div className="space-y-0.5">
                <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {formatPrice(availableBalanceMMK)}
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {currency === 'THB'
                    ? `≈ ${formatMMK(availableBalanceMMK)}`
                    : `≈ ${formatTHB(convertMMKtoTHB(availableBalanceMMK))}`}
                </div>
              </div>
              <button
                onClick={() => setTab('wallet')}
                className="w-full py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-95"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>{t('sellerStudio.overview.withdrawNow')}</span>
              </button>
            </div>

            {/* Card 2: Pending Escrow Funds */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
                <span className="font-semibold">{t('sellerStudio.overview.pendingEscrow')}</span>
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="space-y-0.5">
                <div className="text-xl sm:text-2xl font-black text-cyan-600 dark:text-cyan-400 font-mono">
                  {formatPrice(pendingEscrow)}
                </div>
                <div className="text-[11px] text-slate-400">
                  {t('sellerStudio.overview.pendingEscrowSub')}
                </div>
              </div>
              <div className="text-[11px] text-cyan-600 dark:text-cyan-400 font-medium flex items-center gap-1 pt-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{t('sellerStudio.overview.escrowProtection')}</span>
              </div>
            </div>

            {/* Card 3: Active Listings */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
                <span className="font-semibold">{t('sellerStudio.overview.activeListings')}</span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div className="space-y-0.5">
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {listings.length} <span className="text-xs font-normal text-slate-400">Accounts</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {listings.filter((l) => l.status === 'AVAILABLE').length} Available for sale
                </div>
              </div>
              <button
                onClick={() => setTab('listings')}
                className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Manage Listings</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Card 4: Total Completed Trades & Trust Score */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
                <span className="font-semibold">{t('sellerStudio.overview.completedTrades')}</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="space-y-0.5">
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
                  14 <span className="text-xs font-normal text-slate-400">Deals</span>
                </div>
                <div className="text-[11px] text-emerald-500 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{t('sellerStudio.overview.trustScore')}</span>
                </div>
              </div>
              <div className="text-[11px] text-slate-400 pt-1">
                Dispute resolution speed &lt; 15 mins
              </div>
            </div>
          </div>

          {/* Quick Shortcuts & Recent Orders Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Cols: Recent Active Orders */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ReceiptText className="w-4 h-4 text-emerald-500" />
                  <span>{t('sellerStudio.overview.recentOrders')}</span>
                </h3>
                <button
                  onClick={() => setTab('sales')}
                  className="text-xs font-bold text-emerald-500 hover:underline flex items-center gap-1"
                >
                  <span>View All Sales</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {orders.slice(0, 3).map((order) => (
                  <div
                    key={order.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={
                          order.listing?.imageUrls?.[0] ||
                          'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80'
                        }
                        alt={order.listing?.title}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                      />
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {order.listing?.gameType}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            #{order.orderNumber}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                          {order.listing?.title}
                        </h4>
                        <div className="text-xs font-mono font-bold text-emerald-500">
                          {formatMMK(order.amountMMK)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          order.status === 'COMPLETED'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                            : order.status === 'DISPUTED'
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 animate-pulse'
                        }`}
                      >
                        {order.status}
                      </span>
                      <button
                        onClick={() => handleOpenSellerEscrowRoom(order.id)}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-white hover:bg-emerald-600 transition cursor-pointer"
                      >
                        Room
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right 5 Cols: Quick Inventory Stats & Pro Seller Perks */}
            <div className="lg:col-span-5 bg-gradient-to-br from-white via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Verified Seller Benefits
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Your account is equipped with Pro Escrow tier perks.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Instant listing publication without queue delay</span>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>15-Minute express withdrawals to KPay & WavePay</span>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Dedicated Dispute Arbiter support channel</span>
                </div>
              </div>

              <button
                onClick={onOpenSellModal}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{t('sellerStudio.listings.postNew')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: LISTINGS MANAGEMENT                               */}
      {/* ======================================================== */}
      {activeTab === 'listings' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {t('sellerStudio.listings.title')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {listings.length} accounts listed on GameZay Escrow Marketplace
              </p>
            </div>

            <button
              onClick={onOpenSellModal}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('sellerStudio.listings.postNew')}</span>
            </button>
          </div>

          {/* Sub-Filter Pills & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
              {(['ALL', 'AVAILABLE', 'IN_ESCROW', 'SOLD'] as const).map((filterKey) => (
                <button
                  key={filterKey}
                  onClick={() => setListingFilter(filterKey)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    listingFilter === filterKey
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {filterKey === 'ALL'
                    ? t('sellerStudio.listings.tabAll')
                    : filterKey === 'AVAILABLE'
                    ? t('sellerStudio.listings.tabOnSale')
                    : filterKey === 'IN_ESCROW'
                    ? t('sellerStudio.listings.tabInEscrow')
                    : t('sellerStudio.listings.tabSoldOut')}
                  <span className="ml-1.5 opacity-70">
                    ({listings.filter((l) => (filterKey === 'ALL' ? true : l.status === filterKey)).length})
                  </span>
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={listingSearch}
                onChange={(e) => setListingSearch(e.target.value)}
                placeholder={t('sellerStudio.listings.searchListings')}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Listings Cards Feed */}
          {filteredListings.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <Package className="w-12 h-12 text-slate-400 mx-auto opacity-50" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('sellerStudio.listings.noListingsFound')}
              </h4>
              <button
                onClick={onOpenSellModal}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold shadow transition"
              >
                {t('sellerStudio.listings.postNew')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredListings.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 transition hover:border-emerald-500/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <img
                        src={
                          item.imageUrls?.[0] ||
                          'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80'
                        }
                        alt={item.title || 'Game Account'}
                        className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            {item.gameType}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              item.status === 'AVAILABLE'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                : item.status === 'IN_ESCROW'
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 animate-pulse'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs font-mono font-bold">
                          <span className="text-emerald-600 dark:text-emerald-400">
                            {formatMMK(item.priceMMK)}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500 font-normal">
                            ≈ {formatTHB(convertMMKtoTHB(item.priceMMK))}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-1.5 shrink-0">
                      {/* Comprehensive Edit Button */}
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 transition text-xs flex items-center gap-1 font-bold cursor-pointer"
                        title={t('sellerStudio.listings.editPrice')}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      {onDeleteListing && (
                        <button
                          onClick={() => {
                            if (window.confirm(t('sellerStudio.listings.confirmDelete'))) {
                              onDeleteListing(item.id);
                            }
                          }}
                          className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 transition text-xs cursor-pointer"
                          title={t('sellerStudio.listings.deleteListing')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: SALES & ESCROW ORDERS                             */}
      {/* ======================================================== */}
      {activeTab === 'sales' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* If an order is selected, show the Dedicated Seller Perspective Escrow Room! */}
          {activeSelectedOrder && onDeliverCredentials && onSendMessage && onOpenDispute ? (
            <SellerEscrowRoom
              order={activeSelectedOrder}
              onBack={() => setSelectedSellerOrderId(null)}
              onDeliverCredentials={onDeliverCredentials}
              onSendMessage={onSendMessage}
              onOpenDispute={onOpenDispute}
              onGoToWallet={() => {
                setSelectedSellerOrderId(null);
                setTab('wallet');
              }}
            />
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    {t('sellerStudio.sales.title')}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Track buyer payment verifications, dispatch login credentials, and handle inspection periods.
                  </p>
                </div>
              </div>

              {/* Dual Main Nav: Ongoing vs Fulfilled */}
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                <button
                  onClick={() => {
                    setSalesMainTab('ongoing');
                    setSalesSubFilter('all');
                  }}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                    salesMainTab === 'ongoing'
                      ? 'bg-emerald-500 text-slate-950 shadow font-black'
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span>{t('sellerStudio.sales.tabOngoing')}</span>
                  <span className="px-2 py-0.2 rounded-full bg-slate-950/20 text-xs">
                    {
                      orders.filter((o) =>
                        [
                          'PENDING_PAYMENT_PROOF',
                          'PAYMENT_VERIFYING',
                          'ESCROW_LOCKED',
                          'CREDENTIALS_DISPATCHED',
                          'CREDENTIALS_DELIVERED',
                          'INSPECTION_PERIOD',
                          'DISPUTED',
                        ].includes(o.status)
                      ).length
                    }
                  </span>
                </button>

                <button
                  onClick={() => {
                    setSalesMainTab('fulfilled');
                    setSalesSubFilter('all');
                  }}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                    salesMainTab === 'fulfilled'
                      ? 'bg-emerald-500 text-slate-950 shadow font-black'
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span>{t('sellerStudio.sales.tabFulfilled')}</span>
                  <span className="px-2 py-0.2 rounded-full bg-slate-950/20 text-xs">
                    {
                      orders.filter((o) =>
                        ['COMPLETED', 'REFUNDED', 'CANCELLED'].includes(o.status)
                      ).length
                    }
                  </span>
                </button>
              </div>

              {/* Sub-Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {salesMainTab === 'ongoing' ? (
                  <>
                    <button
                      onClick={() => setSalesSubFilter('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap ${
                        salesSubFilter === 'all'
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {t('sellerStudio.sales.subAll')}
                    </button>
                    <button
                      onClick={() => setSalesSubFilter('creds')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap ${
                        salesSubFilter === 'creds'
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {t('sellerStudio.sales.subAwaitingCreds')} ({awaitingCredentialsOrders.length})
                    </button>
                    <button
                      onClick={() => setSalesSubFilter('inspection')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap ${
                        salesSubFilter === 'inspection'
                          ? 'bg-cyan-500 text-slate-950'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {t('sellerStudio.sales.subInspection')}
                    </button>
                    <button
                      onClick={() => setSalesSubFilter('dispute')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap ${
                        salesSubFilter === 'dispute'
                          ? 'bg-rose-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {t('sellerStudio.sales.subDisputes')} ({activeDisputeOrders.length})
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setSalesSubFilter('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap ${
                        salesSubFilter === 'all'
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {t('sellerStudio.sales.subAll')}
                    </button>
                    <button
                      onClick={() => setSalesSubFilter('completed')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap ${
                        salesSubFilter === 'completed'
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {t('sellerStudio.sales.subCompleted')}
                    </button>
                    <button
                      onClick={() => setSalesSubFilter('refunded')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap ${
                        salesSubFilter === 'refunded'
                          ? 'bg-cyan-500 text-slate-950'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {t('sellerStudio.sales.subRefunded')}
                    </button>
                    <button
                      onClick={() => setSalesSubFilter('cancelled')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap ${
                        salesSubFilter === 'cancelled'
                          ? 'bg-slate-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {t('sellerStudio.sales.subCancelled')}
                    </button>
                  </>
                )}
              </div>

              {/* Sales Order Feed */}
              {filteredSalesOrders.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <ReceiptText className="w-12 h-12 text-slate-400 mx-auto opacity-50" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t('sellerStudio.sales.noSalesFound')}
                  </h4>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredSalesOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              order.listing?.imageUrls?.[0] ||
                              'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80'
                            }
                            alt={order.listing?.title}
                            className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black uppercase px-2 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                {order.listing?.gameType}
                              </span>
                              <span className="text-xs font-mono font-bold text-slate-400">
                                #{order.orderNumber}
                              </span>
                            </div>
                            <h4 className="text-sm font-black text-slate-900 dark:text-white">
                              {order.listing?.title}
                            </h4>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-base font-black text-emerald-500 font-mono">
                              {formatMMK(order.amountMMK)}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {t('sellerStudio.sales.buyer')}:{' '}
                              <strong className="text-slate-700 dark:text-slate-300">
                                {order.buyerName}
                              </strong>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Status & Action Bar */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-bold px-3 py-1 rounded-full ${
                              order.status === 'COMPLETED'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                : order.status === 'DISPUTED'
                                ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                                : order.status === 'REFUNDED'
                                ? 'bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400'
                                : 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse'
                            }`}
                          >
                            {order.status}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            {order.paymentMethod}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => handleOpenSellerEscrowRoom(order.id)}
                            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Key className="w-3.5 h-3.5" />
                            <span>{t('sellerStudio.sales.viewOrder')}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: WALLET & WITHDRAWALS                              */}
      {/* ======================================================== */}
      {activeTab === 'wallet' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {t('sellerStudio.wallet.title')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Disburse your completed game account sales to Myanmar mobile wallets or Thai bank accounts.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Cols: Withdrawal Request Form */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {t('sellerStudio.wallet.requestWithdrawal')}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      KBZPay, WaveMoney, PromptPay, KBank, AYA Pay & USDT
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold text-emerald-500">
                  {formatMMK(availableBalanceMMK)}
                </span>
              </div>

              {payoutSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-300 flex items-center gap-3 text-xs animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div>
                    <strong>{t('sellerStudio.wallet.payoutSuccess')}</strong>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                      {t('sellerStudio.wallet.payoutSuccessDesc')}
                    </p>
                  </div>
                </div>
              )}

              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleRequestPayout} className="space-y-4 text-xs">
                {/* Withdrawal Amount with MAX Button */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-slate-800 dark:text-slate-200">
                      {t('sellerStudio.wallet.amount')}
                    </label>
                    <button
                      type="button"
                      onClick={handleMaxAmount}
                      className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                    >
                      <span>
                        {t('sellerStudio.wallet.max')}: {formatMMK(availableBalanceMMK)}
                      </span>
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      value={payoutAmount}
                      onChange={(e) =>
                        setPayoutAmount(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      placeholder="e.g. 380000"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                      required
                    />
                    {payoutAmount && Number(payoutAmount) > 0 && (
                      <span className="absolute right-3 top-2.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                        ≈ {formatTHB(convertMMKtoTHB(Number(payoutAmount)))} THB
                      </span>
                    )}
                  </div>
                </div>

                {/* Payout Channel Selector */}
                <div>
                  <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1.5">
                    {t('sellerStudio.wallet.payoutChannel')}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { code: 'KBZ_PAY' as const, name: 'KBZPay', color: 'bg-blue-600' },
                      { code: 'WAVE_PAY' as const, name: 'WaveMoney', color: 'bg-amber-400' },
                      { code: 'PROMPTPAY' as const, name: 'PromptPay (TH)', color: 'bg-indigo-600' },
                      { code: 'KBANK' as const, name: 'KBank (Thai)', color: 'bg-emerald-600' },
                      { code: 'AYA_PAY' as const, name: 'AYA Pay', color: 'bg-red-600' },
                      { code: 'USDT_TRC20' as const, name: 'USDT (TRC20)', color: 'bg-teal-500' },
                    ].map((channel) => (
                      <button
                        key={channel.code}
                        type="button"
                        onClick={() => setPayoutMethod(channel.code)}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition cursor-pointer ${
                          payoutMethod === channel.code
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className={`w-2.5 h-2.5 rounded-full ${channel.color}`} />
                        <span className="truncate text-xs">{channel.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Phone / Account Number */}
                <div>
                  <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1.5">
                    {t('sellerStudio.wallet.accountNumber')}
                  </label>
                  <input
                    type="text"
                    value={walletPhone}
                    onChange={(e) => setWalletPhone(e.target.value)}
                    placeholder="09..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                {/* Account Holder Name */}
                <div>
                  <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1.5">
                    {t('sellerStudio.wallet.accountName')}
                  </label>
                  <input
                    type="text"
                    value={walletHolder}
                    onChange={(e) => setWalletHolder(e.target.value)}
                    placeholder="e.g. U Kyaw"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>{t('sellerStudio.wallet.confirmWithdrawal')}</span>
                </button>
              </form>
            </div>

            {/* Right 5 Cols: Financial Breakdown & Payout Log */}
            <div className="lg:col-span-5 space-y-6">
              {/* Financial Breakdown Card */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Financial Balance Breakdown
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400">
                      {t('sellerStudio.wallet.availableToWithdraw')}
                    </span>
                    <span className="font-mono font-black text-emerald-500">
                      {formatMMK(availableBalanceMMK)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400">
                      {t('sellerStudio.wallet.pendingPayouts')}
                    </span>
                    <span className="font-mono font-bold text-cyan-500">
                      {formatMMK(pendingEscrow)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400">
                      {t('sellerStudio.wallet.totalPaidOut')}
                    </span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                      {formatMMK(paidOutAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payout History Log */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>{t('sellerStudio.wallet.payoutHistory')}</span>
                  <span className="font-mono">{payouts.length} total</span>
                </h3>

                {payouts.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">
                    {t('sellerStudio.wallet.noPayouts')}
                  </p>
                ) : (
                  <div className="space-y-2.5 max-h-60 overflow-y-auto no-scrollbar">
                    {payouts.map((p) => (
                      <div
                        key={p.id}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="font-mono font-bold text-slate-900 dark:text-white">
                            {formatMMK(p.amountMMK)}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {p.walletMethod} • {p.walletNumber}
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            p.status === 'PAID'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                              : p.status === 'REJECTED'
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 animate-pulse'
                          }`}
                        >
                          {p.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Edit Listing Modal */}
      <EditListingModal
        isOpen={isEditModalOpen}
        listing={editingListing}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingListing(null);
        }}
        onSave={handleSaveListing}
      />
    </div>
  );
};

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

export type SellerTabType = 'overview' | 'listings' | 'sell' | 'sales' | 'wallet';

interface SellerDashboardProps {
  listings: AccountListing[];
  orders: EscrowOrder[];
  payouts: SellerPayoutRequest[];
  onOpenSellModal: () => void;
  onRequestPayout: (payout: SellerPayoutRequest) => void;
  onUpdateListing?: (listingId: string, updatedFields: Partial<AccountListing>) => void;
  onDeleteListing?: (listingId: string) => void;
  kycStatus?: KycStatus;
  onOpenKycModal?: () => void;
  userRole?: UserRole;
  activeSellerTab?: SellerTabType;
  setActiveSellerTab?: (tab: SellerTabType) => void;
  onSwitchToBuyerMode?: () => void;
  onSelectOrder?: (orderId: string) => void;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({
  listings,
  orders,
  payouts,
  onOpenSellModal,
  onRequestPayout,
  onUpdateListing,
  onDeleteListing,
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
  const activeTab = controlledTab || internalTab;
  const setTab = (tab: SellerTabType) => {
    if (tab === 'sell') {
      onOpenSellModal();
      return;
    }
    if (setControlledTab) {
      setControlledTab(tab);
    } else {
      setInternalTab(tab);
    }
  };

  // Financial Metrics Calculation
  const totalEarnings = orders
    .filter((o) => o.status === 'COMPLETED')
    .reduce((acc, curr) => acc + curr.amountMMK, 1450000);

  const pendingEscrow = orders
    .filter((o) => ['PAYMENT_VERIFYING', 'ESCROW_LOCKED', 'CREDENTIALS_DISPATCHED', 'CREDENTIALS_DELIVERED', 'INSPECTION_PERIOD', 'DISPUTED'].includes(o.status))
    .reduce((acc, curr) => acc + curr.amountMMK, 380000);

  const paidOutAmount = payouts
    .filter((p) => p.status === 'PAID')
    .reduce((acc, curr) => acc + curr.amountMMK, 0);

  const availableBalanceMMK = Math.max(0, totalEarnings - paidOutAmount);

  // Filter & Search states for Listings tab
  const [listingFilter, setListingFilter] = useState<'ALL' | 'AVAILABLE' | 'IN_ESCROW' | 'SOLD'>('ALL');
  const [listingSearch, setListingSearch] = useState('');

  // Filter states for Sales tab
  const [salesMainTab, setSalesMainTab] = useState<'ongoing' | 'fulfilled'>('ongoing');
  const [salesSubFilter, setSalesSubFilter] = useState<string>('all');

  // Withdrawal form state
  const [payoutAmount, setPayoutAmount] = useState<number | ''>(availableBalanceMMK > 0 ? availableBalanceMMK : 380000);
  const [payoutMethod, setPayoutMethod] = useState<PaymentMethodCode>('KBZ_PAY');
  const [walletPhone, setWalletPhone] = useState('09791122334');
  const [walletName, setWalletName] = useState('Ko Thura Kyaw');
  const [payoutSuccess, setPayoutSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  // Active listings inline edit state
  const [editingListingId, setEditingListingId] = useState<string | null>(null);
  const [editPriceMMK, setEditPriceMMK] = useState<number>(0);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editStatus, setEditStatus] = useState<AccountListing['status']>('AVAILABLE');

  // Action Required Alerts detection
  const awaitingCredentialsOrders = useMemo(() => {
    return orders.filter((o) => ['ESCROW_LOCKED', 'PAYMENT_VERIFYING'].includes(o.status));
  }, [orders]);

  const activeDisputeOrders = useMemo(() => {
    return orders.filter((o) => o.status === 'DISPUTED');
  }, [orders]);

  const ongoingSalesCount = useMemo(() => {
    return orders.filter((o) => ['PAYMENT_VERIFYING', 'ESCROW_LOCKED', 'CREDENTIALS_DISPATCHED', 'CREDENTIALS_DELIVERED', 'INSPECTION_PERIOD', 'DISPUTED'].includes(o.status)).length;
  }, [orders]);

  // Filtered Listings
  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      if (listingFilter !== 'ALL' && item.status !== listingFilter) return false;
      if (listingSearch.trim()) {
        const q = listingSearch.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.gameType.toLowerCase().includes(q) ||
          String(item.priceMMK).includes(q)
        );
      }
      return true;
    });
  }, [listings, listingFilter, listingSearch]);

  // Filtered Sales Orders
  const filteredSalesOrders = useMemo(() => {
    return orders.filter((order) => {
      const isOngoing = ['PENDING_PAYMENT_PROOF', 'PAYMENT_VERIFYING', 'ESCROW_LOCKED', 'CREDENTIALS_DISPATCHED', 'CREDENTIALS_DELIVERED', 'INSPECTION_PERIOD', 'DISPUTED'].includes(order.status);
      const isFulfilled = ['COMPLETED', 'REFUNDED', 'CANCELLED'].includes(order.status);

      if (salesMainTab === 'ongoing' && !isOngoing) return false;
      if (salesMainTab === 'fulfilled' && !isFulfilled) return false;

      if (salesSubFilter !== 'all') {
        if (salesSubFilter === 'creds' && !['ESCROW_LOCKED', 'PAYMENT_VERIFYING'].includes(order.status)) return false;
        if (salesSubFilter === 'inspection' && !['CREDENTIALS_DISPATCHED', 'CREDENTIALS_DELIVERED', 'INSPECTION_PERIOD'].includes(order.status)) return false;
        if (salesSubFilter === 'dispute' && order.status !== 'DISPUTED') return false;
        if (salesSubFilter === 'completed' && order.status !== 'COMPLETED') return false;
        if (salesSubFilter === 'refunded' && order.status !== 'REFUNDED') return false;
        if (salesSubFilter === 'cancelled' && order.status !== 'CANCELLED') return false;
      }

      return true;
    });
  }, [orders, salesMainTab, salesSubFilter]);

  const handleStartEdit = (listing: AccountListing) => {
    setEditingListingId(listing.id);
    setEditPriceMMK(listing.priceMMK);
    setEditTitle(listing.title);
    setEditStatus(listing.status);
  };

  const handleSaveListingEdit = (listingId: string) => {
    if (onUpdateListing) {
      onUpdateListing(listingId, {
        priceMMK: editPriceMMK,
        title: editTitle,
        status: editStatus,
      });
    }
    setEditingListingId(null);
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.6 },
    });
  };

  const handleMaxAmount = () => {
    setPayoutAmount(availableBalanceMMK);
  };

  const handleRequestPayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutAmount || Number(payoutAmount) <= 0) {
      setFormError(isMM ? 'ကျေးဇူးပြု၍ ထုတ်ယူမည့် ပမာဏကို ရိုက်ထည့်ပါ' : 'Please enter a valid payout amount.');
      return;
    }
    if (Number(payoutAmount) > availableBalanceMMK && availableBalanceMMK > 0) {
      setFormError(
        isMM
          ? 'ထုတ်ယူလိုသော ပမာဏသည် လက်ကျန်ငွေထက် ကျော်လွန်နေပါသည်'
          : 'Amount exceeds available balance.'
      );
      return;
    }
    if (!walletPhone.trim() || !walletName.trim()) {
      setFormError(
        isMM
          ? 'ကျေးဇူးပြု၍ အကောင့်အချက်အလက်များကို အပြည့်အစုံ ဖြည့်သွင်းပါ'
          : 'Please enter wallet / bank details.'
      );
      return;
    }

    setFormError('');
    const newPayout: SellerPayoutRequest = {
      id: `payout-${Date.now()}`,
      orderNumber: `GZ-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      sellerName: walletName,
      amountMMK: Number(payoutAmount),
      walletMethod: payoutMethod,
      walletNumber: walletPhone,
      walletAccountName: walletName,
      status: 'PENDING',
      requestedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    onRequestPayout(newPayout);
    setPayoutSuccess(true);
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
    });
    setTimeout(() => setPayoutSuccess(false), 4000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-6">
      {/* KYC Warning if unverified */}
      {kycStatus !== 'VERIFIED' && userRole !== 'ADMIN' && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md animate-in fade-in">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <h4 className="text-xs sm:text-sm font-bold">
                {kycStatus === 'PENDING'
                  ? isMM
                    ? 'KYC စိစစ်ဆဲ ဖြစ်ပါသည်'
                    : 'KYC Verification In Review'
                  : isMM
                  ? 'ရောင်းသူ စတူဒီယို အပြည့်အဝ အသုံးပြုရန် KYC လိုအပ်ပါသည်'
                  : 'Complete KYC to unlock full payout withdrawals'}
              </h4>
              <p className="text-[11px] text-amber-700 dark:text-amber-400">
                {kycStatus === 'PENDING'
                  ? isMM
                    ? 'အက်ဒမင်မှ စိစစ်ပြီးပါက ငွေထုတ်ယူမှုများ စတင်နိုင်ပါမည်'
                    : 'Admin review takes 2-4 hours. You will receive notification.'
                  : isMM
                  ? 'မှတ်ပုံတင်အတည်ပြုပြီး ရောင်းချငွေများကို လုံခြုံစွာထုတ်ယူပါ'
                  : 'Upload your ID to activate withdrawal channels.'}
              </p>
            </div>
          </div>

          {kycStatus === 'UNSUBMITTED' && onOpenKycModal && (
            <button
              onClick={onOpenKycModal}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition cursor-pointer self-start sm:self-auto"
            >
              {isMM ? 'KYC စိစစ်မည်' : 'Verify KYC'}
            </button>
          )}
        </div>
      )}

      {/* Global Seller Studio Header & Mode Switcher */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950 border border-emerald-500/20 rounded-3xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('sellerStudio.title')}</span>
              </span>
              <span className="text-xs text-slate-300 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('sellerStudio.sellerBadge')}</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {isMM ? 'ရောင်းသူ စီမံခန့်ခွဲမှု စတူဒီယို' : 'Seller Creator Studio'}
            </h1>
            <p className="text-xs text-slate-300 max-w-xl">
              {t('sellerStudio.subtitle')}
            </p>
          </div>

          {/* Mode Switcher Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            {onSwitchToBuyerMode && (
              <button
                onClick={onSwitchToBuyerMode}
                className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-md border border-white/20 transition active:scale-95 flex items-center gap-2 cursor-pointer shadow-sm group"
                title="Switch back to Buyer marketplace"
              >
                <ShoppingBag className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span>{t('sellerStudio.switchToBuyer')}</span>
                <ArrowLeftRight className="w-3.5 h-3.5 opacity-60" />
              </button>
            )}

            <button
              onClick={onOpenSellModal}
              className="px-4.5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:brightness-110 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 transition active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('sellerStudio.nav.sell')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Sub-Navigation Tab Bar (Synced with 5 Seller Tabs) */}
      <div className="hidden md:flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>{t('sellerStudio.nav.overview')}</span>
        </button>

        <button
          onClick={() => setTab('listings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'listings'
              ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>{t('sellerStudio.nav.listings')}</span>
          <span className="px-2 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[10px]">
            {listings.length}
          </span>
        </button>

        <button
          onClick={() => setTab('sales')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'sales'
              ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <ReceiptText className="w-4 h-4" />
          <span>{t('sellerStudio.nav.sales')}</span>
          {ongoingSalesCount > 0 && (
            <span className="px-2 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black animate-pulse">
              {ongoingSalesCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setTab('wallet')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'wallet'
              ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>{t('sellerStudio.nav.wallet')}</span>
          <span className="text-[11px] font-mono text-emerald-500 font-extrabold">
            {formatMMK(availableBalanceMMK)}
          </span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: OVERVIEW DASHBOARD                                */}
      {/* ======================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Action Required Alerts Panel */}
          {(awaitingCredentialsOrders.length > 0 || activeDisputeOrders.length > 0) && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span>{t('sellerStudio.overview.actionAlerts')}</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* 1. Awaiting Credentials Alert */}
                {awaitingCredentialsOrders.length > 0 && (
                  <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-slate-900 dark:text-slate-100 flex items-start justify-between gap-3 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-500 shrink-0">
                        <Key className="w-5 h-5 animate-pulse" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400">
                          {t('sellerStudio.overview.alertCredentialsNeeded')} ({awaitingCredentialsOrders.length})
                        </h4>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                          {t('sellerStudio.overview.alertCredentialsDesc')}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setTab('sales')}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow transition shrink-0 cursor-pointer"
                    >
                      {t('sellerStudio.sales.dispatchCreds')}
                    </button>
                  </div>
                )}

                {/* 2. Active Dispute Alert */}
                {activeDisputeOrders.length > 0 && (
                  <div className="p-4 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-slate-900 dark:text-slate-100 flex items-start justify-between gap-3 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-500 shrink-0">
                        <ShieldAlert className="w-5 h-5 animate-bounce" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400">
                          {t('sellerStudio.overview.alertDispute')} ({activeDisputeOrders.length})
                        </h4>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                          {t('sellerStudio.overview.alertDisputeDesc')}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setTab('sales')}
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
                        src={order.listing?.imageUrls?.[0] || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80'}
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
                      {onSelectOrder && (
                        <button
                          onClick={() => onSelectOrder(order.id)}
                          className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-white hover:bg-emerald-600 transition"
                        >
                          Room
                        </button>
                      )}
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
                  {editingListingId === item.id ? (
                    /* Inline Editing Mode */
                    <div className="space-y-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-emerald-500/30">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          {isMM ? 'ခေါင်းစဉ် ပြင်ဆင်ရန်' : 'Listing Title'}
                        </label>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            {isMM ? 'စျေးနှုန်း (MMK)' : 'Price (MMK)'}
                          </label>
                          <input
                            type="number"
                            value={editPriceMMK}
                            onChange={(e) => setEditPriceMMK(Number(e.target.value))}
                            className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            {isMM ? 'အခြေအနေ' : 'Status'}
                          </label>
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value as any)}
                            className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                          >
                            <option value="AVAILABLE">AVAILABLE (ရောင်းရန်)</option>
                            <option value="IN_ESCROW">IN_ESCROW (လော့ခ်ကျ)</option>
                            <option value="SOLD">SOLD (ရောင်းပြီး)</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingListingId(null)}
                          className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveListingEdit(item.id)}
                          className="px-4 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1 shadow"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{t('sellerStudio.listings.saveChanges')}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Display Card Mode */
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <img
                          src={item.imageUrls[0]}
                          alt={item.title}
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
                        <button
                          onClick={() => handleStartEdit(item)}
                          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition text-xs flex items-center gap-1 font-medium cursor-pointer"
                          title={t('sellerStudio.listings.editPrice')}
                        >
                          <Edit3 className="w-3.5 h-3.5 text-emerald-500" />
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
                  )}
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
                {orders.filter((o) => ['PENDING_PAYMENT_PROOF', 'PAYMENT_VERIFYING', 'ESCROW_LOCKED', 'CREDENTIALS_DISPATCHED', 'CREDENTIALS_DELIVERED', 'INSPECTION_PERIOD', 'DISPUTED'].includes(o.status)).length}
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
                {orders.filter((o) => ['COMPLETED', 'REFUNDED', 'CANCELLED'].includes(o.status)).length}
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
                    salesSubFilter === 'all' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {t('sellerStudio.sales.subAll')}
                </button>
                <button
                  onClick={() => setSalesSubFilter('creds')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap ${
                    salesSubFilter === 'creds' ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {t('sellerStudio.sales.subAwaitingCreds')} ({awaitingCredentialsOrders.length})
                </button>
                <button
                  onClick={() => setSalesSubFilter('inspection')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap ${
                    salesSubFilter === 'inspection' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {t('sellerStudio.sales.subInspection')}
                </button>
                <button
                  onClick={() => setSalesSubFilter('dispute')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap ${
                    salesSubFilter === 'dispute' ? 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
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
                    salesSubFilter === 'all' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {t('sellerStudio.sales.subAll')}
                </button>
                <button
                  onClick={() => setSalesSubFilter('completed')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap ${
                    salesSubFilter === 'completed' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {t('sellerStudio.sales.subCompleted')}
                </button>
                <button
                  onClick={() => setSalesSubFilter('refunded')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap ${
                    salesSubFilter === 'refunded' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {t('sellerStudio.sales.subRefunded')}
                </button>
                <button
                  onClick={() => setSalesSubFilter('cancelled')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap ${
                    salesSubFilter === 'cancelled' ? 'bg-slate-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
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
                        src={order.listing?.imageUrls?.[0] || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80'}
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
                          {t('sellerStudio.sales.buyer')}: <strong className="text-slate-700 dark:text-slate-300">{order.buyerName}</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status & CTA Bar */}
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
                      {onSelectOrder && (
                        <button
                          onClick={() => onSelectOrder(order.id)}
                          className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Key className="w-3.5 h-3.5" />
                          <span>{t('sellerStudio.sales.viewOrder')}</span>
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
                      <span>{t('sellerStudio.wallet.max')}: {formatMMK(availableBalanceMMK)}</span>
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      value={payoutAmount}
                      onChange={(e) => setPayoutAmount(e.target.value === '' ? '' : Number(e.target.value))}
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
                        className={`p-2.5 rounded-xl border text-left font-bold transition flex items-center gap-2 cursor-pointer ${
                          payoutMethod === channel.code
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20'
                            : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${channel.color}`} />
                        <span className="truncate">{channel.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Account Number / Phone */}
                <div>
                  <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                    {t('sellerStudio.wallet.accountNumber')}
                  </label>
                  <input
                    type="text"
                    value={walletPhone}
                    onChange={(e) => setWalletPhone(e.target.value)}
                    placeholder="09791122334 or 0812345678"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                {/* Account Holder Legal Name */}
                <div>
                  <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                    {t('sellerStudio.wallet.accountName')}
                  </label>
                  <input
                    type="text"
                    value={walletName}
                    onChange={(e) => setWalletName(e.target.value)}
                    placeholder="e.g. Ko Thura Kyaw or Somchai Prasert"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                {/* Submit Withdrawal */}
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-emerald-500/20 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>{t('sellerStudio.wallet.confirmWithdrawal')}</span>
                </button>
              </form>
            </div>

            {/* Right 5 Cols: Payout History & Status */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ReceiptText className="w-4 h-4 text-emerald-500" />
                  <span>{t('sellerStudio.wallet.payoutHistory')}</span>
                </h3>
              </div>

              {payouts.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-1">
                  <Clock className="w-8 h-8 mx-auto opacity-50" />
                  <p className="text-xs">{t('sellerStudio.wallet.noPayouts')}</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-96 overflow-y-auto">
                  {payouts.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono"
                    >
                      <div>
                        <div className="font-black text-slate-900 dark:text-white">
                          {formatMMK(p.amountMMK)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {p.walletMethod} • {p.requestedAt}
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
      )}
    </div>
  );
};

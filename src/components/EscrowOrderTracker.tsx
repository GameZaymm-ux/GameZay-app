import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ChatMessage, EscrowOrder, EscrowStatus, UserRole } from '../types';
import { ThreePartyLiveChat } from './ThreePartyLiveChat';
import {
  ShieldCheck,
  CheckCircle,
  Clock,
  Key,
  Copy,
  Check,
  AlertOctagon,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  MessageSquare,
  FileText,
  Lock,
  X,
  AlertTriangle,
  UploadCloud,
  ChevronRight,
  CheckCircle2,
  Receipt,
  HelpCircle,
  ExternalLink,
  ShieldAlert,
  Wallet,
  Gamepad2,
  User,
  History,
  Activity,
  Shield,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface EscrowOrderTrackerProps {
  orders: EscrowOrder[];
  selectedOrderId: string | null;
  setSelectedOrderId: (id: string | null) => void;
  onUpdateOrderStatus: (orderId: string, status: EscrowStatus) => void;
  onOpenDispute: (
    orderId: string,
    reason: string,
    description: string,
    proofUrls?: string[]
  ) => void;
  onSendMessage: (
    orderId: string,
    message: Omit<ChatMessage, 'id' | 'createdAt' | 'orderId'>
  ) => void;
  currentRole?: UserRole;
}

type MainTab = 'ongoing' | 'history';
type OngoingSubFilter = 'all' | 'approving' | 'credentials' | 'disputes';
type HistorySubFilter = 'all' | 'completed' | 'refunded' | 'cancelled';
export type BuyerRoomSubTab = 'status_action' | 'live_chat' | 'credentials';

export const EscrowOrderTracker: React.FC<EscrowOrderTrackerProps> = ({
  orders,
  selectedOrderId,
  setSelectedOrderId,
  onUpdateOrderStatus,
  onOpenDispute,
  onSendMessage,
  currentRole = 'BUYER',
}) => {
  const { t, formatMMK, formatTHB, convertMMKtoTHB, isMM } = useLanguage();

  // Navigation State
  const [mainTab, setMainTab] = useState<MainTab>('ongoing');
  const [ongoingFilter, setOngoingFilter] = useState<OngoingSubFilter>('all');
  const [historyFilter, setHistoryFilter] = useState<HistorySubFilter>('all');

  // Active Escrow Room Inner Sub-Tab
  const [roomTab, setRoomTab] = useState<BuyerRoomSubTab>('status_action');
  const [showPassword, setShowPassword] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Selected Order
  const activeOrder = orders.find((o) => o.id === selectedOrderId) || null;

  // Unread chat tracking
  const [lastReadChatCount, setLastReadChatCount] = useState<number>(0);
  const currentMessageCount = activeOrder?.chatMessages?.length || 0;
  const unreadMessagesCount = Math.max(0, currentMessageCount - lastReadChatCount);

  const handleTabChange = (tab: BuyerRoomSubTab) => {
    setRoomTab(tab);
    if (tab === 'live_chat') {
      setLastReadChatCount(currentMessageCount);
    }
  };

  // Simulated 24-Hour Timer for Inspection
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 23,
    minutes: 42,
    seconds: 18,
  });

  useEffect(() => {
    if (
      activeOrder &&
      ['ESCROW_LOCKED', 'CREDENTIALS_DISPATCHED', 'CREDENTIALS_DELIVERED', 'INSPECTION_PERIOD'].includes(
        activeOrder.status
      )
    ) {
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev.seconds > 0) {
            return { ...prev, seconds: prev.seconds - 1 };
          } else if (prev.minutes > 0) {
            return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
          } else if (prev.hours > 0) {
            return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
          }
          return prev;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeOrder?.status]);

  // Dispute Modal State
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('Invalid Credentials / Login Error');
  const [disputeDesc, setDisputeDesc] = useState('');
  const [disputeProofs, setDisputeProofs] = useState<string[]>([
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
  ]);

  // Direct External Refund Form State
  const [refundMethod, setRefundMethod] = useState<string>('KBZ_PAY');
  const [refundAccountNumber, setRefundAccountNumber] = useState<string>('09450012345');
  const [refundAccountName, setRefundAccountName] = useState<string>('Kyaw Zin Win');
  const [customRefunds, setCustomRefunds] = useState<Record<string, any>>({});
  const [isRefundSubmitting, setIsRefundSubmitting] = useState(false);
  const [refundSuccessToast, setRefundSuccessToast] = useState(false);

  const handleRefundSubmit = (orderId: string) => {
    setIsRefundSubmitting(true);
    setTimeout(() => {
      setIsRefundSubmitting(false);
      const newRefundInfo = {
        refundMethod,
        accountNumber: refundAccountNumber,
        accountName: refundAccountName,
        amountMMK: activeOrder?.amountMMK || 0,
        txId: `${refundMethod === 'KBZ_PAY' ? 'KPay' : refundMethod === 'WAVE_PAY' ? 'WAVE' : 'BANK'}-REF-${Math.floor(1000000 + Math.random() * 9000000)}`,
        processedAt: new Date().toISOString(),
        status: 'PROCESSED' as const,
      };
      setCustomRefunds((prev) => ({
        ...prev,
        [orderId]: newRefundInfo,
      }));
      onUpdateOrderStatus(orderId, 'REFUNDED');
      setRefundSuccessToast(true);
      setTimeout(() => setRefundSuccessToast(false), 4000);
    }, 600);
  };

  // Filter Categories Logic
  const isOngoing = (status: EscrowStatus) =>
    ['PENDING_PAYMENT_PROOF', 'PAYMENT_VERIFYING', 'ESCROW_LOCKED', 'CREDENTIALS_DISPATCHED', 'CREDENTIALS_DELIVERED', 'INSPECTION_PERIOD', 'DISPUTED'].includes(status);

  const isHistory = (status: EscrowStatus) =>
    ['COMPLETED', 'REFUNDED', 'CANCELLED'].includes(status);

  const ongoingOrders = orders.filter((o) => isOngoing(o.status));
  const historyOrders = orders.filter((o) => isHistory(o.status));

  // Count Badges for Ongoing
  const countOngoingAll = ongoingOrders.length;
  const countApproving = orders.filter((o) => ['PENDING_PAYMENT_PROOF', 'PAYMENT_VERIFYING'].includes(o.status)).length;
  const countCredentials = orders.filter((o) => ['ESCROW_LOCKED', 'CREDENTIALS_DISPATCHED', 'CREDENTIALS_DELIVERED', 'INSPECTION_PERIOD'].includes(o.status)).length;
  const countDisputes = orders.filter((o) => o.status === 'DISPUTED').length;

  // Count Badges for History
  const countHistoryAll = historyOrders.length;
  const countCompleted = orders.filter((o) => o.status === 'COMPLETED').length;
  const countRefunded = orders.filter((o) => o.status === 'REFUNDED').length;
  const countCancelled = orders.filter((o) => o.status === 'CANCELLED').length;

  // Filtered Orders to Display
  const filteredOrders = (mainTab === 'ongoing' ? ongoingOrders : historyOrders).filter((order) => {
    if (mainTab === 'ongoing') {
      if (ongoingFilter === 'approving') return ['PENDING_PAYMENT_PROOF', 'PAYMENT_VERIFYING'].includes(order.status);
      if (ongoingFilter === 'credentials') return ['ESCROW_LOCKED', 'CREDENTIALS_DISPATCHED', 'CREDENTIALS_DELIVERED', 'INSPECTION_PERIOD'].includes(order.status);
      if (ongoingFilter === 'disputes') return order.status === 'DISPUTED';
      return true;
    } else {
      if (historyFilter === 'completed') return order.status === 'COMPLETED';
      if (historyFilter === 'refunded') return order.status === 'REFUNDED';
      if (historyFilter === 'cancelled') return order.status === 'CANCELLED';
      return true;
    }
  });

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleConfirmRelease = (orderId: string) => {
    onUpdateOrderStatus(orderId, 'COMPLETED');
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleDisputeSubmit = () => {
    if (!activeOrder) return;
    onOpenDispute(
      activeOrder.id,
      disputeReason,
      disputeDesc.trim() || 'Buyer reported critical account credential mismatch.',
      disputeProofs
    );
    setIsDisputeModalOpen(false);
    setDisputeDesc('');
  };

  // Helper for Status Badge Styling
  const getStatusBadge = (status: EscrowStatus) => {
    switch (status) {
      case 'PENDING_PAYMENT_PROOF':
      case 'PAYMENT_VERIFYING':
        return {
          label: t('orders.status.PAYMENT_VERIFYING'),
          bg: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
          dot: 'bg-amber-400 animate-pulse',
          icon: Clock,
        };
      case 'ESCROW_LOCKED':
      case 'CREDENTIALS_DISPATCHED':
      case 'CREDENTIALS_DELIVERED':
      case 'INSPECTION_PERIOD':
        return {
          label: t('orders.status.CREDENTIALS_DELIVERED'),
          bg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
          dot: 'bg-emerald-400 animate-pulse',
          icon: Key,
        };
      case 'DISPUTED':
        return {
          label: t('orders.status.DISPUTED'),
          bg: 'bg-rose-500/10 text-rose-500 border-rose-500/30',
          dot: 'bg-rose-500',
          icon: AlertOctagon,
        };
      case 'COMPLETED':
        return {
          label: t('orders.status.COMPLETED'),
          bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
          dot: 'bg-indigo-400',
          icon: CheckCircle2,
        };
      case 'REFUNDED':
        return {
          label: t('orders.status.REFUNDED'),
          bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
          dot: 'bg-cyan-400',
          icon: Receipt,
        };
      case 'CANCELLED':
      default:
        return {
          label: t('orders.status.CANCELLED'),
          bg: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
          dot: 'bg-slate-500',
          icon: X,
        };
    }
  };

  // Helper for CTA Button text & style in list
  const getCTAButton = (order: EscrowOrder) => {
    if (order.status === 'DISPUTED') {
      return {
        label: t('orders.checkDispute'),
        className: 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30',
      };
    }
    if (['ESCROW_LOCKED', 'CREDENTIALS_DISPATCHED', 'CREDENTIALS_DELIVERED', 'INSPECTION_PERIOD'].includes(order.status)) {
      return {
        label: t('orders.viewCredentials'),
        className: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow-md shadow-emerald-500/20 hover:brightness-110',
      };
    }
    if (['PENDING_PAYMENT_PROOF', 'PAYMENT_VERIFYING'].includes(order.status)) {
      return {
        label: t('orders.openEscrowRoom'),
        className: 'bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30',
      };
    }
    return {
      label: t('orders.viewReceipt'),
      className: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700',
    };
  };

  const isInspectionActive = activeOrder && [
    'ESCROW_LOCKED',
    'CREDENTIALS_DISPATCHED',
    'CREDENTIALS_DELIVERED',
    'INSPECTION_PERIOD',
  ].includes(activeOrder.status);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-300">
      
      {/* ======================================================== */}
      {/* ACTIVE ESCROW ROOM VIEW (BUYER PERSPECTIVE)              */}
      {/* ======================================================== */}
      {activeOrder ? (
        <div className="space-y-5 animate-in fade-in duration-200">
          
          {/* 1. COMPACT STICKY TOP BAR HEADER */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Left: Back button + Listing summary */}
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setSelectedOrderId(null)}
                  className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold shrink-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('orders.backToOrders')}</span>
                </button>

                <img
                  src={
                    activeOrder.listing?.bannerUrl ||
                    activeOrder.listing?.imageUrls?.[0] ||
                    'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80'
                  }
                  alt={activeOrder.listing?.title || 'Account'}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                />

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                      {activeOrder.listing?.gameType?.toUpperCase() || 'GAMING'}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">
                      #{activeOrder.orderNumber}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden md:inline-flex items-center gap-1">
                      <User className="w-3 h-3 text-cyan-500" />
                      <span>{t('orders.seller')}: <strong className="text-slate-800 dark:text-slate-200">{activeOrder.sellerName}</strong></span>
                    </span>
                  </div>
                  <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
                    {activeOrder.listing?.title || activeOrder.orderNumber}
                  </h2>
                </div>
              </div>

              {/* Right: Escrow Amount & Status Badge */}
              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                <div className="text-left sm:text-right">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    {t('orders.totalAmount')}
                  </div>
                  <div className="text-base sm:text-lg font-black font-mono text-emerald-500">
                    {formatMMK(activeOrder.amountMMK)}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    ≈ {formatTHB(convertMMKtoTHB(activeOrder.amountMMK))}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  {(() => {
                    const badge = getStatusBadge(activeOrder.status);
                    const BadgeIcon = badge.icon;
                    return (
                      <span className={`px-3 py-1 rounded-2xl text-xs font-black tracking-wide border shadow-sm flex items-center gap-1.5 ${badge.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        <BadgeIcon className="w-3.5 h-3.5" />
                        <span>{badge.label}</span>
                      </span>
                    );
                  })()}

                  {isInspectionActive && (
                    <div className="flex items-center gap-1 font-mono text-[10px] text-cyan-600 dark:text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/20">
                      <Clock className="w-3 h-3" />
                      <span>
                        {String(timeLeft.hours).padStart(2, '0')}:
                        {String(timeLeft.minutes).padStart(2, '0')}:
                        {String(timeLeft.seconds).padStart(2, '0')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. INNER SUB-TAB NAVIGATION (3 TABS) */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar">
              {/* Tab 1: Status & Action */}
              <button
                onClick={() => handleTabChange('status_action')}
                className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl text-xs font-bold transition cursor-pointer ${
                  roomTab === 'status_action'
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-black shadow-cyan-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{t('sellerStudio.escrowRoom.subTabs.statusAction')}</span>
              </button>

              {/* Tab 2: Live Chat */}
              <button
                onClick={() => handleTabChange('live_chat')}
                className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl text-xs font-bold transition cursor-pointer relative ${
                  roomTab === 'live_chat'
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-black shadow-cyan-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>{t('sellerStudio.escrowRoom.subTabs.liveChat')}</span>
                {currentMessageCount > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      roomTab === 'live_chat'
                        ? 'bg-slate-950 text-cyan-400'
                        : 'bg-cyan-500 text-slate-950'
                    }`}
                  >
                    {currentMessageCount}
                  </span>
                )}
                {unreadMessagesCount > 0 && roomTab !== 'live_chat' && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                  </span>
                )}
              </button>

              {/* Tab 3: Credentials */}
              <button
                onClick={() => handleTabChange('credentials')}
                className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl text-xs font-bold transition cursor-pointer ${
                  roomTab === 'credentials'
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-black shadow-cyan-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Key className="w-4 h-4" />
                <span>{t('sellerStudio.escrowRoom.subTabs.credentials')}</span>
                {activeOrder.credentials && (
                  <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                    ✓
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 3. SUB-TAB CONTENT PANELS                                */}
          {/* ======================================================== */}

          {/* -------------------------------------------------------- */}
          {/* SUB-TAB 1: STATUS & ACTION                               */}
          {/* -------------------------------------------------------- */}
          {roomTab === 'status_action' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Deal Milestones Timeline */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-500" />
                    <span>{t('orders.timelineTab')}</span>
                  </h3>

                  {activeOrder.status !== 'COMPLETED' && activeOrder.status !== 'REFUNDED' && (
                    <button
                      onClick={() => setIsDisputeModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-bold transition flex items-center gap-1 cursor-pointer border border-rose-200 dark:border-rose-800/60"
                    >
                      <AlertOctagon className="w-3.5 h-3.5" />
                      <span>{t('orders.raiseDisputeBtn')}</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  {[
                    {
                      step: isMM ? '၁။ ငွေလွှဲ အတည်ပြုခြင်း' : '1. Escrow Payment Received',
                      desc: isMM ? 'ငွေလွှဲပြေစာကို Vault တွင် စိစစ်ထိန်းသိမ်း' : 'Payment slip verified in Vault',
                      done: true,
                      active: ['PENDING_PAYMENT_PROOF', 'PAYMENT_VERIFYING'].includes(activeOrder.status),
                    },
                    {
                      step: isMM ? '၂။ အကောင့် လွှဲပြောင်းခြင်း' : '2. Credentials Delivered',
                      desc: isMM ? 'ရောင်းသူမှ လျှို့ဝှက် ID & Password ပေးပို့' : 'Encrypted credentials delivered',
                      done: ['ESCROW_LOCKED', 'CREDENTIALS_DISPATCHED', 'CREDENTIALS_DELIVERED', 'INSPECTION_PERIOD', 'COMPLETED'].includes(activeOrder.status),
                      active: activeOrder.status === 'ESCROW_LOCKED',
                    },
                    {
                      step: isMM ? '၃။ ၂၄ နာရီ စစ်ဆေးချိန်' : '3. 24h Buyer Inspection',
                      desc: isMM ? 'ဂိမ်းထဲဝင်၍ စကင်း/အဆင့် စစ်ဆေးအတည်ပြု' : 'Test account & bind personal info',
                      done: activeOrder.status === 'COMPLETED',
                      active: isInspectionActive,
                    },
                    {
                      step: isMM ? '၄။ ရောင်းသူထံ ငွေထုတ်ပေးခြင်း' : '4. Seller Payout Release',
                      desc: isMM ? 'ဝယ်သူ အတည်ပြုပြီးနောက် ငွေထုတ်ပေး' : 'Escrow automatically releases funds',
                      done: activeOrder.status === 'COMPLETED',
                      active: activeOrder.status === 'COMPLETED',
                    },
                  ].map((m, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl border transition ${
                        m.done
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-slate-900 dark:text-white'
                          : m.active
                          ? 'bg-cyan-500/10 border-cyan-500/40 text-slate-900 dark:text-white shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        {m.done ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : m.active ? (
                          <Clock className="w-4 h-4 text-cyan-500 shrink-0 animate-spin" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-slate-400/50" />
                        )}
                        <span className="font-bold text-[11px]">{m.step}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                        {m.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Box Container */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-500">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      {isMM ? 'ဝယ်ယူသူ ဆောင်ရွက်ချက်' : 'Buyer Escrow Action Desk'}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {isMM ? 'အကောင့်စစ်ဆေးပြီးပါက ရောင်းသူထံ ငွေထုတ်ပေးပါ' : 'Verify in-game account before releasing payout'}
                    </p>
                  </div>
                </div>

                {/* Stage 1: Payment Verification Pending */}
                {['PENDING_PAYMENT_PROOF', 'PAYMENT_VERIFYING'].includes(activeOrder.status) && (
                  <div className="p-5 text-center bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <Clock className="w-8 h-8 text-amber-400 mx-auto animate-pulse" />
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {isMM ? 'ငွေလွှဲပြေစာ စစ်ဆေးနေပါသည်' : 'Payment Slip Under Verification'}
                    </h4>
                    <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                      {isMM
                        ? 'Escrow အက်ဒမင်က KPay / WavePay ပြေစာ အတည်ပြုပြီးသည်နှင့် credentials များကို Credentials Tab တွင် ချက်ချင်း ဖွင့်ပြပေးပါမည်။'
                        : 'As soon as admin confirms your payment slip, credentials will unlock instantly in the Credentials tab.'}
                    </p>
                  </div>
                )}

                {/* Stage 2: Inspection Active / Credentials Ready */}
                {isInspectionActive && (
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-500/10 via-slate-50 to-emerald-500/10 dark:from-cyan-950/40 dark:via-slate-950 dark:to-emerald-950/40 border border-cyan-500/30 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-500">
                          <Clock className="w-5 h-5 animate-spin text-cyan-400" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-900 dark:text-white">
                            {t('orders.inspectionTimer')}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {t('orders.timerDesc')}
                          </p>
                        </div>
                      </div>

                      {/* 24h Timer Countdown */}
                      <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-cyan-500/30 shadow-sm font-mono font-black text-cyan-600 dark:text-cyan-400 text-xs">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {String(timeLeft.hours).padStart(2, '0')}:
                          {String(timeLeft.minutes).padStart(2, '0')}:
                          {String(timeLeft.seconds).padStart(2, '0')}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-cyan-500/20">
                      <button
                        onClick={() => setIsDisputeModalOpen(true)}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <AlertOctagon className="w-4 h-4" />
                        <span>{t('orders.raiseDisputeBtn')}</span>
                      </button>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => handleTabChange('credentials')}
                          className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Key className="w-3.5 h-3.5" />
                          <span>Inspect Logins</span>
                        </button>

                        <button
                          onClick={() => handleConfirmRelease(activeOrder.id)}
                          className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20 transition cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>{t('orders.confirmReleaseBtn')}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Stage 3: Completed */}
                {activeOrder.status === 'COMPLETED' && (
                  <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-500">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black">
                          {isMM ? 'အရောင်းအဝယ် အောင်မြင်စွာ ပြီးဆုံးပါပြီ' : 'Order Completed & Released'}
                        </h4>
                        <p className="text-[11px] text-emerald-800 dark:text-emerald-300 mt-1">
                          {isMM
                            ? 'သင် အကောင့်စစ်ဆေးပြီး အတည်ပြုခဲ့ပြီးဖြစ်သောကြောင့် ရောင်းသူထံ ငွေထုတ်ပေးပြီးပါပြီ။'
                            : 'You confirmed inspection and escrow vault dispatched payout to seller.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Stage 4: Disputed with Direct External Refund Input */}
                {activeOrder.status === 'DISPUTED' && (
                  <div className="p-5 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200 space-y-4">
                    <div className="flex items-start gap-3">
                      <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-black">
                          {isMM ? 'အငြင်းပွားမှု စိစစ်နေဆဲ (Escrow Vault တွင် ငွေထိန်းသိမ်းထားပါသည်)' : 'Dispute Claim Active (Vault Locked)'}
                        </h4>
                        <p className="text-[11px] text-rose-800 dark:text-rose-300 mt-1 leading-relaxed">
                          {activeOrder.disputeInfo?.description || 'Escrow funds are safely frozen in vault while GameZay Arbiter investigates credentials.'}
                        </p>
                      </div>
                    </div>

                    {/* Direct External Refund Account Prompt */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800/80 space-y-3">
                      <div className="flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-cyan-500" />
                        <h5 className="text-xs font-black text-slate-900 dark:text-white">
                          {t('refund.promptTitle')}
                        </h5>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {t('refund.promptDesc')}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                            {t('refund.selectMethod')}
                          </label>
                          <select
                            value={refundMethod}
                            onChange={(e) => setRefundMethod(e.target.value)}
                            aria-label={t('refund.selectMethod')}
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                          >
                            <option value="KBZ_PAY">KBZPay (KPay)</option>
                            <option value="WAVE_PAY">WavePay</option>
                            <option value="AYA_PAY">AYA Pay</option>
                            <option value="CB_PAY">CB Pay</option>
                            <option value="PROMPTPAY">PromptPay (THB)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                            {t('refund.accountNumber')}
                          </label>
                          <input
                            type="text"
                            value={refundAccountNumber}
                            onChange={(e) => setRefundAccountNumber(e.target.value)}
                            placeholder={t('refund.accountNumberPlaceholder')}
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                            {t('refund.accountName')}
                          </label>
                          <input
                            type="text"
                            value={refundAccountName}
                            onChange={(e) => setRefundAccountName(e.target.value)}
                            placeholder={t('refund.accountNamePlaceholder')}
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => handleRefundSubmit(activeOrder.id)}
                          disabled={isRefundSubmitting || !refundAccountNumber.trim()}
                          className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 text-xs font-black shadow-md shadow-cyan-500/20 transition cursor-pointer disabled:opacity-50"
                        >
                          {isRefundSubmitting ? 'Processing Payout...' : t('refund.submitBtn')}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleTabChange('live_chat')}
                          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition cursor-pointer"
                        >
                          Join 3-Party Dispute Chat
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Stage 5: Refunded - DIRECT EXTERNAL REFUND RECEIPT */}
                {activeOrder.status === 'REFUNDED' && (() => {
                  const currentRefund = customRefunds[activeOrder.id] || activeOrder.refundInfo || {
                    refundMethod: activeOrder.paymentMethod || 'WAVE_PAY',
                    accountNumber: activeOrder.senderPhone || '09421122334',
                    accountName: activeOrder.buyerName || 'Zaw Moe Aung',
                    amountMMK: activeOrder.amountMMK,
                    txId: 'WAVE-REF-8829104',
                    processedAt: activeOrder.createdAt,
                    status: 'PROCESSED',
                  };

                  return (
                    <div className="p-6 rounded-3xl bg-gradient-to-br from-cyan-500/10 via-emerald-500/5 to-slate-900 border border-cyan-500/30 text-slate-900 dark:text-white space-y-4 shadow-lg animate-in fade-in">
                      {/* Receipt Top Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cyan-500/20">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-2xl bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30">
                            <Receipt className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                              <span>{t('refund.receiptTitle')}</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950">
                                100% Payout Complete
                              </span>
                            </h4>
                            <p className="text-xs text-cyan-600 dark:text-cyan-400 font-medium">
                              {t('refund.receiptDesc')}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-base sm:text-lg font-black text-emerald-500 font-mono">
                            {formatMMK(activeOrder.amountMMK)}
                          </div>
                          <div className="text-[10px] text-cyan-500 font-mono">
                            ≈ {formatTHB(convertMMKtoTHB(activeOrder.amountMMK))}
                          </div>
                        </div>
                      </div>

                      {/* Confirmation Highlight Message */}
                      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-950/80 border border-cyan-500/30 text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-bold">
                          {isMM
                            ? `${formatMMK(activeOrder.amountMMK)} အား သင့် ${currentRefund.refundMethod} (${currentRefund.accountNumber} - ${currentRefund.accountName}) အကောင့်သို့ တိုက်ရိုက် ပြန်အမ်းပြီးပါပြီ။`
                            : `Refunded ${formatMMK(activeOrder.amountMMK)} directly to your ${currentRefund.refundMethod} account (${currentRefund.accountNumber} - ${currentRefund.accountName}).`}
                        </span>
                      </div>

                      {/* Payout Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                          <div className="text-[10px] text-slate-400 font-bold uppercase">{t('refund.selectMethod')}</div>
                          <div className="font-black text-cyan-500 font-mono">{currentRefund.refundMethod}</div>
                          <div className="text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                            {currentRefund.accountNumber}
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                          <div className="text-[10px] text-slate-400 font-bold uppercase">{t('refund.recipient')}</div>
                          <div className="font-black text-slate-900 dark:text-white">{currentRefund.accountName}</div>
                          <div className="text-[10px] text-emerald-500 font-mono">Verified Holder</div>
                        </div>

                        <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                          <div className="text-[10px] text-slate-400 font-bold uppercase">{t('refund.txId')}</div>
                          <div className="font-bold text-slate-900 dark:text-white font-mono truncate">
                            {currentRefund.txId}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {new Date(currentRefund.processedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500 dark:text-slate-400 text-center font-medium pt-1">
                        🛡️ {t('refund.zeroDeduction')}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Counterparty & Trade Details */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-cyan-500" />
                  <span>{isMM ? 'အရောင်းအဝယ် အချက်အလက်' : 'Counterparty & Trade Details'}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 text-xs space-y-1">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">{t('orders.seller')}</div>
                    <div className="font-bold text-slate-900 dark:text-white">{activeOrder.sellerName}</div>
                    <div className="text-[11px] text-emerald-500 font-mono flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Verified Pro Seller</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 text-xs space-y-1">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">{t('orders.buyer')}</div>
                    <div className="font-bold text-slate-900 dark:text-white">{activeOrder.buyerName}</div>
                    <div className="text-[11px] text-cyan-500 font-mono">
                      {activeOrder.buyerPhone || '09450012345'}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 text-xs space-y-1">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">{isMM ? 'ငွေပေးချေမှု' : 'Payment Method'}</div>
                    <div className="font-bold text-cyan-500 font-mono">{activeOrder.paymentMethod}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      TxID: {activeOrder.transactionId || 'GZ-TX-99482'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------- */}
          {/* SUB-TAB 2: LIVE CHAT                                     */}
          {/* -------------------------------------------------------- */}
          {roomTab === 'live_chat' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl min-h-[580px] animate-in fade-in duration-200">
              <ThreePartyLiveChat
                order={activeOrder}
                currentRole={currentRole}
                currentUserRole={currentRole}
                onSendMessage={onSendMessage}
              />
            </div>
          )}

          {/* -------------------------------------------------------- */}
          {/* SUB-TAB 3: CREDENTIALS & SECURE VAULT RECORD             */}
          {/* -------------------------------------------------------- */}
          {roomTab === 'credentials' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-500">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                        {t('sellerStudio.escrowRoom.credentialsVault.vaultTitle')}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {t('sellerStudio.escrowRoom.credentialsVault.vaultSubtitle')}
                      </p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
                    {activeOrder.credentials?.authType || 'LOGIN_ID'}
                  </span>
                </div>

                {activeOrder.credentials ? (
                  <div className="space-y-4">
                    {/* Login ID */}
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                          {t('orders.loginId')}
                        </label>
                        <span className="text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-white select-all">
                          {activeOrder.credentials.loginId}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(activeOrder.credentials!.loginId, 'login')}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-cyan-500 hover:text-slate-950 text-xs font-bold transition flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 cursor-pointer"
                      >
                        {copiedKey === 'login' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === 'login' ? t('orders.copied') : t('orders.copy')}</span>
                      </button>
                    </div>

                    {/* Password */}
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                          {t('orders.password')}
                        </label>
                        <span className="text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-white select-all">
                          {showPassword ? activeOrder.credentials.password : '••••••••••••••••'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowPassword(!showPassword)}
                          className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition border border-slate-200 dark:border-slate-700 cursor-pointer"
                          title={showPassword ? t('orders.hide') : t('orders.reveal')}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleCopy(activeOrder.credentials!.password, 'pass')}
                          className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-cyan-500 hover:text-slate-950 text-xs font-bold transition flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 cursor-pointer"
                        >
                          {copiedKey === 'pass' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === 'pass' ? t('orders.copied') : t('orders.copy')}</span>
                        </button>
                      </div>
                    </div>

                    {/* Backup Codes / 2FA */}
                    {activeOrder.credentials.backupCodes && (
                      <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                            {t('orders.backupCodes')}
                          </label>
                          <span className="text-xs font-mono font-bold text-slate-900 dark:text-white select-all">
                            {activeOrder.credentials.backupCodes}
                          </span>
                        </div>
                        <button
                          onClick={() => handleCopy(activeOrder.credentials!.backupCodes!, 'codes')}
                          className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-cyan-500 hover:text-slate-950 text-xs font-bold transition flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 cursor-pointer"
                        >
                          {copiedKey === 'codes' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === 'codes' ? t('orders.copied') : t('orders.copy')}</span>
                        </button>
                      </div>
                    )}

                    {/* Transfer Notes */}
                    {activeOrder.credentials.transferNotes && (
                      <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl space-y-1">
                        <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{t('orders.transferNotes')}</span>
                        </span>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                          {activeOrder.credentials.transferNotes}
                        </p>
                      </div>
                    )}

                    {/* Buyer Security Checklist */}
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Shield className="w-4 h-4 text-emerald-500" />
                        <span>{t('sellerStudio.escrowRoom.credentialsVault.securityChecklist')}</span>
                      </div>
                      <ul className="space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
                        <li>{t('sellerStudio.escrowRoom.credentialsVault.stepChangePass')}</li>
                        <li>{t('sellerStudio.escrowRoom.credentialsVault.stepBindPhone')}</li>
                        <li>{t('sellerStudio.escrowRoom.credentialsVault.stepRemoveDevices')}</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <Clock className="w-8 h-8 text-amber-400 mx-auto animate-pulse" />
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {t('sellerStudio.escrowRoom.credentialsVault.notDeliveredYet')}
                    </h4>
                    <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                      {t('sellerStudio.escrowRoom.credentialsVault.notDeliveredDesc')}
                    </p>
                  </div>
                )}
              </div>

              {/* Time Tracker & Access Audit Logs */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <History className="w-4 h-4 text-cyan-500" />
                  <span>{t('sellerStudio.escrowRoom.credentialsVault.accessLogs')}</span>
                </h4>

                <div className="space-y-3 relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 text-xs">
                  <div className="relative">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 absolute -left-[31px] top-1" />
                    <div className="font-bold text-slate-900 dark:text-white">
                      {t('sellerStudio.escrowRoom.credentialsVault.orderCreatedLog')}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {new Date(activeOrder.createdAt).toLocaleString()}
                    </div>
                  </div>

                  {activeOrder.status !== 'PENDING_PAYMENT_PROOF' && (
                    <div className="relative">
                      <div className="w-3 h-3 rounded-full bg-emerald-500 absolute -left-[31px] top-1" />
                      <div className="font-bold text-slate-900 dark:text-white">
                        {t('sellerStudio.escrowRoom.credentialsVault.dispatchedLog')}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Escrow Payment Locked & Secured in Platform Vault
                      </div>
                    </div>
                  )}

                  {activeOrder.credentials && (
                    <div className="relative">
                      <div className="w-3 h-3 rounded-full bg-cyan-500 absolute -left-[31px] top-1 animate-ping" />
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-cyan-500" />
                        <span>{t('sellerStudio.escrowRoom.credentialsVault.viewedLog')}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Buyer decrypted credentials • 24h inspection protection started
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ======================================================== */
        /* ORDERS MASTER LIST VIEW                                   */
        /* ======================================================== */
        <div className="space-y-6">
          {/* Header Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Receipt className="w-6 h-6 text-cyan-500" />
                <span>{t('orders.title')}</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('orders.subtitle')}
              </p>
            </div>
          </div>

          {/* 1. Main Navigation Top Tabs (Ongoing vs. History) */}
          <div className="bg-slate-100 dark:bg-slate-900/90 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-1.5">
            <button
              onClick={() => {
                setMainTab('ongoing');
                setOngoingFilter('all');
              }}
              className={`flex-1 py-3 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-2 ${
                mainTab === 'ongoing'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>{t('orders.ongoing')}</span>
              {countOngoingAll > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  mainTab === 'ongoing' ? 'bg-slate-950 text-cyan-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}>
                  {countOngoingAll}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setMainTab('history');
                setHistoryFilter('all');
              }}
              className={`flex-1 py-3 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-2 ${
                mainTab === 'history'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>{t('orders.history')}</span>
              {countHistoryAll > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  mainTab === 'history' ? 'bg-slate-950 text-cyan-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}>
                  {countHistoryAll}
                </span>
              )}
            </button>
          </div>

          {/* 2. Sub-Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {mainTab === 'ongoing' ? (
              <>
                {[
                  { id: 'all', label: t('orders.subAll'), count: countOngoingAll },
                  { id: 'approving', label: t('orders.subApproving'), count: countApproving },
                  { id: 'credentials', label: t('orders.subCredentials'), count: countCredentials },
                  { id: 'disputes', label: t('orders.subDisputes'), count: countDisputes },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setOngoingFilter(tab.id as OngoingSubFilter)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                      ongoingFilter === tab.id
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-sm'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-400'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        ongoingFilter === tab.id
                          ? 'bg-slate-700 dark:bg-slate-200 text-white dark:text-slate-950'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </>
            ) : (
              <>
                {[
                  { id: 'all', label: t('orders.subAll'), count: countHistoryAll },
                  { id: 'completed', label: t('orders.subCompleted'), count: countCompleted },
                  { id: 'refunded', label: t('orders.subRefunded'), count: countRefunded },
                  { id: 'cancelled', label: t('orders.subCancelled'), count: countCancelled },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setHistoryFilter(tab.id as HistorySubFilter)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                      historyFilter === tab.id
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-sm'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-400'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        historyFilter === tab.id
                          ? 'bg-slate-700 dark:bg-slate-200 text-white dark:text-slate-950'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </>
            )}
          </div>

          {/* 3. Orders Cards List */}
          {filteredOrders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {filteredOrders.map((order) => {
                const badge = getStatusBadge(order.status);
                const BadgeIcon = badge.icon;
                const cta = getCTAButton(order);

                return (
                  <div
                    key={order.id}
                    onClick={() => {
                      setSelectedOrderId(order.id);
                      setRoomTab('status_action');
                    }}
                    className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 rounded-3xl p-4 sm:p-5 shadow-sm hover:shadow-lg transition duration-200 cursor-pointer flex flex-col justify-between space-y-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-950 shrink-0 border border-slate-200 dark:border-slate-800">
                        <img
                          src={order.listing?.bannerUrl || order.listing?.imageUrls?.[0] || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80'}
                          alt={order.listing?.title || 'Account'}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-slate-950/80 text-cyan-400 text-[9px] font-black uppercase">
                          {order.listing?.gameType?.toUpperCase() || 'GAME'}
                        </span>
                      </div>

                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                            <BadgeIcon className="w-3 h-3" />
                            <span>{badge.label}</span>
                          </span>

                          <span className="text-[10px] text-slate-400 font-mono">
                            {order.orderNumber}
                          </span>
                        </div>

                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-cyan-500 transition leading-snug">
                          {order.listing?.title || `${order.listing?.gameType?.toUpperCase()} Verified Account`}
                        </h3>

                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {t('orders.seller')}: <span className="font-semibold text-slate-700 dark:text-slate-300">{order.sellerName}</span>
                        </div>

                        {order.status === 'REFUNDED' && (() => {
                          const rInfo = customRefunds[order.id] || order.refundInfo;
                          return (
                            <div className="mt-1.5 p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-[10px] font-bold flex items-center gap-1.5">
                              <Receipt className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                              <span className="truncate">
                                {isMM
                                  ? `${formatMMK(order.amountMMK)} အား ${rInfo?.refundMethod || order.paymentMethod} (${rInfo?.accountNumber || order.senderPhone || '09421122334'}) သို့ တိုက်ရိုက် ပြန်အမ်းပြီး`
                                  : `Refunded ${formatMMK(order.amountMMK)} directly to your ${rInfo?.refundMethod || order.paymentMethod} account`}
                              </span>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400">
                          {formatMMK(order.amountMMK)}
                        </div>
                        <div className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono">
                          ≈ {formatTHB(convertMMKtoTHB(order.amountMMK))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrderId(order.id);
                          setRoomTab('status_action');
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${cta.className}`}
                      >
                        <span>{cta.label}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <Receipt className="w-10 h-10 text-slate-400 mx-auto opacity-50" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {mainTab === 'ongoing' ? t('orders.emptyOngoing') : t('orders.emptyHistory')}
              </h3>
              <p className="text-xs text-slate-500">
                {isMM
                  ? 'အကောင့်ဝယ်ယူထားခြင်း မရှိသေးပါက Marketplace တွင် စိတ်ကြိုက် ရှာဖွေဝယ်ယူနိုင်ပါသည်။'
                  : 'Browse accounts on the Marketplace with 100% Escrow Protection.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Raise Dispute Modal */}
      {isDisputeModalOpen && (
        <div
          onClick={() => setIsDisputeModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5 text-rose-500 font-bold">
                <AlertOctagon className="w-5 h-5" />
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  {isMM ? 'အငြင်းပွားမှု တင်ပြခြင်း (Dispute Claim)' : 'Raise Escrow Dispute Claim'}
                </h3>
              </div>
              <button
                onClick={() => setIsDisputeModalOpen(false)}
                className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1.5">
                  {isMM ? 'အငြင်းပွားမှု အကြောင်းရင်း' : 'Reason for Dispute'} *
                </label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-medium"
                >
                  <option value="Invalid Credentials / Login Error">Invalid Credentials / Login Error (Password မှားယွင်းခြင်း)</option>
                  <option value="Missing Cards / Skins Mismatch">Missing Cards / Skins Mismatch (ကြော်ငြာနှင့် ပစ္စည်းမကိုက်ညီခြင်း)</option>
                  <option value="Account Recovered by Seller">Account Recovered by Seller (အကောင့်ပြန်ဆွဲခံရခြင်း)</option>
                  <option value="2FA Linked / Not Removable">2FA Linked / Not Removable (အီးမေးလ် ဖုန်း ချိတ်ဆက်ဖြုတ်မရခြင်း)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1.5">
                  {isMM ? 'အသေးစိတ် ဖော်ပြချက်' : 'Detailed Explanation'} *
                </label>
                <textarea
                  rows={3}
                  value={disputeDesc}
                  onChange={(e) => setDisputeDesc(e.target.value)}
                  placeholder={
                    isMM
                      ? 'ဖြစ်ပွားသော ပြဿနာကို အသေးစိတ် ရေးသားပေးပါ...'
                      : 'Provide details about the error or mismatch...'
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl text-[11px] text-rose-500 dark:text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  {isMM
                    ? 'တိုင်ကြားစာ တင်ပြပါက Escrow ငွေလွှဲပြောင်းမှုကို ချက်ချင်း Freeze လုပ်မည်ဖြစ်ပြီး အက်ဒမင်က ဝင်ရောက်စစ်ဆေးပါမည်။'
                    : 'Funds will be immediately frozen in Escrow Vault upon dispute submission.'}
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsDisputeModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
              >
                {isMM ? 'ပယ်ဖျက်မည်' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleDisputeSubmit}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-lg shadow-rose-600/30 transition cursor-pointer"
              >
                {isMM ? 'အတည်ပြု၍ တိုင်ကြားမည်' : 'Freeze Funds & Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

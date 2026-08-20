import React, { useState } from 'react';
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

  // Active Escrow Room Tab
  const [roomTab, setRoomTab] = useState<'credentials' | 'chat' | 'timeline'>('credentials');
  const [showPassword, setShowPassword] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Dispute Modal State
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('Invalid Credentials / Login Error');
  const [disputeDesc, setDisputeDesc] = useState('');
  const [disputeProofs, setDisputeProofs] = useState<string[]>([
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
  ]);

  // Selected Order
  const activeOrder = orders.find((o) => o.id === selectedOrderId) || null;

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

  const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setDisputeProofs((prev) => [...prev, url]);
    }
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

  // Helper for CTA Button text & style
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-300">
      
      {/* If an active order is selected, show the Dedicated Escrow Room view */}
      {activeOrder ? (
        <div className="space-y-6">
          {/* Top Bar with Back Button */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-sm">
            <button
              onClick={() => setSelectedOrderId(null)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('orders.backToOrders')}</span>
            </button>

            <div className="flex items-center gap-3">
              {(() => {
                const badge = getStatusBadge(activeOrder.status);
                const BadgeIcon = badge.icon;
                return (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.bg}`}>
                    <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                    <BadgeIcon className="w-3.5 h-3.5" />
                    <span>{badge.label}</span>
                  </span>
                );
              })()}
              <span className="text-xs text-slate-400 font-mono hidden sm:inline-block">
                {activeOrder.orderNumber}
              </span>
            </div>
          </div>

          {/* Escrow Room Header Banner */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950 border border-cyan-500/20 rounded-3xl p-5 sm:p-6 text-white relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <img
                  src={activeOrder.listing?.bannerUrl || activeOrder.listing?.imageUrls?.[0] || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80'}
                  alt={activeOrder.listing?.title || 'Game Account'}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-cyan-500/30 shrink-0 shadow-lg"
                />
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[10px] font-black uppercase tracking-wider">
                      {activeOrder.listing?.gameType?.toUpperCase() || 'GAME'}
                    </span>
                    <span className="text-xs text-slate-400">
                      {t('orders.seller')}: <strong className="text-white">{activeOrder.sellerName}</strong>
                    </span>
                  </div>
                  <h2 className="text-base sm:text-xl font-black text-white line-clamp-2">
                    {activeOrder.listing?.title || activeOrder.orderNumber}
                  </h2>
                  <div className="flex items-center gap-3 pt-1">
                    <div className="text-emerald-400 font-extrabold text-lg sm:text-xl">
                      {formatMMK(activeOrder.amountMMK)}
                    </div>
                    <span className="text-xs text-cyan-400/80 font-mono">
                      ≈ {formatTHB(convertMMKtoTHB(activeOrder.amountMMK))}
                    </span>
                  </div>
                </div>
              </div>

              {/* 24-Hour Inspection Badge */}
              <div className="bg-slate-950/80 border border-slate-700/80 rounded-2xl p-4 md:max-w-xs space-y-1.5 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <Clock className="w-4 h-4 animate-spin-slow" />
                  <span>{t('orders.inspectionTimer')}</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {t('orders.timerDesc')}
                </p>
              </div>
            </div>
          </div>

          {/* Escrow Room Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setRoomTab('credentials')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                roomTab === 'credentials'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Key className="w-4 h-4" />
              <span>{t('orders.credentialsTab')}</span>
            </button>

            <button
              onClick={() => setRoomTab('chat')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                roomTab === 'chat'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>{t('orders.chatTab')}</span>
              {activeOrder.chatMessages && activeOrder.chatMessages.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-slate-950 text-cyan-400 text-[10px] font-bold">
                  {activeOrder.chatMessages.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setRoomTab('timeline')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                roomTab === 'timeline'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{t('orders.timelineTab')}</span>
            </button>
          </div>

          {/* Active Tab Content */}
          {roomTab === 'credentials' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Credentials Card */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                          {isMM ? 'အကောင့်ဝင်ရောက်ခွင့် အချက်အလက်များ' : 'Decrypted Account Credentials'}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {isMM ? 'Escrow စနစ်ဖြင့် လုံခြုံစွာ ဝှက်စာဖြေပေးထားပါသည်' : 'Protected via GameZay Escrow Cryptography'}
                        </p>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 text-xs font-bold">
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
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                      <Clock className="w-8 h-8 text-amber-400 mx-auto animate-pulse" />
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {isMM ? 'ငွေလွှဲပြေစာ စစ်ဆေးနေပါသည်' : 'Payment Slip Under Verification'}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {isMM
                          ? 'Escrow အက်ဒမင်က KPay / WavePay ပြေစာ အတည်ပြုပြီးသည်နှင့် credentials များကို ဤနေရာတွင် ချက်ချင်း ဖွင့်ပြပေးပါမည်။'
                          : 'As soon as admin confirms your payment slip, credentials will unlock instantly here.'}
                      </p>
                    </div>
                  )}

                  {/* Actions for Active Inspection */}
                  {['ESCROW_LOCKED', 'CREDENTIALS_DISPATCHED', 'CREDENTIALS_DELIVERED', 'INSPECTION_PERIOD'].includes(activeOrder.status) && (
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <button
                        onClick={() => setIsDisputeModalOpen(true)}
                        className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <AlertOctagon className="w-4 h-4" />
                        <span>{t('orders.raiseDisputeBtn')}</span>
                      </button>

                      <button
                        onClick={() => handleConfirmRelease(activeOrder.id)}
                        className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20 transition cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>{t('orders.confirmReleaseBtn')}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar Summary Card */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    {isMM ? 'အော်ဒါ အနှစ်ချုပ်' : 'Trade Summary'}
                  </h4>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400">{t('orders.buyer')}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{activeOrder.buyerName}</span>
                    </div>

                    <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400">{t('orders.seller')}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{activeOrder.sellerName}</span>
                    </div>

                    <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400">{isMM ? 'ငွေပေးချေမှု' : 'Payment Method'}</span>
                      <span className="font-bold text-cyan-500">{activeOrder.paymentMethod}</span>
                    </div>

                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-400">{t('orders.totalAmount')}</span>
                      <span className="font-extrabold text-emerald-500">{formatMMK(activeOrder.amountMMK)}</span>
                    </div>
                  </div>
                </div>

                {/* Dispute Warning if applicable */}
                {activeOrder.status === 'DISPUTED' && (
                  <div className="bg-rose-500/10 border border-rose-500/30 rounded-3xl p-5 space-y-3">
                    <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                      <ShieldAlert className="w-5 h-5" />
                      <span>{isMM ? 'အငြင်းပွားမှု ဖြစ်ပွားနေသည်' : 'Dispute Case Active'}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {activeOrder.disputeInfo?.description || 'Escrow funds are safely frozen while admin investigates credentials.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3-Party Live Chat Tab */}
          {roomTab === 'chat' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
              <ThreePartyLiveChat
                order={activeOrder}
                currentRole={currentRole}
                onSendMessage={onSendMessage}
              />
            </div>
          )}

          {/* Escrow Timeline Tab */}
          {roomTab === 'timeline' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6">
                {t('orders.timelineTab')}
              </h3>

              <div className="space-y-6 relative pl-6 border-l-2 border-slate-200 dark:border-slate-800">
                {[
                  {
                    title: isMM ? '၁။ ငွေပေးချေမှု အတည်ပြုခြင်း' : '1. Escrow Payment Received',
                    desc: isMM ? 'ဝယ်သူ၏ ငွေလွှဲပြေစာကို အက်ဒမင်မှ စစ်ဆေး၍ Vault တွင် လုံခြုံစွာ ထိန်းသိမ်းထားရှိပါသည်။' : 'Buyer submitted payment slip verified by Escrow Admin.',
                    done: true,
                  },
                  {
                    title: isMM ? '၂။ အကောင့်ဝင်ရောက်ခွင့် လွှဲပြောင်းခြင်း' : '2. Credentials Dispatched',
                    desc: isMM ? 'ရောင်းသူ၏ Encrypted Login ID နှင့် Password ကို ဝယ်သူထံသို့ ဖွင့်ပြပေးထားပါသည်။' : 'Confidential credentials decrypted & delivered to Buyer.',
                    done: ['ESCROW_LOCKED', 'CREDENTIALS_DELIVERED', 'INSPECTION_PERIOD', 'COMPLETED'].includes(activeOrder.status),
                  },
                  {
                    title: isMM ? '၃။ ဝယ်သူ ၂၄ နာရီ စစ်ဆေးချိန်' : '3. 24h Buyer Inspection Window',
                    desc: isMM ? 'ဝယ်သူသည် ဂိမ်းထဲသို့ ဝင်ရောက်၍ Skins/Rank များကို စစ်ဆေးအတည်ပြုရန် အချိန် ၂၄ နာရီ ရရှိပါသည်။' : 'Buyer checks in-game inventory & binds personal security recovery.',
                    done: ['CREDENTIALS_DELIVERED', 'INSPECTION_PERIOD', 'COMPLETED'].includes(activeOrder.status),
                  },
                  {
                    title: isMM ? '၄။ ရောင်းသူထံ ငွေထုတ်ပေးခြင်း' : '4. Seller Payout Release',
                    desc: isMM ? 'ဝယ်သူ စစ်ဆေးပြီး အတည်ပြုပါက သို့မဟုတ် ၂၄ နာရီပြည့်ပါက ရောင်းသူထံသို့ ငွေထုတ်ပေးပါသည်။' : 'Escrow Vault automatically dispatches payout to seller wallet.',
                    done: activeOrder.status === 'COMPLETED',
                  },
                ].map((step, idx) => (
                  <div key={idx} className="relative">
                    <div className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 ${
                      step.done
                        ? 'bg-emerald-500 border-emerald-400 ring-4 ring-emerald-500/20'
                        : 'bg-slate-300 dark:bg-slate-700 border-slate-400 dark:border-slate-600'
                    }`} />
                    <h4 className={`text-xs font-bold ${step.done ? 'text-emerald-500' : 'text-slate-500'}`}>
                      {step.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Orders Master List View */
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

          {/* 2. Sub-Filter Tabs (Horizontal Scrollable Pills Layout) */}
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
                    onClick={() => setSelectedOrderId(order.id)}
                    className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 rounded-3xl p-4 sm:p-5 shadow-sm hover:shadow-lg transition duration-200 cursor-pointer flex flex-col justify-between space-y-4"
                  >
                    {/* Top Row: Thumbnail + Title + Status */}
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
                        {/* Status Badge */}
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

                        {/* Listing Title as Main Title */}
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-cyan-500 transition leading-snug">
                          {order.listing?.title || `${order.listing?.gameType?.toUpperCase()} Verified Account`}
                        </h3>

                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {t('orders.seller')}: <span className="font-semibold text-slate-700 dark:text-slate-300">{order.sellerName}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row: Price & CTA Button */}
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

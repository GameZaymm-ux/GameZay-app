import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { EscrowOrder, ChatMessage, EscrowStatus } from '../types';
import {
  ArrowLeft,
  Key,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  Lock,
  User,
  Phone,
  DollarSign,
  Info,
  Sparkles,
  Check,
  AlertOctagon,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  MessageSquare,
  ShieldAlert,
  Coins,
  History,
  Shield,
  Activity,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { ThreePartyLiveChat } from './ThreePartyLiveChat';
import confetti from 'canvas-confetti';

interface SellerEscrowRoomProps {
  order: EscrowOrder;
  onBack: () => void;
  onDeliverCredentials: (
    orderId: string,
    credentials: NonNullable<EscrowOrder['credentials']>
  ) => void;
  onSendMessage: (
    orderId: string,
    message: Omit<ChatMessage, 'id' | 'createdAt' | 'orderId'>
  ) => void;
  onOpenDispute: (
    orderId: string,
    reason: string,
    description: string,
    proofUrls?: string[]
  ) => void;
  onGoToWallet?: () => void;
}

export type SellerRoomSubTab = 'status_action' | 'live_chat' | 'credentials';

export const SellerEscrowRoom: React.FC<SellerEscrowRoomProps> = ({
  order,
  onBack,
  onDeliverCredentials,
  onSendMessage,
  onOpenDispute,
  onGoToWallet,
}) => {
  const { t, formatMMK, formatTHB, convertMMKtoTHB, isMM } = useLanguage();

  // Active Inner Sub-Tab State
  const [activeSubTab, setActiveSubTab] = useState<SellerRoomSubTab>('status_action');

  // Track chat messages count to compute unread / new message badges
  const [lastReadChatCount, setLastReadChatCount] = useState<number>(
    order.chatMessages?.length || 0
  );

  const currentMessageCount = order.chatMessages?.length || 0;
  const unreadMessagesCount = Math.max(0, currentMessageCount - lastReadChatCount);

  const handleTabChange = (tab: SellerRoomSubTab) => {
    setActiveSubTab(tab);
    if (tab === 'live_chat') {
      setLastReadChatCount(currentMessageCount);
    }
  };

  // Credentials Submission Form State
  const [loginId, setLoginId] = useState(
    order.credentials?.loginId || order.listing?.credentialPreview?.maskedLogin || ''
  );
  const [password, setPassword] = useState(
    order.credentials?.password || ''
  );
  const [authType, setAuthType] = useState(
    order.credentials?.authType || order.listing?.credentialPreview?.authType || 'Moonton / Konami Direct'
  );
  const [backupCodes, setBackupCodes] = useState(
    order.credentials?.backupCodes || order.listing?.credentialPreview?.backupCodes || ''
  );
  const [transferNotes, setTransferNotes] = useState(
    order.credentials?.transferNotes || order.listing?.credentialPreview?.notes || 'Clean account. Please change password and link your phone.'
  );

  // Password visibility & Copy state for Credentials Tab
  const [showPassword, setShowPassword] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Dispute Modal State
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('Buyer Unresponsive / Stalling');
  const [disputeDetails, setDisputeDetails] = useState('');

  // Simulated 24-hour countdown state for inspection period
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 23,
    minutes: 42,
    seconds: 18,
  });

  useEffect(() => {
    if (
      order.status === 'CREDENTIALS_DISPATCHED' ||
      order.status === 'CREDENTIALS_DELIVERED' ||
      order.status === 'INSPECTION_PERIOD'
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
  }, [order.status]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDeliverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId.trim() || !password.trim()) {
      alert(isMM ? 'ကျေးဇူးပြု၍ Login ID နှင့် Password ထည့်သွင်းပေးပါ' : 'Please provide Login ID and Password');
      return;
    }

    onDeliverCredentials(order.id, {
      loginId,
      password,
      authType,
      backupCodes,
      transferNotes,
    });

    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleRaiseDisputeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeDetails.trim()) {
      alert(isMM ? 'ကျေးဇူးပြု၍ အငြင်းပွားမှု အကြောင်းပြချက်ကို အသေးစိတ် ရေးသားပေးပါ' : 'Please provide dispute details');
      return;
    }

    onOpenDispute(order.id, disputeReason, disputeDetails);
    setIsDisputeModalOpen(false);
    setDisputeDetails('');
  };

  const isInspectionActive = [
    'CREDENTIALS_DISPATCHED',
    'CREDENTIALS_DELIVERED',
    'INSPECTION_PERIOD',
  ].includes(order.status);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* ======================================================== */}
      {/* 1. COMPACT STICKY TOP BAR HEADER                         */}
      {/* ======================================================== */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left: Back button + Listing info */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onBack}
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold shrink-0"
              title={t('sellerStudio.escrowRoom.backToSales')}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{t('sellerStudio.escrowRoom.backToSales')}</span>
            </button>

            <img
              src={
                order.listing?.imageUrls?.[0] ||
                'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80'
              }
              alt={order.listing?.title}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
            />

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {order.listing?.gameType || 'GAMING'}
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">
                  #{order.orderNumber}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden md:inline-flex items-center gap-1">
                  <User className="w-3 h-3 text-emerald-500" />
                  <span>Buyer: <strong className="text-slate-800 dark:text-slate-200">{order.buyerName}</strong></span>
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
                {order.listing?.title}
              </h2>
            </div>
          </div>

          {/* Right: Escrow Amount & Status Badge */}
          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
            <div className="text-left sm:text-right">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                {t('sellerStudio.escrowRoom.escrowAmount')}
              </div>
              <div className="text-base sm:text-lg font-black font-mono text-emerald-500">
                {formatMMK(order.amountMMK)}
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                ≈ {formatTHB(convertMMKtoTHB(order.amountMMK))}
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <span
                className={`px-3 py-1 rounded-2xl text-xs font-black tracking-wide border shadow-sm flex items-center gap-1.5 ${
                  order.status === 'COMPLETED'
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                    : order.status === 'DISPUTED'
                    ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                    : order.status === 'ESCROW_LOCKED'
                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/30 animate-pulse'
                    : 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${
                  order.status === 'COMPLETED' ? 'bg-emerald-500' :
                  order.status === 'DISPUTED' ? 'bg-rose-500' : 'bg-amber-400 animate-ping'
                }`} />
                <span>{order.status}</span>
              </span>

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

        {/* ======================================================== */}
        {/* 2. INNER SUB-TAB NAVIGATION (3 TABS)                     */}
        {/* ======================================================== */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar">
          {/* Sub-Tab 1: Status & Action */}
          <button
            onClick={() => handleTabChange('status_action')}
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'status_action'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-black shadow-emerald-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{t('sellerStudio.escrowRoom.subTabs.statusAction')}</span>
            {order.status === 'ESCROW_LOCKED' && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </button>

          {/* Sub-Tab 2: Live Chat with Unread Badge */}
          <button
            onClick={() => handleTabChange('live_chat')}
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl text-xs font-bold transition cursor-pointer relative ${
              activeSubTab === 'live_chat'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-black shadow-emerald-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>{t('sellerStudio.escrowRoom.subTabs.liveChat')}</span>
            {currentMessageCount > 0 && (
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  activeSubTab === 'live_chat'
                    ? 'bg-slate-950 text-emerald-400'
                    : 'bg-emerald-500 text-slate-950'
                }`}
              >
                {currentMessageCount}
              </span>
            )}
            {unreadMessagesCount > 0 && activeSubTab !== 'live_chat' && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
            )}
          </button>

          {/* Sub-Tab 3: Credentials & Vault */}
          <button
            onClick={() => handleTabChange('credentials')}
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'credentials'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-black shadow-emerald-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>{t('sellerStudio.escrowRoom.subTabs.credentials')}</span>
            {order.credentials && (
              <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                ✓
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. SUB-TAB CONTENT CONTAINERS                             */}
      {/* ======================================================== */}

      {/* -------------------------------------------------------- */}
      {/* SUB-TAB 1: STATUS & ACTION                               */}
      {/* -------------------------------------------------------- */}
      {activeSubTab === 'status_action' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Milestones Timeline */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                <span>Deal Milestones & Escrow Timeline</span>
              </h3>

              {order.status !== 'COMPLETED' && order.status !== 'REFUNDED' && (
                <button
                  onClick={() => setIsDisputeModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-bold transition flex items-center gap-1 cursor-pointer border border-rose-200 dark:border-rose-800/60"
                >
                  <AlertOctagon className="w-3.5 h-3.5" />
                  <span>{t('sellerStudio.escrowRoom.raiseDisputeBtn')}</span>
                </button>
              )}
            </div>

            {/* Step Progress Pills */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              {[
                {
                  step: '1. Payment Locked',
                  desc: 'Buyer slip audited in vault',
                  done: true,
                  active: order.status === 'PAYMENT_VERIFYING',
                },
                {
                  step: '2. Handover Credentials',
                  desc: 'Seller delivers login info',
                  done: ['CREDENTIALS_DISPATCHED', 'CREDENTIALS_DELIVERED', 'INSPECTION_PERIOD', 'COMPLETED'].includes(order.status),
                  active: order.status === 'ESCROW_LOCKED',
                },
                {
                  step: '3. 24h Buyer Inspection',
                  desc: 'In-game specs verification',
                  done: order.status === 'COMPLETED',
                  active: isInspectionActive,
                },
                {
                  step: '4. Payout Released',
                  desc: 'Credited to seller wallet',
                  done: order.status === 'COMPLETED',
                  active: order.status === 'COMPLETED',
                },
              ].map((m, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border transition ${
                    m.done
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-slate-900 dark:text-white'
                      : m.active
                      ? 'bg-amber-500/10 border-amber-500/40 text-slate-900 dark:text-white shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    {m.done ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : m.active ? (
                      <Clock className="w-4 h-4 text-amber-500 shrink-0 animate-spin" />
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
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  {t('sellerStudio.escrowRoom.actionBoxTitle')}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Seller Escrow Actions & Next Steps
                </p>
              </div>
            </div>

            {/* STAGE 1: Payment Verifying */}
            {(order.status === 'PENDING_PAYMENT_PROOF' || order.status === 'PAYMENT_VERIFYING') && (
              <div className="p-4.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-200 space-y-3 animate-in fade-in">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-black">
                      {t('sellerStudio.escrowRoom.stagePaymentVerifyingTitle')}
                    </h4>
                    <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-1 leading-relaxed">
                      {t('sellerStudio.escrowRoom.stagePaymentVerifyingDesc')}
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/40 text-xs font-medium space-y-1">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold">
                    <Lock className="w-3.5 h-3.5 text-amber-500" />
                    <span>Next step: GameZay Admin verifies payment slip</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Once payment verification completes, the credentials form below will unlock for immediate handover.
                  </p>
                </div>
              </div>
            )}

            {/* STAGE 2: Awaiting Credentials / Escrow Locked */}
            {order.status === 'ESCROW_LOCKED' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 text-emerald-900 dark:text-emerald-200">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-black">
                        {t('sellerStudio.escrowRoom.stageAwaitingCredsTitle')}
                      </h4>
                      <p className="text-[11px] text-emerald-800 dark:text-emerald-300 mt-1 leading-relaxed">
                        {t('sellerStudio.escrowRoom.stageAwaitingCredsDesc')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form to submit credentials */}
                <form onSubmit={handleDeliverSubmit} className="space-y-3.5 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Key className="w-4 h-4 text-emerald-500" />
                    <span>{t('sellerStudio.escrowRoom.credsFormTitle')}</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        {t('sellerStudio.escrowRoom.loginIdLabel')}
                      </label>
                      <input
                        type="text"
                        value={loginId}
                        onChange={(e) => setLoginId(e.target.value)}
                        placeholder="e.g. seller_game_id / email@domain.com"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        {t('sellerStudio.escrowRoom.passwordLabel')}
                      </label>
                      <input
                        type="text"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="e.g. GamePassword#2026"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        {t('sellerStudio.escrowRoom.authTypeLabel')}
                      </label>
                      <input
                        type="text"
                        value={authType}
                        onChange={(e) => setAuthType(e.target.value)}
                        placeholder="e.g. Moonton Clean / Konami Linked"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        {t('sellerStudio.escrowRoom.backupCodesLabel')}
                      </label>
                      <input
                        type="text"
                        value={backupCodes}
                        onChange={(e) => setBackupCodes(e.target.value)}
                        placeholder="e.g. 849204, 294021"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      {t('sellerStudio.escrowRoom.transferNotesLabel')}
                    </label>
                    <textarea
                      value={transferNotes}
                      onChange={(e) => setTransferNotes(e.target.value)}
                      rows={2}
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Key className="w-4 h-4" />
                    <span>{t('sellerStudio.escrowRoom.submitCredsBtn')}</span>
                  </button>
                </form>
              </div>
            )}

            {/* STAGE 3: Credentials Delivered / Inspection Period (24h Window) */}
            {isInspectionActive && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-500/10 via-slate-50 to-emerald-500/10 dark:from-cyan-950/40 dark:via-slate-950 dark:to-emerald-950/40 border border-cyan-500/30 space-y-4 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-500">
                      <Clock className="w-5 h-5 animate-spin text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white">
                        {t('sellerStudio.escrowRoom.stageInspectionTitle')}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {t('sellerStudio.escrowRoom.buyerViewedAt')}{' '}
                        <strong className="text-slate-700 dark:text-slate-200">
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </strong>
                      </p>
                    </div>
                  </div>

                  {/* 24-Hour Timer Clock */}
                  <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-cyan-500/30 shadow-sm font-mono font-black text-cyan-600 dark:text-cyan-400 text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {String(timeLeft.hours).padStart(2, '0')}:
                      {String(timeLeft.minutes).padStart(2, '0')}:
                      {String(timeLeft.seconds).padStart(2, '0')}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t('sellerStudio.escrowRoom.stageInspectionDesc')}
                </p>

                <div className="pt-2 flex items-center justify-between border-t border-cyan-500/20">
                  <button
                    onClick={() => setActiveSubTab('credentials')}
                    className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <span>View Delivered Vault Record</span>
                    <Key className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setActiveSubTab('live_chat')}
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <span>Chat with Buyer & Arbiter</span>
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STAGE 4: Completed */}
            {order.status === 'COMPLETED' && (
              <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 space-y-4 animate-in fade-in">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-500">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black">
                      {t('sellerStudio.escrowRoom.stageCompletedTitle')}
                    </h4>
                    <p className="text-[11px] text-emerald-800 dark:text-emerald-300 mt-1 leading-relaxed">
                      {t('sellerStudio.escrowRoom.stageCompletedDesc')}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-emerald-200 dark:border-emerald-800">
                  <div className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300">
                    Total Released: {formatMMK(order.amountMMK)}
                  </div>
                  {onGoToWallet && (
                    <button
                      onClick={onGoToWallet}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow transition cursor-pointer"
                    >
                      Go to Payout Wallet
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* STAGE 5: Disputed */}
            {order.status === 'DISPUTED' && (
              <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200 space-y-3 animate-in fade-in">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-black">
                      {t('sellerStudio.escrowRoom.stageDisputedTitle')}
                    </h4>
                    <p className="text-[11px] text-rose-800 dark:text-rose-300 mt-1 leading-relaxed">
                      {t('sellerStudio.escrowRoom.stageDisputedDesc')}
                    </p>
                  </div>
                </div>

                {order.disputeInfo && (
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 text-xs space-y-1 text-slate-800 dark:text-slate-200">
                    <div>
                      <strong>Claim Reason:</strong> {order.disputeInfo.reason}
                    </div>
                    <div>
                      <strong>Description:</strong> {order.disputeInfo.description}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setActiveSubTab('live_chat')}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition"
                >
                  Join 3-Party Dispute Resolution Chat
                </button>
              </div>
            )}
          </div>

          {/* Buyer Profile & Order Snapshot Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-500" />
              <span>{t('sellerStudio.escrowRoom.buyerInfo')}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 text-xs space-y-1">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Buyer Name</div>
                <div className="font-bold text-slate-900 dark:text-white">{order.buyerName}</div>
                <div className="text-[11px] text-emerald-500 font-mono flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Escrow Verified Buyer</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 text-xs space-y-1">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Payment Channel</div>
                <div className="font-bold text-slate-900 dark:text-white font-mono">{order.paymentMethod}</div>
                <div className="text-[11px] text-slate-400 font-mono">
                  TxID: {order.transactionId || 'GZ-TX-99482'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------- */}
      {/* SUB-TAB 2: LIVE CHAT (DEDICATED 3-PARTY CHAT)            */}
      {/* -------------------------------------------------------- */}
      {activeSubTab === 'live_chat' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl min-h-[580px] animate-in fade-in duration-200">
          <ThreePartyLiveChat
            order={order}
            currentRole="SELLER"
            currentUserRole="SELLER"
            onSendMessage={onSendMessage}
          />
        </div>
      )}

      {/* -------------------------------------------------------- */}
      {/* SUB-TAB 3: CREDENTIALS & SECURE VAULT RECORD             */}
      {/* -------------------------------------------------------- */}
      {activeSubTab === 'credentials' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Encrypted Vault Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500">
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
                {order.credentials?.authType || order.listing?.credentialPreview?.authType || 'PROTECTED'}
              </span>
            </div>

            {order.credentials ? (
              <div className="space-y-4">
                {/* Login ID */}
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      {t('sellerStudio.escrowRoom.loginIdLabel')}
                    </label>
                    <span className="text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-white select-all">
                      {order.credentials.loginId}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(order.credentials!.loginId, 'login')}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-emerald-500 hover:text-slate-950 text-xs font-bold transition flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    {copiedKey === 'login' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'login' ? t('orders.copied') : t('orders.copy')}</span>
                  </button>
                </div>

                {/* Password */}
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      {t('sellerStudio.escrowRoom.passwordLabel')}
                    </label>
                    <span className="text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-white select-all">
                      {showPassword ? order.credentials.password : '••••••••••••••••'}
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
                      onClick={() => handleCopy(order.credentials!.password, 'pass')}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-emerald-500 hover:text-slate-950 text-xs font-bold transition flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 cursor-pointer"
                    >
                      {copiedKey === 'pass' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'pass' ? t('orders.copied') : t('orders.copy')}</span>
                    </button>
                  </div>
                </div>

                {/* Backup Codes / 2FA */}
                {order.credentials.backupCodes && (
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        {t('sellerStudio.escrowRoom.backupCodesLabel')}
                      </label>
                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-white select-all">
                        {order.credentials.backupCodes}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(order.credentials!.backupCodes!, 'codes')}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-emerald-500 hover:text-slate-950 text-xs font-bold transition flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 cursor-pointer"
                    >
                      {copiedKey === 'codes' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'codes' ? t('orders.copied') : t('orders.copy')}</span>
                    </button>
                  </div>
                )}

                {/* Transfer Notes */}
                {order.credentials.transferNotes && (
                  <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl space-y-1">
                    <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{t('sellerStudio.escrowRoom.transferNotesLabel')}</span>
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {order.credentials.transferNotes}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <Key className="w-10 h-10 text-amber-400 mx-auto animate-pulse" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  {t('sellerStudio.escrowRoom.credentialsVault.notDeliveredYet')}
                </h4>
                <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                  {t('sellerStudio.escrowRoom.credentialsVault.notDeliveredDesc')}
                </p>
                {order.status === 'ESCROW_LOCKED' && (
                  <button
                    onClick={() => setActiveSubTab('status_action')}
                    className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-md transition"
                  >
                    Go to Status & Action to Deliver
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Time Tracker & Access Audit Logs */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-500" />
              <span>{t('sellerStudio.escrowRoom.credentialsVault.accessLogs')}</span>
            </h4>

            <div className="space-y-3 relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 text-xs">
              <div className="relative">
                <div className="w-3 h-3 rounded-full bg-emerald-500 absolute -left-[31px] top-1" />
                <div className="font-bold text-slate-900 dark:text-white">
                  {t('sellerStudio.escrowRoom.credentialsVault.orderCreatedLog')}
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {new Date(order.createdAt).toLocaleString()}
                </div>
              </div>

              {order.status !== 'PENDING_PAYMENT_PROOF' && order.status !== 'PAYMENT_VERIFYING' && (
                <div className="relative">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 absolute -left-[31px] top-1" />
                  <div className="font-bold text-slate-900 dark:text-white">
                    {t('sellerStudio.escrowRoom.credentialsVault.dispatchedLog')}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Escrow Vault Verified & Sealed
                  </div>
                </div>
              )}

              {isInspectionActive && (
                <div className="relative">
                  <div className="w-3 h-3 rounded-full bg-cyan-500 absolute -left-[31px] top-1 animate-ping" />
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-cyan-500" />
                    <span>{t('sellerStudio.escrowRoom.credentialsVault.viewedLog')}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Buyer decrypted credentials • 24h timer started
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. SELLER DISPUTE MODAL                                  */}
      {/* ======================================================== */}
      {isDisputeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
                  <AlertOctagon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    {t('sellerStudio.escrowRoom.disputeModalTitle')}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Alert GameZay Arbiter to arbitrate uncooperative buyer
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDisputeModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleRaiseDisputeSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('sellerStudio.escrowRoom.disputeReason')}
                </label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-rose-500"
                >
                  <option value="Buyer Unresponsive / Stalling">Buyer Unresponsive / Stalling</option>
                  <option value="False Claim on Account Specs">False Claim on Account Specs</option>
                  <option value="Buyer Demands Off-Platform Contact">Buyer Demands Off-Platform Contact</option>
                  <option value="Malicious Account Modification Attempt">Malicious Account Modification Attempt</option>
                  <option value="Other Policy Violation">Other Policy Violation</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('sellerStudio.escrowRoom.disputeDetails')}
                </label>
                <textarea
                  value={disputeDetails}
                  onChange={(e) => setDisputeDetails(e.target.value)}
                  rows={4}
                  placeholder="Provide precise details, time of delivery, and why arbiter intervention is needed..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDisputeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black shadow-lg shadow-rose-600/30 transition cursor-pointer"
                >
                  {t('sellerStudio.escrowRoom.confirmDisputeBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

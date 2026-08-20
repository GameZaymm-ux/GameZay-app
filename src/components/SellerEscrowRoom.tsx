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
  Copy,
  ExternalLink,
  MessageSquare,
  ShieldAlert,
  Coins,
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

export const SellerEscrowRoom: React.FC<SellerEscrowRoomProps> = ({
  order,
  onBack,
  onDeliverCredentials,
  onSendMessage,
  onOpenDispute,
  onGoToWallet,
}) => {
  const { t, formatMMK, formatTHB, convertMMKtoTHB, isMM } = useLanguage();

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

  // Dispute Modal State
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('Buyer Unresponsive / Stalling');
  const [disputeDetails, setDisputeDetails] = useState('');
  const [isCopied, setIsCopied] = useState(false);

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
      particleCount: 70,
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

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer flex items-center gap-1 text-xs font-bold"
            title={t('sellerStudio.escrowRoom.backToSales')}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{t('sellerStudio.escrowRoom.backToSales')}</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {order.listing?.gameType || 'GAMING'}
              </span>
              <span className="text-xs font-mono font-bold text-slate-400">
                #{order.orderNumber}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white line-clamp-1">
              {order.listing?.title}
            </h2>
          </div>
        </div>

        {/* Amount & Status Badge */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          <div className="text-right">
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              {t('sellerStudio.escrowRoom.escrowAmount')}
            </div>
            <div className="text-base sm:text-lg font-black font-mono text-emerald-500">
              {formatMMK(order.amountMMK)}
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              ≈ {formatTHB(convertMMKtoTHB(order.amountMMK))}
            </div>
          </div>

          <span
            className={`px-3 py-1.5 rounded-2xl text-xs font-black tracking-wide border shadow-sm ${
              order.status === 'COMPLETED'
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                : order.status === 'DISPUTED'
                ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                : 'bg-amber-500/10 text-amber-500 border-amber-500/30 animate-pulse'
            }`}
          >
            {order.status}
          </span>
        </div>
      </div>

      {/* Grid: Left (Action Box & Buyer Card) | Right (3-Party Live Chat) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Seller Perspective Action Box & Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Dynamic Seller Perspective Action Box */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    {t('sellerStudio.escrowRoom.actionBoxTitle')}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Seller Escrow Workflow & Credentials Dispatch
                  </p>
                </div>
              </div>

              {/* Dispute Trigger Button */}
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
                    Once payment verification completes, the credentials form below will be unlocked for immediate delivery.
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
            {(order.status === 'CREDENTIALS_DISPATCHED' ||
              order.status === 'CREDENTIALS_DELIVERED' ||
              order.status === 'INSPECTION_PERIOD') && (
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

                {/* Delivered Credentials Summary */}
                {order.credentials && (
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Delivered Credentials Summary (Encrypted in Escrow Vault)
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300 font-mono">
                      <div>
                        <span className="text-slate-400 font-normal">Login ID:</span> {order.credentials.loginId}
                      </div>
                      <div>
                        <span className="text-slate-400 font-normal">Password:</span> ••••••••
                      </div>
                    </div>
                  </div>
                )}
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
              </div>
            )}
          </div>

          {/* 2. Buyer Profile & Order Snapshot Card */}
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

        {/* Right Column (5 cols): Embedded 3-Party Live Chat */}
        <div className="lg:col-span-5 h-[650px] sticky top-24">
          <ThreePartyLiveChat
            order={order}
            currentRole="SELLER"
            currentUserRole="SELLER"
            onSendMessage={onSendMessage}
          />
        </div>
      </div>

      {/* Seller Dispute Modal */}
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

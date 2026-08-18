import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ChatMessage, DisputeInfo, EscrowOrder, EscrowStatus, UserRole } from '../types';
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
  Send,
  MessageSquare,
  FileText,
  UserCheck,
  RefreshCw,
  AlertTriangle,
  UploadCloud,
  Image as ImageIcon,
  ExternalLink,
  Lock,
  X,
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

export const EscrowOrderTracker: React.FC<EscrowOrderTrackerProps> = ({
  orders,
  selectedOrderId,
  setSelectedOrderId,
  onUpdateOrderStatus,
  onOpenDispute,
  onSendMessage,
  currentRole = 'BUYER',
}) => {
  const { t, formatMMK, formatUSDT, isMM } = useLanguage();

  const [showPassword, setShowPassword] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Dispute Modal State
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('Invalid Credentials / Login မရပါ');
  const [disputeDesc, setDisputeDesc] = useState('');
  const [disputeProofs, setDisputeProofs] = useState<string[]>([
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
  ]);
  const [activeTab, setActiveTab] = useState<'credentials' | 'chat'>('credentials');

  const currentOrder =
    orders.find((o) => o.id === selectedOrderId) || (orders.length > 0 ? orders[0] : null);

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
    if (!currentOrder) return;
    onOpenDispute(
      currentOrder.id,
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

  const sampleProofOptions = [
    {
      title: isMM ? 'စကားဝှက် အမှား Screenshot' : 'Wrong Password Error',
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: isMM ? 'Squad/Skin မပြည့်စုံမှု' : 'Missing Squad / Skin Proof',
      url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: isMM ? 'အကောင့်ပိတ်သိမ်းမှု သတိပေးချက်' : 'Account Suspended Error',
      url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=80',
    },
  ];

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center mx-auto mb-4 text-cyan-500">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
          {isMM ? 'လက်ရှိ Escrow အော်ဒါ မရှိသေးပါ' : 'No Active Escrow Orders'}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          {isMM
            ? 'စျေးကွက်မှ အကောင့်တစ်ခုကို ရွေးချယ်ပြီး Escrow စနစ်ဖြင့် စိတ်ချစွာ ဝယ်ယူနိုင်ပါသည်'
            : 'Browse the marketplace to place an escrow-protected order.'}
        </p>
      </div>
    );
  }

  if (!currentOrder) return null;

  const isCredentialsAccessible =
    currentOrder.status === 'ESCROW_LOCKED' ||
    currentOrder.status === 'CREDENTIALS_DISPATCHED' ||
    currentOrder.status === 'INSPECTION_PERIOD' ||
    currentOrder.status === 'COMPLETED' ||
    currentOrder.status === 'DISPUTED';

  const isDisputed = currentOrder.status === 'DISPUTED';
  const isRefunded = currentOrder.status === 'REFUNDED';
  const isCompleted = currentOrder.status === 'COMPLETED';

  return (
    <div className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Title & Order Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono text-xs font-bold border border-emerald-300 dark:border-emerald-500/30">
              ESCROW ROOM
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              #{currentOrder.orderNumber}
            </span>
          </div>
          <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            {currentOrder.listing.title}
          </h2>
        </div>

        {/* Order Selector pills if multiple */}
        {orders.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
            <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">
              {isMM ? 'အော်ဒါများ:' : 'Orders:'}
            </span>
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
              {orders.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setSelectedOrderId(o.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition shrink-0 cursor-pointer ${
                    o.id === currentOrder.id
                      ? 'bg-cyan-500 text-slate-950 shadow'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {o.orderNumber.split('-')[2]}
                  {o.status === 'DISPUTED' && (
                    <span className="ml-1.5 w-2 h-2 rounded-full bg-rose-500 inline-block animate-ping" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* DISPUTE WARNING ALERT BANNER (If status is DISPUTED) */}
      {isDisputed && (
        <div className="p-4 sm:p-5 rounded-3xl bg-rose-50 dark:bg-rose-950/50 border-2 border-rose-400 dark:border-rose-500/60 shadow-lg shadow-rose-500/10 animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-500 text-white shrink-0 shadow-md">
                <AlertOctagon className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm sm:text-base font-black text-rose-900 dark:text-rose-200">
                    {isMM ? 'အငြင်းပွားမှု စစ်ဆေးနေပါသည် (Escrow ငွေထိန်းချုပ်ထားသည်)' : 'Escrow Dispute Active — Funds Frozen in Vault'}
                  </h4>
                  <span className="px-2 py-0.5 rounded bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-200 text-[10px] font-bold">
                    Admin Active
                  </span>
                </div>
                <p className="text-xs text-rose-800 dark:text-rose-300/90 leading-relaxed">
                  {currentOrder.disputeInfo?.reason || 'Invalid Credentials / Account Mismatch'} —{' '}
                  <span className="text-rose-900 dark:text-rose-100 font-semibold">
                    {currentOrder.disputeInfo?.description || 'Case is currently under administrative audit.'}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <span className="text-xs font-mono font-bold text-rose-700 dark:text-rose-300">
                Frozen: {formatMMK(currentOrder.amountMMK)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* REFUNDED ALERT BANNER */}
      {isRefunded && (
        <div className="p-4 sm:p-5 rounded-3xl bg-blue-50 dark:bg-blue-950/50 border-2 border-blue-400 dark:border-blue-500/60 shadow-lg animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-500 text-white shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-black text-blue-900 dark:text-blue-200">
                {isMM ? 'အော်ဒါ ငွေပြန်အမ်းပြီးပါပြီ' : 'Order Refunded to Buyer'}
              </h4>
              <p className="text-xs text-blue-800 dark:text-blue-300">
                {isMM
                  ? 'အငြင်းပွားမှု စစ်ဆေးချက်အရ Escrow ငွေကို ဝယ်သူ၏ ပိုက်ဆံအိတ်ထံ ပြန်လည်လွှဲပြောင်းပေးပြီးပါပြီ'
                  : 'Escrow funds have been credited back to Buyer’s wallet following dispute verdict.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4-Step Interactive Progress Bar */}
      <div className="w-full bg-white dark:bg-slate-900/90 rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xl transition-colors">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 sm:mb-6 flex items-center justify-between">
          <span>{t('orderTracker.status')}</span>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold ${
              isCompleted
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/40'
                : isDisputed
                ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-400 border border-rose-300 dark:border-rose-500/40'
                : isRefunded
                ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-400 border border-blue-300 dark:border-blue-500/40'
                : 'bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-500/40 animate-pulse'
            }`}
          >
            {currentOrder.status === 'PAYMENT_VERIFYING' && t('orderTracker.statusPendingPayment')}
            {currentOrder.status === 'ESCROW_LOCKED' && t('orderTracker.statusInEscrow')}
            {currentOrder.status === 'CREDENTIALS_DISPATCHED' && t('orderTracker.statusCredentialsDelivered')}
            {isCompleted && t('orderTracker.statusCompleted')}
            {isDisputed && t('orderTracker.statusDisputed')}
            {isRefunded && t('orderTracker.statusRefunded')}
          </span>
        </h3>

        {/* Steps Line */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 relative">
          {/* Step 1 */}
          <div
            className={`p-4 rounded-2xl border transition ${
              currentOrder.status !== 'PENDING_PAYMENT_PROOF'
                ? 'bg-slate-50 dark:bg-slate-950 border-emerald-400 dark:border-emerald-500/40'
                : 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center">
                ✓
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {t('orderTracker.timelineStep1')}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {formatMMK(currentOrder.amountMMK)} via {currentOrder.paymentMethod}
            </p>
          </div>

          {/* Step 2 */}
          <div
            className={`p-4 rounded-2xl border transition ${
              isCredentialsAccessible
                ? 'bg-slate-50 dark:bg-slate-950 border-emerald-400 dark:border-emerald-500/40'
                : 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className={`w-5 h-5 rounded-full font-bold text-xs flex items-center justify-center ${
                  isCredentialsAccessible
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                }`}
              >
                2
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {t('orderTracker.timelineStep2')}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {isCredentialsAccessible
                ? isMM ? 'လျှို့ဝှက်ကုဒ် ပို့ပေးပြီး' : 'Login details unsealed'
                : isMM ? 'ငွေလွှဲစစ်ဆေးပြီးပါက ပွင့်မည်' : 'Locked until escrow verify'}
            </p>
          </div>

          {/* Step 3 */}
          <div
            className={`p-4 rounded-2xl border transition ${
              isDisputed
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 dark:border-rose-500/60'
                : isCredentialsAccessible && !isCompleted && !isRefunded
                ? 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-400 dark:border-cyan-500/40'
                : isCompleted
                ? 'bg-slate-50 dark:bg-slate-950 border-emerald-400 dark:border-emerald-500/40'
                : 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className={`w-5 h-5 rounded-full font-bold text-xs flex items-center justify-center ${
                  isDisputed
                    ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                    : isCompleted
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    : isCredentialsAccessible
                    ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                }`}
              >
                3
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {isDisputed
                  ? isMM ? 'အငြင်းပွားမှု စစ်ဆေးချိန်' : 'Dispute Under Review'
                  : t('orderTracker.timelineStep3')}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {isDisputed
                ? isMM ? 'ငွေလော့ခ်ချထားသည်' : 'Escrow frozen by admin'
                : isMM ? '၂၄ နာရီအတွင်း စမ်းသပ်စစ်ဆေးပါ' : '24h Buyer Protection active'}
            </p>
          </div>

          {/* Step 4 */}
          <div
            className={`p-4 rounded-2xl border transition ${
              isCompleted
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-500/60'
                : isRefunded
                ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 dark:border-blue-500/60'
                : 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className={`w-5 h-5 rounded-full font-bold text-xs flex items-center justify-center ${
                  isCompleted
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    : isRefunded
                    ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                }`}
              >
                4
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {t('orderTracker.timelineStep4')}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {isCompleted
                ? isMM ? 'ငွေထုတ်ပေးပြီးပါပြီ' : 'Seller paid successfully'
                : isRefunded
                ? isMM ? 'ဝယ်သူထံ ပြန်အမ်းပြီး' : 'Buyer refunded'
                : isMM ? 'ဝယ်သူ အတည်ပြုချက် စောင့်ဆိုင်းဆဲ' : 'Awaiting confirmation'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Credentials Vault & 3-Party Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        {/* Left Column: Decrypted Credential Vault & Actions (lg:col-span-6) */}
        <div className="col-span-1 lg:col-span-6 space-y-6">
          <div className="bg-white dark:bg-slate-900/90 rounded-3xl p-5 sm:p-6 border border-cyan-500/30 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-500">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t('orderTracker.credentialsTitle')}
                  </h4>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    AES-256 Decrypted • {currentOrder.credentials?.authType || 'Direct Login'}
                  </span>
                </div>
              </div>

              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
                Live Vault
              </span>
            </div>

            {isCredentialsAccessible ? (
              <div className="space-y-4">
                {/* Login Identifier */}
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    {t('orderTracker.loginId')}
                  </label>
                  <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="font-mono text-sm font-bold text-cyan-600 dark:text-cyan-300 select-all">
                      {currentOrder.credentials?.loginId || 'player_gamezay@gmail.com'}
                    </span>
                    <button
                      onClick={() =>
                        handleCopy(
                          currentOrder.credentials?.loginId || 'player_gamezay@gmail.com',
                          'login'
                        )
                      }
                      className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition text-xs flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'login' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {copiedKey === 'login' ? t('escrowModal.copied') : t('escrowModal.copy')}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Password with Eye Toggle */}
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    {t('orderTracker.loginPassword')}
                  </label>
                  <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="font-mono text-sm font-bold text-slate-900 dark:text-white select-all">
                      {showPassword
                        ? currentOrder.credentials?.password || 'Pass2026@SecureMM'
                        : '••••••••••••••••'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() =>
                          handleCopy(
                            currentOrder.credentials?.password || 'Pass2026@SecureMM',
                            'pass'
                          )
                        }
                        className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition text-xs flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'pass' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {copiedKey === 'pass' ? t('escrowModal.copied') : t('escrowModal.copy')}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2FA / Backup Codes */}
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    {t('orderTracker.backupCodes')}
                  </label>
                  <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-xs text-amber-700 dark:text-amber-300 font-bold">
                    {currentOrder.credentials?.backupCodes || 'KMY-2026-X99, KMY-2026-Q12'}
                  </div>
                </div>

                {/* Seller Instructions */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
                  <div className="font-bold text-cyan-600 dark:text-cyan-300 mb-1">
                    {t('orderTracker.transferNotes')}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    {currentOrder.credentials?.transferNotes ||
                      'Please bind your mobile phone number and reset recovery email right away.'}
                  </p>
                </div>

                {/* Safety Warning */}
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5">
                  <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                  <span>{t('orderTracker.inspectionWarning')}</span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <Key className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isMM
                    ? 'ငွေလွှဲပြေစာအား အက်ဒမင် စစ်ဆေးအတည်ပြုပြီးပါက အကောင့်အချက်အလက်များကို ဤနေရာတွင် ကြည့်ရှုနိုင်မည်ဖြစ်ပါသည်'
                    : 'Credentials will be unsealed as soon as payment slip is verified.'}
                </p>
              </div>
            )}

            {/* Escrow Actions Bar */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
              {!isCompleted && !isDisputed && !isRefunded ? (
                <div className="space-y-2.5">
                  {/* Confirm & Release to Seller */}
                  <button
                    onClick={() => handleConfirmRelease(currentOrder.id)}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-emerald-500/20 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>{t('orderTracker.confirmRelease')}</span>
                  </button>

                  {/* Raise Dispute Button */}
                  <button
                    onClick={() => setIsDisputeModalOpen(true)}
                    className="w-full py-2.5 rounded-xl bg-rose-50 dark:bg-slate-950 hover:bg-rose-100 dark:hover:bg-rose-950/60 border border-rose-300 dark:border-rose-500/40 text-rose-700 dark:text-rose-300 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <AlertOctagon className="w-3.5 h-3.5 text-rose-500" />
                    <span>{t('orderTracker.openDispute')}</span>
                  </button>
                </div>
              ) : isCompleted ? (
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/40 text-center space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold text-xs sm:text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>{isMM ? 'အော်ဒါ အောင်မြင်စွာ ပြီးဆုံးပါပြီ' : 'Escrow Successfully Completed'}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isMM
                      ? 'ငွေကို ရောင်းသူ၏ KPay/Wave အကောင့်သို့ လွှဲပြောင်းပေးပြီးပါပြီ'
                      : 'Funds have been disbursed to the seller.'}
                  </p>
                </div>
              ) : isRefunded ? (
                <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-500/40 text-center space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-blue-700 dark:text-blue-300 font-bold text-xs sm:text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>{isMM ? 'ဝယ်သူထံ ငွေပြန်အမ်းပြီး' : 'Buyer Refund Completed'}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isMM
                      ? 'ငွေကို ဝယ်သူ၏ Wallet သို့ ပြန်လည်ထည့်သွင်းပေးပြီးပါပြီ'
                      : 'Refunded successfully following dispute resolution.'}
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-500/40 text-center space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-rose-700 dark:text-rose-300 font-bold text-xs sm:text-sm">
                    <AlertOctagon className="w-4 h-4 text-rose-500 animate-pulse" />
                    <span>{isMM ? 'အငြင်းပွားမှု စစ်ဆေးနေပါသည်' : 'Dispute Case Under Admin Review'}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isMM
                      ? 'ကျေးဇူးပြု၍ ညာဘက်ရှိ 3-Party Chat တွင် သက်သေအထောက်အထားများ ပေးပို့ပါ'
                      : 'Please provide proof or communicate in the 3-Party Chat.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: 3-Party Live Chat System (lg:col-span-6) */}
        <div className="col-span-1 lg:col-span-6 w-full">
          <ThreePartyLiveChat
            order={currentOrder}
            currentRole={currentRole}
            onSendMessage={onSendMessage}
            className="h-full"
          />
        </div>
      </div>

      {/* DISPUTE SUBMISSION MODAL */}
      {isDisputeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-500/40 rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-rose-500" />
                <span>{t('orderTracker.disputeModalTitle')}</span>
              </h3>
              <button
                onClick={() => setIsDisputeModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5">
              {/* Reason Selector */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t('orderTracker.disputeReason')}
                </label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:border-rose-500 focus:outline-none"
                >
                  <option value="Invalid Credentials / Login မရပါ">
                    {isMM ? 'စကားဝှက်မှားယွင်းခြင်း / အကောင့်ဝင်မရခြင်း (Invalid Login / Password)' : 'Invalid Credentials / Login Error (Incorrect Password)'}
                  </option>
                  <option value="Stats/Skins do not match listing">
                    {isMM ? 'အကောင့် Stats/စကင်းများ မူလဖော်ပြချက်နှင့် မကိုက်ညီခြင်း' : 'Stats & Skins do not match listing'}
                  </option>
                  <option value="Seller reclaimed account / ပြန်ဆွဲခံရပါသည်">
                    {isMM ? 'ရောင်းသူက အကောင့်ပြန်ဆွဲသွားပါသည် (Seller Reclaimed Account)' : 'Seller reclaimed / pulled back the account'}
                  </option>
                  <option value="2FA / OTP Phone link error">
                    {isMM ? 'ဖုန်းနံပါတ် / 2FA မဖြုတ်ပေးခြင်း (Linked Phone / 2FA Lock)' : 'Seller phone/email unlink error (2FA locked)'}
                  </option>
                  <option value="Account suspended or banned">
                    {isMM ? 'ဂိမ်းအကောင့် ပိတ်သိမ်းခံထားရခြင်း (Game Ban / Penalty)' : 'Account suspended / banned by game server'}
                  </option>
                </select>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t('orderTracker.disputeDesc')}
                </label>
                <textarea
                  rows={3}
                  value={disputeDesc}
                  onChange={(e) => setDisputeDesc(e.target.value)}
                  placeholder={
                    isMM
                      ? 'ဖြစ်ပွားသော ပြဿနာကို အသေးစိတ် ရှင်းပြပါ (ဥပမာ - Moonton ဝင်မရဘဲ Error 1004 ပြနေပါသည်)...'
                      : 'Explain in detail what happened (e.g. Error 1004 wrong password, seller unverified)...'
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-rose-500 focus:outline-none"
                />
              </div>

              {/* Proof Screenshot Attachments */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>{t('orderTracker.proofUploadTitle')}</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {disputeProofs.length} proof(s) attached
                  </span>
                </label>

                {/* Proof thumbnails gallery */}
                <div className="flex items-center gap-2 flex-wrap">
                  {disputeProofs.map((p, idx) => (
                    <div key={idx} className="relative group w-14 h-14 rounded-xl overflow-hidden border border-rose-300 dark:border-rose-500/40">
                      <img src={p} alt="proof" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setDisputeProofs((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-slate-950/80 text-rose-400 hover:text-rose-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {/* Upload button */}
                  <label className="w-14 h-14 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-rose-500 flex flex-col items-center justify-center text-slate-400 hover:text-rose-500 transition cursor-pointer">
                    <UploadCloud className="w-4 h-4" />
                    <span className="text-[9px] mt-0.5 font-bold">Add</span>
                    <input type="file" accept="image/*" onChange={handleProofUpload} className="hidden" />
                  </label>
                </div>

                {/* Sample quick proof selector */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-1">
                    {isMM ? 'နမူနာ သက်သေပုံများ အမြန်ထည့်ရန်:' : 'Quick Demo Proof Attachments:'}
                  </span>
                  <div className="flex gap-1.5 flex-wrap">
                    {sampleProofOptions.map((opt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          if (!disputeProofs.includes(opt.url)) {
                            setDisputeProofs((prev) => [...prev, opt.url]);
                          }
                        }}
                        className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-700 dark:text-slate-300 hover:bg-rose-500 hover:text-white transition cursor-pointer"
                      >
                        + {opt.title}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Notice */}
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-[11px] text-rose-800 dark:text-rose-300 flex items-start gap-2">
                <Lock className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                <span>
                  {isMM
                    ? 'အငြင်းပွားမှု တင်လိုက်ပါက Escrow ငွေ (ကျပ် ' +
                      formatMMK(currentOrder.amountMMK) +
                      ') ကို ချက်ချင်း အေးခဲထိန်းချုပ်ထားမည်ဖြစ်ပြီး အက်ဒမင်က ဝင်ရောက်စစ်ဆေးပါမည်။'
                    : 'Submitting a dispute immediately freezes ' +
                      formatMMK(currentOrder.amountMMK) +
                      ' in platform escrow until Admin resolution.'}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setIsDisputeModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
              >
                {isMM ? 'ပယ်ဖျက်မည်' : 'Cancel'}
              </button>
              <button
                onClick={handleDisputeSubmit}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition cursor-pointer"
              >
                {t('orderTracker.submitDispute')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

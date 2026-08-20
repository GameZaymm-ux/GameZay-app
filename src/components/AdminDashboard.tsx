import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  ChatMessage,
  EscrowOrder,
  EscrowStatus,
  KycSubmission,
  SellerPayoutRequest,
} from '../types';
import { ThreePartyLiveChat } from './ThreePartyLiveChat';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Eye,
  FileCheck,
  CreditCard,
  DollarSign,
  AlertOctagon,
  RefreshCw,
  ExternalLink,
  ArrowRight,
  UserCheck,
  Check,
  Scale,
  RotateCcw,
  MessageSquare,
  Sparkles,
  Zap,
  HelpCircle,
  X,
  AlertTriangle,
  TrendingUp,
  Coins,
  FileText,
  UserX,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AdminDashboardProps {
  orders: EscrowOrder[];
  payouts: SellerPayoutRequest[];
  kycSubmissions?: KycSubmission[];
  onApproveKyc?: (submissionId: string) => void;
  onRejectKyc?: (submissionId: string, reason: string) => void;
  onApprovePaymentSlip: (orderId: string) => void;
  onRejectPaymentSlip: (orderId: string) => void;
  onApprovePayout: (payoutId: string) => void;
  onAdminRefundBuyer: (orderId: string) => void;
  onAdminReleaseToSeller: (orderId: string) => void;
  onAdminRequestMoreProof: (orderId: string) => void;
  onSendMessage: (
    orderId: string,
    message: Omit<ChatMessage, 'id' | 'createdAt' | 'orderId'>
  ) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  orders,
  payouts,
  kycSubmissions = [],
  onApproveKyc,
  onRejectKyc,
  onApprovePaymentSlip,
  onRejectPaymentSlip,
  onApprovePayout,
  onAdminRefundBuyer,
  onAdminReleaseToSeller,
  onAdminRequestMoreProof,
  onSendMessage,
}) => {
  const {
    t,
    formatMMK,
    formatTHB,
    formatUSDT,
    exchangeRate,
    setExchangeRate,
    convertMMKtoTHB,
    isMM,
  } = useLanguage();

  const [selectedSlipUrl, setSelectedSlipUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'disputes' | 'kyc' | 'rates' | 'slips' | 'payouts' | 'escrows'>('disputes');
  const [selectedDisputeOrder, setSelectedDisputeOrder] = useState<EscrowOrder | null>(null);
  const [selectedProofPreview, setSelectedProofPreview] = useState<string | null>(null);

  // Rate Manager State
  const [inputRate, setInputRate] = useState<number>(exchangeRate || 135);
  const [rateSaved, setRateSaved] = useState(false);

  // KYC Reject modal state
  const [rejectingKycId, setRejectingKycId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('Document image blurry or ID number mismatch');

  const pendingSlips = orders.filter((o) => o.status === 'PAYMENT_VERIFYING');
  const activeEscrows = orders.filter((o) => o.status !== 'PENDING_PAYMENT_PROOF');
  const disputedOrders = orders.filter((o) => o.status === 'DISPUTED');
  const pendingKyc = kycSubmissions.filter((k) => k.status === 'PENDING');
  const totalVolume = orders.reduce((acc, curr) => acc + curr.amountMMK, 0);

  const handleApproveSlip = (orderId: string) => {
    onApprovePaymentSlip(orderId);
    confetti({
      particleCount: 60,
      spread: 50,
      origin: { y: 0.7 },
    });
  };

  const handleRefundBuyer = (orderId: string) => {
    onAdminRefundBuyer(orderId);
    setSelectedDisputeOrder(null);
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  const handleReleaseToSeller = (orderId: string) => {
    onAdminReleaseToSeller(orderId);
    setSelectedDisputeOrder(null);
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  const handleSaveRate = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputRate > 0) {
      setExchangeRate(Number(inputRate));
      setRateSaved(true);
      confetti({
        particleCount: 50,
        spread: 40,
        origin: { y: 0.6 },
      });
      setTimeout(() => setRateSaved(false), 3000);
    }
  };

  const handleApproveKycSubmission = (id: string) => {
    if (onApproveKyc) {
      onApproveKyc(id);
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  };

  const handleConfirmRejectKyc = () => {
    if (rejectingKycId && onRejectKyc) {
      onRejectKyc(rejectingKycId, rejectionReason);
      setRejectingKycId(null);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Admin Desk Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-500/40 text-rose-600 dark:text-rose-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {t('admin.title')}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40">
                STAFF SECURE DESK
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('admin.subtitle')}</p>
          </div>
        </div>

        {/* Quick Stats Pills */}
        <div className="flex items-center gap-3">
          <div className="bg-white dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-right shadow-sm">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase">
              Escrow Vault Balance
            </span>
            <span className="text-sm font-black text-cyan-600 dark:text-cyan-400 font-mono">
              {formatMMK(totalVolume)}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-right shadow-sm">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase">
              Rate
            </span>
            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">
              1฿ = {exchangeRate} MMK
            </span>
          </div>
        </div>
      </div>

      {/* Admin Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto no-scrollbar">
        {/* Tab 1: Disputes */}
        <button
          onClick={() => setActiveTab('disputes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
            activeTab === 'disputes'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>{t('admin.disputes')}</span>
          {disputedOrders.length > 0 ? (
            <span className="px-2 py-0.5 rounded-full bg-white text-rose-700 text-[10px] font-black animate-pulse">
              {disputedOrders.length} ACTIVE
            </span>
          ) : (
            <span className="px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px]">
              0
            </span>
          )}
        </button>

        {/* Tab 2: KYC Queue */}
        <button
          onClick={() => setActiveTab('kyc')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
            activeTab === 'kyc'
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>KYC Verifications</span>
          {pendingKyc.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-300 text-slate-950 text-[10px] font-black">
              {pendingKyc.length} PENDING
            </span>
          )}
        </button>

        {/* Tab 3: Exchange Rate Manager */}
        <button
          onClick={() => setActiveTab('rates')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
            activeTab === 'rates'
              ? 'bg-emerald-600 text-white shadow-lg'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>Exchange Rate Manager</span>
        </button>

        {/* Tab 4: Pending Slips */}
        <button
          onClick={() => setActiveTab('slips')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
            activeTab === 'slips'
              ? 'bg-cyan-600 text-white shadow-lg'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>{t('admin.pendingSlips')}</span>
          {pendingSlips.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-cyan-400 text-slate-950 text-[10px] font-black">
              {pendingSlips.length}
            </span>
          )}
        </button>

        {/* Tab 5: Payouts */}
        <button
          onClick={() => setActiveTab('payouts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
            activeTab === 'payouts'
              ? 'bg-emerald-600 text-white shadow-lg'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>{t('admin.payouts')}</span>
          <span className="px-1.5 py-0.2 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-bold">
            {payouts.filter((p) => p.status === 'PENDING').length}
          </span>
        </button>

        {/* Tab 6: Active Escrows */}
        <button
          onClick={() => setActiveTab('escrows')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
            activeTab === 'escrows'
              ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40 shadow-lg'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>{t('admin.activeEscrows')}</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px]">
            {activeEscrows.length}
          </span>
        </button>
      </div>

      {/* TAB 1: DISPUTE RESOLUTION PANEL */}
      {activeTab === 'disputes' && (
        <div className="space-y-6">
          {disputedOrders.length === 0 ? (
            <div className="bg-white dark:bg-slate-900/60 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {t('admin.noActiveDisputes')}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                {isMM
                  ? 'အငြင်းပွားမှု တိုင်ကြားချက်များ ပေါ်ပေါက်လာပါက အထောက်အထားများနှင့်တကွ ဤနေရာတွင် ချက်ချင်း ဖြေရှင်းနိုင်ပါသည်'
                  : 'All transactions running securely. When a buyer raises a dispute, it will appear here for investigation.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {disputedOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border-2 border-rose-300 dark:border-rose-500/50 shadow-2xl space-y-6"
                >
                  {/* Dispute Case Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-xs font-mono font-bold border border-rose-300 dark:border-rose-500/40">
                          DISPUTE #{order.orderNumber}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">
                          {order.disputeInfo?.filedAt
                            ? new Date(order.disputeInfo.filedAt).toLocaleString()
                            : 'Active Case'}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                        {order.listing.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs font-mono font-black text-rose-600 dark:text-rose-400 text-base">
                          {formatMMK(order.amountMMK)}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          ≈ {formatTHB(convertMMKtoTHB(order.amountMMK))} (Escrow Frozen)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 2-Column Dispute Review Workspace */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left: Claim Details & Submitted Screenshot Proofs (lg:col-span-6) */}
                    <div className="col-span-1 lg:col-span-6 space-y-4">
                      {/* Reason & Statement Card */}
                      <div className="bg-rose-50 dark:bg-rose-950/30 rounded-2xl p-4 border border-rose-200 dark:border-rose-800/40 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-rose-800 dark:text-rose-300">
                          <AlertOctagon className="w-4 h-4 text-rose-500 shrink-0" />
                          <span>Dispute Reason: {order.disputeInfo?.reason}</span>
                        </div>
                        <p className="text-xs text-slate-800 dark:text-rose-100/90 leading-relaxed bg-white/70 dark:bg-slate-950/60 p-3 rounded-xl border border-rose-200/60 dark:border-rose-900/50">
                          "{order.disputeInfo?.description || 'Buyer reported critical credential failure.'}"
                        </p>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1">
                          <span>Filed by: <strong className="text-slate-800 dark:text-slate-200">{order.buyerName}</strong> ({order.buyerPhone})</span>
                          <span>Seller: <strong className="text-slate-800 dark:text-slate-200">{order.sellerName}</strong></span>
                        </div>
                      </div>

                      {/* Submitted Screenshot Proofs Section */}
                      <div className="bg-slate-50 dark:bg-slate-950/70 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-2.5">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                          <span>{t('admin.evidenceComparison')}</span>
                          <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-normal">
                            Click screenshot to inspect
                          </span>
                        </div>

                        {/* Proof Thumbnails */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {(order.disputeInfo?.proofUrls && order.disputeInfo.proofUrls.length > 0
                            ? order.disputeInfo.proofUrls
                            : [
                                'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
                                'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
                              ]
                          ).map((url, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setSelectedProofPreview(url)}
                              className="relative h-24 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 group cursor-pointer"
                            >
                              <img
                                src={url}
                                alt={`Proof ${i + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition">
                                Inspect
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Admin Verdict Action Panel */}
                      <div className="bg-slate-100 dark:bg-slate-950/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Scale className="w-4 h-4 text-cyan-500" />
                            <span>{t('admin.disputeDecision')}</span>
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            Irreversible Escrow Execution
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {/* Option 1: Refund Buyer */}
                          <button
                            onClick={() => handleRefundBuyer(order.id)}
                            className="p-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <RotateCcw className="w-4 h-4" />
                            <span>{t('admin.refundBuyer')}</span>
                          </button>

                          {/* Option 2: Release to Seller */}
                          <button
                            onClick={() => handleReleaseToSeller(order.id)}
                            className="p-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                            <span>{t('admin.releaseToSeller')}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right: Embedded 3-Party Chat Window (lg:col-span-6) */}
                    <div className="col-span-1 lg:col-span-6 h-[480px]">
                      <ThreePartyLiveChat
                        order={order}
                        currentUserRole="ADMIN"
                        onSendMessage={onSendMessage}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: KYC VERIFICATION QUEUE */}
      {activeTab === 'kyc' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Seller KYC Submissions Queue
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Review submitted National ID cards, Passports, and selfie identity photos to grant Verified Seller status.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              {kycSubmissions.length} Submissions in Vault
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {kycSubmissions.map((sub) => (
              <div
                key={sub.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-md space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top info badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {sub.idType === 'NRC' ? '🇲🇲 Myanmar NRC' : sub.idType === 'THAI_ID' ? '🇹🇭 Thai Citizen ID' : '🌐 Passport'}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        sub.status === 'VERIFIED'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : sub.status === 'REJECTED'
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {sub.status}
                    </span>
                  </div>

                  {/* Applicant identity */}
                  <div>
                    <h4 className="text-base font-black text-slate-900 dark:text-white">
                      {sub.fullName}
                    </h4>
                    <p className="text-xs text-slate-500 font-mono">
                      ID No: <strong className="text-slate-800 dark:text-slate-200">{sub.idNumber}</strong> • Phone: {sub.phoneNumber}
                    </p>
                  </div>

                  {/* Document Photos Grid */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedProofPreview(sub.idFrontUrl)}
                      className="relative h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group cursor-pointer"
                    >
                      <img src={sub.idFrontUrl} alt="Front" className="w-full h-full object-cover" />
                      <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] font-bold text-center py-0.5">
                        ID Front
                      </span>
                    </button>

                    {sub.idBackUrl && (
                      <button
                        type="button"
                        onClick={() => setSelectedProofPreview(sub.idBackUrl || '')}
                        className="relative h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group cursor-pointer"
                      >
                        <img src={sub.idBackUrl} alt="Back" className="w-full h-full object-cover" />
                        <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] font-bold text-center py-0.5">
                          ID Back
                        </span>
                      </button>
                    )}

                    {sub.selfieUrl && (
                      <button
                        type="button"
                        onClick={() => setSelectedProofPreview(sub.selfieUrl || '')}
                        className="relative h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group cursor-pointer"
                      >
                        <img src={sub.selfieUrl} alt="Selfie" className="w-full h-full object-cover" />
                        <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] font-bold text-center py-0.5">
                          Selfie
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {sub.status === 'PENDING' ? (
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => setRejectingKycId(sub.id)}
                      className="flex-1 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 font-bold text-xs transition"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApproveKycSubmission(sub.id)}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve Seller</span>
                    </button>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Processed on: {new Date(sub.submittedAt).toLocaleDateString()}</span>
                    <span className="text-emerald-500 font-bold">Compliant</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DAILY EXCHANGE RATE MANAGER */}
      {activeTab === 'rates' && (
        <div className="max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Daily Exchange Rate Manager
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Set and broadcast the daily Thai Baht (THB) to Myanmar Kyat (MMK) conversion benchmark across all listings.
              </p>
            </div>
          </div>

          {rateSaved && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-300 flex items-center gap-2 text-xs animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Exchange rate updated to 1 THB = {exchangeRate} MMK! All prices recalculated immediately.</span>
            </div>
          )}

          <form onSubmit={handleSaveRate} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                Daily Rate: MMK per 1 THB (ကျပ် / ၁ ဘတ်)
              </label>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <input
                    type="number"
                    value={inputRate}
                    onChange={(e) => setInputRate(Number(e.target.value))}
                    min="1"
                    step="1"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono font-black text-lg focus:outline-none focus:border-emerald-500"
                    required
                  />
                  <span className="absolute right-4 top-3.5 text-xs text-slate-400 font-mono">
                    MMK / 1 THB
                  </span>
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition cursor-pointer"
                >
                  Save Rate
                </button>
              </div>
            </div>

            {/* Live Calculation Preview Matrix */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 block">
                Live Conversion Preview (Rate: 1 THB = {inputRate} MMK)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px]">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px]">100,000 MMK</span>
                  <strong className="text-emerald-600 dark:text-emerald-400">
                    ≈ {formatTHB(Math.round((100000 / (inputRate || 135)) * 10) / 10)}
                  </strong>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px]">380,000 MMK</span>
                  <strong className="text-emerald-600 dark:text-emerald-400">
                    ≈ {formatTHB(Math.round((380000 / (inputRate || 135)) * 10) / 10)}
                  </strong>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px]">1,000,000 MMK</span>
                  <strong className="text-emerald-600 dark:text-emerald-400">
                    ≈ {formatTHB(Math.round((1000000 / (inputRate || 135)) * 10) / 10)}
                  </strong>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: PENDING PAYMENT SLIPS */}
      {activeTab === 'slips' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t('admin.pendingSlips')} ({pendingSlips.length})
            </h3>
            <span className="text-xs text-slate-400">Inspect buyer transfer slips</span>
          </div>

          {pendingSlips.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
              No pending payment slips requiring approval.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingSlips.map((order) => (
                <div
                  key={order.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-md space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">
                      {order.orderNumber}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                      {formatMMK(order.amountMMK)}
                    </span>
                  </div>

                  <div className="text-xs space-y-1">
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      {order.listing.title}
                    </div>
                    <div className="text-slate-500">
                      Buyer: {order.buyerName} ({order.buyerPhone})
                    </div>
                    <div className="text-slate-500 font-mono text-[11px]">
                      Method: {order.paymentMethod} • TxID: {order.transactionId || 'N/A'}
                    </div>
                  </div>

                  {order.paymentSlipUrl && (
                    <button
                      type="button"
                      onClick={() => setSelectedSlipUrl(order.paymentSlipUrl || null)}
                      className="w-full h-32 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 relative group cursor-pointer"
                    >
                      <img
                        src={order.paymentSlipUrl}
                        alt="Payment Slip"
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition">
                        View Full Slip
                      </div>
                    </button>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => onRejectPaymentSlip(order.id)}
                      className="flex-1 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-xs"
                    >
                      Reject Slip
                    </button>
                    <button
                      onClick={() => handleApproveSlip(order.id)}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow"
                    >
                      Approve & Lock Escrow
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: SELLER PAYOUT REQUESTS */}
      {activeTab === 'payouts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Seller Payout Requests ({payouts.length})
            </h3>
            <span className="text-xs text-slate-400">Disburse funds to seller local wallets & Thai banks</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {payouts.map((p) => (
              <div
                key={p.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-md space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-400">
                    {p.orderNumber}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      p.status === 'PAID'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    {formatMMK(p.amountMMK)}
                  </div>
                  <div className="text-slate-800 dark:text-slate-200 font-bold">
                    Recipient: {p.sellerName}
                  </div>
                  <div className="text-slate-500 font-mono text-[11px]">
                    Channel: <strong>{p.walletMethod}</strong> ({p.walletNumber})
                  </div>
                </div>

                {p.status === 'PENDING' && (
                  <button
                    onClick={() => {
                      onApprovePayout(p.id);
                      confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
                    }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black text-xs shadow transition cursor-pointer"
                  >
                    Confirm & Disburse Payout
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: ACTIVE ESCROWS */}
      {activeTab === 'escrows' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Active Escrow Transactions ({activeEscrows.length})
            </h3>
          </div>

          <div className="space-y-2">
            {activeEscrows.map((order) => (
              <div
                key={order.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                    {order.orderNumber}
                  </span>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {order.listing.title}
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Buyer: {order.buyerName} | Seller: {order.sellerName}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <div className="font-mono font-black text-slate-900 dark:text-white">
                    {formatMMK(order.amountMMK)}
                  </div>
                  <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px]">
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Fullscreen Slip or Document Preview */}
      {(selectedSlipUrl || selectedProofPreview) && (
        <div
          onClick={() => {
            setSelectedSlipUrl(null);
            setSelectedProofPreview(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-pointer animate-in fade-in"
        >
          <div className="relative max-w-2xl max-h-[90vh]">
            <img
              src={selectedSlipUrl || selectedProofPreview || ''}
              alt="Preview"
              className="max-w-full max-h-[85vh] rounded-2xl object-contain border border-white/20 shadow-2xl"
            />
            <button
              onClick={() => {
                setSelectedSlipUrl(null);
                setSelectedProofPreview(null);
              }}
              className="absolute top-2 right-2 p-2 rounded-full bg-black/60 text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Modal: Reject KYC Reason */}
      {rejectingKycId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Reject KYC Submission
            </h4>
            <p className="text-xs text-slate-500">
              Provide a clear reason so the seller can re-upload proper credentials:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
              rows={3}
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setRejectingKycId(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRejectKyc}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold shadow"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

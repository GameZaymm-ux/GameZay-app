import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { AccountListing, EscrowOrder, PaymentMethodCode, PaymentOption } from '../types';
import { MYANMAR_PAYMENT_OPTIONS } from '../data/mockData';
import {
  X,
  ShieldCheck,
  QrCode,
  Copy,
  Check,
  Upload,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Lock,
  Smartphone,
  CreditCard,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface EscrowCheckoutModalProps {
  listing: AccountListing | null;
  onClose: () => void;
  onOrderCreated: (order: EscrowOrder) => void;
}

export const EscrowCheckoutModal: React.FC<EscrowCheckoutModalProps> = ({
  listing,
  onClose,
  onOrderCreated,
}) => {
  const { t, formatMMK, formatTHB, formatPrice, formatDualPrice, currency, isMM } = useLanguage();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodCode>('KBZ_PAY');
  const [transactionId, setTransactionId] = useState('');
  const [senderPhone, setSenderPhone] = useState('09795554433');
  const [slipPreviewUrl, setSlipPreviewUrl] = useState<string | null>(
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=500&auto=format&fit=crop&q=80'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!listing) return null;

  const dualPrice = formatDualPrice(listing.priceMMK);

  const currentOption = MYANMAR_PAYMENT_OPTIONS.find((opt) => opt.id === selectedMethod) || MYANMAR_PAYMENT_OPTIONS[0];

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSlipPreviewUrl(url);
    }
  };

  const handleSubmitEscrow = (autoApproveDemo = false) => {
    setIsSubmitting(true);

    setTimeout(() => {
      const newOrder: EscrowOrder = {
        id: `ord_${Date.now()}`,
        orderNumber: `GZ-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        listingId: listing.id,
        listing: listing,
        buyerName: isMM ? 'မြန်မာဂိမ်းဝါသနာရှင် (Buyer)' : 'Ko Buyer (You)',
        buyerPhone: senderPhone || '09795554433',
        sellerName: listing.seller.name,
        sellerPhone: listing.seller.phone,
        amountMMK: listing.priceMMK,
        amountUSDT: listing.priceUSDT,
        paymentMethod: selectedMethod,
        paymentSlipUrl: slipPreviewUrl || undefined,
        transactionId: transactionId || `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`,
        senderPhone: senderPhone,
        status: autoApproveDemo ? 'ESCROW_LOCKED' : 'PAYMENT_VERIFYING',
        credentials: {
          loginId: listing.credentialPreview.maskedLogin,
          password: 'Password_Decrypted_2026!#',
          authType: listing.credentialPreview.authType,
          backupCodes: listing.credentialPreview.backupCodes,
          transferNotes: listing.credentialPreview.notes,
        },
        createdAt: new Date().toISOString(),
        inspectionDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      setIsSubmitting(false);

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });

      onOrderCreated(newOrder);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-4 sm:my-8 transition-colors duration-200">
        {/* Header */}
        <div className="bg-slate-50 dark:bg-slate-950 p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {t('escrowModal.title')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isMM
                  ? 'ငွေကို Escrow တွင် လုံခြုံစွာထားရှိပြီးမှ အကောင့်လွှဲပြောင်းပေးပါမည်'
                  : 'Funds will be securely locked in GameZay Escrow Vault'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Order Summary Pill */}
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                {listing.gameType} Account
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{listing.title}</h4>
            </div>
            <div className="text-left sm:text-right sm:shrink-0">
              <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {dualPrice.primary}
              </div>
              <div className="text-xs text-cyan-600 dark:text-cyan-400 font-mono">
                {dualPrice.secondary}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {t('escrowModal.escrowFee')}
              </div>
            </div>
          </div>

          {/* Step 1: Select Myanmar Payment Method */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs flex items-center justify-center font-bold">
                1
              </span>
              {t('escrowModal.paymentMethod')}
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {MYANMAR_PAYMENT_OPTIONS.map((opt) => {
                const isSelected = selectedMethod === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedMethod(opt.id)}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-50 dark:bg-slate-800 border-cyan-500 ring-1 ring-cyan-500/40 shadow-md'
                        : 'bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {isMM ? opt.nameMm.split(' ')[0] : opt.nameEn.split(' ')[0]}
                      </span>
                      {isSelected ? (
                        <Check className="w-4 h-4 text-cyan-500" />
                      ) : (
                        <div className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-700" />
                      )}
                    </div>
                    <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-medium">{opt.badge}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Bank Account & Transfer Instructions */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs flex items-center justify-center font-bold">
                2
              </span>
              {t('escrowModal.step2')}
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              {/* Account details */}
              <div className="space-y-3">
                <div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{t('escrowModal.accountNumber')}</div>
                  <div className="flex items-center justify-between mt-1 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-sm font-mono font-bold text-cyan-600 dark:text-cyan-400">
                      {currentOption.accountNumber}
                    </span>
                    <button
                      onClick={() => handleCopy(currentOption.accountNumber, 'num')}
                      className="px-2 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-cyan-500 hover:text-slate-950 transition flex items-center gap-1 cursor-pointer"
                    >
                      {copiedField === 'num' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === 'num' ? t('escrowModal.copied') : t('escrowModal.copy')}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{t('escrowModal.accountName')}</div>
                  <div className="flex items-center justify-between mt-1 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {currentOption.accountName}
                    </span>
                    <button
                      onClick={() => handleCopy(currentOption.accountName, 'name')}
                      className="px-2 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-cyan-500 hover:text-slate-950 transition flex items-center gap-1 cursor-pointer"
                    >
                      {copiedField === 'name' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === 'name' ? t('escrowModal.copied') : t('escrowModal.copy')}</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/30 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>{t('escrowModal.disclaimer')}</span>
                </div>
              </div>

              {/* QR Code Container */}
              <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                <img
                  src={currentOption.qrCodeUrl}
                  alt="Escrow QR"
                  className="w-32 h-32 rounded-xl object-cover border-2 border-cyan-500 shadow-md mb-2"
                />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {currentOption.nameEn}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  {t('escrowModal.scanQr')}
                </span>
              </div>
            </div>
          </div>

          {/* Step 3: Transaction ID & Slip Upload */}
          <div className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs flex items-center justify-center font-bold">
                3
              </span>
              {t('escrowModal.step3')}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 font-medium block mb-1">
                  {t('escrowModal.transactionId')}
                </label>
                <input
                  type="text"
                  placeholder={t('escrowModal.transactionIdPlaceholder')}
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 font-medium block mb-1">
                  {t('escrowModal.senderPhone')}
                </label>
                <input
                  type="text"
                  placeholder={t('escrowModal.senderPhonePlaceholder')}
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            {/* Slip Uploader */}
            <div>
              <label className="text-xs text-slate-600 dark:text-slate-400 font-medium block mb-1">
                {t('escrowModal.uploadSlip')}
              </label>
              <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-cyan-500 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition bg-slate-50/50 dark:bg-slate-950/40">
                <Upload className="w-6 h-6 text-slate-400 mb-2" />
                <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold">
                  {t('escrowModal.uploadSlipPlaceholder')}
                </span>
                <span className="text-[10px] text-slate-400 mt-1">PNG, JPG, or Screenshot up to 10MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {slipPreviewUrl && (
                <div className="mt-2 flex items-center gap-2 p-2 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <img
                    src={slipPreviewUrl}
                    alt="Slip preview"
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div className="flex-1 text-[11px] text-slate-600 dark:text-slate-400 truncate">
                    Payment_Slip_Screenshot.jpg (Ready for Verification)
                  </div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950">
                    Attached
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => handleSubmitEscrow(true)}
            className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer order-2 sm:order-1"
          >
            <Sparkles className="w-4 h-4" />
            <span>{t('escrowModal.quickDemo')}</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmitEscrow(false)}
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-emerald-500 to-teal-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-cyan-500/20 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer order-1 sm:order-2 disabled:opacity-50"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>
              {isSubmitting ? t('escrowModal.verifying') : t('escrowModal.submitPayment')}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

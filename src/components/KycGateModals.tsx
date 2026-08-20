import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ShieldAlert, Clock, Sparkles, X, ShieldCheck, ArrowRight } from 'lucide-react';

interface KycRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyNow: () => void;
}

export const KycRequiredModal: React.FC<KycRequiredModalProps> = ({
  isOpen,
  onClose,
  onApplyNow,
}) => {
  const { t, isMM } = useLanguage();

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200"
      >
        {/* Header with Icon */}
        <div className="flex items-center justify-between">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Title & Body */}
        <div className="space-y-2">
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>{t('kycGate.requiredTitle')}</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {t('kycGate.requiredBody')}
          </p>
        </div>

        {/* Security Perks Box */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{isMM ? 'KYC စိစစ်ပြီး ရောင်းသူ အကျိုးကျေးဇူးများ' : 'Verified Seller Benefits'}</span>
          </div>
          <ul className="space-y-1 text-[11px] list-disc list-inside">
            <li>{isMM ? '၀% အရောင်းတင်ခ အခမဲ့' : '0% Listing Commission'}</li>
            <li>{isMM ? 'KPay / WavePay တိုက်ရိုက် ငွေထုတ်ယူခွင့်' : 'Instant Direct Payouts'}</li>
            <li>{isMM ? 'ယုံကြည်စိတ်ချရသော Verified Seller အမှတ်အသား' : 'Verified Badge Trust Boost'}</li>
          </ul>
        </div>

        {/* Two Actions: Later & Apply Now */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm transition cursor-pointer"
          >
            {t('kycGate.laterBtn')}
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onApplyNow();
            }}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span>{t('kycGate.applyNowBtn')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

interface KycPendingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KycPendingModal: React.FC<KycPendingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t, isMM } = useLanguage();

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-7 space-y-5 text-center animate-in zoom-in-95 duration-200"
      >
        <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-500 flex items-center justify-center mx-auto">
          <Clock className="w-7 h-7 animate-spin text-cyan-400" />
        </div>

        <div className="space-y-2">
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
            {t('kycGate.pendingTitle')}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
            {t('kycGate.pendingBody')}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('kycGate.pendingDesc')}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-cyan-500/20 transition cursor-pointer"
        >
          {t('kycGate.closeBtn')}
        </button>
      </div>
    </div>
  );
};

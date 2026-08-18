import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { KycStatus, KycSubmission } from '../types';
import {
  ShieldCheck,
  X,
  Upload,
  Camera,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserCheck,
  Sparkles,
  Lock,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface KycVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitKyc: (submission: Omit<KycSubmission, 'id' | 'status' | 'submittedAt'>) => void;
  currentKycStatus?: KycStatus;
}

export const KycVerificationModal: React.FC<KycVerificationModalProps> = ({
  isOpen,
  onClose,
  onSubmitKyc,
  currentKycStatus = 'UNSUBMITTED',
}) => {
  const { t, isMM } = useLanguage();

  const [fullName, setFullName] = useState('');
  const [idType, setIdType] = useState<'NRC' | 'PASSPORT' | 'THAI_ID'>('NRC');
  const [idNumber, setIdNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [idFrontUrl, setIdFrontUrl] = useState('');
  const [idBackUrl, setIdBackUrl] = useState('');
  const [selfieUrl, setSelfieUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleUseSampleDocuments = () => {
    setFullName(idType === 'THAI_ID' ? 'Anan Sukprasert' : 'U Kyaw Zayar Myo');
    setIdNumber(
      idType === 'NRC'
        ? '12/DAGAMA(N)123456'
        : idType === 'THAI_ID'
        ? '1-1002-99881-22-3'
        : 'MD892144'
    );
    setPhoneNumber(idType === 'THAI_ID' ? '0812345678' : '09450123456');
    setIdFrontUrl(
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80'
    );
    setIdBackUrl(
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80'
    );
    setSelfieUrl(
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
    );
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !idNumber.trim() || !phoneNumber.trim()) {
      setErrorMsg(
        isMM ? 'ကျေးဇူးပြု၍ အချက်အလက်များ အားလုံးဖြည့်စွက်ပါ' : 'Please fill all required fields.'
      );
      return;
    }

    const finalFront =
      idFrontUrl ||
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80';

    setIsSubmitting(true);
    setTimeout(() => {
      onSubmitKyc({
        userId: 'usr_current',
        fullName,
        idType,
        idNumber,
        phoneNumber,
        idFrontUrl: finalFront,
        idBackUrl: idBackUrl || finalFront,
        selfieUrl:
          selfieUrl ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      });

      setIsSubmitting(false);
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-cyan-600 via-blue-700 to-indigo-800 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
              <ShieldCheck className="w-7 h-7 text-cyan-300" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-200 text-[10px] font-bold uppercase tracking-wider mb-1 border border-cyan-300/30">
                <Sparkles className="w-3 h-3 text-cyan-300" />
                <span>Seller Identity Protection</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black">
                {isMM ? 'ရောင်းသူ မှတ်ပုံတင် စိစစ်ခြင်း (KYC)' : 'Seller KYC Identity Verification'}
              </h3>
              <p className="text-xs text-cyan-100/90 mt-0.5">
                {isMM
                  ? 'လုံခြုံစိတ်ချရသော ဂိမ်းအကောင့်အရောင်းအဝယ်အတွက် မှတ်ပုံတင်စိစစ်ပါ'
                  : 'Verify your ID to become a Verified Seller and unlock Seller Studio'}
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Autofill Sample Button */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                {isMM ? 'စမ်းသပ်ရန် အချက်အလက်ဖြည့်မည်လား?' : 'Want to quick-test with sample documents?'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleUseSampleDocuments}
              className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[11px] shadow transition"
            >
              {isMM ? 'နမူနာဖြည့်ပါ' : 'Auto Fill'}
            </button>
          </div>

          {/* ID Type Selector */}
          <div>
            <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1.5">
              {isMM ? 'အထောက်အထား အမျိုးအစား' : 'Document Type'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setIdType('NRC')}
                className={`p-2.5 rounded-xl border text-center font-bold transition flex flex-col items-center justify-center gap-1 ${
                  idType === 'NRC'
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-600 dark:text-cyan-400 ring-2 ring-cyan-500/20'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400'
                }`}
              >
                <span>🇲🇲</span>
                <span className="text-[11px]">Myanmar NRC</span>
              </button>

              <button
                type="button"
                onClick={() => setIdType('THAI_ID')}
                className={`p-2.5 rounded-xl border text-center font-bold transition flex flex-col items-center justify-center gap-1 ${
                  idType === 'THAI_ID'
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-600 dark:text-cyan-400 ring-2 ring-cyan-500/20'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400'
                }`}
              >
                <span>🇹🇭</span>
                <span className="text-[11px]">Thai ID Card</span>
              </button>

              <button
                type="button"
                onClick={() => setIdType('PASSPORT')}
                className={`p-2.5 rounded-xl border text-center font-bold transition flex flex-col items-center justify-center gap-1 ${
                  idType === 'PASSPORT'
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-600 dark:text-cyan-400 ring-2 ring-cyan-500/20'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400'
                }`}
              >
                <span>🌐</span>
                <span className="text-[11px]">Passport</span>
              </button>
            </div>
          </div>

          {/* Full Legal Name */}
          <div>
            <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
              {isMM ? 'အမည်ရင်း (မှတ်ပုံတင်ပါအတိုင်း)' : 'Full Legal Name (as on ID)'}
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={idType === 'THAI_ID' ? 'e.g. Somchai Prasert' : 'e.g. U Kyaw Zayar Myo'}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          {/* ID / NRC Number & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                {idType === 'NRC'
                  ? isMM
                    ? 'မှတ်ပုံတင်အမှတ်'
                    : 'NRC Number'
                  : idType === 'THAI_ID'
                  ? 'Thai ID Number (13 digits)'
                  : 'Passport Number'}
              </label>
              <input
                type="text"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder={
                  idType === 'NRC'
                    ? '12/DAGAMA(N)123456'
                    : idType === 'THAI_ID'
                    ? '1-1002-34567-89-0'
                    : 'MD123456'
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                {isMM ? 'ဖုန်းနံပါတ် (SMS အတည်ပြုရန်)' : 'Phone Number'}
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="09450123456 or +66 81 234 5678"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
          </div>

          {/* Photo Upload Previews */}
          <div className="space-y-2 pt-1">
            <label className="font-bold text-slate-800 dark:text-slate-200 block">
              {isMM ? 'မှတ်ပုံတင် ဓာတ်ပုံ ပူးတွဲတင်ပြခြင်း' : 'Document Photos & Selfie'}
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {/* Front Photo */}
              <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-3 text-center bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center min-h-[110px] relative overflow-hidden group">
                {idFrontUrl ? (
                  <img
                    src={idFrontUrl}
                    alt="ID Front"
                    className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-slate-400 mb-1" />
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                      ID Front (အရှေ့)
                    </span>
                  </>
                )}
                <button
                  type="button"
                  onClick={() =>
                    setIdFrontUrl(
                      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80'
                    )
                  }
                  className="absolute inset-0 bg-slate-950/70 text-white text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  {idFrontUrl ? 'Change' : 'Upload'}
                </button>
              </div>

              {/* Back Photo */}
              <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-3 text-center bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center min-h-[110px] relative overflow-hidden group">
                {idBackUrl ? (
                  <img
                    src={idBackUrl}
                    alt="ID Back"
                    className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-slate-400 mb-1" />
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                      ID Back (အနောက်)
                    </span>
                  </>
                )}
                <button
                  type="button"
                  onClick={() =>
                    setIdBackUrl(
                      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80'
                    )
                  }
                  className="absolute inset-0 bg-slate-950/70 text-white text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  {idBackUrl ? 'Change' : 'Upload'}
                </button>
              </div>

              {/* Selfie with ID */}
              <div className="col-span-2 sm:col-span-1 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-3 text-center bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center min-h-[110px] relative overflow-hidden group">
                {selfieUrl ? (
                  <img
                    src={selfieUrl}
                    alt="Selfie"
                    className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <>
                    <Camera className="w-5 h-5 text-slate-400 mb-1" />
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                      Selfie with ID (ကိုယ်တိုင်)
                    </span>
                  </>
                )}
                <button
                  type="button"
                  onClick={() =>
                    setSelfieUrl(
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
                    )
                  }
                  className="absolute inset-0 bg-slate-950/70 text-white text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  {selfieUrl ? 'Change' : 'Upload'}
                </button>
              </div>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              {isMM
                ? 'သင်၏ အထောက်အထားစာရွက်စာတမ်းများကို ၂၅၆-ဘစ် စာဝှက်စနစ်ဖြင့် လုံခြုံစွာသိမ်းဆည်းထားပြီး အက်ဒမင်မှလွဲ၍ မည်သူမျှ ကြည့်ရှုခွင့်မရှိပါ'
                : 'Your documents are 256-bit encrypted and only accessed by authorized compliance officers.'}
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-cyan-500/25 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {isSubmitting ? (
              <span className="animate-pulse">{isMM ? 'တင်သွင်းနေပါသည်...' : 'Submitting...'}</span>
            ) : (
              <>
                <UserCheck className="w-4 h-4" />
                <span>{isMM ? 'စိစစ်ရန် တင်သွင်းမည် (Submit KYC)' : 'Submit KYC for Review'}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

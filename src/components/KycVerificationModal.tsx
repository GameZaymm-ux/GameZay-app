import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { KycStatus, KycSubmission } from '../types';
import { uploadKycDocument } from '../lib/supabaseClient';
import {
  ShieldCheck,
  X,
  Upload,
  Camera,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Lock,
  Loader2,
  Clock,
  HelpCircle,
  FileCheck,
  CreditCard,
  UserCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface KycVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitKyc: (submission: Omit<KycSubmission, 'id' | 'status' | 'submittedAt'>) => Promise<void> | void;
  currentKycStatus?: KycStatus;
  userId?: string;
  initialFullName?: string;
  initialPhone?: string;
}

export const KycVerificationModal: React.FC<KycVerificationModalProps> = ({
  isOpen,
  onClose,
  onSubmitKyc,
  currentKycStatus = 'NOT_SUBMITTED',
  userId = 'guest',
  initialFullName = '',
  initialPhone = '',
}) => {
  const { isMM } = useLanguage();

  const [fullName, setFullName] = useState(initialFullName);
  const [nrcNumber, setNrcNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(initialPhone);
  
  // Document URLs (Supabase storage or Base64 fallback)
  const [idFrontUrl, setIdFrontUrl] = useState('');
  const [idBackUrl, setIdBackUrl] = useState('');
  const [selfieUrl, setSelfieUrl] = useState('');

  // Uploading state per field
  const [isUploadingFront, setIsUploadingFront] = useState(false);
  const [isUploadingBack, setIsUploadingBack] = useState(false);
  const [isUploadingSelfie, setIsUploadingSelfie] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Hidden File Input Refs
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  // Sync props on open
  useEffect(() => {
    if (isOpen) {
      if (initialFullName && !fullName) setFullName(initialFullName);
      if (initialPhone && !phoneNumber) setPhoneNumber(initialPhone);
      setErrorMsg('');
    }
  }, [isOpen, initialFullName, initialPhone]);

  if (!isOpen) return null;

  const isAlreadyPending = currentKycStatus === 'PENDING';
  const isAlreadyVerified = currentKycStatus === 'VERIFIED';

  // Handle direct file uploads for KYC photos
  const handleFileUpload = async (
    file: File,
    type: 'front' | 'back' | 'selfie'
  ) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg(isMM ? 'ကျေးဇူးပြု၍ ဓာတ်ပုံဖိုင် (JPG/PNG/WEBP) ကိုသာ ရွေးချယ်ပါ' : 'Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg(isMM ? 'ဓာတ်ပုံဖိုင်ဆိုဒ်သည် 8MB ထက် မကျော်ရပါ' : 'Image file size must not exceed 8MB.');
      return;
    }

    setErrorMsg('');
    if (type === 'front') setIsUploadingFront(true);
    if (type === 'back') setIsUploadingBack(true);
    if (type === 'selfie') setIsUploadingSelfie(true);

    try {
      const res = await uploadKycDocument(userId, file, type);
      if (res.success && res.publicUrl) {
        if (type === 'front') setIdFrontUrl(res.publicUrl);
        if (type === 'back') setIdBackUrl(res.publicUrl);
        if (type === 'selfie') setSelfieUrl(res.publicUrl);
      } else {
        setErrorMsg(res.error || (isMM ? 'ပုံတင်ခြင်း မအောင်မြင်ပါ' : 'Failed to upload photo'));
      }
    } catch (err: any) {
      setErrorMsg(err?.message || (isMM ? 'ပုံတင်ရာတွင် ချို့ယွင်းချက်ဖြစ်ပေါ်ပါသည်' : 'Upload error'));
    } finally {
      if (type === 'front') setIsUploadingFront(false);
      if (type === 'back') setIsUploadingBack(false);
      if (type === 'selfie') setIsUploadingSelfie(false);
    }
  };

  const handleUseSampleDocuments = () => {
    setFullName('ဦးကျော်ဇေယျာမျိုး');
    setNrcNumber('12/DAGAMA(N)123456');
    setPhoneNumber('09450123456');
    setIdFrontUrl('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80');
    setIdBackUrl('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80');
    setSelfieUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80');
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg(isMM ? 'အမည်ရင်း (မှတ်ပုံတင်ပါအတိုင်း) ထည့်သွင်းပေးပါ' : 'Please enter your Full Legal Name.');
      return;
    }
    if (!nrcNumber.trim()) {
      setErrorMsg(isMM ? 'မှတ်ပုံတင်အမှတ် (ဥပမာ- 12/DAGAMA(N)000000) ထည့်သွင်းပေးပါ' : 'Please enter your NRC Number.');
      return;
    }
    if (!phoneNumber.trim()) {
      setErrorMsg(isMM ? 'ဖုန်းနံပါတ် ထည့်သွင်းပေးပါ' : 'Please enter your contact phone number.');
      return;
    }
    if (!idFrontUrl) {
      setErrorMsg(isMM ? 'မှတ်ပုံတင် အရှေ့ဘက်ပုံ ပူးတွဲပေးပါ' : 'Please upload Front of NRC.');
      return;
    }
    if (!idBackUrl) {
      setErrorMsg(isMM ? 'မှတ်ပုံတင် အနောက်ဘက်ပုံ ပူးတွဲပေးပါ' : 'Please upload Back of NRC.');
      return;
    }
    if (!selfieUrl) {
      setErrorMsg(isMM ? 'မှတ်ပုံတင်ကိုင်ဆောင်ထားသော ကိုယ်တိုင်ဓာတ်ပုံ (Selfie) ပူးတွဲပေးပါ' : 'Please upload Selfie holding your NRC.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await onSubmitKyc({
        userId,
        fullName: fullName.trim(),
        idType: 'NRC',
        idNumber: nrcNumber.trim().toUpperCase(),
        phoneNumber: phoneNumber.trim(),
        idFrontUrl,
        idBackUrl,
        selfieUrl,
      });

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || (isMM ? 'တင်သွင်းမှု မအောင်မြင်ပါ' : 'Submission failed.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-cyan-600 via-blue-700 to-indigo-800 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
              <ShieldCheck className="w-7 h-7 text-cyan-300" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-400/20 text-cyan-200 text-[10px] font-bold uppercase tracking-wider mb-1 border border-cyan-300/30">
                <Sparkles className="w-3 h-3 text-cyan-300" />
                <span>Myanmar Verified Seller (Level 2)</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black">
                {isMM ? 'မှတ်ပုံတင် စိစစ်ခြင်း (KYC Form)' : 'Myanmar KYC Verification'}
              </h3>
              <p className="text-xs text-cyan-100/90 mt-0.5">
                {isMM
                  ? 'လုံခြုံစိတ်ချရသော ဂိမ်းအကောင့် ရောင်းချခွင့် ရရှိရန် နိုင်ငံသားစိစစ်ရေးကတ်ပြားဖြင့် အတည်ပြုပါ'
                  : 'Submit Myanmar NRC documents to unlock Seller Studio and start selling accounts'}
              </p>
            </div>
          </div>
        </div>

        {/* If user is ALREADY PENDING or VERIFIED: show status card and locked state */}
        {isAlreadyPending ? (
          <div className="p-6 sm:p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 border border-amber-500/30 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h4 className="text-lg font-black text-slate-900 dark:text-white">
                {isMM ? 'သင်၏ KYC လျှောက်ထားမှုကို စိစစ်နေပါသည်' : 'KYC Application Under Review'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {isMM
                  ? 'သင်တင်သွင်းထားသော မှတ်ပုံတင် အချက်အလက်များနှင့် ဓာတ်ပုံများကို အက်ဒမင်မှ စစ်ဆေးစိစစ်နေပါသည်။ စိစစ်အတည်ပြုပြီးပါက Seller Studio အလိုအလျောက် ပွင့်သွားမည်ဖြစ်ပါသည်။'
                  : 'Your NRC submission is currently being reviewed by our compliance team. Once verified, Seller Studio will automatically unlock.'}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-medium max-w-sm mx-auto">
              ⏱️ {isMM ? 'ခန့်မှန်းကြာချိန် - ၃၀ မိနစ်မှ ၂၄ နာရီအတွင်း' : 'Estimated review time: 30 minutes to 24 hours'}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
            >
              {isMM ? 'ပိတ်မည်' : 'Close'}
            </button>
          </div>
        ) : isAlreadyVerified ? (
          <div className="p-6 sm:p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h4 className="text-lg font-black text-slate-900 dark:text-white">
                {isMM ? 'KYC စိစစ်အတည်ပြုပြီးဖြစ်ပါသည်' : 'KYC Verification Approved'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {isMM
                  ? 'သင်သည် GameZay ၏ အတည်ပြုပြီး ရောင်းသူ (Level 2 Verified Seller) ဖြစ်ပြီး Seller Studio အသုံးပြုခွင့် ရရှိထားပါသည်။'
                  : 'You are an official Level 2 Verified Seller with full access to Seller Studio and escrow sales.'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-2xl bg-emerald-500 text-slate-950 font-black text-xs hover:bg-emerald-400 transition cursor-pointer shadow-md shadow-emerald-500/20"
            >
              {isMM ? 'ကောင်းပြီ' : 'Got it'}
            </button>
          </div>
        ) : (
          /* Form Body */
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Quick Autofill Sample Button */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                  {isMM ? 'စမ်းသပ်ရန် မြန်မာ့နမူနာအချက်အလက် ဖြည့်မည်လား?' : 'Fill sample Myanmar NRC documents to quick-test?'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleUseSampleDocuments}
                className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-[11px] shadow transition cursor-pointer active:scale-95"
              >
                {isMM ? 'နမူနာဖြည့်ပါ' : 'Auto Fill'}
              </button>
            </div>

            {/* Form Fields: Myanmar NRC Focus */}
            <div className="space-y-3.5">
              {/* 1. Full Legal Name as per NRC */}
              <div>
                <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  {isMM ? '၁။ အမည်ရင်း (မှတ်ပုံတင်ပါအတိုင်း)' : '1. Full Name (as per NRC)'} *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. ဦးကျော်ဇေယျာမျိုး / U Kyaw Zayar Myo"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-cyan-500 transition"
                  required
                />
              </div>

              {/* 2. NRC Number & 3. Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                    {isMM ? '၂။ မှတ်ပုံတင်အမှတ်' : '2. NRC Number'} *
                  </label>
                  <input
                    type="text"
                    value={nrcNumber}
                    onChange={(e) => setNrcNumber(e.target.value)}
                    placeholder="12/DAGAMA(N)123456"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-cyan-500 transition uppercase placeholder:normal-case"
                    required
                  />
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-mono">
                    Format: 12/DAGAMA(N)000000
                  </p>
                </div>

                <div>
                  <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                    {isMM ? '၃။ ဆက်သွယ်ရန် ဖုန်းနံပါတ်' : '3. Phone Number'} *
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="09450012345"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-cyan-500 transition"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Hidden Native File Inputs */}
            <input
              ref={frontInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, 'front');
              }}
            />
            <input
              ref={backInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, 'back');
              }}
            />
            <input
              ref={selfieInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, 'selfie');
              }}
            />

            {/* Document Upload Cards (Myanmar NRC Front, NRC Back, Selfie) */}
            <div className="space-y-2 pt-1">
              <label className="font-bold text-slate-800 dark:text-slate-200 block">
                {isMM ? '၄။ မှတ်ပုံတင်ဓာတ်ပုံများနှင့် ကိုယ်တိုင်ဓာတ်ပုံ ပူးတွဲတင်ပြခြင်း' : '4. NRC Document Photos & Selfie'} *
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. NRC Front Photo */}
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 rounded-2xl p-3 text-center bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center min-h-[130px] relative overflow-hidden transition group">
                  {idFrontUrl ? (
                    <>
                      <img
                        src={idFrontUrl}
                        alt="NRC Front"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 p-1 rounded-full bg-emerald-500 text-slate-950 shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    </>
                  ) : isUploadingFront ? (
                    <div className="flex flex-col items-center gap-1.5 text-cyan-500">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span className="text-[10px] font-bold">{isMM ? 'တင်နေသည်...' : 'Uploading...'}</span>
                    </div>
                  ) : (
                    <>
                      <CreditCard className="w-6 h-6 text-slate-400 mb-1 group-hover:text-cyan-500 transition" />
                      <span className="text-[11px] font-black text-slate-800 dark:text-slate-200">
                        {isMM ? 'မှတ်ပုံတင် အရှေ့ဘက်' : 'NRC Front'}
                      </span>
                      <span className="text-[9px] text-slate-400 mt-0.5">
                        {isMM ? 'ကတ်ပြား အရှေ့ခြမ်း' : 'Front of NRC'}
                      </span>
                    </>
                  )}

                  <button
                    type="button"
                    disabled={isUploadingFront}
                    onClick={() => frontInputRef.current?.click()}
                    className={`absolute inset-0 bg-slate-950/75 text-white text-[11px] font-black flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      idFrontUrl ? 'opacity-0 group-hover:opacity-100' : 'opacity-0 hover:opacity-100'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{idFrontUrl ? (isMM ? 'ပြန်တင်မည်' : 'Change') : (isMM ? 'ဓာတ်ပုံရွေးမည်' : 'Upload')}</span>
                  </button>
                </div>

                {/* 2. NRC Back Photo */}
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 rounded-2xl p-3 text-center bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center min-h-[130px] relative overflow-hidden transition group">
                  {idBackUrl ? (
                    <>
                      <img
                        src={idBackUrl}
                        alt="NRC Back"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 p-1 rounded-full bg-emerald-500 text-slate-950 shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    </>
                  ) : isUploadingBack ? (
                    <div className="flex flex-col items-center gap-1.5 text-cyan-500">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span className="text-[10px] font-bold">{isMM ? 'တင်နေသည်...' : 'Uploading...'}</span>
                    </div>
                  ) : (
                    <>
                      <FileCheck className="w-6 h-6 text-slate-400 mb-1 group-hover:text-cyan-500 transition" />
                      <span className="text-[11px] font-black text-slate-800 dark:text-slate-200">
                        {isMM ? 'မှတ်ပုံတင် အနောက်ဘက်' : 'NRC Back'}
                      </span>
                      <span className="text-[9px] text-slate-400 mt-0.5">
                        {isMM ? 'ကတ်ပြား အနောက်ခြမ်း' : 'Back of NRC'}
                      </span>
                    </>
                  )}

                  <button
                    type="button"
                    disabled={isUploadingBack}
                    onClick={() => backInputRef.current?.click()}
                    className={`absolute inset-0 bg-slate-950/75 text-white text-[11px] font-black flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      idBackUrl ? 'opacity-0 group-hover:opacity-100' : 'opacity-0 hover:opacity-100'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{idBackUrl ? (isMM ? 'ပြန်တင်မည်' : 'Change') : (isMM ? 'ဓာတ်ပုံရွေးမည်' : 'Upload')}</span>
                  </button>
                </div>

                {/* 3. Selfie holding NRC */}
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 rounded-2xl p-3 text-center bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center min-h-[130px] relative overflow-hidden transition group">
                  {selfieUrl ? (
                    <>
                      <img
                        src={selfieUrl}
                        alt="Selfie with NRC"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 p-1 rounded-full bg-emerald-500 text-slate-950 shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    </>
                  ) : isUploadingSelfie ? (
                    <div className="flex flex-col items-center gap-1.5 text-cyan-500">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span className="text-[10px] font-bold">{isMM ? 'တင်နေသည်...' : 'Uploading...'}</span>
                    </div>
                  ) : (
                    <>
                      <Camera className="w-6 h-6 text-slate-400 mb-1 group-hover:text-cyan-500 transition" />
                      <span className="text-[11px] font-black text-slate-800 dark:text-slate-200">
                        {isMM ? 'မှတ်ပုံတင်ကိုင်ဆောင် Selfie' : 'Selfie with NRC'}
                      </span>
                      <span className="text-[9px] text-slate-400 mt-0.5">
                        {isMM ? 'မျက်နှာနှင့် ကတ်ပြား' : 'Holding NRC'}
                      </span>
                    </>
                  )}

                  <button
                    type="button"
                    disabled={isUploadingSelfie}
                    onClick={() => selfieInputRef.current?.click()}
                    className={`absolute inset-0 bg-slate-950/75 text-white text-[11px] font-black flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      selfieUrl ? 'opacity-0 group-hover:opacity-100' : 'opacity-0 hover:opacity-100'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{selfieUrl ? (isMM ? 'ပြန်တင်မည်' : 'Change') : (isMM ? 'ဓာတ်ပုံရိုက်/ရွေးမည်' : 'Upload')}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Privacy & Encryption Note */}
            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                {isMM
                  ? 'သင်၏ မှတ်ပုံတင် အချက်အလက်များနှင့် ဓာတ်ပုံများကို ၂၅၆-ဘစ် စာဝှက်စနစ်ဖြင့် လုံခြုံစွာသိမ်းဆည်းထားပြီး ရောင်းသူအတည်ပြုစိစစ်ရန်အတွက်သာ အသုံးပြုပါသည်။'
                  : 'All Myanmar NRC document uploads are 256-bit encrypted and exclusively reviewed by compliance officers for seller verification.'}
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || isUploadingFront || isUploadingBack || isUploadingSelfie}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-cyan-500/25 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isMM ? 'တင်သွင်းနေပါသည်...' : 'Submitting NRC Verification...'}</span>
                </span>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>{isMM ? 'KYC စိစစ်ရန် တင်သွင်းမည် (Submit NRC Verification)' : 'Submit KYC for Review'}</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

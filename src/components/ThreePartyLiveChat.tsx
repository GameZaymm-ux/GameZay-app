import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ChatMessage, EscrowOrder, UserRole } from '../types';
import {
  Send,
  Image as ImageIcon,
  Shield,
  ShieldAlert,
  User,
  Zap,
  CheckCircle,
  Clock,
  Sparkles,
  Paperclip,
  X,
  ExternalLink,
  Bot,
  AlertTriangle,
} from 'lucide-react';

interface ThreePartyLiveChatProps {
  order: EscrowOrder;
  currentRole?: UserRole;
  onSendMessage: (orderId: string, message: Omit<ChatMessage, 'id' | 'createdAt' | 'orderId'>) => void;
  onRequestMoreProof?: (orderId: string) => void;
  className?: string;
  isCompact?: boolean;
}

export const ThreePartyLiveChat: React.FC<ThreePartyLiveChatProps> = ({
  order,
  currentRole = 'BUYER',
  onSendMessage,
  onRequestMoreProof,
  className = '',
  isCompact = false,
}) => {
  const { t, isMM } = useLanguage();
  const [inputText, setInputText] = useState('');
  const [activeSenderRole, setActiveSenderRole] = useState<'BUYER' | 'SELLER' | 'ADMIN'>(
    currentRole === 'ADMIN' ? 'ADMIN' : currentRole === 'SELLER' ? 'SELLER' : 'BUYER'
  );
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [selectedProofPreview, setSelectedProofPreview] = useState<string | null>(null);
  const [isSamplePickerOpen, setIsSamplePickerOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messages = order.chatMessages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, attachedImage]);

  // Synchronize when currentRole prop changes
  useEffect(() => {
    if (currentRole === 'ADMIN') setActiveSenderRole('ADMIN');
    else if (currentRole === 'SELLER') setActiveSenderRole('SELLER');
  }, [currentRole]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !attachedImage) return;

    let senderName = order.buyerName;
    let senderAvatar = 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80';

    if (activeSenderRole === 'SELLER') {
      senderName = order.sellerName;
      senderAvatar = order.listing?.seller?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
    } else if (activeSenderRole === 'ADMIN') {
      senderName = isMM ? 'GameZay အငြင်းပွားမှု ကြီးကြပ်ရေးမှူး' : 'GameZay Escrow Dispute Admin';
      senderAvatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80';
    }

    onSendMessage(order.id, {
      senderRole: activeSenderRole,
      senderName,
      senderAvatar,
      text: inputText.trim(),
      attachmentUrl: attachedImage || undefined,
      attachmentType: attachedImage ? 'IMAGE' : undefined,
    });

    setInputText('');
    setAttachedImage(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAttachedImage(url);
    }
  };

  // Sample quick proof images for testing
  const sampleProofs = [
    {
      title: isMM ? 'လော့အင် စကားဝှက်မှားယွင်းမှု' : 'Login / Password Error Proof',
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: isMM ? 'အကောင့် Stats/စကင်း မကိုက်ညီမှု' : 'Stats & Skins Mismatch Proof',
      url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: isMM ? 'အီးမေးလ် ချိတ်ဆက်မှု အဆင်ပြေကြောင်း' : 'Email Unbind Complete Proof',
      url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=80',
    },
  ];

  // Quick prompt chips
  const quickPrompts = activeSenderRole === 'ADMIN' ? [
    isMM ? 'အချက်အလက် စစ်ဆေးနေပါသည်' : 'Admin is currently investigating the case.',
    isMM ? 'ကျေးဇူးပြု၍ ၁၂ နာရီအတွင်း သက်သေ Screenshot ပို့ပေးပါ' : 'Please submit screen recording proof within 12 hours.',
    isMM ? 'ရောင်းသူထံမှ OTP ကုဒ် တောင်းဆိုထားပါသည်' : 'Waiting for Seller OTP confirmation.',
  ] : activeSenderRole === 'SELLER' ? [
    isMM ? 'Password မှန်ကန်ပါသည်၊ ပြန်လည် စမ်းသပ်ကြည့်ပါ' : 'Credentials are verified. Please re-try login.',
    isMM ? 'အီးမေးလ်သို့ OTP ကုဒ် ပို့ပေးထားပါသည်' : 'OTP verification code has been dispatched.',
    isMM ? 'Gmail bind ပြောင်းလဲပြီးပါက အတည်ပြုပေးပါ' : 'Please confirm once Gmail is re-linked.',
  ] : [
    isMM ? 'ဝင်ရောက် စစ်ဆေးနေဆဲ ဖြစ်ပါသည်' : 'Currently logging in and inspecting the account.',
    isMM ? 'Password ဝင်မရပါ၊ စစ်ဆေးပေးပါ' : 'Password gives an error, please check.',
    isMM ? 'အချက်အလက်များ အားလုံး စုံလင် မှန်ကန်ပါသည်' : 'Account specs verified successfully!',
  ];

  return (
    <div
      className={`flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-lg transition-colors ${className}`}
    >
      {/* 3-Party Chat Header */}
      <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-rose-500 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-950" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                {isMM ? '၃ ဦးပါဝင်သော တိုက်ရိုက် Escrow စကားပြောခန်း' : '3-Party Escrow Live Room'}
              </h3>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-300 dark:border-emerald-500/30 flex items-center gap-1">
                <Zap className="w-3 h-3 text-emerald-500" />
                <span>Live Encrypted</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
              <span>{isMM ? 'ပါဝင်သူများ:' : 'Room Members:'}</span>
              <strong className="text-cyan-600 dark:text-cyan-400">[Buyer]</strong>
              <span>•</span>
              <strong className="text-amber-600 dark:text-amber-400">[Seller]</strong>
              <span>•</span>
              <strong className="text-rose-600 dark:text-rose-400">[Escrow Admin]</strong>
            </p>
          </div>
        </div>

        {/* Simulator Role Selector Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-200/70 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-300 dark:border-slate-700 text-xs">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 px-1.5 hidden sm:inline">
            {isMM ? 'စာပို့မည့်သူ:' : 'Simulate as:'}
          </span>
          {(['BUYER', 'SELLER', 'ADMIN'] as const).map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setActiveSenderRole(role)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                activeSenderRole === role
                  ? role === 'BUYER'
                    ? 'bg-cyan-500 text-slate-950 shadow'
                    : role === 'SELLER'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'bg-rose-500 text-white shadow'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {role === 'BUYER'
                ? isMM ? 'ဝယ်သူ' : 'Buyer'
                : role === 'SELLER'
                ? isMM ? 'ရောင်းသူ' : 'Seller'
                : isMM ? 'အက်ဒမင်' : 'Admin'}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className={`p-4 space-y-3 overflow-y-auto bg-slate-100/60 dark:bg-slate-950/50 ${isCompact ? 'h-72' : 'h-96 sm:h-[420px]'}`}>
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-6">
            <Bot className="w-10 h-10 text-cyan-500 mb-2 opacity-70" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {isMM ? 'စကားပြောမှတ်တမ်း မရှိသေးပါ' : '3-Party Escrow Chat is Ready'}
            </p>
            <p className="text-[11px] text-slate-500 max-w-xs mt-1">
              {isMM
                ? 'ဝယ်သူ၊ ရောင်းသူနှင့် အက်ဒမင်တို့ ဤနေရာတွင် တိုက်ရိုက် စကားပြောဆိုနိုင်ပါသည်'
                : 'Buyer, Seller, and Escrow Admin can communicate securely here.'}
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            // System Notification Bubble
            if (msg.senderRole === 'SYSTEM') {
              return (
                <div key={msg.id} className="flex items-center justify-center my-2">
                  <div className="max-w-md px-3.5 py-1.5 rounded-full bg-slate-200/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700/80 text-[11px] text-slate-700 dark:text-slate-300 text-center shadow-sm flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                    <span>{msg.text}</span>
                  </div>
                </div>
              );
            }

            const isBuyer = msg.senderRole === 'BUYER';
            const isSeller = msg.senderRole === 'SELLER';
            const isAdmin = msg.senderRole === 'ADMIN';

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 max-w-[88%] sm:max-w-[80%] ${
                  isBuyer ? 'mr-auto' : isSeller ? 'ml-auto flex-row-reverse' : 'mx-auto'
                }`}
              >
                {/* Avatar */}
                {msg.senderAvatar ? (
                  <img
                    src={msg.senderAvatar}
                    alt={msg.senderName}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover shrink-0 border-2 ${
                      isBuyer
                        ? 'border-cyan-500'
                        : isSeller
                        ? 'border-amber-500'
                        : 'border-rose-500 ring-2 ring-rose-500/20'
                    }`}
                  />
                ) : (
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isBuyer
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500'
                        : isSeller
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500'
                        : 'bg-rose-500 text-white'
                    }`}
                  >
                    {msg.senderName.charAt(0)}
                  </div>
                )}

                {/* Message Body */}
                <div
                  className={`flex flex-col space-y-1 ${
                    isBuyer ? 'items-start' : isSeller ? 'items-end' : 'items-center'
                  }`}
                >
                  {/* Sender Name & Role Badge */}
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {msg.senderName}
                    </span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider ${
                        isBuyer
                          ? 'bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/30'
                          : isSeller
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30'
                          : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-500/30 flex items-center gap-0.5'
                      }`}
                    >
                      {isAdmin && <Shield className="w-2.5 h-2.5 text-rose-500" />}
                      {isBuyer ? 'Buyer' : isSeller ? 'Seller' : 'Escrow Admin'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm break-words max-w-full ${
                      isBuyer
                        ? 'bg-white dark:bg-slate-900 border border-cyan-200 dark:border-cyan-800/60 text-slate-900 dark:text-slate-100 rounded-tl-none'
                        : isSeller
                        ? 'bg-amber-500/10 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-slate-900 dark:text-slate-100 rounded-tr-none'
                        : 'bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-400 dark:border-rose-500/60 text-slate-900 dark:text-rose-100 rounded-2xl shadow-md'
                    }`}
                  >
                    {msg.text}

                    {/* Image Attachment Preview */}
                    {msg.attachmentUrl && (
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={() => setSelectedProofPreview(msg.attachmentUrl!)}
                          className="relative rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 group block cursor-pointer"
                        >
                          <img
                            src={msg.attachmentUrl}
                            alt="attachment proof"
                            className="max-h-48 w-auto rounded-lg object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-slate-950/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                            <span className="px-2 py-1 rounded bg-slate-950/80 text-[10px] text-white flex items-center gap-1 font-bold">
                              <ExternalLink className="w-3 h-3" />
                              <span>{isMM ? 'ပုံကြီးကြည့်ရန်' : 'View Full Image'}</span>
                            </span>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="px-3.5 py-2 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0">
          {isMM ? 'အမြန်ပို့ရန်:' : 'Quick Prompts:'}
        </span>
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setInputText(prompt)}
            className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-[11px] hover:bg-cyan-500 hover:text-slate-950 transition shrink-0 cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Attachment Preview Box */}
      {attachedImage && (
        <div className="px-4 py-2 bg-cyan-50 dark:bg-cyan-950/40 border-t border-cyan-200 dark:border-cyan-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={attachedImage}
              alt="attached preview"
              className="w-10 h-10 rounded-lg object-cover border border-cyan-400"
            />
            <div className="text-[11px]">
              <span className="font-bold text-cyan-900 dark:text-cyan-300 block">
                {isMM ? 'သက်သေ Screenshot ပုံရိပ် တွဲထားသည်' : 'Proof Screenshot Attached'}
              </span>
              <span className="text-cyan-700 dark:text-cyan-400 text-[10px]">
                Ready to send in 3-party dispute log
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAttachedImage(null)}
            className="p-1 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Chat Input & Attachment Toolbar */}
      <form
        onSubmit={handleSend}
        className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
      >
        {/* Sample Proofs Picker Dropdown Toggle */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsSamplePickerOpen(!isSamplePickerOpen)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-cyan-400 transition"
            title="Attach Demo Proof Screenshot"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          {isSamplePickerOpen && (
            <div className="absolute bottom-12 left-0 z-30 w-64 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-150">
              <span className="text-[10px] font-bold text-slate-400 block px-2 py-1">
                {isMM ? 'နမူနာ သက်သေပုံ တွဲရန်:' : 'Select Proof Sample:'}
              </span>
              {sampleProofs.map((item, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setAttachedImage(item.url);
                    setIsSamplePickerOpen(false);
                  }}
                  className="w-full p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-left transition cursor-pointer"
                >
                  <img src={item.url} alt="sample" className="w-7 h-7 rounded-lg object-cover" />
                  <span className="text-xs text-slate-800 dark:text-slate-200 line-clamp-1">{item.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Real File Uploader Input */}
        <label className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-cyan-400 transition cursor-pointer">
          <Paperclip className="w-4 h-4" />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        {/* Text Input */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            activeSenderRole === 'BUYER'
              ? isMM ? 'ဝယ်သူအဖြစ် စာရေးရန်...' : 'Write message as Buyer...'
              : activeSenderRole === 'SELLER'
              ? isMM ? 'ရောင်းသူအဖြစ် စာရေးရန်...' : 'Write message as Seller...'
              : isMM ? 'အက်ဒမင်အဖြစ် စာရေးရန်...' : 'Write formal message as Escrow Admin...'
          }
          className="flex-1 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!inputText.trim() && !attachedImage}
          className={`p-2.5 rounded-xl font-bold transition flex items-center justify-center cursor-pointer ${
            activeSenderRole === 'ADMIN'
              ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-md shadow-rose-500/30'
              : activeSenderRole === 'SELLER'
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/30'
              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/30'
          } disabled:opacity-40 disabled:cursor-not-allowed`}
          aria-label="Send Message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Lightbox Modal Preview */}
      {selectedProofPreview && (
        <div
          onClick={() => setSelectedProofPreview(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md cursor-pointer animate-in fade-in"
        >
          <div className="relative max-w-2xl w-full bg-slate-900 rounded-3xl p-4 border border-slate-700 shadow-2xl">
            <img
              src={selectedProofPreview}
              alt="proof detail"
              className="w-full h-auto max-h-[80vh] object-contain rounded-2xl"
            />
            <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
              <span>{isMM ? 'သက်သေပြ ပုံရိပ် အပြည့်အစုံ' : 'Dispute Evidence Screenshot'}</span>
              <span className="font-bold text-cyan-400">{isMM ? 'ပိတ်ရန် နှိပ်ပါ' : 'Click anywhere to close'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

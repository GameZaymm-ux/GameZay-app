import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Gamepad2, ShieldCheck, Lock, Heart, PhoneCall, Send, MessageCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t, isMM } = useLanguage();

  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 text-xs mt-16">
      {/* Top Escrow & Payment Partner Row */}
      <div className="border-b border-slate-800/80 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  {isMM ? '၁၀၀% လုံခြုံသော အလယ်လူ Escrow ငွေလွှဲစနစ်' : '100% Escrow Buyer Protection Guaranteed'}
                </h4>
                <p className="text-xs text-slate-400">
                  {isMM
                    ? 'ဝယ်သူ အကောင့်စစ်ဆေးအတည်ပြုပြီးမှသာ ငွေလွှဲပေးပါသည်'
                    : 'Zero risk of fraud. Funds disbursed strictly upon buyer verification.'}
                </p>
              </div>
            </div>

            {/* Payment Method Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-blue-950/80 border border-blue-500/40 text-blue-300 font-bold text-[11px]">
                KBZPay
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-300 font-bold text-[11px]">
                WaveMoney
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 font-bold text-[11px]">
                AyaPay
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 font-bold text-[11px]">
                CB Pay
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold text-[11px]">
                USDT (TRC20)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <span className="text-base font-black text-white">
                GameZay<span className="text-cyan-400">.MM</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isMM
                ? 'မြန်မာနိုင်ငံရှိ ဂိမ်းအကောင့်များ (eFootball, MLBB, PUBG, COC) အား လုံခြုံစိတ်ချစွာ အရောင်းအဝယ်ပြုလုပ်နိုင်သော နံပါတ် ၁ Escrow စျေးကွက်။'
                : 'The premier Myanmar marketplace for verified gaming accounts with built-in escrow and local wallet payouts.'}
            </p>
          </div>

          {/* Col 2: Supported Games */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">
              {isMM ? 'ထိပ်တန်း ဂိမ်းအမျိုးအစားများ' : 'Featured Games'}
            </h5>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li className="hover:text-cyan-300 transition cursor-pointer">⚽ eFootball 2025 (Konami ID)</li>
              <li className="hover:text-amber-300 transition cursor-pointer">⚔️ Mobile Legends (Bang Bang)</li>
              <li className="hover:text-orange-300 transition cursor-pointer">🎯 PUBG Mobile (Glacier / Mythic)</li>
              <li className="hover:text-yellow-300 transition cursor-pointer">🏰 Clash of Clans (TH16 / Max Base)</li>
            </ul>
          </div>

          {/* Col 3: Escrow & Trust */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">
              {isMM ? 'လုံခြုံရေးနှင့် စည်းကမ်းချက်များ' : 'Escrow & Policies'}
            </h5>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li className="hover:text-emerald-300 transition cursor-pointer">🛡️ 24-Hour Buyer Warranty</li>
              <li className="hover:text-cyan-300 transition cursor-pointer">⚡ KPay & WavePay Instant Handoff</li>
              <li className="hover:text-purple-300 transition cursor-pointer">🔐 Encrypted Credential Vault</li>
              <li className="hover:text-rose-300 transition cursor-pointer">⚖️ Admin Dispute Mediation</li>
            </ul>
          </div>

          {/* Col 4: Myanmar Support */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">
              {isMM ? 'ဆက်သွယ်ရန် (Support 24/7)' : 'Myanmar Support Desk'}
            </h5>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-cyan-400" />
                <span>Telegram: @GameZay_Escrow_MM</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-purple-400" />
                <span>Viber: +95 9 798 889 901</span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <span>Hotline: 09-798889901 (9 AM - 11 PM)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div>
            © 2026 GameZay MM Co., Ltd. All rights reserved. Made for Myanmar Gamers 🇲🇲
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-300 cursor-pointer">Terms of Escrow</span>
            <span>•</span>
            <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-300 cursor-pointer">KYC Guidelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

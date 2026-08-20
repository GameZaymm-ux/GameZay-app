import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Gamepad2, ShieldCheck, PhoneCall, Send, MessageCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 text-xs mt-12 sm:mt-16">
      {/* Top Escrow & Payment Partner Row */}
      <div className="border-b border-slate-800/80 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3 text-center md:text-left">
              <div className="p-2.5 rounded-2xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  {t('footer.escrowTitle')}
                </h4>
                <p className="text-xs text-slate-400">
                  {t('footer.escrowSubtitle')}
                </p>
              </div>
            </div>

            {/* Payment Method Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2">
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
                PromptPay
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
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
              {t('footer.brandDesc')}
            </p>
          </div>

          {/* Col 2: Supported Games */}
          <div className="space-y-2.5">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">
              {t('footer.featuredGames')}
            </h5>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li className="hover:text-cyan-300 transition cursor-pointer">⚽ eFootball 2026 (Konami ID)</li>
              <li className="hover:text-amber-300 transition cursor-pointer">⚔️ Mobile Legends (Bang Bang)</li>
              <li className="hover:text-orange-300 transition cursor-pointer">🎯 PUBG Mobile (Glacier / Mythic)</li>
              <li className="hover:text-yellow-300 transition cursor-pointer">🏰 Clash of Clans (TH16 / Max Base)</li>
            </ul>
          </div>

          {/* Col 3: Escrow & Trust */}
          <div className="space-y-2.5">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">
              {t('footer.policies')}
            </h5>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li className="hover:text-emerald-300 transition cursor-pointer">{t('footer.policyWarranty')}</li>
              <li className="hover:text-cyan-300 transition cursor-pointer">{t('footer.policyInstantHandoff')}</li>
              <li className="hover:text-purple-300 transition cursor-pointer">{t('footer.policyVault')}</li>
              <li className="hover:text-rose-300 transition cursor-pointer">{t('footer.policyArbitration')}</li>
            </ul>
          </div>

          {/* Col 4: Myanmar Support */}
          <div className="space-y-2.5">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">
              {t('footer.support')}
            </h5>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Telegram: @GameZay_Escrow_MM</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Viber: +95 9 798 889 901</span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t('footer.supportHours')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div>
            {t('footer.copyright')}
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-300 cursor-pointer">{t('footer.terms')}</span>
            <span>•</span>
            <span className="hover:text-slate-300 cursor-pointer">{t('footer.privacy')}</span>
            <span>•</span>
            <span className="hover:text-slate-300 cursor-pointer">{t('footer.kyc')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

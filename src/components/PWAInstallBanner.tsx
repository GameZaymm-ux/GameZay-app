import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Download, X, Smartphone, Sparkles, Share, PlusSquare } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const { t, isMM } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      // Check if dismissed in this session
      const dismissed = sessionStorage?.getItem('gamezay_pwa_dismissed');
      if (dismissed) return;
    } catch {
      // ignore storage access errors
    }

    try {
      // Detect iOS Safari
      const userAgent = window.navigator?.userAgent?.toLowerCase() || '';
      const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
      const isStandalone = (window.navigator as any)?.standalone;

      if (isIosDevice && !isStandalone) {
        setIsIOS(true);
        setShowBanner(true);
        return;
      }
    } catch {
      // ignore UA parsing errors
    }

    // Android / Desktop Chrome PWA prompt listener
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setShowBanner(false);
        }
        setDeferredPrompt(null);
      } catch {
        setShowBanner(false);
      }
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    try {
      sessionStorage?.setItem('gamezay_pwa_dismissed', 'true');
    } catch {
      // ignore
    }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed top-14 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-slate-900/95 backdrop-blur-xl border border-cyan-500/40 rounded-2xl p-4 shadow-2xl shadow-cyan-950/60 animate-in slide-in-from-top-4 duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-slate-950 font-black shrink-0 shadow-md shadow-cyan-500/30">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-black text-white">{t('pwa.installTitle')}</h4>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                PWA
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-1 leading-snug">
              {t('pwa.installDesc')}
            </p>

            {isIOS && (
              <div className="mt-2 text-[10px] text-cyan-300 bg-slate-950/80 p-2 rounded-lg border border-slate-800 flex items-center gap-1.5">
                <Share className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t('pwa.iosInstruction')}</span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {!isIOS && (
        <div className="mt-3 flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
          <button
            onClick={handleDismiss}
            className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-slate-400 hover:text-white transition"
          >
            {t('pwa.laterBtn')}
          </button>

          <button
            onClick={handleInstallClick}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 text-xs font-black shadow-md shadow-cyan-500/20 transition active:scale-95 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('pwa.installBtn')}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default PWAInstallBanner;

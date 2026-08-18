import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import {
  X,
  Palette,
  Globe,
  Coins,
  User,
  Shield,
  Sun,
  Moon,
  Laptop,
  Check,
  Smartphone,
  Lock,
  Send,
  Save,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'appearance' | 'language' | 'currency' | 'account' | 'security';
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'appearance',
}) => {
  const {
    t,
    language,
    setLanguage,
    currency,
    setCurrency,
    exchangeRate,
    formatMMK,
    formatTHB,
    convertMMKtoTHB,
    isMM,
  } = useLanguage();
  const { theme, setTheme, actualTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<'appearance' | 'language' | 'currency' | 'account' | 'security'>(initialTab);

  // Profile Form States
  const [username, setUsername] = useState('KyawZin_Gamer99');
  const [phone, setPhone] = useState('09450123456');
  const [email, setEmail] = useState('kyawzin.gaming@gmail.com');
  const [avatarUrl, setAvatarUrl] = useState('https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80');
  const [isProfileSaved, setIsProfileSaved] = useState(false);

  // Security Form States
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);
  const [isTelegramAlerts, setIsTelegramAlerts] = useState(true);
  const [isPasswordSaved, setIsPasswordSaved] = useState(false);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileSaved(true);
    setTimeout(() => setIsProfileSaved(false), 2500);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd && newPwd === confirmPwd) {
      setIsPasswordSaved(true);
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
      setTimeout(() => setIsPasswordSaved(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl min-h-screen sm:min-h-0 bg-white dark:bg-slate-900 border-0 sm:border border-slate-200 dark:border-slate-800 sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('settings.title')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('settings.subtitle')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Chips */}
        <div className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('appearance')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === 'appearance'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-900'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>{t('settings.tabs.appearance')}</span>
          </button>

          <button
            onClick={() => setActiveTab('currency')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === 'currency'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-900'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>{isMM ? 'ငွေကြေး (Currency)' : 'Currency'}</span>
          </button>

          <button
            onClick={() => setActiveTab('language')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === 'language'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{t('settings.tabs.language')}</span>
          </button>

          <button
            onClick={() => setActiveTab('account')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === 'account'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{t('settings.tabs.account')}</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === 'security'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{t('settings.tabs.security')}</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* TAB 1: APPEARANCE / THEME SWITCHER */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('settings.theme.title')}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t('settings.theme.desc')}
                </p>
              </div>

              {/* Theme Segment Selector Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* Dark Mode */}
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`p-4 rounded-2xl border text-left transition relative flex flex-col justify-between h-32 ${
                    theme === 'dark'
                      ? 'border-cyan-500 bg-slate-950 text-white ring-2 ring-cyan-500/30'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-950/80 text-slate-300 hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="p-2 rounded-xl bg-slate-900 text-cyan-400 border border-slate-800">
                      <Moon className="w-4 h-4" />
                    </div>
                    {theme === 'dark' && (
                      <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{t('settings.theme.dark')}</div>
                    <div className="text-[11px] text-slate-400">Deep OLED Slate</div>
                  </div>
                </button>

                {/* Light Mode */}
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`p-4 rounded-2xl border text-left transition relative flex flex-col justify-between h-32 ${
                    theme === 'light'
                      ? 'border-cyan-500 bg-slate-100 text-slate-900 ring-2 ring-cyan-500/30 shadow-md'
                      : 'border-slate-200 dark:border-slate-800 bg-white text-slate-700 hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="p-2 rounded-xl bg-amber-100 text-amber-600 border border-amber-200">
                      <Sun className="w-4 h-4" />
                    </div>
                    {theme === 'light' && (
                      <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{t('settings.theme.light')}</div>
                    <div className="text-[11px] text-slate-500">Clean Crisp White</div>
                  </div>
                </button>

                {/* System Mode */}
                <button
                  type="button"
                  onClick={() => setTheme('system')}
                  className={`p-4 rounded-2xl border text-left transition relative flex flex-col justify-between h-32 ${
                    theme === 'system'
                      ? 'border-cyan-500 bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white ring-2 ring-cyan-500/30'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                      <Laptop className="w-4 h-4" />
                    </div>
                    {theme === 'system' && (
                      <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {t('settings.theme.system')}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {actualTheme === 'dark' ? 'Auto (Dark active)' : 'Auto (Light active)'}
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CURRENCY SWITCHER (MMK & THB) */}
          {activeTab === 'currency' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isMM ? 'ငွေကြေး သတ်မှတ်ချက် (Currency Preference)' : 'Currency Display Preference'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isMM
                    ? 'စျေးနှုန်းများကို မြန်မာကျပ် (MMK) သို့မဟုတ် ထိုင်းဘတ် (THB ฿) ဖြင့် ပြသမည်'
                    : 'Base listings are in MMK. Select THB to auto-calculate prices in Thai Baht (฿).'}
                </p>
              </div>

              {/* Currency Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* MMK */}
                <button
                  type="button"
                  onClick={() => setCurrency('MMK')}
                  className={`p-4 rounded-2xl border text-left transition relative flex flex-col justify-between h-36 ${
                    currency === 'MMK'
                      ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/30 text-slate-900 dark:text-white ring-2 ring-cyan-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🇲🇲</span>
                      <span className="font-mono font-black text-sm px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                        MMK
                      </span>
                    </div>
                    {currency === 'MMK' && (
                      <span className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {isMM ? 'မြန်မာကျပ်ငွေ (MMK)' : 'Myanmar Kyat (MMK)'}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Base default currency • KBZPay / WavePay
                    </div>
                  </div>
                </button>

                {/* THB */}
                <button
                  type="button"
                  onClick={() => setCurrency('THB')}
                  className={`p-4 rounded-2xl border text-left transition relative flex flex-col justify-between h-36 ${
                    currency === 'THB'
                      ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/30 text-slate-900 dark:text-white ring-2 ring-cyan-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🇹🇭</span>
                      <span className="font-mono font-black text-sm px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
                        THB (฿)
                      </span>
                    </div>
                    {currency === 'THB' && (
                      <span className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {isMM ? 'ထိုင်းဘတ်ငွေ (Thai Baht ฿)' : 'Thai Baht (THB ฿)'}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Auto-converted • PromptPay / KBank / KTB
                    </div>
                  </div>
                </button>
              </div>

              {/* Current Exchange Rate Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-cyan-950/60 border border-emerald-500/30 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      {isMM ? 'ယနေ့ ပေါက်စျေး ငွေလဲနှုန်း' : 'Current Daily Exchange Rate'}
                    </span>
                    <strong className="text-emerald-400 font-mono text-sm">
                      1 THB (฿) = {exchangeRate} MMK (ကျပ်)
                    </strong>
                  </div>
                </div>

                <div className="text-right text-[11px] text-slate-300 font-mono">
                  Example: 380,000 MMK ≈ {formatTHB(convertMMKtoTHB(380000))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LANGUAGE PREFERENCE SWITCHER */}
          {activeTab === 'language' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('settings.language.title')}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t('settings.language.desc')}
                </p>
              </div>

              {/* Language Options */}
              <div className="space-y-3">
                {/* English */}
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`w-full p-4 rounded-2xl border text-left transition flex items-center justify-between ${
                    language === 'en'
                      ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/20 ring-2 ring-cyan-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span className="text-2xl">🇬🇧</span>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {t('settings.language.en')}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Default international gaming terminology
                      </div>
                    </div>
                  </div>
                  {language === 'en' && (
                    <div className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </button>

                {/* Myanmar (Burmese) */}
                <button
                  type="button"
                  onClick={() => setLanguage('mm')}
                  className={`w-full p-4 rounded-2xl border text-left transition flex items-center justify-between ${
                    language === 'mm'
                      ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/20 ring-2 ring-cyan-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span className="text-2xl">🇲🇲</span>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {t('settings.language.mm')}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        မြန်မာ ယူနီကုဒ်ဖြင့် လွယ်ကူရှင်းလင်းစွာ ဖတ်ရှုနိုင်ပါသည်
                      </div>
                    </div>
                  </div>
                  {language === 'mm' && (
                    <div className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              </div>

              {/* Translation Note */}
              <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-500 shrink-0" />
                <span>
                  {isMM
                    ? 'ဘာသာစကားပြောင်းလဲမှုသည် စနစ်တစ်ခုလုံး (အရောင်းအဝယ်၊ Escrow နှင့် အကောင့်အချက်အလက်များ) အားလုံးတွင် ချက်ချင်းသက်ရောက်ပါသည်'
                    : 'Language changes apply immediately across all marketplaces, escrow trackers, and notification alerts.'}
                </span>
              </div>
            </div>
          )}

          {/* TAB 4: ACCOUNT & PROFILE */}
          {activeTab === 'account' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('settings.account.title')}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Update your contact details and gaming identity.
                </p>
              </div>

              {/* Avatar Preview & URL */}
              <div className="flex items-center gap-4 pb-2">
                <img
                  src={avatarUrl}
                  alt="avatar"
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-cyan-500 shadow-md"
                />
                <div className="flex-1">
                  <label className="text-[11px] text-slate-600 dark:text-slate-400 font-medium block mb-1">
                    {t('settings.account.avatar')}
                  </label>
                  <input
                    type="text"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 font-medium block mb-1">
                  {t('settings.account.username')}
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-bold"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 font-medium block mb-1">
                  {t('settings.account.phone')}
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-mono"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 font-medium block mb-1">
                  {t('settings.account.email')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              {/* Save Button */}
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isProfileSaved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t('settings.account.saved')}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{t('settings.account.save')}</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 5: SECURITY & 2FA */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('settings.security.title')}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Protect your Escrow balance and login credentials.
                </p>
              </div>

              {/* 2FA Toggle */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="space-y-0.5 pr-4">
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-emerald-500" />
                    <span>{t('settings.security.twoFactor')}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t('settings.security.twoFactorDesc')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIs2FAEnabled(!is2FAEnabled)}
                  className={`w-12 h-6.5 rounded-full p-0.5 transition-colors cursor-pointer ${
                    is2FAEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5.5 h-5.5 rounded-full bg-white transition-transform ${
                      is2FAEnabled ? 'translate-x-5.5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Telegram Alerts Toggle */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="space-y-0.5 pr-4">
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Send className="w-4 h-4 text-cyan-500" />
                    <span>{t('settings.security.telegramAlerts')}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t('settings.security.telegramDesc')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTelegramAlerts(!isTelegramAlerts)}
                  className={`w-12 h-6.5 rounded-full p-0.5 transition-colors cursor-pointer ${
                    isTelegramAlerts ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5.5 h-5.5 rounded-full bg-white transition-transform ${
                      isTelegramAlerts ? 'translate-x-5.5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Password Change Form */}
              <form onSubmit={handleUpdatePassword} className="space-y-3 pt-2">
                <h5 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Update Password</span>
                </h5>

                <div>
                  <label className="text-[11px] text-slate-600 dark:text-slate-400 font-medium block mb-1">
                    {t('settings.security.currentPassword')}
                  </label>
                  <input
                    type="password"
                    value={currentPwd}
                    onChange={(e) => setCurrentPwd(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-600 dark:text-slate-400 font-medium block mb-1">
                      {t('settings.security.newPassword')}
                    </label>
                    <input
                      type="password"
                      value={newPwd}
                      onChange={(e) => setNewPwd(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-600 dark:text-slate-400 font-medium block mb-1">
                      {t('settings.security.confirmPassword')}
                    </label>
                    <input
                      type="password"
                      value={confirmPwd}
                      onChange={(e) => setConfirmPwd(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!newPwd || newPwd !== confirmPwd}
                  className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-1"
                >
                  {isPasswordSaved ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>{t('settings.security.passwordUpdated')}</span>
                    </>
                  ) : (
                    <span>{t('settings.security.updatePassword')}</span>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

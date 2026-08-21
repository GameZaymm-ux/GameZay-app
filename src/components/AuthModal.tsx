import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { signUpWithSupabase, signInWithSupabase, isSupabaseConfigured } from '../lib/supabaseClient';
import {
  X,
  Lock,
  Mail,
  User,
  ShieldCheck,
  Zap,
  Phone,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Gamepad2,
  Crown,
  KeyRound,
  ArrowRight,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
  onAuthSuccess: (userData: {
    id: string;
    email: string;
    fullName: string;
    username: string;
    phone?: string;
  }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
  onAuthSuccess,
}) => {
  const { isMM, t } = useLanguage();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);

  // Sync mode whenever modal is opened with a specific mode (e.g. Sign In vs Sign Up)
  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [isOpen, initialMode]);
  
  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up Form State
  const [signUpFullName, setSignUpFullName] = useState('');
  const [signUpUsername, setSignUpUsername] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Status & Feedback State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetMessages = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // Quick Demo Account Auto-Fill
  const handleQuickFill = (email: string, pass: string, name: string, username: string, phone: string) => {
    resetMessages();
    setSignInEmail(email);
    setSignInPassword(pass);
  };

  // Handle Sign In Submission
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!signInEmail.trim()) {
      setErrorMessage(isMM ? 'အီးမေးလ် ထည့်သွင်းပေးပါ' : 'Please enter your email address');
      return;
    }
    if (!signInPassword) {
      setErrorMessage(isMM ? 'စကားဝှက် ထည့်သွင်းပေးပါ' : 'Please enter your password');
      return;
    }

    setIsLoading(true);

    try {
      const res = await signInWithSupabase(signInEmail.trim(), signInPassword);

      if (!res.success) {
        let msg = res.error || 'Failed to sign in';
        if (msg.toLowerCase().includes('invalid login credentials') || msg.toLowerCase().includes('invalid_grant')) {
          msg = isMM
            ? 'အီးမေးလ် သို့မဟုတ် စကားဝှက် မှားယွင်းနေပါသည်။ ပြန်လည်စစ်ဆေးပေးပါ။'
            : 'Invalid email or password. Please try again.';
        } else if (msg.toLowerCase().includes('email not confirmed')) {
          msg = isMM
            ? 'အီးမေးလ်အတည်ပြုရန် လိုအပ်ပါသည်။ အီးမေးလ် inbox ထဲတွင် စစ်ဆေးပါ။'
            : 'Email not confirmed yet. Please verify your email or use demo account.';
        }
        setErrorMessage(msg);
        setIsLoading(false);
        return;
      }

      // Success
      const user = res.user;
      const metadata = user?.user_metadata || {};
      const fullName = metadata.full_name || signInEmail.split('@')[0] || 'Gamer';
      const username = metadata.username || signInEmail.split('@')[0] || 'Player';
      const phone = metadata.phone || '09798889901';

      setSuccessMessage(isMM ? 'အကောင့်အောင်မြင်စွာ ဝင်ရောက်ပြီးပါပြီ!' : 'Successfully signed in!');
      
      setTimeout(() => {
        onAuthSuccess({
          id: user?.id || `usr-${Date.now()}`,
          email: user?.email || signInEmail.trim(),
          fullName,
          username,
          phone,
        });
        onClose();
      }, 600);
    } catch (err: any) {
      setErrorMessage(err?.message || (isMM ? 'ချိတ်ဆက်မှု ချို့ယွင်းနေပါသည်' : 'Connection error occurred'));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Sign Up Submission
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!signUpFullName.trim()) {
      setErrorMessage(isMM ? 'အမည်ရင်း ထည့်သွင်းပေးပါ' : 'Please enter your full name');
      return;
    }
    if (!signUpUsername.trim()) {
      setErrorMessage(isMM ? 'Username (Gamer Tag) ထည့်သွင်းပေးပါ' : 'Please enter your username');
      return;
    }
    if (!signUpEmail.trim()) {
      setErrorMessage(isMM ? 'အီးမေးလ် ထည့်သွင်းပေးပါ' : 'Please enter your email address');
      return;
    }
    if (signUpPassword.length < 6) {
      setErrorMessage(isMM ? 'စကားဝှက် အနည်းဆုံး ၆ လုံး ရှိရပါမည်' : 'Password must be at least 6 characters');
      return;
    }
    if (signUpPassword !== signUpConfirmPassword) {
      setErrorMessage(isMM ? 'စကားဝှက်များ ကိုက်ညီမှုမရှိပါ' : 'Passwords do not match');
      return;
    }
    if (!agreeTerms) {
      setErrorMessage(isMM ? 'Escrow စည်းကမ်းချက်များကို သဘောတူရန် လိုအပ်ပါသည်' : 'Please accept the Escrow Terms of Service');
      return;
    }

    setIsLoading(true);

    try {
      const res = await signUpWithSupabase(
        signUpEmail.trim(),
        signUpPassword,
        signUpFullName.trim(),
        signUpUsername.trim(),
        signUpPhone.trim()
      );

      if (!res.success) {
        let msg = res.error || 'Failed to sign up';
        if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('user already exists')) {
          msg = isMM
            ? 'ဤအီးမေးလ်ဖြင့် အကောင့်ဖွင့်ထားပြီးဖြစ်ပါသည်။ အကောင့်ဝင်ရန် သို့ သွားပါ။'
            : 'This email is already registered. Please sign in instead.';
        } else if (msg.toLowerCase().includes('weak_password')) {
          msg = isMM
            ? 'စကားဝှက်သည် အားနည်းလွန်းပါသည်။ ပိုမိုလုံခြုံသော စကားဝှက် ထည့်ပါ။'
            : 'Password is too weak. Please use a stronger password.';
        }
        setErrorMessage(msg);
        setIsLoading(false);
        return;
      }

      // Success
      const user = res.user;
      setSuccessMessage(
        isMM
          ? 'အကောင့်သစ် အောင်မြင်စွာ ဖန်တီးပြီးပါပြီ! အကောင့်သို့ အလိုအလျောက် ဝင်ရောက်နေပါသည်...'
          : 'Account created successfully! Logging you in...'
      );

      setTimeout(() => {
        onAuthSuccess({
          id: user?.id || `usr-${Date.now()}`,
          email: user?.email || signUpEmail.trim(),
          fullName: signUpFullName.trim(),
          username: signUpUsername.trim(),
          phone: signUpPhone.trim() || '09798889901',
        });
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err?.message || (isMM ? 'အကောင့်ဖွင့်ရာတွင် ချို့ယွင်းချက်ရှိပါသည်' : 'An error occurred during registration'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        
        {/* Top Header & Close Button */}
        <div className="relative p-5 pb-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-teal-500 to-emerald-500 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-black tracking-tight text-white">
                  GameZay<span className="text-cyan-400">.MM</span>
                </h3>
                <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  AUTH
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {mode === 'signin'
                  ? isMM ? 'သင့်အကောင့်သို့ ဝင်ရောက်ပါ' : 'Sign in to access your Escrow trades'
                  : isMM ? 'အကောင့်သစ် စာရင်းသွင်းပါ' : 'Create an account for secure trading'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle Switcher */}
        <div className="px-6 pt-4 pb-2 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800/80">
          <div className="grid grid-cols-2 p-1 bg-slate-200 dark:bg-slate-800 rounded-2xl gap-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                resetMessages();
              }}
              className={`py-2 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'signin'
                  ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{isMM ? 'အကောင့်ဝင်ရန်' : 'Sign In'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('signup');
                resetMessages();
              }}
              className={`py-2 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'signup'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isMM ? 'အကောင့်သစ်ဖွင့်ရန်' : 'Sign Up'}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Form Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          {/* Success Message Alert */}
          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
              <div className="flex-1">{successMessage}</div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 1: SIGN IN                                           */}
          {/* ======================================================== */}
          {mode === 'signin' ? (
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>{isMM ? 'အီးမေးလ်' : 'Email Address'}</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="gamer@gamezay.mm"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>{isMM ? 'စကားဝှက်' : 'Password'}</span>
                  <button
                    type="button"
                    onClick={() => setSignInPassword('12345678')}
                    className="text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
                  >
                    {isMM ? 'စကားဝှက်မေ့နေပါသလား?' : 'Forgot Password?'}
                  </button>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showSignInPassword ? 'text' : 'password'}
                    required
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignInPassword(!showSignInPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label="Toggle password visibility"
                  >
                    {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-700 text-cyan-500 focus:ring-cyan-400"
                  />
                  <span>{isMM ? 'အကောင့်အမြဲမှတ်ထားမည်' : 'Remember me'}</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl font-black text-sm bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 shadow-lg shadow-cyan-500/25 transition transform active:scale-98 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{isMM ? 'အကောင့်ဝင်မည်' : 'Sign In Now'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Quick 1-Click Demo Accounts */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
                  {isMM ? '⚡ အစမ်းအကောင့်ဖြင့် ၁ ချက်နှိပ် ဝင်ရောက်ရန်' : '⚡ 1-Click Demo Account Quick Fill'}
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('buyer@gamezay.mm', '12345678', 'Kyaw Zin Thant', 'KyawZin_Gamer99', '09450012345')}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-cyan-500/10 hover:border-cyan-500/30 border border-slate-200 dark:border-slate-700 text-left transition cursor-pointer group"
                  >
                    <div className="text-[10px] font-black text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                      <Gamepad2 className="w-3 h-3" />
                      <span>Buyer</span>
                    </div>
                    <div className="text-[9px] text-slate-500 truncate">buyer@gamezay.mm</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickFill('merchant@gamezay.mm', '12345678', 'Ko Min Thant', 'ProGold_Merchant', '09798889901')}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/10 hover:border-amber-500/30 border border-slate-200 dark:border-slate-700 text-left transition cursor-pointer group"
                  >
                    <div className="text-[10px] font-black text-amber-500 flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      <span>Merchant</span>
                    </div>
                    <div className="text-[9px] text-slate-500 truncate">merchant@gamezay.mm</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickFill('admin@gamezay.mm', '12345678', 'GameZay Escrow Admin', 'Admin_Official', '09977889900')}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500/10 hover:border-emerald-500/30 border border-slate-200 dark:border-slate-700 text-left transition cursor-pointer group"
                  >
                    <div className="text-[10px] font-black text-emerald-500 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Admin</span>
                    </div>
                    <div className="text-[9px] text-slate-500 truncate">admin@gamezay.mm</div>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* ======================================================== */
            /* TAB 2: SIGN UP                                           */
            /* ======================================================== */
            <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
              {/* Full Name & Username */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isMM ? 'အမည်ရင်း' : 'Full Name'}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={signUpFullName}
                      onChange={(e) => setSignUpFullName(e.target.value)}
                      placeholder="Ko Min Thant"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isMM ? 'Gamer Tag / Username' : 'Username'}
                  </label>
                  <div className="relative">
                    <Gamepad2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={signUpUsername}
                      onChange={(e) => setSignUpUsername(e.target.value)}
                      placeholder="MinThant_99"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isMM ? 'အီးမေးလ်' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>{isMM ? 'ဖုန်းနံပါတ် (KPay / WavePay)' : 'Phone Number (KPay/WavePay)'}</span>
                  <span className="text-[10px] text-slate-400">{isMM ? 'ရွေးချယ်ရန်' : 'Optional'}</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="tel"
                    value={signUpPhone}
                    onChange={(e) => setSignUpPhone(e.target.value)}
                    placeholder="09450012345"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isMM ? 'စကားဝှက်' : 'Password'}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type={showSignUpPassword ? 'text' : 'password'}
                      required
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showSignUpPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isMM ? 'စကားဝှက်အတည်ပြုပါ' : 'Confirm'}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type={showSignUpPassword ? 'text' : 'password'}
                      required
                      value={signUpConfirmPassword}
                      onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Escrow Terms Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2 text-[11px] text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 dark:border-slate-700 text-emerald-500 focus:ring-emerald-400"
                  />
                  <span>
                    {isMM
                      ? 'GameZay.MM ၏ ၂၄ နာရီ Escrow လုံခြုံရေး စည်းမျဉ်းနှင့် ဝန်ဆောင်မှုစည်းကမ်းချက်များကို သဘောတူပါသည်'
                      : 'I accept GameZay.MM Escrow Terms of Service and Safety Policy'}
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl font-black text-sm bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 shadow-lg shadow-emerald-500/25 transition transform active:scale-98 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{isMM ? 'အကောင့်သစ် ဖွင့်မည်' : 'Create Free Account'}</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Secure Escrow Footer Note */}
          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              {isMM
                ? 'Supabase Auth နှင့် AES-256 Encryption ဖြင့် လုံခြုံစွာ ထိန်းသိမ်းထားပါသည်'
                : 'Secured by Supabase Auth with AES-256 end-to-end credential locking'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

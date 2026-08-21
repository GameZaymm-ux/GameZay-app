import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { signUpWithSupabase, signInWithSupabase, isSupabaseConfigured, resetPasswordWithSupabase } from '../lib/supabaseClient';
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
  ArrowLeft,
  HelpCircle,
  LogIn,
  UserPlus,
} from 'lucide-react';

export type AuthScreenMode = 'signin' | 'signup' | 'forgot';

interface AuthViewProps {
  initialMode?: AuthScreenMode;
  onAuthSuccess: (userData: {
    id: string;
    email: string;
    fullName: string;
    username: string;
    phone?: string;
  }) => void;
  onBackToHome: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  initialMode = 'signin',
  onAuthSuccess,
  onBackToHome,
}) => {
  const { isMM, t } = useLanguage();
  const [mode, setMode] = useState<AuthScreenMode>(initialMode);

  // Sync mode if initialMode prop updates
  React.useEffect(() => {
    setMode(initialMode);
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [initialMode]);

  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up Form State - Strictly ONLY: Full Name, Phone (optional), Email, Password
  const [signUpFullName, setSignUpFullName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Status & Feedback State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resetMessages = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // Quick Demo Account Helper for testing
  const handleQuickFill = (email: string, pass: string) => {
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
        if (
          msg.toLowerCase().includes('invalid login credentials') ||
          msg.toLowerCase().includes('invalid_grant')
        ) {
          msg = isMM
            ? 'အီးမေးလ် သို့မဟုတ် စကားဝှက် မှားယွင်းနေပါသည်။ ပြန်လည်စစ်ဆေးပေးပါ။'
            : 'Invalid email or password. Please try again.';
        } else if (msg.toLowerCase().includes('email not confirmed')) {
          msg = isMM
            ? 'အီးမေးလ်အတည်ပြုရန် လိုအပ်ပါသည်။ အီးမေးလ် inbox ထဲတွင် စစ်ဆေးပါ။'
            : 'Email not confirmed yet. Please verify your email or check inbox.';
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
      const phone = metadata.phone || '';

      setSuccessMessage(isMM ? 'အကောင့်အောင်မြင်စွာ ဝင်ရောက်ပြီးပါပြီ!' : 'Successfully signed in!');

      setTimeout(() => {
        onAuthSuccess({
          id: user?.id || `usr-${Date.now()}`,
          email: user?.email || signInEmail.trim(),
          fullName,
          username,
          phone,
        });
      }, 500);
    } catch (err: any) {
      setErrorMessage(
        err?.message || (isMM ? 'ချိတ်ဆက်မှု ချို့ယွင်းနေပါသည်' : 'Connection error occurred')
      );
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
    if (!signUpEmail.trim()) {
      setErrorMessage(isMM ? 'အီးမေးလ် ထည့်သွင်းပေးပါ' : 'Please enter a valid email address');
      return;
    }
    if (!signUpPassword) {
      setErrorMessage(isMM ? 'စကားဝှက် ထည့်သွင်းပေးပါ' : 'Please create a password');
      return;
    }
    if (signUpPassword.length < 6) {
      setErrorMessage(
        isMM
          ? 'စကားဝှက်သည် အနည်းဆုံး ၆ လုံး ရှိရပါမည်'
          : 'Password must be at least 6 characters long'
      );
      return;
    }
    if (signUpPassword !== signUpConfirmPassword) {
      setErrorMessage(
        isMM
          ? 'စကားဝှက်အတည်ပြုခြင်း မကိုက်ညီပါ'
          : 'Passwords do not match. Please verify both fields.'
      );
      return;
    }
    if (!agreeTerms) {
      setErrorMessage(
        isMM
          ? 'GameZay.MM စည်းမျဉ်းများကို သဘောတူရန် လိုအပ်ပါသည်'
          : 'You must agree to the Terms of Service & Escrow Rules'
      );
      return;
    }

    setIsLoading(true);

    try {
      // Auto generate clean Gamer Tag/username from email
      const generatedUsername = signUpEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') || 'Gamer';
      
      const res = await signUpWithSupabase(
        signUpEmail.trim(),
        signUpPassword,
        signUpFullName.trim(),
        generatedUsername,
        signUpPhone.trim() || undefined
      );

      if (!res.success) {
        let msg = res.error || 'Failed to create account';
        if (msg.toLowerCase().includes('already registered')) {
          msg = isMM
            ? 'ဤအီးမေးလ်ဖြင့် အကောင့်ဖွင့်ပြီးသားဖြစ်နေပါသည်။ ကျေးဇူးပြု၍ အကောင့်ဝင်ပါ။'
            : 'An account with this email already exists. Please sign in.';
        }
        setErrorMessage(msg);
        setIsLoading(false);
        return;
      }

      setSuccessMessage(
        isMM
          ? 'အကောင့်သစ် အောင်မြင်စွာ ဖွင့်ပြီးပါပြီ! ကြိုဆိုပါသည် GameZay.MM'
          : 'Account created successfully! Welcome to GameZay.MM'
      );

      setTimeout(() => {
        onAuthSuccess({
          id: res.user?.id || `usr-${Date.now()}`,
          email: signUpEmail.trim(),
          fullName: signUpFullName.trim(),
          username: generatedUsername,
          phone: signUpPhone.trim() || undefined,
        });
      }, 600);
    } catch (err: any) {
      setErrorMessage(
        err?.message || (isMM ? 'ချိတ်ဆက်မှု ချို့ယွင်းနေပါသည်' : 'Failed to complete registration')
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Forgot Password Submission
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!forgotEmail.trim()) {
      setErrorMessage(isMM ? 'အီးမေးလ် ထည့်သွင်းပေးပါ' : 'Please enter your registered email');
      return;
    }

    setIsLoading(true);
    try {
      await resetPasswordWithSupabase(forgotEmail.trim());
      setForgotSubmitted(true);
      setSuccessMessage(
        isMM
          ? 'စကားဝှက် အသစ်ပြန်လည်သတ်မှတ်ရန် လမ်းညွှန်ချက်များကို အီးမေးလ်သို့ ပေးပို့ထားပါသည်။'
          : 'Password reset instructions have been sent to your email.'
      );
    } catch (err: any) {
      setErrorMessage(err?.message || (isMM ? 'အီးမေးလ် ပေးပို့၍ မရပါ' : 'Failed to send reset email'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-8rem)] flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300">
        
        {/* Top Header Banner */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border-b border-slate-800 text-white relative">
          <button
            type="button"
            onClick={onBackToHome}
            className="absolute top-5 left-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            title={isMM ? 'ပင်မသို့ ပြန်သွားမည်' : 'Back to Home'}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{isMM ? 'ပင်မသို့' : 'Home'}</span>
          </button>

          <div className="text-center pt-2 sm:pt-0">
            <div className="inline-flex p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 mb-3 shadow-lg shadow-cyan-500/10">
              <Gamepad2 className="w-8 h-8" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              GameZay<span className="text-cyan-400">.MM</span>
            </h1>
            <p className="text-xs sm:text-sm text-cyan-200/80 mt-1 max-w-sm mx-auto">
              {mode === 'signin'
                ? isMM
                  ? 'လုံခြုံစိတ်ချရသော မြန်မာ့ဂိမ်းအကောင့် အက်စခရိုးစျေးကွက်'
                  : 'Secure Escrow Marketplace for Myanmar Gamers'
                : mode === 'signup'
                ? isMM
                  ? 'အကောင့်သစ်ဖွင့်ပြီး လုံခြုံစွာ ရောင်းဝယ်လိုက်ပါ'
                  : 'Create an account to start secure buying & selling'
                : isMM
                ? 'စကားဝှက် ပြန်လည်သတ်မှတ်ခြင်း'
                : 'Reset your GameZay account password'}
            </p>
          </div>

          {/* Mode Switch Tabs (Only between Sign In & Sign Up) */}
          {mode !== 'forgot' && (
            <div className="flex bg-slate-950/60 p-1 rounded-2xl border border-slate-800 mt-6 max-w-xs mx-auto">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  resetMessages();
                }}
                className={`flex-1 py-2 text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'signin'
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{isMM ? 'အကောင့်ဝင်မည်' : 'Sign In'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  resetMessages();
                }}
                className={`flex-1 py-2 text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{isMM ? 'အကောင့်သစ်' : 'Sign Up'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Feedback Alerts */}
        <div className="p-6 sm:p-8 space-y-6">
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-start gap-3 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="font-semibold leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-start gap-3 text-xs animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="font-semibold leading-relaxed">{successMessage}</div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 1. SIGN IN VIEW                                          */}
          {/* ======================================================== */}
          {mode === 'signin' && (
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              {/* Quick Demo Autofill Notice */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                    <span>{isMM ? 'စမ်းသပ်ရန် Demo အကောင့်များ' : 'Quick Demo Logins'}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 font-mono font-bold">
                    1-Click
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('buyer@gamezay.mm', 'buyer123')}
                    className="py-1.5 px-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-cyan-500/20 hover:text-cyan-500 text-[11px] font-bold text-slate-700 dark:text-slate-300 transition text-center cursor-pointer"
                  >
                    🎮 Buyer
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('seller@gamezay.mm', 'seller123')}
                    className="py-1.5 px-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-emerald-500/20 hover:text-emerald-500 text-[11px] font-bold text-slate-700 dark:text-slate-300 transition text-center cursor-pointer"
                  >
                    👑 Seller
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('admin@gamezay.mm', 'admin123')}
                    className="py-1.5 px-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-purple-500/20 hover:text-purple-500 text-[11px] font-bold text-slate-700 dark:text-slate-300 transition text-center cursor-pointer"
                  >
                    🛡️ Admin
                  </button>
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-cyan-500" />
                  <span>{isMM ? 'အီးမေးလ် လိပ်စာ' : 'Email Address'}</span>
                </label>
                <input
                  type="email"
                  required
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-cyan-500" />
                    <span>{isMM ? 'စကားဝှက်' : 'Password'}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      resetMessages();
                    }}
                    className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-bold cursor-pointer"
                  >
                    {isMM ? 'စကားဝှက် မေ့နေပါသလား?' : 'Forgot password?'}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showSignInPassword ? 'text' : 'password'}
                    required
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-4 pr-11 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignInPassword(!showSignInPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
                  >
                    {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400 border-slate-300 dark:border-slate-700"
                  />
                  <span>{isMM ? 'အကောင့်မှတ်ထားမည်' : 'Remember me'}</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 active:scale-98 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-cyan-500/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>{isMM ? 'စစ်ဆေးနေပါသည်...' : 'Signing in...'}</span>
                  </span>
                ) : (
                  <>
                    <span>{isMM ? 'အကောင့်ဝင်မည်' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-500">
                  {isMM ? 'အကောင့်မရှိသေးပါက' : "Don't have an account?"}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      resetMessages();
                    }}
                    className="text-cyan-600 dark:text-cyan-400 font-bold hover:underline cursor-pointer"
                  >
                    {isMM ? 'အကောင့်သစ် ဖွင့်မည်' : 'Sign Up Now'}
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* 2. SIGN UP VIEW (Strictly Clean & Minimal)              */}
          {/* ======================================================== */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-cyan-500" />
                  <span>{isMM ? 'အမည်ရင်း (Full Name)' : 'Full Name'} *</span>
                </label>
                <input
                  type="text"
                  required
                  value={signUpFullName}
                  onChange={(e) => setSignUpFullName(e.target.value)}
                  placeholder="Ko Kyaw Zayar"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-cyan-500" />
                  <span>{isMM ? 'အီးမေးလ် လိပ်စာ' : 'Email Address'} *</span>
                </label>
                <input
                  type="email"
                  required
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  placeholder="gamer@gmail.com"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>

              {/* Phone Number (Optional) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{isMM ? 'ဖုန်းနံပါတ် (ရွေးချယ်ရန်)' : 'Phone Number (Optional)'}</span>
                </label>
                <input
                  type="tel"
                  value={signUpPhone}
                  onChange={(e) => setSignUpPhone(e.target.value)}
                  placeholder="09450012345"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition font-mono"
                />
              </div>

              {/* Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-cyan-500" />
                    <span>{isMM ? 'စကားဝှက်' : 'Password'} *</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showSignUpPassword ? 'text' : 'password'}
                      required
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-3.5 pr-10 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
                    >
                      {showSignUpPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-cyan-500" />
                    <span>{isMM ? 'အတည်ပြု စကားဝှက်' : 'Confirm'} *</span>
                  </label>
                  <input
                    type={showSignUpPassword ? 'text' : 'password'}
                    required
                    value={signUpConfirmPassword}
                    onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition font-mono"
                  />
                </div>
              </div>

              {/* Agreement */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400 border-slate-300 dark:border-slate-700 mt-0.5 shrink-0"
                  />
                  <span>
                    {isMM
                      ? 'GameZay.MM ၏ စည်းမျဉ်းစည်းကမ်းများနှင့် Escrow လုံခြုံရေးမူဝါဒကို သဘောတူပါသည်'
                      : 'I agree to the Terms of Service, Escrow Rules, and Privacy Policy.'}
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 active:scale-98 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-cyan-500/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>{isMM ? 'အကောင့်ဖွင့်နေပါသည်...' : 'Creating Account...'}</span>
                  </span>
                ) : (
                  <>
                    <span>{isMM ? 'အကောင့်ဖွင့်မည်' : 'Create Account'}</span>
                    <Sparkles className="w-4 h-4 text-slate-950" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-500">
                  {isMM ? 'အကောင့်ရှိပြီးသားဖြစ်ပါက' : 'Already have an account?'}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      resetMessages();
                    }}
                    className="text-cyan-600 dark:text-cyan-400 font-bold hover:underline cursor-pointer"
                  >
                    {isMM ? 'အကောင့်ဝင်မည်' : 'Sign In'}
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* 3. FORGOT PASSWORD VIEW                                  */}
          {/* ======================================================== */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 text-xs text-slate-700 dark:text-slate-300">
                <p className="leading-relaxed">
                  {isMM
                    ? 'သင်၏ မှတ်ပုံတင်ထားသော အီးမေးလ်လိပ်စာကို ထည့်သွင်းပါ။ စကားဝှက် အသစ်သတ်မှတ်နိုင်သော link ကို ပေးပို့ပေးပါမည်။'
                    : 'Enter your registered email address below. We will send a secure link to reset your password.'}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-cyan-500" />
                  <span>{isMM ? 'အီးမေးလ် လိပ်စာ' : 'Email Address'}</span>
                </label>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || forgotSubmitted}
                className="w-full py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 active:scale-98 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-cyan-500/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>{isMM ? 'ပေးပို့နေပါသည်...' : 'Sending reset link...'}</span>
                  </span>
                ) : (
                  <>
                    <span>{isMM ? 'စကားဝှက် Reset Link ပို့မည်' : 'Send Password Reset Link'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    resetMessages();
                  }}
                  className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{isMM ? 'အကောင့်ဝင်ရန် စာမျက်နှာသို့' : 'Back to Sign In'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

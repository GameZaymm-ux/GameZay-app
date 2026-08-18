import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  AccountListing,
  EscrowOrder,
  KycStatus,
  PaymentMethodCode,
  SellerPayoutRequest,
  UserRole,
} from '../types';
import {
  Wallet,
  TrendingUp,
  Package,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Sparkles,
  Edit3,
  Trash2,
  Check,
  X,
  Coins,
  ShieldCheck,
  DollarSign,
  AlertTriangle,
  Building,
  CreditCard,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SellerDashboardProps {
  listings: AccountListing[];
  orders: EscrowOrder[];
  payouts: SellerPayoutRequest[];
  onOpenSellModal: () => void;
  onRequestPayout: (payout: SellerPayoutRequest) => void;
  onUpdateListing?: (listingId: string, updatedFields: Partial<AccountListing>) => void;
  onDeleteListing?: (listingId: string) => void;
  kycStatus?: KycStatus;
  onOpenKycModal?: () => void;
  userRole?: UserRole;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({
  listings,
  orders,
  payouts,
  onOpenSellModal,
  onRequestPayout,
  onUpdateListing,
  onDeleteListing,
  kycStatus = 'VERIFIED',
  onOpenKycModal,
  userRole = 'SELLER',
}) => {
  const {
    t,
    currency,
    formatMMK,
    formatTHB,
    formatPrice,
    exchangeRate,
    convertMMKtoTHB,
    isMM,
  } = useLanguage();

  const totalEarnings = orders
    .filter((o) => o.status === 'COMPLETED')
    .reduce((acc, curr) => acc + curr.amountMMK, 1450000);

  const pendingEscrow = orders
    .filter((o) => o.status !== 'COMPLETED' && o.status !== 'REFUNDED')
    .reduce((acc, curr) => acc + curr.amountMMK, 380000);

  const paidOutAmount = payouts
    .filter((p) => p.status === 'PAID')
    .reduce((acc, curr) => acc + curr.amountMMK, 0);

  const availableBalanceMMK = Math.max(0, totalEarnings - paidOutAmount);

  // Withdrawal form state
  const [payoutAmount, setPayoutAmount] = useState<number | ''>(availableBalanceMMK > 0 ? availableBalanceMMK : 380000);
  const [payoutMethod, setPayoutMethod] = useState<PaymentMethodCode>('KBZ_PAY');
  const [walletPhone, setWalletPhone] = useState('09791122334');
  const [walletName, setWalletName] = useState('Ko Thura Kyaw');
  const [payoutSuccess, setPayoutSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  // Active listings inline edit state
  const [editingListingId, setEditingListingId] = useState<string | null>(null);
  const [editPriceMMK, setEditPriceMMK] = useState<number>(0);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editStatus, setEditStatus] = useState<AccountListing['status']>('AVAILABLE');

  const handleStartEdit = (listing: AccountListing) => {
    setEditingListingId(listing.id);
    setEditPriceMMK(listing.priceMMK);
    setEditTitle(listing.title);
    setEditStatus(listing.status);
  };

  const handleSaveListingEdit = (listingId: string) => {
    if (onUpdateListing) {
      onUpdateListing(listingId, {
        priceMMK: editPriceMMK,
        title: editTitle,
        status: editStatus,
      });
    }
    setEditingListingId(null);
    confetti({
      particleCount: 50,
      spread: 50,
      origin: { y: 0.6 },
    });
  };

  const handleMaxAmount = () => {
    setPayoutAmount(availableBalanceMMK);
  };

  const handleRequestPayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutAmount || Number(payoutAmount) <= 0) {
      setFormError(isMM ? 'ကျေးဇူးပြု၍ ထုတ်ယူမည့် ပမာဏကို ရိုက်ထည့်ပါ' : 'Please enter a valid payout amount.');
      return;
    }
    if (Number(payoutAmount) > availableBalanceMMK && availableBalanceMMK > 0) {
      setFormError(
        isMM
          ? 'ထုတ်ယူလိုသော ပမာဏသည် လက်ကျန်ငွေထက် ကျော်လွန်နေပါသည်'
          : 'Amount exceeds available balance.'
      );
      return;
    }
    if (!walletPhone.trim() || !walletName.trim()) {
      setFormError(
        isMM
          ? 'ကျေးဇူးပြု၍ အကောင့်အချက်အလက်များကို အပြည့်အစုံ ဖြည့်သွင်းပါ'
          : 'Please enter wallet / bank details.'
      );
      return;
    }

    setFormError('');
    const newPayout: SellerPayoutRequest = {
      id: `payout-${Date.now()}`,
      orderNumber: `GZ-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      sellerName: walletName,
      amountMMK: Number(payoutAmount),
      walletMethod: payoutMethod,
      walletNumber: walletPhone,
      walletAccountName: walletName,
      status: 'PENDING',
      requestedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    onRequestPayout(newPayout);
    setPayoutSuccess(true);
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
    });
    setTimeout(() => setPayoutSuccess(false), 4000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* KYC Warning if unverified */}
      {kycStatus !== 'VERIFIED' && userRole !== 'ADMIN' && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <h4 className="text-xs sm:text-sm font-bold">
                {kycStatus === 'PENDING'
                  ? isMM
                    ? 'KYC စိစစ်ဆဲ ဖြစ်ပါသည်'
                    : 'KYC Verification In Review'
                  : isMM
                  ? 'ရောင်းသူ စတူဒီယို အပြည့်အဝ အသုံးပြုရန် KYC လိုအပ်ပါသည်'
                  : 'Complete KYC to unlock full payout withdrawals'}
              </h4>
              <p className="text-[11px] text-amber-700 dark:text-amber-400">
                {kycStatus === 'PENDING'
                  ? isMM
                    ? 'အက်ဒမင်မှ စိစစ်ပြီးပါက ငွေထုတ်ယူမှုများ စတင်နိုင်ပါမည်'
                    : 'Admin review takes 2-4 hours. You will receive notification.'
                  : isMM
                  ? 'မှတ်ပုံတင်အတည်ပြုပြီး ရောင်းချငွေများကို လုံခြုံစွာထုတ်ယူပါ'
                  : 'Upload your ID to activate withdrawal channels.'}
              </p>
            </div>
          </div>

          {kycStatus === 'UNSUBMITTED' && onOpenKycModal && (
            <button
              onClick={onOpenKycModal}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition cursor-pointer self-start sm:self-auto"
            >
              {isMM ? 'KYC စိစစ်မည်' : 'Verify KYC'}
            </button>
          )}
        </div>
      )}

      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>SELLER STUDIO</span>
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {isMM ? 'အတည်ပြုပြီး ရောင်းသူ အဆင့် ၂' : 'Verified Pro Seller (Level 2)'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            {isMM ? 'ရောင်းသူ စီမံခန့်ခွဲမှု စတူဒီယို' : 'Seller Creator Studio'}
          </h2>
        </div>

        <button
          onClick={onOpenSellModal}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t('nav.sellAccount')}</span>
        </button>
      </div>

      {/* Earnings & Escrow Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Available Wallet Balance */}
        <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-2">
            <span>{isMM ? 'ထုတ်ယူနိုင်သော လက်ကျန်ငွေ' : 'Available Wallet Balance'}</span>
            <Wallet className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {formatPrice(availableBalanceMMK)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            {currency === 'THB'
              ? `≈ ${formatMMK(availableBalanceMMK)}`
              : `≈ ${formatTHB(convertMMKtoTHB(availableBalanceMMK))}`}
          </div>
        </div>

        {/* Pending Escrow */}
        <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-2">
            <span>{isMM ? 'Escrow တွင် ထိန်းသိမ်းထားငွေ' : 'Pending Escrow Balance'}</span>
            <Clock className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-cyan-600 dark:text-cyan-400 font-mono">
            {formatPrice(pendingEscrow)}
          </div>
          <span className="text-[11px] text-slate-400">
            {isMM ? 'ဝယ်သူစစ်ဆေးမှု ၂၄ နာရီအတွင်း ရောက်မည်' : 'Releases upon 24h buyer inspection'}
          </span>
        </div>

        {/* Total Sales Disbursed */}
        <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-2">
            <span>{isMM ? 'ရောင်းချပြီး ဂိမ်းအကောင့်များ' : 'Active Account Listings'}</span>
            <Package className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {listings.length} <span className="text-xs font-normal text-slate-400">Accounts</span>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            100% Escrow Protection
          </span>
        </div>
      </div>

      {/* Main Grid: Active Listings Management & Withdrawal Request Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 Cols): Active Listings Management with Inline Editing */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-cyan-500" />
              <span>{isMM ? 'လက်ရှိ ရောင်းချနေသော စာရင်းများ' : 'Active Listed Accounts'}</span>
              <span className="text-xs font-mono text-slate-400">({listings.length})</span>
            </h3>

            <span className="text-[11px] text-slate-400">
              {isMM ? 'စျေးနှုန်းနှင့် အခြေအနေ ပြင်ဆင်နိုင်ပါသည်' : 'Quick edit price & status'}
            </span>
          </div>

          <div className="space-y-3">
            {listings.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 transition hover:border-slate-300 dark:hover:border-slate-700"
              >
                {editingListingId === item.id ? (
                  /* Edit Mode */
                  <div className="space-y-3 p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-cyan-500/30">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        {isMM ? 'ခေါင်းစဉ် ပြင်ဆင်ရန်' : 'Listing Title'}
                      </label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          {isMM ? 'စျေးနှုန်း (MMK)' : 'Price (MMK)'}
                        </label>
                        <input
                          type="number"
                          value={editPriceMMK}
                          onChange={(e) => setEditPriceMMK(Number(e.target.value))}
                          className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
                        />
                        <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono">
                          ≈ {formatTHB(convertMMKtoTHB(editPriceMMK))} THB
                        </span>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          {isMM ? 'အခြေအနေ' : 'Status'}
                        </label>
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value as any)}
                          className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                        >
                          <option value="AVAILABLE">AVAILABLE (ရောင်းရန်)</option>
                          <option value="IN_ESCROW">IN_ESCROW (လော့ခ်ကျ)</option>
                          <option value="SOLD">SOLD (ရောင်းပြီး)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setEditingListingId(null)}
                        className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveListingEdit(item.id)}
                        className="px-4 py-1 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1 shadow"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Changes</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Display Mode */
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <img
                        src={item.imageUrls[0]}
                        alt={item.title}
                        className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {item.gameType}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              item.status === 'AVAILABLE'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                : item.status === 'IN_ESCROW'
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs font-mono">
                          <strong className="text-cyan-600 dark:text-cyan-400">
                            {formatMMK(item.priceMMK)}
                          </strong>
                          <span className="text-slate-400">•</span>
                          <span className="text-emerald-600 dark:text-emerald-400">
                            {formatTHB(convertMMKtoTHB(item.priceMMK))}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => handleStartEdit(item)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition text-xs flex items-center gap-1 font-medium"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-cyan-500" />
                        <span>Edit</span>
                      </button>

                      {onDeleteListing && (
                        <button
                          onClick={() => onDeleteListing(item.id)}
                          className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 transition text-xs"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (5 Cols): Seller Earnings Wallet & Withdrawal Request Form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {isMM ? 'ဝင်ငွေ ထုတ်ယူရန် လျှောက်ထားခြင်း' : 'Request Wallet Withdrawal'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isMM ? 'KPay, Wave, PromptPay သို့မဟုတ် ထိုင်းဘဏ်များ' : 'Disburse to MMK Wallets or Thai Banks'}
                  </p>
                </div>
              </div>
            </div>

            {payoutSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-300 flex items-center gap-3 text-xs animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <strong>{isMM ? 'ထုတ်ယူမှု အောင်မြင်စွာ တင်သွင်းပြီးပါပြီ!' : 'Payout request submitted!'}</strong>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                    {isMM
                      ? 'အက်ဒမင်မှ ၁၅ မိနစ်အတွင်း စစ်ဆေးလွှဲပြောင်းပေးပါမည်။'
                      : 'Admin will disburse funds to your account within 15-30 minutes.'}
                  </p>
                </div>
              </div>
            )}

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleRequestPayout} className="space-y-4 text-xs">
              {/* Withdrawal Amount with MAX Button */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-800 dark:text-slate-200">
                    {isMM ? 'ထုတ်ယူလိုသော ပမာဏ (MMK)' : 'Withdrawal Amount (MMK)'}
                  </label>
                  <button
                    type="button"
                    onClick={handleMaxAmount}
                    className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-0.5"
                  >
                    <span>MAX: {formatMMK(availableBalanceMMK)}</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 380000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-cyan-500"
                    required
                  />
                  {payoutAmount && Number(payoutAmount) > 0 && (
                    <span className="absolute right-3 top-2.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                      ≈ {formatTHB(convertMMKtoTHB(Number(payoutAmount)))} THB
                    </span>
                  )}
                </div>
              </div>

              {/* Payout Channel Selector */}
              <div>
                <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1.5">
                  {isMM ? 'ငွေလက်ခံမည့် လမ်းကြောင်း' : 'Payout Destination'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPayoutMethod('KBZ_PAY')}
                    className={`p-2.5 rounded-xl border text-left font-bold transition flex items-center gap-2 ${
                      payoutMethod === 'KBZ_PAY'
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 ring-2 ring-cyan-500/20'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    <span>KBZPay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPayoutMethod('WAVE_PAY')}
                    className={`p-2.5 rounded-xl border text-left font-bold transition flex items-center gap-2 ${
                      payoutMethod === 'WAVE_PAY'
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 ring-2 ring-cyan-500/20'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span>WaveMoney</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPayoutMethod('PROMPTPAY')}
                    className={`p-2.5 rounded-xl border text-left font-bold transition flex items-center gap-2 ${
                      payoutMethod === 'PROMPTPAY'
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 ring-2 ring-cyan-500/20'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                    <span>PromptPay (TH)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPayoutMethod('KBANK')}
                    className={`p-2.5 rounded-xl border text-left font-bold transition flex items-center gap-2 ${
                      payoutMethod === 'KBANK'
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 ring-2 ring-cyan-500/20'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    <span>KBank (Thai)</span>
                  </button>
                </div>
              </div>

              {/* Account Number / Phone */}
              <div>
                <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  {payoutMethod === 'PROMPTPAY'
                    ? 'PromptPay Phone / Citizen ID'
                    : payoutMethod === 'KBANK'
                    ? 'KBank Account Number'
                    : isMM
                    ? 'ဖုန်းနံပါတ် / အကောင့်နံပါတ်'
                    : 'Account / Wallet Number'}
                </label>
                <input
                  type="text"
                  value={walletPhone}
                  onChange={(e) => setWalletPhone(e.target.value)}
                  placeholder="09791122334 or 0812345678"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              {/* Account Holder Legal Name */}
              <div>
                <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  {isMM ? 'အကောင့်ပိုင်ရှင် အမည်ရင်း' : 'Account Holder Full Name'}
                </label>
                <input
                  type="text"
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                  placeholder="e.g. Ko Thura Kyaw or Somchai Prasert"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              {/* Submit Withdrawal */}
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-emerald-500/20 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>{isMM ? 'ငွေထုတ်ယူရန် အတည်ပြုမည်' : 'Confirm Payout Request'}</span>
              </button>
            </form>

            {/* Payout History Mini List */}
            {payouts.length > 0 && (
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block uppercase">
                  {isMM ? 'လတ်တလော ထုတ်ယူမှု မှတ်တမ်း' : 'Recent Payout Requests'}
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {payouts.map((p) => (
                    <div
                      key={p.id}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono"
                    >
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          {formatMMK(p.amountMMK)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {p.walletMethod} • {p.requestedAt}
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          p.status === 'PAID'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : p.status === 'REJECTED'
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

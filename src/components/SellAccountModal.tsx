import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { AccountListing, GameType } from '../types';
import {
  X,
  PlusCircle,
  ShieldCheck,
  Zap,
  Image as ImageIcon,
  Lock,
  Wallet,
  Sparkles,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SellAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onListingCreated: (listing: AccountListing) => void;
}

export const SellAccountModal: React.FC<SellAccountModalProps> = ({
  isOpen,
  onClose,
  onListingCreated,
}) => {
  const { t, formatMMK, formatTHB, convertMMKtoTHB, exchangeRate, isMM } = useLanguage();

  const [gameType, setGameType] = useState<GameType>('efootball');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priceMMK, setPriceMMK] = useState<number>(250000);
  const [bindingStatus, setBindingStatus] = useState('Clean First-Hand Transferable');

  // eFootball specs
  const [squadRating, setSquadRating] = useState(104);
  const [epicCount, setEpicCount] = useState(14);
  const [division, setDivision] = useState(1);

  // MLBB specs
  const [mlbbRank, setMlbbRank] = useState('Mythical Immortal');
  const [winRate, setWinRate] = useState(67.5);
  const [collectorCount, setCollectorCount] = useState(4);
  const [legendCount, setLegendCount] = useState(1);

  // PUBG specs
  const [pubgLevel, setPubgLevel] = useState(75);
  const [glacierLvl, setGlacierLvl] = useState('M416 Glacier Lvl 5');
  const [mythicCount, setMythicCount] = useState(28);

  // COC specs
  const [thLevel, setThLevel] = useState(16);
  const [heroLevels, setHeroLevels] = useState('K90 / Q90 / W65 / RC40');
  const [gemsCount, setGemsCount] = useState(3800);

  // Credentials
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [notes, setNotes] = useState('First hand account. Fast handover.');

  // Payout Wallet
  const [payoutMethod, setPayoutMethod] = useState<'KBZ_PAY' | 'WAVE_PAY' | 'USDT_TRC20'>('KBZ_PAY');
  const [payoutPhone, setPayoutPhone] = useState('09798881234');
  const [payoutName, setPayoutName] = useState('Ko Seller');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let dynamicAttrs: any = {};
    let bannerUrl = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80';

    if (gameType === 'efootball') {
      bannerUrl = 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80';
      dynamicAttrs = {
        division,
        squadRating,
        epicCount,
        showtimeCount: 4,
        konamiStatus: bindingStatus,
        platform: 'Android / iOS',
        highlightPlayers: ['Epic Booster Cards', 'Show Time Players'],
      };
    } else if (gameType === 'mlbb') {
      bannerUrl = 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80';
      dynamicAttrs = {
        currentRank: mlbbRank,
        peakRank: 'Immortal 120★',
        winRate,
        totalMatches: 3500,
        collectorSkins: collectorCount,
        legendSkins: legendCount,
        epicSkins: 30,
        totalHeroes: 120,
        moontonStatus: bindingStatus,
        signatureSkins: ['Collector Skin', 'Epic Limited'],
      };
    } else if (gameType === 'pubg') {
      bannerUrl = 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=80';
      dynamicAttrs = {
        level: pubgLevel,
        tier: 'Ace Master',
        glacierLevel: glacierLvl,
        upgradableGuns: 5,
        mythicFashion: mythicCount,
        royalePassSeasons: 'RP Maxed',
        linkStatus: bindingStatus,
        inventoryHighlights: [glacierLvl, `${mythicCount} Mythics`],
      };
    } else {
      bannerUrl = 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=80';
      dynamicAttrs = {
        townHall: thLevel,
        kingLevel: 90,
        queenLevel: 90,
        wardenLevel: 65,
        champLevel: 40,
        gems: gemsCount,
        nameChange: 'Available (500 Gems)',
        builderHall: 9,
        wallLevel: 16,
        sceneryHighlights: ['Clash Scenery'],
      };
    }

    const newListing: AccountListing = {
      id: `${gameType.slice(0, 2)}-${Date.now()}`,
      gameType,
      title: title || `[${gameType.toUpperCase()}] Verified Gaming Account`,
      description: description || 'Clean verified account with complete proof screenshots. Instant handover via GameZay Escrow.',
      priceMMK,
      priceUSDT: parseFloat((priceMMK / 4500).toFixed(2)),
      status: 'AVAILABLE',
      isVerifiedSeller: true,
      instantDelivery: true,
      views: 1,
      rating: 5.0,
      seller: {
        id: `usr_${Date.now()}`,
        name: payoutName || 'Pro Trader MM',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        phone: payoutPhone,
        tradesCompleted: 12,
        rating: 5.0,
        responseMinutes: 5,
        joinedDate: 'Aug 2026',
      },
      bindingStatus,
      attributes: dynamicAttrs,
      imageUrls: [bannerUrl],
      bannerUrl,
      credentialPreview: {
        authType: gameType === 'efootball' ? 'KONAMI_ID' : gameType === 'mlbb' ? 'MOONTON_ID' : gameType === 'pubg' ? 'TWITTER' : 'SUPERCELL_ID',
        maskedLogin: loginId ? `${loginId.slice(0, 3)}***@gmail.com` : 'user***@gmail.com',
        passwordMasked: '••••••••••••',
        backupCodes: 'OTP Live on Escrow Confirm',
        notes,
      },
      createdAt: new Date().toISOString(),
    };

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.5 },
    });

    onListingCreated(newListing);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/60 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                {t('sell.title')}
              </h3>
              <p className="text-xs text-slate-400">{t('sell.subtitle')}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Game Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {t('sell.gameSelect')} *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'efootball', label: 'eFootball 2025', icon: '⚽' },
                { id: 'mlbb', label: 'Mobile Legends', icon: '⚔️' },
                { id: 'pubg', label: 'PUBG Mobile', icon: '🎯' },
                { id: 'coc', label: 'Clash of Clans', icon: '🏰' },
              ].map((g) => (
                <button
                  type="button"
                  key={g.id}
                  onClick={() => setGameType(g.id as GameType)}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 transition ${
                    gameType === g.id
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span>{g.icon}</span>
                  <span>{g.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                {t('sell.titleLabel')} *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('sell.titlePlaceholder')}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                {t('sell.priceMMK')} *
              </label>
              <input
                type="number"
                required
                min={10000}
                step={5000}
                value={priceMMK}
                onChange={(e) => setPriceMMK(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-emerald-400 font-bold focus:outline-none focus:border-emerald-400"
              />
              <span className="text-[10px] text-cyan-400 font-mono block">
                ≈ {formatTHB(convertMMKtoTHB(priceMMK))} (Rate: 1฿ = {exchangeRate} MMK)
              </span>
            </div>
          </div>

          {/* Dynamic Game-Specific Attributes */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>{t('sell.specsTitle')} ({gameType.toUpperCase()})</span>
            </h4>

            {gameType === 'efootball' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="text-slate-300 block mb-1">Squad Rating (OVR)</label>
                  <input
                    type="number"
                    value={squadRating}
                    onChange={(e) => setSquadRating(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Epic / Big Time Count</label>
                  <input
                    type="number"
                    value={epicCount}
                    onChange={(e) => setEpicCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Division Rank</label>
                  <input
                    type="number"
                    value={division}
                    onChange={(e) => setDivision(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>
            )}

            {gameType === 'mlbb' && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="text-slate-300 block mb-1">Current Rank</label>
                  <input
                    type="text"
                    value={mlbbRank}
                    onChange={(e) => setMlbbRank(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Win Rate %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={winRate}
                    onChange={(e) => setWinRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Collector Skins</label>
                  <input
                    type="number"
                    value={collectorCount}
                    onChange={(e) => setCollectorCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Legend Skins</label>
                  <input
                    type="number"
                    value={legendCount}
                    onChange={(e) => setLegendCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>
            )}

            {gameType === 'pubg' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="text-slate-300 block mb-1">Account Level</label>
                  <input
                    type="number"
                    value={pubgLevel}
                    onChange={(e) => setPubgLevel(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Glacier / Gun Skins</label>
                  <input
                    type="text"
                    value={glacierLvl}
                    onChange={(e) => setGlacierLvl(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Mythic Fashion Count</label>
                  <input
                    type="number"
                    value={mythicCount}
                    onChange={(e) => setMythicCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>
            )}

            {gameType === 'coc' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="text-slate-300 block mb-1">Town Hall Level</label>
                  <input
                    type="number"
                    value={thLevel}
                    onChange={(e) => setThLevel(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Heroes (BK/AQ/GW/RC)</label>
                  <input
                    type="text"
                    value={heroLevels}
                    onChange={(e) => setHeroLevels(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Gems Count</label>
                  <input
                    type="number"
                    value={gemsCount}
                    onChange={(e) => setGemsCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-slate-300 text-xs block mb-1">
                {t('sell.linkedStatus')}
              </label>
              <input
                type="text"
                value={bindingStatus}
                onChange={(e) => setBindingStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          {/* Credentials Vault Encrypted Inputs */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-cyan-500/30 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <Lock className="w-4 h-4" />
              <span>{t('sell.credentialsTitle')}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">{t('sell.loginId')} *</label>
                <input
                  type="text"
                  required
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="seller_account@gmail.com"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">{t('sell.password')} *</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 text-xs block mb-1">{t('sell.notes')}</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          {/* Payout Wallet */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/30 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <Wallet className="w-4 h-4" />
              <span>{t('sell.payoutWallet')}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Wallet Method</label>
                <select
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                >
                  <option value="KBZ_PAY">KBZPay (KPay)</option>
                  <option value="WAVE_PAY">WaveMoney (WavePay)</option>
                  <option value="USDT_TRC20">USDT (TRC-20)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">{t('sell.payoutPhone')} *</label>
                <input
                  type="text"
                  required
                  value={payoutPhone}
                  onChange={(e) => setPayoutPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">{t('sell.payoutName')} *</label>
                <input
                  type="text"
                  required
                  value={payoutName}
                  onChange={(e) => setPayoutName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
            >
              {isMM ? 'ပယ်ဖျက်မည်' : 'Cancel'}
            </button>

            <button
              type="submit"
              className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 text-xs font-black shadow-lg shadow-cyan-500/25 transition cursor-pointer active:scale-95 flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{t('sell.publishListing')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

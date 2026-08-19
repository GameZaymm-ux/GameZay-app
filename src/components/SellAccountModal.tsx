import React, { useState, useRef } from 'react';
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
  UploadCloud,
  Trash2,
  FileImage,
  Layers,
  AlertCircle,
  Plus,
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [gameType, setGameType] = useState<GameType>('efootball');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priceMMK, setPriceMMK] = useState<number>(250000);
  const [bindingStatus, setBindingStatus] = useState('Clean First-Hand Transferable');

  // Multi-Image Upload State
  const [uploadedImages, setUploadedImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
  ]);
  const [isDragging, setIsDragging] = useState(false);

  // eFootball specs
  const [squadRating, setSquadRating] = useState(3150);
  const [epicCount, setEpicCount] = useState(14);
  const [division, setDivision] = useState(1);
  const [coinsCount, setCoinsCount] = useState(1500);
  const [gpAmount, setGpAmount] = useState(2500000);

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

  // Free Fire specs
  const [ffRank, setFfRank] = useState('Master 4-Star');
  const [ffLevel, setFfLevel] = useState(78);
  const [evoGunsCount, setEvoGunsCount] = useState(4);

  // Genshin specs
  const [genshinAR, setGenshinAR] = useState(60);
  const [fiveStarCount, setFiveStarCount] = useState(38);
  const [primogemsCount, setPrimogemsCount] = useState(24500);
  const [genshinServer, setGenshinServer] = useState('Asia');

  // Credentials
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [notes, setNotes] = useState('First hand account. Fast handover with instant OTP verification.');

  // Payout Wallet
  const [payoutMethod, setPayoutMethod] = useState<'KBZ_PAY' | 'WAVE_PAY' | 'USDT_TRC20'>('KBZ_PAY');
  const [payoutPhone, setPayoutPhone] = useState('09798881234');
  const [payoutName, setPayoutName] = useState('Ko Seller');

  if (!isOpen) return null;

  // Handle File Uploads (Multiple Images)
  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    fileArray.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setUploadedImages((prev) => {
              // Avoid duplicates and limit to 8 screenshots
              if (prev.length >= 8) return prev;
              return [...prev, e.target!.result as string];
            });
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setUploadedImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleAddSamplePreset = () => {
    const presetsByGame: Record<GameType, string[]> = {
      efootball: [
        'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
      ],
      mlbb: [
        'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=80',
      ],
      pubg: [
        'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
      ],
      coc: [
        'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=80',
      ],
      freefire: [
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
      ],
      genshin: [
        'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80',
      ],
    };

    setUploadedImages((prev) => [...prev, ...(presetsByGame[gameType] || presetsByGame.efootball)]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let dynamicAttrs: any = {};
    let fallbackBanner = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80';

    if (gameType === 'efootball') {
      fallbackBanner = 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80';
      dynamicAttrs = {
        division,
        squadRating,
        epicCount,
        showtimeCount: 4,
        coins: coinsCount,
        gp: gpAmount,
        konamiStatus: bindingStatus,
        platform: 'Android / iOS',
        highlightPlayers: ['Epic Booster Cards', 'Show Time Players', 'Big Time Legends'],
      };
    } else if (gameType === 'mlbb') {
      fallbackBanner = 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80';
      dynamicAttrs = {
        currentRank: mlbbRank,
        peakRank: 'Immortal 120★',
        winRate,
        totalMatches: 3500,
        collectorSkins: collectorCount,
        legendSkins: legendCount,
        epicSkins: 30,
        totalHeroes: 122,
        moontonStatus: bindingStatus,
        signatureSkins: ['Collector Skins', 'Legend Limited Skin', 'Epic Showcase'],
      };
    } else if (gameType === 'pubg') {
      fallbackBanner = 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=80';
      dynamicAttrs = {
        level: pubgLevel,
        tier: 'Ace Master',
        glacierLevel: glacierLvl,
        upgradableGuns: 5,
        mythicFashion: mythicCount,
        royalePassSeasons: 'RP Maxed',
        linkStatus: bindingStatus,
        inventoryHighlights: [glacierLvl, `${mythicCount} Mythic Outfits`, 'Kill Message Effects'],
      };
    } else if (gameType === 'freefire') {
      fallbackBanner = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80';
      dynamicAttrs = {
        rank: ffRank,
        level: ffLevel,
        evoGunsMax: evoGunsCount,
        booyahPass: 'Season 1-18 Max',
        linkStatus: bindingStatus,
        inventoryHighlights: [`${evoGunsCount} Max Evo Guns`, 'Sakura / Hip Hop Bundles'],
      };
    } else if (gameType === 'genshin') {
      fallbackBanner = 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80';
      dynamicAttrs = {
        adventureRank: genshinAR,
        fiveStarChars: fiveStarCount,
        primogems: primogemsCount,
        server: genshinServer,
        linkStatus: bindingStatus,
        inventoryHighlights: ['C6 Furina + BiS', 'C2 Raiden Shogun', 'Arlecchino + Signature'],
      };
    } else {
      fallbackBanner = 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=80';
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
        sceneryHighlights: ['Clash Scenery Pack', 'War Arena Skin'],
      };
    }

    const finalImages = uploadedImages.length > 0 ? uploadedImages : [fallbackBanner];
    const finalBanner = finalImages[0];

    const defaultDescription = isMM
      ? `အကောင့်၏ အချက်အလက်များ အားလုံး စစ်ဆေးပြီးဖြစ်ပါသည်။ Email / Login အပြည့်အစုံ လွှဲပြောင်းပေးမည်ဖြစ်ပြီး GameZay ၂၄ နာရီ Escrow အာမခံဖြင့် စိတ်ချစွာ ဝယ်ယူနိုင်ပါသည်။`
      : `Clean verified account with complete proof screenshots. Full login credentials and OTP provided immediately upon escrow lock. 24h inspection guarantee.`;

    const newListing: AccountListing = {
      id: `${gameType.slice(0, 2)}-${Date.now()}`,
      gameType,
      title: title || `[${gameType.toUpperCase()}] Clean Verified Gaming Account`,
      description: description.trim() || defaultDescription,
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
        tradesCompleted: 14,
        rating: 5.0,
        responseMinutes: 5,
        joinedDate: 'Aug 2026',
      },
      bindingStatus,
      attributes: dynamicAttrs,
      imageUrls: finalImages,
      bannerUrl: finalBanner,
      credentialPreview: {
        authType: gameType === 'efootball' ? 'KONAMI_ID' : gameType === 'mlbb' ? 'MOONTON_ID' : gameType === 'pubg' ? 'TWITTER' : gameType === 'freefire' ? 'FACEBOOK' : gameType === 'genshin' ? 'HOYOVERSE' : 'SUPERCELL_ID',
        maskedLogin: loginId ? `${loginId.slice(0, 3)}***@gmail.com` : 'seller_user***@gmail.com',
        passwordMasked: '••••••••••••',
        backupCodes: 'OTP Live on Escrow Confirm',
        notes: notes || 'First hand clean account.',
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
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-4 max-h-[92vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/70 p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <PlusCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                {isMM ? 'ဂိမ်းအကောင့် အခမဲ့ အရောင်းတင်မည်' : 'Post Account Listing for Sale'}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-300">
                {isMM ? 'GameZay Escrow စနစ်ဖြင့် အလိမ်အညာကင်းစွာ တိုက်ရိုက်ရောင်းချပါ' : 'Zero listing fee • 100% Escrow Buyer-Seller Protection'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1 pb-8">
          
          {/* 1. Game Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span>{isMM ? 'ဂိမ်းအမျိုးအစား ရွေးချယ်ပါ' : 'Select Game Category'} *</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {[
                { id: 'efootball', label: 'eFootball 2026', icon: '⚽' },
                { id: 'mlbb', label: 'Mobile Legends', icon: '⚔️' },
                { id: 'pubg', label: 'PUBG Mobile', icon: '🎯' },
                { id: 'coc', label: 'Clash of Clans', icon: '🏰' },
                { id: 'freefire', label: 'Free Fire', icon: '🔥' },
                { id: 'genshin', label: 'Genshin Impact', icon: '✨' },
              ].map((g) => (
                <button
                  type="button"
                  key={g.id}
                  onClick={() => setGameType(g.id as GameType)}
                  className={`p-2.5 sm:p-3 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                    gameType === g.id
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md scale-[1.02]'
                      : 'bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700'
                  }`}
                >
                  <span className="text-lg">{g.icon}</span>
                  <span className="text-[11px] truncate w-full text-center">{g.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Title & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {isMM ? 'ကြော်ငြာ ခေါင်းစဉ် (Listing Title)' : 'Listing Title'} *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  gameType === 'efootball'
                    ? 'e.g. eFootball 3150 OVR | 18 Epic Boosters | Div 1 | 1500 Coins'
                    : gameType === 'mlbb'
                    ? 'e.g. MLBB Immortal 120★ | 4 Collector + All KOF | Clean Moonton'
                    : 'e.g. High Tier Verified Clean Account'
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {isMM ? 'ရောင်းမည့်စျေးနှုန်း (MMK)' : 'Selling Price (MMK)'} *
              </label>
              <input
                type="number"
                required
                min={5000}
                step={5000}
                value={priceMMK}
                onChange={(e) => setPriceMMK(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono block">
                ≈ {formatTHB(convertMMKtoTHB(priceMMK))} (Rate: 1฿ = {exchangeRate} MMK)
              </span>
            </div>
          </div>

          {/* 3. Game-Specific Stats Grid */}
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>{isMM ? 'ဂိမ်းအချက်အလက်များ' : 'Key Account Specs'} ({gameType.toUpperCase()})</span>
            </h4>

            {gameType === 'efootball' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-xs">
                <div>
                  <label className="text-slate-600 dark:text-slate-300 block mb-1">Squad Rating (OVR)</label>
                  <input
                    type="number"
                    value={squadRating}
                    onChange={(e) => setSquadRating(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-300 block mb-1">Epic / Big Time</label>
                  <input
                    type="number"
                    value={epicCount}
                    onChange={(e) => setEpicCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-300 block mb-1">Division Rank</label>
                  <input
                    type="number"
                    value={division}
                    onChange={(e) => setDivision(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-amber-600 dark:text-amber-400 block mb-1 font-semibold">Coins 🪙</label>
                  <input
                    type="number"
                    value={coinsCount}
                    onChange={(e) => setCoinsCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-amber-500/50 rounded-xl text-amber-600 dark:text-amber-300 font-bold"
                  />
                </div>
                <div>
                  <label className="text-cyan-600 dark:text-cyan-400 block mb-1 font-semibold">GP Balance 💰</label>
                  <input
                    type="number"
                    value={gpAmount}
                    onChange={(e) => setGpAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-cyan-500/50 rounded-xl text-cyan-600 dark:text-cyan-300 font-bold"
                  />
                </div>
              </div>
            )}

            {gameType === 'mlbb' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="text-slate-600 dark:text-slate-300 block mb-1">Current Rank</label>
                  <input
                    type="text"
                    value={mlbbRank}
                    onChange={(e) => setMlbbRank(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-300 block mb-1">Win Rate %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={winRate}
                    onChange={(e) => setWinRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-300 block mb-1">Collector Skins</label>
                  <input
                    type="number"
                    value={collectorCount}
                    onChange={(e) => setCollectorCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-300 block mb-1">Legend Skins</label>
                  <input
                    type="number"
                    value={legendCount}
                    onChange={(e) => setLegendCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            {gameType === 'pubg' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-slate-600 dark:text-slate-300 block mb-1">Account Level</label>
                  <input
                    type="number"
                    value={pubgLevel}
                    onChange={(e) => setPubgLevel(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-300 block mb-1">Glacier / Gun Skins</label>
                  <input
                    type="text"
                    value={glacierLvl}
                    onChange={(e) => setGlacierLvl(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-300 block mb-1">Mythic Fashion Count</label>
                  <input
                    type="number"
                    value={mythicCount}
                    onChange={(e) => setMythicCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            {gameType === 'coc' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-slate-600 dark:text-slate-300 block mb-1">Town Hall Level</label>
                  <input
                    type="number"
                    value={thLevel}
                    onChange={(e) => setThLevel(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-300 block mb-1">Heroes (BK/AQ/GW/RC)</label>
                  <input
                    type="text"
                    value={heroLevels}
                    onChange={(e) => setHeroLevels(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-300 block mb-1">Gems Count</label>
                  <input
                    type="number"
                    value={gemsCount}
                    onChange={(e) => setGemsCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            {gameType === 'freefire' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-slate-600 dark:text-slate-300 block mb-1">Rank / Tier</label>
                  <input
                    type="text"
                    value={ffRank}
                    onChange={(e) => setFfRank(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-300 block mb-1">Account Level</label>
                  <input
                    type="number"
                    value={ffLevel}
                    onChange={(e) => setFfLevel(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-300 block mb-1">Max Evo Guns Count</label>
                  <input
                    type="number"
                    value={evoGunsCount}
                    onChange={(e) => setEvoGunsCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            {gameType === 'genshin' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="text-slate-600 dark:text-slate-300 block mb-1">Adventure Rank (AR)</label>
                  <input
                    type="number"
                    value={genshinAR}
                    onChange={(e) => setGenshinAR(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-300 block mb-1">5-Star Characters</label>
                  <input
                    type="number"
                    value={fiveStarCount}
                    onChange={(e) => setFiveStarCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-300 block mb-1">Primogems</label>
                  <input
                    type="number"
                    value={primogemsCount}
                    onChange={(e) => setPrimogemsCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-300 block mb-1">Server Region</label>
                  <input
                    type="text"
                    value={genshinServer}
                    onChange={(e) => setGenshinServer(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-slate-600 dark:text-slate-300 text-xs block mb-1">
                {isMM ? 'ချိတ်ဆက်ထားမှု အခြေအနေ (Binding & Links)' : 'Binding & Clean Status'}
              </label>
              <input
                type="text"
                value={bindingStatus}
                onChange={(e) => setBindingStatus(e.target.value)}
                placeholder="e.g. Clean First-Hand, No 3rd party links, Transferable Email"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* 4. MULTI-IMAGE UPLOAD SECTION */}
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-cyan-500" />
                  <span>{isMM ? 'အကောင့်ဓာတ်ပုံများ တင်ပါ (Account Screenshots)' : 'Account Screenshots & Proof'} *</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isMM
                    ? 'ပထမဆုံးပုံသည် အဓိကကာဗာပုံ ဖြစ်မည်။ အကောင့်စကွင်း၊ Rank နှင့် Stats ပုံများကို စုံလင်စွာ တင်ပေးပါ။'
                    : 'The first image will be used as the cover thumbnail. Add screenshots of inventory, ranks, and cards.'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddSamplePreset}
                className="px-2.5 py-1 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold hover:text-cyan-500 transition flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus className="w-3 h-3 text-cyan-400" />
                <span>{isMM ? 'နမူနာပုံ ထည့်မည်' : 'Add Preset'}</span>
              </button>
            </div>

            {/* Hidden native input */}
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />

            {/* Drag & Drop Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-4 sm:p-6 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? 'border-cyan-500 bg-cyan-500/10 scale-[1.01]'
                  : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/60 hover:border-cyan-500/60 hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">
                    {isMM
                      ? 'ဓာတ်ပုံများ ဆွဲထည့်ပါ သို့မဟုတ် ဤနေရာကို နှိပ်၍ ရွေးချယ်ပါ'
                      : 'Click to upload or drag & drop screenshots'}
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    PNG, JPG, WEBP • Max 8 photos • Up to 10MB each
                  </p>
                </div>
              </div>
            </div>

            {/* Uploaded Images Preview Grid */}
            {uploadedImages.length > 0 && (
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    {uploadedImages.length} {isMM ? 'ပုံ တင်ထားပြီး' : 'photos uploaded'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setUploadedImages([])}
                    className="text-[10px] text-rose-500 hover:underline font-bold"
                  >
                    {isMM ? 'အားလုံးဖျက်မည်' : 'Clear all'}
                  </button>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
                  {uploadedImages.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-video sm:aspect-square rounded-xl overflow-hidden group border border-slate-200 dark:border-slate-700 bg-slate-950 shadow-sm"
                    >
                      <img
                        src={imgUrl}
                        alt={`upload-${idx}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                      />

                      {/* Cover Badge on first image */}
                      {idx === 0 && (
                        <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-cyan-500 text-slate-950 text-[9px] font-black uppercase tracking-wider shadow">
                          Cover
                        </div>
                      )}

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(idx);
                        }}
                        className="absolute top-1 right-1 p-1 rounded-lg bg-slate-950/80 text-rose-400 hover:bg-rose-500 hover:text-white transition shadow cursor-pointer opacity-90 group-hover:opacity-100"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {/* Add more tile if < 8 */}
                  {uploadedImages.length < 8 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-video sm:aspect-square rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-cyan-500 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-cyan-500 transition cursor-pointer"
                    >
                      <Plus className="w-5 h-5" />
                      <span className="text-[10px] font-bold">{isMM ? 'ထပ်ထည့်ရန်' : 'Add more'}</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 5. DETAILED DESCRIPTION SECTION */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>{isMM ? 'အသေးစိတ် ဖော်ပြချက် (Account Description)' : 'Detailed Description'} *</span>
              <span className="text-[11px] text-slate-400 font-normal">
                {description.length}/1000
              </span>
            </label>
            <textarea
              rows={5}
              maxLength={1000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                isMM
                  ? 'အကောင့်၏ အသေးစိတ်အချက်အလက်များ၊ ပါဝင်သော Skins/Cards များ၊ Email/Login Type ချိတ်ဆက်ထားမှုအခြေအနေများကို ပြည့်စုံစွာ ရေးသားပေးပါ...'
                  : 'Describe your account details, top heroes, legendary skins, cards, and email link transfer status in detail...'
              }
              className="w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-y leading-relaxed"
            />
          </div>

          {/* 6. Credentials Vault Encrypted Inputs */}
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-cyan-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-300 flex items-center gap-1.5">
                <Lock className="w-4 h-4" />
                <span>{isMM ? 'လုံခြုံသော အကောင့်ဝင်ရောက်ခွင့် (Encrypted Vault)' : 'Encrypted Credentials Vault'}</span>
              </h4>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                {isMM ? 'ဝယ်သူ ငွေလွှဲပြီးမှသာ ဖွင့်ပြပါမည်' : 'Hidden until Escrow Locked'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1">
                  {isMM ? 'Login ID / Email / Phone' : 'Login ID / Email'} *
                </label>
                <input
                  type="text"
                  required
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="seller_account@gmail.com"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1">
                  {isMM ? 'Password (စကားဝှက်)' : 'Password'} *
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-700 dark:text-slate-300 text-xs block mb-1">
                {isMM ? 'လွှဲပြောင်းမှု မှတ်ချက် (Transfer Notes / OTP info)' : 'Transfer Notes'}
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. 24/7 active for OTP verification on Telegram or Phone"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* 7. Payout Wallet */}
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-amber-500/30 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-300 flex items-center gap-1.5">
              <Wallet className="w-4 h-4" />
              <span>{isMM ? 'ငွေလက်ခံမည့် ပိုက်ဆံအိတ် (Seller Payout Wallet)' : 'Seller Payout Wallet'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1">
                  {isMM ? 'ငွေပေးချေမှု နည်းလမ်း' : 'Payment Method'}
                </label>
                <select
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  <option value="KBZ_PAY">KBZPay (KPay)</option>
                  <option value="WAVE_PAY">WaveMoney (WavePay)</option>
                  <option value="USDT_TRC20">USDT (TRC-20)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1">
                  {isMM ? 'ပိုက်ဆံအိတ် ဖုန်းနံပါတ် / လိပ်စာ' : 'Wallet Phone / Address'} *
                </label>
                <input
                  type="text"
                  required
                  value={payoutPhone}
                  onChange={(e) => setPayoutPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1">
                  {isMM ? 'အကောင့်ပိုင်ရှင် အမည်' : 'Account Holder Name'} *
                </label>
                <input
                  type="text"
                  required
                  value={payoutName}
                  onChange={(e) => setPayoutName(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Submit Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 sticky bottom-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md py-3 -mx-4 sm:-mx-6 px-4 sm:px-6 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              {isMM ? 'ပယ်ဖျက်မည်' : 'Cancel'}
            </button>

            <button
              type="submit"
              className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 text-xs font-black shadow-lg shadow-cyan-500/25 transition cursor-pointer active:scale-95 flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isMM ? 'အတည်ပြု၍ အရောင်းတင်မည်' : 'Confirm & Publish Listing'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

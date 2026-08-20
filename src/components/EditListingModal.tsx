import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { AccountListing, GameType } from '../types';
import {
  X,
  Sparkles,
  Check,
  UploadCloud,
  Trash2,
  FileImage,
  Layers,
  AlertCircle,
  Plus,
  Coins,
  ShieldCheck,
  Eye,
  DollarSign,
  Image as ImageIcon,
  Edit3,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface EditListingModalProps {
  isOpen: boolean;
  listing: AccountListing | null;
  onClose: () => void;
  onSave: (listingId: string, updatedFields: Partial<AccountListing>) => void;
}

export const EditListingModal: React.FC<EditListingModalProps> = ({
  isOpen,
  listing,
  onClose,
  onSave,
}) => {
  const { t, formatMMK, formatTHB, convertMMKtoTHB, isMM } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states initialized from listing
  const [gameType, setGameType] = useState<GameType>('efootball');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priceMMK, setPriceMMK] = useState<number>(0);
  const [status, setStatus] = useState<AccountListing['status']>('AVAILABLE');
  const [bindingStatus, setBindingStatus] = useState('Clean First-Hand Transferable');

  // Photo Management
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<string | null>(null);

  // Game-Specific Stats States
  // eFootball
  const [squadRating, setSquadRating] = useState<number>(3150);
  const [epicCount, setEpicCount] = useState<number>(14);
  const [division, setDivision] = useState<number>(1);
  const [coinsCount, setCoinsCount] = useState<number>(1500);

  // MLBB
  const [mlbbRank, setMlbbRank] = useState<string>('Mythical Immortal (140★)');
  const [winRate, setWinRate] = useState<number>(68.5);
  const [collectorCount, setCollectorCount] = useState<number>(4);
  const [epicSkinsCount, setEpicSkinsCount] = useState<number>(35);

  // PUBG
  const [pubgLevel, setPubgLevel] = useState<number>(75);
  const [glacierLvl, setGlacierLvl] = useState<string>('M416 Glacier Lvl 5');
  const [mythicCount, setMythicCount] = useState<number>(28);

  // COC
  const [thLevel, setThLevel] = useState<number>(16);
  const [gemsCount, setGemsCount] = useState<number>(3800);
  const [heroLevels, setHeroLevels] = useState<string>('K90 / Q90 / W65 / RC40');

  // Free Fire
  const [ffRank, setFfRank] = useState<string>('Master 4-Star');
  const [evoGunsCount, setEvoGunsCount] = useState<number>(4);

  // Genshin
  const [genshinAR, setGenshinAR] = useState<number>(60);
  const [fiveStarCount, setFiveStarCount] = useState<number>(38);

  // Sync state whenever listing prop changes
  useEffect(() => {
    if (listing) {
      setGameType(listing.gameType || 'efootball');
      setTitle(listing.title || '');
      setDescription(listing.description || '');
      setPriceMMK(listing.priceMMK || 0);
      setStatus(listing.status || 'AVAILABLE');
      setBindingStatus(listing.bindingStatus || 'Clean First-Hand Transferable');
      setImageUrls(listing.imageUrls && listing.imageUrls.length > 0 ? [...listing.imageUrls] : [
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80'
      ]);

      // Populate game-specific stats if present
      const attrs = listing.attributes || {};
      if (listing.gameType === 'efootball') {
        setSquadRating(attrs.squadRating || 3150);
        setEpicCount(attrs.epicCount || 14);
        setDivision(attrs.division || 1);
        setCoinsCount(attrs.coins || 1500);
      } else if (listing.gameType === 'mlbb') {
        setMlbbRank(attrs.currentRank || 'Mythical Immortal (140★)');
        setWinRate(attrs.winRate || 68.5);
        setCollectorCount(attrs.collectorSkins || 4);
        setEpicSkinsCount(attrs.epicSkins || 35);
      } else if (listing.gameType === 'pubg') {
        setPubgLevel(attrs.level || 75);
        setGlacierLvl(attrs.glacierLevel || 'M416 Glacier Lvl 5');
        setMythicCount(attrs.mythicFashion || 28);
      } else if (listing.gameType === 'coc') {
        setThLevel(attrs.townHall || 16);
        setGemsCount(attrs.gems || 3800);
        setHeroLevels(attrs.kingLevel ? `K${attrs.kingLevel} / Q${attrs.queenLevel} / W${attrs.wardenLevel}` : 'K90 / Q90 / W65 / RC40');
      } else if (listing.gameType === 'freefire') {
        setFfRank(attrs.rank || 'Master 4-Star');
        setEvoGunsCount(attrs.evoGuns || 4);
      } else if (listing.gameType === 'genshin') {
        setGenshinAR(attrs.adventureRank || 60);
        setFiveStarCount(attrs.fiveStarCharacters || 38);
      }
    }
  }, [listing]);

  if (!isOpen || !listing) return null;

  // Image Upload Handlers
  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);
    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImageUrls((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleAddUrl = () => {
    if (urlInput.trim()) {
      setImageUrls((prev) => [...prev, urlInput.trim()]);
      setUrlInput('');
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImageUrls((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleAddPresetImage = () => {
    const presets = [
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=80',
    ];
    const randomPreset = presets[Math.floor(Math.random() * presets.length)];
    setImageUrls((prev) => [...prev, randomPreset]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Construct dynamic attributes object based on game
    let updatedAttributes = { ...(listing.attributes || {}) };
    if (gameType === 'efootball') {
      updatedAttributes = {
        ...updatedAttributes,
        squadRating,
        epicCount,
        division,
        coins: coinsCount,
      };
    } else if (gameType === 'mlbb') {
      updatedAttributes = {
        ...updatedAttributes,
        currentRank: mlbbRank,
        winRate,
        collectorSkins: collectorCount,
        epicSkins: epicSkinsCount,
      };
    } else if (gameType === 'pubg') {
      updatedAttributes = {
        ...updatedAttributes,
        level: pubgLevel,
        glacierLevel: glacierLvl,
        mythicFashion: mythicCount,
      };
    } else if (gameType === 'coc') {
      updatedAttributes = {
        ...updatedAttributes,
        townHall: thLevel,
        gems: gemsCount,
      };
    } else if (gameType === 'freefire') {
      updatedAttributes = {
        ...updatedAttributes,
        rank: ffRank,
        evoGuns: evoGunsCount,
      };
    } else if (gameType === 'genshin') {
      updatedAttributes = {
        ...updatedAttributes,
        adventureRank: genshinAR,
        fiveStarCharacters: fiveStarCount,
      };
    }

    const updatedFields: Partial<AccountListing> = {
      title,
      description,
      priceMMK: Number(priceMMK),
      gameType,
      status,
      bindingStatus,
      imageUrls: imageUrls.length > 0 ? imageUrls : listing.imageUrls,
      attributes: updatedAttributes,
    };

    onSave(listing.id, updatedFields);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl my-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {t('sellerStudio.editModal.title')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('sellerStudio.editModal.subtitle')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto no-scrollbar">
          {/* Section 1: Basic Information & Game Selection */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-500" />
              <span>1. Basic Listing Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Game Category */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  {t('sellerStudio.editModal.gameType')}
                </label>
                <select
                  value={gameType}
                  onChange={(e) => setGameType(e.target.value as GameType)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="efootball">eFootball (PES)</option>
                  <option value="mlbb">Mobile Legends: Bang Bang</option>
                  <option value="pubg">PUBG Mobile</option>
                  <option value="coc">Clash of Clans</option>
                  <option value="freefire">Free Fire</option>
                  <option value="genshin">Genshin Impact</option>
                </select>
              </div>

              {/* Visibility Status */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  {t('sellerStudio.editModal.listingStatus')}
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="AVAILABLE">AVAILABLE (On Sale in Market)</option>
                  <option value="IN_ESCROW">IN_ESCROW (Locked in Deal)</option>
                  <option value="SOLD">SOLD (Archived / Sold Out)</option>
                </select>
              </div>
            </div>

            {/* Listing Title */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                {t('sellerStudio.editModal.gameTitle')}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 14 Epics + Big Time Messi | Rating 3150 Division 1"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            {/* Price MMK & THB */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  {t('sellerStudio.editModal.priceMMK')}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={priceMMK}
                    onChange={(e) => setPriceMMK(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                  <span className="absolute right-3 top-2.5 text-[11px] font-mono text-emerald-500 font-bold">
                    ≈ {formatTHB(convertMMKtoTHB(priceMMK))}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  {t('sellerStudio.editModal.bindingStatus')}
                </label>
                <select
                  value={bindingStatus}
                  onChange={(e) => setBindingStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Clean First-Hand Transferable">Clean First-Hand Transferable (အရှုပ်အရှင်းကင်း)</option>
                  <option value="Moonton All Unbind / Clean Email">Moonton All Unbind / Clean Email</option>
                  <option value="Konami ID Linked / Transfer Available">Konami ID Linked / Transfer Available</option>
                  <option value="Supercell ID Clean Handover">Supercell ID Clean Handover</option>
                  <option value="Twitter / Google Single Linked">Twitter / Google Single Linked</option>
                </select>
              </div>
            </div>

            {/* Rich Description Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t('sellerStudio.editModal.descriptionLabel')}
                </label>
                <span className="text-[10px] text-slate-400">{description.length} characters</span>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder={t('sellerStudio.editModal.descriptionPlaceholder')}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 resize-y leading-relaxed"
                required
              />
            </div>
          </div>

          {/* Section 2: Photo Management & Upload Dropzone */}
          <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-emerald-500" />
                  <span>{t('sellerStudio.editModal.photosLabel')} ({imageUrls.length})</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t('sellerStudio.editModal.photosHint')}
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddPresetImage}
                className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>{t('sellerStudio.editModal.addSamplePhotos')}</span>
              </button>
            </div>

            {/* Existing Thumbnails Gallery with Individual 'X' remove */}
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                {imageUrls.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 aspect-video bg-slate-100 dark:bg-slate-950 shadow-sm"
                  >
                    <img
                      src={url}
                      alt={`Screenshot ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />

                    {/* Main Banner Badge */}
                    {idx === 0 && (
                      <span className="absolute top-1 left-1 bg-emerald-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded shadow">
                        Cover
                      </span>
                    )}

                    {/* Delete Photo Button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white transition cursor-pointer shadow opacity-90 group-hover:opacity-100"
                      title="Remove image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Drag and Drop Upload Dropzone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center space-y-1.5 ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500/50 bg-slate-50 dark:bg-slate-950/60'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleFiles(e.target.files)}
                multiple
                accept="image/*"
                className="hidden"
              />
              <UploadCloud className="w-7 h-7 text-emerald-500 mx-auto" />
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {t('sellerStudio.editModal.uploadDropzone')}
              </div>
              <div className="text-[10px] text-slate-400">
                {t('sellerStudio.editModal.uploadDropzoneSub')}
              </div>
            </div>

            {/* Add Image by Direct URL */}
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/screenshot.png"
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleAddUrl}
                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition shrink-0 cursor-pointer"
              >
                {t('sellerStudio.editModal.addByUrl')}
              </button>
            </div>
          </div>

          {/* Section 3: Dynamic Game-Specific Stats Fields */}
          <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>{t('sellerStudio.editModal.specsTitle')} ({gameType.toUpperCase()})</span>
            </h3>

            {/* eFootball Fields */}
            {gameType === 'efootball' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Squad Rating
                  </label>
                  <input
                    type="number"
                    value={squadRating}
                    onChange={(e) => setSquadRating(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Epic Players
                  </label>
                  <input
                    type="number"
                    value={epicCount}
                    onChange={(e) => setEpicCount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Division
                  </label>
                  <input
                    type="number"
                    value={division}
                    onChange={(e) => setDivision(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    eFootball Coins
                  </label>
                  <input
                    type="number"
                    value={coinsCount}
                    onChange={(e) => setCoinsCount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                  />
                </div>
              </div>
            )}

            {/* MLBB Fields */}
            {gameType === 'mlbb' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Current Rank
                  </label>
                  <input
                    type="text"
                    value={mlbbRank}
                    onChange={(e) => setMlbbRank(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Win Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={winRate}
                    onChange={(e) => setWinRate(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Collector Skins
                  </label>
                  <input
                    type="number"
                    value={collectorCount}
                    onChange={(e) => setCollectorCount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Epic Skins
                  </label>
                  <input
                    type="number"
                    value={epicSkinsCount}
                    onChange={(e) => setEpicSkinsCount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                  />
                </div>
              </div>
            )}

            {/* PUBG Fields */}
            {gameType === 'pubg' && (
              <div className="grid grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Account Level
                  </label>
                  <input
                    type="number"
                    value={pubgLevel}
                    onChange={(e) => setPubgLevel(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Glacier / Gun Lab
                  </label>
                  <input
                    type="text"
                    value={glacierLvl}
                    onChange={(e) => setGlacierLvl(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Mythic Outfits
                  </label>
                  <input
                    type="number"
                    value={mythicCount}
                    onChange={(e) => setMythicCount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                  />
                </div>
              </div>
            )}

            {/* COC Fields */}
            {gameType === 'coc' && (
              <div className="grid grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Town Hall Level
                  </label>
                  <input
                    type="number"
                    value={thLevel}
                    onChange={(e) => setThLevel(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Gems Count
                  </label>
                  <input
                    type="number"
                    value={gemsCount}
                    onChange={(e) => setGemsCount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Hero Levels
                  </label>
                  <input
                    type="text"
                    value={heroLevels}
                    onChange={(e) => setHeroLevels(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
              </div>
            )}

            {/* Free Fire & Genshin Fields */}
            {gameType === 'freefire' && (
              <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Rank
                  </label>
                  <input
                    type="text"
                    value={ffRank}
                    onChange={(e) => setFfRank(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Evo Guns
                  </label>
                  <input
                    type="number"
                    value={evoGunsCount}
                    onChange={(e) => setEvoGunsCount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                  />
                </div>
              </div>
            )}

            {gameType === 'genshin' && (
              <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Adventure Rank (AR)
                  </label>
                  <input
                    type="number"
                    value={genshinAR}
                    onChange={(e) => setGenshinAR(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    5-Star Characters
                  </label>
                  <input
                    type="number"
                    value={fiveStarCount}
                    onChange={(e) => setFiveStarCount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              {t('sellerStudio.editModal.cancel')}
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:brightness-110 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{t('sellerStudio.editModal.saveChanges')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { GameType } from '../types';

interface GameCategoryTabsProps {
  selectedGame: GameType | 'all';
  onSelectGame?: (game: GameType | 'all') => void;
  setSelectedGame?: (game: GameType | 'all') => void;
  gameCounts: Record<GameType | 'all', number>;
}

export const GameCategoryTabs: React.FC<GameCategoryTabsProps> = ({
  selectedGame,
  onSelectGame,
  setSelectedGame,
  gameCounts,
}) => {
  const { t, isMM } = useLanguage();

  const handleSelect = (gameId: GameType | 'all') => {
    if (onSelectGame) {
      onSelectGame(gameId);
    } else if (setSelectedGame) {
      setSelectedGame(gameId);
    }
  };

  const games: { id: GameType | 'all'; labelKey: string; icon: string; badgeColor: string }[] = [
    { id: 'all', labelKey: 'games.all', icon: '🎮', badgeColor: 'bg-slate-700' },
    { id: 'mlbb', labelKey: 'games.mlbb', icon: '⚔️', badgeColor: 'bg-amber-600' },
    { id: 'efootball', labelKey: 'games.efootball', icon: '⚽', badgeColor: 'bg-blue-600' },
    { id: 'pubg', labelKey: 'games.pubg', icon: '🎯', badgeColor: 'bg-orange-600' },
    { id: 'coc', labelKey: 'games.coc', icon: '🏰', badgeColor: 'bg-yellow-600' },
    { id: 'freefire', labelKey: 'games.freefire', icon: '🔥', badgeColor: 'bg-rose-600' },
    { id: 'genshin', labelKey: 'games.genshin', icon: '✨', badgeColor: 'bg-purple-600' },
  ];

  return (
    <div className="w-full sticky top-16 z-20 backdrop-blur-xl bg-slate-50/90 dark:bg-slate-950/90 border-y border-slate-200/80 dark:border-slate-800/80 py-2.5 shadow-sm transition-colors">
      <div className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1.5 sm:gap-2.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5">
          {games.map((g) => {
            const isSelected = selectedGame === g.id;
            const count = gameCounts ? gameCounts[g.id] || 0 : 0;

            return (
              <button
                key={g.id}
                onClick={() => handleSelect(g.id)}
                className={`group shrink-0 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer active:scale-95 ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-slate-950 shadow-md shadow-cyan-500/25 scale-[1.02]'
                    : 'bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/40 shadow-sm'
                }`}
              >
                <span className="text-sm sm:text-base group-hover:scale-110 transition-transform">
                  {g.icon}
                </span>
                <span className="whitespace-nowrap">
                  {t(g.labelKey)}
                </span>
                <span
                  className={`text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded-full font-mono font-bold transition-colors ${
                    isSelected
                      ? 'bg-slate-950 text-cyan-300 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

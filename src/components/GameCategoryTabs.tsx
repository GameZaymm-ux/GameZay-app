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
    { id: 'efootball', labelKey: 'games.efootball', icon: '⚽', badgeColor: 'bg-blue-600' },
    { id: 'mlbb', labelKey: 'games.mlbb', icon: '⚔️', badgeColor: 'bg-amber-600' },
    { id: 'pubg', labelKey: 'games.pubg', icon: '🎯', badgeColor: 'bg-orange-600' },
    { id: 'coc', labelKey: 'games.coc', icon: '🏰', badgeColor: 'bg-yellow-600' },
    { id: 'freefire', labelKey: 'games.freefire', icon: '🔥', badgeColor: 'bg-rose-600' },
    { id: 'genshin', labelKey: 'games.genshin', icon: '✨', badgeColor: 'bg-purple-600' },
  ];

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2">
      <div className="flex items-center gap-2 min-w-max">
        {games.map((g) => {
          const isSelected = selectedGame === g.id;
          const count = gameCounts ? gameCounts[g.id] || 0 : 0;

          return (
            <button
              key={g.id}
              onClick={() => handleSelect(g.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/25 scale-[1.02]'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <span className="text-base">{g.icon}</span>
              <span>{t(g.labelKey)}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  isSelected
                    ? 'bg-slate-950 text-cyan-300'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

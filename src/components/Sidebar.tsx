import type { GameStats, Ship } from '../types/game';

interface SidebarProps {
  playerStats: GameStats;
  aiStats: GameStats;
  playerShips: Ship[];
  aiShips: Ship[];
  message: string;
}

export default function Sidebar({
  playerStats,
  aiStats,
  playerShips,
  aiShips,
  message,
}: SidebarProps) {
  return (
    <div className="bg-slate-800 rounded-xl p-5 w-64 flex flex-col gap-5 text-white shadow-lg">
      <div className="bg-slate-700 rounded-lg p-3 text-center text-sm font-medium min-h-12 flex items-center justify-center">
        {message}
      </div>

      <div>
        <h3 className="text-base font-bold text-sky-400 mb-2 border-b border-slate-600 pb-1">
          US Navy Stats
        </h3>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-green-400">Hits:</span>
          <span className="font-bold">{playerStats.hits}</span>
        </div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-400">Misses:</span>
          <span className="font-bold">{playerStats.misses}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-yellow-400">Ships Left:</span>
          <span className="font-bold">{playerStats.shipsRemaining}</span>
        </div>
      </div>

      <div>
        <h3 className="text-base font-bold text-red-400 mb-2 border-b border-slate-600 pb-1">
          Japanese Empire Stats
        </h3>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-green-400">Hits:</span>
          <span className="font-bold">{aiStats.hits}</span>
        </div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-400">Misses:</span>
          <span className="font-bold">{aiStats.misses}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-yellow-400">Ships Left:</span>
          <span className="font-bold">{aiStats.shipsRemaining}</span>
        </div>
      </div>

      <div>
        <h3 className="text-base font-bold text-sky-400 mb-2 border-b border-slate-600 pb-1">
          US Navy Fleet
        </h3>
        {playerShips.map((ship) => (
          <div key={ship.name} className="flex justify-between items-center text-sm mb-1">
            <span className={ship.sunk ? 'line-through text-red-400' : ''}>
              {ship.name}
            </span>
            <div className="flex gap-0.5">
              {Array.from({ length: ship.length }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-sm ${
                    i < ship.hits
                      ? 'bg-red-500'
                      : ship.sunk
                        ? 'bg-red-900'
                        : 'bg-gray-500'
                  }`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-base font-bold text-red-400 mb-2 border-b border-slate-600 pb-1">
          Japanese Empire Fleet
        </h3>
        {aiShips.map((ship) => (
          <div key={ship.name} className="flex justify-between items-center text-sm mb-1">
            <span className={ship.sunk ? 'line-through text-red-400' : ''}>
              {ship.name}
            </span>
            <div className="flex gap-0.5">
              {Array.from({ length: ship.length }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-sm ${
                    ship.sunk
                      ? 'bg-red-900'
                      : i < ship.hits
                        ? 'bg-red-500'
                        : 'bg-slate-600'
                  }`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import type { Orientation, ShipConfig } from '../types/game';

interface ShipPlacementProps {
  currentShip: ShipConfig;
  orientation: Orientation;
  onToggleOrientation: () => void;
  onRandomize: () => void;
  shipsPlaced: number;
  totalShips: number;
}

export default function ShipPlacement({
  currentShip,
  orientation,
  onToggleOrientation,
  onRandomize,
  shipsPlaced,
  totalShips,
}: ShipPlacementProps) {
  return (
    <div className="bg-slate-800 rounded-xl p-5 text-white text-center shadow-lg">
      <h2 className="text-lg font-bold mb-3">Place Your Ships</h2>
      <p className="text-sm text-sky-300 mb-2">
        Placing: <span className="font-bold text-white">{currentShip.name}</span>{' '}
        (length: {currentShip.length})
      </p>
      <p className="text-xs text-gray-400 mb-3">
        {shipsPlaced} / {totalShips} ships placed
      </p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={onToggleOrientation}
          className="bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {orientation === 'horizontal' ? '↔ Horizontal' : '↕ Vertical'}
        </button>
        <button
          onClick={onRandomize}
          className="bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          🎲 Random
        </button>
      </div>
    </div>
  );
}

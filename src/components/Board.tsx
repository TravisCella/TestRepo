import type { Board as BoardType, CellState, Orientation, ShipConfig } from '../types/game';
import { getShipPreviewCells } from '../utils/gameLogic';
import { useState } from 'react';

interface BoardProps {
  board: BoardType;
  isPlayerBoard: boolean;
  isPlacementPhase: boolean;
  currentShip?: ShipConfig;
  orientation?: Orientation;
  onCellClick: (row: number, col: number) => void;
  disabled: boolean;
  label: string;
}

const COL_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

export default function Board({
  board,
  isPlayerBoard,
  isPlacementPhase,
  currentShip,
  orientation = 'horizontal',
  onCellClick,
  disabled,
  label,
}: BoardProps) {
  const [hoverCell, setHoverCell] = useState<[number, number] | null>(null);

  const previewCells =
    isPlacementPhase && currentShip && hoverCell
      ? getShipPreviewCells(board, hoverCell[0], hoverCell[1], currentShip, orientation)
      : null;

  function getCellColor(state: CellState, row: number, col: number): string {
    if (previewCells) {
      const inPreview = previewCells.cells.some(([r, c]) => r === row && c === col);
      if (inPreview) {
        return previewCells.valid
          ? 'bg-green-400 border-green-500'
          : 'bg-red-400 border-red-500';
      }
    }

    switch (state) {
      case 'empty':
        return 'bg-sky-800 border-sky-900 hover:bg-sky-700';
      case 'ship':
        return isPlayerBoard
          ? 'bg-gray-500 border-gray-600'
          : 'bg-sky-800 border-sky-900 hover:bg-sky-700';
      case 'hit':
        return 'bg-red-600 border-red-700';
      case 'miss':
        return 'bg-sky-950 border-sky-900';
      case 'sunk':
        return 'bg-red-900 border-red-950';
      default:
        return 'bg-sky-800 border-sky-900';
    }
  }

  function getCellContent(state: CellState, row: number, col: number): string {
    if (previewCells) {
      const inPreview = previewCells.cells.some(([r, c]) => r === row && c === col);
      if (inPreview) return '■';
    }

    switch (state) {
      case 'hit':
        return '💥';
      case 'miss':
        return '•';
      case 'sunk':
        return '💀';
      case 'ship':
        return isPlayerBoard ? '■' : '';
      default:
        return '';
    }
  }

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-lg font-bold text-white mb-2">{label}</h2>
      <div className="inline-block">
        <div className="flex">
          <div className="w-8 h-8" />
          {COL_LABELS.map((letter) => (
            <div
              key={letter}
              className="w-8 h-8 flex items-center justify-center text-xs font-bold text-sky-300"
            >
              {letter}
            </div>
          ))}
        </div>
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="flex">
            <div className="w-8 h-8 flex items-center justify-center text-xs font-bold text-sky-300">
              {rowIndex + 1}
            </div>
            {row.map((cell, colIndex) => {
              const isClickable =
                !disabled &&
                (isPlacementPhase ||
                  (!isPlayerBoard && (cell === 'empty' || cell === 'ship')));

              return (
                <button
                  key={colIndex}
                  className={`w-8 h-8 border text-xs flex items-center justify-center transition-colors duration-150 ${getCellColor(
                    cell,
                    rowIndex,
                    colIndex
                  )} ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
                  onClick={() => isClickable && onCellClick(rowIndex, colIndex)}
                  onMouseEnter={() =>
                    isPlacementPhase && setHoverCell([rowIndex, colIndex])
                  }
                  onMouseLeave={() => isPlacementPhase && setHoverCell(null)}
                  disabled={!isClickable}
                >
                  {getCellContent(cell, rowIndex, colIndex)}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export type CellState = 'empty' | 'ship' | 'hit' | 'miss' | 'sunk';

export type Orientation = 'horizontal' | 'vertical';

export interface Ship {
  name: string;
  length: number;
  positions: [number, number][];
  hits: number;
  sunk: boolean;
}

export interface ShipConfig {
  name: string;
  length: number;
}

export const SHIP_CONFIGS: ShipConfig[] = [
  { name: 'Carrier', length: 5 },
  { name: 'Battleship', length: 4 },
  { name: 'Cruiser', length: 3 },
  { name: 'Submarine', length: 3 },
  { name: 'Destroyer', length: 2 },
];

export const BOARD_SIZE = 10;

export type Board = CellState[][];

export interface GameStats {
  hits: number;
  misses: number;
  shipsRemaining: number;
}

export type GamePhase = 'placement' | 'battle' | 'gameOver';

export type Winner = 'player' | 'ai' | null;

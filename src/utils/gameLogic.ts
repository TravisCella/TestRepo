import type { Board, CellState, Orientation, Ship, ShipConfig } from '../types/game';
import { BOARD_SIZE, SHIP_CONFIGS } from '../types/game';

export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => 'empty' as CellState)
  );
}

export function canPlaceShip(
  board: Board,
  row: number,
  col: number,
  length: number,
  orientation: Orientation
): boolean {
  for (let i = 0; i < length; i++) {
    const r = orientation === 'vertical' ? row + i : row;
    const c = orientation === 'horizontal' ? col + i : col;
    if (r >= BOARD_SIZE || c >= BOARD_SIZE) return false;
    if (board[r][c] !== 'empty') return false;
  }
  return true;
}

export function placeShip(
  board: Board,
  row: number,
  col: number,
  length: number,
  orientation: Orientation
): { board: Board; positions: [number, number][] } {
  const newBoard = board.map(r => [...r]);
  const positions: [number, number][] = [];

  for (let i = 0; i < length; i++) {
    const r = orientation === 'vertical' ? row + i : row;
    const c = orientation === 'horizontal' ? col + i : col;
    newBoard[r][c] = 'ship';
    positions.push([r, c]);
  }

  return { board: newBoard, positions };
}

export function placeShipsRandomly(): { board: Board; ships: Ship[] } {
  let board = createEmptyBoard();
  const ships: Ship[] = [];

  for (const config of SHIP_CONFIGS) {
    let placed = false;
    while (!placed) {
      const orientation: Orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
      const row = Math.floor(Math.random() * BOARD_SIZE);
      const col = Math.floor(Math.random() * BOARD_SIZE);

      if (canPlaceShip(board, row, col, config.length, orientation)) {
        const result = placeShip(board, row, col, config.length, orientation);
        board = result.board;
        ships.push({
          name: config.name,
          length: config.length,
          positions: result.positions,
          hits: 0,
          sunk: false,
        });
        placed = true;
      }
    }
  }

  return { board, ships };
}

export function processAttack(
  board: Board,
  ships: Ship[],
  row: number,
  col: number
): { board: Board; ships: Ship[]; result: 'hit' | 'miss' | 'sunk' } {
  const newBoard = board.map(r => [...r]);
  const newShips = ships.map(s => ({
    ...s,
    positions: [...s.positions] as [number, number][],
  }));

  if (newBoard[row][col] === 'ship') {
    newBoard[row][col] = 'hit';

    for (const ship of newShips) {
      const posIndex = ship.positions.findIndex(([r, c]) => r === row && c === col);
      if (posIndex !== -1) {
        ship.hits += 1;
        if (ship.hits === ship.length) {
          ship.sunk = true;
          for (const [r, c] of ship.positions) {
            newBoard[r][c] = 'sunk';
          }
          return { board: newBoard, ships: newShips, result: 'sunk' };
        }
        return { board: newBoard, ships: newShips, result: 'hit' };
      }
    }
    return { board: newBoard, ships: newShips, result: 'hit' };
  }

  newBoard[row][col] = 'miss';
  return { board: newBoard, ships: newShips, result: 'miss' };
}

export function getAIMove(board: Board): [number, number] {
  const available: [number, number][] = [];
  const adjacentToHits: [number, number][] = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === 'empty' || board[r][c] === 'ship') {
        available.push([r, c]);
      }
    }
  }

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === 'hit') {
        const neighbors: [number, number][] = [
          [r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1],
        ];
        for (const [nr, nc] of neighbors) {
          if (
            nr >= 0 && nr < BOARD_SIZE &&
            nc >= 0 && nc < BOARD_SIZE &&
            (board[nr][nc] === 'empty' || board[nr][nc] === 'ship')
          ) {
            adjacentToHits.push([nr, nc]);
          }
        }
      }
    }
  }

  if (adjacentToHits.length > 0) {
    return adjacentToHits[Math.floor(Math.random() * adjacentToHits.length)];
  }

  return available[Math.floor(Math.random() * available.length)];
}

export function isGameOver(ships: Ship[]): boolean {
  return ships.every(s => s.sunk);
}

export function getShipPreviewCells(
  board: Board,
  row: number,
  col: number,
  config: ShipConfig,
  orientation: Orientation
): { cells: [number, number][]; valid: boolean } {
  const cells: [number, number][] = [];
  let valid = true;

  for (let i = 0; i < config.length; i++) {
    const r = orientation === 'vertical' ? row + i : row;
    const c = orientation === 'horizontal' ? col + i : col;
    if (r >= BOARD_SIZE || c >= BOARD_SIZE) {
      valid = false;
      break;
    }
    if (board[r][c] !== 'empty') {
      valid = false;
    }
    cells.push([r, c]);
  }

  return { cells, valid };
}

import { useState, useCallback } from 'react';
import './App.css';
import Board from './components/Board';
import Sidebar from './components/Sidebar';
import ShipPlacement from './components/ShipPlacement';
import type {
  Board as BoardType,
  Ship,
  GamePhase,
  GameStats,
  Winner,
  Orientation,
} from './types/game';
import { SHIP_CONFIGS } from './types/game';
import {
  createEmptyBoard,
  canPlaceShip,
  placeShip,
  placeShipsRandomly,
  processAttack,
  getAIMove,
  isGameOver,
} from './utils/gameLogic';

function App() {
  const [gamePhase, setGamePhase] = useState<GamePhase>('placement');
  const [winner, setWinner] = useState<Winner>(null);

  const [playerBoard, setPlayerBoard] = useState<BoardType>(createEmptyBoard);
  const [playerShips, setPlayerShips] = useState<Ship[]>([]);
  const [currentShipIndex, setCurrentShipIndex] = useState(0);
  const [orientation, setOrientation] = useState<Orientation>('horizontal');

  const [aiBoard, setAiBoard] = useState<BoardType>(createEmptyBoard);
  const [aiShips, setAiShips] = useState<Ship[]>([]);
  const [aiDisplayBoard, setAiDisplayBoard] = useState<BoardType>(createEmptyBoard);

  const [playerStats, setPlayerStats] = useState<GameStats>({
    hits: 0,
    misses: 0,
    shipsRemaining: 5,
  });
  const [aiStats, setAiStats] = useState<GameStats>({
    hits: 0,
    misses: 0,
    shipsRemaining: 5,
  });

  const [message, setMessage] = useState('Place your ships on the board!');
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);

  const handlePlaceShip = useCallback(
    (row: number, col: number) => {
      if (currentShipIndex >= SHIP_CONFIGS.length) return;

      const config = SHIP_CONFIGS[currentShipIndex];
      if (!canPlaceShip(playerBoard, row, col, config.length, orientation)) {
        setMessage('Cannot place ship there! Try another spot.');
        return;
      }

      const result = placeShip(playerBoard, row, col, config.length, orientation);
      const newShip: Ship = {
        name: config.name,
        length: config.length,
        positions: result.positions,
        hits: 0,
        sunk: false,
      };

      setPlayerBoard(result.board);
      const updatedShips = [...playerShips, newShip];
      setPlayerShips(updatedShips);

      const nextIndex = currentShipIndex + 1;
      setCurrentShipIndex(nextIndex);

      if (nextIndex >= SHIP_CONFIGS.length) {
        const aiResult = placeShipsRandomly();
        setAiBoard(aiResult.board);
        setAiShips(aiResult.ships);
        setGamePhase('battle');
        setMessage('All ships placed! Click on the Japanese Empire board to attack.');
      } else {
        setMessage(`Place your ${SHIP_CONFIGS[nextIndex].name} (length: ${SHIP_CONFIGS[nextIndex].length})`);
      }
    },
    [currentShipIndex, orientation, playerBoard, playerShips]
  );

  const handleRandomPlacement = useCallback(() => {
    const result = placeShipsRandomly();
    setPlayerBoard(result.board);
    setPlayerShips(result.ships);
    setCurrentShipIndex(SHIP_CONFIGS.length);

    const aiResult = placeShipsRandomly();
    setAiBoard(aiResult.board);
    setAiShips(aiResult.ships);
    setGamePhase('battle');
    setMessage('Ships placed randomly! Click on the Japanese Empire board to attack.');
  }, []);

  const handlePlayerAttack = useCallback(
    (row: number, col: number) => {
      if (!isPlayerTurn || gamePhase !== 'battle') return;

      const displayCell = aiDisplayBoard[row][col];
      if (displayCell === 'hit' || displayCell === 'miss' || displayCell === 'sunk') {
        setMessage('Already attacked there! Choose another cell.');
        return;
      }

      const result = processAttack(aiBoard, aiShips, row, col);
      setAiBoard(result.board);
      setAiShips(result.ships);

      const newDisplayBoard = aiDisplayBoard.map(r => [...r]);
      newDisplayBoard[row][col] = result.board[row][col];
      if (result.result === 'sunk') {
        const sunkShip = result.ships.find(s => s.sunk && s.positions.some(([r, c]) => r === row && c === col));
        if (sunkShip) {
          for (const [r, c] of sunkShip.positions) {
            newDisplayBoard[r][c] = 'sunk';
          }
        }
      }
      setAiDisplayBoard(newDisplayBoard);

      const newPlayerStats = { ...playerStats };
      if (result.result === 'hit' || result.result === 'sunk') {
        newPlayerStats.hits += 1;
        if (result.result === 'sunk') {
          newPlayerStats.shipsRemaining = result.ships.filter(s => !s.sunk).length;
          const sunkShip = result.ships.find(s => s.sunk && s.positions.some(([r, c]) => r === row && c === col));
          setMessage(`You sunk the Japanese Empire's ${sunkShip?.name}!`);
        } else {
          setMessage('Direct hit! Nice shot, Admiral!');
        }
      } else {
        newPlayerStats.misses += 1;
        setMessage('Miss! The Japanese Empire is planning...');
      }
      setPlayerStats(newPlayerStats);

      if (isGameOver(result.ships)) {
        setGamePhase('gameOver');
        setWinner('player');
        setMessage('Victory! The US Navy has destroyed the Japanese Empire fleet!');
        return;
      }

      setIsPlayerTurn(false);

      setTimeout(() => {
        const [aiRow, aiCol] = getAIMove(playerBoard);
        const aiResult = processAttack(playerBoard, playerShips, aiRow, aiCol);
        setPlayerBoard(aiResult.board);
        setPlayerShips(aiResult.ships);

        const newAiStats = { ...aiStats };
        if (aiResult.result === 'hit' || aiResult.result === 'sunk') {
          newAiStats.hits += 1;
          if (aiResult.result === 'sunk') {
            newAiStats.shipsRemaining = aiResult.ships.filter(s => !s.sunk).length;
            const sunkShip = aiResult.ships.find(s =>
              s.sunk && s.positions.some(([r, c]) => r === aiRow && c === aiCol)
            );
            setMessage(`The Japanese Empire sunk your ${sunkShip?.name}! Your turn, Admiral.`);
          } else {
            setMessage('The Japanese Empire scored a hit! Your turn, Admiral.');
          }
        } else {
          newAiStats.misses += 1;
          setMessage('The Japanese Empire missed! Your turn, Admiral.');
        }
        setAiStats(newAiStats);

        if (isGameOver(aiResult.ships)) {
          setGamePhase('gameOver');
          setWinner('ai');
          setMessage('Defeat! The Japanese Empire has destroyed the US Navy fleet.');
          return;
        }

        setIsPlayerTurn(true);
      }, 800);
    },
    [isPlayerTurn, gamePhase, aiBoard, aiShips, aiDisplayBoard, playerBoard, playerShips, playerStats, aiStats]
  );

  const handleRestart = () => {
    setGamePhase('placement');
    setWinner(null);
    setPlayerBoard(createEmptyBoard());
    setPlayerShips([]);
    setCurrentShipIndex(0);
    setOrientation('horizontal');
    setAiBoard(createEmptyBoard());
    setAiShips([]);
    setAiDisplayBoard(createEmptyBoard());
    setPlayerStats({ hits: 0, misses: 0, shipsRemaining: 5 });
    setAiStats({ hits: 0, misses: 0, shipsRemaining: 5 });
    setMessage('Place your ships on the board!');
    setIsPlayerTurn(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col app-backdrop">
      <header className="bg-slate-800 py-4 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white tracking-wide">
            Battleship: Pacific Theater
          </h1>
          {gamePhase !== 'placement' && (
            <button
              onClick={handleRestart}
              className="bg-red-600 hover:bg-red-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              New Game
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
        {gamePhase === 'placement' && currentShipIndex < SHIP_CONFIGS.length && (
          <ShipPlacement
            currentShip={SHIP_CONFIGS[currentShipIndex]}
            orientation={orientation}
            onToggleOrientation={() =>
              setOrientation(o => (o === 'horizontal' ? 'vertical' : 'horizontal'))
            }
            onRandomize={handleRandomPlacement}
            shipsPlaced={currentShipIndex}
            totalShips={SHIP_CONFIGS.length}
          />
        )}

        <div className="flex flex-wrap items-start justify-center gap-8">
          <Board
            board={playerBoard}
            isPlayerBoard={true}
            isPlacementPhase={gamePhase === 'placement'}
            currentShip={
              gamePhase === 'placement' && currentShipIndex < SHIP_CONFIGS.length
                ? SHIP_CONFIGS[currentShipIndex]
                : undefined
            }
            orientation={orientation}
            onCellClick={gamePhase === 'placement' ? handlePlaceShip : () => {}}
            disabled={gamePhase === 'battle' || gamePhase === 'gameOver'}
            label="US Navy Fleet"
          />

          <Sidebar
            playerStats={playerStats}
            aiStats={aiStats}
            playerShips={playerShips}
            aiShips={aiShips}
            message={message}
          />

          {gamePhase !== 'placement' && (
            <Board
              board={aiDisplayBoard}
              isPlayerBoard={false}
              isPlacementPhase={false}
              onCellClick={handlePlayerAttack}
              disabled={!isPlayerTurn || gamePhase === 'gameOver'}
              label="Japanese Empire Fleet"
            />
          )}
        </div>

        {gamePhase === 'gameOver' && (
          <div className="mt-4 text-center">
            <h2
              className={`text-3xl font-bold mb-4 ${
                winner === 'player' ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {winner === 'player' ? 'US Navy Victory!' : 'Japanese Empire Prevails!'}
            </h2>
            <button
              onClick={handleRestart}
              className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-8 py-3 rounded-xl text-lg transition-colors"
            >
              Play Again
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App

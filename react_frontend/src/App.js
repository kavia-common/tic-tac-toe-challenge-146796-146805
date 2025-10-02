import React, { useMemo, useState } from 'react';
import './App.css';

/**
 * Ocean Professional Tic Tac Toe
 * - Blue & amber accents
 * - Minimalist, responsive UI
 * - Human (X) vs Computer AI (O)
 */

const COLORS = {
  primary: '#2563EB',
  secondary: '#F59E0B',
  success: '#F59E0B',
  error: '#EF4444',
  background: '#f9fafb',
  surface: '#ffffff',
  text: '#111827',
};

const initialBoard = () => Array(9).fill(null);

// PUBLIC_INTERFACE
export default function App() {
  /** Game state */
  const [board, setBoard] = useState(initialBoard);
  const [xIsNext, setXIsNext] = useState(true); // X = human
  const [aiEnabled, setAiEnabled] = useState(true);
  const [scores, setScores] = useState({ X: 0, O: 0, Draws: 0 });
  const [statusMessage, setStatusMessage] = useState('Your move');

  /** Derived state */
  const winner = useMemo(() => calculateWinner(board), [board]);
  const isBoardFull = useMemo(() => board.every(Boolean), [board]);
  const gameOver = Boolean(winner) || isBoardFull;

  /** Effects-like: trigger AI move after human if enabled */
  React.useEffect(() => {
    if (gameOver || !aiEnabled) return;
    const isAiTurn = !xIsNext; // O = AI
    if (isAiTurn) {
      const moveTimeout = setTimeout(() => {
        const move = chooseBestMove(board, 'O', 'X');
        if (move != null) handleMove(move, 'O');
      }, 350); // slight delay for UX
      return () => clearTimeout(moveTimeout);
    }
  }, [board, xIsNext, aiEnabled, gameOver]);

  React.useEffect(() => {
    if (winner) {
      setStatusMessage(winner === 'Draw' ? "It's a draw!" : `${winner} wins!`);
      if (winner === 'X') {
        setScores(s => ({ ...s, X: s.X + 1 }));
      } else if (winner === 'O') {
        setScores(s => ({ ...s, O: s.O + 1 }));
      }
    } else if (isBoardFull) {
      setStatusMessage("It's a draw!");
      setScores(s => ({ ...s, Draws: s.Draws + 1 }));
    } else {
      setStatusMessage(xIsNext ? 'Your move' : aiEnabled ? 'Computer thinking…' : 'O to move');
    }
  }, [winner, isBoardFull, xIsNext, aiEnabled]);

  /** Handlers */
  function handleSquareClick(index) {
    if (gameOver || !xIsNext || board[index]) return;
    handleMove(index, 'X');
  }

  function handleMove(index, player) {
    setBoard(prev => {
      const next = prev.slice();
      next[index] = player;
      return next;
    });
    setXIsNext(player !== 'X');
  }

  // PUBLIC_INTERFACE
  function resetBoard() {
    setBoard(initialBoard());
    setXIsNext(true);
    setStatusMessage('Your move');
  }

  // PUBLIC_INTERFACE
  function newMatch() {
    resetBoard();
    setScores({ X: 0, O: 0, Draws: 0 });
  }

  return (
    <div className="ocean-app" style={{ background: COLORS.background, color: COLORS.text }}>
      <header className="ocean-header">
        <div className="brand">
          <div className="brand-icon" aria-hidden="true">◈</div>
          <div>
            <h1 className="title">Tic Tac Toe</h1>
            <p className="subtitle">Ocean Professional</p>
          </div>
        </div>

        <div className="controls">
          <button
            className="btn"
            onClick={resetBoard}
            title="Reset current game"
            aria-label="Reset current game"
          >
            Reset Game
          </button>
          <button
            className="btn btn-amber"
            onClick={newMatch}
            title="Start a new match (reset scores)"
            aria-label="Start a new match"
          >
            New Match
          </button>
          <label className="toggle">
            <input
              type="checkbox"
              checked={aiEnabled}
              onChange={(e) => setAiEnabled(e.target.checked)}
            />
            <span>AI Opponent</span>
          </label>
        </div>
      </header>

      <main className="ocean-main">
        <section className="scoreboard">
          <div className="score-card">
            <span className="label">You (X)</span>
            <span className="value">{scores.X}</span>
          </div>
          <div className="score-card">
            <span className="label">Computer (O)</span>
            <span className="value">{scores.O}</span>
          </div>
          <div className="score-card">
            <span className="label">Draws</span>
            <span className="value">{scores.Draws}</span>
          </div>
        </section>

        <section className="status" role="status" aria-live="polite">
          <span
            className={`badge ${winner && winner !== 'Draw' ? 'badge-win' : isBoardFull ? 'badge-draw' : 'badge-info'}`}
          >
            {statusMessage}
          </span>
        </section>

        <section className="board-wrap" aria-label="Tic Tac Toe board">
          <Board
            board={board}
            onSquareClick={handleSquareClick}
            disabled={gameOver || (!xIsNext && aiEnabled)}
          />
        </section>
      </main>

      <footer className="ocean-footer">
        <p>
          Built with ❤️ in a minimalist style. Theme: Ocean Professional • Primary{' '}
          <span className="color-dot" style={{ background: COLORS.primary }} /> • Secondary{' '}
          <span className="color-dot" style={{ background: COLORS.secondary }} />
        </p>
        <p className="credits">© {new Date().getFullYear()} Tic Tac Toe vs AI</p>
      </footer>
    </div>
  );
}

/** Board component */
function Board({ board, onSquareClick, disabled }) {
  return (
    <div className={`board ${disabled ? 'board-disabled' : ''}`}>
      {board.map((value, i) => (
        <Square
          key={i}
          value={value}
          onClick={() => onSquareClick(i)}
          disabled={disabled || Boolean(value)}
        />
      ))}
    </div>
  );
}

/** Individual square */
function Square({ value, onClick, disabled }) {
  const isX = value === 'X';
  const isO = value === 'O';
  return (
    <button
      className={`square ${isX ? 'square-x' : ''} ${isO ? 'square-o' : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={`Square ${value ? value : 'empty'}`}
    >
      {value}
    </button>
  );
}

/** Game logic utilities */
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
    [0, 4, 8], [2, 4, 6],            // diagonals
  ];
  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  if (squares.every(Boolean)) return 'Draw';
  return null;
}

/**
 * Choose the best move for 'O' using a strong heuristic:
 * - Win if possible
 * - Block opponent win
 * - Take center
 * - Take a corner
 * - Take a side
 */
function chooseBestMove(board, ai, human) {
  // 1) Win if possible
  const winMove = findWinningMove(board, ai);
  if (winMove != null) return winMove;

  // 2) Block opponent
  const blockMove = findWinningMove(board, human);
  if (blockMove != null) return blockMove;

  // 3) Center
  if (!board[4]) return 4;

  // 4) Corner
  const corners = [0, 2, 6, 8].filter(i => !board[i]);
  if (corners.length) return randomPick(corners);

  // 5) Sides
  const sides = [1, 3, 5, 7].filter(i => !board[i]);
  if (sides.length) return randomPick(sides);

  return null;
}

function findWinningMove(board, player) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  for (const [a, b, c] of lines) {
    const vals = [board[a], board[b], board[c]];
    const playerCount = vals.filter(v => v === player).length;
    const emptyIndex = [a, b, c].find(idx => !board[idx]);
    if (playerCount === 2 && emptyIndex != null) return emptyIndex;
  }
  return null;
}

function randomPick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

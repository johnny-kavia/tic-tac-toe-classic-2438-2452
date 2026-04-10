import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";

const BOARD_SIZE = 9;
const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],

  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],

  [0, 4, 8],
  [2, 4, 6],
];

function createEmptyBoard() {
  return Array.from({ length: BOARD_SIZE }, () => null);
}

/**
 * Returns the winning line if there is a winner, otherwise null.
 * @param {Array<("X"|"O"|null)>} board
 * @returns {number[]|null}
 */
function getWinningLine(board) {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return line;
  }
  return null;
}

/**
 * Returns whether the board is full (no null squares).
 * @param {Array<("X"|"O"|null)>} board
 * @returns {boolean}
 */
function isBoardFull(board) {
  return board.every((sq) => sq !== null);
}

/**
 * A single square button in the board.
 */
function Square({ value, onClick, disabled, highlight, index }) {
  return (
    <button
      type="button"
      className={[
        "ttt-square",
        highlight ? "ttt-square--win" : "",
        value === "X" ? "ttt-square--x" : "",
        value === "O" ? "ttt-square--o" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onClick}
      disabled={disabled}
      aria-label={
        value
          ? `Square ${index + 1}, occupied by ${value}`
          : `Square ${index + 1}, empty`
      }
    >
      <span className="ttt-square__value" aria-hidden="true">
        {value ?? ""}
      </span>
    </button>
  );
}

// PUBLIC_INTERFACE
function App() {
  /** Current board positions (null | "X" | "O") */
  const [board, setBoard] = useState(() => createEmptyBoard());
  /** "X" starts by default */
  const [currentPlayer, setCurrentPlayer] = useState("X");
  /** Track whether game has concluded */
  const [isGameOver, setIsGameOver] = useState(false);
  /** Track last result for status messaging */
  const [result, setResult] = useState({ type: "in_progress", winner: null });

  const winningLine = useMemo(() => getWinningLine(board), [board]);
  const winner = useMemo(() => {
    if (!winningLine) return null;
    const [a] = winningLine;
    return board[a];
  }, [board, winningLine]);

  const statusText = useMemo(() => {
    if (result.type === "won") return `Player ${result.winner} wins!`;
    if (result.type === "draw") return "It's a draw.";
    return `Player ${currentPlayer}'s turn`;
  }, [currentPlayer, result]);

  // When board changes, derive game state (win/draw/in progress).
  useEffect(() => {
    const line = getWinningLine(board);
    if (line) {
      const [a] = line;
      const w = board[a];
      setIsGameOver(true);
      setResult({ type: "won", winner: w });
      return;
    }
    if (isBoardFull(board)) {
      setIsGameOver(true);
      setResult({ type: "draw", winner: null });
      return;
    }
    setIsGameOver(false);
    setResult({ type: "in_progress", winner: null });
  }, [board]);

  const canPlay = useCallback(
    (index) => !isGameOver && board[index] === null,
    [board, isGameOver]
  );

  const handlePlay = useCallback(
    (index) => {
      if (!canPlay(index)) return;

      setBoard((prev) => {
        const next = [...prev];
        next[index] = currentPlayer;
        return next;
      });
      setCurrentPlayer((p) => (p === "X" ? "O" : "X"));
    },
    [canPlay, currentPlayer]
  );

  // PUBLIC_INTERFACE
  const resetBoardKeepTurn = useCallback(() => {
    /** Resets board but keeps who starts (currentPlayer is set to "X" by default on new game, but reset keeps the same starter). */
    setBoard(createEmptyBoard());
    setIsGameOver(false);
    setResult({ type: "in_progress", winner: null });
  }, []);

  // PUBLIC_INTERFACE
  const newGame = useCallback(() => {
    /** Starts a brand new game with X to play first. */
    setBoard(createEmptyBoard());
    setCurrentPlayer("X");
    setIsGameOver(false);
    setResult({ type: "in_progress", winner: null });
  }, []);

  const winningSquares = useMemo(() => {
    if (!winningLine) return new Set();
    return new Set(winningLine);
  }, [winningLine]);

  return (
    <div className="App">
      <main className="ttt-shell">
        <header className="ttt-header">
          <div className="ttt-badge" aria-hidden="true">
            Tic Tac Toe
          </div>
          <h1 className="ttt-title">Tic Tac Toe</h1>
          <p className="ttt-subtitle">
            Local two-player game. Take turns, get three in a row.
          </p>
        </header>

        <section className="ttt-card" aria-label="Game">
          <div className="ttt-status" role="status" aria-live="polite">
            <div className="ttt-status__label">Status</div>
            <div
              className={[
                "ttt-status__value",
                result.type === "won" ? "ttt-status__value--won" : "",
                result.type === "draw" ? "ttt-status__value--draw" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {statusText}
            </div>
          </div>

          <div className="ttt-boardWrap">
            <div className="ttt-board" role="grid" aria-label="Tic Tac Toe board">
              {board.map((value, idx) => (
                <Square
                  key={idx}
                  value={value}
                  index={idx}
                  onClick={() => handlePlay(idx)}
                  disabled={!canPlay(idx)}
                  highlight={winningSquares.has(idx)}
                />
              ))}
            </div>
          </div>

          <div className="ttt-actions" aria-label="Game actions">
            <button
              type="button"
              className="ttt-btn ttt-btn--secondary"
              onClick={resetBoardKeepTurn}
            >
              Reset board
            </button>
            <button type="button" className="ttt-btn" onClick={newGame}>
              New game (X starts)
            </button>
          </div>

          <div className="ttt-hint" aria-hidden="true">
            Tip: You can’t overwrite a played square.
          </div>
        </section>

        <footer className="ttt-footer">
          <span className="ttt-footer__dot" aria-hidden="true" />
          <span>Built for local play • Responsive layout</span>
        </footer>
      </main>
    </div>
  );
}

export default App;

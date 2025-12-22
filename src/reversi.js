const BOARD_SIZE = 8;
const DIRECTIONS = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1]
];

const EMPTY = null;
const BLACK = 'B';
const WHITE = 'W';

function createBoard() {
  const board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(EMPTY));
  const mid = BOARD_SIZE / 2;
  board[mid - 1][mid - 1] = WHITE;
  board[mid][mid] = WHITE;
  board[mid - 1][mid] = BLACK;
  board[mid][mid - 1] = BLACK;
  return board;
}

function isOnBoard(row, col) {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

function getOpponent(player) {
  return player === BLACK ? WHITE : BLACK;
}

function getFlipsForMove(board, player, row, col) {
  if (!isOnBoard(row, col) || board[row][col] !== EMPTY) {
    return [];
  }

  const opponent = getOpponent(player);
  const flips = [];

  for (const [dr, dc] of DIRECTIONS) {
    const candidates = [];
    let r = row + dr;
    let c = col + dc;

    while (isOnBoard(r, c) && board[r][c] === opponent) {
      candidates.push([r, c]);
      r += dr;
      c += dc;
    }

    if (candidates.length > 0 && isOnBoard(r, c) && board[r][c] === player) {
      flips.push(...candidates);
    }
  }

  return flips;
}

function getValidMoves(board, player) {
  const moves = [];
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      const flips = getFlipsForMove(board, player, row, col);
      if (flips.length > 0) {
        moves.push({ row, col, flips });
      }
    }
  }
  return moves;
}

function applyMove(board, player, row, col) {
  const flips = getFlipsForMove(board, player, row, col);
  if (flips.length === 0) {
    throw new Error(`Invalid move at (${row}, ${col}) for player ${player}`);
  }

  const newBoard = board.map((r) => r.slice());
  newBoard[row][col] = player;
  flips.forEach(([r, c]) => {
    newBoard[r][c] = player;
  });
  return newBoard;
}

class ReversiGame {
  constructor() {
    this.board = createBoard();
    this.currentPlayer = BLACK;
  }

  getValidMoves() {
    return getValidMoves(this.board, this.currentPlayer);
  }

  makeMove(row, col) {
    const flips = getFlipsForMove(this.board, this.currentPlayer, row, col);
    if (flips.length === 0) {
      throw new Error(`Invalid move at (${row}, ${col}) for player ${this.currentPlayer}`);
    }
    this.board = applyMove(this.board, this.currentPlayer, row, col);
    this.currentPlayer = getOpponent(this.currentPlayer);
    return flips.length;
  }

  skipTurnIfNoMoves() {
    if (this.getValidMoves().length === 0) {
      this.currentPlayer = getOpponent(this.currentPlayer);
    }
  }

  isGameOver() {
    const currentMoves = getValidMoves(this.board, this.currentPlayer);
    const opponentMoves = getValidMoves(this.board, getOpponent(this.currentPlayer));
    return currentMoves.length === 0 && opponentMoves.length === 0;
  }

  getScore() {
    let black = 0;
    let white = 0;
    this.board.forEach((row) => {
      row.forEach((cell) => {
        if (cell === BLACK) black += 1;
        if (cell === WHITE) white += 1;
      });
    });
    return { black, white };
  }
}

module.exports = {
  ReversiGame,
  createBoard,
  getValidMoves,
  getFlipsForMove,
  applyMove,
  constants: { BLACK, WHITE, EMPTY, BOARD_SIZE }
};

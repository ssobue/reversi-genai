const { ReversiGame, createBoard, getFlipsForMove, getValidMoves, applyMove, constants } = require('../src/reversi');

const { BLACK, WHITE, EMPTY } = constants;

describe('Reversi core functions', () => {
  test('createBoard sets up starting position', () => {
    const board = createBoard();
    const mid = board.length / 2;
    expect(board[mid - 1][mid - 1]).toBe(WHITE);
    expect(board[mid][mid]).toBe(WHITE);
    expect(board[mid - 1][mid]).toBe(BLACK);
    expect(board[mid][mid - 1]).toBe(BLACK);
  });

  test('getFlipsForMove detects flips in multiple directions', () => {
    const board = createBoard();
    const flips = getFlipsForMove(board, BLACK, 2, 3);
    expect(flips).toEqual([
      [3, 3]
    ]);
  });

  test('getValidMoves returns expected starting moves for black', () => {
    const board = createBoard();
    const moves = getValidMoves(board, BLACK).map(({ row, col }) => [row, col]);
    expect(moves).toEqual(
      expect.arrayContaining([
        [2, 3],
        [3, 2],
        [4, 5],
        [5, 4]
      ])
    );
    expect(moves).toHaveLength(4);
  });

  test('applyMove flips opponent pieces', () => {
    const board = createBoard();
    const updated = applyMove(board, BLACK, 2, 3);
    expect(updated[2][3]).toBe(BLACK);
    expect(updated[3][3]).toBe(BLACK);
    expect(board[3][3]).toBe(WHITE); // original board unchanged
  });
});

describe('ReversiGame gameplay', () => {
  test('game advances turn after valid move', () => {
    const game = new ReversiGame();
    game.makeMove(2, 3);
    expect(game.currentPlayer).toBe(WHITE);
  });

  test('game throws on invalid move', () => {
    const game = new ReversiGame();
    expect(() => game.makeMove(0, 0)).toThrow('Invalid move');
  });

  test('isGameOver detects end when no moves left', () => {
    const game = new ReversiGame();
    // Fill board with a finished configuration
    game.board = Array.from({ length: 8 }, (_, r) => Array.from({ length: 8 }, (_, c) => (r === 0 && c === 0 ? EMPTY : BLACK)));
    game.currentPlayer = BLACK;
    expect(game.isGameOver()).toBe(true);
  });
});

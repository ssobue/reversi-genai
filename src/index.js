const readline = require('readline');
const { ReversiGame, constants, chooseBestMove } = require('./reversi');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const game = new ReversiGame();
let cpuOpponentEnabled = true;
const cpuPlayer = constants.WHITE;

function printBoard(board) {
  console.log('  0 1 2 3 4 5 6 7');
  board.forEach((row, idx) => {
    const cells = row.map((cell) => (cell ? cell : '.')).join(' ');
    console.log(`${idx} ${cells}`);
  });
  const score = game.getScore();
  console.log(`Score - Black: ${score.black}, White: ${score.white}`);
}

function promptMove() {
  if (game.isGameOver()) {
    const { black, white } = game.getScore();
    console.log(`Game over! Final score => Black: ${black} White: ${white}`);
    rl.close();
    return;
  }

  game.skipTurnIfNoMoves();
  const validMoves = game.getValidMoves();
  if (validMoves.length === 0) {
    console.log('No valid moves for either player. Game over.');
    rl.close();
    return;
  }

  console.log(`Current player: ${game.currentPlayer}`);
  printBoard(game.board);
  console.log('Valid moves:', validMoves.map((m) => `(${m.row},${m.col})`).join(' '));

  if (cpuOpponentEnabled && game.currentPlayer === cpuPlayer) {
    const cpuMove = chooseBestMove(validMoves);
    if (cpuMove) {
      console.log(`CPU chooses move (${cpuMove.row},${cpuMove.col}) flipping ${cpuMove.flips.length} pieces.`);
      game.makeMove(cpuMove.row, cpuMove.col);
    }
    promptMove();
    return;
  }

  rl.question('Enter your move as row,col (or type exit): ', (answer) => {
    if (answer.trim().toLowerCase() === 'exit') {
      rl.close();
      return;
    }

    const [rowStr, colStr] = answer.split(',');
    const row = parseInt(rowStr, 10);
    const col = parseInt(colStr, 10);

    try {
      game.makeMove(row, col);
    } catch (err) {
      console.log(err.message);
    }

    promptMove();
  });
}

console.log('Welcome to Reversi!');
rl.question('Play against CPU opponent? (Y/n): ', (answer) => {
  cpuOpponentEnabled = !(answer && answer.trim().toLowerCase() === 'n');
  console.log(cpuOpponentEnabled ? 'CPU opponent enabled. You are Black.' : 'CPU opponent disabled. Two-player mode.');
  promptMove();
});

process.on('SIGINT', () => {
  console.log('\nGoodbye!');
  rl.close();
  process.exit(0);
});

module.exports = { printBoard, game, constants };

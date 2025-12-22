const boardEl = document.getElementById('board');
const currentPlayerEl = document.getElementById('current-player');
const scoreBlackEl = document.getElementById('score-black');
const scoreWhiteEl = document.getElementById('score-white');
const messageEl = document.getElementById('game-message');
const resetButton = document.getElementById('reset-button');

let latestState = null;

function renderBoard(board, validMoves) {
  boardEl.innerHTML = '';
  const validSet = new Set(validMoves.map((m) => `${m.row},${m.col}`));

  board.forEach((row, rIdx) => {
    row.forEach((cell, cIdx) => {
      const cellEl = document.createElement('button');
      cellEl.className = 'cell';
      cellEl.dataset.row = rIdx;
      cellEl.dataset.col = cIdx;
      cellEl.setAttribute('aria-label', `row ${rIdx}, col ${cIdx}`);

      if (cell === 'B' || cell === 'W') {
        const chip = document.createElement('div');
        chip.className = `chip ${cell === 'B' ? 'black' : 'white'}`;
        cellEl.appendChild(chip);
      }

      if (validSet.has(`${rIdx},${cIdx}`)) {
        cellEl.classList.add('valid');
      }

      cellEl.addEventListener('click', () => handleMove(rIdx, cIdx));
      boardEl.appendChild(cellEl);
    });
  });
}

async function fetchState() {
  const res = await fetch('/api/game');
  if (!res.ok) {
    throw new Error('ゲームの状態取得に失敗しました');
  }
  return res.json();
}

async function handleMove(row, col) {
  if (!latestState || latestState.isGameOver) {
    return;
  }

  const res = await fetch('/api/move', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ row, col })
  });

  const data = await res.json();
  if (!res.ok) {
    messageEl.textContent = data.error || '無効な手です';
    return;
  }

  updateUI(data);
}

async function handleReset() {
  const res = await fetch('/api/reset', { method: 'POST' });
  if (!res.ok) {
    messageEl.textContent = 'リセットに失敗しました';
    return;
  }
  const data = await res.json();
  updateUI(data, '新しいゲームを開始しました');
}

function updateUI(state, infoMessage) {
  latestState = state;
  renderBoard(state.board, state.validMoves);
  currentPlayerEl.textContent = state.isGameOver ? '—' : state.currentPlayer;
  scoreBlackEl.textContent = state.score.black;
  scoreWhiteEl.textContent = state.score.white;

  if (state.isGameOver) {
    messageEl.textContent = `ゲーム終了! 黒 ${state.score.black} / 白 ${state.score.white}`;
  } else if (infoMessage) {
    messageEl.textContent = infoMessage;
  } else {
    const moves = state.validMoves.map((m) => `(${m.row},${m.col})`).join(' ');
    messageEl.textContent = moves ? `打てる場所: ${moves}` : 'パスしました';
  }
}

async function init() {
  resetButton.addEventListener('click', handleReset);
  const state = await fetchState();
  updateUI(state, 'ゲーム開始! 黒からプレイ');
}

init().catch((err) => {
  console.error(err);
  messageEl.textContent = '初期化中にエラーが発生しました。';
});

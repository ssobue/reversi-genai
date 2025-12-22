const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { ReversiGame, chooseBestMove, constants } = require('./reversi');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

let game = new ReversiGame();
let cpuOpponentEnabled = true;
const cpuPlayer = constants.WHITE;

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const map = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8'
  };
  return map[ext] || 'text/plain; charset=utf-8';
}

async function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
      if (body.length > 1e6) {
        req.connection.destroy();
        reject(new Error('Request body too large'));
      }
    });
    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        const parsed = JSON.parse(body);
        resolve(parsed);
      } catch (err) {
        reject(new Error('Invalid JSON payload'));
      }
    });
    req.on('error', reject);
  });
}

function advanceGameState() {
  let changed = false;

  do {
    changed = false;

    if (game.isGameOver()) {
      break;
    }

    const validMoves = game.getValidMoves();

    if (validMoves.length === 0) {
      const previousPlayer = game.currentPlayer;
      game.skipTurnIfNoMoves();
      changed = game.currentPlayer !== previousPlayer;
      continue;
    }

    if (cpuOpponentEnabled && game.currentPlayer === cpuPlayer) {
      const cpuMove = chooseBestMove(validMoves);
      if (!cpuMove) break;
      game.makeMove(cpuMove.row, cpuMove.col);
      changed = true;
    }
  } while (changed);
}

function refreshState() {
  advanceGameState();
  return {
    board: game.board,
    currentPlayer: game.currentPlayer,
    validMoves: game.getValidMoves(),
    score: game.getScore(),
    isGameOver: game.isGameOver(),
    cpuOpponentEnabled
  };
}

function sendJson(res, statusCode, data) {
  const payload = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload)
  });
  res.end(payload);
}

function serveStatic(res, pathname) {
  const safePath = path.normalize(path.join(PUBLIC_DIR, pathname));
  if (!safePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  const filePath = fs.existsSync(safePath) && fs.statSync(safePath).isDirectory()
    ? path.join(safePath, 'index.html')
    : safePath;

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': getContentType(filePath) });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  if (pathname === '/api/game' && req.method === 'GET') {
    const state = refreshState();
    sendJson(res, 200, state);
    return;
  }

  if (pathname === '/api/move' && req.method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const { row, col } = body;

      if (typeof row !== 'number' || typeof col !== 'number') {
        sendJson(res, 400, { error: 'row and col must be numbers' });
        return;
      }
      if (game.isGameOver()) {
        sendJson(res, 400, { error: 'Game is already over' });
        return;
      }

      try {
        game.makeMove(row, col);
      } catch (err) {
        sendJson(res, 400, { error: err.message });
        return;
      }

      const state = refreshState();
      sendJson(res, 200, state);
    } catch (err) {
      sendJson(res, 400, { error: err.message });
    }
    return;
  }

  if (pathname === '/api/reset' && req.method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      if (Object.prototype.hasOwnProperty.call(body, 'cpuOpponentEnabled')) {
        cpuOpponentEnabled = Boolean(body.cpuOpponentEnabled);
      }
    } catch (err) {
      sendJson(res, 400, { error: err.message });
      return;
    }

    game = new ReversiGame();
    const state = refreshState();
    sendJson(res, 200, state);
    return;
  }

  if (pathname === '/api/settings' && req.method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      if (typeof body.cpuOpponentEnabled !== 'boolean') {
        sendJson(res, 400, { error: 'cpuOpponentEnabled must be a boolean' });
        return;
      }

      cpuOpponentEnabled = body.cpuOpponentEnabled;
      const state = refreshState();
      sendJson(res, 200, state);
    } catch (err) {
      sendJson(res, 400, { error: err.message });
    }
    return;
  }

  if (pathname.startsWith('/api/')) {
    res.writeHead(404);
    res.end('Not Found');
    return;
  }

  const filePath = pathname === '/' ? '/index.html' : pathname;
  serveStatic(res, filePath);
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Reversi web server running at http://localhost:${PORT}`);
});

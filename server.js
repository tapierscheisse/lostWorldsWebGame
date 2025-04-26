// Stelle sicher, dass dies am Anfang steht:
const https = require('https');
const fs = require('fs');

// SSL-Zertifikate (für lokale Entwicklung)
const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

// Server erstellen
const server = https.createServer(options, app); // Für HTTPS/WSS

// WebSocket-Server
const wss = new WebSocket.Server({ server });

const express = require('express');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// WebSocket-Server
const server = app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
const wss = new WebSocket.Server({ server });

// Spiel-Logik
class Game {
  constructor(id) {
    this.id = id;
    this.players = new Map();
    this.selectedMonsters = [];
    this.status = 'lobby';
    this.maxPlayers = 4;
    this.maxMonsters = 5;
  }

  addPlayer(playerId, character) {
    if (this.players.size >= this.maxPlayers) {
      throw new Error('Spiel ist voll');
    }
    this.players.set(playerId, { character, ready: false });
  }

  setReady(playerId) {
    const player = this.players.get(playerId);
    if (player) player.ready = true;
  }

  addMonsters(monsters) {
    if (monsters.length > this.maxMonsters) {
      throw new Error(`Maximal ${this.maxMonsters} Monster erlaubt`);
    }
    this.selectedMonsters = [...new Set([...this.selectedMonsters, ...monsters])];
  }

  canStart() {
    return this.players.size > 0 && 
           [...this.players.values()].every(p => p.ready);
  }
}

const activeGames = new Map();

// WebSocket Broadcast
function broadcastGameUpdate(gameId) {
  const game = activeGames.get(gameId);
  if (!game) return;

  wss.clients.forEach(client => {
    if (client.gameId === gameId) {
      client.send(JSON.stringify({
        type: 'game-update',
        players: Array.from(game.players.entries()).map(([id, data]) => ({
          id, character: data.character, ready: data.ready
        })),
        monsters: game.selectedMonsters
      }));
    }
  });
}

// API-Endpunkte
app.post('/api/start-game', (req, res) => {
  const { gameId, monsters } = req.body;
  
  try {
    const game = activeGames.get(gameId) || new Game(gameId);
    game.addMonsters(monsters);
    activeGames.set(gameId, game);
    broadcastGameUpdate(gameId);
    
    res.json({ 
      success: true,
      selectedMonsters: game.selectedMonsters
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.get('/api/available-monsters', (req, res) => {
  try {
    const monsters = generateMonsterList();
    res.json(monsters);
  } catch (error) {
    res.status(500).json({ error: 'Serverfehler' });
  }
});

// ... (weitere Endpunkte wie zuvor)

// Monster-Generierung
function generateMonsterList() {
  const monstersDir = path.join(__dirname, 'public', 'images', 'monster');
  try {
    const folders = fs.readdirSync(monstersDir)
      .filter(file => fs.statSync(path.join(monstersDir, file)).isDirectory());

    return folders.map(folder => ({
      id: folder.toLowerCase(),
      name: folder.charAt(0).toUpperCase() + folder.slice(1),
      bild: `/images/monster/${folder}/${fs.readdirSync(path.join(monstersDir, folder))[0]}`
    }));
  } catch (error) {
    console.error('Fehler:', error);
    return [];
  }
}

// Initialisierung
generateMonsterList();
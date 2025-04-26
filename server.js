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
    this.availableCharacters = [];
    this.status = 'lobby';
    this.maxPlayers = 4;
    this.maxMonsters = 5;
  }
}

const activeGames = new Map();

// Dynamische Inhalte generieren
function generateContent() {
  return {
    monsters: generateMonsterList(),
    characters: generateCharacterList()
  };
}

function generateMonsterList() {
  const monstersDir = path.join(__dirname, 'public', 'images', 'monster');
  try {
    const monsterFolders = fs.readdirSync(monstersDir)
      .filter(file => fs.statSync(path.join(monstersDir, file)).isDirectory());

    return monsterFolders.map(folder => {
      const images = fs.readdirSync(path.join(monstersDir, folder));
      const mainImage = images.find(img => img.includes('_01.')) || images[0];
      
      return {
        id: folder.toLowerCase(),
        name: folder.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        bild: `/images/monster/${folder}/${mainImage}`,
        hp: Math.floor(Math.random() * 50) + 50, // Zufällige HP zwischen 50-100
        attack: Math.floor(Math.random() * 10) + 5
      };
    });
  } catch (error) {
    console.error('Fehler beim Generieren der Monsterliste:', error);
    return [];
  }
}

function generateCharacterList() {
  const charsDir = path.join(__dirname, 'public', 'images', 'characters');
  try {
    const charFolders = fs.readdirSync(charsDir)
      .filter(file => fs.statSync(path.join(charsDir, file)).isDirectory());

    return charFolders.map(folder => {
      const images = fs.readdirSync(path.join(charsDir, folder));
      const mainImage = images.find(img => img.includes('_01.')) || images[0];
      
      return {
        id: folder.toLowerCase(),
        name: folder.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        bild: `/images/characters/${folder}/${mainImage}`,
        hp: 100,
        skills: ['Angriff', 'Verteidigung']
      };
    });
  } catch (error) {
    console.error('Fehler beim Generieren der Charakterliste:', error);
    return [];
  }
}

// WebSocket Broadcast
function broadcastGameUpdate(gameId) {
  const game = activeGames.get(gameId);
  if (!game) return;

  const update = {
    type: 'game-update',
    players: Array.from(game.players.entries()).map(([id, data]) => ({
      id, 
      character: data.character,
      ready: data.ready
    })),
    monsters: game.selectedMonsters,
    characters: game.availableCharacters
  };

  wss.clients.forEach(client => {
    if (client.gameId === gameId) {
      client.send(JSON.stringify(update));
    }
  });
}

// API-Endpunkte
app.get('/api/game-data', (req, res) => {
  res.json(generateContent());
});

app.get('/api/available-monsters', (req, res) => {
  res.json(generateMonsterList());
});

app.get('/api/available-characters', (req, res) => {
  res.json(generateCharacterList());
});

app.post('/api/start-game', (req, res) => {
  const { gameId, monsters } = req.body;
  
  try {
    let game = activeGames.get(gameId);
    if (!game) {
      game = new Game(gameId);
      game.availableCharacters = generateCharacterList();
      activeGames.set(gameId, game);
    }
    
    game.selectedMonsters = monsters.slice(0, game.maxMonsters);
    broadcastGameUpdate(gameId);
    
    res.json({ 
      success: true,
      gameId,
      monsters: game.selectedMonsters
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
});

app.post('/api/select-character', (req, res) => {
  const { gameId, playerId, character } = req.body;
  const game = activeGames.get(gameId);
  
  if (!game) {
    return res.status(404).json({ success: false });
  }

  try {
    game.addPlayer(playerId, character);
    broadcastGameUpdate(gameId);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Initialisierung
Game.prototype.addPlayer = function(playerId, character) {
  if (this.players.size >= this.maxPlayers) {
    throw new Error('Spiel ist bereits voll');
  }
  this.players.set(playerId, { character, ready: false });
};

// Health Check
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Error Handling
process.on('uncaughtException', (err) => {
  console.error('Unbehandelter Fehler:', err);
});
const express = require('express');
const fs = require('fs');
const path = require('path');

// Express-App erstellen
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware für statische Dateien (wichtig für deine HTML/CSS/Images)
app.use(express.static(path.join(__dirname, 'public')));

// Middleware für JSON-Parsing
app.use(express.json());

// Füge diese Variablen am Anfang der Datei hinzu
const activeGames = new Map(); // Speichert aktive Spiele

// Spiel-Logik
class Game {
  constructor(id) {
    this.id = id;
    this.players = new Map();
    this.availableMonsters = [];
    this.selectedMonsters = [];
  }
}

// Dynamische Charakterliste generieren
function generateCharacterList() {
  const charactersDir = path.join(__dirname, 'public', 'images', 'characters');
  try {
    const characterFolders = fs.readdirSync(charactersDir).filter(file => 
      fs.statSync(path.join(charactersDir, file)).isDirectory()
    );

    const characterList = characterFolders.map(folder => {
      const images = fs.readdirSync(path.join(charactersDir, folder));
      const icon = images.find(img => 
        img.toLowerCase().includes('_01.') || 
        img.toLowerCase().includes('thumbnail.')
      ) || (images.length > 0 ? images[0] : null);

      return {
        id: folder.toLowerCase(),
        name: folder.split('_').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' '),
        bild: icon ? `/images/characters/${folder}/${icon}` : '/images/default-character.jpg'
      };
    });

    fs.writeFileSync('characters.json', JSON.stringify(characterList, null, 2));
    return characterList;
  } catch (error) {
    console.error('Fehler beim Generieren der Charakterliste:', error);
    return [];
  }
}

// API-Endpunkt für Charaktere
app.get('/api/available-characters', (req, res) => {
  try {
    const characters = generateCharacterList();
    res.json(characters);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Serverfehler' });
  }
});


// Dynamische Monsterliste generieren
function generateMonsterList() {
  const monstersDir = path.join(__dirname, 'public', 'images', 'monster');
  try {
    const monsterFolders = fs.readdirSync(monstersDir).filter(file => 
      fs.statSync(path.join(monstersDir, file)).isDirectory()
    );

    const monsterList = monsterFolders.map(folder => {
      const images = fs.readdirSync(path.join(monstersDir, folder));
      const icon = images.find(img => 
        img.toLowerCase().includes('_01.') || 
        img.toLowerCase().includes('thumbnail.')
      ) || (images.length > 0 ? images[0] : null);

      return {
        id: folder.toLowerCase(),
        name: folder.charAt(0).toUpperCase() + folder.slice(1).toLowerCase(),
        bild: icon ? `/images/monster/${folder}/${icon}` : '/images/default-monster.jpg'
      };
    });

    fs.writeFileSync('monster.json', JSON.stringify(monsterList, null, 2));
    return monsterList;
  } catch (error) {
    console.error('Fehler beim Generieren der Monsterliste:', error);
    return [];
  }
}

// Initiale Generierung beim Serverstart
generateMonsterList();

// API-Endpunkte
app.get('/api/available-monsters', (req, res) => {
  try {
    const monsters = generateMonsterList();
    res.json(monsters);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Serverfehler' });
  }
});

app.post('/api/refresh-monsters', (req, res) => {
  const updatedMonsters = generateMonsterList();
  res.json({ success: true, monsters: updatedMonsters });
});
// POST /api/select-character
app.post('/api/select-character', (req, res) => {
  const { gameId, playerId, character } = req.body;
  
  try {
    if (!activeGames.has(gameId)) {
      return res.status(404).json({ success: false, message: "Spiel nicht gefunden" });
    }

    const game = activeGames.get(gameId);
    game.players.set(playerId, { character });
    
    res.json({ 
      success: true,
      gameStatus: {
        players: Array.from(game.players.keys()),
        monsters: game.selectedMonsters
      }
    });
  } catch (error) {
    console.error('Fehler bei Charakterauswahl:', error);
    res.status(500).json({ success: false, message: "Serverfehler" });
  }
});

// POST /api/start-game
app.post('/api/start-game', (req, res) => {
  const { gameId, monsters } = req.body;
  
  try {
    if (!activeGames.has(gameId)) {
      // Neues Spiel erstellen, falls nicht vorhanden
      const newGame = new Game(gameId);
      newGame.selectedMonsters = monsters;
      activeGames.set(gameId, newGame);
    } else {
      // Bestehendes Spiel aktualisieren
      activeGames.get(gameId).selectedMonsters = monsters;
    }

    res.json({ 
      success: true,
      gameId,
      monsters: activeGames.get(gameId).selectedMonsters
    });
  } catch (error) {
    console.error('Fehler beim Spielstart:', error);
    res.status(500).json({ success: false, message: "Serverfehler" });
  }
});

// GET /api/game-status (für spätere Erweiterungen)
app.get('/api/game-status/:gameId', (req, res) => {
  const game = activeGames.get(req.params.gameId);
  if (!game) {
    return res.status(404).json({ error: "Spiel nicht gefunden" });
  }
  
  res.json({
    players: Array.from(game.players.values()),
    monsters: game.selectedMonsters
  });
});
// Starte den Server
app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
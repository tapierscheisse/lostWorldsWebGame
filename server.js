const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// Middleware
app.use(express.static('public'));
app.use(express.json());

// Daten speichern
let games = {};

// Spiel erstellen (für Spielleiter)
app.post('/api/create-game', (req, res) => {
  const gameId = generateGameId();
  games[gameId] = {
    players: {},
    monsters: [],
    availableCharacters: getAvailableCharacters()
  };
  res.json({ gameId });
});

// Charaktere aus Ordner lesen
function getAvailableCharacters() {
  const charactersDir = path.join(__dirname, 'public', 'images', 'spieler');
  return fs.readdirSync(charactersDir).filter(f => 
    fs.statSync(path.join(charactersDir, f)).isDirectory());
}

// Spieler beitreten
app.post('/api/join-game', (req, res) => {
  const { gameId, playerId, character } = req.body;
  
  if (!games[gameId]) return res.status(404).send('Spiel nicht gefunden');
  
  // Prüfen ob Charakter verfügbar ist
  if (!games[gameId].availableCharacters.includes(character)) {
    return res.status(400).send('Charakter nicht verfügbar');
  }
  
  // Charakter zuweisen
  games[gameId].players[playerId] = character;
  
  // Charakter aus verfügbaren entfernen
  games[gameId].availableCharacters = games[gameId].availableCharacters.filter(c => c !== character);
  
  res.json({ success: true });
});

// Spielleiter wählt Monster aus
app.post('/api/select-monsters', (req, res) => {
  const { gameId, monsters } = req.body;
  
  if (!games[gameId]) return res.status(404).send('Spiel nicht gefunden');
  
  games[gameId].monsters = monsters;
  res.json({ success: true });
});

// Spiel starten
app.get('/api/start-game/:gameId', (req, res) => {
  const gameId = req.params.gameId;
  if (!games[gameId]) return res.status(404).send('Spiel nicht gefunden');
  
  // Hier könntest du die Spieler zum Spiel weiterleiten
  res.json({ 
    players: games[gameId].players,
    monsters: games[gameId].monsters
  });
});

function generateGameId() {
  return Math.random().toString(36).substring(2, 9);
}

app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});

// Füge diese Endpunkte zu deiner server.js hinzu

// Verfügbare Charaktere abrufen
app.get('/api/available-characters', (req, res) => {
  try {
    const gameId = req.query.gameId;
    if (!games[gameId]) {
      return res.status(404).json({ error: 'Spiel nicht gefunden' });
    }
    
    // Lade alle Charaktere und filtere bereits gewählte
    const allCharacters = JSON.parse(fs.readFileSync('spieler.json'));
    const availableChars = allCharacters.filter(char => 
      games[gameId].availableCharacters.includes(char.id));
    
    res.json(availableChars);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Serverfehler' });
  }
});

// Charakter auswählen
app.post('/api/select-character', (req, res) => {
  const { gameId, playerId, character } = req.body;
  
  if (!games[gameId]) {
    return res.status(404).json({ success: false, message: 'Spiel nicht gefunden' });
  }
  
  if (!games[gameId].availableCharacters.includes(character)) {
    return res.status(400).json({ success: false, message: 'Charakter nicht verfügbar' });
  }
  
  games[gameId].players[playerId] = character;
  games[gameId].availableCharacters = games[gameId].availableCharacters.filter(c => c !== character);
  
  res.json({ success: true });
});

// Verfügbare Monster abrufen
app.get('/api/available-monsters', (req, res) => {
  try {
    const monsters = JSON.parse(fs.readFileSync('monster.json'));
    res.json(monsters);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Serverfehler' });
  }
});

// Spiel starten
app.post('/api/start-game', (req, res) => {
  const { gameId, monsters } = req.body;
  
  if (!games[gameId]) {
    return res.status(404).json({ success: false, message: 'Spiel nicht gefunden' });
  }
  
  games[gameId].monsters = monsters;
  games[gameId].started = true;
  
  res.json({ success: true });
});
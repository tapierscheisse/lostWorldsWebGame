const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-Memory Datenbank für Spiele
let games = {};

// Hilfsfunktion: Lädt alle Charakter-IDs aus spieler.json
function getAllCharacterIds() {
  try {
    const characters = JSON.parse(fs.readFileSync('spieler.json'));
    return characters.map(char => char.id);
  } catch (error) {
    console.error('Fehler beim Laden der Charaktere:', error);
    return [];
  }
}

// ROUTEN
// Hauptseite
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Neues Spiel erstellen
app.post('/api/create-game', (req, res) => {
  const gameId = 'game-' + Math.random().toString(36).substring(2, 8);
  games[gameId] = {
    players: {},
    monsters: [],
    availableCharacters: getAllCharacterIds(),
    started: false
  };
  res.json({ gameId });
});

// Verfügbare Charaktere abrufen
app.get('/api/available-characters', (req, res) => {
  try {
    const gameId = req.query.gameId;
    if (!games[gameId]) {
      return res.status(404).json({ error: 'Spiel nicht gefunden' });
    }
    
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

// Server starten
app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));
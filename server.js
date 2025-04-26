const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// In-Memory Datenbank für Spiele
let games = {};

// Root-Endpoint für die Frontend-Seite
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API-Endpunkte (die du bereits hast)
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

app.get('/api/available-monsters', (req, res) => {
  try {
    const monsters = JSON.parse(fs.readFileSync('monster.json'));
    res.json(monsters);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Serverfehler' });
  }
});

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
app.listen(port, () => {
  console.log(`Server läuft auf Port ${port}`);
});
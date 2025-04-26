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
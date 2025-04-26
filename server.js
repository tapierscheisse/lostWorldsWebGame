const express = require('express');
const path = require('path');
const WebSocket = require('ws');

// Initialisierung
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Server erstellen
const server = app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});

// WebSocket-Server
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
}

const activeGames = new Map();

// WebSocket-Handler
wss.on('connection', (ws) => {
  console.log('Neue WebSocket-Verbindung');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Empfangene Nachricht:', data);
      
      if (data.type === 'register') {
        ws.gameId = data.gameId;
        ws.send(JSON.stringify({ type: 'connection_established' }));
      }
    } catch (error) {
      console.error('WebSocket Fehler:', error);
    }
  });

  ws.on('close', () => {
    console.log('Verbindung geschlossen');
  });
});

// API-Endpunkte
app.get('/api/ping', (req, res) => {
  res.json({ status: 'online', timestamp: new Date() });
});

app.get('/api/available-monsters', (req, res) => {
  // Temporäre statische Daten
  const monsters = [
    { id: 'drache', name: 'Drache', bild: '/images/monster/drache.jpg' },
    { id: 'troll', name: 'Troll', bild: '/images/monster/troll.jpg' }
  ];
  res.json(monsters);
});

// Health Check
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Fehlerbehandlung
process.on('uncaughtException', (err) => {
  console.error('Unbehandelter Fehler:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unbehandelte Promise-Ablehnung:', reason);
});
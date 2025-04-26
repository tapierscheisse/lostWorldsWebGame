console.log("Script geladen"); // Erste Zeile

// Initialisierung
const gameId = 'game-' + Math.random().toString(36).substring(2, 8);
document.getElementById('gameId').textContent = gameId;

console.log("GameID:", gameId); // Nach der Initialisierung

let selectedMonsters = [];
const socket = new WebSocket(`ws://${window.location.host}`);

socket.onopen = () => {
  socket.send(JSON.stringify({ type: 'register', gameId, role: 'master' }));
};

// Monster laden
function loadMonsters() {
  fetch(`/api/available-monsters?nocache=${Date.now()}`)
    .then(response => response.json())
    .then(monsters => {
      const container = document.getElementById('availableMonsters');
      container.innerHTML = '';
      
      monsters.forEach(monster => {
        const card = document.createElement('div');
        card.className = 'monster-card';
        card.innerHTML = `
          <img src="${monster.bild}" alt="${monster.name}">
          <div class="name">${monster.name}</div>
        `;
        card.addEventListener('click', () => toggleSelection(monster.id));
        container.appendChild(card);
      });
    });
}

// Spielerliste aktualisieren
function updatePlayers(players) {
  const list = document.getElementById('playersList');
  list.innerHTML = players.map(p => `
    <li>${p.character} (${p.ready ? 'bereit' : 'wartet'})</li>
  `).join('');
}

// Initialisierung
loadMonsters();




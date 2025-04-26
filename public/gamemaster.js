console.log("Script geladen");

// Initialisierung
const gameId = 'game-' + Math.random().toString(36).substring(2, 8);
document.getElementById('gameId').textContent = gameId;

console.log("GameID:", gameId);

// Ersetze die WebSocket-Verbindung durch:
const socket = new WebSocket(
  window.location.protocol === 'https:' 
    ? `wss://${window.location.host}`
    : `ws://${window.location.host}`
);

// Debug-Ausgaben hinzufügen
socket.onopen = () => {
  console.log("WebSocket verbunden");
  socket.send(JSON.stringify({ 
    type: 'register', 
    gameId, 
    role: 'master' 
  }));
};

socket.onerror = (error) => {
  console.error("WebSocket Fehler:", error);
};

// Monster laden
function loadMonsters() {
  fetch(`/api/available-monsters?nocache=${Date.now()}`)
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(monsters => {
      console.log("Geladene Monster:", monsters);
      const container = document.getElementById('availableMonsters');
      container.innerHTML = '';
      
      monsters.forEach(monster => {
        const card = document.createElement('div');
        card.className = 'monster-card';
        card.dataset.id = monster.id;
        card.innerHTML = `
          <img src="${monster.bild}" alt="${monster.name}" onerror="this.src='/images/default-monster.jpg'">
          <div class="name">${monster.name}</div>
        `;
        card.addEventListener('click', () => toggleSelection(monster.id));
        container.appendChild(card);
      });
    })
    .catch(error => {
      console.error('Fehler beim Laden:', error);
      document.getElementById('availableMonsters').innerHTML = `
        <div class="error">Monster konnten nicht geladen werden</div>
      `;
    });
}

// Spielerliste aktualisieren
function updatePlayers(players) {
  const list = document.getElementById('playersList');
  list.innerHTML = players.map(p => `
    <li>${p.character} (${p.ready ? 'bereit' : 'wartet'})</li>
  `).join('');
}

// Monster-Auswahl
function toggleSelection(monsterId) {
  const index = selectedMonsters.indexOf(monsterId);
  if (index === -1) {
    selectedMonsters.push(monsterId);
  } else {
    selectedMonsters.splice(index, 1);
  }
  updateSelection();
}

// Auswahl aktualisieren
function updateSelection() {
  document.getElementById('selectedCount').textContent = selectedMonsters.length;
  const startBtn = document.getElementById('startBtn');
  startBtn.disabled = selectedMonsters.length === 0;
  
  // Visuelle Auswahl markieren
  document.querySelectorAll('.monster-card').forEach(card => {
    card.classList.toggle('selected', selectedMonsters.includes(card.dataset.id));
  });
}

// Spiel starten
document.getElementById('startBtn').addEventListener('click', () => {
  const btn = document.getElementById('startBtn');
  btn.disabled = true;
  btn.textContent = 'Spiel wird gestartet...';
  
  fetch('/api/start-game', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      gameId: gameId, 
      monsters: selectedMonsters 
    })
  })
  .then(response => {
    if (!response.ok) throw new Error('Start fehlgeschlagen');
    return response.json();
  })
  .then(data => {
    if (data.success) {
      window.location.href = `/game.html?gameId=${gameId}&master=true`;
    }
  })
  .catch(error => {
    console.error('Fehler:', error);
    btn.disabled = false;
    btn.textContent = 'Spiel starten';
    alert('Fehler beim Start: ' + error.message);
  });
});

// Initialisierung
loadMonsters();
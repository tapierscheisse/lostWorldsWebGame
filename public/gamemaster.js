document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM vollständig geladen');
  
  // Initialisierung
  const gameId = 'game-' + Math.random().toString(36).substring(2, 8);
  document.getElementById('gameId').textContent = gameId;
  
  let selectedMonsters = [];
  const socket = new WebSocket(`wss://${window.location.host}`);

  // WebSocket-Handler
  socket.onopen = () => {
    console.log('WebSocket verbunden');
    socket.send(JSON.stringify({ 
      type: 'register', 
      gameId, 
      role: 'master' 
    }));
  };

  socket.onerror = (error) => {
    console.error('WebSocket Fehler:', error);
  };

  // Monster-Auswahl-Logik
  function setupMonsterSelection() {
    const container = document.getElementById('availableMonsters');
    if (!container) {
      console.error('Monster-Container nicht gefunden');
      return;
    }

    container.addEventListener('click', (event) => {
      const monsterCard = event.target.closest('.monster-card');
      if (!monsterCard) return;

      const monsterId = monsterCard.dataset.id;
      toggleMonsterSelection(monsterId, monsterCard);
    });
  }

  function toggleMonsterSelection(monsterId, cardElement) {
    const index = selectedMonsters.indexOf(monsterId);
    
    if (index === -1) {
      // Monster auswählen
      if (selectedMonsters.length >= 5) {
        alert('Maximal 5 Monster auswählbar');
        return;
      }
      selectedMonsters.push(monsterId);
      cardElement.classList.add('selected');
    } else {
      // Monster abwählen
      selectedMonsters.splice(index, 1);
      cardElement.classList.remove('selected');
    }
    
    updateSelectionDisplay();
  }

  function updateSelectionDisplay() {
    // Zähler aktualisieren
    document.getElementById('selectedCount').textContent = selectedMonsters.length;
    
    // Start-Button aktivieren/deaktivieren
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
      startBtn.disabled = selectedMonsters.length === 0;
    }
    
    console.log('Ausgewählte Monster:', selectedMonsters);
  }

  // Initialisierung
  setupMonsterSelection();
});
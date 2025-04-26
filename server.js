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

// Starte den Server
app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
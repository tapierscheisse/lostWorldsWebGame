const fs = require('fs');
const path = require('path');

// Dynamische Monsterliste generieren
function generateMonsterList() {
  const monstersDir = path.join(__dirname, 'public', 'images', 'monster');
  try {
    const monsterFolders = fs.readdirSync(monstersDir).filter(file => 
      fs.statSync(path.join(monstersDir, file)).isDirectory()
    );

    const monsterList = monsterFolders.map(folder => {
      // Suche nach einer passenden Bilddatei (z.B. DRACHE_01.jpg)
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

    // Schreibe die generierte Liste in monster.json
    fs.writeFileSync('monster.json', JSON.stringify(monsterList, null, 2));
    return monsterList;
  } catch (error) {
    console.error('Fehler beim Generieren der Monsterliste:', error);
    return [];
  }
}

// Initiale Generierung beim Serverstart
generateMonsterList();

// API-Endpunkt für Monster (jetzt dynamisch)
app.get('/api/available-monsters', (req, res) => {
  try {
    // Immer aktuell aus dem Ordner lesen
    const monsters = generateMonsterList();
    res.json(monsters);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Serverfehler' });
  }
});

// Neu generieren bei Bedarf
app.post('/api/refresh-monsters', (req, res) => {
  cachedMonsters = generateMonsterList();
  res.json({ success: true });
});
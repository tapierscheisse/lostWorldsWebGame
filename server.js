// 1. Express importieren
const express = require('express');
const app = express();

// 2. Port aus Umgebungsvariable (für Render) oder 3000 lokal
const PORT = process.env.PORT || 3000;

// 3. Eine einfache Route
app.get('/', (req, res) => {
  res.send('Hallo Welt! 🚀');
});

// 4. Server starten
app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
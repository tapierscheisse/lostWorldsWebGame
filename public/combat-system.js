// ========== GLOBALE VARIABLEN ==========
let buttonData = [];
let pagesData = [];
let pages2Data = [];
let restrictions = [];
let damageData = [];

// Spieler-spezifische Variablen
let currentButtonValue = 0;
let savedManeuverValue = null;
let isExtendedRangeMode = true;
let currentRestriction = "Only move Extended Range";

// Master-spezifische Variablen
let currentButtonValueMaster = 0;
let savedManeuverValueMaster = null;
let isExtendedRangeModeMaster = true;
let currentRestrictionMaster = "Only move Extended Range";

// ========== HILFSFUNKTIONEN ==========
function processButtonData(data) { /* ... */ }
function processPagesData(pagesText, pages2Text) { /* ... */ }
function processRestrictionsData(data) { /* ... */ }
function processDamageData(data) { /* ... */ }
function updateButtonRestrictions(restrictionText, isMasterSystem = false) { /* ... */ }
function isWeaponButton(type) { /* ... */ }
function isShieldButton(type) { /* ... */ }

// ========== SPIELFUNKTIONEN ==========
function initGame(isMasterSystem = false) {
    // Initialisierung des Kampfsystems
    // Laden der Buttons, etc.
    // Event Listener setzen
}
function toggleMode(extendedMode, isMasterSystem = false) { /* ... */ }
function openInputModal(value) { /* ... */ }
function openInputModalMaster(value) { /* ... */ }
function closeModals() { /* ... */ }
function calculateResult(isMasterSystem = false) { /* ... */ }

// ========== DATENLADUNG ==========
async function loadGameData() {
    try {
        // Fetch und Verarbeitung
        initGame(false);
        initGame(true);
        // UI Updates
    } catch (error) {
        // Fehlerbehandlung und Fallback
    }
}

// Funktion zum Initialisieren des Kampfsystems von außen
function initCombatSystem(isMasterSystem) {
    loadGameData(); // oder nur initGame(isMasterSystem) wenn Daten bereits geladen sind
}
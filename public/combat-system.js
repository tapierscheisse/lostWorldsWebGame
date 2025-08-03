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
function processButtonData(data) {
    buttonData = data.split('\n')
        .filter(line => line.trim() !== '')
        .map(line => {
            const parts = line.split(',');
            return {
                type: parts[0].trim(),
                name: parts[1].trim(),
                value: parseInt(parts[2].trim()),
                colorCode: parts[5].trim()
            };
        });
}

function processPagesData(pagesText, pages2Text) {
    pagesData = pagesText.split('\n')
        .filter(line => line.includes('='))
        .map(line => {
            const content = line.split('=')[1].trim();
            return content.substring(1, content.length - 1)
                .split(',')
                .map(num => parseInt(num.trim()));
        });
    pages2Data = pages2Text.split('\n')
        .filter(line => line.includes('='))
        .map(line => {
            const content = line.split('=')[1].trim();
            return content.substring(1, content.length - 1)
                .split(',')
                .map(num => parseInt(num.trim()));
        });
}

function processRestrictionsData(data) {
    restrictions = data.split('\n')
        .filter(line => line.includes('='))
        .map(line => line.split('=')[1].trim());
}

function processDamageData(data) {
    damageData = data.split('|').map(pair => {
        const values = pair.split(',');
        return [
            parseInt(values[0].trim()),
            parseInt(values[1].trim()),
            parseInt(values[2].trim())
        ];
    });
}

// ========== RESTRIKTIONSLOGIK ==========
function updateButtonRestrictions(restrictionText, isMasterSystem = false) {
    const restriction = isMasterSystem ? restrictionText : currentRestriction;
    const extendedMode = isMasterSystem ? isExtendedRangeModeMaster : isExtendedRangeMode;
    const buttons = isMasterSystem ? document.querySelectorAll('#buttonsMaster .button') : document.querySelectorAll('#buttons .button');

    buttons.forEach(button => {
        const colorCode = button.classList[1];
        const buttonType = button.textContent.split(' ')[0];
        let isAllowed = true;

        if (extendedMode) {
            isAllowed = buttonType === "Extended";
        } else {
            if (restriction.includes("Can't use move " + buttonType)) {
                isAllowed = false;
            }
            const colorBans = restriction.match(/Can't use [A-Z]/g) || [];
            if (colorBans.some(ban => ban.includes(colorCode))) {
                isAllowed = false;
            }
            const onlyColors = restriction.match(/Only [A-Z]/g) || [];
            if (onlyColors.length > 0 && !onlyColors.some(oc => oc.includes(colorCode))) {
                isAllowed = false;
            }
            if (restriction.includes("Drop weapon") && isWeaponButton(buttonType)) {
                isAllowed = false;
            }
            if (restriction.includes("Shield broken") && isShieldButton(buttonType)) {
                isAllowed = false;
            }
        }

        button.disabled = !isAllowed;
        button.style.opacity = isAllowed ? "1" : "0.5";
        button.setAttribute('data-tooltip', isAllowed ? "" : "Blockiert durch: " + restriction);
    });
}

function isWeaponButton(type) {
    return ["Thrust", "Side Swing", "Down Swing", "Smash", "Protected Attack"].includes(type);
}

function isShieldButton(type) {
    return ["Shield Block", "Protected Attack"].includes(type);
}

// ========== SPIELFUNKTIONEN ==========
function initGame(isMasterSystem = false) {
    const buttonsContainer = isMasterSystem ? document.getElementById('buttonsMaster') : document.getElementById('buttons');
    buttonsContainer.innerHTML = '';

    buttonData.forEach(button => {
        const btn = document.createElement('button');
        btn.className = `button ${button.colorCode}`;
        btn.textContent = `${button.type} ${button.name}`;
        btn.value = button.value;

        btn.addEventListener('click', () => {
            if (isMasterSystem) {
                openInputModalMaster(button.value);
            } else {
                openInputModal(button.value);
            }
        });

        buttonsContainer.appendChild(btn);
    });

    // Start im Extended Range Mode
    toggleMode(true, isMasterSystem);

    // Event Listener
    if (!isMasterSystem) {
        document.getElementById('switchMode').onclick = function() {
            isExtendedRangeMode = !isExtendedRangeMode;
            toggleMode(isExtendedRangeMode, false);
        };
    } else {
        document.getElementById('switchModeMaster').onclick = function() {
            isExtendedRangeModeMaster = !isExtendedRangeModeMaster;
            toggleMode(isExtendedRangeModeMaster, true);
        };
    }
}

function toggleMode(extendedMode, isMasterSystem = false) {
    if (!isMasterSystem) {
        isExtendedRangeMode = extendedMode;
        if (extendedMode) {
            updateButtonRestrictions("Only move Extended Range", false);
            document.getElementById('switchMode').textContent = "Zu Normalmodus wechseln";
        } else {
            updateButtonRestrictions(currentRestriction, false);
            document.getElementById('switchMode').textContent = "Zu Extended Range wechseln";
        }
    } else {
        isExtendedRangeModeMaster = extendedMode;
        if (extendedMode) {
            updateButtonRestrictions("Only move Extended Range", true);
            document.getElementById('switchModeMaster').textContent = "Zu Normalmodus wechseln";
        } else {
            updateButtonRestrictions(currentRestrictionMaster, true);
            document.getElementById('switchModeMaster').textContent = "Zu Extended Range wechseln";
        }
    }
}

function openInputModal(value) {
    currentButtonValue = parseInt(value);
    document.getElementById('modalValue').textContent = `Button Wert: ${value}`;
    document.getElementById('inputModal').style.display = "block";
    document.getElementById('maneuverInput').value = "";
    document.getElementById('maneuverInput').focus();
}

function openInputModalMaster(value) {
    currentButtonValueMaster = parseInt(value);
    document.getElementById('modalValueMaster').textContent = `Button Wert: ${value}`;
    document.getElementById('inputModalMaster').style.display = "block";
    document.getElementById('maneuverInputMaster').value = "";
    document.getElementById('maneuverInputMaster').focus();
}

function closeModals() {
    document.getElementById('inputModal').style.display = "none";
    document.getElementById('resultModal').style.display = "none";
    document.getElementById('inputModalMaster').style.display = "none";
    document.getElementById('resultModalMaster').style.display = "none";
}

function calculateResult(isMasterSystem = false) {
    let buttonValue, maneuverValue, restrictionVar, pages, pages2;

    if (!isMasterSystem) {
        buttonValue = currentButtonValue;
        maneuverValue = savedManeuverValue;
        restrictionVar = currentRestriction;
        pages = pagesData;
        pages2 = pages2Data;
    } else {
        buttonValue = currentButtonValueMaster;
        maneuverValue = savedManeuverValueMaster;
        restrictionVar = currentRestrictionMaster;
        pages = pagesData;
        pages2 = pages2Data;
    }

    let rowIndex, colIndex, result = null, source = "";

    if (buttonValue < 50) {
        rowIndex = Math.floor(buttonValue / 2) - 1;
        colIndex = Math.floor(maneuverValue / 2) - 1;
        if (rowIndex >= 0 && rowIndex < pages.length &&
            colIndex >= 0 && colIndex < pages[rowIndex].length) {
            result = pages[rowIndex][colIndex];
            source = `pages[${rowIndex}][${colIndex}]`;
        }
    } else {
        rowIndex = Math.floor(buttonValue / 2) - 25;
        colIndex = Math.floor(maneuverValue / 2) - 25;
        if (rowIndex >= 0 && rowIndex < pages2.length &&
            colIndex >= 0 && colIndex < pages2[rowIndex].length) {
            result = pages2[rowIndex][colIndex];
            source = `pages2[${rowIndex}][${colIndex}]`;
        }
    }

    if (result !== null && result !== undefined) {
        const restrictionIndex = Math.floor((result - 1) / 2);
        let restrictionText = "No restrictions";
        if (restrictionIndex >= 0 && restrictionIndex < restrictions.length) {
            restrictionText = restrictions[restrictionIndex];
            if (!isMasterSystem) {
                currentRestriction = restrictionText;
            } else {
                currentRestrictionMaster = restrictionText;
            }

            const extendedMode = isMasterSystem ? isExtendedRangeModeMaster : isExtendedRangeMode;
            if (!extendedMode) {
                updateButtonRestrictions(restrictionText, isMasterSystem);
            }
        }

        let damageValue = "Kein Damage-Wert gefunden";
        for (const damageEntry of damageData) {
            if (damageEntry[0] === result) {
                damageValue = damageEntry[1];
                break;
            }
        }

        const resultText = `Ergebniswert: ${result}\nDamage: ${damageValue}\nRestriktion:\n${restrictionText.replace(/,/g, "\n")}`;

        if (!isMasterSystem) {
            document.getElementById('finalResult').textContent = resultText;
            document.getElementById('inputModal').style.display = "none";
            document.getElementById('resultModal').style.display = "block";
        } else {
            document.getElementById('finalResultMaster').textContent = resultText;
            document.getElementById('inputModalMaster').style.display = "none";
            document.getElementById('resultModalMaster').style.display = "block";
        }
    } else {
        alert(`Kein Ergebnis gefunden für:\nButton: ${buttonValue}\nManöver: ${maneuverValue}\nBerechnete Indizes:\nZeile: ${rowIndex}\nSpalte: ${colIndex}`);
        closeModals();
    }
}

// ========== DATENLADUNG ==========
async function loadGameData() {
    try {
        const basePath = isMaster ? '/images/monsters/' : '/images/characters/';
        const [buttons, pages, pages2, restrictionsTxt, damage] = await Promise.all([
            fetch(`${basePath}buttons.txt`).then(r => r.text()),
            fetch(`${basePath}pages.txt`).then(r => r.text()),
            fetch(`${basePath}pages2.txt`).then(r => r.text()),
            fetch(`${basePath}restrictions.txt`).then(r => r.text()),
            fetch(`${basePath}damage.txt`).then(r => r.text())
        ]);

        processButtonData(buttons);
        processPagesData(pages, pages2);
        processRestrictionsData(restrictionsTxt);
        processDamageData(damage);

        initGame(false); // Spieler-System
        initGame(true);  // Master-System

        document.getElementById('loading').style.display = 'none';
        document.getElementById('buttons').style.display = 'flex';
        document.getElementById('loadingMaster').style.display = 'none';
        document.getElementById('buttonsMaster').style.display = 'flex';
    } catch (error) {
        console.error('Fehler beim Laden:', error);
        document.getElementById('loading').textContent = 'Verwende Standarddaten';
        document.getElementById('loadingMaster').textContent = 'Verwende Standarddaten';

        // Fallback-Daten
        const fallbackButtons = `Extended Range,Charge,50,0,5,W,1
Extended Range,Swing High,64,0,-6,K,1
Extended Range,Swing Low,58,0,-6,K,1
Extended Range,Thrust High,54,0,-5,W,1
Extended Range,Thrust Low,60,0,-5,W,1
Extended Range,Block and Close,56,0,4,B,0
Extended Range,Dodge,52,0,-6,B,0
Extended Range,Jump Back,62,0,-6,B,0
Special,Shoulder Slam,36,50,-3,O,0
Down Swing,Smash,24,50,3,O,1
Side Swing,Strong,28,64,2,O,1
Side Swing,High,10,64,1,D,1
Side Swing,Low,2,58,1,U,1
Thrust,High,32,54,0,D,1
Thrust,Low,14,60,0,U,1`;

        processButtonData(fallbackButtons);
        processPagesData(`pages[00]=(49,17,13,13,13,13,49,57,37,19,49,13,13,13,49,13,00,13,13,49,49,15,27,13)`, `pages2[0]=(45,23,09,17,41,11,19,19)`);
        processRestrictionsData(`restriction[0]=No restrictions,Bonus 2,(P)
restriction[28]=Only move Extended Range,(P)`);
        processDamageData(`7,4,0|13,1,0|17,-5,0`);

        setTimeout(() => {
            initGame(false); // Spieler-System
            initGame(true);  // Master-System

            document.getElementById('loading').style.display = 'none';
            document.getElementById('buttons').style.display = 'flex';
            document.getElementById('loadingMaster').style.display = 'none';
            document.getElementById('buttonsMaster').style.display = 'flex';
        }, 500);
    }
}

// Funktion zum Initialisieren des Kampfsystems von außen
function initCombatSystem(isMasterSystem) {
    loadGameData(); // oder nur initGame(isMasterSystem) wenn Daten bereits geladen sind
}
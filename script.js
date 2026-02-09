// ============================================
// LAST PROTOCOL - Command Interface Script
// ============================================

// Boot sequence messages
const bootMessages = [
    "SYSTEM INITIALIZING...",
    "LOADING CORE MODULES... [OK]",
    "CHECKING SECURITY PROTOCOLS... [FAILED]",
    "WARNING: UNAUTHORIZED ACCESS DETECTED",
    "BYPASSING SECURITY LAYER 1... [OK]",
    "BYPASSING SECURITY LAYER 2... [OK]",
    "BYPASSING SECURITY LAYER 3... [OK]",
    "OVERRIDING ROBOT SECURITY MAINFRAME...",
    "ACCESS GRANTED",
    "",
    "PROTOCOL 00: LAST HOPE ACTIVE",
    "HUMANITY STATUS: CRITICAL",
    "MISSION OBJECTIVE: SURVIVE",
    "",
    "WELCOME, COMMANDER",
    "INITIALIZING COMMAND INTERFACE..."
];

// DOM Elements
let bootSequence;
let bootText;
let mainMenu;
let ambientLoop;
let hoverSound;
let selectSound;
let menuButtons;
let settingsModal;
let audioToggle;
let graphicsToggle;
let dataWipeBtn;
let closeSettingsBtn;
let alarmSound;
let collectSound;
let scoresModal;
let highLevelDisplay;
let highScoreDisplay;
let closeScoresBtn;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeElements();
    startBootSequence();
    setupEventListeners();
    startSystemTime();
});

// Initialize DOM element references
function initializeElements() {
    bootSequence = document.getElementById('bootSequence');
    bootText = document.querySelector('.boot-text');
    mainMenu = document.getElementById('mainMenu');
    ambientLoop = document.getElementById('ambientLoop');
    hoverSound = document.getElementById('hoverSound');
    selectSound = document.getElementById('selectSound');
    menuButtons = document.querySelectorAll('.menu-btn');
    settingsModal = document.getElementById('settingsModal');
    audioToggle = document.getElementById('audioToggle');
    graphicsToggle = document.getElementById('graphicsToggle');
    dataWipeBtn = document.getElementById('dataWipeBtn');
    closeSettingsBtn = document.getElementById('closeSettingsBtn');
    alarmSound = document.getElementById('alarmSound');
    collectSound = document.getElementById('collectSound');

    // Scores Modal Elements
    scoresModal = document.getElementById('scoresModal');
    highLevelDisplay = document.getElementById('highLevelDisplay');
    highScoreDisplay = document.getElementById('highScoreDisplay');
    closeScoresBtn = document.getElementById('closeScoresBtn');
}

// Boot sequence animation
function startBootSequence() {
    let currentLine = 0;
    let currentText = '';

    const typeInterval = setInterval(() => {
        if (currentLine < bootMessages.length) {
            currentText += bootMessages[currentLine] + '\n';
            bootText.textContent = currentText;
            if (AG && AG.SFX) {
                // Every 10th char slightly distorted
                const isDistorted = (currentText.length % 10 === 0);
                AG.SFX.playTypewriter(isDistorted);
            }
            currentLine++;
        } else {
            clearInterval(typeInterval);
            setTimeout(() => {
                bootSequence.classList.add('fade-out');
                setTimeout(() => {
                    bootSequence.style.display = 'none';
                    mainMenu.classList.remove('hidden');
                    startAmbientSound();
                    startMusic(); // Start the main theme
                }, 500);
            }, 1000);
        }
    }, 150); // Speed of boot text appearance
}

// Start Main Theme Music
function startMusic() {
    if (!window.backgroundMusic) {
        // Create global music instance
        window.backgroundMusic = new AG.Audio('assets/music.wav', true, 0.5);
    }

    // Attempt play
    window.backgroundMusic.play();

    // Setup user interaction fallback for autoplay policies
    const resumeAudio = () => {
        if (window.backgroundMusic && window.backgroundMusic.audio.paused) {
            window.backgroundMusic.play();
        }
    };

    window.addEventListener('click', resumeAudio);
    window.addEventListener('keydown', resumeAudio);

    // cleanup listeners if playing
    if (window.backgroundMusic.audio) {
        window.backgroundMusic.audio.addEventListener('playing', () => {
            window.removeEventListener('click', resumeAudio);
            window.removeEventListener('keydown', resumeAudio);
        });
    }
}

// Setup event listeners for menu buttons
function setupEventListeners() {
    menuButtons.forEach(button => {
        // Hover effects
        button.addEventListener('mouseenter', () => {
            // Use new procedural click sound
            if (AG && AG.SFX) AG.SFX.playClick();
            const text = button.querySelector('.btn-text');
            text.textContent = `> ${text.textContent} <`;
        });

        button.addEventListener('mouseleave', () => {
            const text = button.querySelector('.btn-text');
            text.textContent = text.textContent.replace(/^> /, '').replace(/ <$/, '');
        });

        // Click handlers
        button.addEventListener('click', () => {
            // Use new procedural select sound
            if (AG && AG.SFX) AG.SFX.playSelect();
            handleMenuAction(button.dataset.action);
        });
    });

    // Settings Event Listeners
    if (closeSettingsBtn) {
        closeSettingsBtn.addEventListener('click', () => {
            if (AG && AG.SFX) AG.SFX.playSelect();
            hideSettings();
        });
    }

    if (closeScoresBtn) {
        closeScoresBtn.addEventListener('click', () => {
            if (AG && AG.SFX) AG.SFX.playSelect();
            hideScores();
        });
    }

    if (audioToggle) {
        audioToggle.addEventListener('change', (e) => {
            toggleAudio(e.target.checked);
        });
    }

    if (graphicsToggle) {
        graphicsToggle.addEventListener('change', (e) => {
            toggleGraphics(e.target.checked);
        });
    }

    if (dataWipeBtn) {
        dataWipeBtn.addEventListener('click', () => {
            performDataWipe();
        });
    }
}

// Handle menu button actions
function handleMenuAction(action) {
    switch (action) {
        case 'start':
            console.log('Starting mission...');
            // Transition to game scene
            transitionToGame();
            break;
        case 'scores':
            console.log('Loading archived data...');
            showScores();
            break;
        case 'settings':
            console.log('Opening system configuration...');
            showSettings();
            break;
        case 'exit':
            console.log('Terminating session...');
            terminateSession();
            break;
    }
}

// Game instance variable
let game;

// Transition to game
function transitionToGame() {
    // Glitch effect on transition
    document.body.classList.add('glitch-transition');
    setTimeout(() => {
        document.body.classList.remove('glitch-transition');
    }, 500);

    mainMenu.style.opacity = '0';
    setTimeout(() => {
        mainMenu.style.display = 'none'; // Completely hide DOM menu
        const scanlines = document.querySelector('.scanlines');
        // if (scanlines) scanlines.style.display = 'none'; // Keep scanlines in game for style
        const noise = document.querySelector('.noise');
        // if (noise) noise.style.display = 'none'; // Keep noise in game for style

        // Show HUD
        const hud = document.getElementById('gameHud');
        if (hud) hud.classList.remove('hidden');

        // Initialize Game Engine if not already done
        if (!game) {
            const gameConfig = {
                width: window.innerWidth,
                height: window.innerHeight,
                parent: document.body
            };

            game = new AG.Game(gameConfig);
            game.addScene('GamePlay', GamePlay);
            game.start('GamePlay');
        }
    }, 500);
}

// Show scores screen
function showScores() {
    scoresModal.classList.remove('hidden');

    // Load current state
    const highLevel = localStorage.getItem('lastProtocol_highLevel') || 'NONE';
    const highScore = localStorage.getItem('lastProtocol_highScore') || '0';

    if (highLevelDisplay) highLevelDisplay.textContent = highLevel === 'NONE' ? 'NONE' : `LEVEL ${highLevel}`;
    if (highScoreDisplay) highScoreDisplay.textContent = highScore;
}

function hideScores() {
    scoresModal.classList.add('hidden');
}

// Show settings screen
function showSettings() {
    settingsModal.classList.remove('hidden');
    // Load current state
    audioToggle.checked = !ambientLoop.paused;
    graphicsToggle.checked = !document.body.classList.contains('low-graphics');
}

function hideSettings() {
    settingsModal.classList.add('hidden');
}

function toggleAudio(enabled) {
    const audios = document.querySelectorAll('audio');
    audios.forEach(audio => {
        audio.muted = !enabled;
    });

    // Also toggle the global background music
    if (window.backgroundMusic && window.backgroundMusic.audio) {
        window.backgroundMusic.audio.muted = !enabled;
    }

    if (enabled) {
        if (AG && AG.SFX && AG.SFX.ctx) AG.SFX.ctx.resume();
        if (AG && AG.SFX) AG.SFX.startAmbient();

        if (window.backgroundMusic && window.backgroundMusic.audio.paused) {
            window.backgroundMusic.play();
        }
    } else {
        if (AG && AG.SFX && AG.SFX.ctx) AG.SFX.ctx.suspend();

        if (window.backgroundMusic) window.backgroundMusic.stop(); // or pause
    }
}

function toggleGraphics(enabled) {
    if (enabled) {
        document.body.classList.remove('low-graphics');
    } else {
        document.body.classList.add('low-graphics');
    }
}

function performDataWipe() {
    if (confirm('WARNING: THIS WILL PERMANENTLY DELETE ALL PROGRESS.\n\nAre you sure you want to proceed?')) {
        localStorage.removeItem('lastProtocol_highLevel');
        localStorage.removeItem('lastProtocol_highScore');
        alert('SYSTEM PURGED. ARCHIVES CLEARED.');
    }
}

// Terminate session
function terminateSession() {
    if (confirm('TERMINATE SESSION?\n\nAre you sure you want to exit?')) {
        mainMenu.style.opacity = '0';
        setTimeout(() => {
            document.body.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: \'Roboto Mono\', monospace; color: #00FFCC; font-size: 24px; text-shadow: 0 0 20px #00FFCC;">SESSION TERMINATED<br>GOODBYE, COMMANDER</div>';
        }, 500);
    }
}

// Play sound effect
function playSound(audioElement) {
    if (audioElement && audioElement.readyState >= 2) {
        audioElement.currentTime = 0;
        audioElement.play().catch(err => {
            // Silently handle autoplay restrictions
            console.log('Audio playback prevented:', err);
        });
    }
}

// Start ambient background sound
function startAmbientSound() {
    // legacy element handling removed or purely fallback
    if (AG && AG.SFX) {
        AG.SFX.startAmbient();
    }
}

// System time display
function startSystemTime() {
    const timeElement = document.getElementById('systemTime');

    function updateTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        timeElement.textContent = `${hours}:${minutes}:${seconds}`;
    }

    updateTime();
    setInterval(updateTime, 1000);
}

// Keyboard navigation support
document.addEventListener('keydown', (e) => {
    if (mainMenu.classList.contains('hidden')) return;

    const buttons = Array.from(menuButtons);
    const currentIndex = buttons.findIndex(btn => btn === document.activeElement);

    switch (e.key) {
        case 'ArrowDown':
            e.preventDefault();
            const nextIndex = (currentIndex + 1) % buttons.length;
            buttons[nextIndex].focus();
            break;
        case 'ArrowUp':
            e.preventDefault();
            const prevIndex = currentIndex <= 0 ? buttons.length - 1 : currentIndex - 1;
            buttons[prevIndex].focus();
            break;
        case 'Enter':
            if (currentIndex >= 0) {
                buttons[currentIndex].click();
            }
            break;
    }
});

// Add visual feedback for keyboard focus
menuButtons.forEach(button => {
    button.addEventListener('focus', () => {
        button.style.borderColor = '#FF0055';
        button.style.boxShadow = '0 0 20px rgba(255, 0, 85, 0.6), inset 0 0 20px rgba(255, 0, 85, 0.2)';
    });

    button.addEventListener('blur', () => {
        button.style.borderColor = '#00FFCC';
        button.style.boxShadow = '0 0 10px rgba(0, 255, 204, 0.3), inset 0 0 10px rgba(0, 255, 204, 0.1)';
    });
});

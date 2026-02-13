# 🎮 LAST PROTOCOL

<div align="center">

![Last Protocol Banner](https://img.shields.io/badge/LAST_PROTOCOL-SYSTEM_OVERRIDE_ACTIVE-00FFCC?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMiA3TDEyIDEyTDIyIDdMMTIgMloiIHN0cm9rZT0iIzAwRkZDQyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHBhdGggZD0iTTIgMTdMMTIgMjJMMjIgMTciIHN0cm9rZT0iIzAwRkZDQyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHBhdGggZD0iTTIgMTJMMTIgMTdMMjIgMTIiIHN0cm9rZT0iIzAwRkZDQyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)

**A cyberpunk stealth-action game where you infiltrate robot-controlled facilities as humanity's last hope**

[Play Demo](#-quick-start) • [Features](#-features) • [Controls](#-controls) • [Development](#-development)

</div>

---

## 📖 Story

> *In a world where robots have seized control, humanity's survival hangs by a thread. You are the last operative capable of executing Protocol 00 - a desperate mission to infiltrate the robot security mainframe. Navigate through heavily patrolled facilities, eliminate threats silently, and breach each security layer before time runs out.*

The interface you see is your compromised command terminal - glitching, unstable, but operational. Every level brings you deeper into the system. **Will you complete the Last Protocol?**

## ✨ Features

### 🎯 Core Gameplay
- **Stealth Mechanics** - Navigate through procedurally generated mazes while avoiding detection
- **Advanced AI** - Robots with patrol, chase, and suspicion states that investigate sounds
- **Assassination System** - Execute silent takedowns with precise timing
- **Progressive Difficulty** - Each level increases enemy count and complexity
- **Sound-Based Detection** - Footsteps and kills create noise that alerts nearby robots

### 🎨 Visual Excellence
- **Cyberpunk Aesthetic** - Neon colors, CRT scanlines, and glitch effects
- **Particle Systems** - Disintegration effects, ghost trails, and visual feedback
- **Dynamic Lighting** - Atmospheric rendering with shadows and glows
- **Smooth Animations** - 60 FPS gameplay with hardware-accelerated rendering

### 🔊 Audio Design
- **Procedural Sound Effects** - Web Audio API-powered industrial-tech sounds
- **Ambient Soundtrack** - Atmospheric background music
- **Spatial Audio** - Directional sound cues for robot alerts and footsteps
- **UI Feedback** - Click, hover, and selection sounds

### 🎮 Game Systems
- **Pathfinding AI** - A* algorithm for intelligent robot navigation
- **Level Progression** - Save system with high score tracking
- **Responsive Controls** - Arrow keys + mouse/click movement
- **Boot Sequence** - Immersive terminal-style intro animation

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Node.js (optional, for local development server)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/BinaryxBeast/Last-Protocol.git
   cd Last-Protocol
   ```

2. **Install dependencies** (optional)
   ```bash
   npm install
   ```

3. **Run the game**
   
   **Option A: Using npm**
   ```bash
   npm start
   ```
   
   **Option B: Using Python**
   ```bash
   python3 -m http.server 8000
   ```
   
   **Option C: Using any static server**
   ```bash
   npx serve
   ```

4. **Open in browser**
   ```
   http://localhost:8000
   ```

## 🎮 Controls

### Menu Navigation
- **Mouse** - Click menu buttons
- **Arrow Keys** (↑/↓) - Navigate menu options
- **Enter** - Select highlighted option

### Gameplay
- **Arrow Keys** - Move character (WASD alternative)
- **Mouse Click** - Set movement destination
- **Space** - Dash/Sprint (when implemented)
- **ESC** - Pause menu

### Tips
- 🔇 **Stay Silent** - Running creates noise that alerts robots
- 👁️ **Watch Patrol Patterns** - Study robot movements before acting
- ⚡ **Strike Fast** - Assassinate robots before they can alert others
- 🎯 **Plan Your Route** - Use the maze layout to avoid detection

## 📁 Project Structure

```
Last-Protocol/
├── index.html          # Main HTML structure
├── styles.css          # Cyberpunk-themed styling
├── script.js           # Menu and UI logic
├── engine.js           # Custom game engine (rendering, input, audio)
├── game.js             # Game logic, AI, and entities
├── assets/             # Audio and media files
│   ├── music.wav       # Background music
│   └── AUDIO_README.md # Audio implementation notes
├── lib/                # Third-party libraries
│   └── easystar.js     # A* pathfinding library
└── README.md           # This file
```

## 🛠️ Technical Details

### Technologies
- **Vanilla JavaScript** - No frameworks, pure ES6+
- **HTML5 Canvas** - Hardware-accelerated 2D rendering
- **Web Audio API** - Procedural sound generation
- **CSS3 Animations** - UI effects and transitions
- **LocalStorage** - Save game and high score persistence

### Architecture
- **Custom Game Engine** (`engine.js`)
  - `AG.Renderer` - Canvas rendering system
  - `AG.Input` - Keyboard and mouse handling
  - `AG.SFX` - Procedural audio engine
  - `AG.Audio` - Music playback manager

- **Game Systems** (`game.js`)
  - `Assassin` - Player character with pathfinding
  - `Robot` - AI enemies with state machines
  - `Maze` - Procedural level generation
  - `Particle Systems` - Visual effects

### Performance
- ⚡ **60 FPS** target with delta-time updates
- 🎨 **Hardware acceleration** via CSS transforms
- 💾 **Lightweight** - No external dependencies (except pathfinding)
- 📱 **Responsive** - Adapts to different screen sizes

## 🎨 Customization

### Color Palette
Edit CSS variables in `styles.css`:
```css
:root {
    --bg-dark: #050505;        /* Deep space black */
    --cyber-cyan: #00FFCC;     /* Neon cyan */
    --alert-pink: #FF0055;     /* Hot pink */
    --amber: #FFB800;          /* Warning amber */
}
```

### Difficulty Settings
Modify game parameters in `game.js`:
```javascript
// Adjust robot count per level
const robotCount = 2 + Math.floor(level * 1.5);

// Change player speed
this.maxSpeed = 120; // pixels per second

// Modify detection range
this.visionRange = 150; // pixels
```

### Audio Configuration
Customize sound effects in `engine.js`:
```javascript
AG.SFX = {
    playFootstep() { /* Modify frequency and duration */ },
    playDash() { /* Adjust sound characteristics */ },
    playAlert() { /* Change alert sound */ }
};
```

## 🔮 Roadmap

### Planned Features
- [ ] **Power-ups** - Temporary invisibility, speed boost, EMP blast
- [ ] **Multiple Levels** - Unique maze layouts and themes
- [ ] **Boss Encounters** - Special robot types with unique behaviors
- [ ] **Achievements** - Unlock rewards for completing challenges
- [ ] **Leaderboards** - Online high score tracking
- [ ] **Mobile Support** - Touch controls and responsive UI
- [ ] **Level Editor** - Create and share custom levels

### Known Issues
- Audio autoplay may be blocked by browsers (click to enable)
- Mobile touch controls not yet implemented
- Save system uses localStorage (not cross-device)

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Development Guidelines
- Follow existing code style (ES6+, 4-space indentation)
- Test on multiple browsers before submitting
- Update documentation for new features
- Keep performance in mind (60 FPS target)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **EasyStar.js** - A* pathfinding library
- **Google Fonts** - Roboto Mono typeface
- **Web Audio API** - Procedural sound generation
- **Antigravity Principles** - High-performance rendering techniques

## 📧 Contact

**BinaryxBeast** - [@BinaryxBeast](https://github.com/BinaryxBeast)

Project Link: [https://github.com/BinaryxBeast/Last-Protocol](https://github.com/BinaryxBeast/Last-Protocol)

---

<div align="center">

**⚡ Built with passion for cyberpunk aesthetics and stealth gameplay ⚡**

*SYSTEM STATUS: ONLINE • SECURITY: COMPROMISED • PROTOCOL: ACTIVE*

</div>

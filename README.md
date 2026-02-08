# LAST PROTOCOL - Command Interface

## 🎮 Overview
**Last Protocol** is a cyber-themed game with a terminal/command aesthetic. This is Step 1: The main menu "Command Interface" that sets the atmospheric tone for a world where humanity is on the brink.

## 🎨 Visual Design

### Color Palette
- **Background**: `#050505` - Deep space black
- **Primary UI**: `#00FFCC` - Cyber neon cyan
- **Alert/Hover**: `#FF0055` - Hot pink
- **Secondary**: `#FFB800` - Amber

### Aesthetic Features
- ✨ **Scanline Effect**: CRT monitor simulation
- 🌊 **Noise Overlay**: Static-filled background
- ⚡ **Glitch Effects**: Title with RGB split animation
- 💫 **Neon Glow**: Text shadows and box shadows
- 🔥 **Flicker Animation**: Periodic title flicker
- 🎯 **Hover States**: Dynamic button interactions

## 🚀 Features Implemented

### 1. Boot Sequence
- Scrolling terminal-style initialization messages
- System override narrative
- Automatic transition to main menu

### 2. Main Menu
- **INITIATE MISSION** - Start the game
- **ARCHIVED DATA (SCORES)** - View high scores
- **SYSTEM CONFIGURATION** - Settings panel
- **TERMINATE SESSION** - Exit

### 3. Interactive Elements
- Hover effects with color changes
- Sound effects on interaction (when audio files are added)
- Keyboard navigation (Arrow keys + Enter)
- Real-time system clock

### 4. Status Bar
- Online status indicator
- Security status (compromised)
- Live system time

## 📁 Project Structure

```
Last Protocol/
├── index.html          # Main HTML structure
├── styles.css          # Cyber-themed styling
├── script.js           # Interactive functionality
├── assets/             # Audio and media files
│   ├── ambient.mp3     # Background ambient loop
│   ├── click.mp3       # Button hover sound
│   └── select.mp3      # Button click sound
└── README.md           # This file
```

## 🔊 Audio Requirements

To complete the atmospheric experience, add these audio files to the `assets/` folder:

1. **ambient.mp3** - Low hum ambient loop (dark, mechanical)
2. **click.mp3** - Mechanical click for button hover
3. **select.mp3** - Confirmation sound for button selection

### Recommended Sources for Audio:
- [Freesound.org](https://freesound.org/) - Search for "sci-fi ambient", "mechanical click"
- [Zapsplat.com](https://www.zapsplat.com/) - Free sound effects
- Generate with AI: Use tools like ElevenLabs or similar

## 🎯 How to Run

1. **Open the project**:
   ```bash
   cd "/home/binaryxbeast/Documents/Last Protocol"
   ```

2. **Start a local server**:
   ```bash
   # Using Python 3
   python3 -m http.server 8000
   
   # OR using Node.js
   npx serve
   ```

3. **Open in browser**:
   Navigate to `http://localhost:8000`

## ⌨️ Controls

- **Mouse**: Click menu buttons
- **Keyboard**: 
  - `↑/↓` Arrow keys to navigate
  - `Enter` to select
  - Works on focused buttons

## 🎨 Customization

### Adjust Colors
Edit CSS variables in `styles.css`:
```css
:root {
    --bg-dark: #050505;
    --cyber-cyan: #00FFCC;
    --alert-pink: #FF0055;
    --amber: #FFB800;
}
```

### Modify Boot Sequence
Edit the `bootMessages` array in `script.js`:
```javascript
const bootMessages = [
    "YOUR CUSTOM MESSAGE...",
    // Add more lines
];
```

### Change Animation Speed
Adjust timing in `script.js`:
```javascript
}, 150); // Boot text speed (milliseconds)
```

## 📱 Responsive Design

The interface adapts to different screen sizes:
- Desktop: Full experience with large title
- Mobile: Optimized layout with smaller fonts
- Status bar adjusts to vertical layout on small screens

## 🔮 Next Steps (Future Implementation)

### Step 2: Game Scene
- Pathfinding/maze mechanics
- Player character implementation
- Enemy AI (robots)

### Step 3: Enhanced Features
- High score persistence (localStorage)
- Settings panel (volume, difficulty)
- Multiple game modes
- Achievements system

## 🛠️ Technical Details

### Technologies Used
- **HTML5** - Structure
- **CSS3** - Styling with animations
- **Vanilla JavaScript** - No frameworks
- **Google Fonts** - Roboto Mono

### Browser Compatibility
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Responsive

### Performance
- Lightweight: No external dependencies
- CSS animations: Hardware accelerated
- Optimized for 60fps

## 📝 Notes

- Audio autoplay may be blocked by browsers - click anywhere to enable
- The game scene (Step 2) is not yet implemented
- Placeholder alerts show for incomplete features

## 🎮 The Story

> In a world where robots have taken control, humanity's last hope lies in Protocol 00. You are the commander tasked with infiltrating the robot security mainframe and executing the final mission. The interface you see is your command terminal - compromised, glitching, but operational. Time is running out. Will you initiate the mission?

---

**Status**: ✅ Step 1 Complete - Command Interface Ready
**Next**: Step 2 - Game Implementation

*Built with Antigravity principles - High-performance rendering for terminal aesthetics*

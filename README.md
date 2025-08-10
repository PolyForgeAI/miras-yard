# 🌻 Mira's Yard - Digital Garden Game

**Version:** 3.0.0  
**Last Updated:** 2025-08-10  
**Target User:** 2-year-old toddlers  
**Platform:** Modern web browsers with Canvas 2D and Web Audio API support

---

## 📖 Overview

Mira's Yard is a safe, educational, and entertaining digital gardening experience designed specifically for toddlers. Features simple drag-and-drop interactions with immediate visual feedback to teach basic gardening concepts through play.

### 🎯 Key Features

- **13 Interactive Tools** organized into logical groups (CREATE, REMOVE, UTILITY)
- **Musical Paint System** with color-coded notes and octaves
- **Particle Effects** for water, grass clippings, and starbursts
- **Animated Plant Growth** with realistic 2x-3.25x scaling
- **Voice Praise System** with intelligent rate limiting
- **Touch/Mouse Dual Support** for tablets and desktops
- **Complete Self-Containment** - no external links or data collection

---

## 🚀 Quick Start

1. **Open `index.html`** in any modern web browser
2. **Tap the splash screen** or wait 5 seconds to begin
3. **Select a tool** from the toolbar
4. **Start gardening!** Drag and tap to interact with the garden

### 🎮 Tool Groups

#### CREATE Tools (Green Border)
- 💧 **Water** - Add water effects to grow grass
- 🌸 **Flower** - Plant colorful flowers
- 🥕 **Vegetable** - Grow carrots, tomatoes, corn
- 🦋 **Butterfly** - Add flying butterflies and fairies
- ⭐ **Stars** - Place magical shapes and elements
- 🌈 **Rainbow** - Paint flowing rainbow strokes
- 🎨 **Paint** - Musical color painting with notes

#### REMOVE Tools (Red Border)
- 🚜 **Mower** - Cut grass and plants
- ✂️🌺 **Pick Flowers** - Harvest individual flowers
- 👐🥕 **Pick Vegetables** - Harvest vegetables
- 🎾🦋 **Butterfly Net** - Catch flying creatures
- 🧹 **Broom** - Clear paint and art

#### UTILITY Tools (Blue Border)
- 🔄 **Reset** - Start with a fresh garden

---

## 📁 Project Structure

```
miras_yard/
├── index.html              # Main game interface (OPEN THIS FILE)
├── assets/
│   ├── scripts/
│   │   └── game.js         # Complete game engine (~1400 lines)
│   └── images/
│       ├── miras-yard-splash.png    # Custom splash screen
│       └── lawnmower.jpg            # Mower tool icon
├── docs/                   # Project documentation
│   ├── CLAUDE.md          # AI assistant instructions
│   ├── PRD.md             # Product requirements document
│   └── TESTING_CHECKLIST.md        # QA testing guide
├── archive/                # Old development files
└── README.md              # This file
```

---

## 🛠️ Technical Details

### Browser Support
- **Chrome 90+**, **Safari 14+**, **Firefox 88+**, **Edge 90+**
- **iOS Safari 14+**, **Android Chrome 90+**
- **Minimum Resolution:** 1024x768 (iPad standard)

### Performance Targets
- **Load Time:** Under 3 seconds
- **Frame Rate:** 60fps on modern devices
- **Memory Usage:** Under 50MB for extended play
- **Touch Response:** Under 100ms for immediate feedback

### Technology Stack
- **HTML5 Canvas 2D API** for all rendering
- **Web Audio API** for procedural sound generation
- **Speech Synthesis API** for voice encouragement
- **Vanilla JavaScript** - no external dependencies
- **Self-contained** - works offline after initial load

---

## 🎨 Game Mechanics

### Growing System
- Plants start at 50-60% size and grow to 200-325% over 2-5 seconds
- Different growth rates for flowers vs. vegetables
- Smooth scaling animation for visual appeal

### Audio System
- **Musical Paint:** 8 colors mapped to musical notes (C-B scale + synth)
- **Brush Sizes:** 4 sizes with corresponding octaves (smaller = higher)
- **Sound Effects:** Procedurally generated for all actions
- **Voice Praise:** Encouraging phrases with 8-second rate limiting

### Special Features
- **Lux the Dog:** Special character that visits periodically
- **Grass Regrowth:** Mowed areas slowly grow back when watered
- **Flying Creatures:** Butterflies and fairies that move naturally
- **Particle Effects:** Water droplets, grass clippings, starbursts

---

## 👶 Safety Features

### Child-Safe Design
- **No external links** or navigation away from game
- **No data collection** or personal information storage
- **No failure states** - everything is positive and encouraging
- **No ads** or in-app purchases
- **Complete offline functionality** after initial load

### Parental Controls
- **Settings hidden** behind developer console
- **Volume controlled** at child-friendly levels
- **Session-based** - no permanent data storage
- **Rate-limited feedback** to prevent annoyance

---

## 📱 Mobile/Tablet Optimization

### Touch-First Design
- **Large touch targets** (minimum 48px) for little fingers
- **Visual feedback** for all interactions
- **Prevent zoom/scroll** during gameplay
- **Responsive layout** that adapts to screen size

### iOS/Android Support
- **Viewport optimizations** for mobile browsers
- **Touch event handling** with proper preventDefault
- **Audio context** activation on user interaction
- **Home screen** web app capabilities

---

## 🧪 Development

### File Organization
- **Single-file architecture** for game logic simplicity
- **Inline CSS** in HTML for portability
- **Comprehensive commenting** throughout all files
- **Version headers** on all major files

### Code Quality
- **Error handling** with graceful degradation
- **Console logging** for debugging and monitoring  
- **Performance monitoring** with frame rate tracking
- **Memory management** with object pooling for particles

---

## 📋 Version History

### v3.0.0 (2025-08-10) - CURRENT
- ✅ Complete file reorganization and cleanup
- ✅ Comprehensive code documentation
- ✅ Fixed reset button functionality
- ✅ Optimized voice feedback rate limiting
- ✅ Improved plant growth scaling
- ✅ Enhanced tool icon clarity

### v2.x (2025-08-08)
- ✅ Added musical paint system
- ✅ Implemented all 13 tools
- ✅ Added Lux the special dog character
- ✅ Created particle effects system
- ✅ Optimized for iPad and touch devices

### v1.x (2025-08-07)
- ✅ Initial game engine and basic tools
- ✅ Canvas 2D rendering system
- ✅ Touch/mouse input handling
- ✅ Custom splash screen

---

## 👨‍💻 For Developers

### Getting Started
1. All game logic is in `assets/scripts/game.js`
2. UI and styles are in `index.html`
3. Documentation is in `docs/` folder
4. No build process required - open `index.html` directly

### Key Classes
- **SimpleGarden** - Main game class containing all logic
- **Event handling** - Unified mouse/touch system
- **Rendering pipeline** - Canvas 2D with multiple layers
- **Audio generation** - Web Audio API for all sounds

### Architecture Notes
- **Single-threaded** with `requestAnimationFrame` game loop
- **Object pooling** for particle effects performance
- **State management** through class properties
- **Error boundaries** with try/catch in critical paths

---

## 🎮 Made with ❤️ for Mira

This game was lovingly crafted by Mira's grandfather as a safe, educational, and fun digital experience. Every detail has been carefully considered for a 2-year-old's needs and capabilities.

**Enjoy gardening, Mira!** 🌻🦋🌈

---

*For technical support or questions, please refer to the documentation in the `docs/` folder.*
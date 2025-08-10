# CLAUDE.md
## Version 1.2.0 - Updated: 2025-08-10 11:30 PST

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Mira's Yard** is a toddler-friendly digital gardening game designed for 2-year-olds. The web-based application focuses on simple drag-and-drop interactions with immediate visual feedback, teaching basic gardening concepts through play.

**Key Design Constraints:**
- Target user is 2 years old with 5-10 minute attention span
- No failure states - everything is positive and encouraging
- Touch-first design optimized for tablets
- No ads, external links, or in-app purchases
- Completely self-contained and safe

## Architecture Overview

The application follows the technical architecture outlined in PRD.md:

### Implemented Technology Stack
- **Frontend:** Vanilla JavaScript (no framework - optimized for simplicity)
- **Graphics Rendering:** HTML5 Canvas 2D API (1000x600px) 
- **State Management:** In-memory JavaScript objects (no persistence needed)
- **Build Tool:** None - single file architecture for maximum compatibility
- **Platform:** Web browsers (Chrome, Safari, Firefox, Edge) + mobile web
- **Deployment:** Static files (Netlify, GitHub Pages, any web server)

### Actual Code Structure (Post v3.0.0 Reorganization)
```
miras-yard/
├── index.html                          # Complete UI with embedded CSS
├── assets/
│   ├── scripts/
│   │   └── game.js                     # SimpleGarden class (~1500 lines)
│   └── images/
│       ├── miras-yard-splash.png       # Custom splash screen 
│       └── lawnmower.jpg               # Realistic mower toolbar icon
├── docs/
│   ├── CLAUDE.md                       # This file - AI instructions
│   ├── PRD.md                          # Complete requirements document
│   └── TESTING_CHECKLIST.md            # QA validation checklist
├── archive/                            # Historical versions for reference
│   ├── miras_yard - standard js/       # Known working implementation
│   └── simple-game-*.js                # Evolution of game versions
└── README.md                           # Project setup and overview
```

## Core Game Mechanics

### Tools and Interactions
1. **Watering Hose:** Drag to water areas, grass becomes greener
2. **Vegetable Seeds:** Drag to plant carrots, tomatoes, corn with growth states
3. **Flower Seeds:** Drag to plant sunflowers, roses, daisies with instant bloom
4. **Mower:** Drag across tall grass to create visible cut paths
5. **Harvest:** Tap ripe vegetables → harvest bowl, tap flowers → decorative vase

### Visual Scoring System
- **Star Seeds:** Visual progress indicators instead of numbers
- **Happy Meter:** Smiling sun that fills up and triggers celebrations
- **Garden Gallery:** Screenshot memories with sticker rewards

## Performance Requirements

- **Load time:** Under 3 seconds
- **Frame rate:** Consistent 30+ FPS
- **File size:** Under 10MB total
- **Minimum screen:** 1024x768 (iPad standard)
- **Touch responsiveness:** Single finger/pointer interactions

## Visual Design Guidelines

### Critical Color Palette (Exact Implementation)
⚠️ **IMPORTANT**: Use these EXACT hex values for grass system to work:
- **Background Grass**: `#4A7C2A` (dark green canvas background)
- **Cut Grass Areas**: `#8BC34A` (light green mowed circles - NOT #7CB342!)
- **Grass Blades**: `#3D5C1A` to `#69974A` (individual blade variations)  
- **Regrowth Transition**: RGB interpolation from (139,195,74) to (74,124,42)
- Sky Blue: `#87CEEB`, Water: `#4A9EFF`, Starburst: `#FFD700`

### Animation Timing
- Tool feedback: Instant (0-100ms)
- Plant growth: Quick (500ms)
- Mowing trail: Real-time following
- Harvest pop: Bouncy (300ms)
- Celebration: Extended (2-3 seconds)

## Recent Updates (v1.2.0 - August 2025)

### Major Project Reorganization (v3.0.0)
- **File Structure**: Moved to best-in-class organization (assets/, docs/, archive/)
- **Documentation**: Added comprehensive PRD.md and updated CLAUDE.md
- **Version Control**: Moved historical files to archive/ folder  
- **README**: Created detailed project setup and overview guide

### Critical Bug Fixes (August 2025)
- **Watering System**: Fixed color flickering by using exact working colors from archive
- **Grass Regrowth**: Implemented density-controlled blade regeneration (50% progress start)
- **Toolbar Clicks**: Fixed requiring multiple attempts with dual click/touchstart events
- **Splash Screen**: Resolved syntax errors preventing game startup
- **Netlify Deploy**: Fixed git submodule issues for successful automated deployment

### Technical Improvements (v1.2.0)
- **Event Handling**: Proper preventDefault/stopPropagation for reliable interactions
- **Audio System**: Musical color painting with note frequencies (C-B scale)
- **Particle Effects**: Unified system for water, grass clippings, and starbursts  
- **Performance**: Stable 60fps with efficient grass blade culling
- **Mobile Support**: Touch-first design with 40px minimum touch targets

## Development Phases

### Phase 1: MVP ✅ COMPLETED
- Basic garden grid system ✅
- Three core tools (water, plant vegetables, plant flowers) ✅
- Mowing functionality with visible paths ✅
- Simple harvest to bowl/vase ✅
- Custom splash screen ✅
- Dual mouse/touch support ✅

### Phase 2: Enhanced Features ✅ COMPLETED  
- Butterflies and fairies with flight patterns ✅
- Stars and magical shapes (fire, ice, diamond, sun, moon) ✅
- Rainbow painting tool with color cycling ✅
- Musical color painting with note system ✅
- Butterfly net for catching creatures ✅
- Sound effects for all actions ✅
- Flying effects when harvesting items ✅

### Phase 3: Production Release ✅ COMPLETED (v3.0.0)
- **Project reorganization** into professional structure ✅
- **Comprehensive documentation** for AI recreation ✅
- **All major bug fixes** implemented and tested ✅
- **Deployment pipeline** working (Netlify integration) ✅
- **Performance optimization** for tablets and mobile ✅
- **Accessibility** improvements for 2-year-old target user ✅

## Safety Requirements

All code must maintain:
- Complete self-containment (no external links)
- Zero data collection
- No social features or multiplayer
- Settings hidden behind 5-second long-press
- Parental controls for sound and reset

## Testing Considerations

- Test with actual 2-year-old (Mira) for usability
- Cross-browser compatibility testing
- Touch responsiveness on tablets
- Performance on older devices
- Session length tracking (target 5-10 minutes)

---

## 🤖 AI RECREATION GUIDE

### Critical Implementation Requirements

⚠️ **MOST COMMON ERRORS TO AVOID:**

1. **Wrong Grass Colors**: Must use `#8BC34A` for cut areas, NOT `#7CB342`
2. **Event Handler Issues**: Always use both `click` and `touchstart` with `preventDefault()`
3. **Grass Density Problems**: Implement density checking before adding blades during regrowth
4. **Submodule Deployment**: Never use git submodules - causes Netlify deployment failures

### Core Data Structures (Required)
```javascript
class SimpleGarden {
    constructor() {
        // CRITICAL: Use these exact variable names
        this.cutAreas = [];      // Light green mowed circles  
        this.growingAreas = [];  // Areas regrowing back to dark
        this.grassBlades = [];   // Individual grass sprites
        this.plants = [];        // Vegetables and flowers
        this.butterflies = [];   // Flying creatures
        this.paintStrokes = [];  // Color paint strokes  
        this.rainbowStrokes = []; // Rainbow paint strokes
    }
}
```

### Essential Algorithms

**Watering System (Most Complex Part):**
```javascript
waterArea(x, y) {
    // 1. Find overlapping cut areas
    this.cutAreas.forEach(cutArea => {
        const distance = Math.sqrt((cutArea.x - x) ** 2 + (cutArea.y - y) ** 2);
        if (distance < cutArea.size / 2) {
            // 2. Convert to growing area
            this.growingAreas.push({
                x: cutArea.x, y: cutArea.y, size: cutArea.size,
                progress: 0, maxProgress: 300  // 5 seconds at 60fps
            });
        }
    });
    
    // 3. Remove converted cut areas
    this.cutAreas = this.cutAreas.filter(/* not overlapping */);
}

// In update loop:
this.growingAreas.forEach(growing => {
    growing.progress++;
    
    // Color interpolation (CRITICAL - use RGB, not hex)
    const progress = growing.progress / growing.maxProgress;
    const lightR = 139, lightG = 195, lightB = 74; // #8BC34A
    const darkR = 74, darkG = 124, darkB = 42;     // #4A7C2A
    
    const r = Math.floor(lightR + (darkR - lightR) * progress);
    const g = Math.floor(lightG + (darkG - lightG) * progress);
    const b = Math.floor(lightB + (darkB - lightB) * progress);
    
    // Density-controlled blade regeneration
    if (progress > 0.5 && Math.random() < 0.02) {
        // Check existing density first!
        const existing = this.grassBlades.filter(blade => 
            Math.sqrt((blade.x - growing.x)**2 + (blade.y - growing.y)**2) < growing.size/2
        ).length;
        
        const expected = Math.floor((Math.PI * (growing.size/2)**2) / (15*12) * 0.8);
        
        if (existing < expected * progress) {
            // Add single blade
            this.grassBlades.push({...});
        }
    }
});
```

**Event Handling Pattern (Required for Reliability):**
```javascript
// ALWAYS use this pattern for UI interactions
const handleToolClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // ... your logic here
};

element.addEventListener('click', handleToolClick);
element.addEventListener('touchstart', handleToolClick);
```

### File Structure Requirements
```
miras-yard/
├── index.html              # MUST have embedded CSS (no external stylesheets)
├── assets/
│   ├── scripts/game.js     # Single SimpleGarden class
│   └── images/
│       ├── miras-yard-splash.png
│       └── lawnmower.jpg
└── [documentation files]
```

### Canvas Setup (Required Specifications)
```javascript
this.canvas.width = 1000;   // EXACT dimensions needed
this.canvas.height = 600;
this.ctx = canvas.getContext('2d');

// Background MUST be this color
canvas.style.background = '#4A7C2A';
```

### Musical Paint Implementation
```javascript
const noteFrequencies = {
    'C': 261.63, 'D': 293.66, 'E': 329.63, 'F': 349.23,
    'G': 392.00, 'A': 440.00, 'B': 493.88
};

playSound(note) {
    if (!this.audioContext) return;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.setValueAtTime(noteFrequencies[note], this.audioContext.currentTime);
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.3);
}
```

### Reference Implementation
- **Working Version**: `archive/miras_yard - standard js/game.js` 
- **Current Version**: `assets/scripts/game.js`
- **Use archive version** if current implementation breaks

### Deployment Notes
- Static files only (no build process)
- Works on any web server (Netlify, GitHub Pages, etc.)  
- No external dependencies or CDNs
- NEVER use git submodules (breaks deployment)
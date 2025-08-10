# AI Implementation Guide: Recreating Mira's Yard
## Complete Step-by-Step Guide for Future AI Development
### Version 1.0.0 - Created: 2025-08-10

---

## 🎯 Quick Start for AI Assistants

This guide provides everything needed to recreate Mira's Yard from scratch or fix existing implementations. Follow the steps sequentially for best results.

### Project Overview
- **Target User**: 2-year-old toddlers (5-10 minute attention span)
- **Technology**: Vanilla JavaScript + HTML5 Canvas (no frameworks)
- **Complexity**: ~1500 lines of code in single class
- **Deployment**: Static files (works on any web server)

---

## 📁 STEP 1: File Structure Setup

Create this EXACT folder structure:

```
miras-yard/
├── index.html                          # Complete UI with embedded CSS
├── assets/
│   ├── scripts/
│   │   └── game.js                     # Main SimpleGarden class
│   └── images/
│       ├── miras-yard-splash.png       # Splash screen image
│       └── lawnmower.jpg               # Toolbar mower icon  
├── docs/
│   ├── CLAUDE.md                       # AI instructions
│   ├── PRD.md                          # Requirements document
│   └── TESTING_CHECKLIST.md            # QA checklist
└── README.md                           # Project overview
```

**Critical Notes:**
- CSS MUST be embedded in index.html (no external stylesheets)
- Only 2 images required for full functionality
- No build tools or external dependencies needed

---

## 🎨 STEP 2: HTML Structure (index.html)

### Essential HTML Elements:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Mira's Yard - Digital Garden</title>
    <!-- EMBED ALL CSS HERE - NO EXTERNAL STYLESHEETS -->
</head>
<body>
    <!-- Splash Screen -->
    <div class="splash-screen" id="splash-screen">
        <img src="assets/images/miras-yard-splash.png" alt="Tap to Start" class="splash-image">
    </div>
    
    <!-- Main Game -->
    <div class="game-container" id="game-container">
        <div class="game-area">
            <canvas id="garden-canvas" width="1000" height="600"></canvas>
            
            <!-- Paint Controls (hidden by default) -->
            <div class="paint-controls" id="paint-controls">
                <!-- 8 color options with musical notes -->
                <div class="color-option selected" data-color="#FF0000" data-note="C">🎵</div>
                <!-- ... more colors ... -->
                
                <!-- 4 brush sizes -->
                <div class="brush-circle selected" data-size="20" data-octave="3"></div>
                <!-- ... more sizes ... -->
            </div>
            
            <!-- Toolbar -->
            <div class="toolbar">
                <!-- CREATE TOOLS -->
                <div class="tool-group create-group">
                    <div class="group-tools">
                        <button class="tool active" data-tool="water">💧</button>
                        <button class="tool" data-tool="flower">🌸</button>
                        <button class="tool" data-tool="vegetable">🥕</button>
                        <button class="tool" data-tool="butterfly">🦋</button>
                        <button class="tool" data-tool="shapes">⭐</button>
                        <button class="tool" data-tool="rainbow">🌈</button>
                        <button class="tool" data-tool="paint">🎨</button>
                    </div>
                </div>
                
                <!-- REMOVE TOOLS -->
                <div class="tool-group remove-group">
                    <div class="group-tools">
                        <button class="tool" data-tool="mower">🏠</button> <!-- Use image background -->
                        <button class="tool" data-tool="pick-flower">✂️🌺</button>
                        <button class="tool" data-tool="pick-vegetable">👐🥕</button>
                        <button class="tool" data-tool="butterfly-net">🎾🦋</button>
                        <button class="tool" data-tool="broom">🧹</button>
                    </div>
                </div>
                
                <!-- UTILITY TOOLS -->
                <div class="tool-group newscreen-group">
                    <div class="group-tools">
                        <button class="tool" data-tool="reset">🔄</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script src="assets/scripts/game.js"></script>
</body>
</html>
```

### Critical CSS Requirements (Embedded in <style> tag):

**Essential Styles:**
- `touch-action: none` on body and canvas
- `user-select: none` to prevent text selection
- Splash screen with `z-index: 9999`
- Canvas border: `6px solid #E8B4E3` with rounded corners
- Toolbar with grouped tools and color-coded borders
- Paint controls that show/hide based on tool selection

---

## 🎮 STEP 3: Core JavaScript Class Structure

### SimpleGarden Class Foundation:
```javascript
class SimpleGarden {
    constructor() {
        // Canvas setup
        this.canvas = document.getElementById('garden-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 1000;  // EXACT dimensions required
        this.canvas.height = 600;
        
        // Game state
        this.currentTool = 'water';
        this.isDrawing = false;
        
        // CRITICAL: Use these exact variable names for grass system
        this.cutAreas = [];        // Light green mowed circles
        this.growingAreas = [];    // Areas transitioning back to dark
        this.grassBlades = [];     // Individual grass blade sprites
        this.mowerWidth = 80;      // Mower cutting width
        
        // Game objects
        this.plants = [];          // Vegetables and flowers
        this.butterflies = [];     // Flying creatures  
        this.paintStrokes = [];    // Color paint strokes
        this.rainbowStrokes = [];  // Rainbow paint strokes
        this.wateredAreas = [];    // Water droplet effects
        this.grassClippings = [];  // Particle effects
        
        // Paint system
        this.paintColor = '#FF0000';
        this.paintNote = 'C';
        this.brushSize = 20;       // Default largest brush
        this.paintOctave = 3;
        
        // Audio
        this.audioContext = null;
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Audio not available');
        }
        
        this.init();
    }
    
    init() {
        this.createGrass();
        this.setupEvents();
        this.setupPaintControls();
        this.gameLoop();
    }
}
```

---

## 🌱 STEP 4: Critical Grass System Implementation

### The Most Complex Part - Get This Right:

**Grass Creation:**
```javascript
createGrass() {
    for (let x = 10; x < 990; x += 15) {      // Grid spacing: 15px horizontal
        for (let y = 10; y < 590; y += 12) {   // Grid spacing: 12px vertical
            if (Math.random() < 0.8) {         // 80% coverage
                this.grassBlades.push({
                    x: x + (Math.random() - 0.5) * 10,  // Random offset
                    y: y + (Math.random() - 0.5) * 8,
                    height: 18 + Math.random() * 28,    // 18-46px tall
                    swayPhase: Math.random() * Math.PI * 2,
                    swaySpeed: 0.008 + Math.random() * 0.015,
                    swayAmount: 2 + Math.random() * 4
                });
            }
        }
    }
}
```

**Mowing (Creates Cut Areas):**
```javascript
mowArea(x, y) {
    // 1. Create cut area (light green circle)
    this.cutAreas.push({
        x: x, y: y, size: this.mowerWidth
    });
    
    // 2. Remove grass blades in mowed area
    this.grassBlades = this.grassBlades.filter(blade => {
        const distance = Math.sqrt((blade.x - x) ** 2 + (blade.y - y) ** 2);
        return distance >= this.mowerWidth / 2;
    });
    
    // 3. Create grass clipping particles
    for (let i = 0; i < 15; i++) {
        this.grassClippings.push({
            x: x + (Math.random() - 0.5) * this.mowerWidth,
            y: y + (Math.random() - 0.5) * this.mowerWidth,
            vx: (Math.random() - 0.5) * 8,  // Random velocity
            vy: -Math.random() * 4 - 2,     // Upward initial velocity
            life: 60 + Math.random() * 40,
            maxLife: 100,
            size: 2 + Math.random() * 3
        });
    }
}
```

**Watering (Most Complex - Converts Cut Areas to Growing Areas):**
```javascript
waterArea(x, y) {
    // 1. Find overlapping cut areas
    this.cutAreas.forEach(cutArea => {
        const distance = Math.sqrt((cutArea.x - x) ** 2 + (cutArea.y - y) ** 2);
        if (distance < cutArea.size / 2) {
            // Check if already growing
            const alreadyGrowing = this.growingAreas.some(growing => 
                Math.sqrt((growing.x - cutArea.x) ** 2 + (growing.y - cutArea.y) ** 2) < 10
            );
            
            if (!alreadyGrowing) {
                // 2. Convert to growing area
                this.growingAreas.push({
                    x: cutArea.x,
                    y: cutArea.y, 
                    size: cutArea.size,
                    progress: 0,
                    maxProgress: 300  // 5 seconds at 60fps
                });
            }
        }
    });
    
    // 3. Create water droplet particles
    for (let i = 0; i < 8; i++) {
        this.grassClippings.push({
            x: x + (Math.random() - 0.5) * 30,
            y: y + (Math.random() - 0.5) * 30,
            vx: (Math.random() - 0.5) * 3,
            vy: Math.random() * 2 + 1,    // Gravity-affected
            life: 20 + Math.random() * 10,
            maxLife: 30,
            size: 1 + Math.random() * 2,
            isWater: true  // Blue color
        });
    }
}
```

**Growing Area Update (In Game Loop):**
```javascript
// Update growing areas - CRITICAL COLOR IMPLEMENTATION
this.growingAreas.forEach(growing => {
    growing.progress++;
    
    // Density-controlled blade regeneration
    const progress = growing.progress / growing.maxProgress;
    if (progress > 0.5 && Math.random() < 0.02) {  // Start at 50%, 2% chance per frame
        
        // COUNT EXISTING BLADES TO PREVENT OVER-POPULATION
        const existingBlades = this.grassBlades.filter(blade => {
            const distance = Math.sqrt((blade.x - growing.x) ** 2 + (blade.y - growing.y) ** 2);
            return distance < growing.size / 2;
        }).length;
        
        // Calculate expected density based on original pattern
        const areaPixels = Math.PI * (growing.size / 2) * (growing.size / 2);
        const gridSpacing = 15 * 12;  // From createGrass
        const expectedBlades = Math.floor((areaPixels / gridSpacing) * 0.8);
        
        // Only add if below expected density
        if (existingBlades < expectedBlades * progress) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * (growing.size / 2);
            this.grassBlades.push({
                x: growing.x + Math.cos(angle) * dist,
                y: growing.y + Math.sin(angle) * dist,
                height: 12 + Math.random() * 20,  // Grow back to normal size
                swayPhase: Math.random() * Math.PI * 2,
                swaySpeed: 0.008 + Math.random() * 0.015,
                swayAmount: 2 + Math.random() * 4
            });
        }
    }
    
    // Remove when fully grown
    if (growing.progress >= growing.maxProgress) {
        // Remove corresponding cut area
        this.cutAreas = this.cutAreas.filter(cut => 
            Math.sqrt((cut.x - growing.x) ** 2 + (cut.y - growing.y) ** 2) >= 10
        );
    }
});

// Remove completed growing areas
this.growingAreas = this.growingAreas.filter(growing => growing.progress < growing.maxProgress);
```

---

## 🎨 STEP 5: Rendering System

### Draw Order (Critical for Visual Layering):
```javascript
draw() {
    // 1. Clear canvas with grass background color
    this.ctx.fillStyle = '#4A7C2A';  // EXACT color required
    this.ctx.fillRect(0, 0, 1000, 600);
    
    // 2. Draw cut areas (light green circles)
    this.cutAreas.forEach(cut => {
        this.ctx.fillStyle = '#8BC34A';  // CRITICAL: NOT #7CB342!
        this.ctx.beginPath();
        this.ctx.arc(cut.x, cut.y, cut.size / 2, 0, 2 * Math.PI);
        this.ctx.fill();
    });
    
    // 3. Draw growing areas (color interpolation)
    this.growingAreas.forEach(growing => {
        const progress = growing.progress / growing.maxProgress;
        
        // RGB interpolation - NEVER use hex math
        const lightR = 139, lightG = 195, lightB = 74;  // #8BC34A
        const darkR = 74, darkG = 124, darkB = 42;      // #4A7C2A
        
        const r = Math.floor(lightR + (darkR - lightR) * progress);
        const g = Math.floor(lightG + (darkG - lightG) * progress);
        const b = Math.floor(lightB + (darkB - lightB) * progress);
        
        this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        this.ctx.beginPath();
        this.ctx.arc(growing.x, growing.y, growing.size / 2, 0, 2 * Math.PI);
        this.ctx.fill();
    });
    
    // 4. Draw paint strokes
    this.drawPaintStrokes();
    this.drawRainbowStrokes();
    
    // 5. Draw grass blades
    this.drawGrassBlades();
    
    // 6. Draw game objects
    this.drawPlants();
    this.drawButterflies();
    
    // 7. Draw particle effects (on top)
    this.drawParticleEffects();
}
```

**Grass Blade Rendering with Sway Animation:**
```javascript
drawGrassBlades() {
    this.grassBlades.forEach(blade => {
        const swayOffset = Math.sin(this.frameCount * blade.swaySpeed + blade.swayPhase) * blade.swayAmount;
        
        this.ctx.strokeStyle = '#3D5C1A';  // Dark green
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(blade.x, blade.y);
        this.ctx.lineTo(blade.x + swayOffset, blade.y - blade.height);
        this.ctx.stroke();
    });
}
```

---

## 🎵 STEP 6: Audio System Implementation

### Musical Paint System:
```javascript
// Note frequencies for musical painting
const noteFrequencies = {
    'C': 261.63, 'D': 293.66, 'E': 329.63, 'F': 349.23,
    'G': 392.00, 'A': 440.00, 'B': 493.88
};

playSound(note, octave = 4) {
    if (!this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // Calculate frequency with octave
    const baseFreq = noteFrequencies[note] || 440;
    const freq = baseFreq * Math.pow(2, octave - 4);
    
    oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.3);
}
```

---

## 🖱️ STEP 7: Event Handling (Critical for Touch/Click Reliability)

### Toolbar Event Handling:
```javascript
setupEvents() {
    document.querySelectorAll('.tool').forEach(tool => {
        const handleToolClick = (e) => {
            e.preventDefault();    // CRITICAL for touch devices
            e.stopPropagation();
            
            // Update UI
            document.querySelectorAll('.tool').forEach(t => t.classList.remove('active'));
            tool.classList.add('active');
            
            // Update tool state
            this.currentTool = tool.dataset.tool;
            
            // Handle immediate actions
            if (this.currentTool === 'reset') {
                this.resetGarden();
            }
            
            // Show/hide paint controls
            const paintControls = document.getElementById('paint-controls');
            if (this.currentTool === 'paint') {
                paintControls.classList.add('show');
            } else {
                paintControls.classList.remove('show');
            }
        };
        
        // DUAL EVENT LISTENERS - Required for tablet reliability
        tool.addEventListener('click', handleToolClick);
        tool.addEventListener('touchstart', handleToolClick);
    });
}
```

### Canvas Event Handling:
```javascript
// Mouse events
this.canvas.addEventListener('mousedown', (e) => this.handleStart(e));
this.canvas.addEventListener('mousemove', (e) => this.handleMove(e));
this.canvas.addEventListener('mouseup', () => this.handleEnd());

// Touch events
this.canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();  // Prevent scrolling
    this.handleStart(e.touches[0]);
});
this.canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    this.handleMove(e.touches[0]);
});
this.canvas.addEventListener('touchend', () => this.handleEnd());
```

---

## 🚀 STEP 8: Initialization and Game Loop

### Splash Screen Handling:
```javascript
document.addEventListener('DOMContentLoaded', () => {
    const splash = document.getElementById('splash-screen');
    const gameContainer = document.getElementById('game-container');
    let gameStarted = false;
    
    const startGame = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        if (gameStarted) return;
        gameStarted = true;
        
        splash.classList.add('hide');
        gameContainer.classList.add('show');
        
        setTimeout(() => {
            splash.style.display = 'none';
            new SimpleGarden();  // Initialize game
        }, 100);
    };
    
    // Dual event listeners for reliability
    splash.addEventListener('click', startGame, { passive: false });
    splash.addEventListener('touchstart', startGame, { passive: false });
    setTimeout(startGame, 4000);  // Auto-start after 4 seconds
});
```

### Game Loop:
```javascript
gameLoop() {
    this.frameCount++;
    
    // Update all game objects
    this.updateParticleEffects();
    this.updateButterflies();
    this.updateGrowingAreas();  // Grass regrowth
    
    // Render everything
    this.draw();
    
    // Continue loop
    requestAnimationFrame(() => this.gameLoop());
}
```

---

## ⚠️ COMMON MISTAKES TO AVOID

### 1. Wrong Grass Colors
- ❌ Using `#7CB342` for cut areas
- ✅ Use `#8BC34A` for cut areas
- ❌ Using hex math for color transitions
- ✅ Use RGB interpolation

### 2. Event Handler Issues
- ❌ Only using 'click' events
- ✅ Use both 'click' and 'touchstart'
- ❌ Forgetting preventDefault()
- ✅ Always call e.preventDefault() and e.stopPropagation()

### 3. Grass Density Problems  
- ❌ Adding blades without checking density
- ✅ Count existing blades before adding new ones
- ❌ Starting regrowth too early
- ✅ Start blade regeneration at 50% progress

### 4. File Structure Issues
- ❌ Using external CSS files
- ✅ Embed all CSS in index.html
- ❌ Complex build processes
- ✅ Static files only, no build tools

### 5. Deployment Problems
- ❌ Using git submodules
- ✅ Regular files only for archive folders
- ❌ External dependencies
- ✅ Self-contained static files

---

## 🧪 TESTING CHECKLIST

### Essential Tests Before Deployment:

**Functionality:**
- [ ] All 12 tools work correctly
- [ ] Mowing creates light green paths
- [ ] Watering turns cut areas dark over 5 seconds
- [ ] Grass blades regrow naturally (not too dense)
- [ ] Musical paint plays correct notes
- [ ] Reset button clears everything

**Interface:**
- [ ] Splash screen responds to first click/touch
- [ ] Toolbar buttons work on first tap
- [ ] Paint controls show/hide correctly
- [ ] Canvas prevents scrolling on mobile

**Performance:**
- [ ] Smooth 60fps animation
- [ ] No memory leaks in long sessions
- [ ] Fast loading (under 3 seconds)
- [ ] Works on older tablets

**Compatibility:**
- [ ] Chrome, Safari, Firefox, Edge
- [ ] iOS Safari, Android Chrome
- [ ] Touch and mouse both work
- [ ] Audio works (or fails gracefully)

---

## 📚 Reference Files

### Working Implementation
- `archive/miras_yard - standard js/game.js` - Last known working version
- Use this as reference if current implementation breaks

### Documentation
- `docs/PRD.md` - Complete requirements and features
- `docs/CLAUDE.md` - AI assistant instructions
- `docs/TESTING_CHECKLIST.md` - QA validation

### Key Measurements
- Canvas: 1000x600 pixels
- Mower width: 80px
- Grass grid: 15px x 12px spacing
- Touch targets: 48px minimum
- Regrowth time: 300 frames (5 seconds at 60fps)

---

## 🎯 Success Criteria

A successful recreation should:
1. **Load instantly** on tablet devices
2. **Respond to first touch** on all UI elements  
3. **Smooth grass transitions** when watering cut areas
4. **Natural blade regeneration** without over-population
5. **Musical feedback** for color painting
6. **Zero crashes** during 10-minute play sessions

### Performance Targets:
- Load time: < 3 seconds
- Frame rate: 60fps sustained
- Memory usage: < 100MB
- File size: < 5MB total

---

*This guide contains everything needed to recreate Mira's Yard. Follow the steps sequentially and test frequently for best results.*

**Last Updated**: August 10, 2025  
**Version**: 1.0.0  
**Compatible with**: Mira's Yard v3.0.0
# CLAUDE.md
## Version 1.1.0 - Updated: 2025-08-07 06:04 PST

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

### Recommended Technology Stack
- **Frontend Framework:** React.js or Vue.js for component management
- **Graphics Rendering:** HTML5 Canvas API or Pixi.js for smooth 2D animations
- **State Management:** Local storage for saving garden progress
- **Build Tool:** Webpack or Vite for optimization
- **Platform:** Web browsers (Chrome, Safari, Firefox, Edge)

### Planned Code Structure
```
src/
├── components/          # React/Vue components
│   ├── Garden.js       # Main garden area (85% of screen)
│   ├── Toolbar.js      # Tool selection bar (top)
│   ├── HarvestDisplay.js # Vase and bowl displays (right side)
│   └── ScoreJar.js     # Star seed collection jar (bottom corner)
├── tools/              # Individual tool implementations
│   ├── WateringHose.js # Watering with drag interaction
│   ├── VegetableSeeds.js # Vegetable planting
│   ├── FlowerSeeds.js  # Flower planting
│   └── Mower.js        # Lawn mowing with path tracking
├── assets/
│   ├── sprites/        # Visual assets
│   ├── sounds/         # Audio effects (optional)
│   └── music/          # Background music
└── utils/
    ├── collision.js    # Collision detection for interactions
    ├── animation.js    # Animation helpers
    └── storage.js      # Local storage management
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

### Color Palette (from PRD.md)
- Grass Green: #7CB342
- Sky Blue: #87CEEB  
- Sunflower Yellow: #FFD700
- Tomato Red: #FF6347
- Soft Pink: #FFB6C1
- Earth Brown: #8B4513

### Animation Timing
- Tool feedback: Instant (0-100ms)
- Plant growth: Quick (500ms)
- Mowing trail: Real-time following
- Harvest pop: Bouncy (300ms)
- Celebration: Extended (2-3 seconds)

## Recent Updates (v1.1.0)

### iPad Optimization Features
- **Splash Screen:** Custom whimsical garden graphic with animated elements
- **Dual Input Support:** Both mouse and touch events properly handled
- **Touch Optimizations:** preventDefault on touch events, proper passive listeners
- **Viewport Settings:** iPad-specific meta tags and scaling prevention
- **CSS Enhancements:** Touch-action controls, webkit prefixes for iOS

### Technical Improvements
- Unified event handling system for mouse/touch in game.js
- Improved realistic lawnmower icon in both splash and toolbar
- Version timestamps added to all major files
- Splash screen auto-dismisses after 5 seconds if no interaction

## Development Phases

### Phase 1: MVP ✅ COMPLETED
- Basic garden grid system ✅
- Three core tools (water, plant vegetables, plant flowers) ✅
- Mowing functionality with visible paths ✅
- Simple harvest to bowl/vase ✅
- Custom splash screen ✅
- Dual mouse/touch support ✅

### Phase 2: Enhanced Visuals (IN PROGRESS)
- Improved animations and weather effects
- More vegetable/flower varieties
- Star seed collection system
- Retina display optimization
- Fullscreen mode support

### Phase 3: Polish
- Sound effects and background music
- Garden gallery with screenshots
- Sticker reward system
- Landscape orientation lock

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
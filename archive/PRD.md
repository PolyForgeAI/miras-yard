# Product Requirements Document: Mira's Yard
## A Toddler-Friendly Digital Gardening Experience
### Version 2.0.0 - Updated: 2025-08-10

---

## 1. Executive Summary

**Product Name:** Mira's Yard  
**Target User:** Mira (age 2) and similar toddlers  
**Platform:** Web-based (touch and mouse compatible)  
**Purpose:** Educational entertainment app teaching basic gardening concepts through interactive play

### Vision Statement
Create a safe, engaging, and intuitive digital playground where toddlers can explore gardening activities through simple interactions, fostering creativity and basic cause-and-effect understanding.

---

## 2. User Persona

**Primary User:** Mira
- **Age:** 2 years old
- **Technical Ability:** Basic touch/mouse movement, drag gestures
- **Attention Span:** 5-10 minutes per session
- **Interests:** Visual feedback, immediate responses, repetitive play
- **Learning Goals:** Cause-effect relationships, basic motor skills, color recognition

**Secondary User:** Grandparent/Parent
- **Role:** Supervisor and co-player
- **Needs:** Safe content, no ads, no in-app purchases, educational value

---

## 3. Core Features

### 3.1 Building/Creating Activities

#### A. Watering System
- **Tool:** Water droplet icon
- **Interaction:** Click/tap and drag to spray water
- **Visual Feedback:** 
  - Small blue water droplets that fall with gravity
  - Realistic spray pattern
  - Soft water sound effects
  - Droplets fade away naturally

#### B. Vegetable Planting
- **Tool:** Carrot icon
- **Interaction:** Click or drag for continuous planting
- **Vegetables:** 🥕 Carrots, 🍅 Tomatoes, 🌽 Corn, 🍆 Eggplant, 🫐 Berries
- **Features:**
  - Instant placement with sound
  - Can be mowed or picked
  - Fly away when harvested with starburst effect

#### C. Flower Planting
- **Tool:** Flower icon
- **Interaction:** Click or drag for continuous planting
- **Flower Types:** 🌸🌺🌻🌷🌹 (random selection)
- **Features:**
  - Instant bloom for immediate gratification
  - Pleasant chime sounds
  - Can be picked with starburst effect

#### D. Butterflies & Fairies
- **Tool:** Butterfly icon
- **Creatures:** 🦋 Butterflies, 🧚 Fairies (male/female variants)
- **Behavior:** Start stationary, then fly around after 1-3 seconds
- **Movement:** Natural flight patterns with edge bouncing

#### E. Stars & Shapes
- **Tool:** Star icon
- **Shapes:** ⭐🌟✨💫🔥❄️💎☀️🌙
- **Features:** Static decorative elements with twinkle sounds

#### F. Rainbow Painting
- **Tool:** Rainbow icon
- **Visual:** Thick 20px strokes that cycle through rainbow colors
- **Sound:** Magical sparkles that play continuously while painting

#### G. Musical Color Painting
- **Tool:** Paint brush icon
- **Colors:** 7 colors each mapped to musical notes (C-B)
- **Brush Sizes:** Single 20px brush (octave 3)
- **Feature:** Each stroke plays corresponding musical note

### 3.2 Maintenance/Removal Activities

#### A. Grass Mowing
- **Tool:** Lawn mower icon
- **Mechanics:**
  - Drag mower across garden
  - Creates visible light green (#7CB342) cut paths
  - Throws realistic grass clippings that fly and fade
- **What it mows:**
  - ✅ Grass (creates lighter paths)
  - ✅ Flowers (removes completely)
  - ✅ Vegetables (removes completely)
- **What it DOESN'T mow:**
  - ❌ Butterflies/Fairies (protected)
  - ❌ Paint strokes (protected)
  - ❌ Rainbow strokes (protected)
  - ❌ Stars/Shapes (protected)

#### B. Flower Picking
- **Tool:** Hand picking flowers icon
- **Interaction:** Click/tap individual flowers
- **Visual Feedback:** 
  - Golden starburst particle effect
  - Flower flies up and off screen
  - Pleasant pop sound
- **Note:** Selective picking vs mowing everything

#### C. Vegetable Harvesting
- **Tool:** Hand picking vegetables icon
- **Interaction:** Click/tap individual vegetables
- **Visual Feedback:** 
  - Golden starburst particle effect
  - Vegetable flies up and off screen
  - Satisfying harvest sound

#### D. Butterfly Catching
- **Tool:** Butterfly net icon
- **Interaction:** Click/tap butterflies or fairies
- **Catch radius:** 40px (larger than plants)
- **Effect:** Starburst + creature flies away

---

## 4. Visual Scoring System

### Achievement Garden
Instead of numbers, use visual progress indicators:

#### Star Seeds System
- **Concept:** Collect "star seeds" for activities
- **Visual:** Glowing seeds appear in a collection jar
- **Rewards:**
  - 1 star seed per area watered
  - 2 star seeds per vegetable planted
  - 2 star seeds per flower planted
  - 3 star seeds per section mowed
  - 5 star seeds for full harvest

#### Garden Gallery
- **Screenshot Memories:** Auto-save pretty garden moments
- **Sticker Rewards:** Unlock fun stickers (animals, rainbows, suns)
- **Place stickers:** Can decorate saved gardens

#### Happy Meter
- **Visual Bar:** Smiling sun that fills up
- **Fills by:** Completing any activity
- **Full meter:** Triggers celebration (confetti, happy music)
- **Resets:** After celebration, encouraging continued play

---

## 5. User Interface Design

### Layout Principles
- **Screen Division:**
  - Top bar: Tool selection (large, colorful icons)
  - Main area: Garden space (85% of screen)
  - Right side: Vase and bowl displays
  - Bottom corner: Star seed jar

### Interaction Design
- **Tool Selection:** Single tap/click to select, highlighted border
- **Tool Use:** Drag for continuous action (planting, mowing, watering)
- **No menus:** Everything visible on main screen
- **Reset button:** Cloud icon that "rains" to refresh garden

### Visual Style
- **Art Direction:** Soft, rounded, cartoon style
- **Color Palette:** Bright, high contrast, toddler-friendly
- **Animations:** Smooth, slightly exaggerated for clarity
- **Feedback:** Every action has immediate visual/audio response

---

## 6. Technical Requirements

### Platform Specifications
- **Primary:** Web browser (Chrome, Safari, Firefox, Edge)
- **Framework:** HTML5 Canvas or WebGL for smooth animations
- **Responsive:** Works on tablet (preferred) and desktop
- **Touch-first:** Optimized for touch, mouse as secondary

### Performance
- **Load time:** Under 3 seconds
- **Frame rate:** Consistent 30+ FPS
- **File size:** Under 10MB total
- **Offline capable:** Works without internet after initial load

### Device Support
- **Minimum screen:** 1024x768 (iPad standard)
- **Touch:** Multi-touch not required (single finger/pointer)
- **Audio:** Optional (works with sound off)

---

## 7. Safety & Privacy

### Child Safety
- **No external links:** Completely self-contained
- **No ads:** Zero advertising
- **No data collection:** No personal information gathered
- **No social features:** No chat, sharing, or multiplayer
- **No in-app purchases:** Completely free experience

### Parental Controls
- **Settings access:** Hidden behind long-press (5 seconds)
- **Sound toggle:** Easy on/off
- **Reset garden:** Clear all progress option

---

## 8. Audio Design

### Sound Effects (Optional but Recommended)
- **Watering:** Gentle water trickling
- **Planting:** Soft "poof" sound
- **Mowing:** Quiet, rhythmic cutting sound
- **Harvesting:** Happy "pop" or bell sound
- **Achievements:** Simple musical chime

### Background Music
- **Style:** Calm, repetitive, nursery-rhyme inspired
- **Volume:** Low, non-intrusive
- **Loops:** Seamless, 2-minute loops

---

## 9. Learning Outcomes

### Cognitive Development
- **Cause and Effect:** Actions have immediate results
- **Spatial Awareness:** Dragging and positioning
- **Pattern Recognition:** Creating mowing patterns
- **Basic Counting:** Visual accumulation in vase/bowl

### Motor Skills
- **Fine Motor:** Precise clicking/tapping
- **Gross Motor:** Dragging movements
- **Hand-eye Coordination:** Targeting specific areas

### Creative Expression
- **Garden Design:** Freedom to create unique layouts
- **Color Appreciation:** Exposure to nature colors
- **Achievement Satisfaction:** Completing tasks

---

## 10. Development Phases

### Phase 1: MVP (Minimum Viable Product) ✅ COMPLETED
- Basic garden grid with animated grass blades ✅
- Water tool with small droplet effects ✅
- Plant vegetables (carrot, tomato, corn, eggplant, berries) ✅
- Plant flowers (sunflower, rose, daisy, various) ✅
- Mowing functionality with grass clippings ✅
- Pick flowers/vegetables with starburst effects ✅
- Custom splash screen with Mira & Lux ✅
- Dual mouse/touch support ✅

### Phase 2: Enhanced Features ✅ COMPLETED
- Butterflies and fairies that fly around ✅
- Stars and magical shapes (fire, ice, diamond, sun, moon) ✅
- Rainbow painting tool (magical multi-color strokes) ✅
- Musical color painting with note system ✅
- Butterfly net for catching creatures ✅
- Sound effects for all actions ✅
- Mowed path visualization ✅
- Flying effects when picking items ✅

### Phase 3: Current Implementation
- Full audio system with musical notes
- Visual effects (starbursts, flying sprites)
- Sophisticated particle system
- Performance optimized for tablets
- Single-row toolbar design for mobile

---

## 11. Success Metrics

### Engagement Metrics
- **Session Length:** Target 5-10 minutes
- **Return Rate:** Daily return desired
- **Tool Usage:** Equal distribution across all tools
- **Completion Rate:** 80% of started gardens get harvested

### Qualitative Metrics
- **Toddler Enjoyment:** Smiles, giggles, requests to play
- **Parent Satisfaction:** Perceived educational value
- **Ease of Use:** No instruction needed
- **Replay Value:** Desire to create new gardens

---

## 12. Technical Architecture Recommendations

### Technology Stack (As Implemented)
- **Frontend:** Vanilla JavaScript (no framework needed)
- **Graphics:** HTML5 Canvas 2D API
- **Audio:** Web Audio API for musical notes and effects
- **State Management:** In-memory JavaScript objects
- **No Build Tool:** Single file architecture for simplicity

### Actual Code Structure
```
miras-yard/
├── index.html              # Main HTML with toolbar
├── simple-game-fixed-grass.js  # Main game logic
├── style.css              # Styles and layout
├── images/
│   ├── miras-yard-splash.png  # Custom splash screen
│   └── screenshots/       # Game screenshots
├── CLAUDE.md              # AI assistant instructions
├── PRD.md                 # This document
└── TESTING_CHECKLIST.md   # QA checklist
```

---

## 13. Quality Assurance & Testing

### Testing Strategy
A comprehensive testing checklist has been created in `TESTING_CHECKLIST.md` covering:

#### Core Test Areas
- **Functionality**: All tools work as designed
- **Audio**: Musical paint system, cute sound effects
- **Visual**: Smooth rendering, proper layouts
- **Touch/Mouse**: Dual input support
- **Performance**: 30+ FPS, quick load times
- **Usability**: 2-year-old friendly interactions
- **Safety**: No external links or data collection

#### Key Test Scenarios
1. **Tool Functionality**: Each tool performs its intended action
2. **Sound System**: Color-coded musical notes for painting
3. **Cross-Tool Interactions**: Mower cuts everything, broom cleans paint
4. **Input Methods**: Both mouse and touch work seamlessly
5. **Visual Feedback**: Immediate response to all interactions

#### Testing Requirements
- Test on multiple devices (desktop, iPad)
- Verify audio works across platforms
- Confirm smooth performance
- Validate child-safe design
- Check session duration targets (5-10 minutes)

---

## 14. Competitive Analysis

### Similar Products
- **Toca Boca Apps:** High quality, but complex
- **Sago Mini:** Good toddler UX, but subscription-based
- **Duck Duck Moose:** Educational focus, less creative

### Differentiation
- **Simplicity:** Fewer features, better focus
- **Free Forever:** No monetization pressure
- **Grandparent Made:** Personal touch and testing
- **Growth System:** Unique visual progression

---

## 14. Risk Mitigation

### Technical Risks
- **Performance on older devices:** Optimize graphics, provide quality settings
- **Browser compatibility:** Test across major browsers
- **Touch responsiveness:** Implement proper touch event handling

### User Experience Risks
- **Complexity creep:** Maintain simplicity as priority
- **Attention span:** Keep interactions immediately rewarding
- **Frustration points:** No failure states, everything is positive

---

## 15. Future Considerations

### Potential Expansions
- **Seasons:** Winter snow shoveling, fall leaf raking
- **Animals:** Friendly pets that visit the garden
- **Weather:** Rain that waters automatically
- **Day/Night:** Simple time progression

### Educational Extensions
- **Counting Games:** Count vegetables harvested
- **Color Learning:** "Plant 3 red flowers"
- **Shapes:** Different garden bed shapes
- **Patterns:** Create specific mowing patterns

---

## 16. Appendix: Visual Concepts

### Color Palette (As Implemented)
- **Background Grass:** #4A7C2A (darker green field)
- **Mowed Areas:** #7CB342 (lighter green paths)
- **Grass Blades:** #5A8C3A to #69974A (subtle variations)
- **Water Droplets:** #4A9EFF (bright blue)
- **Starburst Effects:** #FFD700 (golden yellow)
- **Grass Clippings:** #4A7C2A (matches grass)
- **Sky Blue:** #87CEEB (splash screen background)

### Icon Design Principles
- **Size:** Minimum 64x64 pixels
- **Style:** Chunky, rounded, friendly
- **Colors:** High contrast with background
- **States:** Normal, hover/touch, active

### Animation Timing
- **Tool feedback:** Instant (0-100ms)
- **Plant growth:** Quick (500ms)
- **Mowing trail:** Real-time following
- **Harvest pop:** Bouncy (300ms)
- **Celebration:** Extended (2-3 seconds)

---

## 17. Current Implementation Details

### Particle System
The game uses a unified particle system for multiple effects:
- **Grass clippings** from mowing (green, gravity-affected)
- **Water droplets** from watering (blue, falling)
- **Starburst particles** from picking (golden, radial burst)
- **Flying sprites** when items are harvested (upward arc)

### Audio Implementation
- **Web Audio API** generates all sounds programmatically
- **No external audio files** needed
- **Musical notes** mapped to paint colors (C through B)
- **Sound effects** for every action with appropriate waveforms
- **Volume controlled** at 0.1 gain for child-friendly levels

### Performance Optimizations
- **Single canvas** rendering (no layering issues)
- **Efficient particle pooling** (reuses same array)
- **Grass blade culling** (only visible blades rendered)
- **Requestanimationframe** for smooth 60fps
- **No external dependencies** for fast loading

### Mobile/Touch Optimizations
- **Single-row toolbar** for thumb reach
- **Large touch targets** (minimum 40px)
- **Prevent default** on touch events
- **Both mouse and touch** handled simultaneously
- **No pinch-to-zoom** interference

## Summary

Mira's Yard has evolved from concept to a fully functional toddler game that successfully balances simplicity with engagement. By focusing on simple, satisfying interactions with immediate visual feedback, the game provides both entertainment and subtle educational value. The absence of complex menus, scores, or failure states ensures that every play session is positive and encouraging.

The visual scoring system through star seeds and the garden gallery provides a sense of achievement without requiring number literacy. The variety of activities ensures replay value while maintaining the simplicity essential for the target age group.

This PRD serves as a foundation for development while maintaining flexibility for iterative improvements based on actual toddler testing with Mira herself.

---

*Document Version: 2.0*  
*Created for: Mira's Grandfather*  
*Date: August 2025*  
*Status: Fully Implemented & Playable*
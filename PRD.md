# Product Requirements Document: Mira's Yard
## A Toddler-Friendly Digital Gardening Experience
### Version 1.1.0 - Updated: 2025-08-07 06:04 PST

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
- **Tool:** Watering hose icon
- **Interaction:** Click/tap and drag to water
- **Visual Feedback:** 
  - Water droplets animation
  - Grass becomes greener
  - Rainbow appears occasionally (delight factor)
  - Puddles form if overwatered (teaches moderation)

#### B. Vegetable Planting
- **Tool:** Seed packet icon
- **Interaction:** Drag to create vegetable patches
- **Vegetables:** Carrots, tomatoes, corn (easily recognizable)
- **Growth States:**
  - Seeds (immediate on plant)
  - Sprouts (after watering)
  - Full vegetables (ready to harvest)
- **Visual:** Simple, colorful, oversized vegetables

#### C. Flower Planting
- **Tool:** Flower pot icon
- **Interaction:** Drag to plant flowers
- **Flower Types:** Sunflowers, roses, daisies (bright, distinct colors)
- **Features:**
  - Instant bloom for immediate gratification
  - Butterflies appear near flowers
  - Gentle swaying animation

### 3.2 Maintenance Activities

#### A. Grass Mowing
- **Tool:** Lawn mower icon
- **Mechanics:**
  - Drag mower across tall grass
  - Creates visible cut paths
  - Satisfying "stripe" patterns possible
- **Visual Difference:**
  - Tall grass: Darker green with visible blade sprites
  - Cut grass: Lighter green, smooth texture
  - Cut grass gradually grows back (encourages replay)

#### B. Flower Picking
- **Interaction:** Tap/click flowers to pick
- **Result:** Flowers appear in decorative vase (screen corner)
- **Limit:** Vase holds 10 flowers (teaches counting visually)
- **Reset:** Can empty vase to pick more

#### C. Vegetable Harvesting
- **Interaction:** Tap/click ripe vegetables
- **Result:** Vegetables appear in harvest bowl
- **Visual Feedback:** 
  - "Pop" animation on harvest
  - Happy sound effect
  - Bowl fills up visually

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

### Phase 1: MVP (Minimum Viable Product) ✅
- Basic garden grid ✅
- Three tools (water, plant vegetables, plant flowers) ✅
- Mowing functionality ✅
- Simple harvest to bowl/vase ✅
- **NEW:** Custom splash screen with garden theme ✅
- **NEW:** Dual mouse/touch support for desktop and iPad ✅
- **NEW:** Improved realistic lawnmower icon ✅

### Phase 2: Enhanced Visuals
- Improved animations
- Weather effects (sun, clouds)
- More vegetable/flower varieties
- Star seed system
- **NEW:** iPad-optimized viewport and meta tags
- **NEW:** Retina display support

### Phase 3: Polish
- Sound effects and music
- Garden gallery
- Sticker rewards
- Seasonal themes (optional)
- **NEW:** Fullscreen mode for iPad
- **NEW:** Landscape orientation lock

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

### Technology Stack
- **Frontend:** React.js or Vue.js for component management
- **Graphics:** Canvas API or Pixi.js for 2D rendering
- **State Management:** Local storage for saving progress
- **Build Tool:** Webpack or Vite for optimization

### Code Structure
```
miras-yard/
├── src/
│   ├── components/
│   │   ├── Garden.js
│   │   ├── Toolbar.js
│   │   ├── HarvestDisplay.js
│   │   └── ScoreJar.js
│   ├── tools/
│   │   ├── WateringHose.js
│   │   ├── VegetableSeeds.js
│   │   ├── FlowerSeeds.js
│   │   └── Mower.js
│   ├── assets/
│   │   ├── sprites/
│   │   ├── sounds/
│   │   └── music/
│   └── utils/
│       ├── collision.js
│       ├── animation.js
│       └── storage.js
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

### Color Palette
- **Grass Green:** #7CB342 (vibrant, natural)
- **Sky Blue:** #87CEEB (calming background)
- **Sunflower Yellow:** #FFD700 (tool highlights)
- **Tomato Red:** #FF6347 (vegetable accent)
- **Soft Pink:** #FFB6C1 (flower accent)
- **Earth Brown:** #8B4513 (soil/paths)

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

## Summary

Mira's Yard represents a thoughtfully designed introduction to digital play for toddlers. By focusing on simple, satisfying interactions with immediate visual feedback, the game provides both entertainment and subtle educational value. The absence of complex menus, scores, or failure states ensures that every play session is positive and encouraging.

The visual scoring system through star seeds and the garden gallery provides a sense of achievement without requiring number literacy. The variety of activities ensures replay value while maintaining the simplicity essential for the target age group.

This PRD serves as a foundation for development while maintaining flexibility for iterative improvements based on actual toddler testing with Mira herself.

---

*Document Version: 1.0*  
*Created for: Mira's Grandfather*  
*Date: 2025*
// DEBUG VERSION - Natural grass colors
console.log('🌻 Starting Simple Mira\'s Yard...');

class SimpleGarden {
    constructor() {
        console.log('Initializing Simple Garden...');
        
        this.canvas = document.getElementById('garden-canvas');
        if (!this.canvas) {
            console.error('Canvas not found!');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 1000;
        this.canvas.height = 600;
        
        // Game state
        this.currentTool = 'water';
        this.isDrawing = false;
        this.plants = [];
        this.grassBlades = [];
        this.butterflies = [];
        this.rainbowStrokes = []; // Rainbow painting strokes
        this.paintStrokes = []; // Color paint strokes
        this.mowedAreas = []; // Light green mowed paths
        this.regrowingAreas = []; // Areas slowly regrowing grass
        this.wateredAreas = []; // Areas with water droplet effects
        this.grassClippings = []; // Flying grass clippings
        this.animals = []; // Animals that visit the garden
        this.paintColor = '#FF0000'; // Default red
        this.paintNote = 'C'; // Default C note
        this.brushSize = 20; // Default to LARGEST brush for toddlers
        this.paintOctave = 3; // Default octave for largest brush
        this.frameCount = 0; // Debug heartbeat
        
        // Audio context for musical painting
        this.audioContext = null;
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Audio not available');
        }
        
        // Voice synthesis for praise
        this.lastPraiseTime = 0; // Track when we last gave praise
        this.initializeVoice();
        
        // Create grass
        this.createGrass();
        
        // Add Lux the dog and some animals
        this.spawnAnimals();
        
        // Setup events
        this.setupEvents();
        this.setupPaintControls();
        
        // Set initial cursor
        this.setToolCursor();
        
        // Start game loop
        this.gameLoop();
        
        console.log('Simple Garden ready!');
    }
    
    initializeVoice() {
        // Initialize Web Speech API
        this.voiceEnabled = 'speechSynthesis' in window;
        this.currentVoice = null;
        
        if (this.voiceEnabled) {
            // Wait for voices to load
            const setVoice = () => {
                const voices = speechSynthesis.getVoices();
                console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));
                
                // Priority order: female voices first, then English voices
                this.currentVoice = 
                    voices.find(voice => 
                        voice.name.toLowerCase().includes('female') ||
                        voice.name.toLowerCase().includes('zira') ||
                        voice.name.toLowerCase().includes('susan') ||
                        voice.name.toLowerCase().includes('karen') ||
                        voice.name.toLowerCase().includes('samantha')
                    ) ||
                    voices.find(voice => voice.lang.startsWith('en')) ||
                    voices[0];
                
                console.log('Selected voice:', this.currentVoice?.name);
            };
            
            if (speechSynthesis.getVoices().length === 0) {
                speechSynthesis.onvoiceschanged = setVoice;
            } else {
                setVoice();
            }
        }
        
        // Praise phrases for different actions
        this.praisePhrases = {
            water: ['Good watering!', 'Nice job!', 'Great work!', 'Keep it up!'],
            plant: ['Beautiful planting!', 'Good job growing!', 'Amazing garden!', 'Well done!'],
            harvest: ['Perfect harvest!', 'Good picking!', 'Wonderful!', 'Excellent work!'],
            mow: ['Great mowing!', 'Nice cutting!', 'Good job!', 'Well done!'],
            paint: ['Beautiful colors!', 'Great painting!', 'So creative!', 'Amazing art!'],
            lux: ['Good dog Lux!', 'What a good dog!', 'Lux is amazing!', 'Such a good puppy!', 'Good boy Lux!']
        };
    }
    
    speakPraise(category, customMessage = null) {
        if (!this.voiceEnabled || !this.currentVoice) return;
        
        // Global rate limiting - never speak more than once every 8 seconds
        if (Date.now() - this.lastPraiseTime < 8000) {
            console.log('🔇 Speech rate limited - too soon since last praise');
            return;
        }
        
        // Stop any currently playing speech to avoid overlap
        speechSynthesis.cancel();
        
        let message;
        if (customMessage) {
            message = customMessage;
        } else if (this.praisePhrases[category]) {
            const phrases = this.praisePhrases[category];
            message = phrases[Math.floor(Math.random() * phrases.length)];
        } else {
            message = 'Good job!';
        }
        
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.voice = this.currentVoice;
        utterance.rate = 1.1; // Faster so it's over quickly
        utterance.pitch = 1.1; // Slightly higher, but not too much
        utterance.volume = 0.6; // Quieter, less intrusive
        
        // Make it even shorter by limiting length
        if (message.length > 15) {
            message = message.substring(0, 12) + '!';
            utterance.text = message;
        }
        
        speechSynthesis.speak(utterance);
        this.lastPraiseTime = Date.now();
        console.log(`🗣️ Speaking: "${message}"`);
    }
    
    createGrass() {
        console.log('Creating grass...');
        for (let x = 10; x < 990; x += 15) {
            for (let y = 10; y < 590; y += 12) {
                if (Math.random() < 0.8) {
                    this.grassBlades.push({
                        x: x + (Math.random() - 0.5) * 10,
                        y: y + (Math.random() - 0.5) * 8,
                        height: 18 + Math.random() * 28,
                        swayPhase: Math.random() * Math.PI * 2,
                        swaySpeed: 0.008 + Math.random() * 0.015,
                        swayAmount: 2 + Math.random() * 4
                    });
                }
            }
        }
        console.log(`✅ Created ${this.grassBlades.length} grass blades`);
    }
    
    spawnAnimals() {
        console.log('Adding Lux and friends...');
        
        // Lux will spawn dynamically, not permanently on screen
        this.luxSpawnTimer = 300 + Math.random() * 600; // 5-15 seconds until first Lux visit
        
        // Add some random animals that visit the garden
        const visitors = ['🐰', '🐿️', '🐝', '🐞', '🐛', '🐦', '🐻'];
        
        for (let i = 0; i < 3 + Math.random() * 3; i++) {
            this.animals.push({
                x: 50 + Math.random() * 900,
                y: 50 + Math.random() * 500,
                emoji: visitors[Math.floor(Math.random() * visitors.length)],
                name: `visitor${i}`,
                vx: (Math.random() - 0.5) * 1,
                vy: (Math.random() - 0.5) * 1,
                wanderTimer: Math.random() * 300,
                isSpecial: false
            });
        }
        
        console.log(`✅ Added ${this.animals.length} animals including Lux`);
    }
    
    render() {
        // Clear with darker green field
        this.ctx.fillStyle = '#4A7C2A';
        this.ctx.fillRect(0, 0, 1000, 600);
        
        // Draw mowed areas (lighter green paths) - SIMPLE AND CLEAN
        this.mowedAreas.forEach(area => {
            this.ctx.fillStyle = '#7CB342'; // Lighter green for mowed paths
            this.ctx.beginPath();
            this.ctx.arc(area.x, area.y, area.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Draw regrowing areas with gradual color transition
        this.regrowingAreas.forEach(area => {
            // Interpolate color from light green back to dark green
            const progress = area.regrowthStage / 100;
            const lightGreen = { r: 124, g: 195, b: 66 }; // #7CB342
            const darkGreen = { r: 74, g: 124, b: 42 };   // #4A7C2A
            
            const r = Math.round(lightGreen.r + (darkGreen.r - lightGreen.r) * progress);
            const g = Math.round(lightGreen.g + (darkGreen.g - lightGreen.g) * progress);
            const b = Math.round(lightGreen.b + (darkGreen.b - lightGreen.b) * progress);
            
            this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            this.ctx.beginPath();
            this.ctx.arc(area.x, area.y, area.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Draw watered areas (like original awesome effect)
        this.wateredAreas.forEach(area => {
            const alpha = Math.max(0, area.timer / 180); // Fade out over 3 seconds
            this.ctx.globalAlpha = alpha * 0.3;
            
            // Draw water circle - darker, more saturated green
            this.ctx.fillStyle = '#2E7D32'; // Darker green for watered look
            this.ctx.beginPath();
            this.ctx.arc(area.x, area.y, area.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.globalAlpha = 1; // Reset alpha
        });
        
        // Subtle grass shades - closer to background tone, less prominent
        const grassShades = ['#5A8C3A', '#6A9C4A', '#5F914F', '#648C44', '#69974A'];
        
        // Draw grass blades - with safety bounds and error protection
        this.grassBlades.forEach((blade, index) => {
            try {
                // Clamp sway to reasonable values to prevent screen corruption
                const sway = Math.max(-10, Math.min(10, Math.sin(blade.swayPhase || 0) * (blade.swayAmount || 0)));
                
                this.ctx.strokeStyle = grassShades[index % grassShades.length];
                this.ctx.lineWidth = 2;
                this.ctx.lineCap = 'round';
                
                this.ctx.beginPath();
                this.ctx.moveTo(blade.x || 0, blade.y || 0);
                this.ctx.lineTo((blade.x || 0) + sway, (blade.y || 0) - (blade.height || 0));
                this.ctx.stroke();
            } catch (error) {
                console.warn('Grass blade render error:', error, 'blade:', blade);
                // Continue rendering other blades even if one fails
            }
        });
        
        // Draw butterflies
        this.ctx.font = '25px Arial';
        this.ctx.fillStyle = '#000000';
        this.butterflies.forEach(butterfly => {
            this.ctx.fillText('🦋', butterfly.x, butterfly.y);
        });
        
        // Draw rainbow strokes
        this.rainbowStrokes.forEach(stroke => {
            this.drawRainbowStroke(stroke);
        });
        
        // Draw current rainbow stroke being painted
        if (this.currentStroke) {
            this.drawRainbowStroke(this.currentStroke);
        }
        
        // Draw paint strokes
        this.paintStrokes.forEach(stroke => {
            this.drawPaintStroke(stroke);
        });
        
        // Draw current paint stroke being painted
        if (this.currentPaintStroke) {
            this.drawPaintStroke(this.currentPaintStroke);
        }
        
        // Draw grass clippings and water droplets
        this.grassClippings.forEach(clipping => {
            const alpha = clipping.life / clipping.maxLife; // Fade out over time
            this.ctx.globalAlpha = alpha;
            
            // Different colors for effects
            if (clipping.isWater) {
                this.ctx.fillStyle = '#4A9EFF'; // Blue water
            } else if (clipping.isStarburst) {
                this.ctx.fillStyle = '#FFD700'; // Gold starburst
            } else {
                this.ctx.fillStyle = '#4A7C2A'; // Green grass
            }
            
            this.ctx.beginPath();
            this.ctx.arc(clipping.x, clipping.y, clipping.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1; // Reset alpha
        
        // Draw plants with reasonable growing animation
        this.ctx.fillStyle = '#000000';
        this.plants.forEach(plant => {
            // Use size property for growing plants, default to 1.0 for others
            const size = plant.size || 1.0;
            // Cap the font size to reasonable limits (20-40px range)
            const fontSize = Math.round(Math.min(Math.max(20 * size, 15), 45));
            this.ctx.font = `${fontSize}px Arial`;
            
            this.ctx.fillText(plant.emoji, plant.x, plant.y);
        });
        
        // Draw animals - Lux and garden visitors
        this.animals.forEach(animal => {
            if (animal.isSpecial) {
                this.ctx.font = `${animal.size}px Arial`; // Much larger for Lux
            } else {
                this.ctx.font = '24px Arial'; // Smaller for visitors
            }
            this.ctx.fillText(animal.emoji, animal.x, animal.y);
        });
    }
    
    setupEvents() {
        document.querySelectorAll('.tool').forEach(tool => {
            tool.addEventListener('click', () => {
                document.querySelectorAll('.tool').forEach(t => t.classList.remove('active'));
                tool.classList.add('active');
                const oldTool = this.currentTool;
                this.currentTool = tool.dataset.tool;
                
                // Reset drawing state when switching tools - this might fix the stuck state!
                this.isDrawing = false;
                this.lastPlantTime = 0;
                
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
                
                // Set custom cursor for the tool
                this.setToolCursor();
                
                console.log(`🔧 Tool switched: ${oldTool} → ${this.currentTool}`);
            });
        });
        
        // Handle both click and drag for planting
        this.canvas.addEventListener('mousedown', (e) => this.handleStart(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMove(e));
        this.canvas.addEventListener('mouseup', () => this.handleEnd());
        
        // Extra safety - listen for mouse leave to stop drawing
        this.canvas.addEventListener('mouseleave', () => this.handleEnd());
        
        // Touch events
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleStart(e.touches[0]);
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.handleMove(e.touches[0]);
        });
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.handleEnd();
        });
    }
    
    getCoords(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * (1000 / rect.width),
            y: (e.clientY - rect.top) * (600 / rect.height)
        };
    }
    
    handleStart(e) {
        try {
            this.isDrawing = true;
            this.lastPlantTime = 0; // For spacing plants
            const coords = this.getCoords(e);
            console.log(`🖱️ Start: ${this.currentTool} at (${coords.x}, ${coords.y})`);
            
            if (this.currentTool === 'flower') {
                this.plantFlower(coords.x, coords.y);
            } else if (this.currentTool === 'vegetable') {
                this.plantVegetable(coords.x, coords.y);
            } else if (this.currentTool === 'butterfly') {
                this.plantButterfly(coords.x, coords.y);
            } else if (this.currentTool === 'shapes') {
                this.plantStar(coords.x, coords.y);
            } else if (this.currentTool === 'rainbow') {
                this.startRainbow(coords.x, coords.y);
            } else if (this.currentTool === 'paint') {
                this.startPaint(coords.x, coords.y);
            } else if (this.currentTool === 'water') {
                this.addWater(coords.x, coords.y);
            } else if (this.currentTool === 'mower') {
                this.mowArea(coords.x, coords.y);
            } else if (this.currentTool === 'pick-flower') {
                this.pickFlower(coords.x, coords.y);
            } else if (this.currentTool === 'pick-vegetable') {
                this.pickVegetable(coords.x, coords.y);
            } else if (this.currentTool === 'butterfly-net') {
                this.catchButterfly(coords.x, coords.y);
            } else if (this.currentTool === 'broom') {
                this.clearArt(coords.x, coords.y);
            }
        } catch (error) {
            console.error('Error in handleStart:', error);
            this.isDrawing = false; // Reset state on error
        }
    }
    
    handleMove(e) {
        if (!this.isDrawing) return;
        
        try {
            const coords = this.getCoords(e);
            const now = Date.now();
            
            if (this.currentTool === 'flower') {
                // Plant flowers with spacing (not too dense)
                if (now - this.lastPlantTime > 100) {
                    this.plantFlower(coords.x, coords.y);
                    this.lastPlantTime = now;
                }
            } else if (this.currentTool === 'vegetable') {
                if (now - this.lastPlantTime > 100) {
                    this.plantVegetable(coords.x, coords.y);
                    this.lastPlantTime = now;
                }
            } else if (this.currentTool === 'butterfly') {
                if (now - this.lastPlantTime > 150) { // Slightly slower for butterflies
                    this.plantButterfly(coords.x, coords.y);
                    this.lastPlantTime = now;
                }
            } else if (this.currentTool === 'shapes') {
                if (now - this.lastPlantTime > 120) {
                    this.plantStar(coords.x, coords.y);
                    this.lastPlantTime = now;
                }
            } else if (this.currentTool === 'rainbow') {
                this.paintRainbow(coords.x, coords.y);
            } else if (this.currentTool === 'paint') {
                this.paintColorStroke(coords.x, coords.y);
            } else if (this.currentTool === 'water') {
                this.addWater(coords.x, coords.y);
            } else if (this.currentTool === 'mower') {
                this.mowArea(coords.x, coords.y);
            } else if (this.currentTool === 'pick-flower') {
                this.pickFlower(coords.x, coords.y);
            } else if (this.currentTool === 'pick-vegetable') {
                this.pickVegetable(coords.x, coords.y);
            } else if (this.currentTool === 'butterfly-net') {
                this.catchButterfly(coords.x, coords.y);
            } else if (this.currentTool === 'broom') {
                // Broom can be dragged around to sweep up art
                this.clearArt(coords.x, coords.y);
            }
        } catch (error) {
            console.error('Error in handleMove:', error);
            this.isDrawing = false; // Reset state on error
        }
    }
    
    handleEnd() {
        console.log(`🖱️ End: tool was ${this.currentTool}, drawing was ${this.isDrawing}`);
        
        // ALWAYS stop drawing first
        this.isDrawing = false;
        
        // Finish strokes
        if (this.currentStroke) {
            this.rainbowStrokes.push(this.currentStroke);
            this.currentStroke = null;
            console.log(`🌈 Finished rainbow stroke, total strokes: ${this.rainbowStrokes.length}`);
        }
        if (this.currentPaintStroke) {
            this.paintStrokes.push(this.currentPaintStroke);
            this.currentPaintStroke = null;
            console.log(`🎨 Finished paint stroke, total strokes: ${this.paintStrokes.length}`);
        }
        
        // Extra safety - clear any ongoing strokes
        console.log('🛑 Drawing stopped, all strokes finalized');
    }
    
    plantFlower(x, y) {
        const flowers = ['🌸', '🌺', '🌻', '🌷', '🌹'];
        this.plants.push({
            x: x,
            y: y,
            emoji: flowers[Math.floor(Math.random() * flowers.length)],
            type: 'flower',
            // Growing animation properties
            size: 0.5, // Start at 50% size
            targetSize: 2.0 + Math.random() * 1.25, // Grow to 200-325% (but of reasonable base)
            growthSpeed: 0.02 + Math.random() * 0.015, // Different growth rates
            isGrowing: true
        });
        console.log(`🌸 Planted flower at (${x}, ${y}), total plants: ${this.plants.length}`);
        this.playSound('flower');
        
        // Very rare praise for planting (max once per 15 seconds)
        if (Date.now() - this.lastPraiseTime > 15000 && Math.random() < 0.03) {
            this.speakPraise('plant');
            this.lastPraiseTime = Date.now();
        }
    }
    
    plantVegetable(x, y) {
        const vegetables = ['🥕', '🍅', '🌽', '🍆', '🫐']; // Orange carrot, red tomato, yellow corn, purple eggplant, blue berries
        this.plants.push({
            x: x,
            y: y,
            emoji: vegetables[Math.floor(Math.random() * vegetables.length)],
            type: 'vegetable',
            // Growing animation properties
            size: 0.6, // Start at 60% size (vegetables start bigger)
            targetSize: 2.0 + Math.random() * 1.25, // Grow to 200-325% (reasonable)
            growthSpeed: 0.015 + Math.random() * 0.012, // Vegetables grow slightly slower
            isGrowing: true
        });
        console.log(`🥕 Planted vegetable at (${x}, ${y}), total plants: ${this.plants.length}`);
        this.playSound('vegetable');
    }
    
    plantButterfly(x, y) {
        const creatures = ['🦋', '🧚', '🧚‍♀️', '🧚‍♂️']; // Butterflies AND fairies
        this.plants.push({
            x: x,
            y: y,
            emoji: creatures[Math.floor(Math.random() * creatures.length)],
            type: 'butterfly',
            vx: (Math.random() - 0.5) * 1, // Start with slow movement
            vy: (Math.random() - 0.5) * 1,
            flyTimer: 60 + Math.random() * 120 // Start flying after 1-3 seconds
        });
        console.log(`🦋 Planted butterfly/fairy at (${x}, ${y}), total plants: ${this.plants.length}`);
        this.playSound('butterfly');
    }
    
    plantStar(x, y) {
        const shapes = ['⭐', '🌟', '✨', '💫', '🔥', '❄️', '💎', '☀️', '🌙']; // Yellow star, glowing star, sparkles, dizzy, fire, snowflake, diamond, sun, moon
        this.plants.push({
            x: x,
            y: y,
            emoji: shapes[Math.floor(Math.random() * shapes.length)],
            type: 'shape'
        });
        console.log(`⭐ Planted star at (${x}, ${y}), total plants: ${this.plants.length}`);
        this.playSound('star');
    }
    
    addWater(x, y) {
        // Add water droplets effect (from original working code)
        this.wateredAreas = this.wateredAreas || [];
        this.wateredAreas.push({
            x: x,
            y: y,
            size: 50,
            timer: 180, // 3 seconds
            waterLevel: 3
        });
        
        // Create many small water droplets for visual effect
        for (let i = 0; i < 8; i++) {
            this.grassClippings.push({ // Reuse clippings system for droplets
                x: x + (Math.random() - 0.5) * 30,
                y: y + (Math.random() - 0.5) * 30,
                vx: (Math.random() - 0.5) * 3,
                vy: Math.random() * 2 + 1, // Fall downward
                life: 20 + Math.random() * 10,
                maxLife: 30,
                size: 1 + Math.random() * 2, // Small droplets
                isWater: true // Flag to render as blue
            });
        }
        
        // Check if watering cut areas - if so, start growing them back (ORIGINAL WORKING LOGIC)
        this.mowedAreas.forEach(cutArea => {
            const distance = Math.sqrt((cutArea.x - x) ** 2 + (cutArea.y - y) ** 2);
            if (distance < cutArea.radius + 25) {
                // Start growing this cut area back
                const existingGrowing = this.regrowingAreas.find(growing => 
                    Math.sqrt((growing.x - cutArea.x) ** 2 + (growing.y - cutArea.y) ** 2) < 10
                );
                
                if (!existingGrowing) {
                    this.regrowingAreas.push({
                        x: cutArea.x,
                        y: cutArea.y,
                        radius: cutArea.radius,
                        regrowthStage: 0,
                        regrowthTimer: 0
                    });
                }
            }
        });
        
        // Very occasional praise for watering (max once per 10 seconds)
        if (Date.now() - this.lastPraiseTime > 10000 && Math.random() < 0.05) {
            this.speakPraise('water');
            this.lastPraiseTime = Date.now();
        }
        
        this.playSound('water');
        console.log(`💧 Watering at (${x}, ${y})`);
    }
    
    mowArea(x, y) {
        // Add mowed area (lighter green path)
        this.mowedAreas.push({
            x: x,
            y: y,
            radius: 30
        });
        
        // Remove grass blades in mowed area
        const beforeBlades = this.grassBlades.length;
        this.grassBlades = this.grassBlades.filter(blade => {
            const distance = Math.sqrt((blade.x - x) ** 2 + (blade.y - y) ** 2);
            return distance > 30; // Remove blades within mowing radius
        });
        const removedBlades = beforeBlades - this.grassBlades.length;
        
        // Create grass clippings that fly off
        for (let i = 0; i < 8; i++) {
            this.grassClippings.push({
                x: x + (Math.random() - 0.5) * 20,
                y: y + (Math.random() - 0.5) * 20,
                vx: (Math.random() - 0.5) * 6,
                vy: -Math.random() * 4 - 2, // Always fly upward
                life: 40 + Math.random() * 20,
                maxLife: 40 + Math.random() * 20,
                size: 2 + Math.random() * 3
            });
        }
        
        // Remove mowable plants (flowers and vegetables, NOT butterflies, paint, etc)
        const beforeCount = this.plants.length;
        this.plants = this.plants.filter(plant => {
            const distance = Math.sqrt((plant.x - x) ** 2 + (plant.y - y) ** 2);
            if (distance < 30) {
                // Only remove flowers and vegetables
                if (plant.type === 'flower' || plant.type === 'vegetable') {
                    console.log(`🚜 Mowed ${plant.type} at distance ${distance}`);
                    return false; // Remove plant
                }
            }
            return true; // Keep plant
        });
        const removedCount = beforeCount - this.plants.length;
        
        this.playSound('mow');
        console.log(`🚜 Mowing at (${x}, ${y}), removed ${removedCount} plants, ${removedBlades} grass blades`);
    }
    
    pickFlower(x, y) {
        // Find and pick nearby flowers
        for (let i = this.plants.length - 1; i >= 0; i--) {
            const plant = this.plants[i];
            if (plant.type === 'flower') {
                const distance = Math.sqrt((plant.x - x) ** 2 + (plant.y - y) ** 2);
                if (distance < 30) {
                    // Create starburst effect
                    this.createStarburst(plant.x, plant.y);
                    // Create flying away effect
                    this.createFlyAway(plant.x, plant.y, plant.emoji);
                    // Remove flower
                    this.plants.splice(i, 1);
                    this.playSound('pick');
                    console.log(`🌸 Picked flower at (${plant.x}, ${plant.y})`);
                    return; // Only pick one at a time
                }
            }
        }
    }
    
    pickVegetable(x, y) {
        // Find and pick nearby vegetables
        for (let i = this.plants.length - 1; i >= 0; i--) {
            const plant = this.plants[i];
            if (plant.type === 'vegetable') {
                const distance = Math.sqrt((plant.x - x) ** 2 + (plant.y - y) ** 2);
                if (distance < 30) {
                    // Create starburst effect
                    this.createStarburst(plant.x, plant.y);
                    // Create flying away effect
                    this.createFlyAway(plant.x, plant.y, plant.emoji);
                    // Remove vegetable
                    this.plants.splice(i, 1);
                    this.playSound('pick');
                    console.log(`🥕 Picked vegetable at (${plant.x}, ${plant.y})`);
                    return; // Only pick one at a time
                }
            }
        }
    }
    
    catchButterfly(x, y) {
        // Find and catch nearby butterflies/fairies
        let caught = 0;
        for (let i = this.plants.length - 1; i >= 0; i--) {
            const plant = this.plants[i];
            if (plant.type === 'butterfly') {
                const distance = Math.sqrt((plant.x - x) ** 2 + (plant.y - y) ** 2);
                if (distance < 50) { // Larger catch radius for easier catching
                    // Create starburst effect
                    this.createStarburst(plant.x, plant.y);
                    // Create flying away effect
                    this.createFlyAway(plant.x, plant.y, plant.emoji);
                    // Remove butterfly
                    this.plants.splice(i, 1);
                    caught++;
                    console.log(`🥅 Caught ${plant.emoji} at (${plant.x}, ${plant.y})`);
                    
                    if (caught >= 2) break; // Catch up to 2 at once
                }
            }
        }
        
        if (caught > 0) {
            this.playSound('butterfly');
            console.log(`🥅 Net caught ${caught} creatures`);
        }
    }
    
    createStarburst(x, y) {
        // Create sparkle particles
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            this.grassClippings.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * 5,
                vy: Math.sin(angle) * 5,
                life: 30,
                maxLife: 30,
                size: 3,
                isStarburst: true // Flag for yellow rendering
            });
        }
    }
    
    clearArt(x, y) {
        const clearRadius = 40;
        const beforePaint = this.paintStrokes.length;
        const beforeRainbow = this.rainbowStrokes.length;
        
        this.paintStrokes = this.paintStrokes.filter(stroke => {
            return !stroke.points.some(point => {
                const distance = Math.sqrt((point.x - x) ** 2 + (point.y - y) ** 2);
                return distance < clearRadius;
            });
        });
        
        this.rainbowStrokes = this.rainbowStrokes.filter(stroke => {
            return !stroke.points.some(point => {
                const distance = Math.sqrt((point.x - x) ** 2 + (point.y - y) ** 2);
                return distance < clearRadius;
            });
        });
        
        const cleared = (beforePaint + beforeRainbow) - (this.paintStrokes.length + this.rainbowStrokes.length);
        if (cleared > 0) this.playSound('broom');
    }
    
    resetGarden() {
        this.plants = [];
        this.rainbowStrokes = [];
        this.paintStrokes = [];
        this.mowedAreas = [];
        this.regrowingAreas = [];
        this.wateredAreas = [];
        this.grassClippings = [];
        this.animals = [];
        this.grassBlades = [];
        this.createGrass();
        this.luxSpawnTimer = 300;
        this.playSound('reset');
        console.log('🔄 Garden reset!');
    }
    
    createFlyAway(x, y, emoji) {
        // Create flying away effect
        this.plants.push({
            x: x,
            y: y,
            emoji: emoji,
            type: 'effect',
            vx: (Math.random() - 0.5) * 4,
            vy: -8, // Fly upward
            life: 60 // Disappear after 1 second
        });
    }
    
    startRainbow(x, y) {
        this.currentStroke = {
            points: [{x, y}],
            colors: ['#FF0000'] // Start with red
        };
        console.log(`🌈 Started rainbow at (${x}, ${y})`);
        this.playSound('rainbow');
    }
    
    paintRainbow(x, y) {
        if (!this.currentStroke) return;
        
        // Rainbow colors in order
        const rainbowColors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'];
        
        // Add point to current stroke
        this.currentStroke.points.push({x, y});
        
        // Cycle through rainbow colors at good pace - change every 6 points
        const colorIndex = Math.floor((this.currentStroke.points.length - 1) / 6) % rainbowColors.length;
        this.currentStroke.colors.push(rainbowColors[colorIndex]);
        
        // Play magical sound continuously while painting
        if (this.currentStroke.points.length % 3 === 0) { // Every 3rd point
            this.playSound('rainbow-continuous');
        }
    }
    
    drawRainbowStroke(stroke) {
        if (!stroke || stroke.points.length < 2) return;
        
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.lineWidth = 20; // Much thicker rainbow
        
        const rainbowColors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'];
        
        // Draw each segment with flowing rainbow gradient
        for (let i = 0; i < stroke.points.length - 1; i++) {
            const point1 = stroke.points[i];
            const point2 = stroke.points[i + 1];
            
            // Create gradient for each segment
            const gradient = this.ctx.createLinearGradient(point1.x, point1.y, point2.x, point2.y);
            
            // Add rainbow colors flowing through the stroke (slower, much longer color sections)
            const offset = (Date.now() / 4000) % 1; // Even slower - 4 second cycle
            for (let j = 0; j < rainbowColors.length; j++) {
                // Make colors stay much longer in each section
                const basePosition = j / rainbowColors.length;
                const position = (basePosition + offset) % 1;
                gradient.addColorStop(position, rainbowColors[j]);
                
                // Add much longer color sections for better spacing
                const nextPosition = ((basePosition + 0.25) + offset) % 1; // Much longer color sections
                gradient.addColorStop(nextPosition, rainbowColors[j]);
            }
            
            this.ctx.strokeStyle = gradient;
            this.ctx.beginPath();
            this.ctx.moveTo(point1.x, point1.y);
            this.ctx.lineTo(point2.x, point2.y);
            this.ctx.stroke();
        }
    }
    
    startPaint(x, y) {
        this.currentPaintStroke = {
            points: [{x, y}],
            color: this.paintColor,
            size: this.brushSize
        };
        this.playPaintSound();
        console.log(`🎨 Started paint stroke at (${x}, ${y}) with ${this.paintNote} note`);
    }
    
    paintColorStroke(x, y) {
        if (!this.currentPaintStroke) return;
        
        this.currentPaintStroke.points.push({x, y});
        this.playPaintSound();
    }
    
    drawPaintStroke(stroke) {
        if (!stroke || stroke.points.length < 2) return;
        
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.lineWidth = stroke.size;
        this.ctx.strokeStyle = stroke.color;
        
        this.ctx.beginPath();
        this.ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        
        for (let i = 1; i < stroke.points.length; i++) {
            this.ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        
        this.ctx.stroke();
    }
    
    playPaintSound() {
        if (!this.audioContext) return;
        
        try {
            // Note frequencies (1/3 up keyboard, not whale sounds!)
            const noteFreqs = {
                'C': 261.63,
                'D': 293.66, 
                'E': 329.63,
                'F': 349.23,
                'G': 392.00,
                'A': 440.00,
                'B': 493.88
            };
            
            const baseFreq = noteFreqs[this.paintNote] || 261.63;
            // Octave adjustment: 4=high/small, 3=med, 2=low, 1=lowest
            const frequency = baseFreq * Math.pow(2, this.paintOctave - 4);
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = this.paintNote === 'synth' ? 'sawtooth' : 'sine';
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.2);
        } catch (error) {
            console.warn('Audio play error:', error);
        }
    }
    
    playSound(type) {
        if (!this.audioContext) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            let frequency = 440;
            let duration = 0.3;
            let waveType = 'sine';
            
            switch(type) {
                case 'water':
                    // Much softer water spray sound
                    frequency = 400 + Math.random() * 200; // Lower, gentler range
                    waveType = 'sine'; // Softest waveform
                    duration = 0.1; // Shorter, less intrusive
                    break;
                    
                case 'flower':
                    // Pleasant flower chime
                    frequency = 523 + Math.random() * 200; // C5 + variation
                    waveType = 'sine';
                    duration = 0.4;
                    break;
                    
                case 'vegetable':
                    // Earthy pop sound
                    frequency = 220 + Math.random() * 100; // A3 + variation
                    waveType = 'triangle';
                    duration = 0.3;
                    break;
                    
                case 'butterfly':
                    // Magical flutter
                    frequency = 800 + Math.random() * 400; // High flutter
                    waveType = 'sine';
                    duration = 0.5;
                    break;
                    
                case 'star':
                    // Sparkly twinkle
                    frequency = 1000 + Math.random() * 500; // High twinkle
                    waveType = 'square';
                    duration = 0.4;
                    break;
                    
                case 'rainbow':
                    // Magical sparkle sound (initial)
                    frequency = 800 + Math.random() * 600;
                    waveType = 'sine';
                    duration = 0.8;
                    break;
                    
                case 'rainbow-continuous':
                    // Continuous magical chimes
                    frequency = 600 + Math.random() * 800;
                    waveType = 'sine';
                    duration = 0.2;
                    break;
                    
                case 'mow':
                    // Mower sound
                    frequency = 150 + Math.random() * 50;
                    waveType = 'sawtooth';
                    duration = 0.4;
                    break;
                    
                case 'pick':
                    // Picking/harvesting pop
                    frequency = 600 + Math.random() * 200;
                    waveType = 'triangle';
                    duration = 0.2;
                    break;
                    
                case 'lux-bark':
                    // Friendly dog bark
                    frequency = 200 + Math.random() * 100;
                    waveType = 'sawtooth';
                    duration = 0.3;
                    break;
                    
                case 'lux-happy':
                    frequency = 400 + Math.random() * 200;
                    waveType = 'triangle';
                    duration = 0.5;
                    break;
                    
                case 'broom':
                    frequency = 200;
                    waveType = 'sawtooth';
                    duration = 0.2;
                    break;
                    
                case 'reset':
                    frequency = 523;
                    waveType = 'sine';
                    duration = 0.5;
                    break;
                    
                default:
                    frequency = 440;
                    waveType = 'sine';
                    duration = 0.3;
            }
            
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = waveType;
            
            // For water sound, add frequency sweep for shhhh effect
            if (type === 'water') {
                oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.5, this.audioContext.currentTime + duration);
            }
            
            // For butterfly, add flutter effect
            if (type === 'butterfly') {
                oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.5, this.audioContext.currentTime + 0.1);
                oscillator.frequency.exponentialRampToValueAtTime(frequency, this.audioContext.currentTime + 0.3);
            }
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
            
        } catch (error) {
            console.warn('Sound effect error:', error);
        }
    }
    
    setupPaintControls() {
        // Show paint controls when paint tool is selected
        const paintControls = document.getElementById('paint-controls');
        
        // Color selection
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
                
                this.paintColor = option.dataset.color;
                this.paintNote = option.dataset.note;
                console.log(`🎨 Selected color: ${this.paintColor}, note: ${this.paintNote}`);
            });
        });
        
        // Brush size selection  
        document.querySelectorAll('.brush-circle').forEach(brush => {
            brush.addEventListener('click', () => {
                document.querySelectorAll('.brush-circle').forEach(b => b.classList.remove('selected'));
                brush.classList.add('selected');
                
                this.brushSize = parseInt(brush.dataset.size);
                this.paintOctave = parseInt(brush.dataset.octave);
                console.log(`🖌️ Selected brush: ${this.brushSize}px, octave: ${this.paintOctave}`);
            });
        });
        
        // Ensure largest brush (20px) starts selected
        document.querySelectorAll('.brush-circle').forEach(b => b.classList.remove('selected'));
        const largestBrush = document.querySelector('.brush-circle[data-size="20"]');
        if (largestBrush) {
            largestBrush.classList.add('selected');
        }
    }
    
    setToolCursor() {
        let cursor = 'auto';
        
        switch(this.currentTool) {
            case 'water':
                cursor = 'url("data:image/svg+xml;charset=UTF-8,%3csvg width=\'32\' height=\'32\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3ctext x=\'16\' y=\'24\' font-size=\'24\' text-anchor=\'middle\'%3e💧%3c/text%3e%3c/svg%3e") 16 16, auto';
                break;
            case 'flower':
                cursor = 'url("data:image/svg+xml;charset=UTF-8,%3csvg width=\'32\' height=\'32\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3ctext x=\'16\' y=\'24\' font-size=\'24\' text-anchor=\'middle\'%3e🌸%3c/text%3e%3c/svg%3e") 16 16, auto';
                break;
            case 'vegetable':
                cursor = 'url("data:image/svg+xml;charset=UTF-8,%3csvg width=\'32\' height=\'32\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3ctext x=\'16\' y=\'24\' font-size=\'24\' text-anchor=\'middle\'%3e🥕%3c/text%3e%3c/svg%3e") 16 16, auto';
                break;
            case 'butterfly':
                cursor = 'url("data:image/svg+xml;charset=UTF-8,%3csvg width=\'32\' height=\'32\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3ctext x=\'16\' y=\'24\' font-size=\'24\' text-anchor=\'middle\'%3e🦋%3c/text%3e%3c/svg%3e") 16 16, auto';
                break;
            case 'shapes':
                cursor = 'url("data:image/svg+xml;charset=UTF-8,%3csvg width=\'32\' height=\'32\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3ctext x=\'16\' y=\'24\' font-size=\'24\' text-anchor=\'middle\'%3e⭐%3c/text%3e%3c/svg%3e") 16 16, auto';
                break;
            case 'rainbow':
                cursor = 'url("data:image/svg+xml;charset=UTF-8,%3csvg width=\'32\' height=\'32\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3ctext x=\'16\' y=\'24\' font-size=\'24\' text-anchor=\'middle\'%3e🌈%3c/text%3e%3c/svg%3e") 16 16, auto';
                break;
            case 'paint':
                cursor = 'url("data:image/svg+xml;charset=UTF-8,%3csvg width=\'32\' height=\'32\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3ctext x=\'16\' y=\'24\' font-size=\'24\' text-anchor=\'middle\'%3e🎨%3c/text%3e%3c/svg%3e") 16 16, auto';
                break;
            case 'mower':
                cursor = 'auto'; // Use default cursor for mower to avoid icon issues
                break;
            case 'pick-flower':
                cursor = 'url("data:image/svg+xml;charset=UTF-8,%3csvg width=\'32\' height=\'32\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3ctext x=\'16\' y=\'24\' font-size=\'16\' text-anchor=\'middle\'%3e✂️🌺%3c/text%3e%3c/svg%3e") 16 16, auto';
                break;
            case 'pick-vegetable':
                cursor = 'url("data:image/svg+xml;charset=UTF-8,%3csvg width=\'32\' height=\'32\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3ctext x=\'16\' y=\'24\' font-size=\'16\' text-anchor=\'middle\'%3e👐🥕%3c/text%3e%3c/svg%3e") 16 16, auto';
                break;
            case 'butterfly-net':
                cursor = 'url("data:image/svg+xml;charset=UTF-8,%3csvg width=\'32\' height=\'32\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3ctext x=\'16\' y=\'24\' font-size=\'16\' text-anchor=\'middle\'%3e🎾🦋%3c/text%3e%3c/svg%3e") 16 16, auto';
                break;
            case 'broom':
                cursor = 'url("data:image/svg+xml;charset=UTF-8,%3csvg width=\'32\' height=\'32\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3ctext x=\'16\' y=\'24\' font-size=\'24\' text-anchor=\'middle\'%3e🧹%3c/text%3e%3c/svg%3e") 16 16, auto';
                break;
            default:
                cursor = 'auto';
        }
        
        this.canvas.style.cursor = cursor;
    }
    
    
    update() {
        try {
            // Update grass sway - with safety bounds
            this.grassBlades.forEach(blade => {
                blade.swayPhase += blade.swaySpeed;
                // Prevent swayPhase from becoming too large and causing issues
                if (blade.swayPhase > Math.PI * 4) {
                    blade.swayPhase = blade.swayPhase % (Math.PI * 2);
                }
            });
            
            // Update plants - handle effects and flying creatures
            this.plants = this.plants.filter(plant => {
                // Handle flying away effects
                if (plant.type === 'effect') {
                    plant.x += plant.vx;
                    plant.y += plant.vy;
                    plant.vy += 0.3; // Gravity
                    plant.life--;
                    return plant.life > 0;
                }
                // Remove water drops after their life expires
                if (plant.type === 'water') {
                    plant.life--;
                    return plant.life > 0;
                }
                return true; // Keep all other plants
            });
            
            // Update growing plants (flowers and vegetables)
            this.plants.forEach(plant => {
                if (plant.isGrowing && plant.size < plant.targetSize) {
                    plant.size += plant.growthSpeed;
                    
                    // Stop growing when target reached
                    if (plant.size >= plant.targetSize) {
                        plant.size = plant.targetSize;
                        plant.isGrowing = false;
                        console.log(`🌱 ${plant.type} finished growing to ${Math.round(plant.size * 100)}% size`);
                    }
                }
            });
            
            // Update flying creatures (butterflies/fairies) in plants array
            this.plants.forEach(plant => {
                if (plant.type === 'butterfly' && plant.flyTimer !== undefined) {
                    if (plant.flyTimer > 0) {
                        plant.flyTimer--; // Countdown to start flying
                    } else {
                        // Start flying around
                        plant.x += plant.vx;
                        plant.y += plant.vy;
                        
                        // Bounce off edges
                        if (plant.x < 20 || plant.x > 980) plant.vx *= -1;
                        if (plant.y < 20 || plant.y > 580) plant.vy *= -1;
                        
                        // Gentle direction changes for natural movement
                        if (Math.random() < 0.02) {
                            plant.vx += (Math.random() - 0.5) * 0.5;
                            plant.vy += (Math.random() - 0.5) * 0.5;
                            
                            // Keep speed reasonable
                            const speed = Math.hypot(plant.vx, plant.vy);
                            if (speed > 2) {
                                plant.vx = (plant.vx / speed) * 2;
                                plant.vy = (plant.vy / speed) * 2;
                            }
                        }
                    }
                }
            });
            
            // Update watered areas (fade out over time)
            this.wateredAreas = this.wateredAreas.filter(area => {
                area.timer--;
                return area.timer > 0;
            });
            
            // Update grass clippings
            this.grassClippings = this.grassClippings.filter(clipping => {
                clipping.x += clipping.vx;
                clipping.y += clipping.vy;
                clipping.vy += 0.2; // Gravity
                clipping.vx *= 0.98; // Air resistance
                clipping.life--;
                return clipping.life > 0;
            });
            
            // Update regrowing grass areas
            this.regrowingAreas = this.regrowingAreas.filter(area => {
                area.regrowthTimer++;
                if (area.regrowthTimer % 30 === 0) { // Every half second at 60fps
                    area.regrowthStage += 2; // Slow regrowth
                    
                    // Gradually regenerate grass blades
                    if (area.regrowthStage > 30 && Math.random() < 0.1) {
                        // Add some grass blades back randomly
                        for (let i = 0; i < 2; i++) {
                            const angle = Math.random() * Math.PI * 2;
                            const dist = Math.random() * area.radius;
                            this.grassBlades.push({
                                x: area.x + Math.cos(angle) * dist,
                                y: area.y + Math.sin(angle) * dist,
                                height: 10 + Math.random() * 15, // Shorter initially
                                swayPhase: Math.random() * Math.PI * 2,
                                swaySpeed: 0.008 + Math.random() * 0.015,
                                swayAmount: 2 + Math.random() * 4
                            });
                        }
                    }
                }
                
                // Remove when fully regrown
                return area.regrowthStage < 100;
            });
            
            // Update animals (Lux and friends)
            this.animals = this.animals.filter(animal => {
                // Simple wandering behavior
                animal.wanderTimer--;
                if (animal.wanderTimer <= 0) {
                    // Change direction
                    animal.vx = (Math.random() - 0.5) * 2;
                    animal.vy = (Math.random() - 0.5) * 2;
                    animal.wanderTimer = 60 + Math.random() * 180; // 1-4 seconds at 60fps
                }
                
                // Move
                animal.x += animal.vx;
                animal.y += animal.vy;
                
                // All animals can leave the screen naturally now
                if (animal.isSpecial) {
                    // Lux has special behavior but can still leave
                    if (Math.random() < 0.005) {
                        // Occasionally run toward center
                        animal.vx += (500 - animal.x) * 0.001;
                        animal.vy += (300 - animal.y) * 0.001;
                    }
                    
                    // Lux makes sounds and statements while on screen
                    if (this.frameCount - animal.lastStatement > 1800) { // Every 30 seconds while on screen
                        if (Math.random() < 0.3) {
                            const luxStatements = [
                                "🐕 Woof! Lux loves this garden!",
                                "🐕 Lux is Mira's special friend!",
                                "🐕 Lux thinks the flowers are beautiful!",
                                "🐕 Lux wants to help with gardening!",
                                "🐕 Woof woof! Lux sees butterflies!",
                                "🐕 Lux is the best garden helper!",
                                "🐕 Lux loves watching Mira play!"
                            ];
                            
                            const statement = luxStatements[Math.floor(Math.random() * luxStatements.length)];
                            console.log(statement);
                            
                            // Use voice praise
                            if (Date.now() - this.lastPraiseTime > 15000) {
                                this.speakPraise('lux');
                                this.lastPraiseTime = Date.now();
                            }
                            
                            // Occasionally play sound
                            if (Math.random() < 0.3) {
                                this.playSound(Math.random() < 0.5 ? 'lux-bark' : 'lux-happy');
                            }
                            
                            animal.lastStatement = this.frameCount;
                        }
                    }
                }
                
                // All animals can leave the screen
                return animal.x > -50 && animal.x < 1050 && animal.y > -50 && animal.y < 650;
            });
            
            // Handle Lux spawning timer
            this.luxSpawnTimer--;
            if (this.luxSpawnTimer <= 0 && !this.animals.some(a => a.isSpecial)) {
                // Spawn Lux from random edge
                const edges = [
                    {x: -30, y: 100 + Math.random() * 400}, // Left edge
                    {x: 1030, y: 100 + Math.random() * 400}, // Right edge
                    {x: 100 + Math.random() * 800, y: -30}, // Top edge
                    {x: 100 + Math.random() * 800, y: 630}  // Bottom edge
                ];
                const spawnPos = edges[Math.floor(Math.random() * edges.length)];
                
                this.animals.push({
                    x: spawnPos.x,
                    y: spawnPos.y,
                    emoji: '🐕',
                    name: 'Lux',
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2,
                    wanderTimer: Math.random() * 300,
                    isSpecial: true,
                    size: 48, // Much larger than other animals
                    lastStatement: this.frameCount
                });
                
                // Reset timer for next Lux visit (2-4 minutes after he leaves)
                this.luxSpawnTimer = 7200 + Math.random() * 7200; // 2-4 minutes at 60fps
                console.log('🐕 Lux has entered the garden!');
            }
            
            // Occasionally spawn new visiting animals (regular animals)
            if (this.frameCount % 1200 === 0 && this.animals.length < 5) { // Every 20 seconds, max 5 animals
                const visitors = ['🐰', '🐿️', '🐝', '🐞', '🐛', '🐦', '🐻'];
                const edges = [
                    {x: -30, y: 100 + Math.random() * 400}, // Left edge
                    {x: 1030, y: 100 + Math.random() * 400}, // Right edge
                    {x: 100 + Math.random() * 800, y: -30}, // Top edge
                    {x: 100 + Math.random() * 800, y: 630}  // Bottom edge
                ];
                const spawnPos = edges[Math.floor(Math.random() * edges.length)];
                
                this.animals.push({
                    x: spawnPos.x,
                    y: spawnPos.y,
                    emoji: visitors[Math.floor(Math.random() * visitors.length)],
                    name: `visitor${Date.now()}`,
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2,
                    wanderTimer: Math.random() * 300,
                    isSpecial: false
                });
                
                console.log(`🌿 New garden visitor arrived! Total animals: ${this.animals.length}`);
            }
            
            // Update old butterflies array (if any remain)
            this.butterflies.forEach(butterfly => {
                butterfly.x += butterfly.vx;
                butterfly.y += butterfly.vy;
                
                if (butterfly.x < 0 || butterfly.x > 1000) butterfly.vx *= -1;
                if (butterfly.y < 0 || butterfly.y > 600) butterfly.vy *= -1;
            });
        } catch (error) {
            console.error('Update error:', error);
        }
    }
    
    gameLoop() {
        this.frameCount++;
        if (this.frameCount % 120 === 0) { // Every 2 seconds at 60fps
            console.log(`💚 Game loop running (frame ${this.frameCount}), plants: ${this.plants.length}`);
        }
        
        try {
            this.update();
            this.render();
        } catch (error) {
            console.error('💥 Game loop error:', error);
            console.log('Game state:', {
                plants: this.plants.length,
                butterflies: this.butterflies.length,
                currentTool: this.currentTool
            });
        }
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM ready');
    
    const splash = document.getElementById('splash-screen');
    const gameContainer = document.getElementById('game-container');
    let gameStarted = false; // Prevent multiple game instances!
    
    const startGame = () => {
        if (gameStarted) {
            console.log('Game already started, ignoring...');
            return;
        }
        gameStarted = true;
        
        console.log('Starting game...');
        splash.classList.add('hide');
        gameContainer.style.display = 'flex';
        gameContainer.classList.add('show');
        
        setTimeout(() => {
            splash.style.display = 'none';
            new SimpleGarden();
        }, 100);
    };
    
    splash.addEventListener('click', startGame);
    splash.addEventListener('touchstart', startGame);
    setTimeout(startGame, 4000);
});
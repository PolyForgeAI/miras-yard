// Version 1.1.0 - Updated: 2025-08-07 06:04 PST
// Added: Splash screen logic, dual mouse/touch support, improved event handling

class MirasYard {
    constructor() {
        this.canvas = document.getElementById('garden-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.currentTool = 'water';
        this.isDrawing = false;
        this.lastTouchTime = 0;
        
        // Game state
        this.grassPatches = [];
        this.plants = [];
        this.wateredAreas = [];
        this.cutPaths = [];
        this.flowerCount = 0;
        this.vegetableCount = 0;
        this.grassCount = 0;
        this.starSeeds = 0;
        
        // Visual effects
        this.effects = [];
        this.mowerWidth = 100; // Extra wide mower for guaranteed cutting
        
        // Initialize organic garden
        this.initializeGarden();
        this.setupEventListeners();
        this.setupCanvas();
        
        // Start game loop
        this.gameLoop();
    }
    
    initializeGarden() {
        // The entire yard starts as long grass (dark green pattern)
        // We only need to track cut areas and growing areas
        this.cutAreas = []; // Areas that have been mowed
        this.growingAreas = []; // Areas growing back from watering
        this.wateredAreas = []; // Areas with temporary water droplets
        
        this.plants = [];
        this.effects = [];
        
        // New features
        this.paintStrokes = []; // Fingerpainting strokes
        this.shapes = []; // Random shapes placed
        this.butterflies = []; // Flying butterflies
        this.season = 'spring'; // spring, summer, fall, winter
        this.lastActions = []; // For undo functionality
        
        // Painting state
        this.currentColor = '#FF0000'; // Default red
        this.brushSize = 35; // Default brush size
        
        // Audio context for sound effects
        this.audioContext = null;
        this.initAudio();
    }
    
    setupCanvas() {
        // Make canvas fill the available space
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        // Use most of the available space
        this.canvas.width = Math.min(rect.width * 0.95, 1400);
        this.canvas.height = Math.min(rect.height * 0.85, 900);
        this.canvas.style.width = this.canvas.width + 'px';
        this.canvas.style.height = this.canvas.height + 'px';
        this.initializeGarden();
    }
    
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('Audio context created:', this.audioContext.state);
            
            // Resume audio context on first user interaction
            if (this.audioContext.state === 'suspended') {
                const resumeAudio = () => {
                    this.audioContext.resume().then(() => {
                        console.log('Audio context resumed');
                        document.removeEventListener('click', resumeAudio);
                        document.removeEventListener('touchstart', resumeAudio);
                    });
                };
                document.addEventListener('click', resumeAudio);
                document.addEventListener('touchstart', resumeAudio);
            }
        } catch (e) {
            console.error('Audio not supported:', e);
        }
    }
    
    playSound(frequency, duration = 0.2, type = 'sine', volume = 0.3) {
        if (!this.audioContext) {
            console.warn('No audio context for playSound');
            return;
        }
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
            
            console.log('Sound played:', frequency, 'Hz for', duration, 's');
        } catch (error) {
            console.error('Error playing sound:', error);
        }
    }
    
    playCuteSound(pattern = 'pickup') {
        if (!this.audioContext) {
            console.warn('No audio context');
            return;
        }
        
        if (this.audioContext.state === 'suspended') {
            console.warn('Audio context suspended');
            this.audioContext.resume();
        }
        
        console.log('Playing sound:', pattern);
        
        const patterns = {
            pickup: [{ f: 440, d: 0.08 }, { f: 554, d: 0.08 }, { f: 659, d: 0.15 }],
            plant: [{ f: 392, d: 0.1 }, { f: 523, d: 0.1 }, { f: 659, d: 0.1 }],
            water: [{ f: 330, d: 0.15 }, { f: 392, d: 0.1 }, { f: 330, d: 0.1 }],
            mow: [{ f: 220, d: 0.05 }, { f: 196, d: 0.05 }, { f: 165, d: 0.05 }],
            rainbow: [{ f: 392, d: 0.08 }, { f: 440, d: 0.08 }, { f: 494, d: 0.08 }, { f: 523, d: 0.1 }],
            butterfly: [{ f: 784, d: 0.05 }, { f: 880, d: 0.05 }, { f: 784, d: 0.05 }],
            erase: [{ f: 494, d: 0.05 }, { f: 440, d: 0.05 }, { f: 392, d: 0.05 }],
            flower: [{ f: 523, d: 0.08 }, { f: 659, d: 0.08 }, { f: 784, d: 0.12 }],
            vegetable: [{ f: 349, d: 0.1 }, { f: 440, d: 0.1 }, { f: 523, d: 0.12 }]
        };
        
        const notes = patterns[pattern] || patterns.pickup;
        notes.forEach((note, i) => {
            setTimeout(() => this.playSound(note.f, note.d, 'sine', 0.2), i * 80);
        });
    }
    
    playPaintNote(color, brushSize) {
        if (!this.audioContext) return;
        
        // Map colors to notes (C major scale) - Starting higher on keyboard
        const colorNotes = {
            '#FF0000': 523.25, // C5 - Red (middle C octave up)
            '#FF8C00': 587.33, // D5 - Orange  
            '#FFD700': 659.25, // E5 - Yellow
            '#32CD32': 698.46, // F5 - Green
            '#1E90FF': 783.99, // G5 - Blue
            '#8A2BE2': 880.00, // A5 - Purple
            '#FF69B4': 987.77, // B5 - Pink
            '#FFFFFF': 1046.50 // C6 - White (even higher)
        };
        
        // Get base frequency for color
        const baseFreq = colorNotes[color] || 880;
        
        // Adjust octave based on brush size - stay in higher range
        // Small brush (5) = highest octave (*2), Large brush (35) = middle-lower range (*0.5)
        const octaveMultiplier = brushSize <= 15 ? 2 : brushSize <= 25 ? 1 : 0.6;
        const frequency = baseFreq * octaveMultiplier;
        
        this.playSound(frequency, 0.1, 'sine', 0.15);
    }
    
    setupEventListeners() {
        // Tool selection
        document.querySelectorAll('.tool').forEach(tool => {
            tool.addEventListener('click', (e) => {
                console.log('Tool clicked:', tool.dataset.tool); // Debug log
                document.querySelector('.tool.selected')?.classList.remove('selected');
                tool.classList.add('selected');
                this.currentTool = tool.dataset.tool;
                
                // Change cursor based on selected tool
                this.updateCanvasCursor();
                
                // Show/hide color palette and brush controls
                this.updateToolControls();
                
                // Handle immediate actions
                if (this.currentTool === 'reset') {
                    this.resetGarden();
                } else if (this.currentTool === 'seasons') {
                    this.changeSeason();
                } else if (this.currentTool === 'undo') {
                    this.undoLastAction();
                }
            });
        });
        
        // Canvas interactions - both mouse and touch with unified handlers
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.startInteraction({ x, y, identifier: 'mouse' });
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isDrawing) {
                e.preventDefault();
                const rect = this.canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                this.continueInteraction({ x, y, identifier: 'mouse' });
            }
        });
        
        this.canvas.addEventListener('mouseup', (e) => {
            e.preventDefault();
            this.endInteraction({ identifier: 'mouse' });
        });
        
        this.canvas.addEventListener('mouseleave', (e) => {
            if (this.isDrawing) {
                this.endInteraction({ identifier: 'mouse' });
            }
        });
        
        // Touch events
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            this.startInteraction({ x, y, identifier: touch.identifier });
        }, { passive: false });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.isDrawing && e.touches.length > 0) {
                const touch = e.touches[0];
                const rect = this.canvas.getBoundingClientRect();
                const x = touch.clientX - rect.left;
                const y = touch.clientY - rect.top;
                this.continueInteraction({ x, y, identifier: touch.identifier });
            }
        }, { passive: false });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.endInteraction({ identifier: 'touch' });
        }, { passive: false });
        
        this.canvas.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            this.endInteraction({ identifier: 'touch' });
        }, { passive: false });
        
        // Prevent context menu
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Color palette event listeners
        document.querySelectorAll('.color-option').forEach(color => {
            color.addEventListener('click', (e) => {
                document.querySelector('.color-option.selected')?.classList.remove('selected');
                color.classList.add('selected');
                this.currentColor = color.dataset.color;
                this.playCuteSound('pickup'); // Color selection sound
            });
        });
        
        // Brush size event listeners
        document.querySelectorAll('.brush-size').forEach(size => {
            size.addEventListener('click', (e) => {
                document.querySelector('.brush-size.selected')?.classList.remove('selected');
                size.classList.add('selected');
                this.brushSize = parseInt(size.dataset.size);
                this.playCuteSound('pickup'); // Size selection sound
            });
        });
        
        // Select water tool by default
        document.querySelector('[data-tool="water"]').classList.add('selected');
        document.querySelector('.color-option').classList.add('selected'); // Select first color
        this.updateCanvasCursor();
        this.updateToolControls();
    }
    
    updateCanvasCursor() {
        let cursor = 'crosshair'; // Default
        
        switch (this.currentTool) {
            case 'water':
                cursor = 'url("data:image/svg+xml;charset=UTF-8,%3csvg width=\'24\' height=\'24\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3ctext y=\'20\' font-size=\'20\'%3e💧%3c/text%3e%3c/svg%3e") 12 12, auto';
                break;
            case 'vegetable':
                cursor = 'url("data:image/svg+xml;charset=UTF-8,%3csvg width=\'24\' height=\'24\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3ctext y=\'20\' font-size=\'20\'%3e🥕%3c/text%3e%3c/svg%3e") 12 12, auto';
                break;
            case 'flower':
                cursor = 'url("data:image/svg+xml;charset=UTF-8,%3csvg width=\'24\' height=\'24\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3ctext y=\'20\' font-size=\'20\'%3e🌸%3c/text%3e%3c/svg%3e") 12 12, auto';
                break;
            case 'mower':
                cursor = 'url("data:image/svg+xml;charset=UTF-8,%3csvg width=\'32\' height=\'32\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3crect x=\'4\' y=\'16\' width=\'16\' height=\'6\' rx=\'1\' fill=\'%232E7D32\'/%3e%3crect x=\'6\' y=\'12\' width=\'12\' height=\'5\' rx=\'1\' fill=\'%23212121\'/%3e%3ccircle cx=\'8\' cy=\'24\' r=\'3\' fill=\'%23212121\'/%3e%3ccircle cx=\'8\' cy=\'24\' r=\'2\' fill=\'%23FFF\'/%3e%3ccircle cx=\'16\' cy=\'24\' r=\'3\' fill=\'%23212121\'/%3e%3ccircle cx=\'16\' cy=\'24\' r=\'2\' fill=\'%23FFF\'/%3e%3cline x1=\'18\' y1=\'14\' x2=\'28\' y2=\'4\' stroke=\'%23212121\' stroke-width=\'2\'/%3e%3c/svg%3e") 16 16, auto';
                break;
            case 'pick-flower':
                cursor = 'url("data:image/svg+xml;charset=UTF-8,%3csvg width=\'24\' height=\'24\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3ctext y=\'12\' font-size=\'12\'%3e✋%3c/text%3e%3ctext y=\'20\' x=\'12\' font-size=\'12\'%3e🌸%3c/text%3e%3c/svg%3e") 12 12, auto';
                break;
            case 'pick-vegetable':
                cursor = 'url("data:image/svg+xml;charset=UTF-8,%3csvg width=\'24\' height=\'24\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3ctext y=\'12\' font-size=\'12\'%3e✋%3c/text%3e%3ctext y=\'20\' x=\'12\' font-size=\'12\'%3e🥕%3c/text%3e%3c/svg%3e") 12 12, auto';
                break;
            case 'paint':
                cursor = 'url("data:image/svg+xml;charset=UTF-8,%3csvg width=\'24\' height=\'24\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3ctext y=\'20\' font-size=\'20\'%3e🎨%3c/text%3e%3c/svg%3e") 12 12, auto';
                break;
            case 'shapes':
                cursor = 'url("data:image/svg+xml;charset=UTF-8,%3csvg width=\'24\' height=\'24\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3ctext y=\'20\' font-size=\'20\'%3e⭐%3c/text%3e%3c/svg%3e") 12 12, auto';
                break;
            case 'rainbow':
                cursor = 'url("data:image/svg+xml;charset=UTF-8,%3csvg width=\'24\' height=\'24\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3ctext y=\'20\' font-size=\'20\'%3e🌈%3c/text%3e%3c/svg%3e") 12 12, auto';
                break;
            case 'eraser':
                cursor = 'url("data:image/svg+xml;charset=UTF-8,%3csvg width=\'24\' height=\'24\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3ctext y=\'20\' font-size=\'20\'%3e🧹%3c/text%3e%3c/svg%3e") 12 12, auto';
                break;
            case 'butterfly':
                cursor = 'url("data:image/svg+xml;charset=UTF-8,%3csvg width=\'24\' height=\'24\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3ctext y=\'20\' font-size=\'20\'%3e🦋%3c/text%3e%3c/svg%3e") 12 12, auto';
                break;
            case 'seasons':
                cursor = 'url("data:image/svg+xml;charset=UTF-8,%3csvg width=\'24\' height=\'24\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3ctext y=\'20\' font-size=\'20\'%3e🍂%3c/text%3e%3c/svg%3e") 12 12, auto';
                break;
            case 'undo':
                cursor = 'url("data:image/svg+xml;charset=UTF-8,%3csvg width=\'24\' height=\'24\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3ctext y=\'20\' font-size=\'20\'%3e↶%3c/text%3e%3c/svg%3e") 12 12, auto';
                break;
            case 'reset':
                cursor = 'url("data:image/svg+xml;charset=UTF-8,%3csvg width=\'24\' height=\'24\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3ctext y=\'20\' font-size=\'20\'%3e☁️%3c/text%3e%3c/svg%3e") 12 12, auto';
                break;
            case 'butterfly-net':
                cursor = 'url("data:image/svg+xml;charset=UTF-8,%3csvg width=\'32\' height=\'32\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3crect x=\'14\' y=\'16\' width=\'4\' height=\'14\' fill=\'%238D6E63\' rx=\'2\'/%3e%3ccircle cx=\'16\' cy=\'12\' r=\'10\' fill=\'none\' stroke=\'%23666\' stroke-width=\'2\'/%3e%3cg stroke=\'%23999\' stroke-width=\'1\' fill=\'none\'%3e%3cline x1=\'11\' y1=\'8\' x2=\'21\' y2=\'16\'/%3e%3cline x1=\'21\' y1=\'8\' x2=\'11\' y2=\'16\'/%3e%3c/g%3e%3c/svg%3e") 16 16, auto';
                break;
            case 'broom':
                cursor = 'url("data:image/svg+xml;charset=UTF-8,%3csvg width=\'24\' height=\'24\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3ctext y=\'20\' font-size=\'20\'%3e🧹%3c/text%3e%3c/svg%3e") 12 12, auto';
                break;
        }
        
        this.canvas.style.cursor = cursor;
    }
    
    updateToolControls() {
        const paintControls = document.getElementById('paint-controls');
        
        // Show/hide paint controls ONLY for paint tool
        if (this.currentTool === 'paint') {
            paintControls.classList.add('show');
        } else {
            paintControls.classList.remove('show');
        }
    }
    
    changeSeason() {
        const seasons = ['spring', 'summer', 'fall', 'winter'];
        const currentIndex = seasons.indexOf(this.season);
        this.season = seasons[(currentIndex + 1) % seasons.length];
        
        // Update season icon
        const seasonTool = document.getElementById('seasons-tool').querySelector('.tool-icon');
        const seasonIcons = { spring: '🌸', summer: '☀️', fall: '🍂', winter: '❄️' };
        seasonTool.textContent = seasonIcons[this.season];
        
        // Season change - pleasant chord progression
        const seasonChords = [
            [523, 659, 784], // Spring - C major chord
            [587, 698, 880], // Summer - D major chord  
            [440, 554, 659], // Fall - A minor chord
            [494, 622, 740]  // Winter - B minor chord
        ];
        const chord = seasonChords[seasons.indexOf(this.season)];
        // Play chord notes in quick succession
        chord.forEach((note, i) => {
            setTimeout(() => this.playSound(note, 0.4, 'sine'), i * 50);
        });
    }
    
    undoLastAction() {
        if (this.lastActions.length === 0) return;
        
        const lastAction = this.lastActions.pop();
        
        switch (lastAction.type) {
            case 'paint':
                this.paintStrokes.pop();
                break;
            case 'shape':
                this.shapes.pop();
                break;
            case 'mow':
                this.cutAreas.pop();
                break;
            case 'plant':
                this.plants.pop();
                break;
        }
        
        // Undo sound - gentle descending notes
        this.playSound(523, 0.15, 'sine'); // C5
        setTimeout(() => this.playSound(440, 0.15, 'sine'), 100); // A4 - pleasant resolution
    }
    
    getCanvasCoordinates(event) {
        // Event already has x, y coordinates relative to canvas
        if (event.x !== undefined && event.y !== undefined) {
            return { x: event.x, y: event.y };
        }
        // Fallback for older format
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }
    
    startInteraction(event) {
        this.isDrawing = true;
        this.handleToolAction(event.x || 0, event.y || 0);
    }
    
    continueInteraction(event) {
        if (!this.isDrawing) return;
        this.handleToolAction(event.x || 0, event.y || 0);
    }
    
    endInteraction(event) {
        this.isDrawing = false;
    }
    
    handleToolAction(x, y) {
        console.log('Tool action:', this.currentTool, x, y); // Debug log
        switch (this.currentTool) {
            case 'water':
                this.waterArea(x, y);
                break;
            case 'vegetable':
                this.plantVegetable(x, y);
                break;
            case 'flower':
                this.plantFlower(x, y);
                break;
            case 'mower':
                this.mowArea(x, y);
                break;
            case 'pick-flower':
                this.pickFlower(x, y);
                break;
            case 'pick-vegetable':
                this.pickVegetable(x, y);
                break;
            case 'paint':
                this.paintArea(x, y);
                break;
            case 'broom':
                this.broomSweep(x, y);
                break;
            case 'shapes':
                this.addRandomShape(x, y);
                break;
            case 'rainbow':
                this.paintRainbow(x, y);
                break;
            case 'butterfly':
                this.addButterfly(x, y);
                break;
            case 'butterfly-net':
                this.catchButterfly(x, y);
                break;
        }
    }
    
    waterArea(x, y) {
        // Add water droplets effect
        this.wateredAreas.push({
            x: x,
            y: y,
            size: 50,
            timer: 180, // 3 seconds
            waterLevel: 3
        });
        
        // Check if watering cut areas - if so, start growing them back
        this.cutAreas.forEach(cutArea => {
            const distance = Math.sqrt((cutArea.x - x) ** 2 + (cutArea.y - y) ** 2);
            if (distance < cutArea.size / 2 + 25) {
                // Start growing this cut area back
                const existingGrowing = this.growingAreas.find(growing => 
                    Math.sqrt((growing.x - cutArea.x) ** 2 + (growing.y - cutArea.y) ** 2) < 10
                );
                
                if (!existingGrowing) {
                    this.growingAreas.push({
                        x: cutArea.x,
                        y: cutArea.y,
                        size: cutArea.size,
                        progress: 0,
                        maxProgress: 300 // 5 seconds to fully grow
                    });
                }
            }
        });
        
        this.addStarSeeds(1);
        this.addWaterEffect(x, y);
        this.playCuteSound('water'); // Water sound
    }
    
    plantVegetable(x, y) {
        // Check if area is clear
        const isAreaClear = !this.plants.some(plant => {
            const distance = Math.sqrt((plant.x - x) ** 2 + (plant.y - y) ** 2);
            return distance < 30;
        });
        
        if (isAreaClear) {
            const vegetables = ['carrot', 'tomato', 'corn'];
            this.plants.push({
                x: x,
                y: y,
                type: 'vegetable',
                variety: vegetables[Math.floor(Math.random() * vegetables.length)],
                state: 'seeded',
                growthTimer: 0,
                size: 15
            });
            this.addStarSeeds(2);
            this.playCuteSound('vegetable'); // Vegetable sound
            this.lastActions.push({type: 'plant', item: this.plants[this.plants.length - 1]});
        }
    }
    
    plantFlower(x, y) {
        const isAreaClear = !this.plants.some(plant => {
            const distance = Math.sqrt((plant.x - x) ** 2 + (plant.y - y) ** 2);
            return distance < 30;
        });
        
        if (isAreaClear) {
            const flowers = ['sunflower', 'rose', 'daisy'];
            this.plants.push({
                x: x,
                y: y,
                type: 'flower',
                variety: flowers[Math.floor(Math.random() * flowers.length)],
                state: 'ready',
                growthTimer: 0,
                size: 20
            });
            this.addStarSeeds(2);
            this.playCuteSound('flower'); // Flower sound
            this.lastActions.push({type: 'plant', item: this.plants[this.plants.length - 1]});
        }
    }
    
    mowArea(x, y) {
        // Add cut area
        this.cutAreas.push({
            x: x,
            y: y,
            size: this.mowerWidth
        });
        
        let itemsCut = 0;
        
        // Remove any growing areas that get mowed
        this.growingAreas = this.growingAreas.filter(growing => {
            const distance = Math.sqrt((growing.x - x) ** 2 + (growing.y - y) ** 2);
            if (distance < this.mowerWidth / 2) {
                itemsCut++;
                return false;
            }
            return true;
        });
        
        // Mow down ALL plants (flowers AND vegetables)!
        console.log('=== MOWER DEBUG ===');
        console.log('Mowing at position:', x, y);
        console.log('Plants before mowing:', this.plants.length);
        console.log('Mower width/radius:', this.mowerWidth, '/', this.mowerWidth / 2);
        
        if (this.plants.length > 0) {
            console.log('Plant positions:');
            this.plants.forEach((plant, i) => {
                const distance = Math.sqrt((plant.x - x) ** 2 + (plant.y - y) ** 2);
                console.log(`  Plant ${i}: ${plant.type} ${plant.variety} at (${plant.x}, ${plant.y}), distance: ${distance}`);
            });
        }
        
        const plantsBeforeCount = this.plants.length;
        this.plants = this.plants.filter(plant => {
            const distance = Math.sqrt((plant.x - x) ** 2 + (plant.y - y) ** 2);
            if (distance < this.mowerWidth / 2) {
                console.log('CUTTING plant:', plant.type, plant.variety, 'at distance:', distance);
                // Add flying away animation for cut plants
                const emoji = plant.type === 'flower' ? '🌸' : '🥕';
                this.createFlyAwayEffect(plant.x, plant.y, emoji);
                itemsCut++;
                this.addStarSeeds(1);
                return false; // Remove plant
            }
            return true;
        });
        const plantsAfterCount = this.plants.length;
        console.log('Plants after mowing:', plantsAfterCount, '(removed:', plantsBeforeCount - plantsAfterCount, ')');
        
        // Mow down shapes too
        this.shapes = this.shapes.filter(shape => {
            const distance = Math.sqrt((shape.x - x) ** 2 + (shape.y - y) ** 2);
            if (distance < this.mowerWidth / 2) {
                // Add flying away animation for mowed shapes
                this.createFlyAwayEffect(shape.x, shape.y, shape.emoji);
                itemsCut++;
                return false;
            }
            return true;
        });
        
        // Mow butterflies that are low to ground
        this.butterflies = this.butterflies.filter(butterfly => {
            const distance = Math.sqrt((butterfly.x - x) ** 2 + (butterfly.y - y) ** 2);
            if (distance < this.mowerWidth / 2 && butterfly.y > this.canvas.height - 150) {
                // Add flying away animation for mowed butterflies
                this.createFlyAwayEffect(butterfly.x, butterfly.y, '🦋');
                itemsCut++;
                return false;
            }
            return true;
        });
        
        this.addStarSeeds(Math.max(1, itemsCut));
        this.playCuteSound('mow'); // Cute mower sound
        this.lastActions.push({type: 'mow', area: this.cutAreas[this.cutAreas.length - 1]});
    }
    
    pickFlower(x, y) {
        for (let i = this.plants.length - 1; i >= 0; i--) {
            const plant = this.plants[i];
            const distance = Math.sqrt((plant.x - x) ** 2 + (plant.y - y) ** 2);
            
            if (distance < 25 && plant.type === 'flower' && plant.state === 'ready') {
                // Add flying away animation for picked flower
                this.createFlyAwayEffect(plant.x, plant.y, '🌸');
                this.plants.splice(i, 1);
                this.flowerCount++;
                this.addStarSeeds(5);
                console.log('Picked flower! Total flowers:', this.flowerCount);
                this.playCuteSound('pickup'); // Cute pickup sound
                break;
            }
        }
    }
    
    pickVegetable(x, y) {
        for (let i = this.plants.length - 1; i >= 0; i--) {
            const plant = this.plants[i];
            const distance = Math.sqrt((plant.x - x) ** 2 + (plant.y - y) ** 2);
            
            if (distance < 25 && plant.type === 'vegetable' && plant.state === 'ready') {
                // Add flying away animation for picked vegetable
                this.createFlyAwayEffect(plant.x, plant.y, '🥕');
                this.plants.splice(i, 1);
                this.vegetableCount++;
                this.addStarSeeds(5);
                console.log('Picked vegetable! Total vegetables:', this.vegetableCount);
                this.playCuteSound('pickup'); // Cute pickup sound
                break;
            }
        }
    }
    
    // NEW PAINTING AND CREATIVE TOOLS
    paintArea(x, y) {
        if (this.isDrawing) {
            const stroke = this.paintStrokes[this.paintStrokes.length - 1];
            if (stroke && stroke.color === this.currentColor && stroke.size === this.brushSize) {
                // Add multiple interpolated points for ultra-smooth drawing
                if (stroke.points.length > 0) {
                    const lastPoint = stroke.points[stroke.points.length - 1];
                    const distance = Math.sqrt((x - lastPoint.x) ** 2 + (y - lastPoint.y) ** 2);
                    
                    // If points are far apart, interpolate between them
                    if (distance > 10) {
                        const steps = Math.ceil(distance / 5); // Create points every 5px
                        for (let i = 1; i <= steps; i++) {
                            const t = i / steps;
                            const interpX = lastPoint.x + (x - lastPoint.x) * t;
                            const interpY = lastPoint.y + (y - lastPoint.y) * t;
                            stroke.points.push({x: interpX, y: interpY});
                        }
                    } else {
                        stroke.points.push({x, y});
                    }
                } else {
                    stroke.points.push({x, y});
                }
            } else {
                this.createNewPaintStroke(x, y);
            }
        } else {
            this.createNewPaintStroke(x, y);
        }
        this.playPaintNote(this.currentColor, this.brushSize); // Musical paint sound
    }
    
    createNewPaintStroke(x, y) {
        const newStroke = {
            points: [{x, y}],
            color: this.currentColor,
            size: this.brushSize
        };
        this.paintStrokes.push(newStroke);
        this.lastActions.push({type: 'paint', stroke: newStroke});
    }
    
    broomSweep(x, y) {
        // Broom sweeps away ALL paint strokes in a wide area
        const sweepRadius = 60; // Wide sweep area
        
        // Remove paint strokes that intersect with broom
        this.paintStrokes = this.paintStrokes.filter(stroke => {
            return !stroke.points.some(point => {
                const distance = Math.sqrt((point.x - x) ** 2 + (point.y - y) ** 2);
                return distance < sweepRadius;
            });
        });
        
        // Also remove shapes in sweep area with flying animation
        this.shapes = this.shapes.filter(shape => {
            const distance = Math.sqrt((shape.x - x) ** 2 + (shape.y - y) ** 2);
            if (distance <= sweepRadius) {
                // Add flying away animation for swept shapes
                this.createFlyAwayEffect(shape.x, shape.y, shape.emoji);
                return false;
            }
            return true;
        });
        
        this.playCuteSound('erase'); // Sweep sound
    }
    
    catchButterfly(x, y) {
        // Catch butterflies with the net
        console.log('=== BUTTERFLY NET DEBUG ===');
        console.log('Net position:', x, y);
        console.log('Butterflies on screen:', this.butterflies.length);
        
        if (this.butterflies.length > 0) {
            this.butterflies.forEach((butterfly, i) => {
                const distance = Math.sqrt((butterfly.x - x) ** 2 + (butterfly.y - y) ** 2);
                console.log(`  Butterfly ${i}: at (${butterfly.x.toFixed(1)}, ${butterfly.y.toFixed(1)}), distance: ${distance.toFixed(1)}`);
            });
        }
        
        let caught = false;
        let caughtItems = [];
        
        // Catch butterflies
        const initialButterflyCount = this.butterflies.length;
        this.butterflies = this.butterflies.filter(butterfly => {
            const distance = Math.sqrt((butterfly.x - x) ** 2 + (butterfly.y - y) ** 2);
            if (distance < 80) { // Larger net catch radius for easier catching
                console.log('CAUGHT butterfly at distance:', distance.toFixed(1));
                // Add flying away animation
                this.createFlyAwayEffect(butterfly.x, butterfly.y, '🦋');
                caught = true;
                caughtItems.push('butterfly');
                this.addStarSeeds(5);
                return false; // Remove caught butterfly
            }
            return true;
        });
        
        // Catch emoji shapes too!
        const initialShapeCount = this.shapes.length;
        this.shapes = this.shapes.filter(shape => {
            const distance = Math.sqrt((shape.x - x) ** 2 + (shape.y - y) ** 2);
            if (distance < 80) {
                console.log('CAUGHT emoji shape at distance:', distance.toFixed(1));
                // Add flying away animation
                this.createFlyAwayEffect(shape.x, shape.y, shape.emoji);
                caught = true;
                caughtItems.push('shape');
                this.addStarSeeds(3);
                return false; // Remove caught shape
            }
            return true;
        });
        
        console.log('Net results: butterflies:', this.butterflies.length, '(caught:', initialButterflyCount - this.butterflies.length, '), shapes:', this.shapes.length, '(caught:', initialShapeCount - this.shapes.length, ')');
        
        if (caught) {
            this.playCuteSound('pickup');
        } else {
            console.log('Net missed - no items caught!');
        }
    }
    
    addRandomShape(x, y) {
        const shapes = ['⭐', '🌟', '💖', '🌺', '🦋', '🐱', '🐶', '🐸', '🌻', '🌈', '☀️', '🌙'];
        const shape = {
            x: x,
            y: y,
            emoji: shapes[Math.floor(Math.random() * shapes.length)],
            size: 20 + Math.random() * 15,
            rotation: Math.random() * 360
        };
        
        this.shapes.push(shape);
        this.lastActions.push({type: 'shape', shape: shape});
        this.addStarSeeds(1);
        // Magical sparkle sound for shapes - like fairy dust
        const magicNotes = [659, 784, 880, 988]; // E5, G5, A5, B5 - bright and magical
        const note = magicNotes[Math.floor(Math.random() * magicNotes.length)];
        this.playCuteSound('pickup'); // Cute sparkle sound
    }
    
    paintRainbow(x, y) {
        const colors = ['#FF0000', '#FF8C00', '#FFD700', '#32CD32', '#1E90FF', '#8A2BE2'];
        
        if (this.isDrawing) {
            const lastRainbow = this.paintStrokes[this.paintStrokes.length - 1];
            if (lastRainbow && lastRainbow.isRainbow) {
                // Add smooth interpolation for rainbow too
                if (lastRainbow.points.length > 0) {
                    const lastPoint = lastRainbow.points[lastRainbow.points.length - 1];
                    const distance = Math.sqrt((x - lastPoint.x) ** 2 + (y - lastPoint.y) ** 2);
                    
                    if (distance > 10) {
                        const steps = Math.ceil(distance / 5);
                        for (let i = 1; i <= steps; i++) {
                            const t = i / steps;
                            const interpX = lastPoint.x + (x - lastPoint.x) * t;
                            const interpY = lastPoint.y + (y - lastPoint.y) * t;
                            lastRainbow.points.push({x: interpX, y: interpY});
                        }
                    } else {
                        lastRainbow.points.push({x, y});
                    }
                } else {
                    lastRainbow.points.push({x, y});
                }
            } else {
                this.createNewRainbowStroke(x, y, colors);
            }
        } else {
            this.createNewRainbowStroke(x, y, colors);
        }
        // Rainbow sound - happy ascending notes like a musical rainbow
        const rainbowNotes = [523, 587, 659, 698, 784, 880]; // C5 to A5 major scale
        const noteIndex = Math.floor(Math.random() * rainbowNotes.length);
        this.playCuteSound('rainbow'); // Cute rainbow sound
    }
    
    createNewRainbowStroke(x, y, colors) {
        const rainbowStroke = {
            points: [{x, y}],
            colors: colors,
            size: this.brushSize,
            isRainbow: true
        };
        this.paintStrokes.push(rainbowStroke);
        this.lastActions.push({type: 'paint', stroke: rainbowStroke});
    }
    
    addButterfly(x, y) {
        const butterfly = {
            x: x,
            y: y,
            targetX: x,
            targetY: y,
            vx: 0,
            vy: 0,
            flutterTimer: 0,
            emoji: ['🦋', '🧚‍♀️'][Math.floor(Math.random() * 2)]
        };
        
        this.butterflies.push(butterfly);
        this.addStarSeeds(1);
        this.playCuteSound('butterfly'); // Butterfly sound
    }
    
    addFlowerToPile() {
        const pile = document.querySelector('.flower-pile');
        const flowers = ['🌸', '🌻', '🌹', '🌼'];
        const flower = document.createElement('div');
        flower.className = 'pile-item';
        flower.textContent = flowers[Math.floor(Math.random() * flowers.length)];
        pile.appendChild(flower);
    }
    
    addVegetableToPile() {
        const pile = document.querySelector('.vegetable-pile');
        const vegetables = ['🥕', '🍅', '🌽'];
        const vegetable = document.createElement('div');
        vegetable.className = 'pile-item';
        vegetable.textContent = vegetables[Math.floor(Math.random() * vegetables.length)];
        pile.appendChild(vegetable);
    }
    
    addGrassToPile() {
        const pile = document.querySelector('.grass-pile');
        const grass = document.createElement('div');
        grass.className = 'pile-item';
        grass.textContent = '🌱';
        pile.appendChild(grass);
    }
    
    addStarSeeds(amount) {
        this.starSeeds += amount;
        this.updateDisplay();
    }
    
    updateDisplay() {
        // Display counters in console for debugging since UI elements don't exist
        console.log('Game state: flowers:', this.flowerCount, 'vegetables:', this.vegetableCount, 'stars:', this.starSeeds);
    }
    
    addWaterEffect(x, y) {
        for (let i = 0; i < 5; i++) {
            this.effects.push({
                type: 'water',
                x: x + (Math.random() - 0.5) * 30,
                y: y + (Math.random() - 0.5) * 30,
                timer: 30,
                size: 3 + Math.random() * 5
            });
        }
    }
    
    addHarvestEffect(x, y, emoji) {
        this.effects.push({
            type: 'harvest',
            x: x,
            y: y,
            timer: 60,
            emoji: emoji,
            scale: 1
        });
    }
    
    createFlyAwayEffect(x, y, emoji) {
        // Create a flying-away animation for caught/mowed items
        this.effects.push({
            type: 'flyaway',
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 8, // Random horizontal velocity
            vy: -3 - Math.random() * 4, // Upward velocity
            timer: 90, // 1.5 seconds at 60fps
            emoji: emoji,
            scale: 1,
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.2
        });
    }
    
    resetGarden() {
        this.initializeGarden();
        this.flowerCount = 0;
        this.vegetableCount = 0;
        this.grassCount = 0;
        this.starSeeds = 0;
        
        console.log('Garden reset!');
        
        this.playSound(250, 0.5); // Reset sound
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        // Update plant growth
        this.plants.forEach(plant => {
            if (plant.type === 'vegetable' && plant.state === 'seeded') {
                plant.growthTimer++;
                if (plant.growthTimer > 180) { // 3 seconds
                    plant.state = 'ready';
                }
            }
        });
        
        // Update watered areas (water droplet timers)
        this.wateredAreas = this.wateredAreas.filter(area => {
            area.timer--;
            return area.timer > 0;
        });
        
        // Update growing areas
        this.growingAreas.forEach(growing => {
            growing.progress++;
            if (growing.progress >= growing.maxProgress) {
                // Remove the corresponding cut area - it's now fully grown
                this.cutAreas = this.cutAreas.filter(cut => {
                    const distance = Math.sqrt((cut.x - growing.x) ** 2 + (cut.y - growing.y) ** 2);
                    return distance > 10;
                });
            }
        });
        
        // Remove fully grown areas
        this.growingAreas = this.growingAreas.filter(growing => growing.progress < growing.maxProgress);
        
        // Update butterflies
        this.butterflies.forEach(butterfly => {
            butterfly.flutterTimer++;
            
            // Change target every 2 seconds
            if (butterfly.flutterTimer % 120 === 0) {
                butterfly.targetX = Math.random() * this.canvas.width;
                butterfly.targetY = Math.random() * this.canvas.height;
            }
            
            // Move towards target with gentle speed
            const dx = butterfly.targetX - butterfly.x;
            const dy = butterfly.targetY - butterfly.y;
            butterfly.vx += dx * 0.001; // Gentle movement
            butterfly.vy += dy * 0.001;
            
            // Add subtle flutter randomness
            butterfly.vx += (Math.random() - 0.5) * 0.1; // Gentle flutter
            butterfly.vy += (Math.random() - 0.5) * 0.1;
            
            // Apply gentle damping
            butterfly.vx *= 0.95;
            butterfly.vy *= 0.95;
            
            // Update position with visible but gentle movement
            butterfly.x += butterfly.vx * 0.8;
            butterfly.y += butterfly.vy * 0.8;
            
            // Keep on screen
            if (butterfly.x < 0) butterfly.x = this.canvas.width;
            if (butterfly.x > this.canvas.width) butterfly.x = 0;
            if (butterfly.y < 0) butterfly.y = this.canvas.height;
            if (butterfly.y > this.canvas.height) butterfly.y = 0;
        });
        
        // Update effects
        this.effects = this.effects.filter(effect => {
            effect.timer--;
            
            if (effect.type === 'harvest') {
                effect.y -= 2;
                effect.scale += 0.02;
            } else if (effect.type === 'flyaway') {
                // Update flyaway animations
                effect.x += effect.vx;
                effect.y += effect.vy;
                effect.vy += 0.1; // Gravity
                effect.rotation += effect.rotationSpeed;
                effect.scale *= 0.995; // Slight shrinking
            }
            
            return effect.timer > 0;
        });
    }
    
    render() {
        // Draw the full dark green "surging" pattern background (long grass everywhere)
        this.renderLongGrassBackground();
        
        // Draw cut areas (lighter green circles)
        this.cutAreas.forEach(cut => {
            this.ctx.fillStyle = '#8BC34A'; // Lighter green for cut grass
            this.ctx.beginPath();
            this.ctx.arc(cut.x, cut.y, cut.size / 2, 0, 2 * Math.PI);
            this.ctx.fill();
        });
        
        // Draw growing areas (transitioning from light to dark green)
        this.growingAreas.forEach(growing => {
            const growthFactor = growing.progress / growing.maxProgress;
            // Transition from cut color to long grass color
            const r = Math.floor(139 + (76 - 139) * growthFactor);
            const g = Math.floor(195 + (175 - 195) * growthFactor);
            const b = Math.floor(74 + (80 - 74) * growthFactor);
            
            this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            this.ctx.beginPath();
            this.ctx.arc(growing.x, growing.y, growing.size / 2, 0, 2 * Math.PI);
            this.ctx.fill();
            
            // Add growing grass blades when more than 50% grown
            if (growthFactor > 0.5) {
                this.ctx.strokeStyle = '#2E7D32';
                this.ctx.lineWidth = 1;
                const bladeHeight = 4 + (growthFactor - 0.5) * 8;
                
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * 2 * Math.PI;
                    const radius = (growing.size / 2) * 0.7;
                    const x1 = growing.x + Math.cos(angle) * radius;
                    const y1 = growing.y + Math.sin(angle) * radius;
                    const x2 = x1 + Math.cos(angle - Math.PI/2) * bladeHeight;
                    const y2 = y1 + Math.sin(angle - Math.PI/2) * bladeHeight;
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(x1, y1);
                    this.ctx.lineTo(x2, y2);
                    this.ctx.stroke();
                }
            }
        });
        
        // Draw water droplets
        this.wateredAreas.forEach(area => {
            const alpha = area.timer / 180;
            this.ctx.fillStyle = `rgba(76, 195, 247, ${alpha})`;
            for (let i = 0; i < area.waterLevel; i++) {
                const angle = (i / area.waterLevel) * 2 * Math.PI;
                const x = area.x + Math.cos(angle) * (area.size * 0.3);
                const y = area.y + Math.sin(angle) * (area.size * 0.3);
                
                this.ctx.beginPath();
                this.ctx.arc(x, y, 4, 0, 2 * Math.PI);
                this.ctx.fill();
            }
        });
        
        // Draw paint strokes
        this.paintStrokes.forEach(stroke => {
            this.renderPaintStroke(stroke);
        });
        
        // Draw shapes
        this.shapes.forEach(shape => {
            this.renderShape(shape);
        });
        
        // Draw plants
        this.plants.forEach(plant => {
            this.renderPlant(plant);
        });
        
        // Draw butterflies
        this.butterflies.forEach(butterfly => {
            this.renderButterfly(butterfly);
        });
        
        // Draw effects
        this.effects.forEach(effect => {
            this.renderEffect(effect);
        });
    }
    
    renderLongGrassBackground() {
        // Create the static pattern across the entire canvas with seasonal colors
        
        // Get seasonal base color
        let baseColor;
        switch (this.season) {
            case 'spring': baseColor = '#4CAF50'; break; // Bright green
            case 'summer': baseColor = '#2E7D32'; break; // Dark green  
            case 'fall': baseColor = '#8D6E63'; break; // Brown
            case 'winter': baseColor = '#ECEFF1'; break; // Light gray/white
        }
        
        this.ctx.fillStyle = baseColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Create static darker spots using fixed pattern
        for (let x = 0; x < this.canvas.width; x += 30) {
            for (let y = 0; y < this.canvas.height; y += 30) {
                const noise1 = Math.sin(x * 0.02) * Math.cos(y * 0.02);
                const noise2 = Math.sin(x * 0.03) * Math.cos(y * 0.025);
                const combined = (noise1 + noise2) * 0.5;
                
                if (combined > 0.2) {
                    const intensity = Math.min(combined * 0.3, 0.2);
                    this.ctx.fillStyle = `rgba(46, 125, 50, ${intensity})`;
                    
                    const size = 20 + combined * 15;
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, size, 0, 2 * Math.PI);
                    this.ctx.fill();
                }
            }
        }
        
        // Add static grass blade texture across the entire surface
        this.ctx.strokeStyle = 'rgba(46, 125, 50, 0.6)';
        this.ctx.lineWidth = 1;
        
        for (let x = 0; x < this.canvas.width; x += 15) {
            for (let y = 0; y < this.canvas.height; y += 15) {
                this.ctx.beginPath();
                this.ctx.moveTo(x, y);
                this.ctx.lineTo(x - 1, y - 6);
                this.ctx.stroke();
                
                this.ctx.beginPath();
                this.ctx.moveTo(x + 5, y);
                this.ctx.lineTo(x + 6, y - 5);
                this.ctx.stroke();
            }
        }
    }
    
    
    renderPlant(plant) {
        this.ctx.font = `${plant.size + 10}px Arial`;
        this.ctx.textAlign = 'center';
        
        let emoji;
        if (plant.type === 'vegetable') {
            switch (plant.variety) {
                case 'carrot': emoji = plant.state === 'ready' ? '🥕' : '🌱'; break;
                case 'tomato': emoji = plant.state === 'ready' ? '🍅' : '🌱'; break;
                case 'corn': emoji = plant.state === 'ready' ? '🌽' : '🌱'; break;
                default: emoji = '🌱';
            }
        } else {
            switch (plant.variety) {
                case 'sunflower': emoji = '🌻'; break;
                case 'rose': emoji = '🌹'; break;
                case 'daisy': emoji = '🌼'; break;
                default: emoji = '🌸';
            }
        }
        
        // Add shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.fillText(emoji, plant.x + 2, plant.y + 2);
        
        // Add main emoji
        this.ctx.fillStyle = 'black';
        this.ctx.fillText(emoji, plant.x, plant.y);
    }
    
    renderEffect(effect) {
        if (effect.type === 'water') {
            this.ctx.fillStyle = `rgba(76, 195, 247, ${effect.timer / 30})`;
            this.ctx.beginPath();
            this.ctx.arc(effect.x, effect.y, effect.size, 0, 2 * Math.PI);
            this.ctx.fill();
        } else if (effect.type === 'harvest') {
            this.ctx.font = `${20 * effect.scale}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.fillStyle = `rgba(0, 0, 0, ${effect.timer / 60})`;
            this.ctx.fillText(effect.emoji, effect.x, effect.y);
        } else if (effect.type === 'flyaway') {
            // Render flying away items with rotation and fading
            this.ctx.save();
            this.ctx.translate(effect.x, effect.y);
            this.ctx.rotate(effect.rotation);
            this.ctx.scale(effect.scale, effect.scale);
            this.ctx.font = '24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillStyle = `rgba(0, 0, 0, ${Math.max(0, effect.timer / 90)})`;
            this.ctx.fillText(effect.emoji, 0, 0);
            this.ctx.restore();
        }
    }
    
    // NEW RENDERING METHODS
    renderPaintStroke(stroke) {
        if (stroke.points.length < 2) return;
        
        this.ctx.lineWidth = stroke.size;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        if (stroke.isRainbow) {
            // Rainbow stroke
            for (let i = 1; i < stroke.points.length; i++) {
                const colorIndex = Math.floor((i / stroke.points.length) * stroke.colors.length);
                this.ctx.strokeStyle = stroke.colors[colorIndex];
                
                this.ctx.beginPath();
                this.ctx.moveTo(stroke.points[i-1].x, stroke.points[i-1].y);
                this.ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
                this.ctx.stroke();
            }
        } else {
            // Regular colored stroke
            this.ctx.strokeStyle = stroke.color;
            this.ctx.beginPath();
            this.ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
            
            for (let i = 1; i < stroke.points.length; i++) {
                this.ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
            }
            this.ctx.stroke();
        }
    }
    
    renderShape(shape) {
        this.ctx.save();
        this.ctx.translate(shape.x, shape.y);
        this.ctx.rotate(shape.rotation * Math.PI / 180);
        
        this.ctx.font = `${shape.size}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = 'black';
        this.ctx.fillText(shape.emoji, 0, 0);
        
        this.ctx.restore();
    }
    
    renderButterfly(butterfly) {
        this.ctx.save();
        this.ctx.translate(butterfly.x, butterfly.y);
        
        // Add subtle flutter animation
        const flutter = Math.sin(butterfly.flutterTimer * 0.3) * 5;
        this.ctx.rotate(flutter * Math.PI / 180);
        
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = 'black';
        this.ctx.fillText(butterfly.emoji, 0, 0);
        
        this.ctx.restore();
    }
}

// Initialize game with splash screen
document.addEventListener('DOMContentLoaded', () => {
    const splashScreen = document.getElementById('splash-screen');
    const gameContainer = document.querySelector('.game-container');
    
    // Handle splash screen click/tap
    const startGame = () => {
        // Fade out splash screen
        splashScreen.classList.add('hide');
        
        // Show game container
        gameContainer.classList.add('show');
        
        // Initialize game after transition
        setTimeout(() => {
            const game = new MirasYard();
            
            // Force audio context to resume after user interaction
            if (game.audioContext && game.audioContext.state === 'suspended') {
                console.log('Attempting to resume audio context...');
                game.audioContext.resume().then(() => {
                    console.log('Audio context resumed successfully!');
                    // Test sound to verify audio is working
                    setTimeout(() => {
                        console.log('Playing test sound...');
                        game.playCuteSound('pickup');
                    }, 100);
                }).catch(err => {
                    console.error('Failed to resume audio context:', err);
                });
            } else {
                console.log('Audio context state:', game.audioContext ? game.audioContext.state : 'not initialized');
                // Try test sound anyway
                setTimeout(() => {
                    console.log('Playing test sound (no resume needed)...');
                    game.playCuteSound('pickup');
                }, 100);
            }
            
            // Make game globally accessible for debugging
            window.game = game;
            
            // Remove splash screen from DOM after fade
            setTimeout(() => {
                splashScreen.remove();
            }, 500);
        }, 100);
    };
    
    // Support both click and touch to start
    splashScreen.addEventListener('click', startGame);
    splashScreen.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startGame();
    }, { passive: false });
    
    // Auto-start after 5 seconds if no interaction
    setTimeout(() => {
        if (!splashScreen.classList.contains('hide')) {
            startGame();
        }
    }, 5000);
});
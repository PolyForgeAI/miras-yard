// Enhanced Mira's Yard with Pixi.js Effects
// Version 2.0.0 - Complete feature set with GPU acceleration

console.log('🌻 Starting Enhanced Mira\'s Yard...');

class MirasYardEnhanced {
    constructor() {
        console.log('Initializing Enhanced Garden...');
        
        try {
            console.log('Step 1: Initialize Canvas');
            this.initializeCanvas();
            
            console.log('Step 2: Initialize Pixi');
            this.initializePixi();
            
            console.log('Step 3: Initialize Game State');
            this.initializeGameState();
            
            console.log('Step 4: Initialize Voice');
            this.initializeVoice();
            
            console.log('Step 5: Initialize Animals');
            this.initializeAnimals();
            
            console.log('Step 6: Setup Event Listeners');
            this.setupEventListeners();
            
            console.log('Step 7: Start Game Loop');
            this.gameLoop();
            
            console.log('Enhanced Garden ready!');
        } catch (error) {
            console.error('Error in MirasYardEnhanced constructor:', error);
            console.error('Stack trace:', error.stack);
            throw error;
        }
    }
    
    initializeCanvas() {
        console.log('🔍 Initializing canvas...');
        
        this.canvas = document.getElementById('garden-canvas');
        console.log('Canvas element:', this.canvas);
        console.log('Canvas parent:', this.canvas?.parentElement);
        
        if (!this.canvas) {
            console.error('❌ Canvas element not found!');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        console.log('Canvas context:', this.ctx);
        
        if (!this.ctx) {
            console.error('❌ Failed to get 2D context!');
            return;
        }
        
        // Set actual canvas size
        this.canvas.width = 1000;
        this.canvas.height = 800;
        
        console.log('✅ Canvas size set to:', this.canvas.width, 'x', this.canvas.height);
        
        // Test immediate drawing
        console.log('🎨 Testing immediate draw...');
        this.ctx.fillStyle = '#FF0000';
        this.ctx.fillRect(0, 0, 200, 200);
        console.log('Drew red square immediately');
        
        // Resize display to fit container
        const resizeCanvas = () => {
            try {
                const container = this.canvas.parentElement;
                if (!container) {
                    console.warn('Canvas parent not found');
                    return;
                }
                const rect = container.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                    const scale = Math.min(rect.width / 1000, rect.height / 800);
                    
                    this.canvas.style.width = (1000 * scale) + 'px';
                    this.canvas.style.height = (800 * scale) + 'px';
                    console.log('Canvas styled to:', this.canvas.style.width, 'x', this.canvas.style.height);
                }
            } catch (e) {
                console.error('Error resizing canvas:', e);
            }
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        console.log('✅ Canvas initialization complete');
    }
    
    initializePixi() {
        // Create Pixi overlay for enhanced effects
        if (typeof PIXI !== 'undefined') {
            try {
                console.log('🎭 Initializing Pixi.js overlay...');
                
                this.pixiCanvas = document.createElement('canvas');
                this.pixiCanvas.width = 1000;
                this.pixiCanvas.height = 800;
                
                // CRITICAL FIX: Position Pixi canvas EXACTLY over Canvas 2D
                this.pixiCanvas.style.position = 'absolute';
                this.pixiCanvas.style.top = '0px';
                this.pixiCanvas.style.left = '0px';
                this.pixiCanvas.style.width = '100%';
                this.pixiCanvas.style.height = '100%';
                this.pixiCanvas.style.pointerEvents = 'none';
                this.pixiCanvas.style.borderRadius = '20px 20px 0 0';
                this.pixiCanvas.style.zIndex = '5';
                this.pixiCanvas.style.background = 'transparent';
                
                // Insert into game-area container to match canvas positioning
                const gameArea = document.querySelector('.game-area');
                if (gameArea) {
                    gameArea.appendChild(this.pixiCanvas);
                } else {
                    console.warn('game-area not found, appending to canvas parent');
                    this.canvas.parentNode.appendChild(this.pixiCanvas);
                }
                
                this.pixiApp = new PIXI.Application({
                    view: this.pixiCanvas,
                    width: 1000,
                    height: 800,
                    transparent: true,
                    backgroundAlpha: 0,  // Fully transparent background
                    resolution: 1,
                    autoDensity: false
                });
                
                this.effectContainer = new PIXI.Container();
                this.pixiApp.stage.addChild(this.effectContainer);
                
                console.log('✅ Pixi.js overlay positioned correctly');
                console.log('Canvas position:', this.canvas.offsetTop, this.canvas.offsetLeft);
                console.log('Pixi position:', this.pixiCanvas.style.top, this.pixiCanvas.style.left);
            } catch (e) {
                console.warn('Pixi.js failed to initialize, using Canvas 2D only:', e);
                this.pixiApp = null;
            }
        } else {
            console.log('Pixi.js not available, using Canvas 2D only');
            this.pixiApp = null;
        }
    }
    
    initializeGameState() {
        this.currentTool = 'water';
        this.isDrawing = false;
        
        // Collections
        this.plants = [];
        this.waterDrops = [];
        this.grassBlades = [];
        this.butterflies = [];
        this.animals = [];
        this.effects = [];
        this.paintStrokes = [];
        this.shapes = [];
        
        // Counters
        this.stars = 0;
        this.flowers = 0;
        this.vegetables = 0;
        this.actionCount = 0;
        
        // Settings
        this.paintColor = '#FF0000';
        this.brushSize = 30;
        this.currentNote = 'C'; // Default note
        this.currentOctave = 3; // Default octave
        
        // Continuous paint sound
        this.paintingOscillator = null;
        this.paintingGainNode = null;
        
        // Create swaying grass blades
        this.createSwayingGrass();
        
        console.log('Game state initialized');
    }
    
    createSwayingGrass() {
        // Create many more individual swaying grass blades across the yard
        for (let x = 20; x < 980; x += 15 + Math.random() * 15) {
            for (let y = 150; y < 750; y += 12 + Math.random() * 12) {
                // Skip fewer areas for denser grass
                if (Math.random() < 0.15) continue;
                
                this.grassBlades.push({
                    x: x + (Math.random() - 0.5) * 10, // Add some random offset
                    y: y,
                    height: 12 + Math.random() * 30, // Random heights 12-42px
                    baseHeight: 12 + Math.random() * 30,
                    swayPhase: Math.random() * Math.PI * 2, // Random starting phase
                    swaySpeed: 0.005 + Math.random() * 0.02, // Slow sway
                    swayAmount: 1.5 + Math.random() * 5, // How much it sways
                    width: 1.5 + Math.random() * 2, // Blade thickness
                    color: `rgba(${45 + Math.random() * 50}, ${90 + Math.random() * 70}, ${25 + Math.random() * 35}, 0.7)`, // Varied green
                    curve: 0.3 + Math.random() * 0.7, // Curve amount for scimitar shape
                    cut: false
                });
            }
        }
        
        console.log(`Created ${this.grassBlades.length} swaying grass blades`);
    }
    
    initializeVoice() {
        this.voiceEnabled = 'speechSynthesis' in window;
        this.currentVoice = null;
        
        // Initialize audio context for musical notes
        this.audioContext = null;
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('Audio context initialized for musical notes');
        } catch (e) {
            console.warn('Audio context not available:', e);
        }
        
        // Musical note frequencies (C4 = 261.63 Hz)
        this.noteFrequencies = {
            'C': 261.63,
            'D': 293.66,
            'E': 329.63,
            'F': 349.23,
            'G': 392.00,
            'A': 440.00,
            'B': 493.88
        };
        
        if (this.voiceEnabled) {
            const setVoice = () => {
                const voices = speechSynthesis.getVoices();
                // Prefer natural female voices for child-friendly experience
                this.currentVoice = voices.find(v => 
                    v.name.toLowerCase().includes('samantha') ||
                    v.name.toLowerCase().includes('victoria') ||
                    v.name.toLowerCase().includes('susan') ||
                    v.name.toLowerCase().includes('karen') ||
                    v.name.toLowerCase().includes('female') ||
                    v.name.toLowerCase().includes('woman') ||
                    (v.lang.includes('en-US') && !v.name.toLowerCase().includes('male'))
                ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
                
                console.log('Selected voice:', this.currentVoice?.name, 'Lang:', this.currentVoice?.lang);
            };
            
            if (speechSynthesis.getVoices().length === 0) {
                speechSynthesis.onvoiceschanged = setVoice;
            } else {
                setVoice();
            }
        }
        
        this.praisePhrases = {
            water: ['Good watering!', 'Plants love water!', 'Keep it up!'],
            plant: ['Beautiful planting!', 'Growing nicely!', 'Amazing garden!'],
            harvest: ['Perfect harvest!', 'Yummy vegetables!', 'Great job!'],
            mow: ['Nice mowing!', 'Grass looks perfect!', 'Well done!'],
            paint: ['Beautiful colors!', 'So creative!', 'Amazing art!'],
            butterfly: ['Pretty butterfly!', 'Flutter flutter!', 'So magical!'],
            net: ['Great catch!', 'Got one!', 'Nice netting!'],
            celebration: ['Fantastic work!', 'You are amazing!', 'Incredible garden!']
        };
        
        console.log('Voice system ready');
    }
    
    initializeAnimals() {
        this.animalTypes = [
            { emoji: '🐕', size: 45, speed: 2.5, name: 'Lux' }, // Special dog is LUX
            { emoji: '🐈', size: 35, speed: 2, name: 'kitty' },
            { emoji: '🐰', size: 30, speed: 3, name: 'bunny' },
            { emoji: '🐦', size: 25, speed: 4, name: 'birdie' },
            { emoji: '🦆', size: 40, speed: 1.8, name: 'ducky' },
            { emoji: '🐸', size: 30, speed: 1.5, name: 'froggy' }
        ];
        
        // Special phrases for Lux the dog
        this.luxPhrases = [
            'Good boy Lux!',
            'There goes Lux!',
            'Hi Lux!',
            'Come play Lux!',
            'Look, it\'s Lux!',
            'Lux is here to play!',
            'What a good dog, Lux!',
            'Lux loves the garden!'
        ];
        
        // Manual animal spawning only (disabled automatic random spawning)
        // Animals will appear only when user interacts with specific tools
        
        console.log('Animal system ready');
    }
    
    setupEventListeners() {
        // Tool selection
        document.querySelectorAll('.tool').forEach(tool => {
            tool.addEventListener('click', () => {
                document.querySelectorAll('.tool').forEach(t => t.classList.remove('active'));
                tool.classList.add('active');
                this.currentTool = tool.dataset.tool;
                
                // Show/hide paint controls
                const paintControls = document.getElementById('paint-controls');
                if (this.currentTool === 'paint') {
                    paintControls.classList.add('show');
                } else {
                    paintControls.classList.remove('show');
                }
                
                console.log('Tool changed to:', this.currentTool);
            });
        });
        
        // Paint controls with musical notes
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', () => {
                this.paintColor = option.dataset.color;
                this.currentNote = option.dataset.note;
                document.querySelectorAll('.color-option').forEach(c => c.classList.remove('selected'));
                option.classList.add('selected');
                
                // Play the note
                this.playNote(this.currentNote, this.currentOctave || 3);
            });
        });
        
        document.querySelectorAll('.brush-size').forEach(option => {
            option.addEventListener('click', () => {
                this.brushSize = parseInt(option.dataset.size);
                this.currentOctave = parseInt(option.dataset.octave);
                document.querySelectorAll('.brush-size').forEach(b => b.classList.remove('selected'));
                option.classList.add('selected');
                
                // Play the note in the new octave
                if (this.currentNote) {
                    this.playNote(this.currentNote, this.currentOctave);
                }
            });
        });
        
        // Canvas interactions
        this.canvas.addEventListener('pointerdown', (e) => this.handlePointerDown(e));
        this.canvas.addEventListener('pointermove', (e) => this.handlePointerMove(e));
        this.canvas.addEventListener('pointerup', () => this.handlePointerUp());
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.handlePointerDown(touch);
        }, { passive: false });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.isDrawing) {
                const touch = e.touches[0];
                this.handlePointerMove(touch);
            }
        }, { passive: false });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.handlePointerUp();
        }, { passive: false });
        
        console.log('Event listeners ready');
    }
    
    playNote(note, octave = 3) {
        if (!this.audioContext) return;
        
        // Resume audio context if needed (for user interaction requirement)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        let frequency;
        
        if (note === 'synth') {
            // Random synth tone
            frequency = 200 + Math.random() * 800;
        } else {
            // Musical note
            frequency = this.noteFrequencies[note] * Math.pow(2, octave - 4);
        }
        
        // Create oscillator
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = note === 'synth' ? 'sawtooth' : 'sine';
        
        // Envelope
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }
    
    startContinuousPaintSound() {
        if (!this.audioContext || this.paintingOscillator) return;
        
        // Resume audio context if needed
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        let frequency;
        const note = this.currentNote || 'C';
        const octave = this.currentOctave || 3;
        
        if (note === 'synth') {
            frequency = 200 + Math.random() * 800;
        } else {
            frequency = this.noteFrequencies[note] * Math.pow(2, octave - 4);
        }
        
        // Create continuous oscillator
        this.paintingOscillator = this.audioContext.createOscillator();
        this.paintingGainNode = this.audioContext.createGain();
        
        this.paintingOscillator.connect(this.paintingGainNode);
        this.paintingGainNode.connect(this.audioContext.destination);
        
        this.paintingOscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        this.paintingOscillator.type = note === 'synth' ? 'sawtooth' : 'sine';
        
        // Set continuous volume
        this.paintingGainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        this.paintingGainNode.gain.linearRampToValueAtTime(0.05, this.audioContext.currentTime + 0.1);
        
        this.paintingOscillator.start(this.audioContext.currentTime);
    }
    
    stopContinuousPaintSound() {
        if (this.paintingOscillator && this.paintingGainNode) {
            // Fade out
            this.paintingGainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
            
            // Stop oscillator after fade
            setTimeout(() => {
                if (this.paintingOscillator) {
                    this.paintingOscillator.stop();
                    this.paintingOscillator = null;
                    this.paintingGainNode = null;
                }
            }, 100);
        }
    }
    
    handlePointerDown(e) {
        this.isDrawing = true;
        const coords = this.getCoordinates(e);
        this.lastX = coords.x;
        this.lastY = coords.y;
        
        switch(this.currentTool) {
            case 'water':
                this.startWatering(coords.x, coords.y);
                break;
            case 'flower':
                this.plantFlower(coords.x, coords.y);
                break;
            case 'vegetable':
                this.plantVegetable(coords.x, coords.y);
                break;
            case 'mower':
                this.startMowing(coords.x, coords.y);
                break;
            case 'paint':
                this.startPainting(coords.x, coords.y);
                break;
            case 'butterfly':
                this.spawnButterfly(coords.x, coords.y);
                break;
            case 'rainbow':
                this.createRainbow(coords.x, coords.y);
                break;
            case 'shapes':
                this.createShape(coords.x, coords.y);
                break;
            case 'pick-vegetable':
                this.harvestVegetable(coords.x, coords.y);
                break;
            case 'pick-flower':
                this.harvestFlower(coords.x, coords.y);
                break;
            case 'butterfly-net':
                this.catchButterfly(coords.x, coords.y);
                break;
            case 'broom':
                this.clearArt(coords.x, coords.y);
                break;
            case 'reset':
                this.resetGarden();
                break;
        }
    }
    
    handlePointerMove(e) {
        if (!this.isDrawing) return;
        
        const coords = this.getCoordinates(e);
        
        switch(this.currentTool) {
            case 'water':
                this.continueWatering(coords.x, coords.y);
                break;
            case 'flower':
                // Continuous drag-planting flowers (no distance check)
                this.plantFlower(coords.x, coords.y);
                break;
            case 'vegetable':
                // Continuous drag-planting vegetables (no distance check)
                this.plantVegetable(coords.x, coords.y);
                break;
            case 'mower':
                this.continueMowing(coords.x, coords.y);
                break;
            case 'paint':
                this.continuePainting(coords.x, coords.y);
                break;
        }
        
        this.lastX = coords.x;
        this.lastY = coords.y;
    }
    
    handlePointerUp() {
        this.isDrawing = false;
        this.currentStroke = null;
        
        // Stop continuous painting sound
        this.stopContinuousPaintSound();
    }
    
    getCoordinates(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = 1000 / rect.width;
        const scaleY = 700 / rect.height;
        
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }
    
    startWatering(x, y) {
        this.createWaterEffect(x, y);
        this.waterNearbyPlants(x, y);
        this.speakPraise('water');
        this.incrementActionCount();
    }
    
    continueWatering(x, y) {
        if (Math.random() < 0.6) {
            this.createWaterEffect(x, y);
            this.waterNearbyPlants(x, y);
        }
    }
    
    createWaterEffect(x, y) {
        // Canvas 2D water droplets
        for (let i = 0; i < 6; i++) {
            this.waterDrops.push({
                x: x + (Math.random() - 0.5) * 40,
                y: y + (Math.random() - 0.5) * 40,
                vx: (Math.random() - 0.5) * 2,
                vy: Math.random() * 2 + 1,
                life: 80,
                size: 3 + Math.random() * 3
            });
        }
        
        // Regrow nearby cut grass blades
        this.regrowGrass(x, y);
    }
    
    regrowGrass(x, y) {
        const regrowDistance = 80;
        this.grassBlades.forEach(blade => {
            const dist = Math.hypot(blade.x - x, blade.y - y);
            if (dist < regrowDistance && blade.cut) {
                // Gradually regrow the grass
                blade.cut = false;
                blade.height = blade.baseHeight * 0.5; // Start smaller
                blade.regrowing = true;
            }
        });
    }
        
        // Enhanced Pixi effects
        if (this.pixiApp) {
            for (let i = 0; i < 4; i++) {
                const particle = new PIXI.Graphics();
                particle.beginFill(0x4FC3F7, 0.8);
                particle.drawCircle(0, 0, 4 + Math.random() * 3);
                particle.endFill();
                
                particle.x = x + (Math.random() - 0.5) * 50;
                particle.y = y + (Math.random() - 0.5) * 50;
                particle.vx = (Math.random() - 0.5) * 3;
                particle.vy = Math.random() * 3 + 2;
                particle.life = 60;
                particle.maxLife = 60;
                
                this.effectContainer.addChild(particle);
                this.effects.push(particle);
            }
        }
    }
    
    waterNearbyPlants(x, y) {
        this.plants.forEach(plant => {
            const dist = Math.hypot(plant.x - x, plant.y - y);
            if (dist < 60 && plant.growthStage < 3) {
                plant.growthStage++;
                plant.size = plant.baseSize + plant.growthStage * 8;
            }
        });
    }
    
    plantFlower(x, y) {
        const flowers = ['🌸', '🌺', '🌻', '🌷', '🌹', '🌼', '🌊'];
        const flower = flowers[Math.floor(Math.random() * flowers.length)];
        
        this.plants.push({
            x, y,
            emoji: flower,
            type: 'flower',
            baseSize: 35,
            size: 35,
            growthStage: 1,
            bloomAnimation: 0
        });
        
        this.flowers++;
        this.stars += 2;
        this.updateUI();
        
        // Bloom sparkle effect
        if (this.pixiApp) {
            for (let i = 0; i < 8; i++) {
                const sparkle = new PIXI.Graphics();
                const colors = [0xFFD700, 0xFF69B4, 0x00CED1, 0x32CD32];
                const color = colors[Math.floor(Math.random() * colors.length)];
                
                sparkle.beginFill(color, 0.9);
                sparkle.drawPolygon([0,-6, 2,-2, 6,0, 2,2, 0,6, -2,2, -6,0, -2,-2]);
                sparkle.endFill();
                
                sparkle.x = x + (Math.random() - 0.5) * 60;
                sparkle.y = y + (Math.random() - 0.5) * 60;
                sparkle.vx = (Math.random() - 0.5) * 4;
                sparkle.vy = -Math.random() * 3 - 1;
                sparkle.rotation = Math.random() * Math.PI * 2;
                sparkle.rotationSpeed = (Math.random() - 0.5) * 0.2;
                sparkle.life = 40;
                sparkle.maxLife = 40;
                
                this.effectContainer.addChild(sparkle);
                this.effects.push(sparkle);
            }
        }
        
        this.speakPraise('plant');
        this.incrementActionCount();
        this.saveProgress();
    }
    
    plantVegetable(x, y) {
        const vegetables = ['🥕', '🍅', '🌽', '🥒', '🫑', '🥔'];
        const vegetable = vegetables[Math.floor(Math.random() * vegetables.length)];
        
        this.plants.push({
            x, y,
            emoji: vegetable,
            type: 'vegetable',
            baseSize: 30,
            size: 20, // Start smaller
            growthStage: 1
        });
        
        this.vegetables++;
        this.stars++;
        this.updateUI();
        
        this.speakPraise('plant');
        this.incrementActionCount();
        this.saveProgress();
    }
    
    startMowing(x, y) {
        this.mowGrass(x, y);
    }
    
    continueMowing(x, y) {
        this.mowGrass(x, y);
        
        // Create mowing trail
        this.paintStrokes.push({
            points: [{x: this.lastX, y: this.lastY}, {x, y}],
            color: '#8BC34A',
            size: 60,
            alpha: 0.3
        });
    }
    
    mowGrass(x, y) {
        let mowed = false;
        
        // First check for plants to mow down
        const plantsToRemove = [];
        this.plants.forEach((plant, index) => {
            const dist = Math.hypot(plant.x - x, plant.y - y);
            if (dist < 60) {
                plantsToRemove.push(index);
                mowed = true;
                
                // Create scattered plant debris
                for (let i = 0; i < 8; i++) {
                    if (this.pixiApp) {
                        const debris = new PIXI.Graphics();
                        debris.beginFill(plant.type === 'flower' ? 0xFFB6C1 : 0x8BC34A);
                        debris.drawRect(-3, -3, 6, 6);
                        debris.endFill();
                        
                        debris.x = plant.x + (Math.random() - 0.5) * 40;
                        debris.y = plant.y + (Math.random() - 0.5) * 40;
                        debris.vx = (Math.random() - 0.5) * 8;
                        debris.vy = -Math.random() * 5 - 2;
                        debris.rotation = Math.random() * Math.PI * 2;
                        debris.rotationSpeed = (Math.random() - 0.5) * 0.4;
                        debris.life = 40;
                        debris.maxLife = 40;
                        
                        this.effectContainer.addChild(debris);
                        this.effects.push(debris);
                    }
                }
            }
        });
        
        // Remove plants from back to front to maintain array integrity
        for (let i = plantsToRemove.length - 1; i >= 0; i--) {
            const removedPlant = this.plants.splice(plantsToRemove[i], 1)[0];
            if (removedPlant.type === 'flower') {
                this.flowers = Math.max(0, this.flowers - 1);
            } else if (removedPlant.type === 'vegetable') {
                this.vegetables = Math.max(0, this.vegetables - 1);
            }
        }
        
        // Then check grass blades
        this.grassBlades.forEach(blade => {
            const dist = Math.hypot(blade.x - x, blade.y - y);
            if (dist < 60 && !blade.cut) {
                blade.cut = true;
                mowed = true;
                
                // Grass clipping effects (reduced)
                for (let i = 0; i < 4; i++) {
                    if (this.pixiApp) {
                        const clipping = new PIXI.Graphics();
                        clipping.beginFill(0x4CAF50);
                        clipping.drawRect(-2, -4, 4, 8);
                        clipping.endFill();
                        
                        clipping.x = blade.x + (Math.random() - 0.5) * 20;
                        clipping.y = blade.y;
                        clipping.vx = (Math.random() - 0.5) * 6;
                        clipping.vy = -Math.random() * 4 - 3;
                        clipping.rotation = Math.random() * Math.PI * 2;
                        clipping.rotationSpeed = (Math.random() - 0.5) * 0.3;
                        clipping.life = 50;
                        clipping.maxLife = 50;
                        
                        this.effectContainer.addChild(clipping);
                        this.effects.push(clipping);
                    }
                }
            }
        });
        
        if (mowed) {
            this.stars++;
            this.updateUI();
            this.speakPraise('mow');
            this.incrementActionCount();
        }
    }
    
    startPainting(x, y) {
        this.currentStroke = {
            points: [{x, y}],
            color: this.paintColor,
            size: this.brushSize
        };
        this.paintStrokes.push(this.currentStroke);
        
        // Start continuous painting sound
        this.startContinuousPaintSound();
        
        this.incrementActionCount();
    }
    
    continuePainting(x, y) {
        if (this.currentStroke) {
            this.currentStroke.points.push({x, y});
        }
    }
    
    spawnButterfly(x, y) {
        const butterflyEmojis = ['🦋', '🧚‍♀️', '🧚‍♂️'];
        this.butterflies.push({
            x, y,
            emoji: butterflyEmojis[Math.floor(Math.random() * butterflyEmojis.length)],
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            size: 30,
            flutterPhase: Math.random() * Math.PI * 2
        });
        
        this.speakPraise('butterfly');
        this.incrementActionCount();
    }
    
    catchButterfly(x, y) {
        const catchDistance = 60;
        const butterfliesRemoved = [];
        
        this.butterflies.forEach((butterfly, index) => {
            const dist = Math.hypot(butterfly.x - x, butterfly.y - y);
            if (dist < catchDistance) {
                butterfliesRemoved.push(index);
                
                // Create sparkle effect when catching
                if (this.pixiApp) {
                    for (let i = 0; i < 8; i++) {
                        const sparkle = new PIXI.Graphics();
                        sparkle.beginFill(0xFFD700);
                        sparkle.drawPolygon([0, -6, 2, 0, 6, 0, 2, 2, 0, 6, -2, 2, -6, 0, -2, 0]);
                        sparkle.endFill();
                        
                        sparkle.x = butterfly.x + (Math.random() - 0.5) * 40;
                        sparkle.y = butterfly.y + (Math.random() - 0.5) * 40;
                        sparkle.vx = (Math.random() - 0.5) * 4;
                        sparkle.vy = -Math.random() * 3 - 1;
                        sparkle.rotation = Math.random() * Math.PI * 2;
                        sparkle.rotationSpeed = (Math.random() - 0.5) * 0.2;
                        sparkle.life = 60;
                        sparkle.maxLife = 60;
                        
                        this.effectContainer.addChild(sparkle);
                        this.effects.push(sparkle);
                    }
                }
            }
        });
        
        // Remove caught butterflies (from back to front)
        for (let i = butterfliesRemoved.length - 1; i >= 0; i--) {
            this.butterflies.splice(butterfliesRemoved[i], 1);
        }
        
        if (butterfliesRemoved.length > 0) {
            this.stars += butterfliesRemoved.length;
            this.updateUI();
            this.speakPraise('net');
            this.incrementActionCount();
        }
    }
    
    clearArt(x, y) {
        const clearDistance = 80;
        let itemsRemoved = false;
        
        // Remove paint strokes near click
        this.paintStrokes = this.paintStrokes.filter(stroke => {
            const strokeNear = stroke.points.some(point => 
                Math.hypot(point.x - x, point.y - y) < clearDistance
            );
            if (strokeNear) itemsRemoved = true;
            return !strokeNear;
        });
        
        // Remove shapes near click
        const shapesRemoved = [];
        this.shapes.forEach((shape, index) => {
            const dist = Math.hypot(shape.x - x, shape.y - y);
            if (dist < clearDistance) {
                shapesRemoved.push(index);
                itemsRemoved = true;
            }
        });
        
        // Remove shapes from back to front
        for (let i = shapesRemoved.length - 1; i >= 0; i--) {
            this.shapes.splice(shapesRemoved[i], 1);
        }
        
        if (itemsRemoved) {
            this.speakPraise('mow'); // Reuse mowing praise for cleaning
            this.incrementActionCount();
        }
    }
    
    createRainbow(x, y) {
        this.shapes.push({
            type: 'rainbow',
            x, y,
            size: 80,
            colors: ['#FF0000', '#FF8C00', '#FFD700', '#32CD32', '#00CED1', '#4B0082', '#8B008B']
        });
        
        this.speakPraise('paint');
        this.incrementActionCount();
    }
    
    createShape(x, y) {
        const shapes = ['⭐', '🌟', '💖', '❤️', '⚡', '🌙', '☀️', '✨'];
        this.shapes.push({
            x, y,
            emoji: shapes[Math.floor(Math.random() * shapes.length)],
            size: 30 + Math.random() * 20,
            rotation: Math.random() * 360,
            spin: (Math.random() - 0.5) * 3
        });
        
        this.incrementActionCount();
    }
    
    harvestVegetable(x, y) {
        for (let i = this.plants.length - 1; i >= 0; i--) {
            const plant = this.plants[i];
            const dist = Math.hypot(plant.x - x, plant.y - y);
            
            if (dist < 50 && plant.type === 'vegetable' && plant.growthStage >= 2) {
                this.plants.splice(i, 1);
                this.stars += 3;
                this.updateUI();
                
                this.createHarvestEffect(plant.x, plant.y, plant.emoji);
                this.speakPraise('harvest');
                this.incrementActionCount();
                this.saveProgress();
                break;
            }
        }
    }
    
    harvestFlower(x, y) {
        for (let i = this.plants.length - 1; i >= 0; i--) {
            const plant = this.plants[i];
            const dist = Math.hypot(plant.x - x, plant.y - y);
            
            if (dist < 50 && plant.type === 'flower') {
                this.plants.splice(i, 1);
                this.stars += 2;
                this.updateUI();
                
                this.createHarvestEffect(plant.x, plant.y, plant.emoji);
                this.speakPraise('harvest');
                this.incrementActionCount();
                this.saveProgress();
                break;
            }
        }
    }
    
    createHarvestEffect(x, y, emoji) {
        // Star burst effect
        if (this.pixiApp) {
            for (let i = 0; i < 12; i++) {
                const angle = (i / 12) * Math.PI * 2;
                const star = new PIXI.Graphics();
                star.beginFill(0xFFD700);
                star.drawPolygon([0,-8, 3,-3, 8,0, 3,3, 0,8, -3,3, -8,0, -3,-3]);
                star.endFill();
                
                star.x = x;
                star.y = y;
                star.vx = Math.cos(angle) * 4;
                star.vy = Math.sin(angle) * 4;
                star.life = 40;
                star.maxLife = 40;
                
                this.effectContainer.addChild(star);
                this.effects.push(star);
            }
        }
    }
    
    sweepArea(x, y) {
        let swept = false;
        
        // Remove paint strokes
        this.paintStrokes = this.paintStrokes.filter(stroke => {
            const minDist = Math.min(...stroke.points.map(p => 
                Math.hypot(p.x - x, p.y - y)
            ));
            if (minDist < 60) {
                swept = true;
                return false;
            }
            return true;
        });
        
        // Remove shapes
        this.shapes = this.shapes.filter(shape => {
            const dist = Math.hypot(shape.x - x, shape.y - y);
            if (dist < 60) {
                swept = true;
                return false;
            }
            return true;
        });
        
        if (swept) {
            // Dust effect
            if (this.pixiApp) {
                for (let i = 0; i < 8; i++) {
                    const dust = new PIXI.Graphics();
                    dust.beginFill(0xC0C0C0, 0.6);
                    dust.drawCircle(0, 0, 3);
                    dust.endFill();
                    
                    dust.x = x + (Math.random() - 0.5) * 40;
                    dust.y = y;
                    dust.vx = (Math.random() - 0.5) * 4;
                    dust.vy = -Math.random() * 2 - 1;
                    dust.life = 30;
                    dust.maxLife = 30;
                    
                    this.effectContainer.addChild(dust);
                    this.effects.push(dust);
                }
            }
        }
    }
    
    resetGarden() {
        this.plants = [];
        this.waterDrops = [];
        this.createSwayingGrass(); // Recreate grass
        this.butterflies = [];
        this.animals = [];
        this.paintStrokes = [];
        this.shapes = [];
        
        // Clear Pixi effects
        if (this.effectContainer) {
            this.effectContainer.removeChildren();
        }
        this.effects = [];
        
        this.stars = 0;
        this.flowers = 0;
        this.vegetables = 0;
        this.actionCount = 0;
        
        this.createInitialGrassPatches();
        this.updateUI();
        
        this.speakPraise('celebration', 'Fresh new garden!');
        this.saveProgress();
    }
    
    spawnAnimal() {
        const animalType = this.animalTypes[Math.floor(Math.random() * this.animalTypes.length)];
        const side = Math.random() > 0.5 ? 'left' : 'right';
        
        this.animals.push({
            ...animalType,
            x: side === 'left' ? -50 : 1050,
            y: 400 + Math.random() * 200,
            vx: side === 'left' ? animalType.speed : -animalType.speed,
            vy: (Math.random() - 0.5) * 0.8,
            bouncePhase: Math.random() * Math.PI * 2
        });
        
        setTimeout(() => {
            if (animalType.name === 'Lux') {
                // Use special phrases for Lux
                const luxPhrase = this.luxPhrases[Math.floor(Math.random() * this.luxPhrases.length)];
                this.speakPraise('celebration', luxPhrase);
            } else {
                this.speakPraise('celebration', `Look, a ${animalType.name}!`);
            }
        }, 500);
    }
    
    speakPraise(category, customMessage = null) {
        if (!this.voiceEnabled || !this.currentVoice) return;
        
        const message = customMessage || 
            this.praisePhrases[category][Math.floor(Math.random() * this.praisePhrases[category].length)];
        
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.voice = this.currentVoice;
        utterance.rate = 0.85; // Slightly slower for more natural speech
        utterance.pitch = 1.2;  // Less high-pitched, more natural
        utterance.volume = 0.9;
        
        speechSynthesis.cancel();
        speechSynthesis.speak(utterance);
    }
    
    incrementActionCount() {
        this.actionCount++;
        
        if (this.actionCount % 15 === 0) {
            this.createCelebration();
        }
        
        // Spawn animals more frequently
        if (this.actionCount % 12 === 0 && this.animals.length < 2 && Math.random() < 0.6) {
            this.spawnAnimal();
        }
    }
    
    createCelebration() {
        if (this.pixiApp) {
            const colors = [0xFF0000, 0xFF8C00, 0xFFD700, 0x32CD32, 0x1E90FF, 0x8A2BE2, 0xFF69B4];
            
            for (let i = 0; i < 30; i++) {
                const confetti = new PIXI.Graphics();
                confetti.beginFill(colors[Math.floor(Math.random() * colors.length)]);
                confetti.drawRect(-4, -8, 8, 16);
                confetti.endFill();
                
                confetti.x = Math.random() * 1000;
                confetti.y = -20;
                confetti.vx = (Math.random() - 0.5) * 8;
                confetti.vy = Math.random() * 4 + 3;
                confetti.rotation = Math.random() * Math.PI * 2;
                confetti.rotationSpeed = (Math.random() - 0.5) * 0.4;
                confetti.life = 120;
                confetti.maxLife = 120;
                
                this.effectContainer.addChild(confetti);
                this.effects.push(confetti);
            }
        }
        
        this.speakPraise('celebration');
    }
    
    updateUI() {
        // UI elements removed for cleaner interface
        // Keeping function for compatibility but doing nothing
    }
    
    saveProgress() {
        const saveData = {
            plants: this.plants,
            stars: this.stars,
            flowers: this.flowers,
            vegetables: this.vegetables,
            actionCount: this.actionCount,
            paintStrokes: this.paintStrokes,
            shapes: this.shapes,
            timestamp: Date.now()
        };
        
        try {
            localStorage.setItem('mirasYardEnhanced', JSON.stringify(saveData));
        } catch (e) {
            console.warn('Failed to save progress:', e);
        }
    }
    
    loadProgress() {
        try {
            const saved = localStorage.getItem('mirasYardEnhanced');
            if (saved) {
                const data = JSON.parse(saved);
                
                this.plants = data.plants || [];
                this.stars = data.stars || 0;
                this.flowers = data.flowers || 0;
                this.vegetables = data.vegetables || 0;
                this.actionCount = data.actionCount || 0;
                this.paintStrokes = data.paintStrokes || [];
                this.shapes = data.shapes || [];
                
                this.updateUI();
                
                setTimeout(() => {
                    this.speakPraise('celebration', 'Welcome back to your beautiful garden!');
                }, 1000);
                
                console.log('Progress loaded successfully');
            }
        } catch (e) {
            console.log('No saved progress found');
        }
    }
    
    update() {
        // Update swaying grass blades
        this.grassBlades.forEach(blade => {
            if (!blade.cut) {
                blade.swayPhase += blade.swaySpeed;
                
                // Handle regrowing grass
                if (blade.regrowing && blade.height < blade.baseHeight) {
                    blade.height += 0.3; // Slow regrowth
                    if (blade.height >= blade.baseHeight) {
                        blade.height = blade.baseHeight;
                        blade.regrowing = false;
                    }
                }
            }
        });
        
        // Update water drops
        this.waterDrops = this.waterDrops.filter(drop => {
            drop.x += drop.vx;
            drop.y += drop.vy;
            drop.vy += 0.2; // Gravity
            drop.life--;
            return drop.life > 0;
        });
        
        // Update butterflies
        this.butterflies.forEach(butterfly => {
            butterfly.flutterPhase += 0.2;
            butterfly.vx += (Math.random() - 0.5) * 0.2;
            butterfly.vy += (Math.random() - 0.5) * 0.2;
            
            butterfly.x += butterfly.vx;
            butterfly.y += butterfly.vy;
            
            // Keep on screen
            if (butterfly.x < 0 || butterfly.x > 1000) butterfly.vx *= -1;
            if (butterfly.y < 0 || butterfly.y > 700) butterfly.vy *= -1;
            
            // Limit speed
            butterfly.vx *= 0.98;
            butterfly.vy *= 0.98;
        });
        
        // Update animals
        this.animals = this.animals.filter(animal => {
            animal.x += animal.vx;
            animal.y += animal.vy;
            animal.bouncePhase += animal.speed * 0.1;
            
            return animal.x > -100 && animal.x < 1100;
        });
        
        // Update Pixi effects
        if (this.pixiApp) {
            for (let i = this.effects.length - 1; i >= 0; i--) {
                const effect = this.effects[i];
                
                effect.life--;
                
                if (effect.vx !== undefined) {
                    effect.x += effect.vx;
                    effect.y += effect.vy;
                    effect.vy += 0.15; // Gravity
                }
                
                if (effect.rotationSpeed) {
                    effect.rotation += effect.rotationSpeed;
                }
                
                // Fade out
                if (effect.maxLife) {
                    effect.alpha = effect.life / effect.maxLife;
                }
                
                if (effect.life <= 0) {
                    this.effectContainer.removeChild(effect);
                    effect.destroy();
                    this.effects.splice(i, 1);
                }
            }
        }
    }
    
    render() {
        if (!this.ctx || !this.canvas) {
            console.log('❌ Render called without canvas/context');
            return;
        }
        
        // Clear canvas with darker grass green
        this.ctx.fillStyle = '#5D8C2A'; // Darker green background
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw swaying grass blades with scimitar curves
        this.grassBlades.forEach(blade => {
            if (!blade.cut) {
                // Calculate sway animation
                const swayOffset = Math.sin(blade.swayPhase) * blade.swayAmount;
                
                this.ctx.strokeStyle = blade.color;
                this.ctx.lineWidth = blade.width;
                this.ctx.lineCap = 'round';
                
                this.ctx.beginPath();
                this.ctx.moveTo(blade.x, blade.y);
                
                // Create curved scimitar-like blade with multiple control points
                const midX = blade.x + swayOffset * 0.3 + blade.curve * 3;
                const midY = blade.y - blade.height * 0.4;
                const tipX = blade.x + swayOffset + blade.curve * 8;
                const tipY = blade.y - blade.height;
                
                // Use bezier curve for more natural scimitar shape
                this.ctx.bezierCurveTo(
                    blade.x + 1, blade.y - blade.height * 0.2, // Control point 1
                    midX, midY, // Control point 2
                    tipX, tipY  // End point
                );
                this.ctx.stroke();
            }
        });
        
        // Draw water drops
        this.ctx.fillStyle = 'rgba(76, 195, 247, 0.7)';
        this.waterDrops.forEach(drop => {
            const alpha = drop.life / 80;
            this.ctx.globalAlpha = alpha;
            this.ctx.beginPath();
            this.ctx.arc(drop.x, drop.y, drop.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1;
        
        // Draw paint strokes
        this.paintStrokes.forEach(stroke => {
            if (stroke.points.length > 1) {
                this.ctx.strokeStyle = stroke.color;
                this.ctx.lineWidth = stroke.size;
                this.ctx.lineCap = 'round';
                this.ctx.lineJoin = 'round';
                this.ctx.globalAlpha = stroke.alpha || 1;
                
                this.ctx.beginPath();
                this.ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
                stroke.points.forEach(point => {
                    this.ctx.lineTo(point.x, point.y);
                });
                this.ctx.stroke();
            }
        });
        this.ctx.globalAlpha = 1;
        
        // Draw shapes
        this.shapes.forEach(shape => {
            this.ctx.save();
            this.ctx.translate(shape.x, shape.y);
            
            if (shape.type === 'rainbow') {
                shape.colors.forEach((color, i) => {
                    this.ctx.strokeStyle = color;
                    this.ctx.lineWidth = 6;
                    this.ctx.globalAlpha = 0.8;
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, shape.size - i * 8, Math.PI, 0, true);
                    this.ctx.stroke();
                });
                this.ctx.globalAlpha = 1;
            } else {
                if (shape.spin) {
                    shape.rotation += shape.spin;
                    this.ctx.rotate(shape.rotation * Math.PI / 180);
                }
                
                this.ctx.font = `${shape.size}px Arial`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(shape.emoji, 0, 0);
            }
            
            this.ctx.restore();
        });
        
        // Draw plants
        this.plants.forEach(plant => {
            this.ctx.font = `${plant.size}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            // Shadow
            this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
            this.ctx.fillText(plant.emoji, plant.x + 2, plant.y + 2);
            
            // Main plant
            this.ctx.fillStyle = '#000000';
            this.ctx.fillText(plant.emoji, plant.x, plant.y);
        });
        
        // Draw butterflies
        this.butterflies.forEach(butterfly => {
            const flutter = Math.sin(butterfly.flutterPhase) * 0.2;
            
            this.ctx.save();
            this.ctx.translate(butterfly.x, butterfly.y);
            this.ctx.rotate(flutter);
            this.ctx.scale(1 + Math.sin(butterfly.flutterPhase * 2) * 0.1, 1);
            
            this.ctx.font = `${butterfly.size}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(butterfly.emoji, 0, 0);
            
            this.ctx.restore();
        });
        
        // Draw animals
        this.animals.forEach(animal => {
            const bounce = Math.sin(animal.bouncePhase) * 3;
            
            this.ctx.save();
            this.ctx.translate(animal.x, animal.y + bounce);
            
            if (animal.vx < 0) {
                this.ctx.scale(-1, 1);
            }
            
            this.ctx.font = `${animal.size}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            // Shadow
            this.ctx.fillStyle = 'rgba(0,0,0,0.2)';
            this.ctx.fillText(animal.emoji, 1, 1);
            
            // Main animal
            this.ctx.fillStyle = 'black';
            this.ctx.fillText(animal.emoji, 0, 0);
            
            this.ctx.restore();
        });
    }
    
    gameLoop() {
        if (!this.loopStarted) {
            console.log('🔄 Game loop starting...');
            this.loopStarted = true;
            this.frameCount = 0;
        }
        
        this.frameCount++;
        
        // Log every 60 frames (about once per second)
        if (this.frameCount % 60 === 0) {
            console.log(`Frame ${this.frameCount} - Canvas:`, this.canvas?.width, 'Context:', !!this.ctx);
        }
        
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize the enhanced game
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM ready, starting enhanced garden...');
    
    const splash = document.getElementById('splash-screen');
    const gameContainer = document.getElementById('game-container');
    let garden = null;
    
    const startGame = () => {
        console.log('Starting enhanced garden...');
        
        try {
            // Hide splash
            if (splash) {
                splash.classList.add('hide');
            }
            
            // Show game container IMMEDIATELY so canvas can get dimensions
            if (gameContainer) {
                gameContainer.style.display = 'flex';
                gameContainer.classList.add('show');
            }
            
            // Initialize after a short delay to ensure DOM is ready
            setTimeout(() => {
                if (splash) {
                    splash.style.display = 'none';
                }
                
                try {
                    // Initialize enhanced garden
                    console.log('Creating MirasYardEnhanced instance...');
                    garden = new MirasYardEnhanced();
                    
                    // Make globally accessible for debugging
                    window.garden = garden;
                    
                    console.log('Enhanced garden started successfully!');
                } catch (error) {
                    console.error('Error initializing MirasYardEnhanced:', error);
                    console.error('Stack trace:', error.stack);
                }
            }, 100);
        } catch (error) {
            console.error('Error in startGame:', error);
        }
    };
    
    // Click/touch to start
    splash.addEventListener('click', startGame);
    splash.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startGame();
    }, { passive: false });
    
    // Auto-start after 4 seconds
    setTimeout(startGame, 4000);
    
    console.log('Enhanced garden ready to start!');
});
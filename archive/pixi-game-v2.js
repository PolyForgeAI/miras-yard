// Mira's Yard - Pixi.js Implementation V2
// Fixed initialization and rendering issues

console.log('Starting Pixi.js Game V2...');

class MirasYardPixi {
    constructor() {
        console.log('Initializing MirasYardPixi...');
        
        // Hide splash screen first
        this.hideSplashScreen();
        
        // Initialize Pixi Application
        this.initPixiApp();
        
        // Game state
        this.initGameState();
        
        // Create scene layers
        this.createSceneLayers();
        
        // Initialize systems
        this.initializeSystems();
        
        // Start the game
        this.startGame();
    }
    
    hideSplashScreen() {
        const splash = document.getElementById('splash-screen');
        if (splash) {
            splash.style.display = 'none';
            console.log('Splash screen hidden');
        }
    }
    
    initPixiApp() {
        try {
            console.log('Creating PIXI application...');
            
            // Get the game area for sizing
            const gameArea = document.querySelector('.game-area');
            const rect = gameArea.getBoundingClientRect();
            
            this.app = new PIXI.Application({
                width: rect.width || 800,
                height: rect.height || 600,
                backgroundColor: 0x7CB342,
                antialias: true,
                resolution: window.devicePixelRatio || 1,
                autoDensity: true
            });
            
            console.log('PIXI app created:', this.app);
            
            // Replace the canvas
            const oldCanvas = document.getElementById('garden-canvas');
            if (oldCanvas) {
                oldCanvas.parentNode.replaceChild(this.app.view, oldCanvas);
                this.app.view.id = 'garden-canvas';
                
                // Apply the original canvas styles
                this.app.view.style.width = '100%';
                this.app.view.style.height = '100%';
                this.app.view.style.maxWidth = '1400px';
                this.app.view.style.maxHeight = '900px';
                this.app.view.style.border = '4px solid #8B4513';
                this.app.view.style.borderRadius = '15px';
                this.app.view.style.boxShadow = '0 0 30px rgba(0, 0, 0, 0.2), inset 0 0 40px rgba(255, 255, 255, 0.1)';
                this.app.view.style.touchAction = 'none';
                
                console.log('Canvas replaced successfully');
            }
            
        } catch (error) {
            console.error('Failed to create PIXI application:', error);
            throw error;
        }
    }
    
    initGameState() {
        console.log('Initializing game state...');
        
        this.currentTool = 'water';
        this.isDrawing = false;
        
        // Collections
        this.grassPatches = [];
        this.plants = [];
        this.butterflies = [];
        this.animals = [];
        this.effects = [];
        this.paintStrokes = [];
        this.shapes = [];
        
        // Counters
        this.flowerCount = 0;
        this.vegetableCount = 0;
        this.grassCount = 0;
        this.starSeeds = 0;
        this.actionCount = 0;
        
        // Settings
        this.paintColor = 0xFF0000;
        this.brushSize = 35;
        
        console.log('Game state initialized');
    }
    
    createSceneLayers() {
        console.log('Creating scene layers...');
        
        // Create containers for different layers (back to front)
        this.backgroundContainer = new PIXI.Container();
        this.grassContainer = new PIXI.Container();
        this.paintContainer = new PIXI.Container();
        this.plantContainer = new PIXI.Container();
        this.animalContainer = new PIXI.Container();
        this.effectContainer = new PIXI.Container();
        this.uiContainer = new PIXI.Container();
        
        // Add to stage in order
        this.app.stage.addChild(this.backgroundContainer);
        this.app.stage.addChild(this.grassContainer);
        this.app.stage.addChild(this.paintContainer);
        this.app.stage.addChild(this.plantContainer);
        this.app.stage.addChild(this.animalContainer);
        this.app.stage.addChild(this.effectContainer);
        this.app.stage.addChild(this.uiContainer);
        
        console.log('Scene layers created');
    }
    
    initializeSystems() {
        console.log('Initializing systems...');
        
        // Initialize garden
        this.createBackground();
        this.createInitialGrassPatches();
        
        // Initialize voice system
        this.initializeVoice();
        
        // Initialize animals
        this.initializeAnimals();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load saved progress
        this.loadProgress();
        
        console.log('Systems initialized');
    }
    
    createBackground() {
        // Create a grass texture background
        const texture = this.createGrassTexture();
        const tilingSprite = new PIXI.TilingSprite(texture, this.app.screen.width, this.app.screen.height);
        this.backgroundContainer.addChild(tilingSprite);
        
        console.log('Background created');
    }
    
    createGrassTexture() {
        const graphics = new PIXI.Graphics();
        const size = 64;
        
        // Base grass color
        graphics.beginFill(0x7CB342);
        graphics.drawRect(0, 0, size, size);
        graphics.endFill();
        
        // Add grass blade details
        graphics.lineStyle(1, 0x5D8C2F, 0.8);
        for (let i = 0; i < 8; i++) {
            const x = Math.random() * size;
            const y = size - Math.random() * 20;
            const height = 8 + Math.random() * 8;
            const curve = (Math.random() - 0.5) * 4;
            
            graphics.moveTo(x, y);
            graphics.quadraticCurveTo(x + curve, y - height/2, x + curve, y - height);
        }
        
        const texture = this.app.renderer.generateTexture(graphics);
        graphics.destroy();
        return texture;
    }
    
    createInitialGrassPatches() {
        // Create tall grass patches for mowing
        for (let i = 0; i < 20; i++) {
            this.createGrassPatch();
        }
        
        console.log('Initial grass patches created');
    }
    
    createGrassPatch() {
        const patch = new PIXI.Container();
        
        const graphics = new PIXI.Graphics();
        const width = 50 + Math.random() * 30;
        const height = 30 + Math.random() * 20;
        
        // Draw tall grass blades
        graphics.lineStyle(2, 0x4CAF50, 0.8);
        
        for (let i = 0; i < 15; i++) {
            const x = (Math.random() - 0.5) * width;
            const bladeHeight = height * (0.8 + Math.random() * 0.4);
            const curve = (Math.random() - 0.5) * 8;
            
            graphics.moveTo(x, 0);
            graphics.quadraticCurveTo(x + curve, -bladeHeight/2, x + curve/2, -bladeHeight);
        }
        
        patch.addChild(graphics);
        patch.x = Math.random() * this.app.screen.width;
        patch.y = Math.random() * this.app.screen.height * 0.8 + this.app.screen.height * 0.2;
        patch.isCut = false;
        
        this.grassContainer.addChild(patch);
        this.grassPatches.push(patch);
    }
    
    initializeVoice() {
        this.voiceEnabled = 'speechSynthesis' in window;
        this.currentVoice = null;
        
        if (this.voiceEnabled) {
            const setVoice = () => {
                const voices = speechSynthesis.getVoices();
                this.currentVoice = voices.find(v => 
                    v.name.includes('female') || 
                    v.name.includes('Female') ||
                    v.lang.startsWith('en')
                ) || voices[0];
            };
            
            if (speechSynthesis.getVoices().length === 0) {
                speechSynthesis.onvoiceschanged = setVoice;
            } else {
                setVoice();
            }
        }
        
        this.praisePhrases = {
            water: ['Good watering!', 'Plants love water!', 'Nice job!'],
            plant: ['Beautiful planting!', 'Growing nicely!', 'Great work!'],
            harvest: ['Perfect harvest!', 'Yummy vegetables!', 'Well done!'],
            mow: ['Nice mowing!', 'Grass looks great!', 'Good cutting!'],
            paint: ['Pretty colors!', 'Beautiful art!', 'So creative!'],
            celebration: ['Amazing work!', 'You did it!', 'Fantastic!']
        };
        
        console.log('Voice system initialized');
    }
    
    initializeAnimals() {
        this.animalTypes = [
            { emoji: '🐕', size: 50, speed: 2 },
            { emoji: '🐈', size: 40, speed: 1.5 },
            { emoji: '🐰', size: 35, speed: 3 },
            { emoji: '🐦', size: 25, speed: 4 },
            { emoji: '🦆', size: 45, speed: 1.8 }
        ];
        
        // Spawn animals periodically
        setInterval(() => {
            if (Math.random() < 0.3 && this.animals.length < 3) {
                this.spawnAnimal();
            }
        }, 8000);
        
        console.log('Animal system initialized');
    }
    
    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Tool selection
        document.querySelectorAll('.tool').forEach(tool => {
            tool.addEventListener('click', () => {
                document.querySelectorAll('.tool').forEach(t => t.classList.remove('active'));
                tool.classList.add('active');
                this.currentTool = tool.dataset.tool;
                
                // Show/hide paint controls
                const paintControls = document.getElementById('paint-controls');
                if (paintControls) {
                    paintControls.style.display = this.currentTool === 'paint' ? 'flex' : 'none';
                }
            });
        });
        
        // Paint controls
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', () => {
                const colorHex = option.dataset.color;
                this.paintColor = parseInt(colorHex.replace('#', '0x'));
                document.querySelectorAll('.color-option').forEach(c => c.classList.remove('selected'));
                option.classList.add('selected');
            });
        });
        
        document.querySelectorAll('.brush-size').forEach(option => {
            option.addEventListener('click', () => {
                this.brushSize = parseInt(option.dataset.size);
                document.querySelectorAll('.brush-size').forEach(b => b.classList.remove('selected'));
                option.classList.add('selected');
            });
        });
        
        // Canvas interactions
        this.app.view.addEventListener('pointerdown', (e) => this.handlePointerDown(e));
        this.app.view.addEventListener('pointermove', (e) => this.handlePointerMove(e));
        this.app.view.addEventListener('pointerup', () => this.handlePointerUp());
        
        // Touch events
        this.app.view.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.handlePointerDown(touch);
        }, { passive: false });
        
        this.app.view.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.isDrawing) {
                const touch = e.touches[0];
                this.handlePointerMove(touch);
            }
        }, { passive: false });
        
        this.app.view.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.handlePointerUp();
        }, { passive: false });
        
        console.log('Event listeners set up');
    }
    
    handlePointerDown(e) {
        this.isDrawing = true;
        const coords = this.getCoordinates(e);
        
        switch(this.currentTool) {
            case 'water':
                this.startWatering(coords.x, coords.y);
                break;
            case 'vegetable':
                this.plantVegetable(coords.x, coords.y);
                break;
            case 'flower':
                this.plantFlower(coords.x, coords.y);
                break;
            case 'mower':
                this.startMowing(coords.x, coords.y);
                break;
            case 'pick-vegetable':
                this.harvestVegetable(coords.x, coords.y);
                break;
            case 'pick-flower':
                this.harvestFlower(coords.x, coords.y);
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
            case 'mower':
                this.continueMowing(coords.x, coords.y);
                break;
            case 'paint':
                this.continuePainting(coords.x, coords.y);
                break;
        }
    }
    
    handlePointerUp() {
        this.isDrawing = false;
        this.lastPaintPoint = null;
        this.lastMowerPoint = null;
    }
    
    getCoordinates(e) {
        const rect = this.app.view.getBoundingClientRect();
        const scaleX = this.app.screen.width / rect.width;
        const scaleY = this.app.screen.height / rect.height;
        
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }
    
    startWatering(x, y) {
        this.createWaterParticles(x, y);
        this.waterNearbyPlants(x, y);
        this.speakPraise('water');
        this.incrementActionCount();
    }
    
    continueWatering(x, y) {
        if (Math.random() < 0.5) {
            this.createWaterParticles(x, y);
            this.waterNearbyPlants(x, y);
        }
    }
    
    createWaterParticles(x, y) {
        for (let i = 0; i < 5; i++) {
            const particle = new PIXI.Graphics();
            particle.beginFill(0x4FC3F7, 0.7);
            particle.drawCircle(0, 0, 3 + Math.random() * 3);
            particle.endFill();
            
            particle.x = x + (Math.random() - 0.5) * 40;
            particle.y = y + (Math.random() - 0.5) * 40;
            particle.vx = (Math.random() - 0.5) * 2;
            particle.vy = Math.random() * 2 + 1;
            particle.life = 60;
            
            this.effectContainer.addChild(particle);
            this.effects.push(particle);
        }
    }
    
    waterNearbyPlants(x, y) {
        this.plants.forEach(plant => {
            const dist = Math.hypot(plant.x - x, plant.y - y);
            if (dist < 60 && plant.growthStage < 3) {
                plant.growthStage++;
                const newScale = 0.6 + plant.growthStage * 0.2;
                plant.scale.set(newScale);
            }
        });
    }
    
    plantVegetable(x, y) {
        const vegetables = ['🥕', '🍅', '🌽', '🥒', '🫑'];
        const vegEmoji = vegetables[Math.floor(Math.random() * vegetables.length)];
        
        const text = new PIXI.Text(vegEmoji, {
            fontSize: 35,
            fontFamily: 'Arial'
        });
        
        text.anchor.set(0.5);
        text.x = x;
        text.y = y;
        text.scale.set(0.6);
        text.growthStage = 1;
        text.type = 'vegetable';
        
        this.plantContainer.addChild(text);
        this.plants.push(text);
        this.vegetableCount++;
        
        this.speakPraise('plant');
        this.incrementActionCount();
        this.saveProgress();
    }
    
    plantFlower(x, y) {
        const flowers = ['🌸', '🌺', '🌻', '🌷', '🌹'];
        const flowerEmoji = flowers[Math.floor(Math.random() * flowers.length)];
        
        const text = new PIXI.Text(flowerEmoji, {
            fontSize: 40,
            fontFamily: 'Arial'
        });
        
        text.anchor.set(0.5);
        text.x = x;
        text.y = y;
        text.type = 'flower';
        
        // Bloom animation
        text.scale.set(0);
        this.animateBloom(text);
        
        this.plantContainer.addChild(text);
        this.plants.push(text);
        this.flowerCount++;
        
        this.speakPraise('plant');
        this.incrementActionCount();
        this.saveProgress();
    }
    
    animateBloom(flower) {
        const bloomTween = () => {
            flower.scale.x += 0.05;
            flower.scale.y += 0.05;
            
            if (flower.scale.x < 1) {
                requestAnimationFrame(bloomTween);
            }
        };
        bloomTween();
    }
    
    startMowing(x, y) {
        this.mowGrass(x, y);
        this.lastMowerPoint = { x, y };
    }
    
    continueMowing(x, y) {
        this.mowGrass(x, y);
        
        if (this.lastMowerPoint) {
            // Create mowing trail
            const trail = new PIXI.Graphics();
            trail.lineStyle(60, 0x8BC34A, 0.5);
            trail.moveTo(this.lastMowerPoint.x, this.lastMowerPoint.y);
            trail.lineTo(x, y);
            
            this.grassContainer.addChildAt(trail, 0); // Behind grass patches
        }
        
        this.lastMowerPoint = { x, y };
    }
    
    mowGrass(x, y) {
        this.grassPatches.forEach(patch => {
            const dist = Math.hypot(patch.x - x, patch.y - y);
            if (dist < 60 && !patch.isCut) {
                patch.isCut = true;
                patch.alpha = 0.3;
                this.grassCount++;
                
                // Create grass clippings
                for (let i = 0; i < 8; i++) {
                    const clipping = new PIXI.Graphics();
                    clipping.beginFill(0x4CAF50);
                    clipping.drawRect(0, 0, 3, 6);
                    clipping.endFill();
                    
                    clipping.x = patch.x + (Math.random() - 0.5) * 40;
                    clipping.y = patch.y;
                    clipping.vx = (Math.random() - 0.5) * 4;
                    clipping.vy = -Math.random() * 3 - 2;
                    clipping.rotation = Math.random() * Math.PI;
                    clipping.life = 60;
                    
                    this.effectContainer.addChild(clipping);
                    this.effects.push(clipping);
                }
            }
        });
        
        this.speakPraise('mow');
        this.incrementActionCount();
    }
    
    harvestVegetable(x, y) {
        for (let i = this.plants.length - 1; i >= 0; i--) {
            const plant = this.plants[i];
            const dist = Math.hypot(plant.x - x, plant.y - y);
            
            if (dist < 50 && plant.type === 'vegetable' && plant.growthStage >= 2) {
                // Animate to harvest area
                this.animateHarvest(plant, this.app.screen.width - 100, 100);
                
                this.plants.splice(i, 1);
                this.starSeeds += 2;
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
                // Animate to vase area
                this.animateHarvest(plant, this.app.screen.width - 100, 200);
                
                this.plants.splice(i, 1);
                this.starSeeds += 3;
                this.speakPraise('harvest');
                this.incrementActionCount();
                this.saveProgress();
                break;
            }
        }
    }
    
    animateHarvest(plant, targetX, targetY) {
        const animate = () => {
            plant.x += (targetX - plant.x) * 0.1;
            plant.y += (targetY - plant.y) * 0.1;
            plant.scale.x *= 0.98;
            plant.scale.y *= 0.98;
            
            if (Math.abs(plant.x - targetX) > 5) {
                requestAnimationFrame(animate);
            } else {
                this.plantContainer.removeChild(plant);
                plant.destroy();
            }
        };
        animate();
    }
    
    startPainting(x, y) {
        this.currentStroke = new PIXI.Graphics();
        this.currentStroke.lineStyle(this.brushSize, this.paintColor, 1);
        this.currentStroke.moveTo(x, y);
        
        this.paintContainer.addChild(this.currentStroke);
        this.paintStrokes.push(this.currentStroke);
        this.lastPaintPoint = { x, y };
    }
    
    continuePainting(x, y) {
        if (this.currentStroke && this.lastPaintPoint) {
            this.currentStroke.lineTo(x, y);
            this.lastPaintPoint = { x, y };
        }
    }
    
    spawnButterfly(x, y) {
        const text = new PIXI.Text('🦋', {
            fontSize: 35,
            fontFamily: 'Arial'
        });
        
        text.anchor.set(0.5);
        text.x = x;
        text.y = y;
        text.vx = (Math.random() - 0.5) * 2;
        text.vy = (Math.random() - 0.5) * 2;
        
        this.animalContainer.addChild(text);
        this.butterflies.push(text);
        
        this.speakPraise('butterfly');
        this.incrementActionCount();
    }
    
    createRainbow(x, y) {
        const graphics = new PIXI.Graphics();
        const colors = [0xFF0000, 0xFF8C00, 0xFFD700, 0x32CD32, 0x00CED1, 0x4B0082, 0x8B008B];
        
        colors.forEach((color, i) => {
            graphics.lineStyle(8, color, 0.8);
            graphics.arc(x, y, 80 + i * 10, Math.PI, 0, true);
        });
        
        this.effectContainer.addChild(graphics);
        this.shapes.push(graphics);
        
        this.speakPraise('paint');
        this.incrementActionCount();
    }
    
    createShape(x, y) {
        const shapes = ['⭐', '❤️', '⚡', '🌙', '☀️', '🌟'];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        
        const text = new PIXI.Text(shape, {
            fontSize: 40 + Math.random() * 20,
            fontFamily: 'Arial'
        });
        
        text.anchor.set(0.5);
        text.x = x;
        text.y = y;
        text.rotation = Math.random() * Math.PI * 2;
        
        this.effectContainer.addChild(text);
        this.shapes.push(text);
        
        this.incrementActionCount();
    }
    
    spawnAnimal() {
        const animalType = this.animalTypes[Math.floor(Math.random() * this.animalTypes.length)];
        const side = Math.random() > 0.5 ? 'left' : 'right';
        
        const text = new PIXI.Text(animalType.emoji, {
            fontSize: animalType.size,
            fontFamily: 'Arial'
        });
        
        text.anchor.set(0.5);
        text.x = side === 'left' ? -50 : this.app.screen.width + 50;
        text.y = this.app.screen.height * 0.6 + Math.random() * this.app.screen.height * 0.3;
        text.vx = side === 'left' ? animalType.speed : -animalType.speed;
        text.vy = (Math.random() - 0.5) * 0.5;
        
        this.animalContainer.addChild(text);
        this.animals.push(text);
    }
    
    resetGarden() {
        // Clear all containers
        this.grassContainer.removeChildren();
        this.paintContainer.removeChildren();
        this.plantContainer.removeChildren();
        this.animalContainer.removeChildren();
        this.effectContainer.removeChildren();
        
        // Reset arrays
        this.grassPatches = [];
        this.plants = [];
        this.butterflies = [];
        this.animals = [];
        this.effects = [];
        this.paintStrokes = [];
        this.shapes = [];
        
        // Reset counters
        this.flowerCount = 0;
        this.vegetableCount = 0;
        this.grassCount = 0;
        this.starSeeds = 0;
        this.actionCount = 0;
        
        // Recreate initial state
        this.createBackground();
        this.createInitialGrassPatches();
        
        this.speakPraise('celebration', 'Fresh new garden!');
        this.saveProgress();
    }
    
    speakPraise(category, customMessage = null) {
        if (!this.voiceEnabled || !this.currentVoice) return;
        
        const message = customMessage || 
            this.praisePhrases[category][Math.floor(Math.random() * this.praisePhrases[category].length)];
        
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.voice = this.currentVoice;
        utterance.rate = 0.9;
        utterance.pitch = 1.5;
        utterance.volume = 0.8;
        
        speechSynthesis.cancel();
        speechSynthesis.speak(utterance);
    }
    
    incrementActionCount() {
        this.actionCount++;
        
        if (this.actionCount % 10 === 0) {
            this.createCelebration();
        }
    }
    
    createCelebration() {
        const colors = [0xFF0000, 0xFF8C00, 0xFFD700, 0x32CD32, 0x1E90FF, 0x8A2BE2, 0xFF69B4];
        
        for (let i = 0; i < 20; i++) {
            const confetti = new PIXI.Graphics();
            confetti.beginFill(colors[Math.floor(Math.random() * colors.length)]);
            confetti.drawRect(0, 0, 8, 8);
            confetti.endFill();
            
            confetti.x = Math.random() * this.app.screen.width;
            confetti.y = -20;
            confetti.vx = (Math.random() - 0.5) * 6;
            confetti.vy = Math.random() * 3 + 2;
            confetti.rotation = Math.random() * Math.PI * 2;
            confetti.life = 120;
            
            this.effectContainer.addChild(confetti);
            this.effects.push(confetti);
        }
        
        this.speakPraise('celebration');
    }
    
    saveProgress() {
        const saveData = {
            plants: this.plants.map(p => ({
                x: p.x,
                y: p.y,
                type: p.type,
                text: p.text,
                growthStage: p.growthStage || 1
            })),
            starSeeds: this.starSeeds,
            flowerCount: this.flowerCount,
            vegetableCount: this.vegetableCount,
            grassCount: this.grassCount,
            actionCount: this.actionCount,
            timestamp: Date.now()
        };
        
        try {
            localStorage.setItem('mirasYardPixiSave', JSON.stringify(saveData));
        } catch (e) {
            console.warn('Failed to save progress:', e);
        }
    }
    
    loadProgress() {
        try {
            const saved = localStorage.getItem('mirasYardPixiSave');
            if (saved) {
                const data = JSON.parse(saved);
                
                // Restore counters
                this.starSeeds = data.starSeeds || 0;
                this.flowerCount = data.flowerCount || 0;
                this.vegetableCount = data.vegetableCount || 0;
                this.grassCount = data.grassCount || 0;
                this.actionCount = data.actionCount || 0;
                
                // Restore plants
                if (data.plants) {
                    data.plants.forEach(plantData => {
                        this.recreatePlant(plantData);
                    });
                }
                
                console.log('Progress loaded successfully');
                setTimeout(() => {
                    this.speakPraise('celebration', 'Welcome back to your garden!');
                }, 1000);
            }
        } catch (e) {
            console.log('No saved progress found');
        }
    }
    
    recreatePlant(plantData) {
        const text = new PIXI.Text(plantData.text, {
            fontSize: plantData.type === 'vegetable' ? 35 : 40,
            fontFamily: 'Arial'
        });
        
        text.anchor.set(0.5);
        text.x = plantData.x;
        text.y = plantData.y;
        text.type = plantData.type;
        text.growthStage = plantData.growthStage || 1;
        
        const scale = plantData.type === 'vegetable' ? 
            (0.6 + text.growthStage * 0.2) : 1;
        text.scale.set(scale);
        
        this.plantContainer.addChild(text);
        this.plants.push(text);
    }
    
    updateEffects() {
        for (let i = this.effects.length - 1; i >= 0; i--) {
            const effect = this.effects[i];
            
            effect.life--;
            
            if (effect.vx !== undefined) {
                effect.x += effect.vx;
                effect.y += effect.vy;
                effect.vy += 0.2; // Gravity
            }
            
            if (effect.life <= 0) {
                this.effectContainer.removeChild(effect);
                effect.destroy();
                this.effects.splice(i, 1);
            } else if (effect.life < 20) {
                effect.alpha = effect.life / 20; // Fade out
            }
        }
    }
    
    updateAnimals() {
        for (let i = this.animals.length - 1; i >= 0; i--) {
            const animal = this.animals[i];
            
            animal.x += animal.vx;
            animal.y += animal.vy;
            
            // Bounce animation
            animal.y += Math.sin(Date.now() * 0.01) * 0.5;
            
            // Remove if off screen
            if (animal.x < -100 || animal.x > this.app.screen.width + 100) {
                this.animalContainer.removeChild(animal);
                animal.destroy();
                this.animals.splice(i, 1);
            }
        }
    }
    
    updateButterflies() {
        this.butterflies.forEach(butterfly => {
            butterfly.vx += (Math.random() - 0.5) * 0.1;
            butterfly.vy += (Math.random() - 0.5) * 0.1;
            
            butterfly.x += butterfly.vx;
            butterfly.y += butterfly.vy;
            
            // Keep on screen
            if (butterfly.x < 0 || butterfly.x > this.app.screen.width) butterfly.vx *= -1;
            if (butterfly.y < 0 || butterfly.y > this.app.screen.height) butterfly.vy *= -1;
            
            // Flutter animation
            butterfly.rotation = Math.sin(Date.now() * 0.01) * 0.2;
        });
    }
    
    createStarDisplay() {
        if (this.starText) {
            this.starText.text = `⭐ ${this.starSeeds}`;
        } else {
            this.starText = new PIXI.Text(`⭐ ${this.starSeeds}`, {
                fontSize: 32,
                fontFamily: 'Arial',
                fill: 0xFFD700,
                stroke: 0x000000,
                strokeThickness: 2
            });
            this.starText.x = 20;
            this.starText.y = 20;
            this.uiContainer.addChild(this.starText);
        }
    }
    
    startGame() {
        console.log('Starting game loop...');
        
        // Create star display
        this.createStarDisplay();
        
        // Start the game loop
        this.app.ticker.add(() => {
            this.updateEffects();
            this.updateAnimals();
            this.updateButterflies();
            this.createStarDisplay(); // Update display
        });
        
        console.log('Game started successfully!');
    }
}

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM ready, checking PIXI...');
    
    if (typeof PIXI === 'undefined') {
        console.error('PIXI not loaded!');
        return;
    }
    
    console.log('PIXI loaded, starting game...');
    
    try {
        const game = new MirasYardPixi();
        window.game = game; // For debugging
        console.log('Game initialized successfully!');
    } catch (error) {
        console.error('Failed to initialize game:', error);
    }
});
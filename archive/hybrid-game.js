// Version 2.0.0 - Hybrid Canvas/Pixi.js Implementation
// Combines stable Canvas 2D with Pixi.js effects layer

class HybridRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Create Pixi overlay for effects
        this.pixiCanvas = document.createElement('canvas');
        this.pixiCanvas.id = 'pixi-effects';
        this.pixiCanvas.style.position = 'absolute';
        this.pixiCanvas.style.top = '0';
        this.pixiCanvas.style.left = '0';
        this.pixiCanvas.style.pointerEvents = 'none';
        this.pixiCanvas.style.zIndex = '10';
        
        // Insert Pixi canvas after main canvas
        canvas.parentNode.insertBefore(this.pixiCanvas, canvas.nextSibling);
        
        // Initialize Pixi if available
        this.pixiApp = null;
        this.effectContainer = null;
        this.initPixi();
    }
    
    initPixi() {
        if (typeof PIXI !== 'undefined') {
            try {
                this.pixiApp = new PIXI.Application({
                    view: this.pixiCanvas,
                    width: this.canvas.width,
                    height: this.canvas.height,
                    transparent: true,
                    resolution: window.devicePixelRatio || 1,
                    autoDensity: true
                });
                
                this.effectContainer = new PIXI.Container();
                this.pixiApp.stage.addChild(this.effectContainer);
                
                console.log('Pixi.js effects layer initialized');
            } catch (e) {
                console.warn('Pixi.js initialization failed, using Canvas 2D only', e);
            }
        }
    }
    
    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        
        if (this.pixiApp) {
            this.pixiApp.renderer.resize(width, height);
            this.pixiCanvas.width = width;
            this.pixiCanvas.height = height;
        }
    }
    
    addParticle(x, y, type, options = {}) {
        if (this.pixiApp && this.effectContainer) {
            // Use Pixi for particles
            const particle = new PIXI.Graphics();
            
            switch(type) {
                case 'water':
                    particle.beginFill(0x4FC3F7, 0.6);
                    particle.drawCircle(0, 0, options.size || 4);
                    particle.endFill();
                    break;
                case 'grass':
                    particle.beginFill(0x5D8C2F, 0.8);
                    particle.drawRect(0, 0, 3, 8);
                    particle.endFill();
                    break;
                case 'star':
                    this.drawStar(particle, 0, 0, options.size || 10, 0xFFD700);
                    break;
                case 'confetti':
                    particle.beginFill(options.color || 0xFF0000, 0.9);
                    particle.drawRect(-2, -4, 4, 8);
                    particle.endFill();
                    break;
            }
            
            particle.x = x;
            particle.y = y;
            particle.vx = options.vx || 0;
            particle.vy = options.vy || 0;
            particle.life = options.life || 60;
            particle.gravity = options.gravity !== undefined ? options.gravity : 0.2;
            particle.rotation = options.rotation || 0;
            particle.rotationSpeed = options.rotationSpeed || 0;
            
            this.effectContainer.addChild(particle);
            return particle;
        } else {
            // Fallback to Canvas 2D
            return {
                x, y, type, ...options,
                life: options.life || 60
            };
        }
    }
    
    drawStar(graphics, x, y, size, color) {
        const points = 5;
        const outerRadius = size;
        const innerRadius = size * 0.5;
        
        graphics.beginFill(color);
        graphics.moveTo(x, y - outerRadius);
        
        for (let i = 0; i < points * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / points;
            graphics.lineTo(
                x + Math.sin(angle) * radius,
                y - Math.cos(angle) * radius
            );
        }
        
        graphics.closePath();
        graphics.endFill();
    }
    
    updateParticles(particles) {
        if (this.pixiApp && this.effectContainer) {
            // Update Pixi particles
            for (let i = this.effectContainer.children.length - 1; i >= 0; i--) {
                const particle = this.effectContainer.children[i];
                
                if (particle.life !== undefined) {
                    particle.life--;
                    
                    if (particle.vx !== undefined) {
                        particle.x += particle.vx;
                        particle.y += particle.vy;
                        particle.vy += particle.gravity || 0;
                    }
                    
                    if (particle.rotationSpeed) {
                        particle.rotation += particle.rotationSpeed;
                    }
                    
                    // Fade out
                    if (particle.life < 20) {
                        particle.alpha = particle.life / 20;
                    }
                    
                    if (particle.life <= 0) {
                        this.effectContainer.removeChild(particle);
                        particle.destroy();
                    }
                }
            }
        } else {
            // Update Canvas 2D particles
            return particles.filter(p => {
                if (p.life !== undefined) {
                    p.life--;
                    
                    if (p.vx !== undefined) {
                        p.x += p.vx;
                        p.y += p.vy;
                        p.vy += p.gravity || 0.2;
                    }
                    
                    return p.life > 0;
                }
                return true;
            });
        }
    }
    
    clearEffects() {
        if (this.effectContainer) {
            this.effectContainer.removeChildren();
        }
    }
}

class MirasYardHybrid {
    constructor() {
        this.canvas = document.getElementById('garden-canvas');
        this.renderer = new HybridRenderer(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        
        this.currentTool = 'water';
        this.isDrawing = false;
        this.lastTouchTime = 0;
        this.actionCount = 0;
        
        // Game state
        this.grassPatches = [];
        this.plants = [];
        this.wateredAreas = [];
        this.cutPaths = [];
        this.butterflies = [];
        this.paintStrokes = [];
        this.shapes = [];
        this.animals = [];
        this.effects = [];
        
        // Counts
        this.flowerCount = 0;
        this.vegetableCount = 0;
        this.grassCount = 0;
        this.starSeeds = 0;
        
        // Paint settings
        this.paintColor = '#FF0000';
        this.brushSize = 35;
        
        // Visual settings
        this.mowerWidth = 100;
        
        // Initialize
        this.initializeGarden();
        this.initializeVoice();
        this.initializeAnimals();
        this.setupEventListeners();
        this.setupCanvas();
        this.loadProgress();
        
        // Start game loop
        this.gameLoop();
    }
    
    initializeGarden() {
        // Create initial grass patches
        const patchCount = 15 + Math.floor(Math.random() * 10);
        for (let i = 0; i < patchCount; i++) {
            this.grassPatches.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height * 0.8 + this.canvas.height * 0.2,
                width: 60 + Math.random() * 40,
                height: 40 + Math.random() * 30,
                cut: false,
                blades: this.generateGrassBlades()
            });
        }
    }
    
    generateGrassBlades() {
        const blades = [];
        const count = 10 + Math.floor(Math.random() * 10);
        for (let i = 0; i < count; i++) {
            blades.push({
                offset: Math.random() * 40 - 20,
                height: 15 + Math.random() * 15,
                sway: Math.random() * Math.PI
            });
        }
        return blades;
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
            water: ['Good watering!', 'Nice job!', 'Plants love water!'],
            plant: ['Beautiful!', 'Growing nicely!', 'Great planting!'],
            harvest: ['Perfect harvest!', 'Yummy vegetables!', 'Beautiful flowers!'],
            mow: ['Nice mowing!', 'Grass looks great!', 'Good cutting!'],
            paint: ['Pretty colors!', 'Beautiful art!', 'So creative!'],
            celebration: ['Amazing work!', 'You did it!', 'Fantastic!']
        };
    }
    
    initializeAnimals() {
        this.animalTypes = [
            { name: 'dog', emoji: '🐕', size: 50, speed: 2 },
            { name: 'cat', emoji: '🐈', size: 40, speed: 1.5 },
            { name: 'bunny', emoji: '🐰', size: 35, speed: 3 },
            { name: 'bird', emoji: '🐦', size: 25, speed: 4 },
            { name: 'lux', emoji: '🐕', size: 70, speed: 2.5, isSpecial: true }
        ];
        
        // Spawn animals periodically
        setInterval(() => {
            if (Math.random() < 0.3 && this.animals.length < 3) {
                this.spawnAnimal();
            }
        }, 8000);
    }
    
    setupCanvas() {
        const resizeCanvas = () => {
            const container = this.canvas.parentElement;
            const rect = container.getBoundingClientRect();
            this.renderer.resize(rect.width, rect.height);
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        // Hide splash screen
        const splash = document.getElementById('splash-screen');
        const hideSplash = () => {
            splash.style.opacity = '0';
            setTimeout(() => {
                splash.style.display = 'none';
            }, 500);
        };
        
        setTimeout(hideSplash, 5000);
        splash.addEventListener('click', hideSplash);
        splash.addEventListener('touchstart', hideSplash);
    }
    
    setupEventListeners() {
        // Tool selection
        document.querySelectorAll('.tool').forEach(tool => {
            tool.addEventListener('click', (e) => {
                document.querySelectorAll('.tool').forEach(t => t.classList.remove('active'));
                tool.classList.add('active');
                this.currentTool = tool.dataset.tool;
                
                // Show/hide paint controls
                const paintControls = document.getElementById('paint-controls');
                paintControls.style.display = this.currentTool === 'paint' ? 'flex' : 'none';
            });
        });
        
        // Paint controls
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', () => {
                this.paintColor = option.dataset.color;
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
        const getCoords = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            return {
                x: (e.clientX || e.touches?.[0]?.clientX) - rect.left,
                y: (e.clientY || e.touches?.[0]?.clientY) - rect.top
            };
        };
        
        this.canvas.addEventListener('mousedown', (e) => {
            const coords = getCoords(e);
            this.handleStart(coords.x, coords.y);
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isDrawing) {
                const coords = getCoords(e);
                this.handleMove(coords.x, coords.y);
            }
        });
        
        this.canvas.addEventListener('mouseup', () => {
            this.handleEnd();
        });
        
        // Touch events
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const coords = getCoords(e);
            this.handleStart(coords.x, coords.y);
        }, { passive: false });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.isDrawing) {
                const coords = getCoords(e);
                this.handleMove(coords.x, coords.y);
            }
        }, { passive: false });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.handleEnd();
        }, { passive: false });
    }
    
    handleStart(x, y) {
        this.isDrawing = true;
        this.lastX = x;
        this.lastY = y;
        
        switch(this.currentTool) {
            case 'water':
                this.startWatering(x, y);
                break;
            case 'vegetable':
                this.plantVegetable(x, y);
                break;
            case 'flower':
                this.plantFlower(x, y);
                break;
            case 'mower':
                this.startMowing(x, y);
                break;
            case 'pick-vegetable':
                this.harvestVegetable(x, y);
                break;
            case 'pick-flower':
                this.harvestFlower(x, y);
                break;
            case 'paint':
                this.startPainting(x, y);
                break;
            case 'butterfly':
                this.spawnButterfly(x, y);
                break;
            case 'butterfly-net':
                this.catchButterfly(x, y);
                break;
            case 'rainbow':
                this.createRainbow(x, y);
                break;
            case 'shapes':
                this.createShape(x, y);
                break;
            case 'broom':
                this.sweepArea(x, y);
                break;
            case 'undo':
                this.undo();
                break;
            case 'reset':
                this.resetGarden();
                break;
        }
    }
    
    handleMove(x, y) {
        switch(this.currentTool) {
            case 'water':
                this.continueWatering(x, y);
                break;
            case 'mower':
                this.continueMowing(x, y);
                break;
            case 'paint':
                this.continuePainting(x, y);
                break;
        }
        
        this.lastX = x;
        this.lastY = y;
    }
    
    handleEnd() {
        this.isDrawing = false;
    }
    
    startWatering(x, y) {
        this.createWaterEffect(x, y);
        this.speakPraise('water');
        this.incrementActionCount();
    }
    
    continueWatering(x, y) {
        if (Math.random() < 0.3) {
            this.createWaterEffect(x, y);
        }
    }
    
    createWaterEffect(x, y) {
        // Create water particles
        for (let i = 0; i < 5; i++) {
            this.renderer.addParticle(
                x + (Math.random() - 0.5) * 30,
                y + (Math.random() - 0.5) * 30,
                'water',
                {
                    vx: (Math.random() - 0.5) * 2,
                    vy: Math.random() * 2 + 1,
                    size: 3 + Math.random() * 3,
                    life: 40
                }
            );
        }
        
        // Water nearby plants
        this.plants.forEach(plant => {
            const dist = Math.hypot(plant.x - x, plant.y - y);
            if (dist < 50 && plant.growthStage < 3) {
                plant.growthStage++;
                plant.size = 20 + plant.growthStage * 10;
            }
        });
        
        // Add watered area
        this.wateredAreas.push({
            x, y,
            radius: 40,
            opacity: 0.3,
            life: 300
        });
    }
    
    plantVegetable(x, y) {
        const vegetables = ['🥕', '🍅', '🌽', '🥒', '🫑'];
        this.plants.push({
            x, y,
            type: 'vegetable',
            emoji: vegetables[Math.floor(Math.random() * vegetables.length)],
            growthStage: 1,
            size: 30,
            planted: Date.now()
        });
        
        this.vegetableCount++;
        this.speakPraise('plant');
        this.incrementActionCount();
        this.saveProgress();
    }
    
    plantFlower(x, y) {
        const flowers = ['🌸', '🌺', '🌻', '🌷', '🌹'];
        this.plants.push({
            x, y,
            type: 'flower',
            emoji: flowers[Math.floor(Math.random() * flowers.length)],
            size: 35,
            bloom: 0,
            planted: Date.now()
        });
        
        this.flowerCount++;
        this.speakPraise('plant');
        this.incrementActionCount();
        this.saveProgress();
    }
    
    startMowing(x, y) {
        this.mowArea(x, y);
    }
    
    continueMowing(x, y) {
        // Create mowing path
        this.cutPaths.push({
            x1: this.lastX,
            y1: this.lastY,
            x2: x,
            y2: y,
            width: this.mowerWidth
        });
        
        this.mowArea(x, y);
    }
    
    mowArea(x, y) {
        this.grassPatches.forEach(patch => {
            const dist = Math.hypot(patch.x - x, patch.y - y);
            if (dist < this.mowerWidth / 2 && !patch.cut) {
                patch.cut = true;
                this.grassCount++;
                
                // Create grass clipping particles
                for (let i = 0; i < 8; i++) {
                    this.renderer.addParticle(
                        patch.x + (Math.random() - 0.5) * patch.width,
                        patch.y,
                        'grass',
                        {
                            vx: (Math.random() - 0.5) * 4,
                            vy: -Math.random() * 3 - 2,
                            rotation: Math.random() * Math.PI,
                            rotationSpeed: (Math.random() - 0.5) * 0.2,
                            life: 40
                        }
                    );
                }
            }
        });
    }
    
    harvestVegetable(x, y) {
        const index = this.plants.findIndex(plant => {
            const dist = Math.hypot(plant.x - x, plant.y - y);
            return dist < 40 && plant.type === 'vegetable' && plant.growthStage >= 2;
        });
        
        if (index !== -1) {
            const plant = this.plants[index];
            this.plants.splice(index, 1);
            
            // Create harvest effect
            this.createHarvestEffect(plant.x, plant.y);
            
            this.starSeeds++;
            this.speakPraise('harvest');
            this.incrementActionCount();
            this.saveProgress();
        }
    }
    
    harvestFlower(x, y) {
        const index = this.plants.findIndex(plant => {
            const dist = Math.hypot(plant.x - x, plant.y - y);
            return dist < 40 && plant.type === 'flower';
        });
        
        if (index !== -1) {
            const plant = this.plants[index];
            
            // Create petal burst effect
            for (let i = 0; i < 10; i++) {
                this.renderer.addParticle(
                    plant.x,
                    plant.y,
                    'confetti',
                    {
                        color: 0xFF69B4,
                        vx: (Math.random() - 0.5) * 6,
                        vy: -Math.random() * 4 - 2,
                        rotation: Math.random() * Math.PI * 2,
                        rotationSpeed: (Math.random() - 0.5) * 0.3,
                        life: 60
                    }
                );
            }
            
            this.starSeeds++;
            this.speakPraise('harvest');
            this.incrementActionCount();
            this.saveProgress();
        }
    }
    
    createHarvestEffect(x, y) {
        // Star burst effect
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            this.renderer.addParticle(
                x,
                y,
                'star',
                {
                    vx: Math.cos(angle) * 3,
                    vy: Math.sin(angle) * 3,
                    size: 8,
                    life: 40,
                    gravity: 0
                }
            );
        }
    }
    
    startPainting(x, y) {
        this.paintStrokes.push({
            points: [{x, y}],
            color: this.paintColor,
            size: this.brushSize
        });
    }
    
    continuePainting(x, y) {
        if (this.paintStrokes.length > 0) {
            const currentStroke = this.paintStrokes[this.paintStrokes.length - 1];
            currentStroke.points.push({x, y});
        }
    }
    
    spawnButterfly(x, y) {
        this.butterflies.push({
            x, y,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            wanderAngle: Math.random() * Math.PI * 2,
            size: 30,
            wingPhase: 0
        });
        
        this.speakPraise('butterfly');
        this.incrementActionCount();
    }
    
    catchButterfly(x, y) {
        const index = this.butterflies.findIndex(butterfly => {
            const dist = Math.hypot(butterfly.x - x, butterfly.y - y);
            return dist < 50;
        });
        
        if (index !== -1) {
            const butterfly = this.butterflies[index];
            this.butterflies.splice(index, 1);
            
            // Create star burst
            for (let i = 0; i < 12; i++) {
                this.renderer.addParticle(
                    butterfly.x,
                    butterfly.y,
                    'star',
                    {
                        vx: (Math.random() - 0.5) * 8,
                        vy: (Math.random() - 0.5) * 8,
                        size: 6 + Math.random() * 4,
                        life: 30
                    }
                );
            }
            
            this.starSeeds += 3;
            this.speakPraise('butterfly');
            this.incrementActionCount();
            this.saveProgress();
        }
    }
    
    createRainbow(x, y) {
        this.shapes.push({
            type: 'rainbow',
            x, y,
            radius: 100,
            created: Date.now()
        });
        
        this.speakPraise('paint');
        this.incrementActionCount();
    }
    
    createShape(x, y) {
        const shapes = ['⭐', '❤️', '⚡', '🌙', '☀️'];
        this.shapes.push({
            type: 'emoji',
            emoji: shapes[Math.floor(Math.random() * shapes.length)],
            x, y,
            size: 40 + Math.random() * 30,
            rotation: Math.random() * Math.PI * 2,
            spin: (Math.random() - 0.5) * 0.1
        });
        
        this.incrementActionCount();
    }
    
    sweepArea(x, y) {
        // Remove nearby paint and shapes
        this.paintStrokes = this.paintStrokes.filter(stroke => {
            const dist = Math.min(...stroke.points.map(p => 
                Math.hypot(p.x - x, p.y - y)
            ));
            return dist > 60;
        });
        
        this.shapes = this.shapes.filter(shape => {
            const dist = Math.hypot(shape.x - x, shape.y - y);
            if (dist < 60) {
                // Create dust particles
                for (let i = 0; i < 5; i++) {
                    this.renderer.addParticle(
                        shape.x,
                        shape.y,
                        'confetti',
                        {
                            color: 0xC0C0C0,
                            vx: (Math.random() - 0.5) * 3,
                            vy: -Math.random() * 2 - 1,
                            size: 3,
                            life: 20
                        }
                    );
                }
                return false;
            }
            return true;
        });
    }
    
    undo() {
        if (this.plants.length > 0) {
            this.plants.pop();
        } else if (this.paintStrokes.length > 0) {
            this.paintStrokes.pop();
        } else if (this.shapes.length > 0) {
            this.shapes.pop();
        }
        this.saveProgress();
    }
    
    resetGarden() {
        if (confirm('Reset the garden? This will clear everything!')) {
            this.plants = [];
            this.paintStrokes = [];
            this.shapes = [];
            this.butterflies = [];
            this.wateredAreas = [];
            this.cutPaths = [];
            this.grassPatches.forEach(patch => patch.cut = false);
            
            this.flowerCount = 0;
            this.vegetableCount = 0;
            this.grassCount = 0;
            this.starSeeds = 0;
            
            this.renderer.clearEffects();
            this.speakPraise('celebration', 'Fresh new garden!');
            this.saveProgress();
        }
    }
    
    spawnAnimal() {
        const animalType = this.animalTypes[Math.floor(Math.random() * this.animalTypes.length)];
        const side = Math.random() > 0.5 ? 'left' : 'right';
        
        const animal = {
            ...animalType,
            x: side === 'left' ? -50 : this.canvas.width + 50,
            y: this.canvas.height * 0.6 + Math.random() * this.canvas.height * 0.3,
            vx: side === 'left' ? animalType.speed : -animalType.speed,
            vy: (Math.random() - 0.5) * 0.5,
            bouncePhase: 0
        };
        
        this.animals.push(animal);
        
        if (animalType.isSpecial) {
            this.speakPraise('celebration', `Look, it's ${animalType.name}!`);
        }
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
        
        // Celebration every 10 actions
        if (this.actionCount % 10 === 0) {
            this.createCelebration();
        }
    }
    
    createCelebration() {
        // Confetti burst from top
        const colors = [0xFF0000, 0xFF8C00, 0xFFD700, 0x32CD32, 0x1E90FF, 0x8A2BE2, 0xFF69B4];
        
        for (let i = 0; i < 30; i++) {
            this.renderer.addParticle(
                Math.random() * this.canvas.width,
                -20,
                'confetti',
                {
                    color: colors[Math.floor(Math.random() * colors.length)],
                    vx: (Math.random() - 0.5) * 6,
                    vy: Math.random() * 3 + 2,
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.3,
                    size: 6 + Math.random() * 4,
                    life: 100
                }
            );
        }
        
        this.speakPraise('celebration');
    }
    
    saveProgress() {
        const saveData = {
            plants: this.plants,
            starSeeds: this.starSeeds,
            counts: {
                flowers: this.flowerCount,
                vegetables: this.vegetableCount,
                grass: this.grassCount,
                actions: this.actionCount
            },
            timestamp: Date.now()
        };
        
        localStorage.setItem('mirasYardSave', JSON.stringify(saveData));
    }
    
    loadProgress() {
        try {
            const saved = localStorage.getItem('mirasYardSave');
            if (saved) {
                const data = JSON.parse(saved);
                this.plants = data.plants || [];
                this.starSeeds = data.starSeeds || 0;
                this.flowerCount = data.counts?.flowers || 0;
                this.vegetableCount = data.counts?.vegetables || 0;
                this.grassCount = data.counts?.grass || 0;
                this.actionCount = data.counts?.actions || 0;
            }
        } catch (e) {
            console.log('No saved progress found');
        }
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#7CB342';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw watered areas (fading)
        this.wateredAreas.forEach(area => {
            this.ctx.fillStyle = `rgba(79, 195, 247, ${area.opacity})`;
            this.ctx.beginPath();
            this.ctx.arc(area.x, area.y, area.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Draw cut paths
        this.ctx.strokeStyle = 'rgba(93, 140, 47, 0.3)';
        this.ctx.lineWidth = this.mowerWidth;
        this.ctx.lineCap = 'round';
        this.cutPaths.forEach(path => {
            this.ctx.beginPath();
            this.ctx.moveTo(path.x1, path.y1);
            this.ctx.lineTo(path.x2, path.y2);
            this.ctx.stroke();
        });
        
        // Draw grass patches
        this.grassPatches.forEach(patch => {
            if (!patch.cut) {
                this.ctx.fillStyle = '#5D8C2F';
                patch.blades.forEach(blade => {
                    const x = patch.x + blade.offset;
                    const y = patch.y;
                    const sway = Math.sin(Date.now() * 0.001 + blade.sway) * 2;
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(x, y);
                    this.ctx.quadraticCurveTo(
                        x + sway,
                        y - blade.height / 2,
                        x + sway * 1.5,
                        y - blade.height
                    );
                    this.ctx.lineTo(x + 2, y - blade.height);
                    this.ctx.quadraticCurveTo(
                        x + 2 + sway,
                        y - blade.height / 2,
                        x + 2,
                        y
                    );
                    this.ctx.fill();
                });
            }
        });
        
        // Draw paint strokes
        this.paintStrokes.forEach(stroke => {
            this.ctx.strokeStyle = stroke.color;
            this.ctx.lineWidth = stroke.size;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            
            if (stroke.points.length > 1) {
                this.ctx.beginPath();
                this.ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
                stroke.points.forEach(point => {
                    this.ctx.lineTo(point.x, point.y);
                });
                this.ctx.stroke();
            }
        });
        
        // Draw shapes
        this.shapes.forEach(shape => {
            this.ctx.save();
            this.ctx.translate(shape.x, shape.y);
            
            if (shape.spin) {
                shape.rotation += shape.spin;
                this.ctx.rotate(shape.rotation);
            }
            
            if (shape.type === 'rainbow') {
                const colors = ['#FF0000', '#FF8C00', '#FFD700', '#32CD32', '#00CED1', '#4B0082', '#8B008B'];
                colors.forEach((color, i) => {
                    this.ctx.strokeStyle = color;
                    this.ctx.lineWidth = 8;
                    this.ctx.globalAlpha = 0.7;
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, shape.radius - i * 12, Math.PI, 0, true);
                    this.ctx.stroke();
                });
                this.ctx.globalAlpha = 1;
            } else if (shape.type === 'emoji') {
                this.ctx.font = `${shape.size}px Arial`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(shape.emoji, 0, 0);
            }
            
            this.ctx.restore();
        });
        
        // Draw plants
        this.plants.forEach(plant => {
            this.ctx.save();
            this.ctx.translate(plant.x, plant.y);
            
            // Growing animation
            if (plant.type === 'vegetable') {
                const scale = 0.5 + plant.growthStage * 0.2;
                this.ctx.scale(scale, scale);
            } else if (plant.type === 'flower') {
                plant.bloom = Math.min(1, plant.bloom + 0.02);
                this.ctx.scale(plant.bloom, plant.bloom);
            }
            
            this.ctx.font = `${plant.size}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(plant.emoji, 0, 0);
            
            this.ctx.restore();
        });
        
        // Draw butterflies
        this.butterflies.forEach(butterfly => {
            butterfly.wingPhase += 0.2;
            const wingScale = 1 + Math.sin(butterfly.wingPhase) * 0.2;
            
            this.ctx.save();
            this.ctx.translate(butterfly.x, butterfly.y);
            this.ctx.scale(wingScale, 1);
            this.ctx.font = `${butterfly.size}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('🦋', 0, 0);
            this.ctx.restore();
        });
        
        // Draw animals
        this.animals.forEach(animal => {
            const bounce = Math.sin(Date.now() * 0.01 + animal.bouncePhase) * 5;
            
            this.ctx.save();
            this.ctx.translate(animal.x, animal.y + bounce);
            
            if (animal.vx < 0) {
                this.ctx.scale(-1, 1);
            }
            
            this.ctx.font = `${animal.size}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(animal.emoji, 0, 0);
            
            this.ctx.restore();
        });
        
        // Draw UI elements
        this.drawUI();
    }
    
    drawUI() {
        // Star seeds counter
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`⭐ ${this.starSeeds}`, 20, 40);
        
        // Action streak indicator
        if (this.actionCount > 0 && this.actionCount % 10 < 3) {
            this.ctx.fillStyle = '#FF69B4';
            this.ctx.font = 'bold 20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`🎉 ${this.actionCount} actions!`, this.canvas.width / 2, 40);
        }
    }
    
    update() {
        // Update particles (handled by renderer)
        this.effects = this.renderer.updateParticles(this.effects);
        
        // Update watered areas
        this.wateredAreas = this.wateredAreas.filter(area => {
            area.life--;
            area.opacity = Math.max(0, area.opacity - 0.001);
            return area.life > 0;
        });
        
        // Update butterflies
        this.butterflies.forEach(butterfly => {
            butterfly.wanderAngle += (Math.random() - 0.5) * 0.2;
            butterfly.vx = Math.cos(butterfly.wanderAngle) * 2;
            butterfly.vy = Math.sin(butterfly.wanderAngle) * 2;
            
            butterfly.x += butterfly.vx;
            butterfly.y += butterfly.vy;
            
            // Keep on screen
            if (butterfly.x < 0 || butterfly.x > this.canvas.width) butterfly.vx *= -1;
            if (butterfly.y < 0 || butterfly.y > this.canvas.height) butterfly.vy *= -1;
        });
        
        // Update animals
        this.animals = this.animals.filter(animal => {
            animal.x += animal.vx;
            animal.y += animal.vy;
            
            return animal.x > -100 && animal.x < this.canvas.width + 100;
        });
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize with Pixi.js support if available
document.addEventListener('DOMContentLoaded', () => {
    // Load Pixi.js dynamically
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/pixi.js@7.3.3/dist/pixi.min.js';
    script.onload = () => {
        console.log('Pixi.js loaded, starting hybrid game');
        new MirasYardHybrid();
    };
    script.onerror = () => {
        console.log('Pixi.js failed to load, starting with Canvas 2D only');
        new MirasYardHybrid();
    };
    document.head.appendChild(script);
});
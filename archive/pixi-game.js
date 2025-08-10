// Version 2.0.0 - Pixi.js Implementation
// Complete rewrite using Pixi.js for enhanced performance and visuals

class MirasYardPixi {
    constructor() {
        // Wait for PIXI to be loaded
        if (typeof PIXI === 'undefined') {
            console.error('PIXI not loaded');
            return;
        }
        
        // Get canvas container dimensions
        const gameArea = document.querySelector('.game-area');
        const rect = gameArea.getBoundingClientRect();
        
        // Initialize PIXI Application
        this.app = new PIXI.Application({
            width: rect.width,
            height: rect.height,
            backgroundColor: 0x7CB342,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
            view: document.getElementById('garden-canvas')
        });
        
        // Game state
        this.currentTool = 'water';
        this.isDrawing = false;
        this.lastTouchTime = 0;
        this.actionCount = 0;
        
        // Collections
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
        this.paintColor = 0xFF0000;
        this.brushSize = 35;
        
        // Create containers for different layers
        this.backgroundContainer = new PIXI.Container();
        this.grassContainer = new PIXI.Container();
        this.plantContainer = new PIXI.Container();
        this.effectContainer = new PIXI.Container();
        this.animalContainer = new PIXI.Container();
        this.uiContainer = new PIXI.Container();
        
        // Add containers to stage in order
        this.app.stage.addChild(this.backgroundContainer);
        this.app.stage.addChild(this.grassContainer);
        this.app.stage.addChild(this.plantContainer);
        this.app.stage.addChild(this.animalContainer);
        this.app.stage.addChild(this.effectContainer);
        this.app.stage.addChild(this.uiContainer);
        
        // Initialize game
        this.initializeGarden();
        this.initializeVoice();
        this.initializeAnimals();
        this.setupEventListeners();
        this.setupSplashScreen();
        
        // Start game loop
        this.app.ticker.add(() => this.gameLoop());
    }
    
    initializeGarden() {
        // Create grass background with texture
        const grassTexture = this.createGrassTexture();
        const tilingSprite = new PIXI.TilingSprite(
            grassTexture,
            this.app.screen.width,
            this.app.screen.height
        );
        this.backgroundContainer.addChild(tilingSprite);
        
        // Add initial grass patches for mowing
        const patchCount = 15 + Math.floor(Math.random() * 10);
        for (let i = 0; i < patchCount; i++) {
            this.createGrassPatch();
        }
    }
    
    createGrassTexture() {
        // Create a grass texture programmatically
        const graphics = new PIXI.Graphics();
        const size = 64;
        
        // Base grass color
        graphics.beginFill(0x7CB342);
        graphics.drawRect(0, 0, size, size);
        graphics.endFill();
        
        // Add grass blade details
        for (let i = 0; i < 8; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const height = 5 + Math.random() * 10;
            
            graphics.lineStyle(1, 0x5D8C2F);
            graphics.moveTo(x, y);
            graphics.quadraticCurveTo(x + 2, y - height/2, x, y - height);
        }
        
        // Generate texture from graphics
        const texture = this.app.renderer.generateTexture(graphics);
        graphics.destroy(); // Clean up graphics object
        return texture;
    }
    
    createGrassPatch() {
        const patch = new PIXI.Container();
        
        // Create tall grass visual
        const graphics = new PIXI.Graphics();
        const width = 60 + Math.random() * 40;
        const height = 40 + Math.random() * 30;
        
        // Draw grass blades
        graphics.beginFill(0x5D8C2F, 0.8);
        for (let i = 0; i < 20; i++) {
            const bladeX = Math.random() * width - width/2;
            const bladeY = 0;
            const bladeHeight = height * (0.7 + Math.random() * 0.3);
            const bladeWidth = 2 + Math.random() * 2;
            
            graphics.moveTo(bladeX, bladeY);
            graphics.quadraticCurveTo(
                bladeX + Math.random() * 4 - 2,
                bladeY - bladeHeight/2,
                bladeX + Math.random() * 2 - 1,
                bladeY - bladeHeight
            );
            graphics.lineTo(bladeX + bladeWidth, bladeY - bladeHeight);
            graphics.quadraticCurveTo(
                bladeX + bladeWidth + Math.random() * 4 - 2,
                bladeY - bladeHeight/2,
                bladeX + bladeWidth,
                bladeY
            );
            graphics.closePath();
        }
        graphics.endFill();
        
        patch.addChild(graphics);
        patch.x = Math.random() * this.app.screen.width;
        patch.y = Math.random() * this.app.screen.height * 0.8 + this.app.screen.height * 0.2;
        patch.isCut = false;
        patch.graphics = graphics;
        
        this.grassContainer.addChild(patch);
        this.grassPatches.push(patch);
    }
    
    initializeVoice() {
        this.voiceEnabled = 'speechSynthesis' in window;
        this.currentVoice = null;
        
        if (this.voiceEnabled) {
            const setVoice = () => {
                const voices = speechSynthesis.getVoices();
                this.currentVoice = 
                    voices.find(voice => 
                        voice.name.toLowerCase().includes('female') ||
                        voice.name.toLowerCase().includes('zira') ||
                        voice.name.toLowerCase().includes('samantha')
                    ) ||
                    voices.find(voice => voice.lang.startsWith('en')) ||
                    voices[0];
            };
            
            if (speechSynthesis.getVoices().length === 0) {
                speechSynthesis.onvoiceschanged = setVoice;
            } else {
                setVoice();
            }
        }
        
        this.praisePhrases = {
            water: ['Good watering!', 'Nice job!', 'Great work!'],
            plant: ['Beautiful planting!', 'Good job growing!', 'Amazing garden!'],
            harvest: ['Perfect harvest!', 'Good picking!', 'Wonderful!'],
            mow: ['Great mowing!', 'Nice cutting!', 'Good job!'],
            paint: ['Beautiful colors!', 'Great painting!', 'So creative!'],
            butterfly: ['Great catch!', 'Nice work!', 'Well done!'],
            celebration: ['Fantastic work!', 'You are amazing!', 'Incredible job!']
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
    
    spawnAnimal() {
        const animalType = this.animalTypes[Math.floor(Math.random() * this.animalTypes.length)];
        const side = Math.random() > 0.5 ? 'left' : 'right';
        
        const text = new PIXI.Text(animalType.emoji, {
            fontSize: animalType.isSpecial ? 70 : animalType.size,
            fontFamily: 'Arial'
        });
        
        if (side === 'left') {
            text.x = -50;
            text.vx = animalType.speed;
        } else {
            text.x = this.app.screen.width + 50;
            text.vx = -animalType.speed;
        }
        
        text.y = this.app.screen.height * 0.6 + Math.random() * this.app.screen.height * 0.3;
        text.vy = (Math.random() - 0.5) * 0.5;
        text.animalType = animalType;
        
        this.animalContainer.addChild(text);
        this.animals.push(text);
        
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
    
    setupEventListeners() {
        // Tool selection
        document.querySelectorAll('.tool').forEach(tool => {
            tool.addEventListener('click', (e) => {
                document.querySelectorAll('.tool').forEach(t => t.classList.remove('active'));
                tool.classList.add('active');
                this.currentTool = tool.dataset.tool;
                
                // Show/hide paint controls
                const paintControls = document.getElementById('paint-controls');
                if (this.currentTool === 'paint') {
                    paintControls.style.display = 'flex';
                } else {
                    paintControls.style.display = 'none';
                }
            });
        });
        
        // Paint controls
        document.querySelectorAll('.color-option').forEach(colorOption => {
            colorOption.addEventListener('click', () => {
                const color = colorOption.dataset.color;
                this.paintColor = parseInt(color.replace('#', '0x'));
                document.querySelectorAll('.color-option').forEach(c => c.classList.remove('selected'));
                colorOption.classList.add('selected');
            });
        });
        
        document.querySelectorAll('.brush-size').forEach(brushOption => {
            brushOption.addEventListener('click', () => {
                this.brushSize = parseInt(brushOption.dataset.size);
                document.querySelectorAll('.brush-size').forEach(b => b.classList.remove('selected'));
                brushOption.classList.add('selected');
            });
        });
        
        // Canvas interactions
        this.app.view.addEventListener('pointerdown', (e) => this.handlePointerDown(e));
        this.app.view.addEventListener('pointermove', (e) => this.handlePointerMove(e));
        this.app.view.addEventListener('pointerup', () => this.handlePointerUp());
        
        // Touch events for mobile
        this.app.view.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.handlePointerDown(touch);
        }, { passive: false });
        
        this.app.view.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.handlePointerMove(touch);
        }, { passive: false });
        
        this.app.view.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.handlePointerUp();
        }, { passive: false });
        
        // Window resize
        window.addEventListener('resize', () => {
            const gameArea = document.querySelector('.game-area');
            const rect = gameArea.getBoundingClientRect();
            this.app.renderer.resize(rect.width, rect.height);
        });
    }
    
    handlePointerDown(e) {
        this.isDrawing = true;
        const rect = this.app.view.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
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
    
    handlePointerMove(e) {
        if (!this.isDrawing) return;
        
        const rect = this.app.view.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
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
    }
    
    handlePointerUp() {
        this.isDrawing = false;
        this.lastPaintX = null;
        this.lastPaintY = null;
        this.lastMowerX = null;
        this.lastMowerY = null;
    }
    
    startWatering(x, y) {
        this.createWaterParticles(x, y);
        this.speakPraise('water');
    }
    
    continueWatering(x, y) {
        this.createWaterParticles(x, y);
    }
    
    createWaterParticles(x, y) {
        const emitter = new PIXI.Container();
        
        for (let i = 0; i < 5; i++) {
            const particle = new PIXI.Graphics();
            particle.beginFill(0x4FC3F7, 0.6);
            particle.drawCircle(0, 0, 3 + Math.random() * 3);
            particle.endFill();
            
            particle.x = x + (Math.random() - 0.5) * 40;
            particle.y = y + (Math.random() - 0.5) * 40;
            particle.vx = (Math.random() - 0.5) * 2;
            particle.vy = Math.random() * 2 + 1;
            particle.life = 60;
            
            emitter.addChild(particle);
            this.effects.push(particle);
        }
        
        this.effectContainer.addChild(emitter);
        
        // Make nearby plants grow
        this.plants.forEach(plant => {
            const dist = Math.hypot(plant.x - x, plant.y - y);
            if (dist < 50 && plant.growthStage < 3) {
                plant.growthStage++;
                plant.scale.x = plant.scale.y = 0.5 + plant.growthStage * 0.2;
            }
        });
    }
    
    plantVegetable(x, y) {
        const vegetables = ['🥕', '🍅', '🌽', '🥒', '🫑'];
        const vegEmoji = vegetables[Math.floor(Math.random() * vegetables.length)];
        
        const text = new PIXI.Text(vegEmoji, {
            fontSize: 30,
            fontFamily: 'Arial'
        });
        
        text.x = x;
        text.y = y;
        text.anchor.set(0.5);
        text.scale.set(0.5);
        text.growthStage = 1;
        text.type = 'vegetable';
        
        // Growth animation
        const growTween = {
            target: text,
            duration: 30,
            elapsed: 0
        };
        
        this.plantContainer.addChild(text);
        this.plants.push(text);
        this.vegetableCount++;
        
        this.speakPraise('plant');
    }
    
    plantFlower(x, y) {
        const flowers = ['🌸', '🌺', '🌻', '🌷', '🌹'];
        const flowerEmoji = flowers[Math.floor(Math.random() * flowers.length)];
        
        const text = new PIXI.Text(flowerEmoji, {
            fontSize: 35,
            fontFamily: 'Arial'
        });
        
        text.x = x;
        text.y = y;
        text.anchor.set(0.5);
        text.type = 'flower';
        
        // Bloom animation
        text.scale.set(0);
        const bloomAnimation = setInterval(() => {
            text.scale.x += 0.05;
            text.scale.y += 0.05;
            if (text.scale.x >= 1) {
                clearInterval(bloomAnimation);
            }
        }, 20);
        
        this.plantContainer.addChild(text);
        this.plants.push(text);
        this.flowerCount++;
        
        this.speakPraise('plant');
    }
    
    startMowing(x, y) {
        this.lastMowerX = x;
        this.lastMowerY = y;
        this.mowGrass(x, y);
    }
    
    continueMowing(x, y) {
        if (this.lastMowerX && this.lastMowerY) {
            // Create mowing path
            const graphics = new PIXI.Graphics();
            graphics.lineStyle(80, 0x5D8C2F, 0.3);
            graphics.moveTo(this.lastMowerX, this.lastMowerY);
            graphics.lineTo(x, y);
            
            this.grassContainer.addChild(graphics);
            this.cutPaths.push(graphics);
        }
        
        this.mowGrass(x, y);
        this.lastMowerX = x;
        this.lastMowerY = y;
    }
    
    mowGrass(x, y) {
        // Check grass patches and cut them
        this.grassPatches.forEach(patch => {
            const dist = Math.hypot(patch.x - x, patch.y - y);
            if (dist < 60 && !patch.isCut) {
                patch.isCut = true;
                patch.alpha = 0.3;
                this.grassCount++;
                
                // Create grass clipping particles
                for (let i = 0; i < 5; i++) {
                    const clipping = new PIXI.Graphics();
                    clipping.beginFill(0x5D8C2F);
                    clipping.drawRect(0, 0, 4, 8);
                    clipping.endFill();
                    
                    clipping.x = patch.x + (Math.random() - 0.5) * 40;
                    clipping.y = patch.y;
                    clipping.vx = (Math.random() - 0.5) * 4;
                    clipping.vy = -Math.random() * 3 - 2;
                    clipping.rotation = Math.random() * Math.PI;
                    clipping.life = 40;
                    
                    this.effectContainer.addChild(clipping);
                    this.effects.push(clipping);
                }
            }
        });
    }
    
    harvestVegetable(x, y) {
        const harvested = this.plants.find(plant => {
            const dist = Math.hypot(plant.x - x, plant.y - y);
            return dist < 40 && plant.type === 'vegetable' && plant.growthStage >= 2;
        });
        
        if (harvested) {
            // Animate to harvest bowl
            const targetX = this.app.screen.width - 100;
            const targetY = 100;
            
            const harvestAnimation = setInterval(() => {
                harvested.x += (targetX - harvested.x) * 0.1;
                harvested.y += (targetY - harvested.y) * 0.1;
                harvested.scale.x *= 0.95;
                harvested.scale.y *= 0.95;
                
                if (Math.abs(harvested.x - targetX) < 5) {
                    clearInterval(harvestAnimation);
                    this.plantContainer.removeChild(harvested);
                    this.plants = this.plants.filter(p => p !== harvested);
                    this.starSeeds++;
                }
            }, 20);
            
            this.speakPraise('harvest');
        }
    }
    
    harvestFlower(x, y) {
        const harvested = this.plants.find(plant => {
            const dist = Math.hypot(plant.x - x, plant.y - y);
            return dist < 40 && plant.type === 'flower';
        });
        
        if (harvested) {
            // Animate to vase
            const targetX = this.app.screen.width - 100;
            const targetY = 200;
            
            const harvestAnimation = setInterval(() => {
                harvested.x += (targetX - harvested.x) * 0.1;
                harvested.y += (targetY - harvested.y) * 0.1;
                
                if (Math.abs(harvested.x - targetX) < 5) {
                    clearInterval(harvestAnimation);
                    this.starSeeds++;
                }
            }, 20);
            
            this.speakPraise('harvest');
        }
    }
    
    startPainting(x, y) {
        this.lastPaintX = x;
        this.lastPaintY = y;
        this.drawPaintStroke(x, y);
    }
    
    continuePainting(x, y) {
        if (this.lastPaintX && this.lastPaintY) {
            const graphics = new PIXI.Graphics();
            graphics.lineStyle(this.brushSize, this.paintColor);
            graphics.moveTo(this.lastPaintX, this.lastPaintY);
            graphics.lineTo(x, y);
            
            this.effectContainer.addChild(graphics);
            this.paintStrokes.push(graphics);
        }
        
        this.lastPaintX = x;
        this.lastPaintY = y;
    }
    
    drawPaintStroke(x, y) {
        const graphics = new PIXI.Graphics();
        graphics.beginFill(this.paintColor);
        graphics.drawCircle(x, y, this.brushSize / 2);
        graphics.endFill();
        
        this.effectContainer.addChild(graphics);
        this.paintStrokes.push(graphics);
    }
    
    spawnButterfly(x, y) {
        const butterfly = new PIXI.Text('🦋', {
            fontSize: 30,
            fontFamily: 'Arial'
        });
        
        butterfly.x = x;
        butterfly.y = y;
        butterfly.anchor.set(0.5);
        butterfly.vx = (Math.random() - 0.5) * 2;
        butterfly.vy = (Math.random() - 0.5) * 2;
        butterfly.wanderAngle = Math.random() * Math.PI * 2;
        
        this.animalContainer.addChild(butterfly);
        this.butterflies.push(butterfly);
        
        this.speakPraise('butterfly');
    }
    
    catchButterfly(x, y) {
        const caught = this.butterflies.find(butterfly => {
            const dist = Math.hypot(butterfly.x - x, butterfly.y - y);
            return dist < 50;
        });
        
        if (caught) {
            // Create star burst effect
            for (let i = 0; i < 10; i++) {
                const star = new PIXI.Text('⭐', {
                    fontSize: 20,
                    fontFamily: 'Arial'
                });
                
                star.x = caught.x;
                star.y = caught.y;
                star.vx = (Math.random() - 0.5) * 8;
                star.vy = (Math.random() - 0.5) * 8;
                star.life = 30;
                
                this.effectContainer.addChild(star);
                this.effects.push(star);
            }
            
            this.animalContainer.removeChild(caught);
            this.butterflies = this.butterflies.filter(b => b !== caught);
            this.starSeeds += 3;
            
            this.speakPraise('butterfly');
        }
    }
    
    createRainbow(x, y) {
        const graphics = new PIXI.Graphics();
        const colors = [0xFF0000, 0xFF8C00, 0xFFD700, 0x32CD32, 0x00CED1, 0x4B0082, 0x8B008B];
        
        colors.forEach((color, i) => {
            graphics.lineStyle(10, color, 0.7);
            graphics.arc(x, y, 80 + i * 12, Math.PI, 0, true);
        });
        
        this.effectContainer.addChild(graphics);
        this.speakPraise('paint');
    }
    
    createShape(x, y) {
        const shapes = ['⭐', '❤️', '⚡', '🌙', '☀️'];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        
        const text = new PIXI.Text(shape, {
            fontSize: 40 + Math.random() * 30,
            fontFamily: 'Arial'
        });
        
        text.x = x;
        text.y = y;
        text.anchor.set(0.5);
        text.rotation = Math.random() * Math.PI * 2;
        
        // Spinning animation
        const spin = setInterval(() => {
            text.rotation += 0.1;
        }, 50);
        
        setTimeout(() => clearInterval(spin), 2000);
        
        this.effectContainer.addChild(text);
        this.shapes.push(text);
    }
    
    sweepArea(x, y) {
        // Remove nearby paint strokes and shapes
        let swept = false;
        
        this.paintStrokes = this.paintStrokes.filter(stroke => {
            const bounds = stroke.getBounds();
            const dist = Math.hypot(bounds.x + bounds.width/2 - x, bounds.y + bounds.height/2 - y);
            if (dist < 60) {
                this.effectContainer.removeChild(stroke);
                swept = true;
                return false;
            }
            return true;
        });
        
        this.shapes = this.shapes.filter(shape => {
            const dist = Math.hypot(shape.x - x, shape.y - y);
            if (dist < 60) {
                this.effectContainer.removeChild(shape);
                swept = true;
                return false;
            }
            return true;
        });
        
        if (swept) {
            // Create sweep particles
            for (let i = 0; i < 8; i++) {
                const dust = new PIXI.Graphics();
                dust.beginFill(0xC0C0C0, 0.5);
                dust.drawCircle(0, 0, 3);
                dust.endFill();
                
                dust.x = x + (Math.random() - 0.5) * 40;
                dust.y = y;
                dust.vx = (Math.random() - 0.5) * 3;
                dust.vy = -Math.random() * 2 - 1;
                dust.life = 20;
                
                this.effectContainer.addChild(dust);
                this.effects.push(dust);
            }
        }
    }
    
    undo() {
        // Remove last added element
        if (this.plants.length > 0) {
            const lastPlant = this.plants.pop();
            this.plantContainer.removeChild(lastPlant);
        } else if (this.paintStrokes.length > 0) {
            const lastStroke = this.paintStrokes.pop();
            this.effectContainer.removeChild(lastStroke);
        } else if (this.shapes.length > 0) {
            const lastShape = this.shapes.pop();
            this.effectContainer.removeChild(lastShape);
        }
    }
    
    resetGarden() {
        // Clear all containers
        this.grassContainer.removeChildren();
        this.plantContainer.removeChildren();
        this.effectContainer.removeChildren();
        this.animalContainer.removeChildren();
        
        // Reset arrays
        this.grassPatches = [];
        this.plants = [];
        this.butterflies = [];
        this.animals = [];
        this.paintStrokes = [];
        this.shapes = [];
        this.effects = [];
        
        // Reset counts
        this.flowerCount = 0;
        this.vegetableCount = 0;
        this.grassCount = 0;
        this.starSeeds = 0;
        
        // Reinitialize garden
        this.initializeGarden();
        
        this.speakPraise('celebration', 'Fresh new garden!');
    }
    
    setupSplashScreen() {
        const splash = document.getElementById('splash-screen');
        
        const hideSplash = () => {
            splash.style.opacity = '0';
            setTimeout(() => {
                splash.style.display = 'none';
            }, 500);
        };
        
        // Auto-hide after 5 seconds
        setTimeout(hideSplash, 5000);
        
        // Hide on interaction
        splash.addEventListener('click', hideSplash);
        splash.addEventListener('touchstart', hideSplash);
    }
    
    gameLoop() {
        // Update effects
        this.effects = this.effects.filter(effect => {
            if (effect.life !== undefined) {
                effect.life--;
                
                if (effect.vx !== undefined) {
                    effect.x += effect.vx;
                    effect.y += effect.vy;
                    effect.vy += 0.2; // Gravity
                }
                
                if (effect.life <= 0) {
                    this.effectContainer.removeChild(effect);
                    return false;
                }
            }
            return true;
        });
        
        // Update animals
        this.animals = this.animals.filter(animal => {
            animal.x += animal.vx;
            animal.y += animal.vy;
            
            // Remove if off screen
            if (animal.x < -100 || animal.x > this.app.screen.width + 100) {
                this.animalContainer.removeChild(animal);
                return false;
            }
            
            // Bounce animation
            if (animal.animalType) {
                animal.y += Math.sin(Date.now() * 0.01) * 0.5;
            }
            
            return true;
        });
        
        // Update butterflies
        this.butterflies.forEach(butterfly => {
            // Wander behavior
            butterfly.wanderAngle += (Math.random() - 0.5) * 0.2;
            butterfly.vx = Math.cos(butterfly.wanderAngle) * 2;
            butterfly.vy = Math.sin(butterfly.wanderAngle) * 2;
            
            butterfly.x += butterfly.vx;
            butterfly.y += butterfly.vy;
            
            // Keep on screen
            if (butterfly.x < 0 || butterfly.x > this.app.screen.width) butterfly.vx *= -1;
            if (butterfly.y < 0 || butterfly.y > this.app.screen.height) butterfly.vy *= -1;
            
            // Flutter animation
            butterfly.rotation = Math.sin(Date.now() * 0.01) * 0.2;
        });
    }
}

// Initialize game when DOM is ready and PIXI is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a moment for PIXI to fully load
    if (typeof PIXI !== 'undefined') {
        console.log('Initializing Mira\'s Yard with Pixi.js');
        new MirasYardPixi();
    } else {
        // If PIXI isn't loaded yet, wait and retry
        setTimeout(() => {
            if (typeof PIXI !== 'undefined') {
                console.log('Initializing Mira\'s Yard with Pixi.js (delayed)');
                new MirasYardPixi();
            } else {
                console.error('PIXI.js failed to load');
            }
        }, 1000);
    }
});
// Clean Mira's Yard Game - Core Functionality Only
console.log('🌻 Starting Clean Mira\'s Yard...');

class SimpleGarden {
    constructor() {
        console.log('Initializing Clean Garden...');
        
        this.canvas = document.getElementById('garden-canvas');
        if (!this.canvas) {
            console.error('Canvas not found!');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 1000;
        this.canvas.height = 600;
        
        // Simple game state
        this.currentTool = 'water';
        this.isDrawing = false;
        this.plants = [];
        this.grassBlades = [];
        this.mowedAreas = [];
        this.waterDrops = [];
        
        // Create natural grass
        this.createGrass();
        
        // Setup simple events
        this.setupEvents();
        
        // Start game loop
        this.gameLoop();
        
        console.log('Clean Garden ready!');
    }
    
    createGrass() {
        console.log('Creating natural grass...');
        for (let x = 10; x < 990; x += 20) {
            for (let y = 10; y < 590; y += 15) {
                if (Math.random() < 0.7) {
                    this.grassBlades.push({
                        x: x + (Math.random() - 0.5) * 15,
                        y: y + (Math.random() - 0.5) * 10,
                        height: 15 + Math.random() * 20,
                        baseHeight: 15 + Math.random() * 20,
                        cut: false,
                        swayPhase: Math.random() * Math.PI * 2,
                        swaySpeed: 0.01 + Math.random() * 0.02
                    });
                }
            }
        }
        console.log(`✅ Created ${this.grassBlades.length} natural grass blades`);
    }
    
    setupEvents() {
        // Tool selection
        document.querySelectorAll('.tool').forEach(tool => {
            tool.addEventListener('click', () => {
                document.querySelectorAll('.tool').forEach(t => t.classList.remove('active'));
                tool.classList.add('active');
                this.currentTool = tool.dataset.tool;
                console.log('✅ Tool selected:', this.currentTool);
            });
        });
        
        // Canvas interaction
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('mousedown', (e) => this.handleStart(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMove(e));
        this.canvas.addEventListener('mouseup', () => this.handleEnd());
        
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
    
    handleClick(e) {
        const coords = this.getCoords(e);
        console.log(`🖱️ Click at (${coords.x}, ${coords.y}) with ${this.currentTool}`);
        
        // Only handle reset on click - others use drag
        if (this.currentTool === 'reset') {
            this.reset();
        }
    }
    
    handleStart(e) {
        this.isDrawing = true;
        this.lastPlantTime = 0; // For spacing plants
        const coords = this.getCoords(e);
        
        switch(this.currentTool) {
            case 'water':
                this.addWater(coords.x, coords.y);
                break;
            case 'mower':
                this.mow(coords.x, coords.y);
                break;
            case 'flower':
                this.plantFlower(coords.x, coords.y);
                break;
            case 'vegetable':
                this.plantVegetable(coords.x, coords.y);
                break;
            case 'butterfly':
                this.plantButterfly(coords.x, coords.y);
                break;
            case 'shapes':
                this.plantStar(coords.x, coords.y);
                break;
        }
    }
    
    handleMove(e) {
        if (!this.isDrawing) return;
        const coords = this.getCoords(e);
        const now = Date.now();
        
        switch(this.currentTool) {
            case 'water':
                this.addWater(coords.x, coords.y);
                break;
            case 'mower':
                this.mow(coords.x, coords.y);
                break;
            case 'flower':
                // Plant flowers with spacing (not too dense)
                if (now - this.lastPlantTime > 200) {
                    this.plantFlower(coords.x, coords.y);
                    this.lastPlantTime = now;
                }
                break;
            case 'vegetable':
                if (now - this.lastPlantTime > 200) {
                    this.plantVegetable(coords.x, coords.y);
                    this.lastPlantTime = now;
                }
                break;
            case 'butterfly':
                if (now - this.lastPlantTime > 300) {
                    this.plantButterfly(coords.x, coords.y);
                    this.lastPlantTime = now;
                }
                break;
            case 'shapes':
                if (now - this.lastPlantTime > 250) {
                    this.plantStar(coords.x, coords.y);
                    this.lastPlantTime = now;
                }
                break;
        }
    }
    
    handleEnd() {
        this.isDrawing = false;
    }
    
    // Core tool implementations
    addWater(x, y) {
        // Add water drops
        for (let i = 0; i < 3; i++) {
            this.waterDrops.push({
                x: x + (Math.random() - 0.5) * 20,
                y: y + (Math.random() - 0.5) * 20,
                life: 40
            });
        }
        
        // Regrow grass
        this.grassBlades.forEach(blade => {
            const dist = Math.hypot(blade.x - x, blade.y - y);
            if (dist < 40 && blade.cut) {
                blade.cut = false;
                blade.height = blade.baseHeight;
            }
        });
        
        console.log('💧 Watering at', x, y);
    }
    
    mow(x, y) {
        // Add mowed area (lighter patch)
        this.mowedAreas.push({
            x: x,
            y: y,
            radius: 25
        });
        
        // Cut grass
        this.grassBlades.forEach(blade => {
            const dist = Math.hypot(blade.x - x, blade.y - y);
            if (dist < 30) {
                blade.cut = true;
            }
        });
        
        // Remove plants
        this.plants = this.plants.filter(plant => {
            const dist = Math.hypot(plant.x - x, plant.y - y);
            return dist > 30;
        });
        
        console.log('🚜 Mowing at', x, y);
    }
    
    plantFlower(x, y) {
        const flowers = ['🌸', '🌺', '🌻', '🌷', '🌹'];
        this.plants.push({
            x, y,
            emoji: flowers[Math.floor(Math.random() * flowers.length)],
            type: 'flower'
        });
        console.log('🌸 Planted flower at', x, y);
    }
    
    plantVegetable(x, y) {
        const vegetables = ['🥕', '🍅', '🌽', '🥒'];
        this.plants.push({
            x, y,
            emoji: vegetables[Math.floor(Math.random() * vegetables.length)],
            type: 'vegetable'
        });
        console.log('🥕 Planted vegetable at', x, y);
    }
    
    plantButterfly(x, y) {
        const creatures = ['🦋', '🧚', '🧚‍♀️', '🧚‍♂️']; // Butterflies AND fairies
        this.plants.push({
            x, y,
            emoji: creatures[Math.floor(Math.random() * creatures.length)],
            type: 'butterfly'
        });
        console.log('🦋 Placed butterfly/fairy at', x, y);
    }
    
    plantStar(x, y) {
        this.plants.push({
            x, y,
            emoji: '⭐',
            type: 'star'
        });
        console.log('⭐ Placed star at', x, y);
    }
    
    reset() {
        this.plants = [];
        this.waterDrops = [];
        this.mowedAreas = [];
        this.grassBlades.forEach(blade => {
            blade.cut = false;
            blade.height = blade.baseHeight;
        });
        console.log('🔄 Garden reset');
    }
    
    update() {
        // Update water drops
        this.waterDrops = this.waterDrops.filter(drop => {
            drop.life--;
            return drop.life > 0;
        });
        
        // Update grass sway
        this.grassBlades.forEach(blade => {
            blade.swayPhase += blade.swaySpeed;
        });
    }
    
    render() {
        // Clear with darker grass background for mowing contrast
        this.ctx.fillStyle = '#4A7C2A';  // Darker green so mowed areas show lighter
        this.ctx.fillRect(0, 0, 1000, 600);
        
        // Draw mowed areas (lighter green)
        this.mowedAreas.forEach(area => {
            this.ctx.fillStyle = '#7CB342'; // Lighter green for cut paths
            this.ctx.beginPath();
            this.ctx.arc(area.x, area.y, area.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Draw grass blades (natural green)
        this.grassBlades.forEach(blade => {
            if (!blade.cut) {
                const sway = Math.sin(blade.swayPhase) * 2;
                
                // Natural grass color - darker than background
                this.ctx.strokeStyle = '#4A7C2A';
                this.ctx.lineWidth = 1.5;
                this.ctx.lineCap = 'round';
                
                this.ctx.beginPath();
                this.ctx.moveTo(blade.x, blade.y);
                this.ctx.lineTo(blade.x + sway, blade.y - blade.height);
                this.ctx.stroke();
            }
        });
        
        // Draw water drops
        this.ctx.fillStyle = 'rgba(100, 200, 255, 0.7)';
        this.waterDrops.forEach(drop => {
            this.ctx.beginPath();
            this.ctx.arc(drop.x, drop.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Draw plants (on top)
        this.ctx.font = '28px Arial';
        this.ctx.fillStyle = '#000000';
        this.plants.forEach(plant => {
            // Debug red circle to show plant locations\n            this.ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';\n            this.ctx.beginPath();\n            this.ctx.arc(plant.x, plant.y, 12, 0, Math.PI * 2);\n            this.ctx.fill();\n            \n            // Draw emoji\n            this.ctx.fillStyle = '#000000';\n            this.ctx.textAlign = 'center';\n            this.ctx.fillText(plant.emoji, plant.x, plant.y);
        });
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Simple initialization
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM ready');
    
    const splash = document.getElementById('splash-screen');
    const gameContainer = document.getElementById('game-container');
    
    const startGame = () => {
        console.log('Starting clean game...');
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
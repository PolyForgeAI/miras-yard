// DEBUG VERSION - Always draw grass blades
console.log('🌻 Starting Simple Mira\'s Yard...');

class SimpleGarden {
    constructor() {
        console.log('Initializing Simple Garden...');
        
        // Get canvas
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
        this.mowedAreas = [];
        this.waterDrops = [];
        this.grassClippings = [];
        this.wateredAreas = [];
        this.butterflies = [];
        this.paintStrokes = [];
        this.paintColor = '#FF0000';
        this.brushSize = 16;
        this.currentPaintSound = null;
        this.paintSoundNote = 'C';
        
        // Audio context
        this.audioContext = null;
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Audio not available');
        }
        
        // Create grass
        this.createGrass();
        
        // Setup events
        this.setupEvents();
        this.setupPaintControls();
        
        // Start game loop
        this.gameLoop();
        
        console.log('Simple Garden ready!');
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
                        baseHeight: 18 + Math.random() * 28,
                        cut: false,
                        mowed: false,
                        swayPhase: Math.random() * Math.PI * 2,
                        swaySpeed: 0.008 + Math.random() * 0.015,
                        swayAmount: 2 + Math.random() * 4,
                        curve: 0.4 + Math.random() * 0.6,
                        baseRed: 60 + Math.random() * 40,
                        baseGreen: 100 + Math.random() * 60,
                        baseBlue: 50 + Math.random() * 40,
                        regrowthProgress: 1.0
                    });
                }
            }
        }
        console.log(`✅ Created ${this.grassBlades.length} grass blades`);
    }
    
    render() {
        // Clear with darker green field
        this.ctx.fillStyle = '#3D5C1A';
        this.ctx.fillRect(0, 0, 1000, 600);
        
        console.log(`🌱 Rendering ${this.grassBlades.length} grass blades`);
        
        // Draw ALL grass blades (remove cut condition)
        this.grassBlades.forEach((blade, index) => {
            const sway = Math.sin(blade.swayPhase) * blade.swayAmount;
            
            // Make grass bright green for visibility
            // Use natural green shades lighter than background\n            const grassShades = ['#6B9C4B', '#7BAC5B', '#8BBC6B', '#9BCC7B', '#ABDC8B'];\n            this.ctx.strokeStyle = grassShades[index % grassShades.length];
            this.ctx.lineWidth = 3; // Thicker for visibility
            this.ctx.lineCap = 'round';
            
            this.ctx.beginPath();
            this.ctx.moveTo(blade.x, blade.y);
            
            const tipX = blade.x + sway;
            const tipY = blade.y - blade.height;
            
            this.ctx.lineTo(tipX, tipY);
            this.ctx.stroke();
            
            // Debug: Log first few blades
            if (index < 3) {
                console.log(`Blade ${index}: (${blade.x}, ${blade.y}) height: ${blade.height}`);
            }
        });
        
        // Draw butterflies
        this.ctx.font = '25px Arial';
        this.ctx.fillStyle = '#000000';
        this.butterflies.forEach((butterfly, index) => {
            this.ctx.fillText('🦋', butterfly.x, butterfly.y);
            if (index === 0) {
                console.log(`🦋 Butterfly at: (${butterfly.x}, ${butterfly.y})`);
            }
        });
        
        // Draw plants
        this.ctx.font = '30px Arial';
        this.plants.forEach(plant => {
            this.ctx.fillText(plant.emoji, plant.x, plant.y);
        });
    }
    
    // Simplified event handling for debugging
    setupEvents() {
        document.querySelectorAll('.tool').forEach(tool => {
            tool.addEventListener('click', () => {
                document.querySelectorAll('.tool').forEach(t => t.classList.remove('active'));
                tool.classList.add('active');
                this.currentTool = tool.dataset.tool;
                console.log('Tool selected:', this.currentTool);
            });
        });
        
        this.canvas.addEventListener('click', (e) => {
            const coords = this.getCoords(e);
            console.log(`Click at: (${coords.x}, ${coords.y}) with tool: ${this.currentTool}`);
            
            if (this.currentTool === 'butterfly') {
                this.plantButterfly(coords.x, coords.y);
            }
        });
    }
    
    setupPaintControls() {
        // Simplified
    }
    
    getCoords(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * (1000 / rect.width),
            y: (e.clientY - rect.top) * (600 / rect.height)
        };
    }
    
    plantButterfly(x, y) {
        console.log(`🦋 Adding butterfly at (${x}, ${y})`);
        this.butterflies.push({
            x, y,
            emoji: '🦋',
            type: 'butterfly',
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2
        });
    }
    
    update() {
        // Update grass sway
        this.grassBlades.forEach(blade => {
            blade.swayPhase += blade.swaySpeed;
        });
        
        // Update butterflies
        this.butterflies.forEach(butterfly => {
            butterfly.x += butterfly.vx;
            butterfly.y += butterfly.vy;
            
            if (butterfly.x < 0 || butterfly.x > 1000) butterfly.vx *= -1;
            if (butterfly.y < 0 || butterfly.y > 600) butterfly.vy *= -1;
        });
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM ready');
    
    const splash = document.getElementById('splash-screen');
    const gameContainer = document.getElementById('game-container');
    
    const startGame = () => {
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
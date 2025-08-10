// Complete Fixed Mira's Yard Game
console.log('🌻 Starting Complete Mira\'s Yard...');

class SimpleGarden {
    constructor() {
        console.log('Initializing Complete Garden...');
        
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
        this.animals = []; // Add animals array
        this.paintStrokes = [];
        this.paintColor = '#FF0000';
        this.brushSize = 8; // Start with smallest brush
        this.currentPaintSound = null;
        this.paintSoundNote = 'C';
        this.paintOctave = 4; // Default octave
        
        // Audio context
        this.audioContext = null;
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Audio not available');
        }
        
        // Create grass
        this.createGrass();
        
        // Spawn initial animals
        this.spawnRandomAnimals();
        
        // Setup events
        this.setupEvents();
        this.setupPaintControls();
        
        // Start game loop
        this.gameLoop();
        
        console.log('Complete Garden ready!');
    }
    
    createGrass() {
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
        console.log(`Created ${this.grassBlades.length} grass blades`);
    }
    
    spawnRandomAnimals() {
        const animalTypes = [
            { emoji: '🐰', sound: 'hop', name: 'bunny' },
            { emoji: '🦔', sound: 'squeak', name: 'hedgehog' },
            { emoji: '🐿️', sound: 'chatter', name: 'squirrel' },
            { emoji: '🐸', sound: 'ribbit', name: 'frog' },
            { emoji: '🐛', sound: 'chirp', name: 'caterpillar' }
        ];\n        \n        // Spawn 3-5 random animals\n        const animalCount = 3 + Math.floor(Math.random() * 3);\n        for (let i = 0; i < animalCount; i++) {\n            const animalType = animalTypes[Math.floor(Math.random() * animalTypes.length)];\n            const animal = {\n                x: 50 + Math.random() * 900,\n                y: 50 + Math.random() * 500,\n                vx: (Math.random() - 0.5) * 1.5,\n                vy: (Math.random() - 0.5) * 1.5,\n                emoji: animalType.emoji,\n                sound: animalType.sound,\n                name: animalType.name,\n                lastSound: 0\n            };\n            this.animals.push(animal);\n        }\n        console.log(`🦔 Spawned ${this.animals.length} animals`);\n    }
    
    playAnimalSound(animal) {
        if (!this.audioContext || Date.now() - animal.lastSound < 3000) return;
        
        animal.lastSound = Date.now();
        
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        // Different animal sounds
        const soundMap = {
            'hop': { freq: 400, type: 'sine' },
            'squeak': { freq: 800, type: 'square' },
            'chatter': { freq: 600, type: 'sawtooth' },
            'ribbit': { freq: 200, type: 'triangle' },
            'chirp': { freq: 1000, type: 'sine' }
        };
        
        const soundConfig = soundMap[animal.sound] || soundMap.chirp;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(soundConfig.freq, this.audioContext.currentTime);
        oscillator.type = soundConfig.type;
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.05, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
        
        console.log(`🔊 ${animal.name} says ${animal.sound}!`);
    }
    
    startPaintSound() {
        if (!this.audioContext || this.currentPaintSound) return;
        
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        // Musical note frequencies with octave support
        const noteFreqs = {
            'C': [130.81, 261.63, 523.25, 1046.50, 2093.00],  // C2, C3, C4, C5, C6
            'D': [146.83, 293.66, 587.33, 1174.66, 2349.32],  // D2, D3, D4, D5, D6
            'E': [164.81, 329.63, 659.25, 1318.51, 2637.02],  // E2, E3, E4, E5, E6
            'F': [174.61, 349.23, 698.46, 1396.91, 2793.83],  // F2, F3, F4, F5, F6
            'G': [196.00, 392.00, 783.99, 1567.98, 3135.96],  // G2, G3, G4, G5, G6
            'A': [220.00, 440.00, 880.00, 1760.00, 3520.00],  // A2, A3, A4, A5, A6
            'B': [246.94, 493.88, 987.77, 1975.53, 3951.07],  // B2, B3, B4, B5, B6
            'synth': [75, 150, 300, 600, 1200]  // Synth tones
        };
        
        const noteArray = noteFreqs[this.paintSoundNote] || noteFreqs['C'];
        // Map brush size to octave: 8->4, 16->3, 24->2, 32->1
        const octaveIndex = Math.max(0, Math.min(4, 4 - Math.floor((this.brushSize - 8) / 8)));
        const freq = noteArray[octaveIndex];
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
        oscillator.type = this.paintSoundNote === 'synth' ? 'square' : 'sine';
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.05);
        
        oscillator.start(this.audioContext.currentTime);
        
        this.currentPaintSound = {
            oscillator: oscillator,
            gainNode: gainNode
        };
        
        console.log(`🎵 Playing ${this.paintSoundNote} note, octave ${octaveIndex + 2}, freq: ${freq}Hz, brush: ${this.brushSize}px`);
    }
    
    stopPaintSound() {
        if (this.currentPaintSound) {
            const { oscillator, gainNode } = this.currentPaintSound;
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
            oscillator.stop(this.audioContext.currentTime + 0.1);
            this.currentPaintSound = null;
        }
    }
    
    setupEvents() {
        // Tool buttons
        document.querySelectorAll('.tool').forEach(tool => {
            tool.addEventListener('click', () => {
                document.querySelectorAll('.tool').forEach(t => t.classList.remove('active'));
                tool.classList.add('active');
                this.currentTool = tool.dataset.tool;
                console.log('Tool selected:', this.currentTool);
                
                // Show paint controls
                const paintControls = document.getElementById('paint-controls');
                if (this.currentTool === 'paint') {
                    paintControls.classList.add('show');
                } else {
                    paintControls.classList.remove('show');
                }
            });
        });
        
        // Canvas events
        this.canvas.addEventListener('mousedown', (e) => this.handleStart(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMove(e));
        this.canvas.addEventListener('mouseup', () => this.handleEnd());
        
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
    
    setupPaintControls() {
        // Color controls
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
                this.paintColor = option.dataset.color;
                this.paintSoundNote = option.dataset.note;
                console.log('Paint color:', this.paintColor, 'Note:', this.paintSoundNote);
            });
        });
        
        // Brush size controls
        document.querySelectorAll('.brush-size').forEach(brush => {
            brush.addEventListener('click', () => {
                document.querySelectorAll('.brush-size').forEach(b => b.classList.remove('selected'));
                brush.classList.add('selected');
                this.brushSize = parseInt(brush.dataset.size);
                this.paintOctave = parseInt(brush.dataset.octave);
                console.log('Brush size:', this.brushSize, 'Octave:', this.paintOctave);
            });
        });
    }
    
    handleStart(e) {
        this.isDrawing = true;
        const coords = this.getCoords(e);
        
        switch(this.currentTool) {
            case 'water':
                this.addWater(coords.x, coords.y);
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
            case 'rainbow':
                this.paintRainbow(coords.x, coords.y);
                break;
            case 'paint':
                this.startPaint(coords.x, coords.y);
                break;
            case 'mower':
                this.mow(coords.x, coords.y);
                break;
            case 'reset':
                this.reset();
                break;
        }
    }
    
    handleMove(e) {
        if (!this.isDrawing) return;
        const coords = this.getCoords(e);
        
        switch(this.currentTool) {
            case 'water':
                this.addWater(coords.x, coords.y);
                break;
            case 'paint':
                this.continuePaint(coords.x, coords.y);
                break;
            case 'mower':
                this.mow(coords.x, coords.y);
                break;
        }
    }
    
    handleEnd() {
        this.isDrawing = false;
        this.currentStroke = null;
        this.stopPaintSound();
    }
    
    getCoords(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * (1000 / rect.width),
            y: (e.clientY - rect.top) * (600 / rect.height)
        };
    }
    
    addWater(x, y) {
        for (let i = 0; i < 5; i++) {
            this.waterDrops.push({
                x: x + (Math.random() - 0.5) * 30,
                y: y + (Math.random() - 0.5) * 30,
                life: 60
            });
        }
        
        this.wateredAreas.push({
            x: x,
            y: y,
            radius: 60,
            strength: 1.0,
            life: 300
        });
    }
    
    plantFlower(x, y) {
        const flowers = ['🌸', '🌺', '🌻', '🌷', '🌹'];
        this.plants.push({
            x, y,
            emoji: flowers[Math.floor(Math.random() * flowers.length)],
            type: 'flower'
        });
    }
    
    plantVegetable(x, y) {
        const vegetables = ['🥕', '🍅', '🌽', '🥒'];
        this.plants.push({
            x, y,
            emoji: vegetables[Math.floor(Math.random() * vegetables.length)],
            type: 'vegetable'
        });
    }
    
    plantButterfly(x, y) {
        this.butterflies.push({
            x, y,
            emoji: '🦋',
            type: 'butterfly',
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2
        });
    }
    
    plantStar(x, y) {
        this.plants.push({
            x, y,
            emoji: '⭐',
            type: 'star'
        });
    }
    
    paintRainbow(x, y) {
        const colors = ['#FF0000', '#FF8000', '#FFFF00', '#00FF00', '#0080FF', '#8000FF'];
        for (let i = 0; i < 6; i++) {
            this.paintStrokes.push({
                points: [{x: x + i * 8, y: y - i * 4}, {x: x + i * 8 + 20, y: y - i * 4}],
                color: colors[i],
                size: 6
            });
        }
    }
    
    startPaint(x, y) {
        this.currentStroke = {
            points: [{x, y}],
            color: this.paintColor,
            size: this.brushSize
        };
        this.paintStrokes.push(this.currentStroke);
        this.startPaintSound();
    }
    
    continuePaint(x, y) {
        if (this.currentStroke) {
            this.currentStroke.points.push({x, y});
        }
    }
    
    mow(x, y) {
        this.mowedAreas.push({
            x: x,
            y: y,
            radius: 40
        });
        
        this.grassBlades.forEach(blade => {
            const dist = Math.hypot(blade.x - x, blade.y - y);
            if (dist < 50 && !blade.cut) {
                blade.cut = true;
                blade.mowed = true;
                blade.regrowthProgress = 0.0;
            }
        });
        
        this.plants = this.plants.filter(plant => {
            const dist = Math.hypot(plant.x - x, plant.y - y);
            return dist > 50;
        });
    }
    
    reset() {
        this.plants = [];
        this.waterDrops = [];
        this.paintStrokes = [];
        this.butterflies = [];
        this.animals = [];
        this.grassBlades.forEach(blade => {
            blade.cut = false;
            blade.mowed = false;
            blade.height = blade.baseHeight;
            blade.regrowthProgress = 1.0;
        });
        this.mowedAreas = [];
        this.wateredAreas = [];
        
        // Respawn animals
        this.spawnRandomAnimals();
    }
    
    update() {
        // Update water drops
        this.waterDrops = this.waterDrops.filter(drop => {
            drop.life--;
            return drop.life > 0;
        });
        
        // Update grass
        this.grassBlades.forEach(blade => {
            blade.swayPhase += blade.swaySpeed;
            
            if (blade.cut && blade.regrowthProgress < 1.0) {
                let growthRate = 0;
                
                this.wateredAreas.forEach(area => {
                    const dist = Math.hypot(blade.x - area.x, blade.y - area.y);
                    if (dist < area.radius) {
                        const influence = (1 - dist / area.radius) * area.strength;
                        growthRate += influence * 0.008;
                    }
                });
                
                blade.regrowthProgress += growthRate;
                if (blade.regrowthProgress > 1.0) {
                    blade.regrowthProgress = 1.0;
                    blade.cut = false;
                    blade.mowed = false;
                }
                
                blade.height = blade.baseHeight * blade.regrowthProgress;
            }
        });
        
        // Update watered areas
        this.wateredAreas = this.wateredAreas.filter(area => {
            area.life--;
            area.strength *= 0.998;
            return area.life > 0 && area.strength > 0.01;
        });
        
        // Update butterflies
        this.butterflies.forEach(butterfly => {
            butterfly.x += butterfly.vx;
            butterfly.y += butterfly.vy;
            
            if (butterfly.x < 0 || butterfly.x > 1000) butterfly.vx *= -1;
            if (butterfly.y < 0 || butterfly.y > 600) butterfly.vy *= -1;
            
            if (Math.random() < 0.02) {
                butterfly.vx += (Math.random() - 0.5) * 0.5;
                butterfly.vy += (Math.random() - 0.5) * 0.5;
            }
        });
        
        // Update animals
        this.animals.forEach(animal => {
            animal.x += animal.vx;
            animal.y += animal.vy;
            
            // Bounce off edges
            if (animal.x < 30 || animal.x > 970) animal.vx *= -1;
            if (animal.y < 30 || animal.y > 570) animal.vy *= -1;
            
            // Random direction changes
            if (Math.random() < 0.01) {
                animal.vx += (Math.random() - 0.5) * 0.3;
                animal.vy += (Math.random() - 0.5) * 0.3;
            }
            
            // Occasional sounds
            if (Math.random() < 0.002) {
                this.playAnimalSound(animal);
            }
        });
    }
    
    render() {
        // Clear with darker green field
        this.ctx.fillStyle = '#3D5C1A';
        this.ctx.fillRect(0, 0, 1000, 600);
        
        // LAYER 1: Mowed areas (lighter green paths)
        this.mowedAreas.forEach(area => {
            this.ctx.fillStyle = '#7CB342';
            this.ctx.beginPath();
            this.ctx.arc(area.x, area.y, area.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // LAYER 2: Grass blades (background)
        this.grassBlades.forEach(blade => {
            if (!blade.cut) {
                const sway = Math.sin(blade.swayPhase) * blade.swayAmount;
                
                const progress = blade.regrowthProgress;
                const r = blade.baseRed * progress;
                const g = blade.baseGreen * progress;
                const b = blade.baseBlue * progress;
                this.ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.7 + progress * 0.2})`;
                this.ctx.lineWidth = 2;
                this.ctx.lineCap = 'round';
                
                this.ctx.beginPath();
                this.ctx.moveTo(blade.x, blade.y);
                
                const midX = blade.x + sway * 0.5;
                const midY = blade.y - blade.height * 0.6;
                const tipX = blade.x + sway;
                const tipY = blade.y - blade.height;
                
                this.ctx.quadraticCurveTo(midX, midY, tipX, tipY);
                this.ctx.stroke();
            }
        });
        
        // LAYER 3: Water drops
        this.ctx.fillStyle = 'rgba(100, 200, 255, 0.6)';
        this.waterDrops.forEach(drop => {
            this.ctx.beginPath();
            this.ctx.arc(drop.x, drop.y, 4, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // LAYER 4: Paint strokes (ON TOP of grass)
        this.paintStrokes.forEach(stroke => {
            this.ctx.strokeStyle = stroke.color;
            this.ctx.lineWidth = stroke.size;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            
            this.ctx.beginPath();
            stroke.points.forEach((point, i) => {
                if (i === 0) {
                    this.ctx.moveTo(point.x, point.y);
                } else {\n                    this.ctx.lineTo(point.x, point.y);
                }
            });
            this.ctx.stroke();
        });
        
        // LAYER 5: Plants (ON TOP of everything)
        this.ctx.font = '30px Arial';
        this.ctx.fillStyle = '#000000';
        this.plants.forEach(plant => {
            this.ctx.fillText(plant.emoji, plant.x, plant.y);
        });
        
        // LAYER 6: Butterflies (ON TOP)
        this.ctx.font = '25px Arial';
        this.butterflies.forEach(butterfly => {
            this.ctx.fillText('🦋', butterfly.x, butterfly.y);
        });
        
        // LAYER 7: Animals (ON TOP)
        this.ctx.font = '28px Arial';
        this.animals.forEach(animal => {
            this.ctx.fillText(animal.emoji, animal.x, animal.y);
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
        console.log('Starting complete game...');
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
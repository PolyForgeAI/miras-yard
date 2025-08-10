// Simplified Mira's Yard Game - FULLY FIXED VERSION
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
        this.canvas.height = 600; // More landscape for iPad/phone
        
        // Game state
        this.currentTool = 'water';
        this.isDrawing = false;
        this.plants = [];
        this.grassBlades = [];
        this.mowedAreas = []; // Track mowed paths
        this.waterDrops = [];
        this.grassClippings = []; // Flying clippings
        this.wateredAreas = []; // Track watered areas for gradual regrowth
        this.butterflies = [];
        this.paintStrokes = [];
        this.paintColor = '#FF0000';
        this.brushSize = 16;
        this.currentPaintSound = null; // Track current paint sound
        this.paintSoundNote = 'C'; // Current musical note
        
        // Audio context for sounds
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
        
        // Setup paint controls
        this.setupPaintControls();
        
        // Start game loop
        this.gameLoop();
        
        console.log('Simple Garden ready!');
    }
    
    createGrass() {
        // Create dense grass coverage from border to border
        for (let x = 10; x < 990; x += 15) {
            for (let y = 10; y < 590; y += 12) {
                if (Math.random() < 0.8) {
                    this.grassBlades.push({
                        x: x + (Math.random() - 0.5) * 10,
                        y: y + (Math.random() - 0.5) * 8,
                        height: 18 + Math.random() * 28, // Taller grass
                        baseHeight: 18 + Math.random() * 28,
                        cut: false,
                        mowed: false,
                        swayPhase: Math.random() * Math.PI * 2,
                        swaySpeed: 0.008 + Math.random() * 0.015,
                        swayAmount: 2 + Math.random() * 4,
                        curve: 0.4 + Math.random() * 0.6,
                        // Varied green colors lighter than dark background #3D5C1A
                        baseRed: 60 + Math.random() * 40,   // 60-100 (lighter than bg 61)
                        baseGreen: 100 + Math.random() * 60, // 100-160 (lighter than bg 92) 
                        baseBlue: 50 + Math.random() * 40,   // 50-90 (lighter than bg 26)
                        regrowthProgress: 1.0 // 0.0 = cut, 1.0 = full grown
                    });
                }
            }
        }
        console.log(`Created ${this.grassBlades.length} dense grass blades`);
    }
    
    playWateringSound() {
        if (!this.audioContext) return;
        
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        // Create watering sound - soft bubbling/splashing
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(200 + Math.random() * 100, this.audioContext.currentTime);
        oscillator.type = 'sawtooth';
        filter.frequency.setValueAtTime(400, this.audioContext.currentTime);
        filter.Q.setValueAtTime(2, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.03, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }
    
    playMowingSound() {
        if (!this.audioContext) return;
        
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        // Create mowing sound - mechanical buzz
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(80 + Math.random() * 40, this.audioContext.currentTime);
        oscillator.type = 'sawtooth';
        filter.frequency.setValueAtTime(200, this.audioContext.currentTime);
        filter.Q.setValueAtTime(5, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.08, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }
    
    startPaintSound() {
        if (!this.audioContext || this.currentPaintSound) return;
        
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        // Musical note frequencies
        const noteFreqs = {
            'C': 261.63,
            'D': 293.66,
            'E': 329.63,
            'F': 349.23,
            'G': 392.00,
            'A': 440.00,
            'B': 493.88,
            'synth': 150
        };
        
        const freq = noteFreqs[this.paintSoundNote] || 261.63;
        
        // Create continuous paint sound
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
                console.log('Tool:', this.currentTool);
                
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
        // Paint color controls
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
                console.log('Brush size:', this.brushSize);
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
            case 'pick-flower':
                this.pickFlowers(coords.x, coords.y);
                break;
            case 'pick-vegetable':
                this.pickVegetables(coords.x, coords.y);
                break;
            case 'butterfly-net':
                this.catchButterflies(coords.x, coords.y);
                break;
            case 'broom':
                this.clearArt(coords.x, coords.y);
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
                this.continuePaint(coords.x, coords.y);
                break;
            case 'mower':
                this.mow(coords.x, coords.y);
                break;
            case 'pick-flower':
                this.pickFlowers(coords.x, coords.y);
                break;
            case 'pick-vegetable':
                this.pickVegetables(coords.x, coords.y);
                break;
            case 'butterfly-net':
                this.catchButterflies(coords.x, coords.y);
                break;
            case 'broom':
                this.clearArt(coords.x, coords.y);
                break;
        }
    }
    
    handleEnd() {
        this.isDrawing = false;
        this.currentStroke = null;
        this.stopPaintSound(); // Stop continuous sound when brush lifted
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
        
        // Add watered area for gradual regrowth
        this.wateredAreas.push({
            x: x,
            y: y,
            radius: 60,
            strength: 1.0,
            life: 300 // How long the watering effect lasts
        });
        
        // Play watering sound
        this.playWateringSound();
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
    
    pickFlowers(x, y) {
        this.plants = this.plants.filter(plant => {
            const dist = Math.hypot(plant.x - x, plant.y - y);
            return !(plant.type === 'flower' && dist < 50);
        });
    }
    
    pickVegetables(x, y) {
        this.plants = this.plants.filter(plant => {
            const dist = Math.hypot(plant.x - x, plant.y - y);
            return !(plant.type === 'vegetable' && dist < 50);
        });
    }
    
    catchButterflies(x, y) {
        this.butterflies = this.butterflies.filter(butterfly => {
            const dist = Math.hypot(butterfly.x - x, butterfly.y - y);
            return dist > 50;
        });
    }
    
    clearArt(x, y) {
        this.paintStrokes = this.paintStrokes.filter(stroke => {
            return !stroke.points.some(point => {
                const dist = Math.hypot(point.x - x, point.y - y);
                return dist < 50;
            });
        });
    }
    
    startPaint(x, y) {
        this.currentStroke = {
            points: [{x, y}],
            color: this.paintColor,
            size: this.brushSize
        };
        this.paintStrokes.push(this.currentStroke);
        this.startPaintSound(); // Start continuous sound
    }
    
    continuePaint(x, y) {
        if (this.currentStroke) {
            this.currentStroke.points.push({x, y});
        }
    }
    
    mow(x, y) {
        // Add mowed area (lighter green path)
        this.mowedAreas.push({
            x: x,
            y: y,
            radius: 40
        });
        
        // Cut grass and create clippings
        this.grassBlades.forEach(blade => {
            const dist = Math.hypot(blade.x - x, blade.y - y);
            if (dist < 50 && !blade.cut) {
                blade.cut = true;
                blade.mowed = true;
                blade.regrowthProgress = 0.0; // Reset regrowth progress
                
                // Create flying grass clippings
                for (let i = 0; i < 3; i++) {
                    this.grassClippings.push({
                        x: blade.x + (Math.random() - 0.5) * 20,
                        y: blade.y - 10,
                        vx: (Math.random() - 0.5) * 4,
                        vy: -2 - Math.random() * 3,
                        size: 1 + Math.random() * 2,
                        alpha: 0.8,
                        life: 30
                    });
                }
            }
        });
        
        // Remove plants
        this.plants = this.plants.filter(plant => {
            const dist = Math.hypot(plant.x - x, plant.y - y);
            return dist > 50;
        });
        
        // Play mowing sound
        this.playMowingSound();
    }
    
    reset() {
        this.plants = [];
        this.waterDrops = [];
        this.paintStrokes = [];
        this.butterflies = [];
        this.grassBlades.forEach(blade => {
            blade.cut = false;
            blade.mowed = false;
            blade.height = blade.baseHeight;
            blade.regrowthProgress = 1.0;
        });
        this.mowedAreas = [];
        this.wateredAreas = [];
    }
    
    update() {
        // Update water drops
        this.waterDrops = this.waterDrops.filter(drop => {
            drop.life--;
            return drop.life > 0;
        });
        
        // Update grass with flowing motion and gradual regrowth
        this.grassBlades.forEach(blade => {
            blade.swayPhase += blade.swaySpeed;
            
            // Check if blade is being watered for gradual regrowth
            if (blade.cut && blade.regrowthProgress < 1.0) {
                let growthRate = 0;
                
                // Check all watered areas affecting this blade
                this.wateredAreas.forEach(area => {
                    const dist = Math.hypot(blade.x - area.x, blade.y - area.y);
                    if (dist < area.radius) {
                        const influence = (1 - dist / area.radius) * area.strength;
                        growthRate += influence * 0.008; // Gradual growth rate
                    }
                });
                
                blade.regrowthProgress += growthRate;
                if (blade.regrowthProgress > 1.0) {
                    blade.regrowthProgress = 1.0;
                    blade.cut = false;
                    blade.mowed = false;
                }
                
                // Update blade height based on regrowth progress
                blade.height = blade.baseHeight * blade.regrowthProgress;
            }
        });
        
        // Update watered areas (they fade over time)
        this.wateredAreas = this.wateredAreas.filter(area => {
            area.life--;
            area.strength *= 0.998; // Gradually weaken
            return area.life > 0 && area.strength > 0.01;
        });
        
        // Remove mowed areas where grass has fully regrown
        this.mowedAreas = this.mowedAreas.filter(area => {
            let allRegrown = true;
            this.grassBlades.forEach(blade => {
                const dist = Math.hypot(blade.x - area.x, blade.y - area.y);
                if (dist < area.radius && blade.regrowthProgress < 0.8) {
                    allRegrown = false;
                }
            });
            return !allRegrown;
        });
        
        // Update grass clippings
        this.grassClippings = this.grassClippings.filter(clipping => {
            clipping.x += clipping.vx;
            clipping.y += clipping.vy;
            clipping.vy += 0.1; // Gravity
            clipping.alpha -= 0.02;
            clipping.life--;
            return clipping.life > 0 && clipping.alpha > 0;
        });
        
        // Update butterflies
        this.butterflies.forEach(butterfly => {
            butterfly.x += butterfly.vx;
            butterfly.y += butterfly.vy;
            
            // Bounce off edges
            if (butterfly.x < 0 || butterfly.x > 1000) butterfly.vx *= -1;
            if (butterfly.y < 0 || butterfly.y > 600) butterfly.vy *= -1;
            
            // Random direction changes
            if (Math.random() < 0.02) {
                butterfly.vx += (Math.random() - 0.5) * 0.5;
                butterfly.vy += (Math.random() - 0.5) * 0.5;
            }
        });
    }
    
    render() {
        // Clear with darker green field
        this.ctx.fillStyle = '#3D5C1A';
        this.ctx.fillRect(0, 0, 1000, 600);
        
        // Draw mowed areas first (lighter green paths)
        this.mowedAreas.forEach(area => {
            this.ctx.fillStyle = '#7CB342'; // Lighter green for mowed paths
            this.ctx.beginPath();
            this.ctx.arc(area.x, area.y, area.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Draw grass blades with darker green color and flowing motion
        this.grassBlades.forEach(blade => {
            // Always draw blades - remove cut condition for debugging
            // // Always draw blades
                const sway = Math.sin(blade.swayPhase) * blade.swayAmount;
                const curve = blade.curve;
                
                // Varied green colors based on regrowth progress
                const progress = blade.regrowthProgress;
                const r = blade.baseRed * progress;
                const g = blade.baseGreen * progress;
                const b = blade.baseBlue * progress;
                this.ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.7 + progress * 0.2})`;
                this.ctx.lineWidth = 2.5;
                this.ctx.lineCap = 'round';
                
                this.ctx.beginPath();
                this.ctx.moveTo(blade.x, blade.y);
                // Create curved grass blade with flowing motion
                const midX = blade.x + sway * 0.5;
                const midY = blade.y - blade.height * 0.6;
                const tipX = blade.x + sway;
                const tipY = blade.y - blade.height;
                
                this.ctx.quadraticCurveTo(midX, midY, tipX, tipY);
                this.ctx.stroke();
            }
        });
        
        // Draw grass clippings animation
        this.grassClippings.forEach(clipping => {
            this.ctx.fillStyle = `rgba(60, 120, 40, ${clipping.alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(clipping.x, clipping.y, clipping.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Draw water
        this.ctx.fillStyle = 'rgba(100, 200, 255, 0.6)';
        this.waterDrops.forEach(drop => {
            this.ctx.beginPath();
            this.ctx.arc(drop.x, drop.y, 4, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Draw paint
        this.paintStrokes.forEach(stroke => {
            this.ctx.strokeStyle = stroke.color;
            this.ctx.lineWidth = stroke.size;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            
            this.ctx.beginPath();
            stroke.points.forEach((point, i) => {
                if (i === 0) {
                    this.ctx.moveTo(point.x, point.y);
                } else {
                    this.ctx.lineTo(point.x, point.y);
                }
            });
            this.ctx.stroke();
        });
        
        // Draw plants
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.plants.forEach(plant => {
            this.ctx.fillText(plant.emoji, plant.x, plant.y);
        });
        
        // Draw butterflies
        this.ctx.font = '25px Arial';
        this.butterflies.forEach(butterfly => {
            this.ctx.fillText(butterfly.emoji, butterfly.x, butterfly.y);
        });
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize when DOM is ready
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
            try {
                new SimpleGarden();
            } catch (error) {
                console.error('Game error:', error);
            }
        }, 100);
    };
    
    splash.addEventListener('click', startGame);
    splash.addEventListener('touchstart', startGame);
    setTimeout(startGame, 4000);
});
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
        
        // Load saved progress
        this.loadProgress();
        
        // Start game loop
        this.gameLoop();
    }
    
    initializeVoice() {
        // Initialize Web Speech API
        this.voiceEnabled = 'speechSynthesis' in window;
        this.currentVoice = null;
        
        if (this.voiceEnabled) {
            // Wait for voices to load
            const setVoice = () => {
                const voices = speechSynthesis.getVoices();
                console.log('Available voices:', voices.map(v => `${v.name} (${v.lang}) - ${v.gender || 'unknown'}`));
                
                // Priority order: female voices first, then English voices, then any voice
                this.currentVoice = 
                    // First priority: Female voices
                    voices.find(voice => 
                        voice.name.toLowerCase().includes('female') ||
                        voice.name.toLowerCase().includes('woman') ||
                        voice.name.toLowerCase().includes('girl') ||
                        voice.name.toLowerCase().includes('zira') || // Microsoft Zira
                        voice.name.toLowerCase().includes('susan') || // macOS Susan
                        voice.name.toLowerCase().includes('karen') || // macOS Karen
                        voice.name.toLowerCase().includes('samantha') || // macOS Samantha
                        voice.name.toLowerCase().includes('victoria') // macOS Victoria
                    ) ||
                    // Second priority: Child or high-pitched voices
                    voices.find(voice => 
                        voice.name.toLowerCase().includes('child') ||
                        voice.name.toLowerCase().includes('kid')
                    ) ||
                    // Third priority: English voices (often default to female)
                    voices.find(voice => voice.lang.startsWith('en')) ||
                    // Fallback: any available voice
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
            butterfly: ['Great catch!', 'Nice work!', 'Well done!', 'Excellent!'],
            general: ['Good job!', 'Well done!', 'Keep going!', 'Amazing!', 'Wonderful!'],
            celebration: ['Fantastic work!', 'You are amazing!', 'Incredible job!', 'So proud of you!'],
            counting: ['One!', 'Two!', 'Three!', 'Four!', 'Five!', 'Six!', 'Seven!', 'Eight!', 'Nine!', 'Ten!']
        };
    }
    
    speakPraise(category, customMessage = null) {
        if (!this.voiceEnabled || !this.currentVoice) return;
        
        let message;
        if (customMessage) {
            message = customMessage;
        } else if (this.praisePhrases[category]) {
            const phrases = this.praisePhrases[category];
            message = phrases[Math.floor(Math.random() * phrases.length)];
        } else {
            message = this.praisePhrases.general[Math.floor(Math.random() * this.praisePhrases.general.length)];
        }
        
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.voice = this.currentVoice;
        utterance.rate = 0.9; // Slightly faster
        utterance.pitch = 1.5; // Higher pitch, more friendly
        utterance.volume = 0.8;
        
        // Cancel any current speech and speak new phrase
        speechSynthesis.cancel();
        speechSynthesis.speak(utterance);
    }
    
    incrementActionCount() {
        this.actionCount++;
        
        // Every 5 actions, give special celebration praise and confetti
        if (this.actionCount % 5 === 0) {
            this.speakPraise('celebration');
            this.createCelebrationConfetti();
        }
    }
    
    spawnAnimal() {
        const animalType = this.animalTypes[Math.floor(Math.random() * this.animalTypes.length)];
        const side = Math.random() > 0.5 ? 'left' : 'right'; // Which side to enter from
        
        let startX, startY, vx, vy;
        
        if (side === 'left') {
            startX = -40;
            startY = this.canvas.height * 0.6 + Math.random() * this.canvas.height * 0.3;
            vx = animalType.speed;
            vy = (Math.random() - 0.5) * 0.5; // Slight vertical drift
        } else {
            startX = this.canvas.width + 40;
            startY = this.canvas.height * 0.6 + Math.random() * this.canvas.height * 0.3;
            vx = -animalType.speed;
            vy = (Math.random() - 0.5) * 0.5;
        }
        
        // Special handling for Lux the dog - much bigger and special announcements
        let animalSize;
        if (animalType.isSpecial && animalType.name === 'lux') {
            animalSize = 70 + Math.random() * 20; // Much bigger: 70-90px for Lux
        } else {
            animalSize = 40 + Math.random() * 20; // Regular size: 40-60px
        }
        
        const animal = {
            ...animalType,
            x: startX,
            y: startY,
            vx: vx,
            vy: vy,
            bounceTimer: 0,
            bounceOffset: 0,
            size: animalSize
        };
        
        this.animals.push(animal);
        
        // Special announcements for Lux!
        if (animalType.isSpecial && animalType.name === 'lux') {
            const luxGreetings = [
                "Here comes Lux!",
                "Lux is a good boy!",
                "Look, it's Lux!",
                "Hi Lux!",
                "Good dog Lux!"
            ];
            const greeting = luxGreetings[Math.floor(Math.random() * luxGreetings.length)];
            
            setTimeout(() => {
                this.speakPraise('general', greeting);
            }, 500);
        }
    }
    
    
    createCelebrationConfetti() {
        // Create colorful confetti particles across the screen
        const colors = ['#FF0000', '#FF8C00', '#FFD700', '#32CD32', '#1E90FF', '#8A2BE2', '#FF69B4'];
        const confettiCount = 30;
        
        for (let i = 0; i < confettiCount; i++) {
            const confetti = {
                type: 'confetti',
                x: Math.random() * this.canvas.width,
                y: -20,
                vx: (Math.random() - 0.5) * 6,
                vy: Math.random() * 3 + 2,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 10,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 8 + 4,
                life: 300, // Frames
                maxLife: 300,
                shape: Math.random() > 0.5 ? 'circle' : 'square'
            };
            this.effects.push(confetti);
        }
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
        
        // Verbal praise system
        this.actionCount = 0; // Track total actions for celebrations
        this.harvestCount = 0; // Track harvests for counting
        this.initializeVoice();
        
        // Animal visitors system
        this.animals = [];
        this.animalSpawnTimer = 0;
        
        this.animalTypes = [
            { emoji: '🐰', name: 'bunny', speed: 2.5, sound: 'hop' },
            { emoji: '🐿️', name: 'squirrel', speed: 3.2, sound: 'chatter' },
            { emoji: '🦔', name: 'hedgehog', speed: 1.8, sound: 'snuffle' },
            { emoji: '🐸', name: 'frog', speed: 2.2, sound: 'ribbit' },
            { emoji: '🦆', name: 'duck', speed: 2.0, sound: 'quack' },
            { emoji: '🐱', name: 'cat', speed: 2.8, sound: 'meow' },
            { emoji: '🐕', name: 'lux', speed: 2.6, sound: 'bark', isSpecial: true }
        ];
        
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
                cursor = 'url("data:image/svg+xml;charset=UTF-8,%3csvg width=\'64\' height=\'64\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3ctext x=\'32\' y=\'48\' font-size=\'48\' text-anchor=\'middle\'%3e💧%3c/text%3e%3c/svg%3e") 32 32, auto';
                break;
            case 'vegetable':
                cursor = 'url("data:image/svg+xml;charset=UTF-8,%3csvg width=\'64\' height=\'64\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3ctext x=\'32\' y=\'48\' font-size=\'48\' text-anchor=\'middle\'%3e🥕%3c/text%3e%3c/svg%3e") 32 32, auto';
                break;
            case 'flower':
                cursor = 'url("data:image/svg+xml;charset=UTF-8,%3csvg width=\'64\' height=\'64\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3ctext x=\'32\' y=\'48\' font-size=\'48\' text-anchor=\'middle\'%3e🌸%3c/text%3e%3c/svg%3e") 32 32, auto';
                break;
            case 'mower':
                cursor = 'url("data:image/svg+xml;charset=UTF-8,%3csvg width=\'72\' height=\'72\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3crect x=\'12\' y=\'36\' width=\'36\' height=\'16\' rx=\'3\' fill=\'%232E7D32\'/%3e%3crect x=\'16\' y=\'26\' width=\'28\' height=\'14\' rx=\'3\' fill=\'%23212121\'/%3e%3ccircle cx=\'22\' cy=\'56\' r=\'8\' fill=\'%23212121\'/%3e%3ccircle cx=\'22\' cy=\'56\' r=\'6\' fill=\'%23FFF\'/%3e%3ccircle cx=\'38\' cy=\'56\' r=\'8\' fill=\'%23212121\'/%3e%3ccircle cx=\'38\' cy=\'56\' r=\'6\' fill=\'%23FFF\'/%3e%3cline x1=\'42\' y1=\'30\' x2=\'64\' y2=\'8\' stroke=\'%23212121\' stroke-width=\'4\'/%3e%3c/svg%3e") 36 36, auto';
                break;
            case 'pick-flower':
                cursor = 'url("data:image/svg+xml;charset=UTF-8,%3csvg width=\'64\' height=\'64\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3ctext x=\'32\' y=\'26\' font-size=\'24\' text-anchor=\'middle\'%3e✋%3c/text%3e%3ctext x=\'32\' y=\'50\' font-size=\'24\' text-anchor=\'middle\'%3e🌸%3c/text%3e%3c/svg%3e") 32 32, auto';
                break;
            case 'pick-vegetable':
                cursor = 'url("data:image/svg+xml;charset=UTF-8,%3csvg width=\'64\' height=\'64\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3ctext x=\'32\' y=\'26\' font-size=\'24\' text-anchor=\'middle\'%3e✋%3c/text%3e%3ctext x=\'32\' y=\'50\' font-size=\'24\' text-anchor=\'middle\'%3e🥕%3c/text%3e%3c/svg%3e") 32 32, auto';
                break;
            case 'paint':
                cursor = 'url("data:image/svg+xml;charset=UTF-8,%3csvg width=\'64\' height=\'64\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3ctext x=\'32\' y=\'48\' font-size=\'48\' text-anchor=\'middle\'%3e🎨%3c/text%3e%3c/svg%3e") 32 32, auto';
                break;
            case 'shapes':
                cursor = 'url("data:image/svg+xml;charset=UTF-8,%3csvg width=\'64\' height=\'64\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3ctext x=\'32\' y=\'48\' font-size=\'48\' text-anchor=\'middle\'%3e⭐%3c/text%3e%3c/svg%3e") 32 32, auto';
                break;
            case 'rainbow':
                cursor = 'url("data:image/svg+xml;charset=UTF-8,%3csvg width=\'64\' height=\'64\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3ctext x=\'32\' y=\'48\' font-size=\'48\' text-anchor=\'middle\'%3e🌈%3c/text%3e%3c/svg%3e") 32 32, auto';
                break;
            case 'eraser':
                cursor = 'url("data:image/svg+xml;charset=UTF-8,%3csvg width=\'24\' height=\'24\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3ctext y=\'20\' font-size=\'20\'%3e🧹%3c/text%3e%3c/svg%3e") 12 12, auto';
                break;
            case 'butterfly':
                cursor = 'url("data:image/svg+xml;charset=UTF-8,%3csvg width=\'64\' height=\'64\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3ctext x=\'32\' y=\'48\' font-size=\'48\' text-anchor=\'middle\'%3e🦋%3c/text%3e%3c/svg%3e") 32 32, auto';
                break;
            case 'seasons':
                cursor = 'url("data:image/svg+xml;charset=UTF-8,%3csvg width=\'64\' height=\'64\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3ctext x=\'32\' y=\'48\' font-size=\'48\' text-anchor=\'middle\'%3e🍂%3c/text%3e%3c/svg%3e") 32 32, auto';
                break;
            case 'undo':
                cursor = 'url("data:image/svg+xml;charset=UTF-8,%3csvg width=\'64\' height=\'64\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3ctext x=\'32\' y=\'48\' font-size=\'48\' text-anchor=\'middle\'%3e↶%3c/text%3e%3c/svg%3e") 32 32, auto';
                break;
            case 'reset':
                cursor = 'url("data:image/svg+xml;charset=UTF-8,%3csvg width=\'64\' height=\'64\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3ctext x=\'32\' y=\'48\' font-size=\'48\' text-anchor=\'middle\'%3e☁️%3c/text%3e%3c/svg%3e") 32 32, auto';
                break;
            case 'butterfly-net':
                cursor = 'url("data:image/svg+xml;charset=UTF-8,%3csvg width=\'72\' height=\'72\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3c!-- Handle --%3e%3crect x=\'34\' y=\'40\' width=\'4\' height=\'20\' rx=\'2\' fill=\'%238D6E63\'/%3e%3c!-- Net rim --%3e%3cellipse cx=\'36\' cy=\'30\' rx=\'18\' ry=\'12\' fill=\'none\' stroke=\'%23424242\' stroke-width=\'3\'/%3e%3c!-- Net mesh --%3e%3cg stroke=\'%23666\' stroke-width=\'2\' opacity=\'0.7\'%3e%3c!-- Vertical lines --%3e%3cline x1=\'25\' y1=\'23\' x2=\'25\' y2=\'37\'/%3e%3cline x1=\'30\' y1=\'20\' x2=\'30\' y2=\'40\'/%3e%3cline x1=\'36\' y1=\'18\' x2=\'36\' y2=\'42\'/%3e%3cline x1=\'42\' y1=\'20\' x2=\'42\' y2=\'40\'/%3e%3cline x1=\'47\' y1=\'23\' x2=\'47\' y2=\'37\'/%3e%3c!-- Horizontal lines --%3e%3cline x1=\'20\' y1=\'26\' x2=\'52\' y2=\'26\'/%3e%3cline x1=\'22\' y1=\'30\' x2=\'50\' y2=\'30\'/%3e%3cline x1=\'25\' y1=\'34\' x2=\'47\' y2=\'34\'/%3e%3c/g%3e%3c!-- Star being caught --%3e%3ctext x=\'45\' y=\'22\' font-size=\'12\' text-anchor=\'middle\'%3e⭐%3c/text%3e%3c!-- Butterfly being caught --%3e%3ctext x=\'27\' y=\'28\' font-size=\'12\' text-anchor=\'middle\'%3e🦋%3c/text%3e%3c/svg%3e") 36 36, auto';
                break;
            case 'broom':
                cursor = 'url("data:image/svg+xml;charset=UTF-8,%3csvg width=\'64\' height=\'64\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3ctext x=\'32\' y=\'48\' font-size=\'48\' text-anchor=\'middle\'%3e🧹%3c/text%3e%3c/svg%3e") 32 32, auto';
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
        
        // Give praise and count action for continuous tools at start of interaction
        if (['water', 'mower', 'broom'].includes(this.currentTool)) {
            const praiseCategory = this.currentTool === 'water' ? 'water' : 
                                   this.currentTool === 'mower' ? 'mow' : 'general';
            this.speakPraise(praiseCategory);
            this.incrementActionCount();
        }
        
        // For paint and rainbow tools, always start a new stroke on mouse down
        if (this.currentTool === 'paint') {
            this.createNewPaintStroke(event.x || 0, event.y || 0);
        } else if (this.currentTool === 'rainbow') {
            const colors = ['#FF0000', '#FF8C00', '#FFD700', '#32CD32', '#1E90FF', '#8A2BE2'];
            this.createNewRainbowStroke(event.x || 0, event.y || 0, colors);
        }
        
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
        
        // Check for plant interactions (sounds) regardless of current tool
        this.checkPlantInteraction(x, y);
        
        // Check for animal interactions (sounds) regardless of current tool
        this.checkAnimalInteraction(x, y);
    }
    
    checkPlantInteraction(x, y) {
        // Check if clicking on plants to make them make sounds
        this.plants.forEach(plant => {
            const distance = Math.sqrt((plant.x - x) ** 2 + (plant.y - y) ** 2);
            if (distance < 30) { // Touch radius
                this.playPlantSound(plant);
                
                // Add gentle bounce animation
                plant.bounceTimer = 30; // 30 frames of bouncing
                
                // Add sparkle effect around the plant
                this.effects.push({
                    type: 'sparkle',
                    x: plant.x + (Math.random() - 0.5) * 20,
                    y: plant.y + (Math.random() - 0.5) * 20,
                    timer: 45,
                    scale: 0.6,
                    rotation: Math.random() * 360,
                    rotationSpeed: (Math.random() - 0.5) * 8,
                    vx: (Math.random() - 0.5) * 1,
                    vy: -1,
                    emoji: '✨'
                });
            }
        });
    }
    
    playPlantSound(plant) {
        // Different sounds for different plant types and varieties
        if (plant.type === 'flower') {
            switch (plant.variety) {
                case 'sunflower':
                    this.playSound(523, 0.3, 'sine'); // C5 - bright and sunny
                    break;
                case 'rose':
                    this.playSound(659, 0.3, 'sine'); // E5 - elegant and high
                    break;
                case 'daisy':
                    this.playSound(698, 0.3, 'sine'); // F5 - cheerful and light
                    break;
            }
        } else if (plant.type === 'vegetable') {
            switch (plant.variety) {
                case 'carrot':
                    this.playSound(392, 0.3, 'triangle'); // G4 - earthy, lower pitch
                    break;
                case 'tomato':
                    this.playSound(440, 0.3, 'triangle'); // A4 - medium, rounded
                    break;
                case 'corn':
                    this.playSound(349, 0.3, 'triangle'); // F4 - deep, substantial
                    break;
            }
        }
    }
    
    checkAnimalInteraction(x, y) {
        // Check if clicking on animals to make them make sounds
        this.animals.forEach(animal => {
            const distance = Math.sqrt((animal.x - x) ** 2 + (animal.y - y) ** 2);
            if (distance < 40) { // Touch radius (larger than plants since animals are bigger)
                this.playAnimalSound(animal);
                
                // Add bounce animation to animal
                animal.bounceTimer = 0; // Reset bounce to create excited bouncing
                
                // Add happy sparkle effect around the animal
                for (let i = 0; i < 3; i++) {
                    this.effects.push({
                        type: 'sparkle',
                        x: animal.x + (Math.random() - 0.5) * 30,
                        y: animal.y + (Math.random() - 0.5) * 30,
                        timer: 60,
                        scale: 0.8,
                        rotation: Math.random() * 360,
                        rotationSpeed: (Math.random() - 0.5) * 10,
                        vx: (Math.random() - 0.5) * 2,
                        vy: -2,
                        emoji: '💖'
                    });
                }
            }
        });
    }
    
    playAnimalSound(animal) {
        // Play cute animal sounds with Web Audio API
        switch (animal.name) {
            case 'bunny':
                // High pitched, quick sound
                this.playSound(880, 0.2, 'sine'); // A5
                setTimeout(() => this.playSound(1047, 0.2, 'sine'), 150); // C6
                break;
            case 'squirrel':
                // Chattering sound - quick sequence
                for (let i = 0; i < 3; i++) {
                    setTimeout(() => this.playSound(698 + i * 50, 0.15, 'sawtooth'), i * 100);
                }
                break;
            case 'hedgehog':
                // Soft snuffle sound
                this.playSound(294, 0.25, 'triangle'); // D4
                setTimeout(() => this.playSound(330, 0.25, 'triangle'), 200); // E4
                break;
            case 'frog':
                // Ribbit sound - low then high
                this.playSound(147, 0.3, 'sawtooth'); // D3
                setTimeout(() => this.playSound(294, 0.3, 'sawtooth'), 200); // D4
                break;
            case 'duck':
                // Quack sound - nasal
                this.playSound(220, 0.3, 'sawtooth'); // A3
                setTimeout(() => this.playSound(196, 0.3, 'sawtooth'), 300); // G3
                break;
            case 'cat':
                // Meow sound - rising then falling
                this.playSound(330, 0.25, 'sine'); // E4
                setTimeout(() => this.playSound(440, 0.25, 'sine'), 150); // A4
                setTimeout(() => this.playSound(370, 0.25, 'sine'), 300); // F#4
                break;
            case 'lux':
                // Special bark sound for Lux - deeper, more substantial
                this.playSound(196, 0.4, 'sawtooth'); // G3 - deep bark
                setTimeout(() => this.playSound(220, 0.3, 'sawtooth'), 200); // A3
                setTimeout(() => this.playSound(175, 0.35, 'sawtooth'), 400); // F3 - trailing bark
                
                // Extra praise when clicking Lux!
                const luxClickPhrases = [
                    "Good boy Lux!",
                    "Lux loves you!",
                    "Such a good dog!",
                    "Lux is happy!"
                ];
                const phrase = luxClickPhrases[Math.floor(Math.random() * luxClickPhrases.length)];
                setTimeout(() => {
                    this.speakPraise('general', phrase);
                }, 800);
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
        
        // BOOST nearby plants with water! 💧
        this.plants.forEach(plant => {
            const distance = Math.sqrt((plant.x - x) ** 2 + (plant.y - y) ** 2);
            if (distance < 75) { // Within watering range
                // Boost growth: increase target size up to 350% max
                const maxPossibleSize = plant.baseSize * 3.5; // 350% of base
                const currentMax = plant.targetSize;
                const boost = plant.baseSize * 0.3; // 30% boost each watering
                
                plant.targetSize = Math.min(maxPossibleSize, currentMax + boost);
                
                // Also speed up growth slightly
                plant.growthProgress = Math.min(plant.growthDuration - 1, plant.growthProgress + 30);
                
                console.log(`Watered ${plant.type}! Target size boosted from ${currentMax.toFixed(1)} to ${plant.targetSize.toFixed(1)}`);
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
                baseSize: 15,
                currentSize: 8, // Start small
                targetSize: 15 + Math.random() * 20, // 150-250% of base (15-35px)
                growthDuration: 300 + Math.random() * 180, // 5-8 seconds at 60fps
                growthProgress: 0,
                bounceTimer: 0 // For touch interaction animation
            });
            this.addStarSeeds(2);
            this.playCuteSound('vegetable'); // Vegetable sound
            this.lastActions.push({type: 'plant', item: this.plants[this.plants.length - 1]});
            
            // Give praise and count action
            this.speakPraise('plant');
            this.incrementActionCount();
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
                baseSize: 20,
                currentSize: 10, // Start small
                targetSize: 20 + Math.random() * 30, // 150-250% of base (20-50px)
                growthDuration: 300 + Math.random() * 180, // 5-8 seconds at 60fps
                growthProgress: 0,
                bounceTimer: 0 // For touch interaction animation
            });
            this.addStarSeeds(2);
            this.playCuteSound('flower'); // Flower sound
            this.lastActions.push({type: 'plant', item: this.plants[this.plants.length - 1]});
            
            // Give praise and count action
            this.speakPraise('plant');
            this.incrementActionCount();
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
        if (itemsCut > 0) {
            this.createSparkleEffect(x, y); // Success sparkles only when cutting!
        }
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
                this.createSparkleEffect(x, y); // Success sparkles!
                this.plants.splice(i, 1);
                this.flowerCount++;
                this.harvestCount++;
                this.addStarSeeds(5);
                console.log('Picked flower! Total flowers:', this.flowerCount);
                this.playCuteSound('pickup'); // Cute pickup sound
                
                // Give praise with counting
                this.speakPraise('harvest');
                if (this.harvestCount <= 10) {
                    setTimeout(() => {
                        this.speakPraise('counting', this.praisePhrases.counting[this.harvestCount - 1]);
                    }, 800); // Delay counting to let harvest praise finish
                }
                this.incrementActionCount();
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
                this.createSparkleEffect(x, y); // Success sparkles!
                this.plants.splice(i, 1);
                this.vegetableCount++;
                this.harvestCount++;
                this.addStarSeeds(5);
                console.log('Picked vegetable! Total vegetables:', this.vegetableCount);
                this.playCuteSound('pickup'); // Cute pickup sound
                
                // Give praise with counting
                this.speakPraise('harvest');
                if (this.harvestCount <= 10) {
                    setTimeout(() => {
                        this.speakPraise('counting', this.praisePhrases.counting[this.harvestCount - 1]);
                    }, 800); // Delay counting to let harvest praise finish
                }
                this.incrementActionCount();
                break;
            }
        }
    }
    
    // NEW PAINTING AND CREATIVE TOOLS
    paintArea(x, y) {
        // Only continue existing stroke during active drawing (new strokes created in startInteraction)
        if (this.isDrawing) {
            const stroke = this.paintStrokes[this.paintStrokes.length - 1];
            if (stroke && !stroke.isRainbow && stroke.color === this.currentColor && stroke.size === this.brushSize) {
                // Continue current stroke - add interpolated points for smoothness
                if (stroke.points.length > 0) {
                    const lastPoint = stroke.points[stroke.points.length - 1];
                    const distance = Math.sqrt((x - lastPoint.x) ** 2 + (y - lastPoint.y) ** 2);
                    
                    // If points are far apart, interpolate between them for smoother lines
                    if (distance > 8) { // Reduced threshold for smoother painting
                        const steps = Math.ceil(distance / 4); // Smaller steps for smoother curves
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
            } else if (stroke && (stroke.color !== this.currentColor || stroke.size !== this.brushSize)) {
                // Color or size changed during drawing - create new stroke
                this.createNewPaintStroke(x, y);
            }
        }
        // Only give effects during active drawing
        if (this.isDrawing) {
            this.createSparkleEffect(x, y); // Success sparkles!
            this.playPaintNote(this.currentColor, this.brushSize); // Musical paint sound
        }
    }
    
    createNewPaintStroke(x, y) {
        const newStroke = {
            points: [{x, y}],
            color: this.currentColor,
            size: this.brushSize
        };
        this.paintStrokes.push(newStroke);
        this.lastActions.push({type: 'paint', stroke: newStroke});
        
        // Give praise and count action for each new paint stroke
        this.speakPraise('paint');
        this.incrementActionCount();
    }
    
    broomSweep(x, y) {
        // Broom sweeps away ALL paint strokes in a wide area
        const sweepRadius = 60; // Wide sweep area
        
        // Track original counts for sparkle success detection
        const originalStrokeCount = this.paintStrokes.length;
        const originalShapeCount = this.shapes.length;
        
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
        
        // Only sparkles if we actually swept something
        const sweptSomething = (originalStrokeCount > this.paintStrokes.length) || (originalShapeCount > this.shapes.length);
        if (sweptSomething) {
            this.createSparkleEffect(x, y); // Success sparkles!
        }
        
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
            if (distance < 100) { // Even larger net catch radius for toddlers
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
            if (distance < 100) {
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
            this.createSparkleEffect(x, y); // Success sparkles!
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
        this.createSparkleEffect(x, y); // Success sparkles!
        // Magical sparkle sound for shapes - like fairy dust
        const magicNotes = [659, 784, 880, 988]; // E5, G5, A5, B5 - bright and magical
        const note = magicNotes[Math.floor(Math.random() * magicNotes.length)];
        this.playCuteSound('pickup'); // Cute sparkle sound
    }
    
    paintRainbow(x, y) {
        // Only continue existing rainbow stroke during active drawing (new strokes created in startInteraction)
        if (this.isDrawing) {
            const lastRainbow = this.paintStrokes[this.paintStrokes.length - 1];
            if (lastRainbow && lastRainbow.isRainbow) {
                // Add smooth interpolation for rainbow
                if (lastRainbow.points.length > 0) {
                    const lastPoint = lastRainbow.points[lastRainbow.points.length - 1];
                    const distance = Math.sqrt((x - lastPoint.x) ** 2 + (y - lastPoint.y) ** 2);
                    
                    if (distance > 8) { // Reduced threshold for smoother rainbow painting
                        const steps = Math.ceil(distance / 4); // Smaller steps for smoother curves
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
            }
        }
        // Only give effects during active drawing
        if (this.isDrawing) {
            this.createSparkleEffect(x, y); // Success sparkles!
            this.playCuteSound('rainbow'); // Cute rainbow sound
        }
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
            size: 32 + Math.random() * 16, // 32-48px (was 20px)
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
        
        // Auto-save progress after collecting stars
        if (amount > 0) {
            this.saveProgress();
        }
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
    
    createSparkleEffect(x, y) {
        // Instant gratification sparkles for every tap!
        const sparkleEmojis = ['✨', '⭐', '💫', '🌟', '⚡'];
        const numSparkles = 3 + Math.floor(Math.random() * 3); // 3-5 sparkles
        
        for (let i = 0; i < numSparkles; i++) {
            this.effects.push({
                type: 'sparkle',
                x: x + (Math.random() - 0.5) * 60, // Spread around tap point
                y: y + (Math.random() - 0.5) * 60,
                vx: (Math.random() - 0.5) * 4, // Gentle float
                vy: -1 - Math.random() * 3, // Upward float
                timer: 45 + Math.random() * 15, // 0.75-1 seconds
                emoji: sparkleEmojis[Math.floor(Math.random() * sparkleEmojis.length)],
                scale: 0.8 + Math.random() * 0.4, // 0.8-1.2 scale
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.15
            });
        }
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
        // Update plant growth animations
        this.plants.forEach(plant => {
            // Handle vegetable state changes (much faster now!)
            if (plant.type === 'vegetable' && plant.state === 'seeded') {
                plant.growthTimer++;
                if (plant.growthTimer > 30) { // 0.5 seconds - just long enough to see seeding
                    plant.state = 'ready';
                }
            }
            
            // Animate size growth for all plants
            if (plant.growthProgress < plant.growthDuration) {
                plant.growthProgress++;
                
                // Smooth easing function (starts fast, slows down)
                const progress = plant.growthProgress / plant.growthDuration;
                const easedProgress = 1 - Math.pow(1 - progress, 3); // Ease-out cubic
                
                // Interpolate size from small to target
                plant.currentSize = plant.currentSize * 0.95 + 
                    (plant.baseSize + (plant.targetSize - plant.baseSize) * easedProgress) * 0.05;
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
        
        // Update animal visitors
        this.animalSpawnTimer++;
        
        // Spawn a new animal every 10-15 seconds (600-900 frames at 60fps)
        if (this.animalSpawnTimer > 600 + Math.random() * 300) {
            this.spawnAnimal();
            this.animalSpawnTimer = 0;
        }
        
        // Update existing animals
        this.animals = this.animals.filter(animal => {
            animal.x += animal.vx;
            animal.y += animal.vy;
            
            // Add slight bounce to walking
            animal.bounceTimer += animal.speed * 0.2;
            animal.bounceOffset = Math.sin(animal.bounceTimer) * 2;
            
            // Remove animals that have left the screen
            return animal.x > -50 && animal.x < this.canvas.width + 50 && 
                   animal.y > -50 && animal.y < this.canvas.height + 50;
        });
        
        // Update plants
        this.plants.forEach(plant => {
            // Update bounce animation from touch interactions
            if (plant.bounceTimer > 0) {
                plant.bounceTimer--;
                plant.bounceOffset = Math.sin(plant.bounceTimer * 0.4) * 3;
            } else {
                plant.bounceOffset = 0;
            }
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
            } else if (effect.type === 'sparkle') {
                // Update sparkle animations
                effect.x += effect.vx;
                effect.y += effect.vy;
                effect.vy *= 0.98; // Slow down
                effect.vx *= 0.98;
                effect.rotation += effect.rotationSpeed;
                effect.scale *= 0.992; // Gradual shrinking
            } else if (effect.type === 'confetti') {
                // Update confetti physics
                effect.x += effect.vx;
                effect.y += effect.vy;
                effect.vy += 0.2; // Gravity
                effect.vx *= 0.99; // Air resistance
                effect.rotation += effect.rotationSpeed;
                effect.life--;
                
                return effect.life > 0;
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
        
        // Draw animal visitors
        this.animals.forEach(animal => {
            this.renderAnimal(animal);
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
        this.ctx.save();
        
        // Apply bounce offset from touch interactions
        const bounceY = plant.bounceOffset || 0;
        this.ctx.translate(plant.x, plant.y + bounceY);
        
        // Use animated size for gradual growth
        const size = plant.currentSize || plant.size || plant.baseSize;
        this.ctx.font = `${size + 10}px Arial`;
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
        
        // Add shadow (relative to translate position)
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.fillText(emoji, 2, 2);
        
        // Add main emoji (relative to translate position)
        this.ctx.fillStyle = 'black';
        this.ctx.fillText(emoji, 0, 0);
        
        this.ctx.restore();
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
        } else if (effect.type === 'sparkle') {
            // Render sparkles with rotation and fading
            this.ctx.save();
            this.ctx.translate(effect.x, effect.y);
            this.ctx.rotate(effect.rotation);
            this.ctx.scale(effect.scale, effect.scale);
            this.ctx.font = '20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillStyle = `rgba(255, 215, 0, ${Math.max(0, effect.timer / 60)})`; // Golden sparkle
            this.ctx.fillText(effect.emoji, 0, 0);
            this.ctx.restore();
        } else if (effect.type === 'confetti') {
            // Render celebration confetti
            this.ctx.save();
            this.ctx.translate(effect.x, effect.y);
            this.ctx.rotate(effect.rotation * Math.PI / 180);
            
            const alpha = Math.max(0, effect.life / effect.maxLife);
            this.ctx.fillStyle = effect.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
            
            if (effect.shape === 'circle') {
                this.ctx.beginPath();
                this.ctx.arc(0, 0, effect.size / 2, 0, 2 * Math.PI);
                this.ctx.fill();
            } else {
                // Square confetti
                this.ctx.fillRect(-effect.size / 2, -effect.size / 2, effect.size, effect.size);
            }
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
        
        // Use butterfly's individual size (much bigger for toddlers)
        this.ctx.font = `${butterfly.size}px Arial`;
        this.ctx.textAlign = 'center';
        
        // Add subtle shadow for better visibility
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillText(butterfly.emoji, 2, 2);
        
        // Main butterfly
        this.ctx.fillStyle = 'black';
        this.ctx.fillText(butterfly.emoji, 0, 0);
        
        this.ctx.restore();
    }
    
    renderAnimal(animal) {
        this.ctx.save();
        this.ctx.translate(animal.x, animal.y + animal.bounceOffset);
        
        // Flip animal sprite based on movement direction
        if (animal.vx < 0) {
            this.ctx.scale(-1, 1);
        }
        
        // Use animal's size
        this.ctx.font = `${animal.size}px Arial`;
        this.ctx.textAlign = 'center';
        
        // Add shadow for better visibility
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.fillText(animal.emoji, 1, 1);
        
        // Main animal
        this.ctx.fillStyle = 'black';
        this.ctx.fillText(animal.emoji, 0, 0);
        
        this.ctx.restore();
    }
    
    // Save/Load System
    saveProgress() {
        const saveData = {
            plants: this.plants,
            starSeeds: this.starSeeds,
            flowerCount: this.flowerCount,
            vegetableCount: this.vegetableCount,
            grassCount: this.grassCount,
            actionCount: this.actionCount,
            paintStrokes: this.paintStrokes,
            shapes: this.shapes,
            timestamp: Date.now()
        };
        
        try {
            localStorage.setItem('mirasYardSave', JSON.stringify(saveData));
            console.log('Progress saved successfully');
        } catch (e) {
            console.warn('Failed to save progress:', e);
        }
    }
    
    loadProgress() {
        try {
            const saved = localStorage.getItem('mirasYardSave');
            if (saved) {
                const data = JSON.parse(saved);
                
                // Restore game state
                this.plants = data.plants || [];
                this.starSeeds = data.starSeeds || 0;
                this.flowerCount = data.flowerCount || 0;
                this.vegetableCount = data.vegetableCount || 0;
                this.grassCount = data.grassCount || 0;
                this.actionCount = data.actionCount || 0;
                this.paintStrokes = data.paintStrokes || [];
                this.shapes = data.shapes || [];
                
                console.log('Progress loaded successfully');
                this.speakPraise('celebration', 'Welcome back to your garden!');
            }
        } catch (e) {
            console.log('No saved progress found or corrupted save file');
        }
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
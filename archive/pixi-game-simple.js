// Simplified Pixi.js test to debug rendering issue

console.log('Starting Pixi game initialization...');

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, checking for PIXI...');
    
    // Check if PIXI is available
    if (typeof PIXI === 'undefined') {
        console.error('PIXI is not defined!');
        return;
    }
    
    console.log('PIXI version:', PIXI.VERSION);
    
    try {
        // Get the canvas element
        const canvas = document.getElementById('garden-canvas');
        if (!canvas) {
            console.error('Canvas element not found!');
            return;
        }
        
        console.log('Canvas found:', canvas);
        
        // Hide splash screen first
        const splash = document.getElementById('splash-screen');
        if (splash) {
            splash.style.display = 'none';
        }
        
        // Get actual canvas dimensions
        const rect = canvas.getBoundingClientRect();
        console.log('Canvas dimensions:', rect.width, 'x', rect.height);
        
        // Create a simple PIXI application
        const app = new PIXI.Application({
            view: canvas,
            width: rect.width || 800,
            height: rect.height || 600,
            backgroundColor: 0x7CB342,
            resolution: 1,
            autoDensity: false
        });
        
        // Force canvas style
        canvas.style.background = 'none';
        
        console.log('PIXI app created:', app);
        
        // Create a simple test sprite to verify rendering
        const graphics = new PIXI.Graphics();
        graphics.beginFill(0xFF0000);
        graphics.drawCircle(400, 300, 50);
        graphics.endFill();
        
        app.stage.addChild(graphics);
        
        console.log('Test circle added to stage');
        
        // Add some text
        const text = new PIXI.Text('Pixi.js is working!', {
            fontFamily: 'Arial',
            fontSize: 36,
            fill: 0xFFFFFF
        });
        text.x = 250;
        text.y = 100;
        
        app.stage.addChild(text);
        
        console.log('Test text added to stage');
        
        // Log stage children
        console.log('Stage children:', app.stage.children);
        
    } catch (error) {
        console.error('Error initializing PIXI:', error);
    }
});
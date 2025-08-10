// Minimal Pixi.js Debug Test
console.log('=== PIXI DEBUG TEST STARTING ===');

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded');
    
    // Step 1: Check if PIXI is available
    console.log('PIXI available:', typeof PIXI !== 'undefined');
    if (typeof PIXI === 'undefined') {
        console.error('PIXI not loaded!');
        return;
    }
    
    console.log('PIXI version:', PIXI.VERSION);
    
    // Step 2: Get canvas element
    const canvas = document.getElementById('garden-canvas');
    console.log('Canvas element:', canvas);
    console.log('Canvas dimensions:', canvas?.offsetWidth, 'x', canvas?.offsetHeight);
    
    if (!canvas) {
        console.error('Canvas not found!');
        return;
    }
    
    // Step 3: Hide splash screen immediately
    const splash = document.getElementById('splash-screen');
    if (splash) {
        splash.style.display = 'none';
        console.log('Splash hidden');
    }
    
    // Step 4: Try creating PIXI app with explicit dimensions
    try {
        console.log('Creating PIXI application...');
        
        const app = new PIXI.Application({
            width: 800,
            height: 600,
            backgroundColor: 0x7CB342
        });
        
        console.log('PIXI app created:', app);
        console.log('PIXI canvas:', app.view);
        
        // Step 5: Replace the existing canvas
        console.log('Replacing canvas...');
        canvas.parentNode.replaceChild(app.view, canvas);
        app.view.id = 'garden-canvas';
        
        console.log('Canvas replaced successfully');
        
        // Step 6: Add a simple test sprite
        const graphics = new PIXI.Graphics();
        graphics.beginFill(0xFF0000);
        graphics.drawCircle(400, 300, 50);
        graphics.endFill();
        
        app.stage.addChild(graphics);
        console.log('Red circle added to stage');
        
        // Step 7: Add text
        const text = new PIXI.Text('PIXI WORKING!', {
            fontFamily: 'Arial',
            fontSize: 36,
            fill: 0xFFFFFF
        });
        text.x = 250;
        text.y = 200;
        
        app.stage.addChild(text);
        console.log('Text added to stage');
        
        // Step 8: Test animation
        let rotation = 0;
        app.ticker.add(() => {
            graphics.rotation = rotation;
            rotation += 0.01;
        });
        
        console.log('Animation started');
        console.log('=== PIXI DEBUG TEST COMPLETE ===');
        
    } catch (error) {
        console.error('PIXI Error:', error);
        console.error('Error stack:', error.stack);
    }
});
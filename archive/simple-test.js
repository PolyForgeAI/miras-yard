// Ultra-simple test: Splash -> Hello World
console.log('=== SIMPLE TEST STARTING ===');

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded');
    
    const splash = document.getElementById('splash-screen');
    const gameContainer = document.querySelector('.game-container');
    
    console.log('Splash element:', splash);
    console.log('Game container:', gameContainer);
    
    if (!splash || !gameContainer) {
        console.error('Missing elements!');
        return;
    }
    
    const hideSplash = () => {
        console.log('Hiding splash screen...');
        
        splash.style.opacity = '0';
        
        setTimeout(() => {
            splash.style.display = 'none';
            console.log('Splash hidden');
            
            // Show Hello World
            const canvas = document.getElementById('garden-canvas');
            if (canvas) {
                console.log('Found canvas, replacing with Hello World');
                
                const helloDiv = document.createElement('div');
                helloDiv.innerHTML = `
                    <div style="
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(45deg, #7CB342, #8BC34A);
                        border: 4px solid #8B4513;
                        border-radius: 15px;
                        font-family: Comic Sans MS, cursive;
                        font-size: 48px;
                        color: white;
                        text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
                    ">
                        🌻 Hello World! 🌻
                        <br><br>
                        <div style="font-size: 24px;">
                            Tap screen test successful!
                        </div>
                    </div>
                `;
                
                canvas.parentNode.replaceChild(helloDiv, canvas);
                console.log('Hello World displayed');
            } else {
                console.error('Canvas not found!');
            }
        }, 500);
    };
    
    // Auto-hide splash after 3 seconds
    setTimeout(() => {
        console.log('Auto-hiding splash...');
        hideSplash();
    }, 3000);
    
    // Manual hide on click/touch
    splash.addEventListener('click', () => {
        console.log('Splash clicked');
        hideSplash();
    });
    
    splash.addEventListener('touchstart', (e) => {
        console.log('Splash touched');
        e.preventDefault();
        hideSplash();
    }, { passive: false });
    
    console.log('Event listeners set up');
});

console.log('=== SIMPLE TEST SCRIPT LOADED ===');
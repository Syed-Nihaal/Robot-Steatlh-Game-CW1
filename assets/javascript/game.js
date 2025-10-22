// Creating Game class
class Game {
    // Creating constructor function
    constructor() {
        // Creating game canvas
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Adding UI elements
        this.scoreDisplay = document.getElementById('scoreDisplay'); // Display score
        this.coinDisplay = document.getElementById('coinDisplay'); // Display coins
        this.timerDisplay = document.getElementById('timerDisplay'); // Display timer
        
        // Adding game state
        this.gameState = 'playing'; // Current game state ('playing', 'paused', 'gameOver', 'won')
        this.score = 0; // Player score
        this.coinsCollected = 0; // Number of coins collected
        this.totalCoins = 5; // Total number of coins
        this.gameTime = 0; // Game time
        this.lastTime = Date.now(); // Last time game was updated
        
        // Game objects
        this.player = new Player(100, 400, this); // Pass game reference
        this.robot = new Robot(this.canvas.width / 2, 525, this); // Pass game reference
        this.platforms = this.generatePlatforms(); // Generate platforms
        this.coins = this.generateCoins(); // Generate coins
        
        // Input handling
        this.keys = {}; // Keyboard input
        this.setupEventListeners(); // Set up event listeners
        
        // Start game loop
        this.gameLoop();
    }
    
    // Creating platform generation function
    generatePlatforms(num = 6) {
        // Creating an array to store platforms
        const platforms = [];
        // Creating a base ground platform
        platforms.push(new Platform(0, 550, 800, 50));
        // Creating random mid-level platforms logic
        for (let i = 0; i < num; i++) {
            const width = 100 + Math.random() * 80; // Random width
            const height = 20; // Constant height
            const x = Math.random() * (this.canvas.width - width); // Random x position
            const y = 150 + Math.random() * 350; // Random y position
            platforms.push(new Platform(x, y, width, height)); // Create platform
        }
        return platforms;
    }
    
    // Creating coin generation function
    generateCoins(numCoins = 5) {
        // Creating an array to store coins
        const newCoins = [];
        // Creating random coins logic
        for (let i = 0; i < numCoins; i++) {
            const p = this.platforms[Math.floor(Math.random() * (this.platforms.length - 1)) + 1]; // Random platform
            const x = p.x + Math.random() * (p.width - 20) + 10; // Random x position
            const y = p.y - 15; // Random y position
            newCoins.push(new Coin(x, y, 12)); // Create coin
        }
        return newCoins;
    }
    
    // Creating event listeners for instantaneous keyboard input for function
    setupEventListeners() {
        window.addEventListener('keydown', e => {
            this.keys[e.key] = true;
            // Adding jump keyboard input
            if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
                e.preventDefault();
                this.player.jump(); // Calling jump function
            }
            // Adding pause keyboard input           
            if (e.key === 'p' || e.key === 'P') {
                // Toggling game state between 'playing' and 'paused'
                if (this.gameState === 'playing') {
                    this.gameState = 'paused'; // Set game state to 'paused'
                } else if (this.gameState === 'paused') {
                    this.gameState = 'playing'; // Set game state to 'playing'
                    this.lastTime = Date.now(); // Reset last time
                }
            }
            // Adding restart keyboard input
            if ((e.key === 'r' || e.key === 'R') && (this.gameState === 'gameOver' || this.gameState === 'won')) {
                this.restartGame(); // Calling restart game function
            }
        });
        window.addEventListener('keyup', e => {
            this.keys[e.key] = false;
        });
    }
    
    // Creating input handling for continuous keyboard input function
    handleInput() {
        // Reset horizontal movement when no key is pressed
        this.player.velocityX = 0;
        
        // Adding horizontal movement
        if (this.keys['a'] || this.keys['A'] || this.keys['ArrowLeft']) {
            this.player.velocityX = -this.player.speed; // Move left
        }
        if (this.keys['d'] || this.keys['D'] || this.keys['ArrowRight']) {
            this.player.velocityX = this.player.speed; // Move right
        }
    }
    
    // Creating platform collision function
    checkPlatformCollisions() {
        // Adding platform collision logic
        this.platforms.forEach(p => {
            if (this.player.velocityY > 0) {
                if (this.player.x < p.x + p.width && // Left edge of player is less than right edge of platform
                    this.player.x + this.player.width > p.x && // Right edge of player is greater than left edge of platform
                    this.player.y + this.player.height > p.y && // Top edge of player is greater than bottom edge of platform
                    this.player.y + this.player.height < p.y + p.height) {
                    this.player.y = p.y - this.player.height; // Set player y position to platform y position
                    this.player.velocityY = 0; // Stop vertical movement
                    this.player.isOnGround = true; // Player is on ground
                }
            }
        });
    }
    
    // Creating coin collection function
    checkCoinCollection() {
        const px = this.player.x + this.player.width / 2; // Player x position
        const py = this.player.y + this.player.height / 2; // Player y position
        
        // Adding coin collection logic
        this.coins.forEach(coin => {
            if (!coin.collected) {
                const dx = px - coin.x; // Distance between player and coin
                const dy = py - coin.y; // Distance between player and coin
                const dist = Math.sqrt(dx * dx + dy * dy); // Distance between player and coin
                
                if (dist < this.player.width / 2 + coin.radius) {
                    coin.collected = true; // Coin is collected
                    this.coinsCollected++; // Increment coins collected
                    this.score += 100; // Increment score by 100
                    
                    if (this.coinsCollected >= this.totalCoins) {
                        this.gameState = 'won'; // Set game state to 'won'
                    }
                }
            }
        });
    }
    
    // Creating game update function
    update() {
        // Check if game is not in playing state, if so return early
        if (this.gameState !== 'playing') return;
        
        this.handleInput(); // Handle keyboard input
        this.player.update(); // Update player
        this.robot.update(this.player); // Update robot
        this.checkPlatformCollisions(); // Check platform collisions
        this.checkCoinCollection(); // Check coin collection
        
        const now = Date.now(); // Get current time
        const dt = (now - this.lastTime) / 1000; // Calculate delta time
        this.gameTime += dt; // Update game time
        this.lastTime = now; // Update last time
        
        // Update UI
        this.scoreDisplay.textContent = this.score; // Update score
        this.coinDisplay.textContent = `${this.coinsCollected}/${this.totalCoins}`; // Update coins
        this.timerDisplay.textContent = Math.floor(this.gameTime); // Update timer
    }
    
    // Creating game rendering function
    render() {
        // Clear canvas and draw background
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // Clear canvas
        this.ctx.fillStyle = 'rgba(30, 35, 45, 1)'; // Set background color
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height); // Draw background
        
        this.platforms.forEach(p => p.draw(this.ctx)); // Draw platforms
        this.coins.forEach(c => c.draw(this.ctx)); // Draw coins
        this.robot.draw(this.ctx); // Draw robot
        this.player.draw(this.ctx); // Draw player

        // Draw overlay screens based on game state
        if (this.gameState === 'paused') {
            this.drawPauseScreen(); // Draw pause screen
        } else if (this.gameState === 'gameOver') {
            this.drawGameOverScreen(); // Draw game over screen
        } else if (this.gameState === 'won') {
            this.drawWinScreen(); // Draw win screen
        }
    }
    
    // Creating pause screen rendering function 
    drawPauseScreen() {
        this.ctx.fillStyle = 'rgba(0,0,0,0.7)'; // Set background color
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height); // Draw background
        this.ctx.fillStyle = 'rgba(255, 255, 255, 1)'; // Set text color
        this.ctx.font = '48px Arial'; // Set font
        this.ctx.textAlign = 'center'; // Set text alignment
        this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2); // Draw text
        this.ctx.font = '24px Arial'; // Set font
        this.ctx.fillText('Press P to Resume', this.canvas.width / 2, this.canvas.height / 2 + 50); // Draw text
    }
    
    // Creating game over screen rendering function
    drawGameOverScreen() {
        this.ctx.fillStyle = 'rgba(0,0,0,0.8)'; 
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = 'rgba(255,100,100,1)';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 50);
        this.ctx.fillText('Press R to Restart', this.canvas.width / 2, this.canvas.height / 2 + 90);
    }
    
    // Creating win screen rendering function
    drawWinScreen() {
        this.ctx.fillStyle = 'rgba(0,0,0,0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = 'rgba(100,255,100,1)';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('YOU WIN!', this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 50);
        this.ctx.fillText(`Time: ${Math.floor(this.gameTime)}s`, this.canvas.width / 2, this.canvas.height / 2 + 85);
        this.ctx.fillText('Press R to Restart', this.canvas.width / 2, this.canvas.height / 2 + 120);
    }
    
    // Creating game restart function
    restartGame() {
        this.player.x = 100;
        this.player.y = 400;
        this.player.velocityX = 0;
        this.player.velocityY = 0;
        this.player.isDetected = false;
        
        this.gameState = 'playing';
        this.score = 0;
        this.coinsCollected = 0;
        this.gameTime = 0;
        this.lastTime = Date.now();
        
        this.platforms = this.generatePlatforms();
        this.coins = this.generateCoins();
        
        this.robot.detectionAngle = -Math.PI / 2;
        this.robot.direction = 1;
    }
    
    // Creating game loop function
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Player class
class Player {
    constructor(x, y, game) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 40;
        this.velocityX = 0;
        this.velocityY = 0;
        this.speed = 5;
        this.jumpPower = -12;
        this.gravity = 0.5;
        this.isOnGround = false;
        this.isDetected = false;
        this.jumpCount = 0;
        this.game = game;
    }

    update() {
        this.velocityY += this.gravity;
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.velocityX *= 0.85;

        // Keep player inside bounds
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > this.game.canvas.width)
            this.x = this.game.canvas.width - this.width;

        // If player falls below canvas, trigger game over
        if (this.y > this.game.canvas.height)
            this.game.gameState = 'gameOver';

        // 🟢 If player touches the ground, reset jump count
        if (this.isOnGround) {
            this.jumpCount = 0;
        }

        this.isOnGround = false;
    }

    draw(ctx) {
        ctx.fillStyle = this.isDetected
            ? 'rgba(255, 100, 100, 0.9)'
            : 'rgba(100, 200, 255, 0.9)';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }

    jump() {
        // 🟢 Allow jump only if jumpCount < 2
        if (this.jumpCount < 2) {
            this.velocityY = this.jumpPower;
            this.isOnGround = false;
            this.jumpCount++;
        }
    }
}

// Robot class
class Robot {
    constructor(x, y, game) {
        this.x = x;
        this.y = y;
        this.radius = 25;
        this.detectionAngle = 1.5 * Math.PI;  // 270° start (downward)
        this.detectionSpeed = 0.01;
        this.detectionRange = 200;
        this.detectionWidth = Math.PI / 1.5;  // 120° beam width
        this.direction = 1;
        this.game = game;
    }

    update(player) {
        // Reverse beam direction with angle clamping to avoid overflow
        if (this.detectionAngle >= 2 * Math.PI) {
            this.detectionAngle = 2 * Math.PI; // clamp at upper limit
            this.direction = -1;
        }
        if (this.detectionAngle <= Math.PI) {
            this.detectionAngle = Math.PI; // clamp at lower limit
            this.direction = 1;
        }

        this.detectionAngle += this.detectionSpeed * this.direction;
        this.checkDetection(player);
    }

    checkDetection(player) {
    const px = player.x + player.width / 2;
    const py = player.y + player.height / 2;
    const dx = px - this.x;
    const dy = py - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Get the angle to the player and normalise it to 0–2π
    let angleToPlayer = Math.atan2(dy, dx);
    if (angleToPlayer < 0) angleToPlayer += 2 * Math.PI;

    // Normalise the robot’s own detection angle too
    let detectionAngle = this.detectionAngle % (2 * Math.PI);
    if (detectionAngle < 0) detectionAngle += 2 * Math.PI;

    // Calculate smallest angular difference
    let angleDiff = Math.abs(angleToPlayer - detectionAngle);
    if (angleDiff > Math.PI) angleDiff = (2 * Math.PI) - angleDiff;

    // Check detection range and angle
    if (distance < this.detectionRange && angleDiff < this.detectionWidth / 2) {
        player.isDetected = true;
        this.game.gameState = 'gameOver';
    } else {
        player.isDetected = false;
    }
}

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Draw scanning beam
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(
            0, 0, this.detectionRange,
            this.detectionAngle - this.detectionWidth / 2,
            this.detectionAngle + this.detectionWidth / 2
        );
        ctx.closePath();

        const player = this.game.player;
        ctx.fillStyle = player.isDetected ? 'rgba(255, 0, 0, 0.2)' : 'rgba(255, 255, 0, 0.1)';
        ctx.fill();
        ctx.strokeStyle = player.isDetected ? 'rgba(255, 0, 0, 0.5)' : 'rgba(255, 255, 0, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        // Draw robot body
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(200, 50, 50, 0.9)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw the robot eye following the beam
        const eyeX = this.x + Math.cos(this.detectionAngle) * 15;
        const eyeY = this.y + Math.sin(this.detectionAngle) * 15;
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, 5, 0, Math.PI * 2);
        ctx.fillStyle = player.isDetected ? 'rgba(255, 255, 0, 1)' : 'rgba(100, 100, 100, 0.8)';
        ctx.fill();
    }
}


class Platform {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    
    draw(ctx) {
        ctx.fillStyle = 'rgba(100, 100, 100, 0.8)';
        ctx.strokeStyle = 'rgba(200, 200, 200, 0.6)';
        ctx.lineWidth = 2;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
}

class Coin {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.collected = false;
    }
    
    draw(ctx) {
        if (!this.collected) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
            gradient.addColorStop(0, 'rgba(255, 215, 0, 1)');
            gradient.addColorStop(1, 'rgba(255, 215, 0, 0.3)');
            ctx.fillStyle = gradient;
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }
}

// Start the game once the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
});

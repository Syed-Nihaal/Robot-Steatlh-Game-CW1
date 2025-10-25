// Creating Game class
class Game {
    // Creating Game constructor function
    constructor() {
        // Creating game canvas
        this.canvas = document.getElementById('gameCanvas');
        this.context = this.canvas.getContext('2d');
        
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
        this.scoreSaved = false; // Flag to track if score has been saved to leaderboard
        
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
        // Adding event listener for keydown
        window.addEventListener('keydown', e => {
            this.keys[e.key] = true; // Adding key
            // Adding jump keyboard input
            if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
                e.preventDefault(); // Preventing default behavior
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
        
        // Adding event listener for keyup
        window.addEventListener('keyup', e => {
            this.keys[e.key] = false; // Removing key
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
            // If player is falling
            if (this.player.velocityY > 0) {
                // If player is colliding with platform
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
            // If coin is not collected
            if (!coin.collected) {
                const dx = px - coin.x; // Distance between player and coin
                const dy = py - coin.y; // Distance between player and coin
                const dist = Math.sqrt(dx * dx + dy * dy); // Distance between player and coin
                // If player is within the radius of the coin
                if (dist < this.player.width / 2 + coin.radius) {
                    coin.collected = true; // Coin is collected
                    this.coinsCollected++; // Increment coins collected
                    this.score += 100; // Increment score by 100
                    // If all coins have been collected
                    if (this.coinsCollected >= this.totalCoins) {
                        this.gameState = 'won'; // Set game state to 'won'
                        this.saveScoreToLeaderboard(); // Save score when game is won
                    }
                }
            }
        });
    }
    
    // Creating score saving function
    saveScoreToLeaderboard() {
        // Checking if score has already been saved
        if (this.scoreSaved) return;
        // Getting the logged-in username and leaderboard from localStorage
        const username = localStorage.getItem('loggedInUser');
        // Parsing the leaderboard from localStorage
        let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
        // Creating a new score entry
        const scoreEntry = {
            username: username, // Current username
            score: this.score, // Current score
            date: new Date().toISOString() // Current date
        };
        // Adding the new score to leaderboard
        leaderboard.push(scoreEntry);
        // Saving updated leaderboard back to localStorage
        localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
        // Marking score as saved
        this.scoreSaved = true;
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
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height); // Clear canvas
        this.context.fillStyle = 'rgba(30, 35, 45, 1)'; // Set background color
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height); // Draw background
        
        this.platforms.forEach(p => p.draw(this.context)); // Draw platforms
        this.coins.forEach(c => c.draw(this.context)); // Draw coins
        this.robot.draw(this.context); // Draw robot
        this.player.draw(this.context); // Draw player

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
        this.context.fillStyle = 'rgba(0,0,0,0.7)'; // Set background color
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height); // Draw background
        this.context.fillStyle = 'rgba(255, 255, 255, 1)'; // Set text color
        this.context.font = '48px Arial'; // Set font
        this.context.textAlign = 'center'; // Set text alignment
        this.context.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2); // Draw text
        this.context.font = '24px Arial'; // Set font
        this.context.fillText('Press P to Resume', this.canvas.width / 2, this.canvas.height / 2 + 50); // Draw text
    }
    
    // Creating game over screen rendering function
    drawGameOverScreen() {
        this.context.fillStyle = 'rgba(0,0,0,0.8)'; // Set background color
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height); // Draw background
        this.context.fillStyle = 'rgba(255,100,100,1)'; // Set text color
        this.context.font = '48px Arial'; // Set font
        this.context.textAlign = 'center'; // Set text alignment
        this.context.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2); // Draw text
        this.context.fillStyle = '#fff'; // Set text color
        this.context.font = '24px Arial'; // Set font
        this.context.fillText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 50); // Draw score
        this.context.fillText('Press R to Restart', this.canvas.width / 2, this.canvas.height / 2 + 90); // Draw text
    }
    
    // Creating win screen rendering function
    drawWinScreen() {
        this.context.fillStyle = 'rgba(0,0,0,0.8)'; // Set background color
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height); // Draw background
        this.context.fillStyle = 'rgba(100,255,100,1)'; // Set text color
        this.context.font = '48px Arial'; // Set font
        this.context.textAlign = 'center'; // Set text alignment
        this.context.fillText('YOU WIN!', this.canvas.width / 2, this.canvas.height / 2); // Draw text
        this.context.fillStyle = '#fff'; // Set text color
        this.context.font = '24px Arial'; // Set font
        this.context.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 50); // Draw score
        this.context.fillText(`Time: ${Math.floor(this.gameTime)}s`, this.canvas.width / 2, this.canvas.height / 2 + 85); // Draw time
        this.context.fillText('Press R to Restart', this.canvas.width / 2, this.canvas.height / 2 + 120); // Draw text
    }
    
    // Creating game restart function
    restartGame() {
        this.player.x = 100; // Reset player x position
        this.player.y = 400; // Reset player y position
        this.player.velocityX = 0; // Reset player horizontal velocity
        this.player.velocityY = 0; // Reset player vertical velocity
        this.player.isDetected = false; // Reset player detection to false
        this.gameState = 'playing'; // Set game state to playing
        this.score = 0; // Reset score
        this.coinsCollected = 0; // Reset coins collected
        this.gameTime = 0; // Reset game time
        this.lastTime = Date.now(); // Reset last time
        this.scoreSaved = false; // Reset score saved to false
        this.platforms = this.generatePlatforms(); // Generate platforms
        this.coins = this.generateCoins(); // Generate coins
        this.robot.detectionAngle = -Math.PI / 2; // Reset robot detection angle
        this.robot.direction = 1; // Reset robot direction
    }
    
    // Creating game loop function
    gameLoop() {
        this.update(); // Update game
        this.render(); // Render game
        requestAnimationFrame(() => this.gameLoop()); // Request next frame
    }
}

// Player class
class Player {
    constructor(x, y, game) {
        this.x = x; // Player x position
        this.y = y; // Player y position
        this.width = 30; // Player width
        this.height = 40; // Player height
        this.velocityX = 0; // Player horizontal velocity
        this.velocityY = 0; // Player vertical velocity
        this.speed = 5; // Player speed
        this.jumpPower = -12; // Player jump power
        this.gravity = 0.5; // Player gravity
        this.isOnGround = false; // Player is on ground
        this.isDetected = false; // Player is not detected
        this.jumpCount = 0; // Player jump count
        this.game = game; // Game instance
    }

    // Player update function
    update() {
        this.velocityY += this.gravity; // Apply gravity logic
        this.x += this.velocityX; // Apply horizontal movement logic
        this.y += this.velocityY; // Apply vertical movement logic
        this.velocityX *= 0.85; // Apply friction logic
        // Keep player inside bounds
        if (this.x < 0) this.x = 0; // If left edge of player is greater than left edge of canvas
        if (this.x + this.width > this.game.canvas.width)
            this.x = this.game.canvas.width - this.width;
        // If player falls below canvas, trigger game over
        if (this.y > this.game.canvas.height)
            this.game.gameState = 'gameOver'; // Set game state to game over
        // If player touches the ground, reset jump count
        if (this.isOnGround) {
            this.jumpCount = 0; // Reset jump count
        }
        // Player is not on ground
        this.isOnGround = false;
    }

    draw(context) {
        // Draw player
        context.fillStyle = this.isDetected
            ? 'rgba(255, 100, 100, 0.9)' // Player is detected
            : 'rgba(100, 200, 255, 0.9)'; // Player is not detected
        context.fillRect(this.x, this.y, this.width, this.height); // Draw player
        context.strokeStyle = 'rgba(255, 255, 255, 0.8)'; // Set stroke color
        context.lineWidth = 2; // Set stroke width
        context.strokeRect(this.x, this.y, this.width, this.height); // Draw player outline
    }

    jump() {
        // Allow jump only if jumpCount < 2
        if (this.jumpCount < 2) {
            this.velocityY = this.jumpPower; // Apply jump power
            this.isOnGround = false; // Player is not on ground
            this.jumpCount++; // Increment jump count
        }
    }
}

// Robot class
class Robot {
    // Creating Robot constructor function
    constructor(x, y, game) {
        this.x = x; // Robot x position
        this.y = y; // Robot y position
        this.radius = 25; // Robot radius
        this.detectionAngle = 1.5 * Math.PI;  // Set initial detection angle as 270°
        this.detectionSpeed = 0.01; // Set detection speed
        this.detectionRange = 200; // Set detection range
        this.detectionWidth = Math.PI / 1.5;  // Set detection beam width as 120°
        this.direction = 1; // Set initial direction
        this.game = game; // Game instance
    }

    update(player) {
        // Reverse beam direction with angle clamping to avoid overflow
        if (this.detectionAngle >= 2 * Math.PI) {
            this.detectionAngle = 2 * Math.PI; // Set high clamp at 270°
            this.direction = -1; // Reverse detection beam direction
        }
        if (this.detectionAngle <= Math.PI) {
            this.detectionAngle = Math.PI; // Set low clamp at 180°
            this.direction = 1; // Reverse detection beam direction
        }
        // Update detection angle
        this.detectionAngle += this.detectionSpeed * this.direction;
        this.checkDetection(player); // Check player detection
    }

    checkDetection(player) {
        const px = player.x + player.width / 2; // Player x position
        const py = player.y + player.height / 2; // Player y position
        const dx = px - this.x; // Distance between player and robot
        const dy = py - this.y; // Distance between player and robot
        const distance = Math.sqrt(dx * dx + dy * dy); // Distance between player and robot
        // Get the angle to the player and normalise it to 0–2π
        let angleToPlayer = Math.atan2(dy, dx);
        // If angle is negative, add 2π
        if (angleToPlayer < 0) angleToPlayer += 2 * Math.PI;
        // Normalise the robot's own detection angle
        let detectionAngle = this.detectionAngle % (2 * Math.PI);
        // If angle is negative, add 2π
        if (detectionAngle < 0) detectionAngle += 2 * Math.PI;
        // Calculate smallest angular difference
        let angleDiff = Math.abs(angleToPlayer - detectionAngle);
        // If angle difference is greater than 180°, subtract 2π
        if (angleDiff > Math.PI) angleDiff = (2 * Math.PI) - angleDiff;

        // Check detection range and angle
        if (distance < this.detectionRange && angleDiff < this.detectionWidth / 2) {
            player.isDetected = true; // Player is detected
            this.game.gameState = 'gameOver'; // Set game state to "gameOver"
        } else {
            player.isDetected = false; // Player is not detected
        }
    }

    draw(context) {
        context.save(); // Save canvas state
        context.translate(this.x, this.y); // Translate canvas to robot position
        context.beginPath(); // Draw scanning beam
        context.moveTo(0, 0); // Move to robot center
        context.arc(
            0, 0, this.detectionRange, // Draw beam arc
            this.detectionAngle - this.detectionWidth / 2, // Start angle
            this.detectionAngle + this.detectionWidth / 2 // End angle
        );
        context.closePath(); // Close path
        // Get player instance
        const player = this.game.player;
        context.fillStyle = player.isDetected ? 'rgba(255, 0, 0, 0.2)' : 'rgba(255, 255, 0, 0.1)'; // Set beam color
        context.fill(); // Fill beam
        context.strokeStyle = player.isDetected ? 'rgba(255, 0, 0, 0.5)' : 'rgba(255, 255, 0, 0.3)'; // Set stroke color
        context.lineWidth = 2; // Set stroke width
        context.stroke(); // Stroke beam
        context.restore(); // Restore canvas state
        // Draw robot body
        context.beginPath(); // Start path
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2); // Draw circle
        context.fillStyle = 'rgba(200, 50, 50, 0.9)'; // Set fill color
        context.fill(); // Fill circle
        context.strokeStyle = 'rgba(255, 255, 255, 0.8)'; // Set stroke color
        context.lineWidth = 3; // Set stroke width
        context.stroke(); // Stroke circle
        // Draw the robot eye following the beam
        const eyeX = this.x + Math.cos(this.detectionAngle) * 15; // Calculate eye x position
        const eyeY = this.y + Math.sin(this.detectionAngle) * 15; // Calculate eye y position
        context.beginPath(); // Start path
        context.arc(eyeX, eyeY, 5, 0, Math.PI * 2); // Draw eye
        context.fillStyle = player.isDetected ? 'rgba(255, 255, 0, 1)' : 'rgba(100, 100, 100, 0.8)'; // Set fill color
        context.fill(); // Fill eye
    }
}

// Creating Platform class
class Platform {
    // Creating Platform Constructor function
    constructor(x, y, width, height) {
        this.x = x; // Platform x position
        this.y = y; // Platform y position
        this.width = width; // Platform width
        this.height = height; // Platform height
    }
    
    draw(context) {
        context.fillStyle = 'rgba(100, 100, 100, 0.8)'; // Set fill color
        context.strokeStyle = 'rgba(200, 200, 200, 0.6)'; // Set stroke color
        context.lineWidth = 2; // Set stroke width
        context.fillRect(this.x, this.y, this.width, this.height); // Draw platform
        context.strokeRect(this.x, this.y, this.width, this.height); // Stroke platform
    }
}

// Creating Coin class
class Coin {
    // Creating Coin Constructor function
    constructor(x, y, radius) {
        this.x = x; // Coin x position
        this.y = y; // Coin y position
        this.radius = radius; // Coin radius
        this.collected = false; // Coin is not collected
    }
    
    draw(context) {
        // If coin is not collected
        if (!this.collected) {
            context.beginPath(); // Start path
            context.arc(this.x, this.y, this.radius, 0, Math.PI * 2); // Draw coin
            const gradient = context.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius); // Create gradient
            gradient.addColorStop(0, 'rgba(255, 215, 0, 1)'); // Add color stops
            gradient.addColorStop(1, 'rgba(255, 215, 0, 0.3)'); // Add color stops
            context.fillStyle = gradient; // Set fill color
            context.fill(); // Fill coin
            context.strokeStyle = 'rgba(255, 255, 255, 0.8)'; // Set stroke color
            context.lineWidth = 2; // Set stroke width
            context.stroke(); // Stroke coin
        }
    }
}

// Start the game once the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game(); // Create game instance
});
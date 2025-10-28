// Import all game entity modules
import { Player } from './player.js';
import { Robot } from './robot.js';
import { Platform } from './platform.js';
import { Coin } from './coin.js';

// Creating Game class
class Game {
    // Creating Game constructor function
    constructor() {
        // Creating game canvas
        this.canvas = document.getElementById('gameCanvas');
        this.context = this.canvas.getContext('2d');
        
        // Adding UI elements
        this.scoreDisplay = document.getElementById('scoreDisplay'); // Display score
        this.coinDisplay = document.getElementById('coinDisplay'); // Display coins remaining
        this.timerDisplay = document.getElementById('timerDisplay'); // Display timer
        
        // Adding game state
        this.gameState = 'playing'; // Current game state ('playing', 'paused', 'gameOver', 'won')
        this.score = 0; // Player score
        this.coinsCollected = 0; // Number of coins collected
        this.totalCoins = 5; // Total number of coins at a time
        this.gameTime = 0; // Game time
        this.lastTime = Date.now(); // Last time game was updated
        this.scoreSaved = false; // Flag to track if score has been saved to leaderboard
        
        // Game objects
        this.player = new Player(100, 400, this); // Pass game reference
        this.robot = new Robot(this.canvas.width / 2, 525, this); // Pass game reference
        this.platforms = this.generatePlatforms(); // Generate platforms
        this.coins = this.generateCoins(); // Generate coins
        
        // Game level system
        this.currentLevel = 1;
        this.level2Threshold = 60;
        this.level2Activated = false;

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
            const width = 100 + Math.random() * 80; // Random width between 100-180
            const height = 20; // Constant height
            const x = Math.random() * (this.canvas.width - width); // Random x position
            const y = 150 + Math.random() * 350; // Random y position between 150-500
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
            const p = this.platforms[Math.floor(Math.random() * (this.platforms.length - 1)) + 1]; // Random platform (excluding ground)
            const x = p.x + Math.random() * (p.width - 20) + 10; // Random x position on platform
            const y = p.y - 15; // Position above platform
            newCoins.push(new Coin(x, y, 12)); // Create coin with radius 12
        }
        return newCoins;
    }
    
    // Creating function to generate new coins after collection
    generateNewCoins() {
        // Count how many coins are currently uncollected
        const uncollectedCoins = this.coins.filter(coin => !coin.collected).length;
        
        // Only generate new coins if all coins have been collected
        if (uncollectedCoins === 0) {
            const newCoins = this.generateCoins(this.totalCoins); // Generate 5 new coins
            this.coins.push(...newCoins); // Add new coins to existing coins array
        }
    }
    
    // Creating event listeners for instantaneous keyboard input function
    setupEventListeners() {
        // Adding event listener for keydown
        window.addEventListener('keydown', e => {
            this.keys[e.key] = true; // Mark key as pressed
            // Adding jump keyboard input
            if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
                e.preventDefault(); // Preventing default behavior (page scroll)
                this.player.jump(); // Calling jump function
            }
            // Adding drop down keyboard input
            if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
                e.preventDefault(); // Preventing default behavior (page scroll)
                this.player.dropDown(); // Calling drop down function
            }
            // Adding pause keyboard input           
            if (e.key === 'p' || e.key === 'P') {
                // Toggling game state between 'playing' and 'paused'
                if (this.gameState === 'playing') {
                    this.gameState = 'paused'; // Set game state to 'paused'
                } else if (this.gameState === 'paused') {
                    this.gameState = 'playing'; // Set game state to 'playing'
                    this.lastTime = Date.now(); // Reset last time to prevent time jump
                }
            }
            // Adding restart keyboard input
            if ((e.key === 'r' || e.key === 'R') && (this.gameState === 'gameOver' || this.gameState === 'won')) {
                this.restartGame(); // Calling restart game function
            }
        });
        
        // Adding event listener for keyup
        window.addEventListener('keyup', e => {
            this.keys[e.key] = false; // Mark key as released
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
            // If player is falling and not actively dropping through platforms
            if (this.player.velocityY > 0 && !this.player.isDropping) {
                // If player is colliding with platform
                if (this.player.x < p.x + p.width && // Left edge of player is less than right edge of platform
                    this.player.x + this.player.width > p.x && // Right edge of player is greater than left edge of platform
                    this.player.y + this.player.height > p.y && // Bottom edge of player is greater than top edge of platform
                    this.player.y + this.player.height < p.y + p.height) { // Bottom edge of player is less than bottom edge of platform
                    this.player.y = p.y - this.player.height; // Set player y position to top of platform
                    this.player.velocityY = 0; // Stop vertical movement
                    this.player.isOnGround = true; // Player is on ground
                }
            }
        });
    }
    
    // Creating coin collection function
    checkCoinCollection() {
        const px = this.player.x + this.player.width / 2; // Player centre x position
        const py = this.player.y + this.player.height / 2; // Player centre y position
        // Adding coin collection logic
        this.coins.forEach(coin => {
            // If coin is not collected
            if (!coin.collected) {
                const dx = px - coin.x; // Horizontal distance between player and coin
                const dy = py - coin.y; // Vertical distance between player and coin
                const dist = Math.sqrt(dx * dx + dy * dy); // Calculate Euclidean distance
                // If player is within the radius of the coin (collision detection)
                if (dist < this.player.width / 2 + coin.radius) {
                    coin.collected = true; // Mark coin as collected
                    this.coinsCollected++; // Increment coins collected counter
                    this.score += 100; // Increment score by 100 points
                    
                    // Save score every 10 coins collected
                    if (this.coinsCollected % 10 === 0) {
                        this.saveScoreToLeaderboard(); // Save score to leaderboard
                    }
                    
                    // Check if all 5 coins have been collected, then generate new set
                    this.generateNewCoins();
                }
            }
        });
    }
    
    // Creating score saving function
    saveScoreToLeaderboard() {
        // Getting the logged-in username from localStorage
        const username = localStorage.getItem('loggedInUser');
        // Parsing the leaderboard from localStorage (or initialise empty array)
        let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
        
        // Creating a new score entry object with time taken
        const scoreEntry = {
            username: username, // Current username
            score: this.score, // Current score
            time: Math.floor(this.gameTime), // Time taken in seconds
            date: new Date().toISOString() // Current date in ISO format
        };
        
        // Check if user already exists in leaderboard
        const existingUserIndex = leaderboard.findIndex(entry => entry.username === username);
        
        if (existingUserIndex !== -1) {
            // User exists - check if new score is better
            const existingEntry = leaderboard[existingUserIndex];
            
            // Replace if new score is higher OR if score is same but time is less
            if (scoreEntry.score > existingEntry.score || 
                (scoreEntry.score === existingEntry.score && scoreEntry.time < existingEntry.time)) {
                leaderboard[existingUserIndex] = scoreEntry; // Replace old record
            }
            // If new score is not better, don't update
        } else {
            // User doesn't exist - add new entry
            leaderboard.push(scoreEntry);
        }
        
        // Saving updated leaderboard back to localStorage
        localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    }
    
    // Creating game update function
    update() {
        // Check if game is not in playing state, if so return early
        if (this.gameState !== 'playing') return;
        
        this.handleInput(); // Handle keyboard input
        this.player.update(); // Update player position and state
        this.robot.update(this.player, this.gameTime); // Update robot and check detection (pass game time)
        this.checkPlatformCollisions(); // Check platform collisions
        this.checkCoinCollection(); // Check coin collection
        
        const now = Date.now(); // Get current time in milliseconds
        const dt = (now - this.lastTime) / 1000; // Calculate delta time in seconds
        this.gameTime += dt; // Update game time
        this.lastTime = now; // Update last time
        
        // Update UI elements
        this.scoreDisplay.textContent = this.score; // Update score display
        // Count uncollected coins for display (remaining coins to collect)
        const uncollectedCoins = this.coins.filter(coin => !coin.collected).length;
        this.coinDisplay.textContent = `${uncollectedCoins}/5`; // Update coins display (remaining/5)
        this.timerDisplay.textContent = Math.floor(this.gameTime); // Update timer display (in seconds)
    }
    
    // Creating game rendering function
    render() {
        // Clear canvas and draw background
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height); // Clear entire canvas
        this.context.fillStyle = 'rgba(30, 35, 45, 1)'; // Set background colour (dark blue-grey)
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height); // Draw background rectangle
        
        // Draw all game entities
        this.platforms.forEach(p => p.draw(this.context)); // Draw all platforms
        this.coins.forEach(c => c.draw(this.context)); // Draw all coins
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
        this.context.fillStyle = 'rgba(0,0,0,0.7)'; // Set semi-transparent black background
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height); // Draw overlay
        this.context.fillStyle = 'rgba(255, 255, 255, 1)'; // Set text colour (white)
        this.context.font = '48px Arial'; // Set font size and family
        this.context.textAlign = 'center'; // Centre align text
        this.context.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2); // Draw pause text
        this.context.font = '24px Arial'; // Set smaller font for instruction
        this.context.fillText('Press P to Resume', this.canvas.width / 2, this.canvas.height / 2 + 50); // Draw instruction
    }
    
    // Creating game over screen rendering function
    drawGameOverScreen() {
        // Save score when game over screen is shown (only once per game over)
        if (!this.scoreSaved) {
            this.saveScoreToLeaderboard(); // Save score to leaderboard
            this.scoreSaved = true; // Mark as saved to prevent duplicate saves
        }
        
        this.context.fillStyle = 'rgba(0,0,0,0.8)'; // Set semi-transparent black background
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height); // Draw overlay
        this.context.fillStyle = 'rgba(255,100,100,1)'; // Set text colour (red)
        this.context.font = '48px Arial'; // Set font size and family
        this.context.textAlign = 'center'; // Centre align text
        this.context.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2); // Draw game over text
        this.context.fillStyle = '#fff'; // Set text colour (white)
        this.context.font = '24px Arial'; // Set smaller font
        this.context.fillText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 50); // Draw final score
        this.context.fillText(`Time: ${Math.floor(this.gameTime)}s`, this.canvas.width / 2, this.canvas.height / 2 + 85); // Draw time taken
        this.context.fillText('Press R to Restart', this.canvas.width / 2, this.canvas.height / 2 + 120); // Draw restart instruction
    }
    
    // Creating win screen rendering function
    drawWinScreen() {
        this.context.fillStyle = 'rgba(0,0,0,0.8)'; // Set semi-transparent black background
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height); // Draw overlay
        this.context.fillStyle = 'rgba(100,255,100,1)'; // Set text colour (green)
        this.context.font = '48px Arial'; // Set font size and family
        this.context.textAlign = 'center'; // Centre align text
        this.context.fillText('YOU WIN!', this.canvas.width / 2, this.canvas.height / 2); // Draw win text
        this.context.fillStyle = '#fff'; // Set text colour (white)
        this.context.font = '24px Arial'; // Set smaller font
        this.context.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 50); // Draw final score
        this.context.fillText(`Time: ${Math.floor(this.gameTime)}s`, this.canvas.width / 2, this.canvas.height / 2 + 85); // Draw completion time
        this.context.fillText('Press R to Restart', this.canvas.width / 2, this.canvas.height / 2 + 120); // Draw restart instruction
    }
    
    // Creating game restart function
    restartGame() {
        this.player.x = 100; // Reset player x position to starting point
        this.player.y = 400; // Reset player y position to starting point
        this.player.velocityX = 0; // Reset player horizontal velocity
        this.player.velocityY = 0; // Reset player vertical velocity
        this.player.isDetected = false; // Reset player detection to false
        this.player.isDropping = false; // Reset player dropping flag to false
        this.gameState = 'playing'; // Set game state to playing
        this.score = 0; // Reset score to zero
        this.coinsCollected = 0; // Reset coins collected to zero
        this.gameTime = 0; // Reset game time to zero
        this.lastTime = Date.now(); // Reset last time to current time
        this.scoreSaved = false; // Reset score saved flag to false
        this.platforms = this.generatePlatforms(); // Generate new platforms
        this.coins = this.generateCoins(); // Generate new coins
        this.robot.detectionAngle = -Math.PI / 2; // Reset robot detection angle
        this.robot.direction = 1; // Reset robot direction to clockwise
        this.robot.detectionSpeed = this.robot.baseDetectionSpeed; // Reset robot detection speed to base speed
    }
    
    // Creating game loop function
    gameLoop() {
        this.update(); // Update game logic
        this.render(); // Render game graphics
        requestAnimationFrame(() => this.gameLoop()); // Request next frame (creates continuous loop)
    }
}

// Start the game once the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game(); // Create game instance
});
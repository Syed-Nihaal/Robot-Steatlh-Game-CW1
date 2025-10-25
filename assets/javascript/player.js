// Player class module
export class Player {
    // Creating Player constructor function
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
        this.isDropping = false; // Player is dropping through platform
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

    // Player draw function
    draw(context) {
        // Draw player with different colours based on detection status
        context.fillStyle = this.isDetected
            ? 'rgba(255, 100, 100, 0.9)' // Player is detected (red)
            : 'rgba(100, 200, 255, 0.9)'; // Player is not detected (blue)
        context.fillRect(this.x, this.y, this.width, this.height); // Draw player rectangle
        context.strokeStyle = 'rgba(255, 255, 255, 0.8)'; // Set stroke colour
        context.lineWidth = 2; // Set stroke width
        context.strokeRect(this.x, this.y, this.width, this.height); // Draw player outline
    }

    // Player jump function
    jump() {
        // Allow jump only if jumpCount < 2 (enables double jump)
        if (this.jumpCount < 2) {
            this.velocityY = this.jumpPower; // Apply jump power
            this.isOnGround = false; // Player is not on ground
            this.jumpCount++; // Increment jump count
        }
    }

    // Player drop down function (allows passing through platforms)
    dropDown() {
        // Only allow drop down if player is on ground (standing on a platform)
        if (this.isOnGround) {
            this.y += 5; // Move player down slightly to pass through platform
            this.isOnGround = false; // Player is no longer on ground
            this.isDropping = true; // Set dropping flag to prevent immediate collision
            
            // Reset dropping flag after a short delay
            setTimeout(() => {
                this.isDropping = false; // Allow collision detection again
            }, 200); // 200ms delay to pass through platform
        }
    }
}
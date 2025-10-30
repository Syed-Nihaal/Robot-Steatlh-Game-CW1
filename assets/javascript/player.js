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

        

        // Animation states and frame data
        this.animations = {
            idle: this.mapSprite(['../img/drone_idle_anim/drone_idle1.png'
                                ,'../img/drone_idle_anim/drone_idle2.png'
                                ,'../img/drone_idle_anim/drone_idle3.png'
                                ,'../img/drone_idle_anim/drone_idle4.png']), // Idle animation
            walkR: this.mapSprite(['../img/drone_walkR_anim/drone_walkR1.png',
                                '../img/drone_walkR_anim/drone_walkR2.png',
                                '../img/drone_walkR_anim/drone_walkR3.png',
                                '../img/drone_walkR_anim/drone_walkR4.png']), // Walk right animation
            walkL: this.mapSprite(['../img/drone_walkL_anim/drone_walkRL1.png',
                                '../img/drone_walkL_anim/drone_walkL2.png',
                                '../img/drone_walkL_anim/drone_walkL3.png',
                                '../img/drone_walkL_anim/drone_walkL4.png'])   // Walk left animation
        };
        
        // Current animation state
        this.currentAnimation = 'idle'; // Default animation state
        this.currentFrame = 0; // Current frame index
        this.frameCounter = 0; // Counter for frame updates
        this.animationSpeed = 100; // Animation speed
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
        
        // Update animation state based on player movement
        this.updateAnimation();
    }

    mapSprite(imgsArray) {
    return imgsArray.map(src => {
        const img = new Image();
        img.src = src;
        return img;
    }
    );
    }
    
    // Update animation state based on player movement
    updateAnimation() {
        // Determine which animation to play
        if (Math.abs(this.velocityX) !== 0) {
            this.currentAnimation = (this.velocityX > 0 ) ? 'walkR' : 'walkL'; // Determine which direction to play
        } else {
            this.currentAnimation = 'idle'; // Play idle animation when stationary
        }
        
        // Update frame counter and advance frames
        const anim = this.animations[this.currentAnimation];
        this.frameCounter++;
        
        if (this.frameCounter >= this.animationSpeed) {
            this.frameCounter = 0;
            this.currentFrame = (this.currentFrame + 1) % anim.frames; // Loop through frames
        }
    }

    // Player draw function
    draw(context) {
        // If sprite is loaded, draw sprite animation
        if (this.spriteLoaded) {
            const anim = this.animations[this.currentAnimation];
            
            // Calculate source coordinates on sprite sheet
            const srcX = this.currentFrame * this.frameWidth;
            const srcY = anim.row * this.frameHeight;
            
            // Save context state for transformations
            context.save();
            
            // Apply red tint if player is detected
            if (this.isDetected) {
                context.globalAlpha = 0.7; // Make slightly transparent
                context.fillStyle = 'rgba(255, 100, 100, 0.3)';
                context.fillRect(this.x, this.y, this.width, this.height);
                context.globalAlpha = 1.0; // Reset alpha
            }
            
            // Flip sprite horizontally if facing left
            if (!this.facingRight) {
                context.translate(this.x + this.width, this.y);
                context.scale(-1, 1);
                context.drawImage(
                    this.spriteSheet,
                    srcX, srcY, this.frameWidth, this.frameHeight, // Source rectangle
                    0, 0, this.width, this.height // Destination rectangle
                );
            } else {
                context.drawImage(
                    this.spriteSheet,
                    srcX, srcY, this.frameWidth, this.frameHeight, // Source rectangle
                    this.x, this.y, this.width, this.height // Destination rectangle
                );
            }
            
            // Restore context state
            context.restore();
        } else {
            // Fallback: Draw player with different colours based on detection status (original code)
            context.fillStyle = this.isDetected
                ? 'rgba(255, 100, 100, 0.9)' // Player is detected (red)
                : 'rgba(100, 200, 255, 0.9)'; // Player is not detected (blue)
            context.fillRect(this.x, this.y, this.width, this.height); // Draw player rectangle
            context.strokeStyle = 'rgba(255, 255, 255, 0.8)'; // Set stroke colour
            context.lineWidth = 2; // Set stroke width
            context.strokeRect(this.x, this.y, this.width, this.height); // Draw player outline
        }
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
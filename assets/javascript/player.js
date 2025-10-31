// Player class module
export class Player {
    // Creating Player constructor function
    constructor(x, y, game) {
        this.x = x; // Player x position
        this.y = y; // Player y position
        this.width = 50; // Player width (increased from 30)
        this.height = 60; // Player height (increased from 40)
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
        this.facingRight = true; // Track which direction player is facing

        // Animation states with sprite image paths
        this.animations = {
            idle: {
                frames: this.loadSprites([
                    '../img/drone_idle_anim/drone_idle1.png',
                    '../img/drone_idle_anim/drone_idle2.png',
                    '../img/drone_idle_anim/drone_idle3.png',
                    '../img/drone_idle_anim/drone_idle4.png'
                ]),
                loaded: false
            },
            walkR: {
                frames: this.loadSprites([
                    '../img/drone_walkR_anim/drone_walkR1.png',
                    '../img/drone_walkR_anim/drone_walkR2.png',
                    '../img/drone_walkR_anim/drone_walkR3.png',
                    '../img/drone_walkR_anim/drone_walkR4.png'
                ]),
                loaded: false
            },
            walkL: {
                frames: this.loadSprites([
                    '../img/drone_walkL_anim/drone_walkL1.png',
                    '../img/drone_walkL_anim/drone_walkL2.png',
                    '../img/drone_walkL_anim/drone_walkL3.png',
                    '../img/drone_walkL_anim/drone_walkL4.png'
                ]),
                loaded: false
            }
        };
        
        // Current animation state
        this.currentAnimation = 'idle'; // Default animation state
        this.currentFrame = 0; // Current frame index
        this.frameCounter = 0; // Counter for frame updates
        this.frameDelay = 8; // Number of game loops before advancing frame (controls animation speed)
        this.spritesLoaded = false; // Track if all sprites are loaded
        
        // Check when sprites are loaded
        this.checkSpritesLoaded();
    }

    // Load sprite images from file paths with error handling
    loadSprites(imagePaths) {
        return imagePaths.map((src, index) => {
            const img = new Image();
            
            // Add error handler to prevent crashes
            img.onerror = () => {
                console.warn(`Failed to load sprite: ${src}`);
            };
            
            // Add load handler to track loading status
            img.onload = () => {
                // Image loaded successfully
            };
            
            img.src = src;
            return img;
        });
    }

    // Check if all sprites have finished loading
    checkSpritesLoaded() {
        let allLoaded = true;
        
        // Check all animation frames
        for (const animName in this.animations) {
            const anim = this.animations[animName];
            const frames = anim.frames;
            let animLoaded = true;
            
            for (const img of frames) {
                // Check if image is loaded or failed to load
                if (!img.complete) {
                    animLoaded = false;
                    allLoaded = false;
                    break;
                }
            }
            
            // Mark this animation as loaded
            anim.loaded = animLoaded;
        }
        
        this.spritesLoaded = allLoaded;
        
        // If not all loaded, check again in 100ms
        if (!allLoaded) {
            setTimeout(() => this.checkSpritesLoaded(), 100);
        }
    }

    // Player update function
    update() {
        this.velocityY += this.gravity; // Apply gravity logic
        this.x += this.velocityX; // Apply horizontal movement logic
        this.y += this.velocityY; // Apply vertical movement logic
        this.velocityX *= 0.85; // Apply friction logic
        
        // Update facing direction based on velocity
        if (this.velocityX > 0) {
            this.facingRight = true;
        } else if (this.velocityX < 0) {
            this.facingRight = false;
        }
        
        // Keep player inside bounds
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > this.game.canvas.width)
            this.x = this.game.canvas.width - this.width;
        
        // If player falls below canvas, trigger game over
        if (this.y > this.game.canvas.height)
            this.game.gameState = 'gameOver';
        
        // If player touches the ground, reset jump count
        if (this.isOnGround) {
            this.jumpCount = 0;
        }
        
        // Player is not on ground by default (will be set to true by collision detection)
        this.isOnGround = false;
        
        // Update animation state based on player movement
        this.updateAnimation();
    }
    
    // Update animation state based on player movement
    updateAnimation() {
        // Determine which animation to play based on movement
        if (Math.abs(this.velocityX) > 0.1) {
            // Player is moving - use walk animation
            // Use walkR for right movement, walkL for left movement
            this.currentAnimation = this.facingRight ? 'walkR' : 'walkL';
        } else {
            // Player is stationary - use idle animation
            this.currentAnimation = 'idle';
        }
        
        // Get current animation data
        const anim = this.animations[this.currentAnimation];
        
        // Safety check: ensure animation exists and has frames
        if (!anim || !anim.frames || anim.frames.length === 0) {
            console.warn(`Animation ${this.currentAnimation} not found or has no frames`);
            this.currentAnimation = 'idle'; // Fallback to idle
            return;
        }
        
        // Update frame counter
        this.frameCounter++;
        
        // Advance to next frame when counter reaches delay threshold
        if (this.frameCounter >= this.frameDelay) {
            this.frameCounter = 0; // Reset counter
            this.currentFrame = (this.currentFrame + 1) % anim.frames.length; // Loop through frames
        }
    }

    // Player draw function
    draw(context) {
        // Get current animation data
        const anim = this.animations[this.currentAnimation];
        
        // Check if sprites are loaded and animation is valid
        if (anim && anim.loaded && anim.frames && anim.frames.length > 0) {
            // Ensure current frame is within bounds
            if (this.currentFrame >= anim.frames.length) {
                this.currentFrame = 0;
            }
            
            const currentImg = anim.frames[this.currentFrame];
            
            // Only draw if the current frame image is loaded and valid
            if (currentImg && currentImg.complete && currentImg.naturalWidth > 0) {
                // Save context state for transformations
                context.save();
                
                // Apply red overlay if player is detected
                if (this.isDetected) {
                    context.globalAlpha = 0.7; // Make slightly transparent
                    context.fillStyle = 'rgba(255, 100, 100, 0.3)';
                    context.fillRect(this.x, this.y, this.width, this.height);
                    context.globalAlpha = 1.0; // Reset alpha
                }
                
                // Draw the sprite image
                try {
                    context.drawImage(
                        currentImg,
                        this.x, this.y, // Destination position
                        this.width, this.height // Destination size
                    );
                } catch (error) {
                    // If drawing fails, fall back to rectangle
                    console.warn('Error drawing sprite:', error);
                    this.drawFallbackRectangle(context);
                }
                
                // Restore context state
                context.restore();
                return; // Exit early since we drew the sprite
            }
        }
        
        // Fallback: Draw simple coloured rectangle if sprites aren't loaded
        this.drawFallbackRectangle(context);
    }

    // Draw fallback rectangle when sprites fail to load
    drawFallbackRectangle(context) {
        context.fillStyle = this.isDetected
            ? 'rgba(255, 100, 100, 0.9)' // Player is detected (red)
            : 'rgba(100, 200, 255, 0.9)'; // Player is not detected (blue)
        context.fillRect(this.x, this.y, this.width, this.height); // Draw player rectangle
        context.strokeStyle = 'rgba(255, 255, 255, 0.8)'; // Set stroke colour
        context.lineWidth = 2; // Set stroke width
        context.strokeRect(this.x, this.y, this.width, this.height); // Draw player outline
    }

    // Creating Player jump function
    jump() {
        // Allow jump only if jumpCount < 2 (enables double jump)
        if (this.jumpCount < 2) {
            this.velocityY = this.jumpPower; // Apply jump power
            this.isOnGround = false; // Player is not on ground
            this.jumpCount++; // Increment jump count
        }
    }

    // Creating Player drop down function 
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
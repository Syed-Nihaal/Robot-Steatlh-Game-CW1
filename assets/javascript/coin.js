// Creating Coin class module
export class Coin {
    // Creating Coin constructor function
    constructor(x, y, radius) {
        this.x = x; // Coin x position
        this.y = y; // Coin y position
        this.radius = radius; // Coin radius
        this.collected = false; // Coin collection status (initially not collected)
    }
    
    // Coin draw function
    draw(context) {
        // Only draw coin if it has not been collected
        if (!this.collected) {
            context.beginPath(); // Start path for coin circle
            context.arc(this.x, this.y, this.radius, 0, Math.PI * 2); // Draw coin as circle
            // Create radial gradient for coin effect
            const gradient = context.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
            gradient.addColorStop(0, 'rgba(255, 215, 0, 1)'); // Inner colour (bright gold)
            gradient.addColorStop(1, 'rgba(255, 215, 0, 0.3)'); // Outer colour (faded gold)
            context.fillStyle = gradient; // Apply gradient as fill style
            context.fill(); // Fill coin with gradient
            context.strokeStyle = 'rgba(255, 255, 255, 0.8)'; // Set stroke colour (white)
            context.lineWidth = 2; // Set stroke width
            context.stroke(); // Stroke coin outline
        }
    }
}
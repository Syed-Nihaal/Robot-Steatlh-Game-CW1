// Creating Platform class module
export class Platform {
    // Creating Platform constructor function
    constructor(x, y, width, height) {
        this.x = x; // Platform x position
        this.y = y; // Platform y position
        this.width = width; // Platform width
        this.height = height; // Platform height
    }
    
    // Platform draw function
    draw(context) {
        context.fillStyle = 'rgba(100, 100, 100, 0.8)'; // Set platform fill colour (grey)
        context.strokeStyle = 'rgba(200, 200, 200, 0.6)'; // Set platform stroke colour (light grey)
        context.lineWidth = 2; // Set stroke width
        context.fillRect(this.x, this.y, this.width, this.height); // Draw filled platform rectangle
        context.strokeRect(this.x, this.y, this.width, this.height); // Draw platform outline
    }
}
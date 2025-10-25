// Creating Robot class module
export class Robot {
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

    // Robot update function
    update(player) {
        // Reverse beam direction with angle clamping to avoid overflow
        if (this.detectionAngle >= 2 * Math.PI) {
            this.detectionAngle = 2 * Math.PI; // Set high clamp at 360°
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

    // Robot detection check function
    checkDetection(player) {
        const px = player.x + player.width / 2; // Player centre x position
        const py = player.y + player.height / 2; // Player centre y position
        const dx = px - this.x; // Distance between player and robot on x-axis
        const dy = py - this.y; // Distance between player and robot on y-axis
        const distance = Math.sqrt(dx * dx + dy * dy); // Calculate Euclidean distance between player and robot
        // Get the angle to the player and normalise it to 0–2π
        let angleToPlayer = Math.atan2(dy, dx);
        // If angle is negative, add 2π to normalise
        if (angleToPlayer < 0) angleToPlayer += 2 * Math.PI;
        // Normalise the robot's own detection angle
        let detectionAngle = this.detectionAngle % (2 * Math.PI);
        // If angle is negative, add 2π to normalise
        if (detectionAngle < 0) detectionAngle += 2 * Math.PI;
        // Calculate smallest angular difference
        let angleDiff = Math.abs(angleToPlayer - detectionAngle);
        // If angle difference is greater than 180°, subtract from 360° to get smaller angle
        if (angleDiff > Math.PI) angleDiff = (2 * Math.PI) - angleDiff;

        // Check if player is within detection range and angle
        if (distance < this.detectionRange && angleDiff < this.detectionWidth / 2) {
            player.isDetected = true; // Player is detected
            this.game.gameState = 'gameOver'; // Set game state to "gameOver"
        } else {
            player.isDetected = false; // Player is not detected
        }
    }

    // Robot draw function
    draw(context) {
        context.save(); // Save current canvas state
        context.translate(this.x, this.y); // Translate canvas origin to robot position
        context.beginPath(); // Begin drawing scanning beam path
        context.moveTo(0, 0); // Move to robot centre
        context.arc(
            0, 0, this.detectionRange, // Draw beam arc from centre
            this.detectionAngle - this.detectionWidth / 2, // Start angle of beam
            this.detectionAngle + this.detectionWidth / 2 // End angle of beam
        );
        context.closePath(); // Close beam path
        // Get player instance to check detection status
        const player = this.game.player;
        // Set beam colour based on detection status
        context.fillStyle = player.isDetected ? 'rgba(255, 0, 0, 0.2)' : 'rgba(255, 255, 0, 0.1)'; // Red if detected, yellow otherwise
        context.fill(); // Fill beam with colour
        context.strokeStyle = player.isDetected ? 'rgba(255, 0, 0, 0.5)' : 'rgba(255, 255, 0, 0.3)'; // Set stroke colour
        context.lineWidth = 2; // Set stroke width
        context.stroke(); // Stroke beam outline
        context.restore(); // Restore canvas state to before translation
        // Draw robot body as a circle
        context.beginPath(); // Start path for robot body
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2); // Draw circle for robot body
        context.fillStyle = 'rgba(200, 50, 50, 0.9)'; // Set robot body fill colour (red)
        context.fill(); // Fill robot body
        context.strokeStyle = 'rgba(255, 255, 255, 0.8)'; // Set stroke colour (white)
        context.lineWidth = 3; // Set stroke width
        context.stroke(); // Stroke robot body outline
        // Draw the robot eye following the beam direction
        const eyeX = this.x + Math.cos(this.detectionAngle) * 15; // Calculate eye x position based on beam angle
        const eyeY = this.y + Math.sin(this.detectionAngle) * 15; // Calculate eye y position based on beam angle
        context.beginPath(); // Start path for eye
        context.arc(eyeX, eyeY, 5, 0, Math.PI * 2); // Draw eye as small circle
        context.fillStyle = player.isDetected ? 'rgba(255, 255, 0, 1)' : 'rgba(100, 100, 100, 0.8)'; // Yellow if detected, grey otherwise
        context.fill(); // Fill eye
    }
}
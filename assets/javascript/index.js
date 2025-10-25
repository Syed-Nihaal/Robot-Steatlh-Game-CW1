// Index Page Manager class to handle homepage functionality
class IndexPageManager {
    // Constructor to initialise the index page manager
    constructor() {
        this.topPlayersContent = document.getElementById('topPlayersContent'); // Get top players container element
        this.leaderboardKey = 'leaderboard'; // LocalStorage key for leaderboard data
        this.topCount = 3; // Number of top players to display
        this.medalEmojis = {
            1: '🥇', // Gold medal for 1st place
            2: '🥈', // Silver medal for 2nd place
            3: '🥉'  // Bronze medal for 3rd place
        };
        
        this.init(); // Initialise the index page manager
    }

    // Initialise index page
    init() {
        this.loadTopPlayers(); // Load and display top 3 players
    }

    // Get leaderboard data from localStorage
    getLeaderboardData() {
        return JSON.parse(localStorage.getItem(this.leaderboardKey)) || []; // Return leaderboard array or empty array
    }

    // Sort scores in descending order (highest score first)
    sortScores(scores) {
        return scores.sort((a, b) => b.score - a.score); // Sort by score in descending order
    }

    // Get top N players from leaderboard
    getTopPlayers(count = 3) {
        let scores = this.getLeaderboardData(); // Get all leaderboard data
        scores = this.sortScores(scores); // Sort scores by highest first
        return scores.slice(0, count); // Return only top N players
    }

    // Format date to DD/MM/YYYY format
    formatDate(dateString) {
        const date = new Date(dateString); // Convert ISO string to Date object
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',   // Two-digit day
            month: '2-digit', // Two-digit month
            year: 'numeric'   // Four-digit year
        });
    }

    // Create player card element
    createPlayerCard(player, rank) {
        // Create player card container
        const card = document.createElement('div');
        card.className = `player-card rank-${rank}`; // Add rank-specific class for styling
        
        // Create rank badge
        const rankBadge = document.createElement('div');
        rankBadge.className = 'rank-badge';
        rankBadge.textContent = this.medalEmojis[rank] || `#${rank}`; // Show medal emoji or rank number
        
        // Create player info container
        const playerInfo = document.createElement('div');
        playerInfo.className = 'player-info';
        
        // Create player name element
        const playerName = document.createElement('div');
        playerName.className = 'player-name';
        playerName.textContent = player.username; // Display username
        
        // Create player score element
        const playerScore = document.createElement('div');
        playerScore.className = 'player-score';
        playerScore.textContent = `Score: ${player.score}`; // Display score
        
        // Create player date element
        const playerDate = document.createElement('div');
        playerDate.className = 'player-date';
        playerDate.textContent = this.formatDate(player.date); // Display formatted date
        
        // Assemble player info
        playerInfo.appendChild(playerName); // Add name to info
        playerInfo.appendChild(playerScore); // Add score to info
        playerInfo.appendChild(playerDate); // Add date to info
        
        // Assemble player card
        card.appendChild(rankBadge); // Add rank badge to card
        card.appendChild(playerInfo); // Add player info to card
        
        return card;
    }

    // Create empty state message
    createEmptyState() {
        const message = document.createElement('p');
        message.className = 'no-scores-message';
        message.textContent = 'No scores available'; // Message when no scores exist
        return message;
    }

    // Clear top players content
    clearContent() {
        this.topPlayersContent.innerHTML = ''; // Clear all existing content
    }

    // Display top players
    displayTopPlayers(topPlayers) {
        this.clearContent(); // Clear existing content
        
        // Check if any players exist
        if (topPlayers.length === 0) {
            const emptyState = this.createEmptyState(); // Create empty state message
            this.topPlayersContent.appendChild(emptyState); // Add to container
            return;
        }
        
        // Create and add player cards
        topPlayers.forEach((player, index) => {
            const rank = index + 1; // Calculate rank (1-based)
            const playerCard = this.createPlayerCard(player, rank); // Create player card
            this.topPlayersContent.appendChild(playerCard); // Add card to container
        });
    }

    // Load and display top players
    loadTopPlayers() {
        const topPlayers = this.getTopPlayers(this.topCount); // Get top 3 players
        this.displayTopPlayers(topPlayers); // Display them
    }

    // Refresh top players display (can be called to update)
    refresh() {
        this.loadTopPlayers(); // Reload top players
    }
}

// Create instance of IndexPageManager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new IndexPageManager(); // Create new IndexPageManager instance
});
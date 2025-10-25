// Leaderboard Manager class to handle leaderboard display functionality
class LeaderboardManager {
    // Constructor to initialise the leaderboard manager
    constructor() {
        this.leaderboardBody = document.getElementById('leaderboardBody'); // Get leaderboard table body element
        this.leaderboardKey = 'leaderboard'; // LocalStorage key for leaderboard data
        this.topPositionsColors = {
            0: 'rgba(255, 215, 0, 0.2)', // Gold for 1st place
            1: 'rgba(192, 192, 192, 0.2)', // Silver for 2nd place
            2: 'rgba(205, 127, 50, 0.2)'  // Bronze for 3rd place
        };
        
        this.init(); // Initialise the leaderboard manager
    }

    // Initialise leaderboard loading
    init() {
        this.loadLeaderboard(); // Load and display leaderboard data
    }

    // Get leaderboard data from localStorage
    getLeaderboardData() {
        return JSON.parse(localStorage.getItem(this.leaderboardKey)) || []; // Return leaderboard array or empty array
    }

    // Sort scores in descending order (highest score first)
    sortScores(scores) {
        return scores.sort((a, b) => b.score - a.score); // Sort by score in descending order
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

    // Create empty leaderboard message row
    createEmptyRow() {
        const row = document.createElement('tr'); // Create table row
        row.innerHTML = '<td colspan="4" style="text-align: center; padding: 2rem;">No scores available</td>';
        return row;
    }

    // Create leaderboard entry row
    createScoreRow(entry, index) {
        const row = document.createElement('tr'); // Create table row
        const formattedDate = this.formatDate(entry.date); // Format the date
        
        // Create table cells for rank, username, score, and date
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${entry.username}</td>
            <td>${entry.score}</td>
            <td>${formattedDate}</td>
        `;
        
        // Apply special styling for top 3 positions
        if (this.topPositionsColors.hasOwnProperty(index)) {
            row.style.backgroundColor = this.topPositionsColors[index];
        }
        
        return row;
    }

    // Clear existing leaderboard entries
    clearLeaderboard() {
        this.leaderboardBody.innerHTML = ''; // Clear all existing rows
    }

    // Display empty state when no scores exist
    displayEmptyState() {
        const emptyRow = this.createEmptyRow(); // Create empty message row
        this.leaderboardBody.appendChild(emptyRow); // Add row to table body
    }

    // Display all leaderboard entries
    displayScores(scores) {
        scores.forEach((entry, index) => {
            const scoreRow = this.createScoreRow(entry, index); // Create row for each score
            this.leaderboardBody.appendChild(scoreRow); // Add row to table body
        });
    }

    // Load and display leaderboard data
    loadLeaderboard() {
        this.clearLeaderboard(); // Clear existing leaderboard entries
        
        // Retrieve and sort scores from localStorage
        let scores = this.getLeaderboardData(); // Get leaderboard data
        scores = this.sortScores(scores); // Sort scores by highest first
        
        // Check if any scores exist
        if (scores.length === 0) {
            this.displayEmptyState(); // Display empty state message
            return;
        }
        
        this.displayScores(scores); // Display all scores
    }

    // Refresh leaderboard (can be called to update display)
    refresh() {
        this.loadLeaderboard(); // Reload leaderboard data
    }
}

// Create instance of LeaderboardManager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new LeaderboardManager(); // Create new LeaderboardManager instance
});
// Create the leaderboard table body by getting the HTML element ID
const leaderboardBody = document.getElementById('leaderboardBody');

// Creating function to load and display leaderboard data
function loadLeaderboard() {
    // Retrieve scores from localStorage, or initialise empty array if none exist
    let scores = JSON.parse(localStorage.getItem('leaderboard')) || [];
    // Sort scores in descending order (highest score first)
    scores.sort((a, b) => b.score - a.score);
    // If no scores exist, display a message
    if (scores.length === 0) {
        const row = document.createElement('tr'); // Create table row
        row.innerHTML = '<td colspan="4" style="text-align: center; padding: 2rem;">No scores available</td>';
        leaderboardBody.appendChild(row); // Add row to table body
        return;
    }
    
    // Loop through scores and create table rows
    scores.forEach((entry, index) => {
        // Create table row
        const row = document.createElement('tr');
        // Format the date
        const date = new Date(entry.date); // Convert date string to Date object
        const formattedDate = date.toLocaleDateString('en-GB', {
            day: '2-digit', // Current day
            month: '2-digit', // Current month
            year: 'numeric' // Current year
        });
        
        // Create table cells for rank, username, score, and date
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${entry.username}</td>
            <td>${entry.score}</td>
            <td>${formattedDate}</td>
        `;
        
        // Add special styling for top 3 positions
        if (index === 0) {
            row.style.backgroundColor = 'rgba(255, 215, 0, 0.2)'; // Gold
        } else if (index === 1) {
            row.style.backgroundColor = 'rgba(192, 192, 192, 0.2)'; // Silver
        } else if (index === 2) {
            row.style.backgroundColor = 'rgba(205, 127, 50, 0.2)'; // Bronze
        }
        // Add row to table body
        leaderboardBody.appendChild(row); 
    });
}

// Loading leaderboard when page loads
document.addEventListener('DOMContentLoaded', loadLeaderboard);
// Check if user is logged in
function checkLoginStatus() {
    return localStorage.getItem('loggedInUser') !== null;
}

// Get current logged in user
function getCurrentUser() {
    return localStorage.getItem('loggedInUser');
}

// Logout function
function logout() {
    localStorage.removeItem('loggedInUser');
    window.location.href = 'login.html';
}

// Update navigation based on login status
function updateNavigation() {
    const user = getCurrentUser();
    const navLinks = document.querySelector('.nav-links');
    
    if (navLinks) {
        // Remove existing logout button if any
        const existingLogout = navLinks.querySelector('.logout-nav-button');
        if (existingLogout) {
            existingLogout.remove();
        }
        
        // Remove existing user info if any
        const existingUserInfo = navLinks.querySelector('.user-info');
        if (existingUserInfo) {
            existingUserInfo.remove();
        }
        
        // Add logout button to navbar if logged in
        if (user) {
            // Create logout button for navbar
            const logoutButton = document.createElement('a');
            logoutButton.href = '#';
            logoutButton.className = 'logout-nav-button';
            logoutButton.innerHTML = `
                <img src="../img/logout.png" alt="Logout" class="nav-icons">
            `;
            logoutButton.onclick = function(e) {
                e.preventDefault();
                logout();
            };
            
            // Add title for hover effect
            logoutButton.title = `Logout (${user})`;
            
            // Add to navigation
            navLinks.appendChild(logoutButton);
        }
    }
}

// Initialize navigation on page load
document.addEventListener('DOMContentLoaded', function() {
    updateNavigation();
    
    // Redirect to login if trying to access protected pages without authentication
    const protectedPages = ['game.html', 'leaderboard.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage) && !checkLoginStatus()) {
        window.location.href = 'login.html';
    }
});
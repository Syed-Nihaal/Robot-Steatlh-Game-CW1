// Creating Authentication Manager class
class AuthManager {
    // Creating constructor to initialise the authentication manager
    constructor() {
        this.loggedInUserKey = 'loggedInUser'; // LocalStorage key for logged-in user
        this.sessionUserKey = 'currentUser'; // SessionStorage key for current user session
        this.protectedPages = ['game.html', 'leaderboard.html']; // Pages that require authentication
    }

    // Checking if user is currently logged in
    checkLoginStatus() {
        return localStorage.getItem(this.loggedInUserKey) !== null && sessionStorage.getItem(this.sessionUserKey) !== null;
    }

    // Geting the username of the currently logged-in user from localStorage and sessionStorage
    getCurrentUser() {
        return localStorage.getItem(this.loggedInUserKey) && sessionStorage.getItem(this.sessionUserKey);
    }

    // Logging out the current user and redirect to login page
    logout() {
        localStorage.removeItem(this.loggedInUserKey); // Remove logged-in user from localStorage
        sessionStorage.removeItem(this.sessionUserKey); // Remove current user session from sessionStorage
        window.location.href = 'login.html'; // Redirect to login page
    }

    // Updating navigation bar based on login status
    updateNavigation() {
        const user = this.getCurrentUser(); // Geting current logged-in user
        const navLinks = document.querySelector('.nav-links'); // Geting navigation links container
        
        if (navLinks) {
            // Removing existing logout button if any
            const existingLogout = navLinks.querySelector('.logout-nav-button');
            if (existingLogout) {
                existingLogout.remove(); // Removing old logout button
            }
            
            // Removing existing user info if any
            const existingUserInfo = navLinks.querySelector('.user-info');
            if (existingUserInfo) {
                existingUserInfo.remove(); // Removing old user info
            }
            
            // Adding logout button to navbar if user is logged in
            if (user) {
                // Creating logout button element for navbar
                const logoutButton = document.createElement('a');
                logoutButton.href = '#'; // Setting href to prevent page navigation
                logoutButton.className = 'logout-nav-button'; // Setting CSS class
                logoutButton.innerHTML = `
                    <img src="../img/logout.png" alt="Logout" class="nav-icons">
                `; // Setting logout icon
                
                // Adding click event listener for logout functionality
                logoutButton.onclick = (e) => {
                    e.preventDefault(); // Preventing default anchor behaviour
                    this.logout(); // Calling logout method
                };
                
                // Adding title attribute for hover tooltip showing username
                logoutButton.title = `Logout (${user})`;
                
                // Appending logout button to navigation
                navLinks.appendChild(logoutButton);
            }
        }
    }

    // Checking if current page requires authentication and redirect if not logged in
    protectPage() {
        const currentPage = window.location.pathname.split('/').pop(); // Getting current page filename
        // If current page is protected and user is not logged in
        if (this.protectedPages.includes(currentPage) && !this.checkLoginStatus()) {
            window.location.href = 'login.html'; // Redirecting to login page
        }
    }

    // Initialising authentication manager
    init() {
        this.updateNavigation(); // Updating navigation based on login status
        this.protectPage(); // Protecting page if necessary
    }
}

// Creating instance of AuthManager and initialise when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const authManager = new AuthManager(); // Creating new AuthManager instance
    authManager.init(); // Initialising authentication manager
});
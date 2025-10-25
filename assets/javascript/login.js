// Create the login form by getting the HTML element ID
const loginForm = document.getElementById('loginForm');
// Create the message label by getting the HTML element ID
const messageLabel = document.getElementById('messageLabel');

// Add event listener to the login form
loginForm.addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent the form from submitting
    const username = document.getElementById('username').value.trim(); // Get the username from the form input ID
    const password = document.getElementById('password').value.trim(); // Get the password from the form input ID
    // Check if the username is in localStorage users
    let users = JSON.parse(localStorage.getItem('users')) || [];
    // Check if the username and password are correct
    const user = users.find(u => u.username === username && u.password === password);
    // Clear previous messages
    messageLabel.textContent = '';
    // Show login status
    messageLabel.style.color = 'red';

    // Check if the username and password are correct
    if (user) {
        messageLabel.style.color = 'green';
        messageLabel.textContent = 'Login successful! Redirecting...';
        localStorage.setItem('loggedInUser', username);
        setTimeout(() => {
            window.location.href = 'game.html'; // Redirect to the game page
        }, 1500);
    } else {
        messageLabel.textContent = 'Invalid username or password. Please try again.'; // Show error message
    }
});

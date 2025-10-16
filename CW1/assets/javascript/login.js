const loginForm = document.getElementById('loginForm');
const messageLabel = document.getElementById('messageLabel');

loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    let users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.username === username && u.password === password);
    messageLabel.textContent = '';
    messageLabel.style.color = 'red';

    if (user) {
        messageLabel.style.color = 'green';
        messageLabel.textContent = 'Login successful! Redirecting...';
        localStorage.setItem('loggedInUser', username);
        setTimeout(() => {
            window.location.href = 'game.html';
        }, 1500);
    } else {
        messageLabel.textContent = 'Invalid username or password. Please try again.';
    }
});

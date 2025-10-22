const registerForm = document.getElementById('registerForm');
const messageLabel = document.getElementById('messageLabel'); // Label to show messages

registerForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const dob = document.getElementById('dob').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirm-password').value.trim();
    messageLabel.textContent = '';
    messageLabel.style.color = 'red';

    if (password !== confirmPassword) {
        messageLabel.textContent = 'Passwords do not match. Please try again.';
        return;
    }

    let users = JSON.parse(localStorage.getItem('users')) || [];

    const userExists = users.find(user => user.username === username || user.email === email);
    if (userExists) {
        messageLabel.textContent = 'Username or email already exists. Please choose another.';
        return;
    }

    users.push({username: username, email: email, dob: dob, password: password});
    localStorage.setItem('users', JSON.stringify(users));
    messageLabel.style.color = 'green';
    messageLabel.textContent = 'Registration successful! Redirecting to login...';

    setTimeout(() => {
        window.location.href = 'login.html';
    }, 2000);
});

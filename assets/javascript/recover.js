const recoverForm = document.getElementById('recoverForm');
const messageLabel = document.getElementById('messageLabel'); // Label for feedback

recoverForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    let users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email);

    // Clear previous messages
    messageLabel.textContent = '';
    messageLabel.style.color = 'red';

    // Case 1: Email not found
    if (!user) {
        messageLabel.textContent = 'No account found with this email address.';
        return;
    }

    // Case 2: User entered email + username (recover password)
    if (username && !password) {
        if (user.username === username) {
            messageLabel.style.color = 'green';
            messageLabel.textContent = `Password recovery successful! Your password is: ${user.password}`;

            // Redirect after short delay
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            messageLabel.textContent = 'Username does not match the email address.';
        }
        return;
    }

    // ✅ Case 3: User entered email + password (recover username)
    if (password && !username) {
        if (user.password === password) {
            messageLabel.style.color = 'green';
            messageLabel.textContent = `Username recovery successful! Your username is: ${user.username}`;

            // Redirect after short delay
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            messageLabel.textContent = 'Password does not match the email address.';
        }
        return;
    }

    // Case 4: User entered both or none
    messageLabel.textContent = 'Please provide either email + username OR email + password for recovery.';
});

document.addEventListener('DOMContentLoaded', () => {
    // Select the form and message elements
    const loginForm = document.getElementById('loginForm');
    const loginMessage = document.getElementById('loginMessage');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    // Add a submit event listener to the form
    loginForm.addEventListener('submit', async (event) => {
        // Prevent the default form submission (which reloads the page)
        event.preventDefault();

        // Get the values from the input fields
        const email = emailInput.value;
        const password = passwordInput.value;

        // Hide any previous error messages
        loginMessage.classList.add('hidden');
        loginMessage.textContent = '';

        try {
            // Send the login request to the server
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            // Parse the JSON response from the server
            const data = await response.json();

            // Check if the login was successful (server returns 2xx status and success:true)
            if (response.ok && data.success) {
                // --- SUCCESS ---
                // Store the token in localStorage
                localStorage.setItem('authToken', data.token);

                // Optional: Store user info as well
                localStorage.setItem('user', JSON.stringify(data.user));

                // Show a temporary success message
                loginMessage.textContent = 'Login successful! Redirecting...';
                loginMessage.classList.remove('hidden');
                loginMessage.classList.remove('bg-red-100', 'text-red-700');
                loginMessage.classList.add('bg-green-100', 'text-green-700');

                // Redirect to the dashboard or main app page after a short delay
                setTimeout(() => {
                    window.location.href = 'index.html'; // <-- CHANGE THIS to your main app page
                }, 1000);

            } else {
                // --- FAILURE ---
                // Show the error message from the server
                loginMessage.textContent = data.message || 'An unknown error occurred.';
                loginMessage.classList.remove('hidden');
                loginMessage.classList.add('bg-red-100', 'text-red-700');
            }

        } catch (error) {
            // --- NETWORK OR OTHER ERROR ---
            console.error('Login failed:', error);
            loginMessage.textContent = 'Could not connect to the server. Please try again later.';
            loginMessage.classList.remove('hidden');
            loginMessage.classList.add('bg-red-100', 'text-red-700');
        }
    });
});


// Page navigation
function showPage(pageId) {
    const pages = document.querySelectorAll('.page-content');
    pages.forEach(page => page.classList.remove('active'));

    const activePage = document.getElementById(pageId);
    if (activePage) {
        activePage.classList.add('active');
    }

    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => link.classList.remove('active'));

    // Find the button that controls this page and set it to active
    const activeButton = document.querySelector(`.nav-link[onclick="showPage('${pageId}')"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }


    const titles = {
        dashboard: 'Dashboard',
        vehicles: 'Vehicles',
        health: 'Health Records',
        qr: 'QR Codes',
        users: 'Users',
        settings: 'Settings'
    };

    const titleEl = document.getElementById('page-title');
    if (titleEl) {
        titleEl.textContent = titles[pageId];
    }

    setTimeout(() => {
        if (dashboardMap && pageId === 'dashboard') dashboardMap.invalidateSize();
        if (vehicleMap && pageId === 'vehicles') vehicleMap.invalidateSize();
    }, 100);
}

// Mock vehicle data (your existing map code)
const vehicleData = [
    { id: 'VEH-001', name: 'Vehicle #001', driver: 'Juan Dela Cruz', status: 'Active', lat: 14.3245, lng: 120.9245, color: 'red' },
    { id: 'VEH-002', name: 'Vehicle #002', driver: 'Maria Santos', status: 'Active', lat: 14.3250, lng: 120.9255, color: 'green' },
    { id: 'VEH-003', name: 'Vehicle #003', driver: 'Pedro Reyes', status: 'Idle', lat: 14.3230, lng: 120.9220, color: 'yellow' },
    { id: 'VEH-004', name: 'Vehicle #004', driver: 'Ana Garcia', status: 'Active', lat: 14.3260, lng: 120.9270, color: 'blue' }
];

let dashboardMap;
let vehicleMap;
let markers = {};

function initMaps() {
    // Dashboard Map
    if (document.getElementById('dashboard-map')) {
        dashboardMap = L.map('dashboard-map').setView([14.3245, 120.9245], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(dashboardMap);
    }

    // Vehicle Map
    if (document.getElementById('vehicle-map')) {
        vehicleMap = L.map('vehicle-map').setView([14.3245, 120.9245], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(vehicleMap);
    }

    vehicleData.forEach(vehicle => addMarkerToMaps(vehicle));
    setInterval(updateVehiclePositions, 5000);
}

function addMarkerToMaps(vehicle) {
    const markerColor = getMarkerColor(vehicle.color);
    const markerHTML = `
            <div class="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-lg" style="background-color: ${markerColor};">
                <i class="fas fa-truck text-white text-xs"></i>
            </div>
        `;

    const customIcon = L.divIcon({
        html: markerHTML,
        iconSize: [32, 32],
        className: 'custom-marker'
    });

    const popup = `
            <div class="text-sm">
                <p><strong>${vehicle.name}</strong></p>
                <p style="margin: 4px 0; font-size: 12px;">Driver: ${vehicle.driver}</p>
                <p style="margin: 4px 0; font-size: 12px;">Status: <span style="font-weight: 600;">${vehicle.status}</span></p>
                <p style="margin: 4px 0; font-size: 12px;">${vehicle.lat.toFixed(4)}, ${vehicle.lng.toFixed(4)}</p>
            </div>
        `;

    const marker = L.marker([vehicle.lat, vehicle.lng], { icon: customIcon })
        .bindPopup(popup);

    if (dashboardMap) marker.addTo(dashboardMap);
    if (vehicleMap) marker.addTo(vehicleMap);
    markers[vehicle.id] = { marker: marker, data: vehicle };
}

function getMarkerColor(color) {
    const colors = { red: '#EF4444', green: '#10B981', blue: '#3B82F6', yellow: '#FBBF24' };
    return colors[color] || '#3B82F6';
}

function updateVehiclePositions() {
    vehicleData.forEach(vehicle => {
        const randomLat = (Math.random() - 0.5) * 0.001;
        const randomLng = (Math.random() - 0.5) * 0.001;

        vehicle.lat += randomLat;
        vehicle.lng += randomLng;

        if (markers[vehicle.id]) {
            markers[vehicle.id].marker.setLatLng([vehicle.lat, vehicle.lng]);
            const popup = `
                    <div class="text-sm">
                        <p><strong>${vehicle.name}</strong></p>
                        <p style="margin: 4px 0; font-size: 12px;">Driver: ${vehicle.driver}</p>
                        <p style="margin: 4px 0; font-size: 12px;">Status: <span style="font-weight: 600;">${vehicle.status}</span></p>
                        <p style="margin: 4px 0; font-size: 12px;">${vehicle.lat.toFixed(4)}, ${vehicle.lng.toFixed(4)}</p>
                    </div>
                `;
            markers[vehicle.id].marker.setPopupContent(popup);
        }
    });
}

// --- START: MODIFIED User Modal & Page Functions ---

// API base URL - This must match your backend server
const API_URL = 'http://localhost:3000/api';

// Add User Modal
function showAddUserModal() {
    document.getElementById('addUserModal').classList.remove('hidden');
}

function closeAddUserModal() {
    document.getElementById('addUserModal').classList.add('hidden');
    document.getElementById('addUserForm').reset();
    const msg = document.getElementById('addFormMessage');
    if (msg) {
        msg.classList.add('hidden');
        msg.textContent = '';
    }
}

// START: NEW Edit User Modal Functions
function showEditUserModal() {
    document.getElementById('editUserModal').classList.remove('hidden');
}

function closeEditUserModal() {
    document.getElementById('editUserModal').classList.add('hidden');
    document.getElementById('editUserForm').reset();
    const msg = document.getElementById('editFormMessage');
    if (msg) {
        msg.classList.add('hidden');
        msg.textContent = '';
    }
}
// END: NEW Edit User Modal Functions

/**
 * Adds a single user row to the table.
 */
function addUserToTable(user) {
    const tableBody = document.getElementById('usersTableBody');
    if (!tableBody) return;

    // Remove empty state message if it exists
    // Changed colspan="5" to colspan="6" to match the new column
    const emptyMessage = tableBody.querySelector('tr td[colspan="6"]');
    if (emptyMessage) {
        emptyMessage.parentElement.remove();
    }

    const roleColors = {
        admin: 'rgba(59, 130, 246, 0.1); color: #2563eb;',
        health: 'rgba(16, 185, 129, 0.1); color: #059669;',
        driver: 'rgba(251, 146, 60, 0.1); color: #c2410c;'
    };

    const statusBadge = user.status === 'active'
        ? '<span class="badge badge-active">Active</span>'
        : '<span class="badge badge-idle">Inactive</span>';

    // Formats the creation date.
    // This assumes your user object has a 'created_at' field.
    let formattedDate = 'N/A';
    if (user.created_at) {
        // Formats the date to something like "Nov 5, 2025"
        formattedDate = new Date(user.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    const newRow = document.createElement('tr');
    newRow.className = 'table-row';

    // Added the new <td> for the formattedDate
    newRow.innerHTML = `
            <td class="px-6 py-4 text-sm text-slate-900">${user.name}</td>
            <td class="px-6 py-4 text-sm text-slate-600">${user.email}</td>
            <td class="px-6 py-4"><span class="badge" style="background-color: ${roleColors[user.role] || 'rgba(100, 116, 139, 0.1); color: #475569;'}">${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span></td>
            <td class="px-6 py-4">${statusBadge}</td>
            <td class="px-6 py-4 text-sm text-slate-600">${formattedDate}</td> <td class="px-6 py-4">
                <button class="text-blue-600 text-sm hover:underline" onclick='editUser(${JSON.stringify(user)})'>Edit</button>
                <button class="text-red-600 text-sm hover:underline ml-3" onclick='confirmDeleteUser("${user.id}")'>Delete</button>
            </td>
        `;

    tableBody.appendChild(newRow);
}



// --- START OF DATABASE CODE ---

/**
 * Fetches all users from the backend and renders the table.
 */
async function fetchUsersAndRender() {
    const tableBody = document.getElementById('usersTableBody');
    if (!tableBody) return; // Don't run if table isn't on the page

    tableBody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-slate-500">Loading...</td></tr>';

    try {
        const response = await fetch(`${API_URL}/users`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const users = await response.json();

        tableBody.innerHTML = ''; // Clear 'Loading...'

        if (users.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-slate-500">No users found.</td></tr>';
            return;
        }

        users.forEach(user => {
            addUserToTable(user); // Use your existing function
        });

    } catch (error) {
        console.error('Failed to fetch users:', error);
        tableBody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-red-500">Failed to load users.</td></tr>';
    }
}

/**
 * Handles the 'Add User' form submission.
 */
async function handleAddUser(event) {
    event.preventDefault();
    const formMessage = document.getElementById('addFormMessage');
    formMessage.classList.add('hidden');
    formMessage.textContent = '';

    const newUser = {
        name: document.getElementById('userName').value,
        email: document.getElementById('userEmail').value,
        password: document.getElementById('userPassword').value,
        role: document.getElementById('userRole').value,
        status: document.getElementById('userStatus').value
    };

    if (!newUser.name || !newUser.email || !newUser.password || !newUser.role) {
        formMessage.textContent = 'Please fill out all required fields.';
        formMessage.className = 'mt-4 p-3 rounded-lg bg-red-100 text-red-700';
        formMessage.classList.remove('hidden');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'An error occurred.');
        }

        formMessage.textContent = 'User added successfully!';
        formMessage.className = 'mt-4 p-3 rounded-lg bg-green-100 text-green-700';
        formMessage.classList.remove('hidden');

        // Add the new user to the table
        addUserToTable(data.user);

        setTimeout(() => {
            closeAddUserModal();
        }, 1000);

    } catch (error) {
        console.error('Error adding user:', error);
        formMessage.textContent = error.message;
        formMessage.className = 'mt-4 p-3 rounded-lg bg-red-100 text-red-700';
        formMessage.classList.remove('hidden');
    }
}

/**
 * START: MODIFIED editUser function
 * Populates the edit modal with the user's data.
 */
function editUser(user) {
    console.log("Editing user:", user);

    // Populate the form fields
    document.getElementById('editUserId').value = user.id;
    document.getElementById('editUserName').value = user.name;
    document.getElementById('editUserEmail').value = user.email;
    document.getElementById('editUserRole').value = user.role;
    document.getElementById('editUserStatus').value = user.status;

    // Clear the password field
    document.getElementById('editUserPassword').value = '';

    // Show the modal
    showEditUserModal();
}
// END: MODIFIED editUser function

/**
 * START: NEW handleEditUser function
 * Handles the 'Edit User' form submission.
 */
async function handleEditUser(event) {
    event.preventDefault();
    const formMessage = document.getElementById('editFormMessage');
    formMessage.classList.add('hidden');
    formMessage.textContent = '';

    const userId = document.getElementById('editUserId').value;

    const updatedUserData = {
        name: document.getElementById('editUserName').value,
        email: document.getElementById('editUserEmail').value,
        role: document.getElementById('editUserRole').value,
        status: document.getElementById('editUserStatus').value
    };

    // Only include the password if the user entered a new one
    const password = document.getElementById('editUserPassword').value;
    if (password) {
        updatedUserData.password = password;
    }

    try {
        const response = await fetch(`${API_URL}/users/${userId}`, {
            method: 'PUT', // or 'PATCH'
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedUserData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'An error occurred.');
        }

        formMessage.textContent = 'User updated successfully!';
        formMessage.className = 'mt-4 p-3 rounded-lg bg-green-100 text-green-700';
        formMessage.classList.remove('hidden');

        // Refresh the entire user list to show changes
        fetchUsersAndRender();

        setTimeout(() => {
            closeEditUserModal();
        }, 1000);

    } catch (error) {
        console.error('Error updating user:', error);
        formMessage.textContent = error.message;
        formMessage.className = 'mt-4 p-3 rounded-lg bg-red-100 text-red-700';
        formMessage.classList.remove('hidden');
    }
}
// END: NEW handleEditUser function

/**
 * Asks for confirmation before deleting a user.
 */
function confirmDeleteUser(userId) {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        handleDeleteUser(userId);
    }
}

/**
 * Handles the actual deletion API call.
 */
async function handleDeleteUser(userId) {
    try {
        const response = await fetch(`${API_URL}/users/${userId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const data = await response.json(); // Get error message from backend
            throw new Error(data.message || 'Failed to delete user.');
        }

        // On success, just refresh the entire user list
        await fetchUsersAndRender();

    } catch (error) {
        console.error('Error deleting user:', error);
        alert(`Error: ${error.message}`); // Show an alert on failure
    }
}


/**
 * Logs the user out by clearing credentials and redirecting to login.
 */
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// You can then add a button to your HTML like this:
// <button onclick="logout()" class="nav-link">
//     <i class="fas fa-sign-out-alt"></i>
//     <span>Logout</span>
// </button>


// --- END OF DATABASE CODE ---



/**
 * NEW: Populates the header with the logged-in user's info.
 */
function displayLoggedInUser() {
    // 1. Get user data from localStorage
    const userString = localStorage.getItem('user');
    if (!userString) {
        console.error('No user data found in localStorage.');
        return;
    }

    // 2. Parse the JSON data
    const user = JSON.parse(userString);

    // 3. Get initials (e.g., "Juan Dela Cruz" -> "JD")
    let initials = 'U'; // Default
    if (user.name) {
        const nameParts = user.name.split(' ');
        initials = nameParts[0].charAt(0); // First initial
        if (nameParts.length > 1) {
            initials += nameParts[nameParts.length - 1].charAt(0); // Last initial
        }
        initials = initials.toUpperCase();
    }

    // 4. Get Role (capitalize first letter)
    let role = 'User'; // Default
    if (user.role) {
        role = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    }

    // 5. Update the HTML elements in the header
    document.getElementById('user-initials').textContent = initials;
    document.getElementById('user-name').textContent = user.name;
    document.getElementById('user-role').textContent = role;
}

/**
 * NEW: This function holds all your original startup code.
 * We will call this *after* we confirm the user is authenticated.
 */
function initializeApp() {
    displayLoggedInUser(); // Display user info in header
    initMaps();
    showPage('dashboard'); // Show dashboard on load
    fetchUsersAndRender(); // Fetch users from DB on page load
}

/**
 * NEW: Checks if the user has a valid token.
 * If not, redirects to login.
 */
async function checkAuthentication() {
    const token = localStorage.getItem('authToken');

    // 1. If no token, redirect immediately
    if (!token) {
        console.log('No token found, redirecting to login...');
        // We use login.html from your previous file
        window.location.href = 'login.html';
        return; // Stop further execution
    }

    // 2. If token exists, verify it with the server
    try {
        // We use the /api/verify-token endpoint from your server.js
        const response = await fetch(`${API_URL}/verify-token`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            // --- SUCCESS ---
            // User is authenticated, load the app
            console.log('Token is valid. Initializing app...');
            initializeApp();
        } else {
            // --- FAILURE (Token invalid, expired, etc.) ---
            throw new Error('Invalid or expired token');
        }

    } catch (error) {
        // --- CATCH ALL (Network error, invalid token) ---
        console.error('Authentication check failed:', error.message);

        // Clear the bad token and send back to login
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }
}

/**
 * MODIFIED: This will run when the page loads
 */
document.addEventListener('DOMContentLoaded', () => {
    // Instead of starting the app, we check authentication first.
    // checkAuthentication() will call initializeApp() if it's successful.
    checkAuthentication();
});

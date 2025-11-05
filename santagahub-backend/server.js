const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const dotenv = require('dotenv'); // 🟢 added
const jwt = require('jsonwebtoken');


const app = express();
app.use(cors());
app.use(express.json());

dotenv.config(); // 🟢 load .env

// 🟢 use env variables instead of hardcoded values
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});


// --- GET all users ---
app.get('/api/users', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT id, name, email, role, status, created_at FROM users');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// --- ADD new user ---
app.post('/api/users', async (req, res) => {
    const { name, email, password, role, status } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const sql = `
            INSERT INTO users (name, email, password_hash, role, status)
            VALUES (?, ?, ?, ?, ?)
        `;
        // ... (hashing password)
        const [result] = await pool.execute(sql, [name, email, hashedPassword, role, status]);

        // Re-fetch the user you just created to get all fields (including created_at)
        const [rows] = await pool.execute('SELECT id, name, email, role, status, created_at FROM users WHERE id = ?', [result.insertId]);

        res.status(201).json({ // <-- NEW RESPONSE
            success: true,
            message: 'User added successfully!',
            user: rows[0] // Send the complete user object
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: 'Email already exists.' });
        }
        console.error('Error adding user:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// --- UPDATE existing user ---
app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, role, status, password } = req.body;

    try {
        const [existing] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        let sql = 'UPDATE users SET name = ?, email = ?, role = ?, status = ?';
        const params = [name, email, role, status];

        if (password && password.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            sql += ', password_hash = ?';
            params.push(hashedPassword);
        }

        sql += ' WHERE id = ?';
        params.push(id);

        await pool.execute(sql, params);

        res.json({ success: true, message: 'User updated successfully!' });

    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


/**
 * Endpoint to DELETE a user by ID
 */
app.delete('/api/users/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Check if the user exists first
        const [existing] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        // Perform the deletion
        await pool.execute('DELETE FROM users WHERE id = ?', [id]);

        res.json({ success: true, message: 'User deleted successfully!' });

    } catch (error) {
        console.error('Error deleting user:', error);

        // If it's a foreign key constraint issue (like user is referenced elsewhere)
        if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === 'ER_ROW_IS_REFERENCED') {
            return res.status(409).json({
                success: false,
                message: 'Cannot delete user because it is referenced in another table.'
            });
        }

        res.status(500).json({ success: false, message: 'Server error' });
    }
});

const SECRET_KEY = process.env.JWT_SECRET;
/**
 * Endpoint for user login
 */
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    try {
        // Find the user by email
        const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        const user = rows[0];

        // Compare the entered password with stored hash
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        // Create a JWT token (valid for 1 day)
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            SECRET_KEY,
            { expiresIn: '1d' }
        );

        // Return success response
        res.json({
            success: true,
            message: 'Login successful!',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status
            }
        });

    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Verify token endpoint
app.get('/api/verify-token', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Missing token' });

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        res.json({ valid: true, user: decoded });
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
});

// --- START SERVER ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});

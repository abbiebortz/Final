require('dotenv').config({
    path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env'
});

const express = require('express');
const https = require('https');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const app = express();

require('./models/User');

const corsOptions = {
    origin: 'https://budget-app-j98yq.ondigitalocean.app',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

app.use(express.json());

const { getUserByUsername, addUser, updateBudget, getBudgetByUsername } = require('./dbHelpers');
const { authenticateToken } = require('./auth');

const PORT = process.env.PORT || 443;

// Securely load SSL certificate and key with error handling
let options;
try {
    options = {
        key: fs.readFileSync('key.pem'),
        cert: fs.readFileSync('cert.pem')
    };
} catch (error) {
    console.error('Error reading SSL certificate files:', error);
    process.exit(1); // Exit process if SSL files cannot be read
}

const server = https.createServer(options, app);

app.post('/api/signup', async (req, res) => {
    const { username, password } = req.body;
    try {
        const existingUser = await getUserByUsername(username);
        if (existingUser) {
            return res.status(400).json({ error: "Username already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await addUser({ username, password: hashedPassword });

        return res.status(200).json({ message: "User added successfully. Please log in." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get('/api/user', authenticateToken, async (req, res) => {
    const user = await getUserByUsername(req.user.username);
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await getUserByUsername(username);
        if (!user) {
            return res.status(400).json({ error: 'Cannot find user' });
        }
        if (!(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Not Allowed' });
        }
        const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token: token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error during login' });
    }
});

app.post('/api/budget', authenticateToken, async (req, res) => {
    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.some(item => typeof item.name !== 'string' || typeof item.cost !== 'number')) {
        return res.status(400).json({ error: "Each item must have a name and a cost." });
    }
    try {
        const updatedItems = await updateBudget(req.user.username, items);
        res.json(updatedItems);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/budget', authenticateToken, async (req, res) => {
    try {
        const budgetItems = await getBudgetByUsername(req.user.username);
        if (!budgetItems) {
            return res.status(404).json({ error: "No budget items found." });
        }
        res.json(budgetItems);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

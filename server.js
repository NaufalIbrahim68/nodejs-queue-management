require('dotenv').config();

const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const { Server } = require('socket.io');

const { connectDB, getConnectionStatus } = require('./config/db');
const queueRoutes = require('./routes/queueRoutes');
const { initSocket } = require('./sockets/socket');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PATCH'],
    },
});

// Store io instance on app for use in controllers
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Health / status check endpoint
app.get('/api/status', (req, res) => {
    res.json({
        success: true,
        server: 'running',
        database: getConnectionStatus() ? 'connected' : 'disconnected',
    });
});

// API Routes
app.use('/api/queue', queueRoutes);

// Page Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Initialize Socket.IO
initSocket(io);

// Start server (MongoDB connection is optional)
const PORT = process.env.PORT || 3000;

const startServer = async () => {
    // Try to connect to MongoDB (non-blocking)
    const dbConnected = await connectDB();

    server.listen(PORT, () => {
        console.log(`\n🚀 Server running on http://localhost:${PORT}`);
        console.log(`📋 Customer Page: http://localhost:${PORT}/`);
        console.log(`🔧 Admin Page:    http://localhost:${PORT}/admin`);
        console.log(`📡 API Base:      http://localhost:${PORT}/api/queue`);
        console.log(`💾 Database:      ${dbConnected ? '✅ Connected' : '⚠️  Not connected (run migration later)'}\n`);
    });
};

startServer();

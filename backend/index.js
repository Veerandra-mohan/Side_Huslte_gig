
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');

// Load env vars
dotenv.config();

// Models
const User = require('./models/User');
const Message = require('./models/Message');
const Community = require('./models/Community');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Mongo Connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/gigs', require('./routes/gigs'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/communities', require('./routes/communities'));

// Socket.io connection
io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('sendMessage', async ({ sender, receiver, text }) => {
    try {
        const senderUser = await User.findById(sender);
        const receiverUser = await User.findById(receiver);

        if (!senderUser || !receiverUser) {
            return socket.emit('error', 'Invalid sender or receiver.');
        }

        const message = new Message({ sender, receiver, text });
        await message.save();
        
        // Emit to receiver and sender
        io.emit('receiveMessage', message);
    } catch (error) {
        console.error("Error handling message: ", error);
        socket.emit('error', 'Failed to send message.');
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});


const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, async () => {
      console.log(`Server running on port ${PORT}`);
      
      // Automated testing setup
      try {
        const api = axios.create({ baseURL: `http://localhost:${PORT}/api` });

        const users = [
          { name: 'Teja', email: 'teja@gmail.com', password: '123456' },
          { name: 'Balu', email: 'balu@gmail.com', password: '123456' }
        ];

        // Register users
        const registeredUsers = await Promise.all(users.map(async (user, i) => {
            // Clean up existing user first
            await User.deleteOne({ email: user.email });
            const res = await api.post('/auth/register', user);
            console.log(`User ${i + 1}: ${user.email} created ✅`);
            return { ...user, token: res.data.token };
        }));

        const premiumUser = registeredUsers.find(u => u.email === 'teja@gmail.com');

        // 1. Upgrade to premium
        await api.post('/subscriptions/upgrade', { plan: 'premium' }, {
            headers: { 'x-auth-token': premiumUser.token }
        });
        console.log(`User ${premiumUser.email} upgraded to premium ✅`);
        
        // 2. Create a new axios instance with the upgraded user's token.
        // This ensures subsequent requests are authenticated as a premium user.
        const premiumApi = axios.create({
          baseURL: `http://localhost:${PORT}/api`,
          headers: { 'x-auth-token': (await api.post('/auth/login', { email: premiumUser.email, password: premiumUser.password })).data.token }
        });
        
        // 3. Create community with the new premiumApi instance
        // Clean up existing community first
        await Community.deleteOne({ name: 'Premium Developers' });

        await premiumApi.post('/communities', { name: 'Premium Developers', description: 'A community for elite developers.' });
        console.log(`Community 'Premium Developers' created ✅`);

      } catch (error) {
        if (error.response) {
            console.error('Setup failed:', error.response.data);
        } else {
            console.error('Setup failed:', error.message);
        }
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

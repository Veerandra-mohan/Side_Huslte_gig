const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
const server = http.createServer(app);
const { Server } = require('socket.io');

const io = new Server(server, {
  cors: {
    origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const corsOptions = {
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:5174'],
  optionsSuccessStatus: 200, // For legacy browser support
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

// connect mongo
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=> console.log('MongoDB connected'))
  .catch(err => { console.error('Mongo connect error', err); process.exit(1); });

// models
const User = require('./models/User');
const Message = require('./models/Message');
const Gig = require('./models/Gig');

// routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/gigs', require('./routes/gigs'));

// track connected users (simple in-memory map: userId -> socketId)
const onlineUsers = new Map();

io.on('connection', socket => {
  console.log('socket connected', socket.id);

  socket.on('user:online', (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log('user online', userId);
  });

  socket.on('message:send', async ({ fromId, toId, text }) => {
    try {
      const msg = await Message.create({ from: fromId, to: toId, text });
      // emit to receiver if online
      const toSocket = onlineUsers.get(toId);
      if (toSocket) io.to(toSocket).emit('message:receive', msg);
      // also emit to sender (to confirm)
      socket.emit('message:sent', msg);
    } catch (err) {
      console.error(err);
      socket.emit('error', 'message_save_failed');
    }
  });

  socket.on('gig:create', async (gigData) => {
    try {
      // Find the user who is creating the gig
      const user = await User.findById(gigData.user).select('name');
      if (!user) return socket.emit('error', 'gig_create_failed_user_not_found');

      const gig = await Gig.create({ ...gigData, user: user._id });
      io.emit('gig:created', gig.toObject());
    } catch (err) {
      console.error(err);
      socket.emit('error', 'gig_create_failed');
    }
  });

  socket.on('disconnect', () => {
    for (const [userId, sId] of onlineUsers.entries()){
      if (sId === socket.id) onlineUsers.delete(userId);
    }
    console.log('socket disconnected', socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
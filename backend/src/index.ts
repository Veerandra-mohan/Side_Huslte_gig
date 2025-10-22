
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import userRoutes from './routes/userRoutes';
import gigRoutes from './routes/gigRoutes';
import chatRoutes from './routes/chatRoutes';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // Replace with your frontend URL
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/soc_app')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/gigs', gigRoutes);
app.use('/api/chats', chatRoutes);

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });

  // Join a room based on gigId
  socket.on('join gig', (gigId) => {
    socket.join(gigId);
    console.log(`User joined gig: ${gigId}`);
  });

  // Leave a room
  socket.on('leave gig', (gigId) => {
    socket.leave(gigId);
    console.log(`User left gig: ${gigId}`);
  });

  // Listen for chat messages and broadcast to the specific gig room
  socket.on('chat message', (data) => {
    const { gigId, message } = data;
    io.to(gigId).emit('chat message', message);
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

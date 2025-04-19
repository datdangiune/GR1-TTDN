const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const http = require('http');
const { Server } = require('socket.io');
const schedule = require('node-schedule');
const TaskRequest = require('./models/TaskRequest');
const { notifyUser } = require('./utils/notifier');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const historyRoutes = require('./routes/historyRoutes');
const agentRoutes = require('./routes/agentRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload()); // Add file upload middleware

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/agent', agentRoutes);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// WebSocket setup
const server = http.createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
  console.log('WebSocket connected:', socket.id);

  // Example: Store userId and socket.id mapping if needed
  socket.on('register', (userId) => {
    socket.userId = userId; // Attach userId to the socket
    console.log(`User registered with userId: ${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('WebSocket disconnected:', socket.id);
  });
});

// Example usage of notifyUser
// notifyUser(io, 'userId123', 'Đã tìm thấy vé đi Hà Nội ngày 30/4', [{ route: 'Hà Nội', price: 500000 }]);

// Job scheduler
const checkPendingTasks = async () => {
  const pendingTasks = await TaskRequest.find({ status: 'pending' });
  pendingTasks.forEach((task) => {
    // Simulate task processing
    task.status = 'completed';
    task.save();
    io.emit('taskUpdated', task);
  });
};

// Schedule task checks every 5 minutes
schedule.scheduleJob('*/5 * * * *', checkPendingTasks);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

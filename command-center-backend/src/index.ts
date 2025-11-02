import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Import routes
import authRoutes from './routes/auth.routes';
import issueRoutes from './routes/issue.routes';
import claudeRoutes from './routes/claude.routes';
import projectRoutes from './routes/project.routes';

// Import middleware
import { errorHandler } from './middleware/error.middleware';
import { notFoundHandler } from './middleware/notFound.middleware';

// Load environment variables
dotenv.config();

// Create Express app
const app: Application = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Set up middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/claude', claudeRoutes);

// WebSocket handlers
io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);

  // Subscribe to execution updates
  socket.on('subscribe', (data: { executionId: string }) => {
    socket.join(`execution:${data.executionId}`);
    console.log(`Client ${socket.id} subscribed to execution ${data.executionId}`);
  });

  // Unsubscribe from execution updates
  socket.on('unsubscribe', (data: { executionId: string }) => {
    socket.leave(`execution:${data.executionId}`);
    console.log(`Client ${socket.id} unsubscribed from execution ${data.executionId}`);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// Export io for use in other modules
export { io };

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 8000;
httpServer.listen(PORT, () => {
  console.log(`
  🚀 Server is running!
  🔊 Listening on port ${PORT}
  📍 Health check: http://localhost:${PORT}/health
  🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}
  `);
});
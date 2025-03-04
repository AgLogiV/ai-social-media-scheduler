const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const passport = require('passport');
const path = require('path');
require('dotenv').config();
const helmet = require('helmet');
const compression = require('compression');
const logger = require('./utils/logger');
const setupUploadsDirectory = require('./utils/setup-uploads');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const postRoutes = require('./routes/post.routes');
const hashtagRoutes = require('./routes/hashtag.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const socialRoutes = require('./routes/social.routes');
const aiRoutes = require('./routes/ai.routes');

// Import passport config
require('./config/passport')(passport);

// Initialize app
const app = express();

// Set up uploads directory
setupUploadsDirectory();

// Middleware
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(passport.initialize());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-hashtag-optimizer', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    logger.info('Connected to MongoDB');
    
    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/user', userRoutes);
    app.use('/api/posts', postRoutes);
    app.use('/api/hashtags', hashtagRoutes);
    app.use('/api/analytics', analyticsRoutes);
    app.use('/api/social', socialRoutes);
    app.use('/api/ai', aiRoutes);

    // Serve static assets in production
    if (process.env.NODE_ENV === 'production') {
      // Set static folder
      app.use(express.static(path.join(__dirname, '../../client/build')));

      app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../../client/build', 'index.html'));
      });
    }

    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  // Close server & exit process
  process.exit(1);
});

module.exports = app; 
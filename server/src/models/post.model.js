const mongoose = require('mongoose');

/**
 * Media Schema
 */
const mediaSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['image', 'video', 'gif'],
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  alt: {
    type: String,
  },
  width: {
    type: Number,
  },
  height: {
    type: Number,
  },
  size: {
    type: Number,
  },
  thumbnailUrl: {
    type: String,
  },
});

/**
 * Post Schema
 */
const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    platform: {
      type: String,
      enum: ['twitter', 'instagram', 'facebook', 'linkedin'],
      required: true,
    },
    media: [mediaSchema],
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'publishing', 'published', 'failed'],
      default: 'draft',
    },
    scheduledTime: {
      type: Date,
    },
    publishedTime: {
      type: Date,
    },
    platformPostId: {
      type: String,
    },
    analytics: {
      reach: {
        type: Number,
        default: 0,
      },
      impressions: {
        type: Number,
        default: 0,
      },
      engagement: {
        type: Number,
        default: 0,
      },
      likes: {
        type: Number,
        default: 0,
      },
      comments: {
        type: Number,
        default: 0,
      },
      shares: {
        type: Number,
        default: 0,
      },
      clicks: {
        type: Number,
        default: 0,
      },
      saves: {
        type: Number,
        default: 0,
      },
      lastUpdated: {
        type: Date,
      },
    },
    hashtags: {
      type: [String],
      default: [],
    },
    aiGenerated: {
      type: Boolean,
      default: false,
    },
    aiSuggestions: {
      type: mongoose.Schema.Types.Mixed,
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    lastError: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
postSchema.index({ user: 1, createdAt: -1 });
postSchema.index({ user: 1, platform: 1, status: 1 });
postSchema.index({ user: 1, scheduledTime: 1, status: 1 });
postSchema.index({ status: 1, scheduledTime: 1 });

/**
 * Extract hashtags from content
 */
postSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    // Extract hashtags from content
    const hashtags = this.content.match(/#[a-zA-Z0-9_]+/g) || [];
    this.hashtags = [...new Set(hashtags)];
  }
  next();
});

/**
 * Update analytics
 * @param {Object} data - Analytics data
 */
postSchema.methods.updateAnalytics = async function(data) {
  this.analytics = {
    ...this.analytics,
    ...data,
    lastUpdated: new Date(),
  };
  await this.save();
};

/**
 * Mark as published
 * @param {string} platformPostId - Platform post ID
 */
postSchema.methods.markAsPublished = async function(platformPostId) {
  this.status = 'published';
  this.publishedTime = new Date();
  this.platformPostId = platformPostId;
  await this.save();
};

/**
 * Mark as failed
 * @param {string} error - Error message
 */
postSchema.methods.markAsFailed = async function(error) {
  this.status = 'failed';
  this.retryCount += 1;
  this.lastError = error;
  await this.save();
};

const Post = mongoose.model('Post', postSchema);

module.exports = Post; 
const mongoose = require('mongoose');

const HashtagSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    popularity: {
      type: Number,
      default: 0,
    },
    postCount: {
      type: Number,
      default: 0,
    },
    averageEngagement: {
      type: Number,
      default: 0,
    },
    trending: {
      type: Boolean,
      default: false,
    },
    trendingScore: {
      type: Number,
      default: 0,
    },
    relatedHashtags: [
      {
        text: {
          type: String,
          required: true,
        },
        strength: {
          type: Number,
          default: 0,
        },
      },
    ],
    platforms: [
      {
        name: {
          type: String,
          enum: ['instagram', 'twitter', 'facebook', 'linkedin'],
          required: true,
        },
        popularity: {
          type: Number,
          default: 0,
        },
        postCount: {
          type: Number,
          default: 0,
        },
        averageEngagement: {
          type: Number,
          default: 0,
        },
      },
    ],
    historicalData: [
      {
        date: {
          type: Date,
          required: true,
        },
        popularity: {
          type: Number,
          default: 0,
        },
        postCount: {
          type: Number,
          default: 0,
        },
        engagement: {
          type: Number,
          default: 0,
        },
      },
    ],
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
HashtagSchema.index({ text: 1 });
HashtagSchema.index({ category: 1 });
HashtagSchema.index({ trending: 1, trendingScore: -1 });
HashtagSchema.index({ popularity: -1 });

module.exports = mongoose.model('Hashtag', HashtagSchema); 
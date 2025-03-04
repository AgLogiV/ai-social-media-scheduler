const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    platform: {
      type: String,
      enum: ['instagram', 'twitter', 'facebook', 'linkedin', 'all'],
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    metrics: {
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
      engagementRate: {
        type: Number,
        default: 0,
      },
      followers: {
        type: Number,
        default: 0,
      },
      followersGrowth: {
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
      saves: {
        type: Number,
        default: 0,
      },
      clicks: {
        type: Number,
        default: 0,
      },
      profileVisits: {
        type: Number,
        default: 0,
      },
    },
    hashtagPerformance: [
      {
        hashtag: {
          type: String,
          required: true,
        },
        reach: {
          type: Number,
          default: 0,
        },
        engagement: {
          type: Number,
          default: 0,
        },
        engagementRate: {
          type: Number,
          default: 0,
        },
        postCount: {
          type: Number,
          default: 0,
        },
      },
    ],
    topPerformingPosts: [
      {
        post: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Post',
        },
        reach: {
          type: Number,
          default: 0,
        },
        engagement: {
          type: Number,
          default: 0,
        },
        engagementRate: {
          type: Number,
          default: 0,
        },
      },
    ],
    audienceData: {
      ageRanges: [
        {
          range: {
            type: String,
            required: true,
          },
          percentage: {
            type: Number,
            default: 0,
          },
        },
      ],
      genders: [
        {
          gender: {
            type: String,
            required: true,
          },
          percentage: {
            type: Number,
            default: 0,
          },
        },
      ],
      locations: [
        {
          location: {
            type: String,
            required: true,
          },
          percentage: {
            type: Number,
            default: 0,
          },
        },
      ],
      activeHours: [
        {
          hour: {
            type: Number,
            required: true,
          },
          activity: {
            type: Number,
            default: 0,
          },
        },
      ],
      activeDays: [
        {
          day: {
            type: String,
            required: true,
          },
          activity: {
            type: Number,
            default: 0,
          },
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
AnalyticsSchema.index({ user: 1, platform: 1, date: 1 });
AnalyticsSchema.index({ user: 1, date: 1 });

module.exports = mongoose.model('Analytics', AnalyticsSchema); 
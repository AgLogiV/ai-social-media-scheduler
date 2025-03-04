const mongoose = require('mongoose');

/**
 * Hashtag Set Schema
 * Represents a set of hashtags saved by a user
 */
const hashtagSetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    hashtags: {
      type: [String],
      required: [true, 'Hashtags are required'],
      validate: {
        validator: function(v) {
          return v.length > 0 && v.length <= 30;
        },
        message: 'Hashtags must contain between 1 and 30 items',
      },
    },
    platform: {
      type: String,
      enum: ['twitter', 'instagram', 'facebook', 'linkedin', 'all'],
      default: 'all',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    lastUsed: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Create index for faster queries
hashtagSetSchema.index({ user: 1, createdAt: -1 });
hashtagSetSchema.index({ user: 1, platform: 1 });

/**
 * Increment usage count and update last used date
 */
hashtagSetSchema.methods.incrementUsage = async function() {
  this.usageCount += 1;
  this.lastUsed = new Date();
  await this.save();
};

/**
 * Pre-save hook to ensure hashtags are properly formatted
 */
hashtagSetSchema.pre('save', function(next) {
  // Ensure all hashtags start with #
  this.hashtags = this.hashtags.map(hashtag => {
    if (!hashtag.startsWith('#')) {
      return `#${hashtag}`;
    }
    return hashtag;
  });
  
  // Remove duplicates
  this.hashtags = [...new Set(this.hashtags)];
  
  next();
});

const HashtagSet = mongoose.model('HashtagSet', hashtagSetSchema);

module.exports = HashtagSet; 
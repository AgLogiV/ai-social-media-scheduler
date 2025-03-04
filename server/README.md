# AI-Powered Hashtag Optimizer - Backend Server

This is the backend server for the AI-Powered Hashtag Optimizer application, which helps users optimize hashtags for social media posts to improve reach and engagement.

## Features

- User authentication and authorization
- Social media account management
- Post scheduling and management
- Hashtag suggestion and optimization
- Analytics and performance tracking

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Passport.js for authentication strategies
- RESTful API architecture

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

1. Clone the repository
2. Navigate to the server directory:
   ```
   cd server
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file in the root directory with the following variables:
   ```
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/ai-hashtag-optimizer
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=7d
   EMAIL_SERVICE=gmail
   EMAIL_USERNAME=your-email@gmail.com
   EMAIL_PASSWORD=your-email-password
   EMAIL_FROM=noreply@aihashtag.com
   CLIENT_URL=http://localhost:3000
   ```
5. Start the development server:
   ```
   npm run dev
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify/:token` - Verify user email
- `POST /api/auth/forgot-password` - Send password reset email
- `POST /api/auth/reset-password/:token` - Reset password

### User

- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `PUT /api/user/password` - Update user password
- `PUT /api/user/notification-settings` - Update notification settings
- `GET /api/user/social-accounts` - Get user social accounts
- `POST /api/user/social-accounts` - Add social account
- `PUT /api/user/social-accounts/:id` - Update social account
- `DELETE /api/user/social-accounts/:id` - Delete social account
- `DELETE /api/user` - Delete user account

### Posts

- `GET /api/posts` - Get all posts for a user
- `GET /api/posts/:id` - Get post by ID
- `POST /api/posts` - Create a new post
- `PUT /api/posts/:id` - Update a post
- `DELETE /api/posts/:id` - Delete a post
- `GET /api/posts/performance/:id` - Get post performance
- `POST /api/posts/predict` - Predict post performance

### Hashtags

- `GET /api/hashtags` - Get hashtags with optional filtering
- `GET /api/hashtags/trending` - Get trending hashtags
- `GET /api/hashtags/categories` - Get all hashtag categories
- `GET /api/hashtags/:id` - Get hashtag by ID
- `GET /api/hashtags/text/:text` - Get hashtag by text
- `GET /api/hashtags/related/:id` - Get related hashtags
- `POST /api/hashtags/suggest` - Suggest hashtags based on content
- `POST /api/hashtags/optimize` - Optimize hashtag combination

### Analytics

- `GET /api/analytics/overview` - Get analytics overview
- `GET /api/analytics/hashtags` - Get hashtag performance analytics
- `GET /api/analytics/posts` - Get top performing posts
- `GET /api/analytics/audience` - Get audience analytics
- `GET /api/analytics/best-times` - Get best posting times

## Development

- Run tests:
  ```
  npm test
  ```
- Run linting:
  ```
  npm run lint
  ```

## Production

To build for production:

```
npm run build
```

To start the production server:

```
npm start
```

## License

MIT 
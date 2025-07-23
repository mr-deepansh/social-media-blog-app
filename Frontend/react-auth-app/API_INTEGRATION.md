# Backend API Integration Guide

## Overview

This React application includes a LinkedIn-style feed component that can integrate with a backend API. The app includes mock data fallback for development when the backend is not available.

## Required API Endpoints

Your backend should provide these endpoints:

### Posts
- `GET /api/posts?page=1&limit=10` - Get paginated posts
- `POST /api/posts` - Create new post
- `POST /api/posts/:id/like` - Toggle like on post
- `GET /api/posts/:id/comments` - Get comments for post
- `POST /api/posts/:id/comments` - Add comment to post

### Users
- `GET /api/users/profile` - Get current user profile
- `POST /api/users/:id/follow` - Toggle follow user

## Expected Data Structure

### Post Object
```json
{
  "id": "string|number",
  "author": {
    "id": "string",
    "name": "string",
    "avatar": "string (URL)",
    "followers": "string"
  },
  "content": "string",
  "createdAt": "ISO date string",
  "likes": "number",
  "isLiked": "boolean",
  "isFollowed": "boolean",
  "comments": [
    {
      "id": "string",
      "author": {
        "name": "string",
        "avatar": "string (URL)",
        "title": "string (optional)"
      },
      "text": "string",
      "createdAt": "ISO date string"
    }
  ]
}
```

### API Response Structure
```json
{
  "data": {
    "posts": [/* array of post objects */],
    "total": "number",
    "page": "number",
    "totalPages": "number"
  }
}
```

## Authentication

The API service includes an axios interceptor that automatically adds the JWT token from localStorage:

```javascript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## Environment Configuration

Set your backend API URL in the `.env` file:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_AUTH_ENABLED=true
```

## Mock Data Fallback

The application includes comprehensive mock data that will be used when the backend API is not available. This allows for:

- Development without backend dependency
- Testing UI components
- Demonstration purposes

The mock data includes:
- Sample posts with various content types
- User interactions (likes, follows)
- Comments and engagement
- Realistic timestamps and user data

## Integration Steps

1. **Set up your backend API** with the endpoints listed above
2. **Update the API URL** in the `.env` file
3. **Implement authentication** to store JWT tokens in localStorage
4. **Test the integration** - the app will automatically fall back to mock data if the API is unavailable

## Error Handling

The application includes comprehensive error handling:
- Network errors fall back to mock data
- User-friendly error messages
- Retry functionality
- Loading states

## Features Included

- ✅ LinkedIn-style feed UI
- ✅ Post creation
- ✅ Like/Unlike functionality
- ✅ Follow/Unfollow users
- ✅ Comments display
- ✅ Pagination with "Load More"
- ✅ Real-time timestamp formatting
- ✅ Responsive design
- ✅ Error handling with fallbacks
- ✅ Loading states
- ✅ Mock data for development

## Usage

The feed component is already integrated into the Dashboard. When users log in, they'll see:

1. A post creation interface
2. A feed of posts with LinkedIn-style design
3. Interactive elements (like, comment, follow)
4. Pagination for loading more content

The component automatically handles API failures gracefully by falling back to mock data, ensuring a smooth user experience during development.

## Profile API Integration

### Additional Profile Endpoints

#### User Profile
- `GET /api/users/:userId/profile` - Get user profile data
- `PUT /api/users/profile` - Update current user profile
- `POST /api/users/:userId/follow` - Toggle follow user
- `POST /api/users/profile/picture` - Upload profile picture

#### User Content
- `GET /api/users/:userId/threads?page=1` - Get user threads/posts
- `GET /api/users/:userId/replies?page=1` - Get user replies
- `GET /api/users/:userId/media?page=1` - Get user media posts
- `GET /api/users/:userId/reposts?page=1` - Get user reposts

### Profile Data Structure

```json
{
  "id": "string",
  "name": "string",
  "username": "string",
  "handle": "string",
  "bio": "string (multiline)",
  "profilePicture": "string (URL)",
  "isVerified": "boolean",
  "followersCount": "number",
  "followingCount": "number",
  "isFollowed": "boolean",
  "skills": ["string"],
  "skillsCount": "number",
  "followerAvatars": ["string (URLs)"],
  "profileUrl": "string",
  "socialLinks": {
    "linkedin": "string (URL)",
    "instagram": "string (URL)"
  }
}
```

### Profile Features

- ✅ Twitter/X-style dark theme design
- ✅ User profile display with bio, skills, and stats
- ✅ Follow/Unfollow functionality
- ✅ Content tabs (Threads, Replies, Media, Reposts, Feeds)
- ✅ Social media links integration
- ✅ Responsive design
- ✅ URL routing support (/profile/:userId)
- ✅ Mock data fallback for development
- ✅ Skills badges with color coding
- ✅ Follower avatars display
- ✅ Content timeline with engagement metrics

### Usage

The profile component is integrated into the main app with routing:

- `/profile` - Default profile view
- `/profile/:userId` - Specific user profile

Users can navigate to profiles through the navigation bar when authenticated.

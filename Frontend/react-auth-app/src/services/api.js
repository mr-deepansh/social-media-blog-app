import axios from 'axios';

// Configure your backend API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API endpoints
export const feedAPI = {
  // Get all posts for feed
  getPosts: (page = 1, limit = 10) => api.get(`/posts?page=${page}&limit=${limit}`),
  
  // Create new post
  createPost: (postData) => api.post('/posts', postData),
  
  // Like/Unlike post
  toggleLike: (postId) => api.post(`/posts/${postId}/like`),
  
  // Follow/Unfollow user
  toggleFollow: (userId) => api.post(`/users/${userId}/follow`),
  
  // Get comments for a post
  getComments: (postId) => api.get(`/posts/${postId}/comments`),
  
  // Add comment to post
  addComment: (postId, comment) => api.post(`/posts/${postId}/comments`, { text: comment }),
  
  // Get user profile
  getUserProfile: () => api.get('/users/profile'),
};

// Profile API endpoints
export const profileAPI = {
  // Get user profile
  getUserProfile: (userId) => api.get(`/users/${userId}/profile`),
  
  // Update profile
  updateProfile: (profileData) => api.put('/users/profile', profileData),
  
  // Follow/Unfollow user
  toggleFollow: (userId) => api.post(`/users/${userId}/follow`),
  
  // Get user's threads/posts
  getUserThreads: (userId, page = 1) => api.get(`/users/${userId}/threads?page=${page}`),
  
  // Get user's replies
  getUserReplies: (userId, page = 1) => api.get(`/users/${userId}/replies?page=${page}`),
  
  // Get user's media
  getUserMedia: (userId, page = 1) => api.get(`/users/${userId}/media?page=${page}`),
  
  // Get user's reposts
  getUserReposts: (userId, page = 1) => api.get(`/users/${userId}/reposts?page=${page}`),
  
  // Upload profile picture
  uploadProfilePicture: (file) => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    return api.post('/users/profile/picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

export default api;

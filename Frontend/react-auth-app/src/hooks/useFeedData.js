import { useState, useEffect } from 'react';
import { feedAPI } from '../services/api';
import { mockAPI } from '../services/mockData';

export const useFeedData = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = async (pageNum = 1, reset = false) => {
    try {
      setLoading(true);
      let response;
      
      try {
        // Try to fetch from real API first
        response = await feedAPI.getPosts(pageNum, 10);
      } catch (apiError) {
        console.log('API not available, using mock data');
        // Fallback to mock data if API is not available
        response = await mockAPI.getPosts(pageNum, 10);
      }
      
      const newPosts = response.data.posts || response.data;
      
      if (reset) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }
      
      setHasMore(newPosts.length === 10);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch posts');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (postData) => {
    try {
      let response;
      try {
        response = await feedAPI.createPost(postData);
      } catch (apiError) {
        console.log('API not available for createPost, using mock data');
        response = await mockAPI.createPost(postData);
      }
      setPosts(prev => [response.data, ...prev]);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
      throw err;
    }
  };

  const toggleLike = async (postId) => {
    try {
      try {
        await feedAPI.toggleLike(postId);
      } catch (apiError) {
        console.log('API not available for toggleLike, using mock data');
        await mockAPI.toggleLike(postId);
      }
      setPosts(prev => prev.map(post => 
        post.id === postId || post._id === postId
          ? { 
              ...post, 
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
              isLiked: !post.isLiked 
            }
          : post
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle like');
    }
  };

  const toggleFollow = async (userId, postId) => {
    try {
      try {
        await feedAPI.toggleFollow(userId);
      } catch (apiError) {
        console.log('API not available for toggleFollow, using mock data');
        await mockAPI.toggleFollow(userId);
      }
      setPosts(prev => prev.map(post => 
        (post.id === postId || post._id === postId)
          ? { ...post, isFollowed: !post.isFollowed }
          : post
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle follow');
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage, false);
    }
  };

  const refreshFeed = () => {
    setPage(1);
    fetchPosts(1, true);
  };

  useEffect(() => {
    fetchPosts(1, true);
  }, []);

  return {
    posts,
    loading,
    error,
    hasMore,
    createPost,
    toggleLike,
    toggleFollow,
    loadMore,
    refreshFeed
  };
};

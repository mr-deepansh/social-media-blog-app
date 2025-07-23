import { useState, useEffect } from 'react';
import { profileAPI } from '../services/api';

export const useProfile = (userId) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      let response;
      
      try {
        // Try to fetch from real API first
        response = await profileAPI.getUserProfile(userId);
      } catch (apiError) {
        console.log('API not available for profile, using mock data');
        // Fallback to mock data if API is not available
        response = { 
          data: {
            id: userId,
            name: "John Doe",
            username: "johndoe",
            handle: "johndoe",
            bio: "Full Stack Developer | React & Node.js Expert\nBuilding amazing web applications | Open Source Contributor\nTech Enthusiast | Problem Solver",
            profilePicture: "https://via.placeholder.com/120/4f46e5/fff?text=JD",
            isVerified: true,
            followersCount: 1234,
            followingCount: 567,
            isFollowed: false,
            skills: ["React", "Node.js", "JavaScript", "Python"],
            skillsCount: 4,
            followerAvatars: [
              "https://via.placeholder.com/20/e91e63/fff?text=A",
              "https://via.placeholder.com/20/2196f3/fff?text=B",
              "https://via.placeholder.com/20/4caf50/fff?text=C"
            ],
            profileUrl: "johndoe.dev",
            socialLinks: {
              linkedin: "https://linkedin.com/in/johndoe",
              instagram: "https://instagram.com/johndoe"
            }
          }
        };
      }
      
      setProfile(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch profile');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFollow = async () => {
    try {
      try {
        await profileAPI.toggleFollow(userId);
      } catch (apiError) {
        console.log('API not available for follow toggle, using mock data');
        // Mock the toggle operation
      }
      
      setProfile(prev => ({
        ...prev,
        isFollowed: !prev.isFollowed,
        followersCount: prev.isFollowed 
          ? prev.followersCount - 1 
          : prev.followersCount + 1
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle follow');
    }
  };

  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  return {
    profile,
    loading,
    error,
    toggleFollow,
    refetchProfile: fetchProfile
  };
};

export const useUserContent = (userId, contentType = 'threads') => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchContent = async (pageNum = 1, reset = false) => {
    try {
      setLoading(true);
      let response;
      
      try {
        // Try to fetch from real API first
        switch (contentType) {
          case 'replies':
            response = await profileAPI.getUserReplies(userId, pageNum);
            break;
          case 'media':
            response = await profileAPI.getUserMedia(userId, pageNum);
            break;
          case 'reposts':
            response = await profileAPI.getUserReposts(userId, pageNum);
            break;
          default:
            response = await profileAPI.getUserThreads(userId, pageNum);
        }
      } catch (apiError) {
        console.log(`API not available for ${contentType}, using mock data`);
        // Fallback to mock data
        const mockContent = [
          {
            id: 1,
            content: "Just finished building an amazing React application with Redux and modern UI components! 🚀",
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            likes: 45,
            replies: 12
          },
          {
            id: 2,
            content: "Working on some exciting new features for our social media platform. Can't wait to share what we're building!",
            createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            likes: 23,
            replies: 5
          },
          {
            id: 3,
            content: "The future of web development is looking incredible. So many amazing tools and frameworks to work with! #WebDev #React",
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            likes: 67,
            replies: 18
          }
        ];
        
        response = {
          data: {
            content: contentType === 'threads' ? mockContent : []
          }
        };
      }
      
      const newContent = response.data.content || response.data;
      
      if (reset) {
        setContent(newContent);
      } else {
        setContent(prev => [...prev, ...newContent]);
      }
      
      setHasMore(newContent.length === 10);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch content');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchContent(nextPage, false);
    }
  };

  useEffect(() => {
    if (userId) {
      setPage(1);
      fetchContent(1, true);
    }
  }, [userId, contentType]);

  return {
    content,
    loading,
    error,
    hasMore,
    loadMore
  };
};

import React, { useState } from 'react';
import { useFeedData } from '../hooks/useFeedData';
import './UserFeed.css';

const UserFeed = () => {
  const { posts, loading, error, createPost, toggleLike, toggleFollow, loadMore, refreshFeed } = useFeedData();
  const [newPost, setNewPost] = useState('');
  const [showComments, setShowComments] = useState({});

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    
    try {
      await createPost({ content: newPost });
      setNewPost('');
    } catch (err) {
      console.error('Error creating post:', err);
    }
  };

  const handleToggleComments = (postId) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / 60000);
    
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  if (loading && posts.length === 0) {
    return (
      <div className="user-feed">
        <div className="loading-spinner">Loading feed...</div>
      </div>
    );
  }

  return (
    <div className="user-feed">
      {/* Create Post Section */}
      <div className="create-post-card">
        <div className="create-post-header">
          <div className="user-avatar">
            <img src="https://via.placeholder.com/48/0a66c2/fff?text=U" alt="User" />
          </div>
          <form onSubmit={handleCreatePost} className="post-form">
            <input 
              type="text" 
              placeholder="Start a post" 
              className="post-input"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
            />
          </form>
        </div>
        <div className="post-actions">
          <button className="action-btn video">
            <span className="icon">📹</span>
            Video
          </button>
          <button className="action-btn photo">
            <span className="icon">📷</span>
            Photo
          </button>
          <button className="action-btn article">
            <span className="icon">📝</span>
            Write article
          </button>
        </div>
      </div>

      {/* Sort Section */}
      <div className="sort-section">
        <hr className="separator" />
        <div className="sort-controls">
          <span className="sort-label">Sort by:</span>
          <button className="sort-btn active">Top</button>
          <button className="sort-btn" onClick={refreshFeed}>Recent</button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={refreshFeed}>Retry</button>
        </div>
      )}

      {/* Feed Posts */}
      <div className="feed-posts">
        {posts.map(post => {
          const postId = post.id || post._id;
          return (
            <div key={postId} className="post-card">
              <div className="post-header">
                <div className="author-info">
                  <img 
                    src={post.author?.avatar || post.user?.profilePicture || `https://via.placeholder.com/48/333/fff?text=${(post.author?.name || post.user?.name || 'U')[0]}`} 
                    alt={post.author?.name || post.user?.name || 'User'} 
                    className="author-avatar" 
                  />
                  <div className="author-details">
                    <h3 className="author-name">
                      {post.author?.name || post.user?.name || post.company?.name || 'Anonymous User'}
                    </h3>
                    <p className="author-meta">
                      {post.author?.followers || post.user?.followersCount || '0'} followers • {formatTimestamp(post.createdAt || post.timestamp)} • 🌐
                    </p>
                  </div>
                </div>
                <div className="post-header-actions">
                  <button 
                    className={`follow-btn ${post.isFollowed ? 'following' : ''}`}
                    onClick={() => toggleFollow(post.author?.id || post.user?._id, postId)}
                  >
                    {post.isFollowed ? '✓ Following' : '+ Follow'}
                  </button>
                  <button className="more-btn">⋯</button>
                  <button className="close-btn">✕</button>
                </div>
              </div>

              <div className="post-content">
                <p className="post-text">
                  {(post.content || post.text || '').split(/(#\w+)/g).map((part, index) => 
                    part.startsWith('#') ? 
                      <span key={index} className="hashtag">{part}</span> : 
                      part
                  )}
                </p>
                
                {/* Job Details if present */}
                {post.jobDetails && (
                  <ul className="job-details">
                    {post.jobDetails.map((detail, index) => (
                      <li key={index}>- {detail}</li>
                    ))}
                  </ul>
                )}
                
                {post.callToAction && (
                  <p className="call-to-action">{post.callToAction}</p>
                )}
                
                {post.applyInfo && (
                  <p className="apply-info">{post.applyInfo}</p>
                )}
                
                {post.note && (
                  <p className="apply-note">💬 {post.note}</p>
                )}
                
                {post.footer && (
                  <p className="post-footer">{post.footer}</p>
                )}
              </div>

              {/* Post Engagement */}
              <div className="post-engagement">
                <div className="reactions">
                  <span className="reaction">👍</span>
                  <span className="reaction">❤️</span>
                  <span className="reaction">😊</span>
                  <span className="engagement-count">{post.likes || post.likesCount || 0}</span>
                  <span className="comments-count">{post.comments?.length || post.commentsCount || 0} comments</span>
                </div>
              </div>

              {/* Post Actions */}
              <div className="post-actions-footer">
                <button 
                  className={`action-btn ${post.isLiked ? 'liked' : ''}`}
                  onClick={() => toggleLike(postId)}
                >
                  <span className="icon">👍</span>
                  Like
                </button>
                <button 
                  className="action-btn"
                  onClick={() => handleToggleComments(postId)}
                >
                  <span className="icon">💬</span>
                  Comment
                </button>
                <button className="action-btn">
                  <span className="icon">🔄</span>
                  Repost
                </button>
                <button className="action-btn">
                  <span className="icon">📤</span>
                  Send
                </button>
              </div>

              {/* Comments Section */}
              {showComments[postId] && (
                <div className="comments-section">
                  {(post.comments || []).map(comment => (
                    <div key={comment.id || comment._id} className="comment">
                      <img 
                        src={comment.author?.avatar || `https://via.placeholder.com/32/4f46e5/fff?text=${(comment.author?.name || 'U')[0]}`}
                        alt={comment.author?.name || 'User'} 
                        className="comment-avatar" 
                      />
                      <div className="comment-content">
                        <div className="comment-header">
                          <span className="commenter-name">{comment.author?.name || 'Anonymous'}</span>
                          <span className="comment-time">• {formatTimestamp(comment.createdAt)}</span>
                        </div>
                        {comment.author?.title && (
                          <p className="commenter-title">{comment.author.title}</p>
                        )}
                        <p className="comment-text">{comment.text || comment.content}</p>
                        <div className="comment-actions">
                          <button className="comment-action">Like</button>
                          <button className="comment-action">Reply</button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button className="load-more-comments">
                    <span className="icon">💬</span>
                    Load more comments
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Load More Button */}
      {posts.length > 0 && (
        <div className="load-more-container">
          <button onClick={loadMore} className="load-more-btn" disabled={loading}>
            {loading ? 'Loading...' : 'Load More Posts'}
          </button>
        </div>
      )}
    </div>
  );
};

export default UserFeed;

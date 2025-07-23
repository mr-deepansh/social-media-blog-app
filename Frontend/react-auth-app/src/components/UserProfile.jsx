import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProfile, useUserContent } from '../hooks/useProfile';
import { Linkedin, Instagram, MoreHorizontal } from 'lucide-react';
import './UserProfile.css';

const UserProfile = ({ userId: propUserId }) => {
  const { userId: paramUserId } = useParams();
  const userId = propUserId || paramUserId || 'johndoe';
  const { profile, loading, error, toggleFollow } = useProfile(userId);
  const [activeTab, setActiveTab] = useState('threads');
  const { content, loading: contentLoading } = useUserContent(userId, activeTab);

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-spinner">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-container">
        <div className="error-message">Profile not found</div>
      </div>
    );
  }

  const renderSkillBadge = (skill, color) => (
    <span key={skill} className={`skill-badge ${color}`}>
      {skill}
    </span>
  );

  const tabs = [
    { id: 'threads', label: 'Threads' },
    { id: 'replies', label: 'Replies' },
    { id: 'media', label: 'Media' },
    { id: 'reposts', label: 'Reposts' },
    { id: 'feeds', label: 'Feeds' }
  ];

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-main">
          <div className="profile-info">
            <div className="name-section">
              <h1 className="profile-name">
                {profile.name || profile.username} 
                {profile.isVerified && <span className="verified-badge">●</span>}
              </h1>
              <p className="profile-handle">@{profile.handle || profile.username}</p>
            </div>
            
            <div className="profile-avatar">
              <img 
                src={profile.profilePicture || profile.avatar || 'https://via.placeholder.com/120/333/fff?text=Profile'} 
                alt={profile.name || profile.username}
                className="avatar-image"
              />
            </div>
          </div>

          <div className="profile-description">
            {profile.bio && profile.bio.split('\n').map((line, index) => {
              if (line.includes('|')) {
                return (
                  <div key={index} className="bio-line">
                    {line.split('|').map((part, partIndex) => (
                      <span key={partIndex}>
                        {part.trim()}
                        {partIndex < line.split('|').length - 1 && <span className="separator"> | </span>}
                      </span>
                    ))}
                  </div>
                );
              }
              return <p key={index} className="bio-line">{line}</p>;
            })}
          </div>

          <div className="skills-section">
            {profile.skills && profile.skills.map((skill, index) => {
              const colors = ['developers', 'exam', 'web', 'more'];
              return renderSkillBadge(skill, colors[index % colors.length]);
            })}
            {profile.skillsCount > 3 && (
              <span className="skill-badge more">+ {profile.skillsCount - 3}</span>
            )}
          </div>

          <div className="profile-stats">
            <div className="followers-section">
              {profile.followerAvatars && profile.followerAvatars.map((avatar, index) => (
                <img 
                  key={index}
                  src={avatar} 
                  alt={`Follower ${index + 1}`}
                  className="follower-avatar"
                />
              ))}
              <span className="followers-count">
                {profile.followersCount || 0} followers
              </span>
              {profile.profileUrl && (
                <span className="profile-url">
                  • {profile.profileUrl}
                </span>
              )}
            </div>
          </div>

          <div className="social-links">
            {profile.socialLinks?.linkedin && (
              <a href={profile.socialLinks.linkedin} className="social-link">
                <Linkedin size={24} />
              </a>
            )}
            {profile.socialLinks?.instagram && (
              <a href={profile.socialLinks.instagram} className="social-link">
                <Instagram size={24} />
              </a>
            )}
          </div>
        </div>

        <div className="profile-actions">
          <button 
            className={`follow-profile-btn ${profile.isFollowed ? 'following' : ''}`}
            onClick={toggleFollow}
          >
            {profile.isFollowed ? 'Following' : 'Follow'}
          </button>
        </div>
      </div>

      <div className="profile-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="profile-content">
        {contentLoading ? (
          <div className="content-loading">Loading {activeTab}...</div>
        ) : content.length > 0 ? (
          <div className="content-list">
            {content.map((item, index) => (
              <div key={item.id || index} className="content-item">
                <p>{item.content || item.text || 'No content available'}</p>
                <div className="content-meta">
                  <span className="content-date">
                    {new Date(item.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                  {item.likes && (
                    <span className="content-likes">• {item.likes} likes</span>
                  )}
                  {item.replies && (
                    <span className="content-replies">• {item.replies} replies</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-content">
            <p>No {activeTab} yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;

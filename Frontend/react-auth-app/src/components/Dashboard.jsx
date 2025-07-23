import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import UserFeed from './UserFeed';

const Dashboard = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <div className="welcome-header">
          <h1>Welcome back, {user?.name}!</h1>
          <p>Stay connected with your professional network</p>
        </div>
        <UserFeed />
      </div>
    </div>
  );
};

export default Dashboard;

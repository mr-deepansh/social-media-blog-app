import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';

const Navigation = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <NavLink to="/" className="brand-link">
          AuthApp
        </NavLink>
      </div>
      
      <div className="nav-links">
        {!isAuthenticated ? (
          <>
            <NavLink 
              to="/login" 
              className={({ isActive }) => 
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              Login
            </NavLink>
            <NavLink 
              to="/register" 
              className={({ isActive }) => 
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              Register
            </NavLink>
          </>
        ) : (
          <>
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => 
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              Dashboard
            </NavLink>
            <NavLink 
              to="/profile" 
              className={({ isActive }) => 
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              Profile
            </NavLink>
            <span className="user-welcome">Welcome, {user?.name}</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navigation;

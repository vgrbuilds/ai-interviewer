import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from 'antd';
import { authService } from '../services/auth-service';

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  return (
    <nav className="flex justify-between items-center px-8 py-4 border-b border-gray-200 bg-white shadow-sm mb-6">
      <div className="flex items-center space-x-6">
        <Link to="/home" className="text-2xl font-bold text-indigo-600 tracking-tight">
          Interview.AI
        </Link>
        <div className="flex space-x-4">
          <Link
            to="/home"
            className={`text-sm font-medium ${
              location.pathname === '/home' ? 'text-indigo-600 font-semibold' : 'text-gray-600 hover:text-indigo-600'
            }`}
          >
            Home
          </Link>
          <Link
            to="/jobs"
            className={`text-sm font-medium ${
              location.pathname === '/jobs' ? 'text-indigo-600 font-semibold' : 'text-gray-600 hover:text-indigo-600'
            }`}
          >
            Jobs & Practice
          </Link>
          <Link
            to="/history"
            className={`text-sm font-medium ${
              location.pathname === '/history' ? 'text-indigo-600 font-semibold' : 'text-gray-600 hover:text-indigo-600'
            }`}
          >
            Interview History
          </Link>
          <Link
            to="/profile"
            className={`text-sm font-medium ${
              location.pathname === '/profile' ? 'text-indigo-600 font-semibold' : 'text-gray-600 hover:text-indigo-600'
            }`}
          >
            Candidate Profile
          </Link>
        </div>
      </div>
      <div>
        <Button onClick={handleLogout} danger type="outlined">
          Logout
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;

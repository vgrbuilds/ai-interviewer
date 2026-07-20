import React from 'react';
import AuthComponent from '../components/AuthComponent';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col justify-center items-center px-4 py-12 text-center">
      <div className="mb-8 space-y-2">
        <h1 className="text-5xl font-extrabold text-indigo-700 tracking-tight">
          interview.ai
        </h1>
        <p className="text-lg text-gray-600 max-w-md mx-auto">
          AI-Powered Technical & Behavioral Interview Practice Platform
        </p>
      </div>

      <AuthComponent />
    </div>
  );
};

export default LandingPage;
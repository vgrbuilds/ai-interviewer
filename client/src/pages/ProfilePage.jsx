import React from 'react';
import Navbar from '../components/Navbar';
import CandidateComponent from '../components/CandidateComponent';

export const ProfilePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="px-4">
        <CandidateComponent />
      </main>
    </div>
  );
};

export default ProfilePage;

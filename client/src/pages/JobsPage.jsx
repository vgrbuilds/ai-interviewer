import React from 'react';
import Navbar from '../components/Navbar';
import JobComponent from '../components/JobComponent';

export const JobsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="px-4">
        <JobComponent />
      </main>
    </div>
  );
};

export default JobsPage;
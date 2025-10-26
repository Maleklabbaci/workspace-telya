import React from 'react';
// FIX: Correct import for react-router-dom Outlet component.
import { Outlet } from 'react-router-dom';
import ClientHeader from './ClientHeader';

const ClientLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <ClientHeader />
      <main className="p-4 sm:p-6 md:p-10">
        <Outlet />
      </main>
    </div>
  );
};

export default ClientLayout;

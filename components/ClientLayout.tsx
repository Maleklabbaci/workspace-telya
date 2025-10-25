import React from 'react';
import { Outlet } from 'react-router-dom';
import ClientHeader from './ClientHeader';

const ClientLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <ClientHeader />
      <main className="p-6 md:p-10">
        <Outlet />
      </main>
    </div>
  );
};

export default ClientLayout;
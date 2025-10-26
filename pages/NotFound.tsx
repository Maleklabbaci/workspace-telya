import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background text-center">
      <h1 className="text-9xl font-black text-primary">404</h1>
      <p className="text-2xl md:text-3xl font-bold text-foreground mt-4">Page non trouvée</p>
      <p className="text-muted-foreground mt-2 mb-8">
        Désolé, la page que vous recherchez n'existe pas.
      </p>
      <Link to="/dashboard">
        <Button>Aller au tableau de bord</Button>
      </Link>
    </div>
  );
};

export default NotFound;
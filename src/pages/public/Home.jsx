import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

const Home = () => {
  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>Benvenuto in Task Manager Pro</h1>
        <p>La soluzione completa per la gestione delle attività</p>
        <Link to={ROUTES.LOGIN} className="btn btn-primary btn-lg">Accedi al Sistema</Link>
      </div>
    </div>
  );
};

export default Home;
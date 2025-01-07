import React from 'react';
import { Routes as RouterRoutes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Bot from './pages/Bot';

const Routes = () => {
  return (
    <RouterRoutes>
      <Route path="/" element={<Home />} />
      <Route path="/bot" element={<Bot />} />
      <Route path="/about" element={<div>Página Sobre Nosotros en construcción</div>} />
    </RouterRoutes>
  );
};

export default Routes; 
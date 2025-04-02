import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ element, ...rest }) => {
  const isAuthenticated = localStorage.getItem('authToken');  // Pas dit aan volgens je authenticatiecheck

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
}

  return element;
};

export default PrivateRoute;

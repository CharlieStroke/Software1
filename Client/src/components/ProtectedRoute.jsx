import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AccessDenied from '../shared/AccessDenied';

const ProtectedRoute = ({ children, allowedRoles = [], attemptedSection = '' }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;

  // Si se especificaron roles permitidos y el rol del usuario no está incluido
  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    const userRole = user.rol || user.role || '';
    if (!allowedRoles.includes(userRole)) {
      console.warn('[ProtectedRoute] Acceso denegado. user:', user, 'allowedRoles:', allowedRoles, 'attemptedSection:', attemptedSection);
      // Mostrar también en consola del navegador
      // eslint-disable-next-line no-console
      console.log('[ProtectedRoute] user role:', userRole);
      return <AccessDenied userRole={userRole} attemptedSection={attemptedSection} />;
    }
  }

  return children;
};

export default ProtectedRoute;

import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import DetalleComanda from './components/comandas/components/DetalleComanda';
import ProtectedRoute from './components/ProtectedRoute';

import './App.css';
import { AuthProvider } from './context/AuthContext';
function App() {

  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/comandas" element={<ProtectedRoute allowedRoles={["admin","cocinero","mesero","dueño"]}><Dashboard /></ProtectedRoute>} />
          <Route path="/comandas/detalle/:id" element={<ProtectedRoute allowedRoles={["cocinero","admin"]} attemptedSection={"detalle comanda"}><DetalleComanda /></ProtectedRoute>} />
          <Route path="/inventario" element={<ProtectedRoute allowedRoles={["admin","gerente","dueño","cajero"]}><Dashboard /></ProtectedRoute>} />
          <Route path="/pedidos" element={<ProtectedRoute allowedRoles={["admin","mesero","cajero","dueño"]}><Dashboard /></ProtectedRoute>} />
          <Route path="/usuarios" element={<ProtectedRoute allowedRoles={["admin"]}><Dashboard /></ProtectedRoute>} />
          <Route path="/meseros" element={<ProtectedRoute allowedRoles={["admin","gerente","dueño"]}><Dashboard /></ProtectedRoute>} />
          <Route path="/sucursal" element={<ProtectedRoute allowedRoles={["admin","gerente","dueño"]}><Dashboard /></ProtectedRoute>} />
          <Route path="/metricas" element={<ProtectedRoute allowedRoles={["admin","dueño"]}><Dashboard /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App

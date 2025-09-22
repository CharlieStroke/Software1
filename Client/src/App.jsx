import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import DetalleComanda from './components/comandas/components/DetalleComanda';

import './App.css';
function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/comandas" element={<Dashboard />} />
        <Route path="/comandas/detalle/:id" element={<DetalleComanda />} />
        <Route path="/inventario" element={<Dashboard />} />
        <Route path="/pedidos" element={<Dashboard />} />
        <Route path="/usuarios" element={<Dashboard />} />
        <Route path="/dueños" element={<Dashboard />} />
        <Route path="/sucursal" element={<Dashboard />} />
      </Routes>
    </Router>
  )
}

export default App

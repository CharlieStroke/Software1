import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';

import './App.css';
function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/comandas" element={<Dashboard />} />
        <Route path="/inventario" element={<Dashboard />} />
        <Route path="/mesas" element={<Dashboard />} />
        <Route path="/usuarios" element={<Dashboard />} />
      </Routes>
    </Router>
  )
}

export default App

import React, { useState } from 'react';
import '../sharedCss/NavBar.css';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NavBar() {
    const { user, logout } = useAuth();
    const userRole = user?.rol || user?.role || null;
    const [menuAbierto, setMenuAbierto] = useState(false);

    // Definir qué enlaces puede ver cada rol
    const permisosPorRol = {
        'admin': ['pedidos', 'comandas', 'inventario', 'usuarios', 'meseros', 'sucursal', 'metricas'],
        'dueño': ['pedidos', 'comandas', 'inventario', 'meseros', 'metricas'],
        'gerente': ['pedidos', 'comandas', 'inventario'],
        'mesero': ['pedidos', 'comandas'],
        'cocinero': [],
        'cajero': []
    };

    const puedeVer = (seccion) => {
        if (!userRole) return false;
        return permisosPorRol[userRole]?.includes(seccion) || false;
    };

    const handleLogout = () => {
        logout();
    };

    const toggleMenu = () => {
        setMenuAbierto(!menuAbierto);
    };

    const cerrarMenu = () => {
        setMenuAbierto(false);
    };

    return (
        <>
            <nav className="navbar">
                <button className="menu-hamburguesa" onClick={toggleMenu} aria-label="Toggle menu">
                    <span className={menuAbierto ? 'hamburguesa-icon abierto' : 'hamburguesa-icon'}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </span>
                </button>
                <ul className={`navbar-list ${menuAbierto ? 'menu-abierto' : ''}`}>
                    {puedeVer('pedidos') && (
                        <li>
                            <NavLink to="/pedidos" className={({ isActive }) => isActive ? 'active' : ''} onClick={cerrarMenu}>
                                Pedidos
                            </NavLink>
                        </li>
                    )}
                    {puedeVer('comandas') && (
                        <li>
                            <NavLink to="/comandas" className={({ isActive }) => isActive ? 'active' : ''} onClick={cerrarMenu}>
                                Comandas
                            </NavLink>
                        </li>
                    )}
                    {puedeVer('inventario') && (
                        <li>
                            <NavLink to="/inventario" className={({ isActive }) => isActive ? 'active' : ''} onClick={cerrarMenu}>
                                Inventario
                            </NavLink>
                        </li>
                    )}
                    {puedeVer('meseros') && (
                        <li>
                            <NavLink to="/meseros" className={({ isActive }) => isActive ? 'active' : ''} onClick={cerrarMenu}>
                                Meseros
                            </NavLink>
                        </li>
                    )}
                    {puedeVer('usuarios') && (
                        <li>
                            <NavLink to="/usuarios" className={({ isActive }) => isActive ? 'active' : ''} onClick={cerrarMenu}>
                                Usuarios
                            </NavLink>
                        </li>
                    )}
                    {puedeVer('sucursal') && (
                        <li>
                            <NavLink to="/sucursal" className={({ isActive }) => isActive ? 'active' : ''} onClick={cerrarMenu}>
                                Sucursal
                            </NavLink>
                        </li>
                    )}
                    {puedeVer('metricas') && (
                        <li>
                            <NavLink to="/metricas" className={({ isActive }) => isActive ? 'active' : ''} onClick={cerrarMenu}>
                                Métricas
                            </NavLink>
                        </li>
                    )}
                    <li>
                        <button onClick={() => { handleLogout(); cerrarMenu(); }} className="logout-button">
                            Cerrar Sesión
                        </button>
                    </li>
                </ul>
            </nav>
        </>
    );
}
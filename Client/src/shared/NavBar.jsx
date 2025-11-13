import React from 'react';
import '../sharedCss/NavBar.css';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NavBar() {
    const { user, logout } = useAuth();
    const userRole = user?.rol || user?.role || null;

    // Definir qué enlaces puede ver cada rol
    const permisosPorRol = {
        'mesero': ['pedidos', 'comandas'],
        'dueño': ['pedidos', 'comandas', 'inventario', 'usuarios'],
        'admin': ['pedidos', 'comandas', 'inventario', 'usuarios', 'dueños', 'sucursal']
    };

    const puedeVer = (seccion) => {
        return permisosPorRol[userRole]?.includes(seccion) || false;
    };

    const handleLogout = () => {
        logout();
    };

    return (
        <>
            <nav className="navbar">
                <ul className="navbar-list">
                    {puedeVer('pedidos') && (
                        <li>
                            <NavLink to="/pedidos" className={({ isActive }) => isActive ? 'active' : ''}>
                                Pedidos
                            </NavLink>
                        </li>
                    )}
                    {puedeVer('comandas') && (
                        <li>
                            <NavLink to="/comandas" className={({ isActive }) => isActive ? 'active' : ''}>
                                Comandas
                            </NavLink>
                        </li>
                    )}
                    {puedeVer('inventario') && (
                        <li>
                            <NavLink to="/inventario" className={({ isActive }) => isActive ? 'active' : ''}>
                                Inventario
                            </NavLink>
                        </li>
                    )}
                    {puedeVer('usuarios') && (
                        <li>
                            <NavLink to="/usuarios" className={({ isActive }) => isActive ? 'active' : ''}>
                                Usuarios
                            </NavLink>
                        </li>
                    )}
                    {puedeVer('dueños') && (
                        <li>
                            <NavLink to="/dueños" className={({ isActive }) => isActive ? 'active' : ''}>
                                Dueños
                            </NavLink>
                        </li>
                    )}
                    {puedeVer('sucursal') && (
                        <li>
                            <NavLink to="/sucursal" className={({ isActive }) => isActive ? 'active' : ''}>
                                Sucursal
                            </NavLink>
                        </li>
                    )}
                    <li>
                        <button onClick={handleLogout} className="logout-button">
                            Cerrar Sesión
                        </button>
                    </li>
                </ul>
            </nav>
        </>
    );
}
import React from 'react';
import '../sharedCss/WelcomeView.css';

const WelcomeView = ({ userRole }) => {
    const getRoleInfo = () => {
        switch(userRole) {
            case 'mesero':
                return {
                    title: 'Bienvenido, Mesero',
                    description: 'Como mesero puedes acceder a:',
                    permissions: ['Pedidos - Tomar y gestionar pedidos', 'Comandas - Ver órdenes de cocina']
                };
            case 'dueño':
                return {
                    title: 'Bienvenido, Dueño',
                    description: 'Como dueño puedes acceder a:',
                    permissions: [
                        'Pedidos - Gestión de pedidos',
                        'Comandas - Supervisión de cocina',
                        'Inventario - Control de productos y stock',
                        'Usuarios - Gestión de empleados'
                    ]
                };
            case 'admin':
                return {
                    title: 'Bienvenido, Administrador',
                    description: 'Como administrador tienes acceso completo a:',
                    permissions: [
                        'Pedidos - Gestión completa de pedidos',
                        'Comandas - Supervisión total de cocina',
                        'Inventario - Control total de productos',
                        'Usuarios - Gestión completa de empleados',
                        'Dueños - Gestión de propietarios',
                        'Sucursal - Gestión de sucursales'
                    ]
                };
            default:
                return {
                    title: 'Bienvenido al Sistema',
                    description: 'Sistema de Gestión de Restaurantes',
                    permissions: []
                };
        }
    };

    const roleInfo = getRoleInfo();

    return (
        <div className="welcome-container">
            <div className="welcome-header">
                <h1 className="welcome-title">{roleInfo.title}</h1>
                <div className="welcome-subtitle">
                    <span className="system-name">Carrizos Bar - Sistema de Gestión</span>
                </div>
            </div>
            
            {(userRole === 'dueño' || userRole === 'admin') && (
                <div className="welcome-content">
                    <div className="stats-section">
                        <h3>Resumen del Sistema</h3>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <h4>Pedidos Hoy</h4>
                                <p className="stat-number">45</p>
                            </div>
                            <div className="stat-card">
                                <h4>Comandas Activas</h4>
                                <p className="stat-number">12</p>
                            </div>
                            <div className="stat-card">
                                <h4>Productos</h4>
                                <p className="stat-number">128</p>
                            </div>
                            <div className="stat-card">
                                <h4>Usuarios</h4>
                                <p className="stat-number">8</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WelcomeView;
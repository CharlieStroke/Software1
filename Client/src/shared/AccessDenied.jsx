import React from 'react';
import '../sharedCss/AccessDenied.css';

const AccessDenied = ({ userRole, attemptedSection }) => {
    const getRolePermissions = () => {
        switch(userRole) {
            case 'mesero':
                return ['Pedidos', 'Comandas'];
            case 'dueño':
                return ['Pedidos', 'Comandas', 'Inventario', 'Usuarios'];
            case 'admin':
                return ['Pedidos', 'Comandas', 'Inventario', 'Usuarios', 'Dueños', 'Sucursal'];
            default:
                return [];
        }
    };

    const allowedSections = getRolePermissions();

    return (
        <div className="access-denied-container">
            <div className="access-denied-content">
                
                <h2 className="access-denied-title">Acceso Denegado</h2>
                
                <div className="access-denied-message">
                    <p>No tienes permisos para acceder a esta sección.</p>
                    {attemptedSection && (
                        <p className="attempted-section">
                            Sección solicitada: <strong>{attemptedSection}</strong>
                        </p>
                    )}
                </div>
                
                <div className="role-info">
                    <h3>Información de tu Rol</h3>
                    <div className="current-role">
                        <span className="role-label">Rol actual:</span>
                        <span className="role-value">{userRole}</span>
                    </div>
                </div>
                
                <div className="allowed-sections">
                    <h4>Secciones permitidas para tu rol:</h4>
                    <ul className="permissions-list">
                        {allowedSections.map((section, index) => (
                            <li key={index} className="permission-item">
                                <span className="permission-icon">✔</span>
                                {section}
                            </li>
                        ))}
                    </ul>
                </div>
                
                <div className="access-denied-actions">
                    <button 
                        className="back-button"
                        onClick={() => window.history.back()}
                    >
                        Volver Atrás
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccessDenied;
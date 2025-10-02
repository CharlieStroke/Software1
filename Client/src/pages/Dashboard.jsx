import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

import NavBar from '../shared/NavBar';
import WelcomeView from '../shared/WelcomeView';
import AccessDenied from '../shared/AccessDenied';
import Comandas from '../components/comandas/components/comandas';
import DetalleComanda from '../components/comandas/components/DetalleComanda';
import Inventario from '../components/inventario/components/inventario';
import Pedidos from '../components/pedidos/components/pedidos';
import Usuarios from '../components/usuarios/components/usuarios';
import Dueños from '../components/dueños/components/dueños';
import Sucursal from '../components/sucursal/components/sucursal';

import '../pagesCss/Dashboard.css';

const Dashboard = () => {
    const location = useLocation();
    const [vistaActual, setVistaActual] = useState('resumen');
    const [userRole, setUserRole] = useState(null);

    // Obtener el rol del usuario guardado en localStorage para usarlo en la verificación de permisos
    React.useEffect(() => {
        const role = localStorage.getItem('userRole');
        setUserRole(role);
    }, []);

	// Detectar la vista actual basada en la URL
	React.useEffect(() => {
		const path = location.pathname;
		if (path.includes('/comandas/detalle/')) setVistaActual('detalle-comanda');
		else if (path.includes('/comandas')) setVistaActual('comandas');
		else if (path.includes('/inventario')) setVistaActual('inventario');
		else if (path.includes('/pedidos')) setVistaActual('pedidos');
		else if (path.includes('/usuarios')) setVistaActual('usuarios');
		else if (path.includes('/dueños')) setVistaActual('dueños');
		else if (path.includes('/sucursal')) setVistaActual('sucursal');
		else setVistaActual('resumen');
	}, [location]);

    // Verificar si el usuario tiene permisos para ver una vista específica
    const tienePermisos = (vista) => {
        if (!userRole) return false;
        
        // Permitir siempre el acceso a la vista de resumen/bienvenida
        if (vista === 'resumen') return true;
        
        const permisosPorRol = {
            'mesero': ['pedidos', 'comandas', 'detalle-comanda'],
            'dueño': ['pedidos', 'comandas', 'detalle-comanda', 'inventario', 'usuarios'],
            'admin': ['pedidos', 'comandas', 'detalle-comanda', 'inventario', 'usuarios', 'dueños', 'sucursal']
        };
        
        return permisosPorRol[userRole]?.includes(vista) || false;
    };

	const renderContenido = () => {
        // Si no tiene permisos para la vista actual, mostrar acceso denegado
        if (!tienePermisos(vistaActual)) {
            return (
                <AccessDenied 
                    userRole={userRole} 
                    attemptedSection={vistaActual}
                />
            );
        }

		switch(vistaActual) {
			case 'comandas':
				return <Comandas />;
			case 'detalle-comanda':
				return <DetalleComanda />;
			case 'inventario':
				return <Inventario />;
			case 'pedidos':
				return <Pedidos />;
			case 'usuarios':
				return <Usuarios />;
			case 'dueños':
				return <Dueños />;
			case 'sucursal':
				return <Sucursal />;
            default:
                return <WelcomeView userRole={userRole} />;
		}
	};

    return (
        <div className="dashboard-container">
            <NavBar />
            {renderContenido()}
        </div>
    );
};

export default Dashboard;

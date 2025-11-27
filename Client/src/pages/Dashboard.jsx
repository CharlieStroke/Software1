import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import NavBar from '../shared/NavBar';
import WelcomeView from '../shared/WelcomeView';
import AccessDenied from '../shared/AccessDenied';
import Comandas from '../components/comandas/components/comandas';
import Inventario from '../components/inventario/components/inventario';
import Pedidos from '../components/pedidos/components/pedidos';
import Usuarios from '../components/usuarios/components/usuarios';
import Meseros from '../components/meseros/components/meseros';
import Sucursal from '../components/sucursal/components/sucursal';
import Metricas from '../components/dueños/components/metricas';

import '../pagesCss/Dashboard.css';

const Dashboard = () => {
    const location = useLocation();
    const [vistaActual, setVistaActual] = useState('resumen');
    const { user } = useAuth();
    
    // Obtener el rol del usuario desde el contexto de autenticación
    const userRole = user?.rol || user?.role || null;

	// Detectar la vista actual basada en la URL
	React.useEffect(() => {
		const path = location.pathname;
		if (path.includes('/comandas')) setVistaActual('comandas');
		else if (path.includes('/inventario')) setVistaActual('inventario');
		else if (path.includes('/pedidos')) setVistaActual('pedidos');
		else if (path.includes('/usuarios')) setVistaActual('usuarios');
		else if (path.includes('/meseros')) setVistaActual('meseros');
		else if (path.includes('/sucursal')) setVistaActual('sucursal');
		else if (path.includes('/metricas')) setVistaActual('metricas');
		else setVistaActual('resumen');
	}, [location]);

    // Verificar si el usuario tiene permisos para ver una vista específica
    const tienePermisos = (vista) => {
        if (!userRole) return false;
        
        // Permitir siempre el acceso a la vista de resumen/bienvenida
        if (vista === 'resumen') return true;
        
        const permisosPorRol = {
            'mesero': ['pedidos', 'comandas'],
            'dueño': ['pedidos', 'comandas', 'inventario', 'usuarios', 'meseros', 'sucursal', 'metricas'],
            'gerente': ['pedidos', 'comandas', 'inventario', 'meseros'],
            'admin': ['pedidos', 'comandas', 'inventario', 'usuarios', 'meseros', 'sucursal', 'metricas']
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
			case 'inventario':
				return <Inventario />;
			case 'pedidos':
				return <Pedidos />;
			case 'usuarios':
				return <Usuarios />;
			case 'meseros':
				return <Meseros />;
			case 'sucursal':
				return <Sucursal />;
			case 'metricas':
				return <Metricas />;
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

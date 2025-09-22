import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import NavBar from '../shared/NavBar';
import Comandas from '../components/comandas/components/comandas';
import Inventario from '../components/inventario/components/inventario';
import Pedidos from '../components/pedidos/components/pedidos';
import Usuarios from '../components/usuarios/components/usuarios';
import Dueños from '../components/dueños/components/dueños';
import Sucursal from '../components/sucursal/components/sucursal';
import '../pagesCss/Dashboard.css';

const Dashboard = () => {
	const location = useLocation();
	const [vistaActual, setVistaActual] = useState('resumen');

	// Detectar la vista actual basada en la URL
	React.useEffect(() => {
		const path = location.pathname;
		if (path.includes('/comandas')) setVistaActual('comandas');
		else if (path.includes('/inventario')) setVistaActual('inventario');
		else if (path.includes('/pedidos')) setVistaActual('pedidos');
		else if (path.includes('/usuarios')) setVistaActual('usuarios');
		else if (path.includes('/dueños')) setVistaActual('dueños');
		else if (path.includes('/sucursal')) setVistaActual('sucursal');
		else setVistaActual('resumen');
	}, [location]);

	const renderContenido = () => {
		switch(vistaActual) {
			case 'comandas':
				return <Comandas />;
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

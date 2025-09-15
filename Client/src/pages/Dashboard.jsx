import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import NavBar from '../shared/NavBar';
import Comandas from '../components/comandas/components/comandas';
import Inventario from '../components/inventario/components/inventario';
import Mesas from '../components/mesas/components/mesas';
import Usuarios from '../components/usuarios/components/usuarios';
import '../pagesCss/Dashboard.css';

const Dashboard = () => {
	const location = useLocation();
	const [vistaActual, setVistaActual] = useState('resumen');

	// Detectar la vista actual basada en la URL
	React.useEffect(() => {
		const path = location.pathname;
		if (path.includes('/comandas')) setVistaActual('comandas');
		else if (path.includes('/inventario')) setVistaActual('inventario');
		else if (path.includes('/mesas')) setVistaActual('mesas');
		else if (path.includes('/usuarios')) setVistaActual('usuarios');
		else setVistaActual('resumen');
	}, [location]);

	const renderContenido = () => {
		switch(vistaActual) {
			case 'comandas':
				return <Comandas />;
			case 'inventario':
				return <Inventario />;
			case 'mesas':
				return <Mesas />;
			case 'usuarios':
				return <Usuarios />;
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

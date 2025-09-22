//import PedidoForm from '../components/pedidos/components/PedidoForm';
import '../sharedCss/NavBar.css';
import { NavLink } from 'react-router-dom';

export default function NavBar() {
    return (
        <>
            <nav className="navbar">
                <ul className="navbar-list">
                    <li>
                        <NavLink to="/comandas" className={({ isActive }) => isActive ? 'active' : ''}>
                            Comandas
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/inventario" className={({ isActive }) => isActive ? 'active' : ''}>
                            Inventario
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/pedidos" className={({ isActive }) => isActive ? 'active' : ''}>
                            Pedidos
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/usuarios" className={({ isActive }) => isActive ? 'active' : ''}>
                            Usuarios
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/dueños" className={({ isActive }) => isActive ? 'active' : ''}>
                            Dueños
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/sucursal" className={({ isActive }) => isActive ? 'active' : ''}>
                            Sucursal
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
                            Cerrar Sesión
                        </NavLink>
                    </li>
                </ul>
            </nav>
        </>
    );
}
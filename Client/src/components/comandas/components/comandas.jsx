import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../componentsCss/comandas.css';

const Comandas = () => {
    const navigate = useNavigate();

    const [comandas, setComandasList] = useState([
        {
            id: 1,
            mesa: 5,
            nombrePedido: 'Pedido Juan Pérez',
            productos: [
                { nombre: 'Pizza Margherita', cantidad: 1, precio: 15.00 },
                { nombre: 'Coca Cola', cantidad: 1, precio: 2.50 }
            ],
            total: 17.50,
            estado: 'pendiente'
        },
        {
            id: 2,
            mesa: 3,
            nombrePedido: 'Pedido María García',
            productos: [
                { nombre: 'Hamburguesa', cantidad: 1, precio: 8.50 },
                { nombre: 'Papas fritas', cantidad: 1, precio: 3.50 }
            ],
            total: 12.00,
            estado: 'en-preparacion'
        },
        {
            id: 3,
            mesa: 8,
            nombrePedido: 'Pedido Carlos López',
            productos: [
                { nombre: 'Ensalada César', cantidad: 1, precio: 7.00 },
                { nombre: 'Agua', cantidad: 1, precio: 2.00 }
            ],
            total: 9.00,
            estado: 'listo'
        }
    ]);

    // Estados para el modal de nueva comanda
    const [modalNuevaComanda, setModalNuevaComanda] = useState(false);
    const [nuevaComanda, setNuevaComanda] = useState({
        mesa: '',
        cliente: '',
        items: [''],
        total: ''
    });

    // Productos disponibles para la comanda
    const productosDisponibles = [
        { nombre: 'Pizza Margherita', precio: 15.00 },
        { nombre: 'Pizza Pepperoni', precio: 17.00 },
        { nombre: 'Hamburguesa', precio: 8.50 },
        { nombre: 'Papas fritas', precio: 3.50 },
        { nombre: 'Ensalada César', precio: 7.00 },
        { nombre: 'Coca Cola', precio: 2.50 },
        { nombre: 'Agua', precio: 2.00 },
        { nombre: 'Cerveza', precio: 4.00 }
    ];

    const cambiarEstado = (id, nuevoEstado) => {
        setComandasList(comandas.map(comanda => 
            comanda.id === id ? { ...comanda, estado: nuevoEstado } : comanda
        ));
    };

    const getEstadoClass = (estado) => {
        switch(estado) {
            case 'pendiente': return 'estado-pendiente';
            case 'en-preparacion': return 'estado-preparacion';
            case 'listo': return 'estado-listo';
            default: return '';
        }
    };

    const verDetalles = (id) => {
        navigate(`/comandas/detalle/${id}`);
    };

    // Funciones para manejar el modal de nueva comanda





    return (
        <div className="comandas-container">
            
            <div className="comandas-grid">
                {comandas.map(comanda => (
                    <div key={comanda.id} className={`comanda-card ${getEstadoClass(comanda.estado)}`}>
                        <div className="comanda-header">
                            <span className="mesa-number">Mesa {comanda.mesa}</span>
                            <span className={`estado-badge ${getEstadoClass(comanda.estado)}`}>
                                {comanda.estado.replace('-', ' ').toUpperCase()}
                            </span>
                        </div>
                        
                        <div className="comanda-body">
                            <h4>{comanda.nombrePedido}</h4>
                            <ul className="items-list">
                                {comanda.productos.map((producto, index) => (
                                    <li key={index}>
                                        {producto.nombre} x{producto.cantidad} - ${producto.precio.toFixed(2)}
                                    </li>
                                ))}
                            </ul>
                            <div className="comanda-total">
                                Total: ${comanda.total.toFixed(2)}
                            </div>
                        </div>
                        
                        <div className="comanda-actions">
                            <button
                                onClick={() => verDetalles(comanda.id)}
                                className="btn-accion btn-detalles"
                            >
                                Ver Detalles
                            </button>
                            {comanda.estado === 'pendiente' && (
                                <button
                                    onClick={() => cambiarEstado(comanda.id, 'en-preparacion')}
                                    className="btn-accion btn-preparar"
                                >
                                    Preparar
                                </button>
                            )}
                            {comanda.estado === 'en-preparacion' && (
                                <button
                                    onClick={() => cambiarEstado(comanda.id, 'listo')}
                                    className="btn-accion btn-listo"
                                >
                                    Marcar Listo
                                </button>
                            )}
                            {comanda.estado === 'listo' && (
                                <button
                                    onClick={() => cambiarEstado(comanda.id, 'entregado')}
                                    className="btn-accion btn-entregar"
                                >
                                    Entregar
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            

            {/* Modal para agregar nueva comanda */}
            {modalNuevaComanda && (
                <div className="modal-overlay" onClick={cerrarModalNuevaComanda}>
                    <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Nueva Comanda</h3>
                            <button className="modal-close" onClick={cerrarModalNuevaComanda}>×</button>
                        </div>
                        
                        <div className="modal-body">
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="mesa-comanda">Mesa:</label>
                                    <input 
                                        type="number"
                                        id="mesa-comanda"
                                        value={nuevaComanda.mesa}
                                        onChange={(e) => setNuevaComanda({...nuevaComanda, mesa: e.target.value})}
                                        className="form-input"
                                        placeholder="Número de mesa"
                                        min="1"
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="cliente-comanda">Cliente:</label>
                                    <input 
                                        type="text"
                                        id="cliente-comanda"
                                        value={nuevaComanda.cliente}
                                        onChange={(e) => setNuevaComanda({...nuevaComanda, cliente: e.target.value})}
                                        className="form-input"
                                        placeholder="Nombre del cliente"
                                    />
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label>Items de la comanda:</label>
                                <div className="items-container">
                                    {nuevaComanda.items.map((item, index) => (
                                        <div key={index} className="item-row">
                                            <select 
                                                value={item}
                                                onChange={(e) => actualizarItem(index, e.target.value)}
                                                className="form-input item-select"
                                            >
                                                <option value="">Seleccione un producto</option>
                                                {productosDisponibles.map((producto, i) => (
                                                    <option key={i} value={producto.nombre}>
                                                        {producto.nombre} - ${producto.precio}
                                                    </option>
                                                ))}
                                            </select>
                                            {nuevaComanda.items.length > 1 && (
                                                <button 
                                                    type="button"
                                                    onClick={() => eliminarItem(index)}
                                                    className="btn-eliminar-item"
                                                >
                                                    ×
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <button 
                                    type="button"
                                    onClick={agregarItem}
                                    className="btn-agregar-item"
                                >
                                    + Agregar Item
                                </button>
                            </div>
                            
                            <div className="total-preview">
                                <strong>Total estimado: ${calcularTotal()}</strong>
                            </div>
                        </div>
                        
                        <div className="modal-footer">
                            <button 
                                onClick={cerrarModalNuevaComanda} 
                                className="btn-cancelar-modal"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={agregarComanda} 
                                className="btn-confirmar-modal"
                                disabled={!nuevaComanda.mesa || !nuevaComanda.cliente || 
                                         !nuevaComanda.items.some(item => item !== '')}
                            >
                                Crear Comanda
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Comandas;

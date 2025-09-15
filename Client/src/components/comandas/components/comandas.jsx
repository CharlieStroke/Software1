import React, { useState } from 'react';
import '../componentsCss/comandas.css';

const Comandas = () => {
    const [comandas, setComandasList] = useState([
        { id: 1, mesa: 5, cliente: 'Juan Pérez', items: ['Pizza Margherita', 'Coca Cola'], total: 18.50, estado: 'pendiente' },
        { id: 2, mesa: 3, cliente: 'María García', items: ['Hamburguesa', 'Papas fritas'], total: 12.00, estado: 'en-preparacion' },
        { id: 3, mesa: 8, cliente: 'Carlos López', items: ['Ensalada César', 'Agua'], total: 9.50, estado: 'listo' }
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

    // Funciones para manejar el modal de nueva comanda
    const abrirModalNuevaComanda = () => {
        setNuevaComanda({
            mesa: '',
            cliente: '',
            items: [''],
            total: ''
        });
        setModalNuevaComanda(true);
    };

    const cerrarModalNuevaComanda = () => {
        setModalNuevaComanda(false);
        setNuevaComanda({
            mesa: '',
            cliente: '',
            items: [''],
            total: ''
        });
    };

    const agregarItem = () => {
        setNuevaComanda({
            ...nuevaComanda,
            items: [...nuevaComanda.items, '']
        });
    };

    const eliminarItem = (index) => {
        const nuevosItems = nuevaComanda.items.filter((_, i) => i !== index);
        setNuevaComanda({
            ...nuevaComanda,
            items: nuevosItems.length > 0 ? nuevosItems : ['']
        });
    };

    const actualizarItem = (index, valor) => {
        const nuevosItems = [...nuevaComanda.items];
        nuevosItems[index] = valor;
        setNuevaComanda({
            ...nuevaComanda,
            items: nuevosItems
        });
    };

    const calcularTotal = () => {
        let total = 0;
        nuevaComanda.items.forEach(item => {
            const producto = productosDisponibles.find(p => p.nombre === item);
            if (producto) {
                total += producto.precio;
            }
        });
        return total.toFixed(2);
    };

    const agregarComanda = () => {
        if (nuevaComanda.mesa && nuevaComanda.cliente && nuevaComanda.items.some(item => item !== '')) {
            const itemsValidos = nuevaComanda.items.filter(item => item !== '');
            const total = parseFloat(calcularTotal());
            
            const nuevaId = Math.max(...comandas.map(c => c.id)) + 1;
            const comandaParaAgregar = {
                id: nuevaId,
                mesa: parseInt(nuevaComanda.mesa),
                cliente: nuevaComanda.cliente,
                items: itemsValidos,
                total: total,
                estado: 'pendiente'
            };

            setComandasList([...comandas, comandaParaAgregar]);
            cerrarModalNuevaComanda();
        }
    };

    return (
        <div className="comandas-container">
            <div className="comandas-header">
                <h2>Gestión de Comandas</h2>
                <button className="btn-nueva-comanda" onClick={abrirModalNuevaComanda}>Nueva Comanda</button>
            </div>
            
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
                            <h4>{comanda.cliente}</h4>
                            <ul className="items-list">
                                {comanda.items.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                            <div className="comanda-total">
                                Total: ${comanda.total}
                            </div>
                        </div>
                        
                        <div className="comanda-actions">
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

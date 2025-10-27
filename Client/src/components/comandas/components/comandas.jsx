import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../componentsCss/comandas.css';

const Comandas = () => {
    const navigate = useNavigate();

    const comandasHardcodeadas = [
        {
            id: 1,
            mesa: 5,
            nombrePedido: 'Pedido Juan Pérez',
            fecha: '2023-10-01',
            productos: [
                { nombre: 'Pizza Margherita', cantidad: 1, precio: 15.00 },
                { nombre: 'Coca Cola', cantidad: 1, precio: 2.50 }
            ],
            total: 17.50
        },
        {
            id: 2,
            mesa: 3,
            nombrePedido: 'Pedido María García',
            fecha: '2023-10-02',
            productos: [
                { nombre: 'Hamburguesa', cantidad: 1, precio: 8.50 },
                { nombre: 'Papas fritas', cantidad: 1, precio: 3.50 }
            ],
            total: 12.00
        },
        {
            id: 3,
            mesa: 8,
            nombrePedido: 'Pedido Carlos López',
            fecha: '2023-10-03',
            productos: [
                { nombre: 'Ensalada César', cantidad: 1, precio: 7.00 },
                { nombre: 'Agua', cantidad: 1, precio: 2.00 }
            ],
            total: 9.00
        }
    ];

    const [comandas, setComandasList] = useState([]);
    const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        // Cargar comandas de localStorage y combinar con hardcodeadas
        const comandasGuardadas = JSON.parse(localStorage.getItem('comandas') || '[]').map(comanda => ({
            ...comanda,
            fecha: comanda.fecha || new Date().toISOString().split('T')[0] // Ensure fecha exists
        }));
        setComandasList([...comandasHardcodeadas, ...comandasGuardadas]);
    }, []);



    // Estados para el modal de edición de productos
    const [modalEditarProductos, setModalEditarProductos] = useState(false);
    const [comandaEditando, setComandaEditando] = useState(null);
    const [productosEditados, setProductosEditados] = useState([]);

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



    const verDetalles = (id) => {
        navigate(`/comandas/detalle/${id}`);
    };

    // Funciones para editar productos
    const abrirModalEditarProductos = (comanda) => {
        setComandaEditando(comanda);
        setProductosEditados([...comanda.productos]);
        setModalEditarProductos(true);
    };

    const cerrarModalEditarProductos = () => {
        setModalEditarProductos(false);
        setComandaEditando(null);
        setProductosEditados([]);
    };

    const actualizarProductoEditado = (index, campo, valor) => {
        const nuevosProductos = [...productosEditados];
        nuevosProductos[index] = { ...nuevosProductos[index], [campo]: valor };
        setProductosEditados(nuevosProductos);
    };

    const agregarProductoEditado = () => {
        setProductosEditados([...productosEditados, { nombre: '', cantidad: 1, precio: 0 }]);
    };

    const eliminarProductoEditado = (index) => {
        if (productosEditados.length > 1) {
            setProductosEditados(productosEditados.filter((_, i) => i !== index));
        }
    };

    const guardarCambiosProductos = () => {
        const totalNuevo = productosEditados.reduce((total, producto) => total + (producto.precio * producto.cantidad), 0);
        setComandasList(comandas.map(comanda =>
            comanda.id === comandaEditando.id
                ? { ...comanda, productos: productosEditados, total: totalNuevo }
                : comanda
        ));
        cerrarModalEditarProductos();
    };

    // Funciones para filtrar y ordenar
    const filteredAndSortedComandas = comandas
        .filter(comanda =>
            searchTerm === '' || comanda.fecha === searchTerm
        )
        .sort((a, b) => {
            const dateA = new Date(a.fecha);
            const dateB = new Date(b.fecha);
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });

    // Paginación
    const totalPages = Math.ceil(filteredAndSortedComandas.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedComandas = filteredAndSortedComandas.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };



    return (
        <div className="comandas-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h1>Gestión de Comandas</h1>
                <div className="search-sort-container">
                    <input
                        type="date"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <div className="sort-buttons">
                        <button
                            onClick={() => setSortOrder('asc')}
                            className={`btn-sort ${sortOrder === 'asc' ? 'active' : ''}`}
                        >
                            Más antiguo
                        </button>
                        <button
                            onClick={() => setSortOrder('desc')}
                            className={`btn-sort ${sortOrder === 'desc' ? 'active' : ''}`}
                        >
                            Más reciente
                        </button>
                    </div>
                </div>
            </div>

            <div className="comandas-list">
                {paginatedComandas.length > 0 ? (
                    paginatedComandas.map(comanda => (
                        <div key={comanda.id} className="comanda-item">
                            <div className="comanda-info">
                                <span className="mesa-number">Mesa {comanda.mesa}</span>
                            </div>

                            <div className="comanda-details">
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
                                <button
                                    onClick={() => abrirModalEditarProductos(comanda)}
                                    className="btn-accion btn-preparar"
                                >
                                    Editar Productos
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    searchTerm && (
                        <div className="no-comandas-message">
                            No existen comandas en esta fecha seleccionada
                        </div>
                    )
                )}
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    {Array.from({ length: totalPages }, (_, index) => (
                        <button
                            key={index + 1}
                            onClick={() => handlePageChange(index + 1)}
                            className={`btn-pagination ${currentPage === index + 1 ? 'active' : ''}`}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
            )}
            



            {/* Modal para editar productos */}
            {modalEditarProductos && (
                <div className="modal-overlay" onClick={cerrarModalEditarProductos}>
                    <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Editar Productos - {comandaEditando?.nombrePedido}</h3>
                            <button className="modal-close" onClick={cerrarModalEditarProductos}>×</button>
                        </div>

                        <div className="modal-body">
                            <div className="form-group">
                                <label>Productos de la comanda:</label>
                                <div className="items-container">
                                    {productosEditados.map((producto, index) => (
                                        <div key={index} className="item-row">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                                                <span style={{ fontWeight: '500', minWidth: '150px' }}>{producto.nombre}</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <label style={{ fontSize: '0.9rem', color: '#666' }}>Cant:</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={producto.cantidad}
                                                        onChange={(e) => actualizarProductoEditado(index, 'cantidad', parseInt(e.target.value) || 1)}
                                                        className="form-input"
                                                        style={{ width: '80px' }}
                                                    />
                                                </div>
                                            </div>
                                            {productosEditados.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => eliminarProductoEditado(index)}
                                                    className="btn-eliminar-item"
                                                >
                                                    ×
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="form-group">
                                    <label>Agregar nuevo producto:</label>
                                    <select
                                        value=""
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                const prodSeleccionado = productosDisponibles.find(p => p.nombre === e.target.value);
                                                if (prodSeleccionado) {
                                                    setProductosEditados([...productosEditados, {
                                                        nombre: prodSeleccionado.nombre,
                                                        cantidad: 1,
                                                        precio: prodSeleccionado.precio
                                                    }]);
                                                }
                                                e.target.value = ""; // Reset select
                                            }
                                        }}
                                        className="form-input"
                                    >
                                        <option value="">Seleccione un producto para agregar</option>
                                        {productosDisponibles.map((prod, i) => (
                                            <option key={i} value={prod.nombre}>
                                                {prod.nombre} - ${prod.precio}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="total-preview">
                                <strong>Total actualizado: ${productosEditados.reduce((total, producto) => total + (producto.precio * producto.cantidad), 0).toFixed(2)}</strong>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                onClick={cerrarModalEditarProductos}
                                className="btn-cancelar-modal"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={guardarCambiosProductos}
                                className="btn-confirmar-modal"
                                disabled={productosEditados.some(p => !p.nombre)}
                            >
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Comandas;

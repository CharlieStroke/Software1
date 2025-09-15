import React, { useState } from 'react';
import '../componentsCss/inventario.css';

const Inventario = () => {
    const [productos, setProductos] = useState([
        { id: 1, nombre: 'Tomate', categoria: 'Verduras', stock: 25, minimo: 10, precio: 2.50, unidad: 'kg' },
        { id: 2, nombre: 'Queso Mozzarella', categoria: 'Lácteos', stock: 5, minimo: 8, precio: 8.99, unidad: 'kg' },
        { id: 3, nombre: 'Harina', categoria: 'Panadería', stock: 45, minimo: 20, precio: 1.20, unidad: 'kg' },
        { id: 4, nombre: 'Aceite de Oliva', categoria: 'Aceites', stock: 12, minimo: 5, precio: 15.00, unidad: 'litro' },
        { id: 5, nombre: 'Pollo', categoria: 'Carnes', stock: 3, minimo: 10, precio: 6.50, unidad: 'kg' }
    ]);

    const [filtroCategoria, setFiltroCategoria] = useState('todas');
    const [mostrarBajoStock, setMostrarBajoStock] = useState(false);
    
    // Estados para el modal de agregar producto
    const [modalNuevoProducto, setModalNuevoProducto] = useState(false);
    const [nuevoProducto, setNuevoProducto] = useState({
        nombre: '',
        categoria: '',
        stock: '',
        minimo: '',
        precio: '',
        unidad: 'kg'
    });

    const categorias = [...new Set(productos.map(p => p.categoria))];
    
    const productosFiltrados = productos.filter(producto => {
        const cumpleFiltro = filtroCategoria === 'todas' || producto.categoria === filtroCategoria;
        const cumpleStock = !mostrarBajoStock || producto.stock <= producto.minimo;
        return cumpleFiltro && cumpleStock;
    });

    const getStockClass = (producto) => {
        if (producto.stock === 0) return 'stock-agotado';
        if (producto.stock <= producto.minimo) return 'stock-bajo';
        return 'stock-normal';
    };

    const actualizarStock = (id, nuevoStock) => {
        setProductos(productos.map(producto => 
            producto.id === id ? { ...producto, stock: Math.max(0, nuevoStock) } : producto
        ));
    };

    // Funciones para manejar el modal de nuevo producto
    const abrirModalNuevoProducto = () => {
        setNuevoProducto({
            nombre: '',
            categoria: '',
            stock: '',
            minimo: '',
            precio: '',
            unidad: 'kg'
        });
        setModalNuevoProducto(true);
    };

    const cerrarModalNuevoProducto = () => {
        setModalNuevoProducto(false);
        setNuevoProducto({
            nombre: '',
            categoria: '',
            stock: '',
            minimo: '',
            precio: '',
            unidad: 'kg'
        });
    };

    const agregarProducto = () => {
        if (nuevoProducto.nombre && nuevoProducto.categoria && nuevoProducto.stock && 
            nuevoProducto.minimo && nuevoProducto.precio) {
            
            const nuevoId = Math.max(...productos.map(p => p.id)) + 1;
            const productoParaAgregar = {
                id: nuevoId,
                nombre: nuevoProducto.nombre,
                categoria: nuevoProducto.categoria,
                stock: parseInt(nuevoProducto.stock),
                minimo: parseInt(nuevoProducto.minimo),
                precio: parseFloat(nuevoProducto.precio),
                unidad: nuevoProducto.unidad
            };

            setProductos([...productos, productoParaAgregar]);
            cerrarModalNuevoProducto();
        }
    };

    return (
        <div className="inventario-container">
            <div className="inventario-header">
                <h2>Gestión de Inventario</h2>
                <button className="btn-agregar-producto" onClick={abrirModalNuevoProducto}>Agregar Producto</button>
            </div>

            <div className="inventario-filtros">
                <div className="filtro-grupo">
                    <label>Categoría:</label>
                    <select 
                        value={filtroCategoria} 
                        onChange={(e) => setFiltroCategoria(e.target.value)}
                        className="filtro-select"
                    >
                        <option value="todas">Todas las categorías</option>
                        {categorias.map(categoria => (
                            <option key={categoria} value={categoria}>{categoria}</option>
                        ))}
                    </select>
                </div>
                
                <div className="filtro-grupo">
                    <label className="checkbox-label">
                        <input 
                            type="checkbox"
                            checked={mostrarBajoStock}
                            onChange={(e) => setMostrarBajoStock(e.target.checked)}
                        />
                        Solo productos con stock bajo
                    </label>
                </div>
            </div>

            <div className="inventario-stats">
                <div className="stat-item">
                    <span className="stat-label">Total productos:</span>
                    <span className="stat-value">{productos.length}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Bajo stock:</span>
                    <span className="stat-value bajo-stock">
                        {productos.filter(p => p.stock <= p.minimo).length}
                    </span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Agotados:</span>
                    <span className="stat-value agotado">
                        {productos.filter(p => p.stock === 0).length}
                    </span>
                </div>
            </div>

            <div className="productos-grid">
                {productosFiltrados.map(producto => (
                    <div key={producto.id} className={`producto-card ${getStockClass(producto)}`}>
                        <div className="producto-header">
                            <h3>{producto.nombre}</h3>
                            <span className="categoria-badge">{producto.categoria}</span>
                        </div>
                        
                        <div className="producto-info">
                            <div className="info-row">
                                <span>Stock actual:</span>
                                <span className={`stock-cantidad ${getStockClass(producto)}`}>
                                    {producto.stock} {producto.unidad}
                                </span>
                            </div>
                            <div className="info-row">
                                <span>Stock mínimo:</span>
                                <span>{producto.minimo} {producto.unidad}</span>
                            </div>
                            <div className="info-row">
                                <span>Precio:</span>
                                <span className="precio">${producto.precio}/{producto.unidad}</span>
                            </div>
                        </div>

                        <div className="producto-acciones">
                            <button 
                                onClick={() => actualizarStock(producto.id, producto.stock - 1)}
                                className="btn-restar"
                                disabled={producto.stock === 0}
                            >
                                -
                            </button>
                            <button 
                                onClick={() => actualizarStock(producto.id, producto.stock + 1)}
                                className="btn-sumar"
                            >
                                +
                            </button>
                            <button className="btn-editar">Editar</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal para agregar nuevo producto */}
            {modalNuevoProducto && (
                <div className="modal-overlay" onClick={cerrarModalNuevoProducto}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Agregar Nuevo Producto</h3>
                            <button className="modal-close" onClick={cerrarModalNuevoProducto}>×</button>
                        </div>
                        
                        <div className="modal-body">
                            <div className="form-group">
                                <label htmlFor="nombre-producto">Nombre del Producto:</label>
                                <input 
                                    type="text"
                                    id="nombre-producto"
                                    value={nuevoProducto.nombre}
                                    onChange={(e) => setNuevoProducto({...nuevoProducto, nombre: e.target.value})}
                                    className="form-input"
                                    placeholder="Ej: Tomate, Queso, etc."
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="categoria-producto">Categoría:</label>
                                <input 
                                    type="text"
                                    id="categoria-producto"
                                    value={nuevoProducto.categoria}
                                    onChange={(e) => setNuevoProducto({...nuevoProducto, categoria: e.target.value})}
                                    className="form-input"
                                    placeholder="Ej: Verduras, Lácteos, etc."
                                />
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="stock-producto">Stock Inicial:</label>
                                    <input 
                                        type="number"
                                        id="stock-producto"
                                        value={nuevoProducto.stock}
                                        onChange={(e) => setNuevoProducto({...nuevoProducto, stock: e.target.value})}
                                        className="form-input"
                                        placeholder="0"
                                        min="0"
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="minimo-producto">Stock Mínimo:</label>
                                    <input 
                                        type="number"
                                        id="minimo-producto"
                                        value={nuevoProducto.minimo}
                                        onChange={(e) => setNuevoProducto({...nuevoProducto, minimo: e.target.value})}
                                        className="form-input"
                                        placeholder="0"
                                        min="0"
                                    />
                                </div>
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="precio-producto">Precio:</label>
                                    <input 
                                        type="number"
                                        id="precio-producto"
                                        value={nuevoProducto.precio}
                                        onChange={(e) => setNuevoProducto({...nuevoProducto, precio: e.target.value})}
                                        className="form-input"
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="unidad-producto">Unidad:</label>
                                    <select 
                                        id="unidad-producto"
                                        value={nuevoProducto.unidad}
                                        onChange={(e) => setNuevoProducto({...nuevoProducto, unidad: e.target.value})}
                                        className="form-input"
                                    >
                                        <option value="kg">Kilogramos (kg)</option>
                                        <option value="litro">Litros</option>
                                        <option value="unidad">Unidades</option>
                                        <option value="gramo">Gramos (g)</option>
                                        <option value="ml">Mililitros (ml)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <div className="modal-footer">
                            <button 
                                onClick={cerrarModalNuevoProducto} 
                                className="btn-cancelar-modal"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={agregarProducto} 
                                className="btn-confirmar-modal"
                                disabled={!nuevoProducto.nombre || !nuevoProducto.categoria || 
                                         !nuevoProducto.stock || !nuevoProducto.minimo || !nuevoProducto.precio}
                            >
                                Agregar Producto
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventario;

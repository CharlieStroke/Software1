import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import '../componentsCss/inventario.css';

// Esquema de validación para productos de inventario
const productoInventarioValidationSchema = Yup.object({
    nombre: Yup.string()
        .required('El nombre del producto es obligatorio')
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .max(100, 'El nombre no puede exceder 100 caracteres'),
    categoria: Yup.string()
        .required('La categoría es obligatoria')
        .min(3, 'La categoría debe tener al menos 3 caracteres')
        .max(50, 'La categoría no puede exceder 50 caracteres'),
    stock: Yup.number()
        .required('El stock es obligatorio')
        .integer('El stock debe ser un número entero')
        .min(0, 'El stock no puede ser negativo')
        .max(10000, 'El stock no puede exceder 10,000 unidades'),
    minimo: Yup.number()
        .required('El stock mínimo es obligatorio')
        .integer('El stock mínimo debe ser un número entero')
        .min(0, 'El stock mínimo no puede ser negativo')
        .max(1000, 'El stock mínimo no puede exceder 1,000 unidades'),
    precio: Yup.number()
        .required('El precio es obligatorio')
        .positive('El precio debe ser mayor a 0')
        .max(100000, 'El precio no puede exceder $100,000')
        .test('decimales', 'El precio solo puede tener hasta 2 decimales', 
            value => value === undefined || /^\d+(\.\d{1,2})?$/.test(value.toString())),
    unidad: Yup.string()
        .required('La unidad de medida es obligatoria')
        .oneOf(['kg', 'gr', 'litro', 'ml', 'unidad', 'porción'], 'Unidad de medida inválida')
});

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
        setModalNuevoProducto(true);
    };

    const cerrarModalNuevoProducto = () => {
        setModalNuevoProducto(false);
    };

    const agregarProducto = async (valores, { resetForm }) => {
        try {
            await productoInventarioValidationSchema.validate(valores, { abortEarly: false });
            
            const nuevoId = Math.max(...productos.map(p => p.id)) + 1;
            const productoParaAgregar = {
                id: nuevoId,
                nombre: valores.nombre,
                categoria: valores.categoria,
                stock: parseInt(valores.stock),
                minimo: parseInt(valores.minimo),
                precio: parseFloat(valores.precio),
                unidad: valores.unidad
            };

            setProductos([...productos, productoParaAgregar]);
            resetForm();
            cerrarModalNuevoProducto();
        } catch (error) {
            console.error('Error al agregar producto:', error);
            throw error;
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
                        
                        <Formik
                            initialValues={{
                                nombre: '',
                                categoria: '',
                                stock: '',
                                minimo: '',
                                precio: '',
                                unidad: 'kg'
                            }}
                            validationSchema={productoInventarioValidationSchema}
                            onSubmit={agregarProducto}
                        >
                            {({ errors, touched, isSubmitting }) => (
                                <Form>
                                    <div className="modal-body">
                                        <div className="form-group">
                                            <label htmlFor="nombre">Nombre del Producto *</label>
                                            <Field 
                                                type="text"
                                                id="nombre"
                                                name="nombre"
                                                className={`form-input ${errors.nombre && touched.nombre ? 'error' : ''}`}
                                                placeholder="Ej: Tomate, Queso, etc."
                                            />
                                            <ErrorMessage name="nombre" component="span" className="error-message" />
                                        </div>
                                        
                                        <div className="form-group">
                                            <label htmlFor="categoria">Categoría *</label>
                                            <Field 
                                                type="text"
                                                id="categoria"
                                                name="categoria"
                                                className={`form-input ${errors.categoria && touched.categoria ? 'error' : ''}`}
                                                placeholder="Ej: Verduras, Lácteos, etc."
                                            />
                                            <ErrorMessage name="categoria" component="span" className="error-message" />
                                        </div>
                                        
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label htmlFor="stock">Stock Inicial *</label>
                                                <Field 
                                                    type="number"
                                                    id="stock"
                                                    name="stock"
                                                    className={`form-input ${errors.stock && touched.stock ? 'error' : ''}`}
                                                    placeholder="0"
                                                    min="0"
                                                />
                                                <ErrorMessage name="stock" component="span" className="error-message" />
                                            </div>
                                            
                                            <div className="form-group">
                                                <label htmlFor="minimo">Stock Mínimo *</label>
                                                <Field 
                                                    type="number"
                                                    id="minimo"
                                                    name="minimo"
                                                    className={`form-input ${errors.minimo && touched.minimo ? 'error' : ''}`}
                                                    placeholder="0"
                                                    min="0"
                                                />
                                                <ErrorMessage name="minimo" component="span" className="error-message" />
                                            </div>
                                        </div>
                                        
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label htmlFor="precio">Precio *</label>
                                                <Field 
                                                    type="number"
                                                    id="precio"
                                                    name="precio"
                                                    className={`form-input ${errors.precio && touched.precio ? 'error' : ''}`}
                                                    placeholder="0.00"
                                                    min="0"
                                                    step="0.01"
                                                />
                                                <ErrorMessage name="precio" component="span" className="error-message" />
                                            </div>
                                            
                                            <div className="form-group">
                                                <label htmlFor="unidad">Unidad *</label>
                                                <Field 
                                                    as="select"
                                                    id="unidad"
                                                    name="unidad"
                                                    className={`form-input ${errors.unidad && touched.unidad ? 'error' : ''}`}
                                                >
                                                    <option value="kg">Kilogramos (kg)</option>
                                                    <option value="gr">Gramos (gr)</option>
                                                    <option value="litro">Litros</option>
                                                    <option value="ml">Mililitros (ml)</option>
                                                    <option value="unidad">Unidades</option>
                                                    <option value="porción">Porciones</option>
                                                </Field>
                                                <ErrorMessage name="unidad" component="span" className="error-message" />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="modal-footer">
                                        <button 
                                            type="button"
                                            onClick={cerrarModalNuevoProducto} 
                                            className="btn-cancelar-modal"
                                        >
                                            Cancelar
                                        </button>
                                        <button 
                                            type="submit"
                                            className="btn-confirmar-modal"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? 'Agregando...' : 'Agregar Producto'}
                                        </button>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventario;

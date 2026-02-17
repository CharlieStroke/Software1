import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useInventario } from '../hooks/useInventario';
import ModuleHeader from '../../../shared/ModuleHeader';
import '../componentsCss/inventario.css';
import playIcon from '../../../assets/play.svg';
import pauseIcon from '../../../assets/pause.svg';
import deleteIcon from '../../../assets/delete.svg';
import editIcon from '../../../assets/edit.svg';

// Esquema de validación para productos de inventario
const productoValidationSchema = Yup.object({
    nombre: Yup.string()
        .required('El nombre del producto es obligatorio')
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .max(100, 'El nombre no puede exceder 100 caracteres'),
    id_categoria: Yup.number()
        .required('La categoría es obligatoria')
        .positive('Seleccione una categoría válida'),
    stock_actual: Yup.number()
        .required('El stock es obligatorio')
        .integer('El stock debe ser un número entero')
        .min(0, 'El stock no puede ser negativo')
        .max(10000, 'El stock no puede exceder 10,000 unidades'),
    stock_minimo: Yup.number()
        .required('El stock mínimo es obligatorio')
        .integer('El stock mínimo debe ser un número entero')
        .min(0, 'El stock mínimo no puede ser negativo')
        .max(1000, 'El stock mínimo no puede exceder 1,000 unidades'),
    precio_unitario: Yup.number()
        .required('El precio es obligatorio')
        .positive('El precio debe ser mayor a 0')
        .max(100000, 'El precio no puede exceder $100,000')
        .test('decimales', 'El precio solo puede tener hasta 2 decimales', 
            value => value === undefined || /^\d+(\.\d{1,2})?$/.test(value.toString())),
    unidad_medida: Yup.string()
        .required('La unidad de medida es obligatoria')
        .oneOf(['kg', 'gr', 'litro', 'ml', 'unidad', 'porcion'], 'Unidad de medida inválida')
});

// Esquema para ajuste de stock
const ajusteStockSchema = Yup.object({
    cantidad: Yup.number()
        .required('La cantidad es obligatoria')
        .integer('Debe ser un número entero')
        .test('no-cero', 'La cantidad no puede ser cero', value => value !== 0),
    tipo_movimiento: Yup.string()
        .required('El tipo de movimiento es obligatorio')
        .oneOf(['entrada', 'salida', 'ajuste'], 'Tipo de movimiento inválido'),
    observaciones: Yup.string()
        .max(255, 'Las observaciones no pueden exceder 255 caracteres')
});

// Esquema para nueva categoría
const categoriaValidationSchema = Yup.object({
    nombre: Yup.string()
        .required('El nombre de la categoría es obligatorio')
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .max(50, 'El nombre no puede exceder 50 caracteres'),
    descripcion: Yup.string()
        .max(255, 'La descripción no puede exceder 255 caracteres')
});

const Inventario = () => {
    const {
        productos,
        categorias,
        loading,
        error,
        stats,
        crearProducto,
        crearCategoria,
        actualizarProducto,
        ajustarStock,
        toggleEstado,
        eliminarProducto,
        toggleEstadoCategoria,
        eliminarCategoria,
        recargar,
        recargarCategorias
    } = useInventario();

    const [filtroCategoria, setFiltroCategoria] = useState('todas');
    const [mostrarBajoStock, setMostrarBajoStock] = useState(false);
    const [busqueda, setBusqueda] = useState('');
    
    // Estados para modales
    const [modalNuevoProducto, setModalNuevoProducto] = useState(false);
    const [modalEditarProducto, setModalEditarProducto] = useState(false);
    const [modalAjustarStock, setModalAjustarStock] = useState(false);
    const [modalNuevaCategoria, setModalNuevaCategoria] = useState(false);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [mostrarCategorias, setMostrarCategorias] = useState(false);

    /* FILTRAR PRODUCTOS */
    const productosFiltrados = productos.filter(producto => {
        const cumpleCategoria = filtroCategoria === 'todas' || producto.id_categoria === parseInt(filtroCategoria);
        const cumpleStock = !mostrarBajoStock || producto.stock_actual <= producto.stock_minimo;
        const cumpleBusqueda = busqueda === '' || 
            producto.nombre?.toLowerCase().includes(busqueda.toLowerCase());
        
        return cumpleCategoria && cumpleStock && cumpleBusqueda;
    });

    /* CLASE DE STOCK */
    const getStockClass = (producto) => {
        if (producto.stock_actual === 0) return 'stock-agotado';
        if (producto.stock_actual <= producto.stock_minimo) return 'stock-bajo';
        return 'stock-normal';
    };

    /* AGREGAR PRODUCTO */
    const handleAgregarProducto = async (valores, { resetForm, setSubmitting }) => {
        // Mapear nombres del frontend al backend y convertir tipos
        const datosFormateados = {
            nombre: valores.nombre,
            descripcion: valores.descripcion || null,
            categoria_id: parseInt(valores.id_categoria), // Backend espera categoria_id
            precio: parseFloat(valores.precio_unitario), // Backend espera precio
            costo: parseFloat(valores.costo) || 0,
            stock_actual: parseInt(valores.stock_actual),
            stock_minimo: parseInt(valores.stock_minimo),
            unidad_medida: valores.unidad_medida
        };
        
        const result = await crearProducto(datosFormateados);
        
        if (result.success) {
            resetForm();
            setModalNuevoProducto(false);
            alert('Producto agregado correctamente');
        } else {
            alert(`Error: ${result.error}`);
        }
        setSubmitting(false);
    };

    /* EDITAR PRODUCTO */
    const handleEditarProducto = async (valores, { setSubmitting }) => {
        // Mapear nombres del frontend al backend y convertir tipos
        const datosFormateados = {
            nombre: valores.nombre,
            descripcion: valores.descripcion || null,
            categoria_id: parseInt(valores.id_categoria), // Backend espera categoria_id
            precio: parseFloat(valores.precio_unitario), // Backend espera precio
            costo: parseFloat(valores.costo) || 0,
            stock_actual: parseInt(valores.stock_actual),
            stock_minimo: parseInt(valores.stock_minimo),
            unidad_medida: valores.unidad_medida
        };
        
        const result = await actualizarProducto(productoSeleccionado.id, datosFormateados);
        
        if (result.success) {
            setModalEditarProducto(false);
            setProductoSeleccionado(null);
            alert('Producto actualizado correctamente');
        } else {
            alert(`Error: ${result.error}`);
        }
        setSubmitting(false);
    };

    /* AJUSTAR STOCK */
    const handleAjustarStock = async (valores, { resetForm, setSubmitting }) => {
        const result = await ajustarStock(
            productoSeleccionado.id,
            parseInt(valores.cantidad),
            valores.tipo_movimiento,
            valores.observaciones
        );
        
        if (result.success) {
            resetForm();
            setModalAjustarStock(false);
            setProductoSeleccionado(null);
            alert('Stock ajustado correctamente');
        } else {
            alert(`Error: ${result.error}`);
        }
        setSubmitting(false);
    };

    /* ELIMINAR PRODUCTO */
    const handleEliminarProducto = async (id, nombre) => {
        if (!window.confirm(`¿Está seguro de eliminar el producto "${nombre}"?`)) return;
        
        const result = await eliminarProducto(id);
        if (result.success) {
            alert('Producto eliminado correctamente');
        } else {
            alert(`Error: ${result.error}`);
        }
    };

    /* CREAR CATEGORÍA */
    const handleCrearCategoria = async (valores, { resetForm, setSubmitting }) => {
        const result = await crearCategoria(valores);
        
        if (result.success) {
            resetForm();
            setModalNuevaCategoria(false);
            alert('Categoría creada correctamente');
        } else {
            alert(`Error: ${result.error}`);
        }
        setSubmitting(false);
    };

    /* ABRIR MODAL EDITAR */
    const abrirModalEditar = (producto) => {
        setProductoSeleccionado(producto);
        setModalEditarProducto(true);
    };

    /* ABRIR MODAL AJUSTAR STOCK */
    const abrirModalAjustarStock = (producto) => {
        setProductoSeleccionado(producto);
        setModalAjustarStock(true);
    };

    /* TOGGLE ESTADO CATEGORÍA */
    const handleToggleCategoria = async (id) => {
        const result = await toggleEstadoCategoria(id);
        if (!result.success) {
            alert(`Error: ${result.error}`);
        }
    };

    /* ELIMINAR CATEGORÍA */
    const handleEliminarCategoria = async (id, nombre) => {
        const productosEnCategoria = productos.filter(p => p.categoria_id === id).length;
        
        if (productosEnCategoria > 0) {
            alert(`No se puede eliminar la categoría "${nombre}" porque tiene ${productosEnCategoria} producto(s) asociado(s). Primero debe reasignar o eliminar esos productos.`);
            return;
        }

        if (window.confirm(`¿Estás seguro de eliminar la categoría "${nombre}"?`)) {
            const result = await eliminarCategoria(id);
            if (result.success) {
                alert('Categoría eliminada exitosamente');
            } else {
                alert(`Error: ${result.error}`);
            }
        }
    };

    if (loading) {
        return (
            <div className="inventario-container">
                <div className="spinner"></div>
                <p>Cargando inventario...</p>
            </div>
        );
    }

    return (
        <div className="inventario-container">
            <ModuleHeader 
                title="Gestión de Inventario"
                showButton={false}
                additionalButtons={[
                    {
                        text: mostrarCategorias ? 'Ocultar Categorías' : 'Ver Categorías',
                        onClick: () => setMostrarCategorias(!mostrarCategorias),
                        className: 'btn-secondary'
                    },
                    {
                        text: 'Agregar Producto',
                        onClick: () => setModalNuevoProducto(true),
                        className: 'btn-primary',
                        icon: '+'
                    }
                ]}
            />

            {/* ERROR */}
            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            {/* PANEL DE CATEGORÍAS */}
            {mostrarCategorias && (
                <div className="categorias-panel">
                    <div className="categorias-header">
                        <h3>Categorías de Productos</h3>
                        <button 
                            className="btn-nueva-categoria" 
                            onClick={() => setModalNuevaCategoria(true)}
                        >
                            + Nueva Categoría
                        </button>
                    </div>
                    <div className="categorias-grid">
                        {categorias.length === 0 ? (
                            <div className="empty-state">
                                <p>No hay categorías creadas</p>
                            </div>
                        ) : (
                            categorias.map(categoria => (
                                <div key={categoria.id} className="categoria-card">
                                    <div className="categoria-info">
                                        <h4>{categoria.nombre}</h4>
                                        {categoria.descripcion && (
                                            <p className="categoria-descripcion">{categoria.descripcion}</p>
                                        )}
                                    </div>
                                    <div className="categoria-stats">
                                        <span className="productos-count">
                                            {productos.filter(p => p.categoria_id === categoria.id).length} productos
                                        </span>
                                        <span className={`estado-badge ${categoria.activa ? 'activa' : 'inactiva'}`}>
                                            {categoria.activa ? 'Activa' : 'Inactiva'}
                                        </span>
                                    </div>
                                    <div className="categoria-acciones">
                                        <button 
                                            onClick={() => handleToggleCategoria(categoria.id)}
                                            className={`btn-toggle-categoria ${categoria.activa ? 'desactivar' : 'activar'}`}
                                            title={categoria.activa ? 'Desactivar' : 'Activar'}
                                        >
                                            <img src={categoria.activa ? pauseIcon : playIcon} alt={categoria.activa ? 'Pause' : 'Play'} width="16" height="16" />
                                        </button>
                                        <button 
                                            onClick={() => handleEliminarCategoria(categoria.id, categoria.nombre)}
                                            className="btn-eliminar-categoria"
                                            title="Eliminar categoría"
                                        >
                                            <img src={deleteIcon} alt="Delete" width="16" height="16" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* ESTADÍSTICAS */}
            <div className="inventario-stats">
                <div className="stat-item">
                    <span className="stat-label">Total productos:</span>
                    <span className="stat-value">{stats.total}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Bajo stock:</span>
                    <span className="stat-value bajo-stock">{stats.bajoStock}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Agotados:</span>
                    <span className="stat-value agotado">{stats.agotados}</span>
                </div>
            </div>

            {/* FILTROS */}
            <div className="inventario-filtros">
                <div className="filtro-grupo">
                    <label>Buscar:</label>
                    <input 
                        type="text"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        placeholder="Nombre del producto..."
                        className="filtro-input"
                    />
                </div>

                <div className="filtro-grupo">
                    <label>Categoría:</label>
                    <select 
                        value={filtroCategoria} 
                        onChange={(e) => setFiltroCategoria(e.target.value)}
                        className="filtro-select"
                    >
                        <option value="todas">Todas las categorías</option>
                        {categorias.map(categoria => (
                            <option key={categoria.id} value={categoria.id}>
                                {categoria.nombre}
                            </option>
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

                <button className="btn-recargar" onClick={recargar}>
                    Actualizar
                </button>
            </div>

            {/* GRID DE PRODUCTOS */}
            <div className="productos-grid">
                {productosFiltrados.length === 0 ? (
                    <div className="empty-state">
                        <p>No hay productos para mostrar</p>
                    </div>
                ) : (
                    productosFiltrados.map(producto => (
                        <div key={producto.id} className={`producto-card ${getStockClass(producto)}`}>
                            <div className="producto-header">
                                <h3>{producto.nombre}</h3>
                                <span className="categoria-badge">
                                    {categorias.find(c => c.id === producto.categoria_id)?.nombre || 'Sin categoría'}
                                </span>
                            </div>
                            
                            <div className="producto-info">
                                <div className="info-row">
                                    <span>Stock actual:</span>
                                    <span className={`stock-cantidad ${getStockClass(producto)}`}>
                                        {producto.stock_actual} {producto.unidad_medida}
                                    </span>
                                </div>
                                <div className="info-row">
                                    <span>Stock mínimo:</span>
                                    <span>{producto.stock_minimo} {producto.unidad_medida}</span>
                                </div>
                                <div className="info-row">
                                    <span>Precio:</span>
                                    <span className="precio">
                                        ${producto.precio_unitario}/{producto.unidad_medida}
                                    </span>
                                </div>
                            </div>

                            <div className="producto-acciones">
                                <button 
                                    onClick={() => abrirModalAjustarStock(producto)}
                                    className="btn-ajustar"
                                    title="Ajustar stock"
                                >
                                     Stock
                                </button>
                                <button 
                                    onClick={() => abrirModalEditar(producto)}
                                    className="btn-editar"
                                    title="Editar producto"
                                >
                                    <img src={editIcon} alt="Edit" width="16" height="16" />
                                </button>
                                <button 
                                    onClick={() => handleEliminarProducto(producto.id, producto.nombre)}
                                    className="btn-eliminar"
                                    title="Eliminar producto"
                                >
                                    <img src={deleteIcon} alt="Delete" width="16" height="16" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* MODAL NUEVO PRODUCTO */}
            {modalNuevoProducto && (
                <div className="modal-overlay" onClick={() => setModalNuevoProducto(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Agregar Nuevo Producto</h3>
                            <button 
                                className="modal-close" 
                                onClick={() => setModalNuevoProducto(false)}
                            >
                                ×
                            </button>
                        </div>
                        
                        <Formik
                            initialValues={{
                                nombre: '',
                                id_categoria: '',
                                stock_actual: '',
                                stock_minimo: '',
                                precio_unitario: '',
                                unidad_medida: 'kg'
                            }}
                            validationSchema={productoValidationSchema}
                            onSubmit={handleAgregarProducto}
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
                                            <div className="label-with-button">
                                                <label htmlFor="id_categoria">Categoría *</label>
                                                <button
                                                    type="button"
                                                    className="btn-nueva-categoria"
                                                    onClick={() => setModalNuevaCategoria(true)}
                                                    title="Crear nueva categoría"
                                                >
                                                    + Nueva
                                                </button>
                                            </div>
                                            <Field 
                                                as="select"
                                                id="id_categoria"
                                                name="id_categoria"
                                                className={`form-input ${errors.id_categoria && touched.id_categoria ? 'error' : ''}`}
                                            >
                                                <option value="">Seleccione una categoría</option>
                                                {categorias.map(cat => (
                                                    <option key={cat.id} value={cat.id}>
                                                        {cat.nombre}
                                                    </option>
                                                ))}
                                            </Field>
                                            <ErrorMessage name="id_categoria" component="span" className="error-message" />
                                        </div>
                                        
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label htmlFor="stock_actual">Stock Inicial *</label>
                                                <Field 
                                                    type="number"
                                                    id="stock_actual"
                                                    name="stock_actual"
                                                    className={`form-input ${errors.stock_actual && touched.stock_actual ? 'error' : ''}`}
                                                    placeholder="0"
                                                    min="0"
                                                />
                                                <ErrorMessage name="stock_actual" component="span" className="error-message" />
                                            </div>
                                            
                                            <div className="form-group">
                                                <label htmlFor="stock_minimo">Stock Mínimo *</label>
                                                <Field 
                                                    type="number"
                                                    id="stock_minimo"
                                                    name="stock_minimo"
                                                    className={`form-input ${errors.stock_minimo && touched.stock_minimo ? 'error' : ''}`}
                                                    placeholder="0"
                                                    min="0"
                                                />
                                                <ErrorMessage name="stock_minimo" component="span" className="error-message" />
                                            </div>
                                        </div>
                                        
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label htmlFor="precio_unitario">Precio *</label>
                                                <Field 
                                                    type="number"
                                                    id="precio_unitario"
                                                    name="precio_unitario"
                                                    className={`form-input ${errors.precio_unitario && touched.precio_unitario ? 'error' : ''}`}
                                                    placeholder="0.00"
                                                    min="0"
                                                    step="0.01"
                                                />
                                                <ErrorMessage name="precio_unitario" component="span" className="error-message" />
                                            </div>
                                            
                                            <div className="form-group">
                                                <label htmlFor="unidad_medida">Unidad *</label>
                                                <Field 
                                                    as="select"
                                                    id="unidad_medida"
                                                    name="unidad_medida"
                                                    className={`form-input ${errors.unidad_medida && touched.unidad_medida ? 'error' : ''}`}
                                                >
                                                    <option value="kg">Kilogramos (kg)</option>
                                                    <option value="gr">Gramos (gr)</option>
                                                    <option value="litro">Litros</option>
                                                    <option value="ml">Mililitros (ml)</option>
                                                    <option value="unidad">Unidades</option>
                                                    <option value="porcion">Porciones</option>
                                                </Field>
                                                <ErrorMessage name="unidad_medida" component="span" className="error-message" />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="modal-footer">
                                        <button 
                                            type="button"
                                            onClick={() => setModalNuevoProducto(false)}
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

            {/* MODAL EDITAR PRODUCTO */}
            {modalEditarProducto && productoSeleccionado && (
                <div className="modal-overlay" onClick={() => setModalEditarProducto(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Editar Producto</h3>
                            <button 
                                className="modal-close" 
                                onClick={() => setModalEditarProducto(false)}
                            >
                                ×
                            </button>
                        </div>
                        
                        <Formik
                            initialValues={{
                                nombre: productoSeleccionado.nombre,
                                id_categoria: productoSeleccionado.id_categoria,
                                stock_minimo: productoSeleccionado.stock_minimo,
                                precio_unitario: productoSeleccionado.precio_unitario,
                                unidad_medida: productoSeleccionado.unidad_medida
                            }}
                            validationSchema={productoValidationSchema.omit(['stock_actual'])}
                            onSubmit={handleEditarProducto}
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
                                            />
                                            <ErrorMessage name="nombre" component="span" className="error-message" />
                                        </div>
                                        
                                        <div className="form-group">
                                            <div className="label-with-button">
                                                <label htmlFor="id_categoria">Categoría *</label>
                                                <button
                                                    type="button"
                                                    className="btn-nueva-categoria"
                                                    onClick={() => setModalNuevaCategoria(true)}
                                                    title="Crear nueva categoría"
                                                >
                                                    + Nueva
                                                </button>
                                            </div>
                                            <Field 
                                                as="select"
                                                id="id_categoria"
                                                name="id_categoria"
                                                className={`form-input ${errors.id_categoria && touched.id_categoria ? 'error' : ''}`}
                                            >
                                                <option value="">Seleccione una categoría</option>
                                                {categorias.map(cat => (
                                                    <option key={cat.id} value={cat.id}>
                                                        {cat.nombre}
                                                    </option>
                                                ))}
                                            </Field>
                                            <ErrorMessage name="id_categoria" component="span" className="error-message" />
                                        </div>
                                        
                                        <div className="form-group">
                                            <label htmlFor="stock_minimo">Stock Mínimo *</label>
                                            <Field 
                                                type="number"
                                                id="stock_minimo"
                                                name="stock_minimo"
                                                className={`form-input ${errors.stock_minimo && touched.stock_minimo ? 'error' : ''}`}
                                                min="0"
                                            />
                                            <ErrorMessage name="stock_minimo" component="span" className="error-message" />
                                        </div>
                                        
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label htmlFor="precio_unitario">Precio *</label>
                                                <Field 
                                                    type="number"
                                                    id="precio_unitario"
                                                    name="precio_unitario"
                                                    className={`form-input ${errors.precio_unitario && touched.precio_unitario ? 'error' : ''}`}
                                                    min="0"
                                                    step="0.01"
                                                />
                                                <ErrorMessage name="precio_unitario" component="span" className="error-message" />
                                            </div>
                                            
                                            <div className="form-group">
                                                <label htmlFor="unidad_medida">Unidad *</label>
                                                <Field 
                                                    as="select"
                                                    id="unidad_medida"
                                                    name="unidad_medida"
                                                    className={`form-input ${errors.unidad_medida && touched.unidad_medida ? 'error' : ''}`}
                                                >
                                                    <option value="kg">Kilogramos (kg)</option>
                                                    <option value="gr">Gramos (gr)</option>
                                                    <option value="litro">Litros</option>
                                                    <option value="ml">Mililitros (ml)</option>
                                                    <option value="unidad">Unidades</option>
                                                    <option value="porcion">Porciones</option>
                                                </Field>
                                                <ErrorMessage name="unidad_medida" component="span" className="error-message" />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="modal-footer">
                                        <button 
                                            type="button"
                                            onClick={() => setModalEditarProducto(false)}
                                            className="btn-cancelar-modal"
                                        >
                                            Cancelar
                                        </button>
                                        <button 
                                            type="submit"
                                            className="btn-confirmar-modal"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                                        </button>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </div>
                </div>
            )}

            {/* MODAL AJUSTAR STOCK */}
            {modalAjustarStock && productoSeleccionado && (
                <div className="modal-overlay" onClick={() => setModalAjustarStock(false)}>
                    <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Ajustar Stock: {productoSeleccionado.nombre}</h3>
                            <button 
                                className="modal-close" 
                                onClick={() => setModalAjustarStock(false)}
                            >
                                ×
                            </button>
                        </div>
                        
                        <Formik
                            initialValues={{
                                cantidad: '',
                                tipo_movimiento: 'entrada',
                                observaciones: ''
                            }}
                            validationSchema={ajusteStockSchema}
                            onSubmit={handleAjustarStock}
                        >
                            {({ errors, touched, isSubmitting, values }) => (
                                <Form>
                                    <div className="modal-body">
                                        <div className="stock-info">
                                            <p><strong>Stock actual:</strong> {productoSeleccionado.stock_actual} {productoSeleccionado.unidad_medida}</p>
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="tipo_movimiento">Tipo de Movimiento *</label>
                                            <Field 
                                                as="select"
                                                id="tipo_movimiento"
                                                name="tipo_movimiento"
                                                className="form-input"
                                            >
                                                <option value="entrada">Entrada (Agregar)</option>
                                                <option value="salida">Salida (Quitar)</option>
                                                <option value="ajuste">Ajuste Manual</option>
                                            </Field>
                                            <ErrorMessage name="tipo_movimiento" component="span" className="error-message" />
                                        </div>
                                        
                                        <div className="form-group">
                                            <label htmlFor="cantidad">Cantidad *</label>
                                            <Field 
                                                type="number"
                                                id="cantidad"
                                                name="cantidad"
                                                className={`form-input ${errors.cantidad && touched.cantidad ? 'error' : ''}`}
                                                placeholder="0"
                                            />
                                            <ErrorMessage name="cantidad" component="span" className="error-message" />
                                            {values.cantidad && (
                                                <small className="helper-text">
                                                    Nuevo stock: {
                                                        values.tipo_movimiento === 'salida' 
                                                            ? Math.max(0, productoSeleccionado.stock_actual - parseInt(values.cantidad || 0))
                                                            : productoSeleccionado.stock_actual + parseInt(values.cantidad || 0)
                                                    } {productoSeleccionado.unidad_medida}
                                                </small>
                                            )}
                                        </div>
                                        
                                        <div className="form-group">
                                            <label htmlFor="observaciones">Observaciones</label>
                                            <Field 
                                                as="textarea"
                                                id="observaciones"
                                                name="observaciones"
                                                className="form-input"
                                                placeholder="Motivo del ajuste (opcional)"
                                                rows="3"
                                            />
                                            <ErrorMessage name="observaciones" component="span" className="error-message" />
                                        </div>
                                    </div>
                                    
                                    <div className="modal-footer">
                                        <button 
                                            type="button"
                                            onClick={() => setModalAjustarStock(false)}
                                            className="btn-cancelar-modal"
                                        >
                                            Cancelar
                                        </button>
                                        <button 
                                            type="submit"
                                            className="btn-confirmar-modal"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? 'Ajustando...' : 'Confirmar Ajuste'}
                                        </button>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </div>
                </div>
            )}

            {/* MODAL NUEVA CATEGORÍA */}
            {modalNuevaCategoria && (
                <div className="modal-overlay" onClick={() => setModalNuevaCategoria(false)}>
                    <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Crear Nueva Categoría</h3>
                            <button 
                                className="modal-close" 
                                onClick={() => setModalNuevaCategoria(false)}
                            >
                                ×
                            </button>
                        </div>
                        
                        <Formik
                            initialValues={{
                                nombre: '',
                                descripcion: ''
                            }}
                            validationSchema={categoriaValidationSchema}
                            onSubmit={handleCrearCategoria}
                        >
                            {({ errors, touched, isSubmitting }) => (
                                <Form>
                                    <div className="modal-body">
                                        <div className="form-group">
                                            <label htmlFor="nombre">Nombre de la Categoría *</label>
                                            <Field 
                                                type="text"
                                                id="nombre"
                                                name="nombre"
                                                className={`form-input ${errors.nombre && touched.nombre ? 'error' : ''}`}
                                                placeholder="Ej: Verduras, Lácteos, Carnes..."
                                                autoFocus
                                            />
                                            <ErrorMessage name="nombre" component="span" className="error-message" />
                                        </div>
                                        
                                        <div className="form-group">
                                            <label htmlFor="descripcion">Descripción (Opcional)</label>
                                            <Field 
                                                as="textarea"
                                                id="descripcion"
                                                name="descripcion"
                                                className={`form-input ${errors.descripcion && touched.descripcion ? 'error' : ''}`}
                                                placeholder="Descripción de la categoría..."
                                                rows="3"
                                            />
                                            <ErrorMessage name="descripcion" component="span" className="error-message" />
                                        </div>
                                    </div>
                                    
                                    <div className="modal-footer">
                                        <button 
                                            type="button"
                                            onClick={() => setModalNuevaCategoria(false)}
                                            className="btn-cancelar-modal"
                                        >
                                            Cancelar
                                        </button>
                                        <button 
                                            type="submit"
                                            className="btn-confirmar-modal"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? 'Creando...' : 'Crear Categoría'}
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

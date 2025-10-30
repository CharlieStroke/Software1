import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import '../componentsCss/comandas.css';

// Esquemas de validación
const productoValidationSchema = Yup.object({
    nombre: Yup.string()
        .required('El nombre del producto es obligatorio')
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .max(50, 'El nombre no puede exceder 50 caracteres'),
    cantidad: Yup.number()
        .required('La cantidad es obligatoria')
        .positive('La cantidad debe ser mayor a 0')
        .integer('La cantidad debe ser un número entero')
        .min(1, 'La cantidad mínima es 1')
        .max(100, 'La cantidad máxima es 100'),
    precio: Yup.number()
        .required('El precio es obligatorio')
        .positive('El precio debe ser mayor a 0')
        .max(1000, 'El precio no puede exceder $1000')
});

const comandaValidationSchema = Yup.object({
    mesa: Yup.number()
        .required('El número de mesa es obligatorio')
        .positive('El número de mesa debe ser mayor a 0')
        .integer('El número de mesa debe ser un número entero')
        .min(1, 'El número de mesa debe ser al menos 1')
        .max(50, 'El número de mesa no puede exceder 50'),
    nombrePedido: Yup.string()
        .required('El nombre del pedido es obligatorio')
        .min(3, 'El nombre del pedido debe tener al menos 3 caracteres')
        .max(100, 'El nombre del pedido no puede exceder 100 caracteres'),
    productos: Yup.array()
        .of(productoValidationSchema)
        .min(1, 'Debe tener al menos un producto')
        .required('Los productos son obligatorios')
});

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

    // Filtrar y ordenar comandas
    const filteredComandas = comandas
        .filter(comanda => 
            comanda.nombrePedido.toLowerCase().includes(searchTerm.toLowerCase()) ||
            comanda.mesa.toString().includes(searchTerm)
        )
        .sort((a, b) => {
            if (sortOrder === 'asc') {
                return a.mesa - b.mesa;
            } else {
                return b.mesa - a.mesa;
            }
        });

    // Calcular paginación
    const totalPages = Math.ceil(filteredComandas.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const paginatedComandas = filteredComandas.slice(indexOfFirstItem, indexOfLastItem);



    // Estados para el modal de edición de productos
    const [modalEditarProductos, setModalEditarProductos] = useState(false);
    const [comandaEditando, setComandaEditando] = useState(null);
    const [productosEditados, setProductosEditados] = useState([]);
    
    // Estados para validación
    const [erroresValidacion, setErroresValidacion] = useState({});
    const [mostrarErrores, setMostrarErrores] = useState(false);
    
    // Estados para modal de nueva comanda
    const [modalNuevaComanda, setModalNuevaComanda] = useState(false);

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
        setErroresValidacion({});
        setMostrarErrores(false);
    };

    const actualizarProductoEditado = async (index, campo, valor) => {
        const nuevosProductos = [...productosEditados];
        nuevosProductos[index] = { ...nuevosProductos[index], [campo]: valor };
        setProductosEditados(nuevosProductos);
        
        // Validar el producto individual
        try {
            await productoValidationSchema.validateAt(campo, { [campo]: valor });
            // Si la validación pasa, limpiar errores para este campo
            setErroresValidacion(prev => ({
                ...prev,
                [`producto_${index}_${campo}`]: null
            }));
        } catch (error) {
            // Si hay error de validación, guardarlo
            setErroresValidacion(prev => ({
                ...prev,
                [`producto_${index}_${campo}`]: error.message
            }));
        }
    };

    const agregarProductoEditado = () => {
        setProductosEditados([...productosEditados, { nombre: '', cantidad: 1, precio: 0 }]);
    };

    const eliminarProductoEditado = (index) => {
        if (productosEditados.length > 1) {
            setProductosEditados(productosEditados.filter((_, i) => i !== index));
        }
    };

    const guardarCambiosProductos = async () => {
        try {
            setMostrarErrores(true);
            
            // Validar todos los productos
            for (let i = 0; i < productosEditados.length; i++) {
                await productoValidationSchema.validate(productosEditados[i], { abortEarly: false });
            }
            
            // Validar que hay al menos un producto
            if (productosEditados.length === 0) {
                throw new Error('Debe tener al menos un producto');
            }
            
            // Si todas las validaciones pasan, guardar cambios
            const totalNuevo = productosEditados.reduce((total, producto) => total + (producto.precio * producto.cantidad), 0);
            setComandasList(comandas.map(comanda =>
                comanda.id === comandaEditando.id
                    ? { ...comanda, productos: productosEditados, total: totalNuevo }
                    : comanda
            ));
            
            // Limpiar errores y cerrar modal
            setErroresValidacion({});
            setMostrarErrores(false);
            cerrarModalEditarProductos();
            
        } catch (error) {
            if (error.inner) {
                // Errores de validación de Yup
                const nuevosErrores = {};
                error.inner.forEach((err, index) => {
                    const campo = err.path;
                    nuevosErrores[`producto_${index}_${campo}`] = err.message;
                });
                setErroresValidacion(nuevosErrores);
            } else {
                // Otros errores
                alert(error.message || 'Error al guardar los cambios');
            }
        }
    };

    // Funciones para nueva comanda
    const abrirModalNuevaComanda = () => {
        setModalNuevaComanda(true);
    };

    const cerrarModalNuevaComanda = () => {
        setModalNuevaComanda(false);
    };

    const crearNuevaComanda = async (valores) => {
        try {
            // Validar los valores
            await comandaValidationSchema.validate(valores, { abortEarly: false });
            
            // Crear nueva comanda
            const nuevaComanda = {
                id: Date.now(), // ID temporal basado en timestamp
                mesa: valores.mesa,
                nombrePedido: valores.nombrePedido,
                productos: valores.productos,
                total: valores.productos.reduce((total, producto) => total + (producto.precio * producto.cantidad), 0)
            };
            
            // Agregar a la lista
            setComandasList([...comandas, nuevaComanda]);
            
            // Guardar en localStorage
            const comandasGuardadas = JSON.parse(localStorage.getItem('comandas') || '[]');
            comandasGuardadas.push(nuevaComanda);
            localStorage.setItem('comandas', JSON.stringify(comandasGuardadas));
            
            cerrarModalNuevaComanda();
            
        } catch (error) {
            console.error('Error al crear comanda:', error);
            throw error;
        }
    };



    return (
        <div className="comandas-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h1>Gestión de Comandas</h1>
                <button
                    onClick={abrirModalNuevaComanda}
                    className="btn-nueva-comanda"
                >
                    + Nueva Comanda
                </button>
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
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={producto.cantidad}
                                                            onChange={(e) => actualizarProductoEditado(index, 'cantidad', parseInt(e.target.value) || 1)}
                                                            className={`form-input ${erroresValidacion[`producto_${index}_cantidad`] && mostrarErrores ? 'error' : ''}`}
                                                            style={{ width: '80px' }}
                                                        />
                                                        {erroresValidacion[`producto_${index}_cantidad`] && mostrarErrores && (
                                                            <span style={{ 
                                                                color: '#dc3545', 
                                                                fontSize: '0.75rem', 
                                                                marginTop: '2px' 
                                                            }}>
                                                                {erroresValidacion[`producto_${index}_cantidad`]}
                                                            </span>
                                                        )}
                                                    </div>
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
                                disabled={
                                    productosEditados.some(p => !p.nombre || p.cantidad <= 0) ||
                                    Object.values(erroresValidacion).some(error => error !== null)
                                }
                            >
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para nueva comanda */}
            {modalNuevaComanda && (
                <div className="modal-overlay" onClick={cerrarModalNuevaComanda}>
                    <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Nueva Comanda</h3>
                            <button className="modal-close" onClick={cerrarModalNuevaComanda}>×</button>
                        </div>

                        <Formik
                            initialValues={{
                                mesa: '',
                                nombrePedido: '',
                                productos: [{ nombre: '', cantidad: 1, precio: 0 }]
                            }}
                            validationSchema={comandaValidationSchema}
                            onSubmit={async (values, { setSubmitting, setFieldError }) => {
                                try {
                                    await crearNuevaComanda(values);
                                } catch (error) {
                                    if (error.inner) {
                                        error.inner.forEach(err => {
                                            setFieldError(err.path, err.message);
                                        });
                                    } else {
                                        alert('Error al crear la comanda');
                                    }
                                }
                                setSubmitting(false);
                            }}
                        >
                            {({ values, errors, touched, setFieldValue, isSubmitting }) => (
                                <Form>
                                    <div className="modal-body">
                                        <div className="form-group">
                                            <label>Número de Mesa:</label>
                                            <Field
                                                name="mesa"
                                                type="number"
                                                className={`form-input ${errors.mesa && touched.mesa ? 'error' : ''}`}
                                                min="1"
                                                max="50"
                                            />
                                            <ErrorMessage name="mesa" component="span" className="error-message" />
                                        </div>

                                        <div className="form-group">
                                            <label>Nombre del Pedido:</label>
                                            <Field
                                                name="nombrePedido"
                                                type="text"
                                                className={`form-input ${errors.nombrePedido && touched.nombrePedido ? 'error' : ''}`}
                                                placeholder="Ej: Pedido Juan Pérez"
                                            />
                                            <ErrorMessage name="nombrePedido" component="span" className="error-message" />
                                        </div>

                                        <div className="form-group">
                                            <label>Productos:</label>
                                            {values.productos.map((producto, index) => (
                                                <div key={index} className="item-row">
                                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'start', flex: 1 }}>
                                                        <div style={{ flex: 1 }}>
                                                            <select
                                                                value={producto.nombre}
                                                                onChange={(e) => {
                                                                    const prodSeleccionado = productosDisponibles.find(p => p.nombre === e.target.value);
                                                                    if (prodSeleccionado) {
                                                                        setFieldValue(`productos.${index}.nombre`, prodSeleccionado.nombre);
                                                                        setFieldValue(`productos.${index}.precio`, prodSeleccionado.precio);
                                                                    }
                                                                }}
                                                                className={`form-input ${errors.productos?.[index]?.nombre && touched.productos?.[index]?.nombre ? 'error' : ''}`}
                                                            >
                                                                <option value="">Seleccione un producto</option>
                                                                {productosDisponibles.map((prod, i) => (
                                                                    <option key={i} value={prod.nombre}>
                                                                        {prod.nombre} - ${prod.precio}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            <ErrorMessage name={`productos.${index}.nombre`} component="span" className="error-message" />
                                                        </div>
                                                        
                                                        <div style={{ width: '100px' }}>
                                                            <Field
                                                                name={`productos.${index}.cantidad`}
                                                                type="number"
                                                                min="1"
                                                                max="100"
                                                                className={`form-input ${errors.productos?.[index]?.cantidad && touched.productos?.[index]?.cantidad ? 'error' : ''}`}
                                                                style={{ width: '100%' }}
                                                            />
                                                            <ErrorMessage name={`productos.${index}.cantidad`} component="span" className="error-message" />
                                                        </div>
                                                    </div>
                                                    
                                                    {values.productos.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const nuevosProductos = values.productos.filter((_, i) => i !== index);
                                                                setFieldValue('productos', nuevosProductos);
                                                            }}
                                                            className="btn-eliminar-item"
                                                        >
                                                            ×
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFieldValue('productos', [...values.productos, { nombre: '', cantidad: 1, precio: 0 }]);
                                                }}
                                                className="btn-agregar-item"
                                                style={{ marginTop: '0.5rem' }}
                                            >
                                                + Agregar Producto
                                            </button>
                                        </div>

                                        <div className="total-preview">
                                            <strong>Total: ${values.productos.reduce((total, producto) => {
                                                return total + (producto.precio * producto.cantidad);
                                            }, 0).toFixed(2)}</strong>
                                        </div>
                                    </div>

                                    <div className="modal-footer">
                                        <button
                                            type="button"
                                            onClick={cerrarModalNuevaComanda}
                                            className="btn-cancelar-modal"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn-confirmar-modal"
                                            disabled={isSubmitting || values.productos.some(p => !p.nombre)}
                                        >
                                            {isSubmitting ? 'Creando...' : 'Crear Comanda'}
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

export default Comandas;

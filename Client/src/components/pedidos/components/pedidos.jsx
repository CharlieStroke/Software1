import { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import { getComandasAbiertasApi } from '../../../api/comandasApi';
import { getInventarioActivoApi } from '../../../api/inventarioApi';
import { createPedidoApi } from '../../../api/pedidosApi';
import { getSucursalesActivas } from '../../../api/sucursalApi';
import { useAuth } from '../../../context/AuthContext';
import ModuleHeader from '../../../shared/ModuleHeader';
import '../componentsCss/pedidos.css';
import deleteIcon from '../../../assets/delete.svg';

const Pedidos = () => {
    const { user } = useAuth();

    // Esquema de validación dinámico basado en el rol del usuario
    const pedidoValidationSchema = Yup.object({
        sucursal_id: user?.rol === 'admin'
            ? Yup.number()
                .required('Debe seleccionar una sucursal')
                .positive('Debe seleccionar una sucursal válida')
                .integer('El ID de sucursal debe ser un entero')
            : Yup.number()
                .nullable()
                .positive('Debe seleccionar una sucursal válida')
                .integer('El ID de sucursal debe ser un entero'),
        comanda_id: Yup.number()
            .nullable()
            .positive('Debe seleccionar una comanda válida')
            .integer('El ID de comanda debe ser un entero'),
        tipo_pedido: Yup.string()
            .required('Debe seleccionar el tipo de pedido')
            .oneOf(['mesa', 'llevar', 'delivery'], 'Tipo de pedido inválido'),
        detalles: Yup.array()
            .of(Yup.object({
                producto_id: Yup.number()
                    .required('Debe seleccionar un producto')
                    .positive('Producto inválido'),
                cantidad: Yup.number()
                    .required('La cantidad es obligatoria')
                    .positive('La cantidad debe ser mayor a 0')
                    .min(1, 'La cantidad mínima es 1'),
                precio_unitario: Yup.number()
                    .required('El precio es obligatorio')
                    .positive('El precio debe ser mayor a 0'),
                notas_item: Yup.string()
                    .max(200, 'Las notas no pueden exceder 200 caracteres')
            }))
            .min(1, 'Debe agregar al menos un producto')
            .required('Los productos son obligatorios'),
        notas: Yup.string()
            .max(500, 'Las observaciones no pueden exceder 500 caracteres')
    });
    const [comandasAbiertas, setComandasAbiertas] = useState([]);
    const [productos, setProductos] = useState([]);
    const [sucursales, setSucursales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Cargar datos iniciales
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setLoading(true);
                const promises = [
                    getComandasAbiertasApi(),
                    getInventarioActivoApi()
                ];
                
                // Si es admin, cargar también las sucursales
                if (user?.rol === 'admin') {
                    promises.push(getSucursalesActivas());
                }
                
                const results = await Promise.all(promises);
                
                setComandasAbiertas(results[0]);
                setProductos(results[1]);
                if (user?.rol === 'admin' && results[2]) {
                    // La API devuelve {sucursales: [], total: n}
                    const sucursalesData = results[2].sucursales || results[2];
                    console.log('Sucursales cargadas:', sucursalesData);
                    setSucursales(sucursalesData);
                }
                setError(null);
            } catch (err) {
                console.error('Error al cargar datos:', err);
                setError('Error al cargar los datos necesarios');
            } finally {
                setLoading(false);
            }
        };

        cargarDatos();
    }, [user?.rol]);

    const calcularTotal = (detalles) => {
        if (!detalles || detalles.length === 0) return '0.00';
        
        let subtotal = 0;
        detalles.forEach(detalle => {
            if (detalle.producto_id && detalle.cantidad) {
                const producto = productos.find(p => p.id === parseInt(detalle.producto_id));
                if (producto) {
                    subtotal += producto.precio * detalle.cantidad;
                }
            }
        });

        const impuestos = subtotal * 0.16;
        const total = subtotal + impuestos;
        return total.toFixed(2);
    };

    const crearPedido = async (valores, { resetForm, setSubmitting }) => {
        try {
            // Filtrar detalles válidos
            const detallesValidos = valores.detalles.filter(d => 
                d.producto_id && d.cantidad && d.precio_unitario
            );

            if (detallesValidos.length === 0) {
                alert('Debe agregar al menos un producto al pedido');
                setSubmitting(false);
                return;
            }

            const pedidoData = {
                sucursal_id: parseInt(valores.sucursal_id) || user.sucursal_id,
                tipo_pedido: valores.tipo_pedido,
                notas: valores.notas || null,
                comanda_id: valores.comanda_id ? parseInt(valores.comanda_id) : null, // Si no se selecciona, el backend creará una nueva
                detalles: detallesValidos
            };

            const response = await createPedidoApi(pedidoData);

            let mensaje = 'Pedido creado exitosamente';
            if (response.comanda_creada) {
                mensaje += ' (Se creó una nueva comanda automáticamente)';
            }

            alert(mensaje);
            
            // Recargar comandas abiertas
            const comandasData = await getComandasAbiertasApi();
            setComandasAbiertas(comandasData);

            resetForm();
            
        } catch (error) {
            console.error('Error al crear pedido:', error);
            alert(error.response?.data?.message || 'Error al crear el pedido');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="loading">Cargando datos...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="pedidos-container">
            <ModuleHeader 
                title="Tomar Pedido"
                subtitle="Crea un nuevo pedido para tus clientes"
                showButton={false}
            />

            <Formik
                initialValues={{
                    sucursal_id: user?.sucursal_id || '',
                    comanda_id: '',
                    tipo_pedido: 'mesa',
                    detalles: [{ producto_id: '', cantidad: 1, precio_unitario: 0, notas_item: '' }],
                    notas: ''
                }}
                validationSchema={pedidoValidationSchema}
                onSubmit={crearPedido}
            >
                {({ values, errors, touched, isSubmitting, setFieldValue }) => (
                    <Form className="formulario-pedido">
                        <div className="pedido-layout">
                            <div className="pedido-main">
                                <div className="seccion-card">
                                    <div className="seccion-header">
                                        <h3>Información del Pedido</h3>
                                    </div>
                                    <div className="seccion-content">
                                        {user?.rol === 'admin' && (
                                            <div className="form-group">
                                                <label htmlFor="sucursal_id">Sucursal *</label>
                                                <Field
                                                    as="select"
                                                    id="sucursal_id"
                                                    name="sucursal_id"
                                                    className={`form-input ${errors.sucursal_id && touched.sucursal_id ? 'error' : ''}`}
                                                >
                                                    <option value="">Seleccionar sucursal</option>
                                                    {Array.isArray(sucursales) && sucursales.map(sucursal => (
                                                        <option key={sucursal.id} value={sucursal.id}>
                                                            {sucursal.nombre}
                                                        </option>
                                                    ))}
                                                </Field>
                                                <ErrorMessage name="sucursal_id" component="span" className="error-message" />
                                            </div>
                                        )}
                                        <div className="form-group">
                                            <label htmlFor="tipo_pedido">Tipo de Pedido *</label>
                                            <Field
                                                as="select"
                                                id="tipo_pedido"
                                                name="tipo_pedido"
                                                className={`form-input ${errors.tipo_pedido && touched.tipo_pedido ? 'error' : ''}`}
                                            >
                                                <option value="mesa">Mesa</option>
                                                <option value="llevar">Para Llevar</option>
                                                <option value="delivery">Delivery</option>
                                            </Field>
                                            <ErrorMessage name="tipo_pedido" component="span" className="error-message" />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="comanda_id">
                                                Comanda {values.tipo_pedido === 'mesa' ? '(opcional)' : ''}
                                            </label>
                                            {values.tipo_pedido === 'mesa' && (
                                                <small className="help-text">Si no selecciona una, se creará automáticamente</small>
                                            )}
                                            <Field
                                                as="select"
                                                id="comanda_id"
                                                name="comanda_id"
                                                className={`form-input ${errors.comanda_id && touched.comanda_id ? 'error' : ''}`}
                                                disabled={values.tipo_pedido !== 'mesa'}
                                            >
                                                <option value="">Nueva comanda</option>
                                                {comandasAbiertas.map(comanda => (
                                                    <option key={comanda.id} value={comanda.id}>
                                                        Comanda #{comanda.id} - {comanda.usuario_nombre} - ${comanda.total_comanda}
                                                    </option>
                                                ))}
                                            </Field>
                                            <ErrorMessage name="comanda_id" component="span" className="error-message" />
                                        </div>
                                    </div>
                                </div>

                                <div className="seccion-card">
                                    <div className="seccion-header">
                                        <h3>Productos del Pedido</h3>
                                        <span className="productos-count">{values.detalles.length} producto(s)</span>
                                    </div>
                                    <div className="seccion-content">
                                        <FieldArray name="detalles">
                                            {({ push, remove }) => (
                                                <div className="items-container">
                                                    {values.detalles.map((detalle, index) => {
                                                        const producto = productos.find(p => p.id === parseInt(detalle.producto_id));
                                                        const subtotalItem = producto ? producto.precio * (detalle.cantidad || 0) : 0;
                                                        
                                                        return (
                                                            <div key={index} className="item-row">
                                                                <div className="item-numero">#{index + 1}</div>
                                                                <div className="item-inputs-grid">
                                                                    <div className="form-group">
                                                                        <label>Producto *</label>
                                                                        <Field
                                                                            as="select"
                                                                            name={`detalles.${index}.producto_id`}
                                                                            className={`form-input ${errors.detalles?.[index]?.producto_id && touched.detalles?.[index]?.producto_id ? 'error' : ''}`}
                                                                            onChange={(e) => {
                                                                                const productoId = e.target.value;
                                                                                setFieldValue(`detalles.${index}.producto_id`, productoId);
                                                                                
                                                                                const producto = productos.find(p => p.id === parseInt(productoId));
                                                                                if (producto) {
                                                                                    setFieldValue(`detalles.${index}.precio_unitario`, producto.precio);
                                                                                }
                                                                            }}
                                                                        >
                                                                            <option value="">Seleccione un producto</option>
                                                                            {productos.map((prod) => (
                                                                                <option key={prod.id} value={prod.id}>
                                                                                    {prod.nombre} - ${prod.precio} • {prod.stock_actual} disponibles
                                                                                </option>
                                                                            ))}
                                                                        </Field>
                                                                        <ErrorMessage name={`detalles.${index}.producto_id`} component="span" className="error-message" />
                                                                    </div>

                                                                    <div className="form-group">
                                                                        <label>Cantidad *</label>
                                                                        <Field
                                                                            type="number"
                                                                            name={`detalles.${index}.cantidad`}
                                                                            placeholder="0"
                                                                            min="1"
                                                                            className={`form-input ${errors.detalles?.[index]?.cantidad && touched.detalles?.[index]?.cantidad ? 'error' : ''}`}
                                                                        />
                                                                        <ErrorMessage name={`detalles.${index}.cantidad`} component="span" className="error-message" />
                                                                    </div>

                                                                    <div className="form-group">
                                                                        <label>Precio Unit.</label>
                                                                        <div className="precio-display">
                                                                            ${detalle.precio_unitario ? parseFloat(detalle.precio_unitario).toFixed(2) : '0.00'}
                                                                        </div>
                                                                        <Field
                                                                            type="hidden"
                                                                            name={`detalles.${index}.precio_unitario`}
                                                                        />
                                                                    </div>

                                                                    <div className="form-group">
                                                                        <label>Notas</label>
                                                                        <Field
                                                                            type="text"
                                                                            name={`detalles.${index}.notas_item`}
                                                                            placeholder="Opcional"
                                                                            className="form-input"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                
                                                                <div className="item-actions">
                                                                    <div className="item-subtotal">
                                                                        ${subtotalItem.toFixed(2)}
                                                                    </div>
                                                                    {values.detalles.length > 1 && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => remove(index)}
                                                                            className="btn-eliminar-item"
                                                                            title="Eliminar producto"
                                                                        >
                                                                            <img src={deleteIcon} alt="Delete" width="16" height="16" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                    
                                                    <button
                                                        type="button"
                                                        onClick={() => push({ producto_id: '', cantidad: 1, precio_unitario: 0, notas_item: '' })}
                                                        className="btn-agregar-item"
                                                    >
                                                        + Agregar Otro Producto
                                                    </button>
                                                </div>
                                            )}
                                        </FieldArray>
                                    </div>
                                </div>

                                <div className="seccion-card">
                                    <div className="seccion-header">
                                        <h3>Observaciones</h3>
                                    </div>
                                    <div className="seccion-content">
                                        <div className="form-group">
                                            <Field
                                                as="textarea"
                                                name="notas"
                                                placeholder="Observaciones especiales del pedido..."
                                                className={`form-textarea ${errors.notas && touched.notas ? 'error' : ''}`}
                                                rows="3"
                                            />
                                            <ErrorMessage name="notas" component="span" className="error-message" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pedido-sidebar">
                                <div className="resumen-card">
                                    <h3>Resumen del Pedido</h3>
                                    <div className="resumen-content">
                                        <div className="resumen-item">
                                            <span>Productos:</span>
                                            <span>{values.detalles.filter(d => d.producto_id).length}</span>
                                        </div>
                                        <div className="resumen-item">
                                            <span>Subtotal:</span>
                                            <span>${(() => {
                                                let subtotal = 0;
                                                values.detalles.forEach(d => {
                                                    if (d.producto_id && d.cantidad) {
                                                        const prod = productos.find(p => p.id === parseInt(d.producto_id));
                                                        if (prod) subtotal += prod.precio * d.cantidad;
                                                    }
                                                });
                                                return subtotal.toFixed(2);
                                            })()}</span>
                                        </div>
                                        <div className="resumen-item">
                                            <span>IVA (16%):</span>
                                            <span>${(() => {
                                                let subtotal = 0;
                                                values.detalles.forEach(d => {
                                                    if (d.producto_id && d.cantidad) {
                                                        const prod = productos.find(p => p.id === parseInt(d.producto_id));
                                                        if (prod) subtotal += prod.precio * d.cantidad;
                                                    }
                                                });
                                                return (subtotal * 0.16).toFixed(2);
                                            })()}</span>
                                        </div>
                                        <div className="resumen-divider"></div>
                                        <div className="resumen-total">
                                            <span>Total:</span>
                                            <span>${calcularTotal(values.detalles)}</span>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        className="btn-tomar-pedido"
                                        disabled={isSubmitting || values.detalles.every(d => !d.producto_id)}
                                    >
                                        {isSubmitting ? 'Procesando...' : 'Confirmar Pedido'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default Pedidos;

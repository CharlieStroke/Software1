import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import '../componentsCss/pedidos.css';

// Esquema de validación para pedidos
const pedidoValidationSchema = Yup.object({
    mesa: Yup.number()
        .required('Debe seleccionar una mesa')
        .positive('Debe seleccionar una mesa válida')
        .integer('El número de mesa debe ser un entero'),
    items: Yup.array()
        .of(Yup.string()
            .required('El item no puede estar vacío')
            .min(3, 'El item debe tener al menos 3 caracteres')
            .max(50, 'El item no puede exceder 50 caracteres'))
        .min(1, 'Debe tener al menos un item')
        .required('Los items son obligatorios'),
    usuarioAsignado: Yup.string()
        .required('Debe asignar un usuario'),
    observaciones: Yup.string()
        .max(200, 'Las observaciones no pueden exceder 200 caracteres')
});

const Pedidos = () => {

    const usuariosDisponibles = [
        { id: 1, nombre: 'Juan Pérez', rol: 'administrador' },
        { id: 2, nombre: 'María García', rol: 'mesero' },
        { id: 3, nombre: 'Carlos López', rol: 'mesero' },
        { id: 4, nombre: 'Ana Rodríguez', rol: 'administrador' },
        { id: 5, nombre: 'Luis Martín', rol: 'mesero' }
    ];

    const mesasDisponibles = [1, 2, 3, 4, 5, 6, 7];

    const productosDisponibles = [
        { nombre: 'Pizza Margherita', precio: 15.00 },
        { nombre: 'Pizza Pepperoni', precio: 17.00 },
        { nombre: 'Hamburguesa', precio: 8.50 },
        { nombre: 'Papas fritas', precio: 3.50 },
        { nombre: 'Ensalada César', precio: 7.00 },
        { nombre: 'Coca-Cola', precio: 2.50 },
        { nombre: 'Agua', precio: 2.00 },
        { nombre: 'Cerveza', precio: 4.00 }
    ];

    const calcularTotal = (items) => {
        let total = 0;
        items.forEach(item => {
            const producto = productosDisponibles.find(p => p.nombre === item);
            if (producto) {
                total += producto.precio;
            }
        });
        return total.toFixed(2);
    };

    const crearPedido = async (valores, { resetForm }) => {
        try {
            await pedidoValidationSchema.validate(valores, { abortEarly: false });
            
            const itemsValidos = valores.items.filter(item => item !== '');
            const total = parseFloat(calcularTotal(itemsValidos));
            const usuarioSeleccionado = usuariosDisponibles.find(u => u.id === parseInt(valores.usuarioAsignado));

            const pedidoCompleto = {
                mesa: valores.mesa,
                items: itemsValidos,
                usuarioAsignado: usuarioSeleccionado,
                observaciones: valores.observaciones,
                total: total,
                fecha: new Date().toLocaleDateString('es-ES'),
                hora: new Date().toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})
            };

            // Convertir pedido a comanda
            const productosComanda = itemsValidos.map(item => {
                const producto = productosDisponibles.find(p => p.nombre === item);
                return {
                    nombre: producto.nombre,
                    cantidad: 1,
                    precio: producto.precio
                };
            });

            const nuevaComanda = {
                id: Date.now(),
                mesa: valores.mesa,
                nombrePedido: `Pedido ${usuarioSeleccionado.nombre}`,
                productos: productosComanda,
                total: total
            };

            // Guardar en localStorage
            const comandasGuardadas = JSON.parse(localStorage.getItem('comandas') || '[]');
            comandasGuardadas.push(nuevaComanda);
            localStorage.setItem('comandas', JSON.stringify(comandasGuardadas));

            alert(`Pedido tomado exitosamente para Mesa ${valores.mesa}. Total: $${total}`);
            resetForm();
            
        } catch (error) {
            console.error('Error al crear pedido:', error);
            throw error;
        }
    };

    return (
        <div className="pedidos-container">
            <Formik
                initialValues={{
                    mesa: '',
                    items: [''],
                    usuarioAsignado: '',
                    observaciones: ''
                }}
                validationSchema={pedidoValidationSchema}
                onSubmit={crearPedido}
            >
                {({ values, errors, touched, isSubmitting }) => (
                    <>
                        <div className="pedidos-header">
                            <h2>Tomar Pedido</h2>
                            <div className="total-display">
                                Total: <span className="total-amount">${calcularTotal(values.items)}</span>
                            </div>
                        </div>

                        <Form className="formulario-pedido">
                            <div className="seccion-atencion">
                                <div className="form-group">
                                    <label htmlFor="mesa">Mesa *</label>
                                    <Field
                                        as="select"
                                        id="mesa"
                                        name="mesa"
                                        className={`form-input ${errors.mesa && touched.mesa ? 'error' : ''}`}
                                    >
                                        <option value="">Seleccione una mesa</option>
                                        {mesasDisponibles.map(mesa => (
                                            <option key={mesa} value={mesa}>
                                                Mesa {mesa}
                                            </option>
                                        ))}
                                    </Field>
                                    <ErrorMessage name="mesa" component="span" className="error-message" />
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="usuarioAsignado">Atendido por *</label>
                                    <Field
                                        as="select"
                                        id="usuarioAsignado"
                                        name="usuarioAsignado"
                                        className={`form-input ${errors.usuarioAsignado && touched.usuarioAsignado ? 'error' : ''}`}
                                    >
                                        <option value="">Seleccione quien atiende</option>
                                        {usuariosDisponibles.map(usuario => (
                                            <option key={usuario.id} value={usuario.id}>
                                                {usuario.nombre} ({usuario.rol})
                                            </option>
                                        ))}
                                    </Field>
                                    <ErrorMessage name="usuarioAsignado" component="span" className="error-message" />
                                </div>
                            </div>

                            <div className="seccion-items">
                                <h3>Items del Pedido</h3>
                                <FieldArray name="items">
                                    {({ push, remove }) => (
                                        <div className="items-container">
                                            {values.items.map((item, index) => (
                                                <div key={index} className="item-row">
                                                    <div className="item-input-container">
                                                        <Field
                                                            as="select"
                                                            name={`items.${index}`}
                                                            className={`form-input item-input ${errors.items?.[index] && touched.items?.[index] ? 'error' : ''}`}
                                                        >
                                                            <option value="">Seleccione un producto</option>
                                                            {productosDisponibles.map((producto, i) => (
                                                                <option key={i} value={producto.nombre}>
                                                                    {producto.nombre} - ${producto.precio}
                                                                </option>
                                                            ))}
                                                        </Field>
                                                        <ErrorMessage name={`items.${index}`} component="span" className="error-message" />
                                                    </div>
                                                    
                                                    {values.items.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => remove(index)}
                                                            className="btn-eliminar-item"
                                                        >
                                                            ×
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            
                                            <button
                                                type="button"
                                                onClick={() => push('')}
                                                className="btn-agregar-item"
                                            >
                                                + Agregar Item
                                            </button>
                                        </div>
                                    )}
                                </FieldArray>
                            </div>

                            <div className="seccion-observaciones">
                                <h3>Observaciones</h3>
                                <div className="form-group">
                                    <Field
                                        as="textarea"
                                        name="observaciones"
                                        placeholder="Observaciones especiales del pedido..."
                                        className={`form-textarea ${errors.observaciones && touched.observaciones ? 'error' : ''}`}
                                        rows="3"
                                    />
                                    <ErrorMessage name="observaciones" component="span" className="error-message" />
                                </div>
                            </div>

                            <div className="form-actions">
                                <button
                                    type="submit"
                                    className="btn-tomar-pedido"
                                    disabled={isSubmitting || values.items.every(item => !item)}
                                >
                                    {isSubmitting ? 'Procesando...' : 'Tomar Pedido'}
                                </button>
                            </div>
                        </Form>
                    </>
                )}
            </Formik>
        </div>
    );
};

export default Pedidos;

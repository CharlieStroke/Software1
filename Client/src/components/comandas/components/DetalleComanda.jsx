import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../componentsCss/comandas.css';

const DetalleComanda = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Simulación de datos - en una aplicación real, esto vendría de props o API
    const comanda = {
        id: parseInt(id),
        mesa: 5,
        nombrePedido: 'Pedido Juan Pérez',
        productos: [
            { nombre: 'Pizza Margherita', cantidad: 1, precio: 15.00 },
            { nombre: 'Coca Cola', cantidad: 1, precio: 2.50 }
        ],
        total: 17.50,
        estado: 'pendiente',
        fecha: new Date().toLocaleString()
    };

    const getEstadoClass = (estado) => {
        switch(estado) {
            case 'pendiente': return 'estado-pendiente';
            case 'en-preparacion': return 'estado-preparacion';
            case 'listo': return 'estado-listo';
            default: return '';
        }
    };

    const calcularSubtotal = () => {
        return comanda.productos.reduce((total, producto) => total + (producto.precio * producto.cantidad), 0);
    };

    return (
        <div className="comandas-container">
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h2>Detalles del Pedido</h2>
                        <p style={{ color: 'var(--gris-medio)', margin: 0 }}>
                            ID: {comanda.id} • {comanda.fecha}
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/comandas')}
                        className="btn-nueva-comanda"
                    >
                        ← Volver a Comandas
                    </button>
                </div>

                {/* Order Summary Card */}
                <div className="comanda-card" style={{ marginBottom: '2rem' }}>
                    <div className="comanda-header">
                        <span className="mesa-number">Mesa {comanda.mesa}</span>
                        <span className={`estado-badge ${getEstadoClass(comanda.estado)}`}>
                            {comanda.estado.replace('-', ' ').toUpperCase()}
                        </span>
                    </div>

                    <div className="comanda-body">
                        <h3 style={{ color: 'var(--verde-oscuro)', marginBottom: '1rem' }}>
                            {comanda.nombrePedido}
                        </h3>

                        {/* Products Table */}
                        <div style={{ marginBottom: '2rem' }}>
                            <h4 style={{ marginBottom: '1rem', color: 'var(--verde-oscuro)' }}>
                                Productos
                            </h4>
                            <div style={{
                                backgroundColor: 'var(--verde-fondo)',
                                borderRadius: '8px',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '2fr 1fr 1fr 1fr',
                                    gap: '1rem',
                                    padding: '1rem',
                                    backgroundColor: 'var(--verde-principal)',
                                    color: 'var(--blanco)',
                                    fontWeight: 'bold'
                                }}>
                                    <span>Producto</span>
                                    <span style={{ textAlign: 'center' }}>Cantidad</span>
                                    <span style={{ textAlign: 'center' }}>Precio Unit.</span>
                                    <span style={{ textAlign: 'right' }}>Subtotal</span>
                                </div>

                                {comanda.productos.map((producto, index) => (
                                    <div key={index} style={{
                                        display: 'grid',
                                        gridTemplateColumns: '2fr 1fr 1fr 1fr',
                                        gap: '1rem',
                                        padding: '1rem',
                                        borderBottom: '1px solid var(--verde-claro)',
                                        alignItems: 'center'
                                    }}>
                                        <span style={{ fontWeight: '500' }}>{producto.nombre}</span>
                                        <span style={{ textAlign: 'center' }}>{producto.cantidad}</span>
                                        <span style={{ textAlign: 'center' }}>${producto.precio.toFixed(2)}</span>
                                        <span style={{ textAlign: 'right', fontWeight: 'bold' }}>
                                            ${(producto.precio * producto.cantidad).toFixed(2)}
                                        </span>
                                    </div>
                                ))}

                                {/* Total Row */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '2fr 1fr 1fr 1fr',
                                    gap: '1rem',
                                    padding: '1rem',
                                    backgroundColor: 'var(--verde-muy-claro)',
                                    fontWeight: 'bold',
                                    fontSize: '1.1rem'
                                }}>
                                    <span style={{ textAlign: 'right' }}>TOTAL:</span>
                                    <span style={{ textAlign: 'center' }}>
                                        {comanda.productos.reduce((total, producto) => total + producto.cantidad, 0)}
                                    </span>
                                    <span></span>
                                    <span style={{ textAlign: 'right', color: 'var(--verde-principal)' }}>
                                        ${comanda.total.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Order Actions */}
                        <div className="comanda-actions">
                            <button
                                onClick={() => navigate('/comandas')}
                                className="btn-accion btn-detalles"
                            >
                                Volver al Listado
                            </button>
                            {comanda.estado === 'pendiente' && (
                                <button
                                    onClick={() => {/* cambiarEstado(comanda.id, 'en-preparacion') */}}
                                    className="btn-accion btn-preparar"
                                >
                                    Marcar en Preparación
                                </button>
                            )}
                            {comanda.estado === 'en-preparacion' && (
                                <button
                                    onClick={() => {/* cambiarEstado(comanda.id, 'listo') */}}
                                    className="btn-accion btn-listo"
                                >
                                    Marcar Listo
                                </button>
                            )}
                            {comanda.estado === 'listo' && (
                                <button
                                    onClick={() => {/* cambiarEstado(comanda.id, 'entregado') */}}
                                    className="btn-accion btn-entregar"
                                >
                                    Marcar Entregado
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Additional Information */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1rem'
                }}>
                    <div className="comanda-card">
                        <h4 style={{ color: 'var(--verde-oscuro)', marginBottom: '1rem' }}>
                            Información del Pedido
                        </h4>
                        <div style={{ lineHeight: '1.6' }}>
                            <p><strong>Número de Mesa:</strong> {comanda.mesa}</p>
                            <p><strong>Estado:</strong> {comanda.estado.replace('-', ' ').toUpperCase()}</p>
                            <p><strong>Fecha:</strong> {comanda.fecha}</p>
                        </div>
                    </div>

                    <div className="comanda-card">
                        <h4 style={{ color: 'var(--verde-oscuro)', marginBottom: '1rem' }}>
                            Resumen
                        </h4>
                        <div style={{ lineHeight: '1.6' }}>
                            <p><strong>Productos:</strong> {comanda.productos.length}</p>
                            <p><strong>Cantidad Total:</strong> {comanda.productos.reduce((total, producto) => total + producto.cantidad, 0)}</p>
                            <p><strong>Total a Pagar:</strong> <span style={{ color: 'var(--verde-principal)', fontSize: '1.2rem', fontWeight: 'bold' }}>${comanda.total.toFixed(2)}</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetalleComanda;

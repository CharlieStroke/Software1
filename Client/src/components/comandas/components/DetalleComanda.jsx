import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../componentsCss/comandas.css';

const DetalleComanda = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [comanda, setComanda] = useState(null);

    useEffect(() => {
        // Buscar la comanda en localStorage
        const comandasGuardadas = JSON.parse(localStorage.getItem('comandas') || '[]');
        const comandaEncontrada = comandasGuardadas.find(c => c.id === parseInt(id));

        if (comandaEncontrada) {
            setComanda({
                ...comandaEncontrada,
                estado: 'pendiente',
                fecha: new Date().toLocaleString(),
                // Agregar información del pedido si está disponible
                usuarioAsignado: comandaEncontrada.usuarioAsignado || 'Usuario no asignado',
                observaciones: comandaEncontrada.observaciones || ''
            });
        } else {
            // Comanda hardcodeada si no se encuentra
            setComanda({
                id: parseInt(id),
                mesa: 5,
                nombrePedido: 'Pedido Juan Pérez',
                productos: [
                    { nombre: 'Pizza Margherita', cantidad: 1, precio: 15.00 },
                    { nombre: 'Coca Cola', cantidad: 1, precio: 2.50 }
                ],
                total: 17.50,
                estado: 'pendiente',
                fecha: new Date().toLocaleString(),
                usuarioAsignado: 'María García',
                observaciones: ''
            });
        }
    }, [id]);

    const getEstadoClass = (estado) => {
        switch(estado) {
            case 'pendiente': return 'estado-pendiente';
            case 'en-preparacion': return 'estado-preparacion';
            case 'listo': return 'estado-listo';
            default: return '';
        }
    };

    const calcularSubtotal = () => {
        return comanda?.productos.reduce((total, producto) => total + (producto.precio * producto.cantidad), 0) || 0;
    };

    if (!comanda) {
        return <div className="comandas-container">Cargando...</div>;
    }

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

                {/* Información del Pedido */}
                <div className="comanda-card" style={{ marginBottom: '2rem' }}>
                    <h3 style={{ color: 'var(--verde-oscuro)', marginBottom: '1rem' }}>
                        Información del Pedido
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <strong>Mesa:</strong> {comanda.mesa}
                        </div>
                        <div>
                            <strong>Atendido por:</strong> {comanda.usuarioAsignado}
                        </div>
                    </div>
                    {comanda.observaciones && (
                        <div style={{ marginTop: '1rem' }}>
                            <strong>Observaciones:</strong>
                            <p style={{ margin: '0.5rem 0', color: 'var(--gris-medio)' }}>
                                {comanda.observaciones}
                            </p>
                        </div>
                    )}
                </div>

                {/* Products Table */}
                <div className="comanda-card">
                    <h3 style={{ color: 'var(--verde-oscuro)', marginBottom: '1rem' }}>
                        {comanda.nombrePedido}
                    </h3>
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


            </div>
        </div>
    );
};

export default DetalleComanda;

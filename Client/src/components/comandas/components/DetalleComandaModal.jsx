import React, { useState, useEffect } from 'react';
import * as comandasApi from '../../../api/comandasApi';
import '../componentsCss/comandas.css';

const DetalleComanda = ({ comanda, onClose }) => {
  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actualizandoEstado, setActualizandoEstado] = useState(null);

  useEffect(() => {
    const cargarDetalle = async () => {
      try {
        setLoading(true);
        const data = await comandasApi.getComandaByIdApi(comanda.id);
        setDetalle(data);
      } catch (err) {
        console.error('Error al cargar detalle:', err);
        // Usar datos básicos de la comanda si falla
        setDetalle(comanda);
      } finally {
        setLoading(false);
      }
    };

    if (comanda?.id) {
      cargarDetalle();
    }
  }, [comanda]);

  const handleCambiarEstadoPedido = async (pedidoId, nuevoEstado) => {
    try {
      setActualizandoEstado(pedidoId);
      const response = await fetch(`http://localhost:3000/api/pedidos/${pedidoId}/estado`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });

      if (!response.ok) throw new Error('Error al actualizar estado');

      // Recargar detalle
      const data = await comandasApi.getComandaByIdApi(comanda.id);
      setDetalle(data);
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      alert('Error al actualizar el estado del pedido');
    } finally {
      setActualizandoEstado(null);
    }
  };

  if (!comanda) return null;

  /* FORMATEAR FECHA */
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-detalle-comanda" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Detalle de Comanda #{comanda.id}</h3>
          <button className="modal-close" onClick={onClose}>X</button>
        </div>

        {loading ? (
          <div className="modal-body">
            <div className="spinner"></div>
            <p>Cargando detalle...</p>
          </div>
        ) : (
          <div className="modal-body">
            {/* INFORMACIÓN GENERAL */}
            <div className="detalle-section">
              <h4>Información General</h4>
              <div className="detalle-grid">
                <div className="detalle-item">
                  <strong>Fecha Creación:</strong>
                  <span>{formatearFecha(detalle.fecha_creacion)}</span>
                </div>
                <div className="detalle-item">
                  <strong>Sucursal:</strong>
                  <span>{detalle.sucursal_nombre}</span>
                </div>
                <div className="detalle-item">
                  <strong>Mesero:</strong>
                  <span>{detalle.usuario_nombre}</span>
                </div>
                <div className="detalle-item">
                  <strong>Estatus:</strong>
                  <span className={`badge badge-${detalle.estatus}`}>{detalle.estatus}</span>
                </div>
              </div>
            </div>

            {/* PEDIDOS DE LA COMANDA */}
            <div className="detalle-section">
              <h4>Pedidos ({detalle.pedidos?.length || 0})</h4>
              {detalle.pedidos && detalle.pedidos.length > 0 ? (
                <div className="pedidos-list">
                  {detalle.pedidos.map((pedido) => (
                    <div key={pedido.id} className="pedido-card">
                      <div className="pedido-header">
                        <h5>Pedido #{pedido.numero_pedido}</h5>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span className={`badge badge-${pedido.estado}`}>{pedido.estado}</span>
                          <span className={`badge badge-pago badge-${pedido.estado_pago || 'pendiente'}`}>
                            {pedido.estado_pago === 'pagado' ? 'Pagado' : pedido.estado_pago === 'parcial' ? 'Pago Parcial' : 'Pendiente Pago'}
                          </span>
                          {pedido.estado !== 'entregado' && pedido.estado !== 'cancelado' && (
                            <button
                              className="btn-cambiar-estado"
                              onClick={() => handleCambiarEstadoPedido(pedido.id, 'entregado')}
                              disabled={actualizandoEstado === pedido.id}
                            >
                              {actualizandoEstado === pedido.id ? 'Actualizando...' : 'Marcar Entregado'}
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="pedido-info">
                        <div className="detalle-item">
                          <strong>Tipo:</strong>
                          <span>{pedido.tipo_pedido}</span>
                        </div>
                        {pedido.cliente_nombre && (
                          <div className="detalle-item">
                            <strong>Cliente:</strong>
                            <span>{pedido.cliente_nombre} {pedido.cliente_apellido}</span>
                          </div>
                        )}
                        <div className="detalle-item">
                          <strong>Fecha:</strong>
                          <span>{formatearFecha(pedido.fecha_pedido)}</span>
                        </div>
                      </div>
                      
                      {pedido.detalle && pedido.detalle.length > 0 && (
                        <div className="table-container">
                          <table className="table">
                            <thead>
                              <tr>
                                <th>Producto</th>
                                <th>Cantidad</th>
                                <th>Precio Unit.</th>
                                <th>Subtotal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {pedido.detalle.map((item, index) => (
                                <tr key={index}>
                                  <td>
                                    <strong>{item.producto_nombre}</strong>
                                    {item.notas_item && (
                                      <div className="item-notas">{item.notas_item}</div>
                                    )}
                                  </td>
                                  <td>{item.cantidad}</td>
                                  <td>${parseFloat(item.precio_unitario).toFixed(2)}</td>
                                  <td><strong>${parseFloat(item.subtotal).toFixed(2)}</strong></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      <div className="pedido-totales">
                        <div className="total-row">
                          <span>Subtotal:</span>
                          <span>${parseFloat(pedido.subtotal).toFixed(2)}</span>
                        </div>
                        {parseFloat(pedido.impuestos) > 0 && (
                          <div className="total-row">
                            <span>Impuestos:</span>
                            <span>${parseFloat(pedido.impuestos).toFixed(2)}</span>
                          </div>
                        )}
                        {parseFloat(pedido.descuento || 0) > 0 && (
                          <div className="total-row descuento">
                            <span>Descuento:</span>
                            <span>-${parseFloat(pedido.descuento).toFixed(2)}</span>
                          </div>
                        )}
                        <div className="total-row total-final">
                          <span>TOTAL:</span>
                          <span>${parseFloat(pedido.total).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-message">No hay pedidos en esta comanda</p>
              )}
            </div>

            {/* TOTAL GENERAL DE LA COMANDA */}
            {detalle.pedidos && detalle.pedidos.length > 0 && (
              <div className="detalle-section">
                <div className="detalle-totales">
                  <div className="total-row total-final">
                    <span>TOTAL COMANDA:</span>
                    <span>${detalle.pedidos.reduce((sum, p) => sum + parseFloat(p.total), 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetalleComanda;

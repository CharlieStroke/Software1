import React, { useState, useEffect } from 'react';
import * as pagosApi from '../../../api/pagosApi';
import billingIcon from '../../../assets/billing.svg';
import '../componentsCss/ModalPago.css';

const ModalPago = ({ comanda, onClose, onPagoExitoso }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Estados para el pago
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [montoTotal, setMontoTotal] = useState('');
  const [montoEfectivo, setMontoEfectivo] = useState('');
  const [montoTarjeta, setMontoTarjeta] = useState('');
  const [montoTransferencia, setMontoTransferencia] = useState('');
  const [montoRecibido, setMontoRecibido] = useState('');
  const [propina, setPropina] = useState('');
  const [porcentajePropina, setPorcentajePropina] = useState(null); // 10, 15, 20 o null para 'otro'
  const [referenciaPago, setReferenciaPago] = useState('');
  const [notas, setNotas] = useState('');

  // Calcular totales - asegurar que sean números y excluir pedidos ya pagados
  const pedidosPendientes = comanda.pedidos?.filter(p => p.estado_pago === 'pendiente' || !p.estado_pago) || [];
  const totalComanda = parseFloat(
    comanda.total_comanda || 
    pedidosPendientes.reduce((sum, p) => sum + parseFloat(p.total || 0), 0) || 
    0
  );
  const totalPagado = parseFloat(comanda.total_pagado || 0);
  const saldoPendiente = parseFloat((totalComanda - totalPagado).toFixed(2));
  
  // Inicializar monto total con el saldo pendiente
  useEffect(() => {
    setMontoTotal(saldoPendiente);
    if (metodoPago === 'efectivo') {
      setMontoEfectivo(saldoPendiente);
    } else if (metodoPago === 'tarjeta') {
      setMontoTarjeta(saldoPendiente);
    } else if (metodoPago === 'transferencia') {
      setMontoTransferencia(saldoPendiente);
    }
  }, [saldoPendiente, metodoPago]);

  // Calcular cambio para pagos en efectivo (considerando propina)
  const totalConPropina = parseFloat(montoTotal || 0) + parseFloat(propina || 0);
  const cambio = metodoPago === 'efectivo' ? Math.max(0, parseFloat(montoRecibido || 0) - totalConPropina) : 0;

  // Validar suma de pagos mixtos
  const sumaPagosMixtos = parseFloat(montoEfectivo || 0) + parseFloat(montoTarjeta || 0) + parseFloat(montoTransferencia || 0);
  const esPagoMixtoValido = metodoPago !== 'mixto' || Math.abs(sumaPagosMixtos - montoTotal) < 0.01;

  // Manejar cambio de porcentaje de propina
  const handlePorcentajePropinaChange = (porcentaje) => {
    setPorcentajePropina(porcentaje);
    if (porcentaje === null) {
      // Si selecciona 'otro', limpiar propina para que ingrese manual
      setPropina('');
    } else {
      // Calcular propina según porcentaje
      const montoBase = parseFloat(montoTotal || 0);
      const propinaCalculada = (montoBase * porcentaje) / 100;
      setPropina(propinaCalculada.toFixed(2));
    }
  };

  // Manejar cambio de método de pago
  const handleMetodoPagoChange = (metodo) => {
    setMetodoPago(metodo);
    // Resetear montos
    setMontoEfectivo('');
    setMontoTarjeta('');
    setMontoTransferencia('');
    setMontoRecibido('');
    
    // Configurar monto según método
    if (metodo === 'efectivo') {
      setMontoEfectivo(montoTotal);
    } else if (metodo === 'tarjeta') {
      setMontoTarjeta(montoTotal);
    } else if (metodo === 'transferencia') {
      setMontoTransferencia(montoTotal);
    }
  };

  // Procesar pago
  const handleProcesarPago = async (e) => {
    e.preventDefault();
    
    // Validaciones - convertir a número para validar
    const montoTotalNum = parseFloat(montoTotal || 0);
    const montoRecibidoNum = parseFloat(montoRecibido || 0);
    
    if (montoTotalNum <= 0) {
      setError('El monto debe ser mayor a 0');
      return;
    }

    if (montoTotalNum > saldoPendiente) {
      setError(`El monto no puede exceder el saldo pendiente: $${saldoPendiente.toFixed(2)}`);
      return;
    }

    if (metodoPago === 'efectivo' && montoRecibidoNum < totalConPropina) {
      setError('El monto recibido debe ser mayor o igual al total con propina');
      return;
    }

    if (!esPagoMixtoValido) {
      setError('La suma de los pagos debe ser igual al total');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const pagoData = {
        comanda_id: comanda.id,
        metodo_pago: metodoPago,
        monto_total: parseFloat(montoTotal),
        monto_efectivo: parseFloat(montoEfectivo) || 0,
        monto_tarjeta: parseFloat(montoTarjeta) || 0,
        monto_transferencia: parseFloat(montoTransferencia) || 0,
        monto_recibido: parseFloat(montoRecibido) || 0,
        cambio: cambio,
        propina: parseFloat(propina) || 0,
        referencia_pago: referenciaPago || null,
        notas: notas || null
      };

      const response = await pagosApi.registrarPagoApi(pagoData);
      
      if (onPagoExitoso) {
        onPagoExitoso(response);
      }
      
      onClose();
    } catch (err) {
      console.error('Error al procesar pago:', err);
      setError(err.response?.data?.message || 'Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-pago" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <img src={billingIcon} alt="Pago" width="24" height="24" style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
            Procesar Pago - Comanda #{comanda.id}
          </h3>
          <button className="modal-close" onClick={onClose}>X</button>
        </div>

        <div className="modal-body">
          {/* Información de pedidos */}
          {comanda.pedidos && comanda.pedidos.length > 0 && (
            <div className="info-pedidos">
              <small>
                <strong>Pedidos pendientes de pago:</strong> {pedidosPendientes.length} de {comanda.pedidos.length}
                {comanda.pedidos.length > pedidosPendientes.length && (
                  <span style={{ color: 'var(--gris-medio)', marginLeft: '0.5rem' }}>
                    ({comanda.pedidos.length - pedidosPendientes.length} ya pagado{comanda.pedidos.length - pedidosPendientes.length > 1 ? 's' : ''})
                  </span>
                )}
              </small>
            </div>
          )}
          
          {/* Resumen de la comanda */}
          <div className="resumen-pago">
            <div className="resumen-item">
              <span>Total Comanda:</span>
              <strong>${totalComanda.toFixed(2)}</strong>
            </div>
            <div className="resumen-item">
              <span>Pagado:</span>
              <span className="text-success">${totalPagado.toFixed(2)}</span>
            </div>
            <div className="resumen-item destacado">
              <span>Saldo Pendiente:</span>
              <strong className="text-primary">${saldoPendiente.toFixed(2)}</strong>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleProcesarPago}>
            {/* Monto a pagar */}
            <div className="form-group">
              <label>Monto a Pagar *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="form-input"
                value={montoTotal}
                onChange={(e) => {
                  const valor = e.target.value;
                  setMontoTotal(valor === '' ? '' : parseFloat(valor) || 0);
                }}
                onBlur={(e) => {
                  if (e.target.value === '' || parseFloat(e.target.value) === 0) {
                    setMontoTotal(saldoPendiente);
                  }
                }}
                max={saldoPendiente}
                required
              />
              <small className="form-text">Máximo: ${saldoPendiente.toFixed(2)}</small>
            </div>

            {/* Método de pago */}
            <div className="form-group">
              <label>Método de Pago *</label>
              <div className="metodos-pago">
                <button
                  type="button"
                  className={`btn-metodo ${metodoPago === 'efectivo' ? 'active' : ''}`}
                  onClick={() => handleMetodoPagoChange('efectivo')}
                >
                  Efectivo
                </button>
                <button
                  type="button"
                  className={`btn-metodo ${metodoPago === 'tarjeta' ? 'active' : ''}`}
                  onClick={() => handleMetodoPagoChange('tarjeta')}
                >
                  Tarjeta
                </button>
                <button
                  type="button"
                  className={`btn-metodo ${metodoPago === 'transferencia' ? 'active' : ''}`}
                  onClick={() => handleMetodoPagoChange('transferencia')}
                >
                  Transferencia
                </button>
                <button
                  type="button"
                  className={`btn-metodo ${metodoPago === 'mixto' ? 'active' : ''}`}
                  onClick={() => handleMetodoPagoChange('mixto')}
                >
                  Mixto
                </button>
              </div>
            </div>

            {/* Detalles según método de pago */}
            {metodoPago === 'efectivo' && (
              <>
                <div className="form-group">
                  <label>Monto Recibido *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-input"
                    placeholder="0.00"
                    value={montoRecibido}
                    onChange={(e) => setMontoRecibido(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            {metodoPago === 'tarjeta' && (
              <div className="form-group">
                <label>Referencia de Tarjeta</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Número de autorización"
                  value={referenciaPago}
                  onChange={(e) => setReferenciaPago(e.target.value)}
                  maxLength={100}
                />
              </div>
            )}

            {metodoPago === 'transferencia' && (
              <div className="form-group">
                <label>Referencia de Transferencia</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Número de referencia"
                  value={referenciaPago}
                  onChange={(e) => setReferenciaPago(e.target.value)}
                  maxLength={100}
                />
              </div>
            )}

            {metodoPago === 'mixto' && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>Efectivo</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-input"
                      placeholder="0.00"
                      value={montoEfectivo}
                      onChange={(e) => setMontoEfectivo(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Tarjeta</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-input"
                      placeholder="0.00"
                      value={montoTarjeta}
                      onChange={(e) => setMontoTarjeta(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Transferencia</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-input"
                    placeholder="0.00"
                    value={montoTransferencia}
                    onChange={(e) => setMontoTransferencia(e.target.value)}
                  />
                </div>
                <div className="suma-mixto">
                  <span>Suma:</span>
                  <span className={esPagoMixtoValido ? 'text-success' : 'text-danger'}>
                    ${sumaPagosMixtos.toFixed(2)}
                  </span>
                </div>
              </>
            )}

            {/* Propina */}
            <div className="form-group">
              <label>Propina (Opcional)</label>
              <div className="metodos-pago">
                <button
                  type="button"
                  className={`btn-metodo ${porcentajePropina === 10 ? 'active' : ''}`}
                  onClick={() => handlePorcentajePropinaChange(10)}
                >
                  10%
                </button>
                <button
                  type="button"
                  className={`btn-metodo ${porcentajePropina === 15 ? 'active' : ''}`}
                  onClick={() => handlePorcentajePropinaChange(15)}
                >
                  15%
                </button>
                <button
                  type="button"
                  className={`btn-metodo ${porcentajePropina === 20 ? 'active' : ''}`}
                  onClick={() => handlePorcentajePropinaChange(20)}
                >
                  20%
                </button>
                <button
                  type="button"
                  className={`btn-metodo ${porcentajePropina === null ? 'active' : ''}`}
                  onClick={() => handlePorcentajePropinaChange(null)}
                >
                  Otro
                </button>
              </div>
              {porcentajePropina === null && (
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  placeholder="Ingrese monto de propina"
                  value={propina}
                  onChange={(e) => setPropina(e.target.value)}
                  min={0}
                  style={{ marginTop: '0.75rem' }}
                />
              )}
              {porcentajePropina !== null && propina > 0 && (
                <div style={{ marginTop: '0.5rem', color: 'var(--verde-oscuro)', fontSize: '0.9rem' }}>
                  Propina: ${parseFloat(propina).toFixed(2)}
                </div>
              )}
            </div>

            {/* Mostrar cambio para pagos en efectivo */}
            {metodoPago === 'efectivo' && montoRecibido > 0 && (
              <div className="resumen-pago">
                <div className="resumen-item">
                  <span>Total con propina:</span>
                  <strong>${totalConPropina.toFixed(2)}</strong>
                </div>
                <div className="resumen-item destacado">
                  <span>Cambio:</span>
                  <strong className="text-success">${cambio.toFixed(2)}</strong>
                </div>
              </div>
            )}

            {/* Notas */}
            <div className="form-group">
              <label>Notas (Opcional)</label>
              <textarea
                className="form-input"
                rows={2}
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Notas adicionales sobre el pago"
              />
            </div>

            {/* Total con propina */}
            {propina > 0 && (
              <div className="total-final">
                <span>Total + Propina:</span>
                <strong>${(parseFloat(montoTotal) + parseFloat(propina)).toFixed(2)}</strong>
              </div>
            )}
          </form>
        </div>

        <div className="modal-footer">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            onClick={handleProcesarPago}
            disabled={loading || !esPagoMixtoValido}
          >
            {loading ? 'Procesando...' : 'Procesar Pago'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalPago;

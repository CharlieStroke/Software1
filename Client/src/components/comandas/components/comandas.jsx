import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useComandas } from '../hooks/useComandas';
import DetalleComanda from './DetalleComandaModal';
import ModalPago from './ModalPago';
import SucursalSelector from '../../../shared/SucursalSelector';
import ModuleHeader from '../../../shared/ModuleHeader';
import establishIcon from '../../../assets/Establish.svg';
import timeIcon from '../../../assets/time.svg';
import userIcon from '../../../assets/user profile.svg';
import todoIcon from '../../../assets/To Do.svg';
import fullscreenIcon from '../../../assets/Fullscreen.svg';
import billingIcon from '../../../assets/billing.svg';
import '../componentsCss/comandas-new.css';

const Comandas = () => {
  const navigate = useNavigate();
  
  // Obtener fecha actual en formato YYYY-MM-DD (hora local)
  const getFechaActual = () => {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [fechaFiltro, setFechaFiltro] = useState(getFechaActual());
  const [estatusSeleccionado, setEstatusSeleccionado] = useState(null); // null = todos
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState(''); // '' = todas
  const [comandaSeleccionada, setComandaSeleccionada] = useState(null);
  const [comandaParaPago, setComandaParaPago] = useState(null);

  const {
    comandas,
    loading,
    error,
    stats,
    actualizarEstatus,
    recargar
  } = useComandas(fechaFiltro, estatusSeleccionado);

  /* FILTRAR COMANDAS POR ESTATUS Y SUCURSAL */
  const comandasFiltradas = Array.isArray(comandas) 
    ? comandas.filter(comanda => {
        // Filtrar por estatus si hay uno seleccionado
        const matchEstatus = !estatusSeleccionado || comanda.estatus === estatusSeleccionado;
        // Filtrar por sucursal si hay una seleccionada (solo para admin)
        const matchSucursal = !sucursalSeleccionada || comanda.sucursal_id === parseInt(sucursalSeleccionada);
        return matchEstatus && matchSucursal;
      })
    : [];



  /* MANEJAR CLICK EN CARD DE ESTADO */
  const handleClickEstatus = (estatus) => {
    // Si ya está seleccionado, deseleccionar (mostrar todos)
    if (estatusSeleccionado === estatus) {
      setEstatusSeleccionado(null);
    } else {
      setEstatusSeleccionado(estatus);
    }
  };

  /* CAMBIAR ESTATUS DE COMANDA */
  const handleCambiarEstatus = async (id, nuevoEstatus) => {
    const result = await actualizarEstatus(id, nuevoEstatus);
    if (!result.success) {
      alert(`Error: ${result.error}`);
    }
  };

  /* ABRIR MODAL DE PAGO */
  const handleAbrirPago = (comanda) => {
    setComandaParaPago(comanda);
  };

  /* MANEJAR PAGO EXITOSO */
  const handlePagoExitoso = (response) => {
    // Recargar comandas para reflejar el cambio
    recargar();
    
    // Mostrar mensaje de éxito
    alert(`Pago procesado exitosamente. ${response.comanda_cerrada ? 'Comanda cerrada.' : `Saldo restante: $${response.saldo_restante}`}`);
  };

  /* LABEL DE ESTATUS */
  const getEstatusLabel = (estatus) => {
    const labels = {
      abierta: 'Abierta',
      cerrada: 'Cerrada',
      cancelada: 'Cancelada'
    };
    return labels[estatus] || estatus;
  };

  /* FORMATEAR HORA */
  const formatearHora = (fecha) => {
    if (!fecha) return 'Sin fecha';
    const date = new Date(fecha);
    if (isNaN(date.getTime())) return 'Fecha inválida';
    
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /* FORMATEAR TOTAL */
  const formatearTotal = (total) => {
    const numero = parseFloat(total);
    if (isNaN(numero)) return '0.00';
    return numero.toFixed(2);
  };

  if (loading) {
    return (
      <div className="comandas-container">
        <div className="spinner"></div>
        <p>Cargando comandas del día...</p>
      </div>
    );
  }

  return (
    <div className="comandas-container">
      <ModuleHeader 
        title={fechaFiltro ? `Comandas del ${new Date(fechaFiltro + 'T00:00:00').toLocaleDateString('es-ES')}` : 'Todas las Comandas'}
        buttonText="Actualizar"
        buttonOnClick={recargar}
        buttonIcon="↻"
        showButton={true}
      />

      {/* STATS - Clickeables para filtrar */}
      <div className="stats-grid">
        <div 
          className={`stat-card ${estatusSeleccionado === null ? 'active' : ''}`}
          onClick={() => setEstatusSeleccionado(null)}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">TOTAL DEL DÍA</div>
        </div>
        <div 
          className={`stat-card warning ${estatusSeleccionado === 'abierta' ? 'active' : ''}`}
          onClick={() => handleClickEstatus('abierta')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-value">{stats.abiertas}</div>
          <div className="stat-label">ABIERTAS</div>
        </div>
        <div 
          className={`stat-card success ${estatusSeleccionado === 'cerrada' ? 'active' : ''}`}
          onClick={() => handleClickEstatus('cerrada')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-value">{stats.cerradas}</div>
          <div className="stat-label">CERRADAS</div>
        </div>
        <div 
          className={`stat-card secondary ${estatusSeleccionado === 'cancelada' ? 'active' : ''}`}
          onClick={() => handleClickEstatus('cancelada')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-value">{stats.canceladas}</div>
          <div className="stat-label">CANCELADAS</div>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* FILTROS */}
      <div className="filtros-container">
        <div className="form-group">
          <label htmlFor="fechaFiltro">Fecha:</label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              type="date"
              id="fechaFiltro"
              value={fechaFiltro}
              onChange={(e) => setFechaFiltro(e.target.value)}
            />
            <button 
              className="btn btn-secondary"
              onClick={() => setFechaFiltro('')}
              title="Ver todas las fechas"
            >
              Limpiar
            </button>
          </div>
        </div>

        <SucursalSelector
          value={sucursalSeleccionada}
          onChange={(e) => setSucursalSeleccionada(e.target.value)}
          className="filtro-sucursal"
          showLabel={true}
        />

        <div className="form-group">
          <label>Estado:</label>
          <div className="estado-seleccionado">
            {estatusSeleccionado ? getEstatusLabel(estatusSeleccionado) : 'Todos'}
          </div>
        </div>
      </div>

      {/* LISTA COMANDAS */}
      <div className="comandas-grid">
        {comandasFiltradas.length === 0 ? (
          <div className="empty-state">
            <p>No hay comandas para mostrar</p>
          </div>
        ) : (
          comandasFiltradas.map(comanda => (
            <div key={comanda.id} className={`comanda-card estatus-${comanda.estatus}`}>
              <div className="comanda-header">
                <div className="comanda-info">
                  <h3>Comanda #{comanda.id}</h3>
                  <p className="comanda-sucursal">
                    <img src={establishIcon} alt="Sucursal" width="16" height="16" />
                    {comanda.sucursal_nombre}
                  </p>
                  <p className="comanda-hora">
                    <img src={timeIcon} alt="Hora" width="16" height="16" />
                    {formatearHora(comanda.fecha_creacion)}
                  </p>
                  <p className="comanda-mesero">
                    <img src={userIcon} alt="Mesero" width="16" height="16" />
                    {comanda.usuario_nombre}
                  </p>
                  <p className="comanda-pedidos">
                    <img src={todoIcon} alt="Pedidos" width="16" height="16" />
                    {comanda.total_pedidos} pedido(s)
                  </p>
                </div>
                <span className={`badge badge-${comanda.estatus}`}>
                  {getEstatusLabel(comanda.estatus)}
                </span>
              </div>

              <div className="comanda-total">
                <strong>Total: ${formatearTotal(comanda.total_comanda)}</strong>
              </div>

              <div className="comanda-actions">
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => setComandaSeleccionada(comanda)}
                  title="Ver detalle"
                >
                  <img src={fullscreenIcon} alt="Ver" width="16" height="16" />
                  Ver
                </button>

                {comanda.estatus === 'abierta' && (
                  <>
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => handleAbrirPago(comanda)}
                      title="Procesar pago"
                    >
                      <img src={billingIcon} alt="Cobrar" width="16" height="16" />
                      Cobrar
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleCambiarEstatus(comanda.id, 'cancelada')}
                      title="Cancelar comanda"
                    >
                      Cancelar
                    </button>
                  </>
                )}

                {comanda.estatus === 'cerrada' && (
                  <button
                    className="btn btn-sm btn-warning"
                    onClick={() => handleCambiarEstatus(comanda.id, 'abierta')}
                    title="Reabrir comanda"
                  >
                    Reabrir
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL DETALLE */}
      {comandaSeleccionada && (
        <DetalleComanda
          comanda={comandaSeleccionada}
          onClose={() => setComandaSeleccionada(null)}
        />
      )}

      {/* MODAL PAGO */}
      {comandaParaPago && (
        <ModalPago
          comanda={comandaParaPago}
          onClose={() => setComandaParaPago(null)}
          onPagoExitoso={handlePagoExitoso}
        />
      )}
    </div>
  );
};

export default Comandas;

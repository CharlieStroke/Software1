import React, { useState } from 'react';
import '../componentsCss/mesas.css';

const Mesas = () => {
    // Lista de usuarios disponibles para asignar a mesas
    const usuariosDisponibles = [
        { id: 1, nombre: 'Juan Pérez', rol: 'administrador' },
        { id: 2, nombre: 'María García', rol: 'mesero' },
        { id: 3, nombre: 'Carlos López', rol: 'mesero' },
        { id: 4, nombre: 'Ana Rodríguez', rol: 'administrador' },
        { id: 5, nombre: 'Luis Martín', rol: 'mesero' }
    ];

    const [mesas, setMesas] = useState([
        { id: 1, numero: 1, capacidad: 4, estado: 'libre', usuarioAsignado: null, tiempoOcupada: null },
        { id: 2, numero: 2, capacidad: 2, estado: 'ocupada', usuarioAsignado: { id: 2, nombre: 'María García', rol: 'mesero' }, tiempoOcupada: '14:30' },
        { id: 3, numero: 3, capacidad: 6, estado: 'reservada', usuarioAsignado: { id: 1, nombre: 'Juan Pérez', rol: 'administrador' }, tiempoOcupada: '19:00' },
        { id: 4, numero: 4, capacidad: 4, estado: 'libre', usuarioAsignado: null, tiempoOcupada: null },
        { id: 5, numero: 5, capacidad: 8, estado: 'ocupada', usuarioAsignado: { id: 3, nombre: 'Carlos López', rol: 'mesero' }, tiempoOcupada: '13:15' },
        { id: 6, numero: 6, capacidad: 2, estado: 'mantenimiento', usuarioAsignado: null, tiempoOcupada: null },
        { id: 7, numero: 7, capacidad: 4, estado: 'libre', usuarioAsignado: null, tiempoOcupada: null },
        { id: 8, numero: 8, capacidad: 6, estado: 'reservada', usuarioAsignado: { id: 5, nombre: 'Luis Martín', rol: 'mesero' }, tiempoOcupada: '20:30' }
    ]);

    const [filtroEstado, setFiltroEstado] = useState('todas');
    
    // Estados para el modal de selección de usuario
    const [modalAbierto, setModalAbierto] = useState(false);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState('');
    const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
    const [tipoAccion, setTipoAccion] = useState(''); // 'ocupar' o 'reservar'
    
    // Estados para el modal de agregar mesa
    const [modalNuevaMesa, setModalNuevaMesa] = useState(false);
    const [nuevaMesa, setNuevaMesa] = useState({
        numero: '',
        capacidad: ''
    });

    const mesasFiltradas = mesas.filter(mesa => 
        filtroEstado === 'todas' || mesa.estado === filtroEstado
    );

    const cambiarEstadoMesa = (id, nuevoEstado, usuario = null) => {
        setMesas(mesas.map(mesa => 
            mesa.id === id ? { 
                ...mesa, 
                estado: nuevoEstado, 
                usuarioAsignado: nuevoEstado === 'ocupada' || nuevoEstado === 'reservada' ? usuario : null,
                tiempoOcupada: nuevoEstado === 'ocupada' ? new Date().toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'}) : mesa.tiempoOcupada
            } : mesa
        ));
    };

    const getEstadoClass = (estado) => {
        switch(estado) {
            case 'libre': return 'mesa-libre';
            case 'ocupada': return 'mesa-ocupada';
            case 'reservada': return 'mesa-reservada';
            case 'mantenimiento': return 'mesa-mantenimiento';
            default: return '';
        }
    };

    const getEstadoTexto = (estado) => {
        switch(estado) {
            case 'libre': return 'Libre';
            case 'ocupada': return 'Ocupada';
            case 'reservada': return 'Reservada';
            case 'mantenimiento': return 'Mantenimiento';
            default: return estado;
        }
    };

    const contarMesasPorEstado = (estado) => {
        return mesas.filter(mesa => mesa.estado === estado).length;
    };

    // Funciones para manejar el modal
    const abrirModalSeleccion = (mesa, accion) => {
        setMesaSeleccionada(mesa);
        setTipoAccion(accion);
        setUsuarioSeleccionado('');
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setMesaSeleccionada(null);
        setTipoAccion('');
        setUsuarioSeleccionado('');
    };

    const confirmarSeleccion = () => {
        if (usuarioSeleccionado && mesaSeleccionada) {
            const usuario = usuariosDisponibles.find(u => u.id === parseInt(usuarioSeleccionado));
            if (usuario) {
                const nuevoEstado = tipoAccion === 'ocupar' ? 'ocupada' : 'reservada';
                cambiarEstadoMesa(mesaSeleccionada.id, nuevoEstado, usuario);
                cerrarModal();
            }
        }
    };

    // Funciones para manejar el modal de nueva mesa
    const abrirModalNuevaMesa = () => {
        setNuevaMesa({ numero: '', capacidad: '' });
        setModalNuevaMesa(true);
    };

    const cerrarModalNuevaMesa = () => {
        setModalNuevaMesa(false);
        setNuevaMesa({ numero: '', capacidad: '' });
    };

    const agregarMesa = () => {
        if (nuevaMesa.numero && nuevaMesa.capacidad) {
            // Verificar que el número de mesa no exista
            const mesaExiste = mesas.some(mesa => mesa.numero === parseInt(nuevaMesa.numero));
            if (mesaExiste) {
                alert('Ya existe una mesa con ese número');
                return;
            }

            const nuevaId = Math.max(...mesas.map(m => m.id)) + 1;
            const mesaParaAgregar = {
                id: nuevaId,
                numero: parseInt(nuevaMesa.numero),
                capacidad: parseInt(nuevaMesa.capacidad),
                estado: 'libre',
                usuarioAsignado: null,
                tiempoOcupada: null
            };

            setMesas([...mesas, mesaParaAgregar]);
            cerrarModalNuevaMesa();
        }
    };

    return (
        <div className="mesas-container">
            <div className="mesas-header">
                <h2>Gestión de Mesas</h2>
                <button className="btn-nueva-mesa" onClick={abrirModalNuevaMesa}>Agregar Mesa</button>
            </div>

            <div className="mesas-stats">
                <div className="stat-mesa">
                    <span className="stat-numero">{contarMesasPorEstado('libre')}</span>
                    <span className="stat-label">Libres</span>
                </div>
                <div className="stat-mesa ocupada">
                    <span className="stat-numero">{contarMesasPorEstado('ocupada')}</span>
                    <span className="stat-label">Ocupadas</span>
                </div>
                <div className="stat-mesa reservada">
                    <span className="stat-numero">{contarMesasPorEstado('reservada')}</span>
                    <span className="stat-label">Reservadas</span>
                </div>
                <div className="stat-mesa mantenimiento">
                    <span className="stat-numero">{contarMesasPorEstado('mantenimiento')}</span>
                    <span className="stat-label">Mantenimiento</span>
                </div>
            </div>

            <div className="mesas-filtros">
                <label>Filtrar por estado:</label>
                <select 
                    value={filtroEstado} 
                    onChange={(e) => setFiltroEstado(e.target.value)}
                    className="filtro-select"
                >
                    <option value="todas">Todas las mesas</option>
                    <option value="libre">Libres</option>
                    <option value="ocupada">Ocupadas</option>
                    <option value="reservada">Reservadas</option>
                    <option value="mantenimiento">En mantenimiento</option>
                </select>
            </div>

            <div className="mesas-grid">
                {mesasFiltradas.map(mesa => (
                    <div key={mesa.id} className={`mesa-card ${getEstadoClass(mesa.estado)}`}>
                        <div className="mesa-numero">
                            Mesa {mesa.numero}
                        </div>
                        
                        <div className="mesa-info">
                            <div className="capacidad">
                                <span> {mesa.capacidad} personas</span>
                            </div>
                            
                            <div className={`estado-badge ${getEstadoClass(mesa.estado)}`}>
                                {getEstadoTexto(mesa.estado)}
                            </div>
                            
                            {mesa.usuarioAsignado && (
                                <div className="usuario-info">
                                    <strong>{mesa.usuarioAsignado.nombre}</strong>
                                    <span className="rol">({mesa.usuarioAsignado.rol})</span>
                                    {mesa.tiempoOcupada && (
                                        <span className="tiempo">Desde: {mesa.tiempoOcupada}</span>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="mesa-acciones">
                            {mesa.estado === 'libre' && (
                                <>
                                    <button 
                                        onClick={() => abrirModalSeleccion(mesa, 'ocupar')}
                                        className="btn-ocupar"
                                    >
                                        Asignar Usuario
                                    </button>
                                    <button 
                                        onClick={() => abrirModalSeleccion(mesa, 'reservar')}
                                        className="btn-reservar"
                                    >
                                        Reservar
                                    </button>
                                </>
                            )}
                            
                            {mesa.estado === 'ocupada' && (
                                <button 
                                    onClick={() => cambiarEstadoMesa(mesa.id, 'libre')}
                                    className="btn-liberar"
                                >
                                    Liberar Mesa
                                </button>
                            )}
                            
                            {mesa.estado === 'reservada' && (
                                <>
                                    <button 
                                        onClick={() => cambiarEstadoMesa(mesa.id, 'ocupada', mesa.usuarioAsignado)}
                                        className="btn-confirmar"
                                    >
                                        Confirmar Llegada
                                    </button>
                                    <button 
                                        onClick={() => cambiarEstadoMesa(mesa.id, 'libre')}
                                        className="btn-cancelar"
                                    >
                                        Cancelar
                                    </button>
                                </>
                            )}
                            
                            {mesa.estado !== 'mantenimiento' && (
                                <button 
                                    onClick={() => cambiarEstadoMesa(mesa.id, 'mantenimiento')}
                                    className="btn-mantenimiento"
                                >
                                    Mantenimiento
                                </button>
                            )}
                            
                            {mesa.estado === 'mantenimiento' && (
                                <button 
                                    onClick={() => cambiarEstadoMesa(mesa.id, 'libre')}
                                    className="btn-reparada"
                                >
                                    Mesa Lista
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal para seleccionar usuario */}
            {modalAbierto && (
                <div className="modal-overlay" onClick={cerrarModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>
                                {tipoAccion === 'ocupar' ? 'Asignar Usuario a Mesa' : 'Reservar Mesa'} {mesaSeleccionada?.numero}
                            </h3>
                            <button className="modal-close" onClick={cerrarModal}>×</button>
                        </div>
                        
                        <div className="modal-body">
                            <label htmlFor="selector-usuario">Seleccione un usuario:</label>
                            <select 
                                id="selector-usuario"
                                value={usuarioSeleccionado} 
                                onChange={(e) => setUsuarioSeleccionado(e.target.value)}
                                className="selector-usuario"
                            >
                                <option value="">-- Seleccione un usuario --</option>
                                {usuariosDisponibles.map(usuario => (
                                    <option key={usuario.id} value={usuario.id}>
                                        {usuario.nombre} ({usuario.rol})
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="modal-footer">
                            <button 
                                onClick={cerrarModal} 
                                className="btn-cancelar-modal"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={confirmarSeleccion} 
                                className="btn-confirmar-modal"
                                disabled={!usuarioSeleccionado}
                            >
                                {tipoAccion === 'ocupar' ? 'Asignar' : 'Reservar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para agregar nueva mesa */}
            {modalNuevaMesa && (
                <div className="modal-overlay" onClick={cerrarModalNuevaMesa}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Agregar Nueva Mesa</h3>
                            <button className="modal-close" onClick={cerrarModalNuevaMesa}>×</button>
                        </div>
                        
                        <div className="modal-body">
                            <div className="form-group">
                                <label htmlFor="numero-mesa">Número de Mesa:</label>
                                <input 
                                    type="number"
                                    id="numero-mesa"
                                    value={nuevaMesa.numero}
                                    onChange={(e) => setNuevaMesa({...nuevaMesa, numero: e.target.value})}
                                    className="form-input"
                                    placeholder="Ej: 1, 2, 3..."
                                    min="1"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="capacidad-mesa">Capacidad (personas):</label>
                                <input 
                                    type="number"
                                    id="capacidad-mesa"
                                    value={nuevaMesa.capacidad}
                                    onChange={(e) => setNuevaMesa({...nuevaMesa, capacidad: e.target.value})}
                                    className="form-input"
                                    placeholder="Ej: 2, 4, 6..."
                                    min="1"
                                    max="20"
                                />
                            </div>
                        </div>
                        
                        <div className="modal-footer">
                            <button 
                                onClick={cerrarModalNuevaMesa} 
                                className="btn-cancelar-modal"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={agregarMesa} 
                                className="btn-confirmar-modal"
                                disabled={!nuevaMesa.numero || !nuevaMesa.capacidad}
                            >
                                Agregar Mesa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Mesas;

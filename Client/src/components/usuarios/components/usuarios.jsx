import React, { useState } from 'react';
import '../componentsCss/usuarios.css';

const Usuarios = () => {
    const [usuarios, setUsuarios] = useState([
        {
            id: 2,
            nombre: 'María García',
            rol: 'mesero',
            activo: true,
            ultimaConexion: '2025-09-15 13:45',
            telefono: '+951 6987 654'
        },
        {
            id: 5,
            nombre: 'Luis Martín',
            rol: 'mesero',
            activo: true,
            ultimaConexion: '2025-09-15 11:15',
            telefono: '+951 6774 563'
        }
    ]);

    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [nuevoNombre, setNuevoNombre] = useState('');
    const [nuevoTelefono, setNuevoTelefono] = useState('');

    const usuariosFiltrados = usuarios.filter(usuario => {
        const cumpleEstado = filtroEstado === 'todos' ||
                           (filtroEstado === 'activos' && usuario.activo) ||
                           (filtroEstado === 'inactivos' && !usuario.activo);
        return cumpleEstado;
    });

    const toggleUsuarioActivo = (id) => {
        setUsuarios(usuarios.map(usuario => 
            usuario.id === id ? { ...usuario, activo: !usuario.activo } : usuario
        ));
    };

    const eliminarUsuario = (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
            setUsuarios(usuarios.filter(usuario => usuario.id !== id));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (nuevoNombre.trim() && nuevoTelefono.trim()) {
            const nuevoId = Math.max(...usuarios.map(u => u.id)) + 1;
            const nuevoUsuario = {
                id: nuevoId,
                nombre: nuevoNombre,
                rol: 'mesero',
                activo: true,
                ultimaConexion: new Date().toISOString().slice(0, 16).replace('T', ' '),
                telefono: nuevoTelefono
            };
            setUsuarios([...usuarios, nuevoUsuario]);
            setNuevoNombre('');
            setNuevoTelefono('');
            setMostrarFormulario(false);
        }
    };

    return (
        <div className="usuarios-container">
            <div className="usuarios-header">
                <h2>Gestión de Meseros</h2>
                <button
                    className="btn-nuevo-usuario"
                    onClick={() => setMostrarFormulario(!mostrarFormulario)}
                >
                    Nuevo Mesero
                </button>
            </div>

            <div className="usuarios-stats">
                <div className="stat-usuario mesero">
                    <span className="stat-numero">{usuarios.filter(u => u.activo).length}</span>
                    <span className="stat-label">Meseros Activos</span>
                </div>
            </div>

            <div className="usuarios-filtros">
                <div className="filtro-grupo">
                    <label>Estado:</label>
                    <select
                        value={filtroEstado}
                        onChange={(e) => setFiltroEstado(e.target.value)}
                        className="filtro-select"
                    >
                        <option value="todos">Todos</option>
                        <option value="activos">Activos</option>
                        <option value="inactivos">Inactivos</option>
                    </select>
                </div>
            </div>

            {mostrarFormulario && (
                <div className="formulario-usuario">
                    <h3>Nuevo Mesero</h3>
                    <form className="usuario-form" onSubmit={handleSubmit}>
                        <div className="form-row">
                            <input
                                type="text"
                                placeholder="Nombre completo"
                                className="form-input"
                                value={nuevoNombre}
                                onChange={(e) => setNuevoNombre(e.target.value)}
                            />
                            <input
                                type="tel"
                                placeholder="Teléfono"
                                className="form-input"
                                value={nuevoTelefono}
                                onChange={(e) => setNuevoTelefono(e.target.value)}
                            />
                        </div>
                        <div className="form-actions">
                            <button type="button" className="btn-cancelar" onClick={() => setMostrarFormulario(false)}>
                                Cancelar
                            </button>
                            <button type="submit" className="btn-guardar">
                                Guardar Mesero
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="usuarios-lista">
                {usuariosFiltrados.map(usuario => (
                    <div key={usuario.id} className={`usuario-card ${!usuario.activo ? 'inactivo' : ''}`}>
                        <div className="usuario-avatar">
                            <span>{usuario.nombre.split(' ').map(n => n[0]).join('')}</span>
                        </div>
                        
                        <div className="usuario-info">
                            <h3>{usuario.nombre}</h3>
                            <p className="telefono"> {usuario.telefono}</p>
                            <p className="ultima-conexion">
                                Última conexión: {new Date(usuario.ultimaConexion).toLocaleString('es-ES')}
                            </p>
                        </div>

                        <div className="usuario-estado">
                            <span className={`estado-badge ${usuario.activo ? 'activo' : 'inactivo'}`}>
                                {usuario.activo ? 'Activo' : 'Inactivo'}
                            </span>
                        </div>

                        <div className="usuario-acciones">
                            <button className="btn-editar" title="Editar usuario">
                                E
                            </button>
                            <button 
                                className={`btn-toggle ${usuario.activo ? 'btn-desactivar' : 'btn-activar'}`}
                                onClick={() => toggleUsuarioActivo(usuario.id)}
                                title={usuario.activo ? 'Desactivar' : 'Activar'}
                            >
                                {usuario.activo ? 'D' : 'A'}
                            </button>
                            <button 
                                className="btn-eliminar"
                                onClick={() => eliminarUsuario(usuario.id)}
                                title="Eliminar usuario"
                            >
                                B
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Usuarios;

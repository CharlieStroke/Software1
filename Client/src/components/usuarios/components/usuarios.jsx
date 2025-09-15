import React, { useState } from 'react';
import '../componentsCss/usuarios.css';

const Usuarios = () => {
    const [usuarios, setUsuarios] = useState([
        { 
            id: 1, 
            nombre: 'Juan Pérez', 
            rol: 'administrador', 
            activo: true, 
            ultimaConexion: '2025-09-15 14:30',
            telefono: '+951 1234 567'
        },
        { 
            id: 2, 
            nombre: 'María García', 
            rol: 'mesero', 
            activo: true, 
            ultimaConexion: '2025-09-15 13:45',
            telefono: '+951 6987 654'
        },
        { 
            id: 3, 
            nombre: 'Carlos López', 
            rol: 'cocinero', 
            activo: true, 
            ultimaConexion: '2025-09-15 12:20',
            telefono: '+951 6562 789'
        },
        { 
            id: 4, 
            nombre: 'Ana Rodríguez', 
            rol: 'cajero', 
            activo: false, 
            ultimaConexion: '2025-09-10 18:00',
            telefono: '+951 6337 654'
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

    const [filtroRol, setFiltroRol] = useState('todos');
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    const roles = ['administrador', 'mesero', 'cocinero', 'cajero'];

    const usuariosFiltrados = usuarios.filter(usuario => {
        const cumpleRol = filtroRol === 'todos' || usuario.rol === filtroRol;
        const cumpleEstado = filtroEstado === 'todos' || 
                           (filtroEstado === 'activos' && usuario.activo) ||
                           (filtroEstado === 'inactivos' && !usuario.activo);
        return cumpleRol && cumpleEstado;
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

    const getRolClass = (rol) => {
        switch(rol) {
            case 'administrador': return 'rol-admin';
            case 'mesero': return 'rol-mesero';
            case 'cocinero': return 'rol-cocinero';
            case 'cajero': return 'rol-cajero';
            default: return '';
        }
    };

    const getRolTexto = (rol) => {
        switch(rol) {
            case 'administrador': return 'Administrador';
            case 'mesero': return 'Mesero';
            case 'cocinero': return 'Cocinero';
            case 'cajero': return 'Cajero';
            default: return rol;
        }
    };

    const contarUsuariosPorRol = (rol) => {
        return usuarios.filter(usuario => usuario.rol === rol && usuario.activo).length;
    };

    return (
        <div className="usuarios-container">
            <div className="usuarios-header">
                <h2>Gestión de Usuarios</h2>
                <button 
                    className="btn-nuevo-usuario"
                    onClick={() => setMostrarFormulario(!mostrarFormulario)}
                >
                    Nuevo Usuario
                </button>
            </div>

            <div className="usuarios-stats">
                <div className="stat-usuario">
                    <span className="stat-numero">{usuarios.filter(u => u.activo).length}</span>
                    <span className="stat-label">Usuarios Activos</span>
                </div>
                <div className="stat-usuario admin">
                    <span className="stat-numero">{contarUsuariosPorRol('administrador')}</span>
                    <span className="stat-label">Administradores</span>
                </div>
                <div className="stat-usuario mesero">
                    <span className="stat-numero">{contarUsuariosPorRol('mesero')}</span>
                    <span className="stat-label">Meseros</span>
                </div>
                <div className="stat-usuario cocinero">
                    <span className="stat-numero">{contarUsuariosPorRol('cocinero')}</span>
                    <span className="stat-label">Cocineros</span>
                </div>
                <div className="stat-usuario cajero">
                    <span className="stat-numero">{contarUsuariosPorRol('cajero')}</span>
                    <span className="stat-label">Cajeros</span>
                </div>
            </div>

            <div className="usuarios-filtros">
                <div className="filtro-grupo">
                    <label>Rol:</label>
                    <select 
                        value={filtroRol} 
                        onChange={(e) => setFiltroRol(e.target.value)}
                        className="filtro-select"
                    >
                        <option value="todos">Todos los roles</option>
                        {roles.map(rol => (
                            <option key={rol} value={rol}>{getRolTexto(rol)}</option>
                        ))}
                    </select>
                </div>

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
                    <h3>Nuevo Usuario</h3>
                    <form className="usuario-form">
                        <div className="form-row">
                            <input type="text" placeholder="Nombre completo" className="form-input" />
                            <input type="tel" placeholder="Teléfono" className="form-input" />
                        </div>
                        <div className="form-row">
                            <select className="form-input">
                                <option value="">Seleccionar rol</option>
                                {roles.map(rol => (
                                    <option key={rol} value={rol}>{getRolTexto(rol)}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-actions">
                            <button type="button" className="btn-cancelar" onClick={() => setMostrarFormulario(false)}>
                                Cancelar
                            </button>
                            <button type="submit" className="btn-guardar">
                                Guardar Usuario
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

                        <div className="usuario-rol">
                            <span className={`rol-badge ${getRolClass(usuario.rol)}`}>
                                {getRolTexto(usuario.rol)}
                            </span>
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

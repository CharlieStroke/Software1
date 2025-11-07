import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import '../componentsCss/usuarios.css';

// Esquema de validación para usuarios
const usuarioValidationSchema = Yup.object({
    nombre: Yup.string()
        .required('El nombre es obligatorio')
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(50, 'El nombre no puede exceder 50 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
    telefono: Yup.string()
        .required('El teléfono es obligatorio')
        .matches(/^[0-9]+$/, 'El teléfono debe contener solo números, sin espacios ni guiones')
        .min(10, 'El teléfono debe tener al menos 10 dígitos')
        .max(15, 'El teléfono no puede exceder 15 dígitos'),
    rol: Yup.string()
        .required('El rol es obligatorio')
        .oneOf(['mesero', 'admin', 'supervisor'], 'Rol inválido')
});

const Usuarios = () => {
    const [usuarios, setUsuarios] = useState([
        {
            id: 2,
            nombre: 'María García',
            rol: 'mesero',
            activo: true,
            ultimaConexion: '2025-09-15 13:45',
            telefono: '9516987654'
        },
        {
            id: 5,
            nombre: 'Luis Martín',
            rol: 'mesero',
            activo: true,
            ultimaConexion: '2025-09-15 11:15',
            telefono: '9516774563'
        }
    ]);

    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [mostrarFormulario, setMostrarFormulario] = useState(false);

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

    const crearUsuario = async (valores, { resetForm }) => {
        try {
            await usuarioValidationSchema.validate(valores, { abortEarly: false });
            
            const nuevoId = Math.max(...usuarios.map(u => u.id)) + 1;
            const nuevoUsuario = {
                id: nuevoId,
                nombre: valores.nombre,
                rol: valores.rol,
                activo: true,
                ultimaConexion: new Date().toISOString().slice(0, 16).replace('T', ' '),
                telefono: valores.telefono
            };
            
            setUsuarios([...usuarios, nuevoUsuario]);
            resetForm();
            setMostrarFormulario(false);
        } catch (error) {
            console.error('Error al crear usuario:', error);
            throw error;
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
                    <Formik
                        initialValues={{
                            nombre: '',
                            telefono: '',
                            rol: 'mesero'
                        }}
                        validationSchema={usuarioValidationSchema}
                        onSubmit={crearUsuario}
                    >
                        {({ errors, touched, isSubmitting }) => (
                            <Form className="usuario-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <Field
                                            type="text"
                                            name="nombre"
                                            placeholder="Nombre completo"
                                            className={`form-input ${errors.nombre && touched.nombre ? 'error' : ''}`}
                                        />
                                        <ErrorMessage name="nombre" component="span" className="error-message" />
                                    </div>
                                    <div className="form-group">
                                        <Field
                                            type="tel"
                                            name="telefono"
                                            placeholder="Teléfono (ej: 951 6987 654)"
                                            className={`form-input ${errors.telefono && touched.telefono ? 'error' : ''}`}
                                        />
                                        <ErrorMessage name="telefono" component="span" className="error-message" />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <Field as="select" name="rol" className={`form-input ${errors.rol && touched.rol ? 'error' : ''}`}>
                                            <option value="mesero">Mesero</option>
                                            <option value="supervisor">Supervisor</option>
                                            <option value="admin">Administrador</option>
                                        </Field>
                                        <ErrorMessage name="rol" component="span" className="error-message" />
                                    </div>
                                </div>
                                <div className="form-actions">
                                    <button 
                                        type="button" 
                                        className="btn-cancelar" 
                                        onClick={() => setMostrarFormulario(false)}
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="btn-guardar"
                                        disabled={isSubmitting || Object.keys(errors).length > 0}
                                    >
                                        {isSubmitting ? 'Guardando...' : 'Guardar Mesero'}
                                    </button>
                                </div>
                            </Form>
                        )}
                    </Formik>
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

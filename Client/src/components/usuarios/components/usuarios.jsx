import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../../context/AuthContext';
import { useUsuarios } from '../hooks/useUsuarios';
import ModuleHeader from '../../../shared/ModuleHeader';
import '../componentsCss/usuarios.css';
import playIcon from '../../../assets/play.svg';
import pauseIcon from '../../../assets/pause.svg';
import deleteIcon from '../../../assets/delete.svg';
import editIcon from '../../../assets/edit.svg';

/* VALIDACIÓN DE FORMULARIO */
const usuarioValidationSchema = Yup.object({
  nombre: Yup.string()
    .required('El nombre es obligatorio')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  apellido: Yup.string()
    .required('El apellido es obligatorio')
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(100, 'El apellido no puede exceder 100 caracteres'),
  email: Yup.string()
    .required('El email es obligatorio')
    .email('Email inválido'),
  telefono: Yup.string()
    .required('El teléfono es obligatorio')
    .matches(/^[0-9]+$/, 'El teléfono debe contener solo números')
    .min(10, 'El teléfono debe tener al menos 10 dígitos'),
  rol: Yup.string()
    .required('El rol es obligatorio')
    .oneOf(['admin', 'gerente', 'mesero', 'cocinero', 'cajero', 'dueño'], 'Rol inválido'),
  id_sucursal: Yup.number()
    .required('La sucursal es obligatoria')
    .positive('Seleccione una sucursal válida'),
  password: Yup.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
});

const Usuarios = () => {
  const { user } = useAuth();
  const {
    usuarios,
    sucursales,
    loading,
    error,
    crearUsuario,
    actualizarUsuario,
    toggleEstado,
    eliminarUsuario
  } = useUsuarios();

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroRol, setFiltroRol] = useState('todos');
  const [filtroSucursal, setFiltroSucursal] = useState('todos');
  const [busqueda, setBusqueda] = useState('');

  /* MENSAJE DE PERMISOS SEGÚN ROL */
  const getMensajePermisos = () => {
    switch(user?.rol) {
      case 'admin':
        return 'puedes ver y gestionar todos los usuarios del sistema.';
      case 'dueño':
        return 'puedes ver y gestionar usuarios de tu sucursal (gerentes, meseros, cocineros y cajeros).';
      case 'gerente':
        return 'puedes ver los meseros, cocineros y cajeros de tu sucursal.';
      default:
        return '';
    }
  };

  /* FILTRAR USUARIOS */
  const usuariosFiltrados = usuarios.filter(usuario => {
    const cumpleEstado = filtroEstado === 'todos' ||
      (filtroEstado === 'activos' && usuario.activo) ||
      (filtroEstado === 'inactivos' && !usuario.activo);

    const cumpleRol = filtroRol === 'todos' || usuario.rol === filtroRol;

    const cumpleSucursal = filtroSucursal === 'todos' ||
      usuario.id_sucursal === parseInt(filtroSucursal);

    const cumpleBusqueda = busqueda === '' ||
      usuario.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      usuario.apellido?.toLowerCase().includes(busqueda.toLowerCase()) ||
      usuario.email?.toLowerCase().includes(busqueda.toLowerCase());

    return cumpleEstado && cumpleRol && cumpleSucursal && cumpleBusqueda;
  });

  /* STATS */
  const stats = {
    total: usuarios.length,
    activos: usuarios.filter(u => u.activo).length,
    porRol: {
      admin: usuarios.filter(u => u.rol === 'admin').length,
      gerente: usuarios.filter(u => u.rol === 'gerente').length,
      mesero: usuarios.filter(u => u.rol === 'mesero').length,
      cocinero: usuarios.filter(u => u.rol === 'cocinero').length,
      cajero: usuarios.filter(u => u.rol === 'cajero').length,
      dueño: usuarios.filter(u => u.rol === 'dueño').length
    }
  };

  /* MANEJAR SUBMIT */
  const handleSubmit = async (valores, { resetForm, setSubmitting }) => {
    try {
      let result;
      if (usuarioEditando) {
        result = await actualizarUsuario(usuarioEditando.id, valores);
      } else {
        result = await crearUsuario(valores);
      }

      if (result.success) {
        resetForm();
        setMostrarFormulario(false);
        setUsuarioEditando(null);
        alert(`Usuario ${usuarioEditando ? 'actualizado' : 'creado'} exitosamente`);
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (err) {
      console.error('Error en submit:', err);
      alert('Error al procesar la solicitud');
    } finally {
      setSubmitting(false);
    }
  };

  /* EDITAR */
  const handleEditar = (usuario) => {
    setUsuarioEditando(usuario);
    setMostrarFormulario(true);
  };

  /* TOGGLE ESTADO */
  const handleToggleEstado = async (id) => {
    const result = await toggleEstado(id);
    if (!result.success) {
      alert(`Error: ${result.error}`);
    }
  };

  /* ELIMINAR */
  const handleEliminar = async (id, nombre) => {
    if (window.confirm(`¿Estás seguro de eliminar al usuario ${nombre}?`)) {
      const result = await eliminarUsuario(id);
      if (!result.success) {
        alert(`Error: ${result.error}`);
      }
    }
  };

  /* CANCELAR */
  const handleCancelar = () => {
    setMostrarFormulario(false);
    setUsuarioEditando(null);
  };

  /* VALORES INICIALES */
  const valoresIniciales = usuarioEditando ? {
    nombre: usuarioEditando.nombre || '',
    apellido: usuarioEditando.apellido || '',
    email: usuarioEditando.email || '',
    telefono: usuarioEditando.telefono || '',
    rol: usuarioEditando.rol || 'mesero',
    id_sucursal: usuarioEditando.id_sucursal || '',
    password: ''
  } : {
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    rol: 'mesero',
    id_sucursal: '',
    password: '123456'
  };

  /* OBTENER NOMBRE SUCURSAL */
  const getNombreSucursal = (id_sucursal) => {
    const sucursal = sucursales.find(s => s.id === id_sucursal);
    return sucursal?.nombre || 'Sin sucursal';
  };

  /* ROL COLOR */
  const getRolBadgeClass = (rol) => {
    const badges = {
      admin: 'badge-danger',
      dueño: 'badge-primary',
      gerente: 'badge-warning',
      mesero: 'badge-success',
      cocinero: 'badge-info',
      cajero: 'badge-secondary'
    };
    return badges[rol] || 'badge';
  };

  if (loading) {
    return (
      <div className="usuarios-container">
        <div className="spinner"></div>
        <p>Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <div className="usuarios-container">
      <ModuleHeader 
        title="Gestión de Usuarios"
        buttonText={mostrarFormulario ? 'Cancelar' : 'Nuevo Usuario'}
        buttonOnClick={() => setMostrarFormulario(!mostrarFormulario)}
        buttonIcon={mostrarFormulario ? '✖' : '+'}
        showButton={user?.rol === 'admin' || user?.rol === 'dueño'}
      />

      {/* MENSAJE DE PERMISOS */}
      {getMensajePermisos() && (
        <div className="alert alert-info">
           {getMensajePermisos()}
        </div>
      )}

      {/* STATS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.activos}</div>
          <div className="stat-label">Activos</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.porRol.admin}</div>
          <div className="stat-label">Administradores</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.porRol.mesero}</div>
          <div className="stat-label">Meseros</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total</div>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* FORMULARIO */}
      {mostrarFormulario && (
        <div className="form-container">
          <h3>{usuarioEditando ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
          <Formik
            initialValues={valoresIniciales}
            validationSchema={usuarioValidationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ errors, touched, isSubmitting }) => (
              <Form className="form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="nombre">Nombre *</label>
                    <Field
                      type="text"
                      name="nombre"
                      id="nombre"
                      className={errors.nombre && touched.nombre ? 'error' : ''}
                    />
                    <ErrorMessage name="nombre" component="span" className="error-message" />
                  </div>

                  <div className="form-group">
                    <label htmlFor="apellido">Apellido *</label>
                    <Field
                      type="text"
                      name="apellido"
                      id="apellido"
                      className={errors.apellido && touched.apellido ? 'error' : ''}
                    />
                    <ErrorMessage name="apellido" component="span" className="error-message" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <Field
                      type="email"
                      name="email"
                      id="email"
                      className={errors.email && touched.email ? 'error' : ''}
                    />
                    <ErrorMessage name="email" component="span" className="error-message" />
                  </div>

                  <div className="form-group">
                    <label htmlFor="telefono">Teléfono *</label>
                    <Field
                      type="tel"
                      name="telefono"
                      id="telefono"
                      className={errors.telefono && touched.telefono ? 'error' : ''}
                    />
                    <ErrorMessage name="telefono" component="span" className="error-message" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="rol">Rol *</label>
                    <Field
                      as="select"
                      name="rol"
                      id="rol"
                      className={errors.rol && touched.rol ? 'error' : ''}
                    >
                      <option value="">Seleccione un rol</option>
                      {user?.rol === 'admin' && (
                        <>
                          <option value="admin">Administrador</option>
                          <option value="dueño">Dueño</option>
                        </>
                      )}
                      <option value="gerente">Gerente</option>
                      <option value="mesero">Mesero</option>
                      <option value="cocinero">Cocinero</option>
                      <option value="cajero">Cajero</option>
                    </Field>
                    <ErrorMessage name="rol" component="span" className="error-message" />
                    {user?.rol === 'dueño' && (
                      <small className="help-text">Solo puedes crear gerentes, meseros, cocineros y cajeros</small>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="id_sucursal">Sucursal *</label>
                    <Field
                      as="select"
                      name="id_sucursal"
                      id="id_sucursal"
                      className={errors.id_sucursal && touched.id_sucursal ? 'error' : ''}
                    >
                      <option value="">Seleccione una sucursal</option>
                      {sucursales.map(suc => (
                        <option key={suc.id} value={suc.id}>
                          {suc.nombre}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage name="id_sucursal" component="span" className="error-message" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="password">
                      {usuarioEditando ? 'Nueva Contraseña (opcional)' : 'Contraseña *'}
                    </label>
                    <Field
                      type="password"
                      name="password"
                      id="password"
                      placeholder={usuarioEditando ? 'Dejar vacío para mantener' : '123456'}
                      className={errors.password && touched.password ? 'error' : ''}
                    />
                    <ErrorMessage name="password" component="span" className="error-message" />
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCancelar}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Guardando...' : usuarioEditando ? 'Actualizar' : 'Crear Usuario'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      )}

      {/* FILTROS */}
      <div className="filtros-container">
        <div className="form-group">
          <label htmlFor="busqueda">Buscar:</label>
          <input
            type="text"
            id="busqueda"
            placeholder="Nombre, email..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="filtroRol">Rol:</label>
          <select
            id="filtroRol"
            value={filtroRol}
            onChange={(e) => setFiltroRol(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="admin">Administrador</option>
            <option value="gerente">Gerente</option>
            <option value="mesero">Mesero</option>
            <option value="cocinero">Cocinero</option>
            <option value="cajero">Cajero</option>
            <option value="dueño">Dueño</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="filtroSucursal">Sucursal:</label>
          <select
            id="filtroSucursal"
            value={filtroSucursal}
            onChange={(e) => setFiltroSucursal(e.target.value)}
          >
            <option value="todos">Todas</option>
            {sucursales.map(suc => (
              <option key={suc.id} value={suc.id}>
                {suc.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="filtroEstado">Estado:</label>
          <select
            id="filtroEstado"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="activos">Activos</option>
            <option value="inactivos">Inactivos</option>
          </select>
        </div>
      </div>

      {/* TABLA USUARIOS */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Rol</th>
              <th>Sucursal</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-state">
                  No se encontraron usuarios
                </td>
              </tr>
            ) : (
              usuariosFiltrados.map(usuario => (
                <tr key={usuario.id}>
                  <td>
                    <strong>{usuario.nombre} {usuario.apellido}</strong>
                  </td>
                  <td>{usuario.email}</td>
                  <td>{usuario.telefono}</td>
                  <td>
                    <span className={`badge ${getRolBadgeClass(usuario.rol)}`}>
                      {usuario.rol}
                    </span>
                  </td>
                  <td>{getNombreSucursal(usuario.id_sucursal)}</td>
                  <td>
                    <span className={`badge ${usuario.activo ? 'badge-success' : 'badge-danger'}`}>
                      {usuario.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      {(user?.rol === 'admin' || user?.rol === 'dueño') && (
                        <>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleEditar(usuario)}
                            title="Editar"
                          >
                            <img src={editIcon} alt="Edit" width="16" height="16" />
                          </button>
                          <button
                            className={`btn btn-sm ${usuario.activo ? 'btn-warning' : 'btn-success'}`}
                            onClick={() => handleToggleEstado(usuario.id)}
                            title={usuario.activo ? 'Desactivar' : 'Activar'}
                          >
                            <img src={usuario.activo ? pauseIcon : playIcon} alt={usuario.activo ? 'Pause' : 'Play'} width="16" height="16" />
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleEliminar(usuario.id, `${usuario.nombre} ${usuario.apellido}`)}
                            title="Eliminar"
                          >
                            <img src={deleteIcon} alt="Delete" width="16" height="16" />
                          </button>
                        </>
                      )}
                      {user?.rol === 'gerente' && (
                        <span className="text-muted">Solo lectura</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Usuarios;

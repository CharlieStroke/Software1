import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useMeseros } from '../hooks/useMeseros';
import { useAuth } from '../../../context/AuthContext';
import ModuleHeader from '../../../shared/ModuleHeader';
import '../componentsCss/meseros.css';
import playIcon from '../../../assets/play.svg';
import pauseIcon from '../../../assets/pause.svg';
import deleteIcon from '../../../assets/delete.svg';
import editIcon from '../../../assets/edit.svg';
import callingIcon from '../../../assets/calling.svg';

/* VALIDACIÓN DE FORMULARIO */
const meseroValidationSchema = Yup.object({
  nombre: Yup.string()
    .required('El nombre es obligatorio')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras'),
  apellido: Yup.string()
    .required('El apellido es obligatorio')
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(100, 'El apellido no puede exceder 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El apellido solo puede contener letras'),
  email: Yup.string()
    .required('El email es obligatorio')
    .email('Email inválido')
    .max(150, 'El email no puede exceder 150 caracteres'),
  telefono: Yup.string()
    .required('El teléfono es obligatorio')
    .matches(/^[0-9]+$/, 'El teléfono debe contener solo números')
    .min(10, 'El teléfono debe tener al menos 10 dígitos')
    .max(15, 'El teléfono no puede exceder 15 dígitos'),
  password: Yup.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(50, 'La contraseña no puede exceder 50 caracteres'),
  id_sucursal: Yup.number()
    .required('La sucursal es obligatoria')
    .positive('Seleccione una sucursal válida')
});

const Meseros = () => {
  const { user } = useAuth();
  const {
    meseros,
    sucursales,
    loading,
    error,
    crearMesero,
    actualizarMesero,
    toggleEstado,
    eliminarMesero,
    sucursalUsuario
  } = useMeseros();

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [meseroEditando, setMeseroEditando] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [busqueda, setBusqueda] = useState('');

  /* FILTRAR MESEROS */
  const meserosFiltrados = meseros.filter(mesero => {
    const cumpleEstado = filtroEstado === 'todos' ||
      (filtroEstado === 'activos' && mesero.activo) ||
      (filtroEstado === 'inactivos' && !mesero.activo);

    const cumpleBusqueda = busqueda === '' ||
      mesero.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      mesero.apellido?.toLowerCase().includes(busqueda.toLowerCase()) ||
      mesero.email?.toLowerCase().includes(busqueda.toLowerCase()) ||
      mesero.telefono?.includes(busqueda);

    return cumpleEstado && cumpleBusqueda;
  });

  /* MANEJAR SUBMIT DEL FORMULARIO */
  const handleSubmit = async (valores, { resetForm, setSubmitting }) => {
    try {
      let result;
      if (meseroEditando) {
        result = await actualizarMesero(meseroEditando.id, valores);
      } else {
        result = await crearMesero(valores);
      }

      if (result.success) {
        resetForm();
        setMostrarFormulario(false);
        setMeseroEditando(null);
        alert(`Mesero ${meseroEditando ? 'actualizado' : 'creado'} exitosamente`);
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

  /* EDITAR MESERO */
  const handleEditar = (mesero) => {
    setMeseroEditando(mesero);
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
    if (window.confirm(`¿Estás seguro de eliminar al mesero ${nombre}?`)) {
      const result = await eliminarMesero(id);
      if (!result.success) {
        alert(`Error: ${result.error}`);
      }
    }
  };

  /* CANCELAR FORMULARIO */
  const handleCancelar = () => {
    setMostrarFormulario(false);
    setMeseroEditando(null);
  };

  /* VALORES INICIALES DEL FORMULARIO */
  const valoresIniciales = meseroEditando ? {
    nombre: meseroEditando.nombre || '',
    apellido: meseroEditando.apellido || '',
    email: meseroEditando.email || '',
    telefono: meseroEditando.telefono || '',
    password: '',
    id_sucursal: meseroEditando.id_sucursal || sucursalUsuario || ''
  } : {
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    password: '123456',
    id_sucursal: sucursalUsuario || ''
  };

  if (loading) {
    return (
      <div className="meseros-container">
        <div className="spinner"></div>
        <p>Cargando meseros...</p>
      </div>
    );
  }

  return (
    <div className="meseros-container">
      <ModuleHeader 
        title="Gestión de Meseros"
        buttonText={mostrarFormulario ? 'Cancelar' : 'Nuevo Mesero'}
        buttonOnClick={() => setMostrarFormulario(!mostrarFormulario)}
        buttonIcon={mostrarFormulario ? '✖' : '+'}
        showButton={true}
      />

      {/* STATS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{meseros.filter(m => m.activo).length}</div>
          <div className="stat-label">Meseros Activos</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{meseros.filter(m => !m.activo).length}</div>
          <div className="stat-label">Meseros Inactivos</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{meseros.length}</div>
          <div className="stat-label">Total Meseros</div>
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* FORMULARIO */}
      {mostrarFormulario && (
        <div className="form-container">
          <h3>{meseroEditando ? 'Editar Mesero' : 'Nuevo Mesero'}</h3>
          <Formik
            initialValues={valoresIniciales}
            validationSchema={meseroValidationSchema}
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
                      placeholder="Juan"
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
                      placeholder="Pérez"
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
                      placeholder="mesero@restaurant.com"
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
                      placeholder="9511234567"
                      className={errors.telefono && touched.telefono ? 'error' : ''}
                    />
                    <ErrorMessage name="telefono" component="span" className="error-message" />
                  </div>
                </div>

                <div className="form-row">
                  {!sucursalUsuario && (
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
                  )}

                  <div className="form-group">
                    <label htmlFor="password">
                      {meseroEditando ? 'Nueva Contraseña (opcional)' : 'Contraseña *'}
                    </label>
                    <Field
                      type="password"
                      name="password"
                      id="password"
                      placeholder={meseroEditando ? 'Dejar vacío para mantener' : '123456'}
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
                    {isSubmitting ? 'Guardando...' : meseroEditando ? 'Actualizar' : 'Crear Mesero'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      )}

      {/* FILTROS Y BÚSQUEDA */}
      <div className="filtros-container">
        <div className="form-group">
          <label htmlFor="busqueda">Buscar:</label>
          <input
            type="text"
            id="busqueda"
            placeholder="Nombre, email, teléfono..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
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

      {/* LISTA DE MESEROS */}
      <div className="cards-grid">
        {meserosFiltrados.length === 0 ? (
          <div className="empty-state">
            <p>No se encontraron meseros</p>
          </div>
        ) : (
          meserosFiltrados.map(mesero => (
            <div key={mesero.id} className={`item-card ${!mesero.activo ? 'inactivo' : ''}`}>
              <div className="card-header">
                <div className="avatar">
                  {mesero.nombre?.charAt(0)}{mesero.apellido?.charAt(0)}
                </div>
                <div className="card-info">
                  <h3>{mesero.nombre} {mesero.apellido}</h3>
                  <p className="email">{mesero.email}</p>
                  <p className="telefono">
                    <img src={callingIcon} alt="Teléfono" width="14" height="14" />
                    {mesero.telefono}
                  </p>
                </div>
              </div>

              <div className="card-body">
                <span className={`badge ${mesero.activo ? 'badge-success' : 'badge-danger'}`}>
                  {mesero.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              <div className="card-actions">
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => handleEditar(mesero)}
                  title="Editar"
                >
                  <img src={editIcon} alt="Edit" width="16" height="16" />
                </button>
                <button
                  className={`btn btn-sm ${mesero.activo ? 'btn-warning' : 'btn-success'}`}
                  onClick={() => handleToggleEstado(mesero.id)}
                  title={mesero.activo ? 'Desactivar' : 'Activar'}
                >
                  <img src={mesero.activo ? pauseIcon : playIcon} alt={mesero.activo ? 'Pause' : 'Play'} width="16" height="16" />
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleEliminar(mesero.id, `${mesero.nombre} ${mesero.apellido}`)}
                  title="Eliminar"
                >
                  <img src={deleteIcon} alt="Delete" width="16" height="16" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Meseros;

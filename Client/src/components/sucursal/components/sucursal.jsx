import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../../context/AuthContext';
import { useSucursal } from '../hooks/useSucursal';
import ModuleHeader from '../../../shared/ModuleHeader';
import '../componentsCss/sucursal.css';
import playIcon from '../../../assets/play.svg';
import pauseIcon from '../../../assets/pause.svg';
import deleteIcon from '../../../assets/delete.svg';
import editIcon from '../../../assets/edit.svg';

// Esquema de validación para sucursales
const sucursalValidationSchema = Yup.object({
    nombre: Yup.string()
        .required('El nombre de la sucursal es obligatorio')
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .max(150, 'El nombre no puede exceder 150 caracteres'),
    direccion: Yup.string()
        .required('La dirección es obligatoria')
        .min(10, 'La dirección debe tener al menos 10 caracteres')
        .max(200, 'La dirección no puede exceder 200 caracteres'),
    telefono: Yup.string()
        .matches(/^[0-9]+$/, 'El teléfono debe contener solo números, sin espacios ni guiones')
        .min(10, 'El teléfono debe tener al menos 10 dígitos')
        .max(10, 'El teléfono no puede exceder 10 dígitos'),
    email: Yup.string()
        .email('Formato de email inválido')
        .max(150, 'El email no puede exceder 150 caracteres'),
    dueño: Yup.string()
        .min(3, 'El nombre del dueño debe tener al menos 3 caracteres')
        .max(200, 'El nombre del dueño no puede exceder 200 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
    horarioApertura: Yup.string()
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
    horarioCierre: Yup.string()
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)')
        .test('mayor-que-apertura', 'El horario de cierre debe ser posterior al de apertura',
            function(value) {
                const { horarioApertura } = this.parent;
                if (!horarioApertura || !value) return true;
                return value > horarioApertura;
            }),
    capacidad: Yup.number()
        .integer('La capacidad debe ser un número entero')
        .min(1, 'La capacidad mínima es 1 persona')
        .max(1000, 'La capacidad máxima es 1,000 personas'),
    fechaApertura: Yup.date()
        .max(new Date(), 'La fecha de apertura no puede ser futura'),
    activa: Yup.boolean()
});

export default function Sucursal() {
  const { user } = useAuth();
  const {
    sucursales,
    loading,
    error,
    crearSucursal,
    actualizarSucursal,
    toggleEstado: toggleEstadoApi,
    eliminarSucursal: eliminarSucursalApi
  } = useSucursal();

  const [mostrarModal, setMostrarModal] = useState(false);
  const [sucursalEditando, setSucursalEditando] = useState(null);

  const abrirModal = (sucursal = null) => {
    setSucursalEditando(sucursal);
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setSucursalEditando(null);
  };

  const guardarSucursal = async (valores, { resetForm, setSubmitting }) => {
    try {
      let result;
      if (sucursalEditando) {
        result = await actualizarSucursal(sucursalEditando.id, valores);
      } else {
        result = await crearSucursal(valores);
      }

      if (result.success) {
        resetForm();
        cerrarModal();
        alert(`Sucursal ${sucursalEditando ? 'actualizada' : 'creada'} exitosamente`);
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error al guardar sucursal:', error);
      alert('Error al procesar la solicitud');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEliminarSucursal = async (id, nombre) => {
    if (window.confirm(`¿Estás seguro de eliminar la sucursal "${nombre}"?`)) {
      const result = await eliminarSucursalApi(id);
      if (!result.success) {
        alert(`Error: ${result.error}`);
      }
    }
  };

  const handleToggleEstado = async (id) => {
    const result = await toggleEstadoApi(id);
    if (!result.success) {
      alert(`Error: ${result.error}`);
    }
  };

  if (loading) {
    return (
      <div className="sucursal-container">
        <div className="spinner"></div>
        <p>Cargando sucursales...</p>
      </div>
    );
  }

  return (
    <div className="sucursal-container">
      <ModuleHeader 
        title="Gestión de Sucursales"
        buttonText="Agregar Sucursal"
        buttonOnClick={() => abrirModal()}
        buttonIcon="+"
        showButton={user?.rol === 'admin' || user?.rol === 'dueño'}
      />

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <div className="sucursales-grid">
        {sucursales.map(sucursal => (
          <div key={sucursal.id} className={`sucursal-card ${!sucursal.activa ? 'inactiva' : ''}`}>
            <div className="sucursal-info">
              <h3>{sucursal.nombre}</h3>
              <p><strong>Dirección:</strong> {sucursal.direccion}</p>
              <p><strong>Teléfono:</strong> {sucursal.telefono}</p>
              <p><strong>Email:</strong> {sucursal.email}</p>
              <p><strong>Dueño:</strong> {sucursal.dueño}</p>
              <p><strong>Horario:</strong> {sucursal.horarioApertura} - {sucursal.horarioCierre}</p>
              <p><strong>Capacidad:</strong> {sucursal.capacidad} personas</p>
              <p><strong>Fecha de Apertura:</strong> {sucursal.fechaApertura}</p>
              <p className={`estado ${sucursal.activa ? 'activa' : 'inactiva'}`}>
                <strong>Estado:</strong> {sucursal.activa ? 'Activa' : 'Inactiva'}
              </p>
            </div>
            <div className="sucursal-acciones">
              <button 
                className="btn-editar"
                onClick={() => abrirModal(sucursal)}
              >
                <img src={editIcon} alt="Edit" width="16" height="16" />
              </button>
              {(user?.rol === 'admin' || user?.rol === 'dueño') && (
                <>
                  <button 
                    className={`btn-toggle ${sucursal.activa ? 'desactivar' : 'activar'}`}
                    onClick={() => handleToggleEstado(sucursal.id)}
                  >
                    <img src={sucursal.activa ? pauseIcon : playIcon} alt={sucursal.activa ? 'Pause' : 'Play'} width="16" height="16" />
                  </button>
                  <button 
                    className="btn-eliminar"
                    onClick={() => handleEliminarSucursal(sucursal.id, sucursal.nombre)}
                  >
                    <img src={deleteIcon} alt="Delete" width="16" height="16" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {sucursales.length === 0 && (
        <div className="no-sucursales">
          <p>No hay sucursales registradas. ¡Agrega la primera!</p>
        </div>
      )}

      {/* Modal de formulario */}
      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{sucursalEditando ? 'Editar Sucursal' : 'Agregar Sucursal'}</h2>
              <button className="btn-cerrar" onClick={cerrarModal}>×</button>
            </div>
            
            <Formik
              initialValues={{
                nombre: sucursalEditando?.nombre || '',
                direccion: sucursalEditando?.direccion || '',
                telefono: sucursalEditando?.telefono || '',
                email: sucursalEditando?.email || '',
                dueño: sucursalEditando?.dueño || '',
                horarioApertura: sucursalEditando?.horarioApertura || '',
                horarioCierre: sucursalEditando?.horarioCierre || '',
                capacidad: sucursalEditando?.capacidad || '',
                fechaApertura: sucursalEditando?.fechaApertura || '',
                activa: sucursalEditando?.activa ?? true
              }}
              validationSchema={sucursalValidationSchema}
              onSubmit={guardarSucursal}
              enableReinitialize
            >
              {({ errors, touched, isSubmitting }) => (
                <Form className="sucursal-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="nombre">Nombre de la Sucursal *</label>
                      <Field
                        type="text"
                        id="nombre"
                        name="nombre"
                        className={`form-input ${errors.nombre && touched.nombre ? 'error' : ''}`}
                        placeholder="Ej: Sucursal Centro"
                      />
                      <ErrorMessage name="nombre" component="span" className="error-message" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="dueño">Dueño</label>
                      <Field
                        type="text"
                        pattern="[A-Za-z]*"
                        id="dueño"
                        name="dueño"
                        className={`form-input ${errors.dueño && touched.dueño ? 'error' : ''}`}
                        placeholder="Ej: Ana García"
                      />
                      <ErrorMessage name="dueño" component="span" className="error-message" />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="direccion">Dirección *</label>
                    <Field
                      type="text"
                      id="direccion"
                      name="direccion"
                      className={`form-input ${errors.direccion && touched.direccion ? 'error' : ''}`}
                      placeholder="Ej: Calle 50 #12-34, Centro"
                    />
                    <ErrorMessage name="direccion" component="span" className="error-message" />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="telefono">Teléfono</label>
                      <Field
                        type="tel"
                        id="telefono"
                        name="telefono"
                        className={`form-input ${errors.telefono && touched.telefono ? 'error' : ''}`}
                        placeholder="Ej: 9512345678"
                      />
                      <ErrorMessage name="telefono" component="span" className="error-message" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">Email</label>
                      <Field
                        type="email"
                        id="email"
                        name="email"
                        className={`form-input ${errors.email && touched.email ? 'error' : ''}`}
                        placeholder="Ej: centro@restaurant.com"
                      />
                      <ErrorMessage name="email" component="span" className="error-message" />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="horarioApertura">Horario de Apertura</label>
                      <Field
                        type="time"
                        id="horarioApertura"
                        name="horarioApertura"
                        className={`form-input ${errors.horarioApertura && touched.horarioApertura ? 'error' : ''}`}
                      />
                      <ErrorMessage name="horarioApertura" component="span" className="error-message" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="horarioCierre">Horario de Cierre</label>
                      <Field
                        type="time"
                        id="horarioCierre"
                        name="horarioCierre"
                        className={`form-input ${errors.horarioCierre && touched.horarioCierre ? 'error' : ''}`}
                      />
                      <ErrorMessage name="horarioCierre" component="span" className="error-message" />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="capacidad">Capacidad (personas)</label>
                      <Field
                        type="number"
                        id="capacidad"
                        name="capacidad"
                        className={`form-input ${errors.capacidad && touched.capacidad ? 'error' : ''}`}
                        placeholder="Ej: 80"
                        min="1"
                      />
                      <ErrorMessage name="capacidad" component="span" className="error-message" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="fechaApertura">Fecha de Apertura</label>
                      <Field
                        type="date"
                        id="fechaApertura"
                        name="fechaApertura"
                        className={`form-input ${errors.fechaApertura && touched.fechaApertura ? 'error' : ''}`}
                      />
                      <ErrorMessage name="fechaApertura" component="span" className="error-message" />
                    </div>
                  </div>

                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <Field
                        type="checkbox"
                        name="activa"
                      />
                      <span className="checkmark"></span>
                      Sucursal Activa
                    </label>
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn-cancelar" onClick={cerrarModal}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn-guardar" disabled={isSubmitting}>
                      {isSubmitting ? 'Guardando...' : (sucursalEditando ? 'Actualizar' : 'Guardar')}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}
    </div>
  );
}

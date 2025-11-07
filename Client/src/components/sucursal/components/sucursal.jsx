import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import '../componentsCss/sucursal.css';

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
  const [sucursales, setSucursales] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [sucursalEditando, setSucursalEditando] = useState(null);

  useEffect(() => {
    const sucursalesIniciales = [
      {
        id: 1,
        nombre: 'Sucursal Centro',
        direccion: 'Calle 50 #12-34, Centro',
        telefono: '5760123456789',
        email: 'centro@restaurant.com',
        dueño: 'Ana García',
        horarioApertura: '08:00',
        horarioCierre: '22:00',
        capacidad: 80,
        fechaApertura: '2020-01-15',
        activa: true
      },
      {
        id: 2,
        nombre: 'Sucursal Norte',
        direccion: 'Carrera 15 #85-42, Zona Rosa',
        telefono: '5760134567890',
        email: 'norte@restaurant.com',
        dueño: 'Carlos Mendez',
        horarioApertura: '09:00',
        horarioCierre: '23:00',
        capacidad: 120,
        fechaApertura: '2021-06-10',
        activa: true
      },
      {
        id: 3,
        nombre: 'Sucursal Sur',
        direccion: 'Avenida 68 #45-23, Zona Sur',
        telefono: '5760145678901',
        email: 'sur@restaurant.com',
        dueño: 'Laura Jiménez',
        horarioApertura: '10:00',
        horarioCierre: '21:00',
        capacidad: 60,
        fechaApertura: '2022-03-20',
        activa: false
      }
    ];
    setSucursales(sucursalesIniciales);
  }, []);

  const abrirModal = (sucursal = null) => {
    setSucursalEditando(sucursal);
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setSucursalEditando(null);
  };

  const guardarSucursal = async (valores, { resetForm }) => {
    try {
      await sucursalValidationSchema.validate(valores, { abortEarly: false });
      
      const datosParaGuardar = {
        ...valores,
        capacidad: valores.capacidad ? parseInt(valores.capacidad) : 0
      };

      if (sucursalEditando) {
        // Editar sucursal existente
        setSucursales(prev => prev.map(sucursal => 
          sucursal.id === sucursalEditando.id 
            ? { ...sucursal, ...datosParaGuardar }
            : sucursal
        ));
      } else {
        // Agregar nueva sucursal
        const nuevaSucursal = {
          id: Date.now(),
          ...datosParaGuardar
        };
        setSucursales(prev => [...prev, nuevaSucursal]);
      }

      resetForm();
      cerrarModal();
    } catch (error) {
      console.error('Error al guardar sucursal:', error);
      throw error;
    }
  };

  const eliminarSucursal = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta sucursal?')) {
      setSucursales(prev => prev.filter(sucursal => sucursal.id !== id));
    }
  };

  const toggleEstado = (id) => {
    setSucursales(prev => prev.map(sucursal => 
      sucursal.id === id 
        ? { ...sucursal, activa: !sucursal.activa }
        : sucursal
    ));
  };

  return (
    <div className="sucursal-container">
      <div className="sucursal-header">
        <h1>Gestión de Sucursales</h1>
        <button 
          className="btn-agregar-sucursal"
          onClick={() => abrirModal()}
        >
          + Agregar Sucursal
        </button>
      </div>

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
                Editar
              </button>
              <button 
                className={`btn-toggle ${sucursal.activa ? 'desactivar' : 'activar'}`}
                onClick={() => toggleEstado(sucursal.id)}
              >
                {sucursal.activa ? 'Desactivar' : 'Activar'}
              </button>
              <button 
                className="btn-eliminar"
                onClick={() => eliminarSucursal(sucursal.id)}
              >
                Eliminar
              </button>
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

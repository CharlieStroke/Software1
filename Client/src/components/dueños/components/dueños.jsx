import React, { useState, useEffect } from 'react';
import '../pagesCss/dueños.css';

export default function Dueños() {
  const [dueños, setDueños] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [dueñoEditando, setDueñoEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    fechaIngreso: '',
    sucursalesAsignadas: '',
    activo: true
  });

  // Simulamos datos iniciales
  useEffect(() => {
    const dueñosIniciales = [
      {
        id: 1,
        nombre: 'Juan Carlos',
        apellido: 'Rodríguez',
        email: 'juan.rodriguez@restaurant.com',
        telefono: '+57 300 123 4567',
        fechaIngreso: '2020-01-15',
        sucursalesAsignadas: 'Centro, Norte',
        activo: true
      },
      {
        id: 2,
        nombre: 'María Elena',
        apellido: 'González',
        email: 'maria.gonzalez@restaurant.com',
        telefono: '+57 310 987 6543',
        fechaIngreso: '2019-03-20',
        sucursalesAsignadas: 'Sur, Oeste',
        activo: true
      }
    ];
    setDueños(dueñosIniciales);
  }, []);

  const abrirModal = (dueño = null) => {
    if (dueño) {
      setDueñoEditando(dueño);
      setFormData({
        nombre: dueño.nombre,
        apellido: dueño.apellido,
        email: dueño.email,
        telefono: dueño.telefono,
        fechaIngreso: dueño.fechaIngreso,
        sucursalesAsignadas: dueño.sucursalesAsignadas,
        activo: dueño.activo
      });
    } else {
      setDueñoEditando(null);
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        fechaIngreso: '',
        sucursalesAsignadas: '',
        activo: true
      });
    }
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setDueñoEditando(null);
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      fechaIngreso: '',
      sucursalesAsignadas: '',
      activo: true
    });
  };

  const manejarInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const manejarSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.nombre.trim() || !formData.apellido.trim() || !formData.email.trim()) {
      alert('Por favor, completa los campos obligatorios (nombre, apellido, email)');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Por favor, ingresa un email válido');
      return;
    }

    if (dueñoEditando) {
      // Editar dueño existente
      setDueños(prev => prev.map(dueño => 
        dueño.id === dueñoEditando.id 
          ? { ...dueño, ...formData }
          : dueño
      ));
    } else {
      // Agregar nuevo dueño
      const nuevoDueño = {
        id: Date.now(),
        ...formData
      };
      setDueños(prev => [...prev, nuevoDueño]);
    }

    cerrarModal();
  };

  const eliminarDueño = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este dueño?')) {
      setDueños(prev => prev.filter(dueño => dueño.id !== id));
    }
  };

  const toggleEstado = (id) => {
    setDueños(prev => prev.map(dueño => 
      dueño.id === id 
        ? { ...dueño, activo: !dueño.activo }
        : dueño
    ));
  };

  return (
    <div className="dueños-container">
      <div className="dueños-header">
        <h1>Gestión de Dueños</h1>
        <button 
          className="btn-agregar-dueño"
          onClick={() => abrirModal()}
        >
          + Agregar Dueño
        </button>
      </div>

      <div className="dueños-grid">
        {dueños.map(dueño => (
          <div key={dueño.id} className={`dueño-card ${!dueño.activo ? 'inactivo' : ''}`}>
            <div className="dueño-info">
              <h3>{dueño.nombre} {dueño.apellido}</h3>
              <p><strong>Email:</strong> {dueño.email}</p>
              <p><strong>Teléfono:</strong> {dueño.telefono}</p>
              <p><strong>Fecha de Ingreso:</strong> {dueño.fechaIngreso}</p>
              <p><strong>Sucursales:</strong> {dueño.sucursalesAsignadas}</p>
              <p className={`estado ${dueño.activo ? 'activo' : 'inactivo'}`}>
                <strong>Estado:</strong> {dueño.activo ? 'Activo' : 'Inactivo'}
              </p>
            </div>
            <div className="dueño-acciones">
              <button 
                className="btn-editar"
                onClick={() => abrirModal(dueño)}
              >
                Editar
              </button>
              <button 
                className={`btn-toggle ${dueño.activo ? 'desactivar' : 'activar'}`}
                onClick={() => toggleEstado(dueño.id)}
              >
                {dueño.activo ? 'Desactivar' : 'Activar'}
              </button>
              <button 
                className="btn-eliminar"
                onClick={() => eliminarDueño(dueño.id)}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {dueños.length === 0 && (
        <div className="no-dueños">
          <p>No hay dueños registrados. ¡Agrega el primero!</p>
        </div>
      )}

      {/* Modal de formulario */}
      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{dueñoEditando ? 'Editar Dueño' : 'Agregar Dueño'}</h2>
              <button className="btn-cerrar" onClick={cerrarModal}>×</button>
            </div>
            <form onSubmit={manejarSubmit} className="dueño-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="nombre">Nombre *</label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={manejarInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="apellido">Apellido *</label>
                  <input
                    type="text"
                    id="apellido"
                    name="apellido"
                    value={formData.apellido}
                    onChange={manejarInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={manejarInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="telefono">Teléfono</label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={manejarInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="fechaIngreso">Fecha de Ingreso</label>
                  <input
                    type="date"
                    id="fechaIngreso"
                    name="fechaIngreso"
                    value={formData.fechaIngreso}
                    onChange={manejarInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="sucursalesAsignadas">Sucursales Asignadas</label>
                  <input
                    type="text"
                    id="sucursalesAsignadas"
                    name="sucursalesAsignadas"
                    value={formData.sucursalesAsignadas}
                    onChange={manejarInputChange}
                    placeholder="Ej: Centro, Norte, Sur"
                  />
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="activo"
                    checked={formData.activo}
                    onChange={manejarInputChange}
                  />
                  <span className="checkmark"></span>
                  Dueño Activo
                </label>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancelar" onClick={cerrarModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar">
                  {dueñoEditando ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

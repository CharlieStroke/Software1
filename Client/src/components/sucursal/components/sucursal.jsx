import React, { useState, useEffect } from 'react';
import '../componentsCss/sucursal.css';

export default function Sucursal() {
  const [sucursales, setSucursales] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [sucursalEditando, setSucursalEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    email: '',
    dueño: '',
    horarioApertura: '',
    horarioCierre: '',
    capacidad: '',
    fechaApertura: '',
    activa: true
  });

  useEffect(() => {
    const sucursalesIniciales = [
      {
        id: 1,
        nombre: 'Sucursal Centro',
        direccion: 'Calle 50 #12-34, Centro',
        telefono: '+57 601 234 5678',
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
        telefono: '+57 601 345 6789',
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
        telefono: '+57 601 456 7890',
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
    if (sucursal) {
      setSucursalEditando(sucursal);
      setFormData({
        nombre: sucursal.nombre,
        direccion: sucursal.direccion,
        telefono: sucursal.telefono,
        email: sucursal.email,
        dueño: sucursal.dueño,
        horarioApertura: sucursal.horarioApertura,
        horarioCierre: sucursal.horarioCierre,
        capacidad: sucursal.capacidad.toString(),
        fechaApertura: sucursal.fechaApertura,
        activa: sucursal.activa
      });
    } else {
      setSucursalEditando(null);
      setFormData({
        nombre: '',
        direccion: '',
        telefono: '',
        email: '',
        dueño: '',
        horarioApertura: '',
        horarioCierre: '',
        capacidad: '',
        fechaApertura: '',
        activa: true
      });
    }
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setSucursalEditando(null);
    setFormData({
      nombre: '',
      direccion: '',
      telefono: '',
      email: '',
      dueño: '',
      horarioApertura: '',
      horarioCierre: '',
      capacidad: '',
      fechaApertura: '',
      activa: true
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
    
    if (!formData.nombre.trim() || !formData.direccion.trim()) {
      alert('Por favor, completa los campos obligatorios (nombre y dirección)');
      return;
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      alert('Por favor, ingresa un email válido');
      return;
    }

    if (formData.capacidad && (isNaN(formData.capacidad) || formData.capacidad <= 0)) {
      alert('La capacidad debe ser un número positivo');
      return;
    }

    if (formData.horarioApertura && formData.horarioCierre) {
      if (formData.horarioApertura >= formData.horarioCierre) {
        alert('El horario de apertura debe ser anterior al horario de cierre');
        return;
      }
    }

    const datosParaGuardar = {
      ...formData,
      capacidad: formData.capacidad ? parseInt(formData.capacidad) : 0
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

    cerrarModal();
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
            <form onSubmit={manejarSubmit} className="sucursal-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="nombre">Nombre de la Sucursal *</label>
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
                  <label htmlFor="dueño">Dueño</label>
                  <input
                    type="text"
                    id="dueño"
                    name="dueño"
                    value={formData.dueño}
                    onChange={manejarInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="direccion">Dirección *</label>
                <input
                  type="text"
                  id="direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={manejarInputChange}
                  required
                />
              </div>

              <div className="form-row">
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
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={manejarInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="horarioApertura">Horario de Apertura</label>
                  <input
                    type="time"
                    id="horarioApertura"
                    name="horarioApertura"
                    value={formData.horarioApertura}
                    onChange={manejarInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="horarioCierre">Horario de Cierre</label>
                  <input
                    type="time"
                    id="horarioCierre"
                    name="horarioCierre"
                    value={formData.horarioCierre}
                    onChange={manejarInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="capacidad">Capacidad (personas)</label>
                  <input
                    type="number"
                    id="capacidad"
                    name="capacidad"
                    value={formData.capacidad}
                    onChange={manejarInputChange}
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="fechaApertura">Fecha de Apertura</label>
                  <input
                    type="date"
                    id="fechaApertura"
                    name="fechaApertura"
                    value={formData.fechaApertura}
                    onChange={manejarInputChange}
                  />
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="activa"
                    checked={formData.activa}
                    onChange={manejarInputChange}
                  />
                  <span className="checkmark"></span>
                  Sucursal Activa
                </label>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancelar" onClick={cerrarModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar">
                  {sucursalEditando ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

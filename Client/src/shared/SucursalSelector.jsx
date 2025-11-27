import { useState, useEffect } from 'react';
import { getSucursalesActivas } from '../api/sucursalApi';
import { useAuth } from '../context/AuthContext';

/**
 * Componente selector de sucursales
 * Se muestra solo para usuarios admin
 * Para otros roles, retorna null
 * 
 * @param {string} value - Valor seleccionado
 * @param {function} onChange - Callback cuando cambia la selección
 * @param {string} className - Clases CSS adicionales
 * @param {boolean} showLabel - Mostrar etiqueta
 * @param {boolean} disabled - Deshabilitar selector
 * @param {string} defaultOptionText - Texto de la opción por defecto
 * @param {boolean} required - Si es campo requerido (cambia el texto del label)
 */
const SucursalSelector = ({ 
  value, 
  onChange, 
  className = '', 
  showLabel = true, 
  disabled = false,
  defaultOptionText = 'Todas las sucursales',
  required = false
}) => {
  const { user } = useAuth();
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarSucursales = async () => {
      // Solo cargar si el usuario es admin
      if (user?.rol !== 'admin') return;

      try {
        setLoading(true);
        const response = await getSucursalesActivas();
        // La API devuelve {sucursales: [], total: n}
        const sucursalesData = response.sucursales || response;
        setSucursales(sucursalesData);
        setError(null);
      } catch (err) {
        console.error('Error al cargar sucursales:', err);
        setError('Error al cargar sucursales');
      } finally {
        setLoading(false);
      }
    };

    cargarSucursales();
  }, [user?.rol]);

  // No mostrar nada si no es admin
  if (user?.rol !== 'admin') {
    return null;
  }

  return (
    <div className="form-group">
      {showLabel && (
        <label htmlFor="sucursal_id">
          Sucursal{required ? ' *' : ''}
        </label>
      )}
      <select
        id="sucursal_id"
        name="sucursal_id"
        value={value || ''}
        onChange={onChange}
        className={className}
        disabled={disabled || loading}
      >
        <option value="">
          {loading ? 'Cargando sucursales...' : defaultOptionText}
        </option>
        {Array.isArray(sucursales) && sucursales.map(sucursal => (
          <option key={sucursal.id} value={sucursal.id}>
            {sucursal.nombre}
          </option>
        ))}
      </select>
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

export default SucursalSelector;

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import * as usuariosApi from '../../../api/usuariosApi';
import * as sucursalApi from '../../../api/sucursalApi';

export const useUsuarios = () => {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* CARGAR TODOS LOS USUARIOS */
  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await usuariosApi.getUsers();
      setUsuarios(data.usuarios || []);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setError(err.response?.data?.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  /* CARGAR SUCURSALES */
  const cargarSucursales = async () => {
    try {
      const data = await sucursalApi.getSucursales();
      setSucursales(data.sucursales || []);
    } catch (err) {
      console.error('Error al cargar sucursales:', err);
    }
  };

  /* CREAR USUARIO */
  const crearUsuario = async (datos) => {
    try {
      const result = await usuariosApi.createUser(datos);
      await cargarUsuarios(); // Recargar lista
      return { success: true, data: result };
    } catch (err) {
      console.error('Error al crear usuario:', err);
      return {
        success: false,
        error: err.response?.data?.message || 'Error al crear usuario'
      };
    }
  };

  /* ACTUALIZAR USUARIO */
  const actualizarUsuario = async (id, datos) => {
    try {
      const result = await usuariosApi.updateUser(id, datos);
      await cargarUsuarios(); // Recargar lista
      return { success: true, data: result };
    } catch (err) {
      console.error('Error al actualizar usuario:', err);
      return {
        success: false,
        error: err.response?.data?.message || 'Error al actualizar usuario'
      };
    }
  };

  /* TOGGLE ESTADO */
  const toggleEstado = async (id) => {
    try {
      await usuariosApi.toggleUserStatus(id);
      await cargarUsuarios(); // Recargar lista
      return { success: true };
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      return {
        success: false,
        error: err.response?.data?.message || 'Error al cambiar estado'
      };
    }
  };

  /* ELIMINAR USUARIO */
  const eliminarUsuario = async (id) => {
    try {
      await usuariosApi.deleteUser(id);
      await cargarUsuarios(); // Recargar lista
      return { success: true };
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
      return {
        success: false,
        error: err.response?.data?.message || 'Error al eliminar usuario'
      };
    }
  };

  /* CARGAR AL MONTAR */
  useEffect(() => {
    if (user) {
      cargarUsuarios();
      cargarSucursales();
    }
  }, [user]);

  return {
    usuarios,
    sucursales,
    loading,
    error,
    crearUsuario,
    actualizarUsuario,
    toggleEstado,
    eliminarUsuario,
    recargar: cargarUsuarios
  };
};

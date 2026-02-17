/* ===================================================================
 * SCRIPT PARA AGREGAR RELACIONES DE SUCURSAL A TODAS LAS TABLAS
 * ===================================================================
 * Este script ya NO es necesario si estás creando la base de datos
 * desde cero con database.sql actualizado.
 * 
 * Solo ejecuta este script si ya tienes una base de datos existente
 * y necesitas agregar la columna sucursal_id a categorias_productos.
 * =================================================================== */

/* AGREGAR COLUMNA SUCURSAL_ID A CATEGORIAS_PRODUCTOS (solo si no existe) */
ALTER TABLE `categorias_productos` ADD COLUMN `sucursal_id` int AFTER `activa`;

/* CREAR FOREIGN KEY PARA CATEGORIAS_PRODUCTOS */
ALTER TABLE `categorias_productos` ADD FOREIGN KEY (`sucursal_id`) REFERENCES `sucursales` (`id`);

/* ===================================================================
 * RESUMEN DE TABLAS CON RELACIÓN A SUCURSALES
 * ===================================================================
 * 
 * TABLAS CON SUCURSAL_ID:
 * ✓ sucursales (tabla principal)
 * ✓ usuarios (id_sucursal) - cada usuario pertenece a una sucursal
 * ✓ categorias_productos (sucursal_id) - categorías específicas por sucursal
 * ✓ inventario (sucursal_id) - productos por sucursal
 * ✓ clientes (id_sucursal) - clientes registrados en cada sucursal
 * ✓ pedidos (sucursal_id) - pedidos de cada sucursal
 * ✓ movimientos_inventario (sucursal_id) - movimientos por sucursal
 * 
 * TABLAS SIN SUCURSAL_ID (no lo necesitan):
 * - detalle_pedidos: hereda de pedidos.sucursal_id
 * - sesiones_usuario: hereda de usuarios.id_sucursal
 * 
 * =================================================================== */

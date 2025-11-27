-- Script para crear tabla comandas y modificar tabla pedidos
-- Fecha: 20 de noviembre de 2025

-- 1. Crear tabla comandas
CREATE TABLE IF NOT EXISTS comandas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sucursal_id INT NOT NULL,
    usuario_id INT NOT NULL,
    estatus ENUM('abierta', 'cerrada', 'cancelada') DEFAULT 'abierta',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_comandas_sucursal FOREIGN KEY (sucursal_id) REFERENCES sucursales(id) ON DELETE RESTRICT,
    CONSTRAINT fk_comandas_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    INDEX idx_comandas_sucursal (sucursal_id),
    INDEX idx_comandas_usuario (usuario_id),
    INDEX idx_comandas_estatus (estatus),
    INDEX idx_comandas_fecha (fecha_creacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Modificar tabla pedidos: eliminar columna mesa y agregar comanda_id
-- Primero eliminar la columna mesa si existe
ALTER TABLE pedidos 
DROP COLUMN IF EXISTS mesa;

-- Agregar columna comanda_id (puede ser NULL para pedidos sin comanda)
ALTER TABLE pedidos 
ADD COLUMN comanda_id INT NULL AFTER sucursal_id;

-- Agregar foreign key para comanda_id
ALTER TABLE pedidos 
ADD CONSTRAINT fk_pedidos_comanda 
FOREIGN KEY (comanda_id) REFERENCES comandas(id) ON DELETE SET NULL;

-- Agregar índice para mejor rendimiento
ALTER TABLE pedidos 
ADD INDEX idx_pedidos_comanda (comanda_id);

-- 3. Comentarios informativos
-- La tabla comandas agrupa pedidos de una mesa/orden
-- Un pedido puede existir sin comanda (para llevar, delivery)
-- Una comanda puede tener múltiples pedidos
-- estatus 'abierta': comanda activa, se pueden agregar pedidos
-- estatus 'cerrada': comanda finalizada, no se pueden agregar más pedidos
-- estatus 'cancelada': comanda cancelada

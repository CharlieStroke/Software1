-- Agregar campo estado_pago a la tabla pedidos
ALTER TABLE pedidos 
ADD COLUMN estado_pago ENUM('pendiente', 'pagado', 'parcial') DEFAULT 'pendiente' 
AFTER estado;

-- Crear índice para mejorar consultas por estado_pago
CREATE INDEX idx_pedidos_estado_pago ON pedidos(estado_pago);

-- Opcional: Actualizar pedidos existentes en comandas cerradas como pagados
UPDATE pedidos p
INNER JOIN comandas c ON p.comanda_id = c.id
SET p.estado_pago = 'pagado'
WHERE c.estatus = 'cerrada';

-- Comentarios sobre los estados:
-- 'pendiente': El pedido aún no ha sido pagado
-- 'pagado': El pedido ha sido pagado completamente
-- 'parcial': El pedido tiene pagos parciales (para implementación futura si se requiere)

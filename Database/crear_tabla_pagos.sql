-- Crear tabla de pagos
CREATE TABLE pagos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    comanda_id INT NOT NULL,
    usuario_id INT NOT NULL,
    metodo_pago ENUM('efectivo', 'tarjeta', 'transferencia', 'mixto') NOT NULL DEFAULT 'efectivo',
    monto_total DECIMAL(10, 2) NOT NULL,
    monto_efectivo DECIMAL(10, 2) DEFAULT 0.00,
    monto_tarjeta DECIMAL(10, 2) DEFAULT 0.00,
    monto_transferencia DECIMAL(10, 2) DEFAULT 0.00,
    monto_recibido DECIMAL(10, 2) DEFAULT 0.00,
    cambio DECIMAL(10, 2) DEFAULT 0.00,
    propina DECIMAL(10, 2) DEFAULT 0.00,
    referencia_pago VARCHAR(100) NULL COMMENT 'Número de referencia de tarjeta/transferencia',
    notas TEXT NULL,
    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pagos_comanda FOREIGN KEY (comanda_id) REFERENCES comandas(id) ON DELETE RESTRICT,
    CONSTRAINT fk_pagos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    INDEX idx_pagos_comanda (comanda_id),
    INDEX idx_pagos_fecha (fecha_pago),
    INDEX idx_pagos_metodo (metodo_pago)
) COLLATE=utf8mb4_unicode_ci;

-- Agregar columnas en tabla comandas para control de pagos
ALTER TABLE comandas 
ADD COLUMN total_pagado DECIMAL(10, 2) DEFAULT 0.00 AFTER estatus,
ADD COLUMN fecha_cierre TIMESTAMP NULL AFTER fecha_actualizacion;

-- Crear índice para consultas de comandas cerradas
CREATE INDEX idx_comandas_fecha_cierre ON comandas(fecha_cierre);

-- ================================================
-- SISTEMA DE GESTIÓN DE RESTAURANTES
-- Script de Base de Datos MySQL
-- Fecha: 29 de septiembre de 2025
-- ================================================

-- Crear la base de datos
DROP DATABASE IF EXISTS restaurant_management;
CREATE DATABASE restaurant_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE restaurant_management;



-- ================================================
-- TABLA: SUCURSALES
-- Gestión de sucursales/restaurantes
-- ================================================
CREATE TABLE sucursales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    direccion TEXT NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(150),
    gerente VARCHAR(200),
    horario_apertura TIME,
    horario_cierre TIME,
    capacidad INT DEFAULT 0,
    fecha_apertura DATE,
    activa BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_nombre (nombre),
    INDEX idx_activa (activa),
    INDEX idx_fecha_apertura (fecha_apertura)
);

-- ================================================
-- TABLA: USUARIOS
-- Gestión de empleados del sistema
-- ================================================
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    rol ENUM('admin', 'gerente', 'mesero', 'cocinero', 'cajero') NOT NULL DEFAULT 'mesero',
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_rol (rol),
    INDEX idx_activo (activo)
);

-- ================================================
-- TABLA: CATEGORÍAS DE PRODUCTOS
-- Clasificación de productos del inventario
-- ================================================
CREATE TABLE categorias_productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    activa BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_nombre (nombre),
    INDEX idx_activa (activa)
);

-- ================================================
-- TABLA: INVENTARIO
-- Gestión de productos e ingredientes
-- ================================================
CREATE TABLE inventario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    categoria_id INT,
    precio DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    costo DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    stock_actual INT NOT NULL DEFAULT 0,
    stock_minimo INT NOT NULL DEFAULT 0,
    unidad_medida ENUM('unidad', 'kg', 'gr', 'lt', 'ml', 'porcion') NOT NULL DEFAULT 'unidad',
    sucursal_id INT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (categoria_id) REFERENCES categorias_productos(id) ON DELETE SET NULL,
    FOREIGN KEY (sucursal_id) REFERENCES sucursales(id) ON DELETE CASCADE,
    INDEX idx_nombre (nombre),
    INDEX idx_categoria (categoria_id),
    INDEX idx_sucursal (sucursal_id),
    INDEX idx_stock_actual (stock_actual),
    INDEX idx_activo (activo)
);



-- ================================================
-- TABLA: CLIENTES
-- Información de clientes para pedidos
-- ================================================
CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100),
    telefono VARCHAR(20),
    email VARCHAR(150),
    direccion TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_telefono (telefono),
    INDEX idx_email (email),
    INDEX idx_nombre (nombre)
);

-- ================================================
-- TABLA: PEDIDOS
-- Gestión de pedidos realizados
-- ================================================
CREATE TABLE pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_pedido VARCHAR(50) UNIQUE NOT NULL,
    cliente_id INT,
    usuario_id INT NOT NULL,
    sucursal_id INT NOT NULL,
    estado ENUM('pendiente', 'en_preparacion', 'listo', 'entregado', 'cancelado') DEFAULT 'pendiente',
    tipo_pedido ENUM('mesa', 'domicilio', 'para_llevar') NOT NULL DEFAULT 'mesa',
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    impuestos DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    descuento DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    notas TEXT,
    fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_entrega TIMESTAMP NULL,
    
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (sucursal_id) REFERENCES sucursales(id) ON DELETE RESTRICT,
    INDEX idx_numero_pedido (numero_pedido),
    INDEX idx_estado (estado),
    INDEX idx_tipo_pedido (tipo_pedido),
    INDEX idx_usuario (usuario_id),
    INDEX idx_sucursal (sucursal_id),
    INDEX idx_fecha_pedido (fecha_pedido)
);

-- ================================================
-- TABLA: DETALLE DE PEDIDOS
-- Items específicos de cada pedido
-- ================================================
CREATE TABLE detalle_pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    notas_item TEXT,
    
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES inventario(id) ON DELETE RESTRICT,
    INDEX idx_pedido (pedido_id),
    INDEX idx_producto (producto_id)
);

-- ================================================
-- TABLA: COMANDAS
-- Órdenes para la cocina
-- ================================================
CREATE TABLE comandas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    numero_comanda VARCHAR(50) UNIQUE NOT NULL,
    estado ENUM('pendiente', 'en_preparacion', 'lista', 'entregada') DEFAULT 'pendiente',
    prioridad ENUM('baja', 'normal', 'alta', 'urgente') DEFAULT 'normal',
    tiempo_estimado INT, -- en minutos
    usuario_asignado_id INT,
    sucursal_id INT NOT NULL,
    notas_cocina TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_inicio_preparacion TIMESTAMP NULL,
    fecha_finalizacion TIMESTAMP NULL,
    
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_asignado_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (sucursal_id) REFERENCES sucursales(id) ON DELETE RESTRICT,
    INDEX idx_numero_comanda (numero_comanda),
    INDEX idx_estado (estado),
    INDEX idx_prioridad (prioridad),
    INDEX idx_usuario_asignado (usuario_asignado_id),
    INDEX idx_sucursal (sucursal_id),
    INDEX idx_fecha_creacion (fecha_creacion)
);

-- ================================================
-- TABLA: DETALLE DE COMANDAS
-- Items específicos de cada comanda
-- ================================================
CREATE TABLE detalle_comandas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    comanda_id INT NOT NULL,
    detalle_pedido_id INT NOT NULL,
    estado_item ENUM('pendiente', 'en_preparacion', 'listo') DEFAULT 'pendiente',
    notas_preparacion TEXT,
    
    FOREIGN KEY (comanda_id) REFERENCES comandas(id) ON DELETE CASCADE,
    FOREIGN KEY (detalle_pedido_id) REFERENCES detalle_pedidos(id) ON DELETE CASCADE,
    INDEX idx_comanda (comanda_id),
    INDEX idx_detalle_pedido (detalle_pedido_id),
    INDEX idx_estado_item (estado_item)
);

-- ================================================
-- TABLA: MOVIMIENTOS DE INVENTARIO
-- Historial de cambios en el stock
-- ================================================
CREATE TABLE movimientos_inventario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT NOT NULL,
    tipo_movimiento ENUM('entrada', 'salida', 'ajuste', 'merma') NOT NULL,
    cantidad INT NOT NULL,
    motivo VARCHAR(200),
    usuario_id INT NOT NULL,
    sucursal_id INT NOT NULL,
    referencia_pedido_id INT NULL,
    fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (producto_id) REFERENCES inventario(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (sucursal_id) REFERENCES sucursales(id) ON DELETE RESTRICT,
    FOREIGN KEY (referencia_pedido_id) REFERENCES pedidos(id) ON DELETE SET NULL,
    INDEX idx_producto (producto_id),
    INDEX idx_tipo_movimiento (tipo_movimiento),
    INDEX idx_usuario (usuario_id),
    INDEX idx_sucursal (sucursal_id),
    INDEX idx_fecha_movimiento (fecha_movimiento)
);

-- ================================================
-- TABLA: SESIONES DE USUARIO
-- Control de acceso y seguridad
-- ================================================
CREATE TABLE sesiones_usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMP NOT NULL,
    activa BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_usuario (usuario_id),
    INDEX idx_activa (activa),
    INDEX idx_fecha_expiracion (fecha_expiracion)
);



-- ================================================
-- VISTAS ÚTILES
-- ================================================

-- Vista de inventario con stock bajo
CREATE VIEW v_inventario_stock_bajo AS
SELECT 
    i.id,
    i.nombre,
    i.stock_actual,
    i.stock_minimo,
    s.nombre as sucursal_nombre,
    c.nombre as categoria_nombre
FROM inventario i
LEFT JOIN sucursales s ON i.sucursal_id = s.id
LEFT JOIN categorias_productos c ON i.categoria_id = c.id
WHERE i.stock_actual <= i.stock_minimo AND i.activo = TRUE;

-- Vista de pedidos del día
CREATE VIEW v_pedidos_hoy AS
SELECT 
    p.id,
    p.numero_pedido,
    CONCAT(c.nombre, ' ', COALESCE(c.apellido, '')) as cliente_nombre,
    CONCAT(u.nombre, ' ', u.apellido) as usuario_nombre,
    s.nombre as sucursal_nombre,
    p.estado,
    p.tipo_pedido,
    p.total,
    p.fecha_pedido
FROM pedidos p
LEFT JOIN clientes c ON p.cliente_id = c.id
LEFT JOIN usuarios u ON p.usuario_id = u.id
LEFT JOIN sucursales s ON p.sucursal_id = s.id
WHERE DATE(p.fecha_pedido) = CURDATE();

-- Vista de comandas pendientes
CREATE VIEW v_comandas_pendientes AS
SELECT 
    cmd.id,
    cmd.numero_comanda,
    p.numero_pedido,
    cmd.estado,
    cmd.prioridad,
    cmd.tiempo_estimado,
    CONCAT(u.nombre, ' ', u.apellido) as usuario_asignado,
    s.nombre as sucursal_nombre,
    cmd.fecha_creacion,
    TIMESTAMPDIFF(MINUTE, cmd.fecha_creacion, NOW()) as minutos_transcurridos
FROM comandas cmd
LEFT JOIN pedidos p ON cmd.pedido_id = p.id
LEFT JOIN usuarios u ON cmd.usuario_asignado_id = u.id
LEFT JOIN sucursales s ON cmd.sucursal_id = s.id
WHERE cmd.estado IN ('pendiente', 'en_preparacion');

-- ================================================
-- PROCEDIMIENTOS ALMACENADOS
-- ================================================

DELIMITER //

-- Procedimiento para crear un nuevo pedido
CREATE PROCEDURE sp_crear_pedido(
    IN p_cliente_id INT,
    IN p_usuario_id INT,
    IN p_sucursal_id INT,
    IN p_tipo_pedido VARCHAR(20),
    IN p_notas TEXT,
    OUT p_pedido_id INT,
    OUT p_numero_pedido VARCHAR(50)
)
BEGIN
    DECLARE v_numero_pedido VARCHAR(50);
    DECLARE v_correlativo INT;
    
    -- Generar número de pedido
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_pedido, -6) AS UNSIGNED)), 0) + 1 
    INTO v_correlativo
    FROM pedidos 
    WHERE DATE(fecha_pedido) = CURDATE();
    
    SET v_numero_pedido = CONCAT('PED-', DATE_FORMAT(NOW(), '%Y%m%d'), '-', LPAD(v_correlativo, 6, '0'));
    
    -- Insertar pedido
    INSERT INTO pedidos (numero_pedido, cliente_id, usuario_id, sucursal_id, tipo_pedido, notas)
    VALUES (v_numero_pedido, p_cliente_id, p_usuario_id, p_sucursal_id, p_tipo_pedido, p_notas);
    
    SET p_pedido_id = LAST_INSERT_ID();
    SET p_numero_pedido = v_numero_pedido;
END //

-- Procedimiento para agregar item a pedido
CREATE PROCEDURE sp_agregar_item_pedido(
    IN p_pedido_id INT,
    IN p_producto_id INT,
    IN p_cantidad INT,
    IN p_notas_item TEXT
)
BEGIN
    DECLARE v_precio_unitario DECIMAL(10,2);
    DECLARE v_subtotal DECIMAL(10,2);
    
    -- Obtener precio del producto
    SELECT precio INTO v_precio_unitario 
    FROM inventario 
    WHERE id = p_producto_id AND activo = TRUE;
    
    SET v_subtotal = v_precio_unitario * p_cantidad;
    
    -- Insertar detalle del pedido
    INSERT INTO detalle_pedidos (pedido_id, producto_id, cantidad, precio_unitario, subtotal, notas_item)
    VALUES (p_pedido_id, p_producto_id, p_cantidad, v_precio_unitario, v_subtotal, p_notas_item);
    
    -- Actualizar total del pedido
    UPDATE pedidos 
    SET subtotal = (SELECT SUM(subtotal) FROM detalle_pedidos WHERE pedido_id = p_pedido_id),
        total = subtotal + impuestos - descuento
    WHERE id = p_pedido_id;
END //

-- Procedimiento para actualizar stock
CREATE PROCEDURE sp_actualizar_stock(
    IN p_producto_id INT,
    IN p_cantidad INT,
    IN p_tipo_movimiento VARCHAR(20),
    IN p_motivo VARCHAR(200),
    IN p_usuario_id INT,
    IN p_sucursal_id INT,
    IN p_pedido_id INT
)
BEGIN
    -- Registrar movimiento
    INSERT INTO movimientos_inventario (producto_id, tipo_movimiento, cantidad, motivo, usuario_id, sucursal_id, referencia_pedido_id)
    VALUES (p_producto_id, p_tipo_movimiento, p_cantidad, p_motivo, p_usuario_id, p_sucursal_id, p_pedido_id);
    
    -- Actualizar stock según tipo de movimiento
    IF p_tipo_movimiento IN ('entrada', 'ajuste') THEN
        UPDATE inventario SET stock_actual = stock_actual + p_cantidad WHERE id = p_producto_id;
    ELSEIF p_tipo_movimiento IN ('salida', 'merma') THEN
        UPDATE inventario SET stock_actual = stock_actual - p_cantidad WHERE id = p_producto_id;
    END IF;
END //

DELIMITER ;

-- ================================================
-- TRIGGERS
-- ================================================

DELIMITER //

-- Trigger para actualizar stock al confirmar pedido
CREATE TRIGGER tr_actualizar_stock_pedido
AFTER UPDATE ON pedidos
FOR EACH ROW
BEGIN
    IF OLD.estado = 'pendiente' AND NEW.estado = 'en_preparacion' THEN
        -- Actualizar stock para cada item del pedido
        UPDATE inventario i
        INNER JOIN detalle_pedidos dp ON i.id = dp.producto_id
        SET i.stock_actual = i.stock_actual - dp.cantidad
        WHERE dp.pedido_id = NEW.id;
        
        -- Registrar movimientos de inventario
        INSERT INTO movimientos_inventario (producto_id, tipo_movimiento, cantidad, motivo, usuario_id, sucursal_id, referencia_pedido_id)
        SELECT dp.producto_id, 'salida', dp.cantidad, 'Venta - Pedido confirmado', NEW.usuario_id, NEW.sucursal_id, NEW.id
        FROM detalle_pedidos dp
        WHERE dp.pedido_id = NEW.id;
    END IF;
END //



DELIMITER ;

-- ================================================
-- FUNCIONES ÚTILES
-- ================================================

DELIMITER //

-- Función para calcular ventas del día
CREATE FUNCTION fn_ventas_dia(p_fecha DATE, p_sucursal_id INT) 
RETURNS DECIMAL(10,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_total DECIMAL(10,2) DEFAULT 0;
    
    SELECT COALESCE(SUM(total), 0) INTO v_total
    FROM pedidos 
    WHERE DATE(fecha_pedido) = p_fecha 
    AND sucursal_id = p_sucursal_id
    AND estado = 'entregado';
    
    RETURN v_total;
END //

-- Función para contar pedidos pendientes
CREATE FUNCTION fn_pedidos_pendientes(p_sucursal_id INT) 
RETURNS INT
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_count INT DEFAULT 0;
    
    SELECT COUNT(*) INTO v_count
    FROM pedidos 
    WHERE sucursal_id = p_sucursal_id
    AND estado IN ('pendiente', 'en_preparacion');
    
    RETURN v_count;
END //

DELIMITER ;

-- ================================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- ================================================

-- Índices compuestos para consultas frecuentes
CREATE INDEX idx_pedidos_fecha_sucursal ON pedidos(fecha_pedido, sucursal_id);
CREATE INDEX idx_pedidos_estado_sucursal ON pedidos(estado, sucursal_id);
CREATE INDEX idx_comandas_estado_sucursal ON comandas(estado, sucursal_id);
CREATE INDEX idx_inventario_sucursal_activo ON inventario(sucursal_id, activo);
CREATE INDEX idx_movimientos_fecha_tipo ON movimientos_inventario(fecha_movimiento, tipo_movimiento);



-- ================================================
-- FIN DEL SCRIPT - ESQUEMA ENTIDAD RELACIÓN
-- ================================================

SELECT '
================================================
SISTEMA DE GESTIÓN DE RESTAURANTES
Esquema de Base de Datos - Solo Estructura
================================================

TABLAS PRINCIPALES:
✓ sucursales - Gestión de sucursales  
✓ usuarios - Gestión de empleados (solo rol)
✓ inventario - Gestión de productos
✓ pedidos - Gestión de pedidos
✓ comandas - Gestión de órdenes de cocina
✓ clientes - Información de clientes

TABLAS DE SOPORTE:
✓ categorias_productos - Clasificación de productos
✓ detalle_pedidos - Items de pedidos
✓ detalle_comandas - Items de comandas  
✓ movimientos_inventario - Historial de stock
✓ sesiones_usuario - Control de acceso

RELACIONES PRINCIPALES:
• sucursales ← inventario (1:N) 
• sucursales ← pedidos (1:N)
• categorias_productos ← inventario (1:N)
• clientes ← pedidos (1:N)
• usuarios ← pedidos (1:N)
• pedidos ← detalle_pedidos (1:N)
• inventario ← detalle_pedidos (1:N)
• pedidos ← comandas (1:N)
• comandas ← detalle_comandas (1:N)
• detalle_pedidos ← detalle_comandas (1:N)

¡Esquema listo para generar diagrama ER!
================================================
' as RESULTADO;

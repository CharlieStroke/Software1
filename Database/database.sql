create table sucursales
(
    id                  int auto_increment
        primary key,
    nombre              varchar(150)                         not null,
    direccion           text                                 not null,
    telefono            varchar(20)                          null,
    email               varchar(150)                         null,
    gerente             varchar(200)                         null,
    horario_apertura    time                                 null,
    horario_cierre      time                                 null,
    capacidad           int        default 0                 null,
    fecha_apertura      date                                 null,
    activa              tinyint(1) default 1                 null,
    fecha_creacion      timestamp  default CURRENT_TIMESTAMP null,
    fecha_actualizacion timestamp  default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP
);

create table categorias_productos
(
    id             int auto_increment
        primary key,
    nombre         varchar(100)                         not null,
    descripcion    text                                 null,
    activa         tinyint(1) default 1                 null,
    sucursal_id    int                                  null,
    fecha_creacion timestamp  default CURRENT_TIMESTAMP null,
    constraint nombre
        unique (nombre),
    constraint categorias_productos_ibfk_1
        foreign key (sucursal_id) references sucursales (id)
);

create index sucursal_id
    on categorias_productos (sucursal_id);

create table clientes
(
    id             int auto_increment
        primary key,
    nombre         varchar(100)                        not null,
    apellido       varchar(100)                        null,
    telefono       varchar(20)                         null,
    email          varchar(150)                        null,
    direccion      text                                null,
    fecha_registro timestamp default CURRENT_TIMESTAMP null,
    id_sucursal    int                                 null,
    constraint clientes_ibfk_1
        foreign key (id_sucursal) references sucursales (id)
);

create index id_sucursal
    on clientes (id_sucursal);

create table inventario
(
    id                  int auto_increment
        primary key,
    nombre              varchar(150)                             not null,
    descripcion         text                                     null,
    categoria_id        int                                      null,
    precio              decimal(10, 2) default 0.00              not null,
    costo               decimal(10, 2) default 0.00              not null,
    stock_actual        int            default 0                 not null,
    stock_minimo        int            default 0                 not null,
    unidad_medida       varchar(20)    default 'unidad'          not null comment 'unidad, kg, gr, lt, ml, porcion',
    sucursal_id         int                                      null,
    activo              tinyint(1)     default 1                 null,
    fecha_creacion      timestamp      default CURRENT_TIMESTAMP null,
    fecha_actualizacion timestamp      default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint inventario_ibfk_1
        foreign key (categoria_id) references categorias_productos (id),
    constraint inventario_ibfk_2
        foreign key (sucursal_id) references sucursales (id)
);

create index categoria_id
    on inventario (categoria_id);

create index sucursal_id
    on inventario (sucursal_id);

create table usuarios
(
    id                  int auto_increment
        primary key,
    nombre              varchar(100)                          not null,
    apellido            varchar(100)                          not null,
    email               varchar(150)                          not null,
    password            varchar(255)                          not null,
    telefono            varchar(20)                           null,
    rol                 varchar(20) default 'mesero'          not null comment 'admin, gerente, mesero, cocinero, cajero, dueño',
    activo              tinyint(1)  default 1                 null,
    fecha_creacion      timestamp   default CURRENT_TIMESTAMP null,
    fecha_actualizacion timestamp   default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    id_sucursal         int                                   null,
    constraint email
        unique (email),
    constraint usuarios_ibfk_1
        foreign key (id_sucursal) references sucursales (id)
);

create table comandas
(
    id                  int auto_increment
        primary key,
    sucursal_id         int                                                                not null,
    usuario_id          int                                                                not null,
    estatus             enum ('abierta', 'cerrada', 'cancelada') default 'abierta'         null,
    total_pagado        decimal(10, 2)                           default 0.00              null,
    fecha_creacion      timestamp                                default CURRENT_TIMESTAMP null,
    fecha_actualizacion timestamp                                default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    fecha_cierre        timestamp                                                          null,
    constraint fk_comandas_sucursal
        foreign key (sucursal_id) references sucursales (id),
    constraint fk_comandas_usuario
        foreign key (usuario_id) references usuarios (id)
)
    collate = utf8mb4_unicode_ci;

create index idx_comandas_estatus
    on comandas (estatus);

create index idx_comandas_fecha
    on comandas (fecha_creacion);

create index idx_comandas_fecha_cierre
    on comandas (fecha_cierre);

create index idx_comandas_sucursal
    on comandas (sucursal_id);

create index idx_comandas_usuario
    on comandas (usuario_id);

create table pagos
(
    id                  int auto_increment
        primary key,
    comanda_id          int                                                                              not null,
    usuario_id          int                                                                              not null,
    metodo_pago         enum ('efectivo', 'tarjeta', 'transferencia', 'mixto') default 'efectivo'        not null,
    monto_total         decimal(10, 2)                                                                   not null,
    monto_efectivo      decimal(10, 2)                                         default 0.00              null,
    monto_tarjeta       decimal(10, 2)                                         default 0.00              null,
    monto_transferencia decimal(10, 2)                                         default 0.00              null,
    monto_recibido      decimal(10, 2)                                         default 0.00              null,
    cambio              decimal(10, 2)                                         default 0.00              null,
    propina             decimal(10, 2)                                         default 0.00              null,
    referencia_pago     varchar(100)                                                                     null comment 'Número de referencia de tarjeta/transferencia',
    notas               text                                                                             null,
    fecha_pago          timestamp                                              default CURRENT_TIMESTAMP null,
    constraint fk_pagos_comanda
        foreign key (comanda_id) references comandas (id),
    constraint fk_pagos_usuario
        foreign key (usuario_id) references usuarios (id)
)
    collate = utf8mb4_unicode_ci;

create index idx_pagos_comanda
    on pagos (comanda_id);

create index idx_pagos_fecha
    on pagos (fecha_pago);

create index idx_pagos_metodo
    on pagos (metodo_pago);

create table pedidos
(
    id            int auto_increment
        primary key,
    numero_pedido varchar(50)                                                       not null,
    cliente_id    int                                                               null,
    usuario_id    int                                                               not null,
    sucursal_id   int                                                               not null,
    comanda_id    int                                                               null,
    estado        varchar(20)                             default 'pendiente'       null comment 'pendiente, en_preparacion, listo, entregado, cancelado',
    estado_pago   enum ('pendiente', 'pagado', 'parcial') default 'pendiente'       null,
    tipo_pedido   varchar(20)                             default 'mesa'            not null comment 'mesa, domicilio, para_llevar',
    subtotal      decimal(10, 2)                          default 0.00              not null,
    impuestos     decimal(10, 2)                          default 0.00              not null,
    descuento     decimal(10, 2)                          default 0.00              not null,
    total         decimal(10, 2)                          default 0.00              not null,
    notas         text                                                              null,
    fecha_pedido  timestamp                               default CURRENT_TIMESTAMP null,
    fecha_entrega timestamp                                                         null,
    constraint numero_pedido
        unique (numero_pedido),
    constraint fk_pedidos_comanda
        foreign key (comanda_id) references comandas (id)
            on delete set null,
    constraint pedidos_ibfk_1
        foreign key (cliente_id) references clientes (id),
    constraint pedidos_ibfk_2
        foreign key (usuario_id) references usuarios (id),
    constraint pedidos_ibfk_3
        foreign key (sucursal_id) references sucursales (id)
);

create table detalle_pedidos
(
    id              int auto_increment
        primary key,
    pedido_id       int            not null,
    producto_id     int            not null,
    cantidad        int default 1  not null,
    precio_unitario decimal(10, 2) not null,
    subtotal        decimal(10, 2) not null,
    notas_item      text           null,
    constraint detalle_pedidos_ibfk_1
        foreign key (pedido_id) references pedidos (id),
    constraint detalle_pedidos_ibfk_2
        foreign key (producto_id) references inventario (id)
);

create index pedido_id
    on detalle_pedidos (pedido_id);

create index producto_id
    on detalle_pedidos (producto_id);

create table movimientos_inventario
(
    id                   int auto_increment
        primary key,
    producto_id          int                                 not null,
    tipo_movimiento      varchar(20)                         not null comment 'entrada, salida, ajuste, merma',
    cantidad             int                                 not null,
    motivo               varchar(200)                        null,
    usuario_id           int                                 not null,
    sucursal_id          int                                 not null,
    referencia_pedido_id int                                 null,
    fecha_movimiento     timestamp default CURRENT_TIMESTAMP null,
    constraint movimientos_inventario_ibfk_1
        foreign key (producto_id) references inventario (id),
    constraint movimientos_inventario_ibfk_2
        foreign key (usuario_id) references usuarios (id),
    constraint movimientos_inventario_ibfk_3
        foreign key (sucursal_id) references sucursales (id),
    constraint movimientos_inventario_ibfk_4
        foreign key (referencia_pedido_id) references pedidos (id)
);

create index producto_id
    on movimientos_inventario (producto_id);

create index referencia_pedido_id
    on movimientos_inventario (referencia_pedido_id);

create index sucursal_id
    on movimientos_inventario (sucursal_id);

create index usuario_id
    on movimientos_inventario (usuario_id);

create index cliente_id
    on pedidos (cliente_id);

create index idx_pedidos_comanda
    on pedidos (comanda_id);

create index idx_pedidos_estado_pago
    on pedidos (estado_pago);

create index sucursal_id
    on pedidos (sucursal_id);

create index usuario_id
    on pedidos (usuario_id);

create table sesiones_usuario
(
    id               int auto_increment
        primary key,
    usuario_id       int                                  not null,
    token            varchar(255)                         not null,
    ip_address       varchar(45)                          null,
    fecha_inicio     timestamp  default CURRENT_TIMESTAMP null,
    fecha_expiracion timestamp                            not null,
    activa           tinyint(1) default 1                 null,
    constraint token
        unique (token),
    constraint sesiones_usuario_ibfk_1
        foreign key (usuario_id) references usuarios (id)
);

create index usuario_id
    on sesiones_usuario (usuario_id);

create index id_sucursal
    on usuarios (id_sucursal);


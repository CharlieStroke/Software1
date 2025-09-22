import { useState } from 'react';
import '../componentsCss/pedidos.css';

const Pedidos = () => {
    
    const usuariosDisponibles = [
        { id: 1, nombre: 'Juan Pérez', rol: 'administrador' },
        { id: 2, nombre: 'María García', rol: 'mesero' },
        { id: 3, nombre: 'Carlos López', rol: 'mesero' },
        { id: 4, nombre: 'Ana Rodríguez', rol: 'administrador' },
        { id: 5, nombre: 'Luis Martín', rol: 'mesero' }
    ];

    const [pedido, setPedido] = useState({
        cliente: '',
        telefono: '',
        items: [''],
        usuarioAsignado: '',
        observaciones: '',
        total: 0
    });

    const productosDisponibles = [
        { nombre: 'Pizza Margherita', precio: 15.00 },
        { nombre: 'Pizza Pepperoni', precio: 17.00 },
        { nombre: 'Hamburguesa', precio: 8.50 },
        { nombre: 'Papas fritas', precio: 3.50 },
        { nombre: 'Ensalada César', precio: 7.00 },
        { nombre: 'Coca-Cola', precio: 2.50 },
        { nombre: 'Agua', precio: 2.00 },
        { nombre: 'Cerveza', precio: 4.00 }
    ];

    const agregarItem = () => {
        setPedido({
            ...pedido,
            items: [...pedido.items, '']
        });
    };

    const eliminarItem = (index) => {
        const nuevosItems = pedido.items.filter((_, i) => i !== index);
        setPedido({
            ...pedido,
            items: nuevosItems.length > 0 ? nuevosItems : ['']
        });
    };

    const actualizarItem = (index, valor) => {
        const nuevosItems = [...pedido.items];
        nuevosItems[index] = valor;
        setPedido({
            ...pedido,
            items: nuevosItems
        });
    };

    const calcularTotal = () => {
        let total = 0;
        pedido.items.forEach(item => {
            const producto = productosDisponibles.find(p => p.nombre === item);
            if (producto) {
                total += producto.precio;
            }
        });
        return total.toFixed(2);
    };

    const limpiarFormulario = () => {
        setPedido({
            cliente: '',
            telefono: '',
            items: [''],
            usuarioAsignado: '',
            observaciones: '',
            total: 0
        });
    };

    const tomarPedido = () => {
        if (pedido.cliente && pedido.telefono && pedido.usuarioAsignado && 
            pedido.items.some(item => item !== '')) {
            
            const itemsValidos = pedido.items.filter(item => item !== '');
            const total = parseFloat(calcularTotal());
            
            const pedidoCompleto = {
                cliente: pedido.cliente,
                telefono: pedido.telefono,
                items: itemsValidos,
                usuarioAsignado: usuariosDisponibles.find(u => u.id === parseInt(pedido.usuarioAsignado)),
                observaciones: pedido.observaciones,
                total: total,
                fecha: new Date().toLocaleDateString('es-ES'),
                hora: new Date().toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})
            };

            // Aquí normalmente enviarías el pedido a la cocina/base de datos
            console.log('Pedido tomado:', pedidoCompleto);
            alert(`Pedido tomado exitosamente!\nCliente: ${pedido.cliente}\nTotal: $${total}`);
            
            limpiarFormulario();
        } else {
            alert('Por favor complete todos los campos obligatorios');
        }
    };

    return (
        <div className="pedidos-container">
            <div className="pedidos-header">
                <h2>Tomar Pedido</h2>
                <div className="total-display">
                    Total: <span className="total-amount">${calcularTotal()}</span>
                </div>
            </div>

            <div className="formulario-pedido">

                <div className="seccion-atencion">
                    <div className="form-group">
                        <label htmlFor="usuario-asignado">Atendido por *</label>
                        <select 
                            id="usuario-asignado"
                            value={pedido.usuarioAsignado}
                            onChange={(e) => setPedido({...pedido, usuarioAsignado: e.target.value})}
                            className="form-input"
                            required
                        >
                            <option value="">Seleccione quien atiende</option>
                            {usuariosDisponibles.map(usuario => (
                                <option key={usuario.id} value={usuario.id}>
                                    {usuario.nombre} ({usuario.rol})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="seccion-items">
                    <h3>Items del Pedido</h3>
                    <div className="items-container">
                        {pedido.items.map((item, index) => (
                            <div key={index} className="item-row">
                                <div className="item-numero">{index + 1}.</div>
                                <select 
                                    value={item}
                                    onChange={(e) => actualizarItem(index, e.target.value)}
                                    className="form-input item-select"
                                >
                                    <option value="">Seleccione un producto</option>
                                    {productosDisponibles.map((producto, i) => (
                                        <option key={i} value={producto.nombre}>
                                            {producto.nombre} - ${producto.precio}
                                        </option>
                                    ))}
                                </select>
                                <div className="item-precio">
                                    {item && productosDisponibles.find(p => p.nombre === item) ? 
                                        `$${productosDisponibles.find(p => p.nombre === item).precio}` : 
                                        '$0.00'
                                    }
                                </div>
                                {pedido.items.length > 1 && (
                                    <button 
                                        type="button"
                                        onClick={() => eliminarItem(index)}
                                        className="btn-eliminar-item"
                                        title="Eliminar item"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    
                    <button 
                        type="button"
                        onClick={agregarItem}
                        className="btn-agregar-item"
                    >
                        + Agregar Item
                    </button>
                </div>

                <div className="seccion-observaciones">
                    <h3>Observaciones</h3>
                    <div className="form-group">
                        <textarea 
                            value={pedido.observaciones}
                            onChange={(e) => setPedido({...pedido, observaciones: e.target.value})}
                            className="form-input textarea-observaciones"
                            placeholder="Observaciones especiales del pedido (opcional)"
                            rows={3}
                        />
                    </div>
                </div>

                <div className="seccion-acciones">
                    <button 
                        onClick={limpiarFormulario}
                        className="btn-limpiar"
                    >
                        Limpiar
                    </button>
                    <button 
                        onClick={tomarPedido}
                        className="btn-tomar-pedido"
                        disabled={!pedido.cliente || !pedido.telefono || !pedido.usuarioAsignado || 
                                 !pedido.items.some(item => item !== '')}
                    >
                        Tomar Pedido
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Pedidos;
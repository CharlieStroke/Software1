import React, { useState } from 'react';
import Chart from 'react-apexcharts';
import { useAuth } from '../../../context/AuthContext';
import { useMetricas } from '../hooks/useMetricas';
import ModuleHeader from '../../../shared/ModuleHeader';
import SucursalSelector from '../../../shared/SucursalSelector';
import '../componentsCss/metricas.css';

const Metricas = () => {
  const { user } = useAuth();
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState(
    user?.rol === 'dueño' ? user.sucursal_id : ''
  );

  const {
    loading,
    error,
    metricasGenerales,
    ventasPorDia,
    metodosPago,
    productosVendidos,
    ventasPorCategoria,
    rendimientoMeseros,
    recargar
  } = useMetricas(sucursalSeleccionada || null);

  // ==========================================
  // CONFIGURACIÓN DE GRÁFICOS
  // ==========================================

  // Gráfico de ventas por día (Área)
  const ventasPorDiaConfig = {
    series: [{
      name: 'Ventas',
      data: ventasPorDia.map(v => parseFloat(v.total_ventas) || 0)
    }, {
      name: 'Propinas',
      data: ventasPorDia.map(v => parseFloat(v.total_propinas) || 0)
    }],
    options: {
      chart: {
        type: 'area',
        height: 350,
        toolbar: { show: true },
        zoom: { enabled: true }
      },
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 2 },
      colors: ['#28a745', '#ffc107'],
      xaxis: {
        categories: ventasPorDia.map(v => new Date(v.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })),
        title: { text: 'Fecha' }
      },
      yaxis: {
        title: { text: 'Monto ($)' },
        labels: {
          formatter: (val) => `$${val.toFixed(2)}`
        }
      },
      tooltip: {
        y: {
          formatter: (val) => `$${val.toFixed(2)}`
        }
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.3
        }
      }
    }
  };

  // Gráfico de métodos de pago (Donut)
  const metodosPagoConfig = {
    series: metodosPago.map(m => m.cantidad),
    options: {
      chart: {
        type: 'donut',
        height: 350
      },
      labels: metodosPago.map(m => {
        const nombres = {
          'efectivo': 'Efectivo',
          'tarjeta': 'Tarjeta',
          'transferencia': 'Transferencia',
          'mixto': 'Mixto'
        };
        return nombres[m.metodo_pago] || m.metodo_pago;
      }),
      colors: ['#28a745', '#007bff', '#ffc107', '#dc3545'],
      legend: {
        position: 'bottom'
      },
      dataLabels: {
        enabled: true,
        formatter: (val) => `${val.toFixed(1)}%`
      },
      tooltip: {
        y: {
          formatter: (val, { seriesIndex }) => {
            const monto = metodosPago[seriesIndex]?.total_monto || 0;
            return `${val} pagos - $${parseFloat(monto).toFixed(2)}`;
          }
        }
      }
    }
  };

  // Gráfico de productos más vendidos (Barras horizontales)
  const productosVendidosConfig = {
    series: [{
      name: 'Cantidad Vendida',
      data: productosVendidos.map(p => parseInt(p.cantidad_vendida) || 0)
    }],
    options: {
      chart: {
        type: 'bar',
        height: 400,
        toolbar: { show: false }
      },
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 4,
          dataLabels: { position: 'top' }
        }
      },
      colors: ['#28a745'],
      dataLabels: {
        enabled: true,
        offsetX: 30,
        style: {
          fontSize: '12px',
          colors: ['#333']
        }
      },
      xaxis: {
        categories: productosVendidos.map(p => p.producto),
        title: { text: 'Unidades Vendidas' }
      },
      yaxis: {
        title: { text: 'Productos' }
      },
      tooltip: {
        y: {
          formatter: (val, { seriesIndex, dataPointIndex }) => {
            const producto = productosVendidos[dataPointIndex];
            return `${val} unidades - $${parseFloat(producto.ingresos_totales).toFixed(2)}`;
          }
        }
      }
    }
  };

  // Gráfico de ventas por categoría (Barras)
  const ventasPorCategoriaConfig = {
    series: [{
      name: 'Ventas',
      data: ventasPorCategoria.map(c => parseFloat(c.total_ventas) || 0)
    }],
    options: {
      chart: {
        type: 'bar',
        height: 350,
        toolbar: { show: false }
      },
      plotOptions: {
        bar: {
          borderRadius: 8,
          dataLabels: { position: 'top' }
        }
      },
      colors: ['#007bff'],
      dataLabels: {
        enabled: true,
        formatter: (val) => `$${val.toFixed(0)}`,
        offsetY: -20,
        style: {
          fontSize: '12px',
          colors: ['#333']
        }
      },
      xaxis: {
        categories: ventasPorCategoria.map(c => c.categoria || 'Sin categoría'),
        title: { text: 'Categorías' }
      },
      yaxis: {
        title: { text: 'Ventas ($)' },
        labels: {
          formatter: (val) => `$${val.toFixed(0)}`
        }
      }
    }
  };

  // Gráfico de rendimiento de meseros (Barras agrupadas)
  const rendimientoMeserosConfig = {
    series: [{
      name: 'Ventas',
      data: rendimientoMeseros.map(m => parseFloat(m.ventas_totales) || 0)
    }, {
      name: 'Propinas',
      data: rendimientoMeseros.map(m => parseFloat(m.propinas_totales) || 0)
    }],
    options: {
      chart: {
        type: 'bar',
        height: 350,
        toolbar: { show: false }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          borderRadius: 4,
          columnWidth: '70%'
        }
      },
      colors: ['#28a745', '#ffc107'],
      dataLabels: { enabled: false },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
      },
      xaxis: {
        categories: rendimientoMeseros.map(m => `${m.nombre} ${m.apellido}`),
        title: { text: 'Meseros' }
      },
      yaxis: {
        title: { text: 'Monto ($)' },
        labels: {
          formatter: (val) => `$${val.toFixed(0)}`
        }
      },
      fill: { opacity: 1 },
      tooltip: {
        y: {
          formatter: (val) => `$${val.toFixed(2)}`
        }
      }
    }
  };

  // ==========================================
  // RENDERIZADO
  // ==========================================

  if (loading) {
    return (
      <div className="metricas-container">
        <div className="spinner"></div>
        <p>Cargando métricas...</p>
      </div>
    );
  }

  return (
    <div className="metricas-container">
      <ModuleHeader 
        title="Dashboard de Métricas"
        subtitle="Análisis de rendimiento y ventas (últimos 30 días)"
        buttonText="Actualizar"
        buttonOnClick={recargar}
        buttonIcon="↻"
        showButton={true}
      />

      {/* FILTRO DE SUCURSAL (solo para admin) */}
      {user?.rol === 'admin' && (
        <div className="filtro-sucursal">
          <SucursalSelector
            value={sucursalSeleccionada}
            onChange={(e) => setSucursalSeleccionada(e.target.value)}
            mostrarTodas={true}
          />
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* MÉTRICAS GENERALES - CARDS */}
      {metricasGenerales && (
        <div className="metricas-cards">
          <div className="metric-card">
            <div className="metric-content">
              <h3>${parseFloat(metricasGenerales.ventas_totales).toFixed(2)}</h3>
              <p>Ventas Totales</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-content">
              <h3>{metricasGenerales.total_comandas}</h3>
              <p>Comandas</p>
            </div>
          </div>

          <div className="metric-card yellow">
            <div className="metric-content">
              <h3>{metricasGenerales.total_pedidos}</h3>
              <p>Pedidos</p>
            </div>
          </div>

          <div className="metric-card purple">
            <div className="metric-content">
              <h3>${parseFloat(metricasGenerales.ticket_promedio).toFixed(2)}</h3>
              <p>Ticket Promedio</p>
            </div>
          </div>

          <div className="metric-card orange">
            <div className="metric-content">
              <h3>${parseFloat(metricasGenerales.propinas_totales).toFixed(2)}</h3>
              <p>Propinas</p>
            </div>
          </div>

          <div className="metric-card success">
            <div className="metric-content">
              <h3>{metricasGenerales.pedidos_pagados}</h3>
              <p>Pedidos Pagados</p>
            </div>
          </div>
        </div>
      )}

      {/* GRÁFICOS - GRID */}
      <div className="charts-grid">
        {/* Ventas por Día */}
        {ventasPorDia.length > 0 && (
          <div className="chart-card full-width">
            <h3 className="chart-title">Ventas y Propinas por Día</h3>
            <Chart
              options={ventasPorDiaConfig.options}
              series={ventasPorDiaConfig.series}
              type="area"
              height={350}
            />
          </div>
        )}

        {/* Métodos de Pago */}
        {metodosPago.length > 0 && (
          <div className="chart-card">
            <h3 className="chart-title">Métodos de Pago</h3>
            <Chart
              options={metodosPagoConfig.options}
              series={metodosPagoConfig.series}
              type="donut"
              height={350}
            />
          </div>
        )}

        {/* Ventas por Categoría */}
        {ventasPorCategoria.length > 0 && (
          <div className="chart-card">
            <h3 className="chart-title">Ventas por Categoría</h3>
            <Chart
              options={ventasPorCategoriaConfig.options}
              series={ventasPorCategoriaConfig.series}
              type="bar"
              height={350}
            />
          </div>
        )}

        {/* Productos Más Vendidos */}
        {productosVendidos.length > 0 && (
          <div className="chart-card full-width">
            <h3 className="chart-title">Top 10 Productos Más Vendidos</h3>
            <Chart
              options={productosVendidosConfig.options}
              series={productosVendidosConfig.series}
              type="bar"
              height={400}
            />
          </div>
        )}

        {/* Rendimiento de Meseros */}
        {rendimientoMeseros.length > 0 && (
          <div className="chart-card full-width">
            <h3 className="chart-title">Rendimiento de Meseros</h3>
            <Chart
              options={rendimientoMeserosConfig.options}
              series={rendimientoMeserosConfig.series}
              type="bar"
              height={350}
            />
          </div>
        )}
      </div>

      {/* TABLA DE MESEROS */}
      {rendimientoMeseros.length > 0 && (
        <div className="tabla-meseros">
          <h3>Detalle de Rendimiento</h3>
          <table>
            <thead>
              <tr>
                <th>Mesero</th>
                <th>Comandas</th>
                <th>Pedidos</th>
                <th>Ventas</th>
                <th>Propinas</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {rendimientoMeseros.map((mesero, index) => (
                <tr key={index}>
                  <td>{mesero.nombre} {mesero.apellido}</td>
                  <td>{mesero.comandas_atendidas}</td>
                  <td>{mesero.pedidos_tomados}</td>
                  <td>${parseFloat(mesero.ventas_totales).toFixed(2)}</td>
                  <td>${parseFloat(mesero.propinas_totales).toFixed(2)}</td>
                  <td className="total">
                    ${(parseFloat(mesero.ventas_totales) + parseFloat(mesero.propinas_totales)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Metricas;

import React, { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto'; // Importa Chart.js
import { getStatusColor, getStatusName } from '../../constants/statuses';

/**
 * Componente grafico per visualizzazione task
 * Supporta diversi tipi di grafico: bar, pie, line
 */

const TaskChart = ({
  type = 'pie', // 'pie', 'bar', 'line', 'doughnut'
  data = {},
  title = 'Distribuzione Task',
  height = 300,
  showLegend = true,
  showTooltips = true,
  responsive = true,
  className = ''
}) => {
  const canvasRef = useRef(null);
  const chartInstance = useRef(null);

  // Configurazioni predefinite per ogni tipo di grafico
  const chartConfigs = {
    pie: {
      type: 'pie',
      options: {
        responsive: responsive,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: showLegend,
            position: 'right',
            labels: {
              padding: 20,
              usePointStyle: true,
              font: {
                family: "'Inter', sans-serif",
                size: 12
              }
            }
          },
          title: {
            display: !!title,
            text: title,
            font: {
              family: "'Inter', sans-serif",
              size: 16,
              weight: '600'
            },
            padding: 20
          },
          tooltip: {
            enabled: showTooltips,
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    },
    
    bar: {
      type: 'bar',
      options: {
        responsive: responsive,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: showLegend,
            position: 'top',
          },
          title: {
            display: !!title,
            text: title,
            font: {
              family: "'Inter', sans-serif",
              size: 16,
              weight: '600'
            },
            padding: 20
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    },
    
    line: {
      type: 'line',
      options: {
        responsive: responsive,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: showLegend,
            position: 'top',
          },
          title: {
            display: !!title,
            text: title,
            font: {
              family: "'Inter', sans-serif",
              size: 16,
              weight: '600'
            },
            padding: 20
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    },
    
    doughnut: {
      type: 'doughnut',
      options: {
        responsive: responsive,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: showLegend,
            position: 'right',
            labels: {
              padding: 20,
              usePointStyle: true
            }
          },
          title: {
            display: !!title,
            text: title,
            font: {
              family: "'Inter', sans-serif",
              size: 16,
              weight: '600'
            },
            padding: 20
          }
        },
        cutout: '60%'
      }
    }
  };

  // Prepara i dati per il grafico
  const prepareChartData = () => {
    const config = chartConfigs[type] || chartConfigs.pie;
    
    // Se i dati sono già formattati, usali direttamente
    if (data.labels && data.datasets) {
      return {
        ...data,
        datasets: data.datasets.map(dataset => ({
          ...dataset,
          backgroundColor: dataset.backgroundColor || getDefaultColors(dataset.data.length, type),
          borderColor: dataset.borderColor || (type === 'line' ? getDefaultColors(dataset.data.length, type) : '#ffffff'),
          borderWidth: dataset.borderWidth || (type === 'bar' ? 1 : 2)
        }))
      };
    }

    // Se i dati sono un oggetto semplice (es: { 'assegnato': 5, 'in corso': 3 })
    if (typeof data === 'object' && !Array.isArray(data)) {
      const labels = Object.keys(data);
      const values = Object.values(data);
      
      // Per task status, usa colori predefiniti
      const colors = labels.map(label => getStatusColor(label) || getRandomColor(label));
      
      return {
        labels: labels.map(label => getStatusName(label) || label),
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderColor: type === 'line' ? colors.map(color => adjustColor(color, -20)) : '#ffffff',
          borderWidth: type === 'bar' ? 1 : 2,
          label: 'Task'
        }]
      };
    }

    // Default: dati vuoti
    return {
      labels: ['Nessun dato'],
      datasets: [{
        data: [1],
        backgroundColor: ['#e5e7eb'],
        borderColor: '#ffffff',
        borderWidth: 2
      }]
    };
  };

  // Inizializza il grafico
  const initChart = () => {
    if (!canvasRef.current) return;
    
    // Distruggi il grafico esistente
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    const ctx = canvasRef.current.getContext('2d');
    const config = chartConfigs[type] || chartConfigs.pie;
    const chartData = prepareChartData();
    
    chartInstance.current = new Chart(ctx, { // Usa Chart invece di window.Chart
      type: config.type,
      data: chartData,
      options: config.options
    });
  };

  // Effetto per inizializzare e aggiornare il grafico
  useEffect(() => {
    initChart();
    
    // Cleanup alla dismount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [type, data, title, showLegend]);

  // Funzioni di utilità
  const getDefaultColors = (count, chartType) => {
    if (chartType === 'line') {
      return [
        '#3b82f6', // blue
        '#10b981', // green
        '#f59e0b', // yellow
        '#ef4444', // red
        '#8b5cf6', // purple
        '#ec4899'  // pink
      ].slice(0, count);
    }
    
    return [
      '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
      '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#d946ef'
    ].slice(0, count);
  };

  const getRandomColor = (seed) => {
    const colors = [
      '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
      '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#d946ef'
    ];
    const index = Math.abs(hashString(seed)) % colors.length;
    return colors[index];
  };

  const hashString = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  };

  const adjustColor = (color, amount) => {
    let usePound = false;
    if (color[0] === "#") {
      color = color.slice(1);
      usePound = true;
    }
    
    const num = parseInt(color, 16);
    let r = (num >> 16) + amount;
    let g = ((num >> 8) & 0x00FF) + amount;
    let b = (num & 0x0000FF) + amount;
    
    r = Math.min(Math.max(0, r), 255);
    g = Math.min(Math.max(0, g), 255);
    b = Math.min(Math.max(0, b), 255);
    
    return (usePound ? "#" : "") + (b | (g << 8) | (r << 16)).toString(16).padStart(6, '0');
  };

  return (
    <div className={`task-chart ${className}`} style={{ position: 'relative', height: `${height}px` }}>
      <canvas ref={canvasRef}></canvas>
      
      {/* Fallback se Chart.js non è disponibile - ora non serve più */}
      {!Chart && (
        <div className="chart-fallback" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f9fafb',
          borderRadius: '8px',
        }}>
          <div className="text-center">
            <i className="fas fa-chart-pie fa-3x text-muted mb-3"></i>
            <p className="text-muted">Chart.js non disponibile</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Componenti specifici per diversi tipi di grafico
export const TaskPieChart = (props) => <TaskChart type="pie" {...props} />;
export const TaskBarChart = (props) => <TaskChart type="bar" {...props} />;
export const TaskLineChart = (props) => <TaskChart type="line" {...props} />;
export const TaskDoughnutChart = (props) => <TaskChart type="doughnut" {...props} />;

export default TaskChart;
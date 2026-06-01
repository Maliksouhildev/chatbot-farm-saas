// js/charts.js
// Chart.js Wrapper

Salem.charts = {
  instances: {},
  colors: {
    primary: '#6366f1',
    secondary: '#22d3ee',
    success: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b',
    border: 'rgba(255,255,255,0.1)',
    text: '#94a3b8'
  },

  init() {
    Chart.defaults.color = this.colors.text;
    Chart.defaults.borderColor = this.colors.border;
    Chart.defaults.font.family = "'Inter', sans-serif";
  },

  renderLineChart(canvasId, data) {
    if (this.instances[canvasId]) this.instances[canvasId].destroy();
    
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    this.instances[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
        datasets: [{
          label: 'Score Global',
          data: data,
          borderColor: this.colors.primary,
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: false, min: 50, max: 100 }
        }
      }
    });
  },

  renderRadarChart(canvasId) {
    if (this.instances[canvasId]) this.instances[canvasId].destroy();
    
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    this.instances[canvasId] = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['Qualité', 'Productivité', 'Sécurité', 'Formation', 'Conformité'],
        datasets: [{
          label: 'Performance Département',
          data: [95, 82, 90, 75, 98],
          backgroundColor: 'rgba(34, 211, 238, 0.2)',
          borderColor: this.colors.secondary,
          pointBackgroundColor: this.colors.secondary,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: { color: this.colors.border },
            grid: { color: this.colors.border },
            pointLabels: { color: this.colors.text },
            ticks: { display: false }
          }
        }
      }
    });
  }
};

// Initialize Chart.js defaults
setTimeout(() => Salem.charts.init(), 100);

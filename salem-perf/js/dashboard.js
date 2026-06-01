// js/dashboard.js
// Dashboard Module

Salem.dashboard = {
  render() {
    const kpis = window.SalemData.get('kpis');
    
    return `
      <div class="grid grid-cols-4">
        <!-- KPI 1 -->
        <div class="card">
          <div class="kpi-card">
            <div class="kpi-icon primary"><i class="fas fa-chart-line"></i></div>
            <div class="kpi-info">
              <div class="kpi-title">Score Global</div>
              <div class="kpi-value" id="kpi-score">${kpis.global.score}%</div>
              <div class="kpi-trend text-success"><i class="fas fa-arrow-up"></i> ${kpis.global.trend} vs mois prec.</div>
            </div>
          </div>
        </div>
        <!-- KPI 2 -->
        <div class="card">
          <div class="kpi-card">
            <div class="kpi-icon success"><i class="fas fa-check-circle"></i></div>
            <div class="kpi-info">
              <div class="kpi-title">Conformité</div>
              <div class="kpi-value">${kpis.global.compliance}%</div>
              <div class="kpi-trend text-success"><i class="fas fa-arrow-up"></i> Objectif: 95%</div>
            </div>
          </div>
        </div>
        <!-- KPI 3 -->
        <div class="card">
          <div class="kpi-card">
            <div class="kpi-icon warning"><i class="fas fa-bolt"></i></div>
            <div class="kpi-info">
              <div class="kpi-title">Productivité</div>
              <div class="kpi-value">${kpis.global.productivity}%</div>
              <div class="kpi-trend text-danger"><i class="fas fa-arrow-down"></i> -2% vs mois prec.</div>
            </div>
          </div>
        </div>
        <!-- KPI 4 -->
        <div class="card">
          <div class="kpi-card">
            <div class="kpi-icon danger"><i class="fas fa-exclamation-triangle"></i></div>
            <div class="kpi-info">
              <div class="kpi-title">Alertes Qualité</div>
              <div class="kpi-value">3</div>
              <div class="kpi-trend text-danger">À traiter urgemment</div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2" style="margin-top: 1.5rem;">
        <div class="card">
          <h3>Évolution des Performances (6 mois)</h3>
          <div class="chart-container">
            <canvas id="main-trend-chart"></canvas>
          </div>
        </div>
        <div class="card">
          <h3>Répartition par Compétence</h3>
          <div class="chart-container">
            <canvas id="radar-chart"></canvas>
          </div>
        </div>
      </div>
    `;
  },

  init() {
    const kpis = window.SalemData.get('kpis');
    setTimeout(() => {
      Salem.charts.renderLineChart('main-trend-chart', kpis.history);
      Salem.charts.renderRadarChart('radar-chart');
      
      // Simulate real-time updates
      this.startRealtimeSimulation();
    }, 100);
  },
  
  startRealtimeSimulation() {
    this.simInterval = setInterval(() => {
      const scoreEl = document.getElementById('kpi-score');
      if (!scoreEl) {
        clearInterval(this.simInterval);
        return;
      }
      // Fluctuates between 84.0 and 86.0
      const current = parseFloat(scoreEl.textContent);
      const shift = (Math.random() - 0.5) * 0.4;
      scoreEl.textContent = (current + shift).toFixed(1) + '%';
    }, 3000);
  }
};

// js/reports.js
// Reporting and Export Module

Salem.reports = {
  render() {
    return `
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1.5rem;">
          <h3><i class="fas fa-file-export"></i> Rapports et Exportations</h3>
        </div>
        
        <div class="grid grid-cols-2">
          <div class="card" style="background: rgba(0,0,0,0.2);">
            <h4>Export des KPIs (Global)</h4>
            <p class="text-muted" style="margin-bottom: 1rem; font-size: 0.9rem;">
              Téléchargez les indicateurs de performance globaux au format CSV pour intégration dans vos propres systèmes.
            </p>
            <button class="btn btn-primary" onclick="Salem.reports.exportCSV('kpis')"><i class="fas fa-file-csv"></i> Exporter CSV</button>
          </div>
          
          <div class="card" style="background: rgba(0,0,0,0.2);">
            <h4>Export des Employés & Objectifs</h4>
            <p class="text-muted" style="margin-bottom: 1rem; font-size: 0.9rem;">
              Téléchargez la liste des employés et l'état d'avancement de leurs objectifs (Format JSON pour intégration API).
            </p>
            <button class="btn btn-secondary" onclick="Salem.reports.exportJSON('users_goals')"><i class="fas fa-code"></i> Exporter JSON</button>
          </div>
          
          <div class="card" style="background: rgba(0,0,0,0.2); grid-column: span 2;">
            <h4>Rapport PDF Complet</h4>
            <p class="text-muted" style="margin-bottom: 1rem; font-size: 0.9rem;">
              Générez un rapport PDF complet de la période incluant tous les graphiques et tableaux.
            </p>
            <button class="btn btn-success" onclick="window.print()"><i class="fas fa-file-pdf"></i> Imprimer / Sauvegarder PDF</button>
          </div>
        </div>
      </div>
    `;
  },

  exportCSV(type) {
    if(type === 'kpis') {
      const kpis = window.SalemData.get('kpis');
      let csv = "Indicateur,Valeur\n";
      csv += `Score Global,${kpis.global.score}\n`;
      csv += `Conformite,${kpis.global.compliance}\n`;
      csv += `Productivite,${kpis.global.productivity}\n`;
      csv += `Qualite,${kpis.global.quality}\n`;
      
      this.downloadFile('salem_kpis.csv', csv, 'text/csv');
    }
  },

  exportJSON(type) {
    if(type === 'users_goals') {
      const users = window.SalemData.get('users');
      const goals = window.SalemData.get('goals');
      const data = { users, goals };
      
      this.downloadFile('salem_data.json', JSON.stringify(data, null, 2), 'application/json');
    }
  },

  downloadFile(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    Salem.app.showToast("Exportation réussie !");
  }
};

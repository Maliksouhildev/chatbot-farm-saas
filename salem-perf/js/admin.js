// js/admin.js
// Administration Panel

Salem.admin = {
  render() {
    return `
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1.5rem;">
          <h3><i class="fas fa-cog"></i> Panneau d'Administration</h3>
        </div>
        
        <div class="grid grid-cols-2">
          
          <!-- System Settings -->
          <div class="card" style="background: rgba(0,0,0,0.2);">
            <h4><i class="fas fa-sliders-h"></i> Paramètres Système</h4>
            <div style="margin-top: 1.5rem;">
              <div class="form-group">
                <label class="form-label">Nom de l'organisation</label>
                <input type="text" class="form-control" value="Laboratoires Salem" disabled>
              </div>
              <div class="form-group">
                <label class="form-label">Cycle d'évaluation par défaut</label>
                <select class="form-control">
                  <option>Mensuel</option>
                  <option selected>Trimestriel</option>
                  <option>Annuel</option>
                </select>
              </div>
              <button class="btn btn-primary" onclick="Salem.app.showToast('Paramètres sauvegardés')">Sauvegarder</button>
            </div>
          </div>
          
          <!-- Database Management -->
          <div class="card" style="background: rgba(0,0,0,0.2);">
            <h4><i class="fas fa-database"></i> Gestion des Données (Démo)</h4>
            <p class="text-muted" style="margin-top: 1rem; font-size: 0.9rem;">
              Dans cette version de démonstration, toutes les données sont stockées dans le navigateur (localStorage).
            </p>
            <div style="margin-top: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
              <button class="btn btn-secondary" onclick="Salem.admin.dumpDB()"><i class="fas fa-code"></i> Voir la base de données brute</button>
              <button class="btn btn-danger" onclick="Salem.admin.resetDB()"><i class="fas fa-trash"></i> Réinitialiser l'application (Hard Reset)</button>
            </div>
          </div>
          
        </div>
      </div>
    `;
  },

  dumpDB() {
    const db = localStorage.getItem('salem_db');
    alert(db ? db : "Base de données vide.");
  },

  resetDB() {
    if(confirm("ATTENTION: Cela va supprimer toutes les données, utilisateurs et objectifs. Êtes-vous sûr ?")) {
      localStorage.removeItem('salem_db');
      localStorage.removeItem('salem_user');
      window.location.reload();
    }
  }
};

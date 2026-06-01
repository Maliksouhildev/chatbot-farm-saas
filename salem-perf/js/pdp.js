// js/pdp.js
// Personal Development Plan (PDP) Module

Salem.pdp = {
  render() {
    return `
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1.5rem;">
          <h3><i class="fas fa-seedling"></i> Plans de Développement Individuel (PDP)</h3>
          <button class="btn btn-primary" onclick="Salem.pdp.newPlan()"><i class="fas fa-plus"></i> Nouveau Plan</button>
        </div>
        
        <div class="grid grid-cols-2">
          <div class="card" style="background: rgba(0,0,0,0.2);">
            <h4 class="text-primary"><i class="fas fa-book-reader"></i> Formations Recommandées</h4>
            <ul style="margin-top: 1rem; line-height: 2;">
              <li><i class="fas fa-check text-success"></i> Bonnes Pratiques de Laboratoire (BPL) - Complété</li>
              <li><i class="fas fa-spinner fa-spin text-warning"></i> Nouvelles normes ISO 15189 - En cours (60%)</li>
              <li><i class="fas fa-clock text-muted"></i> Management de la Qualité - À faire</li>
            </ul>
          </div>
          
          <div class="card" style="background: rgba(0,0,0,0.2);">
            <h4 class="text-secondary"><i class="fas fa-chart-bar"></i> Analyse des Écarts de Compétences</h4>
            <p class="text-muted" style="margin-top: 1rem; font-size: 0.9rem;">
              Basé sur votre dernière évaluation 360°, des axes d'amélioration ont été identifiés concernant la gestion du temps et la communication inter-départementale.
            </p>
            <button class="btn btn-secondary" style="margin-top: 1rem;" onclick="Salem.pdp.viewAnalysis()">Voir l'analyse complète</button>
          </div>
        </div>
      </div>
    `;
  },

  newPlan() {
    const body = `
      <div class="form-group">
        <label class="form-label">Titre du Plan</label>
        <input type="text" id="new-plan-title" class="form-control" placeholder="ex: Amélioration Continue...">
      </div>
      <div class="form-group">
        <label class="form-label">Domaine de compétence</label>
        <select class="form-control">
          <option>Technique (Analyse)</option>
          <option>Management & Leadership</option>
          <option>Qualité et Sécurité</option>
          <option>Communication</option>
        </select>
      </div>
    `;
    const footer = `
      <button class="btn btn-secondary" onclick="Salem.app.hideModal()">Annuler</button>
      <button class="btn btn-primary" onclick="Salem.app.hideModal(); Salem.app.showToast('Plan créé avec succès !')">Créer</button>
    `;
    Salem.app.showModal('Nouveau Plan de Développement', body, footer);
  },

  viewAnalysis() {
    const body = `
      <h4>Analyse des Écarts - Trimestre en cours</h4>
      <p class="text-muted" style="margin-bottom: 1rem;">Basé sur l'agrégation de vos évaluations.</p>
      <div style="margin-bottom: 1rem;">
        <div style="display:flex; justify-content:space-between; margin-bottom: 0.2rem;"><span class="text-success">Expertise Technique</span><span>95%</span></div>
        <div style="width:100%; background:var(--border); height:6px;"><div style="width:95%; background:var(--success); height:100%;"></div></div>
      </div>
      <div style="margin-bottom: 1rem;">
        <div style="display:flex; justify-content:space-between; margin-bottom: 0.2rem;"><span class="text-warning">Gestion du Temps</span><span>60%</span></div>
        <div style="width:100%; background:var(--border); height:6px;"><div style="width:60%; background:var(--warning); height:100%;"></div></div>
      </div>
      <div style="margin-bottom: 1rem;">
        <div style="display:flex; justify-content:space-between; margin-bottom: 0.2rem;"><span class="text-danger">Communication Transversale</span><span>45%</span></div>
        <div style="width:100%; background:var(--border); height:6px;"><div style="width:45%; background:var(--danger); height:100%;"></div></div>
      </div>
    `;
    Salem.app.showModal('Analyse des Compétences', body);
  }
};

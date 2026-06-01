// js/calendar.js
// Calendar and Scheduling Module

Salem.calendar = {
  render() {
    return `
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1.5rem;">
          <h3><i class="fas fa-calendar-alt"></i> Calendrier des Évaluations</h3>
          <div>
            <button class="btn btn-secondary" style="margin-right: 0.5rem;" onclick="Salem.app.showToast('Export iCal généré avec succès')"><i class="fas fa-download"></i> Export iCal</button>
            <button class="btn btn-primary" onclick="Salem.calendar.newEvent()"><i class="fas fa-plus"></i> Nouvel Événement</button>
          </div>
        </div>
        
        <!-- Mock Calendar Grid -->
        <div style="border: 1px solid var(--border); border-radius: var(--radius-sm); overflow: hidden;">
          <div style="display: grid; grid-template-columns: repeat(7, 1fr); background: rgba(0,0,0,0.2); text-align: center; font-weight: bold; padding: 0.5rem; border-bottom: 1px solid var(--border);">
            <div>Lun</div><div>Mar</div><div>Mer</div><div>Jeu</div><div>Ven</div><div>Sam</div><div>Dim</div>
          </div>
          <div style="display: grid; grid-template-columns: repeat(7, 1fr); grid-auto-rows: 100px; gap: 1px; background: var(--border);">
            <div style="background: var(--bg-surface); padding: 0.5rem;">
              <span class="text-muted">1</span>
            </div>
            <div style="background: var(--bg-surface); padding: 0.5rem;">
              <span class="text-muted">2</span>
            </div>
            <div style="background: var(--bg-surface); padding: 0.5rem;">
              <span class="text-muted">3</span>
            </div>
            <div style="background: var(--bg-surface); padding: 0.5rem;">
              <span class="text-muted">4</span>
            </div>
            <div style="background: var(--bg-surface); padding: 0.5rem;">
              <span class="text-muted">5</span>
              <div style="background: var(--primary); color: white; font-size: 0.7rem; padding: 2px 4px; border-radius: 2px; margin-top: 5px; cursor: pointer;" title="Évaluation Dr. Yassine">Éval. Mensuelle</div>
            </div>
            <div style="background: var(--bg-surface); padding: 0.5rem;">
              <span class="text-muted">6</span>
            </div>
            <div style="background: var(--bg-surface); padding: 0.5rem;">
              <span class="text-muted">7</span>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  newEvent() {
    const body = `
      <div class="form-group">
        <label class="form-label">Titre de l'événement</label>
        <input type="text" class="form-control" placeholder="ex: Réunion de service...">
      </div>
      <div class="form-group">
        <label class="form-label">Date</label>
        <input type="date" class="form-control">
      </div>
      <div class="form-group">
        <label class="form-label">Heure</label>
        <input type="time" class="form-control">
      </div>
    `;
    const footer = `
      <button class="btn btn-secondary" onclick="Salem.app.hideModal()">Annuler</button>
      <button class="btn btn-primary" onclick="Salem.app.hideModal(); Salem.app.showToast('Événement planifié !')">Ajouter au calendrier</button>
    `;
    Salem.app.showModal('Planifier un événement', body, footer);
  }
};

// js/evaluations.js
// Periodic Evaluations Module

Salem.evaluations = {
  render() {
    const evals = window.SalemData.get('evaluations');
    
    return `
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1.5rem;">
          <h3><i class="fas fa-clipboard-list"></i> Évaluations Périodiques (360°)</h3>
          <button class="btn btn-primary" onclick="Salem.evaluations.startNew()"><i class="fas fa-play"></i> Lancer une campagne</button>
        </div>
        
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Employé Évalué</th>
                <th>Date</th>
                <th>Score</th>
                <th>Statut</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${evals.map(e => `
                <tr>
                  <td style="text-transform: capitalize;">${e.type}</td>
                  <td>${this.getUserName(e.user)}</td>
                  <td>${e.date}</td>
                  <td><strong>${e.score || '-'} / 10</strong></td>
                  <td>
                    <span class="status status-${e.status === 'completed' ? 'success' : 'warning'}">
                      ${e.status === 'completed' ? 'Terminée' : 'En cours'}
                    </span>
                  </td>
                  <td>
                    <button class="btn btn-secondary" onclick="Salem.evaluations.view('${e.id}')">Détails</button>
                  </td>
                </tr>
              `).join('')}
              ${evals.length === 0 ? '<tr><td colspan="6" class="text-center text-muted">Aucune évaluation.</td></tr>' : ''}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  getUserName(id) {
    const u = window.SalemData.get('users').find(u => u.id === id);
    return u ? u.name : id;
  },

  startNew() {
    const body = `
      <div class="form-group">
        <label class="form-label">Type d'évaluation</label>
        <select id="eval-type" class="form-control">
          <option value="mensuelle">Mensuelle</option>
          <option value="trimestrielle">Trimestrielle</option>
          <option value="annuelle">Annuelle</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Date limite de soumission</label>
        <input type="date" id="eval-date" class="form-control">
      </div>
    `;
    const footer = `
      <button class="btn btn-secondary" onclick="Salem.app.hideModal()">Annuler</button>
      <button class="btn btn-primary" onclick="Salem.evaluations.saveNewCampaign()">Lancer</button>
    `;
    Salem.app.showModal('Nouvelle Campagne d\\'Évaluation', body, footer);
  },

  saveNewCampaign() {
    const type = document.getElementById('eval-type').value;
    const date = document.getElementById('eval-date').value;
    if(!date) {
      Salem.app.showToast('Veuillez définir une date limite.', 'error');
      return;
    }
    Salem.app.hideModal();
    Salem.app.showToast(`Campagne ${type} lancée jusqu'au ${date} !`, "success");
  },

  view(id) {
    const evals = window.SalemData.get('evaluations');
    const e = evals.find(x => x.id === id);
    if(e) {
      const userName = this.getUserName(e.user);
      const reviewerName = this.getUserName(e.reviewer);
      const body = `
        <div class="grid grid-cols-2">
          <div><strong>Employé:</strong> ${userName}</div>
          <div><strong>Évaluateur:</strong> ${reviewerName}</div>
          <div><strong>Type:</strong> <span style="text-transform:capitalize">${e.type}</span></div>
          <div><strong>Date:</strong> ${e.date}</div>
          <div style="grid-column: span 2;">
            <hr style="border:0; border-top:1px solid var(--border); margin: 1rem 0;">
            <div style="font-size:1.2rem; margin-bottom: 0.5rem;"><strong>Score global: ${e.score || '-'} / 10</strong></div>
            <div class="text-muted">Les détails complets et commentaires de cette évaluation seront bientôt disponibles.</div>
          </div>
        </div>
      `;
      Salem.app.showModal(`Détails de l'évaluation`, body);
    }
  }
};

// js/goals.js
// Goal Management Module

Salem.goals = {
  render() {
    const goals = window.SalemData.get('goals');
    
    return `
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1.5rem;">
          <h3><i class="fas fa-bullseye"></i> Gestion des Objectifs (SMART)</h3>
          <button class="btn btn-primary" onclick="Salem.goals.newGoal()"><i class="fas fa-plus"></i> Nouvel Objectif</button>
        </div>
        
        <div class="grid grid-cols-3">
          ${goals.map(g => this.renderGoalCard(g)).join('')}
        </div>
      </div>
    `;
  },

  renderGoalCard(goal) {
    const statusClass = goal.status === 'on_track' ? 'success' : goal.status === 'at_risk' ? 'warning' : 'danger';
    const statusText = goal.status === 'on_track' ? 'En bonne voie' : goal.status === 'at_risk' ? 'À risque' : 'En retard';
    
    return `
      <div class="card" style="border-top: 4px solid var(--${statusClass}); padding: 1.2rem;">
        <div style="display:flex; justify-content:space-between; margin-bottom: 1rem;">
          <span class="status status-${statusClass}">${statusText}</span>
          <button class="btn-text" onclick="Salem.goals.edit('${goal.id}')" title="Modifier"><i class="fas fa-edit text-muted"></i></button>
        </div>
        <h4 style="margin-bottom: 0.5rem; height: 2.4em; overflow: hidden;">${goal.title}</h4>
        <div class="text-muted" style="font-size: 0.85rem; margin-bottom: 1rem;">Cible: ${goal.target}</div>
        
        <div style="margin-bottom: 0.5rem; display:flex; justify-content:space-between; font-size: 0.85rem;">
          <span>Progression</span>
          <span class="text-${statusClass}">${goal.progress}%</span>
        </div>
        <div style="width: 100%; background: var(--border); height: 8px; border-radius: 4px; overflow: hidden;">
          <div style="width: ${goal.progress}%; background: var(--${statusClass}); height: 100%; transition: width 0.5s;"></div>
        </div>
      </div>
    `;
  },

  newGoal() {
    const body = `
      <div class="form-group">
        <label class="form-label">Titre de l'objectif (SMART)</label>
        <input type="text" id="new-goal-title" class="form-control" placeholder="ex: Réduire le temps d'attente...">
      </div>
      <div class="form-group">
        <label class="form-label">Cible chiffrée</label>
        <input type="text" id="new-goal-target" class="form-control" placeholder="ex: 100%, 2h, 15 jours...">
      </div>
    `;
    const footer = `
      <button class="btn btn-secondary" onclick="Salem.app.hideModal()">Annuler</button>
      <button class="btn btn-primary" onclick="Salem.goals.saveNewGoal()">Créer l'objectif</button>
    `;
    Salem.app.showModal('Nouvel Objectif', body, footer);
  },

  saveNewGoal() {
    const title = document.getElementById('new-goal-title').value;
    const target = document.getElementById('new-goal-target').value;
    if(!title || !target) {
      Salem.app.showToast('Veuillez remplir tous les champs.', 'error');
      return;
    }
    
    window.SalemData.add('goals', {
      title, target, progress: 0, status: 'on_track', owner: Salem.app.currentUser.id
    });
    
    Salem.app.hideModal();
    Salem.app.showToast("Objectif créé avec succès !");
    Salem.app.navigate('goals');
  },

  edit(id) {
    const goals = window.SalemData.get('goals');
    const goal = goals.find(g => g.id === id);
    if(goal) {
        const body = `
          <div class="form-group">
            <label class="form-label">Progression Actuelle (%)</label>
            <input type="number" id="edit-goal-prog" class="form-control" value="${goal.progress}" min="0" max="100">
          </div>
        `;
        const footer = `
          <button class="btn btn-secondary" onclick="Salem.app.hideModal()">Annuler</button>
          <button class="btn btn-primary" onclick="Salem.goals.saveEditGoal('${id}')">Enregistrer</button>
        `;
        Salem.app.showModal(`Mettre à jour: ${goal.title}`, body, footer);
    }
  },

  saveEditGoal(id) {
    const progStr = document.getElementById('edit-goal-prog').value;
    const newProg = parseInt(progStr, 10);
    if(!isNaN(newProg) && newProg >= 0 && newProg <= 100) {
        let status = 'on_track';
        if(newProg < 30) status = 'danger';
        else if (newProg < 70) status = 'warning';
        
        window.SalemData.update('goals', id, { progress: newProg, status });
        Salem.app.hideModal();
        Salem.app.showToast("Objectif mis à jour !");
        Salem.app.navigate('goals');
    } else {
        Salem.app.showToast('Valeur invalide.', 'error');
    }
  }
};

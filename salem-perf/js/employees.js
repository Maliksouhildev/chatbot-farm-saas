// js/employees.js
// Employee Management Module

Salem.employees = {
  render() {
    const users = window.SalemData.get('users');
    const pending = users.filter(u => u.status === 'PENDING');
    const active = users.filter(u => u.status === 'ACTIVE');

    let pendingHtml = '';
    if (pending.length > 0 && Salem.app.currentUser.role === 'ADMIN') {
      pendingHtml = `
        <div class="card" style="border-color: var(--warning);">
          <h3 class="text-warning"><i class="fas fa-clock"></i> En attente de validation (${pending.length})</h3>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nom</th><th>Email</th><th>Département</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${pending.map(u => `
                  <tr>
                    <td>${u.name}</td><td>${u.email}</td><td>${u.department}</td>
                    <td>
                      <button class="btn btn-success" onclick="Salem.employees.approve('${u.id}')">Approuver</button>
                      <button class="btn btn-danger" onclick="Salem.employees.reject('${u.id}')">Rejeter</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    return `
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1rem;">
          <h3><i class="fas fa-users"></i> Annuaire des Employés</h3>
          <button class="btn btn-primary" onclick="Salem.employees.invite()"><i class="fas fa-user-plus"></i> Inviter un employé</button>
        </div>
        ${pendingHtml}
        <div class="table-container mt-4">
          <table>
            <thead>
              <tr>
                <th>Nom Complet</th>
                <th>Rôle</th>
                <th>Département</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${active.map(u => `
                <tr>
                  <td>
                    <div style="display:flex; align-items:center; gap:0.5rem;">
                      <div class="user-avatar" style="width:30px;height:30px;font-size:0.8rem;">
                        ${u.name.substring(0,2).toUpperCase()}
                      </div>
                      ${u.name}
                    </div>
                  </td>
                  <td>${u.role}</td>
                  <td>${u.department}</td>
                  <td><span class="status status-success">Actif</span></td>
                  <td>
                    <button class="btn btn-secondary" onclick="Salem.employees.viewProfile('${u.id}')" title="Voir Profil"><i class="fas fa-eye"></i></button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  approve(id) {
    window.SalemData.update('users', id, { status: 'ACTIVE' });
    Salem.app.showToast("Employé approuvé avec succès !");
    Salem.app.navigate('employees');
  },

  reject(id) {
    if(confirm("Êtes-vous sûr de vouloir rejeter cette demande ?")) {
      window.SalemData.remove('users', id);
      Salem.app.showToast("Demande rejetée.", "error");
      Salem.app.navigate('employees');
    }
  },

  invite() {
    const link = `https://salem-labs.app/invite?token=${Math.random().toString(36).substring(7)}`;
    const body = `
      <p class="text-muted" style="margin-bottom: 1rem;">Copiez ce lien et envoyez-le à l'employé pour qu'il s'inscrive :</p>
      <input type="text" class="form-control" value="${link}" readonly onclick="this.select()" style="font-family: monospace;">
    `;
    const footer = `<button class="btn btn-primary" onclick="Salem.app.hideModal(); Salem.app.showToast('Lien copié')">Fermer</button>`;
    Salem.app.showModal('Inviter un employé', body, footer);
  },

  viewProfile(id) {
    const user = window.SalemData.get('users').find(u => u.id === id);
    if(user) {
        const body = `
          <div style="text-align:center; margin-bottom: 1.5rem;">
            <div class="user-avatar" style="width: 80px; height: 80px; font-size: 2rem; margin: 0 auto 1rem;">
              ${user.name.substring(0,2).toUpperCase()}
            </div>
            <h3>${user.name}</h3>
            <div class="text-muted">${user.role}</div>
          </div>
          <div class="grid grid-cols-2" style="gap: 1rem;">
            <div class="card" style="background: rgba(0,0,0,0.2); padding: 1rem;">
              <div class="text-muted" style="font-size:0.8rem">Email</div>
              <div>${user.email}</div>
            </div>
            <div class="card" style="background: rgba(0,0,0,0.2); padding: 1rem;">
              <div class="text-muted" style="font-size:0.8rem">Département</div>
              <div>${user.department}</div>
            </div>
          </div>
        `;
        Salem.app.showModal(`Profil Employé`, body);
    }
  }
};

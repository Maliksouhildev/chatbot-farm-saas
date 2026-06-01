// js/messaging.js
// Internal Messaging Module

Salem.messaging = {
  render() {
    return `
      <div class="card" style="height: calc(100vh - 150px); display: flex; flex-direction: column; padding: 0;">
        <!-- Header -->
        <div style="padding: 1.5rem; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between;">
          <h3><i class="fas fa-comments"></i> Messagerie Interne</h3>
          <button class="btn btn-primary" onclick="Salem.messaging.newMessage()"><i class="fas fa-edit"></i> Nouveau Message</button>
        </div>
        
        <!-- Main Area -->
        <div class="msg-layout">
          
          <!-- Channels/Contacts -->
          <div class="msg-sidebar">
            <div style="padding: 1rem; font-weight: bold; color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase;">Canaux</div>
            <div style="padding: 0.8rem 1rem; cursor: pointer; border-left: 3px solid var(--primary); background: rgba(99, 102, 241, 0.1);"># general</div>
            <div style="padding: 0.8rem 1rem; cursor: pointer; border-left: 3px solid transparent; color: var(--text-muted);"># labo-analyse</div>
            
            <div style="padding: 1rem; font-weight: bold; color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase; margin-top: 1rem;">Messages Directs</div>
            <div style="padding: 0.8rem 1rem; cursor: pointer; border-left: 3px solid transparent; color: var(--text-muted);">
              <span class="status-indicator" style="display:inline-block; width:8px; height:8px; background:var(--success); border-radius:50%; margin-right:5px;"></span>
              Dr. Yassine
            </div>
            <div style="padding: 0.8rem 1rem; cursor: pointer; border-left: 3px solid transparent; color: var(--text-muted);">
              <span class="status-indicator" style="display:inline-block; width:8px; height:8px; background:var(--danger); border-radius:50%; margin-right:5px;"></span>
              Amina B.
            </div>
          </div>
          
          <!-- Chat Area -->
          <div class="msg-chat">
            
            <div style="padding: 1rem; border-bottom: 1px solid var(--border); font-weight: bold;">
              # general
            </div>
            
            <div style="flex: 1; padding: 1.5rem; overflow-y: auto; display: flex; flex-direction: column; gap: 1.5rem;">
              <div style="display: flex; gap: 1rem;">
                <div class="user-avatar" style="width: 40px; height: 40px; font-size: 1rem;">AB</div>
                <div>
                  <div style="font-size: 0.9rem;"><strong>Amina B.</strong> <span class="text-muted" style="font-size: 0.75rem;">10:32</span></div>
                  <div style="background: var(--bg-surface); padding: 0.8rem; border-radius: 0 var(--radius-sm) var(--radius-sm) var(--radius-sm); margin-top: 0.3rem;">
                    Bonjour l'équipe, les réactifs pour le lot A sont arrivés.
                  </div>
                </div>
              </div>
              
              <div style="display: flex; gap: 1rem;">
                <div class="user-avatar" style="width: 40px; height: 40px; font-size: 1rem; background: var(--secondary);">DY</div>
                <div>
                  <div style="font-size: 0.9rem;"><strong>Dr. Yassine</strong> <span class="text-muted" style="font-size: 0.75rem;">10:35</span></div>
                  <div style="background: var(--bg-surface); padding: 0.8rem; border-radius: 0 var(--radius-sm) var(--radius-sm) var(--radius-sm); margin-top: 0.3rem;">
                    Parfait, on commence le calibrage dans 10 minutes.
                  </div>
                </div>
              </div>
            </div>
            
            <div style="padding: 1rem; border-top: 1px solid var(--border);">
              <div style="display: flex; gap: 0.5rem;">
                <input type="text" class="form-control" placeholder="Envoyer un message dans #general..." style="margin-bottom: 0;">
                <button class="btn btn-primary"><i class="fas fa-paper-plane"></i></button>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    `;
  },

  newMessage() {
    const body = `
      <div class="form-group">
        <label class="form-label">Destinataire</label>
        <select class="form-control">
          <option># general</option>
          <option># labo-analyse</option>
          <option>Dr. Yassine</option>
          <option>Amina B.</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Message</label>
        <textarea class="form-control" rows="4" placeholder="Écrivez votre message ici..."></textarea>
      </div>
    `;
    const footer = `
      <button class="btn btn-secondary" onclick="Salem.app.hideModal()">Annuler</button>
      <button class="btn btn-primary" onclick="Salem.app.hideModal(); Salem.app.showToast('Message envoyé')"><i class="fas fa-paper-plane"></i> Envoyer</button>
    `;
    Salem.app.showModal('Nouveau Message', body, footer);
  }
};

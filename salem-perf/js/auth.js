// js/auth.js
// Authentication Module

Salem.auth = {
  showLogin() {
    const container = document.getElementById('auth-container');
    container.innerHTML = `
      <div class="auth-header">
        <div class="auth-logo"><i class="fas fa-flask"></i></div>
        <h2 class="auth-title">Salem Labs</h2>
        <p class="auth-subtitle">Système de Gestion de la Performance</p>
      </div>
      <form id="login-form">
        <div class="form-group">
          <label class="form-label">Email Professionnel</label>
          <input type="email" class="form-control" id="login-email" required placeholder="admin@salem.dz">
        </div>
        <div class="form-group">
          <label class="form-label">Mot de passe</label>
          <input type="password" class="form-control" id="login-pwd" required placeholder="1234">
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem; justify-content: center; padding: 0.8rem;">
          Se Connecter
        </button>
      </form>
      <a href="#" class="auth-link" id="show-register">Vous n'avez pas de compte ? S'inscrire</a>
    `;

    document.getElementById('login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleLogin(
        document.getElementById('login-email').value,
        document.getElementById('login-pwd').value
      );
    });

    document.getElementById('show-register').addEventListener('click', (e) => {
      e.preventDefault();
      this.showRegister();
    });
  },

  showRegister() {
    const container = document.getElementById('auth-container');
    container.innerHTML = `
      <div class="auth-header">
        <div class="auth-logo"><i class="fas fa-user-plus"></i></div>
        <h2 class="auth-title">Inscription</h2>
        <p class="auth-subtitle">Demande d'accès au système</p>
      </div>
      <form id="register-form">
        <div class="form-group">
          <label class="form-label">Nom Complet</label>
          <input type="text" class="form-control" id="reg-name" required>
        </div>
        <div class="form-group">
          <label class="form-label">Email Professionnel</label>
          <input type="email" class="form-control" id="reg-email" required>
        </div>
        <div class="form-group">
          <label class="form-label">Département</label>
          <select class="form-control" id="reg-dept">
            <option value="Analyse">Analyse Médicale</option>
            <option value="Recherche">Recherche</option>
            <option value="Qualite">Contrôle Qualité</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Rôle Souhaité</label>
          <select class="form-control" id="reg-role">
            <option value="EMPLOYEE">Employé</option>
            <option value="MANAGER">Manager</option>
            <option value="ADMIN">Administrateur</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Mot de passe</label>
          <input type="password" class="form-control" id="reg-pwd" required>
        </div>
        <button type="submit" class="btn btn-success" style="width: 100%; margin-top: 1rem; justify-content: center; padding: 0.8rem;">
          Demander l'accès
        </button>
      </form>
      <a href="#" class="auth-link" id="show-login">Retour à la connexion</a>
    `;

    document.getElementById('register-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleRegister();
    });

    document.getElementById('show-login').addEventListener('click', (e) => {
      e.preventDefault();
      this.showLogin();
    });
  },

  handleLogin(email, pwd) {
    const users = window.SalemData.get('users');
    const user = users.find(u => u.email === email && u.password === pwd);
    
    if (user) {
      if (user.status === 'PENDING') {
        alert("Votre compte est en attente de validation par l'administrateur.");
      } else {
        localStorage.setItem('salem_user', JSON.stringify(user));
        Salem.app.startApp(user);
      }
    } else {
      alert("Identifiants incorrects. (Rappel: email admin@salem.dz, mdp 1234)");
    }
  },

  handleRegister() {
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const pwd = document.getElementById('reg-pwd').value;
    const dept = document.getElementById('reg-dept').value;
    const role = document.getElementById('reg-role').value;

    window.SalemData.add('users', {
      name, email, password: pwd, department: dept, role: role, status: 'PENDING'
    });

    alert("Demande envoyée ! En attente de validation par l'administrateur.");
    this.showLogin();
  }
};

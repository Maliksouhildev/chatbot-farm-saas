// js/app.js
// Main App Shell and Router

const Salem = {
  app: {
    init() {
      // Init Database
      if (window.SalemData) window.SalemData.init();
      
      // Setup UI Elements
      this.cacheDOM();
      this.bindEvents();
      
      // Check Auth
      const currentUser = localStorage.getItem('salem_user');
      if (currentUser) {
        this.startApp(JSON.parse(currentUser));
      } else {
        if (Salem.auth) Salem.auth.showLogin();
      }
    },

    cacheDOM() {
      this.appEl = document.getElementById('app');
      this.authOverlay = document.getElementById('auth-overlay');
      this.sidebar = document.getElementById('sidebar');
      this.sidebarNav = document.getElementById('sidebar-nav');
      this.pageContent = document.getElementById('page-content');
      this.pageTitle = document.getElementById('page-title-text');
      this.userName = document.getElementById('sidebar-user');
      this.topbarAvatar = document.getElementById('topbar-avatar');
    },

    bindEvents() {
      // Sidebar Toggle
      document.getElementById('sidebar-collapse-btn')?.addEventListener('click', () => {
        this.sidebar.classList.toggle('collapsed');
      });

      // Mobile Menu Toggle
      document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
        this.sidebar.classList.toggle('mobile-open');
      });

      // User Menu
      document.getElementById('topbar-avatar-wrapper')?.addEventListener('click', (e) => {
        e.stopPropagation();
        document.getElementById('avatar-menu').classList.toggle('hidden');
      });

      document.addEventListener('click', () => {
        document.getElementById('avatar-menu')?.classList.add('hidden');
      });

      // Logout
      document.getElementById('logout-btn')?.addEventListener('click', () => this.logout());
      document.getElementById('avatar-logout')?.addEventListener('click', () => this.logout());

      // Navigation Delegation
      document.body.addEventListener('click', (e) => {
        const link = e.target.closest('[data-route]');
        if (link) {
          e.preventDefault();
          this.navigate(link.dataset.route);
          if(window.innerWidth <= 768) this.sidebar.classList.remove('mobile-open');
        }
      });

      // Modal close bindings
      document.getElementById('modal-close-btn')?.addEventListener('click', () => this.hideModal());
      document.getElementById('modal-backdrop')?.addEventListener('click', (e) => {
        if(e.target.id === 'modal-backdrop') this.hideModal();
      });

      // Topbar bindings
      document.getElementById('notif-btn')?.addEventListener('click', () => {
        const panel = document.getElementById('notif-panel');
        if(panel) {
          panel.classList.toggle('hidden');
          if(!panel.classList.contains('hidden')) {
            document.getElementById('notif-list').innerHTML = `<div style="padding: 1rem; color: var(--text-muted); text-align: center;">Aucune nouvelle notification</div>`;
          }
        }
      });

      document.getElementById('msg-topbar-btn')?.addEventListener('click', () => {
        this.navigate('messaging');
      });

      document.getElementById('global-search')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.showToast(`Recherche pour "${e.target.value}" introuvable dans la démo.`, 'error');
          e.target.value = '';
        }
      });
    },

    startApp(user) {
      this.currentUser = user;
      this.authOverlay.classList.add('hidden');
      this.appEl.classList.remove('hidden');
      
      // Set User Info
      const initials = user.name.split(' ').map(n=>n[0]).join('').toUpperCase().substring(0,2);
      this.topbarAvatar.textContent = initials;
      if (this.userName) {
        this.userName.innerHTML = `
          <div class="user-avatar">${initials}</div>
          <div class="user-info">
            <div class="user-name">${user.name}</div>
            <div class="user-role">${user.role}</div>
          </div>
        `;
      }
      
      document.getElementById('avatar-menu-header').innerHTML = `
        <strong>${user.name}</strong><br>
        <small class="text-muted">${user.email}</small>
      `;

      // Render Nav based on role
      this.renderNav(user.role);
      
      // Default Route
      this.navigate('dashboard');
    },

    logout() {
      localStorage.removeItem('salem_user');
      window.location.reload();
    },

    renderNav(role) {
      const routes = [
        { id: 'dashboard', icon: 'fa-chart-pie', text: 'Tableau de bord', roles: ['ADMIN','MANAGER','EMPLOYEE'] },
        { id: 'goals', icon: 'fa-bullseye', text: 'Objectifs', roles: ['ADMIN','MANAGER','EMPLOYEE'] },
        { id: 'evaluations', icon: 'fa-clipboard-list', text: 'Évaluations', roles: ['ADMIN','MANAGER','EMPLOYEE'] },
        { id: 'pdp', icon: 'fa-seedling', text: 'Plan Dév.', roles: ['ADMIN','MANAGER','EMPLOYEE'] },
        { id: 'employees', icon: 'fa-users', text: 'Employés', roles: ['ADMIN','MANAGER'] },
        { id: 'reports', icon: 'fa-file-export', text: 'Rapports', roles: ['ADMIN','MANAGER'] },
        { id: 'admin', icon: 'fa-cog', text: 'Administration', roles: ['ADMIN'] }
      ];

      const html = routes
        .filter(r => r.roles.includes(role))
        .map(r => `
          <a href="#" class="nav-item" data-route="${r.id}" id="nav-${r.id}">
            <div class="nav-icon"><i class="fas ${r.icon}"></i></div>
            <div class="nav-text">${r.text}</div>
          </a>
        `).join('');
      
      this.sidebarNav.innerHTML = html;
    },

    navigate(route) {
      // Update active nav
      document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
      const activeNav = document.getElementById(`nav-${route}`);
      if (activeNav) activeNav.classList.add('active');

      // Update title
      const titles = {
        dashboard: 'Tableau de bord', goals: 'Objectifs', 
        evaluations: 'Évaluations', pdp: 'Plan de développement',
        employees: 'Employés', reports: 'Rapports', admin: 'Administration'
      };
      this.pageTitle.textContent = titles[route] || 'Salem Labs';

      // Load module (mocked simple view for now)
      this.pageContent.innerHTML = `<div class="loading-spinner" style="margin: 2rem auto;"></div>`;
      
      setTimeout(() => {
        if(Salem[route] && typeof Salem[route].render === 'function') {
           this.pageContent.innerHTML = Salem[route].render();
           if(Salem[route].init) Salem[route].init();
        } else {
           this.pageContent.innerHTML = `<div class="card"><h3>Module ${titles[route]}</h3><p>En construction...</p></div>`;
        }
      }, 300);
    },

    // UI Utils
    showToast(msg, type='success') {
      const container = document.getElementById('toast-container');
      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      toast.innerHTML = `<i class="fas ${type==='success'?'fa-check-circle':'fa-exclamation-circle'}"></i> <span>${msg}</span>`;
      container.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    },

    showModal(title, bodyHtml, footerHtml = '') {
      document.getElementById('modal-title').innerHTML = title;
      document.getElementById('modal-body').innerHTML = bodyHtml;
      
      const footer = document.getElementById('modal-footer');
      if(footerHtml) {
        footer.innerHTML = footerHtml;
        footer.classList.remove('hidden');
      } else {
        footer.innerHTML = '';
        footer.classList.add('hidden');
      }
      
      document.getElementById('modal-backdrop').classList.remove('hidden');
    },

    hideModal() {
      document.getElementById('modal-backdrop').classList.add('hidden');
      document.getElementById('modal-title').innerHTML = '';
      document.getElementById('modal-body').innerHTML = '';
      document.getElementById('modal-footer').innerHTML = '';
    }
  }
};

window.Salem = Salem;

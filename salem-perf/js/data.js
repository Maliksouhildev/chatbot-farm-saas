// js/data.js
// Mock Data and LocalStorage Engine for Salem Labs SPA

const SalemData = {
  // Initial Seed Data
  seed: {
    users: [
      { id: 'u1', name: 'Admin', email: 'admin@salem.dz', password: '1234', role: 'ADMIN', department: 'Direction', status: 'ACTIVE' },
      { id: 'u2', name: 'Dr. Yassine', email: 'yassine@salem.dz', password: '1234', role: 'MANAGER', department: 'Analyse', status: 'ACTIVE' },
      { id: 'u3', name: 'Amina B.', email: 'amina@salem.dz', password: '1234', role: 'EMPLOYEE', department: 'Analyse', status: 'ACTIVE' }
    ],
    kpis: {
      global: { score: 85, trend: '+2.5%', compliance: 98, productivity: 82, quality: 95 },
      history: [65, 70, 75, 72, 80, 85]
    },
    goals: [
      { id: 'g1', title: 'Réduire le temps de traitement', target: '2h', progress: 70, status: 'on_track', owner: 'u2' },
      { id: 'g2', title: 'Certification ISO 9001', target: '100%', progress: 45, status: 'at_risk', owner: 'u1' }
    ],
    messages: [
      { id: 'm1', from: 'u1', to: 'u2', text: 'N\'oublie pas l\'évaluation mensuelle.', time: new Date().toISOString() }
    ],
    evaluations: [
      { id: 'e1', user: 'u3', reviewer: 'u2', type: 'mensuelle', date: '2026-04-10', score: 8.5, status: 'completed' }
    ]
  },

  // Initialize DB
  init() {
    if (!localStorage.getItem('salem_db')) {
      localStorage.setItem('salem_db', JSON.stringify(this.seed));
    }
  },

  // Get entire DB
  getDB() {
    return JSON.parse(localStorage.getItem('salem_db')) || this.seed;
  },

  // Save entire DB
  saveDB(data) {
    localStorage.setItem('salem_db', JSON.stringify(data));
  },

  // CRUD Operations
  get(collection) {
    const db = this.getDB();
    return db[collection] || [];
  },

  add(collection, item) {
    const db = this.getDB();
    if (!db[collection]) db[collection] = [];
    item.id = Math.random().toString(36).substr(2, 9);
    db[collection].push(item);
    this.saveDB(db);
    return item;
  },

  update(collection, id, updates) {
    const db = this.getDB();
    const index = db[collection].findIndex(i => i.id === id);
    if (index > -1) {
      db[collection][index] = { ...db[collection][index], ...updates };
      this.saveDB(db);
      return db[collection][index];
    }
    return null;
  },

  remove(collection, id) {
    const db = this.getDB();
    db[collection] = db[collection].filter(i => i.id !== id);
    this.saveDB(db);
  }
};

window.SalemData = SalemData;

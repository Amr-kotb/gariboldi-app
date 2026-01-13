// js/dashboard.js - DASHBOARD v3.0 (STABLE)
console.log('🚀 Dashboard v3.0 loaded');

class Dashboard {
  constructor() {
    this.currentUser = null;
    this.isLoading = false;
    this.data = {
      tasks: [],
      stats: null,
      recentActivity: []
    };
  }

  // ==================== PUBLIC METHODS ====================

  async init() {
    if (this.isLoading) {
      console.warn('⚠️ Dashboard already loading');
      return;
    }
    
    this.isLoading = true;
    console.log('🎯 Initializing dashboard...');
    
    try {
      // Mostra loader
      utils.Loader.show('Caricamento dashboard...');
      utils.Loader.update('Verifica autenticazione...', 10);
      
      // 1. Verifica autenticazione
      await this.checkAuth();
      
      utils.Loader.update('Caricamento dati utente...', 30);
      
      // 2. Ottieni dati utente
      await this.loadUserData();
      
      utils.Loader.update('Aggiornamento interfaccia...', 50);
      
      // 3. Aggiorna UI
      this.renderDashboard();
      
      utils.Loader.update('Caricamento dati...', 70);
      
      // 4. Carica dati in background
      await this.loadData();
      
      utils.Loader.update('Completamento...', 90);
      
      // 5. Finalizza
      this.setupEventListeners();
      
      console.log('✅ Dashboard initialized successfully');
      utils.Notify.show('Dashboard pronta!', 'success', 2000);
      
    } catch (error) {
      console.error('❌ Dashboard init error:', error);
      this.showError('Errore inizializzazione dashboard: ' + error.message);
    } finally {
      this.isLoading = false;
      utils.Loader.hide();
    }
  }

  async refresh() {
    console.log('🔄 Refreshing dashboard...');
    await this.loadData(true);
  }

  // ==================== PRIVATE METHODS ====================

  async checkAuth() {
    console.log('🔐 Checking authentication...');
    
    // Usa il sistema auth centralizzato
    const user = await auth.checkAuth(true);
    
    if (!user) {
      throw new Error('Authentication failed');
    }
    
    this.currentUser = user;
    console.log('✅ User authenticated:', user.email);
  }

  async loadUserData() {
    console.log('👤 Loading user data...');
    
    if (!this.currentUser) {
      throw new Error('No current user');
    }
    
    // Aggiorna UI con dati utente
    this.updateUserInfo();
  }

  async loadData(forceRefresh = false) {
    console.log('📊 Loading dashboard data...');
    
    try {
      // Carica in parallelo
      await Promise.all([
        this.loadStats(),
        this.loadTasks(),
        this.loadRecentActivity()
      ]);
      
      // Aggiorna UI con nuovi dati
      this.updateDataDisplays();
      
    } catch (error) {
      console.error('❌ Error loading data:', error);
      utils.ErrorHandler.handle(error, 'loadData');
    }
  }

  async loadStats() {
    try {
      console.log('📈 Loading statistics...');
      
      const tasksSnapshot = await firebase.firestore()
        .collection('tasks')
        .where('assignedTo', '==', this.currentUser.uid)
        .get();
      
      const total = tasksSnapshot.size;
      const completed = tasksSnapshot.docs.filter(doc => 
        doc.data().status === 'completed'
      ).length;
      
      const pending = tasksSnapshot.docs.filter(doc => 
        doc.data().status === 'pending' || doc.data().status === 'in-progress'
      ).length;
      
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      this.data.stats = {
        total,
        completed,
        pending,
        completionRate,
        overdue: tasksSnapshot.docs.filter(doc => {
          const dueDate = doc.data().dueDate;
          return dueDate && utils.DateUtil.isPast(dueDate) && doc.data().status !== 'completed';
        }).length
      };
      
      console.log('✅ Stats loaded:', this.data.stats);
      
    } catch (error) {
      console.error('❌ Error loading stats:', error);
      this.data.stats = null;
    }
  }

  async loadTasks() {
    try {
      console.log('📋 Loading tasks...');
      
      const tasksSnapshot = await firebase.firestore()
        .collection('tasks')
        .where('assignedTo', '==', this.currentUser.uid)
        .orderBy('dueDate', 'asc')
        .limit(10)
        .get();
      
      this.data.tasks = utils.FirebaseHelper.parseCollection(tasksSnapshot);
      
      console.log(`✅ ${this.data.tasks.length} tasks loaded`);
      
    } catch (error) {
      console.error('❌ Error loading tasks:', error);
      this.data.tasks = [];
    }
  }

  async loadRecentActivity() {
    try {
      console.log('📝 Loading recent activity...');
      
      // Per ora, attività fittizia
      this.data.recentActivity = [
        {
          id: '1',
          type: 'login',
          message: 'Accesso effettuato',
          timestamp: new Date(),
          icon: 'sign-in-alt'
        },
        {
          id: '2',
          type: 'task_view',
          message: 'Dashboard caricata',
          timestamp: new Date(Date.now() - 300000),
          icon: 'tachometer-alt'
        }
      ];
      
    } catch (error) {
      console.error('❌ Error loading activity:', error);
      this.data.recentActivity = [];
    }
  }

  // ==================== RENDERING ====================

  renderDashboard() {
    console.log('🎨 Rendering dashboard...');
    
    // Se non c'è un contenitore, crea struttura di base
    if (!document.getElementById('dashboard-container')) {
      this.createDashboardStructure();
    }
    
    this.updateUserInfo();
    this.renderStats();
    this.renderTasks();
    this.renderRecentActivity();
  }

  createDashboardStructure() {
    console.log('🏗️ Creating dashboard structure...');
    
    const main = document.querySelector('main') || document.body;
    main.innerHTML = `
      <div id="dashboard-container" class="dashboard-container">
        <!-- Header -->
        <header class="dashboard-header">
          <div class="user-info" id="user-info">
            <div class="user-avatar">
              <i class="fas fa-user-circle"></i>
            </div>
            <div class="user-details">
              <h1 id="welcome-message">Caricamento...</h1>
              <p id="user-role">Ruolo: ...</p>
            </div>
          </div>
          
          <div class="header-actions">
            <button id="refresh-btn" class="btn btn-primary">
              <i class="fas fa-sync-alt"></i> Aggiorna
            </button>
            <button id="logout-btn" class="btn btn-danger">
              <i class="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </header>
        
        <!-- Admin Alert -->
        <div id="admin-alert" class="admin-alert" style="display: none;"></div>
        
        <!-- Stats -->
        <section class="stats-section">
          <h2><i class="fas fa-chart-bar"></i> Statistiche</h2>
          <div id="stats-container" class="stats-container">
            <div class="loading-stats">Caricamento statistiche...</div>
          </div>
        </section>
        
        <!-- Tasks -->
        <section class="tasks-section">
          <div class="section-header">
            <h2><i class="fas fa-tasks"></i> Le Tue Task</h2>
            <a href="my-tasks.html" class="btn-view-all">
              Vedi tutte <i class="fas fa-arrow-right"></i>
            </a>
          </div>
          <div id="tasks-container" class="tasks-container">
            <div class="loading-tasks">Caricamento task...</div>
          </div>
        </section>
        
        <!-- Recent Activity -->
        <section class="activity-section">
          <h2><i class="fas fa-history"></i> Attività Recente</h2>
          <div id="activity-container" class="activity-container">
            <div class="loading-activity">Caricamento attività...</div>
          </div>
        </section>
      </div>
    `;
    
    // Inietta stili se non presenti
    this.injectDashboardStyles();
  }

  injectDashboardStyles() {
    if (document.getElementById('dashboard-styles')) return;
    
    const styles = `
      /* Dashboard Container */
      .dashboard-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 20px;
        animation: fadeIn 0.5s ease;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      /* Header */
      .dashboard-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 30px;
        border-radius: 15px;
        margin-bottom: 30px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      }
      
      .user-info {
        display: flex;
        align-items: center;
        gap: 20px;
      }
      
      .user-avatar {
        font-size: 3em;
      }
      
      .user-details h1 {
        margin: 0 0 5px 0;
        font-size: 1.8em;
      }
      
      .user-details p {
        margin: 0;
        opacity: 0.9;
      }
      
      .header-actions {
        display: flex;
        gap: 10px;
      }
      
      /* Admin Alert */
      .admin-alert {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        margin-bottom: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      /* Stats */
      .stats-container {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin-top: 20px;
      }
      
      .stat-card {
        background: white;
        border-radius: 12px;
        padding: 25px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.05);
        text-align: center;
        transition: all 0.3s ease;
        border: 1px solid #f0f0f0;
      }
      
      .stat-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 30px rgba(0,0,0,0.1);
      }
      
      .stat-icon {
        font-size: 2.5em;
        margin-bottom: 15px;
      }
      
      .stat-value {
        font-size: 2.5em;
        font-weight: bold;
        margin: 10px 0;
        color: #333;
      }
      
      .stat-label {
        color: #666;
        font-size: 0.95em;
      }
      
      /* Tasks */
      .tasks-container {
        margin-top: 20px;
      }
      
      .task-list {
        display: flex;
        flex-direction: column;
        gap: 15px;
      }
      
      .task-item {
        background: white;
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 3px 10px rgba(0,0,0,0.05);
        border-left: 4px solid #667eea;
        transition: all 0.3s ease;
      }
      
      .task-item:hover {
        transform: translateX(5px);
        box-shadow: 0 5px 20px rgba(0,0,0,0.1);
      }
      
      .task-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 10px;
      }
      
      .task-title {
        font-weight: 600;
        color: #333;
        font-size: 1.1em;
      }
      
      .task-priority {
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.85em;
        font-weight: 600;
      }
      
      .priority-high { background: #fee; color: #c00; }
      .priority-medium { background: #ffeaa7; color: #d35400; }
      .priority-low { background: #d1f7c4; color: #27ae60; }
      
      .task-description {
        color: #666;
        margin: 10px 0;
        line-height: 1.5;
      }
      
      .task-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 15px;
        padding-top: 15px;
        border-top: 1px solid #f0f0f0;
        font-size: 0.9em;
        color: #888;
      }
      
      /* Activity */
      .activity-container {
        margin-top: 20px;
      }
      
      .activity-item {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 15px;
        background: white;
        border-radius: 10px;
        margin-bottom: 10px;
        box-shadow: 0 3px 10px rgba(0,0,0,0.05);
      }
      
      .activity-icon {
        width: 40px;
        height: 40px;
        background: #667eea;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .activity-content {
        flex: 1;
      }
      
      .activity-message {
        color: #333;
        margin-bottom: 5px;
      }
      
      .activity-time {
        color: #888;
        font-size: 0.85em;
      }
      
      /* Responsive */
      @media (max-width: 768px) {
        .dashboard-header {
          flex-direction: column;
          text-align: center;
          gap: 20px;
        }
        
        .user-info {
          flex-direction: column;
          text-align: center;
        }
        
        .stats-container {
          grid-template-columns: 1fr;
        }
        
        .task-header {
          flex-direction: column;
          gap: 10px;
        }
        
        .task-footer {
          flex-direction: column;
          gap: 10px;
          align-items: flex-start;
        }
      }
    `;
    
    const styleEl = document.createElement('style');
    styleEl.id = 'dashboard-styles';
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
  }

  updateUserInfo() {
    if (!this.currentUser) return;
    
    // Aggiorna messaggio di benvenuto
    utils.DOM.setText('#welcome-message', `Benvenuto, ${this.currentUser.displayName}!`);
    utils.DOM.setText('#user-role', `Ruolo: ${utils.StringUtil.formatRole(this.currentUser.role)}`);
    
    // Mostra alert admin se necessario
    if (this.currentUser.isAdmin) {
      const adminAlert = document.getElementById('admin-alert');
      if (adminAlert) {
        adminAlert.style.display = 'flex';
        adminAlert.innerHTML = `
          <div>
            <strong><i class="fas fa-crown"></i> Sei un amministratore</strong>
            <p>Hai accesso a tutte le funzionalità</p>
          </div>
          <a href="admin-dashboard.html" class="btn btn-primary">
            <i class="fas fa-tachometer-alt"></i> Dashboard Admin
          </a>
        `;
      }
    }
  }

  renderStats() {
    const container = document.getElementById('stats-container');
    if (!container) return;
    
    if (!this.data.stats) {
      container.innerHTML = '<div class="error-stats">Errore caricamento statistiche</div>';
      return;
    }
    
    const stats = this.data.stats;
    container.innerHTML = `
      <div class="stat-card">
        <div class="stat-icon" style="color: #667eea;">
          <i class="fas fa-tasks"></i>
        </div>
        <div class="stat-value">${stats.total}</div>
        <div class="stat-label">Task Totali</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon" style="color: #2ecc71;">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="stat-value">${stats.completed}</div>
        <div class="stat-label">Completate</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon" style="color: #f39c12;">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-value">${stats.pending}</div>
        <div class="stat-label">In Attesa</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon" style="color: #e74c3c;">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="stat-value">${stats.overdue}</div>
        <div class="stat-label">In Ritardo</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon" style="color: #9b59b6;">
          <i class="fas fa-chart-line"></i>
        </div>
        <div class="stat-value">${stats.completionRate}%</div>
        <div class="stat-label">Tasso Completamento</div>
      </div>
    `;
  }

  renderTasks() {
    const container = document.getElementById('tasks-container');
    if (!container) return;
    
    if (!this.data.tasks || this.data.tasks.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-clipboard-list" style="font-size: 3em; color: #ccc; margin-bottom: 15px;"></i>
          <h3>Nessuna task assegnata</h3>
          <p>Non hai task assegnate al momento</p>
          <a href="add-task.html" class="btn btn-primary">
            <i class="fas fa-plus"></i> Crea Nuova Task
          </a>
        </div>
      `;
      return;
    }
    
    let tasksHTML = '<div class="task-list">';
    
    this.data.tasks.forEach(task => {
      const dueDate = task.dueDate ? utils.DateUtil.format(task.dueDate) : 'Nessuna scadenza';
      const isOverdue = task.dueDate && utils.DateUtil.isPast(task.dueDate) && task.status !== 'completed';
      
      tasksHTML += `
        <div class="task-item ${isOverdue ? 'task-overdue' : ''}">
          <div class="task-header">
            <div class="task-title">${task.title || 'Task senza titolo'}</div>
            <div class="task-priority priority-${task.priority || 'medium'}">
              ${task.priority || 'media'}
            </div>
          </div>
          
          <div class="task-description">
            ${utils.StringUtil.truncate(task.description || 'Nessuna descrizione', 120)}
          </div>
          
          <div class="task-footer">
            <div>
              <i class="far fa-calendar"></i> ${dueDate}
              ${isOverdue ? '<span style="color: #e74c3c; margin-left: 10px;"><i class="fas fa-exclamation-circle"></i> In ritardo</span>' : ''}
            </div>
            <div>
              <span class="task-status">${task.status || 'pending'}</span>
            </div>
          </div>
        </div>
      `;
    });
    
    tasksHTML += '</div>';
    container.innerHTML = tasksHTML;
  }

  renderRecentActivity() {
    const container = document.getElementById('activity-container');
    if (!container) return;
    
    if (!this.data.recentActivity || this.data.recentActivity.length === 0) {
      container.innerHTML = '<div class="no-activity">Nessuna attività recente</div>';
      return;
    }
    
    let activityHTML = '';
    
    this.data.recentActivity.forEach(activity => {
      activityHTML += `
        <div class="activity-item">
          <div class="activity-icon">
            <i class="fas fa-${activity.icon || 'circle'}"></i>
          </div>
          <div class="activity-content">
            <div class="activity-message">${activity.message}</div>
            <div class="activity-time">${utils.DateUtil.fromNow(activity.timestamp)}</div>
          </div>
        </div>
      `;
    });
    
    container.innerHTML = activityHTML;
  }

  updateDataDisplays() {
    this.renderStats();
    this.renderTasks();
    this.renderRecentActivity();
  }

  setupEventListeners() {
    // Pulsante refresh
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.refresh());
    }
    
    // Pulsante logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => auth.logout());
    }
    
    // Auto-refresh ogni 30 secondi
    setInterval(() => {
      if (document.visibilityState === 'visible') {
        this.refresh();
      }
    }, 30000);
  }

  showError(message) {
    const container = document.getElementById('dashboard-container') || document.body;
    container.innerHTML = `
      <div class="error-container" style="text-align: center; padding: 50px 20px;">
        <div style="font-size: 4em; color: #e74c3c; margin-bottom: 20px;">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h2 style="color: #333; margin-bottom: 15px;">Errore</h2>
        <p style="color: #666; margin-bottom: 30px; max-width: 500px; margin-left: auto; margin-right: auto;">
          ${message}
        </p>
        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
          <button onclick="window.dashboard.init()" class="btn btn-primary">
            <i class="fas fa-redo"></i> Riprova
          </button>
          <button onclick="auth.logout()" class="btn btn-danger">
            <i class="fas fa-sign-out-alt"></i> Logout
          </button>
          <button onclick="location.reload()" class="btn btn-warning">
            <i class="fas fa-sync"></i> Ricarica Pagina
          </button>
        </div>
      </div>
    `;
  }
}

// ==================== INITIALIZATION ====================

const dashboard = new Dashboard();

// Inizializza quando il DOM è pronto
document.addEventListener('DOMContentLoaded', () => {
  console.log('📄 Dashboard DOM ready');
  
  // Ritardo per sicurezza (assicura che tutto sia caricato)
  setTimeout(() => {
    dashboard.init();
  }, 100);
});

// Export globale
window.dashboard = dashboard;

console.log('✅ Dashboard v3.0 ready');
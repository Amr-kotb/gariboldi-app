// js/utils.js - UTILITIES v2.0
console.log('🛠️ Utils loaded');

// ==================== STORAGE MANAGEMENT ====================

const Storage = {
  set: (key, data) => {
    try {
      const serialized = JSON.stringify(data);
      sessionStorage.setItem(key, serialized);
      localStorage.setItem(`persist_${key}`, serialized); // Backup
      return true;
    } catch (e) {
      console.error('Storage set error:', e);
      return false;
    }
  },

  get: (key) => {
    try {
      // Prima cerca in sessionStorage
      const sessionData = sessionStorage.getItem(key);
      if (sessionData) return JSON.parse(sessionData);
      
      // Poi in localStorage
      const localData = localStorage.getItem(`persist_${key}`);
      if (localData) {
        sessionStorage.setItem(key, localData); // Ripristina
        return JSON.parse(localData);
      }
      
      return null;
    } catch (e) {
      console.error('Storage get error:', e);
      return null;
    }
  },

  remove: (key) => {
    sessionStorage.removeItem(key);
    localStorage.removeItem(`persist_${key}`);
  },

  clear: () => {
    sessionStorage.clear();
    // Rimuove solo le nostre chiavi da localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('persist_')) {
        localStorage.removeItem(key);
      }
    });
  }
};

// ==================== NOTIFICATION SYSTEM ====================

const Notify = {
  show: (message, type = 'info', duration = 4000) => {
    // Rimuovi notifiche precedenti
    Notify.hide();
    
    // Crea notifica
    const notification = document.createElement('div');
    notification.id = 'global-notification';
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-${Notify.getIcon(type)}"></i>
        <span>${message}</span>
      </div>
      <button class="notification-close" onclick="Notify.hide()">×</button>
    `;
    
    document.body.appendChild(notification);
    
    // Mostra con animazione
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Auto-rimuovi
    if (duration > 0) {
      setTimeout(Notify.hide, duration);
    }
    
    return notification;
  },

  hide: () => {
    const notification = document.getElementById('global-notification');
    if (notification) {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }
  },

  getIcon: (type) => {
    const icons = {
      success: 'check-circle',
      error: 'exclamation-triangle',
      warning: 'exclamation-circle',
      info: 'info-circle'
    };
    return icons[type] || 'info-circle';
  }
};

// ==================== LOADING MANAGER ====================

const Loader = {
  show: (message = 'Caricamento...') => {
    // Rimuovi loader precedente
    Loader.hide();
    
    const loader = document.createElement('div');
    loader.id = 'global-loader';
    loader.className = 'loader-overlay';
    loader.innerHTML = `
      <div class="loader-container">
        <div class="loader-spinner"></div>
        <div class="loader-text">${message}</div>
        <div class="loader-progress"></div>
      </div>
    `;
    
    document.body.appendChild(loader);
    return loader;
  },

  hide: () => {
    const loader = document.getElementById('global-loader');
    if (loader) {
      loader.classList.add('fade-out');
      setTimeout(() => loader.remove(), 300);
    }
  },

  update: (message, progress = null) => {
    const loader = document.getElementById('global-loader');
    if (!loader) return;
    
    const textEl = loader.querySelector('.loader-text');
    const progressEl = loader.querySelector('.loader-progress');
    
    if (textEl && message) textEl.textContent = message;
    if (progressEl && progress !== null) {
      progressEl.style.width = `${progress}%`;
    }
  }
};

// ==================== FORM VALIDATION ====================

const Validator = {
  email: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  password: (password) => {
    return password && password.length >= 6;
  },

  required: (value) => {
    return value !== undefined && value !== null && value.toString().trim() !== '';
  },

  phone: (phone) => {
    const re = /^[+]?[\d\s\-()]{8,20}$/;
    return re.test(phone);
  }
};

// ==================== DATE FORMATTER ====================

const DateUtil = {
  format: (date, options = {}) => {
    if (!date) return 'N/D';
    
    let dateObj;
    if (date.toDate) dateObj = date.toDate();
    else if (date instanceof Date) dateObj = date;
    else dateObj = new Date(date);
    
    if (isNaN(dateObj.getTime())) return 'N/D';
    
    const defaults = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    };
    
    return dateObj.toLocaleDateString('it-IT', { ...defaults, ...options });
  },

  formatDateTime: (date) => {
    return DateUtil.format(date, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  },

  fromNow: (date) => {
    const now = new Date();
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    const diff = now - dateObj;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 7) return DateUtil.format(dateObj);
    if (days > 0) return `${days} giorno${days !== 1 ? 'i' : ''} fa`;
    if (hours > 0) return `${hours} ora${hours !== 1 ? 'e' : ''} fa`;
    if (minutes > 0) return `${minutes} minuto${minutes !== 1 ? 'i' : ''} fa`;
    return 'ora';
  },

  isPast: (date) => {
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj < new Date();
  }
};

// ==================== STRING UTILITIES ====================

const StringUtil = {
  truncate: (str, max = 100, suffix = '...') => {
    if (!str) return '';
    return str.length > max ? str.substring(0, max) + suffix : str;
  },

  capitalize: (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  formatRole: (role) => {
    const roles = {
      'admin': 'Amministratore',
      'employee': 'Dipendente',
      'manager': 'Manager',
      'supervisor': 'Supervisore'
    };
    return roles[role] || StringUtil.capitalize(role);
  },

  generateId: (length = 8) => {
    return Math.random().toString(36).substring(2, 2 + length);
  }
};

// ==================== DOM UTILITIES ====================

const DOM = {
  show: (selector) => {
    const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (el) el.style.display = 'block';
  },

  hide: (selector) => {
    const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (el) el.style.display = 'none';
  },

  toggle: (selector, force) => {
    const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (el) {
      el.style.display = force !== undefined ? (force ? 'block' : 'none') : 
                         (el.style.display === 'none' ? 'block' : 'none');
    }
  },

  empty: (selector) => {
    const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (el) el.innerHTML = '';
  },

  setText: (selector, text) => {
    const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (el) el.textContent = text;
  }
};

// ==================== FIREBASE HELPERS ====================

const FirebaseHelper = {
  parseDoc: (doc) => {
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  parseCollection: (snapshot) => {
    const results = [];
    snapshot.forEach(doc => results.push(FirebaseHelper.parseDoc(doc)));
    return results;
  },

  timestamp: () => {
    return firebase.firestore.FieldValue.serverTimestamp();
  },

  arrayUnion: (...elements) => {
    return firebase.firestore.FieldValue.arrayUnion(...elements);
  },

  arrayRemove: (...elements) => {
    return firebase.firestore.FieldValue.arrayRemove(...elements);
  }
};

// ==================== ERROR HANDLER ====================

const ErrorHandler = {
  handle: (error, context = '') => {
    console.error(`❌ Error [${context}]:`, error);
    
    let userMessage = 'Si è verificato un errore';
    
    if (error.code) {
      switch (error.code) {
        case 'auth/user-not-found':
          userMessage = 'Utente non trovato';
          break;
        case 'auth/wrong-password':
          userMessage = 'Password errata';
          break;
        case 'auth/too-many-requests':
          userMessage = 'Troppi tentativi, riprova più tardi';
          break;
        case 'permission-denied':
          userMessage = 'Permesso negato';
          break;
        case 'not-found':
          userMessage = 'Risorsa non trovata';
          break;
        default:
          userMessage = `Errore: ${error.code}`;
      }
    } else if (error.message) {
      userMessage = error.message;
    }
    
    Notify.show(userMessage, 'error');
    return userMessage;
  },

  wrap: async (fn, context = '') => {
    try {
      return await fn();
    } catch (error) {
      ErrorHandler.handle(error, context);
      throw error;
    }
  }
};

// ==================== INITIALIZATION ====================

// Aggiungi stili globali
function injectGlobalStyles() {
  if (document.getElementById('utils-styles')) return;
  
  const styles = `
    /* Notification */
    .notification {
      position: fixed;
      top: 20px;
      right: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      padding: 15px 20px;
      min-width: 300px;
      max-width: 400px;
      z-index: 10000;
      transform: translateX(120%);
      transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
      border-left: 4px solid #2196f3;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .notification.show {
      transform: translateX(0);
    }
    
    .notification.success { border-left-color: #4caf50; }
    .notification.error { border-left-color: #f44336; }
    .notification.warning { border-left-color: #ff9800; }
    .notification.info { border-left-color: #2196f3; }
    
    .notification-content {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }
    
    .notification-close {
      background: none;
      border: none;
      color: #666;
      cursor: pointer;
      font-size: 18px;
      padding: 0 0 0 15px;
      line-height: 1;
    }
    
    .notification-close:hover {
      color: #333;
    }
    
    /* Loader */
    .loader-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.95);
      z-index: 9999;
      display: flex;
      justify-content: center;
      align-items: center;
      backdrop-filter: blur(3px);
    }
    
    .loader-container {
      text-align: center;
      max-width: 300px;
      padding: 30px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 5px 25px rgba(0,0,0,0.1);
    }
    
    .loader-spinner {
      width: 50px;
      height: 50px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }
    
    .loader-text {
      color: #333;
      margin-bottom: 15px;
      font-size: 16px;
    }
    
    .loader-progress {
      height: 4px;
      background: #e0e0e0;
      border-radius: 2px;
      overflow: hidden;
    }
    
    .loader-progress::after {
      content: '';
      display: block;
      width: 30%;
      height: 100%;
      background: #3498db;
      animation: progress 2s ease-in-out infinite;
    }
    
    .fade-out {
      opacity: 0;
      transition: opacity 0.3s;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @keyframes progress {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(400%); }
    }
    
    /* Form styles */
    .form-group {
      margin-bottom: 20px;
    }
    
    .form-label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #333;
    }
    
    .form-control {
      width: 100%;
      padding: 10px 15px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 16px;
      transition: all 0.3s;
    }
    
    .form-control:focus {
      outline: none;
      border-color: #3498db;
      box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
    }
    
    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.3s;
      font-weight: 500;
    }
    
    .btn-primary {
      background: #3498db;
      color: white;
    }
    
    .btn-primary:hover {
      background: #2980b9;
    }
    
    .btn-success {
      background: #2ecc71;
      color: white;
    }
    
    .btn-danger {
      background: #e74c3c;
      color: white;
    }
    
    .btn-warning {
      background: #f39c12;
      color: white;
    }
  `;
  
  const styleEl = document.createElement('style');
  styleEl.id = 'utils-styles';
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);
}

// ==================== EXPORT ====================

window.utils = {
  Storage,
  Notify,
  Loader,
  Validator,
  DateUtil,
  StringUtil,
  DOM,
  FirebaseHelper,
  ErrorHandler
};

// Inizializza
document.addEventListener('DOMContentLoaded', () => {
  injectGlobalStyles();
  console.log('✅ Utils initialized');
});

console.log('🛠️ Utils v2.0 ready');
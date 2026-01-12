// js/utils.js - UTILITY FUNCTIONS
console.log('🛠️ Utils loaded');

// ==================== NOTIFICATION SYSTEM ====================

// Mostra una notifica
function showNotification(message, type = 'info', duration = 3000) {
    console.log(`📢 Notifica [${type}]: ${message}`);
    
    // Rimuovi notifiche precedenti
    removeExistingNotifications();
    
    // Crea elemento notifica
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.id = 'current-notification';
    
    // Icona in base al tipo
    let icon = 'info-circle';
    switch (type) {
        case 'success': icon = 'check-circle'; break;
        case 'error': icon = 'exclamation-triangle'; break;
        case 'warning': icon = 'exclamation-circle'; break;
        default: icon = 'info-circle';
    }
    
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Aggiungi al body
    document.body.appendChild(notification);
    
    // Mostra con animazione
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Rimuovi automaticamente dopo duration
    if (duration > 0) {
        setTimeout(() => {
            if (notification.parentElement) {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (notification.parentElement) {
                        notification.remove();
                    }
                }, 300);
            }
        }, duration);
    }
    
    return notification;
}

// Rimuovi notifiche esistenti
function removeExistingNotifications() {
    const existing = document.getElementById('current-notification');
    if (existing) {
        existing.remove();
    }
}

// ==================== DATE FUNCTIONS ====================

// Formatta una data
function formatDate(date, includeTime = false) {
    if (!date) return 'N/D';
    
    try {
        let dateObj;
        
        if (date.toDate) {
            // Firestore Timestamp
            dateObj = date.toDate();
        } else if (date instanceof Date) {
            // Date object
            dateObj = date;
        } else if (typeof date === 'string' || typeof date === 'number') {
            // String or timestamp
            dateObj = new Date(date);
        } else {
            return 'N/D';
        }
        
        if (isNaN(dateObj.getTime())) {
            return 'N/D';
        }
        
        const options = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        };
        
        if (includeTime) {
            options.hour = '2-digit';
            options.minute = '2-digit';
        }
        
        return dateObj.toLocaleDateString('it-IT', options);
        
    } catch (error) {
        console.error('Errore formattazione data:', error);
        return 'N/D';
    }
}

// Formatta data relativa (es: "2 giorni fa")
function formatRelativeDate(date) {
    if (!date) return 'N/D';
    
    try {
        let dateObj;
        
        if (date.toDate) {
            dateObj = date.toDate();
        } else if (date instanceof Date) {
            dateObj = date;
        } else {
            dateObj = new Date(date);
        }
        
        if (isNaN(dateObj.getTime())) {
            return 'N/D';
        }
        
        const now = new Date();
        const diffMs = now - dateObj;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        
        if (diffDays === 0) {
            if (diffHours === 0) {
                if (diffMinutes < 1) return 'ora';
                return `${diffMinutes} min${diffMinutes === 1 ? '' : ''} fa`;
            }
            return `${diffHours} ore fa`;
        } else if (diffDays === 1) {
            return 'ieri';
        } else if (diffDays < 7) {
            return `${diffDays} giorni fa`;
        } else {
            return formatDate(dateObj);
        }
        
    } catch (error) {
        console.error('Errore formattazione data relativa:', error);
        return formatDate(date);
    }
}

// Controlla se una data è passata
function isDatePast(date) {
    if (!date) return false;
    
    try {
        let dateObj;
        
        if (date.toDate) {
            dateObj = date.toDate();
        } else if (date instanceof Date) {
            dateObj = date;
        } else {
            dateObj = new Date(date);
        }
        
        if (isNaN(dateObj.getTime())) {
            return false;
        }
        
        const now = new Date();
        return dateObj < now;
        
    } catch (error) {
        console.error('Errore controllo data:', error);
        return false;
    }
}

// ==================== STRING FUNCTIONS ====================

// Tronca una stringa
function truncateString(str, maxLength = 100) {
    if (!str) return '';
    if (str.length <= maxLength) return str;
    
    return str.substring(0, maxLength) + '...';
}

// Capitalizza prima lettera
function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Formatta ruolo
function formatRole(role) {
    if (!role) return 'Dipendente';
    
    const roles = {
        'admin': 'Amministratore',
        'employee': 'Dipendente',
        'manager': 'Manager',
        'supervisor': 'Supervisore'
    };
    
    return roles[role] || capitalizeFirst(role);
}

// ==================== VALIDATION FUNCTIONS ====================

// Valida email
function isValidEmail(email) {
    if (!email) return false;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Valida password
function isValidPassword(password) {
    if (!password) return false;
    
    // Almeno 6 caratteri
    return password.length >= 6;
}

// Valida campo obbligatorio
function isRequired(value) {
    return value !== undefined && value !== null && value.toString().trim() !== '';
}

// ==================== DOM FUNCTIONS ====================

// Mostra/nascondi elemento
function toggleElement(elementId, show = true) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = show ? 'block' : 'none';
    }
}

// Abilita/disabilita elemento
function setElementDisabled(elementId, disabled = true) {
    const element = document.getElementById(elementId);
    if (element) {
        element.disabled = disabled;
    }
}

// Mostra loader
function showLoader(containerId, message = 'Caricamento...') {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="loader-container">
                <div class="loader"></div>
                <p>${message}</p>
            </div>
        `;
    }
}

// Nascondi loader
function hideLoader(containerId) {
    const container = document.getElementById(containerId);
    if (container && container.querySelector('.loader-container')) {
        container.innerHTML = '';
    }
}

// ==================== FIREBASE HELPERS ====================

// Converte documento Firestore in oggetto
function firestoreDocToObject(doc) {
    if (!doc.exists) return null;
    
    return {
        id: doc.id,
        ...doc.data(),
        // Aggiungi timestamp convertiti
        createdAt: doc.data().createdAt ? formatDate(doc.data().createdAt, true) : null,
        updatedAt: doc.data().updatedAt ? formatDate(doc.data().updatedAt, true) : null
    };
}

// Converte query snapshot in array
function firestoreSnapshotToArray(snapshot) {
    const result = [];
    snapshot.forEach(doc => {
        result.push(firestoreDocToObject(doc));
    });
    return result;
}

// ==================== STYLE FUNCTIONS ====================

// Ottieni badge per priorità
function getPriorityBadge(priority) {
    const badges = {
        'low': { text: 'Bassa', class: 'badge-low', color: '#4caf50' },
        'medium': { text: 'Media', class: 'badge-medium', color: '#ff9800' },
        'high': { text: 'Alta', class: 'badge-high', color: '#f44336' },
        'critical': { text: 'Critica', class: 'badge-critical', color: '#9c27b0' }
    };
    
    const badge = badges[priority] || badges.medium;
    
    return `
        <span class="priority-badge ${badge.class}" 
              style="background: ${badge.color}; color: white; 
                     padding: 3px 8px; border-radius: 12px; font-size: 0.8em;">
            ${badge.text}
        </span>
    `;
}

// Ottieni badge per stato
function getStatusBadge(status) {
    const badges = {
        'pending': { text: 'In attesa', class: 'badge-pending', color: '#ff9800' },
        'in-progress': { text: 'In corso', class: 'badge-in-progress', color: '#2196f3' },
        'completed': { text: 'Completata', class: 'badge-completed', color: '#4caf50' },
        'cancelled': { text: 'Cancellata', class: 'badge-cancelled', color: '#9e9e9e' }
    };
    
    const badge = badges[status] || badges.pending;
    
    return `
        <span class="status-badge ${badge.class}" 
              style="background: ${badge.color}; color: white; 
                     padding: 3px 8px; border-radius: 12px; font-size: 0.8em;">
            ${badge.text}
        </span>
    `;
}

// ==================== STORAGE FUNCTIONS ====================

// Salva in localStorage
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Errore salvataggio localStorage:', error);
        return false;
    }
}

// Carica da localStorage
function loadFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Errore caricamento localStorage:', error);
        return null;
    }
}

// Rimuovi da localStorage
function removeFromLocalStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Errore rimozione localStorage:', error);
        return false;
    }
}

// ==================== INITIALIZATION ====================

// Aggiungi stili CSS per le utility
function addUtilsStyles() {
    if (!document.getElementById('utils-styles')) {
        const style = document.createElement('style');
        style.id = 'utils-styles';
        style.textContent = `
            /* Notifiche */
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                padding: 16px 20px;
                min-width: 300px;
                max-width: 400px;
                z-index: 10000;
                transform: translateX(150%);
                transition: transform 0.3s ease;
                border-left: 4px solid #2196f3;
            }
            
            .notification.show {
                transform: translateX(0);
            }
            
            .notification-info {
                border-left-color: #2196f3;
            }
            
            .notification-success {
                border-left-color: #4caf50;
            }
            
            .notification-error {
                border-left-color: #f44336;
            }
            
            .notification-warning {
                border-left-color: #ff9800;
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .notification-close {
                position: absolute;
                top: 10px;
                right: 10px;
                background: none;
                border: none;
                color: #666;
                cursor: pointer;
                padding: 4px;
                font-size: 0.9em;
            }
            
            .notification-close:hover {
                color: #333;
            }
            
            /* Loader */
            .loader-container {
                text-align: center;
                padding: 40px;
            }
            
            .loader {
                border: 4px solid #f3f3f3;
                border-top: 4px solid #3498db;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                animation: spin 1s linear infinite;
                margin: 0 auto 20px auto;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
}

// Inizializza quando il DOM è pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log('🛠️ Utils initialized');
    addUtilsStyles();
});

// Esporta funzioni globalmente
window.utils = {
    // Notifiche
    showNotification,
    
    // Date
    formatDate,
    formatRelativeDate,
    isDatePast,
    
    // String
    truncateString,
    capitalizeFirst,
    formatRole,
    
    // Validation
    isValidEmail,
    isValidPassword,
    isRequired,
    
    // DOM
    toggleElement,
    setElementDisabled,
    showLoader,
    hideLoader,
    
    // Firebase
    firestoreDocToObject,
    firestoreSnapshotToArray,
    
    // UI Components
    getPriorityBadge,
    getStatusBadge,
    
    // Storage
    saveToLocalStorage,
    loadFromLocalStorage,
    removeFromLocalStorage
};

console.log('✅ Utils ready');
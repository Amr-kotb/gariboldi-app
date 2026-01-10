// js/admin-stats.js
// Dashboard Statistiche Complete per Admin con Esportazione Excel/PDF

class AdminStatistics {
    constructor() {
        this.charts = {};
        this.data = {
            tasks: [],
            users: [],
            employees: [], // Solo dipendenti (esclude admin)
            admin: null,
            stats: {},
            employeeStats: [],
            monthlyStats: {}
        };
        
        this.filterPeriod = '30';
        this.currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        this.colors = {
            primary: '#4361ee',
            success: '#4cc9f0',
            danger: '#f72585',
            warning: '#f8961e',
            info: '#4895ef',
            secondary: '#7209b7'
        };
    }
    
    async init() {
        try {
            showNotification('Caricamento statistiche...', 'info');
            await this.loadAllData();
            this.initializeMonthSelector();
            this.renderDashboard();
            showNotification('Statistiche caricate con successo!', 'success');
        } catch (error) {
            console.error('❌ Errore inizializzazione statistiche:', error);
            showNotification('Errore nel caricamento delle statistiche', 'error');
        }
    }
    
    async loadAllData() {
        try {
            // Carica tutti i dati
            const [allTasks, allUsers] = await Promise.all([
                loadAllTasks(),
                getAllUsers()
            ]);
            
            this.data.tasks = allTasks;
            this.data.users = allUsers;
            
            // Separa admin e dipendenti
            this.separateAdminFromEmployees();
            
            // Filtra task per periodo
            this.filterTasksByPeriod();
            
            // Calcola tutte le statistiche
            await this.calculateAllStats();
            
            // Aggiorna dashboard
            this.updateKPI();
            this.renderCharts();
            this.renderEmployeeStats();
            this.renderPerformanceTable();
            this.renderCriticalTasks();
            this.loadMonthlyReport(this.currentMonth);
            
        } catch (error) {
            console.error('Errore caricamento dati:', error);
            throw error;
        }
    }
    
    separateAdminFromEmployees() {
        this.data.employees = this.data.users.filter(user => user.role === 'employee');
        this.data.admin = this.data.users.find(user => user.role === 'admin');
    }
    
    filterTasksByPeriod() {
        const now = new Date();
        let cutoffDate = null;
        
        if (this.filterPeriod !== 'all') {
            const days = parseInt(this.filterPeriod);
            cutoffDate = new Date(now);
            cutoffDate.setDate(now.getDate() - days);
        }
        
        this.data.filteredTasks = this.data.tasks.filter(task => {
            if (!cutoffDate) return true;
            
            const taskDate = task.createdAt?.toDate ? task.createdAt.toDate() : new Date(task.createdAt);
            return taskDate >= cutoffDate;
        });
    }
    
    async calculateAllStats() {
        const tasks = this.data.filteredTasks;
        const employees = this.data.employees;
        
        // Statistiche globali
        this.data.stats = {
            totalUsers: this.data.users.length,
            totalEmployees: employees.length,
            totalTasks: tasks.length,
            completedTasks: tasks.filter(t => t.status === 'completed').length,
            inProgressTasks: tasks.filter(t => t.status === 'in-progress').length,
            pendingTasks: tasks.filter(t => t.status === 'pending').length,
            overdueTasks: tasks.filter(t => this.isTaskOverdue(t.dueDate) && t.status !== 'completed').length,
            completionRate: tasks.length > 0 ? 
                Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0,
            avgCompletionDays: await this.calculateAverageCompletionDays(tasks),
            topPerformer: await this.getTopPerformer(tasks, employees)
        };
        
        // Statistiche per dipendente
        this.data.employeeStats = await this.calculateEmployeeStats(tasks, employees);
        
        // Task critiche
        this.data.criticalTasks = this.getCriticalTasks(tasks);
    }
    
    async calculateAverageCompletionDays(tasks) {
        const completedTasks = tasks.filter(t => t.status === 'completed' && t.createdAt && t.updatedAt);
        
        if (completedTasks.length === 0) return 0;
        
        let totalDays = 0;
        
        completedTasks.forEach(task => {
            const startDate = task.createdAt.toDate ? task.createdAt.toDate() : new Date(task.createdAt);
            const endDate = task.updatedAt.toDate ? task.updatedAt.toDate() : new Date(task.updatedAt);
            
            const diffTime = Math.abs(endDate - startDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            totalDays += diffDays;
        });
        
        return Math.round(totalDays / completedTasks.length);
    }
    
    async getTopPerformer(tasks, employees) {
        if (employees.length === 0) return '-';
        
        const employeeStats = await this.calculateEmployeeStats(tasks, employees);
        
        // Trova dipendente con tasso completamento più alto
        const topPerformer = employeeStats.reduce((prev, current) => 
            (prev.completionRate > current.completionRate) ? prev : current
        );
        
        return topPerformer.displayName;
    }
    
    async calculateEmployeeStats(tasks, employees) {
        const employeeStats = [];
        
        for (const employee of employees) {
            // Task assegnate a questo dipendente
            const assignedTasks = tasks.filter(task => task.assignedTo === employee.email);
            
            // Task create da questo dipendente
            const createdTasks = tasks.filter(task => task.createdBy === employee.email);
            
            // Task completate
            const completedTasks = assignedTasks.filter(t => t.status === 'completed');
            
            // Task in corso
            const inProgressTasks = assignedTasks.filter(t => t.status === 'in-progress');
            
            // Task in ritardo
            const overdueTasks = assignedTasks.filter(t => 
                this.isTaskOverdue(t.dueDate) && t.status !== 'completed'
            );
            
            // Task fallite (eliminate o non completate oltre scadenza)
            const failedTasks = assignedTasks.filter(t => 
                t.isDeleted || (this.isTaskOverdue(t.dueDate) && t.status !== 'completed')
            );
            
            // Tasso di successo
            const successRate = assignedTasks.length > 0 ? 
                Math.round((completedTasks.length / assignedTasks.length) * 100) : 0;
            
            // Tempo medio completamento
            const avgCompletionTime = this.calculateEmployeeAvgCompletionTime(completedTasks);
            
            // Ultima task
            const lastTask = assignedTasks.length > 0 ? 
                assignedTasks.sort((a, b) => 
                    (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0)
                )[0] : null;
            
            // Task per priorità
            const priorityStats = {
                critical: assignedTasks.filter(t => t.priority === 'critical').length,
                high: assignedTasks.filter(t => t.priority === 'high').length,
                medium: assignedTasks.filter(t => t.priority === 'medium').length,
                low: assignedTasks.filter(t => t.priority === 'low').length
            };
            
            employeeStats.push({
                email: employee.email,
                displayName: employee.displayName || employee.email.split('@')[0],
                assignedTasks: assignedTasks.length,
                createdTasks: createdTasks.length,
                completedTasks: completedTasks.length,
                inProgressTasks: inProgressTasks.length,
                overdueTasks: overdueTasks.length,
                failedTasks: failedTasks.length,
                successRate: successRate,
                completionRate: Math.round((completedTasks.length / Math.max(assignedTasks.length, 1)) * 100),
                avgCompletionTime: avgCompletionTime,
                lastTask: lastTask,
                priorityStats: priorityStats,
                avatar: this.generateAvatar(employee.email)
            });
        }
        
        // Ordina per tasso completamento
        return employeeStats.sort((a, b) => b.completionRate - a.completionRate);
    }
    
    calculateEmployeeAvgCompletionTime(completedTasks) {
        if (completedTasks.length === 0) return 0;
        
        let totalDays = 0;
        
        completedTasks.forEach(task => {
            const startDate = task.createdAt?.toDate ? task.createdAt.toDate() : new Date(task.createdAt);
            const endDate = task.updatedAt?.toDate ? task.updatedAt.toDate() : new Date(task.updatedAt);
            
            if (startDate && endDate) {
                const diffTime = Math.abs(endDate - startDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                totalDays += diffDays;
            }
        });
        
        return Math.round(totalDays / completedTasks.length);
    }
    
    getCriticalTasks(tasks) {
        return tasks
            .filter(task => 
                (this.isTaskOverdue(task.dueDate) && task.status !== 'completed') ||
                task.priority === 'critical'
            )
            .map(task => ({
                ...task,
                overdueDays: this.getOverdueDays(task.dueDate)
            }))
            .sort((a, b) => b.overdueDays - a.overdueDays)
            .slice(0, 10);
    }
    
    isTaskOverdue(dueDate) {
        if (!dueDate) return false;
        const due = dueDate.toDate ? dueDate.toDate() : new Date(dueDate);
        const now = new Date();
        return due < now;
    }
    
    getOverdueDays(dueDate) {
        if (!dueDate) return 0;
        const due = dueDate.toDate ? dueDate.toDate() : new Date(dueDate);
        const now = new Date();
        const diffTime = Math.abs(now - due);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    
    generateAvatar(email) {
        const name = email.split('@')[0];
        const initials = name.substring(0, 2).toUpperCase();
        const colors = ['#4361ee', '#7209b7', '#f72585', '#f8961e', '#4cc9f0'];
        const colorIndex = email.length % colors.length;
        return { initials, color: colors[colorIndex] };
    }
    
    updateKPI() {
        const stats = this.data.stats;
        
        document.getElementById('total-users').textContent = stats.totalUsers;
        document.getElementById('total-tasks').textContent = stats.totalTasks;
        document.getElementById('overdue-tasks').textContent = stats.overdueTasks;
        document.getElementById('completion-rate').textContent = `${stats.completionRate}%`;
        document.getElementById('avg-completion-days').textContent = stats.avgCompletionDays;
        document.getElementById('top-performer').textContent = stats.topPerformer;
    }
    
    renderCharts() {
        this.renderTasksDistributionChart();
        this.renderCompletionTrendChart();
    }
    
    renderTasksDistributionChart() {
        const ctx = document.getElementById('tasksDistributionChart').getContext('2d');
        const tasks = this.data.filteredTasks;
        
        const statusData = {
            completed: tasks.filter(t => t.status === 'completed').length,
            'in-progress': tasks.filter(t => t.status === 'in-progress').length,
            pending: tasks.filter(t => t.status === 'pending').length
        };
        
        if (this.charts.tasksDistributionChart) {
            this.charts.tasksDistributionChart.destroy();
        }
        
        this.charts.tasksDistributionChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Completate', 'In Corso', 'In Attesa'],
                datasets: [{
                    data: [statusData.completed, statusData['in-progress'], statusData.pending],
                    backgroundColor: [this.colors.success, this.colors.warning, this.colors.info],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((context.raw / total) * 100);
                                return `${context.label}: ${context.raw} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    renderCompletionTrendChart() {
        const ctx = document.getElementById('completionTrendChart').getContext('2d');
        const tasks = this.data.tasks;
        
        // Ultimi 30 giorni
        const labels = [];
        const completedData = [];
        const createdData = [];
        
        const now = new Date();
        for (let i = 29; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);
            
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            
            const dayCreated = tasks.filter(task => {
                const taskDate = task.createdAt?.toDate ? task.createdAt.toDate() : new Date(task.createdAt);
                return taskDate >= startOfDay && taskDate <= endOfDay;
            }).length;
            
            const dayCompleted = tasks.filter(task => {
                if (task.status !== 'completed') return false;
                const completedDate = task.updatedAt?.toDate ? task.updatedAt.toDate() : new Date(task.updatedAt);
                return completedDate >= startOfDay && completedDate <= endOfDay;
            }).length;
            
            labels.push(this.formatDateShort(date));
            createdData.push(dayCreated);
            completedData.push(dayCompleted);
        }
        
        if (this.charts.completionTrendChart) {
            this.charts.completionTrendChart.destroy();
        }
        
        this.charts.completionTrendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Task Create',
                        data: createdData,
                        borderColor: this.colors.primary,
                        backgroundColor: `${this.colors.primary}20`,
                        fill: true,
                        tension: 0.3
                    },
                    {
                        label: 'Task Completate',
                        data: completedData,
                        borderColor: this.colors.success,
                        backgroundColor: `${this.colors.success}20`,
                        fill: true,
                        tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        });
    }
    
    renderEmployeeStats() {
        const container = document.getElementById('employees-stats-container');
        const employeeStats = this.data.employeeStats;
        
        if (employeeStats.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <h3>Nessun dipendente trovato</h3>
                    <p>Non ci sono dipendenti nel sistema</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div class="employee-stats-grid">
                ${employeeStats.map(employee => this.renderEmployeeCard(employee)).join('')}
            </div>
        `;
        
        // Aggiungi event listeners per dettagli dipendente
        document.querySelectorAll('.view-employee-details').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const email = e.target.dataset.email;
                this.showEmployeeDetails(email);
            });
        });
    }
    
    renderEmployeeCard(employee) {
        const progressColor = employee.completionRate >= 80 ? this.colors.success :
                            employee.completionRate >= 60 ? this.colors.warning :
                            this.colors.danger;
        
        return `
            <div class="employee-card">
                <div class="employee-header">
                    <div class="employee-avatar" style="background: ${employee.avatar.color}">
                        ${employee.avatar.initials}
                    </div>
                    <div class="employee-info">
                        <h4>${employee.displayName}</h4>
                        <p>${employee.email}</p>
                    </div>
                    <button class="btn btn-icon btn-sm view-employee-details" data-email="${employee.email}" title="Vedi dettagli">
                        <i class="fas fa-chart-bar"></i>
                    </button>
                </div>
                
                <div class="employee-stats">
                    <div class="stat-row">
                        <span>Task Assegnate:</span>
                        <strong>${employee.assignedTasks}</strong>
                    </div>
                    <div class="stat-row">
                        <span>Completate:</span>
                        <span class="badge badge-status-completed">${employee.completedTasks}</span>
                    </div>
                    <div class="stat-row">
                        <span>In Corso:</span>
                        <span class="badge badge-status-in-progress">${employee.inProgressTasks}</span>
                    </div>
                    <div class="stat-row">
                        <span>In Ritardo:</span>
                        ${employee.overdueTasks > 0 ? 
                            `<span class="badge badge-priority-high">${employee.overdueTasks}</span>` : 
                            '<span>0</span>'}
                    </div>
                </div>
                
                <div class="employee-progress">
                    <div class="progress-label">
                        <span>Tasso Completamento</span>
                        <strong>${employee.completionRate}%</strong>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${employee.completionRate}%; background-color: ${progressColor}"></div>
                    </div>
                    <div class="progress-details">
                        <small>Tempo medio: ${employee.avgCompletionTime} giorni</small>
                        <small>Successo: ${employee.successRate}%</small>
                    </div>
                </div>
                
                <div class="employee-actions">
                    <button class="btn btn-sm btn-outline" onclick="adminStats.exportEmployeeReport('${employee.email}')">
                        <i class="fas fa-file-export"></i> Report
                    </button>
                </div>
            </div>
        `;
    }
    
    renderPerformanceTable() {
        const tbody = document.getElementById('performance-body');
        const employeeStats = this.data.employeeStats;
        
        if (employeeStats.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center">Nessun dato disponibile</td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = employeeStats.map(employee => `
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div class="user-avatar-small" style="background: ${employee.avatar.color}">
                            ${employee.avatar.initials}
                        </div>
                        <div>
                            <strong>${employee.displayName}</strong><br>
                            <small>${employee.email}</small>
                        </div>
                    </div>
                </td>
                <td><strong>${employee.assignedTasks}</strong></td>
                <td><span class="badge badge-status-completed">${employee.completedTasks}</span></td>
                <td><span class="badge badge-status-in-progress">${employee.inProgressTasks}</span></td>
                <td>
                    ${employee.overdueTasks > 0 ? 
                        `<span class="badge badge-priority-high">${employee.overdueTasks}</span>` : 
                        '<span>0</span>'}
                </td>
                <td>
                    <div class="progress" style="height: 8px; margin-bottom: 5px;">
                        <div class="progress-bar" style="width: ${employee.successRate}%; 
                            background-color: ${employee.successRate >= 80 ? this.colors.success : 
                                            employee.successRate >= 60 ? this.colors.warning : 
                                            this.colors.danger}"></div>
                    </div>
                    ${employee.successRate}%
                </td>
                <td>${employee.avgCompletionTime} giorni</td>
                <td>
                    ${employee.lastTask ? 
                        `${employee.lastTask.title}<br>
                         <small>${this.formatDateShort(employee.lastTask.updatedAt?.toDate() || new Date())}</small>` : 
                        'Nessuna task'}
                </td>
                <td>
                    ${this.getEmployeeStatus(employee)}
                </td>
            </tr>
        `).join('');
    }
    
    getEmployeeStatus(employee) {
        if (employee.assignedTasks === 0) {
            return '<span class="badge" style="background: #6c757d; color: white;">Inattivo</span>';
        }
        
        if (employee.overdueTasks > 3) {
            return '<span class="badge badge-priority-critical">Critico</span>';
        }
        
        if (employee.successRate >= 90) {
            return '<span class="badge" style="background: #28a745; color: white;">Eccellente</span>';
        }
        
        if (employee.successRate >= 70) {
            return '<span class="badge" style="background: #17a2b8; color: white;">Buono</span>';
        }
        
        if (employee.successRate >= 50) {
            return '<span class="badge" style="background: #ffc107; color: black;">Sufficiente</span>';
        }
        
        return '<span class="badge badge-priority-high">Da migliorare</span>';
    }
    
    renderCriticalTasks() {
        const tbody = document.getElementById('critical-tasks-body');
        const criticalTasks = this.data.criticalTasks || [];
        
        if (criticalTasks.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">
                        <i class="fas fa-check-circle" style="color: #28a745; margin-right: 8px;"></i>
                        Nessuna task critica o in ritardo
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = criticalTasks.map(task => `
            <tr>
                <td>
                    <strong>${task.title}</strong><br>
                    <small>${task.description.substring(0, 50)}...</small>
                </td>
                <td>${task.assignedTo}</td>
                <td>${getPriorityBadge(task.priority)}</td>
                <td>${getStatusBadge(task.status)}</td>
                <td>
                    ${task.dueDate ? formatDate(task.dueDate) : 'Nessuna scadenza'}<br>
                    <small>${this.getOverdueDays(task.dueDate)} giorni fa</small>
                </td>
                <td>
                    ${this.isTaskOverdue(task.dueDate) ? 
                        `<span class="badge badge-priority-critical">${this.getOverdueDays(task.dueDate)} giorni</span>` : 
                        '<span>0</span>'}
                </td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="window.location.href='admin-dashboard.html'">
                        <i class="fas fa-external-link-alt"></i> Gestisci
                    </button>
                </td>
            </tr>
        `).join('');
    }
    
    sortEmployeesBy(criteria) {
        const employeeStats = this.data.employeeStats;
        
        switch (criteria) {
            case 'tasks':
                employeeStats.sort((a, b) => b.assignedTasks - a.assignedTasks);
                break;
            case 'name':
                employeeStats.sort((a, b) => a.displayName.localeCompare(b.displayName));
                break;
            case 'completion':
            default:
                employeeStats.sort((a, b) => b.completionRate - a.completionRate);
        }
        
        this.renderEmployeeStats();
        this.renderPerformanceTable();
    }
    
    filterEmployees(searchTerm) {
        const allStats = this.data.employeeStats;
        const filtered = searchTerm ? 
            allStats.filter(emp => 
                emp.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.email.toLowerCase().includes(searchTerm.toLowerCase())
            ) : allStats;
        
        // Aggiorna visualizzazione temporanea
        const container = document.getElementById('employees-stats-container');
        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>Nessun dipendente trovato</h3>
                    <p>Prova con un altro nome o email</p>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="employee-stats-grid">
                    ${filtered.map(employee => this.renderEmployeeCard(employee)).join('')}
                </div>
            `;
            
            // Re-attach event listeners
            document.querySelectorAll('.view-employee-details').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const email = e.target.dataset.email;
                    this.showEmployeeDetails(email);
                });
            });
        }
    }
    
    async showEmployeeDetails(email) {
        const employee = this.data.employeeStats.find(emp => emp.email === email);
        if (!employee) return;
        
        // Ottieni tutte le task del dipendente
        const allTasks = this.data.tasks;
        const employeeTasks = allTasks.filter(task => 
            task.assignedTo === email || task.createdBy === email
        );
        
        // Task completate recentemente
        const recentCompleted = employeeTasks
            .filter(t => t.status === 'completed')
            .sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0))
            .slice(0, 5);
        
        // Task in ritardo
        const overdueTasks = employeeTasks.filter(t => 
            this.isTaskOverdue(t.dueDate) && t.status !== 'completed'
        );
        
        // Task per priorità
        const priorityStats = {
            critical: employeeTasks.filter(t => t.priority === 'critical').length,
            high: employeeTasks.filter(t => t.priority === 'high').length,
            medium: employeeTasks.filter(t => t.priority === 'medium').length,
            low: employeeTasks.filter(t => t.priority === 'low').length
        };
        
        const modalContent = `
            <div class="employee-detail-modal">
                <div class="employee-detail-header">
                    <div class="employee-detail-avatar" style="background: ${employee.avatar.color}">
                        ${employee.avatar.initials}
                    </div>
                    <div class="employee-detail-info">
                        <h3>${employee.displayName}</h3>
                        <p>${employee.email}</p>
                        <div class="employee-detail-stats">
                            <span class="stat-badge">${employee.assignedTasks} Task</span>
                            <span class="stat-badge" style="background: ${employee.successRate >= 80 ? '#28a745' : 
                                employee.successRate >= 60 ? '#ffc107' : '#dc3545'}; color: white;">
                                ${employee.successRate}% Successo
                            </span>
                            <span class="stat-badge">${employee.avgCompletionTime} giorni medi</span>
                        </div>
                    </div>
                </div>
                
                <div class="employee-detail-grid">
                    <div class="detail-card">
                        <h4><i class="fas fa-chart-pie"></i> Performance Generale</h4>
                        <div class="detail-stats">
                            <div class="detail-stat">
                                <span>Task Assegnate</span>
                                <strong>${employee.assignedTasks}</strong>
                            </div>
                            <div class="detail-stat">
                                <span>Completate</span>
                                <strong style="color: #28a745;">${employee.completedTasks}</strong>
                            </div>
                            <div class="detail-stat">
                                <span>In Corso</span>
                                <strong style="color: #17a2b8;">${employee.inProgressTasks}</strong>
                            </div>
                            <div class="detail-stat">
                                <span>In Ritardo</span>
                                <strong style="color: #dc3545;">${employee.overdueTasks}</strong>
                            </div>
                        </div>
                    </div>
                    
                    <div class="detail-card">
                        <h4><i class="fas fa-layer-group"></i> Task per Priorità</h4>
                        <div class="priority-stats">
                            <div class="priority-stat">
                                <span class="badge badge-priority-critical">Critica</span>
                                <strong>${priorityStats.critical}</strong>
                            </div>
                            <div class="priority-stat">
                                <span class="badge badge-priority-high">Alta</span>
                                <strong>${priorityStats.high}</strong>
                            </div>
                            <div class="priority-stat">
                                <span class="badge badge-priority-medium">Media</span>
                                <strong>${priorityStats.medium}</strong>
                            </div>
                            <div class="priority-stat">
                                <span class="badge badge-priority-low">Bassa</span>
                                <strong>${priorityStats.low}</strong>
                            </div>
                        </div>
                    </div>
                    
                    <div class="detail-card full-width">
                        <h4><i class="fas fa-history"></i> Ultime Task Completate</h4>
                        ${recentCompleted.length > 0 ? 
                            `<div class="recent-tasks">
                                ${recentCompleted.map(task => `
                                    <div class="recent-task">
                                        <div class="recent-task-info">
                                            <strong>${task.title}</strong>
                                            <small>Completata: ${formatDate(task.updatedAt)}</small>
                                        </div>
                                        ${getPriorityBadge(task.priority)}
                                    </div>
                                `).join('')}
                            </div>` :
                            '<p class="text-muted">Nessuna task completata recentemente</p>'
                        }
                    </div>
                    
                    <div class="detail-card full-width">
                        <h4><i class="fas fa-exclamation-triangle"></i> Task in Ritardo</h4>
                        ${overdueTasks.length > 0 ? 
                            `<div class="overdue-tasks">
                                ${overdueTasks.map(task => `
                                    <div class="overdue-task">
                                        <div class="overdue-task-info">
                                            <strong>${task.title}</strong>
                                            <small>In ritardo da: ${this.getOverdueDays(task.dueDate)} giorni</small>
                                        </div>
                                        <span class="badge badge-priority-critical">
                                            ${this.getOverdueDays(task.dueDate)} giorni
                                        </span>
                                    </div>
                                `).join('')}
                            </div>` :
                            '<p class="text-success"><i class="fas fa-check-circle"></i> Nessuna task in ritardo</p>'
                        }
                    </div>
                </div>
                
                <div class="employee-detail-actions">
                    <button class="btn btn-primary" onclick="adminStats.exportEmployeeReport('${email}')">
                        <i class="fas fa-file-pdf"></i> Genera Report PDF
                    </button>
                    <button class="btn btn-outline" onclick="adminStats.exportEmployeeExcel('${email}')">
                        <i class="fas fa-file-excel"></i> Esporta Excel
                    </button>
                </div>
            </div>
        `;
        
        document.getElementById('employee-modal-title').textContent = `Report: ${employee.displayName}`;
        document.getElementById('employee-detail-content').innerHTML = modalContent;
        document.getElementById('employee-detail-modal').classList.add('show');
    }
    
    initializeMonthSelector() {
        const select = document.getElementById('month-select');
        const currentDate = new Date();
        
        // Genera opzioni per ultimi 12 mesi
        for (let i = 0; i < 12; i++) {
            const date = new Date(currentDate);
            date.setMonth(currentDate.getMonth() - i);
            
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const value = `${year}-${month}`;
            const label = date.toLocaleDateString('it-IT', { 
                month: 'long', 
                year: 'numeric' 
            });
            
            const option = document.createElement('option');
            option.value = value;
            option.textContent = label.charAt(0).toUpperCase() + label.slice(1);
            
            if (i === 0) {
                option.selected = true;
            }
            
            select.appendChild(option);
        }
    }
    
    async loadMonthlyReport(month) {
        const container = document.getElementById('monthly-report-container');
        container.innerHTML = '<div class="spinner"></div>';
        
        try {
            // Filtra task del mese
            const [year, monthNum] = month.split('-').map(Number);
            const startDate = new Date(year, monthNum - 1, 1);
            const endDate = new Date(year, monthNum, 0, 23, 59, 59);
            
            const monthlyTasks = this.data.tasks.filter(task => {
                const taskDate = task.createdAt?.toDate ? task.createdAt.toDate() : new Date(task.createdAt);
                return taskDate >= startDate && taskDate <= endDate;
            });
            
            // Calcola statistiche mensili
            const monthlyStats = await this.calculateMonthlyStats(monthlyTasks, month);
            
            // Renderizza report
            this.renderMonthlyReport(monthlyStats, month);
            
        } catch (error) {
            console.error('Errore caricamento report mensile:', error);
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-circle"></i>
                    <h3>Errore nel caricamento del report</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }
    
    async calculateMonthlyStats(tasks, month) {
        const employees = this.data.employees;
        
        const stats = {
            month: month,
            totalTasks: tasks.length,
            completedTasks: tasks.filter(t => t.status === 'completed').length,
            completionRate: tasks.length > 0 ? 
                Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0,
            overdueTasks: tasks.filter(t => this.isTaskOverdue(t.dueDate) && t.status !== 'completed').length,
            employeeStats: []
        };
        
        for (const employee of employees) {
            const employeeTasks = tasks.filter(task => task.assignedTo === employee.email);
            const completed = employeeTasks.filter(t => t.status === 'completed').length;
            
            stats.employeeStats.push({
                name: employee.displayName || employee.email.split('@')[0],
                email: employee.email,
                assignedTasks: employeeTasks.length,
                completedTasks: completed,
                completionRate: employeeTasks.length > 0 ? Math.round((completed / employeeTasks.length) * 100) : 0,
                overdueTasks: employeeTasks.filter(t => this.isTaskOverdue(t.dueDate) && t.status !== 'completed').length
            });
        }
        
        // Ordina per task assegnate
        stats.employeeStats.sort((a, b) => b.assignedTasks - a.assignedTasks);
        
        return stats;
    }
    
    renderMonthlyReport(stats, month) {
        const container = document.getElementById('monthly-report-container');
        
        const monthLabel = new Date(`${month}-01`).toLocaleDateString('it-IT', { 
            month: 'long', 
            year: 'numeric' 
        });
        
        container.innerHTML = `
            <div class="monthly-report">
                <div class="monthly-report-header">
                    <h3>Report ${monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}</h3>
                    <div class="report-summary">
                        <div class="summary-item">
                            <span>Task Totali</span>
                            <strong>${stats.totalTasks}</strong>
                        </div>
                        <div class="summary-item">
                            <span>Completate</span>
                            <strong style="color: #28a745;">${stats.completedTasks}</strong>
                        </div>
                        <div class="summary-item">
                            <span>Tasso Completamento</span>
                            <strong>${stats.completionRate}%</strong>
                        </div>
                        <div class="summary-item">
                            <span>In Ritardo</span>
                            <strong style="color: #dc3545;">${stats.overdueTasks}</strong>
                        </div>
                    </div>
                </div>
                
                <div class="monthly-report-table">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Dipendente</th>
                                <th>Task Assegnate</th>
                                <th>Task Completate</th>
                                <th>Tasso Completamento</th>
                                <th>Task in Ritardo</th>
                                <th>Performance</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${stats.employeeStats.map(emp => `
                                <tr>
                                    <td>${emp.name}</td>
                                    <td>${emp.assignedTasks}</td>
                                    <td>${emp.completedTasks}</td>
                                    <td>
                                        <div class="progress" style="height: 6px;">
                                            <div class="progress-bar" style="width: ${emp.completionRate}%;
                                                background-color: ${emp.completionRate >= 80 ? '#28a745' : 
                                                                emp.completionRate >= 60 ? '#ffc107' : '#dc3545'}">
                                            </div>
                                        </div>
                                        ${emp.completionRate}%
                                    </td>
                                    <td>${emp.overdueTasks}</td>
                                    <td>
                                        ${this.getPerformanceBadge(emp.completionRate)}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div class="monthly-report-notes">
                    <h4>Note Mensili:</h4>
                    <ul>
                        ${this.generateMonthlyNotes(stats)}
                    </ul>
                </div>
            </div>
        `;
    }
    
    getPerformanceBadge(rate) {
        if (rate >= 90) return '<span class="badge" style="background: #28a745; color: white;">Eccellente</span>';
        if (rate >= 80) return '<span class="badge" style="background: #20c997; color: white;">Molto Buona</span>';
        if (rate >= 70) return '<span class="badge" style="background: #17a2b8; color: white;">Buona</span>';
        if (rate >= 60) return '<span class="badge" style="background: #ffc107; color: black;">Sufficiente</span>';
        return '<span class="badge" style="background: #dc3545; color: white;">Da Migliorare</span>';
    }
    
    generateMonthlyNotes(stats) {
        const notes = [];
        
        if (stats.completionRate >= 90) {
            notes.push('Mese eccellente! Ottimo lavoro di tutto il team.');
        } else if (stats.completionRate >= 80) {
            notes.push('Buona performance complessiva del team.');
        } else if (stats.completionRate < 70) {
            notes.push('Attenzione: tasso di completamento sotto la media.');
        }
        
        if (stats.overdueTasks > 5) {
            notes.push(`Attenzione: ${stats.overdueTasks} task in ritardo. Necessario intervento.`);
        }
        
        const topPerformer = stats.employeeStats.reduce((prev, current) => 
            (prev.completedTasks > current.completedTasks) ? prev : current
        );
        
        if (topPerformer.assignedTasks > 0) {
            notes.push(`Top performer del mese: ${topPerformer.name} con ${topPerformer.completedTasks} task completate.`);
        }
        
        if (notes.length === 0) {
            notes.push('Mese nella media. Nessuna anomalia rilevata.');
        }
        
        return notes.map(note => `<li>${note}</li>`).join('');
    }
    
    // ==============================
    // ESPORTAZIONE EXCEL
    // ==============================
    
    exportToExcel() {
        try {
            // Crea workbook
            const wb = XLSX.utils.book_new();
            
            // Sheet 1: Statistiche Globali
            const globalData = [
                ['STATISTICHE GLOBALI', ''],
                ['Data Report', new Date().toLocaleDateString('it-IT')],
                ['Periodo', document.getElementById('current-period').textContent],
                ['', ''],
                ['Metrica', 'Valore'],
                ['Utenti Totali', this.data.stats.totalUsers],
                ['Dipendenti', this.data.stats.totalEmployees],
                ['Task Totali', this.data.stats.totalTasks],
                ['Task Completate', this.data.stats.completedTasks],
                ['Task in Corso', this.data.stats.inProgressTasks],
                ['Task in Ritardo', this.data.stats.overdueTasks],
                ['Tasso Completamento', `${this.data.stats.completionRate}%`],
                ['Giorni medi completamento', this.data.stats.avgCompletionDays],
                ['Top Performer', this.data.stats.topPerformer]
            ];
            
            const ws1 = XLSX.utils.aoa_to_sheet(globalData);
            XLSX.utils.book_append_sheet(wb, ws1, 'Statistiche Globali');
            
            // Sheet 2: Performance Dipendenti
            const employeeData = [
                ['PERFORMANCE DIPENDENTI', '', '', '', '', '', '', '', ''],
                ['Dipendente', 'Email', 'Task Assegnate', 'Task Completate', 'Task in Corso', 
                 'Task in Ritardo', 'Task Fallite', 'Tasso Successo', 'Tempo Medio (giorni)', 'Stato']
            ];
            
            this.data.employeeStats.forEach(emp => {
                employeeData.push([
                    emp.displayName,
                    emp.email,
                    emp.assignedTasks,
                    emp.completedTasks,
                    emp.inProgressTasks,
                    emp.overdueTasks,
                    emp.failedTasks,
                    `${emp.successRate}%`,
                    emp.avgCompletionTime,
                    this.getEmployeeStatus(emp)
                ]);
            });
            
            const ws2 = XLSX.utils.aoa_to_sheet(employeeData);
            XLSX.utils.book_append_sheet(wb, ws2, 'Performance Dipendenti');
            
            // Sheet 3: Task Critiche
            const criticalData = [
                ['TASK CRITICHE E IN RITARDO', '', '', '', '', '', ''],
                ['Task', 'Dipendente', 'Priorità', 'Stato', 'Scadenza', 'Giorni Ritardo', 'Creato il']
            ];
            
            this.data.criticalTasks.forEach(task => {
                criticalData.push([
                    task.title,
                    task.assignedTo,
                    task.priority,
                    task.status,
                    task.dueDate ? formatDate(task.dueDate) : 'N/A',
                    this.getOverdueDays(task.dueDate),
                    task.createdAt ? formatDate(task.createdAt) : 'N/A'
                ]);
            });
            
            const ws3 = XLSX.utils.aoa_to_sheet(criticalData);
            XLSX.utils.book_append_sheet(wb, ws3, 'Task Critiche');
            
            // Sheet 4: Distribuzione Task
            const tasks = this.data.filteredTasks;
            const distributionData = [
                ['DISTRIBUZIONE TASK', '', ''],
                ['Categoria', 'Conteggio', 'Percentuale'],
                ['Completate', tasks.filter(t => t.status === 'completed').length],
                ['In Corso', tasks.filter(t => t.status === 'in-progress').length],
                ['In Attesa', tasks.filter(t => t.status === 'pending').length],
                ['In Ritardo', tasks.filter(t => this.isTaskOverdue(t.dueDate) && t.status !== 'completed').length]
            ];
            
            const ws4 = XLSX.utils.aoa_to_sheet(distributionData);
            XLSX.utils.book_append_sheet(wb, ws4, 'Distribuzione');
            
            // Salva file
            const filename = `statistiche_aziendali_${new Date().toISOString().slice(0, 10)}.xlsx`;
            XLSX.writeFile(wb, filename);
            
            showNotification('Esportazione Excel completata!', 'success');
            
        } catch (error) {
            console.error('Errore esportazione Excel:', error);
            showNotification('Errore nell\'esportazione Excel', 'error');
        }
    }
    
    exportPerformanceToExcel() {
        try {
            const wb = XLSX.utils.book_new();
            
            const header = [
                ['REPORT PERFORMANCE DIPENDENTI', '', '', '', '', '', '', '', ''],
                ['Data Generazione', new Date().toLocaleDateString('it-IT'), '', 'Periodo', document.getElementById('current-period').textContent],
                ['', '', '', '', '', '', '', '', ''],
                ['Dipendente', 'Email', 'Task Assegnate', 'Task Completate', 'Task in Corso', 
                 'Task in Ritardo', 'Task Fallite', 'Tasso Successo', 'Tempo Medio (giorni)', 'Stato', 'Ultima Attività']
            ];
            
            const data = [...header];
            
            this.data.employeeStats.forEach(emp => {
                data.push([
                    emp.displayName,
                    emp.email,
                    emp.assignedTasks,
                    emp.completedTasks,
                    emp.inProgressTasks,
                    emp.overdueTasks,
                    emp.failedTasks,
                    `${emp.successRate}%`,
                    emp.avgCompletionTime,
                    this.getEmployeeStatus(emp),
                    emp.lastTask ? 
                        `${emp.lastTask.title} (${formatDate(emp.lastTask.updatedAt)})` : 
                        'Nessuna attività'
                ]);
            });
            
            // Aggiungi totale
            data.push([]);
            data.push([
                'TOTALE',
                '',
                this.data.employeeStats.reduce((sum, emp) => sum + emp.assignedTasks, 0),
                this.data.employeeStats.reduce((sum, emp) => sum + emp.completedTasks, 0),
                this.data.employeeStats.reduce((sum, emp) => sum + emp.inProgressTasks, 0),
                this.data.employeeStats.reduce((sum, emp) => sum + emp.overdueTasks, 0),
                this.data.employeeStats.reduce((sum, emp) => sum + emp.failedTasks, 0),
                `${Math.round(this.data.employeeStats.reduce((sum, emp) => sum + emp.successRate, 0) / this.data.employeeStats.length)}%`,
                Math.round(this.data.employeeStats.reduce((sum, emp) => sum + emp.avgCompletionTime, 0) / this.data.employeeStats.length),
                '',
                ''
            ]);
            
            const ws = XLSX.utils.aoa_to_sheet(data);
            XLSX.utils.book_append_sheet(wb, ws, 'Performance Dipendenti');
            
            // Aggiungi formattazione
            ws['!cols'] = [
                { wch: 20 }, { wch: 25 }, { wch: 15 }, 
                { wch: 15 }, { wch: 12 }, { wch: 12 },
                { wch: 12 }, { wch: 15 }, { wch: 18 },
                { wch: 15 }, { wch: 30 }
            ];
            
            const filename = `performance_dipendenti_${new Date().toISOString().slice(0, 10)}.xlsx`;
            XLSX.writeFile(wb, filename);
            
            showNotification('Esportazione performance Excel completata!', 'success');
            
        } catch (error) {
            console.error('Errore esportazione performance Excel:', error);
            showNotification('Errore nell\'esportazione Excel', 'error');
        }
    }
    
    exportEmployeeExcel(email) {
        const employee = this.data.employeeStats.find(emp => emp.email === email);
        if (!employee) {
            showNotification('Dipendente non trovato', 'error');
            return;
        }
        
        try {
            const wb = XLSX.utils.book_new();
            
            // Sheet 1: Dettaglio Dipendente
            const detailData = [
                ['REPORT INDIVIDUALE DIPENDENTE', '', ''],
                ['Dipendente', employee.displayName, ''],
                ['Email', employee.email, ''],
                ['Data Report', new Date().toLocaleDateString('it-IT'), ''],
                ['', '', ''],
                ['METRICA', 'VALORE', 'NOTE'],
                ['Task Assegnate', employee.assignedTasks, ''],
                ['Task Completate', employee.completedTasks, `${employee.completionRate}% delle assegnate`],
                ['Task in Corso', employee.inProgressTasks, ''],
                ['Task in Ritardo', employee.overdueTasks, employee.overdueTasks > 0 ? 'Attenzione necessaria' : 'Nessun ritardo'],
                ['Task Fallite', employee.failedTasks, ''],
                ['Tasso di Successo', `${employee.successRate}%`, employee.successRate >= 80 ? 'Eccellente' : 
                    employee.successRate >= 60 ? 'Buono' : 'Da migliorare'],
                ['Tempo Medio Completamento', `${employee.avgCompletionTime} giorni`, ''],
                ['Ultima Attività', employee.lastTask ? 
                    `${employee.lastTask.title} (${formatDate(employee.lastTask.updatedAt)})` : 'Nessuna attività', '']
            ];
            
            const ws1 = XLSX.utils.aoa_to_sheet(detailData);
            XLSX.utils.book_append_sheet(wb, ws1, 'Dettaglio Dipendente');
            
            // Sheet 2: Task del Dipendente
            const allTasks = this.data.tasks;
            const employeeTasks = allTasks.filter(task => 
                task.assignedTo === email || task.createdBy === email
            );
            
            const tasksData = [
                ['TASK DEL DIPENDENTE', '', '', '', '', '', '', ''],
                ['Task', 'Descrizione', 'Stato', 'Priorità', 'Data Creazione', 'Data Scadenza', 
                 'Giorni Ritardo', 'Assegnata/Creata']
            ];
            
            employeeTasks.forEach(task => {
                tasksData.push([
                    task.title,
                    task.description,
                    task.status,
                    task.priority,
                    task.createdAt ? formatDate(task.createdAt) : 'N/A',
                    task.dueDate ? formatDate(task.dueDate) : 'N/A',
                    this.getOverdueDays(task.dueDate),
                    task.assignedTo === email ? 'Assegnata' : 'Creata'
                ]);
            });
            
            const ws2 = XLSX.utils.aoa_to_sheet(tasksData);
            XLSX.utils.book_append_sheet(wb, ws2, 'Task Dipendente');
            
            // Formattazione
            ws1['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 40 }];
            ws2['!cols'] = [{ wch: 25 }, { wch: 40 }, { wch: 15 }, 
                          { wch: 12 }, { wch: 20 }, { wch: 20 }, 
                          { wch: 15 }, { wch: 15 }];
            
            const filename = `report_${employee.displayName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
            XLSX.writeFile(wb, filename);
            
            showNotification(`Report Excel per ${employee.displayName} generato!`, 'success');
            
        } catch (error) {
            console.error('Errore esportazione report dipendente:', error);
            showNotification('Errore nell\'esportazione del report', 'error');
        }
    }
    
    // ==============================
    // ESPORTAZIONE PDF
    // ==============================
    
    exportToPDF() {
        showNotification('Generazione PDF in corso...', 'info');
        
        // Usa html2canvas per catturare la dashboard
        html2canvas(document.querySelector('.main-content')).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jspdf.jsPDF('p', 'mm', 'a4');
            const imgWidth = 210;
            const pageHeight = 295;
            const imgHeight = canvas.height * imgWidth / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;
            
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
            
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }
            
            const filename = `statistiche_aziendali_${new Date().toISOString().slice(0, 10)}.pdf`;
            pdf.save(filename);
            
            showNotification('Esportazione PDF completata!', 'success');
        }).catch(error => {
            console.error('Errore generazione PDF:', error);
            showNotification('Errore nella generazione del PDF', 'error');
        });
    }
    
    exportEmployeeReport(email) {
        showNotification('Generazione report PDF...', 'info');
        
        // Trova il dipendente
        const employee = this.data.employeeStats.find(emp => emp.email === email);
        if (!employee) {
            showNotification('Dipendente non trovato', 'error');
            return;
        }
        
        // Crea contenuto HTML per il report
        const reportContent = this.generateEmployeeReportHTML(employee);
        
        // Crea un elemento temporaneo per la conversione
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = reportContent;
        tempDiv.style.padding = '20px';
        tempDiv.style.fontFamily = 'Inter, sans-serif';
        document.body.appendChild(tempDiv);
        
        // Genera PDF
        html2canvas(tempDiv).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jspdf.jsPDF('p', 'mm', 'a4');
            const imgWidth = 190;
            const imgHeight = canvas.height * imgWidth / canvas.width;
            
            pdf.setFontSize(16);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Report Dipendente', 105, 15, { align: 'center' });
            
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`Dipendente: ${employee.displayName}`, 20, 25);
            pdf.text(`Email: ${employee.email}`, 20, 32);
            pdf.text(`Data Report: ${new Date().toLocaleDateString('it-IT')}`, 20, 39);
            
            pdf.addImage(imgData, 'PNG', 10, 45, imgWidth, imgHeight);
            
            const filename = `report_${employee.displayName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
            pdf.save(filename);
            
            // Rimuovi elemento temporaneo
            document.body.removeChild(tempDiv);
            
            showNotification(`Report PDF per ${employee.displayName} generato!`, 'success');
        }).catch(error => {
            console.error('Errore generazione report PDF:', error);
            document.body.removeChild(tempDiv);
            showNotification('Errore nella generazione del report PDF', 'error');
        });
    }
    
    generateEmployeeReportHTML(employee) {
        return `
            <div style="max-width: 800px; margin: 0 auto;">
                <h1 style="color: #4361ee; border-bottom: 2px solid #4361ee; padding-bottom: 10px;">
                    Report Dipendente
                </h1>
                
                <div style="display: flex; align-items: center; gap: 20px; margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                    <div style="width: 60px; height: 60px; border-radius: 50%; background: ${employee.avatar.color}; 
                         display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 20px;">
                        ${employee.avatar.initials}
                    </div>
                    <div>
                        <h2 style="margin: 0; color: #333;">${employee.displayName}</h2>
                        <p style="margin: 5px 0; color: #666;">${employee.email}</p>
                    </div>
                </div>
                
                <h3 style="color: #4361ee; margin-top: 30px;">Performance Generale</h3>
                <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
                    <tr style="background: #f8f9fa;">
                        <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Metrica</th>
                        <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Valore</th>
                        <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Note</th>
                    </tr>
                    <tr>
                        <td style="padding: 12px; border: 1px solid #ddd;">Task Assegnate</td>
                        <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">${employee.assignedTasks}</td>
                        <td style="padding: 12px; border: 1px solid #ddd;"></td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; border: 1px solid #ddd;">Task Completate</td>
                        <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; color: #28a745;">${employee.completedTasks}</td>
                        <td style="padding: 12px; border: 1px solid #ddd;">${employee.completionRate}% delle assegnate</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; border: 1px solid #ddd;">Task in Corso</td>
                        <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; color: #17a2b8;">${employee.inProgressTasks}</td>
                        <td style="padding: 12px; border: 1px solid #ddd;"></td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; border: 1px solid #ddd;">Task in Ritardo</td>
                        <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; color: #dc3545;">${employee.overdueTasks}</td>
                        <td style="padding: 12px; border: 1px solid #ddd;">
                            ${employee.overdueTasks > 0 ? 'Attenzione necessaria' : 'Nessun ritardo'}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; border: 1px solid #ddd;">Tasso di Successo</td>
                        <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">
                            <span style="color: ${employee.successRate >= 80 ? '#28a745' : 
                                            employee.successRate >= 60 ? '#ffc107' : '#dc3545'}">
                                ${employee.successRate}%
                            </span>
                        </td>
                        <td style="padding: 12px; border: 1px solid #ddd;">
                            ${employee.successRate >= 80 ? 'Eccellente' : 
                              employee.successRate >= 60 ? 'Buono' : 'Da migliorare'}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; border: 1px solid #ddd;">Tempo Medio Completamento</td>
                        <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">${employee.avgCompletionTime} giorni</td>
                        <td style="padding: 12px; border: 1px solid #ddd;"></td>
                    </tr>
                </table>
                
                <div style="margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                    <h4 style="color: #4361ee; margin-top: 0;">Valutazione:</h4>
                    <p>${this.generateEmployeeEvaluation(employee)}</p>
                </div>
                
                <div style="text-align: center; color: #666; font-size: 12px; margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd;">
                    <p>Report generato automaticamente il ${new Date().toLocaleDateString('it-IT')} alle ${new Date().toLocaleTimeString('it-IT')}</p>
                    <p>Task Manager - Sistema di gestione task aziendale</p>
                </div>
            </div>
        `;
    }
    
    generateEmployeeEvaluation(employee) {
        if (employee.successRate >= 90) {
            return 'Performance eccellente. Il dipendente mostra una grande efficienza e affidabilità nel completamento delle task assegnate.';
        } else if (employee.successRate >= 80) {
            return 'Performance molto buona. Il dipendente è affidabile e consegna buoni risultati.';
        } else if (employee.successRate >= 70) {
            return 'Performance buona. Il dipendente svolge il proprio lavoro in modo adeguato.';
        } else if (employee.successRate >= 60) {
            return 'Performance sufficiente. Ci sono margini di miglioramento nel completamento delle task.';
        } else if (employee.successRate >= 50) {
            return 'Performance sotto la media. Necessario monitoraggio e supporto.';
        } else {
            return 'Performance critica. Richiesto intervento immediato e valutazione delle criticità.';
        }
    }
    
    exportMonthlyReport() {
        const monthSelect = document.getElementById('month-select');
        const selectedMonth = monthSelect.value;
        const monthLabel = monthSelect.options[monthSelect.selectedIndex].text;
        
        showNotification(`Generazione report PDF per ${monthLabel}...`, 'info');
        
        // Genera contenuto HTML per il report mensile
        const reportHTML = this.generateMonthlyReportHTML(selectedMonth, monthLabel);
        
        // Crea elemento temporaneo
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = reportHTML;
        tempDiv.style.padding = '20px';
        tempDiv.style.fontFamily = 'Inter, sans-serif';
        document.body.appendChild(tempDiv);
        
        // Genera PDF
        html2canvas(tempDiv).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jspdf.jsPDF('p', 'mm', 'a4');
            const imgWidth = 190;
            const imgHeight = canvas.height * imgWidth / canvas.width;
            
            pdf.setFontSize(16);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Report Mensile', 105, 15, { align: 'center' });
            
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`Periodo: ${monthLabel}`, 20, 25);
            pdf.text(`Data Generazione: ${new Date().toLocaleDateString('it-IT')}`, 20, 32);
            
            pdf.addImage(imgData, 'PNG', 10, 40, imgWidth, imgHeight);
            
            const filename = `report_mensile_${selectedMonth}.pdf`;
            pdf.save(filename);
            
            document.body.removeChild(tempDiv);
            showNotification(`Report PDF mensile per ${monthLabel} generato!`, 'success');
        }).catch(error => {
            console.error('Errore generazione report mensile PDF:', error);
            document.body.removeChild(tempDiv);
            showNotification('Errore nella generazione del report mensile PDF', 'error');
        });
    }
    
    async generateMonthlyReportHTML(month, monthLabel) {
        // Ricarica statistiche per il mese selezionato
        const [year, monthNum] = month.split('-').map(Number);
        const startDate = new Date(year, monthNum - 1, 1);
        const endDate = new Date(year, monthNum, 0, 23, 59, 59);
        
        const monthlyTasks = this.data.tasks.filter(task => {
            const taskDate = task.createdAt?.toDate ? task.createdAt.toDate() : new Date(task.createdAt);
            return taskDate >= startDate && taskDate <= endDate;
        });
        
        const stats = await this.calculateMonthlyStats(monthlyTasks, month);
        
        return `
            <div style="max-width: 800px; margin: 0 auto;">
                <h1 style="color: #4361ee; border-bottom: 2px solid #4361ee; padding-bottom: 10px;">
                    Report Mensile - ${monthLabel}
                </h1>
                
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0;">
                    <div style="padding: 15px; background: #f8f9fa; border-radius: 8px; text-align: center;">
                        <h3 style="margin: 0; color: #333;">${stats.totalTasks}</h3>
                        <p style="margin: 5px 0; color: #666;">Task Totali</p>
                    </div>
                    <div style="padding: 15px; background: #f8f9fa; border-radius: 8px; text-align: center;">
                        <h3 style="margin: 0; color: #28a745;">${stats.completedTasks}</h3>
                        <p style="margin: 5px 0; color: #666;">Task Completate</p>
                    </div>
                    <div style="padding: 15px; background: #f8f9fa; border-radius: 8px; text-align: center;">
                        <h3 style="margin: 0; color: #dc3545;">${stats.overdueTasks}</h3>
                        <p style="margin: 5px 0; color: #666;">Task in Ritardo</p>
                    </div>
                    <div style="padding: 15px; background: #f8f9fa; border-radius: 8px; text-align: center;">
                        <h3 style="margin: 0; color: #ffc107;">${stats.completionRate}%</h3>
                        <p style="margin: 5px 0; color: #666;">Tasso Completamento</p>
                    </div>
                </div>
                
                <h3 style="color: #4361ee; margin-top: 30px;">Performance Dipendenti</h3>
                <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
                    <thead>
                        <tr style="background: #4361ee; color: white;">
                            <th style="padding: 12px; text-align: left;">Dipendente</th>
                            <th style="padding: 12px; text-align: left;">Task Assegnate</th>
                            <th style="padding: 12px; text-align: left;">Task Completate</th>
                            <th style="padding: 12px; text-align: left;">Tasso Completamento</th>
                            <th style="padding: 12px; text-align: left;">Performance</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${stats.employeeStats.map(emp => `
                            <tr>
                                <td style="padding: 12px; border: 1px solid #ddd;">${emp.name}</td>
                                <td style="padding: 12px; border: 1px solid #ddd;">${emp.assignedTasks}</td>
                                <td style="padding: 12px; border: 1px solid #ddd;">${emp.completedTasks}</td>
                                <td style="padding: 12px; border: 1px solid #ddd;">
                                    <div style="background: #e9ecef; height: 6px; border-radius: 3px; margin: 5px 0;">
                                        <div style="background: ${emp.completionRate >= 80 ? '#28a745' : 
                                                              emp.completionRate >= 60 ? '#ffc107' : '#dc3545'}; 
                                             height: 100%; width: ${emp.completionRate}%; border-radius: 3px;"></div>
                                    </div>
                                    ${emp.completionRate}%
                                </td>
                                <td style="padding: 12px; border: 1px solid #ddd;">
                                    <span style="display: inline-block; padding: 3px 8px; border-radius: 12px; 
                                          background: ${emp.completionRate >= 80 ? '#28a745' : 
                                                     emp.completionRate >= 60 ? '#ffc107' : '#dc3545'}; 
                                          color: ${emp.completionRate >= 60 ? 'white' : 'white'}; 
                                          font-size: 12px;">
                                        ${emp.completionRate >= 80 ? 'Eccellente' : 
                                         emp.completionRate >= 60 ? 'Buona' : 'Da Migliorare'}
                                    </span>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div style="margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                    <h4 style="color: #4361ee; margin-top: 0;">Analisi del Mese:</h4>
                    <ul>
                        ${this.generateMonthlyNotes(stats).replace(/<li>/g, '<li style="margin-bottom: 8px;">')}
                    </ul>
                </div>
                
                <div style="text-align: center; color: #666; font-size: 12px; margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd;">
                    <p>Report generato automaticamente il ${new Date().toLocaleDateString('it-IT')}</p>
                    <p>Task Manager - Sistema di gestione task aziendale</p>
                </div>
            </div>
        `;
    }
    
    formatDateShort(date) {
        if (!date) return 'N/A';
        const d = date instanceof Date ? date : new Date(date);
        return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
    }
    
    formatRelativeTime(date) {
        if (!date) return 'N/A';
        
        const now = new Date();
        const d = date instanceof Date ? date : new Date(date);
        const diffTime = Math.abs(now - d);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return 'Oggi';
        } else if (diffDays === 1) {
            return 'Ieri';
        } else if (diffDays < 7) {
            return `${diffDays} giorni fa`;
        } else if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7);
            return `${weeks} settimana${weeks > 1 ? 'e' : ''} fa`;
        } else {
            return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
        }
    }
}
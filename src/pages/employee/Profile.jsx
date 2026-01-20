import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTasks } from '../../hooks/useTasks';
import { getUserStatistics, updateProfile } from '../../services/api/users';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import Input from '../../components/forms/Input';
import Select from '../../components/forms/Select';
import { 
  getRoleName, 
  getDepartmentName,
  getRoleIcon,
  getDepartmentIcon,
  DEPARTMENTS,
  DEPARTMENT_OPTIONS
} from '../../constants/roles';
import { TASK_STATUS } from '../../constants/statuses';

const EmployeeProfile = () => {
  const { user, updateUser: updateAuthUser } = useAuth();
  const { stats: taskStats } = useTasks();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [userStats, setUserStats] = useState(null);
  
  const [editMode, setEditMode] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    phone: '',
    bio: '',
    avatar: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Carica dati profilo
  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Imposta dati utente nel form
        setFormData({
          name: user.name || user.displayName || '',
          email: user.email || '',
          department: user.department || DEPARTMENTS.GENERALE,
          phone: user.phone || '',
          bio: user.bio || '',
          avatar: user.avatar || ''
        });
        
        // Carica statistiche utente
        if (user.uid) {
          const statsResult = await getUserStatistics(user.uid);
          if (statsResult.success) {
            setUserStats(statsResult.data);
          }
        }
        
      } catch (error) {
        console.error('Error loading profile:', error);
        setError('Errore nel caricamento del profilo');
      } finally {
        setLoading(false);
      }
    };
    
    loadProfileData();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    if (!user?.uid) return;
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      const result = await updateProfile(user.uid, formData);
      
      if (result.success) {
        setSuccess('Profilo aggiornato con successo');
        setEditMode(false);
        
        // Aggiorna l'utente nel context auth
        updateAuthUser(formData);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Errore durante il salvataggio del profilo');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    // Validazione
    if (passwordData.newPassword.length < 6) {
      setError('La nuova password deve contenere almeno 6 caratteri');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Le password non coincidono');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      // Qui dovresti implementare la logica per cambiare la password
      // usando Firebase Auth o il tuo backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulazione
      
      setSuccess('Password cambiata con successo');
      setShowChangePassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
    } catch (error) {
      console.error('Error changing password:', error);
      setError('Errore durante il cambio password');
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non disponibile';
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading && !user) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
        <LoadingSpinner size="lg" message="Caricamento profilo..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="alert alert-danger">
        <h4>Utente non autenticato</h4>
        <p>Devi essere loggato per visualizzare questa pagina</p>
        <Button variant="primary" onClick={() => window.location.href = '/login'}>
          Accedi
        </Button>
      </div>
    );
  }

  return (
    <div className="employee-profile-container">
      {/* Header profilo */}
      <div className="profile-header mb-5">
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <h1 className="h2 mb-2">Il Mio Profilo</h1>
            <p className="text-muted mb-0">
              Gestisci le tue informazioni personali e le preferenze
            </p>
          </div>
          
          <div>
            {!editMode ? (
              <Button variant="primary" onClick={() => setEditMode(true)}>
                <i className="fas fa-edit me-2"></i>
                Modifica Profilo
              </Button>
            ) : (
              <div className="d-flex gap-2">
                <Button variant="outline-secondary" onClick={() => setEditMode(false)}>
                  Annulla
                </Button>
                <Button variant="primary" onClick={handleSaveProfile} disabled={saving}>
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Salvataggio...
                    </>
                  ) : (
                    'Salva Modifiche'
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {/* Avatar e info base */}
        <Card className="mb-4">
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col-md-3 text-center mb-3 mb-md-0">
                <div className="avatar-large mx-auto mb-3">
                  {formData.avatar ? (
                    <img 
                      src={formData.avatar} 
                      alt={formData.name} 
                      className="rounded-circle"
                      style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center mx-auto"
                         style={{ width: '120px', height: '120px', fontSize: '2.5rem' }}>
                      {getInitials(formData.name)}
                    </div>
                  )}
                </div>
                {editMode && (
                  <div>
                    <input
                      type="file"
                      id="avatar-upload"
                      className="d-none"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          // Qui dovresti implementare l'upload dell'immagine
                          // Per ora simuliamo un URL
                          setFormData(prev => ({
                            ...prev,
                            avatar: URL.createObjectURL(file)
                          }));
                        }
                      }}
                    />
                    <Button 
                      variant="outline-secondary" 
                      size="sm"
                      onClick={() => document.getElementById('avatar-upload').click()}
                    >
                      <i className="fas fa-camera me-1"></i>
                      Cambia foto
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="col-md-9">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label text-muted">Nome Completo</label>
                      {editMode ? (
                        <Input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Il tuo nome"
                        />
                      ) : (
                        <div className="form-control-plaintext">
                          <h5 className="mb-0">{formData.name || 'Non specificato'}</h5>
                        </div>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label text-muted">Email</label>
                      <div className="form-control-plaintext">
                        <div className="d-flex align-items-center">
                          <i className="fas fa-envelope text-muted me-2"></i>
                          {formData.email}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label text-muted">Ruolo</label>
                      <div className="form-control-plaintext">
                        <Badge 
                          className="d-inline-flex align-items-center"
                          style={{ 
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            padding: '0.5rem 1rem'
                          }}
                        >
                          <i className={`fas ${getRoleIcon(user.role)} me-2`}></i>
                          {getRoleName(user.role)}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label text-muted">Dipartimento</label>
                      {editMode ? (
                        <Select
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          options={DEPARTMENT_OPTIONS}
                          placeholder="Seleziona dipartimento"
                        />
                      ) : (
                        <div className="form-control-plaintext">
                          <div className="d-flex align-items-center">
                            <i className={`fas ${getDepartmentIcon(formData.department)} text-muted me-2`}></i>
                            {getDepartmentName(formData.department)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Messaggi di errore/successo */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="fas fa-exclamation-circle me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}
      
      {success && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <i className="fas fa-check-circle me-2"></i>
          {success}
          <button type="button" className="btn-close" onClick={() => setSuccess(null)}></button>
        </div>
      )}

      {/* Sezioni del profilo */}
      <div className="row g-4">
        {/* Informazioni personali */}
        <div className="col-lg-6">
          <Card>
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-user-circle me-2"></i>
                Informazioni Personali
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-12">
                  <div className="mb-3">
                    <label className="form-label text-muted">Telefono</label>
                    {editMode ? (
                      <Input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+39 123 456 7890"
                      />
                    ) : (
                      <div className="form-control-plaintext">
                        <div className="d-flex align-items-center">
                          <i className="fas fa-phone text-muted me-2"></i>
                          {formData.phone || 'Non specificato'}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-0">
                    <label className="form-label text-muted">Bio / Descrizione</label>
                    {editMode ? (
                      <textarea
                        className="form-control"
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        placeholder="Raccontaci qualcosa di te..."
                        rows="4"
                      />
                    ) : (
                      <div className="form-control-plaintext">
                        <p className="mb-0">
                          {formData.bio || 'Nessuna descrizione fornita'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-top">
                <h6 className="mb-3">Informazioni Account</h6>
                <div className="row g-2">
                  <div className="col-6">
                    <small className="text-muted d-block">Data Registrazione</small>
                    <div>{formatDate(user.createdAt)}</div>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">Ultimo Accesso</small>
                    <div>{formatDate(user.lastLoginAt)}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card-footer bg-transparent">
              <Button 
                variant="outline-danger" 
                size="sm"
                onClick={() => setShowChangePassword(true)}
              >
                <i className="fas fa-key me-1"></i>
                Cambia Password
              </Button>
            </div>
          </Card>
        </div>

        {/* Statistiche personali */}
        <div className="col-lg-6">
          <Card>
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-chart-line me-2"></i>
                Le Tue Statistiche
              </h5>
            </div>
            <div className="card-body">
              {taskStats ? (
                <div className="row g-3">
                  <div className="col-6">
                    <div className="text-center p-3 bg-primary bg-opacity-10 rounded">
                      <div className="h2 text-primary mb-1">{taskStats.total || 0}</div>
                      <small className="text-muted">Task Totali</small>
                    </div>
                  </div>
                  
                  <div className="col-6">
                    <div className="text-center p-3 bg-success bg-opacity-10 rounded">
                      <div className="h2 text-success mb-1">
                        {taskStats.byStatus?.[TASK_STATUS.COMPLETATO] || 0}
                      </div>
                      <small className="text-muted">Task Completati</small>
                    </div>
                  </div>
                  
                  <div className="col-6">
                    <div className="text-center p-3 bg-warning bg-opacity-10 rounded">
                      <div className="h2 text-warning mb-1">
                        {taskStats.byStatus?.[TASK_STATUS.IN_CORSO] || 0}
                      </div>
                      <small className="text-muted">In Corso</small>
                    </div>
                  </div>
                  
                  <div className="col-6">
                    <div className="text-center p-3 bg-info bg-opacity-10 rounded">
                      <div className="h2 text-info mb-1">{taskStats.completionRate || 0}%</div>
                      <small className="text-muted">Tasso Completamento</small>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="fas fa-chart-pie fa-2x text-muted mb-3"></i>
                  <p className="text-muted">Caricamento statistiche...</p>
                </div>
              )}
              
              {userStats?.performance && (
                <div className="mt-4 pt-3 border-top">
                  <h6 className="mb-3">Performance</h6>
                  <div className="row g-2">
                    <div className="col-6">
                      <small className="text-muted d-block">Task/Giorno</small>
                      <div className="h5">
                        {(userStats.performance.tasksCompleted / 30).toFixed(1)}
                      </div>
                    </div>
                    <div className="col-6">
                      <small className="text-muted d-block">Efficienza</small>
                      <div className="h5">{userStats.performance.efficiencyScore}/100</div>
                    </div>
                  </div>
                </div>
              )}
              
              {userStats?.achievements && userStats.achievements.length > 0 && (
                <div className="mt-4 pt-3 border-top">
                  <h6 className="mb-3">Achievements</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {userStats.achievements.map((achievement, index) => (
                      <Badge 
                        key={index}
                        variant={achievement.earned ? 'success' : 'secondary'}
                        className="d-flex align-items-center gap-1"
                      >
                        {achievement.earned ? (
                          <i className="fas fa-trophy"></i>
                        ) : (
                          <i className="far fa-clock"></i>
                        )}
                        {achievement.title}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Preferenze (se implementate in futuro) */}
        <div className="col-12">
          <Card>
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-cog me-2"></i>
                Preferenze
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="notifications"
                      defaultChecked
                    />
                    <label className="form-check-label" htmlFor="notifications">
                      Notifiche email per nuovi task
                    </label>
                  </div>
                  
                  <div className="form-check form-switch mt-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="reminders"
                      defaultChecked
                    />
                    <label className="form-check-label" htmlFor="reminders">
                      Promemoria per scadenze
                    </label>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="weekly-report"
                    />
                    <label className="form-check-label" htmlFor="weekly-report">
                      Report settimanale
                    </label>
                  </div>
                  
                  <div className="form-check form-switch mt-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="dark-mode"
                    />
                    <label className="form-check-label" htmlFor="dark-mode">
                      Modalità scura
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card-footer bg-transparent text-end">
              <Button variant="outline-primary" size="sm">
                Salva Preferenze
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal Cambio Password */}
      <Modal
        show={showChangePassword}
        onHide={() => setShowChangePassword(false)}
        title="Cambia Password"
        size="md"
      >
        <div className="p-3">
          <div className="mb-3">
            <label className="form-label">Password Attuale</label>
            <Input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData(prev => ({
                ...prev,
                currentPassword: e.target.value
              }))}
              placeholder="Inserisci la password attuale"
            />
          </div>
          
          <div className="mb-3">
            <label className="form-label">Nuova Password</label>
            <Input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData(prev => ({
                ...prev,
                newPassword: e.target.value
              }))}
              placeholder="Almeno 6 caratteri"
            />
            <small className="text-muted">
              La password deve contenere almeno 6 caratteri
            </small>
          </div>
          
          <div className="mb-4">
            <label className="form-label">Conferma Nuova Password</label>
            <Input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData(prev => ({
                ...prev,
                confirmPassword: e.target.value
              }))}
              placeholder="Ripeti la nuova password"
            />
          </div>
          
          <div className="alert alert-info">
            <i className="fas fa-info-circle me-2"></i>
            Dopo aver cambiato la password, dovrai effettuare nuovamente il login.
          </div>
          
          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button 
              variant="outline-secondary" 
              onClick={() => setShowChangePassword(false)}
            >
              Annulla
            </Button>
            <Button 
              variant="primary" 
              onClick={handleChangePassword}
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Cambio in corso...
                </>
              ) : (
                'Cambia Password'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EmployeeProfile;
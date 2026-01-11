//manca solo la parte per la console e l'accesso prima senza firebase poi con le credenziali giuste fatte nome.gariboldi!

# Task Management Dashboard

Dashboard web per la gestione dei task aziendali con Firebase, React.js e TypeScript.

## Funzionalità

### Per Dipendenti
- Visualizzazione di tutte le task aziendali (solo lettura)
- Gestione delle proprie task (modifica, completamento)
- Creazione di nuove task
- Cestino personale per il recupero task
- Profilo con statistiche personali

### Per Amministratori
- CRUD completo su tutte le task
- Assegnazione task a qualsiasi dipendente
- Cestino globale e ripristino
- Statistiche aziendali dettagliate
- Gestione utenti

## Tecnologie Utilizzate

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **UI Framework**: CSS Custom Properties, Flexbox, Grid
- **Backend**: Firebase (Authentication, Firestore)
- **Hosting**: Firebase Hosting
- **Charting**: Chart.js per le statistiche

## Setup Locale

1. Clona il repository
2. Crea un progetto Firebase su [console.firebase.google.com](https://console.firebase.google.com)
3. Abilita Authentication (Email/Password) e Firestore
4. Copia le credenziali Firebase in `js/firebase-config.js`
5. Apri `index.html` in un browser


### Amministratore
-email:admin@gariboldi.com
-password:Admin.gariboldi!

### Dipendenti
- Email: leonardo@gariboldi.com
- Password: leonardo.gariboldi!

- Email: domenico@gariboldi.com
- Password: domenico.gariboldi!

- Email: stefano@gariboldi.com
- Password: stefano.gariboldi!

- Email: andrea@gariboldi.com
- Password: andrea.gariboldi!



Dipendenti (gestiscono solo le proprie task):


Andrea:

📧 Email: andrea@gariboldi.com

🔑 Password: andrea.gariboldi!

👤 Ruolo: employee

Leonardo:

📧 Email: leonardo@gariboldi.com

🔑 Password: leonardo.gariboldi!

👤 Ruolo: employee

Domenico:

📧 Email: domenico@gariboldi.com

🔑 Password: domenico.gariboldi!

👤 Ruolo: employee

Stefano:

📧 Email: stefano@gariboldi.com

🔑 Password: stefano.gariboldi!

👤 Ruolo: employee


admin:⭐

📧 Email: admin@gariboldi.com

🔑 Password: Admin.gariboldi!

👤 Ruolo: admin⭐





## Deploy su Firebase

1. Installa Firebase CLI:
   ```bash
   npm install -g firebase-tools
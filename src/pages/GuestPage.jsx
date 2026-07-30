import { Link } from 'react-router-dom'
import AuthShell from '../components/layout/AuthShell.jsx'
import AppButton from '../components/ui/AppButton.jsx'

function GuestPage() {
  return (
    <AuthShell
      title="Accesso ospite"
      subtitle="Area provvisoria per entrare senza autenticazione completa."
    >
      <div className="space-y-4">
        <p className="text-sm leading-6 text-app-text-muted">
          In questo punto possiamo introdurre una modalità demo oppure un accesso
          limitato in sola lettura per gli utenti non registrati.
        </p>

        <AppButton to="/" variant="secondary">
          Torna alla homepage
        </AppButton>

        <p className="text-center text-sm text-app-text-faint">
          Oppure vai a{' '}
          <Link
            to="/login"
            className="text-brand-primary hover:text-brand-primary-hover"
          >
            login
          </Link>
          .
        </p>
      </div>
    </AuthShell>
  )
}

export default GuestPage
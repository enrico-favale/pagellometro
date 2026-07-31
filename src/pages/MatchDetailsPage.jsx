import AppButton from '../components/ui/AppButton.jsx'

function MatchDetailsPage() {
  return (
    <main className="min-h-screen bg-app-bg px-4 py-8">
      <section className="mx-auto max-w-4xl rounded-card border border-app-border bg-app-surface p-8 shadow-app">
        <h1 className="text-3xl font-black tracking-tight text-app-text">
          Dettagli match
        </h1>

        <p className="mt-3 text-sm text-app-text-muted">
          Pagina placeholder per i dettagli del match.
        </p>

        <div className="mt-6 max-w-xs">
          <AppButton to="/dashboard" variant="secondary">
            Torna alla dashboard
          </AppButton>
        </div>
      </section>
    </main>
  )
}

export default MatchDetailsPage
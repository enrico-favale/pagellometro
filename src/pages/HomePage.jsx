import AppButton from '../components/ui/AppButton.jsx'
import AppLogo from '../components/ui/AppLogo.jsx'

function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-app-bg px-4">
      <section className="w-full max-w-2xl rounded-card border border-app-border bg-app-surface px-6 py-10 shadow-app sm:px-10 sm:py-14">
        <div className="flex flex-col items-center text-center">
          <AppLogo className="justify-center" />

          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.25em] text-brand-primary">
            Benvenuto
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight text-app-text sm:text-5xl">
            Organizza le tue pagelle sportive
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-7 text-app-text-muted sm:text-base">
            Crea competizioni, aggiungi partite, assegna voti e condividi tutto
            con i tuoi amici in uno spazio semplice e ordinato.
          </p>
        </div>

        <div className="mx-auto mt-10 flex max-w-md flex-col gap-3">
          <AppButton to="/login" variant="primary">
            Accedi
          </AppButton>

          <AppButton to="/register" variant="secondary">
            Registrati
          </AppButton>
        </div>
      </section>
    </main>
  )
}

export default HomePage
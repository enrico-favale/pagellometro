import { Link } from 'react-router-dom'
import AppLogo from '../ui/AppLogo.jsx'

function AuthShell({ title, subtitle, children }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-app-bg px-4 py-10">
      <section className="w-full max-w-md rounded-card border border-app-border bg-app-surface p-6 shadow-app sm:p-8">
        <div className="mb-8">
          <Link to="/" className="inline-block">
            <AppLogo />
          </Link>
        </div>

        <header className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-app-text">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-app-text-muted">
            {subtitle}
          </p>
        </header>

        {children}
      </section>
    </main>
  )
}

export default AuthShell
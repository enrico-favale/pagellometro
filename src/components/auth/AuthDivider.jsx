function AuthDivider() {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-app-border" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-app-surface px-3 text-xs uppercase tracking-[0.2em] text-app-text-faint">
          Oppure
        </span>
      </div>
    </div>
  )
}

export default AuthDivider
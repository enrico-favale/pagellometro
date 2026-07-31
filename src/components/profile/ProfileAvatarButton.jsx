import { Link } from 'react-router-dom'

function ProfileAvatarButton({ profile }) {
  const avatarUrl = profile?.avatar_url || '/avatar-placeholder.png'

  return (
    <Link
      to="/profile"
      aria-label="Apri profilo"
      className="inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-app-border bg-app-surface-2 transition hover:border-brand-primary"
    >
      <img
        src={avatarUrl}
        alt="Avatar profilo"
        className="h-full w-full object-cover"
      />
    </Link>
  )
}

export default ProfileAvatarButton
import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import AppLogo from '../components/ui/AppLogo.jsx'
import AppButton from '../components/ui/AppButton.jsx'
import ProfileAvatarButton from '../components/profile/ProfileAvatarButton.jsx'
import { useAuth } from '../hooks/useAuth.js'

function ProfilePage() {
	const {
		user,
		loading,
		isAuthenticated,
		getMyProfile,
		updateMyProfile,
		uploadAvatar,
	} = useAuth()

	const [profile, setProfile] = useState(null)
	const [formData, setFormData] = useState({
		username: '',
		nome: '',
	})
	const [selectedFile, setSelectedFile] = useState(null)
	const [saving, setSaving] = useState(false)
	const [message, setMessage] = useState('')
	const [errorMessage, setErrorMessage] = useState('')

	useEffect(() => {
		let ignore = false

		async function loadProfile() {
			try {
				const data = await getMyProfile()
				if (!ignore && data) {
					setProfile(data)
					setFormData({
						username: data.username || '',
						nome: data.nome || '',
					})
				}
			} catch (error) {
				if (!ignore) {
					setErrorMessage(error.message || 'Impossibile caricare il profilo.')
				}
			}
		}

		loadProfile()

		return () => {
			ignore = true
		}
	}, [getMyProfile])

	if (!loading && !isAuthenticated) {
		return <Navigate to="/login" replace />
	}

	function handleChange(event) {
		const { name, value } = event.target
		setFormData((current) => ({ ...current, [name]: value }))
	}

	function handleFileChange(event) {
		const file = event.target.files?.[0] ?? null
		setSelectedFile(file)
	}

	async function handleSubmit(event) {
		event.preventDefault()
		setSaving(true)
		setMessage('')
		setErrorMessage('')

		try {
			let avatarUrl = profile?.avatar_url ?? null

			if (selectedFile) {
				avatarUrl = await uploadAvatar(selectedFile)
			}

			const updatedProfile = await updateMyProfile({
				username: formData.username.trim(),
				nome: formData.nome.trim(),
				avatar_url: avatarUrl,
			})

			setProfile(updatedProfile)
			setMessage('Profilo aggiornato correttamente.')
			setSelectedFile(null)
		} catch (error) {
			setErrorMessage(error.message || 'Impossibile aggiornare il profilo.')
		} finally {
			setSaving(false)
		}
	}

	return (
		<main className="min-h-screen bg-app-bg px-4 py-8">
			<section className="mx-auto flex max-w-5xl items-center justify-between rounded-card border border-app-border bg-app-surface p-6 shadow-app">
				<AppLogo />
				<ProfileAvatarButton profile={profile} />
			</section>

			<section className="mx-auto mt-8 max-w-5xl rounded-card border border-app-border bg-app-surface p-8 shadow-app">
				<div className="flex items-center gap-4">
					<img
						src={profile?.avatar_url || 'avatar-placeholder.png'}
						alt="Avatar profilo"
						className="h-12 w-12 rounded-full object-cover"
						onError={(event) => {
							event.currentTarget.onerror = null
							event.currentTarget.src = 'avatar-placeholder.png'
						}}
					/>

					<div>
						<h1 className="text-3xl font-black tracking-tight text-app-text">
							Il tuo profilo
						</h1>
						<p className="mt-2 text-sm text-app-text-muted">
							Visualizza e modifica i tuoi dati di registrazione.
						</p>
					</div>
				</div>

				<form className="mt-8 space-y-5" onSubmit={handleSubmit}>
					<div>
						<label className="mb-2 block text-sm font-medium text-app-text" htmlFor="email">
							Email
						</label>
						<input
							id="email"
							type="email"
							value={profile?.email || user?.email || ''}
							disabled
							className="w-full rounded-2xl border border-app-border bg-app-surface-2 px-4 py-3 text-sm text-app-text-muted outline-none"
						/>
					</div>

					<div>
						<label className="mb-2 block text-sm font-medium text-app-text" htmlFor="username">
							Username
						</label>
						<input
							id="username"
							name="username"
							type="text"
							value={formData.username}
							onChange={handleChange}
							className="w-full rounded-2xl border border-app-border bg-app-surface-2 px-4 py-3 text-sm text-app-text outline-none transition focus:border-brand-primary"
							required
						/>
					</div>

					<div>
						<label className="mb-2 block text-sm font-medium text-app-text" htmlFor="nome">
							Nome completo
						</label>
						<input
							id="nome"
							name="nome"
							type="text"
							value={formData.nome}
							onChange={handleChange}
							className="w-full rounded-2xl border border-app-border bg-app-surface-2 px-4 py-3 text-sm text-app-text outline-none transition focus:border-brand-primary"
						/>
					</div>

					<div>
						<label className="mb-2 block text-sm font-medium text-app-text" htmlFor="avatar">
							Immagine profilo
						</label>
						<input
							id="avatar"
							name="avatar"
							type="file"
							accept="image/png,image/jpeg,image/webp,image/jpg"
							onChange={handleFileChange}
							className="block w-full text-sm text-app-text-muted file:mr-4 file:rounded-xl file:border-0 file:bg-brand-primary file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-brand-primary-hover"
						/>
					</div>

					{errorMessage ? (
						<p className="rounded-2xl border border-state-danger/30 bg-state-danger/10 px-4 py-3 text-sm text-rose-200">
							{errorMessage}
						</p>
					) : null}

					{message ? (
						<p className="rounded-2xl border border-state-success/30 bg-state-success/10 px-4 py-3 text-sm text-emerald-200">
							{message}
						</p>
					) : null}

					<div className="flex flex-wrap gap-3">
						<AppButton type="submit">
							{saving ? 'Salvataggio...' : 'Salva modifiche'}
						</AppButton>

						<AppButton to="/dashboard" variant="secondary">
							Torna alla dashboard
						</AppButton>
					</div>
				</form>
			</section>
		</main>
	)
}

export default ProfilePage
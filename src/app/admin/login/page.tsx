'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
    const router = useRouter()
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (!password.trim()) {
            setError('Veuillez entrer le mot de passe.')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            })

            const result = await response.json()

            if (!response.ok) {
                setError(result.error ?? 'Erreur de connexion.')
                return
            }

            router.push('/admin')
        } catch {
            setError('Erreur réseau. Veuillez réessayer.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-stone-950 flex items-center justify-center p-6">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-stone-950 font-black text-sm">AN</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Georgia, serif' }}>
                        Accès back-office
                    </h1>
                    <p className="text-stone-500 text-sm mt-1">Réservé aux administrateurs</p>
                </div>

                <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-stone-300 mb-2">
                            Mot de passe
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                            placeholder="••••••••"
                            className={`w-full bg-stone-950 border rounded-xl px-4 py-3 text-white placeholder-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                                error ? 'border-red-500' : 'border-stone-700'
                            }`}
                        />
                        {error && (
                            <p className="mt-2 text-red-400 text-sm" role="alert">{error}</p>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-stone-950 font-semibold rounded-xl transition-all duration-200"
                    >
                        {loading ? (
                            <>
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                </svg>
                                Connexion...
                            </>
                        ) : 'Se connecter'}
                    </button>
                </div>
            </div>
        </div>
    )
}
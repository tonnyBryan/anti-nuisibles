'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Devis, Statut } from '@/types'

const STATUT_LABELS: Record<Statut, string> = {
    nouveau: 'Nouveau',
    traite: 'Traité',
    archive: 'Archivé',
}

const STATUT_COLORS: Record<Statut, string> = {
    nouveau: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    traite: 'bg-green-500/10 text-green-400 border-green-500/20',
    archive: 'bg-stone-700/50 text-stone-400 border-stone-600',
}

const NEXT_STATUT: Record<Statut, Statut> = {
    nouveau: 'traite',
    traite: 'archive',
    archive: 'nouveau',
}

const PER_PAGE = 10

export default function AdminPage() {
    const router = useRouter()
    const [devis, setDevis] = useState<Devis[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [filterStatut, setFilterStatut] = useState<Statut | 'tous'>('tous')
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [page, setPage] = useState(1)
    const [updatingId, setUpdatingId] = useState<string | null>(null)

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 300)
        return () => clearTimeout(timer)
    }, [search])

    const fetchDevis = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const token = document.cookie
                .split('; ')
                .find(row => row.startsWith('admin_token='))
                ?.split('=')[1]

            const url = filterStatut === 'tous'
                ? '/api/admin/devis'
                : `/api/admin/devis?statut=${filterStatut}`

            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (response.status === 401) {
                router.push('/admin/login')
                return
            }

            const result = await response.json()
            if (!result.success) throw new Error(result.error)
            setDevis(result.data)
        } catch {
            setError('Erreur lors du chargement des devis.')
        } finally {
            setLoading(false)
        }
    }, [filterStatut, router])

    useEffect(() => {
        fetchDevis()
    }, [fetchDevis])

    useEffect(() => {
        setPage(1)
    }, [filterStatut, debouncedSearch])

    const handleStatutChange = async (id: string, currentStatut: Statut) => {
        setUpdatingId(id)
        const newStatut = NEXT_STATUT[currentStatut]

        const token = document.cookie
            .split('; ')
            .find(row => row.startsWith('admin_token='))
            ?.split('=')[1]

        try {
            const response = await fetch('/api/admin/devis', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ id, statut: newStatut }),
            })

            if (response.ok) {
                setDevis(prev => prev.map(d => d.id === id ? { ...d, statut: newStatut } : d))
            }
        } catch {
            setError('Erreur lors de la mise à jour du statut.')
        } finally {
            setUpdatingId(null)
        }
    }

    const handleExportCSV = () => {
        const headers = ['Date', 'Établissement', 'Surface', 'Nuisibles', 'Urgence', 'Nom', 'Email', 'Téléphone', 'Statut']

        const rows = filtered.map(d => [
            formatDate(d.created_at),
            d.etablissement,
            `${d.surface} m²`,
            Array.isArray(d.nuisibles) ? d.nuisibles.join(' | ') : d.nuisibles,
            d.urgence,
            d.nom,
            d.email,
            d.telephone ?? '',
            STATUT_LABELS[d.statut],
        ])

        const csv = [headers, ...rows]
            .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            .join('\n')

        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `devis-${new Date().toISOString().split('T')[0]}.csv`
        link.click()
        URL.revokeObjectURL(url)
    }

    const handleLogout = () => {
        document.cookie = 'admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        router.push('/admin/login')
    }

    const filtered = devis.filter(d => {
        const matchSearch = debouncedSearch === '' ||
            d.nom.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            d.email.toLowerCase().includes(debouncedSearch.toLowerCase())
        return matchSearch
    })

    const totalPages = Math.ceil(filtered.length / PER_PAGE)
    const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        })
    }

    return (
        <div className="min-h-screen bg-stone-950">
            {/* Header */}
            <header className="border-b border-stone-800 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                        <span className="text-stone-950 font-black text-xs">AN</span>
                    </div>
                    <div>
                        <h1 className="text-white font-semibold" style={{ fontFamily: 'Georgia, serif' }}>
                            Back-office
                        </h1>
                        <p className="text-stone-500 text-xs">Gestion des demandes de devis</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="text-stone-500 hover:text-white text-sm transition-colors"
                >
                    Déconnexion →
                </button>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    {(['tous', 'nouveau', 'traite'] as const).map(s => (
                        <div key={s} className="bg-stone-900 border border-stone-800 rounded-xl p-4">
                            <p className="text-stone-500 text-xs mb-1">
                                {s === 'tous' ? 'Total' : s === 'nouveau' ? 'Nouveaux' : 'Traités'}
                            </p>
                            <p className="text-2xl font-bold text-white">
                                {s === 'tous' ? devis.length : devis.filter(d => d.statut === s).length}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <div className="relative flex-1">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Rechercher par nom ou email..."
                            className="w-full bg-stone-900 border border-stone-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                        />
                    </div>

                    {/* Statut tabs */}
                    <div className="flex gap-2">
                        {(['tous', 'nouveau', 'traite', 'archive'] as const).map(s => (
                            <button
                                key={s}
                                onClick={() => setFilterStatut(s)}
                                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                    filterStatut === s
                                        ? 'bg-amber-500 text-stone-950'
                                        : 'bg-stone-900 border border-stone-700 text-stone-400 hover:border-stone-500'
                                }`}
                            >
                                {s === 'tous' ? 'Tous' : STATUT_LABELS[s]}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleExportCSV}
                        disabled={filtered.length === 0}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-700 text-stone-400 hover:border-amber-500 hover:text-amber-400 transition-all disabled:opacity-30 text-sm"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export CSV
                    </button>
                </div>

                {/* Table */}
                <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <svg className="w-6 h-6 animate-spin text-amber-500" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                            </svg>
                        </div>
                    ) : error ? (
                        <div className="text-center py-20 text-red-400">{error}</div>
                    ) : paginated.length === 0 ? (
                        <div className="text-center py-20 text-stone-500">Aucune demande trouvée.</div>
                    ) : (
                        <table className="w-full">
                            <thead>
                            <tr className="border-b border-stone-800">
                                {['Date', 'Établissement', 'Nuisibles', 'Urgence', 'Contact', 'Statut', 'Action'].map(h => (
                                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-stone-500 uppercase tracking-wider">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-800">
                            {paginated.map(d => (
                                <tr key={d.id} className="hover:bg-stone-800/50 transition-colors">
                                    <td className="px-4 py-3 text-stone-400 text-sm whitespace-nowrap">
                                        {formatDate(d.created_at)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-white text-sm">{d.etablissement}</span>
                                        <span className="block text-stone-500 text-xs">{d.surface} m²</span>
                                    </td>
                                    <td className="px-4 py-3 text-stone-300 text-sm">
                                        {Array.isArray(d.nuisibles) ? d.nuisibles.join(', ') : d.nuisibles}
                                    </td>
                                    <td className="px-4 py-3 text-stone-300 text-sm">{d.urgence}</td>
                                    <td className="px-4 py-3">
                                        <span className="text-white text-sm">{d.nom}</span>
                                        <span className="block text-stone-500 text-xs">{d.email}</span>
                                    </td>
                                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-medium border ${STATUT_COLORS[d.statut]}`}>
                        {STATUT_LABELS[d.statut]}
                      </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => handleStatutChange(d.id, d.statut)}
                                            disabled={updatingId === d.id || d.statut === 'archive'}
                                            className="text-xs px-3 py-1.5 rounded-lg border border-stone-700 text-stone-400 hover:border-amber-500 hover:text-amber-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {updatingId === d.id ? '...' : d.statut === 'archive' ? 'Archivé' : `→ ${STATUT_LABELS[NEXT_STATUT[d.statut]]}`}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-stone-500 text-sm">
                            {filtered.length} résultat{filtered.length > 1 ? 's' : ''} — page {page}/{totalPages}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 rounded-xl border border-stone-700 text-stone-400 hover:border-stone-500 disabled:opacity-30 text-sm transition-all"
                            >
                                ← Précédent
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-4 py-2 rounded-xl border border-stone-700 text-stone-400 hover:border-stone-500 disabled:opacity-30 text-sm transition-all"
                            >
                                Suivant →
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
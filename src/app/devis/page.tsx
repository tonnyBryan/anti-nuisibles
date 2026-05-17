'use client'

import { useState } from 'react'
import Link from 'next/link'

type Etablissement = 'Restaurant' | 'Hôtel' | 'Copropriété' | 'Autre'
type Nuisible = 'Rats' | 'Cafards' | 'Punaises de lit' | 'Frelons' | 'Autre'
type Urgence = 'Intervention sous 24h' | 'Contrat annuel' | 'Simple devis'

interface FormData {
    etablissement: Etablissement | ''
    surface: string
    nuisibles: Nuisible[]
    urgence: Urgence | ''
    nom: string
    email: string
    telephone: string
    message: string
}

interface FormErrors {
    etablissement?: string
    surface?: string
    nuisibles?: string
    urgence?: string
    nom?: string
    email?: string
    telephone?: string
    message?: string
}

const ETABLISSEMENTS: Etablissement[] = ['Restaurant', 'Hôtel', 'Copropriété', 'Autre']
const NUISIBLES: Nuisible[] = ['Rats', 'Cafards', 'Punaises de lit', 'Frelons', 'Autre']
const URGENCES: Urgence[] = ['Intervention sous 24h', 'Contrat annuel', 'Simple devis']

const NUISIBLE_ICONS: Record<Nuisible, string> = {
    'Rats': '🐀',
    'Cafards': '🪳',
    'Punaises de lit': '🐛',
    'Frelons': '🐝',
    'Autre': '🦟',
}

const URGENCE_DESCRIPTIONS: Record<Urgence, string> = {
    'Intervention sous 24h': "Situation critique nécessitant une action immédiate",
    'Contrat annuel': "Surveillance et traitement tout au long de l'année",
    'Simple devis': "Estimation sans engagement pour planifier votre budget",
}

export default function DevisPage() {
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState<FormData>({
        etablissement: '',
        surface: '',
        nuisibles: [],
        urgence: '',
        nom: '',
        email: '',
        telephone: '',
        message: '',
    })
    const [errors, setErrors] = useState<FormErrors>({})
    const [submitted, setSubmitted] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [apiError, setApiError] = useState<string | null>(null)

    const validateStep = (currentStep: number): boolean => {
        const newErrors: FormErrors = {}

        if (currentStep === 1) {
            if (!formData.etablissement) newErrors.etablissement = "Veuillez sélectionner un type d'établissement"
            if (!formData.surface) {
                newErrors.surface = 'La surface est requise'
            } else if (Number(formData.surface) < 10 || Number(formData.surface) > 50000) {
                newErrors.surface = 'La surface doit être entre 10 et 50 000 m²'
            }
            if (formData.nuisibles.length === 0) newErrors.nuisibles = 'Sélectionnez au moins un type de nuisible'
        }

        if (currentStep === 2) {
            if (!formData.urgence) newErrors.urgence = "Veuillez sélectionner un niveau d'urgence"
            if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis'
            if (!formData.email.trim()) {
                newErrors.email = "L'email est requis"
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                newErrors.email = "Format d'email invalide"
            }
            if (formData.telephone && !/^(\+33|0)[1-9](\d{8})$/.test(formData.telephone.replace(/\s/g, ''))) {
                newErrors.telephone = 'Format de téléphone invalide (ex: 0612345678)'
            }
        }

        if (currentStep === 3) {
            if (formData.message.length > 500) newErrors.message = 'Le message ne peut pas dépasser 500 caractères'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleNext = () => {
        if (validateStep(step)) setStep(step + 1)
    }

    const handleBack = () => {
        setErrors({})
        setStep(step - 1)
    }

    const handleNuisibleToggle = (nuisible: Nuisible) => {
        setFormData(prev => ({
            ...prev,
            nuisibles: prev.nuisibles.includes(nuisible)
                ? prev.nuisibles.filter(n => n !== nuisible)
                : [...prev.nuisibles, nuisible]
        }))
    }

    const handleSubmit = async () => {
        if (!validateStep(3)) return

        setLoading(true)
        setApiError(null)

        try {
            const response = await fetch('/api/devis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    surface: Number(formData.surface),
                }),
            })

            const result = await response.json()

            if (!response.ok) {
                setApiError(result.error ?? 'Une erreur est survenue.')
                return
            }

            setSubmitted(result.data.id)
        } catch {
            setApiError('Erreur réseau. Veuillez réessayer.')
        } finally {
            setLoading(false)
        }
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-stone-950 flex items-center justify-center p-6">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-stone-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: 'Georgia, serif' }}>
                        Demande envoyée !
                    </h2>
                    <p className="text-stone-400 mb-2">Votre demande de devis a bien été reçue.</p>
                    <p className="text-stone-400 mb-8">Notre équipe vous contactera dans les plus brefs délais.</p>
                    <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">
                        <p className="text-stone-500 text-sm">Référence de votre demande</p>
                        <p className="text-amber-400 font-mono text-lg font-bold mt-1">{submitted}</p>
                    </div>
                    <button
                        onClick={() => {
                            setSubmitted(null)
                            setStep(1)
                            setFormData({
                                etablissement: '',
                                surface: '',
                                nuisibles: [],
                                urgence: '',
                                nom: '',
                                email: '',
                                telephone: '',
                                message: '',
                            })
                        }}
                        className="mt-6 text-stone-400 hover:text-white text-sm underline transition-colors"
                    >
                        Faire une nouvelle demande
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-stone-950">
            {/* Header */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-5 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-amber-500 rounded-md flex items-center justify-center">
                        <span className="text-stone-950 font-black text-xs">AN</span>
                    </div>
                    <span className="font-semibold text-sm tracking-wide text-white">Anti-Nuisibles Paris</span>
                </Link>
                <span className="text-stone-400 text-sm">Demande de devis gratuit</span>
            </nav>

            <main className="max-w-3xl mx-auto px-6 py-12 pt-24">
                {/* Progress bar */}
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                        {[
                            { num: 1, label: 'Votre établissement' },
                            { num: 2, label: 'Vos coordonnées' },
                            { num: 3, label: 'Récapitulatif' },
                        ].map(({ num, label }) => (
                            <div key={num} className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                                    step >= num ? 'bg-amber-500 text-stone-950' : 'bg-stone-800 text-stone-500'
                                }`}>
                                    {step > num ? (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : num}
                                </div>
                                <span className={`text-sm hidden sm:block ${step === num ? 'text-white' : 'text-stone-500'}`}>
                  {label}
                </span>
                            </div>
                        ))}
                    </div>
                    <div className="h-1 bg-stone-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-amber-500 rounded-full transition-all duration-500"
                            style={{ width: `${((step - 1) / 2) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Step 1 */}
                {step === 1 && (
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                                Votre établissement
                            </h1>
                            <p className="text-stone-400">Dites-nous en plus sur votre situation.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-stone-300 mb-3">
                                Type d'établissement <span className="text-amber-500">*</span>
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {ETABLISSEMENTS.map(etab => (
                                    <button
                                        key={etab}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, etablissement: etab }))}
                                        className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                                            formData.etablissement === etab
                                                ? 'border-amber-500 bg-amber-500/10 text-white'
                                                : 'border-stone-700 bg-stone-900 text-stone-400 hover:border-stone-500'
                                        }`}
                                    >
                                        <span className="font-medium">{etab}</span>
                                    </button>
                                ))}
                            </div>
                            {errors.etablissement && (
                                <p className="mt-2 text-red-400 text-sm" role="alert">{errors.etablissement}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="surface" className="block text-sm font-medium text-stone-300 mb-2">
                                Surface (m²) <span className="text-amber-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    id="surface"
                                    type="number"
                                    min={10}
                                    max={50000}
                                    value={formData.surface}
                                    onChange={e => setFormData(prev => ({ ...prev, surface: e.target.value }))}
                                    placeholder="Ex: 150"
                                    className={`w-full bg-stone-900 border rounded-xl px-4 py-3 text-white placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                                        errors.surface ? 'border-red-500' : 'border-stone-700'
                                    }`}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 text-sm">m²</span>
                            </div>
                            {errors.surface && (
                                <p className="mt-2 text-red-400 text-sm" role="alert">{errors.surface}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-stone-300 mb-3">
                                Type(s) de nuisible <span className="text-amber-500">*</span>
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {NUISIBLES.map(nuisible => (
                                    <button
                                        key={nuisible}
                                        type="button"
                                        onClick={() => handleNuisibleToggle(nuisible)}
                                        className={`p-3 rounded-xl border text-left transition-all duration-200 ${
                                            formData.nuisibles.includes(nuisible)
                                                ? 'border-amber-500 bg-amber-500/10 text-white'
                                                : 'border-stone-700 bg-stone-900 text-stone-400 hover:border-stone-500'
                                        }`}
                                        aria-pressed={formData.nuisibles.includes(nuisible)}
                                    >
                                        <span className="text-xl block mb-1">{NUISIBLE_ICONS[nuisible]}</span>
                                        <span className="text-sm font-medium">{nuisible}</span>
                                    </button>
                                ))}
                            </div>
                            {errors.nuisibles && (
                                <p className="mt-2 text-red-400 text-sm" role="alert">{errors.nuisibles}</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 2 */}
                {step === 2 && (
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                                Vos coordonnées
                            </h1>
                            <p className="text-stone-400">Nous vous recontacterons sous 24h.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-stone-300 mb-3">
                                Type d'intervention <span className="text-amber-500">*</span>
                            </label>
                            <div className="space-y-3">
                                {URGENCES.map(urgence => (
                                    <button
                                        key={urgence}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, urgence }))}
                                        className={`w-full p-4 rounded-xl border text-left transition-all duration-200 ${
                                            formData.urgence === urgence
                                                ? 'border-amber-500 bg-amber-500/10'
                                                : 'border-stone-700 bg-stone-900 hover:border-stone-500'
                                        }`}
                                    >
                    <span className={`font-medium block ${formData.urgence === urgence ? 'text-white' : 'text-stone-300'}`}>
                      {urgence}
                    </span>
                                        <span className="text-stone-500 text-sm">{URGENCE_DESCRIPTIONS[urgence]}</span>
                                    </button>
                                ))}
                            </div>
                            {errors.urgence && (
                                <p className="mt-2 text-red-400 text-sm" role="alert">{errors.urgence}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="nom" className="block text-sm font-medium text-stone-300 mb-2">
                                Nom du contact <span className="text-amber-500">*</span>
                            </label>
                            <input
                                id="nom"
                                type="text"
                                value={formData.nom}
                                onChange={e => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                                placeholder="Jean Dupont"
                                className={`w-full bg-stone-900 border rounded-xl px-4 py-3 text-white placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                                    errors.nom ? 'border-red-500' : 'border-stone-700'
                                }`}
                            />
                            {errors.nom && (
                                <p className="mt-2 text-red-400 text-sm" role="alert">{errors.nom}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-stone-300 mb-2">
                                Email <span className="text-amber-500">*</span>
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                placeholder="contact@etablissement.fr"
                                className={`w-full bg-stone-900 border rounded-xl px-4 py-3 text-white placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                                    errors.email ? 'border-red-500' : 'border-stone-700'
                                }`}
                            />
                            {errors.email && (
                                <p className="mt-2 text-red-400 text-sm" role="alert">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="telephone" className="block text-sm font-medium text-stone-300 mb-2">
                                Téléphone <span className="text-stone-600">(optionnel)</span>
                            </label>
                            <input
                                id="telephone"
                                type="tel"
                                value={formData.telephone}
                                onChange={e => setFormData(prev => ({ ...prev, telephone: e.target.value }))}
                                placeholder="0612345678"
                                className={`w-full bg-stone-900 border rounded-xl px-4 py-3 text-white placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                                    errors.telephone ? 'border-red-500' : 'border-stone-700'
                                }`}
                            />
                            {errors.telephone && (
                                <p className="mt-2 text-red-400 text-sm" role="alert">{errors.telephone}</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 3 */}
                {step === 3 && (
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                                Récapitulatif
                            </h1>
                            <p className="text-stone-400">Vérifiez vos informations avant d'envoyer.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
                                <h3 className="text-amber-500 text-xs font-bold uppercase tracking-widest mb-4">Établissement</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-stone-500">Type</span>
                                        <span className="text-white">{formData.etablissement}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-stone-500">Surface</span>
                                        <span className="text-white">{formData.surface} m²</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-stone-500">Nuisibles</span>
                                        <span className="text-white text-right">{formData.nuisibles.join(', ')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-stone-500">Urgence</span>
                                        <span className="text-white">{formData.urgence}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
                                <h3 className="text-amber-500 text-xs font-bold uppercase tracking-widest mb-4">Contact</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-stone-500">Nom</span>
                                        <span className="text-white">{formData.nom}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-stone-500">Email</span>
                                        <span className="text-white">{formData.email}</span>
                                    </div>
                                    {formData.telephone && (
                                        <div className="flex justify-between">
                                            <span className="text-stone-500">Téléphone</span>
                                            <span className="text-white">{formData.telephone}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-stone-300 mb-2">
                                Message complémentaire <span className="text-stone-600">(optionnel)</span>
                            </label>
                            <textarea
                                id="message"
                                value={formData.message}
                                onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
                                placeholder="Précisez toute information utile pour notre équipe..."
                                rows={4}
                                maxLength={500}
                                className={`w-full bg-stone-900 border rounded-xl px-4 py-3 text-white placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all resize-none ${
                                    errors.message ? 'border-red-500' : 'border-stone-700'
                                }`}
                            />
                            <div className="flex justify-between mt-1">
                                {errors.message
                                    ? <p className="text-red-400 text-sm" role="alert">{errors.message}</p>
                                    : <span />
                                }
                                <span className="text-stone-600 text-sm">{formData.message.length}/500</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between mt-10 pt-6 border-t border-stone-800">
                    {step > 1 ? (
                        <button
                            type="button"
                            onClick={handleBack}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-stone-700 text-stone-300 hover:border-stone-500 hover:text-white transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Retour
                        </button>
                    ) : <div />}

                    <div className="flex flex-col items-end gap-2">
                        {apiError && (
                            <p className="text-red-400 text-sm" role="alert">{apiError}</p>
                        )}
                        {step < 3 ? (
                            <button
                                type="button"
                                onClick={handleNext}
                                className="flex items-center gap-2 px-8 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold rounded-xl transition-all duration-200"
                            >
                                Continuer
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex items-center gap-2 px-8 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-stone-950 font-semibold rounded-xl transition-all duration-200"
                            >
                                {loading ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                        </svg>
                                        Envoi en cours...
                                    </>
                                ) : (
                                    <>
                                        Envoyer ma demande
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
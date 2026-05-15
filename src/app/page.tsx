import Link from 'next/link'

export default function Home() {
    return (
        <div className="min-h-screen bg-stone-950 text-white">

            {/* Nav */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-amber-500 rounded-md flex items-center justify-center">
                        <span className="text-stone-950 font-black text-xs">AN</span>
                    </div>
                    <span className="font-semibold text-sm tracking-wide">Anti-Nuisibles Paris</span>
                </div>
                <Link
                    href="/devis"
                    className="text-sm text-stone-400 hover:text-white transition-colors"
                >
                    Demander un devis →
                </Link>
            </nav>

            {/* Hero */}
            <section className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center">

                {/* Background glow */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl" />
                </div>

                {/* Badge */}
                <div className="relative mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-stone-800 bg-stone-900/60 backdrop-blur-sm">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-stone-400 text-sm">Intervention sous 24h à Paris</span>
                </div>

                {/* Headline */}
                <h1
                    className="relative text-6xl sm:text-7xl md:text-8xl font-bold mb-6 leading-none tracking-tight"
                    style={{ fontFamily: 'Georgia, serif' }}
                >
                    Nuisibles
                    <span className="block text-amber-500">éliminés.</span>
                </h1>

                <p className="relative text-stone-400 text-lg max-w-md mb-12 leading-relaxed">
                    Dératisation, désinsectisation et traitement anti-nuisibles pour les professionnels parisiens.
                </p>

                <Link
                    href="/devis"
                    className="relative inline-flex items-center gap-3 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-2xl transition-all duration-200 hover:scale-105 text-lg"
                >
                    Obtenir un devis gratuit
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>

                {/* Scroll hint */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
                    <div className="w-px h-10 bg-gradient-to-b from-transparent to-stone-500" />
                </div>
            </section>

            {/* Services */}
            <section className="px-6 py-24 max-w-4xl mx-auto">
                <p className="text-amber-500 text-xs font-bold uppercase tracking-widest text-center mb-16">
                    Nos interventions
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {[
                        {
                            icon: '🐀',
                            title: 'Dératisation',
                            desc: 'Élimination complète des rongeurs avec traçabilité et garantie de résultat.',
                        },
                        {
                            icon: '🪳',
                            title: 'Désinsectisation',
                            desc: 'Traitement ciblé cafards, punaises de lit, frelons et insectes rampants.',
                        },
                        {
                            icon: '🛡️',
                            title: 'Contrat annuel',
                            desc: 'Surveillance régulière et interventions préventives tout au long de l\'année.',
                        },
                    ].map(({ icon, title, desc }) => (
                        <div
                            key={title}
                            className="group p-6 rounded-2xl border border-stone-800 bg-stone-900/40 hover:border-amber-500/30 hover:bg-stone-900/70 transition-all duration-300"
                        >
                            <span className="text-3xl block mb-4">{icon}</span>
                            <h3 className="font-bold text-white mb-2">{title}</h3>
                            <p className="text-stone-500 text-sm leading-relaxed">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Stats */}
            <section className="px-6 py-16 border-t border-stone-800/50">
                <div className="max-w-3xl mx-auto grid grid-cols-3 gap-8 text-center">
                    {[
                        { value: '+500', label: 'Interventions réalisées' },
                        { value: '24h', label: 'Délai d\'intervention' },
                        { value: '100%', label: 'Satisfaction client' },
                    ].map(({ value, label }) => (
                        <div key={label}>
                            <p className="text-3xl font-bold text-amber-500 mb-1" style={{ fontFamily: 'Georgia, serif' }}>
                                {value}
                            </p>
                            <p className="text-stone-500 text-sm">{label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA final */}
            <section className="px-6 py-24 text-center">
                <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                    Un problème de nuisibles ?
                </h2>
                <p className="text-stone-400 mb-8">Décrivez votre situation, nous vous répondons sous 2h.</p>
                <Link
                    href="/devis"
                    className="inline-flex items-center gap-2 px-7 py-3 border border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-stone-950 font-semibold rounded-xl transition-all duration-200"
                >
                    Démarrer ma demande
                </Link>
            </section>

            {/* Footer */}
            <footer className="border-t border-stone-800 px-6 py-6 text-center text-stone-600 text-sm">
                © 2024 Anti-Nuisibles Paris — Tous droits réservés
            </footer>

        </div>
    )
}
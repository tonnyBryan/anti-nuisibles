import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { checkRateLimit, registerIp, createDevis } from '@/lib/services/devis.service'
import { ApiResponse } from '@/types'

const devisSchema = z.object({
    etablissement: z.enum(['Restaurant', 'Hôtel', 'Copropriété', 'Autre']),
    surface: z.number().min(10).max(50000),
    nuisibles: z.array(z.enum(['Rats', 'Cafards', 'Punaises de lit', 'Frelons', 'Autre'])).min(1),
    urgence: z.enum(['Intervention sous 24h', 'Contrat annuel', 'Simple devis']),
    nom: z.string().min(2).max(100),
    email: z.string().email(),
    telephone: z.string().regex(/^(\+33|0)[1-9](\d{8})$/).optional().or(z.literal('')),
    message: z.string().max(500).optional(),
})

export async function POST(request: NextRequest) {
    try {
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1'

        const allowed = await checkRateLimit(ip)
        if (!allowed) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Trop de demandes. Réessayez dans une heure.' },
                { status: 429 }
            )
        }

        const body = await request.json()
        const parsed = devisSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Données invalides.', details: parsed.error.flatten() },
                { status: 400 }
            )
        }

        const id = await createDevis(parsed.data)
        await registerIp(ip)

        return NextResponse.json<ApiResponse<{ id: string }>>(
            { success: true, data: { id } },
            { status: 201 }
        )

    } catch (error) {
        console.error('Erreur API devis:', error)
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Erreur serveur. Veuillez réessayer.' },
            { status: 500 }
        )
    }
}
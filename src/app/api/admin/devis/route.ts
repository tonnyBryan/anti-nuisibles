import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { getDevis } from '@/lib/services/devis.service'
import { ApiResponse, Devis, Statut } from '@/types'

export async function GET(request: NextRequest) {
    try {
        const authorization = request.headers.get('authorization')
        if (!authorization || !authorization.startsWith('Bearer ')) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Non autorisé.' },
                { status: 401 }
            )
        }

        const token = authorization.split(' ')[1]
        if (!verifyToken(token)) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Token invalide.' },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const statut = searchParams.get('statut') as Statut | null

        const data = await getDevis(statut)

        return NextResponse.json<ApiResponse<Devis[]>>(
            { success: true, data },
            { status: 200 }
        )

    } catch (error) {
        console.error('Erreur API admin devis:', error)
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Erreur serveur.' },
            { status: 500 }
        )
    }
}
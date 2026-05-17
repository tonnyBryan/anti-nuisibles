import { NextRequest, NextResponse } from 'next/server'
import { checkPassword, generateToken } from '@/lib/auth'
import { ApiResponse } from '@/types'

export async function POST(request: NextRequest) {
    try {
        const { password } = await request.json()

        if (!checkPassword(password)) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Mot de passe incorrect.' },
                { status: 401 }
            )
        }

        const token = generateToken()

        const response = NextResponse.json<ApiResponse<{ token: string }>>(
            { success: true, data: { token } },
            { status: 200 }
        )

        response.cookies.set('admin_token', token, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 8,
            path: '/',
        })

        return response

    } catch {
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Erreur serveur.' },
            { status: 500 }
        )
    }
}
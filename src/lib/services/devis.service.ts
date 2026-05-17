import { supabaseAdmin } from '@/lib/supabase'
import { Devis, Statut } from '@/types'

export async function checkRateLimit(ip: string): Promise<boolean> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

    await supabaseAdmin
        .from('rate_limits')
        .delete()
        .lt('created_at', oneHourAgo)

    const { count } = await supabaseAdmin
        .from('rate_limits')
        .select('*', { count: 'exact', head: true })
        .eq('ip', ip)
        .gte('created_at', oneHourAgo)

    return (count ?? 0) < 3
}

export async function registerIp(ip: string): Promise<void> {
    await supabaseAdmin.from('rate_limits').insert({ ip })
}

export function sanitize(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
}

export async function createDevis(data: Omit<Devis, 'id' | 'created_at' | 'statut'>): Promise<string> {
    const sanitized = {
        ...data,
        nom: sanitize(data.nom),
        message: data.message ? sanitize(data.message) : null,
        telephone: data.telephone || null,
    }

    const { data: devis, error } = await supabaseAdmin
        .from('devis')
        .insert(sanitized)
        .select('id')
        .single()

    if (error) throw error

    return devis.id
}

export async function getDevis(statut?: Statut | null): Promise<Devis[]> {
    let query = supabaseAdmin
        .from('devis')
        .select('*')
        .order('created_at', { ascending: false })

    if (statut) {
        query = query.eq('statut', statut)
    }

    const { data, error } = await query

    if (error) throw error

    return data as Devis[]
}

export async function updateDevisStatut(id: string, statut: Statut): Promise<void> {
    const { error } = await supabaseAdmin
        .from('devis')
        .update({ statut })
        .eq('id', id)

    if (error) throw error
}
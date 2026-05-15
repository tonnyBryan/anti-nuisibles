export type Statut = 'nouveau' | 'traite' | 'archive'

export type Nuisible = 'Rats' | 'Cafards' | 'Punaises de lit' | 'Frelons' | 'Autre'

export type Etablissement = 'Restaurant' | 'Hôtel' | 'Copropriété' | 'Autre'

export type Urgence = 'Intervention sous 24h' | 'Contrat annuel' | 'Simple devis'

export interface Devis {
    id: string
    created_at: string
    etablissement: Etablissement
    surface: number
    nuisibles: Nuisible[]
    urgence: Urgence
    nom: string
    email: string
    telephone?: string
    message?: string
    statut: Statut
}

export interface DevisFormData {
    etablissement: Etablissement
    surface: number
    nuisibles: Nuisible[]
    urgence: Urgence
    nom: string
    email: string
    telephone?: string
    message?: string
}
-- Table principale des devis
CREATE TABLE devis (
                       id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                       etablissement TEXT NOT NULL,
                       surface INTEGER NOT NULL,
                       nuisibles JSONB NOT NULL,
                       urgence TEXT NOT NULL,
                       nom TEXT NOT NULL,
                       email TEXT NOT NULL,
                       telephone TEXT,
                       message TEXT,
                       statut TEXT DEFAULT 'nouveau'
);

-- Table pour le rate limiting
CREATE TABLE rate_limits (
                             id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                             ip TEXT NOT NULL,
                             created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.devis TO service_role;
GRANT SELECT, INSERT, DELETE ON public.rate_limits TO service_role;
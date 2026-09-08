-- ==========================================================================
-- CréditNova — Schéma Supabase
-- À exécuter une seule fois dans : Supabase Dashboard > SQL Editor > New query
-- ==========================================================================

-- Table des demandes de prêt
create table if not exists public.demandes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  postal_code text not null,
  loan_purpose text not null,
  employment text not null,
  income numeric,
  amount numeric not null,
  duration_years integer not null,
  monthly_payment numeric,
  created_at timestamptz not null default now()
);

-- Active la sécurité au niveau des lignes (RLS)
alter table public.demandes enable row level security;

-- N'importe qui (visiteur non connecté inclus) peut soumettre une demande
create policy "Tout le monde peut créer une demande"
  on public.demandes for insert
  to anon, authenticated
  with check (true);

-- Un utilisateur connecté ne peut lire que ses propres demandes
create policy "Un utilisateur voit ses propres demandes"
  on public.demandes for select
  to authenticated
  using (auth.uid() = user_id);

-- ==========================================================================
-- Note : le compte propriétaire du projet Supabase peut voir TOUTES les
-- demandes (y compris anonymes) via Table Editor dans le dashboard Supabase,
-- sans être soumis aux politiques RLS ci-dessus.
--
-- L'authentification des comptes clients (inscription/connexion) utilise
-- Supabase Auth nativement : aucune table supplémentaire n'est nécessaire,
-- les utilisateurs sont stockés dans auth.users. Le prénom/nom sont stockés
-- dans les métadonnées du compte (user_metadata) lors de l'inscription.
-- ==========================================================================

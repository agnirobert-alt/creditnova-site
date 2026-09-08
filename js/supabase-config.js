// ==========================================================================
// CréditNova — Configuration Supabase
//
// 1. Créez un projet gratuit sur https://supabase.com
// 2. Allez dans Project Settings > API
// 3. Copiez "Project URL" et la clé "anon public" ci-dessous
//    (cette clé est publique par conception : elle est prévue pour être
//    utilisée côté navigateur, la sécurité réelle est assurée par les
//    règles RLS définies dans supabase/schema.sql)
// 4. Exécutez le contenu de supabase/schema.sql dans le SQL Editor Supabase
// ==========================================================================

const SUPABASE_URL = 'https://gwuarovhdgcxstpsylhu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_cRct1H_HxLyWfv7rRJwJNg_geVQH7-r';

const IS_SUPABASE_CONFIGURED = !SUPABASE_URL.includes('VOTRE-PROJET') && !SUPABASE_ANON_KEY.includes('VOTRE-CLE');

if (!IS_SUPABASE_CONFIGURED) {
  console.warn(
    '[CréditNova] Supabase n\'est pas encore configuré. ' +
    'Renseignez SUPABASE_URL et SUPABASE_ANON_KEY dans js/supabase-config.js ' +
    'pour activer l\'espace client et l\'enregistrement des demandes.'
  );
}

const supabaseClient = IS_SUPABASE_CONFIGURED
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

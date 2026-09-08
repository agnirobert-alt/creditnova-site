// ==========================================================================
// CréditNova — Espace client (authentification Supabase)
// Nécessite js/supabase-config.js chargé avant ce fichier.
// ==========================================================================

const CreditNovaAuth = (() => {

  function ensureConfigured() {
    if (!supabaseClient) {
      throw new Error('Supabase n\'est pas configuré. Voir js/supabase-config.js.');
    }
  }

  async function signup({ firstName, lastName, email, password }) {
    ensureConfigured();
    const { data, error } = await supabaseClient.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { first_name: firstName, last_name: lastName },
      },
    });
    if (error) throw new Error(translateAuthError(error));
    return data;
  }

  async function login({ email, password }) {
    ensureConfigured();
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) throw new Error(translateAuthError(error));
    return data;
  }

  async function logout() {
    ensureConfigured();
    await supabaseClient.auth.signOut();
  }

  async function getSession() {
    if (!supabaseClient) return null;
    const { data } = await supabaseClient.auth.getSession();
    return data.session;
  }

  async function getCurrentUser() {
    const session = await getSession();
    return session ? session.user : null;
  }

  async function requireAuth(redirectTo = 'connexion.html') {
    const user = await getCurrentUser();
    if (!user) {
      window.location.href = redirectTo;
      return null;
    }
    return user;
  }

  function translateAuthError(error) {
    const msg = error.message || '';
    if (/already registered/i.test(msg)) return 'Un compte existe déjà avec cette adresse e-mail.';
    if (/invalid login credentials/i.test(msg)) return 'E-mail ou mot de passe incorrect.';
    if (/email not confirmed/i.test(msg)) return 'Veuillez confirmer votre adresse e-mail avant de vous connecter (vérifiez votre boîte de réception).';
    if (/password should be at least/i.test(msg)) return 'Le mot de passe doit contenir au moins 6 caractères.';
    return msg || 'Une erreur est survenue.';
  }

  // Adjust the "Espace client" header link depending on session state.
  async function syncHeaderLink() {
    const link = document.querySelector('[data-espace-client-link]');
    if (!link) return;
    const user = await getCurrentUser();
    if (user) {
      link.textContent = 'Mon espace';
      link.href = 'espace-client.html';
    } else {
      link.textContent = 'Espace client';
      link.href = 'connexion.html';
    }
  }

  return { signup, login, logout, getSession, getCurrentUser, requireAuth, syncHeaderLink };
})();

document.addEventListener('DOMContentLoaded', () => {
  CreditNovaAuth.syncHeaderLink();
});

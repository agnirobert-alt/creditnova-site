// ==========================================================================
// CréditNova — Page de demande (récap + formulaire)
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {

  const params = new URLSearchParams(window.location.search);
  const amount = Number(params.get('montant')) || 50000;
  const years = Number(params.get('duree')) || 10;

  const formatNumber = (n) => new Intl.NumberFormat('fr-FR').format(Math.round(n));
  const formatEuro = (n) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

  function getRateForDuration(y) {
    if (y <= 3) return 2.9;
    if (y <= 7) return 3.4;
    if (y <= 12) return 3.9;
    if (y <= 20) return 4.4;
    return 4.9;
  }

  function computeMonthlyPayment(principal, annualRatePct, y) {
    const monthlyRate = annualRatePct / 100 / 12;
    const n = y * 12;
    if (monthlyRate === 0) return principal / n;
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
  }

  const rate = getRateForDuration(years);
  const monthly = computeMonthlyPayment(amount, rate, years);

  document.getElementById('recapAmount').textContent = formatNumber(amount) + ' €';
  document.getElementById('recapDuration').textContent = years + (years > 1 ? ' ans' : ' an');
  document.getElementById('recapMonthly').textContent = formatEuro(monthly) + ' / mois';
  document.getElementById('recapEditLink').href = `recapitulatif.html?montant=${amount}&duree=${years}`;

  const form = document.getElementById('requestForm');
  const successCard = document.getElementById('successCard');
  const submitBtn = document.getElementById('submitBtn');
  const submitBtnText = document.getElementById('submitBtnText');
  const submitError = document.getElementById('submitError');

  // Notification par e-mail (best-effort, via le service tiers FormSubmit,
  // aucune inscription requise, simple confirmation par e-mail lors du
  // premier envoi réel). Changez cette adresse pour recevoir les demandes
  // ailleurs. La donnée persistante de référence est enregistrée dans
  // Supabase (voir js/supabase-config.js) : c'est elle qui alimente
  // l'espace client.
  const DESTINATION_EMAIL = 'agnirobert@gmail.com';

  async function saveToSupabase(data) {
    if (typeof supabaseClient === 'undefined' || !supabaseClient) return { skipped: true };
    const { data: sessionData } = await supabaseClient.auth.getSession();
    const userId = sessionData.session ? sessionData.session.user.id : null;

    const { error } = await supabaseClient.from('demandes').insert({
      user_id: userId,
      first_name: data.prenom,
      last_name: data.nom,
      email: data.email,
      phone: data.telephone,
      postal_code: data.code_postal,
      loan_purpose: data.objet_du_pret,
      employment: data.situation_professionnelle,
      income: data.revenu_mensuel_net ? Number(data.revenu_mensuel_net) : null,
      amount,
      duration_years: years,
      monthly_payment: Math.round(monthly),
    });

    if (error) throw error;
  }

  async function notifyByEmail(data) {
    const response = await fetch(`https://formsubmit.co/ajax/${DESTINATION_EMAIL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        ...data,
        montant_du_pret: formatNumber(amount) + ' €',
        duree_de_remboursement: years + ' ans',
        mensualite_estimee: formatEuro(monthly),
        _subject: `Nouvelle demande de prêt — ${formatNumber(amount)} € / ${years} ans`,
      }),
    });

    if (!response.ok) throw new Error('Le service d\'envoi a renvoyé une erreur.');

    const result = await response.json().catch(() => ({}));
    if (result.success === 'false' && /activation/i.test(result.message || '')) {
      // Premier envoi vers cette adresse : FormSubmit exige une activation
      // par e-mail avant de transmettre les demandes suivantes.
      console.info('FormSubmit : e-mail d\'activation envoyé à ' + DESTINATION_EMAIL + '. Cliquez sur le lien reçu pour activer la réception des demandes.');
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitError.hidden = true;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // Piège à robots : si ce champ caché est rempli, on ignore silencieusement.
    if (form._honey.value) return;

    const payload = {
      prenom: document.getElementById('firstName').value.trim(),
      nom: document.getElementById('lastName').value.trim(),
      email: document.getElementById('email').value.trim(),
      telephone: document.getElementById('phone').value.trim(),
      code_postal: document.getElementById('postalCode').value.trim(),
      objet_du_pret: document.getElementById('loanPurpose').value,
      situation_professionnelle: document.getElementById('employment').value,
      revenu_mensuel_net: document.getElementById('income').value,
    };

    submitBtn.disabled = true;
    submitBtnText.textContent = 'Envoi en cours...';

    const results = await Promise.allSettled([saveToSupabase(payload), notifyByEmail(payload)]);
    const supabaseFailed = results[0].status === 'rejected';
    const emailFailed = results[1].status === 'rejected';

    if (supabaseFailed) console.error('Supabase insert error:', results[0].reason);
    if (emailFailed) console.error('FormSubmit error:', results[1].reason);

    if (supabaseFailed && emailFailed) {
      submitError.textContent = "L'envoi a échoué. Vérifiez votre connexion et réessayez, ou contactez-nous directement.";
      submitError.hidden = false;
      submitBtn.disabled = false;
      submitBtnText.textContent = 'Envoyer ma demande';
      return;
    }

    form.hidden = true;
    successCard.hidden = false;
    successCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
});

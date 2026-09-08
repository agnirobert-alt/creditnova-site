// ==========================================================================
// CréditNova — Formulaire de contact (page d'accueil)
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const submitBtn = document.getElementById('contactSubmitBtn');
  const submitBtnText = document.getElementById('contactSubmitBtnText');
  const errorBox = document.getElementById('contactError');
  const successBox = document.getElementById('contactSuccess');

  // Même adresse de réception que le formulaire de demande de prêt.
  const DESTINATION_EMAIL = 'agnirobert@gmail.com';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.hidden = true;
    successBox.hidden = true;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (form._honey.value) return;

    submitBtn.disabled = true;
    submitBtnText.textContent = 'Envoi en cours...';

    try {
      const response = await fetch(`https://formsubmit.co/ajax/${DESTINATION_EMAIL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          nom: document.getElementById('contactName').value.trim(),
          email: document.getElementById('contactEmail').value.trim(),
          message: document.getElementById('contactMessage').value.trim(),
          _subject: 'Nouveau message de contact — CréditNova',
        }),
      });

      if (!response.ok) throw new Error('Le service d\'envoi a renvoyé une erreur.');

      form.reset();
      successBox.hidden = false;
    } catch (err) {
      errorBox.textContent = "L'envoi a échoué. Vérifiez votre connexion et réessayez.";
      errorBox.hidden = false;
    } finally {
      submitBtn.disabled = false;
      submitBtnText.textContent = 'Envoyer le message';
    }
  });
});

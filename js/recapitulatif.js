// ==========================================================================
// CréditNova — Récapitulatif complet des paramètres de crédit
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

  function formatStartDate() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const formatted = start.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    return formatted.replace(/^1 /, '1er ');
  }

  const rate = getRateForDuration(years);
  const monthly = computeMonthlyPayment(amount, rate, years);
  const totalPayments = monthly * years * 12;
  const totalInterest = totalPayments - amount;

  document.getElementById('sumAmount').textContent = formatNumber(amount) + ' €';
  document.getElementById('sumDuration').textContent = years + (years > 1 ? ' ans' : ' an');
  document.getElementById('sumRate').textContent = rate.toFixed(1).replace('.', ',') + ' %';
  document.getElementById('sumStartDate').textContent = formatStartDate();
  document.getElementById('sumMonthly').textContent = formatEuro(monthly) + ' / mois';
  document.getElementById('sumTotalPayments').textContent = formatEuro(totalPayments);
  document.getElementById('sumTotalInterest').textContent = formatEuro(totalInterest);

  document.getElementById('proceedBtn').addEventListener('click', () => {
    window.location.href = `demande.html?montant=${amount}&duree=${years}`;
  });
});

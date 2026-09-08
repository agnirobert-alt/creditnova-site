// ==========================================================================
// CréditNova — Simulateur de prêt
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {

  const amountSlider = document.getElementById('amountSlider');
  const durationSlider = document.getElementById('durationSlider');
  const amountValue = document.getElementById('amountValue');
  const durationValue = document.getElementById('durationValue');
  const monthlyPayment = document.getElementById('monthlyPayment');
  const taegValue = document.getElementById('taegValue');
  const totalCost = document.getElementById('totalCost');
  const continueBtn = document.getElementById('continueBtn');
  const amountChips = document.querySelectorAll('#amountChips .chip');
  const durationChips = document.querySelectorAll('#durationChips .chip');

  const formatNumber = (n) => new Intl.NumberFormat('fr-FR').format(Math.round(n));
  const formatEuro = (n) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

  // TAEG varies slightly with duration: shorter = lower rate, longer = slightly higher
  function getRateForDuration(years) {
    if (years <= 3) return 2.9;
    if (years <= 7) return 3.4;
    if (years <= 12) return 3.9;
    if (years <= 20) return 4.4;
    return 4.9;
  }

  function updateSliderFill(slider) {
    const min = Number(slider.min);
    const max = Number(slider.max);
    const val = Number(slider.value);
    const pct = ((val - min) / (max - min)) * 100;
    const color = slider.classList.contains('slider-blue') ? 'var(--blue)' : 'var(--purple)';
    slider.style.background = `linear-gradient(90deg, ${color} ${pct}%, var(--ink-200) ${pct}%)`;
  }

  function computeMonthlyPayment(principal, annualRatePct, years) {
    const monthlyRate = annualRatePct / 100 / 12;
    const n = years * 12;
    if (monthlyRate === 0) return principal / n;
    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
    return payment;
  }

  function setActiveChip(chips, matchValue) {
    chips.forEach(chip => {
      const chipVal = Number(chip.dataset.amount || chip.dataset.duration);
      chip.classList.toggle('active', chipVal === matchValue);
    });
  }

  function updateSimulation() {
    const amount = Number(amountSlider.value);
    const years = Number(durationSlider.value);
    const rate = getRateForDuration(years);

    amountValue.textContent = formatNumber(amount);
    durationValue.textContent = years;
    taegValue.textContent = rate.toFixed(1).replace('.', ',') + ' %';

    const payment = computeMonthlyPayment(amount, rate, years);
    monthlyPayment.textContent = formatEuro(payment);

    const total = payment * years * 12;
    const cost = total - amount;
    totalCost.textContent = formatEuro(cost);

    updateSliderFill(amountSlider);
    updateSliderFill(durationSlider);
    setActiveChip(amountChips, amount);
    setActiveChip(durationChips, years);
  }

  amountSlider.addEventListener('input', updateSimulation);
  durationSlider.addEventListener('input', updateSimulation);

  amountChips.forEach(chip => {
    chip.addEventListener('click', () => {
      amountSlider.value = chip.dataset.amount;
      updateSimulation();
    });
  });

  durationChips.forEach(chip => {
    chip.addEventListener('click', () => {
      durationSlider.value = chip.dataset.duration;
      updateSimulation();
    });
  });

  continueBtn.addEventListener('click', () => {
    const amount = amountSlider.value;
    const years = durationSlider.value;
    window.location.href = `recapitulatif.html?montant=${amount}&duree=${years}`;
  });

  // Mobile nav toggle
  const burgerBtn = document.getElementById('burgerBtn');
  const mainNav = document.getElementById('mainNav');
  if (burgerBtn) {
    burgerBtn.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('open');
      burgerBtn.setAttribute('aria-expanded', isOpen);
    });
  }

  updateSimulation();
});

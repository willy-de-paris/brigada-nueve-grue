// Menu mobile
const burger = document.querySelector('.burger');
const menu = document.getElementById('menu');
burger.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  burger.setAttribute('aria-expanded', open);
});
menu.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => {
    menu.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  })
);

// Onglets des conceptions
const tabs = document.querySelectorAll('.tabs button');
tabs.forEach(tab =>
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.setAttribute('aria-selected', t === tab));
    document.querySelectorAll('.panel').forEach(p => {
      p.hidden = p.id !== tab.dataset.tab;
    });
  })
);

// Calculateur d'effort
const mass = document.getElementById('mass');
const ratio = document.getElementById('ratio');
const result = document.getElementById('result');
function update() {
  const m = parseFloat(mass.value);
  const r = parseFloat(ratio.value);
  if (!(m >= 0) || !(r >= 1)) {
    result.textContent = 'Entre une masse ≥ 0 et un rapport ≥ 1.';
    return;
  }
  const force = (m * 9.81) / r;
  result.textContent = `Effort ≈ ${force.toFixed(1)} N (${(force / 9.81).toFixed(1)} kg)`;
}
mass.addEventListener('input', update);
ratio.addEventListener('input', update);
update();
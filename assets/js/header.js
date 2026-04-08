// Injects the COSMO site header into any page that loads this script.
// Position: fixed top-left, z-index overlay — does not affect page layout or animations.

(function () {
  const el = document.createElement('div');
  el.id = 'site-title';
  el.textContent = 'Cosmo';
  el.style.cssText = [
    'position:fixed',
    'top:6vh',
    'left:6vw',
    'font-family:\'Archivo Black\',sans-serif',
    'font-size:clamp(0.85rem,1.2vw,1rem)',
    'letter-spacing:0.14em',
    'color:#111111',
    'text-transform:uppercase',
    'z-index:10',
    'cursor:default',
    'user-select:none',
  ].join(';');
  document.body.appendChild(el);
})();

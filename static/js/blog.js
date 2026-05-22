// Magnetic buttons
document.querySelectorAll('.magnetic').forEach((el) => {
  el.addEventListener('mousemove', (e) => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) * 0.25;
    const y = (e.clientY - r.top - r.height / 2) * 0.35;
    el.style.transform = `translate(${x}px, ${y}px)`;
  });
  el.addEventListener('mouseleave', () => { el.style.transform = 'translate(0,0)'; });
});

// Parallax on hero illustration
const art = document.getElementById('heroArt');
if (art) {
  window.addEventListener('scroll', () => {
    art.style.transform = `translateY(${window.scrollY * -0.08}px)`;
  }, { passive: true });
}

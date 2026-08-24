/* Landing page effects: scroll progress, nav elevation, reveal-on-scroll */

const progressBar = document.getElementById('progress-bar');
const nav = document.getElementById('site-nav');
const reveals = document.querySelectorAll('.reveal');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

function onScroll() {
  const scrollable = document.documentElement.scrollHeight - innerHeight;
  const pct = scrollable > 0 ? (scrollY / scrollable) * 100 : 0;
  progressBar.style.width = pct + '%';
  nav.classList.toggle('scrolled', scrollY > 24);

  // gentle parallax drift on the hero blobs
  if (!reducedMotion) {
    document.querySelectorAll('.blob').forEach((blob, i) => {
      blob.style.translate = `0 ${scrollY * (i ? -0.06 : 0.08)}px`;
    });
  }
}

document.addEventListener('scroll', onScroll, { passive: true });
onScroll();

if (reducedMotion || !('IntersectionObserver' in window)) {
  reveals.forEach(el => el.classList.add('in'));
} else {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px' });

  reveals.forEach(el => observer.observe(el));
}

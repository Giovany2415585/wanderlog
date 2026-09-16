// PARTICLES
const canvas = document.getElementById('particles');
if (canvas) {
  const ctx = canvas.getContext('2d');
  function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
  resize();
  window.addEventListener('resize', resize);
  const COLORS = ['rgba(124,92,191,','rgba(43,191,176,','rgba(212,168,67,','rgba(165,132,216,'];
  const PTS = Array.from({length:55}, () => ({
    x: Math.random()*innerWidth, y: Math.random()*innerHeight,
    r: Math.random()*2.5+0.5, dx:(Math.random()-0.5)*0.35, dy:(Math.random()-0.5)*0.35,
    c: COLORS[Math.floor(Math.random()*COLORS.length)],
    a: Math.random()*0.3+0.08, p: Math.random()*Math.PI*2
  }));
  (function anim() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    PTS.forEach(p => {
      p.p += 0.018;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle = p.c+(p.a+Math.sin(p.p)*0.07)+')'; ctx.fill();
      p.x+=p.dx; p.y+=p.dy;
      if(p.x<0) p.x=canvas.width; if(p.x>canvas.width) p.x=0;
      if(p.y<0) p.y=canvas.height; if(p.y>canvas.height) p.y=0;
    });
    requestAnimationFrame(anim);
  })();
}

// NAV SCROLL
const nav = document.getElementById('nav');
if (nav) window.addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 60));

// HERO PARALLAX
const heroImg = document.getElementById('heroImg');
if (heroImg) {
  setTimeout(() => heroImg.classList.add('loaded'), 100);
  window.addEventListener('scroll', () => {
    heroImg.style.transform = `scale(1.05) translateY(${scrollY*0.22}px)`;
  });
}

// SCROLL REVEAL
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const d = e.target.classList.contains('d4') ? 400
        : e.target.classList.contains('d3') ? 300
        : e.target.classList.contains('d2') ? 200
        : e.target.classList.contains('d1') ? 100 : 0;
      setTimeout(() => e.target.classList.add('visible'), d);
    }
  });
}, { threshold: 0.08 });
document.querySelectorAll('.reveal,.reveal-l,.reveal-r').forEach(el => revealObs.observe(el));

// DAY CARDS ACCORDION
document.querySelectorAll('.day-header').forEach(header => {
  header.addEventListener('click', () => {
    const body = header.nextElementSibling;
    const chevron = header.querySelector('.day-chevron');
    const isOpen = body.classList.contains('open');
    body.classList.toggle('open', !isOpen);
    chevron && chevron.classList.toggle('open', !isOpen);
    header.classList.toggle('open', !isOpen);
  });
});

// CHECKLIST TOGGLE
function animateCount(el, to) {
  const from = parseInt(el.textContent) || 0;
  if (from === to) { el.textContent = to + '%'; return; }
  const start = performance.now(), dur = 600;
  (function step(now) {
    const p = Math.min(1, (now - start) / dur);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(from + (to - from) * eased) + '%';
    if (p < 1) requestAnimationFrame(step);
  })(start);
}

document.querySelectorAll('.cbox').forEach(box => {
  box.addEventListener('click', async () => {
    const id = box.dataset.id;
    if (!id) {
      box.classList.toggle('checked');
      const text = box.parentElement.querySelector('.ci-text');
      if (text) text.classList.toggle('done');
      return;
    }
    try {
      const res = await fetch(`/api/checklist/${id}`, { method: 'PATCH' });
      const data = await res.json();
      box.classList.toggle('checked', data.done);
      const text = box.parentElement.querySelector('.ci-text');
      if (text) text.classList.toggle('done', data.done);
      // Update progress bars
      document.querySelectorAll('.prog-fill').forEach(bar => bar.style.width = data.progress+'%');
      document.querySelectorAll('.big-fill').forEach(bar => bar.style.width = data.progress+'%');
      document.querySelectorAll('.prog-pct-val').forEach(el => animateCount(el, data.progress));
      document.querySelectorAll('.big-pct').forEach(el => animateCount(el, data.progress));
      document.querySelectorAll('.prog-done-cnt').forEach(el => el.textContent = data.done_cnt);
      showToast(data.done ? 'Tarea completada' : 'Tarea pendiente');
    } catch(e) { console.error(e); }
  });
});

// SPOTLIGHT HOVER GLOW
document.querySelectorAll('.spotlight').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
    card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
  });
});

// COUNT-UP ON SCROLL INTO VIEW
const countObs = new IntersectionObserver((entries, obs) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, target = parseInt(el.dataset.target) || 0;
    const isPct = el.textContent.includes('%');
    const start = performance.now(), dur = 1100;
    (function step(now) {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + (isPct ? '%' : '');
      if (p < 1) requestAnimationFrame(step);
    })(start);
    obs.unobserve(el);
  });
}, { threshold: 0.4 });
document.querySelectorAll('.count-up').forEach(el => countObs.observe(el));

// TOAST
function showToast(msg) {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id='toast'; t.className='toast'; document.body.appendChild(t); }
  t.innerHTML = `<span class="toast-dot"></span>${msg}`;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2800);
}
window.showToast = showToast;

// MODAL
const modalOverlay = document.getElementById('modalOverlay');
const openModalBtn = document.getElementById('openModal');
const closeModalBtn = document.getElementById('closeModal');

if (openModalBtn && modalOverlay) {
  openModalBtn.addEventListener('click', () => modalOverlay.classList.add('open'));
}
if (closeModalBtn && modalOverlay) {
  closeModalBtn.addEventListener('click', () => modalOverlay.classList.remove('open'));
}
if (modalOverlay) {
  modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) modalOverlay.classList.remove('open'); });
}

// ADD TRIP FORM
const addTripForm = document.getElementById('addTripForm');
if (addTripForm) {
  addTripForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(addTripForm);
    const body = Object.fromEntries(fd.entries());
    try {
      const res = await fetch('/api/trips', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
      const trip = await res.json();
      if (trip.id) {
        showToast('Viaje agregado correctamente');
        modalOverlay.classList.remove('open');
        setTimeout(() => window.location.href = `/trip/${trip.id}`, 1200);
      }
    } catch(e) { console.error(e); showToast('Error al agregar el viaje'); }
  });
}

// OPEN FIRST DAY
document.addEventListener('DOMContentLoaded', () => {
  const firstHeader = document.querySelector('.day-header');
  if (firstHeader) {
    const body = firstHeader.nextElementSibling;
    const chevron = firstHeader.querySelector('.day-chevron');
    body && body.classList.add('open');
    chevron && chevron.classList.add('open');
    firstHeader.classList.add('open');
  }
});

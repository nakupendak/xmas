/**
 * Wiener Weihnachtszauber - Interactive Script
 * Snowfall animation, gallery filtering, lightbox & contact form
 */

document.addEventListener('DOMContentLoaded', () => {
  initSnowfall();
  initMobileMenu();
  initGalleryFilter();
  initLightbox();
  initNavbarScroll();
});

/* -------------------------------------------------------------------------
   1. Snowfall Canvas Effect
   ------------------------------------------------------------------------- */
let snowActive = true;
let snowAnimationId = null;

function initSnowfall() {
  const canvas = document.getElementById('snow-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const isMobile = window.innerWidth < 768;
  const flakeCount = isMobile ? Math.min(Math.floor(width / 20), 26) : Math.min(Math.floor(width / 22), 65);
  const flakes = [];

  for (let i = 0; i < flakeCount; i++) {
    flakes.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 2.6 + 1.0,
      d: Math.random() * flakeCount,
      speed: Math.random() * 0.7 + 0.35,
      opacity: Math.random() * 0.55 + 0.25,
      sway: Math.random() * 0.02 - 0.01,
    });
  }

  function renderSnow() {
    if (!snowActive) return;

    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < flakeCount; i++) {
      const f = flakes[i];
      ctx.beginPath();
      ctx.fillStyle = `rgba(255, 255, 255, ${f.opacity})`;
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2, true);
      ctx.fill();

      // Update positions
      f.y += f.speed;
      f.x += Math.sin(f.d) * 0.6 + f.sway;
      f.d += 0.01;

      // Wrap around edges
      if (f.y > height) {
        flakes[i] = {
          x: Math.random() * width,
          y: -10,
          r: f.r,
          d: f.d,
          speed: f.speed,
          opacity: f.opacity,
          sway: f.sway,
        };
      }
      if (f.x > width + 10) f.x = -10;
      if (f.x < -10) f.x = width + 10;
    }

    snowAnimationId = requestAnimationFrame(renderSnow);
  }

  renderSnow();

  // Snow toggle button
  const toggleBtn = document.getElementById('snow-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      snowActive = !snowActive;
      toggleBtn.classList.toggle('inactive', !snowActive);
      toggleBtn.title = snowActive ? 'Schnee ausschalten' : 'Schnee einschalten';

      if (snowActive) {
        renderSnow();
      } else {
        cancelAnimationFrame(snowAnimationId);
        ctx.clearRect(0, 0, width, height);
      }
    });
  }
}

/* -------------------------------------------------------------------------
   2. Mobile Navigation Menu
   ------------------------------------------------------------------------- */
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const navMenu = document.getElementById('nav-menu');
  if (!menuBtn || !navMenu) return;

  function closeMenu() {
    navMenu.classList.remove('active');
    menuBtn.classList.remove('active');
    document.body.style.overflow = '';
  }

  function toggleMenu() {
    const isActive = navMenu.classList.toggle('active');
    menuBtn.classList.toggle('active', isActive);
    document.body.style.overflow = isActive ? 'hidden' : '';
  }

  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  // Close menu when clicking links
  navMenu.querySelectorAll('.nav-link, .nav-cta').forEach((link) => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !menuBtn.contains(e.target) && navMenu.classList.contains('active')) {
      closeMenu();
    }
  });

  // Close on Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
      closeMenu();
    }
  });
}

/* -------------------------------------------------------------------------
   3. Gallery Filtering
   ------------------------------------------------------------------------- */
function initGalleryFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.gallery-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      cards.forEach((card) => {
        const category = card.dataset.category;
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 20);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 250);
        }
      });
    });
  });
}

/* -------------------------------------------------------------------------
   4. Gallery Lightbox Modal
   ------------------------------------------------------------------------- */
const galleryImages = [
  { src: 'dek1.jpeg', title: 'Festlicher Eingangsbereich & Schaufensterbogen' },
  { src: 'dek2.jpeg', title: 'Stimmungsvolle Tisch- und Thekendekoration für Gastronomie' },
  { src: 'dek3.jpeg', title: 'Klassischer Weihnachtsbaum & Goldene Details' },
  { src: 'dek4.jpeg', title: 'Strahlende Schaufensterbeleuchtung mit Weihnachtssternen' },
  { src: 'dek5.jpeg', title: 'Warme Lounge- und Kaminatmosphäre' },
  { src: 'dek5.jpg', title: 'Kompakte Schaufensterdekoration für Boutiquen' },
  { src: 'dek6.jpg', title: 'Hängende Tannengirlanden & Deckenakzente' },
  { src: 'dek7.jpg', title: 'Natürlicher Tannen- & Holzcharme' },
  { src: 'dek9.jpg', title: 'Stimmungsvolle Gastraum- und Tischdekoration' }
];

let currentLightboxIndex = 0;

function initLightbox() {
  const modal = document.getElementById('lightbox-modal');
  if (!modal) return;

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextLightbox();
    if (e.key === 'ArrowLeft') prevLightbox();
  });

  // Mobile Touch Swipe Support
  let touchStartX = 0;
  let touchStartY = 0;

  modal.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }
  }, { passive: true });

  modal.addEventListener('touchend', (e) => {
    if (e.changedTouches.length === 1) {
      const diffX = e.changedTouches[0].clientX - touchStartX;
      const diffY = e.changedTouches[0].clientY - touchStartY;
      // Trigger if swipe is primarily horizontal and > 40px
      if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX < 0) {
          nextLightbox();
        } else {
          prevLightbox();
        }
      }
    }
  }, { passive: true });
}

function openLightbox(src, caption) {
  const modal = document.getElementById('lightbox-modal');
  const img = document.getElementById('lightbox-img');
  const captionEl = document.getElementById('lightbox-caption');
  const counterEl = document.getElementById('lightbox-counter');

  const foundIndex = galleryImages.findIndex((item) => item.src === src);
  if (foundIndex !== -1) {
    currentLightboxIndex = foundIndex;
  }

  img.src = src;
  captionEl.textContent = caption || '';
  if (counterEl) {
    counterEl.textContent = `${currentLightboxIndex + 1} / ${galleryImages.length}`;
  }
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const modal = document.getElementById('lightbox-modal');
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

function nextLightbox() {
  currentLightboxIndex = (currentLightboxIndex + 1) % galleryImages.length;
  updateLightboxContent();
}

function prevLightbox() {
  currentLightboxIndex = (currentLightboxIndex - 1 + galleryImages.length) % galleryImages.length;
  updateLightboxContent();
}

function updateLightboxContent() {
  const item = galleryImages[currentLightboxIndex];
  const img = document.getElementById('lightbox-img');
  const captionEl = document.getElementById('lightbox-caption');
  const counterEl = document.getElementById('lightbox-counter');
  if (item && img && captionEl) {
    img.style.opacity = '0.3';
    setTimeout(() => {
      img.src = item.src;
      captionEl.textContent = item.title;
      if (counterEl) {
        counterEl.textContent = `${currentLightboxIndex + 1} / ${galleryImages.length}`;
      }
      img.style.opacity = '1';
    }, 150);
  }
}

// Expose lightbox functions globally for inline onclick handlers
window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;
window.prevLightbox = prevLightbox;
window.nextLightbox = nextLightbox;

/* -------------------------------------------------------------------------
   5. Navbar Shadow on Scroll
   ------------------------------------------------------------------------- */
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      navbar.style.boxShadow = '0 10px 25px rgba(27, 59, 43, 0.08)';
    } else {
      navbar.style.boxShadow = 'none';
    }
  });
}

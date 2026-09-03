
// ===== MOTION FX (tilt + parallax) =====
function initTiltCards() {
  if (window.matchMedia('(hover: none), (pointer: coarse), (max-width: 900px)').matches) return;
  const cards = document.querySelectorAll('.member-card, .crew-link-card, .tz-card');
  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      const rx = (0.5 - y) * 10;
      const ry = (x - 0.5) * 12;
      card.classList.add('is-tilting');
      card.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.classList.remove('is-tilting');
      card.style.transform = '';
    });
  });
}

function initParallax() {
  if (window.matchMedia('(hover: none), (pointer: coarse), (max-width: 900px)').matches) return;
  const orbs = document.querySelectorAll('.fx-orb');
  const wallpaper = document.querySelector('.hero-wallpaper-img, .hero-wallpaper img');
  window.addEventListener('mousemove', (e) => {
    const cx = (e.clientX / window.innerWidth - 0.5) * 2;
    const cy = (e.clientY / window.innerHeight - 0.5) * 2;
    orbs.forEach((orb, i) => {
      const f = (i + 1) * 8;
      orb.style.translate = `${cx * f}px ${cy * f}px`;
    });
    if (wallpaper) {
      wallpaper.style.setProperty('--px', (cx * -10) + 'px');
      wallpaper.style.setProperty('--py', (cy * -6) + 'px');
    }
  });
}


// ===== BOOT SCREEN =====
const bootScreen = document.getElementById('boot-screen');
const bootStatus = document.getElementById('bootStatus');
const bootBar = document.getElementById('bootBar');

const bootMessages = [
  'INITIALIZING SYSTEM...',
  'CAR MEETS LOADING...',
  'LEGACY SERVER LOADING...',
  'FIVEM LINK ESTABLISHING...',
  'STREET CIRCUIT ONLINE...',
  'NEON GRID SYNC...',
  'CREW MODULES ACTIVE...',
  'ENGINES ONLINE'
];

let bootFinished = false;

function finishBoot() {
  if (bootFinished) return;
  bootFinished = true;

  document.body.classList.remove('booting');

  if (bootScreen) {
    bootScreen.classList.add('done');
    bootScreen.setAttribute('aria-hidden', 'true');
    // Force hide even against CSS !important
    bootScreen.style.setProperty('display', 'none', 'important');
    bootScreen.style.setProperty('opacity', '0', 'important');
    bootScreen.style.setProperty('visibility', 'hidden', 'important');
    bootScreen.style.setProperty('pointer-events', 'none', 'important');
  }
}

function spawnBootParticles() {
  const host = document.getElementById('bootParticles');
  if (!host) return;
  try {
    host.innerHTML = '';
    for (let i = 0; i < 24; i++) {
      const el = document.createElement('span');
      el.className = 'boot-particle';
      el.style.left = Math.random() * 100 + '%';
      el.style.animationDuration = (7 + Math.random() * 10) + 's';
      el.style.animationDelay = (Math.random() * 4) + 's';
      const s = 1 + Math.random() * 2;
      el.style.width = s + 'px';
      el.style.height = s + 'px';
      host.appendChild(el);
    }
  } catch (_) {}
}

function setMeter(id, pctId, value) {
  const bar = document.getElementById(id);
  const label = document.getElementById(pctId);
  if (bar) bar.style.width = value + '%';
  if (label) label.textContent = value + '%';
}

function runBoot() {
  // Absolute safety: never stay locked on boot
  setTimeout(finishBoot, 3500);

  if (!bootScreen) {
    finishBoot();
    return;
  }

  const isMobile = window.matchMedia('(max-width: 900px), (hover: none), (pointer: coarse)').matches;
  const stepMs = isMobile ? 220 : 320;
  const endDelay = isMobile ? 180 : 320;

  bootScreen.classList.remove('done');
  bootScreen.style.removeProperty('display');
  bootScreen.style.opacity = '1';
  bootScreen.style.visibility = 'visible';

  document.body.classList.add('booting');
  spawnBootParticles();

  const pctEl = document.getElementById('bootPercent');
  const logLines = document.querySelectorAll('.boot-log-line[data-log]');
  let i = 0;

  const step = () => {
    if (bootFinished) return;
    try {
      if (i < bootMessages.length) {
        if (bootStatus) bootStatus.textContent = bootMessages[i];
        const pct = Math.round(((i + 1) / bootMessages.length) * 100);
        if (bootBar) bootBar.style.width = pct + '%';
        if (pctEl) pctEl.textContent = pct + '%';

        setMeter('m1', 'mp1', Math.min(100, Math.round(pct * 1.05)));
        setMeter('m2', 'mp2', Math.min(100, Math.round(pct * 0.92)));
        setMeter('m3', 'mp3', Math.min(100, Math.round(pct * 0.85)));
        setMeter('m4', 'mp4', Math.min(100, Math.round(pct * 0.78)));

        logLines.forEach((line) => {
          const n = parseInt(line.getAttribute('data-log'), 10);
          if (i >= n) line.classList.add('on');
        });

        i++;
        setTimeout(step, stepMs);
      } else {
        setMeter('m1', 'mp1', 100);
        setMeter('m2', 'mp2', 100);
        setMeter('m3', 'mp3', 100);
        setMeter('m4', 'mp4', 100);
        if (pctEl) pctEl.textContent = '100%';
        if (bootStatus) bootStatus.textContent = 'SYSTEM READY · ENGINES ONLINE';
        setTimeout(finishBoot, endDelay);
      }
    } catch (err) {
      console.error(err);
      finishBoot();
    }
  };

  setTimeout(step, 100);
}

// ===== CUSTOM CURSOR =====
const cursorDot = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');
let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
let trailTick = 0;

function initCursor() {
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!fine || !cursorDot || !cursorRing) return;

  document.body.classList.add('custom-cursor');

  let lastX = 0;
  let lastY = 0;
  let lastT = 0;
  let sparkTick = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top = mouseY + 'px';
    cursorDot.style.opacity = '1';

    const now = performance.now();
    const dx = mouseX - lastX;
    const dy = mouseY - lastY;
    const dist = Math.hypot(dx, dy);
    const dt = Math.max(1, now - lastT);
    const speed = dist / dt;

    // Shooting-star trail: denser when moving faster
    if (dist > 2) {
      sparkTick++;
      const count = speed > 1.2 ? 3 : speed > 0.5 ? 2 : 1;
      const angle = Math.atan2(dy, dx);

      for (let n = 0; n < count; n++) {
        const star = document.createElement('div');
        star.className = 'cursor-trail star-trail';

        const spread = (Math.random() - 0.5) * 0.5;
        const a = angle + Math.PI + spread; // trail behind movement
        const len = 18 + Math.random() * 28 + speed * 12;
        const ox = Math.cos(a) * (4 + Math.random() * 10);
        const oy = Math.sin(a) * (4 + Math.random() * 10);

        star.style.left = (mouseX + ox) + 'px';
        star.style.top = (mouseY + oy) + 'px';
        star.style.width = len + 'px';
        star.style.transform =
          'translate(-20%, -50%) rotate(' + (angle * 180 / Math.PI) + 'deg)';

        // color cycle cyan / violet / pink
        const palette = [
          'rgba(103, 232, 249, 0.45)',
          'rgba(196, 181, 253, 0.5)',
          'rgba(244, 114, 182, 0.42)',
          'rgba(255, 255, 255, 0.48)',
        ];
        const c = palette[(sparkTick + n) % palette.length];
        star.style.setProperty('--star', c);

        document.body.appendChild(star);
        setTimeout(() => star.remove(), 420 + Math.random() * 180);
      }

      // small spark head
      if (sparkTick % 2 === 0) {
        const spark = document.createElement('div');
        spark.className = 'cursor-trail star-spark';
        spark.style.left = mouseX + 'px';
        spark.style.top = mouseY + 'px';
        document.body.appendChild(spark);
        setTimeout(() => spark.remove(), 300);
      }
    }

    lastX = mouseX;
    lastY = mouseY;
    lastT = now;
  });
}

// ===== BUTTON GLOW FOLLOW =====
function initButtonGlow() {
  document.querySelectorAll('.btn-primary, .btn-secondary').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      btn.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
      btn.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
    });
  });
}

// ===== MOBILE MENU =====
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');

if (menuToggle && mobileMenu) {
  const closeMenu = () => {
    mobileMenu.classList.remove('open');
    document.body.classList.remove('menu-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  };
  const openMenu = () => {
    mobileMenu.classList.add('open');
    document.body.classList.add('menu-open');
    menuToggle.setAttribute('aria-expanded', 'true');
  };

  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.addEventListener('click', () => {
    if (mobileMenu.classList.contains('open')) closeMenu();
    else openMenu();
  });
  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => closeMenu());
  });
  // Fecha ao redimensionar para desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1180) closeMenu();
  });
}

// ===== STATS =====
const animateStats = () => {
  const stats = document.querySelectorAll('.stat-num');
  stats.forEach((stat) => {
    const target = parseInt(stat.getAttribute('data-target'), 10);
    if (isNaN(target)) return;
    let current = 0;
    const duration = 1500;
    const step = target / (duration / 16);
    const update = () => {
      current += step;
      if (current < target) {
        stat.textContent = Math.floor(current);
        requestAnimationFrame(update);
      } else {
        stat.textContent = target;
      }
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          update();
          observer.disconnect();
        }
      });
    }, { threshold: 0.5 });
    observer.observe(stat);
  });
};

// ===== REVEAL ON SCROLL =====
const revealElements = () => {
  const elements = document.querySelectorAll(
    '.meet-card, .fivem-card, .member-card, .feature, .rule, .tz-card, .crew-link-card, .meeting-card, .meetup-pic-card, .contact-card'
  );
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );
  elements.forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });
};

// ===== NAVBAR =====
const handleNavbar = () => {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.style.background =
      window.scrollY > 40 ? 'rgba(5, 5, 10, 0.95)' : 'rgba(5, 5, 10, 0.85)';
  });
};

// ===== SCANLINES =====
function addScanlines() {
  const s = document.createElement('div');
  s.className = 'scanlines';
  s.setAttribute('aria-hidden', 'true');
  document.body.appendChild(s);
}

// ===== COPY NOTE (join page) =====
function initCopyButtons() {
  const nickInput = document.getElementById('rockstarNick');
  const msgEl = document.getElementById('inviteMsgText');
  const template =
    'Rockstar nickname: [YOUR_ROCKSTAR_NICKNAME]\n\n' +
    'Hi! I would like to join the Bovary Club Society and your Discord server. ' +
    'I found you through the website and would like to request an invite. Thank you!';

  function refreshInviteMessage() {
    if (!msgEl) return;
    const nick = (nickInput && nickInput.value.trim()) || '[YOUR_ROCKSTAR_NICKNAME]';
    msgEl.textContent = template.replace('[YOUR_ROCKSTAR_NICKNAME]', nick);
  }

  if (nickInput) {
    nickInput.addEventListener('input', refreshInviteMessage);
  }

  document.querySelectorAll('[data-copy-target]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-copy-target');
      const el = document.getElementById(id);
      if (!el) return;
      refreshInviteMessage();
      const text = (el.textContent || '').trim();
      try {
        await navigator.clipboard.writeText(text);
        const prev = btn.textContent;
        btn.textContent = 'COPIED!';
        btn.classList.add('copied');
        const hint = document.getElementById('copyHint');
        if (hint) hint.textContent = 'Copied! Open the Discord profile and paste in the DM.';
        setTimeout(() => {
          btn.textContent = prev || 'COPY';
          btn.classList.remove('copied');
        }, 2000);
      } catch (_) {
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        btn.textContent = 'SELECT & CTRL+C';
      }
    });
  });
}

// ===== SAFE IMAGE FALLBACKS (no inline onerror) =====
function initImageFallbacks() {
  document.querySelectorAll('img').forEach((img) => {
    img.addEventListener('error', () => {
      // Avatar / emblem: hide broken image, keep fallback letter if present
      if (img.closest('.member-avatar, .crew-link-emblem, .crew-link-icon, .crew-icon-img')) {
        img.style.display = 'none';
        return;
      }
      // YouTube thumbs: try hqdefault if maxres fails
      if (img.src && img.src.includes('maxresdefault')) {
        img.src = img.src.replace('maxresdefault', 'hqdefault');
        return;
      }
    }, { once: true });
  });
}

// ===== INIT =====

document.addEventListener('DOMContentLoaded', () => {
  initImageFallbacks();
  initCopyButtons();
  runBoot();
  initCursor();
  initButtonGlow();
  animateStats();
  revealElements();
  handleNavbar();
  addScanlines();
  initTiltCards();
  initParallax();
});

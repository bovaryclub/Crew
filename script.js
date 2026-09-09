
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


// ===== FLOATING MUSIC PLAYER =====
// Fill these arrays with direct ImageKit (or CDN) .mp3 URLs.
// Example: { title: "Night Drive", src: "https://ik.imagekit.io/BassaniStudios/bovary%20pic%20meet/MUSICS/track1.mp3" }

const PLAYLIST_MAIN = [
  { title: "Heathens — twenty one pilots", src: "https://ik.imagekit.io/BassaniStudios/bovary%20pic%20meet/MUSICS/twenty%20one%20pilots%20Heathens%20(from%20Suicide%20Squad%20The%20Album)%20_OFFICIAL%20VIDEO_%20-%20Fueled%20By%20Ramen.mp3?updatedAt=1788670416847" },
  { title: "See You Again — Wiz Khalifa ft. Charlie Puth", src: "https://ik.imagekit.io/BassaniStudios/bovary%20pic%20meet/MUSICS/Wiz%20Khalifa%20-%20See%20You%20Again%20ft.%20Charlie%20Puth%20_Official%20Video_%20Furious%207%20Soundtrack.mp3?updatedAt=1788670276822" },
  { title: "When Worlds Collide — Powerman 5000", src: "https://ik.imagekit.io/BassaniStudios/bovary%20pic%20meet/MUSICS/When%20Worlds%20Collide%20-%20Powerman%205000%20-%20SpenceIsAChef.mp3?updatedAt=1788670451819" },
  { title: "Voyage, Voyage — Desireless", src: "https://ik.imagekit.io/BassaniStudios/bovary%20pic%20meet/MUSICS/Voyage,%20Voyage%20-%20Desireless.mp3?updatedAt=1788671762514" },
  { title: "You Give Me A Feeling — Vintage Culture, James Hype", src: "https://ik.imagekit.io/BassaniStudios/bovary%20pic%20meet/MUSICS/Vintage%20Culture,%20James%20Hype%20-%20You%20Give%20Me%20A%20Feeling%20_Visualizer_%20-%20Vintage%20Culture.mp3?updatedAt=1788670525606" },
  { title: "Tokyo Drift — Teriyaki Boyz", src: "https://ik.imagekit.io/BassaniStudios/bovary%20pic%20meet/MUSICS/Tokyo%20Drift%20(Fast%20&%20Furious).mp3?updatedAt=1788670266859" },
  { title: "Sweet Disposition — The Temper Trap", src: "https://ik.imagekit.io/BassaniStudios/bovary%20pic%20meet/MUSICS/Sweet%20Disposition%20-%20The%20Temper%20Trap.mp3?updatedAt=1788671762286" },
  { title: "Riders on the Storm — Snoop Dogg feat. The Doors", src: "https://ik.imagekit.io/BassaniStudios/bovary%20pic%20meet/MUSICS/Snoop%20Dogg%20feat%20The%20Doors%20%20%20Riders%20on%20the%20Storm%20(Bass%20Boosted).mp3?updatedAt=1788670233432" },
  { title: "Six Days (Remix)", src: "https://ik.imagekit.io/BassaniStudios/bovary%20pic%20meet/MUSICS/Six%20Days%20(Remix).mp3?updatedAt=1788670210314" },
  { title: "No Place — RÜFÜS DU SOL", src: "https://ik.imagekit.io/BassaniStudios/bovary%20pic%20meet/MUSICS/R%C3%9CF%C3%9CS%20DU%20SOL%20%E2%97%8F%E2%97%8F%20No%20Place%20_Official%20Video_.mp3?updatedAt=1788670199047" },
  { title: "Can't Stop — Red Hot Chili Peppers", src: "https://ik.imagekit.io/BassaniStudios/bovary%20pic%20meet/MUSICS/Red%20Hot%20Chili%20Peppers%20-%20Can't%20Stop%20_Official%20Music%20Video_%20-%20Red%20Hot%20Chili%20Peppers.mp3?updatedAt=1788670441771" },
  { title: "The Church — Rampa", src: "https://ik.imagekit.io/BassaniStudios/bovary%20pic%20meet/MUSICS/Rampa%20-%20The%20Church%20_CLR001_.mp3?updatedAt=1788670187147" },
  { title: "Black Out Days — Phantogram (Future Islands Remix)", src: "https://ik.imagekit.io/BassaniStudios/bovary%20pic%20meet/MUSICS/Phantogram%20-%20Black%20Out%20Days%20(Future%20Islands%20Remix_Audio)%20-%20PhantogramVEVO.mp3?updatedAt=1788670423323" },
  { title: "Blue Monday — New Order", src: "https://ik.imagekit.io/BassaniStudios/bovary%20pic%20meet/MUSICS/New%20Order%20-%20Blue%20Monday%20(Official%20Lyric%20Video)%20-%20New%20Order.mp3?updatedAt=1788671765796" },
  { title: "Flower — Moby", src: "https://ik.imagekit.io/BassaniStudios/bovary%20pic%20meet/MUSICS/Moby%20-%20'Flower'%20(Official%20Audio).mp3?updatedAt=1788669892875" },
  { title: "Midnight City — M83", src: "https://ik.imagekit.io/BassaniStudios/bovary%20pic%20meet/MUSICS/M83%20'Midnight%20City'%20Official%20video%20-%20M83.mp3?updatedAt=1788670417147" },
  { title: "SexyBack — Justin Timberlake ft. Timbaland", src: "https://ik.imagekit.io/BassaniStudios/bovary%20pic%20meet/MUSICS/Justin%20Timberlake%20-%20SexyBack%20(Lyrics)%20ft.%20Timbaland%20-%207clouds.mp3?updatedAt=1788670495805" },
  { title: "Intro — The xx", src: "https://ik.imagekit.io/BassaniStudios/bovary%20pic%20meet/MUSICS/Intro%20-%20The%20xx.mp3?updatedAt=1788671761580" },
  { title: "Sahara — Hensonn", src: "https://ik.imagekit.io/BassaniStudios/bovary%20pic%20meet/MUSICS/Hensonn-Sahara.mp3?updatedAt=1788670297102" },
  { title: "Sweet Dreams — Eurythmics", src: "https://ik.imagekit.io/BassaniStudios/bovary%20pic%20meet/MUSICS/Eurythmics,%20Annie%20Lennox,%20Dave%20Stewart%20-%20Sweet%20Dreams%20(Are%20Made%20Of%20This)%20(Official%20Video).mp3?updatedAt=1788670315659" },
  { title: "How Does It Feel — Dubdogz, Fezzo, Zaark", src: "https://ik.imagekit.io/BassaniStudios/bovary%20pic%20meet/MUSICS/Dubdogz,%20Fezzo,%20Zaark%20-%20How%20Does%20It%20Feel%20(Official%20Lyric%20Video)%20New%20Order's%20-%20Blue%20Monday%20Remake%20-%20Dubdogz.mp3?updatedAt=1788670524594" },
  { title: "Crack Rock", src: "https://ik.imagekit.io/BassaniStudios/bovary%20pic%20meet/MUSICS/Crack%20Rock.mp3?updatedAt=1788670339529" },
  { title: "Sleepwalking — Chain Gang Of 1974", src: "https://ik.imagekit.io/BassaniStudios/bovary%20pic%20meet/MUSICS/Chain%20Gang%20Of%201974%20-%20%20Sleepwalking%20(Official%20Audio)%20-%20The%20Chain%20Gang%20Of%201974.mp3?updatedAt=1788671762477" },
  { title: "Safe And Sound — Capital Cities", src: "https://ik.imagekit.io/BassaniStudios/bovary%20pic%20meet/MUSICS/Capital%20Cities%20-%20Safe%20And%20Sound.mp3?updatedAt=1788670346757" },
  { title: "Song 2 — Blur", src: "https://ik.imagekit.io/BassaniStudios/bovary%20pic%20meet/MUSICS/Blur%20-%20Song%202%20(Official%20Music%20Video)%20-%20Blur.mp3?updatedAt=1788671761417" },
  { title: "Starting Again — &ME feat. Atelier", src: "https://ik.imagekit.io/BassaniStudios/bovary%20pic%20meet/MUSICS/&ME%20-%20Starting%20Again%20feat.%20Atelier.mp3?updatedAt=1788670362475" },
];

const PLAYLIST_GALLERY = [
  { title: "1979 (Acoustic) — The Smashing Pumpkins", src: "https://ik.imagekit.io/BassaniStudios/bovary%20pic%20meet/MUSICS/Chill%20musics/1979%20(Acoustic)%20-%20The%20Smashing%20Pumpkins.mp3?updatedAt=1788671725587" },
  { title: "Pool Song — Lea Porcelain", src: "https://ik.imagekit.io/BassaniStudios/bovary%20pic%20meet/MUSICS/Chill%20musics/Pool%20Song%20-%20Lea%20Porcelain.mp3?updatedAt=1788671725863" },
  { title: "Cigarette Daydreams — Cage the Elephant", src: "https://ik.imagekit.io/BassaniStudios/bovary%20pic%20meet/MUSICS/Chill%20musics/Cigarette%20Daydreams%20-%20Cage%20the%20Elephant%20-%20Shammy.mp3?updatedAt=1788670797738" },
  { title: "Beautiful Day — U2", src: "https://ik.imagekit.io/BassaniStudios/bovary%20pic%20meet/MUSICS/Chill%20musics/Beautiful%20Day%20-%20U2.mp3?updatedAt=1788671725478" },
  { title: "Burn It Down — Daughter", src: "https://ik.imagekit.io/BassaniStudios/bovary%20pic%20meet/MUSICS/Chill%20musics/Daughter%20-%20Burn%20It%20Down.mp3" },
  { title: "Seaside — The Kooks", src: "https://ik.imagekit.io/BassaniStudios/bovary%20pic%20meet/MUSICS/Chill%20musics/The%20Kooks%20-%20Seaside%20-%20TheKooksVEVO.mp3" },
  { title: "Breezy — Nobuo Uematsu", src: "https://ik.imagekit.io/BassaniStudios/bovary%20pic%20meet/MUSICS/Chill%20musics/Breezy%20-%20Nobuo%20Uematsu.mp3" },
  { title: "Obstacles — Syd Matters", src: "https://ik.imagekit.io/BassaniStudios/bovary%20pic%20meet/MUSICS/Chill%20musics/Syd%20Matters%20-%20Obstacles%20-%20Syd%20matters.mp3" },
  { title: "Mountains — Message To Bears", src: "https://ik.imagekit.io/BassaniStudios/bovary%20pic%20meet/MUSICS/Chill%20musics/Message%20To%20Bears%20-%20Mountains%20(official%20video)%20-%20Message%20To%20Bears.mp3" },
  { title: "Flaws — Daughter", src: "https://ik.imagekit.io/BassaniStudios/bovary%20pic%20meet/MUSICS/Chill%20musics/Flaws%20-%20Daughter.mp3" },
  { title: "Through The Cellar Door — Lanterns On The Lake", src: "https://ik.imagekit.io/BassaniStudios/bovary%20pic%20meet/MUSICS/Chill%20musics/Lanterns%20On%20The%20Lake%20-%20Through%20The%20Cellar%20Door%20-%20Lanterns%20On%20The%20Lake.mp3" },
  { title: "BAD — U2", src: "https://ik.imagekit.io/BassaniStudios/bovary%20pic%20meet/MUSICS/Chill%20musics/BAD%20-%20U2%20-%20DUBBINCLUBBIN.mp3" },
];

function shuffleIndices(n) {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}


const PLAYER_STORAGE_KEY = "bovaMusicPlayerV1";

function isGalleryPage() {
  try {
    const path = decodeURIComponent(location.pathname || location.href || "");
    const file = (path.split("/").pop() || "").split("?")[0].split("#")[0];
    if (/^gallery[-_]/i.test(file)) return true;
    if (/gallery[-_]/i.test(path)) return true;
  } catch (_) {}
  return false;
}

function formatTime(sec) {
  if (!isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return m + ":" + String(s).padStart(2, "0");
}

function loadPlayerState() {
  try {
    return JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY) || "null") || {};
  } catch (_) {
    return {};
  }
}

function savePlayerState(partial) {
  try {
    const cur = loadPlayerState();
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify({ ...cur, ...partial }));
  } catch (_) {}
}

function initMusicPlayer() {
  const onGallery = isGalleryPage();
  const playlist = onGallery
    ? (PLAYLIST_GALLERY.length ? PLAYLIST_GALLERY : PLAYLIST_MAIN)
    : PLAYLIST_MAIN;

  if (!playlist.length) {
    // No tracks configured yet — skip UI
    console.info("[Bova Player] Playlist empty. Add direct .mp3 URLs to PLAYLIST_MAIN / PLAYLIST_GALLERY in script.js");
    return;
  }

  const state = loadPlayerState();
  const playlistId = onGallery ? "gallery" : "main";
  const switchedPlaylist = state.playlistId && state.playlistId !== playlistId;
  let index = 0;
  // Always shuffle: build random order, start at a random track
  let order = shuffleIndices(playlist.length);
  let orderPos = 0;
  // Only resume track if SAME playlist — never carry main track into gallery (or vice-versa)
  if (!switchedPlaylist && state.playlistId === playlistId && typeof state.index === "number") {
    index = Math.max(0, Math.min(state.index, playlist.length - 1));
    const pos = order.indexOf(index);
    orderPos = pos >= 0 ? pos : 0;
  } else {
    orderPos = Math.floor(Math.random() * order.length);
    index = order[orderPos];
  }

  const audio = new Audio();
  audio.preload = "metadata";
  audio.volume = typeof state.volume === "number" ? state.volume : 0.5;

  // Single-instance audio across tabs/windows:
  // - By default the oldest (initial) window keeps playing; secondary tabs stay silent.
  // - When the user explicitly presses Play on a gallery (or any other playlist),
  //   that tab sends a "takeover" and the others pause so only the new music plays.
  const myOpenTs = Date.now();
  let musicChannel = null;
  let isSecondary = false;
  let hasTakenOver = false; // true after this tab explicitly took control via Play

  function pauseAudioUI() {
    if (!audio.paused) {
      audio.pause();
      const btn = document.getElementById("bovaPlayBtn");
      if (btn) btn.textContent = "▶";
      savePlayerState({ wasPlaying: false, currentTime: audio.currentTime, playlistId, index, volume: audio.volume });
    }
  }

  function pauseAsSecondary() {
    isSecondary = true;
    pauseAudioUI();
  }

  try {
    musicChannel = new BroadcastChannel("bova-music");
    musicChannel.postMessage({ type: "claim", playlistId: playlistId, ts: myOpenTs });
    musicChannel.onmessage = (ev) => {
      const msg = ev && ev.data;
      if (!msg || !msg.type) return;

      if (msg.type === "takeover") {
        // Another tab (e.g. gallery) explicitly started playing → pause here
        if (msg.playlistId !== playlistId || msg.ts !== myOpenTs) {
          hasTakenOver = false;
          isSecondary = true;
          pauseAudioUI();
        }
        return;
      }

      if (msg.type !== "claim" || typeof msg.ts !== "number") return;

      if (msg.ts < myOpenTs) {
        // Older (initial) window exists → this is secondary, stay silent
        // (unless we already took over via explicit Play)
        if (!hasTakenOver) pauseAsSecondary();
      } else if (msg.ts > myOpenTs) {
        // Newer window opened → re-assert our claim so it can hear us and pause
        try {
          musicChannel.postMessage({ type: "claim", playlistId: playlistId, ts: myOpenTs });
        } catch (_) {}
      }
    };
  } catch (_) {}

  // Build UI
  const root = document.createElement("div");
  root.className = "bova-player is-hidden";
  root.id = "bovaPlayer";
  root.innerHTML = `
    <div class="bova-player-notice ${onGallery ? "is-visible" : ""}" id="bovaPlayerNotice">
      <span>🎧 Gallery Chill playlist loaded — press play</span>
      <button type="button" id="bovaNoticeDismiss" aria-label="Dismiss">✕</button>
    </div>
    <div class="bova-player-inner">
      <button type="button" class="bova-player-play" id="bovaPlayBtn" aria-label="Play/Pause">▶</button>
      <div class="bova-player-meta">
        <p class="bova-player-label">${onGallery ? "GALLERY · CHILL · SHUFFLE" : "BOVARY RADIO · SHUFFLE"}</p>
        <p class="bova-player-title" id="bovaTrackTitle">—</p>
      </div>
      <div class="bova-player-controls">
        <button type="button" id="bovaPrevBtn" aria-label="Previous">⏮</button>
        <button type="button" id="bovaNextBtn" aria-label="Next">⏭</button>
        <button type="button" id="bovaMuteBtn" aria-label="Mute">🔊</button>
      </div>
      <div class="bova-player-bar-wrap">
        <span class="bova-player-time" id="bovaTimeCur">0:00</span>
        <input type="range" class="bova-player-seek" id="bovaSeek" min="0" max="1000" value="0" aria-label="Seek" />
        <span class="bova-player-time" id="bovaTimeDur">0:00</span>
        <input type="range" class="bova-player-vol" id="bovaVol" min="0" max="1" step="0.01" value="${audio.volume}" aria-label="Volume" />
      </div>
    </div>
  `;
  document.body.appendChild(root);

  const playBtn = document.getElementById("bovaPlayBtn");
  const titleEl = document.getElementById("bovaTrackTitle");
  const seek = document.getElementById("bovaSeek");
  const vol = document.getElementById("bovaVol");
  const timeCur = document.getElementById("bovaTimeCur");
  const timeDur = document.getElementById("bovaTimeDur");
  const muteBtn = document.getElementById("bovaMuteBtn");

  let userActivated = !!state.userActivated;
  let seeking = false;

  function setTrack(i, { autoplay = false, resumeTime = 0 } = {}) {
    index = ((i % playlist.length) + playlist.length) % playlist.length;
    const track = playlist[index];
    titleEl.textContent = track.title || ("Track " + (index + 1));
    audio.src = track.src;
    audio.load();
    const onMeta = () => {
      timeDur.textContent = formatTime(audio.duration);
      if (resumeTime > 0 && isFinite(audio.duration)) {
        try { audio.currentTime = Math.min(resumeTime, audio.duration - 0.25); } catch (_) {}
      }
      audio.removeEventListener("loadedmetadata", onMeta);
    };
    audio.addEventListener("loadedmetadata", onMeta);
    savePlayerState({ playlistId, index, volume: audio.volume, userActivated });
    if (autoplay) {
      audio.play().then(() => {
        playBtn.textContent = "⏸";
        root.classList.add("is-active");
      }).catch(() => {
        playBtn.textContent = "▶";
      });
    }
  }

  function togglePlay() {
    userActivated = true;
    root.classList.remove("is-hidden");
    root.classList.add("is-active");
    hidePrompt();
    const notice = document.getElementById("bovaPlayerNotice");
    if (notice) notice.classList.remove("is-visible");

    if (audio.paused) {
      // Explicit Play: take over audio from any other open tab (e.g. main → gallery)
      hasTakenOver = true;
      isSecondary = false;
      try {
        if (musicChannel) {
          musicChannel.postMessage({ type: "takeover", playlistId: playlistId, ts: myOpenTs });
          musicChannel.postMessage({ type: "claim", playlistId: playlistId, ts: myOpenTs });
        }
      } catch (_) {}
      audio.play().then(() => {
        playBtn.textContent = "⏸";
        savePlayerState({ wasPlaying: true, userActivated: true, playlistId, index, currentTime: audio.currentTime, volume: audio.volume });
      }).catch(() => {});
    } else {
      audio.pause();
      playBtn.textContent = "▶";
      savePlayerState({ wasPlaying: false, currentTime: audio.currentTime, volume: audio.volume, playlistId, index });
    }
  }

  playBtn.addEventListener("click", togglePlay);
  document.getElementById("bovaPrevBtn").addEventListener("click", () => {
    orderPos = (orderPos - 1 + order.length) % order.length;
    setTrack(order[orderPos], { autoplay: true });
  });
  document.getElementById("bovaNextBtn").addEventListener("click", () => {
    orderPos = (orderPos + 1) % order.length;
    if (orderPos === 0) order = shuffleIndices(playlist.length); // reshuffle when cycle completes
    setTrack(order[orderPos], { autoplay: true });
  });
  muteBtn.addEventListener("click", () => {
    audio.muted = !audio.muted;
    muteBtn.textContent = audio.muted ? "🔇" : "🔊";
  });
  vol.addEventListener("input", () => {
    audio.volume = Number(vol.value);
    audio.muted = audio.volume === 0;
    muteBtn.textContent = audio.muted ? "🔇" : "🔊";
    savePlayerState({ volume: audio.volume });
  });
  seek.addEventListener("mousedown", () => { seeking = true; });
  seek.addEventListener("touchstart", () => { seeking = true; }, { passive: true });
  seek.addEventListener("input", () => {
    if (!isFinite(audio.duration)) return;
    const t = (Number(seek.value) / 1000) * audio.duration;
    timeCur.textContent = formatTime(t);
  });
  const commitSeek = () => {
    if (!isFinite(audio.duration)) { seeking = false; return; }
    audio.currentTime = (Number(seek.value) / 1000) * audio.duration;
    seeking = false;
  };
  seek.addEventListener("mouseup", commitSeek);
  seek.addEventListener("touchend", commitSeek);

  audio.addEventListener("timeupdate", () => {
    if (seeking || !isFinite(audio.duration)) return;
    seek.value = String(Math.round((audio.currentTime / audio.duration) * 1000) || 0);
    timeCur.textContent = formatTime(audio.currentTime);
    if (Math.floor(audio.currentTime) % 3 === 0) {
      savePlayerState({ currentTime: audio.currentTime, index, playlistId, wasPlaying: !audio.paused, volume: audio.volume });
    }
  });
  audio.addEventListener("ended", () => {
    orderPos = (orderPos + 1) % order.length;
    if (orderPos === 0) order = shuffleIndices(playlist.length);
    setTrack(order[orderPos], { autoplay: true });
  });
  // Skip broken / non-audio files automatically
  audio.addEventListener("error", () => {
    console.warn("[Bova Player] Track failed, skipping:", playlist[index] && playlist[index].title);
    orderPos = (orderPos + 1) % order.length;
    if (orderPos === 0) order = shuffleIndices(playlist.length);
    setTrack(order[orderPos], { autoplay: !audio.paused || playBtn.textContent === "⏸" });
  });

  // Prompt after boot (home) or show player on other pages
  const prompt = document.createElement("div");
  prompt.className = "bova-music-prompt";
  prompt.id = "bovaMusicPrompt";
  prompt.innerHTML = `
    <span>Music ready</span>
    <button type="button" id="bovaPromptPlay">▶ Play music</button>
    <button type="button" class="bova-music-dismiss" id="bovaPromptDismiss">Dismiss</button>
  `;
  document.body.appendChild(prompt);

  function showPrompt() {
    if (userActivated) return;
    prompt.classList.add("is-visible");
  }
  function hidePrompt() {
    prompt.classList.remove("is-visible");
  }

  document.getElementById("bovaPromptPlay").addEventListener("click", () => {
    root.classList.remove("is-hidden");
    togglePlay();
  });
  document.getElementById("bovaPromptDismiss").addEventListener("click", () => {
    hidePrompt();
    root.classList.remove("is-hidden");
    userActivated = true;
    savePlayerState({ userActivated: true });
  });

  // Never resume time from the other playlist
  const resumeTime = (!switchedPlaylist && state.playlistId === playlistId && typeof state.currentTime === "number")
    ? state.currentTime
    : 0;
  setTrack(index, { autoplay: false, resumeTime });
  // Persist that we are now on this playlist (clears "main" context when entering gallery)
  savePlayerState({ playlistId, index, currentTime: resumeTime, volume: audio.volume });

  function tryAutoplay(showFallbackPrompt) {
    if (isSecondary) {
      // Secondary window: never autoplay — only the initial window plays
      if (showFallbackPrompt) showPrompt();
      return;
    }
    audio.play().then(() => {
      playBtn.textContent = "⏸";
      root.classList.add("is-active");
      userActivated = true;
      hidePrompt();
      const notice = document.getElementById("bovaPlayerNotice");
      if (notice) notice.classList.remove("is-visible");
      savePlayerState({ wasPlaying: true, userActivated: true, playlistId, index, currentTime: audio.currentTime, volume: audio.volume });
    }).catch(() => {
      if (showFallbackPrompt) showPrompt();
    });
  }

  const noticeBtn = document.getElementById("bovaNoticeDismiss");
  if (noticeBtn) {
    noticeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const notice = document.getElementById("bovaPlayerNotice");
      if (notice) notice.classList.remove("is-visible");
    });
  }

  function revealPlayerUI() {
    root.classList.remove("is-hidden");

    // Gallery: show chill playlist notice on the player (no forced autoplay)
    if (onGallery) {
      root.classList.add("is-active");
      const notice = document.getElementById("bovaPlayerNotice");
      if (notice) notice.classList.add("is-visible");
      // Hide the big bottom prompt — notice is enough
      hidePrompt();
      return;
    }

    // Same playlist + was playing → try resume
    if (!switchedPlaylist && state.wasPlaying && state.playlistId === playlistId) {
      tryAutoplay(true);
      return;
    }

    showPrompt();
  }

  // Tie to boot finish on pages that have boot screen
  // Small extra delay lets BroadcastChannel handshake finish so secondary tabs
  // learn about the initial window before deciding to autoplay.
  const boot = document.getElementById("boot-screen");
  if (boot && !boot.classList.contains("done")) {
    const obs = new MutationObserver(() => {
      if (boot.classList.contains("done") || boot.getAttribute("aria-hidden") === "true") {
        obs.disconnect();
        setTimeout(revealPlayerUI, 600);
      }
    });
    obs.observe(boot, { attributes: true, attributeFilter: ["class", "aria-hidden", "style"] });
    // Fallback if boot already finished or finishes via timeout
    setTimeout(() => {
      if (bootFinished || boot.classList.contains("done")) revealPlayerUI();
    }, 4000);
  } else {
    // No boot on this page
    setTimeout(revealPlayerUI, 500);
  }

  // Keep active style while interacting
  root.addEventListener("pointerdown", () => root.classList.add("is-active"));

  // Mobile: start compact (mini), expand on interaction, collapse after idle
  const isNarrow = () => window.matchMedia("(max-width: 520px)").matches;
  let miniTimer = null;
  function enterMini() {
    if (!isNarrow()) {
      root.classList.remove("is-mini");
      return;
    }
    root.classList.add("is-mini");
  }
  function expandPlayer() {
    root.classList.remove("is-mini");
    root.classList.add("is-active");
    if (miniTimer) clearTimeout(miniTimer);
    miniTimer = setTimeout(enterMini, 5000);
  }
  if (isNarrow()) {
    root.classList.add("is-mini");
  }
  root.addEventListener("pointerdown", expandPlayer);
  window.addEventListener("resize", () => {
    if (!isNarrow()) root.classList.remove("is-mini");
    else if (!root.matches(":hover, :focus-within")) enterMini();
  });
}


// ===== LIGHTBOX GALLERY VIEWER (+ REACTIONS) =====
function initLightbox() {
  const selectors = "a.g-item, a.meeting-card, a.meetup-pic-card";
  const links = Array.from(document.querySelectorAll(selectors)).filter((a) => {
    const href = a.getAttribute("href") || "";
    return /\.(jpe?g|png|webp|gif|avif)(\?|$)/i.test(href) || /imagekit\.io|imgur\.com/i.test(href);
  });
  if (!links.length) return;

  const items = links.map((a) => {
    const thumbImg = a.querySelector("img");
    return {
      src: a.getAttribute("href"),
      thumb: (thumbImg && thumbImg.getAttribute("src")) || a.getAttribute("href"),
      alt: (thumbImg && thumbImg.alt) || "Photo",
    };
  });

  const overlay = document.createElement("div");
  overlay.className = "bova-lightbox";
  overlay.id = "bovaLightbox";
  overlay.innerHTML = `
    <button type="button" class="bova-lightbox-close" id="lbClose" aria-label="Close">✕</button>
    <button type="button" class="bova-lightbox-prev" id="lbPrev" aria-label="Previous">‹</button>
    <div class="bova-lightbox-inner">
      <img class="bova-lightbox-img" id="lbImg" alt="" />
    </div>
    <button type="button" class="bova-lightbox-next" id="lbNext" aria-label="Next">›</button>
    <div class="bova-lightbox-counter" id="lbCounter"></div>
    <div class="bova-lightbox-reactions" id="lbReactions" aria-label="Reactions"></div>
    <div class="bova-lightbox-filmstrip" id="lbStrip" role="list"></div>
  `;
  document.body.appendChild(overlay);

  const imgEl = document.getElementById("lbImg");
  const counterEl = document.getElementById("lbCounter");
  const stripEl = document.getElementById("lbStrip");
  const reactionsEl = document.getElementById("lbReactions");
  let current = 0;
  let loadingReactions = false;

  // Build reaction buttons once
  REACTION_LIST.forEach((r) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "bova-reaction-btn";
    btn.dataset.reaction = r.id;
    btn.setAttribute("aria-label", r.label);
    btn.innerHTML = `<span class="bova-reaction-emoji">${r.emoji}</span><span class="bova-reaction-count" data-count-for="${r.id}">0</span>`;
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      if (loadingReactions) return;
      const item = items[current];
      if (!item) return;
      const photoId = photoIdFromUrl(item.src);

      // Already reacted in this browser — prevent stacking
      if (hasReacted(photoId, r.id)) {
        btn.classList.add("is-already-reacted");
        setTimeout(() => btn.classList.remove("is-already-reacted"), 400);
        return;
      }

      btn.classList.add("is-pending");
      const newCount = await incrementReaction(photoId, r.id);
      btn.classList.remove("is-pending");
      if (newCount != null) {
        markReacted(photoId, r.id);
        const countEl = btn.querySelector(`[data-count-for="${r.id}"]`);
        if (countEl) countEl.textContent = String(newCount);
        btn.classList.add("is-reacted", "has-user-reacted");
        setTimeout(() => btn.classList.remove("is-reacted"), 600);
      }
    });
    reactionsEl.appendChild(btn);
  });

  // Prevent clicks on the bar from closing the lightbox
  reactionsEl.addEventListener("click", (e) => e.stopPropagation());

  // Build filmstrip thumbnails once
  items.forEach((item, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "bova-lightbox-thumb";
    btn.setAttribute("role", "listitem");
    btn.setAttribute("aria-label", "Photo " + (i + 1));
    btn.innerHTML = `<img src="${item.thumb}" alt="" loading="lazy" />`;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      show(i);
    });
    stripEl.appendChild(btn);
  });

  async function refreshReactionsForCurrent() {
    const item = items[current];
    if (!item) return;
    const photoId = photoIdFromUrl(item.src);
    loadingReactions = true;
    reactionsEl.classList.add("is-loading");
    const counts = await loadReactions(photoId);
    REACTION_LIST.forEach((r) => {
      const el = reactionsEl.querySelector(`[data-count-for="${r.id}"]`);
      if (el) el.textContent = String(counts[r.id] || 0);
      const btn = reactionsEl.querySelector(`[data-reaction="${r.id}"]`);
      if (btn) {
        btn.classList.toggle("has-user-reacted", hasReacted(photoId, r.id));
      }
    });
    reactionsEl.classList.remove("is-loading");
    loadingReactions = false;
  }

  function show(i) {
    current = ((i % items.length) + items.length) % items.length;
    const item = items[current];
    imgEl.src = item.src;
    imgEl.alt = item.alt;
    counterEl.textContent = (current + 1) + " / " + items.length;

    const thumbs = stripEl.querySelectorAll(".bova-lightbox-thumb");
    thumbs.forEach((t, idx) => {
      t.classList.toggle("is-active", idx === current);
    });
    const active = thumbs[current];
    if (active && typeof active.scrollIntoView === "function") {
      active.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }

    // Load reaction counts for this photo
    refreshReactionsForCurrent();
  }

  function open(i) {
    show(i);
    overlay.classList.add("is-open");
    document.body.classList.add("lightbox-open");
  }

  function close() {
    overlay.classList.remove("is-open");
    document.body.classList.remove("lightbox-open");
  }

  links.forEach((a, i) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      open(i);
    });
  });

  document.getElementById("lbClose").addEventListener("click", close);
  document.getElementById("lbPrev").addEventListener("click", (e) => {
    e.stopPropagation();
    show(current - 1);
  });
  document.getElementById("lbNext").addEventListener("click", (e) => {
    e.stopPropagation();
    show(current + 1);
  });
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
  stripEl.addEventListener("click", (e) => e.stopPropagation());
  document.addEventListener("keydown", (e) => {
    if (!overlay.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
  });
}


// ===== GALLERY SKELETON LOADERS =====
function initGallerySkeletons() {
  const imgs = document.querySelectorAll(
    ".g-item img, .meeting-card-inner img, .meetup-pic-card img"
  );
  if (!imgs.length) return;

  imgs.forEach((img) => {
    const shell = img.closest(".g-item, .meeting-card-inner, .meetup-pic-card");
    if (shell) shell.classList.add("is-skeleton");

    const done = () => {
      img.classList.add("is-loaded");
      if (shell) shell.classList.remove("is-skeleton");
    };

    if (img.complete && img.naturalWidth > 0) {
      done();
    } else {
      img.addEventListener("load", done, { once: true });
      img.addEventListener("error", done, { once: true });
    }
  });
}

// ===== INIT =====

document.addEventListener('DOMContentLoaded', () => {
  initImageFallbacks();
  initCopyButtons();
  runBoot();
  initMusicPlayer();
  initCursor();
  initButtonGlow();
  animateStats();
  revealElements();
  handleNavbar();
  addScanlines();
  initTiltCards();
  initParallax();
  initLightbox();
  initGallerySkeletons();
});

// ===== PWA: Install as App + Service Worker =====
(function initPWA() {
  const DISMISS_KEY = "bova_pwa_dismissed_at";
  const DISMISS_DAYS = 14; // don't nag again for 2 weeks after dismiss

  let deferredPrompt = null;

  function isStandalone() {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.matchMedia("(display-mode: fullscreen)").matches ||
      window.navigator.standalone === true
    );
  }

  function isIOS() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  }

  function wasDismissedRecently() {
    try {
      const raw = localStorage.getItem(DISMISS_KEY);
      if (!raw) return false;
      const ts = parseInt(raw, 10);
      if (!ts) return false;
      return Date.now() - ts < DISMISS_DAYS * 24 * 60 * 60 * 1000;
    } catch {
      return false;
    }
  }

  function markDismissed() {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch (_) {}
  }

  function removeBanner() {
    const el = document.getElementById("pwa-install-banner");
    if (el) el.remove();
  }

  function showBanner({ mode }) {
    if (document.getElementById("pwa-install-banner")) return;
    if (isStandalone() || wasDismissedRecently()) return;

    const banner = document.createElement("div");
    banner.id = "pwa-install-banner";
    banner.className = "pwa-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "Install app");

    if (mode === "android" || mode === "chrome") {
      banner.innerHTML = `
        <div class="pwa-banner-inner">
          <div class="pwa-banner-icon" aria-hidden="true">
            <img src="https://ik.imagekit.io/BassaniStudios/bovary%20pic%20meet/setembro/teste.png?tr=w-72,h-72" alt="" width="40" height="40" />
          </div>
          <div class="pwa-banner-text">
            <strong>Install BovaryNow App</strong>
            <span>App verified by MediaFire®.</span>
          </div>
          <div class="pwa-banner-actions">
            <a href="https://www.mediafire.com/file/lvv4tvhmq5j8cvl/BovaryNow.apk/file" target="_blank" rel="noopener noreferrer" class="pwa-btn-install">Download App</a>
            <button type="button" class="pwa-btn-dismiss" id="pwaDismissBtn" aria-label="Close">×</button>
          </div>
        </div>
      `;
    } else if (mode === "ios") {
      banner.innerHTML = `
        <div class="pwa-banner-inner pwa-banner-ios">
          <div class="pwa-banner-icon" aria-hidden="true">
            <img src="https://ik.imagekit.io/BassaniStudios/bovary%20pic%20meet/setembro/teste.png?tr=w-72,h-72" alt="" width="40" height="40" />
          </div>
          <div class="pwa-banner-text">
            <strong>Install BovaryNow App</strong>
            <span>App verified by MediaFire®.</span>
          </div>
          <div class="pwa-banner-actions">
            <a href="https://www.mediafire.com/file/lvv4tvhmq5j8cvl/BovaryNow.apk/file" target="_blank" rel="noopener noreferrer" class="pwa-btn-install">Download App</a>
            <button type="button" class="pwa-btn-dismiss" id="pwaDismissBtn" aria-label="Close">×</button>
          </div>
        </div>
      `;
    } else {
      return;
    }

    document.body.appendChild(banner);
    // small delay so CSS transition works
    requestAnimationFrame(() => banner.classList.add("pwa-banner-visible"));

    const dismiss = () => {
      banner.classList.remove("pwa-banner-visible");
      markDismissed();
      setTimeout(removeBanner, 320);
    };

    const dismissBtn = document.getElementById("pwaDismissBtn");
    if (dismissBtn) dismissBtn.addEventListener("click", dismiss);
  }

  async function triggerInstall() {
    if (isStandalone()) return;

    // Chrome / Android / Edge: native prompt if available
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        deferredPrompt = null;
        if (choice && choice.outcome === "accepted") {
          removeBanner();
          hideNavInstallButtons();
        }
      } catch (_) {}
      return;
    }

    // iOS: show instructions banner (always allow when user taps the button)
    if (isIOS()) {
      removeBanner();
      // temporarily clear dismiss so the banner shows when user asks
      try { localStorage.removeItem(DISMISS_KEY); } catch (_) {}
      showBanner({ mode: "ios" });
      return;
    }

    // Desktop / other browsers: show the BovaryNow APK link.
    removeBanner();
    const tip = document.createElement("div");
    tip.id = "pwa-install-banner";
    tip.className = "pwa-banner pwa-banner-visible";
    tip.setAttribute("role", "dialog");
    tip.innerHTML = `
      <div class="pwa-banner-inner">
        <div class="pwa-banner-icon" aria-hidden="true">
          <img src="https://ik.imagekit.io/BassaniStudios/bovary%20pic%20meet/setembro/teste.png?tr=w-72,h-72" alt="" width="40" height="40" />
        </div>
        <div class="pwa-banner-text">
          <strong>Install BovaryNow App</strong>
          <span>App verified by MediaFire®.</span>
        </div>
        <div class="pwa-banner-actions">
          <a href="https://www.mediafire.com/file/lvv4tvhmq5j8cvl/BovaryNow.apk/file" target="_blank" rel="noopener noreferrer" class="pwa-btn-install">Download App</a>
          <button type="button" class="pwa-btn-dismiss" id="pwaDismissBtn" aria-label="Close">×</button>
        </div>
      </div>
    `;
    document.body.appendChild(tip);
    const d = document.getElementById("pwaDismissBtn");
    if (d) d.addEventListener("click", () => { tip.remove(); markDismissed(); });
  }

  function hideNavInstallButtons() {
    document.querySelectorAll(".btn-install-app").forEach((btn) => {
      btn.hidden = true;
      btn.setAttribute("aria-hidden", "true");
    });
  }

  function wireNavInstallButtons() {
    // The navigation buttons now link directly to the BovaryNow APK.
    // Keep them as regular links so the MediaFire page opens normally.
  }

  // Capture native install prompt (Chrome / Edge / Android)
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    // slight delay so page feels settled
    setTimeout(() => showBanner({ mode: "chrome" }), 1800);
  });

  // After successful install
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    removeBanner();
    try { localStorage.removeItem(DISMISS_KEY); } catch (_) {}
  });

  // iOS: no beforeinstallprompt — show instructions after a bit
  window.addEventListener("load", () => {
    wireNavInstallButtons();
    if (isStandalone()) {
      hideNavInstallButtons();
      return;
    }
    if (isIOS() && !wasDismissedRecently()) {
      setTimeout(() => showBanner({ mode: "ios" }), 2500);
    }
  });

  // Register service worker + force clients onto the latest version
  if ("serviceWorker" in navigator) {
    let refreshing = false;

    // When a new SW takes control, reload once so the page uses fresh assets
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });

    // Message from SW after activate (backup path)
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data && event.data.type === "BOVA_SW_ACTIVATED") {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      }
    });

    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("./sw.js?v=3")
        .then((reg) => {
          // Always ask the browser to check for a newer SW
          try { reg.update(); } catch (_) {}

          // Periodic check while the tab stays open (every 5 min)
          setInterval(() => {
            try { reg.update(); } catch (_) {}
          }, 5 * 60 * 1000);

          reg.addEventListener("updatefound", () => {
            const worker = reg.installing;
            if (!worker) return;
            worker.addEventListener("statechange", () => {
              // New worker installed while an older one still controls the page
              if (worker.state === "installed" && navigator.serviceWorker.controller) {
                worker.postMessage({ type: "SKIP_WAITING" });
              }
            });
          });

          // If a waiting worker is already sitting there, activate it now
          if (reg.waiting) {
            reg.waiting.postMessage({ type: "SKIP_WAITING" });
          }
        })
        .catch(() => {});
    });
  }
})();

// ===== SUPABASE + PHOTO REACTIONS =====
const SUPABASE_URL = "https://couewlfavidsxtbiwqdw.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_VYWo7U9FJT9zxUGoo9PLsQ_ioaaTiTI";

const REACTION_LIST = [
  { id: "heart",    emoji: "❤️", label: "Heart" },
  { id: "thumbsup", emoji: "👍", label: "Like" },
  { id: "hug",      emoji: "🤗", label: "Hug" },
  { id: "teary",    emoji: "🥹", label: "Teary" },
];

/** localStorage key for reactions already given by this browser */
const REACTED_STORAGE_KEY = "bova_reacted_photos";

function getReactedMap() {
  try {
    const raw = localStorage.getItem(REACTED_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function hasReacted(photoId, reactionId) {
  const map = getReactedMap();
  return !!(map[photoId] && map[photoId][reactionId]);
}

function markReacted(photoId, reactionId) {
  try {
    const map = getReactedMap();
    if (!map[photoId]) map[photoId] = {};
    map[photoId][reactionId] = true;
    localStorage.setItem(REACTED_STORAGE_KEY, JSON.stringify(map));
  } catch (e) {
    console.warn("[Bova] could not save reacted state", e);
  }
}

let supabaseClient = null;

function getSupabase() {
  if (supabaseClient) return supabaseClient;
  if (typeof supabase === "undefined" || !supabase.createClient) {
    console.warn("[Bova] Supabase SDK not loaded");
    return null;
  }
  supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return supabaseClient;
}

/** Stable photo_id from image URL (path without domain/query, max 500 chars) */
function photoIdFromUrl(url) {
  try {
    const u = new URL(url);
    // Use full pathname so different folders don't collide (e.g. /setembro/1.png vs /fenrir/1.png)
    let path = decodeURIComponent(u.pathname).replace(/^\/+/, "");
    path = path.split("?")[0];
    if (!path) path = url;
    return path.slice(0, 500);
  } catch {
    return String(url).slice(0, 500);
  }
}

async function loadReactions(photoId) {
  const sb = getSupabase();
  if (!sb) return {};
  try {
    const { data, error } = await sb
      .from("photo_reactions")
      .select("reaction, count")
      .eq("photo_id", photoId);
    if (error) {
      console.warn("[Bova] loadReactions error", error);
      return {};
    }
    const map = {};
    (data || []).forEach((row) => {
      map[row.reaction] = Number(row.count) || 0;
    });
    return map;
  } catch (e) {
    console.warn("[Bova] loadReactions exception", e);
    return {};
  }
}

async function incrementReaction(photoId, reactionId) {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data, error } = await sb.rpc("increment_photo_reaction", {
      p_id: photoId,
      p_reaction: reactionId,
    });
    if (error) {
      console.warn("[Bova] increment error", error);
      return null;
    }
    return data; // new count
  } catch (e) {
    console.warn("[Bova] increment exception", e);
    return null;
  }
}

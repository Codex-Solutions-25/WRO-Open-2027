document.addEventListener('DOMContentLoaded', () => {
  
  // --- 1. Countdown Timer Logic ---
  const targetDate = new Date('July 1, 2027 00:00:00').getTime();
  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) return;

    daysEl.innerText = String(Math.floor(distance / (1000 * 60 * 60 * 24))).padStart(2, '0');
    hoursEl.innerText = String(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
    minutesEl.innerText = String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
    secondsEl.innerText = String(Math.floor((distance % (1000 * 60)) / 1000)).padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // --- 2. Scroll Animations (Intersection Observer) ---
  const observerOptions = { root: null, rootMargin: '0px', threshold: 0.15 };
  
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        
        // If it's a stats grid, animate the dials
        if (entry.target.classList.contains('stats-grid')) {
          const dials = entry.target.querySelectorAll('.stat-dial .circle');
          dials.forEach(dial => {
            const value = dial.closest('.stat-dial').getAttribute('data-value');
            dial.setAttribute('stroke-dasharray', `${value}, 100`);
          });
        }
        
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

  // --- 3. Sticky Navbar Background Effect ---
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.style.background = '#1c172b';
      navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.3)';
    } else {
      navbar.style.background = '#1c172b';
      navbar.style.boxShadow = 'none';
    }
  });

  // --- 4. Interactive Horizontal Slider ---
  const slider = document.getElementById('slider');
  let isDown = false;
  let startX;
  let scrollLeft;

  if (slider) {
    slider.addEventListener('mousedown', (e) => {
      isDown = true;
      slider.style.cursor = 'grabbing';
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    });
    slider.addEventListener('mouseleave', () => {
      isDown = false;
      slider.style.cursor = 'grab';
    });
    slider.addEventListener('mouseup', () => {
      isDown = false;
      slider.style.cursor = 'grab';
    });
    slider.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 2; // Scroll speed
      slider.scrollLeft = scrollLeft - walk;
    });
  }

  // --- 5. 3D Tilt Effect on Cards ---
  const tiltElements = document.querySelectorAll('.tilt-effect');
  tiltElements.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left; 
      const y = e.clientY - rect.top;
      
      const xPct = x / rect.width - 0.5;
      const yPct = y / rect.height - 0.5;
      
      el.style.transform = `perspective(1000px) rotateY(${xPct * 10}deg) rotateX(${-yPct * 10}deg) scale3d(1.02, 1.02, 1.02)`;
    });
    
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)';
    });
  });

  // --- 6. Mission Briefing Panel ---
  const orbitNodes    = document.querySelectorAll('.orbit-node');
  const briefingIdle  = document.getElementById('briefingIdle');
  const briefingDetail= document.getElementById('briefingDetail');
  const briefingImg   = document.getElementById('briefingImg');
  const briefingBadge = document.getElementById('briefingBadge');
  const briefingTitle = document.getElementById('briefingTitle');
  const briefingDesc  = document.getElementById('briefingDesc');
  const briefingTags  = document.getElementById('briefingTags');
  const briefingBack  = document.getElementById('briefingBack');
  const dots          = document.querySelectorAll('.orbit-dot');
  const orbitTrack    = document.getElementById('orbitTrack');

  let twTimer = null;
  let activeNodeIndex = -1;

  function typewriter(el, text, speed = 35) {
    clearTimeout(twTimer);
    el.textContent = '';
    let i = 0;
    function step() {
      if (i < text.length) {
        el.textContent += text[i++];
        twTimer = setTimeout(step, speed);
      }
    }
    step();
  }

  function setDot(idx) {
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  }

  function showBriefing(node, idx) {
    const title = node.getAttribute('data-title');
    const desc  = node.getAttribute('data-desc');
    const badge = node.getAttribute('data-badge');
    const color = node.getAttribute('data-badge-color') || '#ff6b2c';
    const img   = node.getAttribute('data-img');
    const tags  = (node.getAttribute('data-tags') || '').split(',');

    // Swap panels
    briefingIdle.style.display  = 'none';
    briefingDetail.classList.add('is-active');

    // Populate
    briefingImg.src = img;
    briefingImg.alt = title;
    briefingBadge.textContent = badge;
    briefingBadge.style.background = color;
    briefingDesc.textContent = desc;

    briefingTags.innerHTML = tags.map(t =>
      `<span class="briefing-tag">${t.trim()}</span>`
    ).join('');

    // Typewriter for title
    typewriter(briefingTitle, title, 45);

    // Highlight selected node
    orbitNodes.forEach(n => n.style.borderColor = '');
    node.style.borderColor = color;
    setDot(idx);
    activeNodeIndex = idx;

    // Pause orbit
    orbitTrack.style.animationPlayState = 'paused';
    orbitNodes.forEach(n => n.style.animationPlayState = 'paused');
  }

  function showIdle() {
    briefingDetail.classList.remove('is-active');
    briefingIdle.style.display = 'flex';
    clearTimeout(twTimer);
    // Reset node highlights
    orbitNodes.forEach(n => n.style.borderColor = '');
    setDot(-1);
    activeNodeIndex = -1;
    // Resume orbit
    orbitTrack.style.animationPlayState = 'running';
    orbitNodes.forEach(n => n.style.animationPlayState = 'running');
  }

  orbitNodes.forEach((node, idx) => {
    node.addEventListener('click', () => showBriefing(node, idx));
    node.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') showBriefing(node, idx);
    });
  });

  if (briefingBack) briefingBack.addEventListener('click', showIdle);

});

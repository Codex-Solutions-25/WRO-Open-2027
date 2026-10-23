document.addEventListener('DOMContentLoaded', () => {
  
  // --- 1. Countdown Timer Logic ---
  const targetDate = new Date('June 30, 2027 08:00:00').getTime();
  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');

  function updateCountdown() {
    if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return; // countdown only exists on the home page
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

  // --- 7. Merch / Coming-Soon Notify Form ---
  document.querySelectorAll('.notify-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const email = input ? input.value.trim() : '';
      if (!email) return;
      form.innerHTML = `
        <div class="notify-success">
          <i class="ph-fill ph-confetti"></i>
          <div>
            <strong>You're on the list!</strong>
            <span>We'll email <em>${email.replace(/</g, '&lt;')}</em> the moment pre-orders open.</span>
          </div>
        </div>`;
    });
  });

  // --- 8. Interactive Map: ZITF central, stays + recreation (Google-Maps style) ---
  const WRO_VENUE = {
    name: 'Zimbabwe International Trade Fair (ZITF)',
    sub: 'Official venue — WRO Special Invitational Africa 2027',
    lat: -20.16778, lng: 28.58811
  };

  const WRO_PINS = [
    // Hotels
    { name: 'Holiday Inn Bulawayo', cat: 'hotel', sub: '4-star · Ascot Way · pool & breakfast', web: 'https://www.ihg.com/holidayinn/hotels/us/en/bulawayo/buqwo/hoteldetail', lat: -20.16092, lng: 28.60892 },
    { name: 'N1 Hotel Bulawayo', cat: 'hotel', sub: 'J.M. Nkomo Street, CBD', lat: -20.15953, lng: 28.58061 },
    { name: 'The Bulawayo Club', cat: 'hotel', sub: 'Historic private club · CBD', lat: -20.15484, lng: 28.58113 },
    { name: 'Bulawayo Rainbow Hotel', cat: 'hotel', sub: 'City centre', lat: -20.15805, lng: 28.58550, approx: true },
    { name: 'Nesbitt Castle Hotel', cat: 'hotel', sub: 'Woodlands · castle-style stay', lat: -20.18700, lng: 28.62194 },
    { name: 'Cresta Churchill Hotel', cat: 'hotel', sub: 'Somerset Road, Fourwinds', web: 'https://www.crestahotels.com/hotels/zimbabwe/cresta-churchill', lat: -20.21214, lng: 28.58145 },
    { name: 'Khumalo Hotel & Conference Centre', cat: 'hotel', sub: 'Trenchard Road, Khumalo', web: 'https://www.khumalo-hotel.co.zw/', lat: -20.14499, lng: 28.61650 },
    { name: "Hotel St Patrick's", cat: 'hotel', sub: "Hospitality training hotel · 12th Avenue", web: 'https://schoto.ac.zw/about-us/hotel.html', lat: -20.16309, lng: 28.58925 },
    { name: 'Lalani Hotel & Conference Centre', cat: 'hotel', sub: 'Gate Road, Woodlands', lat: -20.20004, lng: 28.63292 },
    { name: 'Selborne Hotel', cat: 'hotel', sub: 'George Silundika Street, CBD', lat: -20.15375, lng: 28.58600 },
    // Guest houses & lodges
    { name: 'Cumberland Guest Lodge', cat: 'stay', sub: 'Cumberland Drive, Bradfield · 18 rooms', web: 'https://cumberlandguestlodge.com', lat: -20.18721, lng: 28.59225 },
    { name: 'Banff Lodge', cat: 'stay', sub: 'Hillside · 24 rooms & pool', web: 'https://banfflodgehotel.com/', lat: -20.18989, lng: 28.60891 },
    { name: 'Travellers Guest Lodge', cat: 'stay', sub: 'Essex Road, Hillside', lat: -20.18910, lng: 28.60771 },
    { name: 'Munda Lodge', cat: 'stay', sub: 'Munda Drive, Burnside · 26 rooms', web: 'https://www.mundalodge.com/', lat: -20.22963, lng: 28.61268 },
    { name: 'Hornung Park Lodge', cat: 'stay', sub: 'Burnside Road · 4-star garden lodge', lat: -20.21903, lng: 28.60380 },
    { name: 'Mpala Lodge', cat: 'stay', sub: '25th Avenue, Bradfield', lat: -20.18307, lng: 28.58578 },
    { name: 'Ingrids Guest Lodge', cat: 'stay', sub: 'Essex Avenue, Hillside', lat: -20.19947, lng: 28.61256 },
    { name: 'Mavuna Guest Lodge & Conference Centre', cat: 'stay', sub: 'Caithness Road, Woodlands', lat: -20.19202, lng: 28.62326 },
    { name: 'Bulawayo Rock Tourist Inn', cat: 'stay', sub: 'Leopold Takawira Ave, CBD', lat: -20.15381, lng: 28.58577 },
    { name: 'Ebuhleni Guest Lodge', cat: 'stay', sub: 'Gladstone Road, Montrose', web: 'http://www.ebuhlenilodge.com', lat: -20.20440, lng: 28.55661 },
    // Things to do in the city
    { name: 'Centenary Park', cat: 'fun', sub: 'City gardens & picnic lawns', lat: -20.15676, lng: 28.59287 },
    { name: 'Bulawayo Athletic Club', cat: 'fun', sub: 'Sports & social club · Suburbs', lat: -20.16443, lng: 28.59377 },
    { name: 'Queens Sports Club', cat: 'fun', sub: 'International cricket ground', lat: -20.14508, lng: 28.58799 },
    { name: 'Natural History Museum of Zimbabwe', cat: 'fun', sub: 'Centenary Park · 09:00–17:00', web: 'https://naturalhistorymuseumzimbabwe.com/', lat: -20.15579, lng: 28.59642 },
    { name: 'Bulawayo Railway Museum', cat: 'fun', sub: 'Historic steam locomotives', lat: -20.16351, lng: 28.57418 },
    { name: 'National Art Gallery Bulawayo', cat: 'fun', sub: '75 Leopold Takawira Ave', web: 'https://www.nationalgallerybyo.com/', lat: -20.15300, lng: 28.58288 },
    { name: 'Bulawayo Theatre', cat: 'fun', sub: 'Live shows & events, Parkview', lat: -20.15495, lng: 28.59231 },
    { name: 'Hillside Dams Conservation', cat: 'fun', sub: 'Dam walks, zipline & wildlife', lat: -20.20054, lng: 28.62123 },
    { name: 'Barbourfields Stadium', cat: 'fun', sub: 'Home of Bulawayo football', lat: -20.13093, lng: 28.57039 },
    // Day trips
    { name: 'Khami Ruins — World Heritage Site', cat: 'fun', sub: 'UNESCO archaeology · ~22 km west', lat: -20.14424, lng: 28.42327 },
    { name: 'Tshabalala Game Sanctuary', cat: 'fun', sub: 'Game-drive day trip · ~12 km south', lat: -20.24710, lng: 28.53150, approx: true },
    { name: 'Matobo National Park', cat: 'fun', sub: 'UNESCO rock art & rhinos · excursion day', lat: -20.46710, lng: 28.48950, approx: true }
  ];

  const MAP_CATS = {
    hotel: { label: 'Hotels', icon: 'ph-buildings' },
    stay:  { label: 'Guest Houses & Lodges', icon: 'ph-house-line' },
    fun:   { label: 'Things to Do', icon: 'ph-confetti' }
  };

  function haversineKm(lat1, lng1, lat2, lng2) {
    const R = 6371, dLat = (lat2 - lat1) * Math.PI / 180, dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function initPageMap() {
    if (!window.PAGE_MAP || typeof window.L === 'undefined') return;
    const cfg = window.PAGE_MAP;
    const el = document.getElementById(cfg.mapEl);
    if (!el) return;

    const map = L.map(el, { zoomControl: false });
    map.setView([WRO_VENUE.lat, WRO_VENUE.lng], 13);
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Clean, Google-like free basemaps first, plain OSM as final fallback
    const tileSets = [
      { url: 'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png', opts: { maxZoom: 20 }, attr: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors &amp; <a href="https://maps.wikimedia.org" target="_blank" rel="noopener">Wikimedia</a>' },
      { url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', opts: { maxZoom: 19 }, attr: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors' }
    ];
    const addTiles = () => {
      const set = tileSets[cfg.__tileIdx || 0];
      const layer = L.tileLayer(set.url, Object.assign({ attribution: set.attr }, set.opts)).addTo(map);
      let errs = 0;
      layer.on('tileerror', () => {
        errs++;
        if (errs >= 4 && (cfg.__tileIdx || 0) < tileSets.length - 1) {
          map.removeLayer(layer);
          cfg.__tileIdx = (cfg.__tileIdx || 0) + 1;
          addTiles();
        }
      });
    };
    addTiles();

    // Focal point: ZITF with pulsing pin + soft radius ring
    L.circle([WRO_VENUE.lat, WRO_VENUE.lng], {
      radius: 3000, color: '#ff6b2c', weight: 1, opacity: 0.35, fillOpacity: 0.05, dashArray: '6 8'
    }).addTo(map);
    const venueMarker = L.marker([WRO_VENUE.lat, WRO_VENUE.lng], {
      icon: L.divIcon({ className: '', html: '<div class="map-pin-wrap"><div class="map-pin-halo"></div><div class="map-pin map-pin--event"><i class="ph-fill ph-flag-banner"></i></div></div>', iconSize: [48, 48], iconAnchor: [24, 44] }),
      zIndexOffset: 1000
    }).addTo(map);
    venueMarker.bindPopup(`
      <strong>${WRO_VENUE.name}</strong>
      <span class="map-popup-sub">${WRO_VENUE.sub}</span>
      <a class="map-popup-link" href="https://www.google.com/maps/dir/?api=1&destination=${WRO_VENUE.lat},${WRO_VENUE.lng}" target="_blank" rel="noopener">Get Directions <i class="ph ph-arrow-up-right"></i></a>
    `);

    const list = cfg.listEl ? document.getElementById(cfg.listEl) : null;
    const markers = [];

    WRO_PINS.forEach((p, idx) => {
      const cat = MAP_CATS[p.cat];
      const cls = p.cat === 'hotel' ? 'map-pin--hotel' : p.cat === 'stay' ? 'map-pin--stay' : 'map-pin--fun';
      const icn = p.cat === 'hotel' ? 'ph-buildings' : p.cat === 'stay' ? 'ph-house-line' : 'ph-confetti';
      const km = haversineKm(WRO_VENUE.lat, WRO_VENUE.lng, p.lat, p.lng).toFixed(1).replace(/\.0$/, '');
      const dir = `https://www.google.com/maps/dir/?api=1&origin=${WRO_VENUE.lat},${WRO_VENUE.lng}&destination=${p.lat},${p.lng}`;
      const marker = L.marker([p.lat, p.lng], {
        icon: L.divIcon({ className: '', html: `<div class="map-pin-wrap"><div class="map-pin ${cls}"><i class="ph-fill ${icn}"></i></div></div>`, iconSize: [48, 48], iconAnchor: [24, 44] })
      }).addTo(map);
      marker.bindPopup(`
        <span class="map-popup-cat map-popup-cat--${p.cat}">${cat.label.slice(0, -1) || cat.label}</span>
        <strong>${p.name}</strong>
        <span class="map-popup-sub">${p.sub || ''}${p.approx ? ' · <em>approximate pin</em>' : ''} · ${km} km from ZITF</span>
        <span class="map-popup-actions">
          <a class="map-popup-link" href="${dir}" target="_blank" rel="noopener">Directions <i class="ph ph-arrow-up-right"></i></a>
          ${p.web ? `<a class="map-popup-link" href="${p.web}" target="_blank" rel="noopener">Website <i class="ph ph-arrow-up-right"></i></a>` : ''}
        </span>
      `);
      markers.push(marker);

      if (list) {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'map-list-item';
        item.setAttribute('data-cat', p.cat);
        item.setAttribute('data-name', (p.name + ' ' + (p.sub || '')).toLowerCase());
        item.innerHTML = `
          <span class="map-list-icon map-list-icon--${p.cat}"><i class="ph-fill ${icn}"></i></span>
          <span class="map-list-text">
            <span class="map-list-name">${p.name}${p.approx ? ' <em class="map-list-approx">approx.</em>' : ''}</span>
            <span class="map-list-sub">${p.sub || ''} · ${km} km</span>
          </span>`;
        item.addEventListener('click', () => {
          map.flyTo([p.lat, p.lng], Math.max(map.getZoom(), 15), { duration: 0.8 });
          setTimeout(() => marker.openPopup(), 850);
          if (window.innerWidth < 992) map.panBy([-160, 0], { animate: true });
        });
        list.appendChild(item);
      }
    });

    // Google-style overlay UI: search pill, category chips, recenter
    const ui = document.createElement('div');
    ui.className = 'gm-ui';
    ui.innerHTML = cfg.search === false ? `
      <div class="gm-chips">
        <button type="button" class="gm-chip is-active" data-filter="all">All</button>
        <button type="button" class="gm-chip gm-chip--hotel" data-filter="hotel"><i class="ph-fill ph-buildings"></i>Hotels</button>
        <button type="button" class="gm-chip gm-chip--stay" data-filter="stay"><i class="ph-fill ph-house-line"></i>Lodges</button>
        <button type="button" class="gm-chip gm-chip--fun" data-filter="fun"><i class="ph-fill ph-confetti"></i>Things to Do</button>
      </div>
    ` : `
      <div class="gm-search"><i class="ph ph-magnifying-glass"></i><input type="text" placeholder="Search stays and things to do" aria-label="Search map places"></div>
      <div class="gm-chips">
        <button type="button" class="gm-chip is-active" data-filter="all">All</button>
        <button type="button" class="gm-chip gm-chip--hotel" data-filter="hotel"><i class="ph-fill ph-buildings"></i>Hotels</button>
        <button type="button" class="gm-chip gm-chip--stay" data-filter="stay"><i class="ph-fill ph-house-line"></i>Lodges</button>
        <button type="button" class="gm-chip gm-chip--fun" data-filter="fun"><i class="ph-fill ph-confetti"></i>Things to Do</button>
      </div>
      <button type="button" class="gm-recenter" title="Back to ZITF"><i class="ph-fill ph-crosshair"></i></button>
    `;
    el.appendChild(ui);
    if (cfg.recenter === false) { const r = ui.querySelector('.gm-recenter'); if (r) r.remove(); }

    const applyFilter = (filter, query) => {
      WRO_PINS.forEach((p, idx) => {
        const m = markers[idx];
        const catMatch = filter === 'all' || p.cat === filter;
        const q = (query || '').trim().toLowerCase();
        const qMatch = !q || (p.name + ' ' + (p.sub || '')).toLowerCase().includes(q);
        const show = catMatch && qMatch;
        if (show) { if (!map.hasLayer(m)) m.addTo(map); }
        else if (map.hasLayer(m)) map.removeLayer(m);
      });
      if (list) {
        list.querySelectorAll('.map-list-item').forEach(item => {
          const catMatch = filter === 'all' || item.getAttribute('data-cat') === filter;
          const q = (query || '').trim().toLowerCase();
          const qMatch = !q || (item.getAttribute('data-name') || '').includes(q);
          item.style.display = catMatch && qMatch ? '' : 'none';
        });
        list.querySelectorAll('.map-list-title').forEach(t => {
          const group = t.getAttribute('data-group');
          const groupMatch = filter === 'all' || group === filter;
          const hasVisible = [...list.querySelectorAll(`.map-list-item[data-cat="${group}"]`)].some(i => i.style.display !== 'none');
          t.style.display = groupMatch && hasVisible ? '' : 'none';
        });
      }
    };

    ui.querySelectorAll('.gm-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        ui.querySelectorAll('.gm-chip').forEach(c => c.classList.remove('is-active'));
        chip.classList.add('is-active');
        applyFilter(chip.getAttribute('data-filter'), searchInput ? searchInput.value : '');
      });
    });
    const searchInput = ui.querySelector('input');
    if (searchInput) {
      let deb;
      searchInput.addEventListener('input', () => {
        clearTimeout(deb);
        deb = setTimeout(() => applyFilter(ui.querySelector('.gm-chip.is-active').getAttribute('data-filter'), searchInput.value), 150);
      });
    }
    const recenterBtn = ui.querySelector('.gm-recenter');
    if (recenterBtn) recenterBtn.addEventListener('click', () => map.flyTo([WRO_VENUE.lat, WRO_VENUE.lng], 13, { duration: 0.8 }));

    if (list) {
      const listEl = list;
      const groups = [
        { key: 'hotel', label: 'Hotels' },
        { key: 'stay', label: 'Guest Houses & Lodges' },
        { key: 'fun', label: 'Things to Do' }
      ];
      groups.forEach(g => {
        const t = document.createElement('span');
        t.className = 'map-list-title';
        t.setAttribute('data-group', g.key);
        t.textContent = g.label;
        listEl.appendChild(t);
        const items = [...listEl.querySelectorAll(`.map-list-item[data-cat="${g.key}"]`)];
        items.sort((a, b) => {
          const ka = parseFloat(a.querySelector('.map-list-sub').textContent.match(/([\d.]+) km/)?.[1] || 99);
          const kb = parseFloat(b.querySelector('.map-list-sub').textContent.match(/([\d.]+) km/)?.[1] || 99);
          return ka - kb;
        });
        items.forEach(item => listEl.appendChild(item));
      });
    }
  }

  initPageMap();

  // --- 9. Mobile Navigation + Dropdown Sub-Nav ---
  if (navbar) {
    const navToggleBtn = document.getElementById('navToggle');
    if (navToggleBtn) {
      navToggleBtn.addEventListener('click', () => {
        const open = navbar.classList.toggle('nav-open');
        navToggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    // On mobile, tapping the dropdown toggle expands/collapses its sub-nav
    document.querySelectorAll('.nav-drop-toggle').forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        if (window.innerWidth > 992) return; // desktop: hover handles it, let the click navigate
        e.preventDefault();
        const dd = toggle.closest('.nav-dropdown');
        const wasOpen = dd.classList.contains('nav-drop-open');
        document.querySelectorAll('.nav-dropdown.nav-drop-open').forEach(d => d.classList.remove('nav-drop-open'));
        if (!wasOpen) dd.classList.add('nav-drop-open');
      });
    });

    // Close the mobile panel after tapping a link
    document.querySelectorAll('.nav-links a:not(.nav-drop-toggle)').forEach(a => {
      a.addEventListener('click', () => {
        if (window.innerWidth <= 992) {
          navbar.classList.remove('nav-open');
          if (navToggleBtn) navToggleBtn.setAttribute('aria-expanded', 'false');
        }
      });
    });

    // Clean up mobile-menu state when resizing back to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth > 992) {
        navbar.classList.remove('nav-open');
        document.querySelectorAll('.nav-dropdown.nav-drop-open').forEach(d => d.classList.remove('nav-drop-open'));
        if (navToggleBtn) navToggleBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

});

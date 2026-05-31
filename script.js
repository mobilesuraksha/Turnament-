
/* ===================================
   UP TENNIS BALL CRICKET TOURNAMENT
   Main JavaScript - script.js
   =================================== */

'use strict';

// ===== UTILITY: localStorage helpers =====
const LS = {
  get: (key, def = []) => { try { return JSON.parse(localStorage.getItem(key)) || def; } catch { return def; } },
  set: (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} },
  getObj: (key, def = {}) => { try { return JSON.parse(localStorage.getItem(key)) || def; } catch { return def; } },
};

// ===== UTILITY: Show Toast =====
function showToast(msg, type = 'info', dur = 3000) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'toast show ' + type;
  setTimeout(() => { t.className = 'toast'; }, dur);
}

// ===== UTILITY: Scroll To Section =====
function scrollTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ===== UTILITY: Generate ID =====
function genId(prefix = 'UPCKT') {
  return prefix + '-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
}

// ===== UTILITY: Format Date =====
function fmtDate(str) {
  if (!str) return '—';
  try { const d = new Date(str); return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); } catch { return str; }
}

// ===== UTILITY: Format Time =====
function fmtTime(str) {
  if (!str) return '—';
  try {
    const [h, m] = str.split(':');
    const d = new Date(); d.setHours(+h, +m);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch { return str; }
}

// ===== UTILITY: Open Modal =====
function openModal(id) { const m = document.getElementById(id); if (m) m.style.display = 'flex'; }
function closeModal(id) { const m = document.getElementById(id); if (m) m.style.display = 'none'; }

// ===== UTILITY: WhatsApp =====
function openWhatsApp(msg = '') {
  const num = '919876543210';
  const text = encodeURIComponent(msg || 'नमस्ते! यूपी क्रिकेट टूर्नामेंट के बारे में जानकारी चाहिए।');
  window.open(`https://wa.me/${num}?text=${text}`, '_blank');
}

// ===== NAVBAR: Sticky + Hamburger + Active Links =====
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  const backToTop = document.getElementById('backToTop');
  const links = document.querySelectorAll('.nav-link');

  // Scroll effects
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (backToTop) backToTop.classList.toggle('show', y > 300);

    // Active section highlight
    const sections = ['home', 'registration', 'payment', 'districts', 'prizes', 'contact', 'admin'];
    let current = '';
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el && window.scrollY >= el.offsetTop - 80) current = id;
    });
    links.forEach(l => {
      const href = l.getAttribute('href');
      l.classList.toggle('active', href === '#' + current);
    });
  });

  // Hamburger
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  // Close nav on link click
  links.forEach(l => {
    l.addEventListener('click', () => navLinks.classList.remove('open'));
  });

  // Close modal on overlay click
  document.querySelectorAll('.modal-overlay').forEach(m => {
    m.addEventListener('click', (e) => {
      if (e.target === m) m.style.display = 'none';
    });
  });
})();

// ===== PRIZE HIGHLIGHTS (Home) =====
function renderPrizeHighlights() {
  const container = document.getElementById('prizeHighlightCards');
  if (!container) return;
  const prizes = LS.get('prizes');
  const districtWinner = prizes.find(p => p.title === 'जिला विजेता' && p.visible === 'show');
  const districtRunner = prizes.find(p => p.title === 'जिला उपविजेता' && p.visible === 'show');
  const stateWinner = prizes.find(p => p.type === 'state' && p.title === 'स्टेट मेगा विजेता' && p.visible === 'show');

  const highlights = [
    {
      icon: 'fa-trophy', iconClass: 'gold',
      title: 'जिला विजेता',
      amount: districtWinner ? districtWinner.cash : '₹51,000+',
      detail: districtWinner ? [districtWinner.trophy, districtWinner.gift].filter(Boolean).join(' + ') : 'ट्रॉफी + बाइक + प्रमाण पत्र',
    },
    {
      icon: 'fa-medal', iconClass: 'gold',
      title: 'जिला उपविजेता',
      amount: districtRunner ? districtRunner.cash : '₹21,000+',
      detail: districtRunner ? [districtRunner.trophy, districtRunner.medal].filter(Boolean).join(' + ') : 'ट्रॉफी + मेडल',
    },
    {
      icon: 'fa-crown', iconClass: 'gold',
      title: 'स्टेट मेगा विजेता',
      amount: stateWinner ? stateWinner.cash : '₹5,00,000+',
      detail: stateWinner ? [stateWinner.trophy, stateWinner.gift].filter(Boolean).join(' + ') : 'मेगा ट्रॉफी + भव्य पुरस्कार',
    },
    {
      icon: 'fa-star', iconClass: 'green',
      title: 'विशेष पुरस्कार',
      amount: 'अनेक',
      detail: 'मैन ऑफ मैच, बेस्ट बैटसमैन, बेस्ट बॉलर और भी!',
    },
  ];

  container.innerHTML = highlights.map(h => `
    <div class="prize-highlight-card">
      <div class="ph-icon ${h.iconClass}"><i class="fas ${h.icon}"></i></div>
      <div class="ph-title">${h.title}</div>
      <div class="ph-amount">${h.amount}</div>
      <div class="ph-detail">${h.detail}</div>
    </div>
  `).join('');
}

// ===== REGISTRATION FORM =====
(function initRegistration() {
  const form = document.getElementById('registrationForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateRegForm()) return;

    const teamId = genId();
    const logoFile = document.getElementById('teamLogo').files[0];

    const readLogoAndSave = (logoData) => {

      const team = {
        id: teamId,
        teamName: form.teamName.value.trim(),
        captainName: form.captainName.value.trim(),
        mobileNo: form.mobileNo.value.trim(),
        whatsappNo: form.whatsappNo.value.trim(),
        email: form.email.value.trim(),
        district: form.district.value,
        city: form.city.value.trim(),
        totalPlayers: form.totalPlayers.value,
        playerNames: form.playerNames.value.trim(),
        jerseyColor: form.jerseyColor.value.trim(),
        logo: logoData || '',
        registeredAt: new Date().toISOString(),
        paymentStatus: 'pending',
        paymentUTR: '',
        paymentScreenshot: '',
        rejectionReason: '',
        receiptNo: '',
        approvedAt: '',
      };

      const teams = LS.get('teams');
      teams.push(team);
      LS.set('teams', teams);

      // Store last registered team for payment page
      LS.set('lastRegistered', team, {});
      localStorage.setItem('lastRegistered', JSON.stringify(team));

      showToast(`✅ रजिस्ट्रेशन पूरा हुआ! टीम आईडी: ${teamId}`, 'success', 5000);
      form.reset();
      setTimeout(() => scrollTo('payment'), 1200);

      // Pre-fill payment form
      const payTeamId = document.getElementById('payTeamId');
      if (payTeamId) payTeamId.value = team.teamName + ' (' + teamId + ')';
    };

    if (logoFile) {
      const reader = new FileReader();
      reader.onload = (ev) => readLogoAndSave(ev.target.result);
      reader.readAsDataURL(logoFile);
    } else {
      readLogoAndSave('');
    }
  });
})();

function validateRegForm() {
  let valid = true;
  const fields = [
    { id: 'teamName', msg: 'टीम का नाम आवश्यक है' },
    { id: 'captainName', msg: 'कप्तान का नाम आवश्यक है' },
    { id: 'city', msg: 'गाँव/शहर का नाम आवश्यक है' },
    { id: 'jerseyColor', msg: 'जर्सी का रंग आवश्यक है' },
    { id: 'playerNames', msg: 'खिलाड़ियों के नाम आवश्यक हैं' },
  ];

  fields.forEach(f => {
    const el = document.getElementById(f.id);
    const err = document.getElementById('err-' + f.id);
    if (!el.value.trim()) {
      el.classList.add('error');
      if (err) err.textContent = f.msg;
      valid = false;
    } else {
      el.classList.remove('error');
      if (err) err.textContent = '';
    }
  });

  // Mobile validation
  const mob = document.getElementById('mobileNo');
  const errMob = document.getElementById('err-mobileNo');
  if (!/^[6-9]\d{9}$/.test(mob.value.trim())) {
    mob.classList.add('error');
    errMob.textContent = 'सही 10 अंक का मोबाइल नंबर आवश्यक है';
    valid = false;
  } else { mob.classList.remove('error'); errMob.textContent = ''; }

  const wa = document.getElementById('whatsappNo');
  const errWa = document.getElementById('err-whatsappNo');
  if (!/^[6-9]\d{9}$/.test(wa.value.trim())) {
    wa.classList.add('error');
    errWa.textContent = 'सही 10 अंक का व्हाट्सएप नंबर आवश्यक है';
    valid = false;
  } else { wa.classList.remove('error'); errWa.textContent = ''; }

  // District
  const dist = document.getElementById('district');
  const errDist = document.getElementById('err-district');
  if (!dist.value) {
    dist.classList.add('error');
    errDist.textContent = 'कृपया जिला चुनें';
    valid = false;
  } else { dist.classList.remove('error'); errDist.textContent = ''; }

  // Players count
  const tp = document.getElementById('totalPlayers');
  const errTp = document.getElementById('err-totalPlayers');
  if (!tp.value || +tp.value < 11 || +tp.value > 15) {
    tp.classList.add('error');
    errTp.textContent = 'खिलाड़ी 11 से 15 के बीच होने चाहिए';
    valid = false;
  } else { tp.classList.remove('error'); errTp.textContent = ''; }

  // Email optional but validate if filled
  const em = document.getElementById('email');
  const errEm = document.getElementById('err-email');
  if (em.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value)) {
    em.classList.add('error');
    errEm.textContent = 'सही ईमेल पता आवश्यक है';
    valid = false;
  } else { em.classList.remove('error'); errEm.textContent = ''; }

  // Terms
  const terms = document.getElementById('terms');
  const errTerms = document.getElementById('err-terms');
  if (!terms.checked) {
    errTerms.textContent = 'नियम और शर्तें स्वीकार करना अनिवार्य है';
    valid = false;
  } else { errTerms.textContent = ''; }

  if (!valid) showToast('⚠️ कृपया सभी जरूरी फ़ील्ड भरें', 'warning');
  return valid;
}

// ===== PAYMENT FORM =====
(function initPayment() {
  const form = document.getElementById('paymentForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const teamIdVal = document.getElementById('payTeamId').value.trim();
    const utr = document.getElementById('utrId').value.trim();
    const screenshot = document.getElementById('paymentScreenshot').files[0];
    let valid = true;

    if (!teamIdVal) { document.getElementById('err-payTeamId').textContent = 'टीम आईडी / नाम आवश्यक है'; valid = false; } else { document.getElementById('err-payTeamId').textContent = ''; }
    if (!utr) { document.getElementById('err-utrId').textContent = 'UTR / ट्रांजेक्शन आईडी आवश्यक है'; valid = false; } else { document.getElementById('err-utrId').textContent = ''; }
    if (!screenshot) { document.getElementById('err-paymentScreenshot').textContent = 'पेमेंट स्क्रीनशॉट अपलोड करें'; valid = false; } else { document.getElementById('err-paymentScreenshot').textContent = ''; }

    if (!valid) { showToast('⚠️ सभी फ़ील्ड भरें', 'warning'); return; }

    const savePayment = (screenshotData) => {
      const teams = LS.get('teams');
      // Try to find team by ID or name
      let updated = false;
      teams.forEach(t => {
        if (teamIdVal.includes(t.id) || t.teamName.toLowerCase() === teamIdVal.toLowerCase()) {
          t.paymentUTR = utr;
          t.paymentScreenshot = screenshotData;
          t.paymentStatus = 'pending';
          updated = true;
        }
      });
      LS.set('teams', teams);

      // Show pending status
      const statusDiv = document.getElementById('paymentStatus');
      statusDiv.style.display = 'block';
      statusDiv.className = 'payment-status-msg pending';
      statusDiv.innerHTML = `
        <i class="fas fa-clock"></i> 
        <strong>पेमेंट जमा हो गई!</strong><br/>
        स्थिति: <strong>एडमिन अप्रूवल लंबित है</strong><br/>
        UTR: ${utr}<br/>
        <small>अप्रूवल के बाद आपको रसीद मिलेगी। एडमिन से व्हाट्सएप पर संपर्क करें।</small>
      `;

      showToast('✅ पेमेंट विवरण जमा हो गया! अप्रूवल लंबित है।', 'success', 5000);
      form.reset();
    };

    if (screenshot) {
      const reader = new FileReader();
      reader.onload = (ev) => savePayment(ev.target.result);
      reader.readAsDataURL(screenshot);
    } else {
      savePayment('');
    }
  });
})();

// ===== DISTRICT CARDS (User Side) =====
function renderDistrictCards() {
  const container = document.getElementById('districtCards');
  if (!container) return;
  const districts = LS.get('districtDetails');
  const search = (document.getElementById('districtSearch') || {}).value || '';

  const filtered = districts.filter(d =>
    d.district.toLowerCase().includes(search.toLowerCase())
  );

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="no-data">
        <i class="fas fa-map-marker-alt"></i>
        <p>अभी कोई जिला विवरण उपलब्ध नहीं है।<br/>एडमिन जल्द ही अपडेट करेंगे।</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(d => `
    <div class="district-card">
      <div class="district-card-header">
        <i class="fas fa-map-marker-alt"></i>
        <h3>${d.district}</h3>
      </div>
      <div class="district-card-body">
        <div class="dc-row">
          <i class="fas fa-stadium"></i>
          <span class="dc-label">मैदान:</span>
          <span class="dc-val">${d.ground || '—'}</span>
        </div>
        <div class="dc-row">
          <i class="fas fa-map-pin"></i>
          <span class="dc-label">पता:</span>
          <span class="dc-val">${d.address || '—'}</span>
        </div>
        <div class="dc-row">
          <i class="fas fa-calendar-alt"></i>
          <span class="dc-label">तारीख:</span>
          <span class="dc-val">${fmtDate(d.date)}</span>
        </div>
        <div class="dc-row">
          <i class="fas fa-clock"></i>
          <span class="dc-label">रिपोर्टिंग:</span>
          <span class="dc-val">${fmtTime(d.reportTime)}</span>
        </div>
        <div class="dc-row">
          <i class="fas fa-cricket-ball"></i>
          <span class="dc-label">मैच समय:</span>
          <span class="dc-val">${fmtTime(d.matchTime)}</span>
        </div>
        <div class="dc-row">
          <i class="fas fa-hourglass-end"></i>
          <span class="dc-label">अंतिम एंट्री:</span>
          <span class="dc-val">${fmtDate(d.lastEntry)}</span>
        </div>
        <div class="dc-row">
          <i class="fas fa-list-ol"></i>
          <span class="dc-label">ओवर:</span>
          <span class="dc-val">${d.overs || '—'}</span>
        </div>
        <div class="dc-row">
          <i class="fas fa-door-open"></i>
          <span class="dc-label">एंट्री:</span>
          <span class="dc-val"><span class="entry-badge ${(d.entryStatus || 'Open') === 'Open' ? 'open' : 'closed'}">${(d.entryStatus || 'Open') === 'Open' ? 'खुला' : 'बंद'}</span></span>
        </div>
        ${d.rules ? `<div class="dc-row"><i class="fas fa-book"></i><span class="dc-label">नियम:</span><span class="dc-val">${d.rules}</span></div>` : ''}
        ${d.contact ? `<div class="dc-row"><i class="fas fa-user"></i><span class="dc-label">संपर्क:</span><span class="dc-val">${d.contact}</span></div>` : ''}
        ${d.wa ? `<div class="dc-row"><i class="fab fa-whatsapp"></i><span class="dc-label">व्हाट्सएप:</span><span class="dc-val"><a href="https://wa.me/91${d.wa}" target="_blank">${d.wa}</a></span></div>` : ''}
      </div>
      <div class="district-card-footer" style="display:flex;gap:8px;flex-wrap:wrap;">
        ${d.mapLink ? `<a href="${d.mapLink}" target="_blank" class="btn btn-sm btn-outline"><i class="fas fa-map-marker-alt"></i> नक्शा</a>` : ''}
        ${d.wa ? `<a href="https://wa.me/91${d.wa}" target="_blank" class="btn btn-sm btn-whatsapp"><i class="fab fa-whatsapp"></i> संपर्क</a>` : ''}
      </div>
    </div>
  `).join('');
}

// District search input
document.addEventListener('DOMContentLoaded', () => {
  const ds = document.getElementById('districtSearch');
  if (ds) ds.addEventListener('input', renderDistrictCards);
});

// ===== PRIZE SECTION (User Side) =====
function renderPrizeSection() {
  const container = document.getElementById('prizeContent');
  if (!container) return;
  const prizes = LS.get('prizes').filter(p => p.visible === 'show');

  if (prizes.length === 0) {
    container.innerHTML = `<div class="prize-no-data"><i class="fas fa-trophy" style="font-size:2.5rem;color:var(--gold);display:block;margin-bottom:12px;"></i>पुरस्कार विवरण एडमिन द्वारा अपडेट किए जाएंगे। जल्द ही घोषणा होगी!</div>`;
    return;
  }

  const district = prizes.filter(p => p.type === 'district');
  const state = prizes.filter(p => p.type === 'state');

  const renderPrizeCards = (list) => list.map((p, i) => `
    <div class="prize-card">
      <div class="pc-icon ${i === 0 ? 'gold' : i === 1 ? 'silver' : 'green'}">
        <i class="fas ${i === 0 ? 'fa-trophy' : i === 1 ? 'fa-medal' : 'fa-award'}"></i>
      </div>
      <div class="pc-title">${p.title}</div>
      <div class="pc-cash">${p.cash || '—'}</div>
      <div class="pc-extras">
        ${p.trophy ? `<span><i class="fas fa-trophy"></i> ${p.trophy}</span>` : ''}
        ${p.gift ? `<span><i class="fas fa-motorcycle"></i> ${p.gift}</span>` : ''}
        ${p.medal ? `<span><i class="fas fa-medal"></i> ${p.medal}</span>` : ''}
        ${p.cert ? `<span><i class="fas fa-certificate"></i> ${p.cert}</span>` : ''}
      </div>
    </div>
  `).join('');

  container.innerHTML = `
    ${district.length > 0 ? `<div class="prize-category-title"><i class="fas fa-map-marker-alt"></i> जिला स्तरीय पुरस्कार</div><div class="prize-cards-grid">${renderPrizeCards(district)}</div>` : ''}
    ${state.length > 0 ? `<div class="prize-category-title"><i class="fas fa-crown"></i> स्टेट लेवल मेगा पुरस्कार</div><div class="prize-cards-grid">${renderPrizeCards(state)}</div>` : ''}
  `;
}

// ===== CONTACT FORM =====
(function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('contactName').value.trim();
    const mob = document.getElementById('contactMobile').value.trim();
    const msg = document.getElementById('contactMsg').value.trim();
    if (!msg) { showToast('⚠️ Message likhein', 'warning'); return; }
    const text = `Namaste! Main ${name || 'ek user'} hoon. Mobile: ${mob || 'N/A'}\n\n${msg}`;
    openWhatsApp(text);
  });
})();

// ===== ADMIN LOGIN =====
function adminLogin() {
  const user = document.getElementById('adminUser').value.trim();
  const pass = document.getElementById('adminPass').value.trim();
  if (user === 'admin' && pass === 'admin123') {
    LS.set('adminSession', { loggedIn: true, time: Date.now() });
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
    updateStats();
    renderAdminTeams();
    renderAdminDistricts();
    renderAdminPrizes();
    showToast('✅ एडमिन लॉगिन सफल!', 'success');
  } else {
    showToast('❌ गलत यूजरनेम या पासवर्ड', 'error');
  }
}

function adminLogout() {
  LS.set('adminSession', { loggedIn: false });
  document.getElementById('adminDashboard').style.display = 'none';
  document.getElementById('adminLogin').style.display = 'flex';
  document.getElementById('adminUser').value = '';
  document.getElementById('adminPass').value = '';
  showToast('लॉगआउट सफल', 'info');
}

// Auto-restore admin session
(function checkAdminSession() {
  const sess = LS.getObj('adminSession');
  if (sess && sess.loggedIn && (Date.now() - sess.time < 3600000)) {
    setTimeout(() => {
      document.getElementById('adminLogin').style.display = 'none';
      document.getElementById('adminDashboard').style.display = 'block';
      updateStats();
      renderAdminTeams();
      renderAdminDistricts();
      renderAdminPrizes();
    }, 300);
  }
})();

// ===== ADMIN: Stats =====
function updateStats() {
  const teams = LS.get('teams');
  const payments = teams.filter(t => t.paymentUTR);
  document.getElementById('statTotal').textContent = teams.length;
  document.getElementById('statPending').textContent = payments.filter(t => t.paymentStatus === 'pending').length;
  document.getElementById('statApproved').textContent = payments.filter(t => t.paymentStatus === 'approved').length;
  document.getElementById('statRejected').textContent = payments.filter(t => t.paymentStatus === 'rejected').length;
}

// ===== ADMIN TABS =====
function showAdminTab(tab, btn) {
  ['teams', 'districts', 'prizes'].forEach(t => {
    const el = document.getElementById('tab-' + t);
    if (el) el.style.display = t === tab ? 'block' : 'none';
  });
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

// ===== ADMIN: Teams =====
function renderAdminTeams() {
  const container = document.getElementById('adminTeamsList');
  if (!container) return;
  const teams = LS.get('teams');
  const search = (document.getElementById('searchTeam') || {}).value || '';
  const district = (document.getElementById('filterDistrict') || {}).value || '';

  const filtered = teams.filter(t =>
    (!search || t.teamName.toLowerCase().includes(search.toLowerCase()) || t.captainName.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase())) &&
    (!district || t.district === district)
  );

  if (filtered.length === 0) {
    container.innerHTML = '<p style="text-align:center;padding:30px;color:var(--text-light);">कोई टीम नहीं मिली</p>';
    return;
  }

  container.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>टीम आईडी</th>
          <th>टीम का नाम</th>
          <th>कप्तान</th>
          <th>जिला</th>
          <th>मोबाइल</th>
          <th>पेमेंट</th>
          <th>स्थिति</th>
          <th>कार्यवाही</th>
        </tr>
      </thead>
      <tbody>
        ${filtered.map(t => `
          <tr>
            <td><code style="font-size:0.78rem;">${t.id}</code></td>
            <td><strong>${t.teamName}</strong></td>
            <td>${t.captainName}</td>
            <td>${t.district}</td>
            <td>${t.mobileNo}</td>
            <td>${t.paymentUTR ? '<span class="status-badge pending">जमा हुई</span>' : '<span style="color:var(--text-light);font-size:0.8rem;">जमा नहीं</span>'}</td>
            <td><span class="status-badge ${t.paymentStatus || 'pending'}">${statusLabel(t.paymentStatus)}</span></td>
            <td>
              <div class="action-btns">
                <button class="btn btn-sm btn-outline" onclick="viewTeam('${t.id}')"><i class="fas fa-eye"></i></button>
                ${t.paymentStatus !== 'approved' ? `<button class="btn btn-sm" style="background:var(--success);color:white;" onclick="approveTeam('${t.id}')"><i class="fas fa-check"></i> स्वीकृत</button>` : ''}
                ${t.paymentStatus !== 'rejected' ? `<button class="btn btn-sm btn-danger" onclick="openRejectModal('${t.id}')"><i class="fas fa-times"></i> अस्वीकृत</button>` : ''}
                ${t.paymentStatus === 'approved' ? `<button class="btn btn-sm btn-gold" onclick="viewReceipt('${t.id}')"><i class="fas fa-file-pdf"></i> रसीद</button>` : ''}
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

// ===== STATUS LABEL HELPER =====
function statusLabel(s) {
  if (s === 'approved') return 'स्वीकृत';
  if (s === 'rejected') return 'अस्वीकृत';
  return 'लंबित';
}

function viewTeam(id) {
  const teams = LS.get('teams');
  const t = teams.find(t => t.id === id);
  if (!t) return;

  const content = document.getElementById('viewTeamContent');
  content.innerHTML = `
    <div class="team-view-grid">
      <div class="tv-item"><span class="tv-label">टीम आईडी</span><span class="tv-val">${t.id}</span></div>
      <div class="tv-item"><span class="tv-label">टीम का नाम</span><span class="tv-val">${t.teamName}</span></div>
      <div class="tv-item"><span class="tv-label">कप्तान</span><span class="tv-val">${t.captainName}</span></div>
      <div class="tv-item"><span class="tv-label">मोबाइल</span><span class="tv-val">${t.mobileNo}</span></div>
      <div class="tv-item"><span class="tv-label">व्हाट्सएप</span><span class="tv-val">${t.whatsappNo}</span></div>
      <div class="tv-item"><span class="tv-label">ईमेल</span><span class="tv-val">${t.email || '—'}</span></div>
      <div class="tv-item"><span class="tv-label">जिला</span><span class="tv-val">${t.district}</span></div>
      <div class="tv-item"><span class="tv-label">शहर/गाँव</span><span class="tv-val">${t.city}</span></div>
      <div class="tv-item"><span class="tv-label">कुल खिलाड़ी</span><span class="tv-val">${t.totalPlayers}</span></div>
      <div class="tv-item"><span class="tv-label">जर्सी रंग</span><span class="tv-val">${t.jerseyColor}</span></div>
      <div class="tv-item"><span class="tv-label">पेमेंट UTR</span><span class="tv-val">${t.paymentUTR || '—'}</span></div>
      <div class="tv-item"><span class="tv-label">पेमेंट स्थिति</span><span class="tv-val"><span class="status-badge ${t.paymentStatus || 'pending'}">${statusLabel(t.paymentStatus)}</span></span></div>
      ${t.rejectionReason ? `<div class="tv-item" style="grid-column:1/-1;"><span class="tv-label">अस्वीकृति कारण</span><span class="tv-val" style="color:var(--danger);">${t.rejectionReason}</span></div>` : ''}
      <div class="tv-item" style="grid-column:1/-1;"><span class="tv-label">खिलाड़ियों के नाम</span><span class="tv-val" style="white-space:pre-line;">${t.playerNames}</span></div>
    </div>
    ${t.paymentScreenshot ? `<div style="margin-top:16px;"><p style="font-weight:700;margin-bottom:8px;"><i class="fas fa-image"></i> पेमेंट स्क्रीनशॉट:</p><img src="${t.paymentScreenshot}" class="screenshot-preview" alt="Payment screenshot" /></div>` : ''}
    ${t.logo ? `<div style="margin-top:16px;"><p style="font-weight:700;margin-bottom:8px;"><i class="fas fa-shield-alt"></i> टीम लोगो:</p><img src="${t.logo}" style="height:80px;border-radius:8px;" alt="Team logo" /></div>` : ''}
  `;

  const actions = document.getElementById('viewTeamActions');
  actions.innerHTML = `
    <div style="display:flex;gap:8px;flex-wrap:wrap;">
      ${t.paymentStatus !== 'approved' ? `<button class="btn btn-primary" onclick="approveTeam('${t.id}');closeModal('viewTeamModal')"><i class="fas fa-check"></i> स्वीकृत करें</button>` : ''}
      ${t.paymentStatus !== 'rejected' ? `<button class="btn btn-danger" onclick="openRejectModal('${t.id}');closeModal('viewTeamModal')"><i class="fas fa-times"></i> अस्वीकृत करें</button>` : ''}
      ${t.paymentStatus === 'approved' ? `<button class="btn btn-gold" onclick="viewReceipt('${t.id}')"><i class="fas fa-file-pdf"></i> रसीद देखें</button>` : ''}
      <button class="btn btn-outline" onclick="closeModal('viewTeamModal')">बंद करें</button>
    </div>
  `;

  openModal('viewTeamModal');
}

function approveTeam(id) {
  const teams = LS.get('teams');
  const t = teams.find(t => t.id === id);
  if (!t) return;
  t.paymentStatus = 'approved';
  t.approvedAt = new Date().toISOString();
  t.receiptNo = 'RCP-' + Date.now().toString(36).toUpperCase();
  t.rejectionReason = '';
  LS.set('teams', teams);
  updateStats();
  renderAdminTeams();
  showToast(`✅ ${t.teamName} स्वीकृत! रसीद तैयार है।`, 'success');
}

function openRejectModal(id) {
  document.getElementById('rejectTeamId').value = id;
  document.getElementById('rejectReason').value = '';
  openModal('rejectModal');
}

function confirmReject() {
  const id = document.getElementById('rejectTeamId').value;
  const reason = document.getElementById('rejectReason').value.trim();
  if (!reason) { showToast('⚠️ अस्वीकृति का कारण लिखें', 'warning'); return; }
  const teams = LS.get('teams');
  const t = teams.find(t => t.id === id);
  if (!t) return;
  t.paymentStatus = 'rejected';
  t.rejectionReason = reason;
  LS.set('teams', teams);
  closeModal('rejectModal');
  updateStats();
  renderAdminTeams();
  showToast(`टीम अस्वीकृत। कारण: ${reason}`, 'error');
}

// ===== RECEIPT =====
let currentReceiptTeam = null;

function viewReceipt(id) {
  const teams = LS.get('teams');
  const t = teams.find(t => t.id === id);
  if (!t || t.paymentStatus !== 'approved') {
    showToast('रसीद केवल स्वीकृत टीमों के लिए उपलब्ध है', 'warning');
    return;
  }
  currentReceiptTeam = t;
  const content = document.getElementById('receiptContent');
  content.innerHTML = `
    <div class="receipt-box" id="receiptPrintArea">
      <div class="receipt-header">
        <h4>🏏 यूपी क्रिकेट टूर्नामेंट 2025</h4>
        <p>आधिकारिक पेमेंट रसीद</p>
      </div>
      <div class="receipt-row"><span class="r-label">रसीद नंबर:</span><span class="r-val">${t.receiptNo}</span></div>
      <div class="receipt-row"><span class="r-label">टीम आईडी:</span><span class="r-val">${t.id}</span></div>
      <div class="receipt-row"><span class="r-label">टीम का नाम:</span><span class="r-val">${t.teamName}</span></div>
      <div class="receipt-row"><span class="r-label">कप्तान:</span><span class="r-val">${t.captainName}</span></div>
      <div class="receipt-row"><span class="r-label">जिला:</span><span class="r-val">${t.district}</span></div>
      <div class="receipt-row"><span class="r-label">मोबाइल:</span><span class="r-val">${t.mobileNo}</span></div>
      <div class="receipt-row"><span class="r-label">प्रवेश शुल्क:</span><span class="r-val">₹2,100</span></div>
      <div class="receipt-row"><span class="r-label">UTR / ट्रांजेक्शन:</span><span class="r-val">${t.paymentUTR || '—'}</span></div>
      <div class="receipt-row"><span class="r-label">अप्रूवल तारीख:</span><span class="r-val">${fmtDate(t.approvedAt)}</span></div>
      <div class="receipt-row"><span class="r-label">संपर्क:</span><span class="r-val">+91-9876543210</span></div>
      <div class="receipt-status">✅ पेमेंट स्थिति: स्वीकृत</div>
    </div>
  `;
  openModal('receiptModal');
}

function downloadReceipt() {
  if (!currentReceiptTeam) return;
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });
  const t = currentReceiptTeam;

  // Background
  doc.setFillColor(10, 22, 40);
  doc.rect(0, 0, 148, 210, 'F');
  doc.setFillColor(26, 122, 60);
  doc.rect(0, 0, 148, 14, 'F');

  // Header
  doc.setTextColor(245, 197, 24);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('यूपी टेनिस बॉल क्रिकेट टूर्नामेंट 2025', 74, 9, { align: 'center' });

  doc.setFillColor(26, 122, 60);
  doc.rect(0, 16, 148, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text('आधिकारिक पेमेंट रसीद', 74, 21, { align: 'center' });

  // Receipt details
  const rows = [
    ['Receipt No', t.receiptNo],
    ['Team ID', t.id],
    ['Team Name', t.teamName],
    ['Captain', t.captainName],
    ['District', t.district],
    ['City', t.city],
    ['Mobile', t.mobileNo],
    ['Entry Fee', '\u20B92,100'],
    ['UTR', t.paymentUTR || '—'],
    ['Approved On', fmtDate(t.approvedAt)],
    ['Contact', '+91-9876543210'],
  ];

  let y = 32;
  doc.setFontSize(9);
  rows.forEach(([label, val], i) => {
    if (i % 2 === 0) { doc.setFillColor(15, 32, 55); } else { doc.setFillColor(20, 38, 62); }
    doc.rect(8, y - 4, 132, 7, 'F');
    doc.setTextColor(150, 180, 200);
    doc.setFont('helvetica', 'normal');
    doc.text(label + ':', 12, y);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(String(val), 65, y);
    y += 9;
  });

  // Status box
  doc.setFillColor(26, 122, 60);
  doc.roundedRect(18, y + 4, 112, 12, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT STATUS: APPROVED', 74, y + 12, { align: 'center' });

  // Footer
  doc.setTextColor(100, 130, 160);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('यह एक कंप्यूटर जनित रसीद है। टूर्नामेंट जुलाई 2025 से शुरू होगा।', 74, 195, { align: 'center' });
  doc.text('upcricket2025@gmail.com | +91-9876543210', 74, 200, { align: 'center' });

  doc.save(`Receipt-${t.id}.pdf`);
  showToast('✅ PDF डाउनलोड हो गई!', 'success');
}

function printReceipt() {
  const el = document.getElementById('receiptPrintArea');
  if (!el) return;
  const w = window.open('', '_blank');
  w.document.write(`<html><head><title>Receipt</title><style>
    body{font-family:sans-serif;padding:20px;max-width:480px;margin:0 auto;}
    .receipt-box{border:2px solid #1a7a3c;border-radius:10px;padding:20px;background:#f8fff4;}
    .receipt-header{text-align:center;border-bottom:2px solid #1a7a3c;padding-bottom:12px;margin-bottom:16px;}
    .receipt-row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #e8f5e9;font-size:13px;}
    .r-label{color:#666;font-weight:600;}
    .r-val{font-weight:700;color:#0a1628;}
    .receipt-status{text-align:center;margin-top:12px;padding:8px;background:#e8f5e9;border-radius:6px;color:#1a7a3c;font-weight:700;}
  </style></head><body>${el.outerHTML}</body></html>`);
  w.document.close();
  w.print();
}

function shareReceiptWA() {
  if (!currentReceiptTeam) return;
  const t = currentReceiptTeam;
  const msg = `🏏 यूपी क्रिकेट टूर्नामेंट 2025 - पेमेंट रसीद\n\nरसीद नंबर: ${t.receiptNo}\nटीम: ${t.teamName}\nकप्तान: ${t.captainName}\nजिला: ${t.district}\nप्रवेश शुल्क: ₹2,100\nUTR: ${t.paymentUTR}\nस्थिति: ✅ स्वीकृत\n\nसंपर्क: +91-9876543210`;
  openWhatsApp(msg);
}

// ===== ADMIN: Districts =====
let editingDistrictId = null;

function renderAdminDistricts() {
  const container = document.getElementById('adminDistrictList');
  if (!container) return;
  const districts = LS.get('districtDetails');

  if (districts.length === 0) {
    container.innerHTML = '<p style="text-align:center;padding:30px;color:var(--text-light);">कोई जिला विवरण नहीं है। जोड़ें।</p>';
    return;
  }

  container.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>जिला</th>
          <th>मैदान</th>
          <th>तारीख</th>
          <th>एंट्री</th>
          <th>संपर्क</th>
          <th>कार्यवाही</th>
        </tr>
      </thead>
      <tbody>
        ${districts.map(d => `
          <tr>
            <td><strong>${d.district}</strong></td>
            <td>${d.ground || '—'}</td>
            <td>${fmtDate(d.date)}</td>
            <td><span class="entry-badge ${(d.entryStatus || 'Open') === 'Open' ? 'open' : 'closed'}">${(d.entryStatus || 'Open') === 'Open' ? 'खुला' : 'बंद'}</span></td>
            <td>${d.wa || '—'}</td>
            <td>
              <div class="action-btns">
                <button class="btn btn-sm btn-outline" onclick="editDistrict('${d.id}')"><i class="fas fa-edit"></i> संपादित</button>
                <button class="btn btn-sm btn-danger" onclick="deleteDistrict('${d.id}')"><i class="fas fa-trash"></i></button>
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function openDistrictModal() {
  editingDistrictId = null;
  document.getElementById('districtModalTitle').textContent = 'District Details Add Karein';
  ['dDistrict','dGround','dAddress','dMapLink','dContact','dWA','dRules'].forEach(id => { document.getElementById(id).value = ''; });
  ['dDate','dReportTime','dMatchTime','dLastEntry'].forEach(id => { document.getElementById(id).value = ''; });
  document.getElementById('dOvers').value = '';
  document.getElementById('dEntryStatus').value = 'Open';
  document.getElementById('editDistrictId').value = '';
  openModal('districtModal');
}

function editDistrict(id) {
  const districts = LS.get('districtDetails');
  const d = districts.find(d => d.id === id);
  if (!d) return;
  editingDistrictId = id;
  document.getElementById('districtModalTitle').textContent = 'District Details Edit Karein';
  document.getElementById('editDistrictId').value = id;
  document.getElementById('dDistrict').value = d.district || '';
  document.getElementById('dGround').value = d.ground || '';
  document.getElementById('dAddress').value = d.address || '';
  document.getElementById('dMapLink').value = d.mapLink || '';
  document.getElementById('dDate').value = d.date || '';
  document.getElementById('dReportTime').value = d.reportTime || '';
  document.getElementById('dMatchTime').value = d.matchTime || '';
  document.getElementById('dLastEntry').value = d.lastEntry || '';
  document.getElementById('dOvers').value = d.overs || '';
  document.getElementById('dEntryStatus').value = d.entryStatus || 'Open';
  document.getElementById('dContact').value = d.contact || '';
  document.getElementById('dWA').value = d.wa || '';
  document.getElementById('dRules').value = d.rules || '';
  openModal('districtModal');
}

function saveDistrict() {
  const districtName = document.getElementById('dDistrict').value.trim();
  if (!districtName) { showToast('⚠️ जिले का नाम आवश्यक है', 'warning'); return; }

  const data = {
    id: editingDistrictId || genId('DIST'),
    district: districtName,
    ground: document.getElementById('dGround').value.trim(),
    address: document.getElementById('dAddress').value.trim(),
    mapLink: document.getElementById('dMapLink').value.trim(),
    date: document.getElementById('dDate').value,
    reportTime: document.getElementById('dReportTime').value,
    matchTime: document.getElementById('dMatchTime').value,
    lastEntry: document.getElementById('dLastEntry').value,
    overs: document.getElementById('dOvers').value,
    entryStatus: document.getElementById('dEntryStatus').value,
    contact: document.getElementById('dContact').value.trim(),
    wa: document.getElementById('dWA').value.trim(),
    rules: document.getElementById('dRules').value.trim(),
  };

  const districts = LS.get('districtDetails');
  if (editingDistrictId) {
    const idx = districts.findIndex(d => d.id === editingDistrictId);
    if (idx !== -1) districts[idx] = data;
  } else {
    districts.push(data);
  }

  LS.set('districtDetails', districts);
  closeModal('districtModal');
  renderAdminDistricts();
  renderDistrictCards();
  showToast(`✅ ${districtName} सहेजा गया!`, 'success');
  editingDistrictId = null;
}

function deleteDistrict(id) {
  if (!confirm('इस जिले को हटाएं?')) return;
  const districts = LS.get('districtDetails').filter(d => d.id !== id);
  LS.set('districtDetails', districts);
  renderAdminDistricts();
  renderDistrictCards();
  showToast('जिला हटा दिया गया', 'info');
}

// ===== ADMIN: Prizes =====
let editingPrizeId = null;

function renderAdminPrizes() {
  const container = document.getElementById('adminPrizeList');
  if (!container) return;
  const prizes = LS.get('prizes');

  if (prizes.length === 0) {
    container.innerHTML = '<p style="text-align:center;padding:30px;color:var(--text-light);">कोई पुरस्कार नहीं जोड़ा। जोड़ें।</p>';
    return;
  }

  container.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>प्रकार</th>
          <th>शीर्षक</th>
          <th>नकद पुरस्कार</th>
          <th>ट्रॉफी</th>
          <th>बाइक/उपहार</th>
          <th>स्थिति</th>
          <th>कार्यवाही</th>
        </tr>
      </thead>
      <tbody>
        ${prizes.map(p => `
          <tr>
            <td><span class="status-badge ${p.type === 'district' ? 'pending' : 'approved'}">${p.type === 'district' ? 'जिला' : 'स्टेट'}</span></td>
            <td><strong>${p.title}</strong></td>
            <td>${p.cash || '—'}</td>
            <td>${p.trophy || '—'}</td>
            <td>${p.gift || '—'}</td>
            <td><span class="status-badge ${p.visible === 'show' ? 'approved' : 'rejected'}">${p.visible === 'show' ? 'दिख रहा' : 'छुपा'}</span></td>
            <td>
              <div class="action-btns">
                <button class="btn btn-sm btn-outline" onclick="editPrize('${p.id}')"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger" onclick="deletePrize('${p.id}')"><i class="fas fa-trash"></i></button>
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function openPrizeModal() {
  editingPrizeId = null;
  ['pTitle','pCash','pTrophy','pGift','pMedal','pCert'].forEach(id => { document.getElementById(id).value = ''; });
  document.getElementById('pType').value = 'district';
  document.getElementById('pVisible').value = 'show';
  document.getElementById('editPrizeId').value = '';
  openModal('prizeModal');
}

function editPrize(id) {
  const prizes = LS.get('prizes');
  const p = prizes.find(p => p.id === id);
  if (!p) return;
  editingPrizeId = id;
  document.getElementById('editPrizeId').value = id;
  document.getElementById('pType').value = p.type || 'district';
  document.getElementById('pTitle').value = p.title || '';
  document.getElementById('pCash').value = p.cash || '';
  document.getElementById('pTrophy').value = p.trophy || '';
  document.getElementById('pGift').value = p.gift || '';
  document.getElementById('pMedal').value = p.medal || '';
  document.getElementById('pCert').value = p.cert || '';
  document.getElementById('pVisible').value = p.visible || 'show';
  openModal('prizeModal');
}

function savePrize() {
  const title = document.getElementById('pTitle').value.trim();
  if (!title) { showToast('⚠️ पुरस्कार शीर्षक आवश्यक है', 'warning'); return; }

  const data = {
    id: editingPrizeId || genId('PRZ'),
    type: document.getElementById('pType').value,
    title,
    cash: document.getElementById('pCash').value.trim(),
    trophy: document.getElementById('pTrophy').value.trim(),
    gift: document.getElementById('pGift').value.trim(),
    medal: document.getElementById('pMedal').value.trim(),
    cert: document.getElementById('pCert').value.trim(),
    visible: document.getElementById('pVisible').value,
  };

  const prizes = LS.get('prizes');
  if (editingPrizeId) {
    const idx = prizes.findIndex(p => p.id === editingPrizeId);
    if (idx !== -1) prizes[idx] = data;
  } else {
    prizes.push(data);
  }

  LS.set('prizes', prizes);
  closeModal('prizeModal');
  renderAdminPrizes();
  renderPrizeSection();
  renderPrizeHighlights();
  showToast('✅ पुरस्कार सहेजा गया!', 'success');
  editingPrizeId = null;
}

function deletePrize(id) {
  if (!confirm('इस पुरस्कार को हटाएं?')) return;
  const prizes = LS.get('prizes').filter(p => p.id !== id);
  LS.set('prizes', prizes);
  renderAdminPrizes();
  renderPrizeSection();
  renderPrizeHighlights();
  showToast('पुरस्कार हटा दिया गया', 'info');
}

// ===== SEED DEFAULT PRIZES (First Load) =====
function seedDefaultPrizes() {
  const existing = LS.get('prizes');
  if (existing.length === 0) {
    const defaults = [
      { id: genId('PRZ'), type: 'district', title: 'जिला विजेता', cash: '₹51,000', trophy: 'गोल्ड ट्रॉफी', gift: 'Hero Splendor बाइक', medal: 'गोल्ड मेडल', cert: 'विजेता प्रमाण पत्र', visible: 'show' },
      { id: genId('PRZ'), type: 'district', title: 'जिला उपविजेता', cash: '₹21,000', trophy: 'सिल्वर ट्रॉफी', gift: '', medal: 'सिल्वर मेडल', cert: 'उपविजेता प्रमाण पत्र', visible: 'show' },
      { id: genId('PRZ'), type: 'state', title: 'स्टेट मेगा विजेता', cash: '₹5,00,000', trophy: 'मेगा गोल्ड ट्रॉफी', gift: 'Royal Enfield / कार', medal: 'गोल्ड मेडल', cert: 'स्टेट चैंपियन प्रमाण पत्र', visible: 'show' },
      { id: genId('PRZ'), type: 'state', title: 'स्टेट उपविजेता', cash: '₹2,00,000', trophy: 'सिल्वर ट्रॉफी', gift: 'मोटरसाइकिल', medal: 'सिल्वर मेडल', cert: 'स्टेट उपविजेता प्रमाण पत्र', visible: 'show' },
    ];
    LS.set('prizes', defaults);
  }
}

// ===== INIT ALL ON DOM READY =====
document.addEventListener('DOMContentLoaded', () => {
  seedDefaultPrizes();
  renderPrizeHighlights();
  renderDistrictCards();
  renderPrizeSection();

  // Smooth nav link scroll
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Handle Enter key on admin login
  ['adminUser', 'adminPass'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('keydown', (e) => { if (e.key === 'Enter') adminLogin(); });
  });
});

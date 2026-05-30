/**
 * UP Tennis Ball Cricket Tournament - script.js
 * All frontend logic: registration, payment, admin, fixtures, prizes, PDF receipt, etc.
 * Uses localStorage for data storage (GitHub Pages static demo)
 */

// ============================================================
// DATA MODELS & STORAGE HELPERS
// ============================================================

const LS = {
  get: (key, fallback = []) => {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  },
  set: (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch(e){} },
  remove: (key) => { localStorage.removeItem(key); }
};

// UID generator
function uid(prefix = 'ID') {
  return prefix + '-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2,5).toUpperCase();
}

// ============================================================
// INITIAL DEMO DATA SEED
// ============================================================

function seedDemoData() {
  // Only seed if no data exists
  if (LS.get('teams',[]).length === 0) {
    const teams = [
      { id:'TM-DEMO001', teamName:'Thunder Kings', captainName:'Rahul Sharma', mobile:'9876543210', whatsapp:'9876543210', email:'rahul@demo.com', district:'Lucknow', village:'Aliganj', totalPlayers:15, jerseyColor:'Blue & White', playerNames:'Rahul Sharma\nVikas Gupta\nAnkit Singh', status:'approved', payStatus:'approved', utr:'UTR123456', approvalDate:'2025-05-01', registeredAt: new Date(Date.now()-5*86400000).toISOString() },
      { id:'TM-DEMO002', teamName:'Royal Challengers', captainName:'Amit Tiwari', mobile:'9823456780', whatsapp:'9823456780', email:'', district:'Meerut', village:'Modipuram', totalPlayers:13, jerseyColor:'Red & Gold', playerNames:'Amit Tiwari\nSuresh Kumar', status:'approved', payStatus:'approved', utr:'UTR789012', approvalDate:'2025-05-02', registeredAt: new Date(Date.now()-4*86400000).toISOString() },
      { id:'TM-DEMO003', teamName:'Green Warriors', captainName:'Deepak Yadav', mobile:'9654321098', whatsapp:'9654321098', email:'', district:'Agra', village:'Tajganj', totalPlayers:12, jerseyColor:'Green & Black', playerNames:'Deepak Yadav\nNeeraj Jain', status:'pending', payStatus:'pending', utr:'UTR345678', registeredAt: new Date(Date.now()-2*86400000).toISOString() },
      { id:'TM-DEMO004', teamName:'Varanasi Kings', captainName:'Pradeep Mishra', mobile:'9012345678', whatsapp:'9012345678', email:'', district:'Varanasi', village:'Lanka', totalPlayers:14, jerseyColor:'Orange & White', playerNames:'Pradeep Mishra\nKiran Jha', status:'champion', payStatus:'approved', utr:'UTR901234', approvalDate:'2025-04-28', isDistrictChampion: true, registeredAt: new Date(Date.now()-7*86400000).toISOString() },
      { id:'TM-DEMO005', teamName:'Gorakhpur Gladiators', captainName:'Mohan Pandey', mobile:'9111222333', whatsapp:'9111222333', email:'', district:'Gorakhpur', village:'Gorakhpur City', totalPlayers:11, jerseyColor:'Yellow & Black', playerNames:'Mohan Pandey\nSanjay Pal', status:'champion', payStatus:'approved', utr:'UTR555666', approvalDate:'2025-04-30', isDistrictChampion: true, registeredAt: new Date(Date.now()-6*86400000).toISOString() },
    ];
    LS.set('teams', teams);
  }

  if (!LS.get('prizes', null)) {
    LS.set('prizes', {
      districtWinner: '₹51,000',
      districtWinnerExtra: 'Bike + Trophy + Certificate',
      districtRunnerUp: '₹21,000',
      districtRunnerUpExtra: 'Trophy + Certificate',
      megaWinner: '₹5,00,000',
      megaWinnerExtra: 'Bike + Trophy + Medal',
      megaRunnerUp: '₹2,00,000',
      megaRunnerUpExtra: 'Trophy + Medal',
      megaThird: '₹51,000',
      megaThirdExtra: 'Medal + Certificate',
      motm: '₹5,100 + Trophy',
      mot: '₹51,000 + Bike + Trophy',
      bestBatsman: '₹11,000 + Trophy',
      bestBowler: '₹11,000 + Trophy',
      bestFielder: '₹5,100 + Medal',
    });
  }

  if (LS.get('districts',[]).length === 0) {
    LS.set('districts', [
      { id:'D01', district:'Lucknow', ground:'KPSC Cricket Ground', address:'Kaiserbagh, Lucknow', mapLink:'https://maps.google.com', date:'2025-06-15', reportTime:'07:00 AM', matchTime:'09:00 AM', lastEntry:'2025-06-10', overs:10, maxTeams:16, entryOpen:true, rules:'Tennis ball only. 10 overs per side.', contactPerson:'Ramesh Verma', contactWhatsapp:'9876500001', winner:'' },
      { id:'D02', district:'Meerut', ground:'Victoria Park Ground', address:'Gandhi Nagar, Meerut', mapLink:'https://maps.google.com', date:'2025-06-20', reportTime:'07:30 AM', matchTime:'09:30 AM', lastEntry:'2025-06-15', overs:10, maxTeams:16, entryOpen:true, rules:'10 overs per side. Helmet mandatory.', contactPerson:'Suresh Agarwal', contactWhatsapp:'9876500002', winner:'' },
      { id:'D03', district:'Varanasi', ground:'Sigra Sports Complex', address:'Sigra, Varanasi', mapLink:'https://maps.google.com', date:'2025-06-18', reportTime:'06:30 AM', matchTime:'08:00 AM', lastEntry:'2025-06-12', overs:12, maxTeams:12, entryOpen:false, rules:'12 overs per side.', contactPerson:'Dinesh Kumar', contactWhatsapp:'9876500003', winner:'Varanasi Kings' },
    ]);
  }

  if (LS.get('fixtures',[]).length === 0) {
    LS.set('fixtures', [
      { id:'F01', district:'Varanasi', matchNo:1, teamA:'Varanasi Kings', teamB:'Ganga Boys', date:'2025-06-18', time:'09:00 AM', ground:'Sigra Sports Complex', result:'Varanasi Kings won by 25 runs', winner:'Varanasi Kings', motmPlayer:'Pradeep Mishra', motmPrize:'₹5,100 + Trophy' },
      { id:'F02', district:'Lucknow', matchNo:1, teamA:'Thunder Kings', teamB:'Lucknow Lions', date:'2025-06-15', time:'09:00 AM', ground:'KPSC Cricket Ground', result:'', winner:'', motmPlayer:'', motmPrize:'' },
    ]);
  }

  if (!LS.get('mega', null)) {
    LS.set('mega', {
      venue: 'International Cricket Stadium, Lucknow',
      date: '2025-08-15',
      reportTime: '07:00 AM',
      rules: 'All district champions. 15 overs per side. DLS method applicable.',
      contact: '+91 99999 99999',
      megaWinner: 'Varanasi Kings',
      megaWinnerDistrict: 'Varanasi',
      megaRunnerUp: 'Gorakhpur Gladiators',
      megaRunnerUpDistrict: 'Gorakhpur',
      megaThird: '',
      megaThirdDistrict: '',
    });
  }

  if (LS.get('awards',[]).length === 0) {
    LS.set('awards', [
      { id:'A01', name:'Man of the Tournament', cash:'₹51,000', gift:'Bike + Trophy', player:'Pradeep Mishra', team:'Varanasi Kings', district:'Varanasi', show:true },
      { id:'A02', name:'Best Batsman', cash:'₹11,000', gift:'Trophy', player:'Rahul Sharma', team:'Thunder Kings', district:'Lucknow', show:true },
      { id:'A03', name:'Best Bowler', cash:'₹11,000', gift:'Trophy', player:'Mohan Pandey', team:'Gorakhpur Gladiators', district:'Gorakhpur', show:true },
      { id:'A04', name:'Best Fielder', cash:'₹5,100', gift:'Medal', player:'Amit Tiwari', team:'Royal Challengers', district:'Meerut', show:true },
    ]);
  }
}

// ============================================================
// NAVBAR & SCROLL
// ============================================================

const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

hamburger.addEventListener('click', () => {
  navMenu.classList.toggle('open');
  hamburger.classList.toggle('active');
});

// Close menu on link click
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
  });
});

// Back to top button
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  backToTop.classList.toggle('visible', window.scrollY > 400);
});

// ============================================================
// TOAST NOTIFICATION
// ============================================================

function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.innerHTML = `<i class="fas fa-${type==='success'?'check-circle':type==='error'?'times-circle':'exclamation-circle'}"></i> ${msg}`;
  t.className = `toast show ${type}`;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.classList.remove('show'); }, 3500);
}

// ============================================================
// MODAL HELPERS
// ============================================================

function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

// Close on backdrop click
document.querySelectorAll('.modal').forEach(m => {
  m.addEventListener('click', e => { if(e.target === m) m.classList.remove('open'); });
});

// ============================================================
// COPY TEXT
// ============================================================

function copyText(text) {
  navigator.clipboard.writeText(text).then(() => showToast('Copied: ' + text)).catch(() => {
    const el = document.createElement('textarea');
    el.value = text; document.body.appendChild(el); el.select();
    document.execCommand('copy'); document.body.removeChild(el);
    showToast('Copied!');
  });
}

// ============================================================
// REGISTRATION FORM
// ============================================================

document.getElementById('registrationForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const form = e.target;

  // Get values
  const teamName = form.querySelector('#teamName').value.trim();
  const captainName = form.querySelector('#captainName').value.trim();
  const mobile = form.querySelector('#mobileNumber').value.trim();
  const whatsapp = form.querySelector('#whatsappNumber').value.trim();
  const email = form.querySelector('#emailAddr').value.trim();
  const district = form.querySelector('#districtSelect').value;
  const village = form.querySelector('#villageCity').value.trim();
  const totalPlayers = form.querySelector('#totalPlayers').value;
  const playerNames = form.querySelector('#playerNames').value.trim();
  const jerseyColor = form.querySelector('#jerseyColor').value.trim();
  const terms = form.querySelector('#termsCheck').checked;

  // Validate
  if (!teamName) { showToast('Team name is required', 'error'); return; }
  if (!captainName) { showToast('Captain name is required', 'error'); return; }
  if (!/^\d{10}$/.test(mobile)) { showToast('Enter valid 10-digit mobile number', 'error'); return; }
  if (!/^\d{10}$/.test(whatsapp)) { showToast('Enter valid 10-digit WhatsApp number', 'error'); return; }
  if (!district) { showToast('Please select a district', 'error'); return; }
  if (!village) { showToast('Village/City is required', 'error'); return; }
  if (!totalPlayers || parseInt(totalPlayers) < 11) { showToast('Minimum 11 players required', 'error'); return; }
  if (!playerNames) { showToast('Enter player names', 'error'); return; }
  if (!jerseyColor) { showToast('Jersey color is required', 'error'); return; }
  if (!terms) { showToast('Please accept terms & conditions', 'error'); return; }

  // Create team object
  const teamId = uid('TM');
  const team = {
    id: teamId,
    teamName, captainName, mobile, whatsapp, email,
    district, village, totalPlayers: parseInt(totalPlayers),
    playerNames, jerseyColor,
    status: 'pending',
    payStatus: 'pending',
    utr: '',
    registeredAt: new Date().toISOString(),
  };

  // Save to localStorage
  const teams = LS.get('teams', []);
  teams.push(team);
  LS.set('teams', teams);

  showToast(`Team registered! Your Team ID: ${teamId}`, 'success');

  // Show team ID prominently
  document.getElementById('registrationArea').innerHTML = `
    <div style="text-align:center; padding: 40px 20px;">
      <div style="font-size:3rem; color:var(--green); margin-bottom:16px;"><i class="fas fa-check-circle"></i></div>
      <h3 style="font-family:var(--font-display); font-size:2rem; color:var(--navy); letter-spacing:2px;">Registration Successful!</h3>
      <p style="margin:12px 0; color:var(--text-muted);">Your Team ID has been generated:</p>
      <div style="background:var(--navy); color:var(--gold); font-family:var(--font-display); font-size:2rem; letter-spacing:4px; padding:16px 32px; border-radius:10px; display:inline-block; margin:12px 0; border:2px solid var(--gold);">${teamId}</div>
      <p style="color:var(--text-muted); margin-bottom:20px; font-size:0.9rem;">Save this ID! You will need it for payment submission.</p>
      <a href="#payment" class="btn btn-primary"><i class="fas fa-credit-card"></i> Proceed to Payment</a>
      <br><br>
      <button onclick="location.reload()" class="btn btn-outline" style="color:var(--navy); border-color:var(--navy);">Register Another Team</button>
    </div>
  `;

  // Pre-fill payment form
  document.getElementById('payTeamId').value = teamId;
});

// ============================================================
// PAYMENT SCREENSHOT PREVIEW
// ============================================================

document.getElementById('paymentScreenshot').addEventListener('change', function() {
  const file = this.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById('screenshotPreview').innerHTML = `<img src="${e.target.result}" alt="Payment Screenshot" />`;
  };
  reader.readAsDataURL(file);
});

// ============================================================
// SUBMIT PAYMENT
// ============================================================

function submitPayment() {
  const teamId = document.getElementById('payTeamId').value.trim();
  const utr = document.getElementById('utrNumber').value.trim();
  const screenshot = document.getElementById('paymentScreenshot').files[0];

  if (!teamId) { showToast('Enter your Team ID or Name', 'error'); return; }
  if (!utr) { showToast('Enter UTR/Transaction ID', 'error'); return; }
  if (!screenshot) { showToast('Upload payment screenshot', 'error'); return; }

  // Read screenshot as base64
  const reader = new FileReader();
  reader.onload = e => {
    const teams = LS.get('teams', []);
    const idx = teams.findIndex(t => t.id === teamId || t.teamName.toLowerCase() === teamId.toLowerCase());
    if (idx === -1) {
      showToast('Team not found. Check your Team ID.', 'error'); return;
    }
    teams[idx].utr = utr;
    teams[idx].payStatus = 'pending';
    teams[idx].screenshotB64 = e.target.result;
    LS.set('teams', teams);
    showToast('Payment submitted! Pending admin approval.', 'success');
    document.getElementById('paymentSubmitForm').innerHTML = `
      <div style="text-align:center; padding:30px;">
        <i class="fas fa-clock" style="font-size:3rem; color:var(--gold); margin-bottom:12px;"></i>
        <h3 style="color:var(--gold); font-family:var(--font-display); font-size:1.8rem; letter-spacing:2px;">Payment Pending</h3>
        <p style="color:var(--gray); margin-top:8px;">Your payment is under review. You will receive confirmation once admin approves.</p>
        <p style="color:var(--gold); font-weight:700; margin-top:12px;">Team ID: ${teams[idx].id}</p>
      </div>
    `;
  };
  reader.readAsDataURL(screenshot);
}

// ============================================================
// PRIZE HIGHLIGHTS (Home Page)
// ============================================================

function renderPrizeHighlights() {
  const prizes = LS.get('prizes', {});
  const container = document.getElementById('prizeHighlights');
  container.innerHTML = `
    <div class="prize-card">
      <div class="prize-icon">🏆</div>
      <h4>District Winner</h4>
      <div class="prize-amount">${prizes.districtWinner || '₹51,000'}</div>
      <div class="prize-extras">${prizes.districtWinnerExtra || 'Bike + Trophy + Certificate'}</div>
    </div>
    <div class="prize-card">
      <div class="prize-icon">🥈</div>
      <h4>District Runner-up</h4>
      <div class="prize-amount">${prizes.districtRunnerUp || '₹21,000'}</div>
      <div class="prize-extras">${prizes.districtRunnerUpExtra || 'Trophy + Certificate'}</div>
    </div>
    <div class="prize-card">
      <div class="prize-icon">🎖️</div>
      <h4>Mega Contest Winner</h4>
      <div class="prize-amount">${prizes.megaWinner || '₹5,00,000'}</div>
      <div class="prize-extras">${prizes.megaWinnerExtra || 'Bike + Trophy + Medal'}</div>
    </div>
    <div class="prize-card">
      <div class="prize-icon">⭐</div>
      <h4>Man of Tournament</h4>
      <div class="prize-amount">${prizes.mot || '₹51,000'}</div>
      <div class="prize-extras">Bike + Trophy</div>
    </div>
  `;
}

// ============================================================
// DISTRICT CARDS (Public)
// ============================================================

function renderDistrictCards() {
  const districts = LS.get('districts', []);
  const teams = LS.get('teams', []);
  const container = document.getElementById('districtCards');

  if (!districts.length) {
    container.innerHTML = `<div class="empty-state"><i class="fas fa-map"></i><p>District details coming soon!</p></div>`;
    return;
  }

  container.innerHTML = districts.map(d => {
    const distTeams = teams.filter(t => t.district === d.district && t.payStatus === 'approved');
    const winner = d.winner ? `<div style="margin-top:8px;"><span class="status-badge badge-champion">🏆 ${d.winner}</span></div>` : '';
    return `
    <div class="district-card" onclick="openDistrictDetail('${d.id}')">
      <div class="district-card-header">
        <div class="district-name">${d.district}</div>
        <span class="status-badge ${d.entryOpen ? 'badge-open' : 'badge-closed'}">${d.entryOpen ? 'Open' : 'Closed'}</span>
      </div>
      <div class="district-meta">
        <span><i class="fas fa-map-marker-alt"></i> ${d.ground}</span>
        <span><i class="fas fa-calendar"></i> ${formatDate(d.date)}</span>
        <span><i class="fas fa-clock"></i> Match: ${d.matchTime}</span>
        <span><i class="fas fa-users"></i> ${distTeams.length}/${d.maxTeams} teams</span>
      </div>
      ${winner}
    </div>`;
  }).join('');

  // Populate filter dropdown
  const fixtFilter = document.getElementById('fixtureDistrictFilter');
  const adminDistFilter = document.getElementById('adminDistrictFilter');
  districts.forEach(d => {
    [fixtFilter, adminDistFilter].forEach(sel => {
      if (sel && !Array.from(sel.options).some(o => o.value === d.district)) {
        sel.innerHTML += `<option value="${d.district}">${d.district}</option>`;
      }
    });
  });
}

function filterDistricts() {
  const q = document.getElementById('districtSearch').value.toLowerCase();
  document.querySelectorAll('.district-card').forEach(card => {
    card.style.display = card.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}

function openDistrictDetail(id) {
  const districts = LS.get('districts', []);
  const teams = LS.get('teams', []);
  const d = districts.find(x => x.id === id);
  if (!d) return;

  const distTeams = teams.filter(t => t.district === d.district && t.payStatus === 'approved');
  const prizes = LS.get('prizes', {});

  document.getElementById('districtModalContent').innerHTML = `
    <div style="color:var(--white);">
      <h2 style="font-family:var(--font-display); color:var(--gold); font-size:2rem; letter-spacing:2px; margin-bottom:16px;">${d.district} District Tournament</h2>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:20px;">
        <div><i class="fas fa-map-marker-alt" style="color:var(--gold);"></i> <strong>Ground:</strong> ${d.ground}</div>
        <div><i class="fas fa-location-arrow" style="color:var(--gold);"></i> <strong>Address:</strong> ${d.address}</div>
        <div><i class="fas fa-calendar" style="color:var(--gold);"></i> <strong>Date:</strong> ${formatDate(d.date)}</div>
        <div><i class="fas fa-clock" style="color:var(--gold);"></i> <strong>Report:</strong> ${d.reportTime}</div>
        <div><i class="fas fa-cricket" style="color:var(--gold);"></i> <strong>Match Time:</strong> ${d.matchTime}</div>
        <div><i class="fas fa-stopwatch" style="color:var(--gold);"></i> <strong>Overs:</strong> ${d.overs} per side</div>
        <div><i class="fas fa-users" style="color:var(--gold);"></i> <strong>Max Teams:</strong> ${d.maxTeams}</div>
        <div><i class="fas fa-hourglass" style="color:var(--gold);"></i> <strong>Last Entry:</strong> ${formatDate(d.lastEntry)}</div>
      </div>
      ${d.mapLink ? `<a href="${d.mapLink}" target="_blank" class="btn btn-outline-sm" style="margin-bottom:16px;"><i class="fas fa-map"></i> View on Map</a>` : ''}
      <div style="background:rgba(255,255,255,0.05); border-radius:8px; padding:14px; margin-bottom:16px;">
        <strong style="color:var(--gold);">Rules:</strong> <span style="color:var(--gray);">${d.rules}</span>
      </div>
      <div style="margin-bottom:16px;">
        <strong style="color:var(--gold);">Contact:</strong> ${d.contactPerson}
        <a href="https://wa.me/91${d.contactWhatsapp}" target="_blank" class="btn btn-whatsapp" style="padding:6px 14px; font-size:0.85rem; margin-left:10px;"><i class="fab fa-whatsapp"></i> WhatsApp</a>
      </div>
      ${d.winner ? `<div style="background:rgba(245,197,24,0.1); border:1px solid var(--gold); border-radius:8px; padding:14px; margin-bottom:16px; text-align:center;"><i class="fas fa-trophy" style="color:var(--gold); font-size:1.5rem;"></i><br><strong style="color:var(--gold); font-family:var(--font-display); font-size:1.2rem; letter-spacing:1px;">District Champion: ${d.winner}</strong></div>` : ''}
      <h4 style="color:var(--gold); margin-bottom:10px; font-family:var(--font-display); letter-spacing:1px;">District Prizes</h4>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:16px;">
        <div class="prize-card" style="padding:16px;"><div class="prize-icon">🏆</div><h4>Winner</h4><div class="prize-amount" style="font-size:1.3rem;">${prizes.districtWinner||'₹51,000'}</div><div class="prize-extras">${prizes.districtWinnerExtra||'Bike + Trophy'}</div></div>
        <div class="prize-card" style="padding:16px;"><div class="prize-icon">🥈</div><h4>Runner-up</h4><div class="prize-amount" style="font-size:1.3rem;">${prizes.districtRunnerUp||'₹21,000'}</div><div class="prize-extras">${prizes.districtRunnerUpExtra||'Trophy'}</div></div>
      </div>
      <h4 style="color:var(--gold); margin-bottom:10px; font-family:var(--font-display); letter-spacing:1px;">Registered Teams (${distTeams.length})</h4>
      ${distTeams.length ? distTeams.map(t => `<div style="background:rgba(255,255,255,0.05); border-radius:8px; padding:10px 14px; margin-bottom:8px; color:var(--white);">🏏 <strong>${t.teamName}</strong> <span style="color:var(--gray); font-size:0.88rem;">— ${t.village}</span></div>`).join('') : '<p style="color:var(--gray);">No registered teams yet.</p>'}
    </div>
  `;
  openModal('districtModal');
}

// ============================================================
// FIXTURES
// ============================================================

function renderFixtures() {
  const fixtures = LS.get('fixtures', []);
  const filter = document.getElementById('fixtureDistrictFilter').value;
  const container = document.getElementById('fixturesContainer');

  const filtered = filter ? fixtures.filter(f => f.district === filter) : fixtures;

  if (!filtered.length) {
    container.innerHTML = `<div class="empty-state"><i class="fas fa-calendar-times"></i><p>No fixtures available yet.</p></div>`;
    return;
  }

  // Group by district
  const grouped = {};
  filtered.forEach(f => { if (!grouped[f.district]) grouped[f.district] = []; grouped[f.district].push(f); });

  container.innerHTML = Object.entries(grouped).map(([district, matches]) => `
    <div class="fixture-group">
      <div class="fixture-group-title"><i class="fas fa-map-marker-alt"></i> ${district} District</div>
      ${matches.map(m => `
        <div class="fixture-card">
          <div class="fixture-teams">
            <div class="fixture-team">${m.teamA}</div>
            <div class="fixture-vs">VS</div>
            <div class="fixture-team">${m.teamB}</div>
          </div>
          <div class="fixture-meta">
            <span><i class="fas fa-hashtag"></i> Match #${m.matchNo}</span>
            <span><i class="fas fa-calendar"></i> ${formatDate(m.date)}</span>
            <span><i class="fas fa-clock"></i> ${m.time}</span>
            <span><i class="fas fa-map-marker-alt"></i> ${m.ground}</span>
          </div>
          ${m.result ? `<div class="fixture-result"><i class="fas fa-check-circle"></i> ${m.result}</div>` : ''}
          ${m.motmPlayer ? `<div class="fixture-motm"><i class="fas fa-star" style="color:var(--gold);"></i> MOM: ${m.motmPlayer} — ${m.motmPrize}</div>` : ''}
        </div>
      `).join('')}
    </div>
  `).join('');
}

// ============================================================
// QUALIFIED TEAMS
// ============================================================

function renderQualifiedTeams() {
  const teams = LS.get('teams', []);
  const champions = teams.filter(t => t.isDistrictChampion || t.status === 'champion');
  const container = document.getElementById('qualifiedTeams');

  if (!champions.length) {
    container.innerHTML = `<div class="empty-state"><i class="fas fa-trophy"></i><p>District champions will appear here as tournaments complete.</p></div>`;
    return;
  }

  container.innerHTML = champions.map(t => `
    <div class="team-card champion-card">
      <div class="team-avatar"><i class="fas fa-trophy"></i></div>
      <h4>${t.teamName}</h4>
      <div class="team-district"><i class="fas fa-map-marker-alt"></i> ${t.district}</div>
      <div style="margin-top:8px;"><span class="status-badge badge-champion">District Champion</span></div>
      <div style="margin-top:8px;"><span class="status-badge badge-mega">Mega Qualified</span></div>
    </div>
  `).join('');
}

// ============================================================
// MEGA CONTEST
// ============================================================

function renderMegaContest() {
  const mega = LS.get('mega', {});
  const prizes = LS.get('prizes', {});
  const container = document.getElementById('megaDetails');
  const prizeContainer = document.getElementById('megaPrizeSection');

  container.innerHTML = `
    <div class="mega-details-card">
      <h3><i class="fas fa-star"></i> State Level Mega Contest</h3>
      <div class="mega-meta">
        <div class="mega-meta-item"><i class="fas fa-map-marker-alt"></i> ${mega.venue || 'Venue TBA'}</div>
        <div class="mega-meta-item"><i class="fas fa-calendar"></i> ${mega.date ? formatDate(mega.date) : 'Date TBA'}</div>
        <div class="mega-meta-item"><i class="fas fa-clock"></i> Report: ${mega.reportTime || 'TBA'}</div>
        <div class="mega-meta-item"><i class="fas fa-phone"></i> ${mega.contact || 'Contact TBA'}</div>
      </div>
      ${mega.rules ? `<div style="margin-top:14px; padding:12px; background:rgba(255,255,255,0.05); border-radius:8px;"><strong style="color:var(--gold);">Rules:</strong> <span style="color:var(--gray);">${mega.rules}</span></div>` : ''}
    </div>
  `;

  prizeContainer.innerHTML = `
    <div class="prize-card">
      <div class="prize-icon">🏆</div>
      <h4>Winner</h4>
      <div class="prize-amount">${prizes.megaWinner || '₹5,00,000'}</div>
      <div class="prize-extras">${prizes.megaWinnerExtra || 'Bike + Trophy + Medal'}</div>
    </div>
    <div class="prize-card">
      <div class="prize-icon">🥈</div>
      <h4>Runner-up</h4>
      <div class="prize-amount">${prizes.megaRunnerUp || '₹2,00,000'}</div>
      <div class="prize-extras">${prizes.megaRunnerUpExtra || 'Trophy + Medal'}</div>
    </div>
    <div class="prize-card">
      <div class="prize-icon">🥉</div>
      <h4>Third Place</h4>
      <div class="prize-amount">${prizes.megaThird || '₹51,000'}</div>
      <div class="prize-extras">${prizes.megaThirdExtra || 'Medal + Certificate'}</div>
    </div>
    <div class="prize-card">
      <div class="prize-icon">⭐</div>
      <h4>Man of Tournament</h4>
      <div class="prize-amount">${prizes.mot || '₹51,000'}</div>
      <div class="prize-extras">Bike + Trophy</div>
    </div>
  `;
}

// ============================================================
// WINNERS
// ============================================================

function renderWinners() {
  const mega = LS.get('mega', {});
  const awards = LS.get('awards', []);
  const teams = LS.get('teams', []);
  const container = document.getElementById('winnersSection');
  const champions = teams.filter(t => t.isDistrictChampion || t.status === 'champion');

  let html = '';

  // Mega Contest Results
  if (mega.megaWinner || mega.megaRunnerUp) {
    html += `
      <h3 style="font-family:var(--font-display); font-size:1.8rem; letter-spacing:2px; text-align:center; color:var(--navy); margin-bottom:1.5rem;">State Mega Contest <span class="gold">Results</span></h3>
      <div class="winners-podium">
        ${mega.megaRunnerUp ? `<div class="podium-item podium-2"><div class="podium-rank">🥈</div><div class="podium-team">${mega.megaRunnerUp}</div><div class="podium-district">${mega.megaRunnerUpDistrict}</div></div>` : ''}
        ${mega.megaWinner ? `<div class="podium-item podium-1"><div class="podium-rank">🏆</div><div class="podium-team">${mega.megaWinner}</div><div class="podium-district">${mega.megaWinnerDistrict}</div></div>` : ''}
        ${mega.megaThird ? `<div class="podium-item podium-3"><div class="podium-rank">🥉</div><div class="podium-team">${mega.megaThird}</div><div class="podium-district">${mega.megaThirdDistrict}</div></div>` : ''}
      </div>
    `;
  }

  // District Champions
  if (champions.length) {
    html += `
      <h3 style="font-family:var(--font-display); font-size:1.6rem; letter-spacing:2px; text-align:center; color:var(--navy); margin:2rem 0 1rem;">District <span class="gold">Champions</span></h3>
      <div class="teams-grid" style="margin-bottom:2rem;">
        ${champions.map(t => `
          <div class="team-card champion-card">
            <div class="team-avatar"><i class="fas fa-trophy"></i></div>
            <h4>${t.teamName}</h4>
            <div class="team-district">${t.district} District Champion</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Player Awards
  const visibleAwards = awards.filter(a => a.show);
  if (visibleAwards.length) {
    html += `
      <h3 style="font-family:var(--font-display); font-size:1.6rem; letter-spacing:2px; text-align:center; color:var(--navy); margin:2rem 0 1rem;">Player <span class="gold">Awards</span></h3>
      <div class="award-grid">
        ${visibleAwards.map(a => `
          <div class="award-card">
            <div class="award-icon">🏅</div>
            <h5>${a.name}</h5>
            ${a.player ? `<div class="award-player">${a.player}</div>` : '<div class="award-player">TBA</div>'}
            ${a.team ? `<div class="award-prize">${a.team} — ${a.district}</div>` : ''}
            <div class="award-prize">${a.cash} ${a.gift ? '+ ' + a.gift : ''}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  if (!html) {
    html = `<div class="empty-state"><i class="fas fa-trophy"></i><p>Winners will be announced after tournaments!</p></div>`;
  }

  container.innerHTML = html;
}

// ============================================================
// PRIZES SECTION
// ============================================================

function renderPrizesSection() {
  const prizes = LS.get('prizes', {});
  const container = document.getElementById('prizesSection');

  container.innerHTML = `
    <h3 style="font-family:var(--font-display); font-size:1.8rem; color:var(--white); letter-spacing:2px; text-align:center; margin-bottom:1.5rem;">District Level <span style="color:var(--gold);">Prizes</span></h3>
    <div class="prize-grid" style="margin-bottom:3rem;">
      <div class="prize-card"><div class="prize-icon">🏆</div><h4>Winner</h4><div class="prize-amount">${prizes.districtWinner||'₹51,000'}</div><div class="prize-extras">${prizes.districtWinnerExtra||'Bike + Trophy + Certificate'}</div></div>
      <div class="prize-card"><div class="prize-icon">🥈</div><h4>Runner-up</h4><div class="prize-amount">${prizes.districtRunnerUp||'₹21,000'}</div><div class="prize-extras">${prizes.districtRunnerUpExtra||'Trophy + Certificate'}</div></div>
      <div class="prize-card"><div class="prize-icon">⭐</div><h4>Man of the Match</h4><div class="prize-amount">${prizes.motm||'₹5,100'}</div><div class="prize-extras">+ Trophy</div></div>
      <div class="prize-card"><div class="prize-icon">🦁</div><h4>Best Batsman</h4><div class="prize-amount">${prizes.bestBatsman||'₹11,000'}</div><div class="prize-extras">+ Trophy</div></div>
    </div>
    <h3 style="font-family:var(--font-display); font-size:1.8rem; color:var(--white); letter-spacing:2px; text-align:center; margin-bottom:1.5rem;">Mega Contest <span style="color:var(--gold);">Prizes</span></h3>
    <div class="prize-grid">
      <div class="prize-card"><div class="prize-icon">🏆</div><h4>Winner</h4><div class="prize-amount">${prizes.megaWinner||'₹5,00,000'}</div><div class="prize-extras">${prizes.megaWinnerExtra||'Bike + Trophy + Medal'}</div></div>
      <div class="prize-card"><div class="prize-icon">🥈</div><h4>Runner-up</h4><div class="prize-amount">${prizes.megaRunnerUp||'₹2,00,000'}</div><div class="prize-extras">${prizes.megaRunnerUpExtra||'Trophy + Medal'}</div></div>
      <div class="prize-card"><div class="prize-icon">🥉</div><h4>Third Place</h4><div class="prize-amount">${prizes.megaThird||'₹51,000'}</div><div class="prize-extras">${prizes.megaThirdExtra||'Medal + Certificate'}</div></div>
      <div class="prize-card"><div class="prize-icon">🌟</div><h4>Man of Tournament</h4><div class="prize-amount">${prizes.mot||'₹51,000'}</div><div class="prize-extras">Bike + Trophy</div></div>
    </div>
  `;
}

// ============================================================
// ADMIN - LOGIN
// ============================================================

function adminLogin() {
  const user = document.getElementById('adminUser').value;
  const pass = document.getElementById('adminPass').value;
  if (user === 'admin' && pass === 'admin123') {
    LS.set('adminSession', { loggedIn: true, ts: Date.now() });
    document.getElementById('adminLogin').classList.add('hidden');
    document.getElementById('adminDashboard').classList.remove('hidden');
    loadAdminDashboard();
    showToast('Welcome, Admin!', 'success');
  } else {
    showToast('Invalid credentials. Try admin / admin123', 'error');
  }
}

function adminLogout() {
  LS.remove('adminSession');
  document.getElementById('adminLogin').classList.remove('hidden');
  document.getElementById('adminDashboard').classList.add('hidden');
  showToast('Logged out successfully');
}

function checkAdminSession() {
  const session = LS.get('adminSession', {});
  if (session.loggedIn) {
    document.getElementById('adminLogin').classList.add('hidden');
    document.getElementById('adminDashboard').classList.remove('hidden');
    loadAdminDashboard();
  }
}

// ============================================================
// ADMIN - DASHBOARD
// ============================================================

function loadAdminDashboard() {
  updateAdminStats();
  renderAdminTeams();
  renderAdminDistricts();
  renderAdminFixtures();
  renderAdminPrizesForm();
  renderAdminAwards();
  renderAdminMegaForm();

  // Populate district dropdowns
  const districts = LS.get('districts', []);
  const sel = document.getElementById('adminDistrictFilter');
  districts.forEach(d => {
    if (!Array.from(sel.options).some(o => o.value === d.district)) {
      sel.innerHTML += `<option value="${d.district}">${d.district}</option>`;
    }
  });
}

function updateAdminStats() {
  const teams = LS.get('teams', []);
  const stats = {
    total: teams.length,
    pending: teams.filter(t => t.payStatus === 'pending').length,
    approved: teams.filter(t => t.payStatus === 'approved').length,
    rejected: teams.filter(t => t.payStatus === 'rejected').length,
    champions: teams.filter(t => t.isDistrictChampion || t.status === 'champion').length,
    mega: teams.filter(t => t.isDistrictChampion || t.status === 'champion').length,
  };
  document.getElementById('adminStats').innerHTML = `
    <div class="stat-card"><div class="stat-number">${stats.total}</div><div class="stat-label">Total Teams</div></div>
    <div class="stat-card"><div class="stat-number" style="color:var(--orange);">${stats.pending}</div><div class="stat-label">Pending</div></div>
    <div class="stat-card"><div class="stat-number" style="color:var(--green-light);">${stats.approved}</div><div class="stat-label">Approved</div></div>
    <div class="stat-card"><div class="stat-number" style="color:var(--red);">${stats.rejected}</div><div class="stat-label">Rejected</div></div>
    <div class="stat-card"><div class="stat-number" style="color:var(--gold);">${stats.champions}</div><div class="stat-label">Champions</div></div>
    <div class="stat-card"><div class="stat-number" style="color:#a78bfa;">${stats.mega}</div><div class="stat-label">Mega Qualified</div></div>
  `;
}

// ============================================================
// ADMIN - TEAMS TABLE
// ============================================================

function renderAdminTeams() {
  const teams = LS.get('teams', []);
  const distFilter = document.getElementById('adminDistrictFilter').value;
  const statusFilter = document.getElementById('adminStatusFilter').value;
  const search = document.getElementById('adminTeamSearch').value.toLowerCase();

  const filtered = teams.filter(t => {
    const matchDist = !distFilter || t.district === distFilter;
    const matchStatus = !statusFilter || t.payStatus === statusFilter || t.status === statusFilter;
    const matchSearch = !search || t.teamName.toLowerCase().includes(search) || t.id.toLowerCase().includes(search) || t.captainName.toLowerCase().includes(search);
    return matchDist && matchStatus && matchSearch;
  });

  const container = document.getElementById('adminTeamsTable');
  if (!filtered.length) {
    container.innerHTML = `<div class="empty-state"><i class="fas fa-search"></i><p>No teams found.</p></div>`;
    return;
  }

  container.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>Team ID</th><th>Team Name</th><th>Captain</th><th>District</th>
          <th>Mobile</th><th>UTR</th><th>Pay Status</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${filtered.map(t => `
          <tr>
            <td style="font-family:var(--font-display); letter-spacing:1px; color:var(--gold); font-size:0.88rem;">${t.id}</td>
            <td><strong>${t.teamName}</strong></td>
            <td>${t.captainName}</td>
            <td>${t.district}</td>
            <td>${t.mobile}</td>
            <td style="font-size:0.85rem;">${t.utr || '—'}</td>
            <td>${statusBadge(t)}</td>
            <td>
              <div class="action-btns">
                ${t.screenshotB64 ? `<button class="btn-sm btn-receipt" onclick="viewScreenshot('${t.id}')"><i class="fas fa-image"></i></button>` : ''}
                ${t.payStatus !== 'approved' ? `<button class="btn-sm btn-approve" onclick="approveTeam('${t.id}')"><i class="fas fa-check"></i></button>` : ''}
                ${t.payStatus !== 'rejected' ? `<button class="btn-sm btn-reject" onclick="rejectTeam('${t.id}')"><i class="fas fa-times"></i></button>` : ''}
                ${t.payStatus === 'approved' && !(t.isDistrictChampion) ? `<button class="btn-sm btn-champion" onclick="markChampion('${t.id}')" title="Mark District Champion"><i class="fas fa-trophy"></i></button>` : ''}
                ${t.payStatus === 'approved' ? `<button class="btn-sm btn-receipt" onclick="showReceipt('${t.id}')"><i class="fas fa-file-alt"></i></button>` : ''}
                <button class="btn-sm" style="background:#555;" onclick="deleteTeam('${t.id}')"><i class="fas fa-trash"></i></button>
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function statusBadge(t) {
  if (t.isDistrictChampion || t.status === 'champion') return `<span class="status-badge badge-champion">🏆 Champion</span>`;
  if (t.payStatus === 'approved') return `<span class="status-badge badge-approved">Approved</span>`;
  if (t.payStatus === 'rejected') return `<span class="status-badge badge-rejected">Rejected</span>`;
  return `<span class="status-badge badge-pending">Pending</span>`;
}

function approveTeam(id) {
  const teams = LS.get('teams', []);
  const idx = teams.findIndex(t => t.id === id);
  if (idx < 0) return;
  teams[idx].payStatus = 'approved';
  teams[idx].status = 'approved';
  teams[idx].approvalDate = new Date().toLocaleDateString('en-IN');
  LS.set('teams', teams);
  renderAdminTeams(); updateAdminStats();
  showToast(`${teams[idx].teamName} payment approved!`, 'success');
}

function rejectTeam(id) {
  const reason = prompt('Enter rejection reason:') || 'Payment not verified';
  const teams = LS.get('teams', []);
  const idx = teams.findIndex(t => t.id === id);
  if (idx < 0) return;
  teams[idx].payStatus = 'rejected';
  teams[idx].status = 'rejected';
  teams[idx].rejectionReason = reason;
  LS.set('teams', teams);
  renderAdminTeams(); updateAdminStats();
  showToast(`Team rejected: ${reason}`, 'warning');
}

function markChampion(id) {
  if (!confirm('Mark this team as District Champion? This will add them to Mega Contest.')) return;
  const teams = LS.get('teams', []);
  const idx = teams.findIndex(t => t.id === id);
  if (idx < 0) return;

  // Check if district already has champion
  const existingChamp = teams.find(t => t.district === teams[idx].district && (t.isDistrictChampion || t.status === 'champion') && t.id !== id);
  if (existingChamp) {
    if (!confirm(`${existingChamp.teamName} is already champion for ${teams[idx].district}. Replace them?`)) return;
    const eIdx = teams.findIndex(t => t.id === existingChamp.id);
    teams[eIdx].isDistrictChampion = false;
    teams[eIdx].status = 'approved';
  }

  teams[idx].isDistrictChampion = true;
  teams[idx].status = 'champion';

  // Also update district winner field
  const districts = LS.get('districts', []);
  const dIdx = districts.findIndex(d => d.district === teams[idx].district);
  if (dIdx >= 0) { districts[dIdx].winner = teams[idx].teamName; LS.set('districts', districts); }

  LS.set('teams', teams);
  renderAdminTeams(); updateAdminStats(); renderDistrictCards(); renderQualifiedTeams();
  showToast(`🏆 ${teams[idx].teamName} marked as District Champion!`, 'success');
}

function deleteTeam(id) {
  if (!confirm('Delete this team permanently?')) return;
  const teams = LS.get('teams', []).filter(t => t.id !== id);
  LS.set('teams', teams);
  renderAdminTeams(); updateAdminStats();
  showToast('Team deleted', 'warning');
}

function viewScreenshot(id) {
  const teams = LS.get('teams', []);
  const t = teams.find(x => x.id === id);
  if (!t || !t.screenshotB64) { showToast('No screenshot', 'error'); return; }
  document.getElementById('genericModalContent').innerHTML = `
    <h3 style="color:var(--gold); font-family:var(--font-display); margin-bottom:12px;">Payment Screenshot — ${t.teamName}</h3>
    <img src="${t.screenshotB64}" style="max-width:100%; border-radius:8px;" />
    <p style="color:var(--gray); margin-top:8px;">UTR: ${t.utr}</p>
  `;
  openModal('genericModal');
}

// ============================================================
// ADMIN - DISTRICT MANAGEMENT
// ============================================================

function renderAdminDistricts() {
  const districts = LS.get('districts', []);
  const container = document.getElementById('adminDistrictList');

  if (!districts.length) {
    container.innerHTML = `<div class="empty-state"><i class="fas fa-map"></i><p>No districts added yet.</p></div>`;
    return;
  }

  container.innerHTML = districts.map(d => `
    <div class="admin-form" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
      <div>
        <strong style="color:var(--gold); font-family:var(--font-display); font-size:1.1rem; letter-spacing:1px;">${d.district}</strong>
        <div style="color:var(--gray); font-size:0.88rem; margin-top:4px;">${d.ground} • ${formatDate(d.date)} • ${d.entryOpen ? '<span style="color:var(--green-light);">Open</span>' : '<span style="color:var(--red);">Closed</span>'}</div>
        ${d.winner ? `<div style="color:var(--gold); font-size:0.88rem; margin-top:4px;"><i class="fas fa-trophy"></i> Champion: ${d.winner}</div>` : ''}
      </div>
      <div class="action-btns">
        <button class="btn-sm btn-approve" onclick="editDistrict('${d.id}')"><i class="fas fa-edit"></i> Edit</button>
        <button class="btn-sm btn-reject" onclick="deleteDistrict('${d.id}')"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `).join('');
}

function openDistrictForm(existingId = null) {
  const districts = LS.get('districts', []);
  const d = existingId ? districts.find(x => x.id === existingId) : {};

  document.getElementById('genericModalContent').innerHTML = `
    <h3 style="color:var(--gold); font-family:var(--font-display); font-size:1.5rem; letter-spacing:2px; margin-bottom:16px;">${existingId ? 'Edit' : 'Add'} District</h3>
    <div class="admin-form" style="border:none; padding:0;">
      <div class="form-grid" style="grid-template-columns:1fr 1fr;">
        <div><label>District Name *</label><input id="f_district" value="${d.district||''}" /></div>
        <div><label>Ground/Stadium Name *</label><input id="f_ground" value="${d.ground||''}" /></div>
        <div><label>Full Address</label><input id="f_address" value="${d.address||''}" /></div>
        <div><label>Google Map Link</label><input id="f_mapLink" value="${d.mapLink||''}" /></div>
        <div><label>Tournament Date</label><input type="date" id="f_date" value="${d.date||''}" /></div>
        <div><label>Reporting Time</label><input id="f_reportTime" value="${d.reportTime||'07:00 AM'}" /></div>
        <div><label>Match Start Time</label><input id="f_matchTime" value="${d.matchTime||'09:00 AM'}" /></div>
        <div><label>Last Entry Date</label><input type="date" id="f_lastEntry" value="${d.lastEntry||''}" /></div>
        <div><label>Overs per Side</label><input type="number" id="f_overs" value="${d.overs||10}" /></div>
        <div><label>Max Teams</label><input type="number" id="f_maxTeams" value="${d.maxTeams||16}" /></div>
        <div><label>Contact Person</label><input id="f_contact" value="${d.contactPerson||''}" /></div>
        <div><label>Contact WhatsApp</label><input id="f_cWhatsapp" value="${d.contactWhatsapp||''}" /></div>
      </div>
      <div style="margin-top:10px;"><label>Rules</label><textarea id="f_rules">${d.rules||''}</textarea></div>
      <div style="margin-top:10px;"><label><input type="checkbox" id="f_entryOpen" ${d.entryOpen !== false ? 'checked' : ''} style="margin-right:8px;" /> Entry Open</label></div>
    </div>
    <button onclick="saveDistrict('${existingId||''}')" class="btn btn-primary" style="width:100%; margin-top:16px;">
      <i class="fas fa-save"></i> Save District
    </button>
  `;
  openModal('genericModal');
}

function editDistrict(id) { openDistrictForm(id); }

function saveDistrict(existingId) {
  const district = document.getElementById('f_district').value.trim();
  if (!district) { showToast('District name required', 'error'); return; }

  const obj = {
    id: existingId || uid('D'),
    district,
    ground: document.getElementById('f_ground').value.trim(),
    address: document.getElementById('f_address').value.trim(),
    mapLink: document.getElementById('f_mapLink').value.trim(),
    date: document.getElementById('f_date').value,
    reportTime: document.getElementById('f_reportTime').value.trim(),
    matchTime: document.getElementById('f_matchTime').value.trim(),
    lastEntry: document.getElementById('f_lastEntry').value,
    overs: parseInt(document.getElementById('f_overs').value) || 10,
    maxTeams: parseInt(document.getElementById('f_maxTeams').value) || 16,
    contactPerson: document.getElementById('f_contact').value.trim(),
    contactWhatsapp: document.getElementById('f_cWhatsapp').value.trim(),
    rules: document.getElementById('f_rules').value.trim(),
    entryOpen: document.getElementById('f_entryOpen').checked,
    winner: '',
  };

  const districts = LS.get('districts', []);
  if (existingId) {
    const idx = districts.findIndex(d => d.id === existingId);
    obj.winner = districts[idx]?.winner || '';
    if (idx >= 0) districts[idx] = obj; else districts.push(obj);
  } else {
    districts.push(obj);
  }
  LS.set('districts', districts);
  closeModal('genericModal');
  renderAdminDistricts(); renderDistrictCards();
  showToast('District saved!', 'success');
}

function deleteDistrict(id) {
  if (!confirm('Delete this district?')) return;
  LS.set('districts', LS.get('districts', []).filter(d => d.id !== id));
  renderAdminDistricts(); renderDistrictCards();
  showToast('District deleted', 'warning');
}

// ============================================================
// ADMIN - FIXTURES
// ============================================================

function renderAdminFixtures() {
  const fixtures = LS.get('fixtures', []);
  const container = document.getElementById('adminFixtureList');

  if (!fixtures.length) {
    container.innerHTML = `<div class="empty-state"><i class="fas fa-calendar"></i><p>No fixtures added yet.</p></div>`;
    return;
  }

  container.innerHTML = fixtures.map(f => `
    <div class="admin-form" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
      <div>
        <strong style="color:var(--gold);">${f.district} — Match #${f.matchNo}</strong>
        <div style="color:var(--white); margin-top:4px;">${f.teamA} <span style="color:var(--gold);">vs</span> ${f.teamB}</div>
        <div style="color:var(--gray); font-size:0.85rem; margin-top:4px;">${formatDate(f.date)} ${f.time} • ${f.ground}</div>
        ${f.result ? `<div style="color:var(--green-light); font-size:0.85rem; margin-top:4px;">${f.result}</div>` : ''}
      </div>
      <div class="action-btns">
        <button class="btn-sm btn-approve" onclick="editFixture('${f.id}')"><i class="fas fa-edit"></i></button>
        <button class="btn-sm btn-reject" onclick="deleteFixture('${f.id}')"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `).join('');
}

function openFixtureForm(existingId = null) {
  const fixtures = LS.get('fixtures', []);
  const districts = LS.get('districts', []);
  const f = existingId ? fixtures.find(x => x.id === existingId) : {};

  const distOpts = districts.map(d => `<option value="${d.district}" ${f.district===d.district?'selected':''}>${d.district}</option>`).join('');

  document.getElementById('genericModalContent').innerHTML = `
    <h3 style="color:var(--gold); font-family:var(--font-display); font-size:1.5rem; letter-spacing:2px; margin-bottom:16px;">${existingId ? 'Edit' : 'Add'} Fixture</h3>
    <div class="admin-form" style="border:none; padding:0;">
      <div class="form-grid" style="grid-template-columns:1fr 1fr;">
        <div><label>District *</label><select id="ff_district"><option value="">Select</option>${distOpts}</select></div>
        <div><label>Match No</label><input type="number" id="ff_matchNo" value="${f.matchNo||1}" /></div>
        <div><label>Team A *</label><input id="ff_teamA" value="${f.teamA||''}" /></div>
        <div><label>Team B *</label><input id="ff_teamB" value="${f.teamB||''}" /></div>
        <div><label>Date</label><input type="date" id="ff_date" value="${f.date||''}" /></div>
        <div><label>Time</label><input id="ff_time" value="${f.time||''}" /></div>
        <div><label>Ground</label><input id="ff_ground" value="${f.ground||''}" /></div>
        <div><label>Result</label><input id="ff_result" value="${f.result||''}" /></div>
        <div><label>Winner Team</label><input id="ff_winner" value="${f.winner||''}" /></div>
        <div><label>MOM Player</label><input id="ff_motm" value="${f.motmPlayer||''}" /></div>
        <div><label>MOM Prize</label><input id="ff_motmPrize" value="${f.motmPrize||''}" /></div>
      </div>
    </div>
    <button onclick="saveFixture('${existingId||''}')" class="btn btn-primary" style="width:100%; margin-top:16px;">
      <i class="fas fa-save"></i> Save Fixture
    </button>
  `;
  openModal('genericModal');
}

function editFixture(id) { openFixtureForm(id); }

function saveFixture(existingId) {
  const district = document.getElementById('ff_district').value;
  const teamA = document.getElementById('ff_teamA').value.trim();
  const teamB = document.getElementById('ff_teamB').value.trim();
  if (!district || !teamA || !teamB) { showToast('District, Team A, Team B required', 'error'); return; }

  const obj = {
    id: existingId || uid('F'),
    district,
    matchNo: parseInt(document.getElementById('ff_matchNo').value) || 1,
    teamA, teamB,
    date: document.getElementById('ff_date').value,
    time: document.getElementById('ff_time').value.trim(),
    ground: document.getElementById('ff_ground').value.trim(),
    result: document.getElementById('ff_result').value.trim(),
    winner: document.getElementById('ff_winner').value.trim(),
    motmPlayer: document.getElementById('ff_motm').value.trim(),
    motmPrize: document.getElementById('ff_motmPrize').value.trim(),
  };

  const fixtures = LS.get('fixtures', []);
  if (existingId) {
    const idx = fixtures.findIndex(f => f.id === existingId);
    if (idx >= 0) fixtures[idx] = obj; else fixtures.push(obj);
  } else { fixtures.push(obj); }
  LS.set('fixtures', fixtures);
  closeModal('genericModal');
  renderAdminFixtures(); renderFixtures();
  showToast('Fixture saved!', 'success');
}

function deleteFixture(id) {
  if (!confirm('Delete fixture?')) return;
  LS.set('fixtures', LS.get('fixtures', []).filter(f => f.id !== id));
  renderAdminFixtures(); renderFixtures();
  showToast('Fixture deleted', 'warning');
}

// ============================================================
// ADMIN - PRIZES FORM
// ============================================================

function renderAdminPrizesForm() {
  const prizes = LS.get('prizes', {});
  document.getElementById('adminPrizesForm').innerHTML = `
    <div class="admin-form">
      <h4>District Level Prizes</h4>
      <div class="form-grid" style="grid-template-columns:1fr 1fr;">
        <div><label>Winner Prize Amount</label><input id="p_dw" value="${prizes.districtWinner||'₹51,000'}" /></div>
        <div><label>Winner Extras (Bike/Trophy etc)</label><input id="p_dwe" value="${prizes.districtWinnerExtra||'Bike + Trophy + Certificate'}" /></div>
        <div><label>Runner-up Prize Amount</label><input id="p_dr" value="${prizes.districtRunnerUp||'₹21,000'}" /></div>
        <div><label>Runner-up Extras</label><input id="p_dre" value="${prizes.districtRunnerUpExtra||'Trophy + Certificate'}" /></div>
        <div><label>Man of the Match</label><input id="p_motm" value="${prizes.motm||'₹5,100 + Trophy'}" /></div>
        <div><label>Best Batsman</label><input id="p_bat" value="${prizes.bestBatsman||'₹11,000 + Trophy'}" /></div>
        <div><label>Best Bowler</label><input id="p_bowl" value="${prizes.bestBowler||'₹11,000 + Trophy'}" /></div>
        <div><label>Best Fielder</label><input id="p_field" value="${prizes.bestFielder||'₹5,100 + Medal'}" /></div>
      </div>
    </div>
    <div class="admin-form">
      <h4>Mega Contest Prizes</h4>
      <div class="form-grid" style="grid-template-columns:1fr 1fr;">
        <div><label>Winner Prize</label><input id="p_mw" value="${prizes.megaWinner||'₹5,00,000'}" /></div>
        <div><label>Winner Extras</label><input id="p_mwe" value="${prizes.megaWinnerExtra||'Bike + Trophy + Medal'}" /></div>
        <div><label>Runner-up Prize</label><input id="p_mr" value="${prizes.megaRunnerUp||'₹2,00,000'}" /></div>
        <div><label>Runner-up Extras</label><input id="p_mre" value="${prizes.megaRunnerUpExtra||'Trophy + Medal'}" /></div>
        <div><label>Third Place Prize</label><input id="p_mt" value="${prizes.megaThird||'₹51,000'}" /></div>
        <div><label>Third Place Extras</label><input id="p_mte" value="${prizes.megaThirdExtra||'Medal + Certificate'}" /></div>
        <div><label>Man of Tournament</label><input id="p_mot" value="${prizes.mot||'₹51,000 + Bike + Trophy'}" /></div>
      </div>
    </div>
    <button onclick="savePrizes()" class="btn btn-primary" style="margin-top:8px;"><i class="fas fa-save"></i> Save Prizes</button>
  `;
}

function savePrizes() {
  const prizes = {
    districtWinner: document.getElementById('p_dw').value,
    districtWinnerExtra: document.getElementById('p_dwe').value,
    districtRunnerUp: document.getElementById('p_dr').value,
    districtRunnerUpExtra: document.getElementById('p_dre').value,
    motm: document.getElementById('p_motm').value,
    bestBatsman: document.getElementById('p_bat').value,
    bestBowler: document.getElementById('p_bowl').value,
    bestFielder: document.getElementById('p_field').value,
    megaWinner: document.getElementById('p_mw').value,
    megaWinnerExtra: document.getElementById('p_mwe').value,
    megaRunnerUp: document.getElementById('p_mr').value,
    megaRunnerUpExtra: document.getElementById('p_mre').value,
    megaThird: document.getElementById('p_mt').value,
    megaThirdExtra: document.getElementById('p_mte').value,
    mot: document.getElementById('p_mot').value,
  };
  LS.set('prizes', prizes);
  renderPrizeHighlights(); renderMegaContest(); renderPrizesSection();
  showToast('Prizes updated!', 'success');
}

// ============================================================
// ADMIN - AWARDS
// ============================================================

function renderAdminAwards() {
  const awards = LS.get('awards', []);
  const container = document.getElementById('adminAwardsList');

  if (!awards.length) {
    container.innerHTML = `<div class="empty-state"><i class="fas fa-medal"></i><p>No awards added.</p></div>`;
    return;
  }

  container.innerHTML = awards.map(a => `
    <div class="admin-form" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
      <div>
        <strong style="color:var(--gold);">${a.name}</strong>
        <div style="color:var(--white); font-size:0.9rem;">${a.player ? a.player + ' — ' + a.team : 'TBA'} (${a.district||''})</div>
        <div style="color:var(--gray); font-size:0.85rem;">${a.cash} ${a.gift ? '+ ' + a.gift : ''}</div>
      </div>
      <div class="action-btns">
        <button class="btn-sm" style="background:${a.show?'var(--green)':'#555'};" onclick="toggleAward('${a.id}')">${a.show ? 'Visible' : 'Hidden'}</button>
        <button class="btn-sm btn-approve" onclick="editAward('${a.id}')"><i class="fas fa-edit"></i></button>
        <button class="btn-sm btn-reject" onclick="deleteAward('${a.id}')"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `).join('');
}

function openAwardForm(existingId = null) {
  const awards = LS.get('awards', []);
  const a = existingId ? awards.find(x => x.id === existingId) : {};

  document.getElementById('genericModalContent').innerHTML = `
    <h3 style="color:var(--gold); font-family:var(--font-display); font-size:1.5rem; letter-spacing:2px; margin-bottom:16px;">${existingId ? 'Edit' : 'Add'} Award</h3>
    <div class="admin-form" style="border:none; padding:0;">
      <div class="form-grid" style="grid-template-columns:1fr 1fr;">
        <div><label>Award Name *</label><input id="aw_name" value="${a.name||''}" /></div>
        <div><label>Cash Amount</label><input id="aw_cash" value="${a.cash||''}" /></div>
        <div><label>Trophy/Gift Details</label><input id="aw_gift" value="${a.gift||''}" /></div>
        <div><label>Player Name</label><input id="aw_player" value="${a.player||''}" /></div>
        <div><label>Team Name</label><input id="aw_team" value="${a.team||''}" /></div>
        <div><label>District</label><input id="aw_district" value="${a.district||''}" /></div>
      </div>
    </div>
    <button onclick="saveAward('${existingId||''}')" class="btn btn-primary" style="width:100%; margin-top:16px;">
      <i class="fas fa-save"></i> Save Award
    </button>
  `;
  openModal('genericModal');
}

function editAward(id) { openAwardForm(id); }

function saveAward(existingId) {
  const name = document.getElementById('aw_name').value.trim();
  if (!name) { showToast('Award name required', 'error'); return; }

  const obj = {
    id: existingId || uid('A'),
    name,
    cash: document.getElementById('aw_cash').value.trim(),
    gift: document.getElementById('aw_gift').value.trim(),
    player: document.getElementById('aw_player').value.trim(),
    team: document.getElementById('aw_team').value.trim(),
    district: document.getElementById('aw_district').value.trim(),
    show: true,
  };

  const awards = LS.get('awards', []);
  if (existingId) {
    const idx = awards.findIndex(a => a.id === existingId);
    if (idx >= 0) awards[idx] = obj; else awards.push(obj);
  } else { awards.push(obj); }
  LS.set('awards', awards);
  closeModal('genericModal');
  renderAdminAwards(); renderWinners();
  showToast('Award saved!', 'success');
}

function toggleAward(id) {
  const awards = LS.get('awards', []);
  const idx = awards.findIndex(a => a.id === id);
  if (idx >= 0) { awards[idx].show = !awards[idx].show; LS.set('awards', awards); renderAdminAwards(); renderWinners(); }
}

function deleteAward(id) {
  if (!confirm('Delete award?')) return;
  LS.set('awards', LS.get('awards', []).filter(a => a.id !== id));
  renderAdminAwards(); renderWinners();
}

// ============================================================
// ADMIN - MEGA CONTEST FORM
// ============================================================

function renderAdminMegaForm() {
  const mega = LS.get('mega', {});
  const teams = LS.get('teams', []);
  const champions = teams.filter(t => t.isDistrictChampion || t.status === 'champion');

  const teamOpts = (val) => champions.map(c => `<option value="${c.teamName}" ${mega[val]===c.teamName?'selected':''}>${c.teamName} (${c.district})</option>`).join('');

  document.getElementById('adminMegaForm').innerHTML = `
    <div class="admin-form">
      <h4>Mega Contest Schedule</h4>
      <div class="form-grid" style="grid-template-columns:1fr 1fr;">
        <div><label>Final Venue</label><input id="mg_venue" value="${mega.venue||''}" /></div>
        <div><label>Final Date</label><input type="date" id="mg_date" value="${mega.date||''}" /></div>
        <div><label>Reporting Time</label><input id="mg_reportTime" value="${mega.reportTime||''}" /></div>
        <div><label>Contact</label><input id="mg_contact" value="${mega.contact||''}" /></div>
      </div>
      <div style="margin-top:10px;"><label>Rules</label><textarea id="mg_rules">${mega.rules||''}</textarea></div>
    </div>
    <div class="admin-form">
      <h4>Mega Contest Results</h4>
      <div class="form-grid" style="grid-template-columns:1fr 1fr;">
        <div><label>Winner Team</label><select id="mg_winner"><option value="">Select</option>${teamOpts('megaWinner')}</select></div>
        <div><label>Runner-up</label><select id="mg_runnerUp"><option value="">Select</option>${teamOpts('megaRunnerUp')}</select></div>
        <div><label>Third Place</label><select id="mg_third"><option value="">Select</option>${teamOpts('megaThird')}</select></div>
      </div>
    </div>
    <button onclick="saveMega()" class="btn btn-primary" style="margin-top:8px;"><i class="fas fa-save"></i> Save Mega Contest</button>
  `;
}

function saveMega() {
  const teams = LS.get('teams', []);
  const wName = document.getElementById('mg_winner').value;
  const rName = document.getElementById('mg_runnerUp').value;
  const tName = document.getElementById('mg_third').value;

  const getDistrict = (name) => teams.find(t => t.teamName === name)?.district || '';

  const mega = {
    venue: document.getElementById('mg_venue').value,
    date: document.getElementById('mg_date').value,
    reportTime: document.getElementById('mg_reportTime').value,
    contact: document.getElementById('mg_contact').value,
    rules: document.getElementById('mg_rules').value,
    megaWinner: wName,
    megaWinnerDistrict: getDistrict(wName),
    megaRunnerUp: rName,
    megaRunnerUpDistrict: getDistrict(rName),
    megaThird: tName,
    megaThirdDistrict: getDistrict(tName),
  };
  LS.set('mega', mega);
  renderMegaContest(); renderWinners();
  showToast('Mega Contest saved!', 'success');
}

// ============================================================
// ADMIN - TABS
// ============================================================

function showAdminTab(tab) {
  document.querySelectorAll('.admin-tab-content').forEach(t => t.classList.add('hidden'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.remove('hidden');
  event.target.classList.add('active');
}

// ============================================================
// CSV EXPORT
// ============================================================

function exportCSV() {
  const teams = LS.get('teams', []);
  if (!teams.length) { showToast('No teams to export', 'error'); return; }

  const headers = ['ID', 'Team Name', 'Captain', 'District', 'Village', 'Mobile', 'WhatsApp', 'Total Players', 'Jersey Color', 'Pay Status', 'UTR', 'Registered At'];
  const rows = teams.map(t => [t.id, t.teamName, t.captainName, t.district, t.village, t.mobile, t.whatsapp, t.totalPlayers, t.jerseyColor, t.payStatus, t.utr || '', t.registeredAt?.split('T')[0] || '']);

  const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'UP_Cricket_Teams.csv';
  a.click();
  showToast('CSV exported!', 'success');
}

// ============================================================
// CLEAR DEMO DATA
// ============================================================

function clearDemoData() {
  if (!confirm('This will delete ALL data (teams, districts, fixtures, prizes). Are you sure?')) return;
  if (!confirm('FINAL WARNING: All data will be permanently deleted!')) return;
  ['teams', 'districts', 'fixtures', 'prizes', 'awards', 'mega'].forEach(k => LS.remove(k));
  seedDemoData();
  loadAdminDashboard();
  renderAll();
  showToast('Demo data reset!', 'warning');
}

// ============================================================
// PDF RECEIPT
// ============================================================

let currentReceiptTeam = null;

function showReceipt(id) {
  const teams = LS.get('teams', []);
  const t = teams.find(x => x.id === id);
  if (!t || t.payStatus !== 'approved') { showToast('Receipt only available after approval', 'error'); return; }
  currentReceiptTeam = t;

  document.getElementById('receiptContent').innerHTML = `
    <div class="receipt-body" id="receiptPrintArea">
      <div class="receipt-header">
        <h2>🏏 UP CRICKET</h2>
        <p>Uttar Pradesh Tennis Ball Cricket Tournament</p>
        <hr style="border-color:var(--border); margin:10px 0;" />
        <strong>PAYMENT RECEIPT</strong>
      </div>
      <div class="receipt-row"><span>Receipt No.</span><strong>REC-${t.id}</strong></div>
      <div class="receipt-row"><span>Team ID</span><strong>${t.id}</strong></div>
      <div class="receipt-row"><span>Team Name</span><strong>${t.teamName}</strong></div>
      <div class="receipt-row"><span>Captain Name</span><strong>${t.captainName}</strong></div>
      <div class="receipt-row"><span>District</span><strong>${t.district}</strong></div>
      <div class="receipt-row"><span>Mobile</span><strong>${t.mobile}</strong></div>
      <div class="receipt-row"><span>WhatsApp</span><strong>${t.whatsapp}</strong></div>
      <div class="receipt-row"><span>Entry Fee</span><strong style="color:var(--green);">₹2,100</strong></div>
      <div class="receipt-row"><span>UTR / Transaction ID</span><strong>${t.utr || 'N/A'}</strong></div>
      <div class="receipt-row"><span>Approval Date</span><strong>${t.approvalDate || 'N/A'}</strong></div>
      <div class="receipt-status">
        <span class="status-chip">✅ PAYMENT APPROVED</span>
      </div>
      <hr style="border-color:var(--border); margin:12px 0;" />
      <p style="text-align:center; font-size:0.82rem; color:var(--text-muted);">Organizer: UP Cricket Organization<br>📞 +91 99999 99999 | 💬 WhatsApp: +91 99999 99999</p>
    </div>
  `;
  openModal('receiptModal');
}

function downloadPDF() {
  if (!currentReceiptTeam) return;
  const t = currentReceiptTeam;
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFillColor(11, 26, 53);
  doc.rect(0, 0, 210, 297, 'F');
  doc.setTextColor(245, 197, 24);
  doc.setFontSize(20);
  doc.text('UP TENNIS BALL CRICKET TOURNAMENT', 105, 20, { align: 'center' });
  doc.setFontSize(14);
  doc.text('PAYMENT RECEIPT', 105, 30, { align: 'center' });
  doc.setDrawColor(245, 197, 24);
  doc.line(20, 35, 190, 35);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  const rows = [
    ['Receipt No.', 'REC-' + t.id],
    ['Team ID', t.id],
    ['Team Name', t.teamName],
    ['Captain Name', t.captainName],
    ['District', t.district],
    ['Village/City', t.village],
    ['Mobile', t.mobile],
    ['WhatsApp', t.whatsapp],
    ['Entry Fee', '₹2,100'],
    ['UTR / Transaction ID', t.utr || 'N/A'],
    ['Payment Status', 'APPROVED'],
    ['Approval Date', t.approvalDate || new Date().toLocaleDateString('en-IN')],
  ];

  let y = 50;
  rows.forEach(([label, val]) => {
    doc.setTextColor(170, 176, 192);
    doc.text(label + ':', 25, y);
    doc.setTextColor(255, 255, 255);
    doc.text(String(val), 90, y);
    y += 12;
  });

  doc.setTextColor(26, 122, 60);
  doc.setFontSize(14);
  doc.text('✓ PAYMENT APPROVED', 105, y + 10, { align: 'center' });
  doc.setTextColor(170, 176, 192);
  doc.setFontSize(9);
  doc.text('UP Cricket Organization | +91 99999 99999 | info@upcricket.in', 105, 280, { align: 'center' });

  doc.save(`Receipt-${t.id}.pdf`);
  showToast('PDF downloaded!', 'success');
}

function printReceipt() {
  const content = document.getElementById('receiptPrintArea').innerHTML;
  const win = window.open('', '_blank');
  win.document.write(`<html><head><title>Receipt</title><link rel="stylesheet" href="style.css"/></head><body style="padding:20px;">${content}</body></html>`);
  win.document.close();
  win.print();
}

function shareWhatsApp() {
  if (!currentReceiptTeam) return;
  const t = currentReceiptTeam;
  const msg = encodeURIComponent(`🏏 *UP Tennis Ball Cricket Tournament*\n✅ Payment Approved!\n\n*Team ID:* ${t.id}\n*Team:* ${t.teamName}\n*Captain:* ${t.captainName}\n*District:* ${t.district}\n*Entry Fee:* ₹2,100\n*UTR:* ${t.utr}\n\nAll the best! 🏆`);
  window.open(`https://wa.me/?text=${msg}`, '_blank');
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function formatDate(dateStr) {
  if (!dateStr) return 'TBA';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return dateStr; }
}

// ============================================================
// RENDER ALL PUBLIC SECTIONS
// ============================================================

function renderAll() {
  renderPrizeHighlights();
  renderDistrictCards();
  renderFixtures();
  renderQualifiedTeams();
  renderMegaContest();
  renderWinners();
  renderPrizesSection();
}

// ============================================================
// INIT
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  seedDemoData();
  renderAll();
  checkAdminSession();

  // Keyboard: Enter for admin login
  document.getElementById('adminPass').addEventListener('keydown', e => {
    if (e.key === 'Enter') adminLogin();
  });
});

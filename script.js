// ============================
// DATA
// ============================
const BLOGGERS = [
  { name: 'PilotStorm',   code: 'STORM',    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=storm&backgroundColor=b6e3f4' },
  { name: 'PilotVortex',  code: 'VORTEX',   avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vortex&backgroundColor=c0aede' },
  { name: 'PilotBlaze',   code: 'BLAZE',    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=blaze&backgroundColor=d1f4d1' },
  { name: 'PilotNova',    code: 'NOVA',     avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nova&backgroundColor=ffd5dc' },
];

const TEAM_COLORS = ['var(--team1)', 'var(--team2)', 'var(--team3)', 'var(--team4)'];

const PRIZES = [
  { place: '1', value: 500 },
  { place: '2', value: 400 },
  { place: '3', value: 300 },
  { place: '4', value: 200 },
];

const RANDOM_NAMES = [
  'xShadow', 'ДимаFire', 'AnnaCraft', 'PavelPro', 'SanyaWolf',
  'KrisLine', 'MaxStorm', 'OlgaRain', 'ArtemByte', 'NastyaStar',
  'DenisIce', 'LenaGold', 'VladDark', 'KatyaSun', 'IgorWin',
  'SvetaBoom', 'ФёдорRage', 'PolinaZen', 'RomanEdge', 'JuliaVibe',
];

let teamCount = 2;
let teams = [];
let feedItems = [];
let autoInterval = null;

// ============================
// INIT
// ============================
function initTeams(count) {
  teamCount = count;
  teams = [];
  for (let i = 0; i < count; i++) {
    teams.push({
      blogger: BLOGGERS[i],
      score: 0,
      donators: new Map(),
    });
  }
  feedItems = [];
  render();
  updateTeamSelect();
}

// ============================
// PURCHASE
// ============================
function addPurchase(teamIdx, buyerName, amount) {
  const team = teams[teamIdx];
  team.score += amount;
  const current = team.donators.get(buyerName) || 0;
  team.donators.set(buyerName, current + amount);

  feedItems.unshift({ teamIdx, buyerName, amount, time: new Date() });
  if (feedItems.length > 50) feedItems.pop();

  render();
}

// ============================
// RENDER
// ============================
function render() {
  renderScoreBar();
  renderTeams();
  renderFeed();
  renderPrizes();
}

function renderScoreBar() {
  const totalScore = teams.reduce((s, t) => s + t.score, 0) || 1;
  const bar = document.getElementById('scoreBar');
  bar.innerHTML = teams.map((t, i) => {
    const pct = ((t.score / totalScore) * 100).toFixed(1);
    return `<div class="score-bar__seg" style="width:${pct}%">${pct > 10 ? Math.round(pct) + '%' : ''}</div>`;
  }).join('');
}

function renderTeams() {
  const grid = document.getElementById('teamsGrid');
  grid.setAttribute('data-count', teamCount);

  const sorted = teams.map((t, i) => ({ ...t, idx: i })).sort((a, b) => b.score - a.score);
  const rankMap = {};
  sorted.forEach((t, pos) => rankMap[t.idx] = pos + 1);

  grid.innerHTML = teams.map((team, i) => {
    const top5 = getTop5(team.donators);
    const rank = rankMap[i];
    return `
      <div class="team-card" data-team="${i}">
        <div class="team-card__header">
          <div class="team-card__blogger">
            <img class="team-card__avatar" src="${team.blogger.avatar}" alt="${team.blogger.name}">
            <div>
              <div class="team-card__name">${team.blogger.name}</div>
              <div class="team-card__code">Code: ${team.blogger.code}</div>
            </div>
          </div>
          <div class="team-card__rank-badge">#${rank}</div>
        </div>
        <div class="team-card__score-row">
          <div class="team-card__score">${formatNumber(team.score)}</div>
          <div class="team-card__score-unit">pts</div>
        </div>
        <div class="donators">
          <div class="donators__title">Top 5 donators</div>
          ${top5.length === 0 ? '<div class="donator__empty">No purchases yet</div>' : ''}
          ${top5.map((d, j) => `
            <div class="donator">
              <div class="donator__rank ${j === 0 ? 'gold' : j === 1 ? 'silver' : j === 2 ? 'bronze' : ''}">${j + 1}</div>
              <div class="donator__name">${d.name}</div>
              <div class="donator__amount">${formatNumber(d.amount)} points</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');
}

function renderFeed() {
  const list = document.getElementById('feedList');
  list.innerHTML = feedItems.slice(0, 12).map(item => `
    <div class="feed-item">
      <div class="feed-dot" style="background:${TEAM_COLORS[item.teamIdx]}"></div>
      <div class="feed-text"><strong>${item.buyerName}</strong> purchased with code <strong>${teams[item.teamIdx].blogger.code}</strong></div>
      <div class="feed-amount" style="color:${TEAM_COLORS[item.teamIdx]}">+${formatNumber(item.amount)} points</div>
    </div>
  `).join('');
}

function renderPrizes() {
  const row = document.getElementById('prizesRow');
  row.innerHTML = PRIZES.slice(0, teamCount).map((p, i) => `
    <div class="prize-badge">
      <div class="prize-badge__place prize-badge__place--${i + 1}">${p.place}</div>
      <span class="prize-badge__icon">🎁</span>
      <span class="prize-badge__value">${formatNumber(p.value)}</span>
    </div>
  `).join('');
}

// ============================
// HELPERS
// ============================
function getTop5(donators) {
  return [...donators.entries()]
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
}

function formatNumber(n) {
  return n.toLocaleString('ru-RU');
}

function updateTeamSelect() {
  const sel = document.getElementById('buyTeam');
  sel.innerHTML = teams.map((t, i) => `<option value="${i}">${t.blogger.code}</option>`).join('');
}

// ============================
// CONTROLS
// ============================
function setTeamCount(n) {
  document.querySelectorAll('#teamCountBtns .debug-panel__pill').forEach((btn, i) => {
    btn.classList.toggle('active', (i === 0 && n === 2) || (i === 1 && n === 3) || (i === 2 && n === 4));
  });
  initTeams(n);
}

function manualPurchase() {
  const name = document.getElementById('buyerName').value.trim() || RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
  const amount = parseInt(document.getElementById('buyAmount').value) || 500;
  const teamIdx = parseInt(document.getElementById('buyTeam').value);
  addPurchase(teamIdx, name, amount);
}

function toggleAutoMode() {
  if (document.getElementById('autoMode').checked) {
    autoInterval = setInterval(() => {
      const teamIdx = Math.floor(Math.random() * teamCount);
      const name = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
      const amount = [100, 200, 300, 500, 700, 1000, 1500, 2000, 5000][Math.floor(Math.random() * 9)];
      addPurchase(teamIdx, name, amount);
    }, 800);
  } else {
    clearInterval(autoInterval);
    autoInterval = null;
  }
}

// ============================
// ABOUT MODAL
// ============================
function openAbout() {
  document.getElementById('aboutModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeAbout(e) {
  if (e && e.target !== e.currentTarget) return; // only close on overlay click
  document.getElementById('aboutModal').classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeAbout();
});

// ============================
// DEBUG PANEL TOGGLE
// ============================
function toggleDebugPanel() {
  document.getElementById('debugPanel').classList.toggle('collapsed');
}

// ====== BOOT ======
initTeams(2);


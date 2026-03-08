const fs = require('fs');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Interactive SEO Dashboard — disaster911.net | Disaster Response by Ryan</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<style>
:root{--primary:#1A3A5C;--accent:#E8450A;--dark:#0F172A;--card:#1E293B;--text:#F8FAFC;--muted:#94A3B8;--border:#334155;--green:#22C55E;}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:var(--dark);color:var(--text);line-height:1.5;}
.sidebar{width:240px;height:100vh;background:#fff;position:fixed;left:0;top:0;padding:1.5rem 1rem;z-index:100;overflow-y:auto;}
.sidebar h2{color:var(--accent);font-size:1rem;margin-bottom:.5rem;text-align:center;font-weight:800;letter-spacing:.05em;}
.sidebar p{color:var(--muted);font-size:.75rem;text-align:center;margin-bottom:2rem;}
.nav-btn{display:block;padding:.7rem 1rem;color:var(--text);text-decoration:none;border-radius:8px;margin-bottom:.4rem;cursor:pointer;border:none;background:transparent;width:100%;text-align:left;font-size:.9rem;transition:all .2s;}
.nav-btn:hover,.nav-btn.active{background:var(--accent);color:#000;}
.main{margin-left:240px;padding:2rem;}
.top-bar{background:var(--card);border-radius:12px;padding:1.25rem 1.5rem;margin-bottom:2rem;display:flex;justify-content:space-between;align-items:center;border:1px solid var(--border);flex-wrap:wrap;gap:1rem;}
.site-name{font-size:1.1rem;font-weight:700;color:var(--accent);}
.site-sub{font-size:.8rem;color:var(--muted);}
.stats-row{display:flex;gap:2rem;flex-wrap:wrap;}
.stat h4{font-size:.7rem;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;}
.stat-val{font-size:1.25rem;font-weight:700;}
.tab{display:none;}.tab.active{display:block;}
.grid{display:grid;gap:1.5rem;}.g12{grid-template-columns:1fr;}.g8-4{grid-template-columns:2fr 1fr;}.g6{grid-template-columns:1fr 1fr;}.g3{grid-template-columns:1fr 1fr 1fr;}
.card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:1.5rem;}
.card h3{font-size:1rem;color:var(--muted);margin-bottom:1.25rem;font-weight:600;}
.card h1{font-size:1.5rem;margin-bottom:.5rem;}
table{width:100%;border-collapse:collapse;font-size:.875rem;}
th{text-align:left;padding:.6rem;color:var(--muted);border-bottom:1px solid var(--border);font-weight:500;}
td{padding:.6rem;border-bottom:1px solid var(--border);}
.up{color:var(--green);font-weight:600;}.down{color:#EF4444;font-weight:600;}
.score-wrap{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:1.5rem;}
.score{width:110px;height:110px;border-radius:50%;border:8px solid var(--accent);display:flex;align-items:center;justify-content:center;font-size:1.8rem;font-weight:800;margin-bottom:.75rem;}
.score.red{border-color:#EF4444;}.score.yellow{border-color:#F59E0B;}
.tag{padding:2px 8px;border-radius:4px;font-size:.7rem;font-weight:700;text-transform:uppercase;}
.tag-yes{background:rgba(34,197,94,.2);color:var(--green);}.tag-no{background:rgba(239,68,68,.2);color:#EF4444;}.tag-partial{background:rgba(245,158,11,.2);color:#F59E0B;}.tag-mon{background:rgba(148,163,184,.2);color:var(--muted);}
.llm-res{font-family:monospace;font-size:.8rem;color:var(--muted);display:block;margin-top:3px;}
.action-list{list-style:none;}.action-list li{margin-bottom:.6rem;padding-left:1.25rem;position:relative;}
.action-list li::before{content:"•";color:var(--accent);position:absolute;left:0;font-weight:700;}
.check-list{list-style:none;}.check-list li{margin-bottom:.5rem;display:flex;gap:.5rem;align-items:baseline;}
.priority-list{padding-left:1.5rem;}.priority-list li{margin-bottom:.5rem;}
.tip-box{padding:1rem 1.25rem;background:rgba(232,69,10,.08);border:1px solid rgba(232,69,10,.25);border-radius:8px;margin-top:1rem;}
.mono-box{background:var(--dark);padding:1.25rem;border-radius:8px;font-family:monospace;font-size:.82rem;color:var(--muted);}
.mono-box p{margin-bottom:.5rem;}

.rescan-btn {
  background: var(--accent);
  color:#000;
  border: none;
  padding: .6rem 1.2rem;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s, opacity 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.rescan-btn:hover { transform: scale(1.05); opacity: 0.9; }
.rescan-btn:disabled { background: var(--muted); cursor: not-allowed; }

.loading-spinner {
  display: none;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color:#000;
  animation: spin 1s ease-in-out infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.scanning .loading-spinner { display: inline-block; }

@media(max-width:900px){.sidebar{width:60px;}.sidebar h2,.sidebar p,.nav-btn span{display:none;}.main{margin-left:60px;}.g8-4,.g6,.g3{grid-template-columns:1fr;}}
</style>
</head>
<body>
<nav class="sidebar">
  <h2>DISASTER 911</h2>
  <p>disaster911.net</p>
  <button class="nav-btn active" onclick="showTab('seo',this)">📊 <span>SEO Rankings</span></button>
  <button class="nav-btn" onclick="showTab('aio',this)">🤖 <span>AI Overviews</span></button>
  <button class="nav-btn" onclick="showTab('aeo',this)">❓ <span>Answer Engine</span></button>
  <button class="nav-btn" onclick="showTab('geo',this)">🧠 <span>LLM Citations</span></button>
  <button class="nav-btn" onclick="showTab('local',this)">📍 <span>Local / Map Pack</span></button>
</nav>

<div class="main">
  <!-- Site Summary Bar -->
  <div class="top-bar">
    <div><div class="site-name">disaster911.net</div><div class="site-sub">Disaster Response by Ryan | Walker, MI | (616) 822-1978</div></div>
    <div class="stats-row" id="top-stats">
      <!-- Injected by JS -->
    </div>
    <button class="rescan-btn" id="rescan-btn" onclick="startRescan()">
      <div class="loading-spinner"></div>
      <span>Rescan Now</span>
    </button>
  </div>

  <!-- TAB 1: SEO -->
  <div id="seo" class="tab active">
    <div class="grid g12" style="margin-bottom:1.5rem;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <h1 style="font-size:1.75rem;">SEO Strategy Dashboard</h1>
        <span style="color:var(--muted);font-size:.9rem;" id="report-date">Report Date: Loading...</span>
      </div>
    </div>
    <div class="grid g3" style="margin-bottom:1.5rem;" id="seo-scorecards">
      <!-- Injected by JS -->
    </div>
    <div class="grid g8-4" style="margin-bottom:1.5rem;">
      <div class="card"><h3>Ranking Progress — Last 30 Days</h3><canvas id="rankChart" height="220"></canvas></div>
      <div class="card"><h3>Position Distribution</h3><canvas id="distChart"></canvas></div>
    </div>
    <div class="card">
      <h3>Keyword Rankings Table</h3>
      <table id="keyword-table">
        <thead><tr><th>Keyword</th><th>Position</th><th>Last Week</th><th>Change</th><th>Volume</th><th>Difficulty</th></tr></thead>
        <tbody>
          <!-- Injected by JS -->
        </tbody>
      </table>
    </div>
  </div>

  <!-- TAB 2: AIO -->
  <div id="aio" class="tab">
    <h1 style="margin-bottom:.5rem;">AI Overview (AIO) Dashboard</h1>
    <p style="color:var(--muted);margin-bottom:2rem;">Google's AI Overviews appear for ~20% of queries. Being cited here drives significant trust and traffic.</p>
    <div class="grid g8-4" style="margin-bottom:1.5rem;">
      <div class="card">
        <h3>AI Overview Citations Tracking</h3>
        <table id="aio-table">
          <thead><tr><th>Query</th><th>AIO Triggered</th><th>We're Cited</th><th>Action</th></tr></thead>
          <tbody>
            <!-- Injected by JS -->
          </tbody>
        </table>
      </div>
      <div class="card"><h3>AIO Score</h3><div class="score-wrap" id="aio-score-wrap"></div></div>
    </div>
    <div class="grid g6">
      <div class="card"><h3>Action Items</h3><ul class="action-list"><li>Add more FAQ schema to all service pages</li><li>Increase E-E-A-T signals (license certs, author bio)</li><li>Get cited in MLive.com or WoodTV.com</li><li>Add comprehensive Author Bio schema to blog articles</li></ul></div>
      <div class="card"><h3>AIO Expert Tip</h3><div class="tip-box"><p>"Conversational, question-answering content gets cited most by Google AI Overviews. Lead every blog post with a direct, concise answer in 2-3 sentences."</p></div></div>
    </div>
  </div>

  <!-- TAB 3: AEO -->
  <div id="aeo" class="tab">
    <h1 style="margin-bottom:1.5rem;">Answer Engine Optimization (AEO)</h1>
    <div class="grid g8-4" style="margin-bottom:1.5rem;">
      <div class="card">
        <h3>Featured Snippets Tracking</h3>
        <table id="aeo-table">
          <thead><tr><th>Query</th><th>Snippet Type</th><th>Status</th></tr></thead>
          <tbody>
            <!-- Injected by JS -->
          </tbody>
        </table>
      </div>
      <div class="card"><h3>AEO Score</h3><div class="score-wrap" id="aeo-score-wrap"></div></div>
    </div>
    <div class="grid g6">
      <div class="card">
        <h3>People Also Ask (PAA) Tracking</h3>
        <table id="paa-table">
          <thead><tr><th>PAA Question</th><th>Box Exists</th><th>Ranking</th></tr></thead>
          <tbody>
            <!-- Injected by JS -->
          </tbody>
        </table>
      </div>
      <div class="card"><h3>AEO Recommendations</h3><ul class="action-list"><li>Structure blog posts: direct answer in first paragraph</li><li>Use Q&amp;A format for H2/H3 headers</li><li>Add FAQPage microdata to all hub pages</li><li>Create structured cost tables for cost-related queries</li></ul></div>
    </div>
  </div>

  <!-- TAB 4: GEO / LLM -->
  <div id="geo" class="tab">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem;">
      <div><h1>LLM Citation Tracker (GEO)</h1><p style="color:var(--muted)">Is Your Business Being Recommended by AI Assistants?</p></div>
      <div class="score-wrap" style="padding:.5rem;" id="geo-score-mini"></div>
    </div>
    <div class="card" style="margin-bottom:1.5rem;">
      <h3>LLM Citation Status — Test Results</h3>
      <table id="geo-table">
        <thead><tr><th>AI Engine</th><th>Test Query</th><th>Result</th><th>Recommended Action</th></tr></thead>
        <tbody>
          <!-- Injected by JS -->
        </tbody>
      </table>
    </div>
    <div class="grid g6" style="margin-bottom:1.5rem;">
      <div class="card">
        <h3>Why LLMs Don't Cite You Yet</h3>
        <ul class="action-list">
          <li>Low citation count in high-authority directories</li>
          <li>Limited Wikipedia/Wikidata entity presence</li>
          <li>Few references in local news (mlive.com, woodtv.com)</li>
          <li>NAP inconsistency across the web</li>
          <li>Domain Authority 18 — below LLM training data pickup threshold</li>
        </ul>
      </div>
      <div class="card">
        <h3>Priority Action Plan (Ordered by Impact)</h3>
        <ol class="priority-list">
          <li>Submit to 50+ local directories (Google, Bing, Yelp, BBB, Angi)</li>
          <li>Get cited in MLive.com or WoodTV.com — issue a press release</li>
          <li>Publish comprehensive "Water Damage Cost Guide" (link magnet)</li>
          <li>Target 50+ Google Reviews — 5+ new per week</li>
          <li>Add complete FAQPage schema to all hub pages</li>
        </ol>
      </div>
    </div>
  </div>

  <!-- TAB 5: LOCAL SEO -->
  <div id="local" class="tab">
    <h1 style="margin-bottom:1.5rem;">Local SEO &amp; Map Pack Performance</h1>
    <div class="grid g8-4" style="margin-bottom:1.5rem;">
      <div class="card">
        <h3>Google Map Pack Rankings</h3>
        <table id="map-table">
          <thead><tr><th>Keyword</th><th>Map Pack Position</th><th>Status</th></tr></thead>
          <tbody>
            <!-- Injected by JS -->
          </tbody>
        </table>
      </div>
      <div class="card"><h3>GMB Health Score</h3><div class="score-wrap" id="gmb-score-wrap"></div></div>
    </div>
    <div class="grid g6">
      <div class="card">
        <h3>Google Business Profile Checklist</h3>
        <ul class="check-list" id="gmb-checklist">
          <!-- Injected by JS -->
        </ul>
      </div>
      <div class="card">
        <h3>Bing Places Status</h3>
        <div style="border:2px dashed var(--accent);border-radius:8px;padding:1.5rem;margin-bottom:1rem;">
          <h4 style="color:var(--accent);margin-bottom:.5rem;">⚠️ STATUS: NEEDS CLAIMING</h4>
          <p style="font-size:.875rem;margin-bottom:.75rem;">Bing serves 6.3% of US searches — ~150+ potential monthly clicks for this niche.</p>
          <p style="font-size:.875rem;color:var(--muted);">Action: Claim at <strong>bingplaces.com</strong> — use exact NAP match from GMB.</p>
        </div>
        <ul class="action-list">
          <li>Use exact same business name, address, phone as GMB</li>
          <li>Upload same photos — Bing Copilot reads Places data</li>
          <li>Add all service categories available</li>
          <li>Bing Places verified = better Copilot AI citations</li>
        </ul>
      </div>
    </div>
  </div>
</div>

<script>
let dashboardData = null;
let rankChart = null;
let distChart = null;

async function loadData() {
  try {
    const response = await fetch('seo-data.json');
    dashboardData = await response.json();
    renderDashboard();
  } catch (e) {
    console.error('Error loading data:', e);
  }
}

function renderDashboard() {
  if (!dashboardData) return;

  // Top Bar Stats
  document.getElementById('top-stats').innerHTML = \`
    <div class="stat"><h4>Last Crawled</h4><div class="stat-val">\${dashboardData.lastCrawled}</div></div>
    <div class="stat"><h4>Pages Indexed</h4><div class="stat-val">\${dashboardData.pagesIndexed}</div></div>
    <div class="stat"><h4>Critical Issues</h4><div class="stat-val" style="color:#EF4444">\${dashboardData.criticalIssues}</div></div>
    <div class="stat"><h4>Opportunities</h4><div class="stat-val" style="color:var(--green)">\${dashboardData.opportunities}</div></div>
  \`;

  // Report Date
  document.getElementById('report-date').innerText = \`Report Date: \${dashboardData.lastCrawled}\`;

  // SEO Scorecards
  document.getElementById('seo-scorecards').innerHTML = \`
    <div class="card"><h3>Domain Authority</h3><div class="score-wrap"><div class="score">\${dashboardData.domainAuthority}</div><p style="color:var(--green)">+3 since last month</p></div></div>
    <div class="card"><h3>Backlinks</h3><div class="score-wrap"><div class="score">\${dashboardData.backlinks}</div><p style="color:var(--green)">Up from 31</p></div></div>
    <div class="card"><h3>Est. Organic Traffic</h3><div class="score-wrap"><div class="score">\${dashboardData.organicTraffic}</div><p style="color:var(--muted)">Sessions / Month</p></div></div>
  \`;

  // Keyword Table
  const kwBody = document.querySelector('#keyword-table tbody');
  kwBody.innerHTML = (dashboardData.keywordRankings || []).map(kw => {
    const change = kw.lastWeek - kw.position;
    const changeClass = change >= 0 ? 'up' : 'down';
    const changeIcon = change >= 0 ? '↑' : '↓';
    const highlightStyle = kw.highlight ? 'style="font-weight:800;color:var(--accent)"' : '';
    return \`
      <tr>
        <td>\${kw.keyword}</td>
        <td \${highlightStyle}>\${kw.position}</td>
        <td>\${kw.lastWeek}</td>
        <td class="\${changeClass}">\${change >= 0 ? '+' : ''}\${change} \${changeIcon}</td>
        <td>\${kw.volume}</td>
        <td>\${kw.difficulty}</td>
      </tr>
    \`;
  }).join('');

  // AIO Table
  const aioBody = document.querySelector('#aio-table tbody');
  aioBody.innerHTML = (dashboardData.aioCitations || []).map(item => \`
    <tr>
      <td>\${item.query}</td>
      <td><span class="tag tag-\${item.triggered.toLowerCase()}">\${item.triggered}</span></td>
      <td><span class="tag tag-\${item.cited === 'NO' ? 'no' : (item.cited === '—' ? 'mon' : 'yes')}">\${item.cited}</span></td>
      <td>\${item.action}</td>
    </tr>
  \`).join('');

  // AIO Score
  const aioScoreClass = dashboardData.aioScore < 20 ? 'red' : (dashboardData.aioScore < 50 ? 'yellow' : '');
  document.getElementById('aio-score-wrap').innerHTML = \`
    <div class="score \${aioScoreClass}">\${dashboardData.aioScore}</div>
    <p style="color:var(--muted)">\${dashboardData.aioScore < 30 ? 'Needs Improvement' : 'Growing'}</p>
  \`;

  // AEO Table
  const aeoBody = document.querySelector('#aeo-table tbody');
  aeoBody.innerHTML = (dashboardData.aeoSnippets || []).map(item => \`
    <tr>
      <td>\${item.query}</td>
      <td>\${item.type}</td>
      <td><span class="tag tag-\${item.status === 'Not Ranking' ? 'no' : 'yes'}">\${item.status}</span></td>
    </tr>
  \`).join('');

  // AEO Score
  const aeoScoreClass = dashboardData.aeoScore < 20 ? 'red' : (dashboardData.aeoScore < 50 ? 'yellow' : '');
  document.getElementById('aeo-score-wrap').innerHTML = \`
    <div class="score \${aeoScoreClass}">\${dashboardData.aeoScore}</div>
    <p style="color:var(--muted)">Building</p>
  \`;

  // PAA Table
  const paaBody = document.querySelector('#paa-table tbody');
  paaBody.innerHTML = (dashboardData.paaTracking || []).map(item => \`
    <tr>
      <td>\${item.question}</td>
      <td>\${item.boxExists}</td>
      <td><span class="tag tag-\${item.ranking === 'NO' ? 'no' : 'yes'}">\${item.ranking}</span></td>
    </tr>
  \`).join('');

  // GEO Table
  const geoBody = document.querySelector('#geo-table tbody');
  geoBody.innerHTML = (dashboardData.geoStatus || []).map(item => \`
    <tr>
      <td><b>\${item.engine}</b></td>
      <td>"\${item.query}"</td>
      <td><span class="tag tag-\${item.result.toLowerCase()}">\${item.result}</span><span class="llm-res">\${item.details}</span></td>
      <td>\${item.action}</td>
    </tr>
  \`).join('');

  // GEO Mini Score
  document.getElementById('geo-score-mini').innerHTML = \`
    <div class="score red" style="width:80px;height:80px;font-size:1.2rem;">\${dashboardData.geoScore}/100</div>
  \`;

  // Map Table
  const mapBody = document.querySelector('#map-table tbody');
  mapBody.innerHTML = (dashboardData.mapPackRankings || []).map(item => \`
    <tr>
      <td>\${item.keyword}</td>
      <td \${item.highlight ? 'style="font-weight:800;color:var(--green)"' : ''}>\${item.position}</td>
      <td><span class="tag tag-\${item.status === 'Active' ? 'yes' : 'mon'}">\${item.status}</span></td>
    </tr>
  \`).join('');

  // GMB Health Score
  const gmbScoreClass = dashboardData.gmbHealthScore < 40 ? 'red' : (dashboardData.gmbHealthScore < 70 ? 'yellow' : '');
  document.getElementById('gmb-score-wrap').innerHTML = \`
    <div class="score \${gmbScoreClass}">\${dashboardData.gmbHealthScore}</div>
    <p style="color:var(--muted)">Needs attention</p>
  \`;

  // GMB Checklist
  const gmbChecklist = document.getElementById('gmb-checklist');
  gmbChecklist.innerHTML = (dashboardData.gmbChecklist || []).map(item => \`
    <li>\${item.status === 'pass' ? '✅' : '❌'} \${item.item}</li>
  \`).join('');

  updateCharts();
}

function updateCharts() {
  if (rankChart) rankChart.destroy();
  if (distChart) distChart.destroy();

  rankChart = new Chart(document.getElementById('rankChart'), {
    type:'line',
    data:{
      labels: dashboardData.rankingProgress.labels,
      datasets: dashboardData.rankingProgress.datasets.map(ds => ({
        ...ds,
        backgroundColor: ds.borderColor + '1A',
        fill:true,
        tension:.4
      }))
    },
    options:{
      responsive:true,
      scales:{
        y:{reverse:true,suggestedMin:1,grid:{color:'#334155'},ticks:{color:'#94A3B8'}},
        x:{grid:{color:'#334155'},ticks:{color:'#94A3B8'}}
      },
      plugins:{legend:{labels:{color:'#F8FAFC'}}}
    }
  });

  distChart = new Chart(document.getElementById('distChart'), {
    type:'doughnut',
    data:{
      labels:['Top 3','4-10','11-20','21-50'],
      datasets:[{data: dashboardData.positionDistribution, backgroundColor:['#E8450A','#1A3A5C','#334155','#0F172A'],borderWidth:0}]
    },
    options:{
      responsive:true,
      plugins:{
        legend:{position:'bottom',labels:{color:'#F8FAFC',padding:12}}
      }
    }
  });
}

function showTab(id, btn) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  btn.classList.add('active');
}

function startRescan() {
  const btn = document.getElementById('rescan-btn');
  btn.classList.add('scanning');
  btn.disabled = true;
  setTimeout(() => {
    location.reload();
  }, 2000);
}

window.addEventListener('load', loadData);
</script>
</body>
</html>\`;

fs.writeFileSync('seo-dashboard.html', html, 'utf8');
console.log('seo-dashboard.html generated.');

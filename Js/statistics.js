/* ============================================================
   Statistics
   ============================================================ */
let statsFilter = { from:"", to:"", range:"all" };
const STATS_ITEMS = [
  { key:"kpiFlights", label:"Total flights" },
  { key:"kpiPassengers", label:"Total passengers" },
  { key:"kpiMeals", label:"Meals loaded" },
  { key:"kpiLateCloses", label:"Late closes" },
  { key:"flightsOverTime", label:"Flights over time" },
  { key:"summaryStatus", label:"Summary status" },
  { key:"topFlightNumbers", label:"Top flight numbers" },
  { key:"paxOverTime", label:"Passengers over time" },
  { key:"paxSplit", label:"Passenger split" },
  { key:"specialsBreakdown", label:"Specials breakdown" },
  { key:"closeBreakdown", label:"On-time vs late" },
  { key:"topRegistrations", label:"Top registrations" }
];
const STATS_VIS_KEY = "ham_opshub_stats_vis_v1";
function getStatsVisibility(){
  const def = {}; STATS_ITEMS.forEach(x => def[x.key] = true);
  try { const saved = JSON.parse(localStorage.getItem(STATS_VIS_KEY) || "{}"); return { ...def, ...saved }; }
  catch(e){ return def; }
}
function setStatsVisibility(patch){
  const cur = getStatsVisibility();
  const next = { ...cur, ...patch };
  localStorage.setItem(STATS_VIS_KEY, JSON.stringify(next));
}
function toggleStatsItem(key){
  const cur = getStatsVisibility();
  setStatsVisibility({ [key]: !cur[key] });
  renderStats();
}
function setAllStatsItems(state){
  const patch = {};
  STATS_ITEMS.forEach(x => patch[x.key] = state);
  setStatsVisibility(patch);
  renderStats();
}
function statsVisPanelHtml(){
  
  
const vis = getStatsVisibility();
  return `<div class="card" style="margin-bottom:20px;"><div class="card-body">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:12px;">
      <div style="font-size:12px;font-weight:700;color:var(--ink-3);text-transform:uppercase;letter-spacing:.05em;">Customize view</div>
      <div style="display:flex;gap:6px;">
        <button class="btn btn-secondary btn-sm" onclick="setAllStatsItems(true)">All on</button>
        <button class="btn btn-secondary btn-sm" onclick="setAllStatsItems(false)">All off</button>
      </div>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;">
      ${STATS_ITEMS.map(it => `<button type="button" class="stats-vis-chip ${vis[it.key]?"on":""}" onclick="toggleStatsItem('${it.key}')">${esc(it.label)}</button>`).join("")}
    </div>
  </div></div>`;
}
function setStatsRange(range){
  statsFilter.range = range;
  const today = new Date(); const end = todayISO(); let from = "";
  if(range === "7d"){ const d = new Date(); d.setDate(d.getDate() - 6); from = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
  else if(range === "30d"){ const d = new Date(); d.setDate(d.getDate() - 29); from = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
  else if(range === "90d"){ const d = new Date(); d.setDate(d.getDate() - 89); from = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
  else if(range === "ytd"){ from = `${today.getFullYear()}-01-01`; }
  else if(range === "all"){ from = ""; }
  else { return; }
  statsFilter.from = from; statsFilter.to = range === "all" ? "" : end;
  renderStats();
}
const CHART_COLORS = ["#C8102E","#1D5C9B","#1B7A4B","#B66A00","#8C0B20","#6DAEE8","#E3A93B","#4CC38A","#7A8492","#A6AEBA"];
function svgBarChart(data){
  if(!data.length) return `<div class="empty-state" style="padding:24px;"><p>No data.</p></div>`;
  const W=640,H=300,P={t:20,r:20,b:60,l:56},cW=W-P.l-P.r,cH=H-P.t-P.b;
  const max=Math.max(1,...data.map(d=>d.value)),step=cW/data.length,barW=Math.min(60,step*0.65);
  let g="",b="",l="";
  for(let i=0;i<=4;i++){const y=P.t+cH*(i/4),val=max*(1-i/4);g+=`<line x1="${P.l}" y1="${y}" x2="${P.l+cW}" y2="${y}" stroke="var(--border)" stroke-dasharray="3 3"/>`;g+=`<text x="${P.l-8}" y="${y+4}" text-anchor="end" font-size="10" fill="var(--ink-3)">${Math.round(val)}</text>`;}
  data.forEach((d,i)=>{const x=P.l+step*i+(step-barW)/2,h=(d.value/max)*cH,y=P.t+cH-h,c=CHART_COLORS[i%CHART_COLORS.length];b+=`<rect x="${x}" y="${y}" width="${barW}" height="${h}" fill="${c}" rx="4"/>`;const lY=H-P.b+16,sl=String(d.label).length>12?String(d.label).slice(0,11)+"…":d.label;l+=`<text x="${x+barW/2}" y="${lY}" text-anchor="middle" font-size="10" fill="var(--ink-3)" transform="rotate(-25 ${x+barW/2} ${lY})">${esc(sl)}</text>`;});
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;">${g}${b}${l}</svg>`;
}
function svgHorizontalBarChart(data){
  if(!data.length) return `<div class="empty-state" style="padding:24px;"><p>No data.</p></div>`;
  const rowH=32,W=640,H=data.length*rowH+20,P={l:140,r:60},cW=W-P.l-P.r,max=Math.max(1,...data.map(d=>d.value));
  let rows="";
  data.forEach((d,i)=>{const y=10+i*rowH,bw=(d.value/max)*cW,c=CHART_COLORS[i%CHART_COLORS.length];rows+=`<text x="${P.l-10}" y="${y+rowH/2+4}" text-anchor="end" font-size="12" fill="var(--ink-2)">${esc(String(d.label).length>20?String(d.label).slice(0,19)+"…":d.label)}</text>`;rows+=`<rect x="${P.l}" y="${y+6}" width="${bw}" height="${rowH-12}" fill="${c}" rx="4"/>`;rows+=`<text x="${P.l+bw+8}" y="${y+rowH/2+4}" font-size="12" font-weight="600" fill="var(--ink)">${d.value}</text>`;});
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;">${rows}</svg>`;
}
function svgLineChart(data){
  if(!data.length) return `<div class="empty-state" style="padding:24px;"><p>No data.</p></div>`;
  const W=640,H=300,P={t:20,r:20,b:50,l:56},cW=W-P.l-P.r,cH=H-P.t-P.b,max=Math.max(1,...data.map(d=>d.value)),step=data.length>1?cW/(data.length-1):0;
  let g="",dots="",l="";
  for(let i=0;i<=4;i++){const y=P.t+cH*(i/4),val=max*(1-i/4);g+=`<line x1="${P.l}" y1="${y}" x2="${P.l+cW}" y2="${y}" stroke="var(--border)" stroke-dasharray="3 3"/>`;g+=`<text x="${P.l-8}" y="${y+4}" text-anchor="end" font-size="10" fill="var(--ink-3)">${Math.round(val)}</text>`;}
  const pts=data.map((d,i)=>({x:P.l+step*i,y:P.t+cH-(d.value/max)*cH,...d}));
  const pathD=pts.map((p,i)=>`${i===0?"M":"L"} ${p.x} ${p.y}`).join(" ");
  const areaD=pts.length>1?`${pathD} L ${pts[pts.length-1].x} ${P.t+cH} L ${pts[0].x} ${P.t+cH} Z`:"";
  pts.forEach(p=>{dots+=`<circle cx="${p.x}" cy="${p.y}" r="3.5" fill="var(--brand)" stroke="#fff" stroke-width="1.5"/>`;});
  const labStep=Math.max(1,Math.ceil(data.length/8));
  data.forEach((d,i)=>{if(i%labStep!==0&&i!==data.length-1)return;const x=P.l+step*i,y=H-P.b+16;l+=`<text x="${x}" y="${y}" text-anchor="middle" font-size="10" fill="var(--ink-3)">${esc(d.label)}</text>`;});
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;">${g}${areaD?`<path d="${areaD}" fill="var(--brand)" opacity="0.1"/>`:""}${pts.length>1?`<path d="${pathD}" fill="none" stroke="var(--brand)" stroke-width="2"/>`:""}${dots}${l}</svg>`;
}
function svgDonutChart(data, opts){
  if(!data.length) return `<div class="empty-state" style="padding:24px;"><p>No data.</p></div>`;
  const W=280,H=280,cx=W/2,cy=H/2,r=110,rIn=66,total=data.reduce((s,d)=>s+d.value,0)||1;
  let paths="",legend="",angle=-Math.PI/2;
  data.forEach((d,i)=>{
    const slice=(d.value/total)*Math.PI*2;
    const x1=cx+r*Math.cos(angle),y1=cy+r*Math.sin(angle);
    const x2=cx+r*Math.cos(angle+slice),y2=cy+r*Math.sin(angle+slice);
    const x3=cx+rIn*Math.cos(angle+slice),y3=cy+rIn*Math.sin(angle+slice);
    const x4=cx+rIn*Math.cos(angle),y4=cy+rIn*Math.sin(angle);
    const large=slice>Math.PI?1:0;const color=opts&&opts.colors?opts.colors[i%opts.colors.length]:CHART_COLORS[i%CHART_COLORS.length];
    paths+=`<path d="M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${rIn} ${rIn} 0 ${large} 0 ${x4} ${y4} Z" fill="${color}"/>`;
    angle+=slice;
  });
  const totalLabel=total%1===0?total:total.toFixed(1);
  paths+=`<text x="${cx}" y="${cy-4}" text-anchor="middle" font-size="26" font-weight="700" fill="var(--ink)">${totalLabel}</text>`;
  paths+=`<text x="${cx}" y="${cy+16}" text-anchor="middle" font-size="11" fill="var(--ink-3)">TOTAL</text>`;
  data.forEach((d,i)=>{const color=opts&&opts.colors?opts.colors[i%opts.colors.length]:CHART_COLORS[i%CHART_COLORS.length];const pct=Math.round(d.value/total*100);legend+=`<div class="item"><span class="dot" style="background:${color}"></span><span>${esc(d.label)} · <b>${d.value}</b> (${pct}%)</span></div>`;});
  return `<div style="display:flex;flex-direction:column;align-items:center;"><svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:280px;height:auto;">${paths}</svg><div class="chart-legend">${legend}</div></div>`;
}
function renderChart(type, data, opts){
  if(type === "bar") return svgBarChart(data);
  if(type === "hbar") return svgHorizontalBarChart(data);
  if(type === "line") return svgLineChart(data);
  if(type === "donut") return svgDonutChart(data, opts);
  if(type === "table"){
    if(!data.length) return `<div class="empty-state" style="padding:24px;"><p>No data.</p></div>`;
    const max = Math.max(1, ...data.map(d => d.value));
    return `<table class="stats-table"><thead><tr><th>Label</th><th class="num">Value</th><th>Distribution</th></tr></thead><tbody>${data.map(d => `<tr><td>${esc(d.label)}</td><td class="num">${d.value}</td><td><div class="bar"><i style="width:${(d.value/max)*100}%"></i></div></td></tr>`).join("")}</tbody></table>`;
  }
  return "";
}
function computeStats(flights, formsAll, from, to){
  const filtered = flights.filter(f => inRange(f.date, from, to));
  const formsById = {}; for(const fm of formsAll){ if(!formsById[fm.flightId]) formsById[fm.flightId] = {}; formsById[fm.flightId][fm.phase] = fm; }
  const stats = { totalFlights: filtered.length, completedCheckins: 0, totalC: 0, totalY: 0, totalInf: 0, totalPax: 0, totalCMeal: 0, totalYMeal: 0, totalMeals: 0, totalCBA: 0, totalLoaded: 0, lateClose: 0, onTimeClose: 0, withFlightPlan: 0, prm: 0, staff: 0, upgrade: 0, other: 0, totalSpecials: 0, noMealTotal: 0, byFlightNumber: {}, byRegistration: {}, byRoute: {}, byAircraft: {}, byMonth: {}, byDate: {} };
  for(const f of filtered){
    const fm = formsById[f.id] && formsById[f.id].checkin; const d = (fm && fm.data) || {}; if(fm && fm.status === "done") stats.completedCheckins++;
    const c = Number(d.cPax)||0, y = Number(d.yPax)||0, inf = Number(d.infPax)||0;
    stats.totalC += c; stats.totalY += y; stats.totalInf += inf; stats.totalPax += (c+y+inf);
    stats.totalCMeal += Number(d.cMeal)||0; stats.totalYMeal += Number(d.yMeal)||0;
    stats.totalCBA += Number(d.cba)||0; stats.totalLoaded += Number(d.loaded)||0;
    if(d.closeTime && f.std){ const diff = closeDiff(d.closeTime, f.std); if(diff !== null){ if(diff >= 60) stats.onTimeClose++; else stats.lateClose++; } }
    if(d.reqFp === "YES") stats.withFlightPlan++;
    stats.noMealTotal += (d.noMealC||[]).filter(r=>r.seat).length + (d.noMealY||[]).filter(r=>r.seat).length;
    for(const s of (d.specials || [])){ stats.totalSpecials++; if(s.type === "PRM") stats.prm += Number(s.qty)||1; else if(s.type === "Staff") stats.staff += Number(s.qty)||1; else if(s.type === "Upgrade") stats.upgrade += Number(s.qty)||1; else stats.other += Number(s.qty)||1; }
    const key = f.flightNumber; if(!stats.byFlightNumber[key]) stats.byFlightNumber[key] = { flightNumber:key, flights:0, pax:0 }; stats.byFlightNumber[key].flights++; stats.byFlightNumber[key].pax += (c+y+inf);
    const reg = f.registration || "(none)"; if(!stats.byRegistration[reg]) stats.byRegistration[reg] = { reg, flights:0, pax:0 }; stats.byRegistration[reg].flights++; stats.byRegistration[reg].pax += (c+y+inf);
    const route = `${f.routeFrom||"?"} → ${f.routeTo||"?"}`; if(!stats.byRoute[route]) stats.byRoute[route] = { route, flights:0 }; stats.byRoute[route].flights++;
    const ac = (f.aircraftType||"") + (f.typeCode ? " " + f.typeCode : "") || "(none)"; if(!stats.byAircraft[ac]) stats.byAircraft[ac] = { type:ac, flights:0 }; stats.byAircraft[ac].flights++;
    const month = (f.date||"").slice(0,7); if(!stats.byMonth[month]) stats.byMonth[month] = { month, flights:0, pax:0 }; stats.byMonth[month].flights++; stats.byMonth[month].pax += (c+y+inf);
    if(!stats.byDate[f.date]) stats.byDate[f.date] = { date:f.date, flights:0, pax:0 }; stats.byDate[f.date].flights++; stats.byDate[f.date].pax += (c+y+inf);
  }
  stats.totalMeals = stats.totalCMeal + stats.totalYMeal;
  return stats;
}
async function renderStats(){
  const host = $("statsContent");
  const flights = await listFlights(); const formsAll = await dbAll("forms");
  const stats = computeStats(flights, formsAll, statsFilter.from, statsFilter.to);
  const avgPax = stats.completedCheckins ? Math.round(stats.totalPax / stats.completedCheckins) : 0;
  const lateRate = (stats.lateClose + stats.onTimeClose) ? Math.round((stats.lateClose / (stats.lateClose + stats.onTimeClose)) * 100) : 0;
  const byDateSorted = Object.values(stats.byDate).sort((a,b) => a.date.localeCompare(b.date));
  const flightsOverTime = byDateSorted.map(x => ({ label: x.date.slice(5), value: x.flights }));
  const paxOverTime = byDateSorted.map(x => ({ label: x.date.slice(5), value: x.pax }));
  const topFlightNumbers = Object.values(stats.byFlightNumber).sort((a,b) => b.flights - a.flights).slice(0, 8).map(x => ({ label: x.flightNumber, value: x.flights }));
  const topRegistrations = Object.values(stats.byRegistration).sort((a,b) => b.flights - a.flights).slice(0, 8).map(x => ({ label: x.reg === "(none)" ? "–" : displayReg(x.reg), value: x.flights }));
  const specialsBreakdown = [ { label: "PRM", value: stats.prm }, { label: "Staff", value: stats.staff }, { label: "Upgrades", value: stats.upgrade }, { label: "Other", value: stats.other } ].filter(x => x.value > 0);
  const statusBreakdown = [ { label: "Completed", value: stats.completedCheckins }, { label: "Open", value: stats.totalFlights - stats.completedCheckins } ].filter(x => x.value > 0);
  const closeBreakdown = [ { label: "On-time", value: stats.onTimeClose }, { label: "Late", value: stats.lateClose } ].filter(x => x.value > 0);
  const paxSplit = [ { label: "Business", value: stats.totalC }, { label: "Economy", value: stats.totalY }, { label: "Infants", value: stats.totalInf } ].filter(x => x.value > 0);

const activeRange = statsFilter.range || "all";
const vis = getStatsVisibility();
const anyKpiOn = vis.kpiFlights || vis.kpiPassengers || vis.kpiMeals || vis.kpiLateCloses;
const anyChartOn = vis.flightsOverTime || vis.summaryStatus || vis.topFlightNumbers || vis.paxOverTime || vis.paxSplit || vis.specialsBreakdown || vis.closeBreakdown || vis.topRegistrations;
  host.innerHTML = `
    <div style="margin-bottom:20px;"><h2 style="font-size:22px;font-weight:650;">Statistics</h2></div>
    <div class="card" style="margin-bottom:20px;"><div class="card-body">
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px;align-items:center;">
        <select class="stats-range-select" onchange="setStatsRange(this.value)">
          <option value="7d" ${activeRange==="7d"?"selected":""}>Last 7 days</option>
          <option value="30d" ${activeRange==="30d"?"selected":""}>Last 30 days</option>
          <option value="90d" ${activeRange==="90d"?"selected":""}>Last 90 days</option>
          <option value="ytd" ${activeRange==="ytd"?"selected":""}>Year to date</option>
          <option value="all" ${activeRange==="all"?"selected":""}>All time</option>
        </select>
      </div>
      <div class="filter-bar" style="grid-template-columns:1fr 1fr auto;"><div class="filter-field"><label>From</label><input type="text" id="stFrom" value="${esc(formatDateInput(statsFilter.from))}" inputmode="numeric" placeholder="DD.MM.YYYY" maxlength="10"></div><div class="filter-field"><label>To</label><input type="text" id="stTo" value="${esc(formatDateInput(statsFilter.to))}" inputmode="numeric" placeholder="DD.MM.YYYY" maxlength="10"></div><div class="filter-field"><label>&nbsp;</label><div style="display:flex;gap:8px;"><button class="btn btn-secondary btn-sm" onclick="resetStatsFilter()">Reset</button><button class="btn btn-primary btn-sm" onclick="applyStatsFilter()">Apply</button></div></div></div>
    </div></div>
    ${statsVisPanelHtml()}<div class="sec-head" style="display:${anyKpiOn?'':'none'}"><h3>Key metrics</h3></div>
    <div class="kpis">
      <div class="kpi brand" style="display:${vis.kpiFlights?'':'none'}"><div class="k-label">Total flights</div><div class="k-value">${stats.totalFlights}</div><div class="k-sub">${stats.completedCheckins} with summary</div></div>
      <div class="kpi" style="display:${vis.kpiPassengers?'':'none'}"><div class="k-label">Total passengers</div><div class="k-value">${stats.totalPax}</div><div class="k-sub">Avg ${avgPax} per completed flight</div></div>
      <div class="kpi" style="display:${vis.kpiMeals?'':'none'}"><div class="k-label">Meals loaded</div><div class="k-value">${stats.totalMeals}</div><div class="k-sub">${stats.totalCMeal}C / ${stats.totalYMeal}Y</div></div>
      <div class="kpi" style="display:${vis.kpiLateCloses?'':'none'}"><div class="k-label">Late closes</div><div class="k-value">${stats.lateClose}</div><div class="k-sub">${lateRate}% of all summaries</div></div>
    </div>
    ${anyChartOn ? `<div class="sec-head"><h3>Visual overview</h3></div>
<div class="charts-grid">
  ${ vis.flightsOverTime ? `<div class="chart-card"><h3>Flights over time</h3>${renderChart("line", flightsOverTime)}</div>` : "" }
  ${ vis.summaryStatus ? `<div class="chart-card"><h3>Summary status</h3>${renderChart("donut", statusBreakdown, { colors:["#1B7A4B","#B66A00"] })}</div>` : "" }
  ${ vis.topFlightNumbers ? `<div class="chart-card"><h3>Top flight numbers</h3>${renderChart("hbar", topFlightNumbers)}</div>` : "" }
  ${ vis.paxOverTime ? `<div class="chart-card"><h3>Passengers over time</h3>${renderChart("line", paxOverTime)}</div>` : "" }
  ${ vis.paxSplit ? `<div class="chart-card"><h3>Passenger split</h3>${renderChart("donut", paxSplit, { colors:["#C8102E","#1D5C9B","#B66A00"] })}</div>` : "" }
  ${ vis.specialsBreakdown ? `<div class="chart-card"><h3>Specials breakdown</h3>${renderChart("donut", specialsBreakdown)}</div>` : "" }
  ${ vis.closeBreakdown ? `<div class="chart-card"><h3>On-time vs late closes</h3>${renderChart("donut", closeBreakdown, { colors:["#1B7A4B","#C0392B"] })}</div>` : "" }
  ${ vis.topRegistrations ? `<div class="chart-card"><h3>Top registrations</h3>${renderChart("hbar", topRegistrations)}</div>` : "" }
</div>` : ""
  }
    ${!stats.totalFlights ? `<div class="card"><div class="card-body"><div class="empty-state"><h3>No data yet</h3></div></div></div>` : ""}
  `;
  wireDateInput($("stFrom")); wireDateInput($("stTo"));
}
function applyStatsFilter(){ statsFilter.from = parseDateInput($("stFrom").value); statsFilter.to = parseDateInput($("stTo").value); statsFilter.range = "custom"; renderStats(); }
function resetStatsFilter(){ statsFilter = { from:"", to:"", range:"all" }; renderStats(); }

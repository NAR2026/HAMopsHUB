/* ============================================================
   Database
   ============================================================ */
let _db = null;
function openDB(){ return new Promise((resolve,reject) => {
  const req = indexedDB.open(DB_NAME, DB_VERSION);
  req.onupgradeneeded = e => {
    const db = e.target.result;
    if(!db.objectStoreNames.contains("flights")){ const s = db.createObjectStore("flights", { keyPath:"id" }); s.createIndex("date","date"); s.createIndex("flightNumber","flightNumber"); s.createIndex("dateFlight","dateFlight", { unique:true }); }
    if(!db.objectStoreNames.contains("forms")){ const s = db.createObjectStore("forms", { keyPath:"id" }); s.createIndex("flightId","flightId"); s.createIndex("flightPhase","flightPhase", { unique:true }); }
    if(!db.objectStoreNames.contains("audit")){ const s = db.createObjectStore("audit", { keyPath:"id" }); s.createIndex("flightId","flightId"); s.createIndex("timestamp","timestamp"); }
    if(!db.objectStoreNames.contains("settings")) db.createObjectStore("settings", { keyPath:"key" });
  };
  req.onsuccess = () => { _db = req.result; resolve(_db); };
  req.onerror = () => reject(req.error);
}); }
async function dbGet(s,k){ return new Promise((res,rej)=>{ const r=_db.transaction(s,"readonly").objectStore(s).get(k); r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error); }); }
async function dbAll(s){ return new Promise((res,rej)=>{ const r=_db.transaction(s,"readonly").objectStore(s).getAll(); r.onsuccess=()=>res(r.result||[]); r.onerror=()=>rej(r.error); }); }
async function dbPut(s,o){ return new Promise((res,rej)=>{ const tx=_db.transaction(s,"readwrite"); tx.objectStore(s).put(o); tx.oncomplete=()=>res(); tx.onerror=()=>rej(tx.error); }); }
async function dbDelete(s,k){ return new Promise((res,rej)=>{ const tx=_db.transaction(s,"readwrite"); tx.objectStore(s).delete(k); tx.oncomplete=()=>res(); tx.onerror=()=>rej(tx.error); }); }
async function getSetting(k,f){ const r = await dbGet("settings", k); return r ? r.value : f; }
async function setSetting(k,v){ return dbPut("settings", { key:k, value:v }); }

async function loadMasterCache(){
  for(const k of ["prmCodes","staffCodes","otherTypes","gates","ahsAgents","tkAgents"]){ window.__master[k] = await getSetting(k, []); }
  const flights = await dbAll("flights");
  const fleet = await getSetting("aircraftFleet", []);
  const schedules = await getSetting("flightSchedules", []);
  const fnSet = new Set(); schedules.forEach(s => s.flightNumber && fnSet.add(s.flightNumber)); flights.forEach(f => f.flightNumber && fnSet.add(f.flightNumber));
  const regSet = new Set(); fleet.forEach(a => a.registration && regSet.add(a.registration)); flights.forEach(f => f.registration && regSet.add(f.registration));
  const acSet = new Set(); fleet.forEach(a => a.type && acSet.add(a.type)); flights.forEach(f => f.aircraftType && acSet.add(f.aircraftType));
  const tcSet = new Set(); fleet.forEach(a => a.typeCode && tcSet.add(a.typeCode)); flights.forEach(f => f.typeCode && tcSet.add(f.typeCode));
  window.__master.flightNumbers = [...fnSet].sort();
  window.__master.registrations = [...regSet].sort();
  window.__master.aircraftTypes = [...acSet].sort();
  window.__master.typeCodes = [...tcSet].sort();
}
function getMasterList(key){ return (window.__master && window.__master[key]) || []; }

let __dlSeq = 0;
function datalistInput(id, value, list, placeholder, extraAttrs){
  const sorted = [...new Set((list||[]).filter(v => v != null && v !== ""))].map(v => String(v)).sort((a,b) => a.localeCompare(b, undefined, { numeric:true, sensitivity:"base" }));
  if(!window.__comboLists) window.__comboLists = {};
  window.__comboLists[id] = sorted;
  return `<input type="text" id="${esc(id)}" value="${esc(value||"")}" placeholder="${esc(placeholder||"")}" autocomplete="off" autocapitalize="off" spellcheck="false" data-combo="1" ${extraAttrs||""}>`;
}
function closeAllComboLists(){ document.querySelectorAll(".combo-list-fixed").forEach(el => el.remove()); }
function renderComboListFor(inp){
  if(!inp || !inp.dataset || !inp.dataset.combo) return;
  if(inp.__comboSuppress) return;

  closeAllComboLists();

  const id = inp.id;
  const list = (window.__comboLists && window.__comboLists[id]) || [];
  if(!list.length) return;

  const raw = String(inp.value || "").trim();
  const q = raw.toLowerCase();

  // Treffer priorisieren: startsWith vor includes
  let matches;
  if(q){
    const starts = [], includes = [];
    for(const v of list){
      const lv = v.toLowerCase();
      if(lv.startsWith(q)) starts.push(v);
      else if(lv.includes(q)) includes.push(v);
      if(starts.length >= 5) break;
    }
    matches = [...starts, ...includes].slice(0, 5);
  } else {
    matches = list.slice(0, 5);
  }
  if(!matches.length) return;

  // Wenn nur ein exakter Treffer übrig ist, nicht öffnen
  if(matches.length === 1 && matches[0].toLowerCase() === q) return;

  const rect = inp.getBoundingClientRect();
  const vh = (window.visualViewport && window.visualViewport.height) || window.innerHeight;
  const vw = (window.visualViewport && window.visualViewport.width) || window.innerWidth;

  const itemH = 42;
  const listMaxH = 280;
  const estH = Math.min(matches.length * itemH + 8, listMaxH);
  const spaceBelow = vh - rect.bottom;
  const spaceAbove = rect.top;
  const flipUp = spaceBelow < estH + 8 && spaceAbove > spaceBelow;

  const width = Math.max(rect.width, 180);
  const left = Math.max(8, Math.min(rect.left, vw - width - 8));

  const listEl = document.createElement("div");
  listEl.className = "combo-list-fixed";
  listEl.style.position = "fixed";
  listEl.style.left = left + "px";
  listEl.style.width = width + "px";
  listEl.style.zIndex = "9999";
  listEl.style.maxHeight = listMaxH + "px";
  if(flipUp){
    listEl.dataset.flip = "up";
    listEl.style.bottom = Math.max(8, vh - rect.top + 4) + "px";
    listEl.style.top = "auto";
  } else {
    listEl.style.top = (rect.bottom + 4) + "px";
    listEl.style.bottom = "auto";
  }

  listEl.innerHTML = matches.map(v => {
    const safe = esc(v);
    let html = safe;
    if(q){
      const lv = v.toLowerCase();
      const idx = lv.indexOf(q);
      if(idx >= 0){
        html = esc(v.slice(0, idx))
             + '<mark class="combo-mark">' + esc(v.slice(idx, idx + q.length)) + '</mark>'
             + esc(v.slice(idx + q.length));
      }
    }
    return `<div class="combo-item" data-value="${safe}">${html}</div>`;
  }).join("");

  document.body.appendChild(listEl);

 const selectItem = it => {
  if(inp.__comboSuppress) return;
  inp.__comboSuppress = true;
  inp.value = it.dataset.value;
  inp.dispatchEvent(new Event("input", { bubbles:true }));
  inp.__comboSuppress = false;
  closeAllComboLists();
  try { inp.focus({ preventScroll:true }); } catch(e){ inp.focus(); }
};
const preventBlur = ev => { ev.preventDefault(); };
listEl.addEventListener("pointerdown", ev => {
  preventBlur(ev);
  ev.stopPropagation();
  const it = ev.target.closest(".combo-item");
  if(!it) return;
  selectItem(it);
});
listEl.addEventListener("mousedown", preventBlur);
listEl.addEventListener("touchstart", preventBlur, { passive:false });
  listEl.addEventListener("click", ev => { if(!ev.target || !ev.target.closest) return; const it0 = ev.target.closest(".combo-item"); if(!it0 || !document.body.contains(it0)) return; if(inp.__comboSuppress) return; selectItem(it0); return;
    const it = ev.target.closest(".combo-item");
    if(!it) return;
    ev.preventDefault();
    ev.stopPropagation();
    inp.__comboSuppress = true;
    inp.value = it.dataset.value;
    inp.dispatchEvent(new Event("input", { bubbles:true }));
    inp.__comboSuppress = false;
    closeAllComboLists();
    try { inp.focus({ preventScroll:true }); } catch(e){ inp.focus(); }
  });
}
document.addEventListener("focusin", e => {
  const inp = e.target.closest && e.target.closest("input[data-combo]");
  if(!inp || inp.__comboSuppress) return;
  renderComboListFor(inp);
});
document.addEventListener("input", e => {
  const inp = e.target.closest && e.target.closest("input[data-combo]");
  if(!inp || inp.__comboSuppress) return;
  renderComboListFor(inp);
});
document.addEventListener("click", e => {
  if(!e.target.closest){ closeAllComboLists(); return; }
  if(e.target.closest("input[data-combo]")) return;
  if(e.target.closest(".combo-list-fixed")) return;
  closeAllComboLists();
});
document.addEventListener("keydown", e => {
  if(e.key === "Escape") closeAllComboLists();
});
window.addEventListener("scroll", e => {
  const t = e.target;
  if(t && t.classList && t.classList.contains("combo-list-fixed")) return;
  if(t && t.closest && t.closest(".combo-list-fixed")) return;
  closeAllComboLists();
}, true);
if(window.visualViewport){
  window.visualViewport.addEventListener("resize", () => {
    const open = document.querySelector("input[data-combo]:focus");
    if(open) setTimeout(() => renderComboListFor(open), 60);
  });
}
window.addEventListener("resize", closeAllComboLists);

async function audit(flightId, action, extra = {}){
  const e = { id: uid("audit"), flightId, action, field: extra.field||null, oldValue: extra.oldValue != null ? String(extra.oldValue) : null, newValue: extra.newValue != null ? String(extra.newValue) : null, employee: extra.employee||"System", timestamp: nowISO() };
  await dbPut("audit", e); return e;
}

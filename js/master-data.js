/* ============================================================
   Master Data
   ============================================================ */
const MD_OPEN_KEY = "ham_opshub_md_open_v1";
function getMdOpenState(){ try { return JSON.parse(localStorage.getItem(MD_OPEN_KEY) || "{}"); } catch(e){ return {}; } }
function setMdOpenState(s){ localStorage.setItem(MD_OPEN_KEY, JSON.stringify(s)); }
const ICONS = {
  fleet:`<svg viewBox="0 0 24 24"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>`,
  schedule:`<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/></svg>`,
  gates:`<svg viewBox="0 0 24 24"><path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16"/><path d="M2 21h20"/><circle cx="15" cy="12" r="1"/></svg>`,
  people:`<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  prm:`<svg viewBox="0 0 24 24"><circle cx="10" cy="4" r="2"/><path d="M10 6v8h6l3 7"/><path d="M7 14a5 5 0 0 0 10 0"/><circle cx="18" cy="19" r="2"/></svg>`,
  staff:`<svg viewBox="0 0 24 24"><path d="M12 3a4 4 0 0 0-4 4v1H6a2 2 0 0 0-2 2v3h2v7a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-7h2v-3a2 2 0 0 0-2-2h-2V7a4 4 0 0 0-4-4z"/><circle cx="12" cy="9" r="1.6"/><path d="M9 20v-3h6v3"/></svg>`,
  other:`<svg viewBox="0 0 24 24"><path d="M20.6 13.4 12 22l-9-9V4h9l8.6 8.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/></svg>`,
  data:`<svg viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5"/><path d="M3 12c0 1.7 4 3 9 3s9-1.3 9-3"/></svg>`,
  edit:`<svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>`,
  trash:`<svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6"/></svg>`,
  warn:`<svg viewBox="0 0 24 24"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/></svg>`
};
async function renderMasterData(){
  const host = $("masterDataContent");
  const fleet = await getSetting("aircraftFleet", []); const schedules = await getSetting("flightSchedules", []);
  const gates = await getSetting("gates", []); const ahs = await getSetting("ahsAgents", []);
  const tkAgents = await getSetting("tkAgents", []); const prm = await getSetting("prmCodes", []);
  const staff = await getSetting("staffCodes", []); const other = await getSetting("otherTypes", []);
  const msgS = await getSetting("messageSettings", { useEmoji: true });
  const open = getMdOpenState(); const isOpen = k => !!open[k];
  const chev = `<span class="chev"><svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg></span>`;
  const closeBtn = `<button class="close-btn" onclick="closeSection(this,event)"><svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg></button>`;
  const admin = isAdminMode();
  host.innerHTML = `
    <div style="margin-bottom:20px;"><h2 style="font-size:22px;font-weight:650;">Master Data</h2></div>
    <details class="md-section" data-md="schedules" ${isOpen("schedules")?"open":""}><summary><span class="md-icon">${ICONS.schedule}</span><span class="md-title">Flight Numbers</span><span class="md-count">${schedules.length}</span>${closeBtn}${chev}</summary><div class="md-body"><div class="md-info">Your saved flight numbers with STD/STA and operating days. Used to generate multiple flights at once.</div>${schedules.map((s,i) => `<div class="md-row"><div class="grow"><div class="main">${esc(s.flightNumber)} <span style="color:var(--ink-3);font-size:12px;margin-left:6px;">${esc(s.routeFrom)} → ${esc(s.routeTo)}</span></div><div class="sub">STD ${esc(fmtTimeShort(s.std))} · STA ${esc(fmtTimeShort(s.sta))}${s.validFrom?` · valid ${esc(fmtDate(s.validFrom))} – ${esc(fmtDate(s.validTo))}`:" · permanent"}</div></div><div class="actions"><button class="action-btn" onclick="openEditScheduleModal(${i})" title="Edit">${ICONS.edit}</button><button class="action-btn danger" onclick="removeSchedule(${i})" title="Delete">${ICONS.trash}</button></div></div>`).join("") || `<div style="color:var(--ink-3);font-size:13px;padding:8px 0;">No flight numbers yet.</div>`}<div class="md-add"><button class="btn btn-secondary btn-sm" onclick="openAddScheduleModal()">Add Flight Number</button><button class="btn btn-primary btn-sm" onclick="openGenerateFlightsModal()" ${schedules.length?"":"disabled"}>Generate Flights</button></div></div></details>
    <details class="md-section" data-md="fleet" ${open["fleet"]?"open":""}><summary><span class="md-icon">${ICONS.fleet}</span><span class="md-title">Aircraft Fleet</span><span class="md-count">${fleet.length}</span>${closeBtn}${chev}</summary><div class="md-body">${fleet.map((a,i) => `<div class="md-row"><div class="grow"><div class="main">${esc(displayReg(a.registration))}</div><div class="sub">${a.type?esc(a.type):"—"}${a.typeCode?` · <span class="mono">${esc(a.typeCode)}</span>`:""}${a.config?` · ${esc(a.config)}`:""}</div></div><div class="actions"><button class="action-btn" onclick="openEditFleetModal(${i})" title="Edit">${ICONS.edit}</button><button class="action-btn danger" onclick="removeFleet(${i})" title="Delete">${ICONS.trash}</button></div></div>`).join("") || `<div style="color:var(--ink-3);font-size:13px;padding:8px 0;">No aircraft yet.</div>`}<div class="md-add"><button class="btn btn-secondary btn-sm" onclick="openAddFleetModal()">Add Aircraft</button></div></div></details>
    ${tagSection("gates","Gates","gates",ICONS.gates,"e.g. C04","Gates at Hamburg.",gates)}
    ${combinedPeopleSection(ahs, tkAgents)}
    ${tagSection("prmCodes","PRM Codes","prm",ICONS.prm,"e.g. WCHR","Passenger with reduced mobility codes.",prm)}
    ${tagSection("staffCodes","Staff Codes","staff",ICONS.staff,"e.g. R2A","Airline staff travel codes.",staff)}
    ${tagSection("otherTypes","Other Special Types","other",ICONS.other,"e.g. BIKE","Special baggage and passenger types.",other)}
    <details class="md-section" data-md="messages" ${open["messages"]?"open":""}><summary><span class="md-icon">${ICONS.data}</span><span class="md-title">Message Settings</span><span class="md-count">${msgS.useEmoji ? "Emoji on" : "Text"}</span>${closeBtn}${chev}</summary><div class="md-body"><div class="row-yn"><div class="label">Use emoji section markers</div>${yesNoHtml("ms_useEmoji", msgS.useEmoji === false ? "NO" : "YES")}</div></div></details>
    <details class="md-section" data-md="data" ${open["data"]?"open":""}><summary><span class="md-icon">${ICONS.data}</span><span class="md-title">Data &amp; Backup</span><span class="md-count">${admin ? "Admin tools" : "JSON"}</span>${closeBtn}${chev}</summary><div class="md-body">
      <div class="md-info">Export or restore your local data.</div>
      <div style="font-size:12px;font-weight:700;color:var(--ink-3);text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px;">My Backups</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;">
        <button class="btn btn-primary btn-sm" onclick="exportBackup()">Export My Backup</button>
        <button class="btn btn-secondary btn-sm" onclick="document.getElementById('importFile').click()">Restore My Backup</button>
        <input type="file" id="importFile" accept=".json" hidden>
      </div>
      <div style="font-size:12px;font-weight:700;color:var(--ink-3);text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px;">Master Data (Settings only)</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button class="btn btn-secondary btn-sm" onclick="exportMasterData()">Export Master Data</button>
        <button class="btn btn-secondary btn-sm" onclick="openImportMasterDataModal()">Import Master Data</button>
      </div>
      ${admin ? `
        <div style="font-size:12px;font-weight:700;color:#B66A00;text-transform:uppercase;letter-spacing:.05em;margin-top:20px;margin-bottom:8px;">Admin Tools</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;">
          <button class="btn btn-primary btn-sm" onclick="openTeamMergeModal()">Merge colleague backups…</button>
          <button class="btn btn-secondary btn-sm" onclick="exportAdminExcel()">Export all as Excel (CSV)</button>
          <button class="btn btn-secondary btn-sm" onclick="openBulkCreateModal()">Bulk create flights…</button>
        </div>
        <div style="font-size:12px;font-weight:700;color:var(--danger);text-transform:uppercase;letter-spacing:.05em;margin-top:12px;margin-bottom:8px;">Danger Zone</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button class="btn btn-danger-fill btn-sm" onclick="confirmDeleteAllData()">Delete all data…</button>
        </div>
        <div style="font-size:12px;color:var(--ink-3);line-height:1.5;margin-top:8px;">Deletes all flights, summaries and audit entries. Master Data is kept.</div>
      ` : ""}
    </div></details>
  `;
  host.querySelectorAll("details.md-section").forEach(el => el.addEventListener("toggle", () => { const s = getMdOpenState(); s[el.dataset.md] = el.open; setMdOpenState(s); }));
  const imp = $("importFile"); if(imp) imp.addEventListener("change", handleImportFile);
  const hidden = $("ms_useEmoji"); if(hidden) hidden.addEventListener("input", async () => { await setSetting("messageSettings", { useEmoji: hidden.value === "YES" }); });
}
function combinedPeopleSection(ahs, tkAgents){
  const open = getMdOpenState(); const isOpen = !!open["people"];
  const chev = `<span class="chev"><svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg></span>`;
  const closeBtn = `<button class="close-btn" onclick="closeSection(this,event)"><svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg></button>`;
  const total = ahs.length + tkAgents.length;
  return `<details class="md-section" data-md="people" ${isOpen?"open":""}>
    <summary><span class="md-icon">${ICONS.people}</span><span class="md-title">Agents</span><span class="md-count">${total}</span>${closeBtn}${chev}</summary>
    <div class="md-body">
      <div class="md-info">Ramp / operations agents and Airline agents. Both lists stay separate.</div>
      <div style="font-size:12px;font-weight:700;color:var(--ink-3);text-transform:uppercase;letter-spacing:.05em;margin:6px 0 8px;">Handling Agents · ${ahs.length}</div>
      ${ahs.map((item,i) => `<div class="md-row"><div class="grow main">${esc(item)}</div><div class="actions"><button class="action-btn" onclick="openEditTagModal('ahsAgents', ${i}, true)" title="Edit">${ICONS.edit}</button><button class="action-btn danger" onclick="removeMasterTag('ahsAgents', ${i})" title="Delete">${ICONS.trash}</button></div></div>`).join("") || `<div style="color:var(--ink-3);font-size:13px;padding:4px 0;">No Handling agents yet.</div>`}
      <div class="md-add" style="margin-bottom:18px;"><button class="btn btn-secondary btn-sm" onclick="openAddTagModal('ahsAgents', 'e.g. Judith', true)">Add Handling agent</button></div>
      <div style="font-size:12px;font-weight:700;color:var(--ink-3);text-transform:uppercase;letter-spacing:.05em;margin:6px 0 8px;">Airlines Agents · ${tkAgents.length}</div>
      ${tkAgents.map((item,i) => `<div class="md-row"><div class="grow main">${esc(item)}</div><div class="actions"><button class="action-btn" onclick="openEditTagModal('tkAgents', ${i}, true)" title="Edit">${ICONS.edit}</button><button class="action-btn danger" onclick="removeMasterTag('tkAgents', ${i})" title="Delete">${ICONS.trash}</button></div></div>`).join("") || `<div style="color:var(--ink-3);font-size:13px;padding:4px 0;">No Airline agents yet.</div>`}
      <div class="md-add"><button class="btn btn-secondary btn-sm" onclick="openAddTagModal('tkAgents', 'e.g. Airline Officer 3', true)">Add Airline agent</button></div>
    </div>
  </details>`;
}
function tagSection(key, title, mdKey, icon, placeholder, info, list, preserveCase = false){
  const open = getMdOpenState(); const isOpen = !!open[mdKey];
  const chev = `<span class="chev"><svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg></span>`;
  const closeBtn = `<button class="close-btn" onclick="closeSection(this,event)"><svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg></button>`;
  return `<details class="md-section" data-md="${mdKey}" ${isOpen?"open":""}><summary><span class="md-icon">${icon}</span><span class="md-title">${esc(title)}</span><span class="md-count">${list.length}</span>${closeBtn}${chev}</summary><div class="md-body"><div class="md-info">${esc(info)}</div>${list.map((item,i) => `<div class="md-row"><div class="grow main">${esc(item)}</div><div class="actions"><button class="action-btn" onclick="openEditTagModal('${key}', ${i}, ${preserveCase})" title="Edit">${ICONS.edit}</button><button class="action-btn danger" onclick="removeMasterTag('${key}', ${i})" title="Delete">${ICONS.trash}</button></div></div>`).join("") || `<div style="color:var(--ink-3);font-size:13px;padding:8px 0;">No entries yet.</div>`}<div class="md-add"><button class="btn btn-secondary btn-sm" onclick="openAddTagModal('${key}', '${esc(placeholder)}', ${preserveCase})">Add</button></div></div></details>`;
}
function daysSelectorHtml(selected, idPrefix){ const sel = selected || []; return `<div class="days-selector" id="${idPrefix}_days">${WEEKDAYS.map((d, i) => `<label class="day-check ${sel.includes(d)?"on":""}" data-day="${d}"><input type="checkbox" value="${d}" ${sel.includes(d)?"checked":""}><span class="day-label">${WEEKDAYS_SHORT[i]}</span><span class="day-dot"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></span></label>`).join("")}</div>`; }
function wireDaysSelector(c){ c.querySelectorAll(".day-check").forEach(el => { el.addEventListener("click", e => { e.preventDefault(); const cb = el.querySelector("input"); cb.checked = !cb.checked; el.classList.toggle("on", cb.checked); }); }); }
function readDays(c){ return [...c.querySelectorAll(".day-check input:checked")].map(i => i.value); }
async function openAddScheduleModal(){ openModal("Add Flight Number", `<div class="form-grid"><div class="field full"><label>Validity range</label><div style="display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center;"><input type="text" id="schValidFrom" inputmode="numeric" placeholder="DD.MM.YYYY" maxlength="10"><span>–</span><input type="text" id="schValidTo" inputmode="numeric" placeholder="DD.MM.YYYY" maxlength="10"></div></div><div class="field"><label>Flight number</label><div class="prefix-group"><span class="prefix">TK</span><input type="text" id="schFlightNum" placeholder="e.g. 1668" inputmode="numeric" maxlength="5"></div></div><div class="field" style="gap:6px;"><label>Route</label><div class="route-group"><input type="text" id="schRouteFrom" value="HAM" maxlength="4" placeholder="e.g. HAM"><span class="arrow">→</span><input type="text" id="schRouteTo" value="IST" maxlength="4" placeholder="e.g. IST"></div></div><div class="field"><label>STD</label><input type="text" id="schStd" placeholder="e.g. 0710" maxlength="4" inputmode="numeric"></div><div class="field"><label>STA</label><input type="text" id="schSta" placeholder="e.g. 1125" maxlength="4" inputmode="numeric"></div><div class="field full"><label>Operating days</label>${daysSelectorHtml(WEEKDAYS, "sch")}</div></div>`, `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="submitAddSchedule()">Save</button>`, { wide:true }); wireDaysSelector($("sch_days")); wireDateInput($("schValidFrom")); wireDateInput($("schValidTo")); }
async function submitAddSchedule(){ const n = $("schFlightNum").value.replace(/[^\d]/g,""); if(!n){ toast("Flight number required."); return; } const std = $("schStd").value.replace(/[^\d]/g,""), sta = $("schSta").value.replace(/[^\d]/g,""); if(!std || !sta){ toast("STD/STA required."); return; } const days = readDays($("sch_days")); if(!days.length){ toast("Select days."); return; } const arr = await getSetting("flightSchedules", []); arr.push({ id:uid("sched"), flightNumber:"TK"+n, routeFrom:$("schRouteFrom").value.trim().toUpperCase()||"HAM", routeTo:$("schRouteTo").value.trim().toUpperCase()||"IST", std, sta, days, validFrom:parseDateInput($("schValidFrom").value), validTo:parseDateInput($("schValidTo").value) }); await setSetting("flightSchedules", arr); await loadMasterCache(); closeModal(); renderMasterData(); toast("Saved."); }
async function openEditScheduleModal(i){ const arr = await getSetting("flightSchedules", []); const s = arr[i]; const n = (s.flightNumber||"").replace(/^TK/i,""); openModal("Edit Flight Number", `<div class="form-grid"><div class="field full"><label>Validity range</label><div style="display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center;"><input type="text" id="schValidFrom" value="${esc(formatDateInput(s.validFrom||""))}" inputmode="numeric" placeholder="DD.MM.YYYY" maxlength="10"><span>–</span><input type="text" id="schValidTo" value="${esc(formatDateInput(s.validTo||""))}" inputmode="numeric" placeholder="DD.MM.YYYY" maxlength="10"></div></div><div class="field"><label>Flight number</label><div class="prefix-group"><span class="prefix">TK</span><input type="text" id="schFlightNum" value="${esc(n)}" inputmode="numeric" maxlength="5"></div></div><div class="field" style="gap:6px;"><label>Route</label><div class="route-group"><input type="text" id="schRouteFrom" value="${esc(s.routeFrom||"")}" maxlength="4"><span class="arrow">→</span><input type="text" id="schRouteTo" value="${esc(s.routeTo||"")}" maxlength="4"></div></div><div class="field"><label>STD</label><input type="text" id="schStd" value="${esc(s.std||"")}" maxlength="4" inputmode="numeric"></div><div class="field"><label>STA</label><input type="text" id="schSta" value="${esc(s.sta||"")}" maxlength="4" inputmode="numeric"></div><div class="field full"><label>Days</label>${daysSelectorHtml(s.days||[], "sch")}</div></div>`, `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="submitEditSchedule(${i})">Save</button>`, { wide:true }); wireDaysSelector($("sch_days")); wireDateInput($("schValidFrom")); wireDateInput($("schValidTo")); }
async function submitEditSchedule(i){ const n = $("schFlightNum").value.replace(/[^\d]/g,""); if(!n){ toast("Flight number required."); return; } const days = readDays($("sch_days")); if(!days.length){ toast("Select days."); return; } const arr = await getSetting("flightSchedules", []); arr[i] = { id:arr[i].id, flightNumber:"TK"+n, routeFrom:$("schRouteFrom").value.trim().toUpperCase(), routeTo:$("schRouteTo").value.trim().toUpperCase(), std:$("schStd").value.replace(/[^\d]/g,""), sta:$("schSta").value.replace(/[^\d]/g,""), days, validFrom:parseDateInput($("schValidFrom").value), validTo:parseDateInput($("schValidTo").value) }; await setSetting("flightSchedules", arr); await loadMasterCache(); closeModal(); renderMasterData(); toast("Saved."); }
async function removeSchedule(i){ const arr = await getSetting("flightSchedules", []); arr.splice(i,1); await setSetting("flightSchedules", arr); await loadMasterCache(); renderMasterData(); }
async function openGenerateFlightsModal(){
  const schedules = await getSetting("flightSchedules", []);
  if(!schedules.length){ toast("Add flight numbers first."); return; }
  const today = todayISO();
  const nextMonth = (() => { const d = new Date(); d.setDate(d.getDate() + 30); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; })();
  openModal("Generate Flights", `<p style="font-size:13px;color:var(--ink-2);">Pick a date range. New flights are created; existing ones are skipped.</p><div class="form-grid">${dateFieldHtml("genFrom", today, "From")}${dateFieldHtml("genTo", nextMonth, "To")}</div><div style="margin-top:16px;">${schedules.map((s,i) => `<label class="gen-schedule-item" style="margin-bottom:6px;"><input type="checkbox" class="gen-sched" value="${i}" checked><div style="flex:1;min-width:0;"><div style="font-weight:600;font-size:13px;">${esc(s.flightNumber)} ${esc(s.routeFrom)} → ${esc(s.routeTo)}</div><div style="font-size:11.5px;color:var(--ink-3);">STD ${esc(fmtTimeShort(s.std))} · STA ${esc(fmtTimeShort(s.sta))}</div></div></label>`).join("")}</div><div id="genPreview" style="margin-top:14px;"></div>`, `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" id="genSubmitBtn" onclick="runGenerateFlights()" disabled>Create</button>`, { wide:true });
  setTimeout(() => { wireDateInput($("genFrom")); wireDateInput($("genTo")); $("genFrom").addEventListener("input", updateGenPreview); $("genTo").addEventListener("input", updateGenPreview); document.querySelectorAll(".gen-sched").forEach(cb => cb.addEventListener("change", updateGenPreview)); updateGenPreview(); }, 50);
}
async function computeFlightsToGenerate(fromIso, toIso, selectedIdxs){
  const schedules = await getSetting("flightSchedules", []); const selected = selectedIdxs.map(i => schedules[i]).filter(Boolean);
  const result = []; if(!fromIso || !toIso || fromIso > toIso || !selected.length) return result;
  const start = new Date(fromIso + "T00:00:00"); const end = new Date(toIso + "T00:00:00"); const d = new Date(start);
  while(d <= end){ const iso = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; const wd = ["SUN","MON","TUE","WED","THU","FRI","SAT"][d.getDay()]; for(const s of selected){ if(!s.days || !s.days.includes(wd)) continue; if(s.validFrom && iso < s.validFrom) continue; if(s.validTo && iso > s.validTo) continue; const id = dateFlightId(iso, s.flightNumber); const ex = await dbGet("flights", id); result.push({ date: iso, schedule: s, exists: !!ex }); } d.setDate(d.getDate() + 1); }
  return result;
}
async function updateGenPreview(){
  const box = $("genPreview"); const btn = $("genSubmitBtn"); if(!box || !btn) return;
  const fromIso = parseDateInput($("genFrom").value); const toIso = parseDateInput($("genTo").value);
  const selectedIdxs = [...document.querySelectorAll(".gen-sched:checked")].map(cb => Number(cb.value));
  if(!fromIso || !toIso || fromIso > toIso || !selectedIdxs.length){ box.innerHTML = `<div class="inline-notice info">Pick range and flight numbers.</div>`; btn.disabled = true; btn.textContent = "Create"; return; }
  const list = await computeFlightsToGenerate(fromIso, toIso, selectedIdxs); const toCreate = list.filter(x => !x.exists); const toSkip = list.filter(x => x.exists);
  if(!list.length){ box.innerHTML = `<div class="inline-notice warn">No matching flights.</div>`; btn.disabled = true; btn.textContent = "Create"; return; }
  box.innerHTML = `<div class="inline-notice ${toCreate.length ? "ok" : "info"}"><b>${toCreate.length}</b> will be created${toSkip.length ? ` · ${toSkip.length} skipped` : ""}.</div>`;
  btn.disabled = toCreate.length === 0; btn.textContent = toCreate.length ? `Create ${toCreate.length}` : "Create";
}
async function runGenerateFlights(){
  const fromIso = parseDateInput($("genFrom").value); const toIso = parseDateInput($("genTo").value);
  const selectedIdxs = [...document.querySelectorAll(".gen-sched:checked")].map(cb => Number(cb.value));
  if(!fromIso || !toIso || fromIso > toIso || !selectedIdxs.length) return;
  const btn = $("genSubmitBtn"); if(btn){ btn.disabled = true; btn.textContent = "Creating…"; }
  const list = await computeFlightsToGenerate(fromIso, toIso, selectedIdxs); const toCreate = list.filter(x => !x.exists);
  let created = 0;
  for(const item of toCreate){ const s = item.schedule; try { await createFlight({ date: item.date, flightNumber: s.flightNumber, routeFrom: s.routeFrom, routeTo: s.routeTo, std: s.std, sta: s.sta }); created++; } catch(e){} }
  closeModal(); toast(`${created} flight${created===1?"":"s"} created.`);
  if(currentTab === "masterDataTab") renderMasterData(); else if(currentTab === "todayTab") renderToday();
}
async function openAddTagModal(key, placeholder, preserveCase){ openModal("Add Entry", `<div class="field"><label>Value</label><input type="text" id="addTagValue" placeholder="${esc(placeholder)}"></div>`, `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="submitAddTag('${key}', ${preserveCase})">Add</button>`); setTimeout(() => $("addTagValue").focus(), 60); }
async function submitAddTag(key, pc){ let v = $("addTagValue").value.trim(); if(!v){ toast("Value required."); return; } if(!pc) v = v.toUpperCase(); const arr = await getSetting(key, []); if(arr.some(x => String(x).toLowerCase() === v.toLowerCase())){ toast("Already exists."); return; } arr.push(v); await setSetting(key, arr); await loadMasterCache(); closeModal(); renderMasterData(); toast("Added."); }
async function removeMasterTag(key, i){ const arr = await getSetting(key, []); arr.splice(i,1); await setSetting(key, arr); await loadMasterCache(); renderMasterData(); }
async function openEditTagModal(key, i, pc){ const arr = await getSetting(key, []); openModal("Edit Entry", `<div class="field"><label>Value</label><input type="text" id="editTagValue" value="${esc(arr[i])}"></div>`, `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveEditTag('${key}', ${i}, ${pc})">Save</button>`); setTimeout(() => $("editTagValue").select(), 50); }
async function saveEditTag(key, i, pc){ let v = $("editTagValue").value.trim(); if(!v){ toast("Required."); return; } if(!pc) v = v.toUpperCase(); const arr = await getSetting(key, []); if(arr.some((x,j) => j !== i && String(x).toLowerCase() === v.toLowerCase())){ toast("Already exists."); return; } arr[i] = v; await setSetting(key, arr); await loadMasterCache(); closeModal(); renderMasterData(); toast("Saved."); }
async function openAddFleetModal(){ openModal("Add Aircraft", `<div class="form-grid"><div class="field full"><label>Registration</label><div class="prefix-group"><span class="prefix">TC-</span><input type="text" id="addFleetReg" placeholder="e.g. LSM" maxlength="3" style="text-transform:uppercase"></div></div><div class="field"><label>Aircraft type</label><input type="text" id="addFleetType" placeholder="e.g. A321"></div><div class="field"><label>Type code</label><input type="text" id="addFleetCode" placeholder="e.g. 321" maxlength="4" style="text-transform:uppercase;text-align:center;"></div><div class="field full"><label>Configuration</label><div class="config-group"><div class="prefix-group small"><span class="prefix">C</span><input type="text" id="addFleetConfigC" placeholder="e.g. 12" maxlength="3" inputmode="numeric"></div><div class="prefix-group small"><span class="prefix">Y</span><input type="text" id="addFleetConfigY" placeholder="e.g. 178" maxlength="3" inputmode="numeric"></div></div></div></div>`, `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="submitAddFleet()">Save</button>`); }
async function submitAddFleet(){ const reg = $("addFleetReg").value.toUpperCase().replace(/^TC-?/i,"").trim(); if(!reg){ toast("Required."); return; } const fleet = await getSetting("aircraftFleet", []); if(fleet.some(a => String(a.registration).toUpperCase() === reg)){ toast("Already exists."); return; } fleet.push({ registration:reg, type:$("addFleetType").value.trim(), typeCode:$("addFleetCode").value.toUpperCase().trim(), config:joinConfig($("addFleetConfigC").value, $("addFleetConfigY").value) }); await setSetting("aircraftFleet", fleet); await loadMasterCache(); closeModal(); renderMasterData(); }
async function removeFleet(i){ const f = await getSetting("aircraftFleet", []); f.splice(i,1); await setSetting("aircraftFleet", f); await loadMasterCache(); renderMasterData(); }
async function openEditFleetModal(i){ const fleet = await getSetting("aircraftFleet", []); const a = fleet[i], cfg = splitConfig(a.config); openModal("Edit Aircraft", `<div class="form-grid"><div class="field full"><label>Registration</label><div class="prefix-group"><span class="prefix">TC-</span><input type="text" id="efFleetReg" value="${esc(a.registration||"")}" maxlength="3" style="text-transform:uppercase"></div></div><div class="field"><label>Type</label><input type="text" id="efFleetType" value="${esc(a.type||"")}"></div><div class="field"><label>Code</label><input type="text" id="efFleetCode" value="${esc(a.typeCode||"")}" maxlength="4" style="text-transform:uppercase;text-align:center;"></div><div class="field full"><label>Config</label><div class="config-group"><div class="prefix-group small"><span class="prefix">C</span><input type="text" id="efFleetConfigC" value="${esc(cfg.c||"")}" maxlength="3" inputmode="numeric"></div><div class="prefix-group small"><span class="prefix">Y</span><input type="text" id="efFleetConfigY" value="${esc(cfg.y||"")}" maxlength="3" inputmode="numeric"></div></div></div></div>`, `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveEditFleet(${i})">Save</button>`); }
async function saveEditFleet(i){ const reg = $("efFleetReg").value.toUpperCase().replace(/^TC-?/i,"").trim(); if(!reg){ toast("Required."); return; } const fleet = await getSetting("aircraftFleet", []); fleet[i] = { registration:reg, type:$("efFleetType").value.trim(), typeCode:$("efFleetCode").value.toUpperCase().trim(), config:joinConfig($("efFleetConfigC").value, $("efFleetConfigY").value) }; await setSetting("aircraftFleet", fleet); await loadMasterCache(); closeModal(); renderMasterData(); toast("Saved."); }
function closeSection(btn, event){ event.stopPropagation(); event.preventDefault(); const d = btn.closest("details"); if(d) d.open = false; }

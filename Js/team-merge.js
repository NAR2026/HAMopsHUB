/* ============================================================
   Team Merge (admin)
   ============================================================ */
async function openTeamMergeModal(){
  openModal("Merge colleague backups", `<p style="font-size:13.5px;color:var(--ink-2);line-height:1.6;">Pick one or more backup files. New entries are added automatically. Where entries already exist with different values, you see both versions and choose what to keep.</p><div class="field"><label>Backup files</label><input type="file" id="tmFiles" accept=".json,application/json" multiple style="padding:8px;"></div><div id="tmPreview"></div>`, `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" id="tmRunBtn" disabled onclick="startTeamMerge()">Continue</button>`, { wide:true });
  setTimeout(() => { const inp = $("tmFiles"); if(inp) inp.addEventListener("change", e => previewTeamMerge(e.target.files)); }, 60);
}
let __tmPlan = null;
function diffObjects(a, b, keys){ const diffs = []; for(const k of keys){ const av = a ? a[k] : undefined; const bv = b ? b[k] : undefined; if(String(av == null ? "" : av) !== String(bv == null ? "" : bv)) diffs.push(k); } return diffs; }
const FLIGHT_DIFF_KEYS = ["registration","routeFrom","routeTo","gate","std","sta","aircraftType","typeCode","config","status"];
async function classifyFlight(incoming){
  const existing = await dbGet("flights", incoming.id);
  if(!existing) return { kind:"new", incoming };
  const diffs = diffObjects(existing, incoming, FLIGHT_DIFF_KEYS);
  if(!diffs.length) return { kind:"identical", existing, incoming };
  return { kind:"conflict", existing, incoming, diffs };
}
function formRank(s){ return s === "done" ? 3 : s === "in_progress" ? 2 : 1; }
async function classifyForm(incoming){
  const existing = await dbGet("forms", incoming.id);
  if(!existing){ const all = await dbAll("forms"); const same = all.find(f => f.flightPhase === incoming.flightPhase && f.id !== incoming.id); if(same) return { kind:"conflict", existing:same, incoming, reason:"same-slot" }; return { kind:"new", incoming }; }
  const eR = formRank(existing.status); const iR = formRank(incoming.status);
  const eAt = existing.updatedAt || existing.completedAt || existing.createdAt || "";
  const iAt = incoming.updatedAt || incoming.completedAt || incoming.createdAt || "";
  if(eR === iR && eAt === iAt && JSON.stringify(existing.data||{}) === JSON.stringify(incoming.data||{})) return { kind:"identical", existing, incoming };
  if(eR > iR) return { kind:"identical", existing, incoming, reason:"yours-stronger" };
  if(eR < iR) return { kind:"conflict", existing, incoming, reason:"theirs-stronger" };
  if(eAt === iAt && JSON.stringify(existing.data||{}) === JSON.stringify(incoming.data||{})) return { kind:"identical", existing, incoming };
  return { kind:"conflict", existing, incoming, reason:"same-status" };
}
async function buildMergePlan(payloads){
  const plan = { newFlights:[], newForms:[], newAudit:[], conflictFlights:[], conflictForms:[], identicalCount:0 };
  const seenF = new Set(), seenM = new Set();
  for(const { filename, payload } of payloads){
    for(const f of payload.flights || []){ if(seenF.has(f.id)) continue; seenF.add(f.id); const r = await classifyFlight(f); if(r.kind === "new") plan.newFlights.push(f); else if(r.kind === "conflict") plan.conflictFlights.push({ ...r, source: filename }); else plan.identicalCount++; }
    for(const fm of payload.forms || []){ if(seenM.has(fm.id)) continue; seenM.add(fm.id); const r = await classifyForm(fm); if(r.kind === "new") plan.newForms.push(fm); else if(r.kind === "conflict") plan.conflictForms.push({ ...r, source: filename }); else plan.identicalCount++; }
    for(const a of payload.audit || []){ const ex = await dbGet("audit", a.id); if(!ex) plan.newAudit.push(a); }
  }
  return plan;
}
async function previewTeamMerge(files){
  const box = $("tmPreview"); const btn = $("tmRunBtn");
  if(!files || !files.length){ box.innerHTML = ""; btn.disabled = true; return; }
  const payloads = []; const failures = [];
  for(const file of files){ try { const txt = await file.text(); const data = JSON.parse(txt); if(!data || !Array.isArray(data.flights)) throw new Error("not a backup"); payloads.push({ filename: file.name, payload: data }); } catch(e){ failures.push(file.name); } }
  if(!payloads.length){ box.innerHTML = `<div class="inline-notice danger">No valid backup files.</div>`; btn.disabled = true; return; }
  payloads.sort((a,b) => { const aT = a.payload.exportedAt || ""; const bT = b.payload.exportedAt || ""; if(aT !== bT) return bT.localeCompare(aT); return b.filename.localeCompare(a.filename); });
  const plan = await buildMergePlan(payloads);
  __tmPlan = plan;
  const totalConf = plan.conflictFlights.length + plan.conflictForms.length;
  btn.disabled = (plan.newFlights.length + plan.newForms.length + totalConf) === 0;
  btn.textContent = totalConf ? `Continue (${totalConf} conflict${totalConf===1?"":"s"})` : "Continue";
  box.innerHTML = `
    <div class="inline-notice info" style="margin-top:14px;"><b>${payloads.length}</b> valid file${payloads.length===1?"":"s"} · newest first${failures.length ? ` · ${failures.length} skipped` : ""}.</div>
    <div class="card" style="margin-top:12px;"><div class="card-head"><h2>Source files</h2></div><div class="card-body" style="padding:0;overflow-x:auto;">
      <table class="stats-table"><thead><tr><th>File</th><th>Exported</th><th>Age</th></tr></thead><tbody>
        ${payloads.map(p => { const t = p.payload.exportedAt; return `<tr><td>${esc(p.filename)}</td><td style="font-family:var(--mono);font-size:12px;">${t ? esc(new Date(t).toLocaleString("en-GB")) : "–"}</td><td style="color:${relTimeColor(t)};font-weight:600;">${esc(relTime(t))}</td></tr>`; }).join("")}
      </tbody></table>
    </div></div>
    <div class="kpis" style="margin-top:14px;">
      <div class="kpi brand"><div class="k-label">New flights</div><div class="k-value">${plan.newFlights.length}</div><div class="k-sub">Auto-add</div></div>
      <div class="kpi"><div class="k-label">New summaries</div><div class="k-value">${plan.newForms.length}</div><div class="k-sub">Auto-add</div></div>
      <div class="kpi"><div class="k-label">Conflicts</div><div class="k-value">${totalConf}</div><div class="k-sub">You decide</div></div>
      <div class="kpi"><div class="k-label">Identical</div><div class="k-value">${plan.identicalCount}</div><div class="k-sub">Skipped</div></div>
    </div>
    ${failures.length ? `<div class="inline-notice danger" style="margin-top:12px;">Could not read: ${failures.map(esc).join(", ")}</div>` : ""}
  `;
}
async function startTeamMerge(){
  if(!__tmPlan){ toast("Nothing to merge."); return; }
  const plan = __tmPlan;
  for(const f of plan.newFlights) await dbPut("flights", f);
  for(const fm of plan.newForms) await dbPut("forms", fm);
  for(const a of plan.newAudit) await dbPut("audit", a);
  const autoCount = plan.newFlights.length + plan.newForms.length;
  if(autoCount) toast(`${autoCount} new entries merged.`);
  if(!plan.conflictFlights.length && !plan.conflictForms.length){
    __tmPlan = null; closeModal(); logEvent(`Team merge: ${autoCount} auto, no conflicts`);
    if(currentTab === "todayTab") renderToday(); else if(currentTab === "allFlightsTab") renderAllFlights(); else renderMasterData();
    return;
  }
  await renderNextConflict(plan, 0);
}
async function renderNextConflict(plan, index){
  const total = plan.conflictFlights.length + plan.conflictForms.length;
  if(index >= total){
    closeModal(); logEvent(`Team merge: ${plan.newFlights.length} new flights, ${plan.newForms.length} new forms, ${total} conflicts resolved`); toast("Merge complete.");
    if(currentTab === "todayTab") renderToday(); else if(currentTab === "allFlightsTab") renderAllFlights(); else renderMasterData();
    __tmPlan = null; return;
  }
  if(index < plan.conflictFlights.length) return renderFlightConflictModal(plan, index);
  return renderFormConflictModal(plan, index - plan.conflictFlights.length);
}
async function renderFlightConflictModal(plan, i){
  const conf = plan.conflictFlights[i];
  const total = plan.conflictFlights.length + plan.conflictForms.length;
  const position = i + 1;
  const incomingIsNewer = (conf.incoming.updatedAt || "") > (conf.existing.updatedAt || "");
  const older = incomingIsNewer ? conf.existing : conf.incoming;
  const newer = incomingIsNewer ? conf.incoming : conf.existing;
  const olderLabel = incomingIsNewer ? "Your version" : `Colleague (${esc(conf.source)})`;
  const newerLabel = incomingIsNewer ? `Colleague (${esc(conf.source)})` : "Your version";
  const rows = FLIGHT_DIFF_KEYS.map(k => {
    const ov = older[k] == null ? "" : String(older[k]); const nv = newer[k] == null ? "" : String(newer[k]); const differs = ov !== nv;
    return `<tr class="${differs ? "" : "identical"}"><td style="font-weight:600;">${esc(k)}</td><td style="font-family:var(--mono);">${esc(ov || "—")}</td><td style="font-family:var(--mono);">${esc(nv || "—")}</td><td class="pick">${differs ? `<input type="checkbox" data-field="${esc(k)}" checked>` : `<span style="color:var(--ink-3);">same</span>`}</td></tr>`;
  }).join("");
  openModal(`Conflict ${position} of ${total} · Flight`, `
    <div class="inline-notice warn" style="margin-top:0;"><b>${esc(newer.flightNumber || older.flightNumber)}</b> on <b>${esc(fmtDate(newer.date || older.date))}</b></div>
    <div class="merge-compare">
      <div class="merge-card"><h4>${olderLabel}<span style="font-weight:500;text-transform:none;color:var(--ink-3);font-size:11.5px;">${older.updatedAt ? esc(relTime(older.updatedAt)) : "unknown"}</span></h4>${FLIGHT_DIFF_KEYS.map(k => `<div class="row"><div class="k">${esc(k)}</div><div class="v">${esc(older[k] == null ? "—" : older[k])}</div></div>`).join("")}</div>
      <div class="merge-card newer"><h4>${newerLabel}<span style="font-weight:500;text-transform:none;color:var(--info);font-size:11.5px;">${newer.updatedAt ? esc(relTime(newer.updatedAt)) : "unknown"}</span></h4>${FLIGHT_DIFF_KEYS.map(k => { const differs = String(older[k] == null ? "" : older[k]) !== String(newer[k] == null ? "" : newer[k]); return `<div class="row ${differs ? "diff" : ""}"><div class="k">${esc(k)}</div><div class="v">${esc(newer[k] == null ? "—" : newer[k])}</div></div>`; }).join("")}</div>
    </div>
    <div class="merge-picker"><table><thead><tr><th>Field</th><th>Older</th><th>Newer</th><th>Take newer?</th></tr></thead><tbody>${rows}</tbody></table></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end;"><button class="btn btn-secondary btn-sm" onclick="conflictPickAll(true)">Take all newer</button><button class="btn btn-secondary btn-sm" onclick="conflictPickAll(false)">Keep all older</button></div>`,
    `<button class="btn btn-secondary" onclick="cancelConflictWalk()">Cancel remaining</button><button class="btn btn-primary" onclick="applyFlightConflict(${i})">Apply &amp; next</button>`, { wide:true });
}
function conflictPickAll(state){ document.querySelectorAll('#modalBody input[type=checkbox][data-field]').forEach(cb => cb.checked = !!state); }
async function applyFlightConflict(i){
  const plan = __tmPlan; if(!plan || !plan.conflictFlights[i]){ toast("State lost."); return; }
  const conf = plan.conflictFlights[i];
  const incomingIsNewer = (conf.incoming.updatedAt || "") > (conf.existing.updatedAt || "");
  const older = incomingIsNewer ? conf.existing : conf.incoming;
  const newer = incomingIsNewer ? conf.incoming : conf.existing;
  const merged = { ...newer };
  document.querySelectorAll('#modalBody input[type=checkbox][data-field]').forEach(cb => { const k = cb.dataset.field; if(!cb.checked){ merged[k] = older[k]; } });
  merged.updatedAt = nowISO();
  await dbPut("flights", merged);
  await renderNextConflict(plan, i + 1);
}
async function renderFormConflictModal(plan, i){
  const conf = plan.conflictForms[i];
  const flightIndexOffset = plan.conflictFlights.length;
  const position = flightIndexOffset + i + 1;
  const total = plan.conflictFlights.length + plan.conflictForms.length;
  const flight = await dbGet("flights", conf.existing.flightId || conf.incoming.flightId);
  const label = flight ? `${esc(flight.flightNumber)} · ${esc(fmtDate(flight.date))}` : "Summary";
  const incomingIsNewer = (conf.incoming.updatedAt || "") > (conf.existing.updatedAt || "");
  const older = incomingIsNewer ? conf.existing : conf.incoming;
  const newer = incomingIsNewer ? conf.incoming : conf.existing;
  const olderLabel = incomingIsNewer ? "Your version" : `Colleague (${esc(conf.source)})`;
  const newerLabel = incomingIsNewer ? `Colleague (${esc(conf.source)})` : "Your version";
  const buildCard = (v, label2, isNewer) => `<div class="merge-card ${isNewer?"newer":""}"><h4>${label2}<span style="font-weight:500;text-transform:none;color:${isNewer?"var(--info)":"var(--ink-3)"};font-size:11.5px;">${esc(relTime(v.updatedAt || v.completedAt))}</span></h4>
    <div class="row"><div class="k">Status</div><div class="v">${esc(v.status || "–")}</div></div>
    <div class="row"><div class="k">Gate</div><div class="v">${esc((v.data && v.data.gate) || "–")}</div></div>
    <div class="row"><div class="k">Close</div><div class="v">${esc(v.data && v.data.closeTime ? fmtTimeShort(v.data.closeTime) + "L" : "–")}</div></div>
    <div class="row"><div class="k">Pax</div><div class="v">${esc(v.data ? `${Number(v.data.cPax)||0}C/${Number(v.data.yPax)||0}Y+${Number(v.data.infPax)||0}INF` : "–")}</div></div>
    <div class="row"><div class="k">Meals</div><div class="v">${esc(v.data ? `${Number(v.data.cMeal)||0}C/${Number(v.data.yMeal)||0}Y` : "–")}</div></div>
    <div class="row"><div class="k">CBA/Bags</div><div class="v">${esc(v.data ? `${Number(v.data.cba)||0}/${Number(v.data.loaded)||0}` : "–")}</div></div></div>`;
  openModal(`Conflict ${position} of ${total} · Summary`, `
    <div class="inline-notice warn" style="margin-top:0;">Summary for <b>${label}</b></div>
    <div class="merge-compare">${buildCard(older, olderLabel, false)}${buildCard(newer, newerLabel, true)}</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end;"><button class="btn btn-secondary" onclick="applyFormConflict(${i}, 'older')">Keep older</button><button class="btn btn-primary" onclick="applyFormConflict(${i}, 'newer')">Take newer</button></div>`,
    `<button class="btn btn-secondary" onclick="cancelConflictWalk()">Cancel remaining</button>`, { wide:true });
}
async function applyFormConflict(i, which){
  const plan = __tmPlan; if(!plan || !plan.conflictForms[i]){ toast("State lost."); return; }
  const conf = plan.conflictForms[i];
  const incomingIsNewer = (conf.incoming.updatedAt || "") > (conf.existing.updatedAt || "");
  const newer = incomingIsNewer ? conf.incoming : conf.existing;
  const older = incomingIsNewer ? conf.existing : conf.incoming;
  const winner = which === "newer" ? newer : older;
  const merged = { ...winner, id: conf.existing.id };
  if(which === "newer") merged.updatedAt = nowISO();
  await dbPut("forms", merged);
  const flightIndexOffset = plan.conflictFlights.length;
  await renderNextConflict(plan, flightIndexOffset + i + 1);
}
function cancelConflictWalk(){
  __tmPlan = null; closeModal(); logEvent("Team merge: conflicts skipped"); toast("Remaining conflicts skipped.");
  if(currentTab === "todayTab") renderToday(); else if(currentTab === "allFlightsTab") renderAllFlights(); else renderMasterData();
}

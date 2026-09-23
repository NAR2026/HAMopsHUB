/* ============================================================
   Bulk Create (admin)
   ============================================================ */
async function openBulkCreateModal(){
  if(!isAdminMode()){ toast("Admin only."); return; }
  const rows = Array.from({length:10}, () => ({ date: todayISO(), fn:"", from:"HAM", to:"IST", reg:"", std:"", sta:"", gate:"" }));
  renderBulkCreate(rows);
}
function renderBulkCreate(rows){
  openModal("Bulk create flights", `<p style="font-size:13px;color:var(--ink-2);">Fill up to 10 flights at once. Existing flight numbers on the same date are skipped.</p><div style="overflow-x:auto;margin-top:6px;"><table class="bulk-table" id="bulkTable"><thead><tr><th style="width:130px;">Date</th><th style="width:90px;">TK#</th><th style="width:80px;">From</th><th style="width:80px;">To</th><th style="width:80px;">Reg</th><th style="width:70px;">STD</th><th style="width:70px;">STA</th><th style="width:80px;">Gate</th><th></th></tr></thead><tbody>${rows.map((r, i) => `<tr data-row="${i}"><td><input type="text" data-k="date" value="${esc(formatDateInput(r.date))}" inputmode="numeric" placeholder="DD.MM.YYYY" maxlength="10" style="width:110px;"></td><td><input type="text" data-k="fn" class="short" inputmode="numeric" maxlength="5" value="${esc(r.fn)}" placeholder="e.g. 1668"></td><td><input type="text" data-k="from" class="short" maxlength="4" value="${esc(r.from)}" style="text-transform:uppercase" placeholder="e.g. HAM"></td><td><input type="text" data-k="to" class="short" maxlength="4" value="${esc(r.to)}" style="text-transform:uppercase" placeholder="e.g. IST"></td><td><input type="text" data-k="reg" class="short" maxlength="3" value="${esc(r.reg)}" style="text-transform:uppercase" placeholder="e.g. LSM"></td><td><input type="text" data-k="std" class="mini" maxlength="4" inputmode="numeric" value="${esc(r.std)}" placeholder="0710"></td><td><input type="text" data-k="sta" class="mini" maxlength="4" inputmode="numeric" value="${esc(r.sta)}" placeholder="1125"></td><td><input type="text" data-k="gate" class="short" maxlength="4" value="${esc(r.gate)}" style="text-transform:uppercase" placeholder="e.g. C04"></td><td><button type="button" class="rm" onclick="bulkRemoveRow(${i})" title="Remove"><svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;"><path d="M18 6 6 18M6 6l12 12"/></svg></button></td></tr>`).join("")}</tbody></table></div><div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-top:12px;"><button class="btn btn-secondary btn-sm" onclick="bulkAddRow()">+ Add row</button><div id="bulkSummary" style="font-size:12.5px;color:var(--ink-3);align-self:center;"></div></div><div id="bulkResult" style="margin-top:12px;"></div>`, `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="runBulkCreate()">Create all</button>`, { wide:true });
  document.querySelectorAll('#bulkTable input').forEach(inp => inp.addEventListener('input', bulkUpdateSummary));
  document.querySelectorAll('#bulkTable input[data-k="date"]').forEach(inp => wireDateInput(inp));
  document.querySelectorAll('#bulkTable input[data-k="fn"], #bulkTable input[data-k="date"]').forEach(inp => inp.addEventListener('change', bulkApplyDefaults));
  bulkUpdateSummary();
}
function bulkReadRows(){ const rows = []; document.querySelectorAll('#bulkTable tbody tr').forEach(tr => { const r = {}; tr.querySelectorAll('input').forEach(inp => { r[inp.dataset.k] = (inp.value || "").trim(); }); if(r.fn || r.reg || r.std || r.sta) rows.push(r); }); return rows; }
function bulkUpdateSummary(){ const rows = bulkReadRows(); const valid = rows.filter(r => /^\d{1,5}$/.test(r.fn) && parseDateInput(r.date)); const box = $("bulkSummary"); if(box) box.textContent = `${valid.length} valid row${valid.length===1?"":"s"}`; }
async function bulkApplyDefaults(e){
  const tr = e.target.closest('tr'); if(!tr) return;
  const fnInp = tr.querySelector('input[data-k="fn"]'); const dtInp = tr.querySelector('input[data-k="date"]');
  const n = fnInp.value.replace(/[^\d]/g,""); const dt = parseDateInput(dtInp.value); if(!n || !dt) return;
  const fn = "TK" + n; const def = await findFlightDefaults(fn, dt);
  if(def){ tr.querySelector('input[data-k="from"]').value = def.routeFrom || tr.querySelector('input[data-k="from"]').value; tr.querySelector('input[data-k="to"]').value = def.routeTo || tr.querySelector('input[data-k="to"]').value; tr.querySelector('input[data-k="std"]').value = def.std || ""; tr.querySelector('input[data-k="sta"]').value = def.sta || ""; }
  bulkUpdateSummary();
}
function bulkRemoveRow(i){ const tr = document.querySelector(`#bulkTable tbody tr[data-row="${i}"]`); if(tr) tr.remove(); bulkUpdateSummary(); }
function bulkAddRow(){
  const tbody = document.querySelector('#bulkTable tbody'); const i = Date.now();
  const tr = document.createElement('tr'); tr.dataset.row = i;
  tr.innerHTML = `<td><input type="text" data-k="date" value="${formatDateInput(todayISO())}" inputmode="numeric" placeholder="DD.MM.YYYY" maxlength="10" style="width:110px;"></td><td><input type="text" data-k="fn" class="short" inputmode="numeric" maxlength="5" placeholder="e.g. 1668"></td><td><input type="text" data-k="from" class="short" maxlength="4" value="HAM" style="text-transform:uppercase" placeholder="HAM"></td><td><input type="text" data-k="to" class="short" maxlength="4" value="IST" style="text-transform:uppercase" placeholder="IST"></td><td><input type="text" data-k="reg" class="short" maxlength="3" style="text-transform:uppercase" placeholder="LSM"></td><td><input type="text" data-k="std" class="mini" maxlength="4" inputmode="numeric" placeholder="0710"></td><td><input type="text" data-k="sta" class="mini" maxlength="4" inputmode="numeric" placeholder="1125"></td><td><input type="text" data-k="gate" class="short" maxlength="4" style="text-transform:uppercase" placeholder="C04"></td><td><button type="button" class="rm" onclick="this.closest('tr').remove();bulkUpdateSummary();"><svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;"><path d="M18 6 6 18M6 6l12 12"/></svg></button></td>`;
  tbody.appendChild(tr);
  tr.querySelectorAll('input').forEach(inp => inp.addEventListener('input', bulkUpdateSummary));
  wireDateInput(tr.querySelector('input[data-k="date"]'));
  tr.querySelector('input[data-k="fn"]').addEventListener('change', bulkApplyDefaults);
  tr.querySelector('input[data-k="date"]').addEventListener('change', bulkApplyDefaults);
  bulkUpdateSummary();
}
async function runBulkCreate(){
  const rows = bulkReadRows(); if(!rows.length){ toast("No rows."); return; }
  let created = 0, skipped = 0, failed = 0; const errors = [];
  for(const r of rows){
    const n = String(r.fn||"").replace(/[^\d]/g,""); if(!n){ failed++; errors.push("Row missing flight number"); continue; }
    const dateIso = parseDateInput(r.date) || todayISO();
    try { await createFlight({ date: dateIso, flightNumber: "TK" + n, registration: r.reg, routeFrom: r.from || "HAM", routeTo: r.to || "IST", std: (r.std||"").replace(/[^\d]/g,""), sta: (r.sta||"").replace(/[^\d]/g,""), gate: r.gate }); created++; }
    catch(e){ if(/exists/i.test(e.message)) skipped++; else { failed++; errors.push("TK"+n+": " + e.message); } }
  }
  const box = $("bulkResult");
  if(box) box.innerHTML = `<div class="inline-notice ${failed ? "warn" : "ok"}"><b>${created}</b> created · <b>${skipped}</b> skipped · <b>${failed}</b> failed</div>${errors.length ? `<details style="margin-top:8px;"><summary style="cursor:pointer;font-size:12px;color:var(--ink-2);">Errors</summary><div style="margin-top:6px;font-size:12px;color:var(--danger);">${errors.map(esc).join("<br>")}</div></details>` : ""}`;
  logEvent(`Bulk create: ${created} created, ${skipped} skipped, ${failed} failed`);
  if(created) toast(`${created} flights created.`);
  if(currentTab === "todayTab") renderToday(); else if(currentTab === "allFlightsTab") renderAllFlights();
}

/* ============================================================
   New Flight (Choice) / New Flight (Single) / Edit / Delete
   ============================================================ */
function openNewFlightChoiceModal(){
  openModal("New Flight", `
    <p style="font-size:13.5px;color:var(--ink-2);line-height:1.6;">How would you like to add flights?</p>
    <div style="display:flex;flex-direction:column;gap:10px;">
      <button type="button" class="gen-schedule-item" style="text-align:left;padding:16px;" onclick="closeModal(); openNewFlightModal();">
        <div style="width:40px;height:40px;border-radius:10px;background:var(--brand-soft);display:grid;place-items:center;flex:none;">
          <svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:none;stroke:var(--brand);stroke-width:2;stroke-linecap:round;stroke-linejoin:round;"><path d="M12 5v14M5 12h14"/></svg>
        </div>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:600;font-size:14px;color:var(--ink);">Single Flight</div>
          <div style="font-size:12.5px;color:var(--ink-3);margin-top:2px;">Add one flight manually with all details.</div>
        </div>
        <svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:none;stroke:var(--ink-3);stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex:none;"><path d="M9 18l6-6-6-6"/></svg>
      </button>
      <button type="button" class="gen-schedule-item" style="text-align:left;padding:16px;" onclick="closeModal(); openGenerateFlightsModal();">
        <div style="width:40px;height:40px;border-radius:10px;background:var(--info-bg);display:grid;place-items:center;flex:none;">
          <svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:none;stroke:var(--info);stroke-width:2;stroke-linecap:round;stroke-linejoin:round;"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/><path d="m9 16 2 2 4-4"/></svg>
        </div>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:600;font-size:14px;color:var(--ink);">Multiple Flights</div>
          <div style="font-size:12.5px;color:var(--ink-3);margin-top:2px;">Generate many flights from your saved flight numbers.</div>
        </div>
        <svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:none;stroke:var(--ink-3);stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex:none;"><path d="M9 18l6-6-6-6"/></svg>
      </button>
    </div>
  `, `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>`);
}
async function openNewFlightModal(){
  openModal("New Flight", `<div class="form-grid">${dateFieldHtml("nfDate", todayISO(), "Date")}<div class="field"><label>Flight number</label><div class="prefix-group"><span class="prefix">TK</span>${datalistInput("nfFlightNum", "", getMasterList("flightNumbers").map(v => String(v).replace(/^TK/i,"")), "e.g. 1668", 'inputmode="numeric" maxlength="5"')}</div></div><div class="field full"><label>Route</label><div class="route-group"><input type="text" id="nfRouteFrom" placeholder="e.g. HAM" maxlength="4" style="text-transform:uppercase"><span class="arrow">→</span><input type="text" id="nfRouteTo" placeholder="e.g. IST" maxlength="4" style="text-transform:uppercase"></div></div><div class="field full"><label>Aircraft</label><div class="aircraft-row"><div class="field" style="gap:6px;"><label style="font-size:11.5px;">Registration</label><div class="prefix-group small"><span class="prefix">TC-</span>${datalistInput("nfReg", "", getMasterList("registrations"), "e.g. LSM", 'maxlength="3" style="text-transform:uppercase"')}</div></div><div class="field" style="gap:6px;"><label style="font-size:11.5px;">Aircraft type</label>${datalistInput("nfAc", "", getMasterList("aircraftTypes"), "e.g. A321", "")}</div><div class="field" style="gap:6px;"><label style="font-size:11.5px;">Type code</label>${datalistInput("nfTypeCode", "", getMasterList("typeCodes"), "e.g. 321", 'maxlength="4" style="text-transform:uppercase;text-align:center"')}</div><div class="field" style="gap:6px;"><label style="font-size:11.5px;">Configuration</label><div class="config-group"><div class="prefix-group small"><span class="prefix">C</span><input type="text" id="nfConfigC" placeholder="e.g. 12" maxlength="3" inputmode="numeric"></div><div class="prefix-group small"><span class="prefix">Y</span><input type="text" id="nfConfigY" placeholder="e.g. 178" maxlength="3" inputmode="numeric"></div></div></div></div></div><div class="field"><label>STD</label><input type="text" id="nfStd" placeholder="e.g. 0710" maxlength="4" inputmode="numeric"></div><div class="field"><label>STA</label><input type="text" id="nfSta" placeholder="e.g. 1125" maxlength="4" inputmode="numeric"></div></div>`, `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="submitNewFlight()">Save</button>`, { wide:true });
  wireDateInput($("nfDate"));
  setTimeout(() => $("nfFlightNum").focus(), 50);
  let lastKey = "";
  const applyDefaults = async () => { const n = $("nfFlightNum").value.replace(/[^\d]/g,""); const dt = parseDateInput($("nfDate").value); if(!n || !dt) return; const fn = "TK" + n, k = fn + "|" + dt; if(k === lastKey) return; lastKey = k; const def = await findFlightDefaults(fn, dt); if(def){ if(def.routeFrom) $("nfRouteFrom").value = def.routeFrom; if(def.routeTo) $("nfRouteTo").value = def.routeTo; if(def.std) $("nfStd").value = def.std; if(def.sta) $("nfSta").value = def.sta; } };
  $("nfFlightNum").addEventListener("input", applyDefaults); $("nfDate").addEventListener("input", applyDefaults);
  const __nfRegAutofill = async () => { const reg = ($("nfReg").value||"").toUpperCase().replace(/^TC-?/i,"").trim(); if(!reg) return; const m = await lookupAircraft(reg); if(m){ $("nfAc").value = m.type || ""; $("nfTypeCode").value = m.typeCode || ""; const c = splitConfig(m.config); $("nfConfigC").value = c.c || ""; $("nfConfigY").value = c.y || ""; } };
$("nfReg").addEventListener("input", __nfRegAutofill); $("nfReg").addEventListener("change", __nfRegAutofill);
}
async function submitNewFlight(){
  const n = $("nfFlightNum").value.replace(/[^\d]/g,""); if(!n){ toast("Flight number required."); return; }
  const dateIso = parseDateInput($("nfDate").value);
  if(!dateIso){ toast("Enter date as DD.MM.YYYY."); return; }
  try { await createFlight({ date: dateIso, flightNumber: "TK" + n, registration: $("nfReg").value.trim(), routeFrom: $("nfRouteFrom").value.trim() || "HAM", routeTo: $("nfRouteTo").value.trim() || "IST", aircraftType: $("nfAc").value.trim(), typeCode: $("nfTypeCode").value.trim(), config: joinConfig($("nfConfigC").value, $("nfConfigY").value), std: $("nfStd").value.replace(/[^\d]/g,""), sta: $("nfSta").value.replace(/[^\d]/g,"") }); closeModal(); toast("Flight created."); await loadMasterCache(); switchTab("todayTab"); } catch(e){ toast(e.message); }
}
async function openEditFlightModal(id){
  const f = await dbGet("flights", id); if(!f) return;
  const n = (f.flightNumber||"").replace(/^TK/i,""); const cfg = splitConfig(f.config);
  openModal("Edit Flight", `<div class="form-grid">${dateFieldHtml("efDate", f.date, "Date")}<div class="field"><label>Flight number</label><div class="prefix-group"><span class="prefix">TK</span><input type="text" id="efFlightNum" value="${esc(n)}" inputmode="numeric" maxlength="5"></div></div><div class="field full"><label>Route</label><div class="route-group"><input type="text" id="efRouteFrom" value="${esc(f.routeFrom||"")}" maxlength="4" style="text-transform:uppercase"><span class="arrow">→</span><input type="text" id="efRouteTo" value="${esc(f.routeTo||"")}" maxlength="4" style="text-transform:uppercase"></div></div><div class="field full"><label>Aircraft</label><div class="aircraft-row"><div class="field" style="gap:6px;"><label style="font-size:11.5px;">Registration</label><div class="prefix-group small"><span class="prefix">TC-</span>${datalistInput("efReg", f.registration||"", getMasterList("registrations"), "e.g. LSM", 'maxlength="3" style="text-transform:uppercase"')}</div></div><div class="field" style="gap:6px;"><label style="font-size:11.5px;">Aircraft type</label>${datalistInput("efAc", f.aircraftType||"", getMasterList("aircraftTypes"), "e.g. A321", "")}</div><div class="field" style="gap:6px;"><label style="font-size:11.5px;">Type code</label>${datalistInput("efTypeCode", f.typeCode||"", getMasterList("typeCodes"), "e.g. 321", 'maxlength="4" style="text-transform:uppercase;text-align:center"')}</div><div class="field" style="gap:6px;"><label style="font-size:11.5px;">Configuration</label><div class="config-group"><div class="prefix-group small"><span class="prefix">C</span><input type="text" id="efConfigC" value="${esc(cfg.c||"")}" maxlength="3" inputmode="numeric"></div><div class="prefix-group small"><span class="prefix">Y</span><input type="text" id="efConfigY" value="${esc(cfg.y||"")}" maxlength="3" inputmode="numeric"></div></div></div></div></div><div class="field"><label>Gate</label>${datalistInput("efGate", (f.gate||"").toUpperCase(), getMasterList("gates"), "e.g. C04", 'style="text-transform:uppercase"')}</div><div class="field"><label>STD</label><input type="text" id="efStd" value="${esc(f.std||"")}" maxlength="4" inputmode="numeric"></div><div class="field"><label>STA</label><input type="text" id="efSta" value="${esc(f.sta||"")}" maxlength="4" inputmode="numeric"></div></div>`, `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="submitEditFlight('${esc(id)}')">Save</button>`, { wide:true });
  wireDateInput($("efDate"));
  const __efRegAutofill = async () => { const reg = ($("efReg").value||"").toUpperCase().replace(/^TC-?/i,"").trim(); if(!reg) return; const m = await lookupAircraft(reg); if(m){ $("efAc").value = m.type || ""; $("efTypeCode").value = m.typeCode || ""; const c = splitConfig(m.config); $("efConfigC").value = c.c || ""; $("efConfigY").value = c.y || ""; } };
  $("efReg").addEventListener("input", __efRegAutofill); $("efReg").addEventListener("change", __efRegAutofill);
}
async function submitEditFlight(id){
  const n = $("efFlightNum").value.replace(/[^\d]/g,""); if(!n){ toast("Flight number required."); return; }
  const dateIso = parseDateInput($("efDate").value);
  if(!dateIso){ toast("Enter date as DD.MM.YYYY."); return; }
  try { const f = await updateFlight(id, { date: dateIso, flightNumber: "TK" + n, registration: $("efReg").value.trim(), routeFrom: $("efRouteFrom").value.trim(), routeTo: $("efRouteTo").value.trim(), gate: $("efGate").value.trim(), aircraftType: $("efAc").value.trim(), typeCode: $("efTypeCode").value.trim(), config: joinConfig($("efConfigC").value, $("efConfigY").value), std: $("efStd").value.replace(/[^\d]/g,""), sta: $("efSta").value.replace(/[^\d]/g,"") }); closeModal(); currentFlightId = f.id; toast("Updated."); renderFlightFile(); } catch(e){ toast(e.message); }
}
async function confirmDeleteFlight(id){ const f = await dbGet("flights", id); if(!f) return; openModal("Delete Flight", `<p>Delete <b>${esc(f.flightNumber)}</b> on ${esc(fmtDate(f.date))}?</p>`, `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-danger-fill" onclick="doDeleteFlight('${esc(id)}')">Delete</button>`); }
async function doDeleteFlight(id){ await deleteFlight(id); closeModal(); currentFlightId = null; switchTab("todayTab"); }

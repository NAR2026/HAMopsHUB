/* ============================================================
   Today
   ============================================================ */
async function renderToday(){
  const flights = await listFlights(); const today = todayISO(); const formsAll = await dbAll("forms");
  const todays = sortFlights(flights.filter(f => f.date === today));
  const withForms = todays.map(f => ({ f, forms: formsAll.filter(x => x.flightId === f.id) }));
  const done = withForms.filter(x => flightOverallStatus(x.forms, x.f) === "done");
  const pending = withForms.filter(x => flightOverallStatus(x.forms, x.f) === "open");
  const cancelled = withForms.filter(x => x.f.status === "cancelled");
  const paxToday = withForms.reduce((sum, x) => { const fm = getCheckinForm(x.forms); const d = (fm && fm.status === "done" && fm.data) || {}; return sum + (Number(d.cPax)||0) + (Number(d.yPax)||0) + (Number(d.infPax)||0); }, 0);
  const nextFlight = pending[0] || done[0] || null;
  $("sideBadgeToday").textContent = todays.length;
  const dt = new Date();
  const wd = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][dt.getDay()];
  const mo = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][dt.getMonth()];
  $("crumb").textContent = "Hamburg · " + wd + ", " + dt.getDate() + " " + mo;
  $("todayContent").innerHTML = `
    <div class="hero"><div><h2>Good day</h2><div class="sub">${todays.length} flight${todays.length===1?"":"s"} today · ${pending.length} still need a summary</div></div></div>
    <div class="kpis">
      <div class="kpi"><div class="k-label">Flights today</div><div class="k-value">${todays.length}</div><div class="k-sub">${cancelled.length ? cancelled.length + " cancelled" : "All active"}</div></div>
      <div class="kpi brand"><div class="k-label">Summary pending</div><div class="k-value">${pending.length}</div><div class="k-sub">${nextFlight ? esc(nextFlight.f.flightNumber) + " · " + esc(fmtTimeShort(nextFlight.f.std)) : "All done"}</div></div>
      <div class="kpi"><div class="k-label">Passengers today</div><div class="k-value">${paxToday}</div><div class="k-sub">From completed summaries</div></div>
      <div class="kpi"><div class="k-label">Completed</div><div class="k-value">${done.length}</div><div class="k-sub">Summary sent</div></div>
    </div>
    ${todays.length === 0 ? `<div class="card"><div class="card-body"><div class="empty-state"><h3>No flights for today</h3><p>Create a flight manually or generate flights from your saved flight numbers.</p><button class="btn btn-primary" onclick="openNewFlightChoiceModal()">New Flight</button></div></div></div>`
    : `${pending.length ? `<div class="sec-head"><h3>Summary pending</h3><div class="sort-controls">${sortSelectHtml()}</div></div><div class="flight-list" style="margin-bottom:26px;">${pending.map(x => flightCardHtml(x.f, x.forms, true, false)).join("")}</div>` : ""}${done.length ? `<div class="sec-head"><h3>Completed today</h3>${pending.length?"":`<div class="sort-controls">${sortSelectHtml()}</div>`}</div><div class="flight-list">${done.map(x => flightCardHtml(x.f, x.forms, true, false)).join("")}</div>` : ""}${cancelled.length ? `<div class="sec-head" style="margin-top:26px;"><h3>Cancelled</h3></div><div class="flight-list">${cancelled.map(x => flightCardHtml(x.f, x.forms, true, false)).join("")}</div>` : ""}`}
  `;
}
function flightCardHtml(f, forms, showDate, selectable){
  const st = flightOverallStatus(forms, f);
  const stLabel = st==="done" ? "Summary done" : st==="cancelled" ? "Cancelled" : "Summary open";
  const stCls = st==="done" ? "ok" : st==="cancelled" ? "" : "warn";
  const regBadge = f.registration ? `<span class="reg">${esc(displayReg(f.registration))}</span>` : `<span class="reg empty">no reg</span>`;
  const gateEl = f.gate ? `<span>Gate ${esc(f.gate)}</span>` : "";
  
  
const meta = [ f.std ? `<span class="std">STD ${esc(fmtTimeShort(f.std))}</span>` : "", routeDisplay(f) ? `<span>${esc(routeDisplay(f))}</span>` : "", gateEl, f.typeCode ? `<span class="type-code">${esc(f.aircraftType||"")}${f.aircraftType&&f.typeCode?" · ":""}${esc(f.typeCode)}</span>` : (f.aircraftType ? `<span class="type-code">${esc(f.aircraftType)}</span>` : "") ].filter(Boolean).join('<span class="dot"></span>');
  const nx = ""; 
  const isSelected = selectable && selectedFlights.has(f.id);
  const checkbox = selectable ? `<div class="select-check ${isSelected?"checked":""}" onclick="toggleFlightSelection(event,'${esc(f.id)}')"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></div>` : "";
const qrBtn = st === "done" ? `<button type="button" class="qr-chip-btn" onclick="event.stopPropagation(); showQrForFlightId('${esc(f.id)}')" title="Show WhatsApp QR"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v3M17 20h4M14 20h.01M20 20h.01"/></svg></button>` : "";
  return `<div class="flight ${stCls} ${isSelected?"selected":""}" data-fid="${esc(f.id)}" onclick="handleFlightCardClick(event,'${esc(f.id)}')">${checkbox}<div class="fnum"><div class="date">${esc(fmtDateShort(f.date))}</div><div class="fline"><span class="no">${esc(f.flightNumber)}</span>${regBadge}</div></div><div class="rail"></div><div class="body"><div class="meta-row">${meta}</div></div><div class="status"><div class="status-row"><span class="chip ${stCls}">${stLabel}</span>${qrBtn}</div>${nx ? `<span class="next">${nx}</span>` : ""}</div></div>`;
}
  async function openQuickGateModal(id, current){
  const gates = getMasterList("gates");
  openModal("Set gate", `
    <p style="font-size:13px;color:var(--ink-3);margin-top:0;">Choose from your saved gates or type a new one.</p>
    <div class="field"><label>Gate</label>
      ${datalistInput("qgInput", current||"", gates, "e.g. C04", 'maxlength="6" style="text-transform:uppercase;font-family:var(--mono);font-size:16px;font-weight:600;height:52px;"')}
      
      <div class="hint">Tap a suggestion or type your own.</div>
    </div>
  `, `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>${current ? `<button class="btn btn-danger" onclick="saveQuickGate('${esc(id)}','')">Remove gate</button>` : ""}<button class="btn btn-primary" onclick="saveQuickGate('${esc(id)}', document.getElementById('qgInput').value)">Save</button>`);
  setTimeout(() => { const inp = $("qgInput"); if(inp){ inp.focus(); inp.select(); } }, 80);
}
async function saveQuickGate(id, value){
  const v = String(value||"").toUpperCase().trim();
  try {
    await updateFlight(id, { gate: v });
    await audit(id, v ? "Gate set" : "Gate removed", { field:"gate", newValue: v, employee:"Current user" });
    closeModal();
    toast(v ? "Gate saved." : "Gate removed.");
    if(currentTab === "todayTab") renderToday();
    else if(currentTab === "allFlightsTab") renderAllFlights();
    else if(currentTab === "flightFileTab") renderFlightFile();
  } catch(e){ toast("Error: " + e.message); }
}

/* ============================================================
   Flight File
   ============================================================ */
async function openFlightFile(id){ currentFlightId = id; switchTab("flightFileTab"); }
async function renderFlightFile(){
  const host = $("flightFileContent"); if(!currentFlightId){ switchTab("todayTab"); return; }
  const f = await dbGet("flights", currentFlightId); if(!f){ switchTab("todayTab"); return; }
  const forms = await getFormsForFlight(currentFlightId); const status = flightOverallStatus(forms, f);
  const form = getCheckinForm(forms); const done = !!(form && form.status === "done"); const draft = !!(form && form.status === "in_progress");
  const data = (form && form.data) || {};
  $("screenTitle").textContent = f.flightNumber;
  $("crumb").innerHTML = `Flights <span style="opacity:.5">›</span> ${esc(f.flightNumber)}`;
  $("crumb").onclick = () => switchTab("allFlightsTab");
  const stLabel = status==="done"?"Completed":status==="cancelled"?"Cancelled":"Summary open";
  const stChipCls = status==="done"?"ok":status==="cancelled"?"":"warn";
  const typeDisplay = f.aircraftType ? `${esc(f.aircraftType)}${f.typeCode?` <span class="code">${esc(f.typeCode)}</span>`:""}` : "–";
  const summary = checkinSummary(data);
  const waInfo = form && form.waSentAt ? `<div style="color:var(--ink-3);font-size:11.5px;margin-top:6px;">WhatsApp message: <b>${new Date(form.waSentAt).toLocaleString("en-GB")}</b> (${relTime(form.waSentAt)})</div>` : "";
  const infoLine = done ? `Completed ${new Date(form.completedAt).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}${form.completedBy ? " · " + esc(form.completedBy) : ""}` : draft ? "Draft saved — continue editing." : CHECKIN.desc;
  host.innerHTML = `
    <div class="flight-head">
      <div class="top"><div><h1>${esc(f.flightNumber)} ${f.registration ? `<span class="reg">${esc(displayReg(f.registration))}</span>` : ""}</h1><div class="sub">${esc(fmtDateLong(f.date))}${routeDisplay(f) ? " · " + esc(routeDisplay(f)) : ""}</div></div><div class="actions"><button class="btn btn-secondary btn-sm" onclick="openEditFlightModal('${esc(f.id)}')">Edit</button><button class="btn btn-danger btn-sm" onclick="confirmDeleteFlight('${esc(f.id)}')">Delete</button></div></div>
      <div class="flight-meta"><div><div class="k">Gate</div><div class="v">${(data.gate || f.gate) ? `<span onclick="openQuickGateModal('${esc(f.id)}','${esc(data.gate || f.gate)}')" style="cursor:pointer;text-decoration:underline;text-decoration-style:dotted;text-underline-offset:3px;">${esc(data.gate || f.gate)}</span>` : `<span onclick="openQuickGateModal('${esc(f.id)}','')" style="cursor:pointer;color:var(--warn);font-weight:600;">+ Add gate</span>`}</div></div><div><div class="k">STD</div><div class="v">${esc(fmtTimeShort(f.std))}</div></div><div><div class="k">STA</div><div class="v">${esc(fmtTimeShort(f.sta))}</div></div><div><div class="k">Aircraft</div><div class="v">${typeDisplay}</div></div><div><div class="k">Config</div><div class="v">${esc(f.config||"–")}</div></div><div><div class="k">Route</div><div class="v">${esc(routeDisplay(f)||"–")}</div></div><div><div class="k">Status</div><div class="v" style="color:${status==="done"?"var(--ok)":"var(--ink-2)"}">${stLabel}</div></div></div>
    </div>
    <div class="card" style="margin-top:20px;"><div class="card-head"><h2>Flight Summary</h2><span class="chip ${stChipCls}">${done?"Completed":draft?"Draft":"Not started"}</span>${done ? `<button type="button" class="qr-inline-btn" onclick="showQrForFlightId('${esc(f.id)}')" title="Show WhatsApp QR"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v3M17 20h4M14 20h.01M20 20h.01"/></svg></button>` : ""}<div style="margin-left:auto;display:flex;gap:8px;">${form ? `<button class="btn btn-danger btn-sm" onclick="confirmDeleteSummary('${esc(f.id)}')">Delete summary</button>` : ""}<button class="btn btn-primary btn-sm" onclick="openCheckin()">${done?"View / edit":draft?"Continue":"Open"}</button></div></div><div class="card-body"><div style="color:var(--ink-3);font-size:13px;">${infoLine}</div>${waInfo}${summary.length ? `<div class="summary-chips">${summary.map(s => `<span class="s-chip">${esc(s)}</span>`).join("")}</div>` : ""}</div></div>
  `;
}
async function confirmDeleteSummary(fid){
  openModal("Delete summary", `<p style="font-size:13.5px;color:var(--ink-2);line-height:1.6;">This will delete the summary only. The flight stays and will show as <b>Summary open</b> again.</p>`, `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-danger-fill" onclick="doDeleteSummary('${esc(fid)}')">Delete summary</button>`);
}
async function doDeleteSummary(fid){
  const form = await getForm(fid, "checkin");
  if(form){ await dbDelete("forms", form.id); await audit(fid, "Summary deleted", { employee:"Current user" }); logEvent(`Summary deleted: ${fid}`); }
  closeModal(); toast("Summary deleted.");
  if(currentTab === "flightFileTab") renderFlightFile(); else if(currentTab === "todayTab") renderToday();
}
async function openCheckin(){ switchTab("checkinTab"); }

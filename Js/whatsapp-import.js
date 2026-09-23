/* ============================================================
   WhatsApp Import
   ============================================================ */
function parseSeatLine(line){
  const m = line.match(/^-?\s*`?(\d{1,3}[A-Z])`?\s*(?:\(_?([^)_]+)_?\))?/i);
  if(!m) return null;

  const seat = m[1].toUpperCase();
  const reasonText = (m[2] || "").trim();

  let reason = "";
  let other = "";

  if(reasonText === "UPGRADE") reason = "UPGRADE";
  else if(reasonText === "LM TKT") reason = "LM TKT";
  else if(reasonText === "STAFF") reason = "STAFF";
  else if(reasonText){
    reason = "Other";
    other = reasonText;
  }

  return { seat, reason, other };
}
function parseSpecialLine(qty, rest){
  let note = ""; const noteMatch = rest.match(/\s*\[([^\]]+)\]\s*$/); if(noteMatch){ note = noteMatch[1]; rest = rest.slice(0, noteMatch.index).trim(); }
  let meal = ""; const mealMatch = rest.match(/\s*\((NO MEAL|ECO MEAL)\)\s*$/); if(mealMatch){ meal = mealMatch[1]; rest = rest.slice(0, mealMatch.index).trim(); }
  let seat = ""; const seatMatch = rest.match(/\s+(\d{1,3}[A-Z])\s*$/); if(seatMatch){ seat = seatMatch[1]; rest = rest.slice(0, seatMatch.index).trim(); }
  const upgMatch = rest.match(/^(PAID|OPERATIONAL|OVERBOOK)\s+UPGRADE$/i);
  if(upgMatch) return { type:"Upgrade", qty:String(qty), reason:upgMatch[1].toUpperCase(), seat, meal: meal || "NO MEAL", note };
  if(/^(WCHR|WCHS|WCHC|BLND|DEAF|WCBD|WCBW|WCMP|WCOB)$/i.test(rest)) return { type:"PRM", qty:String(qty), code:rest.toUpperCase(), seat, note };
  if(/^[SR]\d[A-Z]$/i.test(rest)) return { type:"Staff", qty:String(qty), code:rest.toUpperCase(), seat, meal, note };
  return { type:"Other", qty:String(qty), code:rest.toUpperCase(), seat, note };
}
function parseCheckinMessage(text){
  const lines = String(text||"").split(/\r?\n/); const data = { specials: [], noMealC: [], noMealY: [] };
  let mode = null, currentSeatList = null;
  for(let i = 0; i < lines.length; i++){
    const raw = lines[i]; const line = raw.trim(); if(!line) continue;
    const headerMatch = line.match(/\*([A-Z]{2}\d+)\/(\d{2}[A-Z]{3})(?:\s*\|\s*(TC-?[A-Z]+))?\*/i);
    if(headerMatch){ data.flightNumber = headerMatch[1].toUpperCase(); data.dateCode = headerMatch[2].toUpperCase(); data.registration = headerMatch[3] ? headerMatch[3].toUpperCase().replace(/^TC-?/i,"") : ""; continue; }
    const gateMatch = line.match(/^\*?Gate:\*?\s*`?([^`]+)`?$/i);
if(gateMatch){
  data.gate = gateMatch[1].trim().toUpperCase();
  continue;
}

const regMatch = line.match(/^\*?REG:\*?\s*`?TC-?([A-Z0-9]+)`?/i);
if(regMatch){ data.registration = regMatch[1].toUpperCase(); continue; }

const acTypeMatch = line.match(/^\*?A\/C Type:\*?\s*`?([^`]+)`?/i);
if(acTypeMatch){ data.typeCode = acTypeMatch[1].trim().toUpperCase(); continue; }

const configMatch = line.match(/^\*?Config:\*?\s*`?([^`]+)`?/i);
if(configMatch){ data.config = configMatch[1].trim().toUpperCase(); continue; }
    if(/\*NEW FLIGHT PLAN\*/i.test(line)){ mode = "fp"; data.reqFp = "YES"; continue; }
    if(/\*CHECK-IN INFORMATION\*/i.test(line)){ mode = "ci"; continue; }
    if(/\*PASSENGER INFORMATION\*/i.test(line)){ mode = "pax"; continue; }
    if(/\*SPECIALS\*/i.test(line)){ mode = "specials"; continue; }
    if(/\*BAGGAGE INFORMATION\*/i.test(line)){ mode = "baggage"; continue; }
    if(/\*GENERAL INFORMATION\*/i.test(line)){ mode = "remarks"; continue; }
    if(mode === "fp"){
  let m;

  if(m = line.match(/^\*?Plan ID:\*?\s*`?([^`]+)`?$/i)){
    data.planId = m[1].trim();
    continue;
  }

  if(m = line.match(/^\*?AZFW:\*?\s*([\d.]+)t\s*->\s*\*?Diff:\*?\s*([\d.]+)t/i)){
    data.actZfw = m[1];
    data.fuelDiff = m[2];
    continue;
  }

  if(m = line.match(/^Request at\s+`?(\d{4})`?\s+via\s+(\w+)/i)){
    data.fpReqTime = m[1];
    data.fpMethod = m[2].toUpperCase();
    continue;
  }
}
    if(mode === "ci"){
  const closeMatch = line.match(/^\*?Check-In close time:\*?\s*`?(\d{4})LT`?\s*(?:\(_?([^)_]+)_?\))?/i);

  if(closeMatch){
    data.closeTime = closeMatch[1];

    const status = closeMatch[2] || "";
    const lateMatch = status.match(/Late Close\s*-\s*\d+\s*min late\s*-\s*(.+)/i);

    if(lateMatch){
      data.lateReason = lateMatch[1].trim();
    }

    continue;
  }
}
    if(mode === "pax"){
  let m;

  if(m = line.match(/^\*PAX\*\s*`?(\d+)C\/(\d+)Y\+(\d+)INF\s*=\s*TTL\s*(\d+)`?/i)){
    data.cPax = m[1];
    data.yPax = m[2];
    data.infPax = m[3];
    continue;
  }

  if(m = line.match(/^\*?Meal:\*?\s*`?(\d+)C\/(\d+)Y(?:\s*-\s*>\s*Missing:\s*(\d+)C\/(\d+)Y)?`?/i)){
    data.cMeal = m[1];
    data.yMeal = m[2];

    if(m[3] !== undefined) data.missingC = m[3];
    if(m[4] !== undefined) data.missingY = m[4];

    continue;
  }
      if(/^-\s*No Meal C\/CL:/i.test(line)){ currentSeatList = { key:"noMealC", meal:"NO MEAL" }; continue; }
      if(/^-\s*Eco Meal C\/CL:/i.test(line)){ currentSeatList = { key:"noMealC", meal:"ECO MEAL" }; continue; }
      if(/^-\s*No Meal Y\/CL:/i.test(line)){ currentSeatList = { key:"noMealY", meal:"NO MEAL" }; continue; }
      if(currentSeatList && /^\d{1,3}[A-Z]/i.test(line)){ const parsed = parseSeatLine(line); if(parsed){ data[currentSeatList.key].push({ seat: parsed.seat, reason: parsed.reason, other: parsed.other, upgradeReason:"", meal: currentSeatList.meal, staffCode:"" }); } continue; }
    }
    if(mode === "specials"){
  const m = line.match(/^(\d+)x\s+(.+)$/);
  if(m){
    const qty = parseInt(m[1],10);
    const rest = m[2].trim();

    const seatListMatch = rest.match(/^(.*?)\s+(\d{1,3}[A-Z](?:\s*,\s*\d{1,3}[A-Z])+)$/i);

    if(seatListMatch){
      const baseText = seatListMatch[1].trim();
      const seats = seatListMatch[2].split(/\s*,\s*/).map(s => s.toUpperCase());

      for(const seat of seats){
        const parsed = parseSpecialLine(1, `${baseText} ${seat}`);
        if(parsed) data.specials.push(parsed);
      }
    } else {
      const parsed = parseSpecialLine(qty, rest);
      if(parsed) data.specials.push(parsed);
    }

    continue;
  }
}
    if(mode === "baggage"){ let m; if(m = line.match(/^(\d+)x CBA/i)){ data.cba = m[1]; continue; } if(m = line.match(/^(\d+)x bags/i)){ data.loaded = m[1]; continue; } }
    if(mode === "remarks"){ data.remarks = (data.remarks ? data.remarks + "\n" : "") + raw.replace(/\s+$/,""); continue; }
  }
  if(!data.reqFp) data.reqFp = "NO"; if(!data.fpMethod) data.fpMethod = "ATOM";
  return data;
}
function resolveDateCandidates(dateCode){ if(!dateCode || dateCode.length !== 5) return []; const day = dateCode.slice(0,2); const mon = dateCode.slice(2,5).toUpperCase(); const monthIdx = MONTHS_UP.indexOf(mon); if(monthIdx < 0) return []; const year = new Date().getFullYear(); return [`${year}-${pad(monthIdx+1)}-${day}`, `${year-1}-${pad(monthIdx+1)}-${day}`, `${year+1}-${pad(monthIdx+1)}-${day}`]; }
async function findFlightForImport(flightNumber, dateCode){ const candidates = resolveDateCandidates(dateCode); for(const date of candidates){ const f = await dbGet("flights", dateFlightId(date, flightNumber)); if(f) return f; } return null; }
async function renderImportScreen(){
  const host = $("importContent");
  host.innerHTML = `
    <div style="margin-bottom:20px;"><h2 style="font-size:22px;font-weight:650;">WhatsApp Import</h2><div style="color:var(--ink-3);font-size:13.5px;margin-top:4px;">Paste a flight summary message from WhatsApp to save or update the flight on this device.</div></div>
    <div class="import-info"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8v.01M11 12h1v4h1"/></svg><div>Copy the whole message in WhatsApp (<b>tap and hold → Copy</b>), paste it below, and pick the time the message was sent. That time is used as the "last update" so your colleagues' merges stay correct.</div></div>
    <div class="card" style="margin-bottom:16px;"><div class="card-head"><h2>Message</h2><span class="chip info" id="importCharCount">0 chars</span></div><div class="card-body">
      <div class="field"><label>Paste message</label><textarea id="importText" rows="12" placeholder="e.g. Paste the flight summary message here..."></textarea></div>
      <div class="field" style="margin-top:12px;"><label>Time the message was sent <span class="opt">· WhatsApp timestamp</span></label><input type="datetime-local" id="importSentAt"><div class="hint">Check the time shown next to the message in WhatsApp. If unsure, leave as now.</div></div>
      <div style="display:flex;gap:8px;margin-top:14px;justify-content:flex-end;flex-wrap:wrap;"><button class="btn btn-secondary" onclick="clearImport()">Clear</button><button class="btn btn-primary" onclick="previewImportMessage()">Analyze</button></div>
    </div></div>
    <div id="importPreview"></div><div id="importActions"></div>
  `;
  const ta = $("importText"); const dt = $("importSentAt");
  const now = new Date(); const local = new Date(now.getTime() - now.getTimezoneOffset()*60000).toISOString().slice(0,16);
  dt.value = local;
  ta.addEventListener("input", () => { $("importCharCount").textContent = ta.value.length + " chars"; });
  ta.focus();
}
function clearImport(){ const ta = $("importText"); if(ta){ ta.value = ""; ta.focus(); } const cnt = $("importCharCount"); if(cnt) cnt.textContent = "0 chars"; const pv = $("importPreview"); if(pv) pv.innerHTML = ""; const ac = $("importActions"); if(ac) ac.innerHTML = ""; }
async function previewImportMessage(){
  const text = $("importText").value; if(!text.trim()){ toast("Paste a message first."); return; }
  let data; try { data = parseCheckinMessage(text); } catch(e){ toast("Parse error: " + e.message); return; }
  if(!data.flightNumber || !data.dateCode){ toast("Could not detect flight number or date."); return; }
  const candidates = resolveDateCandidates(data.dateCode); if(!candidates.length){ toast("Invalid date code: " + data.dateCode); return; }
  const existing = await findFlightForImport(data.flightNumber, data.dateCode);
  const chosenDate = existing ? existing.date : candidates[0];
  const existingForm = existing ? await getForm(existing.id, "checkin") : null;
  let chipCls, chipTxt;
  if(!existing){ chipCls = "warn"; chipTxt = "New flight will be created"; }
  else if(!existingForm){ chipCls = "info"; chipTxt = "Flight found — summary will be added"; }
  else if(existingForm.status === "done"){ chipCls = "danger"; chipTxt = "Flight found — existing summary will be overwritten"; }
  else { chipCls = "warn"; chipTxt = "Flight found — draft will be overwritten"; }
  const pax = (Number(data.cPax)||0) + (Number(data.yPax)||0) + (Number(data.infPax)||0);
  const specialsCount = (data.specials||[]).length;
  const noMealCount = (data.noMealC||[]).length + (data.noMealY||[]).length;
  $("importPreview").innerHTML = `<div class="card"><div class="card-head"><h2>Detected data</h2><span class="chip ${chipCls}">${esc(chipTxt)}</span></div><div class="card-body"><div class="flight-meta" style="margin-top:0;padding-top:0;border-top:0;"><div><div class="k">Flight</div><div class="v">${esc(data.flightNumber)}</div></div><div><div class="k">Date</div><div class="v">${esc(fmtDate(chosenDate))}</div></div><div><div class="k">Registration</div><div class="v">${esc(data.registration ? displayReg(data.registration) : "–")}</div></div><div><div class="k">Gate</div><div class="v">${esc(data.gate||"–")}</div></div><div><div class="k">Close time</div><div class="v">${esc(data.closeTime ? fmtTimeShort(data.closeTime)+"L" : "–")}</div></div><div><div class="k">Passengers</div><div class="v">${pax ? `${Number(data.cPax)||0}C/${Number(data.yPax)||0}Y+${Number(data.infPax)||0}INF` : "–"}</div></div><div><div class="k">Specials / No-meal</div><div class="v">${specialsCount} / ${noMealCount}</div></div></div><details style="margin-top:14px;"><summary style="cursor:pointer;font-size:13px;font-weight:600;color:var(--ink-2);">Show raw JSON</summary><div class="preview-block" style="margin-top:8px;">${esc(JSON.stringify(data, null, 2))}</div></details></div></div>`;
  $("importActions").innerHTML = `<div class="action-bar" style="margin-top:14px;position:sticky;"><button class="btn btn-secondary" onclick="clearImport()">Cancel</button><div class="spacer"></div><button class="btn btn-primary" onclick="confirmImport('${esc(chosenDate)}','${esc(existing ? existing.id : "")}')">Save to flight</button></div>`;
  $("importPreview").scrollIntoView({ behavior:"smooth", block:"start" });
}
async function confirmImport(date, existingId){
  const text = $("importText").value; if(!text.trim()){ toast("Paste a message first."); return; }
  let data; try { data = parseCheckinMessage(text); } catch(e){ toast("Parse error: " + e.message); return; }
  const sentAtRaw = $("importSentAt")?.value;
  let sentAt = sentAtRaw ? new Date(sentAtRaw).toISOString() : nowISO();
  if(new Date(sentAt).getTime() > Date.now() + 5 * 60 * 1000) sentAt = nowISO();
  try {
    let flight = existingId ? await dbGet("flights", existingId) : await findFlightForImport(data.flightNumber, data.dateCode);
    if(flight){
      const existingForm = await getForm(flight.id, "checkin");
      if(existingForm && existingForm.status === "done"){
        showImportConflictDialog(flight, data, sentAt, existingForm);
        return;
      }
    }
    await doImport(flight, data, date, sentAt);
  } catch(e){ toast("Import failed: " + e.message); }
}
function showImportConflictDialog(flight, data, sentAt, existingForm){
  window.__conflictFlight = flight; window.__conflictData = data; window.__conflictSentAt = sentAt; window.__conflictDate = flight.date;
  const oldPax = `${Number(existingForm.data?.cPax)||0}C/${Number(existingForm.data?.yPax)||0}Y+${Number(existingForm.data?.infPax)||0}INF`;
  const newPax = `${Number(data.cPax)||0}C/${Number(data.yPax)||0}Y+${Number(data.infPax)||0}INF`;
  openModal("Summary already exists", `
    <div class="inline-notice warn" style="margin-top:0;">This flight already has a completed summary. Importing will <b>overwrite</b> it.</div>
    <div class="merge-compare">
      <div class="merge-card"><h4>Current summary<span style="font-weight:500;text-transform:none;color:var(--ink-3);font-size:11.5px;">${esc(relTime(existingForm.completedAt || existingForm.updatedAt))}</span></h4>
        <div class="row"><div class="k">Close</div><div class="v">${esc(existingForm.data?.closeTime ? fmtTimeShort(existingForm.data.closeTime) + "L" : "–")}</div></div>
        <div class="row"><div class="k">Pax</div><div class="v">${esc(oldPax)}</div></div>
        <div class="row"><div class="k">Meals</div><div class="v">${esc((Number(existingForm.data?.cMeal)||0)+"C/"+(Number(existingForm.data?.yMeal)||0)+"Y")}</div></div>
      </div>
      <div class="merge-card newer"><h4>From WhatsApp<span style="font-weight:500;text-transform:none;color:var(--info);font-size:11.5px;">${esc(relTime(sentAt))}</span></h4>
        <div class="row"><div class="k">Close</div><div class="v">${esc(data.closeTime ? fmtTimeShort(data.closeTime) + "L" : "–")}</div></div>
        <div class="row"><div class="k">Pax</div><div class="v">${esc(newPax)}</div></div>
        <div class="row"><div class="k">Meals</div><div class="v">${esc((Number(data.cMeal)||0)+"C/"+(Number(data.yMeal)||0)+"Y")}</div></div>
      </div>
    </div>
  `, `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="runImportOverwrite()">Overwrite with WhatsApp</button>`, { wide:true });
}
async function runImportOverwrite(){
  const flight = window.__conflictFlight, data = window.__conflictData, sentAt = window.__conflictSentAt, date = window.__conflictDate;
  closeModal();
  await doImport(flight, data, date, sentAt);
}
async function doImport(flight, data, date, sentAt){
  try {
    if(!flight){
  flight = await createFlight({
    date,
    flightNumber: data.flightNumber,
    registration: data.registration || "",
    gate: data.gate || "",
    typeCode: data.typeCode || "",
    config: data.config || ""
  });
}
    else {
      const updates = {};
      if(data.registration && data.registration !== flight.registration) updates.registration = data.registration;
      if(data.gate && data.gate !== flight.gate) updates.gate = data.gate;
      if(Object.keys(updates).length) await updateFlight(flight.id, updates);
    }
    let form = await getForm(flight.id, "checkin");
    if(!form){ form = { id:uid("form"), flightId:flight.id, flightPhase:`${flight.id}__checkin`, phase:"checkin", status:"done", data, createdAt: sentAt, updatedAt: sentAt }; }
    else { form.data = data; form.status = "done"; form.updatedAt = sentAt; }
    form.completedAt = sentAt; form.completedBy = "WhatsApp import"; form.waSentAt = sentAt;
    await dbPut("forms", form);
    await audit(flight.id, "Flight summary imported from WhatsApp", { employee: "WhatsApp import" });
    logEvent(`WhatsApp import: ${flight.flightNumber} (${flight.date})`);
    toast("Imported: " + flight.flightNumber + " · " + fmtDate(flight.date));
    currentFlightId = flight.id; switchTab("flightFileTab");
  } catch(e){ toast("Import failed: " + e.message); }
}

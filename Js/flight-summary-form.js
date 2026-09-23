/* ============================================================
   Flight Summary Form
   ============================================================ */
function yesNoHtml(id, value){ const v = value || ""; return `<div class="yn" data-yn="${id}"><button type="button" class="${v==="YES"?"on-yes":""}" data-yn-val="YES">YES</button><button type="button" class="${v==="NO"?"on-no":""}" data-yn-val="NO">NO</button></div><input type="hidden" id="${id}" value="${esc(v)}">`; }
function renderCheckinForm(f, d){
  const d0 = d || {};
  const reqFp = d0.reqFp === "YES";
  const fpMethod = d0.fpMethod || "ATOM";
 
  return `
    <div class="form-section">
      <div class="form-section-head">
        <div><h3>Flight &amp; summary closure</h3></div>
      </div>
      <div class="form-section-body">
        <div class="form-grid">
          <div class="field">
            <label>STD</label>
            <input type="text" value="${esc(fmtTimeShort(f.std))}" readonly>
          </div>
          <div class="field">
            <label>Gate</label>
            ${datalistInput("ci_gate", (d0.gate || f.gate || "").toUpperCase(), getMasterList("gates"), "e.g. C04", 'style="text-transform:uppercase"')}
          </div>
          <div class="field full">
            <label>Check-in closed (HHMM)</label>
            <input type="text" id="ci_closeTime" value="${esc(d0.closeTime||"")}" maxlength="4" inputmode="numeric" placeholder="e.g. 0610">
          </div>
        </div>
        <div id="ci_closeStatus"></div>
        <div id="ci_lateReasonBox" hidden style="margin-top:12px;">
          <div class="field">
            <label>Reason for late closure <span class="opt">· required</span></label>
            <input type="text" id="ci_lateReason" value="${esc(d0.lateReason||"")}" placeholder="e.g. medical">
          </div>
        </div>
      </div>
    </div>
 
    <div class="form-section">
      <div class="form-section-head">
        <div><h3>Flight plan</h3></div>
      </div>
      <div class="form-section-body">
        <div class="row-yn">
          <div class="label">New flight plan requested</div>
          ${yesNoHtml("ci_reqFp", d0.reqFp)}
        </div>
 
        <div id="ci_fpDetails" ${reqFp ? "" : "hidden"} style="margin-top:14px;">
 
          <div class="form-grid three">
 
            <div class="field">
              <label>Plan ID</label>
              <input type="number" id="ci_planId" min="0" value="${esc(d0.planId||"")}" placeholder="e.g. 5">
            </div>
 
            <div class="field">
              <label>Actual ZFW</label>
              <div style="display:flex;flex-direction:column;gap:6px;">
                <input
                  type="text"
                  id="ci_actZfw"
                  value="${esc(formatMassDisplay(d0.actZfw, d0.actZfwUnit || "t"))}"
                  inputmode="decimal"
                  placeholder="e.g. 70,8"
                  data-mass-unit="${esc(d0.actZfwUnit||"t")}"
                  style="width:100%;"
                >
                <div class="method-toggle" style="width:100%;">
  <input type="hidden" id="ci_actZfwUnit" value="${esc(d0.actZfwUnit||"t")}">
  <button type="button" class="method-btn ${(d0.actZfwUnit||"t")==="t"?"active":""}" data-method="t">Tonnen</button>
  <button type="button" class="method-btn ${(d0.actZfwUnit||"t")==="l"?"active":""}" data-method="l">Liter</button>
</div>
              </div>
            </div>
 
            <div class="field">
              <label>Fuel difference</label>
              <div style="display:flex;flex-direction:column;gap:6px;">
                <input
                  type="text"
                  id="ci_fuelDiff"
                  value="${esc(formatMassDisplay(d0.fuelDiff, d0.fuelDiffUnit || "t"))}"
                  inputmode="decimal"
                  placeholder="e.g. 1,2"
                  data-mass-unit="${esc(d0.fuelDiffUnit||"t")}"
                  style="width:100%;"
                >
                <div class="method-toggle" style="width:100%;">
                  <input type="hidden" id="ci_fuelDiffUnit" value="${esc(d0.fuelDiffUnit||"t")}"><button type="button" class="method-btn ${(d0.fuelDiffUnit||"t")==="t"?"active":""}" data-method="t">Tonnen</button>
                  <button type="button" class="method-btn ${(d0.fuelDiffUnit||"t")==="l"?"active":""}" data-method="l">Liter</button>
                </div>
              </div>
            </div>
 
          </div>
 
          <div class="form-grid" style="margin-top:12px;">
            <div class="field">
              <label>Request time (HHMM)</label>
              <input type="text" id="ci_fpReqTime" value="${esc(d0.fpReqTime||"")}" maxlength="4" inputmode="numeric" placeholder="e.g. 1745">
            </div>
 
            <div class="field">
              <label>Method</label>
              <input type="hidden" id="ci_fpMethod" value="${esc(fpMethod)}">
              <div class="method-toggle">
                <button type="button" class="method-btn ${fpMethod==="ATOM" ? "active" : ""}" data-method="ATOM">ATOM</button>
                <button type="button" class="method-btn ${fpMethod==="TEL" ? "active" : ""}" data-method="TEL">TEL</button>
              </div>
            </div>
          </div>
 
        </div>
      </div>
    </div>
 
    <div class="form-section">
      <div class="form-section-head">
        <div><h3>Passenger information</h3></div>
      </div>
      <div class="form-section-body">
        <div class="form-grid three">
          <div class="field">
            <label>Business PAX</label>
            <input type="number" id="ci_cPax" min="0" value="${esc(d0.cPax||"")}" placeholder="e.g. 12">
          </div>
          <div class="field">
            <label>Economy PAX</label>
            <input type="number" id="ci_yPax" min="0" value="${esc(d0.yPax||"")}" placeholder="e.g. 145">
          </div>
          <div class="field">
            <label>INF</label>
            <input type="number" id="ci_infPax" min="0" value="${esc(d0.infPax||"")}" placeholder="e.g. 3">
          </div>
        </div>
 
        <div id="ci_mealNotice"></div>
 
        <div class="form-grid two" style="margin-top:12px;">
          <div class="field">
            <label>Business Meal</label>
            <input type="number" id="ci_cMeal" min="0" value="${esc(d0.cMeal||"")}" placeholder="e.g. 10">
          </div>
          <div class="field">
            <label>Economy Meal</label>
            <input type="number" id="ci_yMeal" min="0" value="${esc(d0.yMeal||"")}" placeholder="e.g. 143">
          </div>
        </div>
 
        <div id="ci_noMealC"></div>
        <div id="ci_noMealY"></div>
      </div>
    </div>
 
    <div class="form-section">
      <div class="form-section-head">
        <div><h3>Specials</h3></div>
      </div>
      <div class="form-section-body">
        <div id="ci_specialsList"></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="addSpecialRow('PRM')">+ PRM</button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="addSpecialRow('Staff')">+ Staff</button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="addSpecialRow('Upgrade')">+ Upgrade</button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="addSpecialRow('Other')">+ Other</button>
        </div>
      </div>
    </div>
 
    <div class="form-section">
      <div class="form-section-head">
        <div><h3>Baggage &amp; remarks</h3></div>
      </div>
      <div class="form-section-body">
        <div class="form-grid two">
          <div class="field">
            <label>CBA</label>
            <input type="number" id="ci_cba" min="0" value="${esc(d0.cba||"")}" placeholder="e.g. 45">
          </div>
          <div class="field">
            <label>Bags</label>
            <input type="number" id="ci_loaded" min="0" value="${esc(d0.loaded||"")}" placeholder="e.g. 212">
          </div>
        </div>
 
        <div class="field" style="margin-top:12px;">
          <label>Remarks</label>
          <textarea id="ci_remarks" rows="3" placeholder="Additional information">${esc(d0.remarks||"")}</textarea>
        </div>
      </div>
    </div>
  `;
}
function updateCloseStatus(){
  const box = $("ci_closeStatus"); const reasonBox = $("ci_lateReasonBox"); if(!box) return;
  const close = ($("ci_closeTime")?.value || "").replace(/[^\d]/g,""); const std = window.__currentStd || ""; const diff = closeDiff(close, std);
  if(!close || diff === null){ box.innerHTML = ""; if(reasonBox) reasonBox.hidden = true; return; }
  if(diff >= 60){ box.innerHTML = `<div class="inline-notice ok">On time · ${diff} min before STD</div>`; if(reasonBox) reasonBox.hidden = true; }
  else { const late = Math.abs(diff - 60); box.innerHTML = `<div class="inline-notice warn">Late close · ${late} min late — please provide a reason below</div>`; if(reasonBox) reasonBox.hidden = false; }
}
function collectNoMealRows(cls){
  const container = document.querySelector(`.seat-tiles[data-nomeal="${cls}"]`);
  if(!container) return window.__noMealData && window.__noMealData[cls] ? window.__noMealData[cls] : [];
  return [...container.querySelectorAll(".seat-tile")].map((tile, i) => {
    const seat = (tile.querySelector(".nm-seat")?.value || "").trim().toUpperCase();
    const reason = tile.querySelector(".nm-reason")?.value || "";
    const other = (tile.querySelector(".nm-other")?.value || "").trim();
    const staffCode = (tile.querySelector(".nm-staff")?.value || "").trim().toUpperCase();
    const prev = window.__noMealData && window.__noMealData[cls] && window.__noMealData[cls][i];
    const upgradeReason = (reason === "UPGRADE" && prev && prev.upgradeReason) ? prev.upgradeReason : "";
    let meal = (prev && prev.meal) ? prev.meal : "";
    if(cls === "Y") meal = "NO MEAL";
    if(cls === "C" && (reason === "LM TKT" || reason === "Other" || reason === "STAFF") && !meal) meal = "NO MEAL";
    return { seat, reason, other, upgradeReason, meal, staffCode };
  });
}
function seatTileHtml(cls, idx, r){
  const r0 = r || {}; const reason = r0.reason || ""; const isUpgrade = reason === "UPGRADE"; const isBusiness = cls === "C"; const isStaff = reason === "STAFF";
  const showMealChoice = isBusiness && (reason === "LM TKT" || reason === "STAFF" || reason === "Other");
  const showOtherText = reason === "Other";
  const showStaffCode = isStaff;
  let meal = r0.meal || ""; if(cls === "Y") meal = "NO MEAL"; if(isBusiness && (reason === "LM TKT" || reason === "Other") && !meal) meal = "NO MEAL"; if(isBusiness && isStaff && !meal) meal = "NO MEAL";
  const upgradeInfo = (isUpgrade && r0.upgradeReason) ? `<div class="upgr-info" style="margin-top:6px;font-size:11.5px;color:var(--ink-3);">Upgrade · ${esc(r0.upgradeReason)} · ${esc(r0.meal || "NO MEAL")} <button type="button" onclick="openUpgradeModal('${cls}', ${idx})" style="display:inline-flex;margin-left:6px;color:var(--brand);font-weight:600;">Edit</button></div>` : "";
const staffInfo = (isStaff && r0.staffCode) ? `<div class="staff-info" style="margin-top:6px;font-size:11.5px;color:var(--ink-3);">Staff · ${esc(r0.staffCode)} · ${esc(r0.meal || "NO MEAL")}</div>` : "";
  const mealChoiceHtml = showMealChoice ? `<div class="meal-choice"><button type="button" class="mc-btn ${meal==="NO MEAL"?"active-no":""}" data-nm-meal="NO MEAL" data-nm-cls="${cls}" data-nm-idx="${idx}">No meal</button><button type="button" class="mc-btn ${meal==="ECO MEAL"?"active-eco":""}" data-nm-meal="ECO MEAL" data-nm-cls="${cls}" data-nm-idx="${idx}">Eco meal</button></div>` : "";
  const otherTextHtml = showOtherText ? `<div class="mini-field" style="margin-top:6px;"><label>Other reason</label><input type="text" class="nm-other" value="${esc(r0.other||"")}" placeholder="e.g. medical" data-nm-cls="${cls}" data-nm-idx="${idx}"></div>` : `<input type="text" class="nm-other" value="" hidden>`;
  const staffCodeHtml = showStaffCode ? `<div class="mini-field" style="margin-top:6px;"><label>Staff code</label>${datalistInput(`nm_staff_${cls}_${idx}`, r0.staffCode||"", getMasterList("staffCodes"), "e.g. S1A", `class="nm-staff" data-nm-cls="${cls}" data-nm-idx="${idx}" style="text-transform:uppercase"`)}</div>` : "";
  const reasonOptions = isBusiness
    ? `<option value="">— Reason (optional) —</option><option value="UPGRADE" ${reason==="UPGRADE"?"selected":""}>UPGRADE</option><option value="LM TKT" ${reason==="LM TKT"?"selected":""}>LM TKT</option><option value="STAFF" ${reason==="STAFF"?"selected":""}>STAFF</option><option value="Other" ${reason==="Other"?"selected":""}>Other</option>`
    : `<option value="">— Reason (optional) —</option><option value="LM TKT" ${reason==="LM TKT"?"selected":""}>LM TKT</option><option value="STAFF" ${reason==="STAFF"?"selected":""}>STAFF</option><option value="Other" ${reason==="Other"?"selected":""}>Other</option>`;
  return `<div class="seat-tile" data-nm-cls="${cls}" data-nm-idx="${idx}">
    <div class="seat-head"><span class="n">${cls} seat ${idx+1}</span></div>
    <div class="mini-field"><label>Seat</label><input type="text" class="seat-no nm-seat" value="${esc(r0.seat||"")}" maxlength="4" placeholder="e.g. 12a" data-nm-cls="${cls}" data-nm-idx="${idx}"></div>
    <select class="nm-reason" data-nm-cls="${cls}" data-nm-idx="${idx}">${reasonOptions}</select>
  ${mealChoiceHtml}
  ${staffCodeHtml}
  ${otherTextHtml}
  ${upgradeInfo}
  ${staffInfo}
</div>`;
}
function refreshStaffInfo(cls, idx){
  const tile = document.querySelector(`.seat-tile[data-nm-cls="${cls}"][data-nm-idx="${idx}"]`);
  if(!tile) return;
  const reasonSel = tile.querySelector(".nm-reason");
  const staffInp = tile.querySelector(".nm-staff");
  const show = reasonSel && reasonSel.value === "STAFF" && staffInp && staffInp.value.trim() !== "";
  let info = tile.querySelector(".staff-info");
  if(!show){ if(info) info.remove(); return; }
  const cur = (window.__noMealData && window.__noMealData[cls] && window.__noMealData[cls][idx]) || {};
  if(!info){
    info = document.createElement("div");
    info.className = "staff-info";
    info.style.cssText = "margin-top:6px;font-size:11.5px;color:var(--ink-3);";
    tile.appendChild(info);
  }
  info.textContent = `Staff · ${cur.staffCode || ""} · ${cur.meal || "NO MEAL"}`;
}
async function syncNoMealSection(cls, expected){
  const body = $(`ci_noMeal${cls}`); if(!body) return;
  if(expected === 0){ body.innerHTML = ""; if(window.__noMealData) window.__noMealData[cls] = []; return; }
  if(!window.__noMealData) window.__noMealData = { C:[], Y:[] };
  if(!window.__noMealData[cls]) window.__noMealData[cls] = [];
  const prev = window.__noMealData[cls] || []; const newData = [];
  for(let i = 0; i < expected; i++){ const p = prev[i] || {}; const item = { seat: p.seat||"", reason: p.reason||"", other: p.other||"", upgradeReason: p.upgradeReason||"", meal: p.meal||"", staffCode: p.staffCode||"" }; if(cls === "Y" && !item.meal) item.meal = "NO MEAL"; newData.push(item); }
  window.__noMealData[cls] = newData;
  body.innerHTML = `<div class="seat-tiles" data-nomeal="${cls}">${newData.map((r, i) => seatTileHtml(cls, i, r)).join("")}</div>`;
}
async function updateMealNotice(){
  const box = $("ci_mealNotice"); if(!box) return;
  const cPax = Number($("ci_cPax")?.value)||0; const yPax = Number($("ci_yPax")?.value)||0;
  const cMealRaw = $("ci_cMeal")?.value ?? ""; const yMealRaw = $("ci_yMeal")?.value ?? "";
  const cMeal = Number(cMealRaw)||0; const yMeal = Number(yMealRaw)||0;
  const missC = Math.max(0, cPax - cMeal); const missY = Math.max(0, yPax - yMeal);
  const cMealEntered = String(cMealRaw) !== ""; const yMealEntered = String(yMealRaw) !== "";
  const showC = cMealEntered && missC > 0; const showY = yMealEntered && missY > 0;
  const parts = []; if(showC) parts.push(`Business ${missC} meal${missC===1?"":"s"}`); if(showY) parts.push(`Economy ${missY} meal${missY===1?"":"s"}`);
  if(parts.length === 0){ if(cMealEntered && yMealEntered && (cPax || yPax)) box.innerHTML = `<div class="inline-notice ok">All meals covered.</div>`; else box.innerHTML = ""; }
  else box.innerHTML = `<div class="inline-notice warn">Shortage · ${parts.join(", ")}. Assign a seat to every missing meal below.</div>`;
  await syncNoMealSection("C", showC ? missC : 0); await syncNoMealSection("Y", showY ? missY : 0);
}
document.addEventListener("change", e => {
  const sel = e.target.closest(".nm-reason"); if(!sel) return;
  const tile = sel.closest(".seat-tile"); if(!tile) return;
  const cls = tile.dataset.nmCls; const idx = Number(tile.dataset.nmIdx); const reason = sel.value;
  if(!window.__noMealData) window.__noMealData = { C:[], Y:[] };
  if(!window.__noMealData[cls]) window.__noMealData[cls] = [];
  const prev = window.__noMealData[cls][idx] || {};
  if(reason === "UPGRADE" && cls === "C"){ window.__noMealData[cls][idx] = { ...prev, reason:"UPGRADE" }; openUpgradeModal(cls, idx); return; }
  let meal = prev.meal || "";
  if(cls === "C" && (reason === "LM TKT" || reason === "Other" || reason === "STAFF")) { if(!meal) meal = "NO MEAL"; }
  if(cls === "C" && reason !== "LM TKT" && reason !== "Other" && reason !== "STAFF") meal = "";
  if(cls === "Y") meal = "NO MEAL";
  window.__noMealData[cls][idx] = { ...prev, reason, meal, staffCode: prev.staffCode || "" };
  const temp = document.createElement("div"); temp.innerHTML = seatTileHtml(cls, idx, window.__noMealData[cls][idx]);
  tile.replaceWith(temp.firstElementChild); refreshPreviewSoon();
});
document.addEventListener("click", e => {
  const btn = e.target.closest(".mc-btn"); if(!btn) return; e.preventDefault();
  const cls = btn.dataset.nmCls; const idx = Number(btn.dataset.nmIdx); const val = btn.dataset.nmMeal;
  if(!window.__noMealData) window.__noMealData = { C:[], Y:[] };
  if(!window.__noMealData[cls]) window.__noMealData[cls] = [];
  const prev = window.__noMealData[cls][idx] || {}; window.__noMealData[cls][idx] = { ...prev, meal: val };
  const tile = btn.closest(".seat-tile"); if(tile){ tile.querySelectorAll(".mc-btn").forEach(b => { b.classList.remove("active-no","active-eco"); if(b.dataset.nmMeal === val){ if(val === "NO MEAL") b.classList.add("active-no"); else if(val === "ECO MEAL") b.classList.add("active-eco"); } }); }
  refreshStaffInfo(cls, idx);
  refreshPreviewSoon();
});
document.addEventListener("input", e => {
  const t = e.target; if(!t) return;
  if(t.closest && t.closest(".seat-tile")){
    if(t.classList && (t.classList.contains("nm-staff") || t.classList.contains("nm-other") || t.classList.contains("nm-seat"))){
      const cls = t.dataset.nmCls; const idx = Number(t.dataset.nmIdx);
      if(cls && !isNaN(idx)){
        if(!window.__noMealData) window.__noMealData = { C:[], Y:[] };
        if(!window.__noMealData[cls]) window.__noMealData[cls] = [];
        const prev = window.__noMealData[cls][idx] || {};
        if(t.classList.contains("nm-staff")){ window.__noMealData[cls][idx] = { ...prev, staffCode: t.value.trim().toUpperCase() }; refreshStaffInfo(cls, idx); }
        else if(t.classList.contains("nm-other")) window.__noMealData[cls][idx] = { ...prev, other: t.value };
        else window.__noMealData[cls][idx] = { ...prev, seat: t.value.trim().toUpperCase() };
      }
    }
    refreshPreviewSoon();
  }
});
function openUpgradeModal(cls, idx){
  const seatInput = document.querySelector(`.seat-tile[data-nm-cls="${cls}"][data-nm-idx="${idx}"] .nm-seat`);
  const seat = seatInput ? seatInput.value.trim().toUpperCase() : "";
  const prev = (window.__noMealData && window.__noMealData[cls] && window.__noMealData[cls][idx]) || {};
  const upgradeReason = prev.upgradeReason || "PAID"; const meal = prev.meal || "NO MEAL";
  openModal("Upgrade details", `<div class="form-grid"><div class="field full"><label>Seat</label><input type="text" id="upgSeat" value="${esc(seat)}" maxlength="4" placeholder="e.g. 1A" style="text-transform:uppercase"></div><div class="field full"><label>Upgrade reason</label><select id="upgReason">${UPGRADE_REASONS.map(r => `<option ${upgradeReason===r?"selected":""}>${esc(r)}</option>`).join("")}</select></div><div class="field full"><label>Passenger receives</label><div class="yn" data-meal-choice="upgMeal"><button type="button" class="${meal==="NO MEAL"?"on-no":""}" data-val="NO MEAL" style="flex:1;">No meal</button><button type="button" class="${meal==="ECO MEAL"?"on-eco":""}" data-val="ECO MEAL" style="flex:1;">Eco meal</button></div><input type="hidden" id="upgMeal" value="${esc(meal)}"></div></div>`, `<button class="btn btn-secondary" onclick="cancelUpgradeModal('${cls}', ${idx})">Cancel</button><button class="btn btn-primary" onclick="confirmUpgradeModal('${cls}', ${idx})">Save</button>`);
}
function cancelUpgradeModal(cls, idx){ const sel = document.querySelector(`.seat-tile[data-nm-cls="${cls}"][data-nm-idx="${idx}"] .nm-reason`); if(sel){ const prev = (window.__noMealData && window.__noMealData[cls] && window.__noMealData[cls][idx]) || {}; sel.value = prev.reason || ""; } closeModal(); }
async function confirmUpgradeModal(cls, idx){
  const seat = ($("upgSeat").value || "").trim().toUpperCase(); const upgradeReason = $("upgReason").value; const meal = $("upgMeal").value || "NO MEAL";
  closeModal();
  const tile = document.querySelector(`.seat-tile[data-nm-cls="${cls}"][data-nm-idx="${idx}"]`); if(!tile) return;
  if(!window.__noMealData) window.__noMealData = { C:[], Y:[] };
  if(!window.__noMealData[cls]) window.__noMealData[cls] = [];
  const prev = window.__noMealData[cls][idx] || {};
  window.__noMealData[cls][idx] = { ...prev, seat, reason:"UPGRADE", upgradeReason, meal };
  const seatInput = tile.querySelector(".nm-seat"); if(seatInput) seatInput.value = seat;
  let infoDiv = tile.querySelector(".upgr-info");
  if(!infoDiv){ infoDiv = document.createElement("div"); infoDiv.className = "upgr-info"; infoDiv.style.cssText = "margin-top:6px;font-size:11.5px;color:var(--ink-3);"; tile.appendChild(infoDiv); }
  infoDiv.innerHTML = `Upgrade · ${esc(upgradeReason)} · ${esc(meal)} <button type="button" onclick="openUpgradeModal('${cls}', ${idx})" style="display:inline-flex;margin-left:6px;color:var(--brand);font-weight:600;">Edit</button>`;
  const specials = collectSpecials();
  const existing = specials.findIndex(s => s.type === "Upgrade" && s.seat === seat);
  const newSpecial = { type:"Upgrade", qty:"1", reason:upgradeReason, seat, meal };
  if(existing >= 0) specials[existing] = newSpecial; else specials.push(newSpecial);
  rerenderSpecials(specials); refreshPreview();
}
function addSpecialRow(type, prefill){ const list = collectSpecials(); const init = prefill || { type, qty:"1", seat:"" }; list.push(init); rerenderSpecials(list); refreshPreviewSoon(); }
function rerenderSpecials(list){ const container = $("ci_specialsList"); if(!container) return; container.innerHTML = list.map((r, i) => specialRowHtml(i, r)).join(""); }
function specialRowHtml(idx, r){
  const r0 = r || {}; const type = r0.type || "PRM"; const qty = r0.qty || "1";
  const note = r0.note || ""; const noteHidden = note ? "" : "hidden"; const noteBtnActive = note ? "active" : "";
  const noteButton = `<button type="button" class="note-btn ${noteBtnActive}" onclick="toggleSpecialNote(${idx})">Note</button>`;
  const noteInput = `<input type="text" class="d-other sp-note" value="${esc(note)}" placeholder="e.g. no nuts" data-sp-idx="${idx}" ${noteHidden} style="flex:1;min-width:140px;">`;
  const removeBtn = `<button type="button" class="rm" onclick="removeSpecial(${idx})" title="Remove"><svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6"/></svg></button>`;
  if(type === "PRM") return `<div class="dynamic-row" data-sp-idx="${idx}"><span class="badge">PRM</span><input type="number" class="d-qty sp-qty" value="${esc(qty)}" min="1" data-sp-idx="${idx}">${datalistInput(`sp_code_${idx}`, r0.code||"", getMasterList("prmCodes"), "e.g. WCHR", `class="d-code sp-code" data-sp-idx="${idx}" style="text-transform:uppercase"`)}<input type="text" class="d-seat sp-seat" value="${esc(r0.seat||"")}" maxlength="4" placeholder="e.g. 12A" data-sp-idx="${idx}">${noteInput}${noteButton}${removeBtn}</div>`;
  if(type === "Staff") return `<div class="dynamic-row" data-sp-idx="${idx}"><span class="badge">Staff</span><input type="number" class="d-qty sp-qty" value="${esc(qty)}" min="1" data-sp-idx="${idx}">${datalistInput(`sp_code_${idx}`, r0.code||"", getMasterList("staffCodes"), "e.g. S1A", `class="d-code sp-code" data-sp-idx="${idx}" style="text-transform:uppercase"`)}<input type="text" class="d-seat sp-seat" value="${esc(r0.seat||"")}" maxlength="4" placeholder="e.g. 12A" data-sp-idx="${idx}"><select class="d-meal sp-meal" data-sp-idx="${idx}"><option value="" ${!r0.meal?"selected":""}>Normal</option><option value="NO MEAL" ${r0.meal==="NO MEAL"?"selected":""}>No meal</option><option value="ECO MEAL" ${r0.meal==="ECO MEAL"?"selected":""}>Eco meal</option></select>${noteInput}${noteButton}${removeBtn}</div>`;
  if(type === "Upgrade") return `<div class="dynamic-row" data-sp-idx="${idx}"><span class="badge">Upgrade</span><input type="number" class="d-qty sp-qty" value="${esc(qty)}" min="1" data-sp-idx="${idx}"><select class="d-reason sp-reason" data-sp-idx="${idx}"><option value="" ${!r0.reason?"selected":""}>— Reason —</option>${UPGRADE_REASONS.map(c => `<option ${r0.reason===c?"selected":""}>${esc(c)}</option>`).join("")}</select><input type="text" class="d-seat sp-seat" value="${esc(r0.seat||"")}" maxlength="4" placeholder="e.g. 12A" data-sp-idx="${idx}"><select class="d-meal sp-meal" data-sp-idx="${idx}"><option value="" ${!r0.meal?"selected":""}>— Meal —</option><option value="NO MEAL" ${r0.meal==="NO MEAL"?"selected":""}>No meal</option><option value="ECO MEAL" ${r0.meal==="ECO MEAL"?"selected":""}>Eco meal</option></select>${noteInput}${noteButton}${removeBtn}</div>`;
  return `<div class="dynamic-row" data-sp-idx="${idx}"><span class="badge">Other</span><input type="number" class="d-qty sp-qty" value="${esc(qty)}" min="1" data-sp-idx="${idx}">${datalistInput(`sp_code_${idx}`, r0.code||"", getMasterList("otherTypes"), "e.g. BIKE", `class="d-code sp-code" data-sp-idx="${idx}" style="text-transform:uppercase"`)}<input type="text" class="d-seat sp-seat" value="${esc(r0.seat||"")}" maxlength="4" placeholder="e.g. 12A" data-sp-idx="${idx}">${noteInput}${noteButton}${removeBtn}</div>`;
}
function toggleSpecialNote(idx){ const row = document.querySelector(`.dynamic-row[data-sp-idx="${idx}"]`); if(!row) return; const noteInput = row.querySelector(".sp-note"); const btn = row.querySelector(".note-btn"); if(!noteInput || !btn) return; const isHidden = noteInput.hidden; noteInput.hidden = !isHidden; btn.classList.toggle("active", isHidden); if(isHidden) noteInput.focus(); }
function removeSpecial(idx){ const list = collectSpecials(); list.splice(idx, 1); rerenderSpecials(list); refreshPreviewSoon(); }
function collectSpecials(){
  const container = $("ci_specialsList"); if(!container) return [];
  return [...container.querySelectorAll(".dynamic-row")].map(r => {
    const type = r.querySelector(".badge")?.textContent?.trim(); const qty = r.querySelector(".sp-qty")?.value || "1";
    const seat = (r.querySelector(".sp-seat")?.value || "").trim().toUpperCase(); const note = (r.querySelector(".sp-note")?.value || "").trim();
    const meal = r.querySelector(".sp-meal")?.value || "";
    if(type === "Upgrade") return { type, qty, reason:(r.querySelector(".sp-reason")?.value || "").trim(), seat, meal: (meal || "").trim(), note };
    if(type === "Other") return { type, qty, code: (r.querySelector(".sp-code")?.value || "").toUpperCase().trim(), seat, note };
    return { type, qty, code: (r.querySelector(".sp-code")?.value || "").toUpperCase().trim(), seat, meal, note };
  });
}
function mergeNoMealStaffIntoSpecials(specials, noMealC, noMealY){
  const list = [...specials];
  for(const r of [...(noMealC||[]), ...(noMealY||[])]){
    if(r.reason !== "STAFF" || !r.staffCode || !r.seat) continue;
    const exists = list.some(s => s.type === "Staff" && s.seat === r.seat && s.code === r.staffCode);
    if(!exists) list.push({ type:"Staff", qty:"1", code:r.staffCode, seat:r.seat, meal: r.meal || "NO MEAL", note:"" });
  }
  return list;
}
 
async function getFlightStd(){
  if(!currentFlightId) return "";
  const f = await dbGet("flights", currentFlightId);
  return f ? f.std : "";
}
 
async function updateCloseStatus(){
  const box = $("ci_closeStatus");
  const reasonBox = $("ci_lateReasonBox");
 
  if(!box) return;
 
  const close = ($("ci_closeTime")?.value || "").replace(/[^\d]/g,"");
  const std = await getFlightStd();
  const diff = closeDiff(close, std);
 
  if(!close || diff === null){
    box.innerHTML = "";
    if(reasonBox) reasonBox.hidden = true;
    return;
  }
 
  if(diff >= 60){
    box.innerHTML = `<div class="inline-notice ok">On time · ${diff} min before STD</div>`;
    if(reasonBox) reasonBox.hidden = true;
  }else{
    const late = Math.abs(diff - 60);
    box.innerHTML = `<div class="inline-notice warn">Late close · ${late} min late — please provide a reason below</div>`;
    if(reasonBox) reasonBox.hidden = false;
  }
}
 
document.addEventListener("click", e => {
  const mBtn = e.target.closest(".method-btn");
  if(mBtn){
  const group = mBtn.parentElement;
  group.querySelectorAll(".method-btn").forEach(b => b.classList.remove("active"));
  mBtn.classList.add("active");
  const hidden = group.parentElement.querySelector("input[type=hidden]");
  if(hidden){
    const oldUnit = hidden.value;
    hidden.value = mBtn.dataset.method;
    if(hidden.id === "ci_actZfwUnit" && oldUnit !== hidden.value){
      const el = $("ci_actZfw");
      if(el && el.value.trim()){ const p = parseMassInput(el.value, oldUnit); if(p.tons !== "") el.value = formatMassDisplay(p.tons, hidden.value); }
    } else if(hidden.id === "ci_fuelDiffUnit" && oldUnit !== hidden.value){
      const el = $("ci_fuelDiff");
      if(el && el.value.trim()){ const p = parseMassInput(el.value, oldUnit); if(p.tons !== "") el.value = formatMassDisplay(p.tons, hidden.value); }
    }
  }
  refreshPreviewSoon();
  return;
}
  const btn = e.target.closest(".yn button"); if(!btn) return;
  const yn = btn.parentElement;
  if(yn.dataset.mealChoice){ yn.querySelectorAll("button").forEach(b => b.classList.remove("on-yes","on-no","on-eco")); const val = btn.dataset.val; if(val === "NO MEAL") btn.classList.add("on-no"); else if(val === "ECO MEAL") btn.classList.add("on-eco"); const hidden = $(yn.dataset.mealChoice); if(hidden) hidden.value = val; return; }
  const hiddenId = yn.dataset.yn; const val = btn.dataset.ynVal;
  yn.querySelectorAll("button").forEach(b => b.classList.remove("on-yes","on-no"));
  if(val === "YES") btn.classList.add("on-yes"); else if(val === "NO") btn.classList.add("on-no");
  const hidden = $(hiddenId); if(hidden){ hidden.value = val; hidden.dispatchEvent(new Event("input", { bubbles: true })); }
});
document.addEventListener("input", e => {
  const t = e.target; if(!t) return;
  if(t.id === "ci_closeTime"){ updateCloseStatus(); refreshPreviewSoon(); }
  if(["ci_cPax","ci_yPax","ci_cMeal","ci_yMeal"].includes(t.id)){ updateMealNotice(); refreshPreviewSoon(); }
  if(["ci_cba","ci_loaded","ci_remarks","ci_lateReason","ci_gate","ci_infPax"].includes(t.id)) refreshPreviewSoon();
  if(t.id === "ci_reqFp"){ const box = $("ci_fpDetails"); if(box) box.hidden = t.value !== "YES"; refreshPreviewSoon(); }
  if(["ci_planId","ci_actZfw","ci_fuelDiff","ci_fpReqTime"].includes(t.id)) refreshPreviewSoon();

  // Live-Umschaltung Tonne/Liter beim Tippen (Wert wird NICHT umformatiert)
  if(t.id === "ci_actZfw" || t.id === "ci_fuelDiff"){
    const unitId = t.id === "ci_actZfw" ? "ci_actZfwUnit" : "ci_fuelDiffUnit";
    const unitEl = $(unitId);
    const toggle = t.parentElement.querySelector(".method-toggle");
    const parsed = parseMassInput(t.value, unitEl ? unitEl.value : "t");
    if(parsed.unit && unitEl && unitEl.value !== parsed.unit){
      unitEl.value = parsed.unit;
      if(toggle) toggle.querySelectorAll(".method-btn").forEach(b => b.classList.toggle("active", b.dataset.method === parsed.unit));
    }
  }
});
document.addEventListener("change", e => { const t = e.target; if(!t) return; if(["ci_cPax","ci_yPax","ci_cMeal","ci_yMeal"].includes(t.id)) updateMealNotice(); });
document.addEventListener("blur", e => {
  const t = e.target; if(!t) return;
  if(t.id !== "ci_actZfw" && t.id !== "ci_fuelDiff") return;
  const unitId = t.id === "ci_actZfw" ? "ci_actZfwUnit" : "ci_fuelDiffUnit";
  const unitEl = $(unitId); if(!unitEl) return;
  const parsed = parseMassInput(t.value, unitEl.value);
  if(parsed.tons === "") return;
  const toggle = t.parentElement.querySelector(".method-toggle");
  if(toggle){ toggle.querySelectorAll(".method-btn").forEach(b => b.classList.toggle("active", b.dataset.method === parsed.unit)); }
  unitEl.value = parsed.unit;
  t.value = formatMassDisplay(parsed.tons, parsed.unit);
}, true);
function collectCheckin(){
const base = { gate: ($("ci_gate")?.value || "").toUpperCase().trim(), closeTime: ($("ci_closeTime")?.value || "").replace(/[^\d]/g,""), lateReason: ($("ci_lateReason")?.value || "").trim(), reqFp: ($("ci_reqFp")?.value || ""), planId: ($("ci_planId")?.value || ""), actZfw: parseMassInput($("ci_actZfw")?.value, $("ci_actZfwUnit")?.value).tons, actZfwUnit: ($("ci_actZfwUnit")?.value || "t"), fuelDiff: parseMassInput($("ci_fuelDiff")?.value, $("ci_fuelDiffUnit")?.value).tons, fuelDiffUnit: ($("ci_fuelDiffUnit")?.value || "t"), fpReqTime: ($("ci_fpReqTime")?.value || ""), fpMethod: ($("ci_fpMethod")?.value || "ATOM"), cPax: ($("ci_cPax")?.value || ""), yPax: ($("ci_yPax")?.value || ""), infPax: ($("ci_infPax")?.value || ""), cMeal: ($("ci_cMeal")?.value || ""), yMeal: ($("ci_yMeal")?.value || ""), cba: ($("ci_cba")?.value || ""), loaded: ($("ci_loaded")?.value || ""), remarks: ($("ci_remarks")?.value || ""), noMealC: collectNoMealRows("C"), noMealY: collectNoMealRows("Y"), specials: collectSpecials() };
  base.specials = mergeNoMealStaffIntoSpecials(base.specials, base.noMealC, base.noMealY);
  return base;
}
function validateCheckin(){
  const d = collectCheckin();
  if(!d.closeTime || !/^\d{4}$/.test(d.closeTime)) return "Check-in close time must be 4 digits.";
  const std = window.__currentStd || ""; const diff = closeDiff(d.closeTime, std);
  if(diff !== null && diff < 60 && !d.lateReason) return "Late close — please provide a reason.";
  const cPax = Number(d.cPax)||0, yPax = Number(d.yPax)||0;
  const cMeal = Number(d.cMeal)||0, yMeal = Number(d.yMeal)||0;
  const missC = (d.cMeal !== "" && cPax > cMeal) ? cPax - cMeal : 0;
  const missY = (d.yMeal !== "" && yPax > yMeal) ? yPax - yMeal : 0;
  if(missC > 0){ const filled = d.noMealC.filter(r => r.seat).length; if(filled < missC) return `Business has ${missC} missing meal(s).`; }
  if(missY > 0){ const filled = d.noMealY.filter(r => r.seat).length; if(filled < missY) return `Economy has ${missY} missing meal(s).`; }
  return null;
}
function buildCheckinMessageSync(f, d, useEmoji){
  const e = s => useEmoji ? s + " " : "";
  const reg = f.registration ? "TC-" + f.registration : "";
  const lines = [];

  lines.push(`${e("✈️")}*${f.flightNumber}/${dateCode(f.date)}${reg ? " | " + reg : ""}*`);

  const gate = (d.gate || f.gate || "").trim();
  if(gate) lines.push(`*Gate:* \`${gate}\``);
  if(f.registration) lines.push(`*REG:* \`TC-${f.registration}\``);
  if(f.typeCode || f.aircraftType) lines.push(`*A/C Type:* \`${f.typeCode || f.aircraftType}\``);
  if(f.config) lines.push(`*Config:* \`${f.config}\``);

  lines.push("");

  if(d.reqFp === "YES"){
    lines.push(`${e("📋")}*NEW FLIGHT PLAN*`);

    const rawPlanId = (d.planId || "").trim();
    const planId = rawPlanId
      ? (rawPlanId.length === 1 ? "0" + rawPlanId : rawPlanId)
      : "—";

    lines.push(`*Plan ID:* \`${planId}\``);
    lines.push(`*AZFW:* ${d.actZfw || "0"}t -> *Diff:* ${d.fuelDiff || "0"}t`);

    const rt = (d.fpReqTime || "").replace(/[^\d]/g, "");
    lines.push(`Request at \`${rt || "----"}\` via ${d.fpMethod || "ATOM"}`);

    lines.push("");
  }

  lines.push(`${e("⏱️")}*CHECK-IN INFORMATION*`);

  const close = d.closeTime || "";
  const diff2 = closeDiff(close, f.std);
  let closeStatus = "";

  if(diff2 !== null){
    if(diff2 >= 60){
      closeStatus = " (_On time_)";
    } else {
      const late = Math.abs(diff2 - 60);
      closeStatus = ` (_Late Close - ${late} min late${d.lateReason ? " - " + d.lateReason : ""}_)`;
    }
  }

  lines.push(`*Check-In close time:* \`${close || "-"}${close ? "LT" : ""}\`${closeStatus}`);
  lines.push("");

 const c = Number(d.cPax)||0;
  const y = Number(d.yPax)||0;
  const inf = Number(d.infPax)||0;
  const total = c + y + inf;
 
  if(c || y || inf){
    lines.push(`${e("👥")}*PASSENGER INFORMATION*`);
    lines.push(`*PAX* \`${c}C/${y}Y+${inf}INF = TTL ${total}\``);
 
    const cMeal = Number(d.cMeal)||0;
    const yMeal = Number(d.yMeal)||0;
 
    if(cMeal || yMeal){
      const missingC = Math.max(0, c - cMeal);
      const missingY = Math.max(0, y - yMeal);
 
      lines.push(`*Meal:* \`${cMeal}C/${yMeal}Y\``);
 
      if(missingC || missingY){
        lines.push(`-> Missing: \`${missingC}C/${missingY}Y\``);
      }
    }

    const noMealC = (d.noMealC || []).filter(r => r.seat);
    const noMealY = (d.noMealY || []).filter(r => r.seat);

    const cNoMeal = noMealC.filter(r => (r.meal || "NO MEAL") === "NO MEAL");
    const cEco = noMealC.filter(r => r.meal === "ECO MEAL");
    const yNoMeal = noMealY.filter(r => (r.meal || "NO MEAL") === "NO MEAL");

    if(cNoMeal.length){
      lines.push("*No Meal C/CL:*");
      cNoMeal.forEach(r => lines.push(`- ${formatNoMealSeatLine(r)}`));
    }

    if(cEco.length){
      lines.push("*Eco Meal C/CL:*");
      cEco.forEach(r => lines.push(`- ${formatNoMealSeatLine(r)}`));
    }

    if(yNoMeal.length){
      lines.push("*No Meal Y/CL:*");
      yNoMeal.forEach(r => lines.push(`- ${formatNoMealSeatLine(r)}`));
    }

    lines.push("");
  }

  const sp = (d.specials || []).filter(
    r => r.qty && (r.code || r.reason || r.seat)
  );

  if(sp.length){
    lines.push(`${e("♿")}*SPECIALS*`);

    const grouped = [];

    for(const r of sp){
      const key = [
        r.type || "",
        r.code || "",
        r.reason || "",
        r.meal || "",
        r.note || ""
      ].join("|");

      let group = grouped.find(g => g.key === key);

      if(!group){
        group = {
          key,
          ...r,
          qty: 0,
          seats: []
        };
        grouped.push(group);
      }

      group.qty += Number(r.qty) || 1;

      if(r.seat){
        group.seats.push(r.seat.toUpperCase());
      }
    }

    grouped.forEach(r => {
      const seats = r.seats.length
        ? " " + r.seats.join(", ")
        : "";

      const suffix =
        (r.type === "Staff" || r.type === "Upgrade") && r.meal === "NO MEAL"
          ? " (_NO MEAL_)"
          : (r.type === "Staff" || r.type === "Upgrade") && r.meal === "ECO MEAL"
            ? " (_ECO MEAL_)"
            : "";

      if(r.type === "PRM"){
        lines.push(`- ${r.qty}x ${r.code}${seats}`);
      }
      else if(r.type === "Staff"){
        lines.push(`- ${r.qty}x ${r.code}${seats}${suffix}`);
      }
      else if(r.type === "Upgrade"){
        { const reasonTxt = (r.reason || "").trim(); lines.push(reasonTxt ? `- ${r.qty}x ${reasonTxt} UPGRADE${seats}${suffix}` : `- ${r.qty}x UPGRADE${seats}${suffix}`); }
      }
      else if(r.type === "Other"){
        lines.push(`- ${r.qty}x ${(r.code || "").toUpperCase()}${seats}`);
      }
      else{
        lines.push(`- ${r.qty}x ${(r.code || "").toUpperCase()}${seats}${suffix}`);
      }
    });

    lines.push("");
  }

  const cba = Number(d.cba) || 0;
  const loaded = Number(d.loaded) || 0;

  if(cba || loaded){
    lines.push(`${e("🧳")}*BAGGAGE INFORMATION*`);

    if(cba) lines.push(`- ${cba}x CBA`);
    if(loaded) lines.push(`- ${loaded}x bags`);

    lines.push("");
  }

  if((d.remarks || "").trim()){
    lines.push(`${e("💬")}*GENERAL INFORMATION*`);
    lines.push(d.remarks.trim());
  }

  return lines.join("\n").trimEnd();
}

function formatNoMealSeatLine(r){
  const seat = (r.seat || "").toUpperCase();
  let reason = "";

  if(r.reason === "Other" && r.other){
    reason = `(_${r.other}_)`;
  } else if(r.reason){
    reason = `(_${r.reason}_)`;
  }

  return `\`${seat}\` ${reason}`.trim();
}
function formatSpecial(r){
  const qty = r.qty || "1"; const seat = r.seat ? " " + r.seat.toUpperCase() : "";
  const suffix = (() => { if(r.type === "Staff" && r.meal === "NO MEAL") return " (NO MEAL)"; if(r.type === "Staff" && r.meal === "ECO MEAL") return " (ECO MEAL)"; if(r.type === "Upgrade") return r.meal === "NO MEAL" ? " (NO MEAL)" : r.meal === "ECO MEAL" ? " (ECO MEAL)" : ""; return ""; })();
  const note = r.note ? ` [${r.note}]` : "";
  if(r.type === "PRM") return `${qty}x ${r.code}${seat}${note}`;
  if(r.type === "Staff") return `${qty}x ${r.code}${seat}${suffix}${note}`;
  if(r.type === "Upgrade") return `${qty}x ${r.reason} UPGRADE${seat}${suffix}${note}`;
  if(r.type === "Other") return `${qty}x ${(r.code||"").toUpperCase()}${seat}${note}`;
  return `${qty}x ${r.code||""}${seat}${suffix}${note}`;
}
async function renderCheckinScreen(){
  const host = $("checkinContent");
  if(!currentFlightId){ switchTab("flightFileTab"); return; }
  const f = await dbGet("flights", currentFlightId); if(!f){ switchTab("todayTab"); return; }
  const form = await getForm(currentFlightId, "checkin"); const data = form && form.data ? form.data : {};
  $("screenTitle").textContent = CHECKIN.title;
  $("crumb").innerHTML = `Flights <span style="opacity:.5">›</span> ${esc(f.flightNumber)} <span style="opacity:.5">›</span> ${esc(CHECKIN.title)}`;
  $("crumb").onclick = () => switchTab("flightFileTab");
  const stL = form && form.status === "done" ? "Completed" : form && form.status === "in_progress" ? "Draft" : "Not started";
  const stChip = form && form.status === "done" ? "ok" : form && form.status === "in_progress" ? "warn" : "";
  host.innerHTML = `
    <div class="phase-header"><div><h1>${esc(CHECKIN.title)}</h1><div class="sub">${esc(f.flightNumber)} · ${f.registration ? esc(displayReg(f.registration)) + " · " : ""}${esc(fmtDateShort(f.date))}${f.gate ? " · Gate " + esc(f.gate) : ""}</div></div><div style="display:flex;align-items:center;gap:8px;">${form ? `<button class="btn btn-danger btn-sm" onclick="confirmDeleteSummary('${esc(f.id)}')">Delete summary</button>` : ""}<button class="btn btn-secondary btn-sm" onclick="switchTab('flightFileTab')">Back</button><span class="chip ${stChip}">${stL}</span></div></div>
    <div class="phase-split"><div id="phaseFormHost">${renderCheckinForm(f, data)}</div><aside class="phase-preview" id="phasePreviewHost"></aside></div>
    <div class="action-bar"><button class="btn btn-secondary" onclick="saveCheckinDraft()">Save draft</button><div class="spacer"></div><button class="btn btn-primary" onclick="completeCheckin()">Save &amp; complete</button></div>
  `;
  await afterRenderCheckin(f, data); refreshPreview();
}
async function afterRenderCheckin(f, data){
  window.__currentStd = f.std || "";
  window.__noMealData = { C:[], Y:[] };
  (data.noMealC || []).forEach((r,i) => { window.__noMealData.C[i] = r; });
  (data.noMealY || []).forEach((r,i) => { window.__noMealData.Y[i] = r; });
  rerenderSpecials(data.specials || []);
await updateCloseStatus(); await updateMealNotice();
}
function highlightMessage(msg){ return esc(msg).replace(/\*([^*\n]+)\*/g, `<span class="hl">$1</span>`); }
async function refreshPreview(){
  const host = $("phasePreviewHost"); if(!host) return;
  const f = await dbGet("flights", currentFlightId); if(!f) return;
  const data = collectCheckin(); const ms = await getSetting("messageSettings", { useEmoji: true });
  const msg = buildCheckinMessageSync(f, data, !!ms.useEmoji);
  host.innerHTML = `<div class="form-section" style="margin-bottom:0;"><div class="form-section-head"><div><h3>Preview</h3></div></div><div class="form-section-body"><div class="preview-block">${highlightMessage(msg)}</div><div style="display:flex;flex-direction:column;gap:10px;margin-top:14px;"><button class="btn btn-wa btn-block" onclick="sendWhatsAppMessage()">Send via WhatsApp</button><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;"><button class="btn btn-secondary" onclick="showQrForMessage()">QR</button><button class="btn btn-secondary" onclick="copyMessageText()">Copy</button><button class="btn btn-secondary" onclick="emailMessageText()">Email</button></div></div></div></div>`;
}
function refreshPreviewSoon(){ clearTimeout(window.__previewTimer); window.__previewTimer = setTimeout(refreshPreview, 250); }
async function saveCheckinDraft(){ await saveCheckinForm("in_progress"); }
async function completeCheckin(){ const err = validateCheckin(); if(err){ toast(err); return; } await saveCheckinForm("done"); }
async function saveCheckinForm(status){
  if(!currentFlightId) return;
  const data = collectCheckin();
  if(data.gate !== undefined){ const f = await dbGet("flights", currentFlightId); if(f && data.gate && data.gate !== f.gate) await updateFlight(currentFlightId, { gate: data.gate }); }
  let form = await getForm(currentFlightId, "checkin");
  if(!form){ form = { id:uid("form"), flightId:currentFlightId, flightPhase:`${currentFlightId}__checkin`, phase:"checkin", status, data, createdAt:nowISO(), updatedAt:nowISO() }; }
  else { form.data = data; form.status = status; form.updatedAt = nowISO(); }
  if(status === "done"){ form.completedAt = nowISO(); form.completedBy = "Current user"; }
  await dbPut("forms", form);
  await audit(currentFlightId, status === "done" ? "Summary completed" : "Draft saved", { field: CHECKIN.title, employee: "Current user" });
  logEvent(status === "done" ? `Summary completed: ${currentFlightId}` : `Draft saved: ${currentFlightId}`);
  toast(status === "done" ? "Summary saved." : "Draft saved.");
  if(status === "done") switchTab("todayTab"); else renderCheckinScreen();
}
async function getCurrentMessage(){ if(!currentFlightId) return ""; const f = await dbGet("flights", currentFlightId); if(!f) return ""; const data = collectCheckin(); const ms = await getSetting("messageSettings", { useEmoji: true }); return buildCheckinMessageSync(f, data, !!ms.useEmoji); }
async function sendWhatsAppMessage(){ const msg = await getCurrentMessage(); if(!msg){ toast("Nothing to send."); return; } window.open("https://wa.me/?text=" + encodeURIComponent(msg), "_blank", "noopener"); }
async function copyMessageText(){ const msg = await getCurrentMessage(); if(!msg){ toast("Nothing to copy."); return; } try { await navigator.clipboard.writeText(msg); toast("Copied."); } catch(e){ const ta = document.createElement("textarea"); ta.value = msg; ta.style.position="fixed"; ta.style.opacity="0"; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); toast("Copied."); } catch(_){ toast("Copy blocked."); } ta.remove(); } }
async function emailMessageText(){ const msg = await getCurrentMessage(); if(!msg){ toast("Nothing to send."); return; } const f = await dbGet("flights", currentFlightId); const subject = f ? f.flightNumber + " – " + fmtDate(f.date) : "HAM Ops Hub"; window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(msg)}`; }
async function showQrForMessage(){
  const msg = await getCurrentMessage(); if(!msg){ toast("Nothing to generate."); return; }
  const whatsappUrl = "https://wa.me/?text=" + encodeURIComponent(msg);
  let qrInfo; try { qrInfo = QRCodeGenerator.generate(whatsappUrl); } catch(e){ logActivity("error", "QR gen failed"); toast("QR failed."); return; }
  window.__qrPng = qrInfo.dataUrl;
  openModal("QR Code", `<div class="qr-big-modal"><div class="qr-stage"><img src="${qrInfo.dataUrl}" alt="QR"></div><p style="color:var(--ink-3);font-size:13px;text-align:center;margin-top:10px;">Scan with the other phone — WhatsApp opens with the message ready.</p><p style="color:var(--ink-3);font-size:11.5px;text-align:center;">${msg.length} chars · ${qrInfo.bytes} bytes · QR v${qrInfo.version}</p></div>`, `<button class="btn btn-secondary" onclick="closeModal()">Close</button>`, { qrBig:true });
}
async function showQrForFlightId(fid){
  const f = await dbGet("flights", fid);
  if(!f){ toast("Flight not found."); return; }
  const form = await getForm(fid, "checkin");
  if(!form || form.status !== "done"){ toast("No completed summary yet."); return; }
  const ms = await getSetting("messageSettings", { useEmoji: true });
  const msg = buildCheckinMessageSync(f, form.data || {}, !!ms.useEmoji);
  if(!msg){ toast("Nothing to show."); return; }
  const whatsappUrl = "https://wa.me/?text=" + encodeURIComponent(msg);
  let qrInfo; try { qrInfo = QRCodeGenerator.generate(whatsappUrl); }
  catch(e){ logActivity("error", "QR gen failed (card)"); toast("QR failed."); return; }
  openModal("QR Code · " + f.flightNumber, `<div class="qr-big-modal"><div class="qr-stage"><img src="${qrInfo.dataUrl}" alt="QR"></div><p style="color:var(--ink-3);font-size:13px;text-align:center;margin-top:10px;">Scan with the other phone — WhatsApp opens with the message ready.</p><p style="color:var(--ink-3);font-size:11.5px;text-align:center;">${esc(f.flightNumber)} · ${esc(fmtDateShort(f.date))} · ${msg.length} chars · ${qrInfo.bytes} bytes · QR v${qrInfo.version}</p></div>`, `<button class="btn btn-secondary" onclick="closeModal()">Close</button>`, { qrBig:true });
}

/* ============================================================
   Selection / Bulk delete
   ============================================================ */
let selectedFlights = new Set();
let bulkSelectionActive = false;
function toggleFlightSelection(ev, id){ ev.stopPropagation(); if(selectedFlights.has(id)) selectedFlights.delete(id); else selectedFlights.add(id); if(currentTab === "allFlightsTab") renderAllFlights(); renderSelectionBar(); }
function handleFlightCardClick(ev, id){ if(bulkSelectionActive){ toggleFlightSelection(ev, id); return; } openFlightFile(id); }
function toggleBulkSelection(){ bulkSelectionActive = !bulkSelectionActive; if(!bulkSelectionActive) selectedFlights.clear(); renderAllFlights(); renderSelectionBar(); }
function selectAllVisible(ids){ const all = ids.every(id => selectedFlights.has(id)); if(all) ids.forEach(id => selectedFlights.delete(id)); else ids.forEach(id => selectedFlights.add(id)); renderAllFlights(); renderSelectionBar(); }
function renderSelectionBar(){
  let bar = $("selectionBar");
  if(!bulkSelectionActive || selectedFlights.size === 0){ if(bar) bar.remove(); return; }
  if(!bar){ bar = document.createElement("div"); bar.id = "selectionBar"; bar.className = "selection-bar"; document.body.appendChild(bar); }
  bar.innerHTML = `<span class="count">${selectedFlights.size} selected</span><span class="divider"></span><button class="btn btn-secondary btn-sm" onclick="clearSelection()">Clear</button><button class="btn btn-danger-fill btn-sm" onclick="openBulkDeleteModal()">Delete</button>`;
}
function clearSelection(){ selectedFlights.clear(); renderAllFlights(); renderSelectionBar(); }
function openBulkDeleteModal(){
  if(selectedFlights.size === 0){ toast("No flights selected."); return; }
  const count = selectedFlights.size;
  openModal("Confirm bulk deletion", `<div class="inline-notice danger" style="margin-top:0;"><b>This action cannot be undone.</b> ${count} flight${count===1?"":"s"} will be permanently deleted.</div><p style="font-size:13.5px;color:var(--ink-2);">Type <b style="font-family:var(--mono);background:var(--surface-2);padding:1px 6px;border-radius:4px;color:var(--danger);">DELETE</b> to confirm.</p><div class="field"><input type="text" id="bulkDeleteConfirm" placeholder="e.g. DELETE" autocomplete="off" style="text-transform:uppercase;font-family:var(--mono);letter-spacing:.08em;font-weight:600;"></div>`, `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-danger-fill" id="bulkDeleteBtn" disabled onclick="runBulkDelete()">Delete ${count}</button>`);
  setTimeout(() => { const inp = $("bulkDeleteConfirm"); const btn = $("bulkDeleteBtn"); if(inp){ inp.focus(); inp.addEventListener("input", () => { btn.disabled = inp.value.trim().toUpperCase() !== "DELETE"; }); } }, 50);
}
async function runBulkDelete(){
  const inp = $("bulkDeleteConfirm");
  if(!inp || inp.value.trim().toUpperCase() !== "DELETE"){ toast("Type DELETE."); return; }
  const ids = [...selectedFlights]; closeModal();
  let ok = 0, fail = 0;
  for(const id of ids){ try { await deleteFlight(id); ok++; } catch(e){ fail++; } }
  logEvent(`Bulk delete: ${ok} deleted, ${fail} failed`);
  selectedFlights.clear(); bulkSelectionActive = false; renderSelectionBar();
  toast(`${ok} flight${ok===1?"":"s"} deleted.`);
  if(currentTab === "allFlightsTab") renderAllFlights(); else if(currentTab === "todayTab") renderToday();
}

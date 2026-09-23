/* ============================================================
   Delete All Data (Admin)
   ============================================================ */
function confirmDeleteAllData(){
  if(!isAdminMode()){ toast("Admin mode required."); return; }
  openModal("Delete all data", `
    <div class="inline-notice danger" style="margin-top:0;"><b>This action cannot be undone.</b></div>
    <p style="font-size:13.5px;color:var(--ink-2);line-height:1.6;">All <b>flights</b>, <b>summaries</b> and <b>audit entries</b> will be permanently deleted. Master Data (fleet, flight numbers, gates, codes, agents, users) is kept.</p>
    <p style="font-size:13.5px;color:var(--ink-2);">Type <b style="font-family:var(--mono);background:var(--surface-2);padding:1px 6px;border-radius:4px;color:var(--danger);">DELETE</b> to confirm.</p>
    <div class="field"><input type="text" id="deleteAllConfirm" placeholder="e.g. DELETE" autocomplete="off" style="text-transform:uppercase;font-family:var(--mono);letter-spacing:.08em;font-weight:600;"></div>
  `, `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-danger-fill" id="deleteAllBtn" disabled onclick="runDeleteAllData()">Delete all data</button>`);
  setTimeout(() => { const inp = $("deleteAllConfirm"); const btn = $("deleteAllBtn"); if(inp){ inp.focus(); inp.addEventListener("input", () => { btn.disabled = inp.value.trim().toUpperCase() !== "DELETE"; }); } }, 60);
}
async function runDeleteAllData(){
  const inp = $("deleteAllConfirm"); if(!inp) return;
  if(inp.value.trim().toUpperCase() !== "DELETE"){ toast("Confirmation missing."); return; }
  closeModal();
  let count = 0;
  try {
    for(const row of await dbAll("flights")){ await dbDelete("flights", row.id); count++; }
    for(const row of await dbAll("forms")){ await dbDelete("forms", row.id); }
    for(const row of await dbAll("audit")){ await dbDelete("audit", row.id); }
    logEvent(`All data deleted (${count} flights)`);
    toast(`${count} flights and all summaries deleted.`);
    selectedFlights.clear(); bulkSelectionActive = false; renderSelectionBar();
    await loadMasterCache();
    if(currentTab === "masterDataTab") renderMasterData(); else switchTab("todayTab");
  } catch(e){ toast("Error: " + e.message); }
}

/* ============================================================
   Global wiring + boot
   ============================================================ */
$("btnNewFlight").addEventListener("click", openNewFlightChoiceModal);
document.addEventListener("keydown", e => { if(e.key === "Escape") closeModal(); });
const __btnAdminNav = $("btnAdminNav");
if(__btnAdminNav) __btnAdminNav.addEventListener("click", () => switchTab("devTab"));


function showMasterDataPrompt(){
  openModal("Master Data Required", `<p style="font-size:13.5px;color:var(--ink-2);line-height:1.6;">This device has no master data yet. Ask your administrator for the master data JSON and import it once.</p>`, `<button class="btn btn-secondary" onclick="closeModal()">Later</button><button class="btn btn-primary" onclick="closeModal(); openImportMasterDataModal();">Import Master Data</button>`);
}
async function boot(){
  applyTheme();
  try {
    await openDB(); await migrateSettings(); await seedIfEmpty(); await loadMasterCache();
    applyAdminUI();
    switchTab("todayTab");
    const gates = await getSetting("gates", []);
    const ahs = await getSetting("ahsAgents", []);
    if(gates.length === 0 && ahs.length === 0) setTimeout(() => showMasterDataPrompt(), 600);
    if(/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)){
      try { if(navigator.storage && navigator.storage.persist) await navigator.storage.persist(); } catch(e){}
    }
    logEvent("App started (session)");
    checkStartupBackupReminder();
  } catch(e){
    console.error(e);
    document.body.innerHTML = `<div style="padding:40px;font-family:sans-serif;"><h2>Startup failed</h2><p>${esc(e.message||String(e))}</p></div>`;
  }
}
boot();

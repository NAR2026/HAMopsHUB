/* ============================================================
   Admin Mode (session only)
   ============================================================ */
function isAdminMode(){ try { return sessionStorage.getItem(ADMIN_KEY) === "1"; } catch(e){ return false; } }
function activateAdminMode(){ try { sessionStorage.setItem(ADMIN_KEY, "1"); } catch(e){} applyAdminUI(); toast("Admin mode active"); logEvent("Admin mode activated"); }
function deactivateAdminMode(){ try { sessionStorage.removeItem(ADMIN_KEY); } catch(e){} applyAdminUI(); toast("Admin mode off"); logEvent("Admin mode deactivated"); }
function applyAdminUI(){
  const on = isAdminMode();
  document.body.classList.toggle("admin-on", on);
  const nav = $("navAdmin"); if(nav) nav.hidden = !on;
  const exit = $("btnAdminExit"); if(exit) exit.hidden = !on;
  const topNav = $("btnAdminNav"); if(topNav) topNav.hidden = !on;
  if(!on && currentTab === "devTab") switchTab("todayTab");
}
(function wire5Tap(){
  let count = 0, timer = null;
  document.addEventListener("click", e => {
    // Sidebar brand mark OR topbar title — both count toward 5 taps
    const bm = e.target.closest("#brandMark, #screenTitle");
    if(!bm) return;
    count++;
    clearTimeout(timer);
    timer = setTimeout(() => { count = 0; }, 900);
    if(count >= 5){ count = 0; clearTimeout(timer);
      if(isAdminMode()) deactivateAdminMode(); else activateAdminMode();
    }
  });
})();

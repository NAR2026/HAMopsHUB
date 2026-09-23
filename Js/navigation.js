/* ============================================================
   Navigation
   ============================================================ */
let currentTab = "todayTab"; let currentFlightId = null;
function switchTab(tabId){
  if(tabId === "devTab" && !isAdminMode()){ toast("Admin mode required."); return; }
  currentTab = tabId;
  document.querySelectorAll(".screen").forEach(s => s.classList.toggle("active", s.id === tabId));
  document.querySelectorAll(".nav-item[data-tab]").forEach(n => n.classList.toggle("active", n.dataset.tab === tabId));
  document.querySelectorAll(".tabbar button[data-tab]").forEach(n => n.classList.toggle("active", n.dataset.tab === tabId));
  const meta = { todayTab:["Today","Hamburg"], allFlightsTab:["All Flights","Hamburg"], statsTab:["Statistics","Hamburg"], importTab:["WhatsApp Import","Hamburg"], masterDataTab:["Master Data","Hamburg"], aboutTab:["About","Hamburg"], flightFileTab:["Flight File","Hamburg"], checkinTab:["Flight Summary","Hamburg"], devTab:["Admin","Hamburg"] };
  const [t,c] = meta[tabId] || ["",""];
  $("screenTitle").textContent = t; $("crumb").textContent = c;
  if(tabId === "todayTab") renderToday();
  else if(tabId === "allFlightsTab") renderAllFlights();
  else if(tabId === "statsTab") renderStats();
  else if(tabId === "importTab") renderImportScreen();
  else if(tabId === "masterDataTab") renderMasterData();
  else if(tabId === "aboutTab") renderAbout();
  else if(tabId === "flightFileTab") renderFlightFile();
  else if(tabId === "checkinTab") renderCheckinScreen();
  else if(tabId === "devTab") renderDeveloper();
  window.scrollTo({ top:0, behavior:"smooth" });
}
document.addEventListener("click", e => { const nav = e.target.closest(".nav-item[data-tab], .tabbar button[data-tab]"); if(nav){ switchTab(nav.dataset.tab); return; } });

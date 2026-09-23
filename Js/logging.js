/* ============================================================
   Logging (session only)
   ============================================================ */
const activityLog = [];
const MAX_ACTIVITY = 500;
let trackingEnabled = true;
function logActivity(type, message, extra){
  if(!trackingEnabled) return;
  activityLog.push({ ts: nowISO(), type, message: String(message||""), extra: extra||null });
  if(activityLog.length > MAX_ACTIVITY) activityLog.shift();
}
function logEvent(message, extra){ logActivity("event", message, extra); }
(function cc(){
  const oL = console.log, oW = console.warn, oE = console.error;
  console.log = function(...a){ oL.apply(console,a); logActivity("info", a.map(x=>typeof x==="string"?x:JSON.stringify(x)).join(" ")); };
  console.warn = function(...a){ oW.apply(console,a); logActivity("warn", a.map(x=>typeof x==="string"?x:JSON.stringify(x)).join(" ")); };
  console.error = function(...a){ oE.apply(console,a); logActivity("error", a.map(x=>typeof x==="string"?x:JSON.stringify(x)).join(" ")); };
  window.addEventListener("error", e => logActivity("error", e.message + " (" + (e.filename||"") + ":" + (e.lineno||"?") + ")"));
  window.addEventListener("unhandledrejection", e => logActivity("error", "Unhandled: " + (e.reason && e.reason.message ? e.reason.message : String(e.reason))));
})();

let toastTimer = null;
function toast(msg){ const t = $("toast"); t.innerHTML = `<svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg><span>${esc(msg)}</span>`; t.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 2600); }
function openModal(title, bodyHtml, footerHtml, opts){ $("modalTitle").textContent = title; $("modalBody").innerHTML = bodyHtml; $("modalFoot").innerHTML = footerHtml || `<button class="btn btn-primary" onclick="closeModal()">OK</button>`; $("modal").hidden = false; $("modalBox").classList.toggle("wide", !!(opts && opts.wide)); $("modalBox").classList.toggle("qr-big-modal", !!(opts && opts.qrBig)); }
function closeModal(){ $("modal").hidden = true; $("modalBox").classList.remove("qr-big-modal"); }
$("modalClose").addEventListener("click", closeModal);
$("modal").addEventListener("click", e => { if(e.target === $("modal")) closeModal(); });

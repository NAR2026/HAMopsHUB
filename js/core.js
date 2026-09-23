/* ============================================================
   Core
   ============================================================ */
const DB_NAME = "TK_HAM_OPS";
const DB_VERSION = 1;
const CHECKIN = { key:"checkin", title:"Flight Summary", desc:"Record closing time, passengers, meals and specials — and generate the summary message." };
const WEEKDAYS = ["MON","TUE","WED","THU","FRI","SAT","SUN"];
const WEEKDAYS_SHORT = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const MONTHS_UP = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
const UPGRADE_REASONS = ["PAID","OPERATIONAL","OVERBOOK"];
const ADMIN_KEY = "ham_opshub_admin_session";
const START_COUNT_KEY = "ham_opshub_startcount";
const LAST_BACKUP_KEY = "ham_opshub_lastbackup";

const DEFAULT_MASTER = {
  aircraftFleet: [], flightSchedules: [],
  gates: ["C04","C05","C06","C07","C08","B53"],
  ahsAgents: [], tkAgents: [],
  prmCodes: ["WCHR","WCHS","WCHC","BLND","DEAF","WCBD","WCBW","WCMP","WCOB"],
  staffCodes: ["S1A","S1B","S1C","S1D","S1E","S1F","S1G","S1H","S1I","S1J","S1K","S1N","S1O","S1P","S1T","S1X","S2A","S2B","S3A","S3B","S4A","S5A","S6A","S6B","S7A","S8A","S8P","S9A","R1B","R1C","R1D","R1E","R1F","R1G","R1H","R1I","R1J","R1K","R1N","R1O","R1P","R1T","R1X","R2A","R2B","R3A","R3B","R4A","R5A","R6A","R6B","R7A","R8A","R8P","R9A"],
  otherTypes: ["AVIH","BIKE","CBBG","DEPA","DEPU","EXST","MAAS","MEDA","PETC","SPEQ","STCR","UMNR","VIP","WEAP","INAD"],
  users: [],
  messageSettings: { useEmoji: true }
};

window.__master = { prmCodes: [], staffCodes: [], otherTypes: [], gates: [], ahsAgents: [], tkAgents: [], flightNumbers: [], registrations: [], aircraftTypes: [], typeCodes: [] };

const $ = id => document.getElementById(id);
const pad = n => String(n).padStart(2,"0");
const esc = s => String(s==null?"":s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const uid = p => p + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2,8);
const nowISO = () => new Date().toISOString();
function todayISO(){ const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
function fmtDate(iso){ if(!iso) return "–"; const [y,m,d] = iso.split("-"); return `${d}.${m}.${y}`; }
function fmtDateShort(iso){ if(!iso) return "–"; const [y,m,d] = iso.split("-"); const dt = new Date(iso + "T00:00:00"); const wd = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][dt.getDay()]; return `${d} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][parseInt(m,10)-1]}`; }
function fmtDateLong(iso){ if(!iso) return "–"; const dt = new Date(iso + "T00:00:00"); const wd = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][dt.getDay()]; const mo = ["January","February","March","April","May","June","July","August","September","October","November","December"][dt.getMonth()]; return `${wd}, ${dt.getDate()} ${mo} ${dt.getFullYear()}`; }
function fmtTimeShort(hhmm){ if(!hhmm) return "–"; const s = String(hhmm).replace(":",""); if(s.length!==4) return hhmm; return s.slice(0,2)+":"+s.slice(2,4); }
function dateFlightId(date, flight){ return `${date}__${String(flight||"").trim().toUpperCase()}`; }
function displayReg(reg){ if(!reg) return ""; return reg.startsWith("TC-") ? reg : "TC-"+reg; }
function routeDisplay(f){ return [f.routeFrom, f.routeTo].filter(Boolean).join(" → "); }
function weekdayKey(iso){ if(!iso) return null; const d = new Date(iso + "T00:00:00").getDay(); return ["SUN","MON","TUE","WED","THU","FRI","SAT"][d]; }
function dateCode(iso){ if(!iso) return ""; const d = new Date(iso + "T00:00:00"); return pad(d.getDate()) + MONTHS_UP[d.getMonth()]; }
function toMins(hhmm){ const s = String(hhmm||"").replace(/[^\d]/g,""); if(s.length !== 4) return null; return parseInt(s.slice(0,2),10)*60 + parseInt(s.slice(2,4),10); }
function closeDiff(close, std){ const c = toMins(close), s = toMins(std); if(c === null || s === null) return null; let d = s - c; if(d < -720) d += 1440; else if(d > 720) d -= 1440; return d; }
function inRange(iso, from, to){ if(!iso) return false; if(from && iso < from) return false; if(to && iso > to) return false; return true; }
function relTime(iso){
  if(!iso) return "unknown";
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if(min < 1) return "just now";
  if(min < 60) return min + " min ago";
  const hr = Math.floor(min / 60);
  if(hr < 24) return hr + (hr === 1 ? " hour ago" : " hours ago");
  const days = Math.floor(hr / 24);
  if(days === 1) return "yesterday";
  if(days < 7) return days + " days ago";
  const weeks = Math.floor(days / 7);
  return weeks + (weeks === 1 ? " week ago" : " weeks ago");
}
function relTimeColor(iso){ if(!iso) return "var(--ink-3)"; const days = (Date.now() - new Date(iso).getTime()) / 86400000; if(days < 1) return "var(--ok)"; if(days < 7) return "var(--warn)"; return "var(--danger)"; }

/* Date input helpers — displays dd.mm.yyyy, stores ISO internally */
function parseDateInput(str){
  const s = String(str||"").trim();
  if(!s) return "";
  if(/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = s.match(/^(\d{1,2})[.\-\/](\d{1,2})[.\-\/](\d{2,4})$/);
  if(!m) return "";
  let [,d,mo,y] = m;
  if(y.length === 2) y = "20" + y;
  const dd = pad(d), mm = pad(mo);
  if(parseInt(mm,10) < 1 || parseInt(mm,10) > 12) return "";
  if(parseInt(dd,10) < 1 || parseInt(dd,10) > 31) return "";
  return `${y}-${mm}-${dd}`;
}
function formatDateInput(iso){ if(!iso) return ""; const [y,m,d] = iso.split("-"); if(!y||!m||!d) return iso; return `${d}.${m}.${y}`; }
function wireDateInput(inputEl){
  if(!inputEl) return;
  inputEl.addEventListener("input", e => {
    let v = e.target.value.replace(/[^\d]/g,"");
    if(v.length > 8) v = v.slice(0,8);
    let out = "";
    if(v.length <= 2) out = v;
    else if(v.length <= 4) out = v.slice(0,2) + "." + v.slice(2);
    else out = v.slice(0,2) + "." + v.slice(2,4) + "." + v.slice(4);
    if(out !== e.target.value){ e.target.value = out; }
  });
}
function parseMassInput(raw, defaultUnit){
  const s = String(raw||"").trim().toLowerCase().replace(",", ".");
  if(!s) return { tons: "", unit: defaultUnit || "t" };
  const m = s.match(/^(-?[\d.]+)\s*(t|ton|tons|l|liter|liters)?$/);
  if(!m) return { tons: "", unit: defaultUnit || "t" };
  const num = parseFloat(m[1]);
  if(isNaN(num)) return { tons: "", unit: defaultUnit || "t" };

  const cur = (defaultUnit === "l") ? "l" : "t";
  let unit;

  if(m[2]){
    // 1) Explizite Einheit gewinnt immer
    const rawUnit = m[2].toLowerCase();
    unit = rawUnit.startsWith("l") ? "l" : "t";
  } else if(num < 100){
    // 2) Klein → eindeutig Tonnen
    unit = "t";
  } else if(num >= 1000){
    // 3) Groß → eindeutig Liter
    unit = "l";
  } else {
    // 4) Grenzzone 100–999 → aktuelle Toggle-Einstellung behalten
    unit = cur;
  }

  const tons = unit === "l" ? num / 1000 : num;
  return { tons: String(Number(tons.toFixed(4))), unit };
}
function formatMassDisplay(tons, unit){
  if(tons === "" || tons == null) return "";
  const n = Number(tons);
  if(isNaN(n)) return "";
  if(unit === "l") return String(Number((n * 1000).toFixed(2)));
  return String(Number(n.toFixed(4)));
}
function dateFieldHtml(id, value, label){
  return `<div class="field"><label>${esc(label||"Date")}</label><input type="text" id="${id}" value="${esc(formatDateInput(value))}" inputmode="numeric" placeholder="DD.MM.YYYY" maxlength="10" autocomplete="off"><div class="hint">Format: DD.MM.YYYY</div></div>`;
}

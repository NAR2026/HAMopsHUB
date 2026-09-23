/* ============================================================
   About + Report Wizard
   ============================================================ */
async function renderAbout(){
  const host = $("aboutContent");
  const flights = await dbAll("flights"); const forms = await dbAll("forms");
  const installDate = localStorage.getItem("ham_opshub_install") || nowISO();
  if(!localStorage.getItem("ham_opshub_install")) localStorage.setItem("ham_opshub_install", installDate);
  const year = new Date().getFullYear();

  host.innerHTML = `
    <div class="about-hero">
      <div style="position:relative;z-index:1;max-width:820px;">
        <div style="font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;opacity:.8;">Station Operations Workspace</div>
        <h1 style="margin-top:6px;">${esc(APP_NAME)}</h1>
        <div class="ver">Version ${esc(APP_VERSION)} · Build ${esc(APP_BUILD)}</div>
        <p style="margin-top:16px;font-size:14.5px;line-height:1.6;opacity:.95;max-width:640px;">
          ${esc(APP_PURPOSE)}
        </p>
        <div style="margin-top:18px;display:inline-flex;align-items:center;gap:10px;background:rgba(255,255,255,.14);border-radius:999px;padding:7px 14px;font-size:12.5px;font-weight:600;">
          <span>Developed by ${esc(DEVELOPER_INFO.studio)}</span>
          <span style="opacity:.5;">·</span>
          <span>${esc(DEVELOPER_INFO.location)}</span>
        </div>
      </div>
    </div>

    <div class="about-section">
      <h3>About this application</h3>
      <p>${esc(APP_NAME)} is a browser-based workspace for daily flight handling, flight summaries, specials tracking and station reporting. It is designed to run completely offline on a single device and to be used without any external account, server or cloud service.</p>
    </div>

    <div class="about-section">
      <h3>Developer</h3>
      <div class="kv-grid">
        <div class="kv"><div class="k">Studio</div><div class="v">${esc(DEVELOPER_INFO.studio)}</div></div>
        <div class="kv"><div class="k">Contact</div><div class="v"><a href="mailto:${esc(DEVELOPER_INFO.email)}" style="color:var(--brand);text-decoration:none;">${esc(DEVELOPER_INFO.email)}</a></div></div>
        <div class="kv"><div class="k">Role</div><div class="v">${esc(DEVELOPER_INFO.role)}</div></div>
        <div class="kv"><div class="k">Location</div><div class="v">${esc(DEVELOPER_INFO.location)}</div></div>
      </div>
    </div>

    <div class="about-section">
      <h3>Usage on this device</h3>
      <div class="kv-grid">
        <div class="kv"><div class="k">Flights stored</div><div class="v">${flights.length}</div></div>
        <div class="kv"><div class="k">Flight summaries</div><div class="v">${forms.length}</div></div>
        <div class="kv"><div class="k">First used</div><div class="v">${esc(fmtDate(installDate.slice(0,10)))}</div></div>
        <div class="kv"><div class="k">Storage</div><div class="v">Browser-local (IndexedDB)</div></div>
      </div>
    </div>

    <div class="about-section">
      <h3>Privacy &amp; data</h3>
      <p>All data entered into ${esc(APP_NAME)} is stored exclusively on this device, inside your browser's local database (IndexedDB). Nothing is transmitted to any server, cloud service or third party. ${esc(DEVELOPER_INFO.studio)} has no access to any of your data.</p>
      <p style="margin-top:10px;">You are solely responsible for creating regular backups. Exported backups are plain JSON files and may contain operational data — treat them as confidential. Loss of local data (for example through browser cache clearing, device loss or iOS storage eviction) cannot be recovered by the developer.</p>
    </div>

    <div class="about-section">
      <h3>Disclaimer &amp; limitation of liability</h3>
      <p>This application is provided <b>“as is”</b> and <b>“as available”</b>, without warranty of any kind, whether express or implied, including but not limited to the implied warranties of merchantability, fitness for a particular purpose and non-infringement.</p>
      <p style="margin-top:10px;">${esc(DEVELOPER_INFO.studio)} does not warrant that the application is error-free, uninterrupted or suitable for any particular operational purpose. In no event shall ${esc(DEVELOPER_INFO.studio)} be liable for any direct, indirect, incidental, special, consequential or punitive damages, or any loss of data, revenue, operations or profits, arising out of or in connection with the use or inability to use this application, even if advised of the possibility of such damages.</p>
      <p style="margin-top:10px;">All operational decisions made based on information displayed by this application remain the sole responsibility of the user. Users are expected to verify all flight data, passenger counts, meal numbers and specials against official sources before taking any operational action.</p>
    </div>

    <div class="about-section">
      <h3>No affiliation</h3>
      <p>${esc(APP_NAME)} is an independent project developed by ${esc(DEVELOPER_INFO.studio)}. It is <b>not affiliated with, endorsed by, sponsored by or otherwise connected to</b> any airline, airport, ground handling company, catering provider or other organization. Any resemblance to existing operational software, brand names or procedures is coincidental and not intended to imply any relationship.</p>
    </div>

    <div class="about-section">
      <h3>Intellectual property</h3>
      <p>© ${year} ${esc(DEVELOPER_INFO.studio)}. <b>All rights reserved.</b></p>
      <p style="margin-top:10px;">The application, including but not limited to its source code, design, layout, graphics, structure and documentation, is the exclusive intellectual property of ${esc(DEVELOPER_INFO.studio)}. Unauthorized reproduction, distribution, modification, sublicensing, sale or public display — in whole or in part — is strictly prohibited without prior written permission.</p>
    </div>

    <div class="about-section">
      <h3>Legal notice</h3>
      <div class="kv-grid">
        <div class="kv"><div class="k">Responsible for content</div><div class="v">${esc(DEVELOPER_INFO.studio)}</div></div>
        <div class="kv"><div class="k">Contact</div><div class="v">${esc(DEVELOPER_INFO.email)}</div></div>
        <div class="kv"><div class="k">Jurisdiction</div><div class="v">Germany</div></div>
        <div class="kv"><div class="k">Version</div><div class="v">${esc(APP_VERSION)} · Build ${esc(APP_BUILD)}</div></div>
      </div>
    </div>

    <div style="text-align:center;color:var(--ink-3);font-size:12.5px;padding:26px 0 12px;line-height:1.7;">
      ${esc(APP_NAME)} v${esc(APP_VERSION)} · Build ${esc(APP_BUILD)}<br>
      © ${year} ${esc(DEVELOPER_INFO.studio)} — All rights reserved.<br>
      <span style="opacity:.7;">Independent project · Not affiliated with any airline or company.</span>
    </div>
  `;
}
let reportDraft = { type:"", area:"", title:"", description:"", name:"", email:"", includeTech:true };
function collectDiagnostics(){
  const errors = activityLog.filter(e => e.type === "error").slice(-10);
  const warnings = activityLog.filter(e => e.type === "warn").slice(-5);
  const events = activityLog.filter(e => e.type === "event").slice(-12);
  return { app: APP_NAME, version: APP_VERSION, build: APP_BUILD, timestamp: nowISO(), timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown", language: navigator.language || "unknown", userAgent: navigator.userAgent || "unknown", platform: navigator.platform || "unknown", currentView: currentTab, currentFlight: currentFlightId || null, url: location.href, screenSize: `${window.screen.width}x${window.screen.height}`, viewport: `${window.innerWidth}x${window.innerHeight}`, errors, warnings, events };
}
function openReportWizard(){ reportDraft = { type:"", area:"", title:"", description:"", name:"", email:"", includeTech:true }; renderReportStep(1); }
const REPORT_AREAS = ["Today","All Flights","Statistics","WhatsApp Import","Master Data","Flight File","Flight Summary","About","Admin","Other"];
const REPORT_TYPES = [
  { key:"bug", label:"Bug / Error", desc:"Something is broken or not working as expected.", bg:"#FCEEEC", fg:"#C0392B",
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="6"/><path d="M9 4l1.5 3M15 4l-1.5 3M3 13h3M18 13h3M4 19l2.5-2M20 19l-2.5-2M4 7l2.5 2M20 7l-2.5 2"/></svg>`,
    titlePlaceholder:"e.g. QR code not scannable on Android",
    descPlaceholder:"What happened? What did you expect instead? Step-by-step if possible." },
  { key:"idea", label:"Idea / Feature", desc:"You would like a new capability.", bg:"#EAF2FA", fg:"#1D5C9B",
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.6.6.9 1.4.9 2.2V16h6.2v-.3c0-.8.3-1.6.9-2.2A6 6 0 0 0 12 3z"/></svg>`,
    titlePlaceholder:"e.g. Add CSV import for flight numbers",
    descPlaceholder:"What would you like to see? What problem does it solve?" },
  { key:"improvement", label:"Improvement", desc:"Something works, but could be better.", bg:"#FDF5E6", fg:"#B66A00",
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l6-6 4 4 7-7"/><path d="M14 8h6v6"/></svg>`,
    titlePlaceholder:"e.g. Make flight cards more compact",
    descPlaceholder:"What currently feels off? What would 'better' look like?" },
  { key:"question", label:"Question", desc:"You need help or clarification.", bg:"#EAF6EF", fg:"#1B7A4B",
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7v.5M12 17h.01"/></svg>`,
    titlePlaceholder:"e.g. How does the team merge work?",
    descPlaceholder:"What are you trying to do? Where are you stuck?" }
];
function renderReportStep(step){
  const steps = 4;
  const dots = Array.from({length:steps}, (_,i) => `<div class="step-dot ${i < step ? "done" : ""} ${i === step-1 ? "active" : ""}"></div>`).join("");
  let title = "Report an Issue"; let body = ""; let footer = "";
  if(step === 1){
    title = "Step 1 · What kind of feedback?";
    body = `<div class="step-dots">${dots}</div><p style="font-size:13.5px;color:var(--ink-2);">Choose the category that best fits your feedback.</p>
      <div style="display:flex;flex-direction:column;gap:8px;">${REPORT_TYPES.map(o => `
        <button type="button" class="gen-schedule-item" style="text-align:left;padding:14px;" onclick="selectReportType('${o.key}')">
          <div style="width:40px;height:40px;border-radius:10px;background:${o.bg};color:${o.fg};display:grid;place-items:center;flex:none;">${o.icon.replace('<svg ','<svg style="width:20px;height:20px;" ')}</div>
          <div style="flex:1;min-width:0;">
            <div style="font-weight:600;font-size:14px;color:var(--ink);">${esc(o.label)}</div>
            <div style="font-size:12.5px;color:var(--ink-3);margin-top:2px;">${esc(o.desc)}</div>
          </div>
          <svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:none;stroke:var(--ink-3);stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex:none;"><path d="M9 18l6-6-6-6"/></svg>
        </button>`).join("")}</div>`;
    footer = `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>`;
  } else if(step === 2){
    title = "Step 2 · Describe it";
    const t = REPORT_TYPES.find(x => x.key === reportDraft.type) || REPORT_TYPES[0];
    body = `<div class="step-dots">${dots}</div>
      <div class="inline-notice info" style="margin-top:0;">
        <div style="width:28px;height:28px;border-radius:8px;background:${t.bg};color:${t.fg};display:grid;place-items:center;flex:none;margin-top:0;">${t.icon.replace('<svg ','<svg style="width:16px;height:16px;" ')}</div>
        <div><b>${esc(t.label)}</b> — ${esc(t.desc)}</div>
      </div>
      <div class="field"><label>Which part of the app? <span class="opt">· optional</span></label>
        <select id="rpArea">
          <option value="">— Please select —</option>
          ${REPORT_AREAS.map(a => `<option value="${esc(a)}" ${reportDraft.area===a?"selected":""}>${esc(a)}</option>`).join("")}
        </select>
      </div>
      <div class="field"><label>Short title</label>
        <input type="text" id="rpTitle" placeholder="${esc(t.titlePlaceholder)}" value="${esc(reportDraft.title)}" maxlength="120">
      </div>
      <div class="field"><label>Details</label>
        <textarea id="rpDesc" rows="7" placeholder="${esc(t.descPlaceholder)}">${esc(reportDraft.description)}</textarea>
        <div class="hint">More detail = faster resolution.</div>
      </div>`;
    footer = `<button class="btn btn-secondary" onclick="renderReportStep(1)">Back</button><button class="btn btn-primary" onclick="submitReportStep2()">Next</button>`;
  } else if(step === 3){
    title = "Step 3 · Your contact (optional)";
    body = `<div class="step-dots">${dots}</div><p style="font-size:13.5px;color:var(--ink-2);">Optional — leave blank to send anonymously.</p>
      <div class="form-grid">
        <div class="field"><label>Your name <span class="opt">· optional</span></label><input type="text" id="rpName" value="${esc(reportDraft.name)}" placeholder="e.g. Judith"></div>
        <div class="field"><label>Email <span class="opt">· optional</span></label><input type="email" id="rpEmail" value="${esc(reportDraft.email)}" placeholder="e.g. you@example.com"></div>
      </div>
      <label style="display:flex;gap:10px;align-items:flex-start;padding:12px;background:var(--surface-2);border:1px solid var(--border);border-radius:8px;cursor:pointer;margin-top:6px;">
        <input type="checkbox" id="rpTech" ${reportDraft.includeTech?"checked":""} style="width:auto;height:auto;margin:4px 0 0 0;">
        <div><div style="font-weight:600;font-size:13px;">Include diagnostic information</div>
        <div style="font-size:12px;color:var(--ink-3);margin-top:2px;">App version, current view, user agent, recent console errors.</div></div>
      </label>`;
    footer = `<button class="btn btn-secondary" onclick="renderReportStep(2)">Back</button><button class="btn btn-primary" onclick="submitReportStep3()">Next</button>`;
  } else if(step === 4){
    title = "Step 4 · Review & send";
    const subj = buildReportSubject(); const bodyText = buildReportBody();
    body = `<div class="step-dots">${dots}</div><p style="font-size:13.5px;color:var(--ink-2);">Review the email. Click <b>Send</b> to open your mail app with everything pre-filled.</p>
      <div class="field"><label>Subject</label><input type="text" value="${esc(subj)}" readonly></div>
      <div class="field"><label>Body</label><div class="preview-block" style="max-height:320px;">${esc(bodyText)}</div></div>`;
    footer = `<button class="btn btn-secondary" onclick="renderReportStep(3)">Back</button><button class="btn btn-secondary" onclick="copyReport()">Copy</button><button class="btn btn-primary" onclick="sendReportEmail()">Send</button>`;
  }
  openModal(title, body, footer, { wide:true });
  if(step === 2) setTimeout(() => $("rpTitle").focus(), 60);
}
function selectReportType(type){ reportDraft.type = type; renderReportStep(2); }
function submitReportStep2(){ const title = ($("rpTitle").value || "").trim(); const desc = ($("rpDesc").value || "").trim(); const area = ($("rpArea")?.value || "").trim(); if(!title){ toast("Please add a short title."); return; } if(!desc){ toast("Please describe."); return; } reportDraft.title = title; reportDraft.description = desc; reportDraft.area = area; renderReportStep(3); }
function submitReportStep3(){ reportDraft.name = ($("rpName").value || "").trim(); reportDraft.email = ($("rpEmail").value || "").trim(); reportDraft.includeTech = !!$("rpTech").checked; renderReportStep(4); }
function buildReportSubject(){ const t = { bug:"[Bug]", idea:"[Idea]", improvement:"[Improvement]", question:"[Question]" }[reportDraft.type] || "[Feedback]"; return `${APP_NAME} ${t} ${reportDraft.title || "(no title)"}`; }
function buildReportBody(){
  const lines = [];
  lines.push(`# ${APP_NAME} — Feedback / Report`); lines.push("");
  lines.push(`Category: ${reportDraft.type.toUpperCase()}`);
lines.push(`Area: ${reportDraft.area || "(not specified)"}`);
lines.push(`Title: ${reportDraft.title}`); lines.push("");
  lines.push("## Description"); lines.push(reportDraft.description); lines.push("");
  if(reportDraft.name || reportDraft.email){ lines.push("## Submitted by"); if(reportDraft.name) lines.push(`Name: ${reportDraft.name}`); if(reportDraft.email) lines.push(`Email: ${reportDraft.email}`); lines.push(""); }
  if(reportDraft.includeTech){
    const d = collectDiagnostics();
    lines.push("## Diagnostic information");
    lines.push(`App: ${d.app} v${d.version} (build ${d.build})`);
    lines.push(`Timestamp: ${d.timestamp}`); lines.push(`Timezone: ${d.timezone}`); lines.push(`Language: ${d.language}`); lines.push(`Platform: ${d.platform}`);
    lines.push(`Screen: ${d.screenSize} · Viewport: ${d.viewport}`);
    lines.push(`Current view: ${d.currentView}`); lines.push(`Current flight: ${d.currentFlight || "–"}`);
    lines.push(`URL: ${d.url}`); lines.push("");
    lines.push("### User agent"); lines.push(d.userAgent); lines.push("");
    if(d.errors.length){ lines.push("### Recent errors"); d.errors.forEach(e => lines.push(`[${e.ts}] ${e.message}`)); lines.push(""); }
    if(d.warnings.length){ lines.push("### Recent warnings"); d.warnings.forEach(e => lines.push(`[${e.ts}] ${e.message}`)); lines.push(""); }
    if(d.events.length){ lines.push("### Recent activity (session only)"); d.events.forEach(e => lines.push(`[${e.ts}] ${e.message}`)); lines.push(""); }
  }
  lines.push("---"); lines.push(`Sent from ${APP_NAME} v${APP_VERSION} on ${new Date().toLocaleString("en-GB")}`);
  return lines.join("\n");
}
function sendReportEmail(){ const s = buildReportSubject(); const b = buildReportBody(); window.location.href = `mailto:${encodeURIComponent(DEVELOPER_INFO.email)}?subject=${encodeURIComponent(s)}&body=${encodeURIComponent(b)}`; logEvent(`Report submitted: ${reportDraft.type} — ${reportDraft.title}`); setTimeout(() => closeModal(), 200); }
async function copyReport(){ const full = `To: ${DEVELOPER_INFO.email}\nSubject: ${buildReportSubject()}\n\n${buildReportBody()}`; try { await navigator.clipboard.writeText(full); toast("Copied."); } catch(e){ const ta = document.createElement("textarea"); ta.value = full; ta.style.position="fixed"; ta.style.opacity="0"; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); toast("Copied."); } catch(_){ toast("Copy blocked."); } ta.remove(); } }
$("btnReport").addEventListener("click", openReportWizard);

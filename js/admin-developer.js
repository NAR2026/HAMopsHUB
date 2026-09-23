/* ============================================================
   Admin / Developer
   ============================================================ */
let devTab = "console";
async function renderDeveloper(){
  const host = $("devContent");
  const flights = await dbAll("flights");
  const forms = await dbAll("forms");
  const audit_ = await dbAll("audit");
  const settings = await dbAll("settings");
  const users = await getSetting("users", []);
  host.innerHTML = `
    <div style="margin-bottom:20px;"><h2 style="font-size:22px;font-weight:650;">Admin</h2><div style="color:var(--ink-3);font-size:13.5px;margin-top:4px;">${esc(APP_NAME)} v${esc(APP_VERSION)} · session only</div></div>
    <div class="stat-grid">
      <div class="stat-box"><div class="k">Flights</div><div class="v">${flights.length}</div></div>
      <div class="stat-box"><div class="k">Summaries</div><div class="v">${forms.length}</div></div>
      <div class="stat-box"><div class="k">Audit events</div><div class="v">${audit_.length}</div></div>
      <div class="stat-box"><div class="k">Activity log</div><div class="v">${activityLog.length}</div></div>
    </div>
    <div class="card" style="margin-bottom:20px;"><div class="card-head"><h2>Admin tools</h2></div>
      <div class="card-body" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
        <button class="btn btn-primary" onclick="openTeamMergeModal()">Merge colleague backups…</button>
        <button class="btn btn-secondary" onclick="openBulkCreateModal()">Bulk create flights…</button>
        <button class="btn btn-secondary" onclick="exportAdminExcel()">Export all as Excel (CSV)</button>
        <button class="btn btn-secondary" onclick="exportBackup()">Export my own backup</button>
        <button class="btn btn-secondary" onclick="openReportWizard()" style="grid-column:1/-1;">Send feedback to developer</button>
        <button class="btn btn-danger-fill" onclick="confirmDeleteAllData()" style="grid-column:1/-1;">Delete all data (flights/summaries)</button>
      </div>
    </div>
    <div class="dev-tabs" id="devTabs">
      <button class="${devTab==="console"?"active":""}" data-devtab="console">Console</button>
      <button class="${devTab==="events"?"active":""}" data-devtab="events">Events (session)</button>
      <button class="${devTab==="audit"?"active":""}" data-devtab="audit">Audit trail</button>
      <button class="${devTab==="users"?"active":""}" data-devtab="users">Users (${users.length})</button>
      <button class="${devTab==="storage"?"active":""}" data-devtab="storage">Storage</button>
      <button class="${devTab==="actions"?"active":""}" data-devtab="actions">Actions</button>
    </div>
    <div class="dev-tab-panel ${devTab==="console"?"active":""}" data-panel="console"><div class="card"><div class="card-head"><h2>Console output (session only)</h2><div style="margin-left:auto;display:flex;gap:6px;"><button class="btn btn-secondary btn-sm" onclick="toggleTracking()"><span id="trackBtnLabel">${trackingEnabled?"Pause":"Resume"}</span></button><button class="btn btn-secondary btn-sm" onclick="clearActivity()">Clear</button></div></div><div class="card-body"><div class="log-console" id="logConsole"></div></div></div></div>
    <div class="dev-tab-panel ${devTab==="events"?"active":""}" data-panel="events"><div class="card"><div class="card-head"><h2>User events (session only)</h2><div style="margin-left:auto;display:flex;gap:6px;"><button class="btn btn-secondary btn-sm" onclick="exportActivity()">Export log</button></div></div><div class="card-body"><div class="log-console" id="eventConsole"></div></div></div></div>
    <div class="dev-tab-panel ${devTab==="audit"?"active":""}" data-panel="audit"><div class="card"><div class="card-head"><h2>Audit trail · last 100 changes (persistent)</h2></div><div class="card-body" style="padding:0;overflow-x:auto;"><table class="stats-table"><thead><tr><th>Time</th><th>Flight</th><th>Action</th><th>Field</th><th>Old</th><th>New</th><th>By</th></tr></thead><tbody>${audit_.sort((a,b)=>(b.timestamp||"").localeCompare(a.timestamp||"")).slice(0,100).map(a => `<tr><td style="font-size:11.5px;">${esc(new Date(a.timestamp).toLocaleString("en-GB"))}</td><td>${esc(a.flightId||"")}</td><td>${esc(a.action)}</td><td>${esc(a.field||"")}</td><td style="font-family:var(--mono);font-size:11.5px;">${esc(a.oldValue||"")}</td><td style="font-family:var(--mono);font-size:11.5px;">${esc(a.newValue||"")}</td><td>${esc(a.employee||"System")}</td></tr>`).join("") || `<tr><td colspan="7" style="color:var(--ink-3);padding:14px;">No audit events recorded.</td></tr>`}</tbody></table></div></div></div>
    <div class="dev-tab-panel ${devTab==="users"?"active":""}" data-panel="users"><div class="card"><div class="card-head"><h2>Users</h2><button class="btn btn-secondary btn-sm" style="margin-left:auto;" onclick="openAddUserModal()">Add</button></div><div class="card-body">${users.map((u,i) => `<div class="user-row"><div class="grow"><div class="name">${esc(u.name)}</div><div class="pw">Password: ${esc(u.password||"—")}</div></div><div style="display:flex;gap:4px;"><button class="action-btn" onclick="openEditUserModal(${i})" title="Edit">${ICONS.edit}</button><button class="action-btn danger" onclick="removeUser(${i})" title="Delete">${ICONS.trash}</button></div></div>`).join("") || `<div style="color:var(--ink-3);font-size:13px;">No users yet.</div>`}</div></div></div>
    <div class="dev-tab-panel ${devTab==="storage"?"active":""}" data-panel="storage"><div class="card"><div class="card-head"><h2>Storage &amp; settings</h2></div><div class="card-body"><div style="font-size:13px;line-height:1.8;"><div>DB: <b>${DB_NAME} v${DB_VERSION}</b></div><div>Flights: <b>${flights.length}</b> · Summaries: <b>${forms.length}</b> · Audit: <b>${audit_.length}</b></div><div>Settings keys: <b>${settings.length}</b></div><div>LocalStorage items: <b>${Object.keys(localStorage).length}</b></div><div>SessionStorage items: <b>${Object.keys(sessionStorage).length}</b></div></div><details style="margin-top:14px;"><summary style="cursor:pointer;font-size:13px;font-weight:600;color:var(--ink-2);">Show settings</summary><div class="preview-block" style="margin-top:8px;max-height:360px;">${esc(JSON.stringify(settings.reduce((o,s)=>{o[s.key]=s.value;return o},{}), null, 2))}</div></details></div></div></div>
    <div class="dev-tab-panel ${devTab==="actions"?"active":""}" data-panel="actions"><div class="card"><div class="card-head"><h2>Danger zone</h2></div><div class="card-body" style="display:flex;flex-direction:column;gap:10px;"><button class="btn btn-secondary btn-block" onclick="exportBackup()">Export backup</button><button class="btn btn-secondary btn-block" onclick="exportAdminExcel()">Export all as CSV</button><button class="btn btn-danger btn-block" onclick="confirmResetAll()">Full reset (all local data)</button><button class="btn btn-danger-fill btn-block" onclick="confirmDeleteAllData()">Delete flights &amp; summaries only (keep Master Data)</button></div></div></div>
  `;
  host.querySelectorAll("[data-devtab]").forEach(b => b.addEventListener("click", () => { devTab = b.dataset.devtab; renderDeveloper(); }));
  if(devTab === "console") renderLogConsole();
  if(devTab === "events") renderEventConsole();
}
function renderLogConsole(){
  const box = $("logConsole"); if(!box) return;
  const entries = activityLog.filter(e => e.type === "info" || e.type === "warn" || e.type === "error");
  box.innerHTML = entries.length ? entries.slice(-200).map(e => `<div class="log-line ${e.type}"><span class="log-time">${esc(new Date(e.ts).toLocaleTimeString("en-GB"))}</span><span>${esc(e.message)}</span></div>`).join("") : `<div style="color:var(--ink-3);padding:6px;">No console output yet.</div>`;
  box.scrollTop = box.scrollHeight;
}
function renderEventConsole(){
  const box = $("eventConsole"); if(!box) return;
  const entries = activityLog.filter(e => e.type === "event");
  box.innerHTML = entries.length ? entries.slice(-200).map(e => `<div class="log-line event"><span class="log-time">${esc(new Date(e.ts).toLocaleTimeString("en-GB"))}</span><span>${esc(e.message)}</span></div>`).join("") : `<div style="color:var(--ink-3);padding:6px;">No events yet.</div>`;
  box.scrollTop = box.scrollHeight;
}
function toggleTracking(){ trackingEnabled = !trackingEnabled; const b = $("trackBtnLabel"); if(b) b.textContent = trackingEnabled ? "Pause" : "Resume"; toast(trackingEnabled ? "Tracking resumed" : "Tracking paused"); }
function clearActivity(){ activityLog.length = 0; renderLogConsole(); renderEventConsole(); }
function exportActivity(){
  const txt = activityLog.map(e => `[${e.ts}] [${e.type}] ${e.message}`).join("\n");
  const blob = new Blob([txt], { type:"text/plain" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `ham_opshub_log_${todayISO()}.txt`; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 800);
}
async function openAddUserModal(){ openModal("Add User", `<div class="form-grid"><div class="field full"><label>Name</label><input type="text" id="addUserName" placeholder="e.g. Judith"></div><div class="field full"><label>Password</label><input type="text" id="addUserPw" placeholder="e.g. TK-HAM-07" style="font-family:var(--mono);"></div></div>`, `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="submitAddUser()">Add</button>`); }
async function submitAddUser(){ const n = $("addUserName").value.trim(), p = $("addUserPw").value.trim(); if(!n || !p){ toast("Both required."); return; } const arr = await getSetting("users", []); if(arr.some(u => u.name.toLowerCase() === n.toLowerCase())){ toast("Already exists."); return; } arr.push({ name:n, password:p }); await setSetting("users", arr); closeModal(); renderDeveloper(); toast("Added."); }
async function openEditUserModal(i){ const arr = await getSetting("users", []); const u = arr[i]; openModal("Edit User", `<div class="form-grid"><div class="field full"><label>Name</label><input type="text" id="editUserName" value="${esc(u.name)}"></div><div class="field full"><label>Password</label><input type="text" id="editUserPw" value="${esc(u.password||"")}" style="font-family:var(--mono);"></div></div>`, `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="submitEditUser(${i})">Save</button>`); }
async function submitEditUser(i){ const n = $("editUserName").value.trim(), p = $("editUserPw").value.trim(); if(!n || !p){ toast("Both required."); return; } const arr = await getSetting("users", []); arr[i] = { name:n, password:p }; await setSetting("users", arr); closeModal(); renderDeveloper(); toast("Saved."); }
async function removeUser(i){ const arr = await getSetting("users", []); arr.splice(i,1); await setSetting("users", arr); renderDeveloper(); }
function confirmResetAll(){ openModal("Full reset", `<p>Delete all local data? This cannot be undone.</p>`, `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-danger-fill" onclick="doResetAll()">Reset</button>`); }
async function doResetAll(){ closeModal(); try { _db.close(); } catch(e){} indexedDB.deleteDatabase(DB_NAME); localStorage.removeItem(MD_OPEN_KEY); localStorage.removeItem(START_COUNT_KEY); localStorage.removeItem(LAST_BACKUP_KEY); setTimeout(() => location.reload(), 400); }
$("btnAdminExit").addEventListener("click", () => { deactivateAdminMode(); switchTab("todayTab"); });

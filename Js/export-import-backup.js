/* ============================================================
   Export / Import / Backup
   ============================================================ */
async function exportMasterData(){
  const keys = ["aircraftFleet","flightSchedules","gates","ahsAgents","tkAgents","prmCodes","staffCodes","otherTypes","users","messageSettings"];
  const settings = {}; for(const k of keys) settings[k] = await getSetting(k, []);
  const payload = { type: "ham_opshub_master", version: APP_VERSION, exportedAt: nowISO(), settings };
  logEvent("Master data exported");
  shareOrCopy(JSON.stringify(payload, null, 2), `ham_opshub_master_${todayISO()}.json`, "Master Data");
}
function openImportMasterDataModal(){
  openModal("Import Master Data", `<p style="font-size:13.5px;color:var(--ink-2);">Paste master data JSON or load a file. Only settings are imported; flights stay unchanged.</p><div class="field"><label>Load file</label><input type="file" id="mdImportFile" accept=".json" style="padding:8px;"></div><div class="field"><label>Paste JSON</label><textarea id="mdImportText" rows="8" placeholder="e.g. Paste the JSON from a colleague..."></textarea></div><label style="display:flex;gap:10px;padding:12px;background:var(--surface-2);border:1px solid var(--border);border-radius:8px;cursor:pointer;"><input type="checkbox" id="mdMergeMode" checked style="width:auto;height:auto;"><div><div style="font-weight:600;font-size:13px;">Merge with existing</div><div style="font-size:12px;color:var(--ink-3);">Uncheck to replace.</div></div></label>`, `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="runImportMasterData()">Import</button>`, { wide:true });
  setTimeout(() => { const f = $("mdImportFile"); if(f) f.addEventListener("change", async e => { const file = e.target.files[0]; if(!file) return; try { $("mdImportText").value = await file.text(); toast("Loaded."); } catch(err){ toast("Read failed."); } }); }, 60);
}
async function runImportMasterData(){
  const txt = ($("mdImportText")?.value || "").trim(); const merge = !!$("mdMergeMode")?.checked;
  if(!txt){ toast("Paste JSON first."); return; }
  let payload; try { payload = JSON.parse(txt); } catch(e){ toast("Invalid JSON."); return; }
  if(!payload || payload.type !== "ham_opshub_master" || !payload.settings){ toast("Not a master data file."); return; }
  const settings = payload.settings;
  const keys = ["aircraftFleet","flightSchedules","gates","ahsAgents","tkAgents","prmCodes","staffCodes","otherTypes","users","messageSettings"];
  for(const k of keys){
    if(!(k in settings)) continue;
    const incoming = settings[k];
    if(merge && Array.isArray(incoming)){
      const existing = await getSetting(k, []);
      const set = new Set(existing.map(x => typeof x === "string" ? x.toLowerCase() : JSON.stringify(x)));
      const merged = [...existing];
      for(const item of incoming){ const key = typeof item === "string" ? item.toLowerCase() : JSON.stringify(item); if(!set.has(key)){ merged.push(item); set.add(key); } }
      await setSetting(k, merged);
    } else await setSetting(k, incoming);
  }
  await loadMasterCache(); closeModal(); toast("Master data imported."); logEvent("Master data imported"); renderMasterData();
}
async function shareOrCopy(text, filename, title){
  const canShare = typeof navigator.share === "function" && typeof navigator.canShare === "function";
  if(canShare){
    try { const file = new File([text], filename, { type: "application/json" });
      if(navigator.canShare({ files: [file] })){ await navigator.share({ files: [file], title: title, text: title + " " + todayISO() }); toast("Shared."); return true; }
    } catch(e){}
  }
  const w = window.open("", "_blank");
  if(!w){ try { await navigator.clipboard.writeText(text); toast("Copied."); return true; } catch(e){ toast("Pop-up blocked."); return false; } }
  w.document.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>' + esc(title) + '</title><style>*{box-sizing:border-box}body{margin:0;-webkit-text-size-adjust:100%;font-family:-apple-system,sans-serif}.notice{background:#EAF6EF;color:#1B7A4B;padding:14px;margin:16px;border-radius:10px;font-size:15px;line-height:1.5}textarea{width:calc(100% - 32px);margin:0 16px 16px;height:60vh;font-family:ui-monospace,Menlo,monospace;font-size:11px;border:1px solid #ccc;border-radius:10px;padding:10px}</style></head><body><div class="notice"><b>' + esc(title) + ' ready.</b><br>Tap inside → <b>Select All</b> → <b>Copy</b>. Paste into Notes / Mail / iCloud Drive.</div><textarea readonly onclick="this.focus();this.select()">' + esc(text) + '</textarea></body></html>');
  w.document.close(); toast(title + " ready."); return true;
}
async function exportBackup(){
  const data = { exportedAt: nowISO(), version: APP_VERSION, app: APP_NAME, flights: await dbAll("flights"), forms: await dbAll("forms"), audit: await dbAll("audit"), settings: await dbAll("settings") };
  const ok = await shareOrCopy(JSON.stringify(data, null, 2), `ham_opshub_backup_${todayISO()}.json`, "Backup");
  if(ok){ localStorage.setItem(LAST_BACKUP_KEY, nowISO()); logEvent("Backup exported"); }
}
async function handleImportFile(e){
  const file = e.target.files[0]; if(!file) return;
  try { const data = JSON.parse(await file.text()); const json = JSON.stringify(data).replace(/'/g,"&#39;"); openModal("Restore Backup", `<p>Replace or merge?</p>`, `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="applyImport('merge', '${json}')">Merge</button><button class="btn btn-danger" onclick="applyImport('replace', '${json}')">Replace</button>`); } catch(err){ toast("Import failed."); }
  e.target.value = "";
}
async function applyImport(mode, raw){
  closeModal(); let data; try { data = JSON.parse(raw); } catch(e){ return; }
  if(mode === "replace"){ for(const s of ["flights","forms","audit","settings"]){ for(const row of await dbAll(s)) await dbDelete(s, s === "settings" ? row.key : row.id); } }
  for(const s of ["flights","forms","audit"]){ if(Array.isArray(data[s])) for(const row of data[s]){ if(!(await dbGet(s, row.id))) await dbPut(s, row); } }
  if(Array.isArray(data.settings)) for(const row of data.settings){ if(mode === "replace") await dbPut("settings", row); else if(!(await dbGet("settings", row.key))) await dbPut("settings", row); }
  await loadMasterCache(); logEvent("Backup imported"); toast("Import complete."); switchTab("todayTab");
}

/* ============================================================
   Backup reminder
   ============================================================ */
function checkStartupBackupReminder(){
  let count = parseInt(localStorage.getItem(START_COUNT_KEY) || "0", 10) || 0;
  count += 1;
  localStorage.setItem(START_COUNT_KEY, String(count));
  if(count % 10 !== 0) return;
  dbAll("flights").then(flights => {
    if(!flights.length) return;
    const last = localStorage.getItem(LAST_BACKUP_KEY);
    setTimeout(() => {
      openModal("Time for a backup", `<p style="font-size:13.5px;color:var(--ink-2);line-height:1.6;">You have opened the app ${count} times since this device was set up. iOS may clear local data after long periods of inactivity. Please export a backup now and save it to Notes, Mail or iCloud Drive.</p>${last ? `<p style="font-size:12.5px;color:var(--ink-3);margin-top:8px;">Last backup: <b>${esc(new Date(last).toLocaleString("en-GB"))}</b> (${esc(relTime(last))})</p>` : ""}`, `<button class="btn btn-secondary" onclick="closeModal()">Later</button><button class="btn btn-primary" onclick="closeModal(); exportBackup();">Export backup now</button>`);
    }, 900);
  });
}

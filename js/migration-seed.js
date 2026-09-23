/* ============================================================
   Migration / Seed
   ============================================================ */
async function migrateSettings(){
  const o = await getSetting("agents", null); if(o && !(await getSetting("ahsAgents", null))){ await setSetting("ahsAgents", o); await dbDelete("settings","agents"); }
  const o2 = await getSetting("tkStaff", null); if(o2 && Array.isArray(o2)){ const cur = await getSetting("staffCodes", []); await setSetting("staffCodes", [...new Set([...cur, ...o2])]); await dbDelete("settings","tkStaff"); }
  for(const f of await dbAll("flights")){
    let ch = false;
    if(f.route !== undefined && f.routeFrom === undefined){ const p = String(f.route||"").split(/\s*(?:→|->|–|-)\s*/).filter(Boolean); f.routeFrom = p[0]?p[0].trim().toUpperCase():""; f.routeTo = p[1]?p[1].trim().toUpperCase():""; delete f.route; ch = true; }
    if(typeof f.registration === "string" && /^TC-/i.test(f.registration)){ f.registration = f.registration.replace(/^TC-?/i,""); ch = true; }
    if(f.typeCode === undefined){ f.typeCode = ""; ch = true; }
    if(ch){ f.updatedAt = nowISO(); await dbPut("flights", f); }
  }
}
async function seedIfEmpty(){ for(const [k,v] of Object.entries(DEFAULT_MASTER)){ if(!(await dbGet("settings", k))) await setSetting(k, v); } }

/* ============================================================
   Flights CRUD
   ============================================================ */
async function findFlightDefaults(fn, iso){
  const s = await getSetting("flightSchedules", []);
  const d = weekdayKey(iso);
  const match = s.find(x => { if(x.flightNumber !== fn) return false; if(d && x.days && !x.days.includes(d)) return false; if(x.validFrom && iso < x.validFrom) return false; if(x.validTo && iso > x.validTo) return false; return true; });
  if(match) return { std:match.std, sta:match.sta, routeFrom:match.routeFrom, routeTo:match.routeTo };
  const fl = await dbAll("flights");
  const same = fl.filter(f => f.flightNumber === fn).sort((a,b) => (b.date||"").localeCompare(a.date||""));
  if(!same.length) return null;
  const l = same[0];
  return { std:l.std||"", sta:l.sta||"", routeFrom:l.routeFrom||"", routeTo:l.routeTo||"" };
}
async function lookupAircraft(reg){ if(!reg) return null; const f = await getSetting("aircraftFleet", []); return f.find(a => String(a.registration).toUpperCase() === String(reg).toUpperCase().replace(/^TC-?/i,"")) || null; }
function splitConfig(c){ if(!c) return { c:"", y:"" }; const m = String(c).match(/^(\d+)\s*C\s*\/\s*Y\s*(\d+)$/i); return m ? { c:m[1], y:m[2] } : { c:"", y:"" }; }
function joinConfig(c, y){ const a = String(c||"").replace(/[^\d]/g,""), b = String(y||"").replace(/[^\d]/g,""); if(a && b) return a+"C/Y"+b; if(a) return a+"C"; if(b) return "Y"+b; return ""; }

async function createFlight(data){
  const date = data.date || todayISO();
  const flight = String(data.flightNumber||"").trim().toUpperCase();
  if(!date || !flight) throw new Error("Date and flight number are required.");
  const id = dateFlightId(date, flight);
  if(await dbGet("flights", id)) throw new Error("This flight already exists on this date.");
  const f = { id, dateFlight:id, date, flightNumber:flight, registration:(data.registration||"").toUpperCase().replace(/^TC-?/i,""), routeFrom:(data.routeFrom||"").toUpperCase(), routeTo:(data.routeTo||"").toUpperCase(), gate:(data.gate||"").toUpperCase(), std:data.std||"", sta:data.sta||"", aircraftType:data.aircraftType||"", typeCode:(data.typeCode||"").toUpperCase(), config:data.config||"", status:"open", cancellation:null, createdAt:nowISO(), updatedAt:nowISO() };
  await dbPut("flights", f);
  await audit(id, "Flight created", { employee: "System" });
  logEvent(`Flight created: ${flight} (${date})`);
  return f;
}
async function updateFlight(id, data){
  const f = await dbGet("flights", id); if(!f) throw new Error("Flight not found.");
  const date = data.date || f.date; const flight = String(data.flightNumber || f.flightNumber).trim().toUpperCase();
  const newId = dateFlightId(date, flight);
  if(newId !== id && await dbGet("flights", newId)) throw new Error("Another flight already exists on this date.");
  const updates = { registration: data.registration != null ? String(data.registration).toUpperCase().replace(/^TC-?/i,"") : f.registration, routeFrom: data.routeFrom != null ? String(data.routeFrom).toUpperCase() : f.routeFrom, routeTo: data.routeTo != null ? String(data.routeTo).toUpperCase() : f.routeTo, gate: data.gate != null ? String(data.gate).toUpperCase() : f.gate, std: data.std != null ? String(data.std) : f.std, sta: data.sta != null ? String(data.sta) : f.sta, aircraftType: data.aircraftType != null ? String(data.aircraftType) : f.aircraftType, typeCode: data.typeCode != null ? String(data.typeCode).toUpperCase() : f.typeCode, config: data.config != null ? String(data.config) : f.config };
  for(const [k,v] of Object.entries(updates)){ if(String(v) !== String(f[k]||"")){ await audit(id, "Flight data changed", { field:k, oldValue:f[k]||"", newValue:v, employee:"Current user" }); f[k] = v; } }
  if(newId !== id){
    const oldId = id; const nf = { ...f, id:newId, dateFlight:newId, date, flightNumber:flight, updatedAt:nowISO() };
    await dbPut("flights", nf); await dbDelete("flights", oldId);
    for(const fm of (await dbAll("forms")).filter(x => x.flightId === oldId)){ fm.flightId=newId; fm.flightPhase=`${newId}__${fm.phase}`; await dbPut("forms", fm); }
    for(const a of (await dbAll("audit")).filter(x => x.flightId === oldId)){ a.flightId=newId; await dbPut("audit", a); }
    return nf;
  }
  f.updatedAt = nowISO(); await dbPut("flights", f); return f;
}
async function deleteFlight(id){ await dbDelete("flights", id); for(const fm of (await dbAll("forms")).filter(x => x.flightId === id)) await dbDelete("forms", fm.id); for(const a of (await dbAll("audit")).filter(x => x.flightId === id)) await dbDelete("audit", a.id); logEvent(`Flight deleted: ${id}`); }
async function listFlights(){ return (await dbAll("flights")).sort((a,b) => ((b.date||"")+(b.std||"")+b.flightNumber).localeCompare((a.date||"")+(a.std||"")+a.flightNumber)); }
async function getFormsForFlight(fid){ return (await dbAll("forms")).filter(x => x.flightId === fid); }
async function getForm(fid, key){ return (await dbAll("forms")).find(x => x.flightId === fid && x.phase === key) || null; }
function getCheckinForm(forms){ return forms.find(x => x.phase === "checkin") || null; }
function isCheckinDone(forms){ const f = getCheckinForm(forms); return !!(f && f.status === "done"); }
function flightOverallStatus(forms, flight){ if(flight && flight.status === "cancelled") return "cancelled"; return isCheckinDone(forms) ? "done" : "open"; }
function checkinSummary(data){ if(!data) return []; const out = []; const pax = (Number(data.cPax)||0) + (Number(data.yPax)||0) + (Number(data.infPax)||0); if(data.closeTime) out.push("Close " + fmtTimeShort(data.closeTime) + "L"); if(pax) out.push(`${Number(data.cPax)||0}C/${Number(data.yPax)||0}Y+${Number(data.infPax)||0}INF`); if(data.cMeal || data.yMeal) out.push(`Meals ${Number(data.cMeal)||0}C/${Number(data.yMeal)||0}Y`); if(data.cba) out.push(Number(data.cba) + "x CBA"); if(data.reqFp === "YES") out.push("New flight plan"); return out; }

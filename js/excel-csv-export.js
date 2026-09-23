/* ============================================================
   Excel / CSV Export (admin)
   ============================================================ */
async function exportAdminExcel(){
  if(!isAdminMode()){ toast("Admin only."); return; }
  const flights = await listFlights(); const formsAll = await dbAll("forms");
  const formsById = {}; for(const fm of formsAll){ formsById[fm.flightId] = formsById[fm.flightId] || {}; formsById[fm.flightId][fm.phase] = fm; }
  const headers = ["Date","Flight","Registration","From","To","Gate","STD","STA","Aircraft","TypeCode","Config","SummaryStatus","CloseTime","LateReason","C","Y","INF","Total","CMeal","YMeal","CBA","Loaded","Specials","NoMealSeats","CompletedBy","CompletedAt","LastUpdated"];
  const rows = [headers];
  for(const f of flights){
    const fm = formsById[f.id] && formsById[f.id].checkin; const d = (fm && fm.data) || {};
    const c = Number(d.cPax)||0, y = Number(d.yPax)||0, inf = Number(d.infPax)||0;
    rows.push([ fmtDate(f.date), f.flightNumber || "", displayReg(f.registration || ""), f.routeFrom || "", f.routeTo || "", f.gate || "", f.std || "", f.sta || "", f.aircraftType || "", f.typeCode || "", f.config || "", fm ? fm.status : "none", d.closeTime || "", d.lateReason || "", c, y, inf, (c+y+inf), Number(d.cMeal)||0, Number(d.yMeal)||0, Number(d.cba)||0, Number(d.loaded)||0, (d.specials||[]).reduce((s,x)=>s+(Number(x.qty)||1),0), (d.noMealC||[]).length + (d.noMealY||[]).length, (fm && fm.completedBy) || "", (fm && fm.completedAt) || "", f.updatedAt || "" ]);
  }
  const csv = rows.map(row => row.map(cell => { const s = String(cell == null ? "" : cell); if(/[;"\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"'; return s; }).join(";")).join("\r\n");
  const name = `ham_opshub_export_${todayISO()}.csv`;
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const canShare = typeof navigator.share === "function" && typeof navigator.canShare === "function";
  if(canShare){
    try { const file = new File([blob], name, { type: "text/csv" });
      if(navigator.canShare({ files: [file] })){ await navigator.share({ files: [file], title: "HAM Ops Hub Export", text: "Export " + todayISO() }); logEvent(`CSV export: ${rows.length - 1} rows`); toast("Excel file shared."); return; }
    } catch(e){}
  }
  const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = name; a.style.display = "none";
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 800);
  logEvent(`CSV export: ${rows.length - 1} rows`); toast("Excel file ready.");
}

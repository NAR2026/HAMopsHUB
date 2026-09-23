/* ============================================================
   All Flights
   ============================================================ */
let allFlightsFilter = { date:"", flight:"", reg:"" };

async function renderAllFlights(){
  const host = $("allFlightsContent");
  const flights = await listFlights(); const formsAll = await dbAll("forms");
  host.innerHTML = `
    <div class="card" style="margin-bottom:20px;"><div class="card-body">
      <div class="filter-bar">
        <div class="filter-field"><label>Date</label><input type="text" id="fltDate" value="${esc(formatDateInput(allFlightsFilter.date))}" inputmode="numeric" placeholder="DD.MM.YYYY" maxlength="10" autocomplete="off"></div>
        <div class="filter-field"><label>Flight number</label><input type="text" id="fltFlight" value="${esc(allFlightsFilter.flight)}" placeholder="e.g. 1668" autocomplete="off"></div>
        <div class="filter-field"><label>Registration</label><input type="text" id="fltReg" value="${esc(allFlightsFilter.reg)}" placeholder="e.g. LSM" style="text-transform:uppercase" autocomplete="off"></div>
        <div class="filter-field"><label>&nbsp;</label><button class="btn btn-secondary" id="fltClear">Clear</button></div>
      </div>
    </div></div>
    <div id="allFlightsListHost"></div>
  `;
  wireDateInput($("fltDate"));
  let __fltTimer = null;
  const scheduleUpdate = () => { clearTimeout(__fltTimer); __fltTimer = setTimeout(updateAllFlightsList, 160); };
  $("fltDate").addEventListener("input", e => { allFlightsFilter.date = e.target.value; scheduleUpdate(); });
  $("fltFlight").addEventListener("input", e => { allFlightsFilter.flight = e.target.value; scheduleUpdate(); });
  $("fltReg").addEventListener("input", e => { allFlightsFilter.reg = e.target.value; scheduleUpdate(); });
  $("fltClear").addEventListener("click", () => { allFlightsFilter = { date:"", flight:"", reg:"" }; $("fltDate").value = ""; $("fltFlight").value = ""; $("fltReg").value = ""; updateAllFlightsList(); });
  updateAllFlightsList(flights, formsAll);
}

async function updateAllFlightsList(flightsIn, formsIn){
  const host = $("allFlightsListHost"); if(!host) return;
  const flights = flightsIn || await listFlights(); const formsAll = formsIn || await dbAll("forms");
  const dateIso = parseDateInput(allFlightsFilter.date);
  const q = { date:dateIso, flight:(allFlightsFilter.flight||"").toLowerCase().trim(), reg:(allFlightsFilter.reg||"").toLowerCase().trim() };
  let filtered = flights.filter(f => {
    if(q.date && f.date !== q.date) return false;
    if(q.flight){ const fn = String(f.flightNumber||"").toLowerCase(); if(!fn.includes(q.flight) && !fn.replace(/^tk/,"").includes(q.flight)) return false; }
    if(q.reg && !String(f.registration||"").toLowerCase().includes(q.reg)) return false;
    return true;
  });
  filtered = sortFlights(filtered);
  const hasFilter = q.date || q.flight || q.reg;
  const visibleIds = filtered.map(f => f.id);
  const allSelected = visibleIds.length > 0 && visibleIds.every(id => selectedFlights.has(id));
  host.innerHTML = `
    <div class="sec-head"><h3>${filtered.length} flight${filtered.length===1?"":"s"}</h3><div class="sort-controls">${bulkSelectionActive && visibleIds.length ? `<button class="btn btn-secondary btn-sm" onclick="selectAllVisible(${JSON.stringify(visibleIds).replace(/"/g,'&quot;')})">${allSelected?"Deselect all":"Select all"}</button>` : ""}<button class="btn btn-secondary btn-sm" onclick="toggleBulkSelection()">${bulkSelectionActive ? "Cancel select" : "Bulk select"}</button>${sortSelectHtml()}</div></div>
    ${filtered.length === 0 ? `<div class="card"><div class="card-body"><div class="empty-state"><h3>No flights found</h3><p>${hasFilter?"Try a different filter.":"Create your first flight."}</p>${!hasFilter?`<button class="btn btn-primary" onclick="openNewFlightChoiceModal()">New Flight</button>`:""}</div></div></div>` : `<div class="flight-list">${filtered.map(f => flightCardHtml(f, formsAll.filter(x=>x.flightId===f.id), true, bulkSelectionActive)).join("")}</div>`}
  `;
  renderSelectionBar();
}

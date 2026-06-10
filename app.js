/**
 * AKH Digital Twin Core Scripting Architecture Engine
 * Integrated Multi-Page Slicing Routing and Synchronized Speckle Filtering Elements
 */

const baseModelUrl = "https://app.speckle.systems/projects/cdc6ab8d3b/models/f678e2b160?transparent=true";
const iframe = document.getElementById('speckle-iframe');

// Enforce Exact Theme Hex Color Mapping System Specification Part 7.1
const domainColors = {
    "KLINIK": "#2563EB",  // Blue
    "PFLEGE": "#16A34A",   // Green  
    "AERZTL": "#9333EA",   // Purple
    "GB": "#EA580C",       // Orange
    "INFRA": "#64748B",    // Slate
    "SCHULE": "#D97706",   // Amber
    "VACANT": "#E5E7EB",   // Unbelegt / Light Gray
    "CRITICAL": "#DC2626"  // Alert Red
};

// Comprehensive Star-Schema Mock Relational Object Structure Data Model
const dimRoomsDataset = [
    { id: "R-101", name: "OP-Saal 1", building: "Hauptgebäude", floor: "EG", type: "OP-Bereich", area: 48, domain: "KLINIK", dept: "Herzchirurgie", kst: "95200", status: "Belegt", cost: 22, util: 88, variance: 3.2 },
    { id: "R-102", name: "Aufwachraum", building: "Hauptgebäude", floor: "EG", type: "Behandlung", area: 24, domain: "KLINIK", dept: "Herzchirurgie", kst: "95200", status: "Belegt", cost: 22, util: 75, variance: 1.1 },
    { id: "R-103", name: "Kardiologie Station", building: "Hauptgebäude", floor: "1.OG", type: "Behandlung", area: 35, domain: "KLINIK", dept: "Kardiologie", kst: "92570", status: "Belegt", cost: 21, util: 82, variance: -0.5 },
    { id: "R-201", name: "Bettenstation West", building: "Gebäude B", floor: "1.OG", type: "Patientenzimmer", area: 120, domain: "PFLEGE", dept: "Allg. Pflege", kst: "81000", status: "Belegt", cost: 16, util: 92, variance: 4.8 },
    { id: "R-202", name: "Pflegestützpunkt Süd", building: "Gebäude B", floor: "EG", type: "Büro", area: 40, domain: "PFLEGE", dept: "Allg. Pflege", kst: "81000", status: "Belegt", cost: 16, util: 60, variance: 0.0 },
    { id: "R-301", name: "Arztbüro Innere", building: "Gebäude B", floor: "2.OG", type: "Büro", area: 22, domain: "AERZTL", dept: "Innere Medizin", kst: "91000", status: "Belegt", cost: 18, util: 45, variance: 1.2 },
    { id: "R-001", name: "Zentrallager Logistik", building: "Gebäude C", floor: "UG", type: "Lager", area: 210, domain: "INFRA", dept: "Logistik & FM", kst: "90010", status: "Leerstand", cost: 12, util: 0, variance: -2.3 },
    { id: "R-002", name: "Technikzentrale UG", building: "Hauptgebäude", floor: "UG", type: "Technik", area: 85, domain: "INFRA", dept: "Logistik & FM", kst: "90010", status: "Belegt", cost: 14, util: 95, variance: 0.8 },
    { id: "R-401", name: "Verwaltung Loge", building: "Gebäude C", floor: "EG", type: "Büro", area: 65, domain: "GB", dept: "Finanzwesen", kst: "71000", status: "Belegt", cost: 17, util: 70, variance: -1.5 },
    { id: "R-501", name: "Hörsaal Medizin", building: "Schulgebäude", floor: "EG", type: "Schulung", area: 110, domain: "SCHULE", dept: "Ausbildung", kst: "61000", status: "Belegt", cost: 15, util: 55, variance: 0.2 }
];

const structuralHierarchyCascades = {
    "KLINIK": ["Herzchirurgie", "Kardiologie"],
    "PFLEGE": ["Allg. Pflege"],
    "AERZTL": ["Innere Medizin"],
    "GB": ["Finanzwesen"],
    "INFRA": ["Logistik & FM"],
    "SCHULE": ["Ausbildung"]
};

// Trackers for active application filter context
let currentActiveViewPage = "p1";
let selectedT1Domain = "ALL";
let selectedT2Dept = "ALL";
let selectedT3Kst = "ALL";

// Chart Global Instance Context Registry Cache
let activeChartsRegistry = {};

document.addEventListener("DOMContentLoaded", () => {
    renderGlobalKPICardOutputs(dimRoomsDataset);
    populateBaseDataViews(dimRoomsDataset);
    initializeOverviewCharts(dimRoomsDataset);
});

// SECTION 1: Multi-Page Client-Side Routing Architecture Layout
function switchPage(pageId) {
    currentActiveViewPage = pageId;
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.report-page').forEach(p => p.classList.remove('visible'));
    
    document.querySelector(`[data-page="${pageId}"]`).classList.add('active');
    document.getElementById(`page-${pageId}`).classList.add('visible');

    // Trigger instant component layout recalibration
    setTimeout(() => { rebuildPageTargetedGraphics(); }, 50);
}

// SECTION 2: 3-Tier Hierarchical Progressive Navigation Control Rules
function selectTier1Domain(domainKey) {
    selectedT1Domain = domainKey;
    selectedT2Dept = "ALL";
    selectedT3Kst = "ALL";

    document.querySelectorAll('.domain-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-domain="${domainKey}"]`).classList.add('active');

    const t2Wrapper = document.getElementById('t2-wrapper');
    const t3Wrapper = document.getElementById('t3-wrapper');

    if (domainKey === "ALL") {
        t2Wrapper.classList.add('hidden');
        t3Wrapper.classList.add('hidden');
        evaluateFilteringPipeline();
    } else {
        t2Wrapper.classList.remove('hidden');
        t3Wrapper.classList.add('hidden');
        
        const pillBox = document.getElementById('t2-pillbox');
        pillBox.innerHTML = `<button class="pill-btn active" onclick="selectTier2Department('ALL', this)">Alle</button>`;
        
        structuralHierarchyCascades[domainKey].forEach(dept => {
            pillBox.innerHTML += `<button class="pill-btn" onclick="selectTier2Department('${dept}', this)">${dept}</button>`;
        });
        evaluateFilteringPipeline();
    }
}

function selectTier2Department(deptName, element) {
    selectedT2Dept = deptName;
    selectedT3Kst = "ALL";

    if (element) {
        element.parentNode.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
        element.classList.add('active');
    }

    const t3Wrapper = document.getElementById('t3-wrapper');
    const dropdown = document.getElementById('t3-dropdown');

    if (deptName === "ALL") {
        t3Wrapper.classList.add('hidden');
    } else {
        t3Wrapper.classList.remove('hidden');
        dropdown.innerHTML = `<option value="ALL">-- Alle Kostenstellen (KST) --</option>`;
        
        const matchedKsts = [...new Set(dimRoomsDataset.filter(r => r.dept === deptName).map(r => r.kst))];
        matchedKsts.forEach(kst => {
            dropdown.innerHTML += `<option value="${kst}">KST — ${kst}</option>`;
        });
    }
    evaluateFilteringPipeline();
}

function selectTier3KST() {
    selectedT3Kst = document.getElementById('t3-dropdown').value;
    evaluateFilteringPipeline();
}

// SECTION 3: Central Fact Pipeline Evaluation and Multi-Layer Slicer Integration
function evaluateFilteringPipeline() {
    let processDataset = [...dimRoomsDataset];

    if (selectedT1Domain !== "ALL") processDataset = processDataset.filter(r => r.domain === selectedT1Domain);
    if (selectedT2Dept !== "ALL") processDataset = processDataset.filter(r => r.dept === selectedT2Dept);
    if (selectedT3Kst !== "ALL") processDataset = processDataset.filter(r => r.kst === selectedT3Kst);

    renderGlobalKPICardOutputs(processDataset);
    populateBaseDataViews(processDataset);
    rebuildPageTargetedGraphics(processDataset);
    applySynchronizedSpeckleVisualEngine(processDataset);
}

function renderGlobalKPICardOutputs(data) {
    const totalArea = data.reduce((acc, r) => acc + r.area, 0);
    const vacantArea = data.filter(r => r.status === "Leerstand").reduce((acc, r) => acc + r.area, 0);
    const meanCost = data.reduce((acc, r) => acc + r.cost, 0) / (data.length || 1);

    document.getElementById('global-kpi-total').innerText = `${totalArea.toLocaleString('de-DE')} m²`;
    document.getElementById('global-kpi-occupied').innerText = `${(totalArea - vacantArea).toLocaleString('de-DE')} m²`;
    document.getElementById('global-kpi-vacant').innerText = `${vacantArea.toLocaleString('de-DE')} m²`;
    document.getElementById('global-kpi-cost').innerText = `€${meanCost.toFixed(2)}`;

    const vacancyCard = document.getElementById('kpi-vacancy-wrapper');
    if (vacantArea > 100) {
        vacancyCard.className = "kpi-card alert-state-triggered";
    } else {
        vacancyCard.className = "kpi-card";
    }
}

// SECTION 4: Contextual Display Grid and Registry Compilation
function populateBaseDataViews(data) {
    // Sync Page 2 BIM Context Lists
    const p2Body = document.getElementById('p2-table-body');
    p2Body.innerHTML = "";
    data.forEach(r => {
        p2Body.innerHTML += `
            <tr class="ledger-row" onclick="focusSingleBIMElement('${r.id}', '${r.domain}')">
                <td><strong>${r.id}</strong></td>
                <td>${r.name}</td>
                <td><span class="table-tag">${r.type}</span></td>
                <td>${r.area} m²</td>
            </tr>`;
    });

    // Populate Page 2 Context Readout Panel
    if(data.length === 1 || selectedT3Kst !== "ALL") {
        document.getElementById('p2-ctx-kst').innerText = data[0]?.kst || "-";
        document.getElementById('p2-ctx-area').innerText = `${data[0]?.area || 0} m²`;
        document.getElementById('p2-ctx-util').innerText = `${data[0]?.util || 0}%`;
        document.getElementById('p2-ctx-cost').innerText = `€${data[0]?.cost || 0}/m²`;
    } else {
        document.getElementById('p2-ctx-kst').innerText = selectedT1Domain !== "ALL" ? `Domain Context active` : "Gesamtklinik";
        document.getElementById('p2-ctx-area').innerText = `${data.reduce((s,r)=>s+r.area,0)} m²`;
        document.getElementById('p2-ctx-util').innerText = `${Math.round(data.reduce((s,r)=>s+r.util,0)/(data.length||1))}%`;
        document.getElementById('p2-ctx-cost').innerText = `Multi-KST Context`;
    }

    // Sync Page 6 Room Explorer Full Data Ledger
    const p6Body = document.getElementById('p6-explorer-body');
    p6Body.innerHTML = "";
    data.forEach(r => {
        p6Body.innerHTML += `
            <tr class="ledger-row" onclick="focusSingleBIMElement('${r.id}', '${r.domain}')">
                <td><strong>${r.id}</strong></td>
                <td>${r.name}</td>
                <td>${r.building}</td>
                <td>${r.floor}</td>
                <td><span class="table-tag">${r.type}</span></td>
                <td>${r.area} m²</td>
                <td><code>${r.kst}</code></td>
                <td><span class="badge" style="background:${r.status === 'Leerstand' ? '#ef4444' : '#22c55e'}; color:white">${r.status}</span></td>
                <td><strong>€${r.cost.toFixed(2)}</strong></td>
            </tr>`;
    });
}

// SECTION 5: ChartJS Multi-Page Graphic Rendering Engine Control Layer
function clearActiveChartsByPage(pageId) {
    if (activeChartsRegistry[pageId]) {
        activeChartsRegistry[pageId].forEach(instance => instance.destroy());
        activeChartsRegistry[pageId] = [];
    } else {
        activeChartsRegistry[pageId] = [];
    }
}

function rebuildPageTargetedGraphics(scopedData) {
    const dataset = scopedData || getCurrentlyFilteredScope();
    
    if (currentActiveViewPage === "p1") {
        clearActiveChartsByPage("p1");
        initializeOverviewCharts(dataset);
    } else if (currentActiveViewPage === "p3") {
        clearActiveChartsByPage("p3");
        initializePage3Charts(dataset);
    } else if (currentActiveViewPage === "p4") {
        clearActiveChartsByPage("p4");
        initializePage4Charts(dataset);
    } else if (currentActiveViewPage === "p5") {
        clearActiveChartsByPage("p5");
        initializePage5Charts(dataset);
    }
}

function getCurrentlyFilteredScope() {
    let subset = [...dimRoomsDataset];
    if (selectedT1Domain !== "ALL") subset = subset.filter(r => r.domain === selectedT1Domain);
    if (selectedT2Dept !== "ALL") subset = subset.filter(r => r.dept === selectedT2Dept);
    if (selectedT3Kst !== "ALL") subset = subset.filter(r => r.kst === selectedT3Kst);
    return subset;
}

// Chart Initializers per Page context
function initializeOverviewCharts(data) {
    clearActiveChartsByPage("p1");
    
    // Aggregation Logic - Space per Building
    const bldgMap = data.reduce((acc, r) => { acc[r.building] = (acc[r.building] || 0) + r.area; return acc; }, {});
    const ctxBldg = document.getElementById('p1-buildingChart').getContext('2d');
    const c1 = new Chart(ctxBldg, {
        type: 'bar',
        data: { labels: Object.keys(bldgMap), datasets: [{ label: 'Nutzfläche (m²)', data: Object.values(bldgMap), backgroundColor: '#1e40af' }] },
        options: { responsive: true, maintainAspectRatio: false }
    });

    // Aggregation Logic - Space Intensity per Floor
    const floorMap = data.reduce((acc, r) => { acc[r.floor] = (acc[r.floor] || 0) + r.area; return acc; }, {});
    const ctxFloor = document.getElementById('p1-floorHeatmap').getContext('2d');
    const c2 = new Chart(ctxFloor, {
        type: 'bar',
        data: { labels: Object.keys(floorMap), datasets: [{ label: 'Dichte Profil (m²)', data: Object.values(floorMap), backgroundColor: '#0284c7' }] },
        options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false }
    });

    // Static Multi-Month Financial Trend Line Graph Output
    const ctxTrend = document.getElementById('p1-costTrendChart').getContext('2d');
    const c3 = new Chart(ctxTrend, {
        type: 'line',
        data: {
            labels: ['Jul 25', 'Aug 25', 'Sep 25', 'Okt 25', 'Nov 25', 'Dez 25', 'Jan 26', 'Feb 26', 'Mrz 26', 'Apr 26', 'Mai 26', 'Jun 26'],
            datasets: [
                { label: 'Ist-Kosten (€/m²)', data: [17.2, 17.5, 17.4, 17.9, 18.1, 18.0, 18.2, 18.5, 18.3, 18.6, 18.4, 18.4], borderColor: '#1e40af', tension: 0.1 },
                { label: 'Soll-Budget Target', data: [17.5, 17.5, 17.5, 17.5, 17.5, 17.5, 17.5, 17.5, 17.5, 17.5, 17.5, 17.5], borderColor: '#ef4444', borderDash: [5, 5], fill: false }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    activeChartsRegistry["p1"] = [c1, c2, c3];
}

function initializePage3Charts(data) {
    // Simulated Tree-map Area Distribution Chart via pie element representation
    const kstSpaceMap = data.reduce((acc, r) => { acc[`KST ${r.kst}`] = (acc[`KST ${r.kst}`] || 0) + r.area; return acc; }, {});
    const ctxP3C1 = document.getElementById('p3-treemapChart').getContext('2d');
    const c1 = new Chart(ctxP3C1, {
        type: 'pie',
        data: { labels: Object.keys(kstSpaceMap), datasets: [{ data: Object.values(kstSpaceMap), backgroundColor: Object.keys(kstSpaceMap).map((_,i)=>`hsl(${210 + i*25}, 70%, 50%)`) }] },
        options: { responsive: true, maintainAspectRatio: false }
    });

    // Deviations and variances compilation
    const ctxP3C2 = document.getElementById('p3-varianceChart').getContext('2d');
    const c2 = new Chart(ctxP3C2, {
        type: 'bar',
        data: {
            labels: data.map(r => r.id),
            datasets: [{ label: 'Budgetabweichung (%)', data: data.map(r => r.variance), backgroundColor: data.map(r => r.variance > 0 ? '#dc2626' : '#16a34a') }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
    activeChartsRegistry["p3"] = [c1, c2];
}

function initializePage4Charts(data) {
    const ctxP4C1 = document.getElementById('p4-occupancyChart').getContext('2d');
    const c1 = new Chart(ctxP4C1, {
        type: 'doughnut',
        data: { labels: ['Belegt', 'Leerstand'], datasets: [{ data: [data.filter(r=>r.status!=='Leerstand').length, data.filter(r=>r.status==='Leerstand').length], backgroundColor: ['#16a34a', '#dc2626'] }] },
        options: { responsive: true, maintainAspectRatio: false }
    });

    const ctxP4C2 = document.getElementById('p4-energyChart').getContext('2d');
    const c2 = new Chart(ctxP4C2, {
        type: 'polarArea',
        data: { labels: data.map(r=>r.id), datasets: [{ data: data.map(r=>r.area * 0.45), backgroundColor: ['#64748b', '#78716c', '#d97706', '#2563eb'] }] },
        options: { responsive: true, maintainAspectRatio: false }
    });
    activeChartsRegistry["p4"] = [c1, c2];
}

function initializePage5Charts(data) {
    const ctxP5C1 = document.getElementById('p5-scatterChart').getContext('2d');
    const scatterData = data.map(r => ({ x: r.area, y: r.util, r: Math.max(r.cost * 0.5, 4) }));
    const c1 = new Chart(ctxP5C1, {
        type: 'bubble',
        data: { datasets: [{ label: 'KST Einheiten (Radius = Kosten/m²)', data: scatterData, backgroundColor: 'rgba(37, 99, 235, 0.6)' }] },
        options: { responsive: true, maintainAspectRatio: false, scales: { x: { title: { display: true, text: 'Fläche in m²' } }, y: { title: { display: true, text: 'Auslastungsquote (%)' } } } }
    });

    const ctxP5C2 = document.getElementById('p5-utilTrendChart').getContext('2d');
    const c2 = new Chart(ctxP5C2, {
        type: 'line',
        data: { labels: ['M1', 'M2', 'M3', 'M4'], datasets: [{ label: 'KST Nutzung', data: [70, 72, 79, 81], borderColor: '#16a34a' }] },
        options: { responsive: true, maintainAspectRatio: false }
    });

    const ctxP5C3 = document.getElementById('p5-vacancyCostChart').getContext('2d');
    const c3 = new Chart(ctxP5C3, {
        type: 'bar',
        data: { labels: ['Verlust Opportunity Cost'], datasets: [{ data: [data.filter(r=>r.status==='Leerstand').reduce((s,r)=>s+(r.area*18),0)], backgroundColor: '#dc2626' }] },
        options: { responsive: true, maintainAspectRatio: false }
    });
    activeChartsRegistry["p5"] = [c1, c2, c3];
}

// SECTION 6: Live 3D Speckle Modeling Synchronization Interoperability Rules Layer
function applySynchronizedSpeckleVisualEngine(visibleScope) {
    if (!iframe || visibleScope.length === 0) return;
    const logger = document.getElementById('bim-log-panel');
    let dynamicFilterUrl = baseModelUrl;

    if (selectedT1Domain === "ALL") {
        // Build system cross-coloring matching specific organizational boundaries concurrently
        const multiDomainBatchFilters = [
            { property: "parameters.KSTCode", operator: "=", value: "95200", color: domainColors.KLINIK },
            { property: "parameters.KSTCode", operator: "=", value: "92570", color: domainColors.KLINIK },
            { property: "parameters.KSTCode", operator: "=", value: "81000", color: domainColors.PFLEGE },
            { property: "parameters.KSTCode", operator: "=", value: "91000", color: domainColors.AERZTL },
            { property: "parameters.KSTCode", operator: "=", value: "90010", color: domainColors.INFRA },
            { property: "parameters.KSTCode", operator: "=", value: "71000", color: domainColors.GB },
            { property: "parameters.KSTCode", operator: "=", value: "61000", color: domainColors.SCHULE }
        ];
        dynamicFilterUrl += `&filter=${JSON.stringify(multiDomainBatchFilters)}`;
        logger.innerText = `Speckle 3D Engine: Liegenschaft Gesamt geladen. Alle Domains farbcodiert.`;
    } else {
        // Filter sub-selection mapping isolation
        const activeKstCodes = [...new Set(visibleScope.map(r => r.kst))];
        const primaryHex = domainColors[selectedT1Domain] || domainColors.KLINIK;

        const selectionFilterPayload = activeKstCodes.map(code => ({
            property: "parameters.KSTCode",
            operator: "=",
            value: code,
            color: primaryHex
        }));

        dynamicFilterUrl += `&filter=${JSON.stringify(selectionFilterPayload)}&isolate=true`;
        logger.innerText = `Speckle 3D Engine: Synchronisiert. ${visibleScope.length} Objekte im Fokus (${selectedT1Domain}).`;
    }
    iframe.src = dynamicFilterUrl;
}

function focusSingleBIMElement(roomId, domainKey) {
    if(currentActiveViewPage !== "p2") switchPage("p2");
    
    const targetColor = domainColors[domainKey] || "#2563eb";
    const isolationPayload = [{ property: "id", operator: "=", value: roomId, color: targetColor }];
    
    iframe.src = `${baseModelUrl}&filter=${JSON.stringify(isolationPayload)}&isolate=true`;
    document.getElementById('bim-log-panel').innerText = `BIM Focus Target: Einzellokation ${roomId} fokussiert`;
}

// SECTION 7: Auxiliary Global Reset and Searching Functionalities
function executeRoomRegistrySearch() {
    const searchString = document.getElementById('p6-search').value.toLowerCase();
    const rows = document.querySelectorAll('#p6-explorer-body .ledger-row');
    
    rows.forEach(row => {
        const textContent = row.textContent.toLowerCase();
        row.style.display = textContent.includes(searchString) ? "" : "none";
    });
}

function executeGlobalReset() {
    document.getElementById('p6-search').value = "";
    selectTier1Domain('ALL');
}

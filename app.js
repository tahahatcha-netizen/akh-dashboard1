/**
 * AKH Digital Twin Application Controller Core Engine
 * Manages data interactions, chart states, and synchronized color cross-filtering into the Speckle Engine
 */

const baseModelUrl = "https://app.speckle.systems/projects/cdc6ab8d3b/models/f678e2b160?transparent=true";
const iframe = document.getElementById('speckle-iframe');

// 1. Enterprise Star-Schema Mock-Database Initialization
const hospitalMockData = [
    { id: "R-101", name: "OP-Saal 1", domain: "KLINIK", dept: "Herzchirurgie", kst: "95200", area: 48, status: "Occupied" },
    { id: "R-102", name: "Aufwachraum", domain: "KLINIK", dept: "Herzchirurgie", kst: "95200", area: 24, status: "Occupied" },
    { id: "R-103", name: "Kardiologie Untersuchung", domain: "KLINIK", dept: "Kardiologie", kst: "92570", area: 35, status: "Occupied" },
    { id: "R-201", name: "Bettenstation West", domain: "PFLEGE", dept: "Stationen", kst: "81000", area: 120, status: "Occupied" },
    { id: "R-202", name: "Pflegestützpunkt EG", domain: "PFLEGE", dept: "Stationen", kst: "81000", area: 40, status: "Occupied" },
    { id: "R-001", name: "Zentrallager Logistik", domain: "INFRA", dept: "Logistik", kst: "90010", area: 210, status: "Vacant" },
    { id: "R-002", name: "Technikzentrale UG", domain: "INFRA", dept: "Technik", kst: "90010", area: 85, status: "Occupied" }
];

const departmentMapping = {
    "KLINIK": ["Herzchirurgie", "Kardiologie"],
    "PFLEGE": ["Stationen"],
    "INFRA": ["Logistik", "Technik"]
};

// Exact color specifications defined in Part 7.1 of the Enterprise Design Spec
const domainColors = {
    "KLINIK": "#2563EB",  // Blue
    "PFLEGE": "#16A34A",   // Green
    "INFRA": "#64748B",    // Slate
    "GHOST": "#E5E7EB"     // Unselected / Light Gray background tint
};

let activeDomain = "ALL";
let activeDept = "ALL";
let donutChartInstance = null;

// 2. Initialize Visual Graphics Configuration
document.addEventListener("DOMContentLoaded", () => {
    buildLedgerTable(hospitalMockData);
    initChart(hospitalMockData);
    
    // Set initial structural coloring after the iframe loads completely
    iframe.addEventListener("load", () => {
        applyEnterpriseColorMapping(hospitalMockData);
    });
});

function initChart(dataset) {
    const ctx = document.getElementById('akhDonutChart').getContext('2d');
    const summary = dataset.reduce((acc, current) => {
        acc[current.domain] = (acc[current.domain] || 0) + current.area;
        return acc;
    }, {});

    donutChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(summary),
            datasets: [{
                data: Object.values(summary),
                backgroundColor: [domainColors.KLINIK, domainColors.PFLEGE, domainColors.INFRA],
                hoverOffset: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'right', labels: { boxWidth: 12, font: { size: 10 } } } }
        }
    });
}

// 3. Progressive Navigation Rules & Event Logic 
function filterDomain(domainKey) {
    activeDomain = domainKey;
    activeDept = "ALL";
    
    document.querySelectorAll('.domain-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-domain="${domainKey}"]`).classList.add('active');

    const deptSection = document.getElementById('department-section');
    const pillBox = document.getElementById('department-pill-box');

    if (domainKey === "ALL") {
        deptSection.classList.add('hidden');
        executeCrossFilter(hospitalMockData);
    } else {
        deptSection.classList.remove('hidden');
        pillBox.innerHTML = `<button class="pill-btn active" onclick="filterDepartment('ALL')">Alle Abteilungen</button>`;
        
        departmentMapping[domainKey].forEach(dept => {
            pillBox.innerHTML += `<button class="pill-btn" onclick="filterDepartment('${dept}', this)">${dept}</button>`;
        });

        const filtered = hospitalMockData.filter(r => r.domain === domainKey);
        executeCrossFilter(filtered);
    }
}

function filterDepartment(deptName, element) {
    activeDept = deptName;
    if (element) {
        document.querySelectorAll('.pill-btn').forEach(btn => btn.classList.remove('active'));
        element.classList.add('active');
    }

    let filtered = hospitalMockData.filter(r => r.domain === activeDomain);
    if (deptName !== "ALL") {
        filtered = filtered.filter(r => r.dept === deptName);
    }
    executeCrossFilter(filtered);
}

// 4. Synchronization and Color Filtering Interaction State
function executeCrossFilter(filteredData) {
    buildLedgerTable(filteredData);
    updateChartData(filteredData);
    updateKPICards(filteredData);

    const statusPanel = document.getElementById('viewer-status');
    
    if (activeDomain === "ALL") {
        // Reset view to default state with full colors intact
        applyEnterpriseColorMapping(hospitalMockData);
        statusPanel.innerText = `Status: Gesamtes Krankenhaus geladen | 312 Räume sichtbar`;
    } else {
        // Enforce structural coloring and ghost out unselected elements
        applyEnterpriseColorMapping(filteredData, true);
        statusPanel.innerText = `Status: Gefiltert auf Bereich ${activeDomain} -> ${activeDept}. ${filteredData.length} Räume farblich hervorgehoben.`;
    }
}

/**
 * 5. Speckle 3D Engine Interoperability Rule Layer
 * Maps Hex Codes to specific metadata attributes cleanly via dynamic URL Query Filters
 */
function applyEnterpriseColorMapping(visibleRooms, isFilteringMode = false) {
    if (visibleRooms.length === 0) return;

    let targetQueryUrl = baseModelUrl;

    if (!isFilteringMode) {
        // Scenario A: Page Load / Reset state - color map every category group concurrently
        const colorFilters = [
            { property: "parameters.KSTCode", operator: "=", value: "95200", color: domainColors.KLINIK },
            { property: "parameters.KSTCode", operator: "=", value: "92570", color: domainColors.KLINIK },
            { property: "parameters.KSTCode", operator: "=", value: "81000", color: domainColors.PFLEGE },
            { property: "parameters.KSTCode", operator: "=", value: "90010", color: domainColors.INFRA }
        ];
        targetQueryUrl += `&filter=${JSON.stringify(colorFilters)}`;
    } else {
        // Scenario B: Active selection state - highlight target elements and force everything else to a distinct 'ghost' shadow state
        const activeKstList = [...new Set(visibleRooms.map(item => item.kst))];
        const activeColor = domainColors[activeDomain] || domainColors.KLINIK;

        // Build precise parameter query array targeting active cost centers
        const selectionFilters = activeKstList.map(kstCode => ({
            property: "parameters.KSTCode",
            operator: "=",
            value: kstCode,
            color: activeColor
        }));

        targetQueryUrl += `&filter=${JSON.stringify(selectionFilters)}&isolate=true`;
    }

    // Hot-reload the iframe with structural parameters intact to eliminate asynchronous delays
    iframe.src = targetQueryUrl;
}

function buildLedgerTable(data) {
    const tbody = document.getElementById('ledger-body');
    tbody.innerHTML = "";
    
    data.forEach(room => {
        const row = document.createElement('tr');
        row.className = "ledger-row";
        row.onclick = () => selectIndividualRoom(room.id, room.domain);
        row.innerHTML = `
            <td><strong>${room.id}</strong></td>
            <td>${room.name}</td>
            <td><span class="table-tag" style="border-left: 3px solid ${domainColors[room.domain]}">${room.kst}</span></td>
            <td>${room.area} m²</td>
        `;
        tbody.appendChild(row);
    });
}

function selectIndividualRoom(roomId, domainKey) {
    const activeColor = domainColors[domainKey];
    // Focus, pulse color, and zoom bounding box straight to single selected item
    const singleElementFilter = [{ property: "id", operator: "=", value: roomId, color: activeColor }];
    iframe.src = `${baseModelUrl}&filter=${JSON.stringify(singleElementFilter)}&isolate=true`;
    
    document.getElementById('viewer-status').innerText = `Fokus auf Einzelobjekt: RaumID ${roomId}`;
}

function updateChartData(filteredData) {
    if (!donutChartInstance) return;
    const summary = filteredData.reduce((acc, current) => {
        acc[current.name] = (acc[current.name] || 0) + current.area;
        return acc;
    }, {});

    donutChartInstance.data.labels = Object.keys(summary);
    donutChartInstance.data.datasets[0].data = Object.values(summary);
    donutChartInstance.update();
}

function updateKPICards(data) {
    const totalArea = data.reduce((sum, r) => sum + r.area, 0);
    const vacantArea = data.filter(r => r.status === "Vacant").reduce((sum, r) => sum + r.area, 0);
    
    document.getElementById('kpi-occupied').innerText = `${totalArea - vacantArea} m²`;
    document.getElementById('kpi-vacancy').innerText = `${vacantArea} m²`;

    const vacancyCard = document.getElementById('kpi-vacancy-card');
    if (vacantArea > 100) {
        vacancyCard.classList.add('alert-triggered');
    } else {
        vacancyCard.classList.remove('alert-triggered');
    }
}

function globalReset() {
    filterDomain('ALL');
}

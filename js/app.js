// ── State ──────────────────────────────────────────────────────────────────
let currentProtocol = null;
let currentEquipo = "philips"; // 'philips' | 'ge'
let errorFiles = { philips: null, ge: null };

// ── Boot ───────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  renderZonas();
  renderAllProtocols();
  setupSearch();
  setupEquipoTabs();
  setupUpload();
  setupBackBtn();
  setupModalClose();
});

// ── Search ─────────────────────────────────────────────────────────────────
function setupSearch() {
  const input = document.getElementById("searchInput");
  const codeInput = document.getElementById("codeInput");

  input.addEventListener("input", () => {
    filterProtocols();
    document.querySelectorAll(".zona-chip").forEach(c => c.classList.remove("active"));
  });
  codeInput.addEventListener("input", () => {
    filterByCode();
    document.querySelectorAll(".zona-chip").forEach(c => c.classList.remove("active"));
  });
}

function filterProtocols() {
  const q = document.getElementById("searchInput").value.toLowerCase().trim();
  if (!q) { renderAllProtocols(); return; }
  const results = PROTOCOLS.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.fullName.toLowerCase().includes(q) ||
    p.tags.some(t => t.toLowerCase().includes(q)) ||
    p.zona.toLowerCase().includes(q)
  );
  renderProtocolList(results, `Búsqueda: "${q}"`);
}

function filterByCode() {
  const q = document.getElementById("codeInput").value.toLowerCase().trim();
  if (!q) { renderAllProtocols(); return; }
  const results = PROTOCOLS.filter(p =>
    p.code.toLowerCase().replace(/\./g, "").includes(q.replace(/\./g, "")) ||
    p.id.toLowerCase().includes(q)
  );
  renderProtocolList(results, `Protocolo nº: "${q.toUpperCase()}"`);
}

// ── Zona chips ─────────────────────────────────────────────────────────────
function renderZonas() {
  const container = document.getElementById("zonaChips");
  container.innerHTML = ZONAS.map(z => `
    <button class="zona-chip" data-zona="${z.id}" onclick="filterByZona('${z.id}', this)">
      <span class="zona-icon">${z.icon}</span>${z.label}
    </button>
  `).join("");
}

function filterByZona(zona, el) {
  document.querySelectorAll(".zona-chip").forEach(c => c.classList.remove("active"));
  el.classList.add("active");
  document.getElementById("searchInput").value = "";
  document.getElementById("codeInput").value = "";
  const results = PROTOCOLS.filter(p => p.zona === zona);
  const zonaObj = ZONAS.find(z => z.id === zona);
  renderProtocolList(results, `${zonaObj.icon} ${zonaObj.label}`);
}

// ── Protocol list rendering ────────────────────────────────────────────────
function renderAllProtocols() {
  const container = document.getElementById("protocolList");
  const heading = document.getElementById("listHeading");
  heading.textContent = "Todos los protocolos";

  container.innerHTML = ZONAS.map(z => {
    const prots = PROTOCOLS.filter(p => p.zona === z.id);
    return `
      <div class="zona-group">
        <div class="zona-group-header">${z.icon} ${z.label}</div>
        <div class="protocol-grid">
          ${prots.map(p => protocolCard(p)).join("")}
        </div>
      </div>
    `;
  }).join("");
}

function renderProtocolList(list, title) {
  const container = document.getElementById("protocolList");
  const heading = document.getElementById("listHeading");
  heading.textContent = title;

  if (!list.length) {
    container.innerHTML = `<div class="empty-state">
      <div class="empty-icon">🔍</div>
      <p>No se encontraron protocolos</p>
      <button onclick="renderAllProtocols(); document.getElementById('listHeading').textContent='Todos los protocolos';" class="btn-secondary">Ver todos</button>
    </div>`;
    return;
  }
  container.innerHTML = `<div class="protocol-grid">${list.map(p => protocolCard(p)).join("")}</div>`;
}

function protocolCard(p) {
  const contrasteBadge = p.contraste
    ? `<span class="badge badge-contrast">C/C</span>`
    : `<span class="badge badge-nocontrast">S/C</span>`;
  const btBadge = p.contraste_detalle?.bt ? `<span class="badge badge-bt">BT</span>` : "";
  return `
    <div class="protocol-card" onclick="showDetail('${p.id}')">
      <div class="card-code">${p.code}</div>
      <div class="card-name">${p.name}</div>
      <div class="card-full">${p.fullName}</div>
      <div class="card-badges">${contrasteBadge}${btBadge}</div>
    </div>
  `;
}

// ── Detail view ────────────────────────────────────────────────────────────
function showDetail(id) {
  const p = PROTOCOLS.find(x => x.id === id);
  if (!p) return;
  currentProtocol = p;

  const detail = document.getElementById("detailView");
  const home = document.getElementById("homeView");
  home.classList.add("hidden");
  detail.classList.remove("hidden");
  detail.scrollTop = 0;

  document.getElementById("detailCode").textContent = p.code;
  document.getElementById("detailName").textContent = p.name;
  document.getElementById("detailFull").textContent = p.fullName;

  const contBadge = p.contraste ? `<span class="badge badge-contrast">CON CONTRASTE</span>` : `<span class="badge badge-nocontrast">SIN CONTRASTE</span>`;
  const btBadge = p.contraste_detalle?.bt ? `<span class="badge badge-bt">BOLUS TRACKING</span>` : "";
  document.getElementById("detailBadges").innerHTML = contBadge + btBadge;

  // Position diagram
  renderPositionDiagram(p);

  // Contrast summary box
  renderContrastBox(p);

  // Steps
  renderSteps(p);

  // Reconstructions
  document.getElementById("reconText").textContent = p.reconstrucciones || "No especificadas.";

  // Notes
  const notesEl = document.getElementById("notesSection");
  if (p.notas) {
    notesEl.classList.remove("hidden");
    document.getElementById("notesText").innerHTML = p.notas;
  } else {
    notesEl.classList.add("hidden");
  }
}

function renderPositionDiagram(p) {
  const container = document.getElementById("positionDiagram");
  const isHeadfirst = p.entrada === "cabeza";
  const isProne = p.posicion === "prono";
  const isVariable = p.posicion === "variable";

  let diagramHTML = "";

  if (isVariable) {
    diagramHTML = `
      <div class="position-diagram variable">
        <div class="position-label">⚠️ Posición variable según extremidad</div>
        <div class="position-subtitle">Consultar protocolo específico en PDI</div>
      </div>`;
  } else {
    // headfirst: gantry LEFT, head towards gantry
    // feetfirst: gantry RIGHT, feet towards gantry
    if (isHeadfirst) {
      // [GANTRY] [HEAD · TORSO · LEGS →]
      diagramHTML = `
        <div class="position-diagram-wrap">
          <div class="position-diagram ${isProne ? 'prone' : 'supine'}">
            <div class="gantry-label">← GANTRY</div>
            <div class="table-scene">
              <div class="gantry gantry-left"></div>
              <div class="patient-hf">
                <div class="patient-head"></div>
                <div class="patient-torso"></div>
                <div class="patient-legs"></div>
              </div>
            </div>
            <div class="position-tags">
              <span class="pos-tag">${isProne ? "DECÚBITO PRONO" : "DECÚBITO SUPINO"}</span>
              <span class="pos-tag">CABEZA PRIMERO (Headfirst)</span>
            </div>
          </div>
          ${needsBrazosArriba(p) ? '<div class="arms-note">💪 BRAZOS ARRIBA (por encima de la cabeza)</div>' : ''}
        </div>`;
    } else {
      // [← LEGS · TORSO · HEAD] [GANTRY]
      diagramHTML = `
        <div class="position-diagram-wrap">
          <div class="position-diagram ${isProne ? 'prone' : 'supine'}">
            <div class="gantry-label">GANTRY →</div>
            <div class="table-scene">
              <div class="patient-ff">
                <div class="patient-legs"></div>
                <div class="patient-torso"></div>
                <div class="patient-head"></div>
              </div>
              <div class="gantry gantry-right"></div>
            </div>
            <div class="position-tags">
              <span class="pos-tag">${isProne ? "DECÚBITO PRONO" : "DECÚBITO SUPINO"}</span>
              <span class="pos-tag">PIES PRIMERO (Feetfirst)</span>
            </div>
          </div>
          ${needsBrazosArriba(p) ? '<div class="arms-note">💪 BRAZOS ARRIBA (por encima de la cabeza)</div>' : ''}
        </div>`;
    }
  }
  container.innerHTML = diagramHTML;
}

function needsBrazosArriba(p) {
  return p.steps.some(s =>
    s.texto.toLowerCase().includes("brazos arriba") ||
    s.texto.toLowerCase().includes("brazos hacia arriba")
  );
}

function renderContrastBox(p) {
  const box = document.getElementById("contrastBox");
  if (!p.contraste || !p.contraste_detalle) {
    box.classList.add("hidden");
    return;
  }
  box.classList.remove("hidden");
  const cd = p.contraste_detalle;
  const body = box.querySelector(".section-body");
  body.innerHTML = `
    <div class="contrast-grid">
      <div class="contrast-item">
        <div class="contrast-label">Volumen</div>
        <div class="contrast-value">${cd.volumen}</div>
      </div>
      <div class="contrast-item">
        <div class="contrast-label">Velocidad</div>
        <div class="contrast-value">${cd.velocidad}</div>
      </div>
      <div class="contrast-item">
        <div class="contrast-label">Delay / Timing</div>
        <div class="contrast-value">${cd.delay}</div>
      </div>
      ${cd.roi ? `<div class="contrast-item">
        <div class="contrast-label">ROI</div>
        <div class="contrast-value">${cd.roi}</div>
      </div>` : ""}
      ${cd.umbral ? `<div class="contrast-item">
        <div class="contrast-label">Umbral BT</div>
        <div class="contrast-value">${cd.umbral}</div>
      </div>` : ""}
    </div>
  `;
}

const STEP_ICONS = {
  position: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>`,
  center: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>`,
  topo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="7" y1="8" x2="7" y2="16"/><line x1="12" y1="6" x2="12" y2="18"/><line x1="17" y1="9" x2="17" y2="15"/></svg>`,
  cut: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/><line x1="12" y1="3" x2="12" y2="21"/></svg>`,
  scan: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>`,
  contrast: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18"/></svg>`,
  roi: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.3"/><line x1="3" y1="12" x2="7" y2="12"/><line x1="17" y1="12" x2="21" y2="12"/><line x1="12" y1="3" x2="12" y2="7"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
  recon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="8" height="8" rx="1"/><rect x="14" y="2" width="8" height="8" rx="1"/><rect x="2" y="14" width="8" height="8" rx="1"/><path d="M14 18h8M18 14v8"/></svg>`,
  send: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
  info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
};

function renderSteps(p) {
  const container = document.getElementById("stepsList");
  container.innerHTML = p.steps.map((step, i) => `
    <div class="step-item">
      <div class="step-number">${i + 1}</div>
      <div class="step-icon">${STEP_ICONS[step.icono] || STEP_ICONS.info}</div>
      <div class="step-content">
        <div class="step-phase">${step.fase}</div>
        <div class="step-text">${step.texto}</div>
      </div>
    </div>
  `).join("");
}

// ── Back button ────────────────────────────────────────────────────────────
function setupBackBtn() {
  document.getElementById("backBtn").addEventListener("click", () => {
    document.getElementById("detailView").classList.add("hidden");
    document.getElementById("homeView").classList.remove("hidden");
  });
}

// ── Equipo tabs ────────────────────────────────────────────────────────────
function setupEquipoTabs() {
  document.querySelectorAll(".equipo-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".equipo-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      currentEquipo = tab.dataset.equipo;
      renderErrorSection();
    });
  });
}

// ── Upload ─────────────────────────────────────────────────────────────────
function setupUpload() {
  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("fileInput");

  dropzone.addEventListener("click", () => fileInput.click());
  dropzone.addEventListener("dragover", e => { e.preventDefault(); dropzone.classList.add("drag-over"); });
  dropzone.addEventListener("dragleave", () => dropzone.classList.remove("drag-over"));
  dropzone.addEventListener("drop", e => {
    e.preventDefault();
    dropzone.classList.remove("drag-over");
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  });
  fileInput.addEventListener("change", e => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  });

  renderErrorSection();
}

function handleFile(file) {
  errorFiles[currentEquipo] = file;
  renderErrorSection();
  // Store in localStorage for persistence
  const reader = new FileReader();
  reader.onload = e => {
    try {
      localStorage.setItem(`errorFile_${currentEquipo}_name`, file.name);
      localStorage.setItem(`errorFile_${currentEquipo}_data`, e.target.result);
    } catch (err) { /* storage full */ }
  };
  reader.readAsDataURL(file);
}

function renderErrorSection() {
  const container = document.getElementById("errorContent");
  const equipoLabel = currentEquipo === "philips" ? "Philips" : "GE";

  // Try load from localStorage
  if (!errorFiles[currentEquipo]) {
    const savedName = localStorage.getItem(`errorFile_${currentEquipo}_name`);
    if (savedName) {
      renderSavedFile(savedName, container, equipoLabel);
      return;
    }
  }

  const file = errorFiles[currentEquipo];
  if (!file) {
    container.innerHTML = `
      <div class="upload-prompt">
        <div class="upload-icon">📂</div>
        <p>Sube el documento de errores para <strong>${equipoLabel}</strong></p>
        <p class="upload-hint">PDF, Word o imagen — arrastra aquí o haz clic en "Subir"</p>
      </div>`;
    return;
  }

  container.innerHTML = `
    <div class="file-loaded">
      <div class="file-icon">📄</div>
      <div class="file-info">
        <div class="file-name">${file.name}</div>
        <div class="file-size">${(file.size / 1024).toFixed(1)} KB</div>
      </div>
      <button class="btn-view" onclick="openFile('${currentEquipo}')">Ver</button>
      <button class="btn-remove" onclick="removeFile('${currentEquipo}')">✕</button>
    </div>`;
}

function renderSavedFile(name, container, equipoLabel) {
  container.innerHTML = `
    <div class="file-loaded">
      <div class="file-icon">📄</div>
      <div class="file-info">
        <div class="file-name">${name}</div>
        <div class="file-size">Guardado localmente</div>
      </div>
      <button class="btn-view" onclick="openSavedFile('${currentEquipo}')">Ver</button>
      <button class="btn-remove" onclick="removeFile('${currentEquipo}')">✕</button>
    </div>`;
}

function openFile(equipo) {
  const file = errorFiles[equipo];
  if (!file) return;
  const url = URL.createObjectURL(file);
  window.open(url, "_blank");
}

function openSavedFile(equipo) {
  const data = localStorage.getItem(`errorFile_${equipo}_data`);
  if (!data) return;
  window.open(data, "_blank");
}

function removeFile(equipo) {
  errorFiles[equipo] = null;
  localStorage.removeItem(`errorFile_${equipo}_name`);
  localStorage.removeItem(`errorFile_${equipo}_data`);
  renderErrorSection();
}

// ── Modal close ────────────────────────────────────────────────────────────
function setupModalClose() {
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      const detail = document.getElementById("detailView");
      if (!detail.classList.contains("hidden")) {
        detail.classList.add("hidden");
        document.getElementById("homeView").classList.remove("hidden");
      }
    }
  });
}

// ── Expose globals ─────────────────────────────────────────────────────────
window.showDetail = showDetail;
window.filterByZona = filterByZona;
window.openFile = openFile;
window.openSavedFile = openSavedFile;
window.removeFile = removeFile;

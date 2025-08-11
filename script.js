// script.js (FULL — replace your existing file with this)

// ----------------- CONFIG -----------------
const API_PREFIX = "/api";
const TOAST_TIMEOUT = 3500; // ms

// ----------------- GLOBAL STORAGE -----------------
window.bloodTypes = [];
window.hospitals = [];
window.donors = [];
window.recipients = [];
window.donorTransactions = [];
window.recipientTransactions = [];

// ----------------- DOM ELEMENTS -----------------
const bodyEl = document.body;
const toastContainer = () => document.getElementById("toast-container");
const sidebarToggleBtn = () => document.getElementById("sidebar-toggle");
const themeToggleBtn = () => document.getElementById("theme-toggle");
const mainContent = () => document.querySelector(".main-content");

// ----------------- TOAST -----------------
function showToast(message, type = "info") {
  const container = toastContainer();
  if (!container) { alert(`[${type}] ${message}`); return; }
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toast.setAttribute("role", "alert");
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  const id = setTimeout(() => {
    toast.classList.remove("show");
    toast.addEventListener("transitionend", () => container.removeChild(toast), { once: true });
  }, TOAST_TIMEOUT);
  toast.addEventListener("click", () => {
    clearTimeout(id);
    toast.classList.remove("show");
    toast.addEventListener("transitionend", () => container.removeChild(toast), { once: true });
  }, { once: true });
}

// ----------------- THEME & SIDEBAR -----------------
function applyTheme(theme) {
  bodyEl.classList.remove("light-mode", "dark-mode");
  bodyEl.classList.add((theme || "light") + "-mode");
}
(function initTheme() {
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const saved = localStorage.getItem("theme");
  const initial = saved || (prefersDark ? "dark" : "light");
  applyTheme(initial);
})();
if (themeToggleBtn()) themeToggleBtn().addEventListener("click", () => {
  const current = bodyEl.classList.contains("dark-mode") ? "dark" : "light";
  const next = current === "dark" ? "light" : "dark";
  localStorage.setItem("theme", next);
  applyTheme(next);
});

function applySidebarState(collapsed) {
  bodyEl.classList.toggle("sidebar-collapsed", !!collapsed);
  const btn = sidebarToggleBtn();
  if (btn) {
    btn.title = collapsed ? "Expand Sidebar" : "Collapse Sidebar";
    btn.setAttribute("aria-expanded", String(!collapsed));
  }
}
(function initSidebar() {
  const saved = localStorage.getItem("sidebarCollapsed") === "true";
  applySidebarState(saved);
  if (sidebarToggleBtn()) sidebarToggleBtn().addEventListener("click", () => {
    const collapsed = bodyEl.classList.contains("sidebar-collapsed");
    applySidebarState(!collapsed);
    localStorage.setItem("sidebarCollapsed", String(!collapsed));
  });
})();

// ----------------- NAVIGATION (fix for your issue) -----------------
// Uses your HTML structure: <nav class="sidebar-nav"> <ul><li><a data-target="dashboard-section">...
function showSection(targetId) {
  // remove active-section from all content sections
  document.querySelectorAll(".content-section").forEach(sec => sec.classList.remove("active-section"));
  // add to target
  const target = document.getElementById(targetId);
  if (target) target.classList.add("active-section");
  // update active link
  document.querySelectorAll(".sidebar-nav a").forEach(a => {
    a.classList.toggle("active", a.getAttribute("data-target") === targetId);
  });
  // scroll top of main content
  const mc = mainContent();
  if (mc) mc.scrollTo({ top: 0, behavior: "smooth" });
}

// attach handlers
function initNavigation() {
  const navLinks = document.querySelectorAll(".sidebar-nav a");
  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("data-target");
      if (!targetId) return;
      showSection(targetId);
    });
  });
  // default show dashboard-section (or first content-section if not present)
  const initial = document.querySelector(".sidebar-nav a.active")?.getAttribute("data-target") || "dashboard-section";
  showSection(initial);
}

// ----------------- FETCH WRAPPER -----------------
async function fetchData(endpoint, opts = {}) {
  // endpoint can be "/blood-types" or "blood-types"
  const path = endpoint.startsWith("/") ? `${API_PREFIX}${endpoint}` : `${API_PREFIX}/${endpoint}`;
  try {
    const res = await fetch(path, opts);
    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try { const body = await res.json(); msg = body.message || msg; } catch {}
      throw new Error(msg);
    }
    // for DELETE some responses might be empty
    const text = await res.text();
    try { return JSON.parse(text); } catch { return text || null; }
  } catch (err) {
    console.error("Fetch error", path, err);
    showToast(`Error: ${err.message}`, "error");
    return null;
  }
}

// ----------------- RENDER HELPERS -----------------
function renderTableRows(tableId, data, columns) {
  const tbody = document.getElementById(tableId)?.querySelector("tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  if (!data || data.length === 0) {
    const colspan = columns.length;
    tbody.innerHTML = `<tr><td colspan="${colspan}" class="text-center text-muted py-4">No data available.</td></tr>`;
    return;
  }
  data.forEach(item => {
    const tr = document.createElement("tr");
    columns.forEach(col => {
      const td = document.createElement("td");
      let val;
      if (col.render) val = col.render(item);
      else val = item[col.key] ?? item[col.key.replace(/_/g, "")] ?? "N/A";
      // smart fallbacks for common naming mismatches
      if (val === undefined || val === null) {
        val = item[col.key] ?? item[col.key.toLowerCase()] ?? "N/A";
      }
      td.textContent = val;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

// small helpers to lookup names from loaded arrays
const getBloodTypeName = id => (window.bloodTypes.find(b => (b.Blood_Type_ID === id || b.Blood_Type === id))?.Name) || (id ?? "N/A");
const getHospitalName = id => (window.hospitals.find(h => (h.Hospital_ID === id || h.HospitalID === id))?.Name) || (id ?? "N/A");
const getDonorName = id => (window.donors.find(d => (d.Donor_ID === id || d.DonorID === id))?.Name) || (id ?? "N/A");
const getRecipientName = id => (window.recipients.find(r => (r.Recipient_ID === id || r.RecipientID === id))?.Name) || (id ?? "N/A");

// ----------------- DATA LOADERS -----------------
async function loadBloodTypes() {
  const data = await fetchData("/blood-types");
  if (data) {
    window.bloodTypes = Array.isArray(data) ? data : [];
    renderTableRows("blood-type-table", window.bloodTypes, [
      { key: "Blood_Type_ID" }, { key: "Name" }
    ]);
    updateDashboardStats();
  }
}

async function loadHospitals() {
  const data = await fetchData("/hospitals");
  if (data) {
    window.hospitals = Array.isArray(data) ? data : [];
    renderTableRows("hospital-table", window.hospitals, [
      { key: "Hospital_ID" }, { key: "Name" }, { key: "Address" }, { key: "Contact" }
    ]);
    updateDashboardStats();
  }
}

async function loadDonors() {
  const data = await fetchData("/donors");
  if (data) {
    window.donors = Array.isArray(data) ? data : [];
    renderTableRows("donor-table", window.donors, [
      { key: "Donor_ID" }, { key: "Name" }, { key: "Contact" }, { key: "Age" },
      { key: "Blood_Type", render: it => it.Blood_Type || it.Blood_Type_ID || getBloodTypeName(it.Blood_Type_ID) },
      { key: "Card_ID", render: it => it.Card_ID ?? it.Donor_Card_ID ?? "" }
    ]);
    updateDashboardStats();
  }
}

async function loadRecipients() {
  const data = await fetchData("/recipients");
  if (data) {
    window.recipients = Array.isArray(data) ? data : [];
    renderTableRows("recipient-table", window.recipients, [
      { key: "Recipient_ID" }, { key: "Name" }, { key: "Contact" }, { key: "Age" },
      { key: "Blood_Type", render: it => it.Blood_Type || it.Blood_Type_ID || getBloodTypeName(it.Blood_Type_ID) },
      { key: "Card_ID", render: it => it.Card_ID ?? it.Donor_Card_ID ?? "" }
    ]);
    updateDashboardStats();
  }
}

async function loadDonorTransactions() {
  const data = await fetchData("/donor-transactions");
  if (data) {
    window.donorTransactions = Array.isArray(data) ? data : [];
    renderTableRows("donor-trans-table", window.donorTransactions, [
      { key: "Transaction_ID" },
      { key: "Donor_ID", render: it => getDonorName(it.Donor_ID) },
      { key: "Hospital_ID", render: it => getHospitalName(it.Hospital_ID) },
      { key: "Date" }, { key: "Confirmation_Code" }, { key: "Health_Status" }
    ]);
  }
}

async function loadRecipientTransactions() {
  const data = await fetchData("/recipient-transactions");
  if (data) {
    window.recipientTransactions = Array.isArray(data) ? data : [];
    renderTableRows("recipient-trans-table", window.recipientTransactions, [
      { key: "Transaction_ID" },
      { key: "Recipient_ID", render: it => getRecipientName(it.Recipient_ID) },
      { key: "Hospital_ID", render: it => getHospitalName(it.Hospital_ID) },
      { key: "Date" }, { key: "Blood_Type" }
    ]);
  }
}

// ----------------- DASHBOARD STATS -----------------
function updateDashboardStats() {
  const setText = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = String(v); };
  setText("total-donors", window.donors.length);
  setText("total-recipients", window.recipients.length);
  setText("total-hospitals", window.hospitals.length);
  setText("total-blood-types", window.bloodTypes.length);
}

// ----------------- SIMPLE FORM SUBMISSION -----------------
// Maps form id to API endpoint and reload function
const FORM_MAP = {
  "blood-type-form": { endpoint: "/blood-types", reload: loadBloodTypes },
  "hospital-form": { endpoint: "/hospitals", reload: loadHospitals },
  "donor-form": { endpoint: "/donors", reload: loadDonors },
  "recipient-form": { endpoint: "/recipients", reload: loadRecipients },
  "donor-trans-form": { endpoint: "/donor-transactions", reload: loadDonorTransactions },
  "recipient-trans-form": { endpoint: "/recipient-transactions", reload: loadRecipientTransactions }
};

document.addEventListener("submit", async (e) => {
  const form = e.target;
  if (!form || !FORM_MAP[form.id]) return; // not our managed form
  e.preventDefault();

  const map = FORM_MAP[form.id];
  const fd = new FormData(form);
  const payload = {};
  fd.forEach((v, k) => { payload[k] = v; });

  // perform POST
  const res = await fetchData(map.endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (res !== null) {
    showToast("Saved successfully", "success");
    form.reset();
    // reload data
    try { await map.reload(); } catch (err) { console.error(err); }
  } else {
    showToast("Save failed", "error");
  }
});

// ----------------- INIT APP -----------------
async function initializeApp() {
  try {
    initNavigation();
    // load data concurrently
    await Promise.all([
      loadBloodTypes(),
      loadHospitals(),
      loadDonors(),
      loadRecipients(),
      loadDonorTransactions(),
      loadRecipientTransactions()
    ]);
  } catch (err) {
    console.error("Initialization error", err);
    showToast("Error initializing app (see console)", "error");
  }
}

// Start
document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
});

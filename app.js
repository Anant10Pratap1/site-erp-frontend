/* ==========================================================================
   SITE ERP — Material Management Module
   Plain HTML/CSS/JS. No build step, no dependencies except store.js.
   Deploy as-is to Render (Static Site) or any static host.
   ========================================================================== */

// ---------------------------------------------------------------------------
// 1. CONFIG
// ---------------------------------------------------------------------------
const DEFAULT_COMPANY_NAME = "Your Company Pvt. Ltd.";

function renderCompanyName() {
  document.getElementById("companyName").textContent = Store.getSetting("companyName", DEFAULT_COMPANY_NAME);
}
renderCompanyName();

document.getElementById("companyName").onclick = () => {
  openModal(
    "Edit Company Name",
    [{ key: "name", label: "Company Name", type: "text", required: true }],
    { name: Store.getSetting("companyName", DEFAULT_COMPANY_NAME) },
    (values) => {
      Store.setSetting("companyName", values.name);
      renderCompanyName();
    }
  );
};

// Live AI backend (Render) — confirmed up via health check.
const AI_BACKEND_URL = "https://site-erp-ai-backend-1.onrender.com";

// ---------------------------------------------------------------------------
// 2. LEFT SIDEBAR
// ---------------------------------------------------------------------------
const SIDEBAR_ITEMS = [
  { id: "dashboard",   label: "Dashboard" },
  { id: "reports",     label: "Reports" },
  { id: "projects",    label: "Projects" },
  { id: "team",        label: "Team" },
  { id: "schedule",    label: "Schedule" },
  { id: "finance",     label: "Finance" },
  { id: "payroll",     label: "Payroll" },
  { id: "crm",         label: "CRM" },
  { id: "procurement", label: "Procurement" },
  { id: "warehouse",   label: "Warehouse" },
  { id: "equipment",   label: "Equipment" },
  { id: "assets",      label: "Assets" },
  {
    id: "library",
    label: "Library",
    group: true,
    children: [
      { id: "lib-asset-type",         label: "Asset Type Library" },
      { id: "lib-cost-code",          label: "Cost Code Library" },
      { id: "lib-deduction",          label: "Deduction Library" },
      { id: "lib-equipment",          label: "Equipment Library" },
      { id: "lib-inspection-form",    label: "Inspection Form" },
      { id: "lib-material",           label: "Material Library" },
      { id: "lib-progress",           label: "Progress Library" },
      { id: "lib-rate",               label: "Rate Library" },
      { id: "lib-material-category",  label: "Material Category Library (Master)" },
      { id: "lib-subcontractor-rate", label: "Subcontractor Rate Library" },
      { id: "lib-retention",          label: "Retention Library" },
      { id: "lib-todo",               label: "To-do Library" },
      { id: "lib-workforce",          label: "Workforce Library" },
    ],
  },
  { id: "settings",    label: "Settings" },
  { id: "services",    label: "Services" },
  { id: "help",        label: "Help" },
  { id: "delete-logs", label: "Delete Logs" },
];

const PROJECT_TABS = [
  { id: "p-dashboard",    label: "Dashboard" },
  { id: "p-design",       label: "Design" },
  { id: "p-boq",          label: "BOQ" },
  { id: "p-party",        label: "Party" },
  { id: "p-transactions", label: "Transactions" },
  { id: "p-todo",         label: "To-do" },
  { id: "p-task",         label: "Task" },
  { id: "p-attendance",   label: "Attendance" },
  { id: "p-material",     label: "Material" },
  { id: "p-subcon",       label: "Subcon" },
  { id: "p-equipment",    label: "Equipment" },
  { id: "p-file",         label: "File" },
  { id: "p-mom",          label: "MOM" },
  { id: "p-inspection",   label: "Inspection" },
];

// ---------------------------------------------------------------------------
// 3. LIBRARY CONFIG — each entry defines its own table columns + form fields.
//    "dynamicSource" means the select's options are pulled live from another
//    library collection (e.g. Material Library's "category" pulls from
//    Material Category Library).
// ---------------------------------------------------------------------------
const LIBRARY_CONFIG = {
  "lib-asset-type": {
    title: "Asset Type Library",
    collection: "assetTypes",
    fields: [
      { key: "name", label: "Asset Type Name", type: "text", required: true },
      { key: "description", label: "Description", type: "text" },
    ],
  },
  "lib-cost-code": {
    title: "Cost Code Library",
    collection: "costCodes",
    fields: [
      { key: "code", label: "Cost Code", type: "text", required: true },
      { key: "description", label: "Description", type: "text" },
    ],
  },
  "lib-deduction": {
    title: "Deduction Library",
    collection: "deductions",
    fields: [
      { key: "name", label: "Deduction Name", type: "text", required: true },
      { key: "kind", label: "Type", type: "select", options: ["Percentage", "Flat Amount"] },
      { key: "value", label: "Value", type: "number" },
    ],
  },
  "lib-equipment": {
    title: "Equipment Library",
    collection: "equipmentLib",
    fields: [
      { key: "name", label: "Equipment Name", type: "text", required: true },
      { key: "category", label: "Category", type: "text" },
      { key: "code", label: "Equipment Code", type: "text" },
    ],
  },
  "lib-inspection-form": {
    title: "Inspection Form",
    collection: "inspectionForms",
    fields: [
      { key: "name", label: "Form Name", type: "text", required: true },
      { key: "checklist", label: "Checklist Items (one per line)", type: "textarea" },
    ],
  },
  "lib-material": {
    title: "Material Library",
    collection: "materials",
    fields: [
      { key: "name", label: "Material Name", type: "text", required: true },
      { key: "unit", label: "Unit (bag/kg/cu.m/nos...)", type: "text", required: true },
      { key: "category", label: "Category", type: "select", dynamicSource: "materialCategories", optionField: "name" },
    ],
  },
  "lib-progress": {
    title: "Progress Library",
    collection: "progressItems",
    fields: [
      { key: "activity", label: "Activity Name", type: "text", required: true },
      { key: "unit", label: "Unit", type: "text" },
    ],
  },
  "lib-rate": {
    title: "Rate Library",
    collection: "rates",
    fields: [
      { key: "item", label: "Item", type: "text", required: true },
      { key: "unit", label: "Unit", type: "text" },
      { key: "rate", label: "Rate (INR)", type: "number" },
    ],
  },
  "lib-material-category": {
    title: "Material Category Library (Master)",
    collection: "materialCategories",
    fields: [
      { key: "name", label: "Category Name", type: "text", required: true },
    ],
  },
  "lib-subcontractor-rate": {
    title: "Subcontractor Rate Library",
    collection: "subcontractorRates",
    fields: [
      { key: "subcontractor", label: "Subcontractor Name", type: "text", required: true },
      { key: "workType", label: "Work Type", type: "text" },
      { key: "rate", label: "Rate (INR)", type: "number" },
    ],
  },
  "lib-retention": {
    title: "Retention Library",
    collection: "retentions",
    fields: [
      { key: "name", label: "Retention Name", type: "text", required: true },
      { key: "percentage", label: "Percentage (%)", type: "number" },
    ],
  },
  "lib-todo": {
    title: "To-do Library",
    collection: "todoTemplates",
    fields: [
      { key: "task", label: "Task Template", type: "text", required: true },
    ],
  },
  "lib-workforce": {
    title: "Workforce Library",
    collection: "workforceLib",
    fields: [
      { key: "designation", label: "Designation / Role", type: "text", required: true },
      { key: "dailyRate", label: "Daily Rate (INR)", type: "number" },
    ],
  },
};

// ---------------------------------------------------------------------------
// 3b. MODULE CONFIG — Payroll / Procurement / Finance sub-pages.
//     Same shape as LIBRARY_CONFIG (title/collection/fields), reused through
//     the same generic CRUD renderer so this doesn't duplicate code.
// ---------------------------------------------------------------------------
const MODULE_CONFIG = {
  "office-staff": {
    title: "Office Staff (Master List)",
    collection: "officeStaff",
    fields: [
      { key: "name", label: "Staff Name", type: "text", required: true },
      { key: "designation", label: "Designation", type: "text" },
      { key: "monthlySalary", label: "Monthly Salary (INR)", type: "number" },
    ],
  },
  "office-attendance": {
    title: "Office Staff Attendance",
    collection: "officeAttendance",
    fields: [
      { key: "date", label: "Date", type: "date", required: true },
      { key: "staffName", label: "Staff", type: "select", dynamicSource: "officeStaff", optionField: "name", required: true },
      { key: "status", label: "Status", type: "select", options: ["Present", "Absent", "Half Day", "Leave"] },
      { key: "remarks", label: "Remarks", type: "text" },
    ],
  },
  "office-salary": {
    title: "Office Staff Salary",
    collection: "officeSalary",
    fields: [
      { key: "month", label: "Month (e.g. 2026-09)", type: "text", required: true },
      { key: "staffName", label: "Staff", type: "select", dynamicSource: "officeStaff", optionField: "name", required: true },
      { key: "basicPay", label: "Basic Pay (INR)", type: "number" },
      { key: "deductions", label: "Deductions (INR)", type: "number" },
      { key: "netPay", label: "Net Pay (INR)", type: "number" },
      { key: "status", label: "Status", type: "select", options: ["Paid", "Pending"] },
    ],
  },
  "subcon-attendance": {
    title: "Subcontractor Attendance",
    collection: "subconAttendance",
    fields: [
      { key: "date", label: "Date", type: "date", required: true },
      { key: "subcontractorName", label: "Subcontractor", type: "select", dynamicSource: "subcontractorRates", optionField: "subcontractor", required: true },
      { key: "status", label: "Status", type: "select", options: ["Present", "Absent", "Half Day"] },
      { key: "workDescription", label: "Work Description", type: "text" },
    ],
  },
  "subcon-salary": {
    title: "Subcontractor Salary / Payments",
    collection: "subconSalary",
    fields: [
      { key: "date", label: "Date", type: "date", required: true },
      { key: "subcontractorName", label: "Subcontractor", type: "select", dynamicSource: "subcontractorRates", optionField: "subcontractor", required: true },
      { key: "amount", label: "Amount (INR)", type: "number" },
      { key: "description", label: "Description", type: "text" },
      { key: "status", label: "Status", type: "select", options: ["Paid", "Pending"] },
    ],
  },
  "rfq": {
    title: "RFQ — Request for Quotation",
    collection: "rfqs",
    fields: [
      { key: "date", label: "Date", type: "date", required: true },
      { key: "materialName", label: "Material", type: "select", dynamicSource: "materials", optionField: "name", required: true },
      { key: "quantity", label: "Quantity Needed", type: "number", required: true },
      { key: "vendorName", label: "Vendor Name", type: "text", required: true },
      { key: "quotedPrice", label: "Quoted Price (INR) — leave blank until vendor responds", type: "number" },
      { key: "status", label: "Status", type: "select", options: ["Sent", "Quoted", "Approved", "Rejected"] },
      { key: "remarks", label: "Remarks", type: "text" },
    ],
  },
  "vendor-rate": {
    title: "Vendor Rate",
    collection: "vendorRates",
    fields: [
      { key: "vendorName", label: "Vendor Name", type: "text", required: true },
      { key: "materialName", label: "Material", type: "select", dynamicSource: "materials", optionField: "name" },
      { key: "rate", label: "Rate (INR)", type: "number" },
      { key: "unit", label: "Unit", type: "text" },
      { key: "validFrom", label: "Valid From", type: "date" },
    ],
  },
  "finance-transactions": {
    title: "Finance — Party Transactions",
    collection: "financeTransactions",
    fields: [
      { key: "date", label: "Date", type: "date", required: true },
      { key: "fromParty", label: "From (Party A)", type: "text", required: true },
      { key: "toParty", label: "To (Party B)", type: "text", required: true },
      { key: "amount", label: "Amount (INR)", type: "number", required: true },
      { key: "purpose", label: "Purpose / Description", type: "text" },
      { key: "mode", label: "Mode", type: "select", options: ["Cash", "Bank Transfer", "UPI", "Cheque"] },
      { key: "status", label: "Status", type: "select", options: ["Completed", "Pending"] },
    ],
  },
};

const PAYROLL_SUBTABS = [
  { id: "office-staff",       label: "Office Staff" },
  { id: "office-attendance",  label: "Office Attendance" },
  { id: "office-salary",      label: "Office Salary" },
  { id: "subcon-attendance",  label: "Subcontractor Attendance" },
  { id: "subcon-salary",      label: "Subcontractor Salary" },
];

const PROCUREMENT_SUBTABS = [
  { id: "rfq",          label: "RFQ" },
  { id: "vendor-rate",  label: "Vendor Rate" },
];

const PROJECT_FIELDS = [
  { key: "name", label: "Project Name", type: "text", required: true },
  { key: "location", label: "Location", type: "text" },
  { key: "client", label: "Client Name", type: "text" },
  { key: "status", label: "Status", type: "select", options: ["Active", "On Hold", "Completed"] },
  { key: "startDate", label: "Start Date", type: "date" },
  { key: "progress", label: "Progress (%)", type: "number" },
];

const MATERIAL_ENTRY_FIELDS = [
  { key: "date", label: "Date", type: "date", required: true },
  { key: "materialName", label: "Material", type: "select", dynamicSource: "materials", optionField: "name", required: true },
  { key: "direction", label: "Transaction", type: "select", options: ["In (Received)", "Out (Used)"] },
  { key: "quantity", label: "Quantity", type: "number", required: true },
  { key: "site", label: "Store / Site", type: "text" },
  { key: "remarks", label: "Remarks", type: "text" },
];

// ---------------------------------------------------------------------------
// 3c. PARTY + TRANSACTIONS CONFIG
// ---------------------------------------------------------------------------
const PARTY_FIELDS = [
  { key: "name", label: "Party Name", type: "text", required: true },
  { key: "type", label: "Type", type: "select", options: ["Client", "Vendor", "Subcontractor", "Other"] },
  { key: "balance", label: "Balance (INR)", type: "number" },
  { key: "status", label: "Status", type: "select", options: ["Active", "Inactive"] },
];

const TRANSACTION_GROUPS = [
  {
    group: "Payment",
    items: [
      { id: "payment-in", label: "Payment In" },
      { id: "payment-out", label: "Payment Out" },
      { id: "debit-note", label: "Debit Note" },
      { id: "credit-note", label: "Credit Note" },
      { id: "party-to-party", label: "Party to Party Payment" },
    ],
  },
  {
    group: "Sales",
    items: [
      { id: "sales-invoice", label: "Sales Invoice" },
      { id: "material-sales", label: "Material Sales" },
    ],
  },
  {
    group: "Expense",
    items: [
      { id: "material-purchase", label: "Material Purchase" },
      { id: "material-return", label: "Material Return" },
      { id: "material-transfer", label: "Material Transfer" },
      { id: "subcon-bill", label: "Subcon Bill" },
      { id: "other-expenses", label: "Other Expenses" },
      { id: "equipment-expense", label: "Equipment Expense" },
    ],
  },
];

function findTxnTypeLabel(id) {
  for (const g of TRANSACTION_GROUPS) {
    const item = g.items.find((i) => i.id === id);
    if (item) return item.label;
  }
  return id;
}

function transactionFields(project) {
  return [
    { key: "date", label: "Date", type: "date", required: true },
    { key: "partyName", label: "Party Name", type: "select", dynamicSource: partiesCollectionName(project), optionField: "name", required: true },
    { key: "amount", label: "Amount (INR)", type: "number", required: true },
    { key: "paymentMethod", label: "Payment Method", type: "select", options: ["Cash", "Bank", "Cheque"] },
    { key: "costCode", label: "Cost Code", type: "select", dynamicSource: "costCodes", optionField: "code" },
    { key: "remarks", label: "Remarks", type: "text" },
  ];
}

// ---------------------------------------------------------------------------
// 4. APP STATE
// ---------------------------------------------------------------------------
const state = {
  activeSidebar: "dashboard",
  libraryOpen: false,
  activeProject: null,
  activeProjectTab: "p-dashboard",
  activePayrollTab: "office-staff",
  activeProcurementTab: "rfq",
  activeTxnType: "payment-in",
  txnPanelOpen: true,
  txnSearch: "",
};

// ---------------------------------------------------------------------------
// 5. GENERIC MODAL FORM
// ---------------------------------------------------------------------------
function openModal(title, fields, initialValues, onSave) {
  closeModal();
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.id = "modalOverlay";

  const fieldHtml = fields.map((f) => {
    const val = initialValues[f.key] ?? "";
    if (f.type === "select") {
      const options = f.dynamicSource
        ? Store.getCollection(f.dynamicSource, []).map((r) => r[f.optionField])
        : f.options;
      const opts = options.map((o) => `<option value="${o}" ${o === val ? "selected" : ""}>${o}</option>`).join("");
      return `
        <label class="form-label">${f.label}${f.required ? " *" : ""}</label>
        <select class="form-input" data-key="${f.key}"><option value="">-- select --</option>${opts}</select>
      `;
    }
    if (f.type === "textarea") {
      return `
        <label class="form-label">${f.label}${f.required ? " *" : ""}</label>
        <textarea class="form-input" rows="4" data-key="${f.key}">${val}</textarea>
      `;
    }
    return `
      <label class="form-label">${f.label}${f.required ? " *" : ""}</label>
      <input class="form-input" type="${f.type}" data-key="${f.key}" value="${val}" />
    `;
  }).join("");

  overlay.innerHTML = `
    <div class="modal-box">
      <div class="modal-header">
        <span>${title}</span>
        <span class="modal-close" id="modalCloseBtn">&times;</span>
      </div>
      <div class="modal-body">${fieldHtml}</div>
      <div class="modal-footer">
        <button class="btn-ghost" id="modalCancelBtn">Cancel</button>
        <button class="btn-primary" id="modalSaveBtn">Save</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // pre-select values for <select> elements after insertion (setting `selected` above
  // covers dynamic + static options, this is a fallback for exact value matching)
  fields.forEach((f) => {
    if (f.type === "select") {
      const sel = overlay.querySelector(`[data-key="${f.key}"]`);
      if (sel && initialValues[f.key]) sel.value = initialValues[f.key];
    }
  });

  document.getElementById("modalCloseBtn").onclick = closeModal;
  document.getElementById("modalCancelBtn").onclick = closeModal;
  document.getElementById("modalSaveBtn").onclick = () => {
    const values = {};
    let missingRequired = false;
    fields.forEach((f) => {
      const el = overlay.querySelector(`[data-key="${f.key}"]`);
      values[f.key] = el ? el.value : "";
      if (f.required && !values[f.key]) missingRequired = true;
    });
    if (missingRequired) {
      alert("Please fill all required fields (marked *).");
      return;
    }
    onSave(values);
    closeModal();
  };
}

function closeModal() {
  const existing = document.getElementById("modalOverlay");
  if (existing) existing.remove();
}

// ---------------------------------------------------------------------------
// 6. RENDER: SIDEBAR
// ---------------------------------------------------------------------------
function renderSidebar() {
  const el = document.getElementById("sidebar");
  el.innerHTML = "";

  SIDEBAR_ITEMS.forEach((item) => {
    if (item.group) {
      const wrap = document.createElement("div");
      const toggle = document.createElement("div");
      toggle.className = "nav-item nav-group-toggle" +
        (state.activeSidebar.startsWith("lib-") ? " active" : "");
      toggle.innerHTML = `
        <span><span class="nav-icon">&#9776;</span>${item.label}</span>
        <span class="nav-caret ${state.libraryOpen ? "open" : ""}">&#9656;</span>
      `;
      toggle.onclick = () => {
        state.libraryOpen = !state.libraryOpen;
        renderSidebar();
      };
      wrap.appendChild(toggle);

      const sublist = document.createElement("div");
      sublist.className = "nav-sublist" + (state.libraryOpen ? " open" : "");
      item.children.forEach((child) => {
        const sub = document.createElement("div");
        sub.className = "nav-subitem" + (state.activeSidebar === child.id ? " active" : "");
        sub.textContent = child.label;
        sub.onclick = () => {
          state.activeSidebar = child.id;
          state.activeProject = null;
          renderAll();
        };
        sublist.appendChild(sub);
      });
      wrap.appendChild(sublist);
      el.appendChild(wrap);
    } else {
      const nav = document.createElement("div");
      nav.className = "nav-item" + (state.activeSidebar === item.id ? " active" : "");
      nav.innerHTML = `<span class="nav-icon">&#9632;</span>${item.label}`;
      nav.onclick = () => {
        state.activeSidebar = item.id;
        state.activeProject = null;
        renderAll();
      };
      el.appendChild(nav);
    }
  });
}

// ---------------------------------------------------------------------------
// 7. RENDER: MAIN CONTENT ROUTER
// ---------------------------------------------------------------------------
function renderMain() {
  const el = document.getElementById("mainContent");

  if (state.activeProject) {
    el.innerHTML = renderProjectDetail(state.activeProject);
    attachProjectTabEvents();
    return;
  }
  if (state.activeSidebar === "projects") {
    el.innerHTML = renderProjectList();
    attachProjectListEvents();
    return;
  }
  if (state.activeSidebar === "dashboard") {
    el.innerHTML = renderDashboard();
    return;
  }
  if (state.activeSidebar === "delete-logs") {
    el.innerHTML = renderDeleteLogs();
    attachDeleteLogEvents();
    return;
  }
  if (state.activeSidebar === "settings") {
    el.innerHTML = renderSettings();
    attachSettingsEvents();
    return;
  }
  if (LIBRARY_CONFIG[state.activeSidebar]) {
    el.innerHTML = renderCrudPage(LIBRARY_CONFIG[state.activeSidebar]);
    attachCrudEvents(LIBRARY_CONFIG[state.activeSidebar], renderMain);
    return;
  }
  if (state.activeSidebar === "payroll") {
    el.innerHTML = renderTabbedModule("Payroll", PAYROLL_SUBTABS, state.activePayrollTab);
    attachTabbedModuleEvents(PAYROLL_SUBTABS, "activePayrollTab");
    return;
  }
  if (state.activeSidebar === "procurement") {
    el.innerHTML = renderTabbedModule("Procurement", PROCUREMENT_SUBTABS, state.activeProcurementTab);
    attachTabbedModuleEvents(PROCUREMENT_SUBTABS, "activeProcurementTab");
    return;
  }
  if (state.activeSidebar === "finance") {
    el.innerHTML = renderCrudPage(MODULE_CONFIG["finance-transactions"]);
    attachCrudEvents(MODULE_CONFIG["finance-transactions"], renderMain);
    return;
  }
  if (state.activeSidebar === "warehouse") {
    el.innerHTML = renderWarehouse();
    return;
  }

  el.innerHTML = renderPlaceholder(findSidebarLabel(state.activeSidebar), "This section is scaffolded and ready — tell me what data/fields it needs and I'll wire it up next.");
}

// ---------------------------------------------------------------------------
// 7b. TABBED MODULE WRAPPER — used by Payroll and Procurement, each of which
//     has several sub-pages sharing the generic CRUD renderer below.
// ---------------------------------------------------------------------------
function renderTabbedModule(title, subtabs, activeId) {
  const tabs = subtabs.map((t) => `
    <div class="tab-item ${activeId === t.id ? "active" : ""}" data-id="${t.id}">${t.label}</div>
  `).join("");
  const cfg = MODULE_CONFIG[activeId];
  return `
    <h1 class="page-title">${title}</h1>
    <div class="tab-bar">${tabs}</div>
    <div id="tabbedModuleContent">${renderCrudPage(cfg)}</div>
  `;
}

function attachTabbedModuleEvents(subtabs, stateKey) {
  attachCrudEvents(MODULE_CONFIG[state[stateKey]], () => {
    document.getElementById("tabbedModuleContent").innerHTML = renderCrudPage(MODULE_CONFIG[state[stateKey]]);
    attachTabbedModuleEvents(subtabs, stateKey);
  });
  document.querySelectorAll(".tab-item").forEach((tab) => {
    tab.onclick = () => {
      state[stateKey] = tab.dataset.id;
      renderMain();
    };
  });
}

// ---------------------------------------------------------------------------
// 7c. WAREHOUSE — read-only rollup of Material / Equipment / Asset Type
//     libraries. Additions still happen from their respective Library pages,
//     so there's exactly one place each kind of item gets added.
// ---------------------------------------------------------------------------
function renderWarehouse() {
  const materials = Store.getCollection("materials", []).map((r) => ({ type: "Material", name: r.name, detail: `Unit: ${r.unit || "—"}, Category: ${r.category || "—"}` }));
  const equipment = Store.getCollection("equipmentLib", []).map((r) => ({ type: "Equipment", name: r.name, detail: `Category: ${r.category || "—"}, Code: ${r.code || "—"}` }));
  const assets = Store.getCollection("assetTypes", []).map((r) => ({ type: "Asset Type", name: r.name, detail: r.description || "—" }));

  const all = [...materials, ...equipment, ...assets];
  const rows = all.map((r) => `
    <tr><td><span class="status-badge">${r.type}</span></td><td>${r.name}</td><td>${r.detail}</td></tr>
  `).join("") || `<tr><td colspan="3" style="text-align:center;color:var(--text-muted);">Nothing added yet — add entries in Library &rarr; Material / Equipment / Asset Type Library.</td></tr>`;

  return `
    <h1 class="page-title">Warehouse</h1>
    <p class="page-subtitle">Consolidated view of every material, tool/equipment and asset registered in the system. Add or edit them from their Library pages — this page just shows everything together.</p>
    <table class="data-table">
      <thead><tr><th style="width:140px;">Type</th><th>Name</th><th>Details</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function findSidebarLabel(id) {
  for (const item of SIDEBAR_ITEMS) {
    if (item.id === id) return item.label;
    if (item.children) {
      const c = item.children.find((c) => c.id === id);
      if (c) return c.label;
    }
  }
  return id;
}

// ---------------------------------------------------------------------------
// 8. DASHBOARD (live counts from Store)
// ---------------------------------------------------------------------------
function renderDashboard() {
  const projects = Store.getCollection("projects", []);
  const materials = Store.getCollection("materials", []);
  const activeCount = projects.filter((p) => p.status === "Active").length;

  return `
    <h1 class="page-title">Dashboard</h1>
    <p class="page-subtitle">Company-wide overview across all projects.</p>
    <div class="kpi-row">
      <div class="kpi-card"><div class="kpi-label">Total Projects</div><div class="kpi-value">${projects.length}</div></div>
      <div class="kpi-card"><div class="kpi-label">Active Projects</div><div class="kpi-value">${activeCount}</div></div>
      <div class="kpi-card"><div class="kpi-label">Materials in Library</div><div class="kpi-value">${materials.length}</div></div>
      <div class="kpi-card"><div class="kpi-label">Deleted Items Logged</div><div class="kpi-value">${Store.getCollection("deletedLogs", []).length}</div></div>
    </div>
    <div class="placeholder-card">
      <strong>Company-wide charts &amp; recent activity feed</strong>
      Add Projects and Material Library entries from the sidebar, then open a project → Material tab to log real transactions here.
    </div>
  `;
}

function renderPlaceholder(title, note) {
  return `
    <h1 class="page-title">${title}</h1>
    <div class="placeholder-card"><strong>${title}</strong>${note}</div>
  `;
}

// ---------------------------------------------------------------------------
// 9. PROJECTS (list + CRUD)
// ---------------------------------------------------------------------------
function renderProjectList() {
  const projects = Store.getCollection("projects", []);
  const cards = projects.map((p) => `
    <div class="project-card" data-id="${p.id}">
      <div class="project-card-title">${p.name}</div>
      <div class="project-card-meta">${p.location || "—"} &middot; Progress: ${p.progress || 0}%</div>
      <span class="status-badge">${p.status || "Active"}</span>
      <div class="card-actions">
        <span class="link-action" data-action="edit" data-id="${p.id}">Edit</span>
        <span class="link-action danger" data-action="delete" data-id="${p.id}">Delete</span>
      </div>
    </div>
  `).join("") || `<div class="placeholder-card">No projects yet — click "+ New Project" to add one.</div>`;

  return `
    <div class="page-header-row">
      <div>
        <h1 class="page-title">Projects</h1>
        <p class="page-subtitle">Select a project to open its dashboard, BOQ, material log and more.</p>
      </div>
      <button class="btn-primary" id="newProjectBtn">+ New Project</button>
    </div>
    <div class="project-grid">${cards}</div>
  `;
}

function attachProjectListEvents() {
  document.getElementById("newProjectBtn").onclick = () => {
    openModal("New Project", PROJECT_FIELDS, {}, (values) => {
      Store.addItem("projects", values, []);
      renderAll();
    });
  };

  document.querySelectorAll(".project-card").forEach((card) => {
    card.onclick = (e) => {
      if (e.target.closest(".link-action")) return; // handled separately below
      const proj = Store.getCollection("projects", []).find((p) => p.id === card.dataset.id);
      state.activeProject = proj;
      state.activeProjectTab = "p-dashboard";
      renderAll();
    };
  });

  document.querySelectorAll('.link-action[data-action="edit"]').forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const proj = Store.getCollection("projects", []).find((p) => p.id === btn.dataset.id);
      openModal("Edit Project", PROJECT_FIELDS, proj, (values) => {
        Store.updateItem("projects", proj.id, values, []);
        renderAll();
      });
    };
  });

  document.querySelectorAll('.link-action[data-action="delete"]').forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      if (confirm("Move this project to Delete Logs?")) {
        Store.removeItem("projects", btn.dataset.id, []);
        renderAll();
      }
    };
  });
}

// ---------------------------------------------------------------------------
// 10. GENERIC CRUD PAGE — used by Library sub-items, Payroll/Procurement
//     sub-tabs, and Finance. Takes a config object directly (title/collection
//     /fields) rather than looking one up, so any of those call sites can
//     reuse it identically.
// ---------------------------------------------------------------------------
function renderCrudPage(cfg) {
  const rows = Store.getCollection(cfg.collection, []);

  const headCols = cfg.fields.map((f) => `<th>${f.label}</th>`).join("");
  const bodyRows = rows.map((r) => {
    const cells = cfg.fields.map((f) => `<td>${(r[f.key] ?? "").toString().replace(/\n/g, "<br/>")}</td>`).join("");
    return `
      <tr>
        ${cells}
        <td>
          <span class="link-action" data-action="edit" data-id="${r.id}">Edit</span>
          &nbsp;|&nbsp;
          <span class="link-action danger" data-action="delete" data-id="${r.id}">Delete</span>
        </td>
      </tr>
    `;
  }).join("") || `<tr><td colspan="${cfg.fields.length + 1}" style="text-align:center;color:var(--text-muted);">No entries yet.</td></tr>`;

  return `
    <div class="page-header-row">
      <div>
        <h1 class="page-title">${cfg.title}</h1>
        <p class="page-subtitle">${cfg.subtitle || "Master data used across all projects."}</p>
      </div>
      <button class="btn-primary" id="crudAddBtn">+ Add Entry</button>
    </div>
    <table class="data-table">
      <thead><tr>${headCols}<th style="width:140px;">Actions</th></tr></thead>
      <tbody>${bodyRows}</tbody>
    </table>
  `;
}

// onDone is called after any add/edit/delete so the caller controls whether
// to re-render the whole app (sidebar Library pages) or just the inner tab
// content (Payroll/Procurement sub-tabs).
function attachCrudEvents(cfg, onDone) {
  document.getElementById("crudAddBtn").onclick = () => {
    openModal(`Add — ${cfg.title}`, cfg.fields, {}, (values) => {
      Store.addItem(cfg.collection, values, []);
      onDone();
    });
  };

  document.querySelectorAll('.link-action[data-action="edit"]').forEach((btn) => {
    btn.onclick = () => {
      const row = Store.getCollection(cfg.collection, []).find((r) => r.id === btn.dataset.id);
      openModal(`Edit — ${cfg.title}`, cfg.fields, row, (values) => {
        Store.updateItem(cfg.collection, row.id, values, []);
        onDone();
      });
    };
  });

  document.querySelectorAll('.link-action[data-action="delete"]').forEach((btn) => {
    btn.onclick = () => {
      if (confirm("Move this entry to Delete Logs?")) {
        Store.removeItem(cfg.collection, btn.dataset.id, []);
        onDone();
      }
    };
  });
}

// ---------------------------------------------------------------------------
// 11. PROJECT DETAIL VIEW (horizontal tabs)
// ---------------------------------------------------------------------------
function renderProjectDetail(project) {
  const tabs = PROJECT_TABS.map((t) => `
    <div class="tab-item ${state.activeProjectTab === t.id ? "active" : ""}" data-id="${t.id}">${t.label}</div>
  `).join("");

  return `
    <div class="breadcrumb"><a id="backToProjects">Projects</a> &nbsp;/&nbsp; ${project.name}</div>
    <div class="project-header">
      <div>
        <div class="project-header-title">${project.name}</div>
        <div class="project-header-meta">${project.location || "—"} &middot; Status: ${project.status || "Active"} &middot; Progress: ${project.progress || 0}%</div>
      </div>
    </div>
    <div class="tab-bar">${tabs}</div>
    <div id="projectTabContent">${renderProjectTabContent(state.activeProjectTab, project)}</div>
  `;
}

function attachProjectTabEvents() {
  document.getElementById("backToProjects").onclick = () => {
    state.activeProject = null;
    renderAll();
  };
  document.querySelectorAll(".tab-item").forEach((tab) => {
    tab.onclick = () => {
      state.activeProjectTab = tab.dataset.id;
      renderTabContentInPlace();
      document.querySelectorAll(".tab-item").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
    };
  });
}

function renderTabContentInPlace() {
  const holder = document.getElementById("projectTabContent");
  holder.innerHTML = renderProjectTabContent(state.activeProjectTab, state.activeProject);
  if (state.activeProjectTab === "p-material") attachMaterialTabEvents();
  if (state.activeProjectTab === "p-party") attachPartyTabEvents();
  if (state.activeProjectTab === "p-transactions") attachTransactionsTabEvents();
}

function renderProjectTabContent(tabId, project) {
  if (tabId === "p-material") return renderMaterialTab(project);
  if (tabId === "p-party") return renderPartyTab(project);
  if (tabId === "p-transactions") return renderTransactionsTab(project);

  const label = PROJECT_TABS.find((t) => t.id === tabId)?.label || tabId;
  return `
    <div class="placeholder-card">
      <strong>${label}</strong>
      Not built yet in this phase — tell me the fields/columns this tab needs and I'll wire it up the same way Material was built.
    </div>
  `;
}

// ---------------------------------------------------------------------------
// 12. MATERIAL TAB — the core transaction page (full CRUD + running balance)
// ---------------------------------------------------------------------------
function materialCollectionName(project) {
  return `materialLog__${project.id}`;
}

function renderMaterialTab(project) {
  const colName = materialCollectionName(project);
  const entries = Store.getCollection(colName, [])
    .slice()
    .sort((a, b) => (a.date || "").localeCompare(b.date || ""));

  // running balance per material name
  const balances = {};
  const rows = entries.map((e) => {
    const qty = Number(e.quantity) || 0;
    const isIn = (e.direction || "").startsWith("In");
    balances[e.materialName] = (balances[e.materialName] || 0) + (isIn ? qty : -qty);
    return `
      <tr>
        <td>${e.date || ""}</td>
        <td>${e.materialName || ""}</td>
        <td>${isIn ? qty : ""}</td>
        <td>${!isIn ? qty : ""}</td>
        <td><strong>${balances[e.materialName]}</strong></td>
        <td>${e.site || ""}</td>
        <td>${e.remarks || ""}</td>
        <td>
          <span class="link-action" data-action="edit" data-id="${e.id}">Edit</span>
          &nbsp;|&nbsp;
          <span class="link-action danger" data-action="delete" data-id="${e.id}">Delete</span>
        </td>
      </tr>
    `;
  }).join("") || `<tr><td colspan="8" style="text-align:center;color:var(--text-muted);">No material transactions logged yet.</td></tr>`;

  const materialsExist = Store.getCollection("materials", []).length > 0;

  return `
    <div class="page-header-row" style="margin-bottom:12px;">
      <div class="page-subtitle" style="margin:0;">Material In/Out log for this project. Balance updates automatically.</div>
      <button class="btn-primary" id="matAddBtn" ${materialsExist ? "" : "disabled title='Add materials in Material Library first'"}>+ Log Entry</button>
    </div>
    ${materialsExist ? "" : `<div class="placeholder-card" style="margin-bottom:14px;"><strong>Material Library is empty</strong>Add materials under Library &rarr; Material Library first, then come back here to log transactions.</div>`}
    ${AI_BACKEND_URL ? renderAiQuickEntryBox() : ""}
    <table class="data-table">
      <thead>
        <tr><th>Date</th><th>Material</th><th>In</th><th>Out</th><th>Balance</th><th>Store/Site</th><th>Remarks</th><th style="width:140px;">Actions</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function renderAiQuickEntryBox() {
  return `
    <div class="ai-box">
      <div class="ai-box-label">AI Quick Entry — type it like you'd say it out loud</div>
      <div class="ai-box-row">
        <input type="text" id="aiQuickInput" class="form-input" placeholder='e.g. "received 50 bags cement at Store A today"' />
        <button class="btn-primary" id="aiQuickBtn">Parse with AI</button>
      </div>
      <div id="aiQuickStatus" class="ai-box-status"></div>
    </div>
  `;
}

function attachMaterialTabEvents() {
  const project = state.activeProject;
  const colName = materialCollectionName(project);

  const aiBtn = document.getElementById("aiQuickBtn");
  if (aiBtn) {
    aiBtn.onclick = async () => {
      const input = document.getElementById("aiQuickInput");
      const statusEl = document.getElementById("aiQuickStatus");
      const text = input.value.trim();
      if (!text) return;

      const knownMaterials = Store.getCollection("materials", []).map((m) => m.name);
      aiBtn.disabled = true;
      statusEl.textContent = "Thinking...";
      statusEl.className = "ai-box-status";

      try {
        const res = await fetch(`${AI_BACKEND_URL}/api/parse-entry`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, known_materials: knownMaterials }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Request failed");

        statusEl.textContent = data.message || "";
        statusEl.className = "ai-box-status " + (data.status === "ok" ? "ok" : "warn");

        // Always open the confirm form — nothing is saved without the human clicking Save.
        const prefill = data.extracted || {};
        openModal("Confirm AI-Parsed Entry", MATERIAL_ENTRY_FIELDS, prefill, (values) => {
          Store.addItem(colName, values, []);
          input.value = "";
          statusEl.textContent = "";
          renderTabContentInPlace();
        });
      } catch (err) {
        statusEl.textContent = "Could not reach the AI backend: " + err.message;
        statusEl.className = "ai-box-status warn";
      } finally {
        aiBtn.disabled = false;
      }
    };
  }

  const addBtn = document.getElementById("matAddBtn");
  if (addBtn && !addBtn.disabled) {
    addBtn.onclick = () => {
      openModal("Log Material Entry", MATERIAL_ENTRY_FIELDS, {}, (values) => {
        Store.addItem(colName, values, []);
        renderTabContentInPlace();
      });
    };
  }

  document.querySelectorAll('.link-action[data-action="edit"]').forEach((btn) => {
    btn.onclick = () => {
      const row = Store.getCollection(colName, []).find((r) => r.id === btn.dataset.id);
      openModal("Edit Material Entry", MATERIAL_ENTRY_FIELDS, row, (values) => {
        Store.updateItem(colName, row.id, values, []);
        renderTabContentInPlace();
      });
    };
  });

  document.querySelectorAll('.link-action[data-action="delete"]').forEach((btn) => {
    btn.onclick = () => {
      if (confirm("Move this entry to Delete Logs?")) {
        Store.removeItem(colName, btn.dataset.id, []);
        renderTabContentInPlace();
      }
    };
  });
}

// ---------------------------------------------------------------------------
// 12b. PARTY TAB — per-project list of clients / vendors / subcontractors.
//      Reuses the generic CRUD renderer, same as Library pages.
// ---------------------------------------------------------------------------
function partiesCollectionName(project) {
  return `parties__${project.id}`;
}

function partyCfg(project) {
  return {
    title: "Party",
    subtitle: "All parties (clients, vendors, subcontractors) linked to this project.",
    collection: partiesCollectionName(project),
    fields: PARTY_FIELDS,
  };
}

function renderPartyTab(project) {
  return renderCrudPage(partyCfg(project));
}

function attachPartyTabEvents() {
  attachCrudEvents(partyCfg(state.activeProject), renderTabContentInPlace);
}

// ---------------------------------------------------------------------------
// 12c. TRANSACTIONS TAB — Payment / Sales / Expense sub-types, each its own
//      per-project collection, sharing one field schema + a receipt popup.
// ---------------------------------------------------------------------------
function txnCollectionName(typeId, project) {
  return `txn__${typeId}__${project.id}`;
}

function renderTransactionsTab(project) {
  const activeType = state.activeTxnType || "payment-in";
  const groupsHtml = TRANSACTION_GROUPS.map((g) => `
    <div class="txn-group-label">${g.group}</div>
    ${g.items.map((i) => `<div class="txn-nav-item ${activeType === i.id ? "active" : ""}" data-id="${i.id}">${i.label}</div>`).join("")}
  `).join("");

  return `
    <div class="txn-toolbar">
      <button class="btn-primary" id="paymentRequestBtn">+ Payment Request</button>
      <input type="text" id="txnSearchInput" class="form-input" style="max-width:220px;" placeholder="Search party / remarks..." value="${state.txnSearch || ""}" />
      <div class="txn-toolbar-right">
        <span class="txn-icon-btn" id="unbilledMaterialBtn" title="Unbilled Material">&#128666;</span>
        <span class="txn-icon-btn" id="pendingEntriesBtn" title="Pending Entries">&#128077;</span>
        <span class="txn-icon-btn" id="downloadTxnBtn" title="Download this list (CSV)">&#11015;</span>
        <span class="txn-icon-btn" id="togglePanelBtn" title="Show/hide transaction menu">&#9776;</span>
      </div>
    </div>
    <div class="txn-layout">
      <div class="txn-side-panel ${state.txnPanelOpen ? "" : "collapsed"}" id="txnSidePanel">${groupsHtml}</div>
      <div class="txn-content" id="txnTypeContent">${renderTxnTypeContent(activeType, project)}</div>
    </div>
  `;
}

function renderTxnTypeContent(typeId, project) {
  const label = findTxnTypeLabel(typeId);
  const colName = txnCollectionName(typeId, project);
  const rows = Store.getCollection(colName, []);
  const q = (state.txnSearch || "").toLowerCase();
  const filtered = q
    ? rows.filter((r) => (r.partyName || "").toLowerCase().includes(q) || (r.remarks || "").toLowerCase().includes(q))
    : rows;

  const bodyRows = filtered.map((r) => `
    <tr>
      <td>${r.date || ""}</td>
      <td>${r.partyName || ""}</td>
      <td>&#8377; ${Number(r.amount || 0).toLocaleString("en-IN")}</td>
      <td>${r.paymentMethod || ""}</td>
      <td>${r.costCode || ""}</td>
      <td>${r.remarks || ""}</td>
      <td>
        <span class="link-action" data-action="receipt" data-id="${r.id}">Receipt</span>
        &nbsp;|&nbsp;
        <span class="link-action" data-action="edit" data-id="${r.id}">Edit</span>
        &nbsp;|&nbsp;
        <span class="link-action danger" data-action="delete" data-id="${r.id}">Delete</span>
      </td>
    </tr>
  `).join("") || `<tr><td colspan="7" style="text-align:center;color:var(--text-muted);">No ${label} entries yet.</td></tr>`;

  const total = filtered.reduce((s, r) => s + (Number(r.amount) || 0), 0);

  return `
    <div class="page-header-row" style="margin-bottom:12px;">
      <div>
        <h2 style="margin:0;font-size:16px;">${label}</h2>
        <p class="page-subtitle" style="margin:4px 0 0 0;">Total: &#8377; ${total.toLocaleString("en-IN")}</p>
      </div>
      <button class="btn-primary" id="txnAddBtn">+ Add ${label}</button>
    </div>
    <table class="data-table">
      <thead><tr><th>Date</th><th>Party</th><th>Amount</th><th>Method</th><th>Cost Code</th><th>Remarks</th><th style="width:190px;">Actions</th></tr></thead>
      <tbody>${bodyRows}</tbody>
    </table>
  `;
}

function attachTransactionsTabEvents() {
  const project = state.activeProject;

  document.querySelectorAll(".txn-nav-item").forEach((item) => {
    item.onclick = () => {
      state.activeTxnType = item.dataset.id;
      renderTabContentInPlace();
    };
  });

  const toggleBtn = document.getElementById("togglePanelBtn");
  if (toggleBtn) {
    toggleBtn.onclick = () => {
      state.txnPanelOpen = !state.txnPanelOpen;
      renderTabContentInPlace();
    };
  }

  const searchInput = document.getElementById("txnSearchInput");
  if (searchInput) {
    searchInput.oninput = (e) => {
      state.txnSearch = e.target.value;
      document.getElementById("txnTypeContent").innerHTML = renderTxnTypeContent(state.activeTxnType, project);
      attachTxnTypeContentEvents(project);
    };
  }

  const unbilledBtn = document.getElementById("unbilledMaterialBtn");
  if (unbilledBtn) {
    unbilledBtn.onclick = () => {
      const matLog = Store.getCollection(materialCollectionName(project), []);
      const unbilled = matLog.filter((m) => (m.direction || "").startsWith("In")).length;
      alert(`Unbilled Material: ${unbilled} incoming material entr${unbilled === 1 ? "y" : "ies"} logged for this project.\n\n(Bill-matching against Material Purchase entries can be refined later.)`);
    };
  }

  const pendingBtn = document.getElementById("pendingEntriesBtn");
  if (pendingBtn) {
    pendingBtn.onclick = () => {
      const totalEntries = TRANSACTION_GROUPS.flatMap((g) => g.items)
        .reduce((sum, i) => sum + Store.getCollection(txnCollectionName(i.id, project), []).length, 0);
      alert(`Pending Entries: ${totalEntries} transaction${totalEntries === 1 ? "" : "s"} logged so far across all types for this project.`);
    };
  }

  const downloadBtn = document.getElementById("downloadTxnBtn");
  if (downloadBtn) {
    downloadBtn.onclick = () => {
      const typeId = state.activeTxnType;
      const label = findTxnTypeLabel(typeId);
      const rows = Store.getCollection(txnCollectionName(typeId, project), []);
      const header = "Date,Party,Amount,Method,Cost Code,Remarks\n";
      const body = rows.map((r) => [r.date, r.partyName, r.amount, r.paymentMethod, r.costCode, r.remarks]
        .map((v) => `"${(v ?? "").toString().replace(/"/g, '""')}"`).join(",")).join("\n");
      const blob = new Blob([header + body], { type: "text/csv" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${label.replace(/\s+/g, "_")}-${project.name.replace(/\s+/g, "_")}.csv`;
      a.click();
    };
  }

  const paymentRequestBtn = document.getElementById("paymentRequestBtn");
  if (paymentRequestBtn) {
    paymentRequestBtn.onclick = () => {
      openModal("Payment Request", transactionFields(project), {}, (values) => {
        Store.addItem(txnCollectionName("payment-in", project), { ...values, requestFlag: true }, []);
        state.activeTxnType = "payment-in";
        renderTabContentInPlace();
      });
    };
  }

  attachTxnTypeContentEvents(project);
}

function attachTxnTypeContentEvents(project) {
  const typeId = state.activeTxnType || "payment-in";
  const colName = txnCollectionName(typeId, project);
  const label = findTxnTypeLabel(typeId);

  const addBtn = document.getElementById("txnAddBtn");
  if (addBtn) {
    addBtn.onclick = () => {
      openModal(`Add ${label}`, transactionFields(project), {}, (values) => {
        Store.addItem(colName, values, []);
        renderTabContentInPlace();
      });
    };
  }

  document.querySelectorAll('.link-action[data-action="edit"]').forEach((btn) => {
    btn.onclick = () => {
      const row = Store.getCollection(colName, []).find((r) => r.id === btn.dataset.id);
      openModal(`Edit ${label}`, transactionFields(project), row, (values) => {
        Store.updateItem(colName, row.id, values, []);
        renderTabContentInPlace();
      });
    };
  });

  document.querySelectorAll('.link-action[data-action="delete"]').forEach((btn) => {
    btn.onclick = () => {
      if (confirm("Move this entry to Delete Logs?")) {
        Store.removeItem(colName, btn.dataset.id, []);
        renderTabContentInPlace();
      }
    };
  });

  document.querySelectorAll('.link-action[data-action="receipt"]').forEach((btn) => {
    btn.onclick = () => {
      const row = Store.getCollection(colName, []).find((r) => r.id === btn.dataset.id);
      showReceipt(label, row, project);
    };
  });
}

// ---------------------------------------------------------------------------
// 12d. RECEIPT POPUP — printable/PDF-able summary for any transaction entry.
// ---------------------------------------------------------------------------
function showReceipt(typeLabel, row, project) {
  if (!row) return;
  const companyName = Store.getSetting("companyName", DEFAULT_COMPANY_NAME);
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.id = "receiptOverlay";
  overlay.innerHTML = `
    <div class="modal-box receipt-box">
      <div class="modal-header">
        <span>${typeLabel} Receipt</span>
        <span class="modal-close" id="receiptCloseBtn">&times;</span>
      </div>
      <div class="modal-body receipt-body" id="receiptPrintArea">
        <div class="receipt-company">${companyName}</div>
        <div class="receipt-sub">${project.name}${project.location ? " &middot; " + project.location : ""}</div>
        <hr/>
        <div class="receipt-row"><span>Type</span><strong>${typeLabel}</strong></div>
        <div class="receipt-row"><span>Date</span><strong>${row.date || "—"}</strong></div>
        <div class="receipt-row"><span>Party</span><strong>${row.partyName || "—"}</strong></div>
        <div class="receipt-row"><span>Amount</span><strong>&#8377; ${Number(row.amount || 0).toLocaleString("en-IN")}</strong></div>
        <div class="receipt-row"><span>Payment Method</span><strong>${row.paymentMethod || "—"}</strong></div>
        <div class="receipt-row"><span>Cost Code</span><strong>${row.costCode || "—"}</strong></div>
        <div class="receipt-row"><span>Remarks</span><strong>${row.remarks || "—"}</strong></div>
        <hr/>
        <div class="receipt-footer">Generated by Site ERP</div>
      </div>
      <div class="modal-footer">
        <button class="btn-ghost" id="receiptCloseBtn2">Close</button>
        <button class="btn-primary" id="receiptPrintBtn">Print / Save PDF</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  document.getElementById("receiptCloseBtn").onclick = () => overlay.remove();
  document.getElementById("receiptCloseBtn2").onclick = () => overlay.remove();
  document.getElementById("receiptPrintBtn").onclick = () => {
    const printContents = document.getElementById("receiptPrintArea").innerHTML;
    const printWin = window.open("", "_blank");
    printWin.document.write(`<html><head><title>${typeLabel} Receipt</title>
      <style>
        body{font-family:Arial,sans-serif;padding:24px;color:#1c2b36;}
        .receipt-company{font-size:18px;font-weight:700;}
        .receipt-sub{color:#6b7a85;margin-bottom:12px;}
        .receipt-row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #eee;}
        .receipt-footer{margin-top:16px;color:#6b7a85;font-size:12px;text-align:center;}
        hr{border:none;border-top:1px solid #e2e6ea;margin:12px 0;}
      </style>
    </head><body>${printContents}</body></html>`);
    printWin.document.close();
    printWin.focus();
    printWin.print();
  };
}

// ---------------------------------------------------------------------------
// 13. DELETE LOGS (soft-delete audit trail + restore/purge)
// ---------------------------------------------------------------------------
function renderDeleteLogs() {
  const logs = Store.getCollection("deletedLogs", []);
  const rows = logs.map((l) => {
    const name = l.record.name || l.record.title || l.record.materialName || l.record.code || l.record.subcontractor || l.record.subcontractorName || l.record.staffName || l.record.vendorName || l.record.fromParty || l.record.designation || l.record.task || "(record)";
    return `
      <tr>
        <td>${new Date(l.deletedAt).toLocaleString()}</td>
        <td>${l.collection}</td>
        <td>${name}</td>
        <td>
          <span class="link-action" data-action="restore" data-id="${l.id}">Restore</span>
          &nbsp;|&nbsp;
          <span class="link-action danger" data-action="purge" data-id="${l.id}">Delete Permanently</span>
        </td>
      </tr>
    `;
  }).join("") || `<tr><td colspan="4" style="text-align:center;color:var(--text-muted);">Nothing deleted yet.</td></tr>`;

  return `
    <h1 class="page-title">Delete Logs</h1>
    <p class="page-subtitle">Every delete across the app lands here first — nothing is destroyed by accident.</p>
    <table class="data-table">
      <thead><tr><th>Deleted At</th><th>Type</th><th>Item</th><th style="width:220px;">Actions</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function attachDeleteLogEvents() {
  document.querySelectorAll('.link-action[data-action="restore"]').forEach((btn) => {
    btn.onclick = () => { Store.restoreItem(btn.dataset.id); renderAll(); };
  });
  document.querySelectorAll('.link-action[data-action="purge"]').forEach((btn) => {
    btn.onclick = () => {
      if (confirm("Permanently delete? This cannot be undone.")) {
        Store.purgeLog(btn.dataset.id);
        renderAll();
      }
    };
  });
}

// ---------------------------------------------------------------------------
// 14. SETTINGS (export/import backup — important while running on localStorage)
// ---------------------------------------------------------------------------
function renderSettings() {
  return `
    <h1 class="page-title">Settings</h1>
    <div class="placeholder-card" style="text-align:left;">
      <strong>Data backup</strong>
      This app currently stores data in your browser only (no server yet). Use Export regularly so you never lose data,
      and Import to move data to another browser/computer or restore a backup.
      <div style="margin-top:14px;">
        <button class="btn-primary" id="exportBtn">Export Data (.json)</button>
        &nbsp;
        <label class="btn-ghost" style="cursor:pointer;">
          Import Data (.json)
          <input type="file" id="importInput" accept=".json" style="display:none;" />
        </label>
      </div>
    </div>
  `;
}

function attachSettingsEvents() {
  document.getElementById("exportBtn").onclick = () => {
    const data = Store.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `site-erp-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  document.getElementById("importInput").onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const obj = JSON.parse(reader.result);
        Store.importAll(obj);
        alert("Import complete.");
        renderAll();
      } catch (err) {
        alert("Invalid backup file.");
      }
    };
    reader.readAsText(file);
  };
}

// ---------------------------------------------------------------------------
// 15. BOOT
// ---------------------------------------------------------------------------
function renderAll() {
  renderSidebar();
  renderMain();
}

renderAll();

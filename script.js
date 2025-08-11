// script.js
// Full replacement: works with your index.html (IDs, names) and API at /api
document.addEventListener('DOMContentLoaded', () => {
  const API_BASE = '/api'; // <- keep this if backend is same origin. Change if needed.
  const TOAST_TIMEOUT = 3500;

  // global app data
  window.bloodTypes = [];
  window.hospitals = [];
  window.donors = [];
  window.recipients = [];
  window.donorTransactions = [];
  window.recipientTransactions = [];

  // cached DOM
  const bodyEl = document.body;
  const mainContent = document.querySelector('.main-content');
  const toastContainer = document.getElementById('toast-container');

  // ---------- small helpers ----------
  const showToast = (msg, type = 'info') => {
    if (!toastContainer) {
      console.warn('Toast container missing — fallback alert.');
      alert(msg);
      return;
    }
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.textContent = msg;
    toastContainer.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    const id = setTimeout(() => {
      t.classList.remove('show');
      t.addEventListener('transitionend', () => t.remove(), { once: true });
    }, TOAST_TIMEOUT);
    t.addEventListener('click', () => {
      clearTimeout(id);
      t.classList.remove('show');
      t.addEventListener('transitionend', () => t.remove(), { once: true });
    }, { once: true });
  };

  const apiFetch = async (path, opts = {}) => {
    const res = await fetch(`${API_BASE}${path}`, opts);
    let body = null;
    try { body = await res.json(); } catch (e) { /* no json */ }
    if (!res.ok) {
      const errMsg = body?.message || `${res.status} ${res.statusText}`;
      throw new Error(errMsg);
    }
    return body;
  };

  // tolerant getter (try multiple key names)
  const g = (obj, keys) => {
    if (!obj) return '';
    if (!Array.isArray(keys)) keys = [keys];
    for (const k of keys) {
      if (obj[k] !== undefined && obj[k] !== null) return obj[k];
    }
    return '';
  };

  // ---------- section switching ----------
  const showSection = (id) => {
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active-section'));
    document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
    const sec = document.getElementById(id);
    if (sec) sec.classList.add('active-section');
    const link = document.querySelector(`.sidebar-nav a[data-target="${id}"]`);
    if (link) link.classList.add('active');
    if (mainContent) mainContent.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ---------- show/hide forms ----------
  const hideAllForms = () => document.querySelectorAll('.data-form').forEach(f => f.classList.add('hidden'));
  const showForm = (formId) => {
    hideAllForms();
    const form = document.getElementById(formId);
    if (!form) return;
    // clear and show
    form.reset();
    // clear hidden edit id if present
    const hidden = form.querySelector('input[type="hidden"]');
    if (hidden) hidden.value = '';
    form.classList.remove('hidden');
    // populate selects if needed (small delay to ensure select options are ready)
    setTimeout(() => {
      if (formId === 'donor-form') populateBloodTypes('donor-blood-type');
      if (formId === 'recipient-form') populateBloodTypes('recipient-blood-type');
      if (formId === 'donor-trans-form' || formId === 'recipient-trans-form') {
        populateHospitals('donor-trans-hospital');
        populateHospitals('recipient-trans-hospital');
        populateDonors('donor-trans-donor');
        populateRecipients('recipient-trans-recipient');
        populateBloodTypes('recipient-trans-blood-type');
      }
    }, 50);
  };
  const hideForm = (formId) => {
    const form = document.getElementById(formId);
    if (form) { form.classList.add('hidden'); form.reset(); }
  };

  // ---------- dropdown population ----------
  function populateSelectById(selectId, items = [], valueKey, textKey, defaultText = '-- Select --') {
    const sel = document.getElementById(selectId);
    if (!sel) return;
    const cur = sel.value;
    sel.innerHTML = `<option value="">${defaultText}</option>`;
    items.forEach(it => {
      const opt = document.createElement('option');
      opt.value = it[valueKey] ?? it._id ?? '';
      opt.textContent = (it[valueKey] ?? it._id ?? '') + (it[textKey] ? `) ${it[textKey]}` : (it[textKey] ?? ''));
      sel.appendChild(opt);
    });
    if (cur && Array.from(sel.options).some(o => o.value === cur)) sel.value = cur;
  }
  const populateHospitals = (selectId = 'hospital-select') => populateSelectById(selectId, window.hospitals, 'Hospital_ID', 'Name', '-- Select Hospital --');
  const populateBloodTypes = (selectId = 'blood-type-select') => populateSelectById(selectId, window.bloodTypes, 'Blood_Type_ID', 'Name', '-- Select Blood Type --');
  const populateDonors = (selectId = 'donor-select') => populateSelectById(selectId, window.donors, 'Donor_ID', 'Name', '-- Select Donor --');
  const populateRecipients = (selectId = 'recipient-select') => populateSelectById(selectId, window.recipients, 'Recipient_ID', 'Name', '-- Select Recipient --');

  // ---------- table renderer ----------
  function renderTableRows(tableId, items, columns, actions = {}) {
    const table = document.getElementById(tableId);
    if (!table) return;
    const tbody = table.querySelector('tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (!items || items.length === 0) {
      const row = tbody.insertRow();
      const cell = row.insertCell();
      cell.colSpan = columns.length + (actions ? 1 : 0);
      cell.className = 'text-center text-muted';
      cell.textContent = 'No data available.';
      return;
    }

    items.forEach(item => {
      const row = tbody.insertRow();
      // first key for dataset id: try columns[0].key or columns[0].keys
      const primaryKey = (columns[0].key || (Array.isArray(columns[0].keys) ? columns[0].keys[0] : '')) || '_id';
      row.dataset.id = item[primaryKey] ?? '';

      columns.forEach(col => {
        const cell = row.insertCell();
        let val = '';
        if (col.render && typeof col.render === 'function') {
          val = col.render(item);
        } else if (col.key) {
          val = g(item, col.key) ?? '';
        } else if (col.keys && Array.isArray(col.keys)) {
          val = g(item, col.keys) ?? '';
        } else {
          val = '';
        }

        if (col.isDate && val) {
          // try to format date safely
          try {
            const d = new Date(val);
            if (!isNaN(d)) val = d.toLocaleDateString();
          } catch (_e) { /* ignore */ }
        }

        cell.textContent = val ?? 'N/A';
        if (col.maxLength) {
          cell.style.maxWidth = `${col.maxLength}px`;
          cell.style.whiteSpace = 'normal';
          cell.style.wordBreak = 'break-word';
        }
      });

      if (actions) {
        const actionCell = row.insertCell();
        actionCell.className = 'action-cell';

        if (actions.edit) {
          const eb = document.createElement('button');
          eb.type = 'button';
          eb.className = 'btn btn-edit btn-small';
          eb.title = 'Edit';
          eb.innerHTML = '<i class="fas fa-pencil-alt"></i>';
          eb.addEventListener('click', (ev) => {
            ev.stopPropagation();
            actions.edit(row.dataset.id);
          });
          actionCell.appendChild(eb);
        }

        if (actions.delete) {
          const db = document.createElement('button');
          db.type = 'button';
          db.className = 'btn btn-delete btn-small';
          db.title = 'Delete';
          db.innerHTML = '<i class="fas fa-trash-alt"></i>';
          db.addEventListener('click', (ev) => {
            ev.stopPropagation();
            actions.delete(row.dataset.id);
          });
          actionCell.appendChild(db);
        }
      }
    });
  }

  // ---------- renderers for each resource ----------
  const renderBloodTypes = () => renderTableRows('blood-type-table', window.bloodTypes,
    [{ key: 'Blood_Type_ID' }, { key: 'Name' }],
    { edit: editBloodType, delete: deleteBloodType });

  const renderHospitals = () => renderTableRows('hospital-table', window.hospitals,
    [{ key: 'Hospital_ID' }, { key: 'Name' }, { key: 'Address' }, { key: 'Contact' }],
    { edit: editHospital, delete: deleteHospital });

  const renderDonors = () => renderTableRows('donor-table', window.donors,
    [{ key: 'Donor_ID' }, { key: 'Name' }, { key: 'Contact' }, { key: 'Age' }, { render: (it) => g(it, ['Blood_Type','Blood_Type_ID']) }, { key: 'Card_ID' }],
    { edit: editDonor, delete: deleteDonor });

  const renderRecipients = () => renderTableRows('recipient-table', window.recipients,
    [{ key: 'Recipient_ID' }, { key: 'Name' }, { key: 'Contact' }, { render: it => g(it, ['Blood_Type','Blood_Type_ID']) }, { key: 'Donor_ID' }],
    { edit: editRecipient, delete: deleteRecipient });

  const renderDonorTransactions = () => renderTableRows('donor-trans-table', window.donorTransactions,
    [{ key: 'Transaction_ID' }, { key: 'Donor_ID' }, { key: 'Hospital_ID' }, { key: 'Date', isDate: true }, { key: 'Confirmation_Code' }, { key: 'Health_Status' }],
    { edit: editDonorTransaction, delete: deleteDonorTransaction });

  const renderRecipientTransactions = () => renderTableRows('recipient-trans-table', window.recipientTransactions,
    [{ key: 'Transaction_ID' }, { key: 'Recipient_ID' }, { key: 'Hospital_ID' }, { key: 'Blood_Type' }, { key: 'Date', isDate: true }, { key: 'Recipient_Request' }, { key: 'Donor_Card_ID' }],
    { edit: editRecipientTransaction, delete: deleteRecipientTransaction });

  // ---------- load data ----------
  async function loadAll() {
    try {
      // parallel loading
      const [
        bts, hos, dns, rcp, dtx, rtx
      ] = await Promise.all([
        apiFetch('/blood-types').catch(e => { showToast('Failed to load blood types', 'error'); return []; }),
        apiFetch('/hospitals').catch(e => { showToast('Failed to load hospitals', 'error'); return []; }),
        apiFetch('/donors').catch(e => { showToast('Failed to load donors', 'error'); return []; }),
        apiFetch('/recipients').catch(e => { showToast('Failed to load recipients', 'error'); return []; }),
        apiFetch('/donor-transactions').catch(e => { showToast('Failed to load donor transactions', 'error'); return []; }),
        apiFetch('/recipient-transactions').catch(e => { showToast('Failed to load recipient transactions', 'error'); return []; }),
      ]);

      window.bloodTypes = bts || [];
      window.hospitals = hos || [];
      window.donors = dns || [];
      window.recipients = rcp || [];
      window.donorTransactions = dtx || [];
      window.recipientTransactions = rtx || [];

      // populate UI
      renderBloodTypes();
      renderHospitals();
      renderDonors();
      renderRecipients();
      renderDonorTransactions();
      renderRecipientTransactions();

      // populate common selects (IDs used in forms)
      populateBloodTypes('donor-blood-type');
      populateBloodTypes('recipient-blood-type');
      populateHospitals('donor-trans-hospital');
      populateHospitals('recipient-trans-hospital');
      populateDonors('donor-trans-donor');
      populateRecipients('recipient-trans-recipient');

      // update counters on dashboard if present
      const safeText = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = (v || 0); };
      safeText('total-donors', window.donors.length);
      safeText('total-recipients', window.recipients.length);
      safeText('total-hospitals', window.hospitals.length);
      safeText('total-blood-types', window.bloodTypes.length);

    } catch (err) {
      console.error('loadAll error', err);
      showToast('Error loading data. See console.', 'error');
    }
  }

  // ---------- create/update handlers ----------
  async function submitForm(formId, endpoint, mapFn) {
    const form = document.getElementById(formId);
    if (!form) return;
    const submitBtn = form.querySelector('button[type="submit"]');
    const origHtml = submitBtn ? submitBtn.innerHTML : null;
    if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...'; }

    try {
      const fd = new FormData(form);
      const body = mapFn(fd);
      // check if editing (hidden input)
      const hidden = form.querySelector('input[type="hidden"]');
      let method = 'POST', url = `${API_BASE}${endpoint}`;
      if (hidden && hidden.value) {
        method = 'PUT';
        url = `${API_BASE}${endpoint}/${encodeURIComponent(hidden.value)}`;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      let parsed = null;
      try { parsed = await res.json(); } catch (e) { /* ignore */ }
      if (!res.ok) throw new Error(parsed?.message || `${res.status} ${res.statusText}`);

      showToast(parsed?.message || 'Saved successfully', 'success');
      hideForm(formId);

      // reload relevant resources
      await loadAll();
    } catch (err) {
      console.error('submitForm error', err);
      showToast(err.message || 'Save failed', 'error');
    } finally {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = origHtml; }
    }
  }

  // field mapping per form (to match server schema)
  // NOTE: server expects keys like Donor_ID, Contact, Blood_Type, Card_ID etc.
  const mapers = {
    'blood-type-form': (fd) => ({
      Blood_Type_ID: (fd.get('blood-type-id') || '').trim(),
      Name: (fd.get('blood-type-name') || '').trim(),
    }),
    'hospital-form': (fd) => ({
      Hospital_ID: (fd.get('hospital-id') || '').trim(),
      Name: (fd.get('hospital-name') || '').trim(),
      Address: (fd.get('hospital-address') || '').trim() || null,
      Contact: (fd.get('hospital-contact') || '').trim(),
    }),
    'donor-form': (fd) => ({
      Donor_ID: (fd.get('donor-id') || '').trim(),
      Name: (fd.get('donor-name') || '').trim(),
      Contact: (fd.get('donor-contact') || '').trim(),
      Age: fd.get('donor-age') ? parseInt(fd.get('donor-age'), 10) : null,
      Blood_Type: (fd.get('donor-blood-type') || '').trim(),
      Card_ID: (fd.get('donor-card-id') || '').trim() || null,
    }),
    'recipient-form': (fd) => {
      const obj = {
        Recipient_ID: (fd.get('recipient-id') || '').trim(),
        Name: (fd.get('recipient-name') || '').trim(),
        Contact: (fd.get('recipient-contact') || '').trim(),
        Blood_Type: (fd.get('recipient-blood-type') || '').trim(),
      };
      const donorRef = (fd.get('recipient-donor-id') || '').trim();
      if (donorRef) obj.Donor_ID = donorRef;
      return obj;
    },
    'donor-trans-form': (fd) => ({
      Transaction_ID: (fd.get('donor-trans-id') || '').trim(),
      Donor_ID: (fd.get('donor-trans-donor') || '').trim(),
      Hospital_ID: (fd.get('donor-trans-hospital') || '').trim(),
      Date: (fd.get('donor-trans-date') || '').trim(),
      Confirmation_Code: (fd.get('donor-trans-confirmation') || '').trim() || null,
      Health_Status: (fd.get('donor-trans-health') || '').trim() || null,
    }),
    'recipient-trans-form': (fd) => ({
      Transaction_ID: (fd.get('recipient-trans-id') || '').trim(),
      Recipient_ID: (fd.get('recipient-trans-recipient') || '').trim(),
      Hospital_ID: (fd.get('recipient-trans-hospital') || '').trim(),
      Blood_Type: (fd.get('recipient-trans-blood-type') || '').trim(),
      Date: (fd.get('recipient-trans-date') || '').trim(),
      Recipient_Request: (fd.get('recipient-trans-request') || '').trim() || null,
      Donor_Card_ID: (fd.get('recipient-trans-donor-card') || '').trim() || null,
    }),
  };

  // ---------- Edit and Delete actions ----------
  // find item by its "ID field" (e.g., Donor_ID, Hospital_ID)
  const findByKey = (arr, keyName, id) => (arr || []).find(x => (x[keyName] ?? x._id ?? '') === id);

  function setupEditFormFromItem(formId, idFieldName, idValue, fieldsMap) {
    const dataArray = {
      'blood-type-form': window.bloodTypes,
      'hospital-form': window.hospitals,
      'donor-form': window.donors,
      'recipient-form': window.recipients,
      'donor-trans-form': window.donorTransactions,
      'recipient-trans-form': window.recipientTransactions,
    }[formId];

    if (!dataArray) {
      showToast('Cannot edit: unknown data array', 'error'); return;
    }

    const item = findByKey(dataArray, idFieldName, idValue);
    if (!item) { showToast(`${idValue} not found`, 'error'); return; }

    showForm(formId);
    const form = document.getElementById(formId);
    if (!form) return;

    // set hidden id field
    const hidden = form.querySelector('input[type="hidden"]');
    if (hidden) hidden.value = idValue;

    // populate mapped fields
    fieldsMap.forEach(m => {
      const el = form.querySelector(`#${m.inputId}`);
      if (!el) return;
      const value = g(item, m.dataKeys || [m.dataKey]);
      if (el.tagName === 'SELECT' || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.value = value ?? '';
      } else {
        el.textContent = value ?? '';
      }
    });
  }

  // edit callbacks
  const editBloodType = (id) => setupEditFormFromItem('blood-type-form', 'Blood_Type_ID', id, [
    { inputId: 'blood-type-id', dataKey: 'Blood_Type_ID' },
    { inputId: 'blood-type-name', dataKey: 'Name' }
  ]);
  const editHospital = (id) => setupEditFormFromItem('hospital-form', 'Hospital_ID', id, [
    { inputId: 'hospital-id', dataKey: 'Hospital_ID' },
    { inputId: 'hospital-name', dataKey: 'Name' },
    { inputId: 'hospital-address', dataKey: 'Address' },
    { inputId: 'hospital-contact', dataKey: 'Contact' }
  ]);
  const editDonor = (id) => setupEditFormFromItem('donor-form', 'Donor_ID', id, [
    { inputId: 'donor-id', dataKey: 'Donor_ID' },
    { inputId: 'donor-name', dataKey: 'Name' },
    { inputId: 'donor-contact', dataKey: 'Contact' },
    { inputId: 'donor-age', dataKey: 'Age' },
    { inputId: 'donor-blood-type', dataKey: 'Blood_Type' },
    { inputId: 'donor-card-id', dataKey: 'Card_ID' }
  ]);
  const editRecipient = (id) => setupEditFormFromItem('recipient-form', 'Recipient_ID', id, [
    { inputId: 'recipient-id', dataKey: 'Recipient_ID' },
    { inputId: 'recipient-name', dataKey: 'Name' },
    { inputId: 'recipient-contact', dataKey: 'Contact' },
    { inputId: 'recipient-blood-type', dataKey: 'Blood_Type' },
    { inputId: 'recipient-donor-id', dataKey: 'Donor_ID' }
  ]);
  const editDonorTransaction = (id) => setupEditFormFromItem('donor-trans-form', 'Transaction_ID', id, [
    { inputId: 'donor-trans-id', dataKey: 'Transaction_ID' },
    { inputId: 'donor-trans-donor', dataKey: 'Donor_ID' },
    { inputId: 'donor-trans-hospital', dataKey: 'Hospital_ID' },
    { inputId: 'donor-trans-date', dataKey: 'Date' },
    { inputId: 'donor-trans-confirmation', dataKey: 'Confirmation_Code' },
    { inputId: 'donor-trans-health', dataKey: 'Health_Status' }
  ]);
  const editRecipientTransaction = (id) => setupEditFormFromItem('recipient-trans-form', 'Transaction_ID', id, [
    { inputId: 'recipient-trans-id', dataKey: 'Transaction_ID' },
    { inputId: 'recipient-trans-recipient', dataKey: 'Recipient_ID' },
    { inputId: 'recipient-trans-hospital', dataKey: 'Hospital_ID' },
    { inputId: 'recipient-trans-blood-type', dataKey: 'Blood_Type' },
    { inputId: 'recipient-trans-date', dataKey: 'Date' },
    { inputId: 'recipient-trans-request', dataKey: 'Recipient_Request' },
    { inputId: 'recipient-trans-donor-card', dataKey: 'Donor_Card_ID' }
  ]);

  // delete handlers
  async function doDelete(endpoint, id, successMsg = 'Deleted') {
    if (!confirm(`Delete ${id}? This cannot be undone.`)) return;
    try {
      await apiFetch(`/${endpoint}/${encodeURIComponent(id)}`, { method: 'DELETE' });
      showToast(successMsg, 'success');
      await loadAll();
    } catch (err) {
      console.error('delete error', err);
      showToast(err.message || 'Delete failed', 'error');
    }
  }

  const deleteBloodType = (id) => doDelete('blood-types', id, `Blood Type ${id} deleted`);
  const deleteHospital = (id) => doDelete('hospitals', id, `Hospital ${id} deleted`);
  const deleteDonor = (id) => doDelete('donors', id, `Donor ${id} deleted`);
  const deleteRecipient = (id) => doDelete('recipients', id, `Recipient ${id} deleted`);
  const deleteDonorTransaction = (id) => doDelete('donor-transactions', id, `Donor transaction ${id} deleted`);
  const deleteRecipientTransaction = (id) => doDelete('recipient-transactions', id, `Recipient transaction ${id} deleted`);

  // ---------- wire up form submissions ----------
  const bindForm = (formId, apiEndpoint) => {
    const form = document.getElementById(formId);
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      submitForm(formId, apiEndpoint, mapers[formId]);
    });
  };

  bindForm('blood-type-form', '/blood-types');
  bindForm('hospital-form', '/hospitals');
  bindForm('donor-form', '/donors');
  bindForm('recipient-form', '/recipients');
  bindForm('donor-trans-form', '/donor-transactions');
  bindForm('recipient-trans-form', '/recipient-transactions');

  // ---------- Add new / Cancel button wiring ----------
  const addButtons = [
    ['add-blood-type-btn', 'blood-type-form'],
    ['add-hospital-btn', 'hospital-form'],
    ['add-donor-btn', 'donor-form'],
    ['add-recipient-btn', 'recipient-form'],
    ['add-donor-trans-btn', 'donor-trans-form'],
    ['add-recipient-trans-btn', 'recipient-trans-form'],
  ];
  addButtons.forEach(([btnId, formId]) => {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      showForm(formId);
    });
  });

  // cancel buttons
  ['cancel-blood-type-btn','cancel-hospital-btn','cancel-donor-btn','cancel-recipient-btn','cancel-donor-trans-btn','cancel-recipient-trans-btn']
    .forEach(id => {
      const b = document.getElementById(id);
      if (!b) return;
      b.addEventListener('click', (e) => {
        e.preventDefault();
        // derive form id
        const formId = id.replace('cancel-', '').replace('-btn', '') + '-form';
        hideForm(formId);
      });
    });

  // sidebar navigation (links with data-target)
  document.querySelectorAll('.sidebar-nav a[data-target]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const target = a.getAttribute('data-target');
      if (target) showSection(target);
    });
  });

  // ---------- initial load ----------
  showToast('Loading data...', 'info');
  loadAll().then(() => {
    showSection('dashboard-section');
    showToast('Ready', 'success');
  }).catch(err => {
    console.error('init error', err);
    showToast('Failed to initialize app', 'error');
  });

  // expose some edit/delete functions globally so renderers can call them (if needed)
  window.editBloodType = editBloodType;
  window.editHospital = editHospital;
  window.editDonor = editDonor;
  window.editRecipient = editRecipient;
  window.editDonorTransaction = editDonorTransaction;
  window.editRecipientTransaction = editRecipientTransaction;

  window.deleteBloodType = deleteBloodType;
  window.deleteHospital = deleteHospital;
  window.deleteDonor = deleteDonor;
  window.deleteRecipient = deleteRecipient;
  window.deleteDonorTransaction = deleteDonorTransaction;
  window.deleteRecipientTransaction = deleteRecipientTransaction;
}); // DOMContentLoaded end

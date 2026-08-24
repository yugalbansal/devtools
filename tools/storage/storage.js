/* Storage Manager — localStorage / sessionStorage CRUD */

import { qs, qsa, on, escHtml } from '../../utils/dom.js';
import { truncate } from '../../utils/format.js';
import { showToast } from '../../utils/toast.js';

let storageKind = 'local';

export function initStorage() {
  const entriesEl = qs('#storage-entries');

  qsa('.storage-tab').forEach(tab => {
    on(tab, 'click', () => {
      qsa('.storage-tab').forEach(t => t.setAttribute('aria-selected', 'false'));
      tab.setAttribute('aria-selected', 'true');
      storageKind = tab.dataset.storage;
      render();
    });
  });

  on(qs('#storage-add-btn'), 'click', addEntry);
  on(qs('#storage-clear-btn'), 'click', clearAll);
  on(qs('#storage-export-btn'), 'click', exportJson);

  // Edit / delete buttons are re-rendered each time — delegate
  on(entriesEl, 'click', e => {
    const editBtn = e.target.closest('[data-edit]');
    const delBtn = e.target.closest('[data-delete]');
    if (editBtn) openEditModal(editBtn.dataset.edit);
    if (delBtn) removeEntry(delBtn.dataset.delete);
  });

  function store() {
    return storageKind === 'local' ? window.localStorage : window.sessionStorage;
  }

  function render() {
    const s = store();
    const keys = Object.keys(s);

    qs('#storage-count').textContent =
      `${keys.length} ${keys.length === 1 ? 'entry' : 'entries'}`;

    if (!keys.length) {
      entriesEl.innerHTML =
        `<p class="empty-note">No entries in ${storageKind}Storage yet — add one above.</p>`;
      return;
    }

    entriesEl.innerHTML = keys.map(key => {
      const value = s.getItem(key);
      return `<div class="storage-entry">
        <span class="storage-key">${escHtml(key)}</span>
        <span class="storage-value" title="${escHtml(value)}">${escHtml(truncate(value))}</span>
        <span class="storage-actions">
          <button class="btn btn-sm" data-edit="${escHtml(key)}" aria-label="Edit ${escHtml(key)}">Edit</button>
          <button class="btn btn-sm btn-danger" data-delete="${escHtml(key)}" aria-label="Delete ${escHtml(key)}">Delete</button>
        </span>
      </div>`;
    }).join('');
  }

  function addEntry() {
    const keyInput = qs('#storage-new-key');
    const valueInput = qs('#storage-new-value');
    const key = keyInput.value.trim();
    if (!key) { showToast('Give the entry a key name', 'error'); return; }

    try {
      store().setItem(key, valueInput.value);
      keyInput.value = '';
      valueInput.value = '';
      render();
      showToast(`Saved to ${storageKind}Storage`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  function removeEntry(key) {
    store().removeItem(key);
    render();
    showToast('Entry deleted', 'success');
  }

  function openEditModal(key) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML =
      `<div class="modal" role="dialog" aria-label="Edit storage entry">
        <h3>Edit entry</h3>
        <div class="field-group">
          <label class="field-label">Key</label>
          <input class="input" value="${escHtml(key)}" disabled>
        </div>
        <div class="field-group">
          <label class="field-label">Value</label>
          <textarea id="modal-value">${escHtml(store().getItem(key))}</textarea>
        </div>
        <div class="modal-actions">
          <button class="btn" data-modal-cancel>Cancel</button>
          <button class="btn btn-primary" data-modal-save>Save</button>
        </div>
      </div>`;

    document.body.appendChild(overlay);
    qs('#modal-value', overlay).focus();

    on(qs('[data-modal-cancel]', overlay), 'click', () => overlay.remove());
    on(overlay, 'click', e => { if (e.target === overlay) overlay.remove(); });
    on(document, 'keydown', function escapeClose(e) {
      if (e.key !== 'Escape') return;
      overlay.remove();
      document.removeEventListener('keydown', escapeClose);
    });
    on(qs('[data-modal-save]', overlay), 'click', () => {
      try {
        store().setItem(key, qs('#modal-value', overlay).value);
        overlay.remove();
        render();
        showToast('Entry updated', 'success');
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  function clearAll() {
    if (!confirm(`Clear every ${storageKind}Storage entry? This cannot be undone.`)) return;
    store().clear();
    render();
    showToast('Storage cleared', 'success');
  }

  function exportJson() {
    const s = store();
    const data = {};
    for (const key of Object.keys(s)) data[key] = s.getItem(key);

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${storageKind}-export.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    showToast('Exported as JSON download', 'success');
  }

  render();

  return { run: addEntry };
}

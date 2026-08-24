/* Hash Generator — Web Crypto digest + compare */

import { qs, on, escHtml, copyToClipboard } from '../../utils/dom.js';
import { ALGORITHMS, hashText } from '../../utils/crypto.js';
import { showToast } from '../../utils/toast.js';

let lastHashes = {};

export function initHash() {
  const input = qs('#hash-input');
  const output = qs('#hash-output');
  const compareInput = qs('#hash-compare-input');

  on(qs('#hash-generate-btn'), 'click', generate);
  on(qs('#hash-clear-btn'), 'click', clear);
  on(qs('#hash-compare-btn'), 'click', compare);
  on(compareInput, 'keydown', e => { if (e.key === 'Enter') compare(); });

  async function generate() {
    const text = input.value;
    if (!text) { showToast('Enter some text to hash first', 'error'); return; }

    const btn = qs('#hash-generate-btn');
    btn.dataset.state = 'loading';

    lastHashes = {};
    const rows = [];

    for (const algo of ALGORITHMS) {
      try {
        const hex = await hashText(text, algo);
        lastHashes[algo] = hex;
        rows.push(
          `<div class="hash-row">
            <span class="hash-algo">${algo}</span>
            <span class="hash-value">${hex}</span>
            <button class="btn btn-sm btn-icon" data-copy="${hex}" aria-label="Copy ${algo} hash" title="Copy">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </button>
          </div>`);
      } catch (err) {
        rows.push(
          `<div class="hash-row">
            <span class="hash-algo">${algo}</span>
            <span class="hash-value hash-error">Error: ${escHtml(err.message)}</span>
          </div>`);
      }
    }

    qs('#hash-results').innerHTML = rows.join('');
    output.hidden = false;
    qs('#hash-compare-result').hidden = true;
    delete btn.dataset.state;
    showToast('Hashes generated', 'success');
  }

  function compare() {
    const candidate = compareInput.value.trim().toLowerCase();
    if (!candidate) { showToast('Paste a hash to compare against', 'error'); return; }

    const resultEl = qs('#hash-compare-result');
    let matchedAlgo = null;
    for (const [algo, hex] of Object.entries(lastHashes)) {
      if (hex.toLowerCase() === candidate) { matchedAlgo = algo; break; }
    }

    resultEl.innerHTML = matchedAlgo
      ? `<span class="badge badge-success">Match — ${matchedAlgo}</span>`
      : '<span class="badge badge-danger">No match</span>' +
        '<span class="status-note">does not equal any generated hash</span>';
    resultEl.hidden = false;
    showToast(matchedAlgo ? `Matches ${matchedAlgo}` : 'No match found', matchedAlgo ? 'success' : 'error');
  }

  function clear() {
    input.value = '';
    compareInput.value = '';
    output.hidden = true;
    lastHashes = {};
  }

  // Copy buttons are created dynamically — delegate on the results container
  on(qs('#hash-results'), 'click', e => {
    const btn = e.target.closest('[data-copy]');
    if (!btn) return;
    copyToClipboard(btn.dataset.copy)
      .then(() => showToast('Copied to clipboard', 'success'))
      .catch(() => showToast('Copy blocked — select the text manually', 'error'));
  });

  return { run: generate };
}

/* JSON Diff — recursive compare + unified output */

import { qs, on, escHtml } from '../../utils/dom.js';
import { prettyJson } from '../../utils/format.js';
import { showToast } from '../../utils/toast.js';

export function initDiff() {
  const left = qs('#json-left');
  const right = qs('#json-right');
  const errorBox = qs('#diff-error');
  const result = qs('#diff-result');

  on(qs('#diff-compare-btn'), 'click', run);
  on(qs('#diff-sample-btn'), 'click', loadSample);
  on(qs('#diff-clear-btn'), 'click', clear);
  on(qs('#diff-swap-btn'), 'click', swap);

  function parseSide(textarea, label) {
    try {
      return JSON.parse(textarea.value);
    } catch (err) {
      textarea.classList.add('is-invalid');
      showError(`${label} JSON: ${err.message}`);
      return undefined;
    }
  }

  function run() {
    errorBox.hidden = true;
    result.hidden = true;
    left.classList.remove('is-invalid');
    right.classList.remove('is-invalid');

    if (!left.value.trim() || !right.value.trim()) {
      showError('Paste JSON into both panels — or press "Load Sample".');
      return;
    }

    const a = parseSide(left, 'Left');
    if (a === undefined) return;
    const b = parseSide(right, 'Right');
    if (b === undefined) return;

    const diffs = computeDiff(a, b, '');
    render(diffs);
  }

  function computeDiff(a, b, path) {
    const rows = [];

    if (typeof a !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
      rows.push(change('modified', path, a, b));
      return rows;
    }
    if (a === null && b === null) return rows;
    if (a === b) {
      if (path) rows.push({ type: 'unchanged', path, value: prettyJson(a) });
      return rows;
    }

    const bothObjects = typeof a === 'object' && a !== null &&
                        typeof b === 'object' && b !== null;

    if (!bothObjects) {
      rows.push(change('modified', path, a, b));
      return rows;
    }

    if (Array.isArray(a)) {
      const max = Math.max(a.length, b.length);
      for (let i = 0; i < max; i++) {
        const p = `${path}[${i}]`;
        if (i >= a.length)      rows.push({ type: 'added',   path: p, value: prettyJson(b[i]) });
        else if (i >= b.length) rows.push({ type: 'removed', path: p, value: prettyJson(a[i]) });
        else                    rows.push(...computeDiff(a[i], b[i], p));
      }
      return rows;
    }

    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const key of keys) {
      const p = path ? `${path}.${key}` : key;
      if (!(key in a))      rows.push({ type: 'added',   path: p, value: prettyJson(b[key]) });
      else if (!(key in b)) rows.push({ type: 'removed', path: p, value: prettyJson(a[key]) });
      else                  rows.push(...computeDiff(a[key], b[key], p));
    }
    return rows;
  }

  function change(type, path, a, b) {
    return { type, path: path || '(root)', value: `${prettyJson(a)} → ${prettyJson(b)}` };
  }

  function render(diffs) {
    const counts = { added: 0, removed: 0, modified: 0 };
    diffs.forEach(d => { if (counts[d.type] !== undefined) counts[d.type]++; });
    const total = counts.added + counts.removed + counts.modified;

    qs('#diff-stats').innerHTML =
      `<span class="badge badge-success">${counts.added} added</span>
       <span class="badge badge-danger">${counts.removed} removed</span>
       <span class="badge badge-warning">${counts.modified} modified</span>`;

    qs('#diff-output').innerHTML = total
      ? diffs.map(d => {
          const prefix = { added: '+', removed: '-', modified: '~' }[d.type] || ' ';
          return `<span class="diff-line ${d.type}">${escHtml(`${prefix} ${d.path}: ${d.value}`)}</span>`;
        }).join('')
      : '<span class="diff-line unchanged">Both sides are identical. 🎉</span>';

    result.hidden = false;
    showToast(total ? `${total} difference${total > 1 ? 's' : ''} found` : 'Identical JSON', total ? 'info' : 'success');
  }

  function showError(message) {
    qs('#diff-error-text').textContent = message;
    errorBox.hidden = false;
    showToast('Invalid input', 'error');
  }

  function loadSample() {
    left.value = prettyJson({
      name: 'DevTools', version: '1.0.0',
      author: { name: 'Sam Student', email: 'sam@university.edu' },
      features: ['jwt', 'hash', 'storage'],
      license: 'MIT'
    });
    right.value = prettyJson({
      name: 'DevTools', version: '2.0.0',
      author: { name: 'Sam Student', email: 'sam@newuni.edu', url: 'https://sam.dev' },
      features: ['jwt', 'hash', 'storage', 'diff'],
      repository: 'https://github.com/sam/devtools'
    });
    run();
  }

  function clear() {
    left.value = '';
    right.value = '';
    errorBox.hidden = true;
    result.hidden = true;
  }

  function swap() {
    [left.value, right.value] = [right.value, left.value];
  }

  return { run };
}

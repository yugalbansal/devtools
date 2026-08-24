/* JWT Inspector — decode, explain, status */

import { qs, qsa, on, escHtml } from '../../utils/dom.js';
import { base64UrlDecode, base64UrlEncode } from '../../utils/crypto.js';
import { formatTimestamp, relativeTime } from '../../utils/format.js';
import { showToast } from '../../utils/toast.js';

const KNOWN_CLAIMS = ['iss', 'sub', 'aud', 'exp', 'nbf', 'iat', 'jti',
  'name', 'email', 'role', 'scope', 'permissions'];
const TIME_CLAIMS = ['iat', 'exp', 'nbf'];

export function initJwt() {
  const input = qs('#jwt-input');
  const errorBox = qs('#jwt-error');
  const output = qs('#jwt-output');

  on(qs('#jwt-decode-btn'), 'click', decode);
  on(qs('#jwt-sample-btn'), 'click', loadSample);
  on(qs('#jwt-clear-btn'), 'click', clear);

  function clearError() {
    errorBox.hidden = true;
    input.classList.remove('is-invalid');
  }

  function showError(message) {
    qs('#jwt-error-text').textContent = message;
    errorBox.hidden = false;
    input.classList.add('is-invalid');
    showToast('Could not decode that token', 'error');
  }

  function decode() {
    clearError();
    output.hidden = true;

    const token = input.value.trim();
    if (!token) { showError('Paste a JWT first — try "Load Sample" if you do not have one.'); return; }

    const parts = token.split('.');
    if (parts.length !== 3) {
      showError('A JWT needs exactly 3 dot-separated parts (header.payload.signature). This one has ' + parts.length + '.');
      return;
    }

    let header, payload;
    try { header = JSON.parse(base64UrlDecode(parts[0])); }
    catch { showError('The header (part 1) is not valid base64url JSON.'); return; }
    try { payload = JSON.parse(base64UrlDecode(parts[1])); }
    catch { showError('The payload (part 2) is not valid base64url JSON.'); return; }

    renderRaw(parts);
    renderParts(header, payload, parts[2]);
    renderStatus(payload);
    renderTimeClaims(payload);
    renderAllClaims(payload);

    output.hidden = false;
    showToast('Token decoded', 'success');
  }

  function renderRaw(parts) {
    qs('#jwt-raw').innerHTML =
      `<span class="seg seg-header">${escHtml(parts[0])}</span>` +
      '<span class="seg-dot">.</span>' +
      `<span class="seg seg-payload">${escHtml(parts[1])}</span>` +
      '<span class="seg-dot">.</span>' +
      `<span class="seg seg-signature">${escHtml(parts[2])}</span>`;
  }

  function renderParts(header, payload, signature) {
    qs('#jwt-header-decoded').textContent = JSON.stringify(header, null, 2);
    qs('#jwt-payload-decoded').textContent = JSON.stringify(payload, null, 2);
    qs('#jwt-signature-info').innerHTML =
      `alg: ${escHtml(header.alg || 'unknown')}\n` +
      `length: ${signature.length} chars\n\n` +
      'The signature proves the token was not tampered with.\n' +
      'Verifying it requires the secret key — which is never inside the token.';
  }

  function renderStatus(payload) {
    const badgeEl = qs('#jwt-status-badge');
    const now = Math.floor(Date.now() / 1000);

    if (!payload.exp) {
      badgeEl.innerHTML = '<span class="badge badge-neutral">No expiry claim</span>';
      return;
    }
    if (now > payload.exp) {
      badgeEl.innerHTML =
        '<span class="badge badge-danger">Expired</span>' +
        `<span class="status-note">${relativeTime(payload.exp)}</span>`;
    } else {
      badgeEl.innerHTML =
        '<span class="badge badge-success">Valid</span>' +
        `<span class="status-note">expires ${relativeTime(payload.exp)}</span>`;
    }
  }

  function renderTimeClaims(payload) {
    const wrap = qs('#jwt-time-claims');
    const rows = TIME_CLAIMS
      .filter(name => payload[name] !== undefined)
      .map(name => {
        const value = payload[name];
        let extra = '';
        if (name === 'exp') {
          extra = Date.now() / 1000 > value
            ? ' <span class="badge badge-danger">expired</span>'
            : ' <span class="badge badge-success">live</span>';
        }
        return `<div class="claim-row">
          <span class="claim-key">${name}</span>
          <span class="claim-val">${value}</span>
          <span class="claim-human">${escHtml(formatTimestamp(value))} · ${escHtml(relativeTime(value))}${extra}</span>
        </div>`;
      });

    wrap.innerHTML = rows.length
      ? rows.join('')
      : '<p class="empty-note">No time claims (iat / exp / nbf) in this token.</p>';
  }

  function renderAllClaims(payload) {
    const wrap = qs('#jwt-all-claims');
    wrap.innerHTML = Object.entries(payload).map(([key, value]) => {
      const known = KNOWN_CLAIMS.includes(key);
      const display = typeof value === 'object' ? JSON.stringify(value) : String(value);
      return `<div class="claim-row">
        <span class="claim-key ${known ? '' : 'claim-custom'}" title="${known ? 'Standard claim' : 'Custom claim'}">${escHtml(key)}</span>
        <span class="claim-val">${escHtml(display)}</span>
        ${known ? '' : '<span class="badge badge-info">custom</span>'}
      </div>`;
    }).join('');
  }

  function loadSample() {
    const now = Math.floor(Date.now() / 1000);
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = {
      sub: 'student-42',
      name: 'Sam Student',
      email: 'sam@university.edu',
      role: 'student',
      permissions: ['read:grades', 'write:homework'],
      iss: 'devtools-campus-auth',
      aud: 'devtools-campus-api',
      iat: now - 3600,
      exp: now + 86400,
      jti: 'a1b2c3d4-e5f6'
    };
    input.value = [
      base64UrlEncode(JSON.stringify(header)),
      base64UrlEncode(JSON.stringify(payload)),
      base64UrlEncode('demo-signature-not-verifiable')
    ].join('.');
    clearError();
    decode();
  }

  function clear() {
    input.value = '';
    clearError();
    output.hidden = true;
  }

  return { run: decode };
}

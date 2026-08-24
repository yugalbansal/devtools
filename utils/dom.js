/* Tiny DOM helpers — keep tool code short and readable */

export function qs(selector, root = document) {
  return root.querySelector(selector);
}

export function qsa(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

export function on(target, event, handler, options) {
  target.addEventListener(event, handler, options);
}

export function escHtml(value) {
  const el = document.createElement('div');
  el.textContent = String(value);
  return el.innerHTML;
}

export function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }
  // Fallback for insecure contexts (e.g. http:// on a LAN IP)
  return new Promise((resolve, reject) => {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      ok ? resolve() : reject(new Error('copy blocked by browser'));
    } catch (err) {
      reject(err);
    }
  });
}

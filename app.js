/* App bootstrap — tab routing + tool init */

import { initJwt } from './tools/jwt/jwt.js';
import { initHash } from './tools/hash/hash.js';
import { initStorage } from './tools/storage/storage.js';
import { initDiff } from './tools/diff/diff.js';
import { qs, qsa, on } from './utils/dom.js';

const tools = {
  jwt: initJwt(),
  hash: initHash(),
  storage: initStorage(),
  jsondiff: initDiff()
};

function activate(tabBtn) {
  qsa('.tab-btn').forEach(btn => btn.setAttribute('aria-selected', 'false'));
  tabBtn.setAttribute('aria-selected', 'true');

  qsa('.panel').forEach(panel => panel.classList.remove('active'));
  document.getElementById(`panel-${tabBtn.dataset.tab}`).classList.add('active');
}

qsa('.tab-btn').forEach(btn => on(btn, 'click', () => activate(btn)));

// Keyboard: arrow keys move between tabs, Ctrl/Cmd+Enter runs the active tool
on(document.querySelector('.tab-bar'), 'keydown', e => {
  if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
  const tabs = qsa('.tab-btn');
  const index = tabs.indexOf(document.activeElement);
  if (index === -1) return;
  const next = (index + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
  tabs[next].focus();
  activate(tabs[next]);
});

on(document, 'keydown', e => {
  if (!(e.ctrlKey || e.metaKey) || e.key !== 'Enter') return;
  const activeTab = document.querySelector('.tab-btn[aria-selected="true"]');
  const tool = tools[activeTab.dataset.tab];
  if (tool && tool.run) tool.run();
});

// Deep links from the landing page: index.html#hash opens the Hash tab, etc.
const deepLink = location.hash.slice(1);
if (tools[deepLink]) {
  const target = qs(`.tab-btn[data-tab="${deepLink}"]`);
  if (target) target.click();
}

// Same frosted-glass nav behaviour as the landing page
const siteNav = document.getElementById('site-nav');
on(document, 'scroll', () => siteNav.classList.toggle('scrolled', scrollY > 24), { passive: true });

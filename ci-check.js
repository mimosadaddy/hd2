#!/usr/bin/env node
// ci-check.js — used by GitHub Actions to detect new completed Major Orders
// Reads .github/last_dispatch_id for state, modifies index.html if new order found.
// Exit 0 = changes made (create PR) | Exit 1 = nothing new

const fs   = require('fs');
const path = require('path');

const API        = 'https://api.helldivers2.dev/api/v1';
const HEADERS    = { 'X-Super-Client': 'hd2-major-orders-dashboard', 'X-Super-Contact': 'dxnilosierra' };
const STATE_FILE = path.join(__dirname, '.github', 'last_dispatch_id');
const INDEX_FILE = path.join(__dirname, 'index.html');

async function get(p) {
  const res = await fetch(`${API}${p}`, { headers: HEADERS });
  if (!res.ok) throw new Error(`${res.status} — ${p}`);
  return res.json();
}

function stripTags(text) {
  return text.replace(/<i=\d+>(.*?)<\/i>/gs, '$1').replace(/\n+/g, ' ').trim();
}

function detectEnemy(text) {
  const t = text.toLowerCase();
  const ill  = ['illuminate','void','great host','appropriator','squid'].some(k => t.includes(k));
  const term = ['terminid','hive','bile'].some(k => t.includes(k));
  const auto = ['automaton','cyborg','megafactory'].some(k => t.includes(k));
  const n    = [ill, term, auto].filter(Boolean).length;
  if (n > 1) return 'Multi';
  if (ill)  return 'Illuminate';
  if (term) return 'Terminid';
  if (auto) return 'Automaton';
  return 'Multi';
}

function detectResult(text) {
  const t = text.toLowerCase();
  if (['failed','failure','unsuccessful'].some(k => t.includes(k))) return 'loss';
  return 'win';
}

function formatDate(iso) {
  const d = new Date(iso);
  const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getUTCMonth()];
  return `${m} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

function getLastOrderNumber(html) {
  const matches = [...html.matchAll(/\{ n:(\d+),/g)];
  if (!matches.length) return 31;
  return Math.max(...matches.map(m => parseInt(m[1])));
}

function setOutput(key, value) {
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
  }
}

async function main() {
  const dispatches = await get('/dispatches');
  const latestId   = dispatches[0]?.id ?? 0;

  // First run — just initialise state, no PR
  if (!fs.existsSync(STATE_FILE)) {
    fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
    fs.writeFileSync(STATE_FILE, String(latestId));
    console.log(`First run — state initialised at dispatch #${latestId}. No PR needed.`);
    setOutput('changes', 'false');
    process.exit(1);
  }

  const lastId      = parseInt(fs.readFileSync(STATE_FILE, 'utf8').trim()) || 0;
  const newDispatch = dispatches.filter(d => d.id > lastId);

  if (!newDispatch.length) {
    console.log('No new dispatches since last run.');
    setOutput('changes', 'false');
    process.exit(1);
  }

  // Look for completion dispatches in new batch
  const COMPLETE   = ['major order won','major order failed','strategic opportunity seized','order failed','order won'];
  const NEW_ORDERS = ['new major order','new strategic opportunity'];

  const completed = newDispatch.filter(d =>
    COMPLETE.some(k => d.message.toLowerCase().includes(k))
  );

  if (!completed.length) {
    fs.writeFileSync(STATE_FILE, String(latestId));
    console.log('New dispatches found, but no completed orders yet.');
    setOutput('changes', 'false');
    process.exit(1);
  }

  // Use the most recent completion
  const latest   = completed[0];
  const preceding = dispatches.find(d =>
    d.id < latest.id && NEW_ORDERS.some(k => d.message.toLowerCase().includes(k))
  );

  const sourceText = preceding ? stripTags(preceding.message) : stripTags(latest.message);
  const enemy      = detectEnemy((latest.message) + (preceding?.message ?? ''));
  const result     = detectResult(latest.message);
  const date       = formatDate(latest.published);
  const year       = new Date(latest.published).getUTCFullYear();
  const note       = stripTags(latest.message).replace(/"/g, '\\"').slice(0, 150);
  const rawName    = sourceText
    .replace(/^(NEW MAJOR ORDER|NEW STRATEGIC OPPORTUNITY|MAJOR ORDER WON|MAJOR ORDER FAILED|STRATEGIC OPPORTUNITY SEIZED)\s*/i, '')
    .replace(/"/g, '\\"')
    .slice(0, 120);

  const html  = fs.readFileSync(INDEX_FILE, 'utf8');
  const nextN = getLastOrderNumber(html) + 1;

  const newEntry =
    `  { n:${nextN}, year:${year}, date:"${date}", ` +
    `name:"EDIT THIS — ${rawName}", ` +
    `enemy:"${enemy}", result:"${result}", ` +
    `note:"${note}", ` +
    `src:"https://helldivers.wiki.gg/wiki/Major_Orders_of_${year}" },`;

  // Insert before the closing ]; of the orders array
  if (!html.includes('];\n\nconst RESULT_BADGE')) {
    console.error('Could not find insertion point in index.html');
    process.exit(1);
  }

  const updated = html.replace(
    '];\n\nconst RESULT_BADGE',
    `\n${newEntry}\n];\n\nconst RESULT_BADGE`
  );

  fs.writeFileSync(INDEX_FILE, updated);
  fs.writeFileSync(STATE_FILE, String(latestId));

  console.log(`✅  Inserted MO #${nextN} — ${date} — ${enemy} — ${result}`);
  setOutput('changes', 'true');
  setOutput('order_number', String(nextN));
  setOutput('order_date', date);
  process.exit(0);
}

main().catch(e => {
  console.error('Error:', e.message);
  setOutput('changes', 'false');
  process.exit(1);
});

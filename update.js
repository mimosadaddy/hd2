#!/usr/bin/env node
// HD2 Major Orders — Update Helper
// Run: node update.js
// Fetches latest dispatches from the Helldivers 2 API and generates
// a pre-filled entry ready to paste into the orders array in index.html.

const API     = 'https://api.helldivers2.dev/api/v1';
const HEADERS = {
  'X-Super-Client':  'hd2-major-orders-dashboard',
  'X-Super-Contact': 'dxnilosierra'
};

async function get(path) {
  const res = await fetch(`${API}${path}`, { headers: HEADERS });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${path}`);
  return res.json();
}

// Strip in-game formatting tags: <i=1>text</i> → text
function stripTags(text) {
  return text
    .replace(/<i=\d+>(.*?)<\/i>/gs, '$1')
    .replace(/\n+/g, ' ')
    .trim();
}

function detectEnemy(text) {
  const t = text.toLowerCase();
  const ill  = t.includes('illuminate') || t.includes('void') || t.includes('great host') || t.includes('appropriator') || t.includes('squid');
  const term = t.includes('terminid') || t.includes('hive') || t.includes('bile') || t.includes('bug');
  const auto = t.includes('automaton') || t.includes('cyborg') || t.includes('megafactory') || t.includes('bot ') || t.includes('bots');
  const count = [ill, term, auto].filter(Boolean).length;
  if (count > 1) return 'Multi';
  if (ill)  return 'Illuminate';
  if (term) return 'Terminid';
  if (auto) return 'Automaton';
  return 'Multi';
}

function detectResult(text) {
  const t = text.toLowerCase();
  if (t.includes('failed') || t.includes('failure') || t.includes('unsuccessful')) return 'loss';
  if (t.includes('won') || t.includes('seized') || t.includes('liberated') || t.includes('success') || t.includes('victory') || t.includes('secured')) return 'win';
  return 'win';
}

function formatDate(iso) {
  const d = new Date(iso);
  const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getUTCMonth()];
  return `${m} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

function hr(char = '─', len = 60) { return char.repeat(len); }

async function main() {
  console.log(`\n🪖  HD2 Major Orders — Update Helper`);
  console.log(hr() + '\n');

  const [dispatches, assignments] = await Promise.all([
    get('/dispatches'),
    get('/assignments').catch(() => [])
  ]);

  // ── Current active order ───────────────────────────────────────
  if (assignments.length) {
    const o = assignments[0];
    const exp = new Date(o.expiration);
    const diff = exp - Date.now();
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    console.log('CURRENT ACTIVE ORDER');
    console.log(hr('-'));
    console.log(`Briefing : ${o.briefing}`);
    console.log(`Expires  : ${exp.toUTCString()} (${d}d ${h}h remaining)`);
    console.log(`Reward   : ${o.reward?.amount ?? '?'} medals\n`);
  }

  // ── Find completed order dispatches ───────────────────────────
  const COMPLETE = ['major order won','major order failed','strategic opportunity seized','order failed','order won'];
  const NEW_ORDER = ['new major order','new strategic opportunity'];

  const completed = dispatches.filter(d =>
    COMPLETE.some(k => d.message.toLowerCase().includes(k))
  ).slice(0, 3);

  const newOrders = dispatches.filter(d =>
    NEW_ORDER.some(k => d.message.toLowerCase().includes(k))
  ).slice(0, 3);

  if (!completed.length) {
    console.log('No recently completed orders found in dispatch log.\n');
    process.exit(0);
  }

  // ── Show recent completions ────────────────────────────────────
  console.log('RECENTLY COMPLETED (from dispatch log)');
  console.log(hr('-'));
  completed.forEach((d, i) => {
    const clean = stripTags(d.message);
    console.log(`[${i+1}] ${formatDate(d.published)}`);
    console.log(`    ${clean.slice(0, 140)}${clean.length > 140 ? '…' : ''}`);
    console.log(`    → Detected: enemy="${detectEnemy(d.message)}", result="${detectResult(d.message)}"\n`);
  });

  // ── Generate entry for most recent completion ──────────────────
  const latest     = completed[0];
  const preceding  = newOrders.find(d => new Date(d.published) < new Date(latest.published));
  const sourceText = preceding ? stripTags(preceding.message) : stripTags(latest.message);
  const enemy      = detectEnemy(latest.message + (preceding?.message ?? ''));
  const result     = detectResult(latest.message);
  const date       = formatDate(latest.published);
  const year       = new Date(latest.published).getUTCFullYear();
  const note       = stripTags(latest.message).replace(/"/g, '\\"').slice(0, 120);
  const nameSrc    = sourceText.replace(/"/g, '\\"').slice(0, 120);

  console.log(hr());
  console.log('GENERATED ENTRY — copy into the orders array in index.html');
  console.log(hr());
  console.log(`
  { n:??, year:${year}, date:"${date}",
    name:"${nameSrc}",
    enemy:"${enemy}", result:"${result}",
    note:"${note}",
    src:"https://helldivers.wiki.gg/wiki/Major_Orders_of_${year}" },
`);
  console.log(hr());
  console.log('NEXT STEPS');
  console.log(hr('-'));
  console.log('1. Replace n:?? with the next order number');
  console.log('2. Edit "name" to be a clean short objective description');
  console.log('3. Verify enemy & result are correct');
  console.log('4. Paste the entry at the end of the orders array in index.html');
  console.log('5. Run: git add index.html && git commit -m "Add MO #??" && git push\n');
}

main().catch(err => {
  console.error('\n❌  Error:', err.message);
  process.exit(1);
});

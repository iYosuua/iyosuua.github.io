// Minimal Jekyll-like renderer for local preview only.
// Renders index.html using liquidjs + js-yaml, applying the default layout.
// Produces _site/ that can be served with `npx http-server _site`.
//
// NOTE: This is *not* full Jekyll — it covers exactly the Liquid features
// this site uses (front-matter, layout, includes, data, capture, for,
// `relative_url` filter, `{% seo %}` tag stub).

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { Liquid } = require('liquidjs');

const ROOT = __dirname.replace(/_tools$/, '').replace(/\\$/, '');
const SITE_OUT = path.join(ROOT, '_site');

function readFile(p) { return fs.readFileSync(p, 'utf8'); }
function writeFile(p, c) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, c);
}

function copyDir(src, dst) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function parseFrontMatter(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { data: {}, body: src };
  return {
    data: yaml.load(m[1]) || {},
    body: src.slice(m[0].length),
  };
}

const config = yaml.load(readFile(path.join(ROOT, '_config.yml'))) || {};
const dataDir = path.join(ROOT, '_data');
const data = {};
if (fs.existsSync(dataDir)) {
  for (const f of fs.readdirSync(dataDir)) {
    if (f.endsWith('.yml') || f.endsWith('.yaml')) {
      data[f.replace(/\.ya?ml$/, '')] = yaml.load(readFile(path.join(dataDir, f)));
    }
  }
}

const engine = new Liquid({
  root: [path.join(ROOT, '_includes'), path.join(ROOT, '_layouts'), ROOT],
  extname: '.html',
  jekyllInclude: true,
  dynamicPartials: false,
});

engine.registerFilter('relative_url', v => (v || '').replace(/^\/?/, ''));
engine.registerFilter('absolute_url', v => (v || '').replace(/^\/?/, ''));

engine.registerTag('seo', {
  parse() {},
  render() { return '<!-- seo (stub) -->'; },
});

const site = { ...config, data };

async function renderPage(srcRel) {
  const srcPath = path.join(ROOT, srcRel);
  const raw = readFile(srcPath);
  const { data: front, body } = parseFrontMatter(raw);

  const ctx = { site, page: { ...front, url: '/' + srcRel.replace(/index\.html$/, '') } };
  const inner = await engine.parseAndRender(body, ctx);

  let final = inner;
  if (front.layout) {
    const layoutPath = path.join(ROOT, '_layouts', front.layout + '.html');
    const layoutSrc = parseFrontMatter(readFile(layoutPath)).body;
    final = await engine.parseAndRender(layoutSrc, { ...ctx, content: inner });
  }

  const outPath = path.join(SITE_OUT, srcRel);
  writeFile(outPath, final);
  console.log('rendered', srcRel);
}

(async () => {
  fs.rmSync(SITE_OUT, { recursive: true, force: true });
  await renderPage('index.html');
  copyDir(path.join(ROOT, 'assets'), path.join(SITE_OUT, 'assets'));
  console.log('\n_site/ ready. Serve with: npx http-server _site -p 4000');
})().catch(e => { console.error(e); process.exit(1); });

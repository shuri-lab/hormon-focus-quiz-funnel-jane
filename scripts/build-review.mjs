/* Builds the review copy of the funnel into dist-review/.
 *
 *   npm run build:review
 *
 * The result is one page (review.html) plus its files, made to be shared as a
 * single hosted page rather than served from a domain:
 *
 *  - VITE_REVIEW=1 turns on the review bar, in-memory routing and the stub
 *    that stops anything being sent to Klaviyo (see src/review/review.ts).
 *  - Every asset path is relative, because the page will not sit at the root
 *    of a host. Vite handles its own files; the image paths written as plain
 *    strings in the source ("/img/…") are rewritten here.
 *  - review.html carries no tag manager and no document wrapper: the host
 *    that shares it adds its own.
 */
import { execSync } from 'node:child_process';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT = 'dist-review';

execSync(`npx vite build --base ./ --outDir ${OUT} --emptyOutDir`, {
  stdio: 'inherit',
  env: { ...process.env, VITE_REVIEW: '1' },
});

const assets = join(OUT, 'assets');
const files = readdirSync(assets);

/* "/img/x.jpg" in a string becomes "img/x.jpg", relative to the page. */
let rewritten = 0;
for (const f of files.filter((n) => n.endsWith('.js'))) {
  const p = join(assets, f);
  const src = readFileSync(p, 'utf8');
  const out = src.replace(/(["'`])\/img\//g, (_, q) => { rewritten += 1; return `${q}img/`; });
  if (out !== src) writeFileSync(p, out);
}

/* In a stylesheet the same path is relative to the stylesheet's own folder. */
for (const f of files.filter((n) => n.endsWith('.css'))) {
  const p = join(assets, f);
  const src = readFileSync(p, 'utf8');
  const out = src.replace(/url\((["']?)\/img\//g, (_, q) => { rewritten += 1; return `url(${q}../img/`; });
  if (out !== src) writeFileSync(p, out);
}

/* The entry script and stylesheet, as Vite named them. */
const built = readFileSync(join(OUT, 'index.html'), 'utf8');
const entry = built.match(/<script type="module"[^>]*src="\.\/(assets\/[^"]+\.js)"/)?.[1];
const styles = [...built.matchAll(/<link rel="stylesheet"[^>]*href="\.\/(assets\/[^"]+\.css)"/g)].map((m) => m[1]);
if (!entry || !styles.length) throw new Error('could not find the built entry files in index.html');

const page = `<title>Hormone Check Quiz Review</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Lora:ital,wght@0,400;0,500;0,600;1,400&display=swap">
${styles.map((s) => `<link rel="stylesheet" href="${s}">`).join('\n')}
<style>
  /* One look, on purpose: the quiz is a light page in its own brand colours. */
  body { background: #FBF8FE; color: #241F2E; }
</style>
<div id="root"></div>
<script type="module" src="${entry}"></script>
`;
writeFileSync(join(OUT, 'review.html'), page);

console.log(`review build ready in ${OUT}/ (${rewritten} image paths made relative)`);
console.log(`  page:   ${OUT}/review.html`);
console.log(`  entry:  ${entry}`);
console.log(`  styles: ${styles.join(', ')}`);

// content/*.js(ふつうの日本語で書いた問題)に、ふりがな {漢字|かな} をつけて
// src/generators/<名前>/part1.js に書き出す。
//   node tools/rika/annotate.js            → すべて
//   node tools/rika/annotate.js e3 c1      → 指定したファイルだけ
// 読みのまちがいは tools/rika/yomi.txt(1行に「ことば=かきかた」)で直す。
// 例: 日かげ={日|ひ}かげ   上皿={上皿|うわざら}
// 書き出したあと、tools/rika/yomi-report.txt に「ことば→よみ」の一覧を出す(目で確かめる用)。
const fs = require('fs'), path = require('path');
const kuromoji = require('kuromoji');
const root = path.resolve(__dirname, '..', '..');
const kata2hira = (s) => s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
const hasKanji = (s) => /[一-鿿々〆]/.test(s);
const isKana = (c) => /[ぁ-ゖァ-ヶー]/.test(c);

function loadYomi() {
  const f = path.join(__dirname, 'yomi.txt');
  const out = [];
  for (const line of fs.readFileSync(f, 'utf8').split('\n')) {
    const l = line.trim();
    if (!l || l.startsWith('#')) continue;
    const i = l.indexOf('=');
    out.push([l.slice(0, i), l.slice(i + 1)]);
  }
  return out.sort((a, b) => b[0].length - a[0].length);
}

// 漢字まじりのことばと読みを、送りがなでそろえて {漢字|よみ} にする
function align(surface, reading) {
  const r = kata2hira(reading);
  // surface を 漢字のかたまり と かな に分ける
  const parts = surface.match(/[一-鿿々〆]+|[^一-鿿々〆]+/g);
  const re = new RegExp('^' + parts.map((p) => hasKanji(p) ? '(.+?)' : '(' + kata2hira(p).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')').join('') + '$');
  const m = re.exec(r);
  if (!m) return null;
  return parts.map((p, i) => hasKanji(p) ? `{${p}|${m[i + 1]}}` : p).join('');
}

const report = new Map(), problems = new Set();
function annotateRun(run, tk, yomi) {
  if (!hasKanji(run)) return run;
  // 先に yomi.txt のことばをおきかえる
  const pieces = [[run, false]];
  for (const [k, v] of yomi) {
    for (let i = 0; i < pieces.length; i++) {
      const [s, done] = pieces[i];
      if (done || !s.includes(k)) continue;
      const seg = s.split(k), rep = [];
      seg.forEach((x, j) => { if (x) rep.push([x, false]); if (j < seg.length - 1) rep.push([v, true]); });
      pieces.splice(i, 1, ...rep);
      i += rep.length - 1;
    }
  }
  return pieces.map(([s, done]) => {
    if (done) { report.set(s, 'yomi'); return s; }
    if (!hasKanji(s)) return s;
    return tk.tokenize(s).map((t) => {
      const sf = t.surface_form;
      if (!hasKanji(sf)) return sf;
      if (!t.reading || t.reading === '*') { problems.add(sf); return sf; }
      const a = align(sf, t.reading);
      if (!a) { problems.add(`${sf}(${t.reading})`); return sf; }
      report.set(sf, kata2hira(t.reading));
      return a;
    }).join('');
  }).join('');
}

function annotateText(src, tk, yomi) {
  return src.split('\n').map((line) => {
    if (/^\s*\/\//.test(line)) return line;
    // すでに {漢字|かな} のところはそのまま
    return line.split(/(\{[^{}|]+\|[^{}]*\})/).map((seg, i) => i % 2 ? seg : seg.replace(/[ぁ-ゖァ-ヶー一-鿿々〆0-9０-９]+/g, (run) => annotateRun(run, tk, yomi))).join('');
  }).join('\n');
}

kuromoji.builder({ dicPath: path.join(root, 'node_modules/kuromoji/dict') }).build((err, tk) => {
  if (err) throw err;
  const yomi = loadYomi();
  const only = process.argv.slice(2);
  const dir = path.join(root, 'content');
  for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.js')).sort()) {
    const name = f.replace(/\.js$/, '');
    if (only.length && !only.includes(name)) continue;
    let out = annotateText(fs.readFileSync(path.join(dir, f), 'utf8'), tk, yomi);
    // 「〜の間」「〜する間」の 間 は あいだ(すき間 は そのまま)
    out = out.replace(/(^|[^き])\{間\|ま\}/g, '$1{間|あいだ}');
    const od = path.join(root, 'src', 'generators', name);
    fs.mkdirSync(od, { recursive: true });
    fs.writeFileSync(path.join(od, 'part1.js'), `// このファイルは tools/rika/annotate.js が content/${f} から作ったもの。直すときは content/${f} を直して作りなおす。\n` + out);
    console.log('wrote', name);
  }
  const rep = [...report.entries()].sort((a, b) => a[0].localeCompare(b[0], 'ja')).map(([k, v]) => `${k}\t${v}`).join('\n');
  fs.writeFileSync(path.join(__dirname, 'yomi-report.txt'), rep + '\n');
  if (problems.size) console.log('読めなかったことば:', [...problems].join(' '));
});

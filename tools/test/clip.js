// 図の中の文字が図の外にはみ出していないか調べる(参考用)
// 使い方: node tools/test/clip.js [build/test.html] [フォント名]
const { chromium } = require((() => { try { return require.resolve('playwright'); } catch (e) { return require('child_process').execSync('npm root -g').toString().trim() + '/playwright'; } })());
(async () => {
  const [file = 'build/test.html', font] = process.argv.slice(2);
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: 1000, height: 1200 } });
  pg.on('pageerror', e => console.log('ERR', String(e)));
  await pg.emulateMedia({ media: 'print' });
  await pg.goto('file://' + require('path').resolve(file) + '?grade=1&unit=g1-01');
  if (font) await pg.addStyleTag({ content: `.sheet, .sheet * { font-family: "${font}" !important; }` });
  const res = await pg.evaluate(async () => {
    const T = window.__T, out = {};
    const pv = document.getElementById('preview');
    document.body.dataset.view = 'print';
    for (const gd of Object.values(T.GRADES)) for (const unit of gd.units) for (const topic of unit.topics) for (const level of ['basic', 'normal', 'challenge']) {
      const kind = topic.kinds.includes('yoji') ? 'yoji' : topic.kinds.find(k => k !== 'test');
      const one = { ...gd, units: [{ ...unit, topics: [{ ...topic, kinds: [kind] }] }] };
      let sheet;
      try { sheet = T.buildSheet({ gradeData: one, unitId: unit.id, kind, level, count: kind === 'drill' ? 10 : 3, seed: 11 }); } catch (e) { out[`${unit.id} ${topic.generator} ${level}`] = ['build: ' + e.message]; continue; }
      const policy = T.makeKanjiPolicy(T.kanji_default, gd.grade, {});
      pv.innerHTML = T.sheetHtml(sheet, { policy, withAnswers: true });
      T.paginate(pv);
      const probs = [];
      for (const svg of pv.querySelectorAll('svg')) {
        const vb = svg.viewBox.baseVal; if (!vb || !vb.width) continue;
        for (const t of svg.querySelectorAll('text')) {
          let bb; try { bb = t.getBBox(); } catch { continue; }
          if (bb.width === 0) continue;
          if (bb.x < vb.x - 0.4 || bb.y < vb.y - 0.4 || bb.x + bb.width > vb.x + vb.width + 0.4 || bb.y + bb.height > vb.y + vb.height + 0.4) probs.push('svgtext:' + t.textContent.slice(0, 12));
        }
      }
      for (const s of pv.querySelectorAll('article.sheet')) {
        const h1 = s.querySelector('.sheet-header h1'), nb = s.querySelector('.sheet-header .name-block');
        if (h1 && nb) { const a = h1.getBoundingClientRect(), c = nb.getBoundingClientRect(); const range = document.createRange(); range.selectNodeContents(h1); const tr = range.getBoundingClientRect(); if (tr.right > c.left + 1 && tr.bottom > c.top + 1 && tr.top < c.bottom) probs.push('title overlaps name'); }
        const body = s.querySelector('.body'), br = body.getBoundingClientRect();
        for (const e of body.querySelectorAll('.block-text, .item-body, table, svg')) { const r = e.getBoundingClientRect(); if (r.right > br.right + 2) { probs.push('hover:' + e.className?.baseVal ?? e.className); break; } }
      }
      if (probs.length) out[`${unit.id} ${topic.generator} ${level}`] = [...new Set(probs)].slice(0, 4);
    }
    return out;
  });
  const keys = Object.keys(res);
  console.log('problems in', keys.length, 'topic-levels');
  for (const k of keys.slice(0, 80)) console.log(k, JSON.stringify(res[k]));
  await b.close();
})();

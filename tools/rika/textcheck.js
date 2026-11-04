// 文が紙のはしで切れていないか(横にはみ出していないか)を調べる
// node tools/rika/textcheck.js build/test.html 1,2,21,22,23
const pw = (() => { try { return require('playwright'); } catch (e) { return require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright'); } })();
(async () => {
  const [file = 'build/test.html', gs = ''] = process.argv.slice(2);
  const b = await pw.chromium.launch(); const pg = await b.newPage({ viewport: { width: 1000, height: 1200 } });
  await pg.emulateMedia({ media: 'print' });
  await pg.goto('file://' + require('path').resolve(file));
  const bad = await pg.evaluate((gs) => {
    const T = window.__T, out = [];
    const keys = gs ? gs.split(',').map(Number) : Object.keys(T.GRADES).map(Number);
    for (const g of keys) {
      const gd = T.GRADES[g];
      for (const u of gd.units) for (const kind of ['word', 'figure', 'drill', 'test']) for (const level of ['basic', 'normal', 'challenge']) for (const seed of [1, 2, 3]) {
        let sheet;
        try { sheet = T.buildSheet({ gradeData: gd, unitId: u.id, kind, level, count: kind === 'figure' ? 3 : 8, seed }); } catch (e) { continue; }
        const policy = T.makeKanjiPolicy(T.kanji_default, gd.grade, {});
        const pv = document.getElementById('preview'); document.body.dataset.view = 'print';
        pv.innerHTML = T.sheetHtml(sheet, { policy, withAnswers: false, hints: false }); T.paginate(pv);
        for (const s of pv.querySelectorAll('article.sheet')) {
          const br = s.querySelector('.body').getBoundingClientRect();
          for (const e of s.querySelectorAll('.item-body, .block-text, .item-head')) {
            const r = e.getBoundingClientRect();
            if (e.scrollWidth > e.clientWidth + 2 || r.right > br.right + 2) { out.push(`${g}/${u.id}/${kind}/${level}/${seed}: ${e.textContent.slice(0, 30)}`); break; }
          }
        }
      }
    }
    return out;
  }, gs);
  console.log('text overflow', bad.length); for (const x of bad.slice(0, 20)) console.log(' ', x);
  await b.close(); if (bad.length) process.exitCode = 1;
})();

// 使い方: node tools/test/firstopen.js docs/index.html
// メニューからはじめて開いたときと、「作成」を押したときで、ページ分けが同じになるか
const { chromium } = require((() => { try { return require.resolve('playwright'); } catch (e) { return require('child_process').execSync('npm root -g').toString().trim() + '/playwright'; } })());
(async () => {
  const file = process.argv[2];
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1200, height: 1000 } });
  const sig = () => pg.evaluate(() => [...document.querySelectorAll('#preview article.sheet')].map(a => [...a.querySelectorAll('.body > .block')].map(x => x.dataset.sec + ':' + x.querySelectorAll('li.item').length).join(',') + '|' + [...a.querySelectorAll('.figure')].map(f => f.style.zoom || '1').join(',')).join(' / '));
  let bad = 0, n = 0;
  for (const [g, unit, kind] of [[4, 'r4-02', 'figure'], [3, 'r3-10', 'figure'], [5, 'r5-07', 'drill'], [2, 's2-01', 'word'], [6, 'r6-08', 'test'], [1, 's1-02', 'figure'], [7, 'k1-08', 'figure'], [8, 'k2-11', 'drill'], [9, 'k3-10', 'test'], [24, 's24-02', 'figure']]) {
    await pg.goto('file://' + require('path').resolve(file)); await pg.waitForTimeout(300);
    await pg.evaluate((g) => { localStorage.clear(); }, g);
    await pg.evaluate(([g, unit, kind]) => {
      // メニューの学年をえらんで、単元のボタンをおす
      const hb = document.querySelector(`.hg[data-grade="${g}"]`);
      if (!hb) { document.getElementById('tkBanner').click(); }
      document.querySelector(`.hg[data-grade="${g}"]`).click();
      document.querySelector(`.uk[data-unit="${unit}"][data-kind="${kind}"]`).click();
    }, [g, unit, kind]);
    await pg.waitForTimeout(300);
    const a = await sig();
    await pg.click('#btnMake'); await pg.waitForTimeout(300);
    const c = await sig(); n++;
    if (a !== c) { bad++; console.log('DIFF', unit, '\n  first:', a.slice(0, 200), '\n  make :', c.slice(0, 200)); }
  }
  console.log(`checked ${n}, different ${bad}`); await b.close();
})();

// 理科プリントを画像にする(目で確かめる用)
// node tools/rika/render.js build/test.html 単元ID 種類 難易度 問題数 シード 出力の先頭 [小単元番号]
const { chromium } = require((() => { try { return require.resolve('playwright'); } catch (e) { return require('child_process').execSync('npm root -g').toString().trim() + '/playwright'; } })());
(async () => {
  const [file, unitId, kind, level, count, seed, prefix, topicNo] = process.argv.slice(2);
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: 1000, height: 1200 } });
  pg.on('pageerror', (e) => console.log('ERR', String(e)));
  await pg.emulateMedia({ media: 'print' });
  await pg.goto('file://' + require('path').resolve(file));
  const n = await pg.evaluate(({ unitId, kind, level, count, seed, topicNo, FURI }) => {
    const T = window.__T;
    const gd = Object.values(T.GRADES).find((g) => g.units.some((u) => u.id === unitId));
    const sheet = T.buildSheet({ gradeData: gd, unitId, kind, level, count: Number(count), seed: Number(seed), topicNo: Number(topicNo || 0) });
    const policy = T.makeKanjiPolicy(T.kanji_default, gd.grade, { furigana: FURI });
    const pv = document.getElementById('preview');
    document.body.dataset.view = 'print';
    pv.innerHTML = T.sheetHtml(sheet, { policy, withAnswers: true, hints: false });
    T.paginate(pv);
    return document.querySelectorAll('#preview article').length;
  }, { unitId, kind, level, count, seed, topicNo, FURI: !!process.env.FURI });
  const sheets = await pg.$$('#preview article.sheet');
  for (let i = 0; i < sheets.length; i++) await sheets[i].screenshot({ path: `${prefix}${i}.png` });
  console.log(unitId, kind, n, 'pages');
  await b.close();
})();

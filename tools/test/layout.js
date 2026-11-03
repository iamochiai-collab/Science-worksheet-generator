// 画面の検査:すべての学年・単元・種類・難易度・問題数でプリントを作り、はみ出し・番号のずれ・作れないものがないか調べる
// 使い方: node tools/test/layout.js [docs/index.html] [結果.json] [学年(7 や 7,8,9)]
const { chromium } = require((() => { try { return require.resolve('playwright'); } catch (e) { return require('child_process').execSync('npm root -g').toString().trim() + '/playwright'; } })());
(async () => {
  const [file0 = 'docs/index.html', outJson] = process.argv.slice(2);
  const file = require('path').resolve(file0);
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: 1000, height: 1200 } });
  const errs = []; pg.on('pageerror', e => errs.push(String(e)));
  await pg.emulateMedia({ media: 'print' });
  await pg.goto('file://' + file + '?grade=1&unit=g1-01&seed=1');
  if (process.argv[4]) await pg.evaluate((o) => { window.__ONLY = o.split(','); }, process.argv[4]);
  await pg.waitForTimeout(300);
  const res = await pg.evaluate(async () => {
    const g = document.getElementById('grade'), u = document.getElementById('unit'), k = document.getElementById('kind'), l = document.getElementById('level'), c = document.getElementById('count');
    const rows = [], fails = [];
    for (const go of [...g.options].filter(o => !window.__ONLY || window.__ONLY.includes(o.value))) {
      g.value = go.value; g.dispatchEvent(new Event('change'));
      for (const uo of [...u.options]) {
        if (uo.disabled) continue;
        u.value = uo.value; u.dispatchEvent(new Event('change'));
        for (const ko of [...k.options]) {
          if (ko.disabled) continue;
          k.value = ko.value; k.dispatchEvent(new Event('change'));
          for (const lv of ['basic','normal','challenge']) {
            l.value = lv;
            const counts = c.disabled ? [null] : [...c.options].map(o => o.value);
            for (const cnt of counts) {
              if (cnt !== null) c.value = cnt;
              for (const seed of [1, 2, 3]) {
                document.getElementById('seed').value = seed;
                document.getElementById('btnMake').click();
                const m = document.getElementById('msg').textContent;
                if (m) { fails.push(`${go.value}/${uo.value}/${ko.value}/${lv}/${cnt}/${seed}: ${m}`); continue; }
                const sheets = [...document.querySelectorAll('#preview article.sheet')];
                const probs = sheets.filter(s => !s.classList.contains('answers'));
                const ans = sheets.filter(s => s.classList.contains('answers'));
                const waste = (arr) => arr.slice(0, -1).reduce((a, s) => { const body = s.querySelector('.body'); const br = body.getBoundingClientRect(); const last = body.lastElementChild?.getBoundingClientRect(); return a + (br.height - (last ? last.bottom - br.top : 0)); }, 0);
                const over = sheets.some(s => { const b = s.querySelector('.body'); return b.scrollHeight > b.clientHeight + 1; });
                // 小問の番号が式や図とかさならないか
                const nov = sheets.some(s => [...s.querySelectorAll('.item-no')].some(n => { const nx = n.nextElementSibling || n.parentElement.nextElementSibling; if (!nx) return false; const a = n.getBoundingClientRect(), c = nx.getBoundingClientRect(); return n.scrollWidth > n.clientWidth + 0.5 || c.width > 0 && a.top < c.bottom - 1 && c.top < a.bottom - 1 && a.right > c.left + 0.5; }));
                const hov = sheets.some(s => { const b = s.querySelector('.body'); const br = b.getBoundingClientRect(); return [...b.querySelectorAll('table, svg, .item, .block-head, .ws-lines')].some(e => e.getBoundingClientRect().right > br.right + 2); });
                // numbering check: block numbers sequential, answer numbers match
                const pn = [...new Set(probs.flatMap(s => [...s.querySelectorAll('.block .block-no')].map(x => x.textContent)))].filter(x => x !== 'れい');
                const an = [...new Set(ans.flatMap(s => [...s.querySelectorAll('.ans-block .block-no, .block .block-no')].map(x => x.textContent)))].filter(x => x !== 'れい');
                const ps = [...new Set(probs.flatMap(s => [...s.querySelectorAll('.body > .block')].map(x => x.dataset.sec)))];
                const as = [...new Set(ans.flatMap(s => [...s.querySelectorAll('.ans-block, .body > .block')].map(x => x.dataset.sec)))];
                const mapOk = ans.length === 0 || ps.join() === as.join();
                const seqOk = mapOk && pn.every((x, i) => x === String(i + 1)) && (ans.length === 0 || an.join() === pn.join());
                rows.push({ id: `${go.value}/${uo.value}/${ko.value}/${lv}/${cnt}/${seed}`, kind: ko.value, pp: probs.length, ap: ans.length, pw: Math.round(waste(probs)), aw: Math.round(waste(ans)), over, hov, nov, seqOk });
              }
            }
          }
        }
      }
    }
    return { rows, fails };
  });
  if (outJson) require('fs').writeFileSync(outJson, JSON.stringify(res));
  const R = res.rows;
  const sum = (f) => R.reduce((a, r) => a + f(r), 0);
  console.log('cases', R.length, 'fails', res.fails.length, 'pageerrors', errs.length);
  console.log('problem pages', sum(r => r.pp), 'answer pages', sum(r => r.ap));
  console.log('avg waste px per case: problem', (sum(r => r.pw) / R.length).toFixed(1), 'answer', (sum(r => r.aw) / R.length).toFixed(1));
  for (const kd of ['drill','word','figure','test']) { const S = R.filter(r => r.kind === kd); console.log(kd, S.length, 'pages', S.reduce((a,r)=>a+r.pp,0), 'waste', Math.round(S.reduce((a,r)=>a+r.pw,0)/S.length)); }
  console.log('h-overflow', R.filter(r => r.hov).length, [...new Set(R.filter(r => r.hov).map(r => r.id.split('/').slice(0,3).join('/')))].slice(0,40).join(' '));
  console.log('overflow', R.filter(r => r.over).length, 'numbering bad', R.filter(r => !r.seqOk).length, 'number overlap', R.filter(r => r.nov).length, [...new Set(R.filter(r => r.nov).map(r => r.id.split('/').slice(0, 3).join('/')))].slice(0, 30).join(' '));
  console.log(res.fails.slice(0, 5), errs.slice(0, 5));
  await b.close();
  if (res.fails.length || errs.length || R.some((r) => r.over || r.hov || r.nov || !r.seqOk)) process.exitCode = 1;
})();

// 理科プリントの問題の検査:すべての部品を何回も作って、答えがない・undefined・NaN・図の中のふりがな記法 などを調べる
// 使い方: node tools/rika/check.js build/test.html [回数]
const pw = (() => { try { return require('playwright'); } catch (e) { return require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright'); } })();
(async () => {
  const [file = 'build/test.html', n = '150'] = process.argv.slice(2);
  const b = await pw.chromium.launch();
  const pg = await b.newPage();
  const errs = [];
  pg.on('pageerror', (e) => errs.push(String(e)));
  await pg.goto('file://' + require('path').resolve(file));
  const res = await pg.evaluate((N) => {
    const T = window.__T, out = [], gens = new Set(), stat = {};
    for (const g of Object.values(T.GRADES)) for (const u of g.units) for (const tp of u.topics) gens.add(tp.generator);
    for (const id of gens) {
      const gen = T.getGenerator(id);
      if (!gen) { out.push(`${id}: 部品がない`); continue; }
      for (const lv of ["basic", "normal", "challenge"]) {
        const p = T.topicParams({ generator: id }, lv), keys = new Set();
        const rng = T.makeRng(7);
        for (let i = 0; i < N; i++) {
          let pr;
          try { pr = gen.generate(rng, p, { index: i }); } catch (e) { out.push(`${id}/${lv}: ${e.message}`); break; }
          const txt = JSON.stringify(pr).replace(/data:image\/[a-z]+;base64,[A-Za-z0-9+\/=]+/g, "IMG");
          if (!pr.answer || !String(pr.answer.display ?? "").trim()) out.push(`${id}/${lv}: 答えがない ${pr.text}`);
          if (/undefined|NaN|Infinity|\[object/.test(txt)) out.push(`${id}/${lv}: おかしな値 ${txt.slice(0, 200)}`);
          const raw = (pr.figure?.items || []).filter((x) => x.t === "raw").map((x) => x.svg).join("");
          if (/\{[^{}|]+\|[^{}]*\}/.test(raw)) out.push(`${id}/${lv}: 図にふりがな記法`);
          if (pr.workspace?.type === "lines" && pr.answer.display.split("　").length !== pr.workspace.labels.length) out.push(`${id}/${lv}: 答えの数と線の数がちがう ${pr.answer.display}`);
          if (/　/.test(String(pr.answer.display).replace(/^\(\d+\)/, "")) && pr.workspace?.type !== "lines") out.push(`${id}/${lv}: 答えに全角スペース ${pr.answer.display}`);
          keys.add(pr.key.replace(/#\d+$/, ""));
        }
        stat[`${id}/${lv}`] = keys.size;
      }
    }
    return { out: [...new Set(out)], stat, n: gens.size };
  }, Number(n));
  console.log('generators', res.n, 'problems', res.out.length);
  for (const x of res.out.slice(0, 60)) console.log(' ', x);
  const small = Object.entries(res.stat).filter(([k, v]) => v < 4 && !k.includes('Fig') && !k.startsWith('sum.'));
  if (small.length) console.log('問題の種類が少ない:', small.map(([k, v]) => `${k}=${v}`).join(' '));
  if (errs.length) console.log('page errors', errs.slice(0, 5));
  await b.close();
  if (res.out.length || errs.length) process.exitCode = 1;
})();

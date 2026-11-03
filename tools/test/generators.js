// 問題をつくる部品の検査:答えが合うか、重複しないか、ふりがなのない漢字がないか(高校はふりがななし) など
// 使い方: node tools/test/generators.js [build/test.html] [単元ID,単元ID… または all] [1つあたりの数]
const { chromium } = require((() => { try { return require.resolve('playwright'); } catch (e) { return require('child_process').execSync('npm root -g').toString().trim() + '/playwright'; } })());
(async () => {
  const [file = 'build/test.html', unitsArg = 'all', nArg] = process.argv.slice(2);
  const N = Number(nArg || 300);
  const b = await chromium.launch(); const pg = await b.newPage();
  const errs = []; pg.on('pageerror', e => errs.push(String(e)));
  await pg.goto('file://' + require('path').resolve(file));
  const res = await pg.evaluate(({ unitsArg, N }) => {
    const T = window.__T, out = [];
    // 漢数字を読む問題は、読みの側に漢数字を書く(わざと)
    const KANJI_NUMERAL_OK = new Set(['g3.bigKanji']);
    const isKanji = (ch) => { const c = ch.codePointAt(0); return c >= 0x4e00 && c <= 0x9fff || c >= 0x3400 && c <= 0x4dbf || c === 0x3005; };
    for (const [g, data] of Object.entries(T.GRADES)) for (const unit of data.units) {
      if (unitsArg !== 'all' && !unitsArg.split(',').includes(unit.id)) continue;
      let lower = ''; if (Number(g) < 7) for (let k = 1; k < Number(g); k++) lower += T.kanji_default[String(k)] || '';
      const lowerSet = new Set(lower);
      for (const topic of unit.topics) {
        // 特別支援の段階(21〜)は、もとの単元と同じ小単元はとばす(段階だけの部品・しぼりこみのあるものだけ調べる)
        if (Number(g) >= 21 && unitsArg === 'all' && !topic.levels && !/^t\./.test(topic.generator)) continue;
        const gen = T.getGenerator(topic.generator);
        for (const level of ['basic', 'normal', 'challenge']) {
          const p = T.topicParams(topic, level);
          const keys = new Set(), soft = new Set(); const fails = {}; let made = 0;
          const strings = [];
          for (let i = 0; i < N; i++) {
            const rng = T.makeRng(1000 + i * 7919);
            let pr;
            try { pr = gen.generate(rng, p, { index: i }); } catch (e) { fails['gen: ' + e.message] = (fails['gen: ' + e.message] || 0) + 1; continue; }
            made++;
            keys.add(pr.key); if (pr.softKey) soft.add(pr.softKey);
            if (gen.verify) { let v; try { v = gen.verify(pr, p); } catch (e) { v = 'verify threw: ' + e.message; } if (v) fails[v] = (fails[v] || 0) + 1; }
            // collect strings for kanji check
            const col = [pr.text, pr.answer?.display];
            const walk = (f) => { if (!f) return; if (f.type === 'multi') f.items.forEach(walk); if (f.type === 'draw') f.items.forEach(it => it.t === 'text' && col.push(String(it.s))); if (f.type === 'table') { col.push(...f.head, ...f.rows.flat()); } };
            walk(pr.figure); walk(pr.answer?.figure);
            (pr.workspace?.labels || []).forEach(l => col.push(l));
            if (i < 40) strings.push(...col.filter(Boolean).map(String));
            for (const s of col) {
              if (s == null) continue;
              const raw = String(s).replace(/\{([^{}|]+)\|([^{}|]*)\}/g, (_, k, kana) => { if ([...kana].some(isKanji) && !KANJI_NUMERAL_OK.has(gen.id)) fails['kanji in kana: ' + k] = 1; return ''; });
              if (Number(g) < 10) for (const ch of raw) if (isKanji(ch) && !lowerSet.has(ch)) fails['raw kanji ' + ch] = (fails['raw kanji ' + ch] || 0) + 1;
              if (/\{\{|\}\}|undefined|NaN|null/.test(String(s).replace(/√\{[^{}]*\}/g, "√").replace(/√\{[^{}]*\}/g, "√"))) fails['bad text: ' + String(s).slice(0, 60)] = 1;
            }
          }
          out.push({ unit: unit.id, topic: topic.label, gen: topic.generator, level, made, distinct: keys.size, themes: soft.size, fails, sample: strings.slice(0, 3) });
        }
      }
    }
    return out;
  }, { unitsArg, N });
  let bad = 0;
  for (const r of res) {
    const f = Object.entries(r.fails);
    if (f.length) bad++;
    console.log(`${r.unit} ${r.gen} ${r.level.padEnd(9)} made ${r.made} distinct ${r.distinct} themes ${r.themes}${f.length ? '  FAIL ' + JSON.stringify(Object.fromEntries(f.slice(0, 6))) : ''}`);
  }
  console.log('topics x levels', res.length, 'with failures', bad, 'pageerrors', errs.slice(0, 3));
  await b.close();
  if (bad || errs.length) process.exitCode = 1;
})();

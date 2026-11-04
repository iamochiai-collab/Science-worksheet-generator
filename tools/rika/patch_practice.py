# 理科プリント:「練習プリント」(図 → ことば → ○× → えらぶ → 計算 → 記述 を1まいに)を足す。1回だけ使う
import pathlib
p = pathlib.Path('src/template.html'); s = p.read_text(encoding='utf-8')
def R(a, b):
    global s
    assert s.count(a) == 1, a[:70]
    s = s.replace(a, b)
R('    test: { label: "単元まとめテスト", sheetLabel: "{単元|たんげん}まとめテスト", counts: null, defaultCount: null },',
  '    // 練習プリント(理科):図・ことば・○×・えらぶ・計算・記述を1まいにまとめる\n    practice: { label: "練習プリント", sheetLabel: "{練習|れんしゅう}プリント", counts: null, defaultCount: null },\n    test: { label: "単元まとめテスト", sheetLabel: "{単元|たんげん}まとめテスト", counts: null, defaultCount: null },')
R('var topicKinds = (topic) => topic.kinds.filter((k) => k !== "test" && k !== "matome");', 'var topicKinds = (topic) => topic.kinds.filter((k) => k !== "test" && k !== "matome" && k !== "practice");')
R('''    } else if (kind === "matome") {''', '''    } else if (kind === "practice") {
      // 練習プリント:RK.practicePlan の順に、形をしぼって問題を作る
      const kids = gradeData.grade <= 2;
      const pick = (k) => unit.topics.filter((t2) => (!subTopic || t2 === subTopic) && t2.kinds.includes(k));
      let made = 0;
      for (const step of RK.practicePlan(level, kids)) {
        const tps = pick(step.from).filter((t2) => !step.only || getGenerator(t2.generator).has?.(step.only));
        if (!tps.length) continue;
        const probs = [];
        for (let i = 0; i < step.n; i++) {
          let pr = null, tp = null;
          for (let t3 = 0; t3 < 60 && !pr; t3++) {
            tp = rng.pick(tps);
            const gen2 = getGenerator(tp.generator);
            const p = { ...topicParams(tp, level), compact: true, ...(step.only ? { only: step.only } : {}) };
            // index は 0 のまま(同じ問題をくり返さない)
            const cand = gen2.generate(rng, p, { index: step.from === "word" ? 0 : i + t3, from });
            if (used.has(cand.key)) continue;
            pr = { ...cand, topic: tp.label, generator: gen2.id, points: null };
          }
          if (!pr) break;
          used.add(pr.key);
          probs.push(pr);
        }
        if (!probs.length) continue;
        made += probs.length;
        curGroup = step.from === "figure" ? "figure" : step.from === "drill" ? "drill" : "word";
        sections.push({ instruction: step.inst, topic: probs[0].topic, problems: probs, pointsEach: null, group: curGroup });
      }
      if (!made) throw new Error("この単元には練習プリントがありません");
    } else if (kind === "matome") {''')
R('''el.kind.value === "matome" ? "おまかせ" : "固定(100点)"''', '''el.kind.value === "matome" ? "おまかせ" : el.kind.value === "practice" ? "おまかせ" : "固定(100点)"''')
R('var KIND_SHORT = { drill: "計算問題", word: "基本問題", figure: "図・実験",', 'var KIND_SHORT = { practice: "練習プリント", drill: "計算問題", word: "基本問題", figure: "図・実験",')
p.write_text(s, encoding='utf-8')
print('ok')

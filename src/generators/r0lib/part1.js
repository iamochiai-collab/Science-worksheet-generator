// このファイルは tools/rika/annotate.js が content/r0lib.js から作ったもの。直すときは content/r0lib.js を直して作りなおす。
// 理科プリントの共通の道具
//   RK.bank(id, 問題の一覧)      ことば・しくみの問題(1問ずつ)
//   RK.figs(id, 図の問題の一覧)  図・実験の問題(図と小問)
//   RK.calc(id, 作る関数)        計算問題
//   RK.grade(学年, 単元の一覧)   学年のデータ
// 問題の一覧の書き方(1行に1問。| で区切る):
//   1|問い|答え                 ふつうの問題(答えのらんがつく)
//   1|〜は（　　　）です。|答え    （　　　）が答えの四角になる。2つ以上あるときは 答えを 、で区切る
//   2|問い|=正しいもの|ちがうもの|ちがうもの   えらぶ問題(ア・イ・ウ…に並べかえる)
//   2|問い|>1番目|2番目|3番目    じゅんばんに並べる問題
//   2|〜（　　　）〜（　　　）〜|答え1|答え2|-ちがうことば   〔ことば〕からえらぶ穴うめ(「-」はまぎらわしいことば)
//   1|?文|○                      正しければ○、まちがっていれば×(答えは ○ か ×)
//   2|!指示文|もの=○|もの=×|…      いくつかのものに ○・× をつける(4〜5こえらんで出す)
// 行の先頭の数字は むずかしさ(1:★、2:★★、3:★★★)。
var r0lib = [];
var RK = (() => {
  const LET = ["ア", "イ", "ウ", "エ", "オ", "カ", "キ", "ク"];
  const LV = { basic: { max: 1 }, normal: { max: 2 }, challenge: { max: 3 } };
  const noRuby = (s) => String(s ?? "").replace(/\{([^{}|]+)\|[^{}]*\}/g, "$1");

  function parse(src) {
    const out = [];
    for (const raw of String(src).split("\n")) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;
      const f = line.split("|");
      // {漢字|かな} の | で切れたものをつなぎなおす
      const cells = [];
      for (const x of f) {
        const prev = cells[cells.length - 1];
        if (prev !== undefined && (prev.match(/\{/g) || []).length > (prev.match(/\}/g) || []).length) cells[cells.length - 1] = prev + "|" + x;
        else cells.push(x);
      }
      // 「（　　　）を」「（　　　）に」も答えの四角にするため、かっこのあとに見えない文字をはさむ
      for (let k = 1; k < cells.length; k++) cells[k] = cells[k].replace(/（[　 ]{2,}）(?=[にを])/g, (m) => m + "\u200B");
      const lv = Number(cells[0]);
      if (!(lv >= 1 && lv <= 3)) throw new Error("むずかしさがない: " + line);
      const q = cells[1], rest = cells.slice(2);
      const blanks = (q.match(/（[　 ]{2,}）/g) || []).length;
      if (q.startsWith("?")) out.push({ lv, type: "tf", q: q.slice(1), a: rest[0] });
      else if (q.startsWith("!")) out.push({ lv, type: "tfList", q: q.slice(1), list: rest.map((x) => { const i = x.lastIndexOf("="); return [x.slice(0, i), x.slice(i + 1)]; }) });
      else if (blanks >= 2 || rest.some((x) => x.startsWith("-"))) out.push({ lv, type: "bank", q, ans: rest.filter((x) => !x.startsWith("-")), dummy: rest.filter((x) => x.startsWith("-")).map((x) => x.slice(1)) });
      else if (rest[0] && rest[0].startsWith("=")) out.push({ lv, type: "choice", q, ok: rest[0].slice(1), ng: rest.slice(1) });
      else if (rest[0] && rest[0].startsWith(">")) out.push({ lv, type: "order", q, seq: [rest[0].slice(1), ...rest.slice(1)] });
      else out.push({ lv, type: "qa", q, a: rest.join("|") });
    }
    return out;
  }
  const weightOf = (lv, max) => lv === max ? 3 : lv === max - 1 ? 2 : 1;
  const rnd = (rng) => (rng.next ? rng.next() : rng.int(0, 999999) / 1e6);
  function pickW(rng, pool, max) {
    const w = pool.map((x) => weightOf(x.lv, max)), sum = w.reduce((a, b) => a + b, 0);
    let r = rnd(rng) * sum;
    for (let i = 0; i < pool.length; i++) {
      r -= w[i];
      if (r < 0) return pool[i];
    }
    return pool[pool.length - 1];
  }
  const optLine = (opts) => opts.map((o, i) => `${LET[i]}　${o}`).join("　　");
  // kids:1・2年(分かち書き)用のことば
  function render(it, rng, kids) {
    if (it.type === "qa") return { text: it.q, a: it.a };
    if (it.type === "tf") return { text: `（　　）${it.q}[[br]]${kids ? "〔ただしければ ○、まちがって いれば ×〕" : "〔{正|ただ}しければ○、まちがっていれば×〕"}`, a: it.a };
    if (it.type === "tfList") {
      const pick = rng.shuffle(it.list).slice(0, Math.min(it.list.length, 5));
      return { text: `${it.q}[[br]]${pick.map(([w], i) => `${LET[i]}（　　）${w}`).join("　")}`, a: pick.map(([, m]) => m).join("、"), wide: true };
    }
    if (it.type === "bank") {
      // 〔ことば〕から えらんで（　）に書く。ことばは 同じものを1回だけ出す
      const words = rng.shuffle([...new Set([...it.ans, ...it.dummy])]);
      return { text: `${kids ? "あう ことばを、したの 〔　〕から えらんで かきましょう。" : "あてはまることばを、{下|した}の〔　〕からえらんで{書|か}きましょう。"}[[br]]${it.q}[[br]]〔 ${words.join(kids ? " ・ " : "・")} 〕`, a: it.ans.join("、"), wide: true };
    }
    if (it.type === "choice") {
      const opts = rng.shuffle([it.ok, ...it.ng]);
      return { text: `${it.q}[[br]]${optLine(opts)}`, a: LET[opts.indexOf(it.ok)], wide: true };
    }
    // ならべる問題:ばらばらにして記号をつけ、正しい順の記号を答える
    const opts = rng.shuffle(it.seq.slice());
    return { text: `${it.q}[[br]]${optLine(opts)}`, a: it.seq.map((s) => LET[opts.indexOf(s)]).join("→"), wide: true };
  }

  // ===== ことば・しくみの問題 =====
  function bank(id, src, o = {}) {
    const items = parse(src);
    return {
      id,
      instruction: o.inst === undefined ? "{次|つぎ}の{問|と}いに{答|こた}えましょう。" : o.inst,
      defaults: { max: 1 },
      levels: LV,
      generate(rng, p, ctx) {
        let pool = items.filter((x) => x.lv <= p.max);
        if (!pool.length) pool = items;
        const it = pickW(rng, pool, p.max);
        const r = render(it, rng, o.kids);
        // 問題を全部使いきったら、同じ問題も出せるようにする(round)
        const round = ctx && Number.isInteger(ctx.index) ? Math.floor(ctx.index / pool.length) : 0;
        return { key: `${id}:${items.indexOf(it)}#${round}`, text: r.text, wide: true, answer: { display: r.a }, workspace: { type: "none" }, meta: { lv: it.lv } };
      },
      size: items.length
    };
  }

  // ===== 図・実験の問題 =====
  // list: [{ lv, make(rng, p) → { fig, text, qs: [[問い, 答え], …], side, key } }]
  function figs(id, list, o = {}) {
    return {
      id,
      instruction: null,
      defaults: { max: 1 },
      levels: LV,
      generate(rng, p, ctx) {
        let pool = list.filter((x) => (x.lv || 1) <= p.max);
        if (!pool.length) pool = list;
        // 図の問題を使いきったら、同じ図の問題も出せるようにする(round)
        const round = ctx && Number.isInteger(ctx.index) ? Math.floor(ctx.index / pool.length) : 0;
        const it = pickW(rng, pool.map((x) => ({ ...x, lv: x.lv || 1 })), p.max);
        const r = it.make(rng, p);
        const qs = r.qs;
        const labels = qs.map((_, i) => `(${i + 1})`);
        const text = `${r.text || "図を見て、次の問いに答えましょう。"}[[br]]${qs.map((q, i) => `(${i + 1}) ${q[0]}`).join("[[br]]")}`;
        return {
          key: `${id}:${r.key ?? noRuby(text)}#${round}`,
          text,
          figure: r.fig,
          answer: { display: qs.map((q, i) => `(${i + 1}) ${String(q[1]).replace(/　/g, " ")}`).join("　") },
          workspace: { type: "lines", labels },
          side: r.side !== false,
          meta: {}
        };
      }
    };
  }

  // ===== 計算問題 =====
  // make(rng, p) → { text, a, key, work }
  function calc(id, inst, make, o = {}) {
    return {
      id,
      instruction: inst,
      defaults: { max: 1 },
      levels: LV,
      generate(rng, p, ctx) {
        const r = make(rng, p);
        // 数の組み合わせが少ない問題もあるので、o.n 問(ふつう 6問)ごとに同じ問題をゆるす
        const round = ctx && Number.isInteger(ctx.index) ? Math.floor(ctx.index / (o.n || 6)) : 0;
        return { key: `${id}:${r.key ?? noRuby(r.text)}#${round}`, text: r.text, wide: r.wide !== false, answer: { display: r.a }, workspace: { type: "none" }, work: r.work ?? o.work ?? 22, plainBox: true, meta: {} };
      }
    };
  }

  // ===== 図をかく道具(単位は mm) =====
  // 図の中のことばは T(x, y, ことば, 大きさ, {anchor, bold, color})
  const T = (x, y, s, size = 3.6, o = {}) => ({ t: "text", x, y, s: String(s), size, ...o });
  const svgEsc = (s) => noRuby(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  // raw は SVG の中身(mm の座標)。labels は T(…) のならび
  // SVG の中にまぎれこんだ {漢字|かな} は 漢字だけにする(ことばは T で書くこと)
  // k は印刷のときの倍率(ふつうは 1.15 倍)
  const fig = (w, h, raw, labels = [], k = 1.15) => ({ type: "draw", w, h, scaleK: k, items: [{ t: "raw", svg: noRuby(raw) }, ...labels] });
  const line = (x1, y1, x2, y2, o = {}) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${o.c || "#000"}" stroke-width="${o.w || 0.5}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ""}${o.cap ? ` stroke-linecap="${o.cap}"` : ""}/>`;
  const arrowHead = (x1, y1, x2, y2, o = {}) => {
    const a = Math.atan2(y2 - y1, x2 - x1), L = o.L || 2.4, s = 0.45;
    const p1 = [x2 - L * Math.cos(a - s), y2 - L * Math.sin(a - s)], p2 = [x2 - L * Math.cos(a + s), y2 - L * Math.sin(a + s)];
    return `<polygon points="${x2},${y2} ${p1[0].toFixed(2)},${p1[1].toFixed(2)} ${p2[0].toFixed(2)},${p2[1].toFixed(2)}" fill="${o.c || "#000"}"/>`;
  };
  const arrow = (x1, y1, x2, y2, o = {}) => line(x1, y1, x2, y2, o) + arrowHead(x1, y1, x2, y2, o);
  const rect = (x, y, w, h, o = {}) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.r || 0}" fill="${o.f || "none"}" stroke="${o.c || "#000"}" stroke-width="${o.w ?? 0.5}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ""}/>`;
  const circle = (cx, cy, r, o = {}) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${o.f || "none"}" stroke="${o.c || "#000"}" stroke-width="${o.w ?? 0.5}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ""}/>`;
  const path = (d, o = {}) => `<path d="${d}" fill="${o.f || "none"}" stroke="${o.c || "#000"}" stroke-width="${o.w ?? 0.5}" stroke-linejoin="round" stroke-linecap="round"${o.dash ? ` stroke-dasharray="${o.dash}"` : ""}/>`;
  const poly = (pts, o = {}) => `<polygon points="${pts.map((p) => p.join(",")).join(" ")}" fill="${o.f || "none"}" stroke="${o.c || "#000"}" stroke-width="${o.w ?? 0.5}" stroke-linejoin="round"/>`;
  const emo = (x, y, e, size = 10) => `<text x="${x}" y="${y}" font-size="${size}" text-anchor="middle" dominant-baseline="central">${e}</text>`;
  // 記号のラベル(ア・イ…)と引き出し線
  const tag = (x, y, tx, ty, s, o = {}) => line(x, y, tx, ty, { w: 0.3 }) + `<circle cx="${x}" cy="${y}" r="0.6" fill="#000"/>`;
  const mark = (tx, ty, s, size = 3.8) => T(tx, ty + 1.3, s, size, { bold: true });
  // 色(白黒で印刷してもわかるように うすい色)
  const C = { sky: "#e8f4fb", leaf: "#d9efd2", sand: "#f3e6c8", water: "#d6ecf7", gray: "#e6e6e6", red: "#f6d4d0", yellow: "#fbf0c4", dark: "#9a9a9a" };

  // グラフ(方眼と目もり)。xs:[min,max,step], ys:[min,max,step]
  function graph({ x0 = 14, y0 = 6, w = 60, h = 40, xs, ys, xl = "", yl = "", lines = [], dots = true, xLab, yLab }) {
    const X = (v) => x0 + (v - xs[0]) / (xs[1] - xs[0]) * w, Y = (v) => y0 + h - (v - ys[0]) / (ys[1] - ys[0]) * h;
    let raw = "";
    const lab = [];
    for (let v = xs[0]; v <= xs[1] + 1e-9; v += xs[2]) {
      raw += line(X(v), y0, X(v), y0 + h, { w: 0.15, c: "#aaa" });
      lab.push(T(X(v), y0 + h + 4, xLab ? xLab(v) : +v.toFixed(2), 2.8));
    }
    for (let v = ys[0]; v <= ys[1] + 1e-9; v += ys[2]) {
      raw += line(x0, Y(v), x0 + w, Y(v), { w: 0.15, c: "#aaa" });
      lab.push(T(x0 - 1.5, Y(v) + 1, yLab ? yLab(v) : +v.toFixed(2), 2.8, { anchor: "end" }));
    }
    raw += line(x0, y0 + h, x0 + w + 2, y0 + h, { w: 0.5 }) + line(x0, y0 - 2, x0, y0 + h, { w: 0.5 });
    for (const L of lines) {
      const pts = L.pts.map(([a, b]) => [X(a), Y(b)]);
      raw += `<polyline points="${pts.map((p) => p.map((v) => v.toFixed(2)).join(",")).join(" ")}" fill="none" stroke="#000" stroke-width="${L.w || 0.6}"${L.dash ? ` stroke-dasharray="${L.dash}"` : ""}/>`;
      if (dots && L.dots !== false) for (const p of pts) raw += `<circle cx="${p[0].toFixed(2)}" cy="${p[1].toFixed(2)}" r="0.8" fill="#000"/>`;
      if (L.label) lab.push(T(pts[pts.length - 1][0] + 1.5, pts[pts.length - 1][1] + 1, L.label, 3, { anchor: "start" }));
    }
    if (xl) lab.push(T(x0 + w + 1, y0 + h + 9, xl, 2.9, { anchor: "end" }));
    if (yl) lab.push(T(x0 - 1, y0 - 3, yl, 2.9, { anchor: "start" }));
    return { raw, lab, X, Y };
  }

  // 表の図
  const table = (head, rows) => ({ type: "table", head, rows });

  // ===== 学年のデータ =====
  // units: [id, 単元名, 分野, [topic, …]]   topic: [小単元名, 部品, 種類("w"|"f"|"d"), {weight}]
  const KIND = { w: ["word", "test"], f: ["figure", "test"], d: ["drill", "test"] };
  function grade(g, note, units) {
    return {
      grade: g,
      note,
      units: units.map(([id, name, domain, topics], i) => {
        const has = new Set(topics.map((t) => t[2]));
        // 100点になるように [問題数, 1問の点]
        const d = has.has("d"), w = has.has("w"), f = has.has("f");
        const plan = d && w && f ? { drill: [6, 5], word: [6, 5], figure: [2, 20] } : d && w ? { drill: [10, 5], word: [5, 10] } : d && f ? { drill: [10, 5], figure: [2, 25] } : w && f ? { word: [8, 5], figure: [3, 20] } : d ? { drill: [10, 10] } : w ? { word: [10, 10] } : { figure: [4, 25] };
        return {
          id, order: i + 1, name: noRuby(name), rubyName: name, domain: noRuby(domain),
          topics: topics.map(([label, generator, k, o = {}]) => ({ label: noRuby(label), ...(noRuby(label) !== label ? { rubyLabel: label } : {}), generator, kinds: KIND[k], ...o })),
          testPlan: plan
        };
      })
    };
  }
  return { LET, LV, noRuby, parse, bank, figs, calc, grade, T, fig, line, arrow, arrowHead, rect, circle, path, poly, emo, tag, mark, C, graph, table, svgEsc, rnd };
})();

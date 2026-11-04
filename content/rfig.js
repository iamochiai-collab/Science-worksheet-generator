// 図の問題がなかった単元の 図・絵・表の問題 と、実験の考え方(条件をそろえる・結果からわかること)の問題
// それぞれの単元のおわり(まとめ の前)に小単元としてくわえる
var rfig = (() => {
  const { figs, T, fig, line, arrow, arrowHead, rect, circle, path, poly, C, LET, table, graph, picRow, addTopic } = RK;
  const { beaker, tube, lamp } = RD;
  const M = (x, y, s) => T(x, y + 1.3, s, 3.8, { bold: true });
  const kidsText = "えを みて、つぎの もんだいに こたえましょう。";
  const pickN = (rng, arr, n) => rng.shuffle(arr.slice()).slice(0, n);
  const out = [];
  const add = (gen) => (out.push(gen), gen);

  // ===================== 1年・2年 生活 =====================
  // 学校のへや(絵)
  add(figs("s1.roomFig", [
    { lv: 1, make: (rng) => {
      const all = [["hon", "ほんを かりたり よんだり する へや"], ["kyuukyuu", "けがを したときに いく へや"], ["kyuushoku", "きゅうしょくを つくる へや"], ["sensei", "せんせいたちが しごとを する へや"]];
      const items = rng.shuffle(all.slice());
      const ask = pickN(rng, [0, 1, 2, 3], 2);
      return { fig: picRow(items.map((x) => x[0]), 26), text: kidsText, qs: ask.map((i) => [`「${items[i][1]}」の えは どれですか。`, LET[i]]), key: items.map((x) => x[0]).join() + ask.join(), side: false };
    } }
  ]));
  // まちのしせつ(絵)
  add(figs("s2.townFig", [
    { lv: 1, make: (rng) => {
      const all = [["post", "てがみや にもつを おくる ところ"], ["kouban", "みちが わからない ときに きく ところ"], ["shoubousha", "かじの ときに くる くるま"], ["kouen", "あそんだり やすんだり する ところ"], ["hon", "ほんを かりる ところ(としょかん)"]];
      const items = pickN(rng, all, 4);
      const ask = pickN(rng, [0, 1, 2, 3], 2);
      return { fig: picRow(items.map((x) => x[0]), 26), text: kidsText, qs: ask.map((i) => [`「${items[i][1]}」の えは どれですか。`, LET[i]]), key: items.map((x) => x[0]).join() + ask.join(), side: false };
    } }
  ]));
  // いきもののすみか(絵)
  add(figs("s2.homeFig", [
    { lv: 1, make: (rng) => {
      const water = rng.pick(["medaka", "zarigani"]);
      const items = rng.shuffle([water, "dangomushi", "kabuto", "katatsumuri"]);
      const qs = [["みずの なかで かう いきものは どれですか。", LET[items.indexOf(water)]], ["いしや おちばの したに いる ことが おおい いきものは どれですか。", LET[items.indexOf("dangomushi")]], ["からを せおって いる いきものは どれですか。", LET[items.indexOf("katatsumuri")]]];
      return { fig: picRow(items, 26), text: kidsText, qs: pickN(rng, qs, 2), key: items.join() + water, side: false };
    } }
  ]));

  // ===================== 3年 =====================
  add(figs("r3.lookFig", [
    { lv: 1, make: (rng) => {
      const items = rng.shuffle(["mushimegane", "ondokei", "houijishin", "stopwatch"]);
      return { fig: picRow(items, 24), text: "かんさつや実験で使う道具の絵です。", qs: [["小さいものを大きくして見る道具はどれですか。", LET[items.indexOf("mushimegane")]], ["方位を調べる道具はどれですか。", LET[items.indexOf("houijishin")]], ["虫めがねで、ぜったいに見てはいけないものは何ですか。", "太陽"]], key: items.join(), side: false };
    } },
    { lv: 1, make: (rng) => {
      const items = rng.shuffle(["dangomushi", "tentou", "ari", "katatsumuri"]);
      return { fig: picRow(items, 24), text: "校庭で見つけた生き物の絵です。", qs: [["石や落ち葉の下で見つかることが多い生き物はどれですか。", LET[items.indexOf("dangomushi")]], ["からをもっている生き物はどれですか。", LET[items.indexOf("katatsumuri")]], ["かんさつカードに書くとよいことを1つ答えましょう。", "色・形・大きさ(見つけた場所・日づけ など)"]], key: items.join(), side: false };
    } }
  ]));
  add(figs("r3.soundFig", [
    { lv: 1, make: (rng) => {
      const big = rng.chance(0.5);
      return { fig: table(["たたき方", "音の大きさ", "上にのせたビーズのようす"], [["弱くたたく", "小さい", big ? "少しはねる" : "ア"], ["強くたたく", "大きい", big ? "ア" : "大きくはねる"]]), text: "たいこの上にビーズをのせて、たたく強さをかえ、音の大きさとビーズのようすを調べました。", qs: [["アにあてはまるようすを書きましょう。", big ? "大きくはねる" : "少しはねる"], ["音が出ているとき、たいこはどうなっていますか。", "ふるえている"], ["この実験から、音の大きさともののふるえについてわかることを書きましょう。", "大きい音ほど、もののふるえが大きい"]], key: big ? "b" : "s", side: false };
    } },
    { lv: 2, make: (rng) => {
      const how = rng.pick([["糸をぴんとはる", "よく聞こえる"], ["糸をたるませる", "聞こえにくくなる"], ["糸のとちゅうを指でつまむ", "聞こえにくくなる(聞こえなくなる)"]]);
      return { fig: picRow(["itodenwa"], 40, { letters: false }), text: `糸電話で話をしました。${how[0]}と、どうなるか調べました。`, qs: [["話している人の声は、何をつたわって相手にとどきますか。", "糸"], [`${how[0]}と、声の聞こえ方はどうなりますか。`, how[1]], ["声が聞こえているとき、糸はどうなっていますか。", "ふるえている"]], key: how[0], side: true };
    } }
  ]));

  // ===================== 4年 =====================
  add(figs("r4.seasonFig", [
    { lv: 1, make: (rng) => {
      const S = [["sakura", "春"], ["himawari", "夏"], ["momiji", "秋"], ["yukidaruma", "冬"]];
      const items = rng.shuffle(S.slice());
      const ask = rng.pick(items);
      return { fig: picRow(items.map((x) => x[0]), 24), text: "季節のようすの絵です。", qs: [[`${ask[1]}のようすの絵はどれですか。`, LET[items.indexOf(ask)]], ["ア〜エを、春・夏・秋・冬のじゅんにならべましょう。", S.map((x) => LET[items.indexOf(x)]).join("→")], ["ツバメが南の国へうつっていくのは、どの季節ですか。", "秋"]], key: items.map((x) => x[0]).join() + ask[1], side: false };
    } },
    { lv: 2, make: (rng) => {
      const d = rng.int(-1, 1);
      const base = [15, 19, 22, 26, 27, 24, 18, 13, 8, 6, 6, 9].map((v) => v + d);
      const mon = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];
      const g = graph({ xs: [0, 11, 1], ys: [0, 30, 5], xl: "(月)", yl: "(℃)", lines: [{ pts: base.map((v, i) => [i, v]) }], w: 80, h: 40, x0: 12, y0: 7, xLab: (v) => mon[v] });
      const hi = base.indexOf(Math.max(...base));
      return { fig: fig(100, 60, g.raw, g.lab, 1.15), text: "1年間の気温の変化をグラフにしました。", qs: [["気温がいちばん高いのは何月ですか。", `${mon[hi]}月`], ["気温が高い季節には、生き物の活動はどうなりますか。", "さかんになる"], ["気温が低い冬、こん虫などの生き物はどのようにすごしていますか。", "たまごやさなぎ、成虫などのすがたで、じっとしてすごす"]], key: `t${d}`, side: false };
    } }
  ]));
  add(figs("r4.soakFig", [
    { lv: 1, make: (rng) => {
      const a = rng.int(5, 12), b = a + rng.int(10, 25), c = b + rng.int(40, 80);
      const rows = rng.shuffle([["じゃり", `${a}秒`], ["すな", `${b}秒`], ["校庭の土", `${c}秒`]]);
      return { fig: table(["土のしゅるい", ...rows.map((r) => r[0])], [["水がしみこむまでの時間", ...rows.map((r) => r[1])]]), text: "同じ量の土を入れたいれものに、同じ量の水を注いで、水がしみこむまでの時間を調べました。つぶの大きさは、じゃり → すな → 校庭の土 のじゅんに小さくなります。", qs: [["水がいちばんはやくしみこんだのはどれですか。", "じゃり"], ["この実験からわかることを書きましょう。", "つぶが大きいほど、水がしみこみやすい"], rng.pick([["雨のあと、水たまりができやすいのは、じゃり・すな・校庭の土のどれですか。", "校庭の土"], ["この実験で、土の量や水の量を同じにしたのはなぜですか。", "土のしゅるい(つぶの大きさ)のちがいだけをくらべるため"]])], key: `${a}${b}${c}`, side: false };
    } }
  ]));
  add(figs("r4.evapFig", [
    { lv: 1, make: (rng) => {
      const v = rng.pick([80, 85, 90]), lidLeft = rng.chance(0.5);
      const cup = (x, lid, lvl) => beaker(x, 44, 18, 30, lvl, { f: C.water }) + (lid ? rect(x - 11, 11.5, 22, 2, { f: C.gray, w: 0.4 }) + [-5, 0, 5].map((dx) => `<circle cx="${x + dx}" cy="15" r="0.8" fill="${C.water}" stroke="#000" stroke-width="0.25"/>`).join("") : "") + line(x - 9, 44 - 30 * 0.7, x - 6, 44 - 30 * 0.7, { w: 0.4 });
      const s = cup(18, lidLeft, lidLeft ? 0.7 : 0.7 * v / 100) + cup(52, !lidLeft, lidLeft ? 0.7 * v / 100 : 0.7);
      const noLid = lidLeft ? "イ" : "ア", lid = lidLeft ? "ア" : "イ";
      return { fig: fig(70, 54, s, [M(18, 50, "ア"), M(52, 50, "イ")]), text: `同じ量の水を入れた入れ物ア・イを、日なたに3日間おきました。${lid}にはふたをしました。線は、はじめの水面の高さです。`, qs: [["水の量がへったのは、ア・イのどちらですか。", noLid], ["へった水は、どこへいきましたか。", "水じょう気になって、空気中へ出ていった"], [`${lid}のふたの内がわに水てきがついたのはなぜですか。`, "じょう発した水じょう気が、ふたで冷やされて水になったから"]], key: `${v}${lidLeft}`, side: true };
    } }
  ]));
  add(figs("r4.syringeFig", [
    { lv: 1, make: (rng) => {
      const airLeft = rng.chance(0.5);
      const syr = (x, air) => rect(x - 5, 14, 10, 24, { f: air ? "#fff" : C.water, w: 0.5 }) + rect(x - 4.4, 8, 8.8, 6, { f: C.gray, w: 0.4 }) + line(x, 2, x, 8, { w: 1.2 }) + rect(x - 6, 1, 12, 1.6, { f: C.gray, w: 0.4 }) + line(x, 38, x, 41, { w: 1 }) + rect(x - 3, 41, 6, 1.5, { f: "#000", w: 0 }) + arrow(x + 9, 1, x + 9, 9, { w: 0.5 });
      const s = syr(16, airLeft) + syr(50, !airLeft);
      const air = airLeft ? "ア" : "イ", wat = airLeft ? "イ" : "ア";
      return { fig: fig(66, 50, s, [M(16, 47, "ア"), M(50, 47, "イ"), T(27, 6, "おす", 2.8), T(61, 6, "おす", 2.8)], 1.0), text: `注しゃ器の先をふさいで、${air}には空気を、${wat}には水をとじこめ、ピストンをおしました。`, qs: [["ピストンが下がったのは、ア・イのどちらですか。", air], [`${air}の中の空気の体積はどうなりましたか。`, "小さくなった"], [`${wat}の中の水の体積はどうなりましたか。`, "かわらなかった"], [`${air}のピストンから手をはなすと、ピストンはどうなりますか。`, "元の位置にもどる"]], key: `${airLeft}`, side: true };
    } }
  ]));

  // ===================== 5年 =====================
  add(figs("r5.cloudFig", [
    { lv: 1, make: (rng) => {
      const city = [["福岡", 8], ["広島", 20], ["大阪", 32], ["名古屋", 43], ["東京", 54]];
      const st = rng.int(0, 2);
      let s = "";
      const lab = [];
      for (let d = 0; d < 2; d++) {
        const ox = d * 64;
        s += rect(ox + 2, 4, 60, 26, { f: "#fff", w: 0.4 }) + `<ellipse cx="${ox + 2 + city[st + d][1]}" cy="14" rx="8" ry="5" fill="${C.gray}" stroke="#666" stroke-width="0.3"/>`;
        city.forEach(([nm, x], k) => { s += `<circle cx="${ox + 2 + x}" cy="22" r="0.9" fill="#000"/>`; lab.push(T(ox + 2 + x, k % 2 ? 29 : 26.5, nm, 2.5)); });
        lab.push(T(ox + 32, 35.5, ["1日め", "2日め"][d], 3), T(ox + 4, 8, "西", 2.5, { anchor: "start" }), T(ox + 60, 8, "東", 2.5, { anchor: "end" }));
      }
      return { fig: fig(128, 38, s, lab, 1.05), text: "雲(灰色)の動きを、2日間つづけてかんさつしました。雲の下では雨がふっています。", qs: [["雲は、どの方位からどの方位へ動いていますか。", "西から東"], ["3日めに雨がふると考えられるのは、どの都市ですか。", city[st + 2][0]], ["日本付近で、天気が西から東へかわっていくことが多いのはなぜですか。", "雲が西から東へ動いていくから"]], key: `c${st}`, side: false };
    } }
  ]));
  add(figs("r5.typhoonFig", [
    { lv: 1, make: (rng) => {
      const land = path("M30 10 Q38 12 44 18 Q52 26 60 28 Q70 30 76 26 L80 30 Q72 36 62 36 Q50 36 42 30 Q34 24 26 22 Q20 20 18 24 L14 22 Q18 14 30 10 Z", { f: C.leaf, w: 0.4 });
      const pts = [[30, 76], [26, 66], [27, 56], [32, 46], [40, 38], [52, 30]];
      const d0 = rng.int(1, 20);
      let s = land + `<polyline points="${pts.map((p) => p.join(",")).join(" ")}" fill="none" stroke="#000" stroke-width="0.5" stroke-dasharray="1.2 0.8"/>` + pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.2" fill="#fff" stroke="#000" stroke-width="0.4"/>`).join("") + arrowHead(40, 38, 52, 30);
      const lab = [T(27, 81, `${d0}日`, 2.6), T(36, 49, `${d0 + 2}日`, 2.6, { anchor: "start" }), T(62, 14, "日本", 3), T(14, 60, "海", 3)];
      return { fig: fig(84, 86, s, lab, 0.72), text: `ある台風の${d0}日から1日ごとの中心の位置を、○で表しました。`, qs: [["台風は、どの方位の海上から日本に近づいてきましたか。", "南"], ["台風が日本に近づくと、雨や風はどうなりますか。", "強くなる"], ["台風が多く日本に近づくのは、どの季節ですか。", "夏から秋"], ["台風によるさい害を1つ答えましょう。", "大雨によるこう水(強風で木がたおれる・高しお など)"]], key: `t${d0}`, side: true };
    } }
  ]));
  add(figs("r5.wombFig", [
    { lv: 1, make: (rng) => {
      const s = `<ellipse cx="32" cy="34" rx="24" ry="28" fill="${C.red}" stroke="#000" stroke-width="0.6"/><ellipse cx="32" cy="35" rx="20" ry="24" fill="${C.water}" stroke="#000" stroke-width="0.3"/>` + path("M46 18 Q54 26 51 38 Q48 30 42 24 Z", { f: "#c98", w: 0.3 }) + path("M47 28 Q40 36 34 40", { w: 1 }) + `<circle cx="26" cy="28" r="6" fill="#fde" stroke="#000" stroke-width="0.4"/><ellipse cx="29" cy="42" rx="7" ry="9" fill="#fde" stroke="#000" stroke-width="0.4"/>`;
      const L = rng.shuffle([["子宮", [32, 7]], ["たいばん", [51, 26]], ["へそのお", [41, 35]], ["羊水", [20, 52]]]);
      const lab = [];
      let lines2 = "";
      L.forEach(([, [x, y]], i) => {
        const right = x > 32;
        lines2 += line(x, y, right ? 63 : 6, y, { w: 0.3 }) + `<circle cx="${x}" cy="${y}" r="0.7" fill="#000"/>`;
        lab.push(M(right ? 66 : 3, y, LET[i]));
      });
      const ask = rng.shuffle([0, 1, 2, 3]).slice(0, 2);
      return { fig: fig(70, 66, s + lines2, lab), text: "図は、母親の子宮の中で育つ子どものようすです。", qs: [...ask.map((i) => [`${LET[i]}を何といいますか。`, L[i][0]]), ["子どもは、へそのおを通して、母親から何をもらいますか。", "養分(と酸素)"], ["人の子どもは、受精してから約何週間でうまれますか。", "約38週間"]], key: L.map((x) => x[0]).join() + ask.join(), side: true };
    } }
  ]));

  // ===================== 6年 =====================
  add(figs("r6.leafFig", [
    { lv: 1, make: (rng) => {
      const sunA = rng.chance(0.5);
      const rows = [["ア", sunA ? "日光に当てた" : "アルミニウムはくでおおった", sunA ? "青むらさき色になった" : "かわらなかった"], ["イ", sunA ? "アルミニウムはくでおおった" : "日光に当てた", sunA ? "かわらなかった" : "青むらさき色になった"]];
      const sun = sunA ? "ア" : "イ";
      return { fig: table(["葉", "朝から昼すぎまで", "ヨウ素液につけたようす"], rows), text: "前の日の夕方から、ジャガイモの葉ア・イをアルミニウムはくでおおっておきました。次の日の朝、片方のはくをはずして日光に当てました。", qs: [["でんぷんがあったのは、ア・イのどちらですか。", sun], ["この実験からわかることを書きましょう。", "葉に日光が当たると、でんぷんができる"], ["前の日の夕方から葉をアルミニウムはくでおおっておくのはなぜですか。", "はじめに葉にあるでんぷんをなくしておくため"]], key: `l${sunA}`, side: false };
    } },
    { lv: 2, make: (rng) => {
      const leafA = rng.chance(0.5);
      const rows = [["ア", leafA ? "葉をつけたまま" : "葉をとった", leafA ? "たくさんついた" : "少しついた"], ["イ", leafA ? "葉をとった" : "葉をつけたまま", leafA ? "少しついた" : "たくさんついた"]];
      return { fig: table(["", "ホウセンカ", "15分後のふくろの内がわ(水てき)"], rows), text: "ホウセンカにポリエチレンのふくろをかぶせて、水てきのつき方を調べました。", qs: [["水てきが多くついたのは、ア・イのどちらですか。", leafA ? "ア" : "イ"], ["この実験からわかることを書きましょう。", "根から吸い上げた水は、おもに葉から出ていく"], ["葉から水が水じょう気になって出ていくことを何といいますか。", "蒸散"]], key: `t${leafA}`, side: false };
    } }
  ]));
  add(figs("r6.chainFig", [
    { lv: 1, make: (rng) => {
      const chain = rng.pick([[["happa", "植物"], ["batta", "バッタ"], ["kaeru", "カエル"]], [["happa", "植物"], ["aomushi", "モンシロチョウのよう虫"], ["tsubame", "鳥"]]]);
      const items = rng.shuffle(chain.slice());
      return { fig: picRow(items.map((x) => x[0]), 26), text: `${rng.shuffle(chain.map((x) => x[1])).join("・")}の絵です。`, qs: [["「食べられるもの → 食べるもの」のじゅんに、記号をならべましょう。", chain.map((x) => LET[items.indexOf(x)]).join("→")], ["日光を受けて、自分で養分をつくることができるのはどれですか。", LET[items.indexOf(chain[0])]], ["このような、生き物どうしの「食べる・食べられる」のつながりを何といいますか。", "食物連さ"]], key: items.map((x) => x[0]).join(), side: false };
    } }
  ]));
  add(figs("r6.faultFig", [
    { lv: 1, make: (rng) => {
      const sh = rng.pick([5, 7, 9]);
      const cols = [C.sand, C.gray, C.yellow, C.leaf];
      let s = "";
      const xb = (y) => +(44 - (y - 2) * 0.22).toFixed(2);
      for (let i = 0; i < 4; i++) {
        const y = 6 + i * 9;
        s += poly([[4, y], [xb(y), y], [xb(y + 9), y + 9], [4, y + 9]], { f: cols[i], w: 0.3 });
        s += poly([[xb(y + sh), y + sh], [70, y + sh], [70, y + sh + 9], [xb(y + sh + 9), y + sh + 9]], { f: cols[i], w: 0.3 });
      }
      s += line(xb(2), 2, xb(52), 52, { w: 0.9 });
      return { fig: fig(74, 56, s, [M(49, 4, "ア")]), text: "図は、あるがけで見られた地層のようすです。アの線のところで、地層がずれています。", qs: [["アのような地層のずれを何といいますか。", "断層"], ["アのずれは、大地にどのようなことが起こってできましたか。", "大きな力がはたらいて、大地がずれた"], ["アのずれができるとき、いっしょに起こることが多いのは何ですか。", "地しん"]], key: `f${sh}`, side: true };
    } },
    { lv: 2, make: () => {
      let s = poly([[4, 50], [34, 10], [64, 50]], { f: C.sand, w: 0.5 }) + `<ellipse cx="34" cy="56" rx="16" ry="5" fill="${C.red}" stroke="#000" stroke-width="0.4"/>` + path("M34 51 L34 12", { w: 1.2, c: "#c44" }) + path("M30 10 Q34 0 40 4 Q46 -2 50 6", { w: 0.5, dash: "1 0.8" });
      return { fig: fig(70, 64, s, [M(55, 4, "ア"), M(56, 58, "イ")]), text: "図は、火山のつくりをかんたんに表したものです。アはふん火でふき出されたもの、イは地下にあるどろどろにとけたものです。", qs: [["イを何といいますか。", "マグマ"], ["アのうち、空からふりつもる細かいつぶを何といいますか。", "火山灰"], ["火山灰のつぶは、川原のすなのつぶとくらべて、どんな形をしていますか。", "角ばっている"]], key: "v", side: true };
    } }
  ]));
  add(figs("r6.elecFig", [
    { lv: 1, make: (rng) => {
      const a = rng.int(20, 40), b = a * rng.int(8, 15);
      const rows = rng.shuffle([["豆電球", `${a}秒`], ["発光ダイオード", `${b}秒`]]);
      return { fig: table(["つないだもの", "明かりがついていた時間"], rows), text: "手回し発電機を同じ回数回して、コンデンサーに電気をためました。それぞれのコンデンサーを、豆電球と発光ダイオードにつないで、明かりがついていた時間をはかりました。", qs: [["明かりが長くついたのはどちらですか。", "発光ダイオード"], ["この実験からわかることを書きましょう。", "発光ダイオードは、豆電球より使う電気の量が少ない"], ["この実験で、手回し発電機を回す回数を同じにしたのはなぜですか。", "ためる電気の量を同じにするため"]], key: `${a}${b}${rows[0][0]}`, side: false };
    } },
    { lv: 1, make: (rng) => {
      const items = rng.shuffle(["mamedenkyuu", "motor", "hatsudenki", "denchi"]);
      return { fig: picRow(items, 24), text: "電気にかかわる道具の絵です。", qs: [["電気を光にかえるものはどれですか。", LET[items.indexOf("mamedenkyuu")]], ["電気を回る動きにかえるものはどれですか。", LET[items.indexOf("motor")]], ["ハンドルを回して、電気をつくることができるものはどれですか。", LET[items.indexOf("hatsudenki")]]], key: items.join(), side: false };
    } }
  ]));
  add(figs("r6.earthFig", [
    { lv: 1, make: (rng) => {
      const d = rng.pick([0, 1]);
      const pts = [[1960, 317], [1970, 326], [1980, 339], [1990, 354], [2000, 369], [2010, 389], [2020, 412]];
      const g = graph({ xs: [1960, 2020, 10], ys: [300, 420, 20], xl: "(年)", yl: "(ppm)", lines: [{ pts }], w: 72, h: 40, x0: 16, y0: 7 });
      const q2 = d ? ["空気中の二酸化炭素がふえる原因の1つを答えましょう。", "石油や石炭などを燃やすこと(森林がへること など)"] : ["空気中の二酸化炭素をへらすために、わたしたちにできることを1つ答えましょう。", "電気を大切に使う(木を植える・車にあまり乗らない など)"];
      return { fig: fig(100, 60, g.raw, g.lab, 1.15), text: "グラフは、空気中の二酸化炭素の量(1ppmは100万分の1)の変化です。", qs: [["空気中の二酸化炭素の量は、どのように変わってきましたか。", "ふえてきた"], q2, ["二酸化炭素がふえることなどで、地球の気温が上がることを何といいますか。", "地球温暖化"]], key: `e${d}`, side: false };
    } }
  ]));

  // ===================== 中2 =====================
  add(figs("c2r.redoxFig", [
    { lv: 1, make: () => {
      let s = rect(4, 22, 34, 7, { f: "#fff", w: 0.5, r: 3 }) + rect(6, 23.5, 12, 4, { f: "#333", w: 0 }) + lamp(14, 52, true);
      s += path("M38 25 L52 25 L52 48", { w: 0.6 }) + beaker(56, 54, 18, 22, 0.6, { f: C.gray });
      return { fig: fig(70, 58, s, [M(12, 18, "ア"), M(68, 40, "イ")]), text: "酸化銅と炭素の粉をよく混ぜて試験管アに入れて加熱し、出てきた気体をイの石灰水に通しました。", qs: [["石灰水はどうなりましたか。", "白くにごった"], ["発生した気体は何ですか。", "二酸化炭素"], ["加熱後、試験管アに残った赤色の物質は何ですか。", "銅"], ["酸化銅に起こった、酸素がうばわれる化学変化を何といいますか。", "還元"]], key: "cuo", side: true };
    } },
    { lv: 2, make: (rng) => {
      const aHeat = rng.chance(0.5);
      const rows = [["A", aHeat ? "加熱した" : "加熱しない", aHeat ? "つかない" : "つく", aHeat ? "においのある気体" : "においのない気体"], ["B", aHeat ? "加熱しない" : "加熱した", aHeat ? "つく" : "つかない", aHeat ? "においのない気体" : "においのある気体"]];
      const h = aHeat ? "A" : "B";
      return { fig: table(["試験管", "鉄と硫黄の混合物", "磁石", "うすい塩酸を加えると"], rows), text: "鉄粉と硫黄の粉の混合物を2本の試験管A・Bに入れ、片方だけを加熱しました。", qs: [["加熱したのは、A・Bのどちらですか。", h], [`${h}の試験管にできた物質は何ですか。`, "硫化鉄"], [`${h}に塩酸を加えたときに出る、においのある気体は何ですか。`, "硫化水素"], ["加熱しなかった試験管に塩酸を加えたときに出る気体は何ですか。", "水素"]], key: `fe${aHeat}`, side: false };
    } }
  ]));
  add(figs("c2r.humidFig", [
    { lv: 2, make: (rng) => {
      const SAT = { 0: 4.8, 5: 6.8, 10: 9.4, 15: 12.8, 20: 17.3, 25: 23.1, 30: 30.4 };
      const T1 = rng.pick([20, 25, 30]), dew = rng.pick([0, 5, 10, 15].filter((t) => t < T1 - 4));
      const v = SAT[dew], hum = Math.round((v / SAT[T1]) * 100);
      const pts = Object.entries(SAT).map(([t, s]) => [+t, s]);
      const g = graph({ xs: [0, 30, 5], ys: [0, 32, 4], xl: "気温(℃)", yl: "飽和水蒸気量(g/m³)", lines: [{ pts }], w: 70, h: 44, x0: 16, y0: 9 });
      const low = rng.pick([0, 5].filter((t) => t < dew)) ?? null;
      const qs = [[`この空気の露点は何℃ですか。`, `${dew}℃`], [`この空気の湿度は何%ですか(小数第1位を四捨五入)。`, `${hum}%`]];
      if (low !== null && low !== undefined) qs.push([`この空気1m³を${low}℃まで冷やすと、何gの水滴ができますか。`, `${(v - SAT[low]).toFixed(1)}g`]);
      else qs.push(["気温が下がって露点より低くなると、空気中の水蒸気はどうなりますか。", "水滴になる(凝結する)"]);
      return { fig: fig(100, 66, g.raw, g.lab, 1.15), text: `グラフは、気温と飽和水蒸気量の関係です(0℃ 4.8g、5℃ 6.8g、10℃ 9.4g、15℃ 12.8g、20℃ 17.3g、25℃ 23.1g、30℃ 30.4g)。気温${T1}℃の空気1m³に、水蒸気が${v}gふくまれています。`, qs, key: `${T1}${dew}${low}`, side: false };
    } }
  ]));
  add(figs("c2r.heatFig", [
    { lv: 2, make: (rng) => {
      const W = rng.pick([[2, 4, 6], [3, 6, 9], [4, 8, 12]]), k = 0.5;
      const names = rng.shuffle(["A", "B", "C"]);
      const lines = W.map((w, i) => ({ pts: [0, 1, 2, 3, 4, 5].map((m) => [m, +(w * k * m / 2).toFixed(2)]), label: names[i] }));
      const top = Math.ceil(W[2] * k * 5 / 2 / 2) * 2 + 2;
      const g = graph({ xs: [0, 5, 1], ys: [0, top, 2], xl: "時間(分)", yl: "上昇温度(℃)", lines, w: 64, h: 44, x0: 14, y0: 9 });
      const big = names[2];
      return { fig: fig(96, 66, g.raw, g.lab, 1.15), text: `同じ量の水に、電力が${W[0]}W・${W[1]}W・${W[2]}Wの電熱線A〜C(順番はばらばら)を入れて電流を流し、水の上昇温度を調べました。`, qs: [["電力がいちばん大きい電熱線は、A〜Cのどれですか。", big], ["電流を流した時間と水の上昇温度には、どのような関係がありますか。", "比例する"], [`${W[2]}Wの電熱線に5分間電流を流したときに発生した熱量は何Jですか。`, `${W[2] * 300}J`]], key: W.join() + names.join(), side: false };
    } }
  ]));
  add(figs("c2r.staticFig", [
    { lv: 1, make: (rng) => {
      const P = [["ストローA と ストローB(どちらもティッシュでこすった)", "しりぞけ合う"], ["ストローA と こすったティッシュ", "引き合う"]];
      const rows = rng.shuffle(P.slice()).map((r, i) => [r[0], LET[i], r[1]]);
      return { fig: table(["近づけたもの", "どうなったか"], rows.map((r) => [r[0], r[1]])), text: "ストロー2本をティッシュペーパーでこすって静電気を起こし、近づけたときのようすを調べました。", qs: [...rows.map((r) => [`${r[1]}は、「引き合う」「しりぞけ合う」のどちらですか。`, r[2]]), ["ストローとティッシュは、同じ種類・ちがう種類のどちらの電気を帯びていますか。", "ちがう種類"]], key: rows.map((r) => r[2]).join(), side: false };
    } },
    { lv: 2, make: (rng) => {
      const up = rng.chance(0.5);
      let s = `<ellipse cx="40" cy="22" rx="34" ry="11" fill="#fff" stroke="#000" stroke-width="0.5"/>` + rect(4, 20, 6, 4, { f: C.gray, w: 0.4 }) + rect(70, 20, 6, 4, { f: C.gray, w: 0.4 }) + rect(26, 13, 26, 1.5, { f: "#000", w: 0 }) + rect(26, 30.5, 26, 1.5, { f: "#000", w: 0 });
      s += path(up ? "M10 22 Q40 22 70 16" : "M10 22 Q40 22 70 28", { w: 0.8, c: "#36c" });
      return { fig: fig(80, 42, s, [T(7, 30, "−極", 2.8), T(73, 30, "+極", 2.8), T(56, 14, up ? "+" : "−", 3.4), T(56, 34, up ? "−" : "+", 3.4)]), text: "クルックス管(真空放電管)に大きな電圧を加えると、−極から光のすじ(陰極線)が出ました。上下の電極板に電圧を加えると、すじが曲がりました。", qs: [["陰極線は、何という小さな粒子の流れですか。", "電子"], ["電子は、+・−のどちらの電気をもっていますか。", "−"], ["陰極線が曲がったのは、上下の電極板の+極・−極のどちら側ですか。", "+極側"]], key: `cr${up}`, side: true };
    } }
  ]));

  // ===================== 中3 =====================
  add(figs("c3r.cellFig", [
    { lv: 1, make: () => {
      let s = rect(8, 22, 56, 32, { f: "#fff", w: 0.6 }) + rect(8.4, 28, 27.4, 25.6, { f: C.gray, w: 0 }) + rect(36.2, 28, 27.4, 25.6, { f: C.sky, w: 0 }) + line(36, 24, 36, 54, { w: 0.6, dash: "1.2 0.8" });
      s += rect(18, 14, 4, 34, { f: "#bbb", w: 0.4 }) + rect(50, 14, 4, 34, { f: "#d98", w: 0.4 }) + path("M20 14 L20 6 L52 6 L52 14", { w: 0.5 }) + `<circle cx="36" cy="6" r="3.4" fill="#fff" stroke="#000" stroke-width="0.5"/>`;
      return { fig: fig(72, 64, s, [T(36, 7.4, "M", 3.4, { bold: true }), M(20, 59, "ア"), M(52, 59, "イ"), T(36, 20, "セロハン", 2.6)], 0.95), text: "図はダニエル電池です。アは亜鉛板(硫酸亜鉛水溶液)、イは銅板(硫酸銅水溶液)で、間をセロハンで仕切っています。", qs: [["−極になるのは、ア・イのどちらですか。", "ア"], ["電子は、導線の中をア→イ・イ→アのどちらの向きに流れますか。", "ア→イ"], ["イの銅板の表面では、どのような変化が起こりますか。", "銅イオンが電子を受けとって、銅が付着する"], ["電池は、何エネルギーを電気エネルギーに変える装置ですか。", "化学エネルギー"]], key: "dan", side: true };
    } },
    { lv: 2, make: (rng) => {
      const metals = [["マグネシウム", 3], ["亜鉛", 2], ["銅", 1]];
      const order = rng.shuffle(metals.slice());
      const sol = ["硫酸マグネシウム水溶液", "硫酸亜鉛水溶液", "硫酸銅水溶液"];
      const rows = order.map(([m, r]) => [m + "板", ...metals.map(([, r2], j) => (r2 === r ? "−" : r > r2 ? "付着した" : "変化なし"))]);
      return { fig: table(["金属 \\ 水溶液", ...sol], rows), text: "3種類の金属板を、3種類の水溶液に入れ、金属板に物質が付着するかどうかを調べました(−は調べていない)。", qs: [["亜鉛板を硫酸銅水溶液に入れたとき、亜鉛板に付着した物質は何ですか。", "銅"], ["マグネシウム・亜鉛・銅を、イオンになりやすいじゅんにならべましょう。", "マグネシウム→亜鉛→銅"], ["この中で、いちばんイオンになりにくい金属は何ですか。", "銅"]], key: order.map((x) => x[0]).join(), side: false };
    } }
  ]));
  add(figs("c3r.evoFig", [
    { lv: 1, make: (rng) => {
      const G = [["魚類", 5], ["両生類", 3.6], ["は虫類", 3.1], ["哺乳類", 2.2], ["鳥類", 1.5]];
      const ask = rng.shuffle([0, 1, 2, 3, 4]);
      let s = line(10, 4, 10, 58, { w: 0.8 }) + arrowHead(10, 10, 10, 58);
      const lab = [T(2, 2.5, "今から何億年前", 2.6, { anchor: "start" })];
      for (let v = 5; v >= 0; v--) { const y = 6 + (5 - v) * 10; s += line(8.5, y, 11.5, y, { w: 0.3 }); lab.push(T(7, y + 1, String(v), 2.6, { anchor: "end" })); }
      G.forEach(([, a], i) => { const y = 6 + (5 - a) * 10; s += line(10, y, 30, y, { w: 0.3, dash: "1 0.6" }) + `<circle cx="10" cy="${y}" r="0.9" fill="#000"/>`; lab.push(M(33, y, LET[ask.indexOf(i)])); });
      const pickQ = rng.pick([0, 1, 2]);
      const EX = [["両生類は、何類から進化したと考えられていますか。", "魚類"], ["鳥類は、何類から進化したと考えられていますか。", "は虫類"], ["は虫類と鳥類の両方の特徴をもつ、化石で見つかった動物を何といいますか。", "始祖鳥"]];
      return { fig: fig(56, 62, s, lab), text: "図は、脊椎動物のなかまア〜オが、地球上に現れたおよその時代を表したものです(下ほど新しい時代)。", qs: [[`いちばん古い時代に現れた${LET[ask.indexOf(0)]}は何類ですか。`, "魚類"], [`いちばん新しい時代に現れた${LET[ask.indexOf(4)]}は何類ですか。`, "鳥類"], EX[pickQ]], key: ask.join() + pickQ, side: true };
    } }
  ]));
  add(figs("c3r.planetFig", [
    { lv: 1, make: (rng) => {
      const P = [["水星", 0.38, 5.43, 0.39, 0], ["金星", 0.95, 5.24, 0.72, 0], ["火星", 0.53, 3.93, 1.52, 0], ["木星", 11.2, 1.33, 5.2, 1], ["土星", 9.45, 0.69, 9.55, 1], ["天王星", 4.01, 1.27, 19.2, 1], ["海王星", 3.88, 1.64, 30.1, 1]];
      const pick = rng.shuffle([...pickN(rng, P.filter((x) => !x[4]), 2), ...pickN(rng, P.filter((x) => x[4]), 2)]);
      const rows = pick.map((x, i) => [LET[i], String(x[1]), String(x[2]), String(x[3])]);
      const jov = pick.map((x, i) => (x[4] ? LET[i] : "")).filter(Boolean).join("、");
      const near = LET[pick.indexOf([...pick].sort((a, b) => a[3] - b[3])[0])];
      const light = LET[pick.indexOf([...pick].sort((a, b) => a[2] - b[2])[0])];
      return { fig: table(["惑星", "直径(地球=1)", "平均密度(g/cm³)", "太陽からの距離(地球=1)"], rows), text: "表は、太陽系の4つの惑星ア〜エのようすです。", qs: [["木星型惑星を2つ選び、記号で答えましょう。", jov], ["太陽にいちばん近い惑星はどれですか。", near], ["平均密度がいちばん小さい惑星はどれですか。", light], ["木星型惑星は、地球型惑星とくらべて、大きさと密度にどんな特徴がありますか。", "大きく、密度が小さい"]], key: pick.map((x) => x[0]).join(), side: false };
    } }
  ]));
  add(figs("c3r.powerFig", [
    { lv: 1, make: (rng) => {
      const K = rng.pick([["火力発電", ["化学エネルギー", "熱エネルギー", "運動エネルギー", "電気エネルギー"], "石油・石炭・天然ガスなどの燃料"], ["水力発電", ["位置エネルギー", "運動エネルギー", "電気エネルギー"], "ダムにためた水"], ["太陽光発電", ["光エネルギー", "電気エネルギー"], "太陽の光"]]);
      const chain = K[1], n = chain.length, bw = n === 4 ? 30 : 38, gap = 8;
      const hide = n === 2 ? [0] : rng.shuffle([...Array(n - 1).keys()]).slice(0, 2).sort();
      let s = "";
      const lab = [];
      chain.forEach((c, i) => {
        const x = 2 + i * (bw + gap);
        s += rect(x, 6, bw, 12, { f: "#fff", w: 0.5, r: 1.5 });
        if (i < n - 1) s += arrow(x + bw + 1, 12, x + bw + gap - 1, 12, { w: 0.5 });
        lab.push(hide.includes(i) ? M(x + bw / 2, 11, LET[hide.indexOf(i)]) : T(x + bw / 2, 13.3, c, 2.9));
      });
      const W = 4 + n * bw + (n - 1) * gap;
      return { fig: fig(W, 22, s, lab, 1.0), text: `${K[0]}で、エネルギーが移り変わるようすを表しました。${K[0]}では、${K[2]}を利用します。`, qs: [...hide.map((i, j) => [`${LET[j]}にあてはまるエネルギーは何ですか。`, chain[i]]), ["エネルギーが移り変わるとき、エネルギーの総量はどうなりますか。", "変わらない(保存される)"]], key: K[0] + hide.join(), side: false };
    } }
  ]));

  // ===================== 実験の考え方(条件をそろえる・結果からわかること) =====================
  add(figs("r5.growFig", [
    { lv: 1, make: (rng) => {
      const base = [["日光に当てる", "肥料あり", "よく育った"], ["日光に当てない", "肥料あり", "葉の色がうすく、くきが細かった"], ["日光に当てる", "肥料なし", "あまり育たなかった"]];
      const order = rng.shuffle([0, 1, 2]);
      const L = (k) => LET[order.indexOf(k)];
      const rows = order.map((k, i) => [LET[i], ...base[k]]);
      return { fig: table(["", "日光", "肥料", "2週間後のようす"], rows), text: "インゲンマメのなえを3つ用意し、日光と肥料の条件をかえて育てました(水・温度は同じ)。", qs: [["日光が成長にかかわるかを調べるには、どれとどれをくらべますか。", [L(0), L(1)].sort().join("と")], ["肥料が成長にかかわるかを調べるには、どれとどれをくらべますか。", [L(0), L(2)].sort().join("と")], ["この実験から、植物がよく成長するために必要なことを2つ答えましょう。", "日光、肥料"]], key: order.join(), side: false };
    } }
  ]));
  add(figs("r6.fireFig", [
    { lv: 1, make: (rng) => {
      const kinds = [[true, false, "すぐに消えた"], [false, true, "燃え続けた"], [false, false, "しばらくして消えた"]];
      const order = rng.shuffle([0, 1, 2]);
      let s = "";
      order.forEach((k, i) => {
        const [lid, gap] = kinds[k], x = 6 + i * 30;
        s += (gap ? rect(x, 44, 22, 3, { f: C.gray, w: 0.4 }) + rect(x + 2, 47, 4, 2, { f: C.gray, w: 0.3 }) + rect(x + 16, 47, 4, 2, { f: C.gray, w: 0.3 }) : rect(x, 46, 22, 3, { f: C.gray, w: 0.4 }));
        s += path(`M${x + 3} ${gap ? 44 : 46} L${x + 3} 14 Q${x + 3} 10 ${x + 7} 9 L${x + 7} 6 L${x + 15} 6 L${x + 15} 9 Q${x + 19} 10 ${x + 19} 14 L${x + 19} ${gap ? 44 : 46}`, { w: 0.5 });
        if (lid) s += rect(x + 5, 4, 12, 2, { f: "#666", w: 0.3 });
        s += rect(x + 9.5, gap ? 34 : 36, 3, 10, { f: "#fff", w: 0.4 }) + path(`M${x + 11} ${gap ? 28 : 30} Q${x + 13} ${gap ? 31 : 33} ${x + 11} ${gap ? 34 : 36} Q${x + 9} ${gap ? 31 : 33} ${x + 11} ${gap ? 28 : 30}`, { f: C.yellow, w: 0.3 });
      });
      const burn = LET[order.indexOf(1)];
      return { fig: fig(96, 58, s, order.map((k, i) => M(17 + i * 30, 54, LET[i]))), text: "底のないびんと、すき間のあるねん土・ないねん土を使って、火のついたろうそくにかぶせました(ふたをしたものもあります)。", qs: [["ろうそくがいちばん長く燃え続けたのは、ア〜ウのどれですか。", burn], [`${burn}のろうそくが燃え続けたのはなぜですか。`, "下のすき間から新しい空気が入り、上から出ていく(空気が入れかわる)から"], ["ものが燃え続けるためには、何が必要ですか。", "新しい空気(空気の入れかわり)"]], key: order.join(), side: false };
    } }
  ]));
  add(figs("r6.salivaFig", [
    { lv: 1, make: (rng) => {
      const aSal = rng.chance(0.5);
      const rows = [["ア", aSal ? "だ液を入れる" : "水を入れる", aSal ? "変化しない" : "青むらさき色になる"], ["イ", aSal ? "水を入れる" : "だ液を入れる", aSal ? "青むらさき色になる" : "変化しない"]];
      const sal = aSal ? "ア" : "イ", wat = aSal ? "イ" : "ア";
      return { fig: table(["試験管(ご飯つぶの液)", "入れたもの", "ヨウ素液を入れたようす"], rows), text: "ご飯つぶをもみ出した液を2本の試験管に入れ、片方にはだ液、もう片方には水を入れて、約40℃の湯に10分間つけました。", qs: [["でんぷんがなくなったのは、ア・イのどちらですか。", sal], ["この実験からわかることを書きましょう。", "だ液には、でんぷんを別のものにかえるはたらきがある"], ["湯の温度を約40℃にしたのはなぜですか。", "人の体温に近い温度にするため"], [`${wat}の試験管を用意したのはなぜですか。`, "でんぷんの変化が、だ液のはたらきによることをたしかめるため"]], key: `s${aSal}`, side: false };
    } }
  ]));
  add(figs("c2r.btbFig", [
    { lv: 2, make: (rng) => {
      const order = rng.shuffle([0, 1, 2]);
      const base = [["オオカナダモを入れる", "当てる", "青色"], ["オオカナダモを入れる", "当てない", "黄色"], ["何も入れない", "当てる", "緑色(変化なし)"]];
      const rows = order.map((k, i) => [LET[i], ...base[k]]);
      const L = (k) => LET[order.indexOf(k)];
      return { fig: table(["試験管", "中に入れたもの", "光", "数時間後のBTB溶液の色"], rows), text: "息をふきこんで緑色にしたBTB溶液を3本の試験管に入れ、条件をかえて置きました(光を当てないものはアルミニウムはくでおおいました)。", qs: [[`${L(0)}が青色になったのはなぜですか。`, "オオカナダモが光合成をして、二酸化炭素を使ったから"], [`${L(1)}が黄色になったのはなぜですか。`, "オオカナダモが呼吸だけを行い、二酸化炭素を出したから"], [`${L(2)}を用意したのはなぜですか。`, "色の変化が、オオカナダモのはたらきによることを確かめるため"], ["このように、調べたい条件以外を同じにして行う実験を何といいますか。", "対照実験"]], key: order.join(), side: false };
    } }
  ]));
  add(figs("c2r.amyFig", [
    { lv: 2, make: (rng) => {
      const sw = rng.chance(0.5);
      const rows = [["A", sw ? "だ液" : "水", "ヨウ素液", sw ? "変化なし" : "青紫色"], ["B", sw ? "水" : "だ液", "ヨウ素液", sw ? "青紫色" : "変化なし"], ["C", sw ? "だ液" : "水", "ベネジクト液(加熱)", sw ? "赤褐色の沈殿" : "変化なし"], ["D", sw ? "水" : "だ液", "ベネジクト液(加熱)", sw ? "変化なし" : "赤褐色の沈殿"]];
      const ab = "AとB", cd = "CとD";
      return { fig: table(["試験管", "デンプン溶液に加えたもの", "調べた薬品", "結果"], rows), text: "デンプン溶液を4本の試験管A〜Dに入れ、だ液か水を加えて、約40℃の湯に10分間入れたあと、薬品で調べました。", qs: [[`${ab}の結果からわかることを書きましょう。`, "だ液によってデンプンがなくなった(分解された)"], [`${cd}の結果からわかることを書きましょう。`, "だ液によって麦芽糖などの糖ができた"], ["だ液にふくまれる、デンプンを分解する消化酵素を何といいますか。", "アミラーゼ"]], key: `a${sw}`, side: false };
    } }
  ]));

  // ===================== 単元にくわえる =====================
  const grades = [typeof r1sei1Grade !== "undefined" && r1sei1Grade, typeof r2sei2Grade !== "undefined" && r2sei2Grade, r3Grade, r4Grade, r5Grade, r6Grade, r7chu1Grade, r8chu2Grade, r9chu3Grade].filter(Boolean);
  const unitOf = (uid) => {
    const u = grades.flatMap((g) => g.units).find((x) => x.id === uid);
    if (!u) throw new Error("図をくわえる単元がない: " + uid);
    return u;
  };
  const PLACE = [
    ["s1-01", "がっこうの へや(え)", "s1.roomFig"],
    ["s2-02", "まちの しせつ(え)", "s2.townFig"],
    ["s2-03", "いきものの すみか(え)", "s2.homeFig"],
    ["r3-01", "かんさつの道具と生き物(絵)", "r3.lookFig"],
    ["r3-08", "音の実験(表・絵)", "r3.soundFig"],
    ["r4-01", "季節のようすと気温(絵・グラフ)", "r4.seasonFig"],
    ["r4-04", "水のしみこみ方の実験(表)", "r4.soakFig"],
    ["r4-06", "じょう発の実験(図)", "r4.evapFig"],
    ["r4-07", "注しゃ器の実験(図)", "r4.syringeFig"],
    ["r5-01", "雲の動きと天気(図)", "r5.cloudFig"],
    ["r5-02", "成長の条件の実験(表)", "r5.growFig"],
    ["r5-05", "台風の進み方(図)", "r5.typhoonFig"],
    ["r5-08", "子宮の中の子ども(図)", "r5.wombFig"],
    ["r6-01", "燃え続ける条件の実験(図)", "r6.fireFig"],
    ["r6-02", "だ液のはたらきの実験(表)", "r6.salivaFig"],
    ["r6-03", "葉の実験(表)", "r6.leafFig"],
    ["r6-04", "食物連さ(絵)", "r6.chainFig"],
    ["r6-07", "断層と火山(図)", "r6.faultFig"],
    ["r6-09", "電気の利用(表・絵)", "r6.elecFig"],
    ["r6-11", "二酸化炭素のグラフ", "r6.earthFig"],
    ["k2-02", "酸化銅の還元・鉄と硫黄(図・表)", "c2r.redoxFig"],
    ["k2-05", "光合成の対照実験(表)", "c2r.btbFig"],
    ["k2-06", "だ液のはたらきの実験(表)", "c2r.amyFig"],
    ["k2-09", "飽和水蒸気量のグラフ", "c2r.humidFig"],
    ["k2-12", "電熱線と水の上昇温度(グラフ)", "c2r.heatFig"],
    ["k2-14", "静電気と陰極線(表・図)", "c2r.staticFig"],
    ["k3-02", "ダニエル電池・イオンへのなりやすさ(図・表)", "c3r.cellFig"],
    ["k3-06", "脊椎動物の出現(図)", "c3r.evoFig"],
    ["k3-12", "惑星の特徴(表)", "c3r.planetFig"],
    ["k3-14", "発電とエネルギーの移り変わり(図)", "c3r.powerFig"]
  ];
  for (const [uid, label, gid] of PLACE) {
    if (!out.some((g) => g.id === gid)) throw new Error("図の部品がない: " + gid);
    addTopic(unitOf(uid), label, gid, "f");
  }
  return out;
})();

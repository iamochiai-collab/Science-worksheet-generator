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
  // max:出す問題のむずかしさの上限、opts:答えをえらぶ選択肢の数(0 は書いて答える)
  const LV = { basic: { max: 1, opts: 3 }, normal: { max: 2, opts: 4 }, challenge: { max: 3, opts: 0 } };
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
  const optLine = (opts, kids) => opts.map((o, i) => `${LET[i]}　${o}`).join(kids || opts.join("").length > 34 ? "[[br]]" : "　　");
  // kids:1・2年(分かち書き)用のことば
  function render(it, rng, kids, p) {
    if (it.type === "qa") return { text: it.q, a: it.a };
    if (it.type === "tf") return { text: `（　　）${it.q}[[br]]${kids ? "〔ただしければ ○、まちがって いれば ×〕" : "〔{正|ただ}しければ○、まちがっていれば×〕"}`, a: it.a };
    if (it.type === "tfList") {
      const pick = rng.shuffle(it.list).slice(0, Math.min(it.list.length, 5));
      return { text: `${it.q}[[br]]${pick.map(([w], i) => `${LET[i]}（　　）${w}`).join("　")}`, a: pick.map(([, m]) => m).join("、"), wide: true };
    }
    if (it.type === "bank") {
      // 〔ことば〕から えらんで（　）に書く。ことばは 同じものを1回だけ出す
      const optN = p && p.opts !== undefined ? p.opts : 4;
      // ★3:〔ことば〕を出さずに書いて答える。★1:まぎらわしいことばを1つだけ
      if (optN === 0 && it.ans.length >= 2) return { text: `${kids ? "（　）に あう ことばを かきましょう。" : "（　）にあてはまることばを{書|か}きましょう。"}[[br]]${it.q}`.replace(/（　）に/, "（ ）に"), a: it.ans.join("、"), wide: true };
      const words = rng.shuffle([...new Set([...it.ans, ...(optN === 3 ? rng.shuffle(it.dummy).slice(0, 1) : it.dummy)])]);
      return { text: `${kids ? "あう ことばを、したの 〔　〕から えらんで かきましょう。" : "あてはまることばを、{下|した}の〔　〕からえらんで{書|か}きましょう。"}[[br]]${it.q}[[br]]〔 ${words.join(kids ? " ・ " : "・")} 〕`, a: it.ans.join("、"), wide: true };
    }
    if (it.type === "choice") {
      // ★3:「どれ」とたずねていない短い答えは、選択肢なしで書いて答える。★1:選択肢を3つまで
      const optN = p && p.opts !== undefined ? p.opts : 4;
      if (optN === 0 && !/どれ|どちら|えらび/.test(noRuby(it.q)) && [...noRuby(it.ok)].length <= 14) return { text: it.q, a: it.ok, written: true };
      const ng = optN === 3 ? rng.shuffle(it.ng).slice(0, 2) : it.ng;
      const opts = rng.shuffle([it.ok, ...ng]);
      return { text: `${it.q}[[br]]${optLine(opts, kids)}`, a: LET[opts.indexOf(it.ok)], wide: true };
    }
    // ならべる問題:ばらばらにして記号をつけ、正しい順の記号を答える
    const opts = rng.shuffle(it.seq.slice());
    return { text: `${it.q}[[br]]${optLine(opts, kids)}`, a: it.seq.map((s) => LET[opts.indexOf(s)]).join("→"), wide: true };
  }

  // ===== イラスト(絵文字)=====
  // 小学校・生活科の問題には、問いの中のことばから絵をえらんで、問題のよこに出す(答えのことばからはえらばない)
  // イラスト(assets/pic・assets/fig)。build で 名前 → [data URI, はば, 高さ] が入る
  const PIC_SRC = /*PICMAP*/{};
  const picSrc = (n) => (PIC_SRC[n] || [])[0] || "";
  // 図の中に絵を入れる部品(x, y, はば, 高さ は mm)
  const img = (n, x, y, w, h) => ({ t: "image", href: picSrc(n), x, y, w, h });
  // 問題のよこの絵:問いのことばに合わせてえらぶ(答えのことばからはえらばない)。名前がイラストにないときは絵文字
  const PICS = [
    ["アサガオ", "asagao"], ["ヒマワリ", "himawari"], ["チューリップ", "tulip"], ["サクラ", "sakura"], ["ホウセンカ", "housenka"], ["ヘチマ", "hechima"], ["インゲンマメ", "mebae"], ["ドングリ", "donguri"], ["おちば", "ichou"], ["{落|お}ち{葉|ば}", "ichou"], ["もみじ", "momiji"], ["{紅葉|こうよう}", "momiji"],
    ["モンシロチョウ", "monshiro"], ["アゲハ", "monshiro"], ["チョウ", "monshiro"], ["ちょう", "monshiro"], ["よう{虫|むし}", "aomushi"], ["あおむし", "aomushi"], ["さなぎ", "sanagi"], ["アリ", "ari"], ["テントウムシ", "tentou"], ["てんとうむし", "tentou"], ["バッタ", "batta"], ["コオロギ", "koorogi"], ["スズムシ", "koorogi"], ["セミ", "semi"], ["トンボ", "tonbo"], ["ヤゴ", "g_tonbo2"], ["カブトムシ", "kabuto"], ["こん{虫|ちゅう}", "tentou"], ["クモ", "spider"], ["カタツムリ", "katatsumuri"], ["ダンゴムシ", "dangomushi"],
    ["メダカ", "medaka"], ["{魚|さかな}", "medaka"], ["さかな", "medaka"], ["ザリガニ", "zarigani"], ["カエル", "kaeru"], ["ヒキガエル", "kaeru"], ["ツバメ", "tsubame"], ["{鳥|とり}", "tsubame"], ["ウサギ", "usagi"], ["イヌ", "inu"], ["{犬|いぬ}", "inu"], ["{動物|どうぶつ}", "usagi"], ["どうぶつ", "usagi"],
    ["ミニトマト", "minitomato"], ["トマト", "minitomato"], ["キュウリ", "kyuuri"], ["ナス", "nasu"], ["ピーマン", "piman"], ["ニンジン", "ninjin"], ["やさい", "ninjin"], ["{野菜|やさい}", "ninjin"],
    ["たね", "tane"], ["{芽|め}", "mebae"], ["{発芽|はつが}", "mebae"], ["{子葉|しよう}", "mebae"], ["{花|はな}", "housenka"], ["はな", "asagao"], ["{葉|は}", "happa"], ["はっぱ", "happa"], ["{根|ね}", "nekukiha"], ["くき", "nekukiha"], ["{植物|しょくぶつ}", "uekibachi"], ["{木|き}", "kinomi"], ["{森林|しんりん}", "mori"], ["{森|もり}", "mori"],
    ["じしゃく", "ujishaku"], ["{磁石|じしゃく}", "ujishaku"], ["{電磁石|でんじしゃく}", "ujishaku"], ["{方位|ほうい}じしん", "houijishin"], ["{方位|ほうい}{磁針|じしん}", "houijishin"], ["{豆|まめ}{電球|でんきゅう}", "mamedenkyuu"], ["{明|あ}かり", "mamedenkyuu"], ["かん{電池|でんち}", "denchi"], ["{電池|でんち}", "denchi"], ["{光電池|こうでんち}", "koudenchi"], ["{電気|でんき}", "inazuma"], ["{電流|でんりゅう}", "inazuma"], ["{回路|かいろ}", "mamedenkyuu"], ["モーター", "motor"], ["{手回|てまわ}し{発電|はつでん}{機|き}", "hatsudenki"], ["{発電|はつでん}", "hatsudenki"],
    ["{太陽|たいよう}", "taiyou"], ["{日|ひ}なた", "taiyou"], ["{日光|にっこう}", "taiyou"], ["かげ", "taiyou"], ["{三日月|みかづき}", "mikazuki"], ["{満月|まんげつ}", "mangetsu"], ["{月|つき}", "mikazuki"], ["{星|ほし}", "hoshi"], ["{雲|くも}", "kumo"], ["{雨|あめ}", "kasa"], ["{台風|たいふう}", "taifuu"], ["{天気|てんき}", "kumo"], ["{気温|きおん}", "ondokei"], ["{温度|おんど}", "ondokei"], ["{雪|ゆき}", "yukidaruma"], ["ゆき", "yukidaruma"], ["{氷|こおり}", "koori"], ["こおり", "koori"], ["ふゆ", "yukidaruma"], ["{冬|ふゆ}", "yukidaruma"], ["はる", "sakura"], ["{春|はる}", "sakura"], ["なつ", "himawari"], ["{夏|なつ}", "himawari"], ["あき", "momiji"], ["{秋|あき}", "momiji"],
    ["{火山|かざん}", "kazan"], ["ふん{火|ひ}", "kazan"], ["{地|じ}しん", "chisou"], ["{地層|ちそう}", "chisou"], ["{化石|かせき}", "ammonite"], ["{石|いし}", "ishi"], ["{川|かわ}", "kawa"], ["{流|なが}れる{水|みず}", "kawa"], ["{海|うみ}", "nami"], ["{地球|ちきゅう}", "chikyuu"],
    ["かがみ", "kagami"], ["{虫|むし}めがね", "mushimegane"], ["けんび{鏡|きょう}", "kenbikyou"], ["{顕微鏡|けんびきょう}", "kenbikyou"], ["{温度|おんど}{計|けい}", "ondokei"], ["アルコールランプ", "alcohol"], ["{燃|も}え", "rousoku"], ["{燃|も}や", "rousoku"], ["ろうそく", "rousoku"], ["{酸素|さんそ}", "shikenkan"], ["{二酸化炭素|にさんかたんそ}", "shikenkan"], ["{石灰|せっかい}{水|すい}", "shikenkan"], ["{空気|くうき}", "kaze"], ["{風|かぜ}", "kaze"], ["かぜ", "kazaguruma"], ["ゴム", "gomucar"], ["ふりこ", "furiko"], ["てこ", "teko"], ["{重|おも}さ", "tenbin"], ["てんびん", "tenbin"], ["{台|だい}ばかり", "denshitenbin"], ["{電子|でんし}てんびん", "denshitenbin"],
    ["{音|おと}", "taiko"], ["たいこ", "taiko"], ["{糸|いと}{電話|でんわ}", "itodenwa"], ["{水|みず}よう{液|えき}", "shikenkan"], ["{水溶液|すいようえき}", "shikenkan"], ["リトマス{紙|し}", "shikenkan"], ["{食塩|しょくえん}", "shokuen"], ["ミョウバン", "shokuen"], ["{水|みず}じょう{気|き}", "yakan"], ["ふっとう", "yakan"], ["{湯|ゆ}", "yakan"], ["{水|みず}", "shizuku"],
    ["ほね", "hone"], ["{骨|ほね}", "hone"], ["きん{肉|にく}", "ude"], ["うで", "ude"], ["{関節|かんせつ}", "gaikotsu"], ["{心臓|しんぞう}", "shinzou"], ["{心|こころ}ぞう", "shinzou"], ["{血液|けつえき}", "chi"], ["{脈|みゃく}はく", "shinzou"], ["{肺|はい}", "hai"], ["{呼吸|こきゅう}", "hai"], ["{胃|い}", "i"], ["だ{液|えき}", "onigiri"], ["{食|た}べ{物|もの}", "onigiri"], ["{消化|しょうか}", "i"], ["{赤|あか}ちゃん", "akachan"], ["{子|こ}ども", "akachan"], ["{母親|ははおや}", "ninpu"], ["{子宮|しきゅう}", "ninpu"], ["{人|ひと}の{体|からだ}", "gaikotsu"],
    ["ほけんしつ", "kyuukyuu"], ["けが", "kyuukyuu"], ["としょしつ", "hon"], ["としょかん", "hon"], ["きゅうしょく", "kyuushoku"], ["せんせい", "sensei"], ["こうちょう", "sensei"], ["しょうぼう", "shoubousha"], ["かじ", "shoubousha"], ["ゆうびん", "post"], ["てがみ", "post"], ["こうばん", "kouban"], ["おまわりさん", "kouban"], ["びょういん", "byouin"], ["こうえん", "kouen"], ["しんごう", "shingou"], ["どうろ", "shingou"], ["あいさつ", "aisatsu"], ["てを あらう", "tearai"], ["{手|て}をあらう", "tearai"], ["がっこう", "gakkou"], ["{学校|がっこう}", "gakkou"], ["まち", "machi"],
    ["ふうせん", "fuusen"], ["かざぐるま", "kazaguruma"], ["おもちゃ", "kuma"], ["いきもの", "dangomushi"], ["{生|い}き{物|もの}", "tentou"], ["ごみ", "recycle"], ["リサイクル", "recycle"], ["{光|ひかり}", "taiyou"], ["ストップウォッチ", "stopwatch"]
  ].map(([w, e]) => [noRuby(w), e]).sort((a, b) => b[0].length - a[0].length);
  const PIC_DEF = { "s1.school": "gakkou", "s1.asagao": "asagao", "s1.creature": "dangomushi", "s1.season": "momiji", "s2.veg": "minitomato", "s2.town": "machi", "s2.creature": "zarigani", "s2.toy": "kazaguruma", "sum.s1-01": "gakkou", "sum.s1-02": "asagao", "sum.s1-03": "dangomushi", "sum.s1-04": "momiji", "sum.s2-01": "minitomato", "sum.s2-02": "machi", "sum.s2-03": "zarigani", "sum.s2-04": "kazaguruma" };
  const picScope = (id) => /^(s\d|r[3-6])\./.test(id) || /^sum\.(s\d|r[3-6])-/.test(id);
  // 問いの文から、絵の名前を1つか2つえらぶ(「、」でつないで返す)
  function picOf(q, def) {
    let t = noRuby(q);
    const out = [];
    for (const [w, e] of PICS) {
      if (out.length >= 2) break;
      const i = t.indexOf(w);
      if (i < 0) continue;
      if (!out.includes(e)) out.push(e);
      t = t.slice(0, i) + "　".repeat(w.length) + t.slice(i + w.length);
    }
    return out.length ? out.join(",") : def || "";
  }
  // 問題のよこの絵の HTML
  const picHtml = (pic) => String(pic).split(",").filter(Boolean).map((n) => (picSrc(n) ? `<img src="${picSrc(n)}" alt="">` : `<span>${n}</span>`)).join("");

  // ===== 書いて答える問題に、難易度に合わせて選択肢をつける =====
  // 同じ小単元のほかの問題の答えを、まちがいの選択肢にする
  const shortAns = (a) => noRuby(a).replace(/\(.*?\)|（.*?）/g, "").trim();
  function candidatesOf(items) {
    const out = [];
    for (const it of items) {
      if (it.type === "qa") out.push(it.a);
      else if (it.type === "choice") out.push(it.ok, ...it.ng);
      else if (it.type === "bank") out.push(...it.ans, ...it.dummy);
    }
    const seen = new Set();
    return out.filter((a) => {
      const k = shortAns(a);
      if (!k || /、|，|,/.test(k) || [...k].length > 28 || seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }
  const isNum = (s) => /^[0-9０-９.{約|やく}〜−-]/.test(s);
  // 問いの形で、つける選択肢の種類を決める(合わない問いには つけない)
  const NAME_Q = /{何|なん}といい|{何|なん}という|{名前|なまえ}|{何|なん}ですか|{何|なん}でしょう|{何|なに}を|{何|なに}が|{何|なに}に|{何|なん}の|{何|なに}{色|いろ}|{何|なに}{性|せい}|{何|なに}{類|るい}|{何|なに}{極|きょく}|{何|なに}きょく|どこ|だれ/;
  const SKIP_Q = /か、|なぜ|どうして|{理由|りゆう}|どのように|どうします|どうすれば|どうしたら|{書|か}きましょう|{答|こた}えましょう|ちがい|1つ/;
  const CHANGE = [["{大|おお}きくなる", "{小|ちい}さくなる"], ["ふえる", "へる"], ["{高|たか}くなる", "{低|ひく}くなる"], ["{長|なが}くなる", "{短|みじか}くなる"], ["{速|はや}くなる", "おそくなる"], ["{強|つよ}くなる", "{弱|よわ}くなる"], ["{上|あ}がる", "{下|さ}がる"], ["{明|あか}るくなる", "{暗|くら}くなる"], ["あたたかくなる", "つめたくなる"], ["{重|おも}くなる", "{軽|かる}くなる"], ["{多|おお}くなる", "{少|すく}なくなる"], ["{大|おお}きい", "{小|ちい}さい"], ["{高|たか}い", "{低|ひく}い"], ["{長|なが}い", "{短|みじか}い"], ["{速|はや}い", "おそい"], ["{多|おお}い", "{少|すく}ない"], ["{強|つよ}い", "{弱|よわ}い"], ["{明|あか}るい", "{暗|くら}い"]];
  const looksName = (a) => !/(る|い|た|ない|ます|です|だ|れる|する)$/.test(shortAns(a));
  function changeOpts(okS) {
    for (const pair of CHANGE) {
      const k = pair.indexOf(okS);
      if (k >= 0) return [pair[1 - k], okS === "かわらない" || okS === "{変|か}わらない" ? pair[0] : "かわらない"];
    }
    if (/^(かわらない|{変|か}わらない|{同|おな}じ)$/.test(okS)) return ["{大|おお}きくなる", "{小|ちい}さくなる"];
    return null;
  }
  function numOpts(rng, okS) {
    const m = /(\d+(?:\.\d+)?)/.exec(okS);
    if (!m) return null;
    const n = Number(m[1]), dec = (m[1].split(".")[1] || "").length;
    const fmt = (v) => okS.replace(m[1], String(+v.toFixed(dec)));
    const cand = [...new Set([n * 2, n / 2, n + (dec ? 0.1 : 1) * (n >= 10 ? 10 : 1), n - (dec ? 0.1 : 1) * (n >= 10 ? 10 : 1), n * 3, n + (dec ? 0.2 : 2)].map((v) => +v.toFixed(dec)).filter((v) => v > 0 && v !== n && (dec || Number.isInteger(v))))];
    return rng.shuffle(cand).slice(0, 3).map(fmt);
  }
  // ことばのなかま(同じなかまのことばを、まちがいの選択肢にする)
  const FAM = `
{東|ひがし},{西|にし},{南|みなみ},{北|きた}
{春|はる},{夏|なつ},{秋|あき},{冬|ふゆ}
{根|ね},くき,{葉|は},{花|はな},{実|み},たね,{子葉|しよう},{芽|め}
めしべ,おしべ,{花|はな}びら,がく,{子房|しぼう},{胚珠|はいしゅ},{柱頭|ちゅうとう},やく
{頭|あたま},むね,はら,しょっかく,あし,はね
たまご,よう{虫|むし},さなぎ,{成虫|せいちゅう},ヤゴ
{食道|しょくどう},{胃|い},{小腸|しょうちょう},{大腸|だいちょう},かん{臓|ぞう},じん{臓|ぞう},{肺|はい},{心臓|しんぞう}
{食道|しょくどう},{胃|い},{小腸|しょうちょう},{大腸|だいちょう},{肝臓|かんぞう},じん{臓|ぞう},{肺|はい},{心臓|しんぞう},すい{臓|ぞう}
{酸素|さんそ},{二酸化炭素|にさんかたんそ},ちっ{素|そ},{水素|すいそ},{水|みず}じょう{気|き}
{酸素|さんそ},{二酸化炭素|にさんかたんそ},{窒素|ちっそ},{水素|すいそ},アンモニア,{塩素|えんそ}
{動脈|どうみゃく},{静脈|じょうみゃく},{毛細血管|もうさいけっかん}
{赤血球|せっけっきゅう},{白血球|はっけっきゅう},{血小板|けっしょうばん},{血|けっ}しょう
アミラーゼ,ペプシン,リパーゼ,トリプシン
ブドウ{糖|とう},アミノ{酸|さん},{脂肪酸|しぼうさん},デンプン
{固体|こたい},{液体|えきたい},{気体|きたい}
{酸性|さんせい},{中性|ちゅうせい},アルカリ{性|せい}
N{極|ごく},S{極|ごく}
Nきょく,Sきょく
{直列|ちょくれつ},{並列|へいれつ}
{直列|ちょくれつ}つなぎ,へい{列|れつ}つなぎ
アンペア,ボルト,オーム,ワット,ジュール,パスカル,ニュートン,ヘルツ
{積乱雲|せきらんうん},{乱層雲|らんそううん},{巻雲|まきぐも},{積雲|せきうん},{層雲|そううん}
{積|せき}らん{雲|くも},らんそう{雲|くも},けん{雲|くも},{積雲|せきうん}
{寒冷|かんれい}{前線|ぜんせん},{温暖|おんだん}{前線|ぜんせん},{閉|へい}そく{前線|ぜんせん},{停滞|ていたい}{前線|ぜんせん},{梅雨|つゆ}{前線|ぜんせん}
シベリア{気団|きだん},{小笠原|おがさわら}{気団|きだん},オホーツク{海|かい}{気団|きだん}
{高気圧|こうきあつ},{低|てい}{気圧|きあつ}
{安山岩|あんざんがん},{玄武岩|げんぶがん},{流紋岩|りゅうもんがん},{花|か}こう{岩|がん},はんれい{岩|がん},{閃緑岩|せんりょくがん}
れき{岩|がん},{砂岩|さがん},{泥岩|でいがん},{石灰岩|せっかいがん},チャート,{凝灰岩|ぎょうかいがん}
{砂岩|さがん},でい{岩|いわ},れき{岩|がん},{石灰岩|せっかいがん}
{長石|ちょうせき},{石英|せきえい},{黒雲母|くろうんも},{角閃石|かくせんせき},{輝石|きせき}
{火山岩|かざんがん},{深成岩|しんせいがん},{堆積岩|たいせきがん},{火成岩|かせいがん}
{斑状|はんじょう}{組織|そしき},{等粒状|とうりゅうじょう}{組織|そしき}
{震源|しんげん},{震央|しんおう},{震度|しんど},マグニチュード
{初期|しょき}{微動|びどう},{主要動|しゅようどう},{余震|よしん}
P{波|なみ},S{波|なみ}
しん{食|しょく},{運|うん}ぱん,たい{積|せき}
{風化|ふうか},{侵食|しんしょく},{運搬|うんぱん},{堆積|たいせき}
{示相|しそう}{化石|かせき},{示準|しじゅん}{化石|かせき}
{古生代|こせいだい},{中生代|ちゅうせいだい},{新生代|しんせいだい}
{反射|はんしゃ},{屈折|くっせつ},{全|ぜん}{反射|はんしゃ}
{実像|じつぞう},{虚像|きょぞう}
{焦点|しょうてん},{光|ひかり}{軸|じく},{光源|こうげん}
{振幅|しんぷく},{振動|しんどう}{数|すう},{波長|はちょう}
{重力|じゅうりょく},{垂直|すいちょく}{抗力|こうりょく},{摩擦|まさつ}{力|りょく},{弾性|だんせい}{力|りょく},{磁力|じりょく},{浮力|ふりょく}
{支点|してん},{力点|りきてん},{作用|さよう}{点|てん}
{魚類|ぎょるい},{両生類|りょうせいるい},は{虫類|ちゅうるい},{鳥類|ちょうるい},{哺乳類|ほにゅうるい}
{胎生|たいせい},{卵生|らんせい}
{恒温動物|こうおんどうぶつ},{変温動物|へんおんどうぶつ}
{脊椎動物|せきついどうぶつ},{無|む}{脊椎動物|せきついどうぶつ},{節足動物|せっそくどうぶつ},{軟体|なんたい}{動物|どうぶつ}
{被子植物|ひししょくぶつ},{裸子植物|らししょくぶつ},シダ{植物|しょくぶつ},コケ{植物|しょくぶつ},{種子|しゅし}{植物|しょくぶつ}
{単|たん}{子葉|しよう}{類|るい},{双|そう}{子葉|しよう}{類|るい},{離|はなれ}{弁|べん}{花|はな}{類|るい},{合弁|ごうべん}{花|はな}{類|るい}
{平行脈|へいこうみゃく},{網状脈|もうじょうみゃく}
{主|しゅ}{根|ね}と{側|がわ}{根|ね},ひげ{根|ね}
{核|かく},{葉緑体|ようりょくたい},{細胞壁|さいぼうへき},{細胞膜|さいぼうまく},{液胞|えきほう}
{組織|そしき},{器官|きかん},{個体|こたい},{細胞|さいぼう}
{単細胞|たんさいぼう}{生物|せいぶつ},{多|た}{細胞|さいぼう}{生物|せいぶつ}
{道管|どうかん},{師管|しかん},{維管束|いかんそく},{気孔|きこう},{孔辺|こうへん}{細胞|さいぼう},{根毛|こんもう}
{光合成|こうごうせい},{呼吸|こきゅう},{蒸散|じょうさん}
{中枢|ちゅうすう}{神経|しんけい},{末|まっ}しょう{神経|しんけい},{感覚|かんかく}{神経|しんけい},{運動|うんどう}{神経|しんけい}
{網膜|もうまく},{鼓膜|こまく},{水晶体|すいしょうたい},こうさい
{分解|ぶんかい},{化合|かごう},{酸化|さんか},{還元|かんげん},{燃焼|ねんしょう},{中和|ちゅうわ}
{熱分解|ねつぶんかい},{電気|でんき}{分解|ぶんかい}
{単体|たんたい},{化合|かごう}{物|ぶつ},{混合|こんごう}{物|ぶつ}
{原子|げんし},{分子|ぶんし},イオン,{電子|でんし},{陽子|ようし},{中性子|ちゅうせいし},{原子核|げんしかく}
{発熱|はつねつ}{反応|はんのう},{吸熱|きゅうねつ}{反応|はんのう}
{陽|よう}イオン,{陰|いん}イオン
{電解|でんかい}{質|しつ},{非|ひ}{電解|でんかい}{質|しつ}
H,O,C,N,Fe,Cu,Na,Mg,Ag,Zn,S,Cl
H₂O,CO₂,O₂,H₂,N₂,NH₃,NaCl,CuO
{溶質|ようしつ},{溶媒|ようばい},{溶液|ようえき}
{融点|ゆうてん},{沸点|ふってん},{露点|ろてん}
{蒸留|じょうりゅう},ろ{過|か},{再|さい}{結晶|けっしょう}
{飽和|ほうわ}{水溶液|すいようえき},{溶解|ようかい}{度|ど},{溶解|ようかい}{度|ど}{曲線|きょくせん}
{体|からだ}{細胞|さいぼう}{分裂|ぶんれつ},{減数|げんすう}{分裂|ぶんれつ}
{有性|ゆうせい}{生殖|せいしょく},{無性|むせい}{生殖|せいしょく},{栄養|えいよう}{生殖|せいしょく}
{顕|あらわ}{性|せい}{形質|けいしつ},{潜|せん}{性|せい}{形質|けいしつ},{対立|たいりつ}{形質|けいしつ}
{遺伝子|いでんし},{染色|せんしょく}{体|たい},DNA,{核|かく}
{等速|とうそく}{直線|ちょくせん}{運動|うんどう},{自由|じゆう}{落下|らっか}
{位置|いち}エネルギー,{運動|うんどう}エネルギー,{力学|りきがく}{的|てき}エネルギー,{熱|ねつ}エネルギー,{電気|でんき}エネルギー,{化学|かがく}エネルギー
{伝導|でんどう},{対流|たいりゅう},{放射|ほうしゃ}
{自転|じてん},{公転|こうてん}
{日|にち}{周|しゅう}{運動|うんどう},{年|とし}{周|しゅう}{運動|うんどう}
{夏至|げし},{冬至|とうじ},{春分|しゅんぶん},{秋分|しゅうぶん}
{日食|にっしょく},{月食|げっしょく}
{新月|しんげつ},{満月|まんげつ},{上|じょう}げんの{月|つき},{下|か}げんの{月|つき},{三日月|みかづき}
{恒星|こうせい},{惑星|わくせい},{衛星|えいせい},{小惑星|しょうわくせい}
{水星|すいせい},{金星|きんせい},{地球|ちきゅう},{火星|かせい},{木星|もくせい},{土星|どせい},{天王星|てんおうせい},{海王星|かいおうせい}
よいの{明星|みょうじょう},{明|あ}けの{明星|みょうじょう}
{太陽系|たいようけい},{銀河系|ぎんがけい}
{地球|ちきゅう}{型|がた}{惑星|わくせい},{木星|もくせい}{型|がた}{惑星|わくせい}
{生産|せいさん}{者|しゃ},{消費|しょうひ}{者|しゃ},{分解|ぶんかい}{者|しゃ}
{食物|しょくもつ}{連鎖|れんさ},{食物|しょくもつ}{網|もう}
{磁界|じかい},{磁力|じりょく}{線|せん},{電磁|でんじ}{誘導|ゆうどう},{誘導|ゆうどう}{電流|でんりゅう}
{直流|ちょくりゅう},{交流|こうりゅう}
{静電気|せいでんき},{放電|ほうでん},{真空|しんくう}{放電|ほうでん}
{陰極線|いんきょくせん},{放射線|ほうしゃせん}
{化石|かせき}{燃料|ねんりょう},{再生|さいせい}{可能|かのう}エネルギー,バイオマス
{快晴|かいせい},{晴|は}れ,くもり,{雨|あめ},{雪|ゆき}
{気団|きだん},{前線|ぜんせん},{前線面|ぜんせんめん}
{上昇|じょうしょう}{気流|きりゅう},{下降|かこう}{気流|きりゅう}
{季節風|きせつふう},{偏西風|へんせいふう}
{圧力|あつりょく},{大気圧|たいきあつ},{重力|じゅうりょく}
{発芽|はつが},{受粉|じゅふん},{受精|じゅせい}
{受精卵|じゅせいらん},{精子|せいし},{卵|たまご}
{子宮|しきゅう},{羊水|ようすい},へそのお,たいばん
コイル,{電磁石|でんじしゃく},じしゃく,モーター
ほね,きん{肉|にく},{関節|かんせつ}
じょう{発|はつ},ふっとう,{水|みず}じょう{気|き}
{回路|かいろ},{金|きん}ぞく
{検|けん}{流|りゅう}{計|けい},{電流|でんりゅう}{計|けい},{電圧|でんあつ}{計|けい}
{百葉箱|ひゃくようばこ},{温度|おんど}{計|けい},{方位|ほうい}じしん,{虫|むし}めがね,{台|だい}ばかり
でんぷん,ヨウ{素|そ}{液|えき},{石灰|せっかい}{水|すい}
{地層|ちそう},{化石|かせき},{火山灰|かざんばい},{断層|だんそう}
れき,すな,どろ
{食物|しょくもつ}{連|れん}さ,{呼吸|こきゅう},{消化|しょうか}
{消化|しょうか},{吸収|きゅうしゅう},{呼吸|こきゅう}
はく{動|どう},{脈|みゃく}はく
{蒸散|じょうさん},{気孔|きこう},{呼吸|こきゅう}
てこ,{支点|してん},ふりこ
{電流|でんりゅう},{電圧|でんあつ},{抵抗|ていこう},{電力|でんりょく}
{熱量|ねつりょう},{電力|でんりょく}{量|りょう},{電力|でんりょく}
{感覚|かんかく}{器官|きかん},{反射|はんしゃ},けん
ふん{火|ひ},{断層|だんそう},{地|じ}しん,よう{岩|いわ},つなみ
しりびれ,せびれ,むなびれ,おびれ
おす,めす
{受精|じゅせい},{受粉|じゅふん},{発芽|はつが}
{回路|かいろ}{図|ず},{電流|でんりゅう}{計|けい},{電圧|でんあつ}{計|けい}
{惑星|わくせい},{恒星|こうせい},{衛星|えいせい}
ルーペ,{双眼|そうがん}{実体|じったい}{顕微鏡|けんびきょう},{顕微鏡|けんびきょう}
{対物|たいぶつ}レンズ,{接眼|せつがん}レンズ,{反射鏡|はんしゃきょう},ステージ
{有機物|ゆうきぶつ},{無機物|むきぶつ},{金属|きんぞく}
{水上|すいじょう}{置換法|ちかんほう},{上方|じょうほう}{置換法|ちかんほう},{下方|かほう}{置換法|ちかんほう}
マグマ,{溶岩|ようがん},{火山灰|かざんばい},{鉱物|こうぶつ}
{光源|こうげん},{音源|おんげん}
{天球|てんきゅう},{黄道|こうどう},{南中|なんちゅう}
{月|つき}の{満|み}ち{欠|か}け,{日食|にっしょく},{月食|げっしょく}
{二|に}{次|じ}{電池|でんち},{一|いち}{次|じ}{電池|でんち},{燃料|ねんりょう}{電池|でんち}
{化石|かせき},{示相|しそう}{化石|かせき},{示準|しじゅん}{化石|かせき}
{蓄電|ちくでん},{発電|はつでん},{放電|ほうでん}
コンデンサー,{発光|はっこう}ダイオード,{豆|まめ}{電球|でんきゅう},モーター
{電灯|でんとう},{電熱|でんねつ}{線|せん},せん{風|ふう}{機|き},スピーカー
{地球|ちきゅう}{温暖|おんだん}{化|か},リサイクル
{晴|は}れ,くもり,{雨|あめ}
`.trim().split("\n").map((l) => l.split(",").map((w) => noRuby(w).trim()));
  // 選択肢をつけられる問題か(★1 では、なるべく選んで答える問題を出す)
  function optionable(it, cands) {
    if (it.type !== "qa") return true;
    const fake = { next: () => 0.5, int: (a) => a, pick: (x) => x[0], shuffle: (x) => x.slice() };
    const r = withOptions({ text: "", a: "" }, it, fake, { opts: 3 }, cands, false);
    return r.a !== "";
  }
  function withOptions(r, it, rng, p, cands, kids) {
    if (it.type !== "qa" || !p || !p.opts) return r;
    const ok = String(it.a), okS = shortAns(ok), q = noRuby(it.q);
    if (!okS || /、/.test(okS) || [...okS].length > 18 || /（[　 ]{2,}）/.test(it.q) || SKIP_Q.test(q)) return r;
    let ng = null;
    if (/\d/.test(okS) && isNum(okS) && [...okS].length <= 10) ng = numOpts(rng, okS);
    else if (changeOpts(okS)) ng = changeOpts(okS);
    else {
      const fams = FAM.filter((f) => f.includes(okS));
      if (fams.length) {
        // いちばん合うなかま(まちがいが3つ以上とれるもの)を使う。同じ意味のことば(ちっ素・窒素など)がまざらないように、なかまはまぜない
        const pick = fams.find((f) => f.filter((w) => w !== okS && !q.includes(w)).length >= Math.max(2, (p.opts || 3) - 1)) || fams[0];
        ng = pick.filter((w) => w !== okS && !q.includes(w));
      } else if (/^c\dr\./.test(it.id || "") && NAME_Q.test(q) && looksName(ok) && [...okS].length <= 10 && !/ところ|とき|から|ため|こと|よう/.test(okS)) {
        // 中学:同じ小単元のことばの答えを、まちがいの選択肢にする
        const L = [...okS].length, ascii = /^[\x20-\x7e₀-₉⁺⁻²³→＋]+$/.test(okS);
        const pool = cands.filter((c) => {
          const cs = shortAns(c);
          return cs !== okS && looksName(c) && [...cs].length <= 10 && !isNum(cs) && ascii === /^[\x20-\x7e₀-₉⁺⁻²³→＋]+$/.test(cs) && !cs.includes(okS) && !okS.includes(cs) && !q.includes(cs) && !/ところ|とき|から|ため|こと|よう/.test(cs);
        });
        ng = rng.shuffle(pool).sort((a, b) => Math.abs([...shortAns(a)].length - L) - Math.abs([...shortAns(b)].length - L)).slice(0, 4).map((c) => c.replace(/\(.*?\)|（.*?）/g, "").trim());
      }
    }
    if (!ng) return r;
    ng = rng.shuffle(ng).slice(0, p.opts - 1);
    // 2つでひと組のことば(P波・S波、直列・並列など)は、2択でもよい
    if (ng.length < 1 || (ng.length < 2 && !FAM.some((f) => f.includes(okS)))) return r;
    const okText = ok.replace(/\(.*?\)|（.*?）/g, "").trim();
    const opts = rng.shuffle([okText, ...ng]);
    return { text: `${it.q}[[br]]${optLine(opts, kids)}`, a: LET[opts.indexOf(okText)], wide: true };
  }

  // ===== ことば・しくみの問題 =====
  function bank(id, src, o = {}) {
    const items = parse(src);
    for (const it of items) it.id = id;
    const cands = candidatesOf(items);
    for (const it of items) it.optable = optionable(it, cands);
    return {
      id,
      instruction: o.inst === undefined ? "{次|つぎ}の{問|と}いに{答|こた}えましょう。" : o.inst,
      defaults: { max: 1 },
      levels: LV,
      generate(rng, p, ctx) {
        let pool = items.filter((x) => x.lv <= p.max);
        if (!pool.length) pool = items;
        if (p.opts === 3) {
          const op = pool.filter((x) => x.optable);
          if (op.length >= 4) pool = op;
        }
        const it = pickW(rng, pool, p.max);
        const r = withOptions(render(it, rng, o.kids || /^s\d\./.test(id), p), it, rng, p, cands, o.kids || /^s\d\./.test(id));
        // 問題を全部使いきったら、同じ問題も出せるようにする(round)
        const round = ctx && Number.isInteger(ctx.index) ? Math.floor(ctx.index / pool.length) : 0;
        const pic = o.pic === false || !picScope(id) ? "" : picOf(it.q, o.pic || PIC_DEF[id]);
        return { key: `${id}:${items.indexOf(it)}#${round}`, text: r.text, wide: true, answer: { display: r.a }, workspace: { type: "none" }, ...(pic ? { pic } : {}), meta: { lv: it.lv } };
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
        const idx = ctx && Number.isInteger(ctx.index) ? ctx.index : 0;
        // その難易度の図を使いきったら、ほかの難易度の図も出す(同じ図ばかりにならないように)
        if (idx >= pool.length && o.vary === undefined) pool = list;
        // 図の問題を使いきったら、同じ図の問題も出せるようにする(round)
        const round = Math.floor(idx / pool.length);
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
  // ===== イラストの図に、記号(ア・イ…)と引き出し線をつける =====
  // pts: [[x, y, "L" か "R", 記号], …](x, y はもとの画像の点)。W は絵のはば(mm)
  function labeled(name, W, pts, o = {}) {
    const [, iw, ih] = PIC_SRC[name] || ["", 100, 100];
    const k = W / iw, H = ih * k, top = 3;
    const hasL = pts.some((q) => q[2] === "L"), hasR = pts.some((q) => q[2] !== "L");
    const padL = hasL ? 13 : 2, padR = hasR ? 13 : 2;
    const items = [img(name, padL, top, W, H)];
    let raw = "";
    const lab = [];
    for (const side of ["L", "R"]) {
      const g = pts.filter((q) => (q[2] === "L") === (side === "L")).map((q) => ({ x: padL + q[0] * k, y: top + q[1] * k, s: q[3] })).sort((a, b) => a.y - b.y);
      // 記号どうしが 6.5mm 以上はなれるように、上から順にずらす
      let last = -99;
      for (const q of g) { q.ly = Math.max(q.y, last + 6.5, 4); last = q.ly; }
      const over = last - (top + H);
      if (over > 0) for (const q of g) q.ly -= over;
      for (const q of g) {
        const lx = side === "L" ? padL - 6 : padL + W + 6;
        const ex = side === "L" ? lx + 3 : lx - 3;
        raw += `<line x1="${q.x.toFixed(2)}" y1="${q.y.toFixed(2)}" x2="${ex.toFixed(2)}" y2="${q.ly.toFixed(2)}" stroke="#fff" stroke-width="1.3"/>` + `<line x1="${q.x.toFixed(2)}" y1="${q.y.toFixed(2)}" x2="${ex.toFixed(2)}" y2="${q.ly.toFixed(2)}" stroke="#000" stroke-width="0.4"/>` + `<circle cx="${q.x.toFixed(2)}" cy="${q.y.toFixed(2)}" r="0.9" fill="#000" stroke="#fff" stroke-width="0.4"/>`;
        lab.push(T(lx, q.ly + 1.4, q.s, 4, { bold: true }));
      }
    }
    items.push({ t: "raw", svg: raw }, ...lab, ...(o.extra || []));
    return { type: "draw", w: padL + W + padR, h: H + top * 2, scaleK: o.k || 1.2, items };
  }
  // 絵をならべた図(じゅんばん・えらぶ問題)。names の下に ア・イ… をつける
  function picRow(names, size = 24, o = {}) {
    const gap = o.gap ?? 4, items = [];
    names.forEach((n, i) => {
      const x = 2 + i * (size + gap);
      items.push({ t: "raw", svg: `<rect x="${x}" y="2" width="${size}" height="${size}" rx="2.5" fill="#fff" stroke="#9cc" stroke-width="0.35"/>` }, img(n, x + 1.2, 3.2, size - 2.4, size - 2.4));
      if (o.letters !== false) items.push(T(x + size / 2, size + 8.2, LET[i], 4, { bold: true }));
    });
    return { type: "draw", w: 4 + names.length * (size + gap) - gap, h: size + (o.letters === false ? 4 : 11), scaleK: o.k || 1.1, items };
  }
  return { PIC_SRC, picSrc, img, picHtml, labeled, picRow, LET, LV, noRuby, parse, bank, figs, calc, grade, T, fig, line, arrow, arrowHead, rect, circle, path, poly, emo, tag, mark, C, graph, table, svgEsc, rnd };
})();

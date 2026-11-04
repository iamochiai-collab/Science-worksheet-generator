# 理科プリント:メニューに「教科書」(教科書会社の順に単元をならべかえる)を足す。1回だけ使う
import pathlib
p = pathlib.Path('src/template.html'); s = p.read_text(encoding='utf-8')
def R(a, b):
    global s
    assert s.count(a) == 1, a[:70]
    s = s.replace(a, b)
# 画面
R('''    <div><div class="home-step"><span class="n">2</span>難易度</div><div class="home-levels" id="homeLevels"></div><div class="home-ages" id="homeAges"></div></div>
  </div>''', '''    <div><div class="home-step"><span class="n">2</span>難易度</div><div class="home-levels" id="homeLevels"></div><div class="home-ages" id="homeAges"></div></div>
    <div id="homePubWrap"><div class="home-step"><span class="n">3</span>教科書の順</div><select id="homePub" class="home-pub" aria-label="教科書の順"></select><div class="home-pub-note">単元を、教科書会社の順にならべかえます(おおよその順です)</div></div>
  </div>''')
R('.home-levels { display: inline-flex;', '.home-pub { font: inherit; font-size: 15px; padding: 7px 10px; border: 1.5px solid #2b3a55; border-radius: 10px; background: #fff; color: #2b3a55; min-width: 12em; }\n.home-pub-note { font-size: 12px; color: #667; margin-top: 4px; }\n.home-levels { display: inline-flex;')
R('単元は教科書でよくある順にならべています。', '単元は教科書でよくある順にならべています(「教科書の順」で、教科書会社の順にもできます)。')
# 教科書の順にならべかえる(画面を作る前に、おぼえている教科書の順にしておく)
R('''  var GRADE_KEYS = Object.keys(GRADES).map(Number).sort((a, b) => a - b);''', '''  var GRADE_KEYS = Object.keys(GRADES).map(Number).sort((a, b) => a - b);
  // 教科書会社の順(content/rorder.js の PUB_ORDER)。3年〜中3 の単元をならべかえ、番号もつけなおす
  var PUB_KEYS = typeof PUB_ORDER !== "undefined" ? Object.keys(PUB_ORDER) : [];
  var BASE_ORDER = {};
  for (const g3 of GRADE_KEYS) if (g3 >= 3 && g3 <= 9) BASE_ORDER[g3] = GRADES[g3].units.map((u2) => u2.id);
  function applyPub(key) {
    for (const g3 of Object.keys(BASE_ORDER)) {
      const base = BASE_ORDER[g3], list = key && PUB_ORDER[key] && PUB_ORDER[key][g3] || base;
      const rank = (id) => {
        const i = list.indexOf(id);
        return i >= 0 ? i : 1e3 + base.indexOf(id);
      };
      GRADES[g3].units.sort((a, b) => rank(a.id) - rank(b.id));
      let n = 0;
      for (const u2 of GRADES[g3].units) if (!u2.numberless) u2.order = ++n;
    }
  }
  var homePub = (() => {
    try {
      const v = localStorage.getItem("rika-print:pub");
      return PUB_KEYS.includes(v) ? v : "";
    } catch {
      return "";
    }
  })();
  applyPub(homePub);''')
R('''    $("homeLevels").innerHTML = Object.entries(LEVELS)''', '''    // 教科書の順(3年〜中3 だけ)
    $("homePubWrap").hidden = stageMode || homeGrade < 3 || homeGrade > 9 || !PUB_KEYS.length;
    $("homePub").innerHTML = `<option value="">ふつうの順</option>` + PUB_KEYS.map((k) => `<option value="${k}"${k === homePub ? " selected" : ""}>${esc2(PUB_ORDER[k].name)}</option>`).join("");
    $("homeLevels").innerHTML = Object.entries(LEVELS)''')
R('''  // 特別支援の段階 ⇔ 学年べつ の切りかえ''', '''  $("homePub").addEventListener("change", (e) => {
    homePub = PUB_KEYS.includes(e.target.value) ? e.target.value : "";
    try {
      localStorage.setItem("rika-print:pub", homePub);
    } catch {}
    applyPub(homePub);
    renderHome();
    mascot("idea", homePub ? `${esc2(PUB_ORDER[homePub].name)}の<br>じゅんばんに したよ` : "ふつうの<br>じゅんばんに したよ");
  });
  // 特別支援の段階 ⇔ 学年べつ の切りかえ''')
p.write_text(s, encoding='utf-8')
print('ok')

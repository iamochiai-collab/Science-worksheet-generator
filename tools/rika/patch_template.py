# 算数プリントの template.html を 理科プリント 用に書きかえる(1回だけ使う)
import pathlib, re
p = pathlib.Path('src/template.html')
s = p.read_text(encoding='utf-8')
def R(a, b, n=1):
    global s
    c = s.count(a)
    assert c == n, (c, a[:80])
    s = s.replace(a, b)
V = '第1版(2026-11-04)'
R('第4版(2026-10-19)', V, 3)
R('<title>算数プリント</title>', '<title>理科プリント</title>')
R('<h1>算数プリント<span class="version" id="versionHome"></span></h1>', '<h1>理科プリント<span class="version" id="versionHome"></span></h1>')
R('<p>ようじ ・ 小学校1〜6年(東京書籍『新編 新しい算数』の単元順) ・ 中学・高校(学習指導要領の内容の順)。学年をえらんで、単元のボタンをおすとプリントができます。</p>',
  '<p>小学校1・2年(生活科) ・ 小学校3〜6年の理科 ・ 中学1〜3年の理科。単元は教科書でよくある順にならべています。学年をえらんで、単元のボタンをおすとプリントができます。</p>')
R('<h1>算数プリント</h1>', '<h1>理科プリント</h1>')
R('<span class="subtitle" id="subtitle">小学校1〜6年 ・ 東京書籍『新編 新しい算数』の単元順</span>', '<span class="subtitle" id="subtitle">小学校3〜6年 理科</span>')
R('算数プリント.html を長押し', '理科プリント.html を長押し')
R('<footer class="site-footer">算数プリント', '<footer class="site-footer">理科プリント')
R('知的障害の特別支援学校の学習指導要領(算数・数学)の段階(小学部1〜3段階・中学部1・2段階・高等部1・2段階)でえらべます。', '知的障害の特別支援学校の学習指導要領(小学部は生活、中学部・高等部は理科)の段階(小学部1〜3段階・中学部1・2段階・高等部1・2段階)でえらべます。')
R('単元の「計算ドリル」「文章題」などをおすと作れます</span>', '単元の「基本問題」「図・実験」などをおすと作れます</span>')
# 種類
R('drill: { label: "計算ドリル", sheetLabel: "{計算|けいさん}ドリル", counts: [10, 20, 30], defaultCount: 20 },', 'drill: { label: "計算問題", sheetLabel: "{計算|けいさん}{問題|もんだい}", counts: [6, 10, 15], defaultCount: 10 },')
R('word: { label: "文章題", sheetLabel: "{文章題|ぶんしょうだい}", counts: [3, 4, 5, 6], defaultCount: 4 },', 'word: { label: "基本問題", sheetLabel: "{基本|きほん}{問題|もんだい}", counts: [4, 6, 8, 10], defaultCount: 6 },')
R('figure: { label: "図形・グラフ", sheetLabel: "{図形|ずけい}・グラフ", counts: [3, 4, 5, 6], defaultCount: 4 },', 'figure: { label: "図・実験", sheetLabel: "{図|ず}・{実験|じっけん}", counts: [1, 2, 3, 4], defaultCount: 2 },')
R('var SUB_KIND = { drill: "計算", word: "文章題", figure: "図・グラフ", yoji: "え" };', 'var SUB_KIND = { drill: "計算", word: "基本", figure: "図・実験", yoji: "え" };')
R('var KIND_SHORT = { drill: "計算ドリル", word: "文章題", figure: "図形・グラフ",', 'var KIND_SHORT = { drill: "計算問題", word: "基本問題", figure: "図・実験",')
# 学年
i = s.index('  var GRADES = { ...typeof yojiGrade')
j = s.index('\n', i)
s = s[:i] + '  var GRADES = Object.fromEntries(Object.entries({ 1: typeof r1sei1Grade !== "undefined" ? r1sei1Grade : null, 2: typeof r2sei2Grade !== "undefined" ? r2sei2Grade : null, 3: typeof r3Grade !== "undefined" ? r3Grade : null, 4: typeof r4Grade !== "undefined" ? r4Grade : null, 5: typeof r5Grade !== "undefined" ? r5Grade : null, 6: typeof r6Grade !== "undefined" ? r6Grade : null, 7: typeof r7chu1Grade !== "undefined" ? r7chu1Grade : null, 8: typeof r8chu2Grade !== "undefined" ? r8chu2Grade : null, 9: typeof r9chu3Grade !== "undefined" ? r9chu3Grade : null }).filter(([, v]) => v));' + s[j:]
R('''$("subtitle").textContent = gN >= 21 ? "特別支援学校(知的障害) ・ 学習指導要領の段階と内容" : gN >= 10 ? "高校 ・ 学習指導要領の内容の順" : gN >= 7 ? "中学 ・ 学習指導要領の内容の順" : gN === 0 ? "ようじ(3〜6さい)" : "小学校1〜6年 ・ 東京書籍『新編 新しい算数』の単元順";''',
  '''$("subtitle").textContent = gN >= 21 ? "特別支援学校(知的障害) ・ 学習指導要領の段階と内容(生活・理科)" : gN >= 7 ? "中学 理科 ・ 学習指導要領の内容の順" : gN <= 2 ? "小学校1・2年 生活科" : "小学校3〜6年 理科 ・ 教科書の単元順";''')
R('var hasSubs = (g3) => g3 >= 1 && g3 <= 6 || g3 >= 21;', 'var hasSubs = (g3) => g3 >= 1;')
R('GRADES[Number(store.get("grade"))] ? Number(store.get("grade")) : 1;', 'GRADES[Number(store.get("grade"))] ? Number(store.get("grade")) : 3;')
R('<b>学年べつ(ようじ・小学校・中学・高校)に もどる</b>', '<b>学年べつ(小学校・中学)に もどる</b>')
R('知的障害の特別支援学校の学習指導要領(算数・数学)の段階に合わせています。', '知的障害の特別支援学校の学習指導要領(小学部は生活、中学部・高等部は理科)の段階に合わせています。')
s = s.replace('高等部1・2段階・くらしの数学', '高等部1・2段階')
R('[["ようじ・小学校", (g3) => g3 <= 6], ["中学", (g3) => g3 >= 7 && g3 <= 9], ["高校", (g3) => g3 >= 10 && g3 < 21]]', '[["小学校", (g3) => g3 <= 6], ["中学", (g3) => g3 >= 7 && g3 <= 9]]')
s = s.replace('「えのプリント」「計算ドリル」などをおすと作れます', '「基本問題」「図・実験」などをおすと作れます')
s = s.replace('単元の「計算ドリル」「文章題」などをおすと作れます', '単元の「基本問題」「図・実験」などをおすと作れます')
# 図の部品:raw(SVG をそのまま入れる)
R('''        case "image":
          out += `<image href="${it.href}"''', '''        case "raw":
          out += it.svg;
          break;
        case "image":
          out += `<image href="${it.href}"''')
R('var workOf = (p) => isChuGen(p.generator) ? p.work ?? CHU_WORK[p.generator] ?? 25 : 0;', 'var workOf = (p) => p.work != null ? p.work : isChuGen(p.generator) ? CHU_WORK[p.generator] ?? 25 : 0;')
p.write_text(s, encoding='utf-8')
print('ok')

# 理科プリント用:問題のよこにイラスト(絵文字)を出す・1年の文を折り返す(1回だけ使う)
import pathlib
p = pathlib.Path('src/template.html'); s = p.read_text(encoding='utf-8')
def R(a, b):
    global s
    assert s.count(a) == 1, a[:70]
    s = s.replace(a, b)
R('''${p2.figure?.type === "hissan" ? " has-hissan" : ""}${tr ? " trace" : ""}">''', '''${p2.figure?.type === "hissan" ? " has-hissan" : ""}${tr ? " trace" : ""}${p2.pic ? " has-pic" : ""}">${p2.pic ? `<span class="item-pic" aria-hidden="true">${esc2(p2.pic)}</span>` : ""}''')
R('.sheet.grade-1 .item-body { font-size: 22pt; letter-spacing: 1pt; white-space: nowrap; }', '.sheet.grade-1 .item-body { font-size: 22pt; letter-spacing: 1pt; white-space: nowrap; }\n/* 理科:1年(と特別支援の小学部)も、長い文は分かち書きのところで折り返す */\n.sheet.grade-1 .item-body { white-space: normal; }\n/* 理科:問題のよこのイラスト */\n.item.has-pic { position: relative; padding-right: 30mm; min-height: 24mm; }\n.item-pic { position: absolute; right: 0; top: 1mm; width: 26mm; height: 22mm; display: flex; align-items: center; justify-content: center; gap: 0.5mm; flex-wrap: nowrap; font-size: 24pt; line-height: 1; border: 1pt solid #cfe3ea; border-radius: 3mm; background: #fbfdfe; letter-spacing: 0; }\n.item-pic.two { font-size: 22pt; }')
p.write_text(s, encoding='utf-8')
print('ok')

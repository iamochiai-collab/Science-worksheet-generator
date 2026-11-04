# 理科プリント:1ページに入る問題をふやす(字の間・答えの四角・イラストを小さめに)。1回だけ使う
import pathlib
p = pathlib.Path('src/template.html'); s = p.read_text(encoding='utf-8')
def R(a, b):
    global s
    assert s.count(a) == 1, a[:70]
    s = s.replace(a, b)
R('.item.has-pic { position: relative; padding-right: 30mm; min-height: 24mm; }', '''/* 理科:1ページの問題をふやすため、文字・答えの四角・イラストを少し小さく(1年・小学部は大きいまま) */
.sheet:not(.grade-1) .item-body { font-size: 14pt; letter-spacing: 0.8pt; line-height: 1.6; }
.items.cols-1 .item-head { flex-wrap: nowrap; align-items: flex-start; }
.sheet:not(.grade-1) .abox.ans { height: 9mm; }
.sheet:not(.grade-1) .items { gap: 6pt 16pt; }
.item.has-pic { position: relative; padding-right: 30mm; min-height: 24mm; }
.sheet:not(.grade-1) .item.has-pic { padding-right: 21mm; min-height: 16mm; }''')
R('.item-pic.two { font-size: 22pt; }', '.item-pic.two { font-size: 22pt; }\n.sheet:not(.grade-1) .item-pic { width: 18mm; height: 15mm; font-size: 17pt; border-radius: 2mm; }')
R('word: { label: "基本問題", sheetLabel: "{基本|きほん}{問題|もんだい}", counts: [4, 6, 8, 10], defaultCount: 6 },', 'word: { label: "基本問題", sheetLabel: "{基本|きほん}{問題|もんだい}", counts: [6, 10, 15, 20], defaultCount: 10 },')
p.write_text(s, encoding='utf-8')
print('ok')
